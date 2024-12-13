import {isArray} from '#core/types/array';

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
let JSONScalarDef;

/**
 * JSON object. It's a map with string keys and JSON values.
 * @typedef {{[key: string]: ?*}} (* should be JSONValueDef)
 */
let JSONObjectDef;

/**
 * JSON array. It's an array with JSON values.
 * @typedef {Array<?*>} (* should be JSONValueDef)
 */
let JSONArrayDef;

/**
 * JSON value. It's either a scalar, an object or an array.
 * @typedef {JSONScalarDef|JSONObjectDef|JSONArrayDef}
 */
let JSONValueDef;

/**
 * @typedef {{
 *   YOU_MUST_USE: string,
 *   jsonLiteral: function():InternalJsonLiteralTypeDef,
 *   TO_MAKE_THIS_TYPE: string,
 * }} InternalJsonLiteralTypeDef
 */

/**
 * Simple wrapper around JSON.parse that casts the return value
 * to JsonObject.
 * Create a new wrapper if an array return value is desired.
 * @param {string} json JSON string to parse
 * @return {?JsonObject} May be extend to parse arrays.
 */
export function parseJson(json) {
  return /** @type {?JsonObject} */ (JSON.parse(json));
}

/**
 * Parses the given `json` string without throwing an exception if not valid.
 * Returns `undefined` if parsing fails.
 * Returns the `Object` corresponding to the JSON string when parsing succeeds.
 * @param {string} json JSON string to parse
 * @param {function(Error)=} opt_onFailed Optional function that will be called
 *     with the error if parsing fails.
 * @return {?JsonObject} May be extend to parse arrays.
 */
export function tryParseJson(json, opt_onFailed) {
  try {
    return parseJson(json);
  } catch (e) {
    opt_onFailed?.(e);
    return null;
  }
}

/** @typedef {{a: JSONValueDef, b: JSONValueDef, depth: number}} DeepEqTuple */

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

  /** @type {DeepEqTuple[]} */
  const queue = [{a, b, depth}];
  while (queue.length > 0) {
    const {a, b, depth} = /** @type {DeepEqTuple} */ (queue.shift());
    // Only check deep equality if depth > 0.
    if (depth > 0) {
      if (typeof a !== typeof b) {
        return false;
      } else if (isArray(a) && isArray(b)) {
        if (a.length !== b.length) {
          return false;
        }
        for (let i = 0; i < a.length; i++) {
          queue.push({a: a[i], b: b[i], depth: depth - 1});
        }
        continue;
      } else if (a && b && typeof a === 'object' && typeof b === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) {
          return false;
        }
        for (const k of keysA) {
          queue.push({
            a: /** @type {*} */ (a)[k],
            b: /** @type {*} */ (b)[k],
            depth: depth - 1,
          });
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
 * This helper function handles configurations specified in a JSON format.
 *
 * It allows the configuration is to be written in plain JS (which has better
 * dev ergonomics like comments and trailing commas), and allows the
 * configuration to be transformed into an efficient JSON-parsed representation
 * in the dist build. See https://v8.dev/blog/cost-of-javascript-2019#json
 *
 * @param {object} obj
 * @return {JsonObject}
 */
export function jsonConfiguration(obj) {
  return /** @type {JsonObject} */ (obj);
}

/**
 * This converts an Object into a suitable type to be used in `includeJsonLiteral`.
 * This doesn't actually do any conversion, it only changes the closure type.
 *
 * @param {?JSONValueDef} value
 * @return {InternalJsonLiteralTypeDef}
 */
export function jsonLiteral(value) {
  return /** @type {InternalJsonLiteralTypeDef} */ (value);
}

/**
 * Allows inclusion of a variable (that's wrapped in a jsonLiteral
 * call) to be included inside a jsonConfiguration.
 *
 * @param {InternalJsonLiteralTypeDef} value
 * @return {*}
 */
export function includeJsonLiteral(value) {
  return value;
}
