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
 * Lazily instantiate the transformer.
 */
let syncTransformer;

/**
 * Synchronously transforms a css string using postcss.

 * @param {string} cssStr the css text to transform
 * @param {!Object=} opt_cssnano cssnano options
 * @param {!Object=} opt_filename the filename of the file being transformed. Used for sourcemaps generation.
 * @return {Object} The transformation result
 */
function transformCssSync(cssStr, opt_cssnano, opt_filename) {
  if (!syncTransformer) {
    syncTransformer = require('sync-rpc')(__dirname + '/init-sync.js');
  }
  return syncTransformer(cssStr, opt_cssnano, opt_filename);
}

module.exports = {
  transformCssSync,
};
