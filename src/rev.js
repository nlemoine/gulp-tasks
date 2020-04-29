const {
  src,
  dest
} = require('gulp')
const vinylPaths = require('vinyl-paths')
const del = require('del')
const {
  getRevisionedTasks,
  getDestPaths
} = require('../utils/tasks')
const plugins = require('../utils/plugins')

module.exports = (gulp, config) => {

  // Do not include reved files, md5/hex/10
  const filterReved = plugins.filter(file => !/-[a-f0-9]{10}\./g.test(file.path))
  const filterMin = plugins.filter(file => /\.min\.(js|css)$/.test(file.path), {
    restore: true
  })

  // Get enabled tasks
  const tasks = getRevisionedTasks(config)
  const dests = getDestPaths(tasks)

  const revision = () => {
    return src(dests, {
        base: config.buildPath
      })
      .pipe(filterReved)
      // Delete .min files
      .pipe(filterMin)
      .pipe(vinylPaths(del))
      .pipe(filterMin.restore)
      // Rename .min files
      .pipe(plugins.rename(path => {
        if (!['.css', '.js'].includes(path.extname)) {
          return;
        }
        path.basename = path.basename.replace(/\.min$/, '');
      }))
      .pipe(plugins.rev())
      .pipe(plugins.revCssUrl())
      .pipe(dest(config.buildPath))
      .pipe(plugins.rev.manifest('manifest.json'))
      .pipe(dest(config.buildPath))
  }

  gulp.task('rev', gulp.series('clean', 'build', revision))
}
