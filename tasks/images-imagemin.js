import { src, dest } from 'gulp';
import { basename, extname } from 'node:path';

import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import zopfli from 'imagemin-zopfli';
import jpegtran from 'imagemin-jpegtran';
import gulpif from 'gulp-if';
import rename from 'gulp-rename';

import isProduction from '../utils/env.js';
import { has } from 'lodash-es';

const mozjpegDefaults = {
  quality: 100,
};

const pngquantDefaults = {
  quality: [0.5, 0.5],
};

const svgoDefaults = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIDs: {
            preservePrefixes: ['shape-'],
            minify: false,
            remove: false,
          },
        },
      },
    },
    'removeOffCanvasPaths',
    'sortAttrs',
    'convertStyleToAttrs',
    'removeStyleElement',
    {
      name: 'removeAttrs',
      params: {
        attrs: 'data-name',
        preserveCurrentColor: true,
      },
    },
  ],
};

export { mozjpegDefaults, pngquantDefaults, svgoDefaults };

export default (config) => {
  const shouldBeOptimized = (file) => {
    const fileBasename = basename(file.path, extname(file.path));
    return /^(_)/.exec(fileBasename) === null && isProduction;
  };

  const svgoOptions = has(config, 'svgoOptions')
    ? config.svgoOptions
    : svgoDefaults;
  const mozjpegOptions = has(config, 'mozjpegOptions')
    ? config.mozjpegOptions
    : mozjpegDefaults;
  const pngquantOptions = has(config, 'pngquantOptions')
    ? config.pngquantOptions
    : pngquantDefaults;

  const defaultPlugins = [
    // GIF
    gifsicle(),
    // JPEG
    mozjpeg(mozjpegOptions),
    // PNG
    pngquant(pngquantOptions),
    // SVG
    svgo(svgoOptions),
  ];

  if (has(config, 'plugins')) {
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
        }),
      )
      .pipe(dest(config.dest))
  );
};
