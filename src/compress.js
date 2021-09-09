const { src, dest, series } = require('gulp');
const plugins = require('../utils/plugins');
const zlib = require('zlib');

module.exports = (gulp, config) => {
  const files = [];
  ['js', 'css', 'svg'].forEach((ext) =>
    files.push(`${config.buildPath}/**/*.${ext}`)
  );

  const gzip = () => {
    return src(files)
      .pipe(plugins.gzip({
        gzipOptions: {
          level: 9
        },
      }))
      .pipe(dest(config.buildPath));
  };

  const brotli = () => {
    return src(files)
      .pipe(plugins.brotli({
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
        }
      }))
      .pipe(dest(config.buildPath));
  };

  gulp.task('compress', series(gzip, brotli));
};
