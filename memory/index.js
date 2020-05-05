const { fs } = require('memfs');
const path = require('path');
const { parse } = require('url');
const through2 = require('through2');
const mime = require('mime-types');
const mem = require('mem');
const { dd } = require('dumper.js');

const memoizedParse = mem(parse);

function formatOutPath(destPath, relative) {
  const outputFilePath = path.join(destPath, relative).replace(/\\/g, '/');

  const outputDirPath = path.dirname(outputFilePath);

  return {
    file: outputFilePath,
    dir: outputDirPath,
  };
}

function getFilenameFromUrl(url, publicPath) {
  let urlObject;

  try {
    // The `url` property of the `request` is contains only  `pathname`, `search` and `hash`
    urlObject = memoizedParse(url, false, true);
  } catch (_ignoreError) {
    return filename;
  }

  return path.join('/', publicPath, urlObject.pathname);
}

module.exports.destMemory = function dest(destPath) {
  const outputDir = path.isAbsolute(destPath) ? destPath : `/${destPath}`;

  return through2.obj((file, encoding, callback) => {
    if (file.isStream()) {
      this.emit(
        'error',
        new PluginError(__filename, 'Streams are not supported!')
      );

      return callback();
    }
    if (file.isDirectory()) {
      return void callback(null, file);
    }
    const formatOutput = formatOutPath(outputDir, file.relative);

    fs.mkdirpSync(formatOutput.dir);
    fs.writeFileSync(formatOutput.file, file.contents);
    callback(null, file);
  });
};

module.exports.memoryMiddleware = function wrapper(options) {
  return async function middleware(req, res, next) {
    const acceptedMethods = options.methods || ['GET', 'HEAD'];
    const publicPath = options.publicPath || '/';
    // fixes #282. credit @cexoso. in certain edge situations res.locals is undefined.
    // eslint-disable-next-line no-param-reassign
    res.locals = res.locals || {};

    if (!acceptedMethods.includes(req.method)) {
      await goNext();
      return;
    }

    async function goNext() {
      return new Promise((resolve) => {
        resolve(next());
      });
    }

    async function processRequest() {
      const filename = getFilenameFromUrl(req.url, publicPath);
      const { headers } = options;
      let content;

      if (!filename) {
        await goNext();
        return;
      }

      try {
        content = fs.readFileSync(filename);
      } catch (_ignoreError) {
        await goNext();
        return;
      }

      if (!res.getHeader('Content-Type')) {
        // content-type name(like application/javascript; charset=utf-8) or false
        const contentType = mime.contentType(path.extname(filename));

        if (contentType) {
          res.setHeader('Content-Type', contentType);
        }
      }

      if (headers) {
        for (const name of Object.keys(headers)) {
          res.setHeader(name, headers[name]);
        }
      }

      res.writeHead(200);

      // send Buffer
      res.end(content);
    }

    processRequest();
  };
};
