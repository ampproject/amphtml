/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  ['post-closure', 'getPostClosureConfig'],
  ['pre-closure', 'getPreClosureConfig'],
  ['test', 'getTestConfig'],
  ['unminified', 'getUnminifiedConfig'],
  ['minified', 'getMinifiedConfig'],
  ['@babel/eslint-parser', 'getEslintConfig'],
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
