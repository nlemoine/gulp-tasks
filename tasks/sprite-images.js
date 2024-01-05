import gulp from 'gulp';
// import plugins from "../utils/plugins";
import pngquant from 'imagemin-pngquant';
import buffer from 'vinyl-buffer';
import spritesmith from 'gulp.spritesmith';
import gulpif from 'gulp-if';
import filter from 'gulp-filter';
import imagemin from 'gulp-imagemin';
import isProduction from '../utils/env.js';

const { src, dest } = gulp;

export default (config) => {
  const filterPngs = filter(['*.png'], {
    restore: true,
  });

  return src(config.src)
    .pipe(spritesmith(config.options))
    .pipe(filterPngs)
    .pipe(buffer())
    .pipe(
      gulpif(
        isProduction,
        imagemin([
          // PNG
          pngquant({
            quality: [0.5, 0.5],
          }),
        ]),
      ),
    )
    .pipe(dest(config.dest))
    .pipe(filterPngs.restore)
    .pipe(filter(['*.scss']))
    .pipe(dest(config.destScss));
};
