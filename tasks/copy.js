import { src, dest } from 'gulp';

export default (config) => {
  return src(config.src, config?.options).pipe(dest(config.dest));
};
