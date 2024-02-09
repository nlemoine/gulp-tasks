import { resolve, dirname, normalize, basename } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { jsToSassString } from 'sass-theme-json/lib/toSassString.js';

export default function (url, prev, done) {
  const isSyncMode = typeof done !== 'function';
  if (!/\.json$/.test(url)) {
    if (!isSyncMode) {
      return null;
    }
    done(null);
    return;
  }

  const basePath = dirname(prev);
  const resolvedUrl = resolve(normalize(`${basePath}/${url}`));
  if (!existsSync(resolvedUrl)) {
    if (isSyncMode) {
      return null;
    }
    done(null);
    return;
  }

  const baseName = basename(resolvedUrl, '.json');

  const json = jsToSassString(JSON.parse(readFileSync(resolvedUrl, 'utf8')));

  const result = {
    contents: `$${baseName}: ${json};`,
  };

  if (isSyncMode) {
    return result;
  }
  done(result);
}
