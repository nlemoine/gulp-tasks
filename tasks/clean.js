import del from 'del';

export default (config) => {
  return del(`${config.buildPath}/**`, {
    dot: true,
    force: true,
  });
};
