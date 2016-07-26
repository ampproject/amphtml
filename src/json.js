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

import {isObject} from './types';


/**
 * JSON scalar. It's either string, number or boolean.
 * @typedef {string|number|boolean}
 */
let JSONScalarDef;


/**
 * JSON object. It's a map with string keys and JSON values.
 * @typedef {!Object<string, ?JSONValueDef>}
 */
let JSONObjectDef;


/**
 * JSON array. It's an array with JSON values.
 * @typedef {!Array<?JSONValueDef>}
 */
let JSONArrayDef;


/**
 * JSON value. It's either a scalar, an object or an array.
 * @typedef {!JSONScalarDef|!JSONObjectDef|!JSONArrayDef}
 */
let JSONValueDef;


/**
 * Recreates objects with prototype-less copies.
 * @param {!JSONObjectDef} obj
 * @return {!JSONObjectDef}
 */
export function recreateNonProtoObject(obj) {
  const copy = Object.create(null);
  for (const k in obj) {
    if (!obj.hasOwnProperty(k)) {
      continue;
    }
    const v = obj[k];
    copy[k] = isObject(v) ? recreateNonProtoObject(v) : v;
  }
  return copy;
}


/**
 * Returns a value from an object for a field-based expression. The expression
 * is a simple nested dot-notation of fields, such as `field1.field2`. If any
 * field in a chain does not exist or is not an object, the returned value will
 * be `undefined`.
 *
 * @param {!JSONObjectDef} obj
 * @param {string} expr
 * @return {?JSONValueDef|undefined}
 */
export function getValueForExpr(obj, expr) {
  const parts = expr.split('.');
  let value = obj;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) {
      value = undefined;
      break;
    }
    if (!isObject(value) ||
            value[part] === undefined ||
            value.hasOwnProperty && !value.hasOwnProperty(part)) {
      value = undefined;
      break;
    }
    value = value[part];
  }
  return value;
}

/**
 * Parses the given `json` string without throwing an exception if not valid.
 * Returns `undefined` if parsing fails.
 * Returns the `Object` corresponding to the JSON string when parsing succeeds.
 * @param {string} json JSON string to parse
 * @param {function(!Error)=} opt_onFailed Optional function that will be called with
 *     the error if parsing fails.
 * @return {?JSONValueDef|undefined}
 */
export function tryParseJson(json, opt_onFailed) {
  try {
    return JSON.parse(json);
  } catch (e) {
    if (opt_onFailed) {
      opt_onFailed(e);
    }
    return undefined;
  }
}
