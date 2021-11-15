import browserSync from 'browser-sync';
import proxyUtils from 'browser-sync/dist/server/proxy-utils.js';
import url from 'node:url';
import { execSync } from 'child_process';
import getUrls from 'get-urls';
import stripColor from 'strip-color';
import os from 'os';
import fs from 'node:fs';
import path from 'node:path';
import { sync as commandExistsSync } from 'command-exists';

export default (config) => {
  return (done) => {
    let bsConfig = {
      open: false,
      minify: true,
    };

    // if (config.inMemory) {
    //   bsConfig = {
    //     ...bsConfig,
    //     middleware: memoryMiddleware({
    //       publicPath: config.publicPath || 'web',
    //       headers: {
    //         'X-Served-From': 'memory',
    //       },
    //     }),
    //   };
    // }

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

      const symfonyPfx = path.join(os.homedir(), '.symfony/certs/default.p12');
      if (fs.existsSync(symfonyPfx)) {
        bsConfig = {
          ...bsConfig,
          https: {
            pfx: symfonyPfx,
          },
        };
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
};