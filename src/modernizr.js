const plugins = require('../utils/plugins');
const { src, dest } = require('gulp');

module.exports = (gulp, config) => {
  const modernizr = () => {
    return src(config.src)
      .pipe(plugins.modernizr(config.options))
      .pipe(plugins.uglify())
      .pipe(dest(config.dest));
  };
  gulp.task(config.task, modernizr);
};
