import { src, dest } from 'gulp';
import { basename, extname } from 'node:path';

import sharpOptimizeImages from 'gulp-sharp-optimize-images';
import gulpif from 'gulp-if';
import rename from 'gulp-rename';

import isProduction from '../utils/env.js';
import { has } from 'lodash-es';

export default (config) => {
  const shouldBeOptimized = (file) => {
    const fileBasename = basename(file.path, extname(file.path));
    return /^(_)/.exec(fileBasename) === null && isProduction;
  };

  return (
    src(config.src, { encoding: false })
      .pipe(
        gulpif(
          shouldBeOptimized,
          sharpOptimizeImages(has(config, 'options') ? config.options : {}),
        ),
      )
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
