const { src, dest } = require('gulp');
const TailwindExportConfig = require('tailwindcss-export-config');
const through = require('through2');
const vinyl = require('vinyl');
const path = require('path');
const resolveConfig = require('tailwindcss/resolveConfig');

module.exports = (gulp, config) => {
  const tailwind = () => {
    const stream = src(config.src);

    let dests = config.dest;
    if (!Array.isArray(dests)) {
      dests = [dests];
    }

    dests.forEach((d) => {
      const ext = path.extname(d);

      // Output SCSS
      if (ext === '.scss') {
        stream
          .pipe(
            through.obj((file, enc, cb) => {
              const converter = new TailwindExportConfig({
                config: file.path,
                format: 'scss',
                quotedKeys: true,
                preserveKeys: ['colors', 'screens', 'spacing'],
              });
              const converted = converter.convert();
              const transformedFile = new vinyl({
                path: path.basename(d),
                base: undefined,
                cwd: '',
                contents: Buffer.from(converted),
              });
              cb(null, transformedFile);
            })
          )
          .pipe(dest(path.dirname(d)));
      }

      // Output JSON
      if (ext === '.json') {
        stream
          .pipe(
            through.obj((file, enc, cb) => {
              let config = require(file.path);
              config = resolveConfig(config);

              const transformedFile = new vinyl({
                path: path.basename(d),
                base: undefined,
                cwd: '',
                contents: Buffer.from(JSON.stringify(config.theme)),
              });

              cb(null, transformedFile);
            })
          )
          .pipe(dest(path.dirname(d)));
      }
    });

    return stream;
  };

  gulp.task(config.task, tailwind);
};
