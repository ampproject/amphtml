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
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  };
  config.module = {
    rules: [
      {
        test: /\.jsx?|tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: [
            [
              '@babel/preset-typescript',
              {jsxPragma: 'Preact', jsxPragmaFrag: 'Preact.Fragment'},
            ],
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
