import path from 'node:path';

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

function getBuildTasks(tasks) {
  const activeTasks = getActiveTasks(tasks);
  const tasksNames = {};
  activeTasks.forEach((task) => {
    if (!Array.isArray(tasksNames[task.order])) {
      tasksNames[task.order] = [];
    }
    tasksNames[task.order].push(task.task);
  });
  return Object.values(tasksNames);
}

function getRevisionedTasks(tasks) {
  const activeTasks = getActiveTasks(tasks);
  return activeTasks.filter((task) => {
    if (!task.hasOwnProperty('revision')) {
      return false;
    }
    return task.revision;
  });
}

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

export { getActiveTasks, getBuildTasks, getRevisionedTasks, getDestPaths };
