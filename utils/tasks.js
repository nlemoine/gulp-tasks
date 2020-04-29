const path = require('path')
const { gulp, parallel } = require('gulp')

function getEnabledTasks(config) {
  return Object.values(config).filter((task) => {
    if (!task.hasOwnProperty('task') || !task.hasOwnProperty('order') || !task.hasOwnProperty('enabled')) {
      return false
    }
    if (!task.enabled) {
      return false
    }
    return true
  })
}

function getBuildTasks(config) {
  const tasks = getEnabledTasks(config)
  const tasksNames = {}
  tasks.forEach((task) => {
    if (!Array.isArray(tasksNames[task.order])) {
      tasksNames[task.order] = []
    }
    tasksNames[task.order].push(task.task)
  })
  return Object.values(tasksNames)
}

function getRevisionedTasks(config) {
  const tasks = getEnabledTasks(config)
  return Object.values(tasks).filter((task) => {
    if (!task.hasOwnProperty('revision')) {
      return false
    }
    return task.revision
  })
}

function getDestPaths(config, tasks = false) {
  tasks = tasks ? tasks : getEnabledTasks(config)
  const dests = []
  tasks.forEach((task) => {
    if (!task.hasOwnProperty('dest')) {
      return
    }
    if (task.task === 'styles') {
      dests.push(path.join(task.dest, '**/*.min.*'))
    } else if (task.task === 'scripts') {
      dests.push(path.join(task.dest, '**/*.min.*'))
      // dests.push(path.join(task.dest, 'modernizr.js'))
    } else {
      dests.push(path.join(task.dest, '**/*'))
    }
    dests.push(`!${path.join(task.dest, '**/*.map')}`)
  })
  return dests
}

module.exports = {
  getEnabledTasks: getEnabledTasks,
  getBuildTasks: getBuildTasks,
  getRevisionedTasks: getRevisionedTasks,
  getDestPaths: getDestPaths
}
