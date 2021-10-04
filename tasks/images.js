import gulp from 'gulp';
import path from 'node:path';

import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import zopfli from 'imagemin-zopfli';
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
    gifsicle(),
    // JPEG
    mozjpeg({
      quality: 100,
    }),
    // PNG
    pngquant({
      quality: [0.5, 0.5],
    }),
    // SVG
    svgo({
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeXMLNS: true,
              removeDimensions: true,
              cleanupIDs: {
                remove: true,
                minify: false,
              },
              convertStyleToAttrs: true,
              removeViewBox: false,
            }
          }
        }
      ],
    }),
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
