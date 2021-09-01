const { src, dest } = require('gulp');

const betterRollup = require('gulp-better-rollup');
const babel = require('@rollup/plugin-babel').default;
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').default;
const alias = require('@rollup/plugin-alias');
const filesize = require('rollup-plugin-filesize');
const sizes = require('rollup-plugin-sizes');
const analyze = require('rollup-plugin-analyzer');
const multi = require('@rollup/plugin-multi-entry');
const path = require('path');

const plugins = require('../utils/plugins');
const isProduction = require('../utils/env');

module.exports = (gulp, config, mainConfig) => {
  return () => {
    return (
      src(config.src)
        .pipe(plugins.sourcemaps.init())
        .pipe(
          betterRollup(
            {
              cache: true,
              plugins: [
                multi(),
                alias({
                  entries: {
                    '~': path.resolve(`${mainConfig.rootPath}/node_modules`),
                    '@': path.resolve(`${mainConfig.assetsPath}/js`),
                  }
                }),
                resolve({
                  browser: true,
                  preferBuiltins: false,
                }),
                commonjs(),
                babel({
                  babelHelpers: 'bundled',
                  babelrc: false,
                  exclude: 'node_modules/**',
                  presets: [
                    [
                      '@babel/preset-env',
                      {
                        corejs: {
                          version: 3,
                        },
                        useBuiltIns: 'usage',
                      },
                    ],
                  ],
                }),
                isProduction ? filesize() : null,
                isProduction ? sizes() : null,
              ],
            },
            {
              format: 'es',
            }
          )
        )
        .pipe(plugins.if(isProduction, plugins.prettier()))
        .pipe(plugins.if(isProduction, dest(config.dest)))
        .pipe(
          plugins.if(
            isProduction,
            plugins.rename({
              suffix: '.min',
            })
          )
        )
        .pipe(
          plugins.if(
            isProduction,
            plugins.terser({
              output: {
                comments: false,
              },
              mangle: false,
            })
          )
        )
        .pipe(plugins.if(!isProduction, plugins.sourcemaps.write('.')))
        .pipe(dest(config.dest))
    );
  };
};
