/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Creates a lazy sync-rpc function.
 * @param {string} path
 * @return {function(...*):T}
 * @template T
 */
function lazySyncRpc(path) {
  let fn;
  return (...args) => (fn || (fn = require('sync-rpc')(path)))(...args);
}

/**
 * Synchronously transforms a css string using postcss.
 * @param {string} cssStr the css text to transform
 * @param {!Object=} opt_cssnano cssnano options
 * @param {!Object=} opt_filename the filename of the file being transformed. Used for sourcemaps generation.
 * @return {Object} The transformation result
 */
const transformCssSync = lazySyncRpc(__dirname + '/init-sync.js');

/**
 * @param {!Object=} filename the filename of the file being transformed. Used for sourcemaps generation.
 * @return {string}
 */
const jsifyCssSync = lazySyncRpc(__dirname + '/init-jsify-sync.js');

module.exports = {
  transformCssSync,
  jsifyCssSync,
};
