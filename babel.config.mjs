/**
 * @fileoverview Global configuration file for various babel transforms.
 *
 * Notes: From https://babeljs.io/docs/en/plugins#plugin-ordering:
 * 1. Plugins run before Presets.
 * 2. Plugin ordering is first to last.
 * 3. Preset ordering is reversed (last to first).
 */

import {cyan, yellow} from 'kleur/colors';
import {log} from './build-system/common/logging.mjs';

/**
 * Mapping of each babel transform caller to the name of the function that
 * returns its config.
 */
const babelTransforms = new Map([
  ['babel-jest', 'getEmptyConfig'],
  ['post-closure', 'getPostClosureConfig'],
  ['pre-closure', 'getPreClosureConfig'],
  ['test', 'getTestConfig'],
  ['unminified', 'getUnminifiedConfig'],
  ['minified', 'getMinifiedConfig'],
  ['jss', 'getJssConfig'],
  ['@babel/eslint-parser', 'getEslintConfig'],
]);

/**
 * Main entry point. Returns babel config corresponding to the caller, or an
 * empty object if the caller is unrecognized. Configs are lazy-required when
 * requested so we don't unnecessarily compute the entire set for all callers.
 *
 * @param {!Object} api
 * @return {!Promise<Object>}
 */
export default function (api) {
  const callerName = api.caller((callerObj) => {
    return callerObj ? callerObj.name : '<unnamed>';
  });
  return {};
  // if (callerName && babelTransforms.has(callerName)) {
  //   const configFunctionName = babelTransforms.get(callerName);
  //   return (await import(`./build-system/babel-config/${configFunctionName}`))();
  //   // return require('./build-system/babel-config')[configFunctionName]();
  // } else {
  //   log(
  //     yellow('WARNING:'),
  //     'Unrecognized Babel caller',
  //     cyan(callerName),
  //     '(see babel.config.mjs).'
  //   );
  //   return {};
  // }
};
