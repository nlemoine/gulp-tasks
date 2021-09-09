const { src, dest } = require('gulp');
const plugins = require('../utils/plugins');

module.exports = (gulp, config) => {
  const files = [];
  ['js', 'css', 'svg'].forEach((ext) =>
    files.push(`${config.buildPath}/**/*.${ext}`)
  );

  const compress = () => {
    return src(files)
      .pipe(plugins.webCompress({
        gzipOptions: {
          level: 9
        },
        brotliOptions: {
          quality: 11
        }
      }))
      .pipe(dest(config.buildPath));
  };

  gulp.task('compress', compress);
};
