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

/**
 * @fileoverview This module declares JSON types as defined in the
 * {@link http://json.org/}.
 */

import {childElementsByTag, isJsonScriptTag} from './dom';
import {isObject} from './types';

// NOTE Type are changed to {*} because of
// https://github.com/google/closure-compiler/issues/1999

/**
 * JSON scalar. It's either string, number or boolean.
 * @typedef {*} should be string|number|boolean
 */
let JSONScalarDef;

/**
 * JSON object. It's a map with string keys and JSON values.
 * @typedef {*} should be !Object<string, ?JSONValueDef>
 */
let JSONObjectDef;

/**
 * JSON array. It's an array with JSON values.
 * @typedef {*} should be !Array<?JSONValueDef>
 */
let JSONArrayDef;

/**
 * JSON value. It's either a scalar, an object or an array.
 * @typedef {*} should be !JSONScalarDef|!JSONObjectDef|!JSONArrayDef
 */
let JSONValueDef;

/**
 * Recreates objects with prototype-less copies.
 * @param {!JsonObject} obj
 * @return {!JsonObject}
 */
export function recreateNonProtoObject(obj) {
  const copy = Object.create(null);
  for (const k in obj) {
    if (!hasOwnProperty(obj, k)) {
      continue;
    }
    const v = obj[k];
    copy[k] = isObject(v) ? recreateNonProtoObject(v) : v;
  }
  return /** @type {!JsonObject} */ (copy);
}

/**
 * Returns a value from an object for a field-based expression. The expression
 * is a simple nested dot-notation of fields, such as `field1.field2`. If any
 * field in a chain does not exist or is not an object or array, the returned
 * value will be `undefined`.
 *
 * @param {!JsonObject} obj
 * @param {string} expr
 * @return {*}
 */
export function getValueForExpr(obj, expr) {
  // The `.` indicates "the object itself".
  if (expr == '.') {
    return obj;
  }
  // Otherwise, navigate via properties.
  const parts = expr.split('.');
  let value = obj;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (
      part &&
      value &&
      value[part] !== undefined &&
      hasOwnProperty(value, part)
    ) {
      value = value[part];
      continue;
    }
    value = undefined;
    break;
  }
  return value;
}

/**
 * Simple wrapper around JSON.parse that casts the return value
 * to JsonObject.
 * Create a new wrapper if an array return value is desired.
 * @param {*} json JSON string to parse
 * @return {?JsonObject} May be extend to parse arrays.
 */
export function parseJson(json) {
  return /** @type {?JsonObject} */ (JSON.parse(/** @type {string} */ (json)));
}

/**
 * Parses the given `json` string without throwing an exception if not valid.
 * Returns `undefined` if parsing fails.
 * Returns the `Object` corresponding to the JSON string when parsing succeeds.
 * @param {*} json JSON string to parse
 * @param {function(!Error)=} opt_onFailed Optional function that will be called
 *     with the error if parsing fails.
 * @return {?JsonObject} May be extend to parse arrays.
 */
export function tryParseJson(json, opt_onFailed) {
  try {
    return parseJson(json);
  } catch (e) {
    if (opt_onFailed) {
      opt_onFailed(e);
    }
    return null;
  }
}

/**
 * Helper method to get the json config from an element <script> tag
 * @param {!Element} element
 * @return {?JsonObject}
 * @throws {!Error} If element does not have exactly one <script> child
 * with type="application/json", or if the <script> contents are not valid JSON.
 */
export function getChildJsonConfig(element) {
  const scripts = childElementsByTag(element, 'script');
  const n = scripts.length;
  if (n !== 1) {
    throw new Error(`Found ${scripts.length} <script> children. Expected 1.`);
  }
  const script = scripts[0];
  if (!isJsonScriptTag(script)) {
    throw new Error('<script> child must have type="application/json"');
  }
  try {
    return parseJson(script.textContent);
  } catch (unusedError) {
    throw new Error('Failed to parse <script> contents. Is it valid JSON?');
  }
}

/**
 * Deeply checks strict equality of items in nested arrays and objects.
 *
 * @param {JSONValueDef} a
 * @param {JSONValueDef} b
 * @param {number} depth The maximum depth. Must be finite.
 * @return {boolean}
 * @throws {Error} If depth argument is not finite.
 */
export function deepEquals(a, b, depth = 5) {
  if (!isFinite(depth) || depth < 0) {
    throw new Error('Invalid depth: ' + depth);
  }
  if (a === b) {
    return true;
  }
  /** @type {!Array<{a: JSONValueDef, b: JSONValueDef, depth: number}>} */
  const queue = [{a, b, depth}];
  while (queue.length > 0) {
    const {a, b, depth} = queue.shift();
    // Only check deep equality if depth > 0.
    if (depth > 0) {
      if (typeof a !== typeof b) {
        return false;
      } else if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
          return false;
        }
        for (let i = 0; i < a.length; i++) {
          queue.push({a: a[i], b: b[i], depth: depth - 1});
        }
        continue;
      } else if (a && b && typeof a === 'object' && typeof b === 'object') {
        const keysA = Object.keys(/** @type {!Object} */ (a));
        const keysB = Object.keys(/** @type {!Object} */ (b));
        if (keysA.length !== keysB.length) {
          return false;
        }
        for (let i = 0; i < keysA.length; i++) {
          const k = keysA[i];
          queue.push({a: a[k], b: b[k], depth: depth - 1});
        }
        continue;
      }
    }
    // If we get here, then depth == 0 or (a, b) are primitives.
    if (a !== b) {
      return false;
    }
  }
  return true;
}

/**
 * @param {*} obj
 * @param {string} key
 * @return {boolean}
 */
function hasOwnProperty(obj, key) {
  if (obj == null || typeof obj != 'object') {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(
    /** @type {!Object} */ (obj),
    key
  );
}
