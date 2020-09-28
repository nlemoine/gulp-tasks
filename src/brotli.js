const { src, dest } = require('gulp');
const plugins = require('../utils/plugins');

module.exports = (gulp, config) => {
  const files = [];
  ['js', 'css', 'svg'].forEach((ext) =>
    files.push(`${config.buildPath}/**/*.${ext}`)
  );

  const brotli = () => {
    return src(files)
      .pipe(plugins.brotli.compress())
      .pipe(dest(config.buildPath));
  };

  gulp.task('brotli', brotli);
};
