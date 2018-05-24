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
 * Creates a function that is evaluated only once and returns the cached result
 * subsequently.
 *
 * Please note that `once` only takes the function definition into account,
 * so it will return the same cached value even when the arguments are
 * different.
 *
 * @param {function(...):(T|undefined)} fn
 * @return {function(...):(T|undefined)}
 * @template T
 * @suppress {checkTypes} Compiler complains about "fn = null" for GC.
 */
export function once(fn) {
  let evaluated = false;
  let retValue = null;
  return (...args) => {
    if (!evaluated) {
      retValue = fn.apply(self, args);
      evaluated = true;
      fn = null; // GC
    }
    return retValue;
  };
}
