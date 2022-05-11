'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {getImportResolverPlugin} = require('./import-resolver');
const {getReplacePlugin} = require('./helpers');

/**
 * Gets the config for babel transforms run during `amp build`.
 *
 * @param {'preact' | 'react'} buildFor
 * @param {!Object=} opt_replacePluginOverrides
 * @return {!Object}
 */
function getUnminifiedConfig(buildFor = 'preact', opt_replacePluginOverrides) {
  const isEsmBuild = argv.esm || argv.sxg;

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
      modules: false,
      loose: true,
      targets: isEsmBuild ? {esmodules: true} : {browsers: ['Last 2 versions']},
      shippedProposals: true,
      exclude: isEsmBuild ? ['@babel/plugin-transform-for-of'] : [],
    },
  ];
  const presetTypescript = [
    '@babel/preset-typescript',
    {jsxPragma: 'Preact', jsxPragmaFrag: 'Preact.Fragment'},
  ];
  const replacePlugin = getReplacePlugin(opt_replacePluginOverrides);
  const unminifiedPlugins = [
    './build-system/babel-plugins/babel-plugin-jsx-style-object',
    getImportResolverPlugin(buildFor),
    argv.coverage ? 'babel-plugin-istanbul' : null,
    './build-system/babel-plugins/babel-plugin-amp-story-supported-languages',
    replacePlugin,
    './build-system/babel-plugins/babel-plugin-transform-json-import',
    './build-system/babel-plugins/babel-plugin-transform-json-configuration',
    './build-system/babel-plugins/babel-plugin-transform-jss',
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    './build-system/babel-plugins/babel-plugin-transform-promise-resolve',
    './build-system/babel-plugins/babel-plugin-transform-amp-extension-call',
    './build-system/babel-plugins/babel-plugin-dom-jsx-svg-namespace',
    reactJsxPlugin,
  ].filter(Boolean);
  const unminifiedPresets = [presetTypescript, presetEnv];
  return {
    compact: false,
    plugins: unminifiedPlugins,
    presets: unminifiedPresets,
    sourceMaps: true,
    assumptions: {
      constantSuper: true,
      noClassCalls: true,
      setClassMethods: true,
      setPublicClassFields: true,
    },
  };
}

module.exports = {
  getUnminifiedConfig,
};
