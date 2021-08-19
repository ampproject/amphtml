'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {BUILD_CONSTANTS} = require('../compile/build-constants');
const {getImportResolverPlugin} = require('./import-resolver');
const {getReplacePlugin} = require('./helpers');

/**
 * Gets the config for minified babel transforms run, used by 3p vendors.
 *
 * @return {!Object}
 */
function getMinifiedConfig() {
  const replacePlugin = getReplacePlugin();
  const reactJsxPlugin = [
    '@babel/plugin-transform-react-jsx',
    {
      pragma: 'Preact.createElement',
      pragmaFrag: 'Preact.Fragment',
      useSpread: true,
    },
  ];

  const plugins = [
    'optimize-objstr',
    getImportResolverPlugin(),
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    './build-system/babel-plugins/babel-plugin-transform-promise-resolve',
    '@babel/plugin-transform-react-constant-elements',
    reactJsxPlugin,
    argv.esm
      ? './build-system/babel-plugins/babel-plugin-transform-dev-methods'
      : null,
    [
      './build-system/babel-plugins/babel-plugin-transform-log-methods',
      {replaceCallArguments: false},
    ],
    './build-system/babel-plugins/babel-plugin-transform-parenthesize-expression',
    [
      './build-system/babel-plugins/babel-plugin-transform-json-import',
      {freeze: false},
    ],
    './build-system/babel-plugins/babel-plugin-transform-html-template',
    './build-system/babel-plugins/babel-plugin-transform-jss',
    './build-system/babel-plugins/babel-plugin-transform-default-assignment',
    replacePlugin,
    './build-system/babel-plugins/babel-plugin-transform-amp-asserts',
    // TODO(erwinm, #28698): fix this in fixit week
    // argv.esm
    //? './build-system/babel-plugins/babel-plugin-transform-function-declarations'
    //: null,
    argv.fortesting
      ? null
      : './build-system/babel-plugins/babel-plugin-transform-json-configuration',
    argv.fortesting
      ? null
      : [
          './build-system/babel-plugins/babel-plugin-amp-mode-transformer',
          BUILD_CONSTANTS,
        ],
  ].filter(Boolean);
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: false,
      targets: argv.esm ? {esmodules: true} : {ie: 11, chrome: 41},
    },
  ];
  return {
    compact: false,
    plugins,
    presets: [presetEnv],
    retainLines: true,
  };
}

module.exports = {
  getMinifiedConfig,
};
