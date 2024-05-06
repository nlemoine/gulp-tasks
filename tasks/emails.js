import { src, dest } from 'gulp';
import mjml from 'gulp-mjml';
import rename from 'gulp-rename';

export default (config) => {
  return src(config.src)
    .pipe(mjml())
    .pipe(
      rename((path) => {
        path.basename = path.basename.replace('mjml', 'html');
        path.extname = '.twig';
      }),
    )
    .pipe(dest(config.dest));
};
