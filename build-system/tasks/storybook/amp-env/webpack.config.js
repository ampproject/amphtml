const path = require('path');
const {getRelativeAliasMap} = require('../../../babel-config/import-resolver');
const {webpackConfigNoChunkTilde} = require('../env-utils');

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
    alias: getRelativeAliasMap(rootDir),
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
    ],
  };

  return webpackConfigNoChunkTilde(config);
};
