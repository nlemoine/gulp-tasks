import { deleteAsync } from 'del';

export default async (config) => {
  return await deleteAsync(`${config.buildPath}/**`, {
    dot: true,
    force: true,
  });
};
