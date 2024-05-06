import { src, dest } from 'gulp';

export default (config) => {
  return src(config.src).pipe(dest(config.dest));
};
