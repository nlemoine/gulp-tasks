import { series, task } from 'gulp';
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
    } else {
      const { default: taskFn } = await import(`./tasks/${t.task}.js`);
      taskCb = taskFn;
    }
    task(getTaskName(t), () => taskCb(t, config));
  }

  task('compress', () => compress(config));
  task('clean', () => clean(config));
  task('build', series(...getBuildTasks(config.tasks)));
  task(
    'rev',
    series('clean', 'build', () => rev(config)),
  );
  task('serve', serve(config));
  task('watch', watch(config, g));
  task('default', series('watch', 'serve'));
};
