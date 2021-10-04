import gulp from 'gulp';
import mjml from 'gulp-mjml';
import rename from 'gulp-rename';

const { src, dest } = gulp;

export default (config) => {
  return src(config.src)
    .pipe(mjml())
    .pipe(
      rename((path) => {
        path.basename = path.basename.replace('mjml', 'html');
        path.extname = '.twig';
      })
    )
    .pipe(dest(config.dest));
};
