module.exports = (gulp) => {
  gulp.task('default', gulp.series('watch', 'serve'));
};
