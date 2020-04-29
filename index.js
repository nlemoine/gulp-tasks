module.exports.styles = require('./src/styles');
module.exports.tailwind = require('./src/tailwind');
module.exports.scripts = require('./src/scripts');
module.exports.modernizr = require('./src/modernizr');
module.exports.images = require('./src/images');
module.exports.spriteSvg = require('./src/sprite-svg');
module.exports.fonts = require('./src/fonts');
module.exports.emails = require('./src/emails');
module.exports.clean = require('./src/clean');

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
    require(`./src/${t.task}`)(gulp, t);
  });
  require('./src/clean')(gulp, config);
  require('./src/build')(gulp, config);
  require('./src/rev')(gulp, config);
  require('./src/serve')(gulp, config);
  require('./src/watch')(gulp, config);
  require('./src/default')(gulp);
};
