import gulp from 'gulp';
import zlib from 'zlib';
import gzip from 'gulp-gzip';
import brotli from 'gulp-brotli';

const { src, dest, series } = gulp;

export default (config) => {
  const files = [];
  ['js', 'css', 'svg'].forEach((ext) =>
    files.push(`${config.buildPath}/**/*.${ext}`)
  );

  const gzipTask = () => {
    return src(files)
      .pipe(
        gzip({
          gzipOptions: {
            level: 9,
          },
        })
      )
      .pipe(dest(config.buildPath));
  };

  const brotliTask = () => {
    return src(files)
      .pipe(
        brotli({
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]:
              zlib.constants.BROTLI_MAX_QUALITY,
          },
        })
      )
      .pipe(dest(config.buildPath));
  };

  return series(gzipTask, brotliTask);
};
