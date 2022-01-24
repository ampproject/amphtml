const path = require('path');
const {BUILD_CONSTANTS} = require('../../../../compile/build-constants');
const {DefinePlugin} = require('webpack');
const {
  getRelativeAliasMap,
} = require('../../../../babel-config/import-resolver');

const rootDir = path.join(__dirname, '../../../../..');

const modules = [
  path.join(__dirname, 'node_modules'),
  path.join(__dirname, '../../node_modules'),
  path.join(rootDir, 'node_modules'),
];

module.exports = ({config}) => {
  config.resolveLoader = {
    modules,
  };
  config.resolve = {
    modules,
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      ...getRelativeAliasMap(rootDir),
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
            [
              '@babel/preset-react',
              {
                pragma: 'Preact.createElement',
                pragmaFrag: 'Preact.Fragment',
                useSpread: true,
              },
            ],
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

  return config;
};
