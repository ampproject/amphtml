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

const log = require('fancy-log');
const {
  getDepCheckConfig,
  getPostClosureConfig,
  getPreClosureConfig,
  getTestConfig,
  getUnminifiedConfig,
} = require('./build-system/babel-config');
const {cyan, yellow} = require('ansi-colors');

/**
 * Mapping of babel transform callers to their corresponding babel configs.
 */
const babelTransforms = new Map([
  ['babel-jest', {}],
  ['dep-check', getDepCheckConfig()],
  ['post-closure', getPostClosureConfig()],
  ['pre-closure', getPreClosureConfig()],
  ['test', getTestConfig()],
  ['unminified', getUnminifiedConfig()],
]);

/**
 * Main entry point. Returns babel config corresponding to the caller, or a
 * blank config if the caller is unrecognized.
 *
 * @param {!Object} api
 * @return {!Object}
 */
module.exports = function (api) {
  const callerName = api.caller((callerObj) => {
    return callerObj ? callerObj.name : '<unnamed>';
  });
  if (callerName && babelTransforms.has(callerName)) {
    return babelTransforms.get(callerName);
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
