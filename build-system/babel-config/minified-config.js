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

  const plugins = [
    'optimize-objstr',
    getImportResolverPlugin(),
    argv.coverage ? 'babel-plugin-istanbul' : null,
    './build-system/babel-plugins/babel-plugin-imported-helpers',
    './build-system/babel-plugins/babel-plugin-transform-inline-isenumvalue',
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    './build-system/babel-plugins/babel-plugin-transform-promise-resolve',
    './build-system/babel-plugins/babel-plugin-transform-rename-privates',
    '@babel/plugin-transform-react-constant-elements',
    reactJsxPlugin,
    (argv.esm || argv.sxg) &&
      './build-system/babel-plugins/babel-plugin-transform-dev-methods',
    // TODO(alanorozco): Remove `replaceCallArguments` once serving infra is up.
    [
      './build-system/babel-plugins/babel-plugin-transform-log-methods',
      {replaceCallArguments: false},
    ],
    [
      './build-system/babel-plugins/babel-plugin-transform-json-import',
      {freeze: false},
    ],
    './build-system/babel-plugins/babel-plugin-transform-amp-extension-call',
    './build-system/babel-plugins/babel-plugin-transform-html-template',
    './build-system/babel-plugins/babel-plugin-transform-jss',
    replacePlugin,
    './build-system/babel-plugins/babel-plugin-transform-amp-asserts',
    // TODO(erwinm, #28698): fix this in fixit week
    // argv.esm
    //? './build-system/babel-plugins/babel-plugin-transform-function-declarations'
    //: null,
    './build-system/babel-plugins/babel-plugin-transform-json-configuration',
    isProd && [
      './build-system/babel-plugins/babel-plugin-amp-mode-transformer',
      BUILD_CONSTANTS,
    ],
    ['@babel/plugin-transform-for-of', {loose: true, allowArrayLike: true}],
  ].filter(Boolean);
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: false,
      targets: argv.esm || argv.sxg ? {esmodules: true} : {ie: 11, chrome: 41},
    },
  ];

  return {
    compact: false,
    plugins,
    sourceMaps: 'inline',
    presets: [presetEnv],
    retainLines: true,
    assumptions: {
      constantSuper: true,
      noClassCalls: true,
      setClassMethods: true,
    },
  };
}

module.exports = {
  getMinifiedConfig,
};
