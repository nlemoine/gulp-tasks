const { src, dest } = require('gulp');

const betterRollup = require('gulp-better-rollup');
const babel = require('@rollup/plugin-babel').default;
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const filesize = require('rollup-plugin-filesize');
const sizes = require('rollup-plugin-sizes');
const analyze = require('rollup-plugin-analyzer');
const multi = require('@rollup/plugin-multi-entry');
const bs = require('browser-sync');

const plugins = require('../utils/plugins');
const isProduction = require('../utils/env');
const { destMemory } = require('../memory');

module.exports = (gulp, config) => {
  const scripts = () => {
    return (
      src(config.src)
        .pipe(plugins.sourcemaps.init())
        .pipe(
          betterRollup(
            {
              cache: true,
              plugins: [
                multi(),
                resolve({
                  browser: true,
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
              format: 'iife',
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
        // .pipe(plugins.if(isProduction, plugins.uglify()))
        .pipe(
          plugins.if(
            isProduction,
            plugins.terser({
              output: {
                comments: false,
              },
            })
          )
        )
        .pipe(plugins.if(!isProduction, plugins.sourcemaps.write('.')))
        .pipe(bs.active ? destMemory(config.dest) : dest(config.dest))
    );
  };

  gulp.task(config.task, scripts);
};
