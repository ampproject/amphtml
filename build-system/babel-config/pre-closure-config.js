'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {BUILD_CONSTANTS} = require('../compile/build-constants');
const {getImportResolverPlugin} = require('./import-resolver');
const {getReplacePlugin} = require('./helpers');

/**
 * Gets the config for pre-closure babel transforms run during `amp dist`.
 *
 * @return {!Object}
 */
function getPreClosureConfig() {
  const isCheckTypes = argv._.includes('check-types');
  const isProd = argv._.includes('dist') && !argv.fortesting;

  const reactJsxPlugin = [
    '@babel/plugin-transform-react-jsx',
    {
      pragma: 'Preact.createElement',
      pragmaFrag: 'Preact.Fragment',
      useSpread: true,
    },
  ];
  const replacePlugin = getReplacePlugin();
  const preClosurePlugins = [
    'optimize-objstr',
    getImportResolverPlugin(),
    argv.coverage ? 'babel-plugin-istanbul' : null,
    './build-system/babel-plugins/babel-plugin-imported-helpers',
    './build-system/babel-plugins/babel-plugin-transform-inline-isenumvalue',
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    './build-system/babel-plugins/babel-plugin-transform-promise-resolve',
    '@babel/plugin-transform-react-constant-elements',
    reactJsxPlugin,
    argv.esm || argv.sxg
      ? './build-system/babel-plugins/babel-plugin-transform-dev-methods'
      : null,
    // TODO(alanorozco): Remove `replaceCallArguments` once serving infra is up.
    [
      './build-system/babel-plugins/babel-plugin-transform-log-methods',
      {replaceCallArguments: false},
    ],
    './build-system/babel-plugins/babel-plugin-transform-parenthesize-expression',
    [
      './build-system/babel-plugins/babel-plugin-transform-json-import',
      {freeze: false},
    ],
    './build-system/babel-plugins/babel-plugin-transform-amp-extension-call',
    './build-system/babel-plugins/babel-plugin-transform-html-template',
    './build-system/babel-plugins/babel-plugin-transform-jss',
    './build-system/babel-plugins/babel-plugin-transform-default-assignment',
    replacePlugin,
    './build-system/babel-plugins/babel-plugin-transform-amp-asserts',
    // TODO(erwinm, #28698): fix this in fixit week
    // argv.esm
    //? './build-system/babel-plugins/babel-plugin-transform-function-declarations'
    //: null,
    !isCheckTypes &&
      './build-system/babel-plugins/babel-plugin-transform-json-configuration',
    isProd && [
      './build-system/babel-plugins/babel-plugin-amp-mode-transformer',
      BUILD_CONSTANTS,
    ],
  ].filter(Boolean);
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: false,
      targets: {esmodules: true},
    },
  ];
  const preClosurePresets = argv.esm || argv.sxg ? [presetEnv] : [];
  const preClosureConfig = {
    compact: false,
    plugins: preClosurePlugins,
    presets: preClosurePresets,
    retainLines: true,
    sourceMaps: true,
  };
  return preClosureConfig;
}

module.exports = {
  getPreClosureConfig,
};
