const path = require('path');
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

  return config;
};
