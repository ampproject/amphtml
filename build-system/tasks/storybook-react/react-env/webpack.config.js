const path = require('path');
const {BUILD_CONSTANTS} = require('../../../compile/build-constants');
const {DefinePlugin} = require('webpack');
const {getRelativeAliasMap} = require('../../../babel-config/import-resolver');
const {webpackConfigNoChunkTilde} = require('../../storybook/env-utils');

const rootDir = path.join(__dirname, '../../../..');

module.exports = ({config}) => {
  config.resolveLoader = {
    modules: [
      path.join(__dirname, '../node_modules'),
      path.join(rootDir, 'node_modules'),
    ],
  };
  config.resolve = {
    modules: [
      path.join(__dirname, '../node_modules'),
      path.join(rootDir, 'node_modules'),
    ],
    alias: {
      // TODO: implement ResolverPlugin to remove hardcoded aliases.
      // https://github.com/webpack/docs/wiki/list-of-plugins#resolverplugin
      // Alias the accordion
      '../../../amp-accordion/1.0/component':
        '../../../amp-accordion/1.0/dist/component-react.max',
      // Alias the base carousel
      '../../../amp-base-carousel/1.0/component':
        '../../../amp-base-carousel/1.0/dist/component-react.max',
      // Alias the base carousel styles
      '../../../amp-base-carousel/1.0/component.jss':
        '../../../amp-base-carousel/1.0/dist/styles.css',
      // Alias the component
      '../component': '../dist/component-react.max',
      // Alias the styles
      '../component.jss': '../dist/styles.css',
      ...getRelativeAliasMap(rootDir),
      // Alias preact to react
      '#preact': 'react',
    },
  };
  config.module = {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: [
            [
              '@babel/preset-env',
              {
                bugfixes: true,
                targets: {'browsers': ['Last 2 versions']},
              },
            ],
            ['@babel/preset-react', {'runtime': 'automatic'}],
          ],
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  };
  // Replaced by minify-replace (babel) in the usual build pipeline
  // build-system/babel-config/helpers.js#getReplacePlugin
  config.plugins.push(new DefinePlugin(BUILD_CONSTANTS));

  return webpackConfigNoChunkTilde(config);
};
