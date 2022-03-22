import path from 'node:path';

/**
 * Get active tasks
 * @param {Array} tasks
 * @returns {Array}
 */
function getActiveTasks(tasks) {
  return tasks.filter((task) => {
    if (
      !task.hasOwnProperty('task') ||
      !task.hasOwnProperty('order') ||
      !task.hasOwnProperty('active')
    ) {
      return false;
    }
    return task.active;
  });
}

/**
 * Has task name
 * @param {String} taskName
 * @param {Array} tasks
 * @returns {Bool}
 */
function hasTask(taskName, tasks) {
  return getActiveTasks(tasks).some((task) => {
    return getTaskName(task) === taskName;
  });
}

/**
 * Get build tasks
 * @param {Array} tasks
 * @returns {Array}
 */
function getBuildTasks(tasks) {
  const activeTasks = getActiveTasks(tasks);
  const tasksNames = {};
  activeTasks.forEach((task) => {
    if (!Array.isArray(tasksNames[task.order])) {
      tasksNames[task.order] = [];
    }
    tasksNames[task.order].push(getTaskName(task));
  });
  return Object.values(tasksNames);
}

/**
 * Get revisioned tasks
 * @param {Array} tasks
 * @returns {Array}
 */
function getRevisionedTasks(tasks) {
  const activeTasks = getActiveTasks(tasks);
  return activeTasks.filter((task) => {
    if (!task.hasOwnProperty('revision')) {
      return false;
    }
    return task.revision;
  });
}

/**
 * Get task name
 * @param {Object} task
 * @returns {String}
 */
function getTaskName(task) {
  return task.hasOwnProperty('name') ? task.name : task.task;
}

/**
 *
 * @param {Array} tasks
 * @returns {Array}
 */
function getDestPaths(tasks) {
  const dests = [];
  tasks.forEach((task) => {
    if (!task.hasOwnProperty('dest')) {
      return;
    }
    if (task.task === 'styles') {
      dests.push(path.join(task.dest, '**/*.min.*'));
    } else if (task.task === 'scripts') {
      dests.push(path.join(task.dest, '**/*.min.*'));
      // dests.push(path.join(task.dest, 'modernizr.js'))
    } else {
      dests.push(path.join(task.dest, '**/*'));
    }
    dests.push(`!${path.join(task.dest, '**/*.map')}`);
  });
  return dests;
}

export {
  getActiveTasks,
  getBuildTasks,
  getRevisionedTasks,
  getTaskName,
  getDestPaths,
};
