const path = require('path');
const {BUILD_CONSTANTS} = require('../../../../compile/build-constants');
const {DefinePlugin} = require('webpack');
const {
  getRelativeAliasMap,
} = require('../../../../babel-config/import-resolver');
const {existsSync} = require('fs-extra');
const {
  mergeReactBabelConfig,
} = require('../../../../babel-config/react-config');

const rootDir = path.join(__dirname, '../../../../..');

/**
 * @param {string} requestPath
 * @return {string}
 */
function mapToReactBuild(requestPath) {
  // Only handle extension paths because they have React build output.
  if (!requestPath.includes('extensions/')) {
    return requestPath;
  }
  return requestPath
    .replace(/\/component\.jss$/, '/dist/styles.css')
    .replace(/\/component\.js$/, '/dist/component-react.max.js');
}

/**
 * Webpack ResolverPlugin that maps relative imports in source to their React
 * bundle.
 * import '../component.js' to import '../dist/component-react.max.js'
 */
class ReactBuildImportResolver {
  /**
   * @param {*} resolver
   */
  apply(resolver) {
    resolver.hooks.file.tapAsync(
      'ReactBuildImportResolverPlugin',
      (request, _, callback) => {
        const mappedRequestPath = mapToReactBuild(request.path);
        if (mappedRequestPath === request.path) {
          callback();
          return;
        }
        if (!existsSync(mappedRequestPath)) {
          callback();
          return;
        }
        callback(null, {
          ...request,
          path: mappedRequestPath,
          request: mappedRequestPath,
        });
      }
    );
  }
}

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
    plugins: [new ReactBuildImportResolver()],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      ...getRelativeAliasMap(rootDir, 'react'),
      // Alias preact to react
      'preact/dom': 'react-dom',
      'preact/hooks': 'react',
      'preact/compat': 'react',
      'preact': 'react',
    },
  };
  config.module = {
    rules: [
      {
        test: /\.jsx?|tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: mergeReactBabelConfig({
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
        }),
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
