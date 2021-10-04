import gulp from 'gulp';

import betterRollup from 'gulp-better-rollup';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { default as resolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import filesize from 'rollup-plugin-filesize';
import sizes from 'rollup-plugin-sizes';
import analyze from 'rollup-plugin-analyzer';
import multi from '@rollup/plugin-multi-entry';
import path from 'node:path';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import gulpif from 'gulp-if';
import prettier from 'gulp-prettier';
import terser from 'gulp-terser';
import isProduction from '../utils/env.js';

const { src, dest } = gulp;

export default (config, mainConfig) => {
  return src(config.src)
    .pipe(sourcemaps.init())
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
              },
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
    .pipe(gulpif(isProduction, prettier()))
    .pipe(gulpif(isProduction, dest(config.dest)))
    .pipe(
      gulpif(
        isProduction,
        rename({
          suffix: '.min',
        })
      )
    )
    .pipe(
      gulpif(
        isProduction,
        terser({
          output: {
            comments: false,
          },
          mangle: false,
        })
      )
    )
    .pipe(gulpif(!isProduction, sourcemaps.write('.')))
    .pipe(dest(config.dest));
};
