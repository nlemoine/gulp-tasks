import { src, dest } from 'gulp';
import svgSprite from 'gulp-svg-sprite';
// import plugins from "../utils/plugins";

export default (config) => {
  return src(config.src)
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: 'sprite.svg',
            dest: '.',
          },
        },
        shape: {
          id: {
            generator: '%s',
          },
        },
        svg: {
          xmlDeclaration: false,
          doctypeDeclaration: false,
          namespaceIDs: false,
          namespaceClassnames: false,
        },
      }),
    )
    .pipe(dest(config.dest));
};
