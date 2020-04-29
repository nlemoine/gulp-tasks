const {
  src,
  dest
} = require('gulp')

const pngquant = require('imagemin-pngquant')
const zopfli = require('imagemin-zopfli')
const mozjpeg = require('imagemin-mozjpeg')

const plugins = require('../utils/plugins')
const isProduction = require('../utils/env')

module.exports = (gulp, config) => {
  const images = () => {
    return src(config.src)
      .pipe(plugins.newer(config.dest))
      .pipe(plugins.if(isProduction, plugins.imagemin([
        // GIF
        plugins.imagemin.gifsicle(),
        // JPEG
        mozjpeg({
          quality: 50
        }),
        // PNG
        pngquant({
          quality: [0.5, 0.5]
        }),
        // SVG
        plugins.imagemin.svgo({
          plugins: [{
              doctypeDeclaration: false
            },
            {
              namespaceIDs: false
            },
            {
              xmlDeclaration: false
            },
            {
              removeViewBox: false
            },
            {
              cleanupIDs: {
                remove: true,
                minify: false
              }
            }
          ]
        })
      ])))
      .pipe(dest(config.dest))
  }

  gulp.task(config.task, images)
}
