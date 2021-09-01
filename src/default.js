const { series } = require('gulp');

module.exports = (gulp) => {
  gulp.task('default', series('watch', 'serve'));
};
