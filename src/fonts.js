const {
  src,
  dest
} = require('gulp')

module.exports = (gulp, config) => {
  const task = () => {
    return src(config.src)
      .pipe(dest(config.dest))
  }
  gulp.task(config.task, task)
}
