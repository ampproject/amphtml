/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const identity = a => a;


/**
 * Takes a set of HTML fragments and concatenates them.
 * @param {!Array<T>} fragments
 * @param {function(T):string} renderer
 * @return {string}
 * @template T
 */
const joinFragments = (fragments, renderer = identity) =>
  fragments.map(renderer).join('');


/**
 * pass-through for syntax highlighting
 * @param {!Array<string>} strings
 * @param {...*} values
 * @return {string}
 */
const html = (strings, ...values) =>
  joinFragments(strings, (string, i) => string + (values[i] || ''));


module.exports = {html, joinFragments};
