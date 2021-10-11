import {
  getActiveTasks,
  getRevisionedTasks,
  getBuildTasks,
  getDestPaths,
} from './utils/tasks.js';
import clean from './tasks/clean.js';
import compress from './tasks/compress.js';
import serve from './tasks/serve.js';
import rev from './tasks/rev.js';
import watch from './tasks/watch.js';

export { getActiveTasks, getRevisionedTasks, getBuildTasks, getDestPaths };

export default async (g, config) => {
  if (!config.hasOwnProperty('tasks')) {
    throw new Error('No tasks defined in config');
  }
  const activeTasks = getActiveTasks(config.tasks);
  if (!activeTasks.length) {
    throw new Error('No active tasks found');
  }

  for (const t of activeTasks) {
    let task = null;
    if (t.task === 'scripts') {
      const bundler = t.hasOwnProperty('bundler') ? t.bundler : 'rollup';
      const { default: taskFn } = await import(`./tasks/scripts-${bundler}.js`);
      task = taskFn;
    } else {
      const { default: taskFn } = await import(`./tasks/${t.task}.js`);
      task = taskFn;
    }
    g.task(t.task, () => task(t, config));
  }

  g.task('compress', () => compress(config));
  g.task('clean', () => clean(config));
  g.task('build', g.series(...getBuildTasks(config.tasks)));
  g.task(
    'rev',
    g.series('clean', 'build', () => rev(config))
  );
  g.task('serve', serve(config));
  g.task('watch', watch(config, g));
  g.task('default', g.series('watch', 'serve'));
};
