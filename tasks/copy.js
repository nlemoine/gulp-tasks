import gulp from 'gulp';
const { src, dest } = gulp;

export default (config) => {
  return src(config.src).pipe(dest(config.dest));
};
