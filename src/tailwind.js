const { src, dest } = require('gulp');
const path = require('path');
const TailwindExportConfig = require('tailwindcss-export-config');
const through = require('through2');
const vinyl = require('vinyl');

module.exports = (gulp, config) => {
  const tailwind = () => {
    return src(config.src)
      .pipe(
        through.obj(function (file, enc, cb) {
          const converter = new TailwindExportConfig({
            config: file.path,
            format: 'scss',
            quotedKeys: true,
          });
          const converted = converter.convert();
          const newFile = new vinyl({
            path: path.basename(config.dest),
            base: undefined,
            cwd: '',
            contents: Buffer.from(converted),
          });

          cb(null, newFile);
        })
      )
      .pipe(dest(path.dirname(config.dest)));
  };

  gulp.task(config.task, tailwind);
};
