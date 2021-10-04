import gulp from 'gulp';
import path from 'node:path';

import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import zopfli from 'imagemin-zopfli';
import mozjpeg from 'imagemin-mozjpeg';
import jpegtran from 'imagemin-jpegtran';
import gulpif from 'gulp-if';
import rename from 'gulp-rename';

import isProduction from '../utils/env.js';

const { src, dest } = gulp;

export default (config) => {
  const shouldBeOptimized = (file) => {
    const basename = path.basename(file.path, path.extname(file.path));
    return /^(_)/.exec(basename) === null && isProduction;
  };

  let defaultPlugins = [
    // GIF
    // imagemin.gifsicle(),
    // JPEG
    // imagemin.mozjpeg({
    //   quality: 100,
    // }),
    // PNG
    pngquant({
      quality: [0.5, 0.5],
    }),
    // SVG
    // imagemin.svgo({
    //   plugins: [
    //     { cleanupAttrs: true },
    //     { removeDoctype: true },
    //     { removeXMLProcInst: true },
    //     { removeComments: true },
    //     { removeMetadata: true },
    //     { removeUselessDefs: true },
    //     { removeEditorsNSData: true },
    //     { removeEmptyAttrs: true },
    //     { removeHiddenElems: false },
    //     { removeEmptyText: true },
    //     { removeEmptyContainers: true },
    //     { cleanupEnableBackground: true },
    //     { removeViewBox: true },
    //     { cleanupIDs: false },
    //     { convertStyleToAttrs: true },
    //     { removeViewBox: false },
    //     {
    //       cleanupIDs: {
    //         remove: true,
    //         minify: false,
    //       },
    //     },
    //   ],
    // }),
  ];

  if (config.hasOwnProperty('plugins')) {
    defaultPlugins = config.plugins;
  }

  return (
    src(config.src)
      .pipe(gulpif(shouldBeOptimized, imagemin(defaultPlugins)))
      // Remove underscored svg files
      .pipe(
        rename((path) => {
          if (path.extname !== '.svg') {
            return;
          }
          path.basename = path.basename.replace(/^(_)/, '');
        })
      )
      .pipe(dest(config.dest))
  );
};
