/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {devAssert} from '../log';

const EMPTY_DEPS = [];

/**
 * The following arguments are expected:
 * - a required component function.
 * - an optional array of `ContextProp` dependencies.
 * - an optional string key for a global component identifier.
 *
 * Returns the provided function with metadata attached to it.
 *
 * @param {...?} args
 * @return {function(...?):?}
 */
export function withMetaData(...args) {
  let func, deps, key;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg == 'function') {
      func = arg;
    } else if (typeof arg == 'string') {
      key = arg;
    } else {
      deps = arg;
    }
  }
  devAssert(func);
  return setMetaData(func, deps, key);
}

/**
 * Returns the dependencies attached to the component function. If none
 * available, defaults to an empty array.
 *
 * @param {function(...?):?} func
 * @return {!Array<!ContextProp>}
 * @package
 */
export function getDeps(func) {
  return func['deps'] || EMPTY_DEPS;
}

/**
 * Returns the component's ID. If none is available, defaults to the function's
 * identity.
 *
 * @param {function(...?):?} func
 * @return {*}
 * @package
 */
export function getId(func) {
  return func['key'] || func;
}

/**
 * @param {!Function} func
 * @param {!Array<!ContextProp>|undefined} deps
 * @param {string|undefined} key
 * @return {function(...?):?}
 */
function setMetaData(func, deps, key) {
  if (deps) {
    func['deps'] = deps;
  }
  if (key) {
    func['key'] = key;
  }
  return func;
}
