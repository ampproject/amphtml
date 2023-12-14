/**
 * @fileoverview Global configuration file for various babel transforms.
 *
 * Notes: From https://babeljs.io/docs/en/plugins#plugin-ordering:
 * 1. Plugins run before Presets.
 * 2. Plugin ordering is first to last.
 * 3. Preset ordering is reversed (last to first).
 */

'use strict';

const {cyan, yellow} = require('kleur/colors');

const {log} = require('./build-system/common/logging');

/**
 * Mapping of each babel transform caller to the name of the function that
 * returns its config.
 */
const babelTransforms = new Map([
  ['babel-jest', 'getEmptyConfig'],
  ['nomodule-loader', 'getNoModuleLoaderConfig'],
  ['test', 'getTestConfig'],
  ['unminified', 'getUnminifiedConfig'],
  ['unminified-ssr-css', 'getUnminifiedSsrCssConfig'],
  ['minified', 'getMinifiedConfig'],
  ['minified-ssr-css', 'getMinifiedSsrCssConfig'],
  ['jss', 'getJssConfig'],
  ['@babel/eslint-parser', 'getEslintConfig'],
  ['is-enum-value', 'getEmptyConfig'],
  ['import-resolver', 'getEmptyConfig'],
  ['react-minified', 'getReactMinifiedConfig'],
  ['react-unminified', 'getReactUnminifiedConfig'],
]);

/**
 * Main entry point. Returns babel config corresponding to the caller, or an
 * empty object if the caller is unrecognized. Configs are lazy-required when
 * requested so we don't unnecessarily compute the entire set for all callers.
 *
 * @param {!Object} api
 * @return {!Object}
 */
module.exports = function (api) {
  const callerName = api.caller((callerObj) => {
    return callerObj ? callerObj.name : '<unnamed>';
  });
  if (callerName && babelTransforms.has(callerName)) {
    const configFunctionName = babelTransforms.get(callerName);
    return require('./build-system/babel-config')[configFunctionName]();
  } else {
    log(
      yellow('WARNING:'),
      'Unrecognized Babel caller',
      cyan(callerName),
      '(see babel.config.js).'
    );
    return {};
  }
};
