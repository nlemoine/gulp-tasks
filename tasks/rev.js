import gulp from 'gulp';
import vinylPaths from 'vinyl-paths';
import { deleteAsync } from 'del';
import path from 'node:path';
import through from 'through2';
import revisionHash from 'rev-hash';
import { getRevisionedTasks, getDestPaths } from '../utils/tasks.js';
import filter from 'gulp-filter';
import rev from 'gulp-rev';
import rename from 'gulp-rename';

const { src, dest } = gulp;

const replaceRevUrls = () => {
  const files = [];

  return through.obj(
    (file, enc, cb) => {
      const basePath = file.revOrigBase;
      const replace = `^${basePath}/`;
      const replaceRegex = new RegExp(replace, 'gm');

      if (file.path && file.revOrigPath) {
        files.push({
          originalPath: file.revOrigPath.replace(replaceRegex, ''),
          hashedPath: file.path.replace(replaceRegex, ''),
          file: file,
        });
      }

      cb();
    },
    function (cb) {
      var self = this;

      const longestFirst = files.slice().sort((a, b) => {
        if (a.originalPath.length > b.originalPath.length) return -1;
        if (a.originalPath.length < b.originalPath.length) return 1;
        return 0;
      });

      files.forEach((f) => {
        const file = f.file;
        if (path.extname(file.revOrigPath) !== '.css') {
          self.push(file);
          return;
        }
        if (!file.contents) {
          self.push(file);
          return;
        }

        let contents = file.contents.toString();
        longestFirst.forEach((_f) => {
          contents = contents.replace(
            new RegExp(_f.originalPath, 'g'),
            _f.hashedPath,
          );
        });

        file.contents = new Buffer.from(contents);
        const hash = (file.revHash = revisionHash(contents));
        const ext = path.extname(file.path);
        const filename =
          path.basename(file.revOrigPath, ext) + '-' + hash + ext;
        file.path = path.join(path.dirname(file.path), filename);

        self.push(file);
      });

      cb();
    },
  );
};

export default (config) => {
  // Do not include reved files, md5/hex/10
  const filterReved = filter((file) => !/-[a-f0-9]{10}\./g.test(file.path));
  const filterMin = filter((file) => /\.min\.(js|css)$/.test(file.path), {
    restore: true,
  });

  // Get enabled tasks
  const tasks = getRevisionedTasks(config.tasks);
  const dests = getDestPaths(tasks);

  return (
    src(dests, {
      base: config.buildPath,
    })
      .pipe(filterReved)
      // Delete .min files
      .pipe(filterMin)
      .pipe(vinylPaths(deleteAsync))
      .pipe(filterMin.restore)
      // Rename .min files
      .pipe(
        rename((path) => {
          if (!['.css', '.js'].includes(path.extname)) {
            return;
          }
          path.basename = path.basename.replace(/\.min$/, '');
        }),
      )
      .pipe(rev())
      // .pipe(plugins.revCssUrl())
      .pipe(replaceRevUrls())
      .pipe(dest(config.buildPath))
      .pipe(rev.manifest('manifest.json'))
      .pipe(dest(config.buildPath))
  );
};
