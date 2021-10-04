import gulp from 'gulp';
import modernizr from 'gulp-modernizr';
import terser from 'gulp-terser';

const { src, dest } = gulp;

export default (config) => {
  return src(config.src)
    .pipe(modernizr(config.options))
    .pipe(terser())
    .pipe(dest(config.dest));
};
