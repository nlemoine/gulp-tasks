const {
  getEnabledTasks,
  getRevisionedTasks,
  getBuildTasks,
  getDestPaths,
} = require('./utils/tasks');

const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

module.exports.getEnabledTasks = getEnabledTasks;
module.exports.getRevisionedTasks = getRevisionedTasks;
module.exports.getBuildTasks = getBuildTasks;
module.exports.getDestPaths = getDestPaths;

module.exports = (gulp, config) => {
  getEnabledTasks(config).forEach((t) => {
    if (!t.enabled) {
      return;
    }
    require(`./src/${t.task}`)(gulp, t, config);
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
