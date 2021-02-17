const browserSync = require('browser-sync');
const proxyUtils = require('browser-sync/dist/server/proxy-utils');
const url = require('url');
const { execSync } = require('child_process');
const getUrls = require('get-urls');
const stripColor = require('strip-color');
const commandExistsSync = require('command-exists').sync;
const { memoryMiddleware } = require('../memory');

module.exports = (gulp, config) => {
  const serve = (done) => {
    let bsConfig = {
      open: false,
      minify: true,
    };

    if(config.inMemory) {
      bsConfig = {
        ...bsConfig,
        middleware: memoryMiddleware({
          publicPath: config.publicPath || 'web',
          headers: {
            'X-Served-From': 'memory',
          },
        }),
      }
    }

    // Custom proxy URL
    if (config.hasOwnProperty('proxyUrl') && config.proxyUrl) {
      bsConfig = {
        ...bsConfig,
        proxy: {
          target: config.proxyUrl,
        },
      };

      // Default symfony server
    } else if (commandExistsSync('symfony')) {
      let serverStatus = false;
      try {
        serverStatus = execSync('symfony local:server:status', {
          stdio: 'pipe',
        }).toString();
      } catch (e) {}

      if (serverStatus) {
        const URLs = Array.from(getUrls(stripColor(serverStatus)));
        if (URLs.length) {
          bsConfig = {
            ...bsConfig,
            proxy: {
              target: URLs[0],
            },
          };
        }
      }
    }

    if (config.hasOwnProperty('rewriteUrl')) {
      bsConfig = {
        ...bsConfig,
        rewriteRules: [proxyUtils.rewriteLinks(url.parse(config.rewriteUrl))],
      };
    }

    browserSync.init(bsConfig, done);
  };

  gulp.task('serve', serve);
};
