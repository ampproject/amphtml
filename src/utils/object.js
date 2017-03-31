/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {isObject} from '../types';

/* @const */
const hasOwn_ = Object.prototype.hasOwnProperty;

/**
 * Returns a map-like object.
 * If opt_initial is provided, copies its own properties into the
 * newly created object.
 * @param {T=} opt_initial This should typically be an object literal.
 * @return {T}
 * @template T
 */
export function map(opt_initial) {
  const obj = Object.create(null);
  if (opt_initial) {
    Object.assign(obj, opt_initial);
  }
  return obj;
}

/**
 * Checks if the given key is a property in the map.
 *
 * @param {T}  obj a map like property.
 * @param {string}  key
 * @return {boolean}
 * @template T
 */
export function hasOwn(obj, key) {
  return hasOwn_.call(obj, key);
}

/**
 * @param {!Object} target
 * @param {!Object} source
 * @param {number} currentDepth
 * @param {number} maxDepth The maximum depth for deep merge, beyond which
 *    Object.assign will be used.
 * @return {!Object}
 */
function deepMerge_(target, source, currentDepth, maxDepth) {
  if (currentDepth > maxDepth) {
    Object.assign(target, source);
    return target;
  }
  Object.keys(source).forEach(key => {
    const newValue = source[key];
    // Perform a deep merge IFF both a and b have the same property and
    // the properties on both a and b are non-null plain objects
    if (hasOwn(target, key)) {
      const oldValue = target[key];
      if (isObject(newValue) && isObject(oldValue)) {
        target[key] = deepMerge_(
            oldValue,
            newValue,
            currentDepth + 1,
            maxDepth);
        return;
      }
    }
    target[key] = newValue;
  });
  return target;
}

/**
 * Deep merge object b into object a. Both a and b can only contain
 * primitives, arrays, and plain objects. For any conflicts, object b wins.
 * Arrays are replaced, not merged. Plain objects are recursively merged.
 * @param {!Object} target
 * @param {!Object} source
 * @param {number|undefined=} opt_maxDepth The maximum depth for deep merge,
 *     beyond which Object.assign will be used.
 * @return {!Object}
 */
export function deepMerge(target, source, opt_maxDepth) {
  return deepMerge_(
      target,
      source,
      /* currentDepth */ 0,
      opt_maxDepth || Number.POSITIVE_INFINITY);
}
