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
 * Returns the value of the property referenced by dot-separated keys.
 * e.g.
 * `getPath({a: {b: [{c: 2}]}}, 'a.b[0].c') === 2`
 *
 * @param {*} obj a map-like value
 * @param {string} path a dot-separated list of keys to reference a value
 * @return {*}
 */
export function getPath(obj, path) {
  const arrayIndexRe = /\[(\d+)\]/g;
  const keys = path.replace(arrayIndexRe, '.$1').split('.');
  let value = obj;
  for (let i = 0; i < keys.length; i++) {
    if (!hasOwn(value, keys[i])) {
      throw new Error(`Cannot find property ${keys[i]} in path ${path}.`);
    }
    value = value[keys[i]];
  }
  return value;
}
