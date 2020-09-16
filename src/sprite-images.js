const { src, dest } = require('gulp');
const plugins = require('../utils/plugins');
const pngquant = require('imagemin-pngquant');
const isProduction = require('../utils/env');
const buffer = require('vinyl-buffer');
const spritesmith = require('gulp.spritesmith');

const spriteImages = (config) => {
  const filterPngs = plugins.filter(['*.png'], {
    restore: true,
  });

  return src(config.src)
    .pipe(spritesmith(config.options))
    .pipe(filterPngs)
    .pipe(buffer())
    .pipe(
      plugins.if(
        isProduction,
        plugins.imagemin([
          // PNG
          pngquant({
            quality: [0.5, 0.5],
          }),
        ])
      )
    )
    .pipe(dest(config.dest))
    .pipe(filterPngs.restore)
    .pipe(plugins.filter(['*.scss']))
    .pipe(dest(config.destScss));
};

module.exports.task = spriteImages;
module.exports = (gulp, config) => {
  gulp.task(config.task, () => spriteImages(config));
};
