import {
  getActiveTasks,
  getRevisionedTasks,
  getBuildTasks,
  getTaskName,
  getDestPaths,
} from './utils/tasks.js';
import clean from './tasks/clean.js';
import compress from './tasks/compress.js';
import serve from './tasks/serve.js';
import rev from './tasks/rev.js';
import watch from './tasks/watch.js';
export {
  getActiveTasks,
  getRevisionedTasks,
  getBuildTasks,
  getTaskName,
  getDestPaths,
};

export default async (g, config) => {
  if (!config.hasOwnProperty('tasks')) {
    throw new Error('No tasks defined in config');
  }

  const activeTasks = getActiveTasks(config.tasks);
  if (!activeTasks.length) {
    throw new Error('No active tasks found');
  }

  for (const t of activeTasks) {
    let taskCb = null;
    if (t.task === 'scripts') {
      const bundler = t.hasOwnProperty('bundler') ? t.bundler : 'rollup';
      const { default: taskFn } = await import(`./tasks/scripts-${bundler}.js`);
      taskCb = taskFn;
    } else if (t.task === 'images') {
      const optimizer = t.hasOwnProperty('optimizer') ? t.optimizer : 'sharp';
      const { default: taskFn } = await import(
        `./tasks/images-${optimizer}.js`
      );
      taskCb = taskFn;
    } else {
      const { default: taskFn } = await import(`./tasks/${t.task}.js`);
      taskCb = taskFn;
    }
    g.task(getTaskName(t), () => taskCb(t, config));
  }

  g.task('compress', () => compress(config));
  g.task('clean', () => clean(config));
  g.task('build', g.series(...getBuildTasks(config.tasks)));
  g.task(
    'rev',
    g.series('clean', 'build', () => rev(config)),
  );
  g.task('serve', serve(config));
  g.task('watch', watch(config, g));
  g.task('default', g.series('watch', 'serve'));
};
