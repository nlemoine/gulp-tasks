import { src, dest } from 'gulp';
import through from 'through2';
import vinyl from 'vinyl';
import { extname, basename, dirname } from 'node:path';
import resolveConfig from 'tailwindcss/resolveConfig.js';
import { has } from 'lodash-es';

export default (config) => {

  throw new Error('This task has been removed');

  let tailwindConfig = false;
  if (has(config, 'config')) {
    tailwindConfig = config.config;
  }

  const stream = src(config.src);

  let dests = config.dest;
  if (!Array.isArray(dests)) {
    dests = [dests];
  }

  dests.forEach((d) => {
    const ext = extname(d);

    // Output SCSS
    if (ext === '.scss') {
      stream
        .pipe(
          through.obj((file, enc, cb) => {
            const converter = new TailwindExportConfig({
              config: tailwindConfig ? tailwindConfig : file.path,
              format: 'scss',
              quotedKeys: true,
              preserveKeys: ['colors', 'screens', 'spacing'],
            });
            const converted = converter.convert();
            const transformedFile = new vinyl({
              path: basename(d),
              base: undefined,
              cwd: '',
              contents: Buffer.from(converted),
            });
            cb(null, transformedFile);
          }),
        )
        .pipe(dest(dirname(d)));
    }

    // Output JSON
    if (ext === '.json') {
      stream
        .pipe(
          through.obj(async (file, enc, cb) => {
            let config = await import(file.path);
            config = resolveConfig(tailwindConfig ? tailwindConfig : file.path);

            const transformedFile = new vinyl({
              path: basename(d),
              base: undefined,
              cwd: '',
              contents: Buffer.from(JSON.stringify(config.theme, null, 2)),
            });

            cb(null, transformedFile);
          }),
        )
        .pipe(dest(dirname(d)));
    }
  });

  return stream;
};
