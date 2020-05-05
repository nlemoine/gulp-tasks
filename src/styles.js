const { src, dest } = require('gulp');
const path = require('path');

const packageImporter = require('node-sass-package-importer');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const lazypipe = require('lazypipe');
const Fiber = require('fibers');
const sass = require('sass');
const purgecss = require('@fullhuman/postcss-purgecss');
const bs = require('browser-sync');

const plugins = require('../utils/plugins');
const isProduction = require('../utils/env');
const { destMemory } = require('../memory');

plugins.sass.compiler = sass;

module.exports = (gulp, config, mem) => {
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

  const cloneSink = plugins.clone.sink();

  /**
   * Apply RTLcss
   */
  const rtlFile = lazypipe()
    .pipe(plugins.rename, {
      suffix: '-rtl',
    })
    .pipe(plugins.rtlcss);

  const styles = () => {
    return (
      src(config.src)
        .pipe(
          plugins.if(
            !isProduction,
            plugins.appendPrepend.prependText('$debug:true;')
          )
        )
        .pipe(plugins.if(!isProduction, plugins.sourcemaps.init()))
        .pipe(
          plugins
            .sass({
              fiber: Fiber,
              outputStyle: 'expanded',
              importer: packageImporter(),
            })
            .on('error', plugins.sass.logError)
        )
        // RTL CSS
        .pipe(
          plugins.if((file) => {
            return !!getFileOptionValue(file, 'rtl');
          }, cloneSink)
        )
        .pipe(
          plugins.if((file) => {
            return !!getFileOptionValue(file, 'rtl');
          }, rtlFile())
        )
        .pipe(
          plugins.if((file) => {
            return !!getFileOptionValue(file, 'rtl');
          }, cloneSink.tap())
        )
        .pipe(
          plugins.postcss({
            plugins: [autoprefixer],
          })
        )
        // Purge CSS
        .pipe(
          plugins.if(
            isProduction,
            plugins.postcss((file) => {
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
            plugins.postcss([
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
        .pipe(plugins.if(!isProduction, plugins.sourcemaps.write('.')))
        .pipe(bs.active ? destMemory(config.dest) : dest(config.dest))
    );
  };
  gulp.task(config.task, styles);
};
