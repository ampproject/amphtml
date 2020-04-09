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
 * @fileoverview Global configuration file for the babelify transform.
 *
 * Notes: From https://babeljs.io/docs/en/plugins#plugin-ordering:
 * 1. Plugins run before Presets.
 * 2. Plugin ordering is first to last.
 * 3. Preset ordering is reversed (last to first).
 */

'use strict';

const {
  getDepCheckConfig,
  getPostClosureConfig,
  getPreClosureConfig,
  getSinglePassDepsConfig,
  getSinglePassPostConfig,
  getTestConfig,
  getUnminifiedConfig,
} = require('./build-system/babel-config');

/**
 * Mapping of babel transform callers to their corresponding babel configs.
 */
const babelTransforms = new Map([
  ['dep-check', getDepCheckConfig()],
  ['post-closure', getPostClosureConfig()],
  ['pre-closure', getPreClosureConfig()],
  ['single-pass-deps', getSinglePassDepsConfig()],
  ['single-pass-post', getSinglePassPostConfig()],
  ['test', getTestConfig()],
  ['unminified', getUnminifiedConfig()],
]);

/**
 * Main entry point. Returns babel config corresponding to the caller.
 *
 * @param {!Object} api
 * @return {!Object}
 */
module.exports = function (api) {
  const caller = api.caller((caller) => caller.name);
  if (babelTransforms.has(caller)) {
    return babelTransforms.get(caller);
  } else {
    const err = new Error('Unrecognized Babel caller (see babel.config.js).');
    err.showStack = false;
    throw err;
  }
};
