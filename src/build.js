const { getBuildTasks } = require('../utils/tasks');

module.exports = (gulp, config) => {
  gulp.task('build', gulp.series(...getBuildTasks(config)));
};
