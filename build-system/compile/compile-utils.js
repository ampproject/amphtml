/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

exports.SRC_DIRS = ['src', 'builtins', '3p', 'ads', 'extensions'];

exports.SRC_GLOBS = exports.SRC_DIRS.map(x => `${x}/**/*.js`);


// Since we no longer pass the process_common_js_modules flag to closure
// compiler, we must now tranform these common JS node_modules to ESM before
// passing them to closure.
// TODO(rsimha, erwinmombay): Derive this list programmatically if possible.
const commonJsModules = [
  'node_modules/dompurify/',
  'node_modules/promise-pjs/',
  'node_modules/set-dom/',
];

/**
 * Returns true if the file is known to be a common JS module.
 * @param {string} file
 */
exports.isCommonJsModule = function(file) {
  return commonJsModules.some(function(module) {
    return file.startsWith(module);
  });
}
