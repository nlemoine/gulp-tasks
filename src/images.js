const { src, dest } = require('gulp');
const path = require('path');

const pngquant = require('imagemin-pngquant');
const zopfli = require('imagemin-zopfli');
const mozjpeg = require('imagemin-mozjpeg');

const plugins = require('../utils/plugins');
const isProduction = require('../utils/env');

module.exports = (gulp, config) => {
  const shouldBeOptimized = (file) => {
    const basename = path.basename(file.path, path.extname(file.path));
    return /^(_)/.exec(basename) === null && isProduction;
  };

  let defaultPlugins = [
    // GIF
    plugins.imagemin.gifsicle(),
    // JPEG
    mozjpeg({
      quality: 75,
    }),
    // PNG
    pngquant({
      quality: [0.5, 0.5],
    }),
    // SVG
    plugins.imagemin.svgo({
      plugins: [
        {
          doctypeDeclaration: false,
        },
        {
          namespaceIDs: false,
        },
        {
          xmlDeclaration: false,
        },
        {
          removeViewBox: false,
        },
        {
          cleanupIDs: {
            remove: true,
            minify: false,
          },
        },
      ],
    }),
  ];

  if (config.hasOwnProperty('plugins')) {
    defaultPlugins = config.plugins;
  }

  const images = () => {
    return (
      src(config.src)
        .pipe(plugins.newer(config.dest))
        .pipe(plugins.if(shouldBeOptimized, plugins.imagemin(defaultPlugins)))
        // Remove underscored svg files
        .pipe(
          plugins.rename((path) => {
            if (path.extname !== '.svg') {
              return;
            }
            path.basename = path.basename.replace(/^(_)/, '');
          })
        )
        .pipe(dest(config.dest))
    );
  };

  gulp.task(config.task, images);
};
