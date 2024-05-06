import { src, dest } from 'gulp';
import { basename, extname } from 'node:path';

import packageImporter from 'node-sass-package-importer';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import purgecss from '@fullhuman/postcss-purgecss';

import rename from 'gulp-rename';
import postcss from 'gulp-postcss';
import gulpif from 'gulp-if';
import prettier from 'gulp-prettier';
import sourcemaps from 'gulp-sourcemaps';
import gap from 'gulp-append-prepend';
import isProduction from '../utils/env.js';
import { has } from 'lodash-es';

const sass = gulpSass(dartSass);

export let sassOptions = {
  outputStyle: 'expanded',
  importer: [packageImporter()],
};

export default (config, mainConfig) => {
  config = {
    options: {},
    ...config,
  };

  /**
   * Get file options
   * @param {*} file
   */
  const getFileOptions = (file) => {
    const ext = extname(file.path);
    const fileBasename = basename(file.path, ext);
    const rtlBasename = fileBasename.replace('-rtl', '');

    if (has(config.options, fileBasename) || has(config.options, rtlBasename)) {
      if (
        has(config.options, [rtlBasename, 'rtl']) &&
        config.options[rtlBasename].rtl
      ) {
        return config.options[rtlBasename];
      }
      return config.options[fileBasename];
    }
    return false;
  };

  /**
   * Get file option value
   * @param {*} file
   * @param {*} key
   */
  const getFileOptionValue = (file, key) => {
    const options = getFileOptions(file);
    if (!options) {
      return false;
    }
    if (!has(options, key)) {
      return false;
    }
    return options[key];
  };

  if (has(config, 'sassOptions')) {
    sassOptions = {
      ...sassOptions,
      ...config.sassOptions,
    };
  }

  return (
    src(config.src)
      .pipe(gulpif(!isProduction, gap.prependText('$debug:true;')))
      .pipe(gulpif(!isProduction, sourcemaps.init()))
      .pipe(sass(sassOptions).on('error', sass.logError))
      .pipe(dest(config.dest)) // Tailwind 3 needs this
      .pipe(
        postcss({
          plugins: [autoprefixer],
        }),
      )
      .on('error', (error) => {
        console.error(error);
      })
      // Purge CSS
      .pipe(
        gulpif(
          isProduction,
          postcss((file) => {
            const purgeCssConfig = getFileOptionValue(file, 'purgecss');
            if (!purgeCssConfig) {
              return {};
            }
            return {
              plugins: [purgecss(purgeCssConfig)],
            };
          }),
        ),
      )
      // Prettier
      .pipe(gulpif(isProduction, prettier()))
      .pipe(gulpif(isProduction, dest(config.dest)))
      .pipe(
        gulpif(
          isProduction,
          rename({
            suffix: '.min',
          }),
        ),
      )
      .pipe(
        gulpif(
          isProduction,
          postcss([
            cssnano({
              preset: [
                'default',
                {
                  reduceTransforms: false,
                  discardComments: {
                    removeAll: true,
                  },
                },
              ],
            }),
          ]),
        ),
      )
      .pipe(gulpif(!isProduction, sourcemaps.write('.')))
      .pipe(dest(config.dest))
  );
};
