function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);} /**
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

import { isArray } from "../array";

/**
 * @fileoverview This module declares JSON types as defined in the
 * {@link http://json.org/}.
 */

// NOTE Type are changed to {*} because of
// https://github.com/google/closure-compiler/issues/1999

/**
 * JSON scalar. It's either string, number or boolean.
 * @typedef {string|number|boolean|null}
 */
var JSONScalarDef;

/**
 * JSON object. It's a map with string keys and JSON values.
 * @typedef {!Object<string, ?*>} (* should be JSONValueDef)
 */
var JSONObjectDef;

/**
 * JSON array. It's an array with JSON values.
 * @typedef {!Array<?*>} (* should be JSONValueDef)
 */
var JSONArrayDef;

/**
 * JSON value. It's either a scalar, an object or an array.
 * @typedef {!JSONScalarDef|!JSONObjectDef|!JSONArrayDef}
 */
var JSONValueDef;

/**
 * @typedef {{
 *   YOU_MUST_USE: string,
 *   jsonLiteral: function(),
 *   TO_MAKE_THIS_TYPE: string,
 * }}
 */
var InternalJsonLiteralTypeDef;

/**
 * Simple wrapper around JSON.parse that casts the return value
 * to JsonObject.
 * Create a new wrapper if an array return value is desired.
 * @param {string} json JSON string to parse
 * @return {?JsonObject} May be extend to parse arrays.
 */
export function parseJson(json) {
  return (/** @type {?JsonObject} */(JSON.parse(json)));
}

/**
 * Parses the given `json` string without throwing an exception if not valid.
 * Returns `undefined` if parsing fails.
 * Returns the `Object` corresponding to the JSON string when parsing succeeds.
 * @param {string} json JSON string to parse
 * @param {function(!Error)=} opt_onFailed Optional function that will be called
 *     with the error if parsing fails.
 * @return {?JsonObject} May be extend to parse arrays.
 */
export function tryParseJson(json, opt_onFailed) {
  try {
    return parseJson(json);
  } catch (e) {
    (opt_onFailed === null || opt_onFailed === void 0) ? (void 0) : opt_onFailed(e);
    return null;
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
export function deepEquals(a, b) {var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
  if (!isFinite(depth) || depth < 0) {
    throw new Error('Invalid depth: ' + depth);
  }
  if (a === b) {
    return true;
  }
  /** @type {!Array<{a: JSONValueDef, b: JSONValueDef, depth: number}>} */
  var queue = [{ a: a, b: b, depth: depth }];
  while (queue.length > 0) {
    var _queue$shift = queue.shift(),_a = _queue$shift.a,_b = _queue$shift.b,_depth = _queue$shift.depth;
    // Only check deep equality if depth > 0.
    if (_depth > 0) {
      if (_typeof(_a) !== _typeof(_b)) {
        return false;
      } else if (isArray(_a) && isArray(_b)) {
        if (_a.length !== _b.length) {
          return false;
        }
        for (var i = 0; i < _a.length; i++) {
          queue.push({ a: _a[i], b: _b[i], depth: _depth - 1 });
        }
        continue;
      } else if (_a && _b && _typeof(_a) === 'object' && _typeof(_b) === 'object') {
        var keysA = Object.keys(_a);
        var keysB = Object.keys(_b);
        if (keysA.length !== keysB.length) {
          return false;
        }
        for (var _i = 0, _keysA = keysA; _i < _keysA.length; _i++) {var k = _keysA[_i];
          queue.push({ a: _a[k], b: _b[k], depth: _depth - 1 });
        }
        continue;
      }
    }
    // If we get here, then depth == 0 or (a, b) are primitives.
    if (_a !== _b) {
      return false;
    }
  }
  return true;
}

/**
 * This helper function handles configurations specified in a JSON format.
 *
 * It allows the configuration is to be written in plain JS (which has better
 * dev ergonomics like comments and trailing commas), and allows the
 * configuration to be transformed into an efficient JSON-parsed representation
 * in the dist build. See https://v8.dev/blog/cost-of-javascript-2019#json
 *
 * @param {!Object} obj
 * @return {!JsonObject}
 */
export function jsonConfiguration(obj) {
  return (/** @type {!JsonObject} */(obj));
}

/**
 * This converts an Object into a suitable type to be used in `includeJsonLiteral`.
 * This doesn't actually do any conversion, it only changes the closure type.
 *
 * @param {?JSONValueDef} value
 * @return {!InternalJsonLiteralTypeDef}
 */
export function jsonLiteral(value) {
  return (/** @type {!InternalJsonLiteralTypeDef} */(value));
}

/**
 * Allows inclusion of a variable (that's wrapped in a jsonLiteral
 * call) to be included inside a jsonConfiguration.
 *
 * @param {!InternalJsonLiteralTypeDef} value
 * @return {*}
 */
export function includeJsonLiteral(value) {
  return value;
}
// /Users/mszylkowski/src/amphtml/src/core/types/object/json.js