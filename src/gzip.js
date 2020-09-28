const { src, dest } = require('gulp');
const plugins = require('../utils/plugins');

module.exports = (gulp, config) => {
  const files = [];
  ['js', 'css', 'svg'].forEach((ext) =>
    files.push(`${config.buildPath}/**/*.${ext}`)
  );

  const gzip = () => {
    return src(files)
      .pipe(plugins.gzip({ gzipOptions: { level: 9 } }))
      .pipe(dest(config.buildPath));
  };

  gulp.task('gzip', gzip);
};
