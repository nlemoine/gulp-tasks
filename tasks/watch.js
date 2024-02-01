import { getActiveTasks, hasTask } from '../utils/tasks.js';
import fs from 'node:fs';
import path from 'node:path';
import browserSync from 'browser-sync';
import gulp from 'gulp';
import { has } from 'lodash-es';

const { watch } = gulp;

export default (config, g) => {
  return (done) => {
    const tasks = getActiveTasks(config.tasks);

    Object.values(tasks).forEach((task) => {
      if (!has(task, 'behavior')) {
        return;
      }

      let src = task.src;
      const taskName = has(task, 'name') ? task.name : task.task;

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

      if (has(task, 'watch')) {
        src.push(task.watch);
      }

      const reload = (cb) => {
        browserSync.reload(task.behavior === 'inject' ? '*.css' : task.dest);
        cb();
      };

      watch(src, g.series(taskName, reload));
    });

    if (has(config, 'viewsSrc')) {
      const reloadViews = (cb) => {
        browserSync.reload();
        cb();
      };
      if (has(config, ['pkg', 'dependencies', 'tailwindcss']) && hasTask('styles', tasks)) {
        watch(config.viewsSrc, g.series('styles', reloadViews));
      } else {
        watch(config.viewsSrc, reloadViews);
      }
    }

    done();
  };
};
