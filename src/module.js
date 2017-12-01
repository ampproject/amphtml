/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/**
 * `require` a module exported by a browserify bundle.
 * @param {string} module
 * @return {?}
 */
export function requireExternal(module) {
  // Alias the `require` function so Closure doesn't complain that
  // the module isn't provided.
  // Technique found in https://github.com/google/closure-compiler/issues/954
  const aliasedRequire = require; // eslint-disable-line no-undef
  return aliasedRequire(module);
}
