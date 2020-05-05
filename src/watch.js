const { getEnabledTasks } = require('../utils/tasks');
const fs = require('fs');
const path = require('path');
const browserSync = require('browser-sync');

module.exports = (gulp, config) => {
  const watch = (done) => {
    const tasks = getEnabledTasks(config);

    Object.values(tasks).forEach((task) => {
      if (!task.hasOwnProperty('behavior')) {
        return;
      }

      let src = task.src;
      const taskName = task.task;

      if (!Array.isArray(src)) {
        src = [src];
      }

      if (taskName === 'scripts') {
        src = src.map((s) => {
          if (fs.existsSync(s)) {
            s = path.join(path.dirname(s), `**/*${path.extname(s)}`);
          }
          return s;
        });
      }

      if (taskName === 'modernizr') {
        return;
      }

      const reload = (cb) => {
        browserSync.reload(task.behavior === 'inject' ? '*.css' : task.dest);
        cb();
      };

      gulp.watch(src, gulp.series(taskName, reload));
    });

    if (config.hasOwnProperty('viewsSrc')) {
      const reloadViews = (cb) => {
        browserSync.reload();
        cb();
      };
      gulp.watch(config.viewsSrc, reloadViews);
    }

    done();
  };

  gulp.task('watch', watch);
};
