import browserSync from 'browser-sync';
import proxyUtils from 'browser-sync/dist/server/proxy-utils.js';
import url from 'node:url';
import os from 'os';
import fs from 'node:fs';
import path from 'node:path';
import { has, find, isObject } from 'lodash-es';
import { tabletojson } from 'tabletojson';

let cachedSymfonyConfig;
/**
 * Get Symfony config
 *
 * @returns {object|null}
 */
const getSymfonyConfig = () => {
  if (cachedSymfonyConfig) {
    return cachedSymfonyConfig;
  }
  const config = path.join(os.homedir(), '.symfony5/proxy.json');
  if (!fs.existsSync(config)) {
    return (cachedSymfonyConfig = null);
  }
  const data = fs.readFileSync(config);
  return (cachedSymfonyConfig = JSON.parse(data));
};

/**
 * Get Symfony proxy port
 *
 * @returns {int|null}
 */
const getSymfonyProxyPort = () => {
  const config = getSymfonyConfig();
  if (!config) {
    return null;
  }
  return has(config, 'port') ? config.port : null;
};

/**
 * Get Symfony proxy host
 *
 * @returns {string|null}
 */
const getSymfonyProxyHost = () => {
  const config = getSymfonyConfig();
  if (!config) {
    return null;
  }
  return has(config, 'host') ? config.host : null;
};

/**
 * Get Symfony proxy tld
 *
 * @returns {string|null}
 */
const getSymfonyProxyTld = () => {
  const config = getSymfonyConfig();
  if (!config) {
    return null;
  }
  return has(config, 'tld') ? config.tld : null;
};

/**
 * Get Symfony proxy url
 *
 * @returns {string|null}
 */
const getSymfonyProxyUrl = () => {
  const host = getSymfonyProxyHost();
  const port = getSymfonyProxyPort();
  if (!host || !port) {
    return null;
  }
  return `http://${host}:${port}`;
};

/**
 * Get Symfony domains
 *
 * @returns {object|null}
 */
const getSymfonyDomains = () => {
  const config = getSymfonyConfig();
  if (!config) {
    return null;
  }
  return has(config, 'domains') ? config.domains : null;
};

/**
 * Get current domain
 *
 * @param {string} rootPath
 * @returns
 */
const getCurrentDomain = (rootPath) => {
  const domains = getSymfonyDomains();
  if (!isObject(domains)) {
    return null;
  }
  const domainKey = find(domains, (domainPath) => {
    return rootPath.startsWith(domainPath);
  });
  if (!domainKey) {
    return null;
  }
  return domains[domainKey];
};

/**
 * Get current running domain
 *
 * @param {string} rootPath
 * @returns
 */
const getCurrentSymfonyProxy = async (rootPath) => {
  try {
    const table = await tabletojson.convertUrl(getSymfonyProxyUrl());
    if (typeof table[0] === 'undefined') {
      return null;
    }

    const runningDomains = table[0].map((row) => {
      const port = parseInt(row['Port'], 10);
      const urls = row['Domains']
        .split('http')
        .filter((url) => url !== '')
        .map((url) => {
          return `http${url}`;
        });
      return {
        urls,
        path: row['Directory'],
        port: port ? port : null,
      };
    });

    return find(runningDomains, (domain) => {
      return rootPath.startsWith(domain.path) && domain.port;
    });
  } catch (exception) {
    console.error(exception);
    return null;
  }
};

export default (config) => {
  return async (done) => {
    let bsConfig = {
      open: false,
      minify: true,
    };

    const currentDomain = await getCurrentSymfonyProxy(config.rootPath);

    // Custom proxy URL
    if (has(config, 'proxyUrl') && config.proxyUrl) {
      bsConfig = {
        ...bsConfig,
        proxy: {
          target: config.proxyUrl,
        },
      };

      // Default symfony server
    } else if (currentDomain) {
      const currentUrl = new URL(currentDomain.urls[0]);
      const host = '127.0.0.1';
      const procotol = currentUrl.protocol;
      bsConfig = {
        ...bsConfig,
        proxy: {
          target: `${procotol}//${host}:${currentDomain.port}`,
        },
        rewriteRules: [
          proxyUtils.rewriteLinks(url.parse(currentDomain.urls[0])),
        ],
      };
    }

    const symfonyPfx = path.join(os.homedir(), '.symfony5/certs/default.p12');
    if (fs.existsSync(symfonyPfx)) {
      bsConfig = {
        ...bsConfig,
        https: {
          pfx: symfonyPfx,
        },
      };
    }

    if (has(config, 'rewriteUrl')) {
      bsConfig = {
        ...bsConfig,
        rewriteRules: [proxyUtils.rewriteLinks(url.parse(config.rewriteUrl))],
      };
    }

    // Add header to identify browsersync
    if (has(bsConfig, 'proxy')) {
      bsConfig = {
        ...bsConfig,
        proxy: {
          ...bsConfig.proxy,
          proxyReq: [
            function (proxyReq) {
              proxyReq.setHeader('X-Served-By', 'browsersync');
            },
          ],
        },
      };
    }

    browserSync.init(bsConfig, done);
  };
};
