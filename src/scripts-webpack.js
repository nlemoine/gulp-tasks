const { src, dest } = require('gulp');

const path = require('path');
const plugins = require('../utils/plugins');
const isProduction = require('../utils/env');
const compiler = require('webpack');
const webpack = require('webpack-stream');
const named = require('vinyl-named');

module.exports = (gulp, config, mainConfig) => {

  const excludeChunks = plugins.filter((file) => !/chunks/.test(file.path), {
    restore: true,
  });

  const webpackConfig = {
    watch: false,
    mode: isProduction ? 'production' : 'development',
    devtool: !isProduction ? 'inline-source-map' : false,
    resolve: {
      extensions: ['.js'],
      alias: {
        '~': path.resolve(`${mainConfig.rootPath}/node_modules`),
        '@': path.resolve(`${mainConfig.assetsPath}/js`),
      },
    },
    output: {
      // uniqueName: mainConfig.pkg.name,
      filename: '[name].js',
      chunkFilename: 'chunks/[name]-[contenthash].js',
    },
    optimization: {
      minimize: false,
      usedExports: true,
    },
    stats: {
      usedExports: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              // improves performance by caching babel compiles
              // this option is always added but is set to FALSE in
              // production to avoid cache invalidation issues caused
              // by some Babel presets/plugins (for instance the ones
              // that use browserslist)
              // https://github.com/babel/babel-loader#options
              cacheDirectory: !isProduction,

              // let Babel guess which kind of import/export syntax
              // it should use based on the content of files
              sourceType: 'unambiguous',
              babelrc: false,
              presets: [
                ['@babel/preset-env', {
                  corejs: {
                    version: 3,
                  },
                  useBuiltIns: 'usage',
                  modules: false,
                }],
              ],
              plugins: ['@babel/plugin-syntax-dynamic-import']
            },
          },
        },
      ],
    },
  }

  return () => {
    return (
      src(config.src)
      .pipe(named())
      .pipe(webpack(webpackConfig, compiler))
      .pipe(plugins.if(isProduction, plugins.prettier()))
      .pipe(plugins.if(isProduction, dest(config.dest)))
      .pipe(plugins.if(isProduction, excludeChunks))
      .pipe(
        plugins.if(
          isProduction,
          plugins.rename({
            suffix: '.min',
          })
        )
      )
      .pipe(plugins.if(isProduction, excludeChunks.restore))
      .pipe(
        plugins.if(
          isProduction,
          plugins.terser({
            output: {
              comments: false,
            },
          })
        )
      )
      .pipe(dest(config.dest))
    );
  };
};
