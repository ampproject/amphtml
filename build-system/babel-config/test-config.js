'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {getImportResolverPlugin} = require('./import-resolver');
const {getReplaceGlobalsPlugin, getReplacePlugin} = require('./helpers');

/**
 * Gets the config for babel transforms run during `amp [unit|integration|e2e]`.
 *
 * @return {!Object}
 */
function getTestConfig() {
  const instanbulPlugin = [
    'istanbul',
    {
      exclude: [
        'ads/**/*.js',
        'build-system/**/*.js',
        'extensions/**/test/**/*.js',
        'third_party/**/*.js',
        'test/**/*.js',
        'testing/**/*.js',
      ],
    },
  ];
  const reactJsxPlugin = [
    '@babel/plugin-transform-react-jsx',
    {
      pragma: 'Preact.createElement',
      pragmaFrag: 'Preact.Fragment',
      useSpread: true,
    },
  ];
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: 'commonjs',
      loose: true,
      targets: {'browsers': ['Last 2 versions']},
    },
  ];
  const replacePlugin = getReplacePlugin();
  const replaceGlobalsPlugin = getReplaceGlobalsPlugin();
  const testPlugins = [
    getImportResolverPlugin(),
    argv.coverage ? instanbulPlugin : null,
    replacePlugin,
    replaceGlobalsPlugin,
    './build-system/babel-plugins/babel-plugin-imported-helpers',
    './build-system/babel-plugins/babel-plugin-transform-json-import',
    './build-system/babel-plugins/babel-plugin-transform-json-configuration',
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    './build-system/babel-plugins/babel-plugin-transform-jss',
    './build-system/babel-plugins/babel-plugin-transform-promise-resolve',
    '@babel/plugin-transform-react-constant-elements',
    '@babel/plugin-transform-classes',
    reactJsxPlugin,
  ].filter(Boolean);
  const testPresets = [presetEnv];
  return {
    compact: false,
    plugins: testPlugins,
    presets: testPresets,
    sourceMaps: 'inline',
  };
}

module.exports = {
  getTestConfig,
};
