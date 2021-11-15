import gulp from 'gulp';
import path from 'node:path';

import packageImporter from 'node-sass-package-importer';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import lazypipe from 'lazypipe';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import purgecss from '@fullhuman/postcss-purgecss';

// import plugins from '../utils/plugins';
import rename from 'gulp-rename';
import rtlcss from 'gulp-rtlcss';
import postcss from 'gulp-postcss';
import gulpif from 'gulp-if';
import prettier from 'gulp-prettier';
import sourcemaps from 'gulp-sourcemaps';
import gap from 'gulp-append-prepend';
import clone from 'gulp-clone';
import isProduction from '../utils/env.js';

const sass = gulpSass(dartSass);
const { src, dest } = gulp;

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
    const ext = path.extname(file.path);
    const basename = path.basename(file.path, ext);
    const rtlBasename = basename.replace('-rtl', '');

    if (
      config.options.hasOwnProperty(basename) ||
      config.options.hasOwnProperty(rtlBasename)
    ) {
      if (
        config.options.hasOwnProperty(rtlBasename) &&
        config.options[rtlBasename].hasOwnProperty('rtl') &&
        config.options[rtlBasename].rtl
      ) {
        return config.options[rtlBasename];
      }
      return config.options[basename];
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
    if (!options.hasOwnProperty(key)) {
      return false;
    }
    return options[key];
  };

  const cloneSink = clone.sink();

  /**
   * Apply RTLcss
   */
  const rtlFile = lazypipe()
    .pipe(rename, {
      suffix: '-rtl',
    })
    .pipe(rtlcss);

  return (
    src(config.src)
      .pipe(gulpif(!isProduction, gap.prependText('$debug:true;')))
      .pipe(gulpif(!isProduction, sourcemaps.init()))
      .pipe(
        sass({
          outputStyle: 'expanded',
          importer: packageImporter(),
        }).on('error', sass.logError)
      )
      // RTL CSS
      .pipe(
        gulpif((file) => {
          return !!getFileOptionValue(file, 'rtl');
        }, cloneSink)
      )
      .pipe(
        gulpif((file) => {
          return !!getFileOptionValue(file, 'rtl');
        }, rtlFile())
      )
      .pipe(
        gulpif((file) => {
          return !!getFileOptionValue(file, 'rtl');
        }, cloneSink.tap())
      )
      .pipe(
        postcss({
          plugins: [autoprefixer],
        })
      )
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
          })
        )
      )
      // Prettier
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
          ])
        )
      )
      .pipe(gulpif(!isProduction, sourcemaps.write('.')))
      .pipe(dest(config.dest))
  );
};