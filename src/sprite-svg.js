const {
  src,
  dest
} = require('gulp')
const plugins = require('../utils/plugins')

const spriteSvg = (config) => {
  return src(config.src)
    .pipe(plugins.svgSprite({
      mode: {
        symbol: {
          sprite: 'sprite.svg',
          dest: '.'
        }
      },
      shape: {
        id: {
          generator: '%s'
        }
      },
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false,
        namespaceIDs: false,
        namespaceClassnames: false
      }
    }))
    .pipe(dest(config.dest))
}

module.exports.task = spriteSvg
module.exports = (gulp, config) => {
  gulp.task(config.task, () => spriteSvg(config))
}
