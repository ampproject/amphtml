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

const lodashDebounce = require('lodash.debounce');

/**
 * Creates a debounced function that delays invoking func until after wait
 * milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * Notably, invokes the function both the leading and trailing edges of the event.
 *
 * @param {function(...S):T} func
 * @param {number} wait
 * @return {function(...S):T}
 * @template S
 * @template T
 */
function debounce(func, wait) {
  return lodashDebounce(func, wait, {leading: true, trailing: true});
}

module.exports = debounce;
