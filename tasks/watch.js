import { getActiveTasks } from '../utils/tasks.js';
import fs from 'node:fs';
import path from 'node:path';
import browserSync from 'browser-sync';
import gulp from 'gulp';

const { watch } = gulp;

export default (config, g) => {
  return (done) => {
    const tasks = getActiveTasks(config.tasks);

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

      watch(src, g.series(taskName, reload));
    });

    if (config.hasOwnProperty('viewsSrc')) {
      const reloadViews = (cb) => {
        browserSync.reload();
        cb();
      };
      watch(config.viewsSrc, reloadViews);
    }

    done();
  };
};
