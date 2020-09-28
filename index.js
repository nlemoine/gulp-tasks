const {
  getEnabledTasks,
  getRevisionedTasks,
  getBuildTasks,
  getDestPaths,
} = require('./utils/tasks');

module.exports.getEnabledTasks = getEnabledTasks;
module.exports.getRevisionedTasks = getRevisionedTasks;
module.exports.getBuildTasks = getBuildTasks;
module.exports.getDestPaths = getDestPaths;

module.exports = (gulp, config) => {
  getEnabledTasks(config).forEach((t) => {
    if (!t.enabled) {
      return;
    }
    require(`./src/${t.task}`)(gulp, t);
  });
  require('./src/clean')(gulp, config);
  require('./src/build')(gulp, config);
  require('./src/gzip')(gulp, config);
  require('./src/brotli')(gulp, config);
  require('./src/rev')(gulp, config);
  require('./src/serve')(gulp, config);
  require('./src/watch')(gulp, config);
  require('./src/default')(gulp);
};
