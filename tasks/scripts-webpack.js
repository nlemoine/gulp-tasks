import { src, dest } from 'gulp';

import { resolve } from 'node:path';
import isProduction from '../utils/env.js';
import compiler from 'webpack';
import webpack from 'webpack-stream';
import named from 'vinyl-named';
import filter from 'gulp-filter';
import terser from 'gulp-terser';
import rename from 'gulp-rename';
import gulpif from 'gulp-if';
import prettier from 'gulp-prettier';
import { has } from 'lodash-es';

export let webpackConfig = {
  watch: false,
  mode: isProduction ? 'production' : 'development',
  devtool: !isProduction ? 'inline-source-map' : false,
  resolve: {
    extensions: ['.js'],
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
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
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
              [
                '@babel/preset-env',
                {
                  corejs: {
                    version: 3,
                  },
                  useBuiltIns: 'usage',
                  modules: false,
                },
              ],
            ],
            plugins: ['@babel/plugin-syntax-dynamic-import'],
          },
        },
      },
    ],
  },
};

export default (config, mainConfig) => {
  const excludeChunks = filter((file) => !/chunks/.test(file.path), {
    restore: true,
  });

  if (has(config, 'webpackConfig')) {
    webpackConfig = Object.assign(webpackConfig, config.webpackConfig);
  }

  const defaultAliases = {
    '~': resolve(`${mainConfig.rootPath}/node_modules`),
    '@': resolve(`${mainConfig.assetsPath}/js`),
  };

  webpackConfig = {
    ...webpackConfig,
    resolve: {
      ...webpackConfig.resolve,
      alias: {
        ...webpackConfig.resolve?.alias,
        ...defaultAliases,
      },
    },
  };

  return src(config.src)
    .pipe(named())
    .pipe(webpack(webpackConfig, compiler))
    .pipe(gulpif(isProduction, prettier()))
    .pipe(gulpif(isProduction, dest(config.dest)))
    .pipe(gulpif(isProduction, excludeChunks))
    .pipe(
      gulpif(
        isProduction,
        rename({
          suffix: '.min',
        }),
      ),
    )
    .pipe(gulpif(isProduction, excludeChunks.restore))
    .pipe(
      gulpif(
        isProduction,
        terser({
          output: {
            comments: false,
          },
        }),
      ),
    )
    .pipe(dest(config.dest));
};
