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
  return (
    /** @type {?JsonObject} */
    JSON.parse(json)
  );
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
    opt_onFailed == null ? void 0 : opt_onFailed(e);
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
export function deepEquals(a, b, depth) {
  if (depth === void 0) {
    depth = 5;
  }

  if (!isFinite(depth) || depth < 0) {
    throw new Error('Invalid depth: ' + depth);
  }

  if (a === b) {
    return true;
  }

  /** @type {!Array<{a: JSONValueDef, b: JSONValueDef, depth: number}>} */
  var queue = [{
    a: a,
    b: b,
    depth: depth
  }];

  while (queue.length > 0) {
    var _queue$shift = queue.shift(),
        _a = _queue$shift.a,
        _b = _queue$shift.b,
        _depth = _queue$shift.depth;

    // Only check deep equality if depth > 0.
    if (_depth > 0) {
      if (typeof _a !== typeof _b) {
        return false;
      } else if (isArray(_a) && isArray(_b)) {
        if (_a.length !== _b.length) {
          return false;
        }

        for (var i = 0; i < _a.length; i++) {
          queue.push({
            a: _a[i],
            b: _b[i],
            depth: _depth - 1
          });
        }

        continue;
      } else if (_a && _b && typeof _a === 'object' && typeof _b === 'object') {
        var keysA = Object.keys(_a);
        var keysB = Object.keys(_b);

        if (keysA.length !== keysB.length) {
          return false;
        }

        for (var _i = 0, _keysA = keysA; _i < _keysA.length; _i++) {
          var k = _keysA[_i];
          queue.push({
            a: _a[k],
            b: _b[k],
            depth: _depth - 1
          });
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
  return (
    /** @type {!JsonObject} */
    obj
  );
}

/**
 * This converts an Object into a suitable type to be used in `includeJsonLiteral`.
 * This doesn't actually do any conversion, it only changes the closure type.
 *
 * @param {?JSONValueDef} value
 * @return {!InternalJsonLiteralTypeDef}
 */
export function jsonLiteral(value) {
  return (
    /** @type {!InternalJsonLiteralTypeDef} */
    value
  );
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzb24uanMiXSwibmFtZXMiOlsiaXNBcnJheSIsIkpTT05TY2FsYXJEZWYiLCJKU09OT2JqZWN0RGVmIiwiSlNPTkFycmF5RGVmIiwiSlNPTlZhbHVlRGVmIiwiSW50ZXJuYWxKc29uTGl0ZXJhbFR5cGVEZWYiLCJwYXJzZUpzb24iLCJqc29uIiwiSlNPTiIsInBhcnNlIiwidHJ5UGFyc2VKc29uIiwib3B0X29uRmFpbGVkIiwiZSIsImRlZXBFcXVhbHMiLCJhIiwiYiIsImRlcHRoIiwiaXNGaW5pdGUiLCJFcnJvciIsInF1ZXVlIiwibGVuZ3RoIiwic2hpZnQiLCJpIiwicHVzaCIsImtleXNBIiwiT2JqZWN0Iiwia2V5cyIsImtleXNCIiwiayIsImpzb25Db25maWd1cmF0aW9uIiwib2JqIiwianNvbkxpdGVyYWwiLCJ2YWx1ZSIsImluY2x1ZGVKc29uTGl0ZXJhbCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsT0FBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxhQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsYUFBSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlDLFlBQUo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxZQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsMEJBQUo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLFNBQVQsQ0FBbUJDLElBQW5CLEVBQXlCO0FBQzlCO0FBQU87QUFBNEJDLElBQUFBLElBQUksQ0FBQ0MsS0FBTCxDQUFXRixJQUFYO0FBQW5DO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFD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QUVBLEVBQUMsQ0FBQ2EsQ0FBRCxDQUFkO0FBQW1CWixZQUFBQSxLQUFLLEVBQUVBLE1BQUssR0FBRztBQUFsQyxXQUFYO0FBQ0Q7O0FBQ0Q7QUFDRDtBQUNGOztBQUNEO0FBQ0EsUUFBSUYsRUFBQyxLQUFLQyxFQUFWLEVBQWE7QUFDWCxhQUFPLEtBQVA7QUFDRDtBQUNGOztBQUNELFNBQU8sSUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNjLGlCQUFULENBQTJCQyxHQUEzQixFQUFnQztBQUNyQztBQUFPO0FBQTRCQSxJQUFBQTtBQUFuQztBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxXQUFULENBQXFCQyxLQUFyQixFQUE0QjtBQUNqQztBQUFPO0FBQTRDQSxJQUFBQTtBQUFuRDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxrQkFBVCxDQUE0QkQsS0FBNUIsRUFBbUM7QUFDeEMsU0FBT0EsS0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7aXNBcnJheX0gZnJvbSAnI2NvcmUvdHlwZXMvYXJyYXknO1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBtb2R1bGUgZGVjbGFyZXMgSlNPTiB0eXBlcyBhcyBkZWZpbmVkIGluIHRoZVxuICoge0BsaW5rIGh0dHA6Ly9qc29uLm9yZy99LlxuICovXG5cbi8vIE5PVEUgVHlwZSBhcmUgY2hhbmdlZCB0byB7Kn0gYmVjYXVzZSBvZlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWNvbXBpbGVyL2lzc3Vlcy8xOTk5XG5cbi8qKlxuICogSlNPTiBzY2FsYXIuIEl0J3MgZWl0aGVyIHN0cmluZywgbnVtYmVyIG9yIGJvb2xlYW4uXG4gKiBAdHlwZWRlZiB7c3RyaW5nfG51bWJlcnxib29sZWFufG51bGx9XG4gKi9cbmxldCBKU09OU2NhbGFyRGVmO1xuXG4vKipcbiAqIEpTT04gb2JqZWN0LiBJdCdzIGEgbWFwIHdpdGggc3RyaW5nIGtleXMgYW5kIEpTT04gdmFsdWVzLlxuICogQHR5cGVkZWYgeyFPYmplY3Q8c3RyaW5nLCA/Kj59ICgqIHNob3VsZCBiZSBKU09OVmFsdWVEZWYpXG4gKi9cbmxldCBKU09OT2JqZWN0RGVmO1xuXG4vKipcbiAqIEpTT04gYXJyYXkuIEl0J3MgYW4gYXJyYXkgd2l0aCBKU09OIHZhbHVlcy5cbiAqIEB0eXBlZGVmIHshQXJyYXk8Pyo+fSAoKiBzaG91bGQgYmUgSlNPTlZhbHVlRGVmKVxuICovXG5sZXQgSlNPTkFycmF5RGVmO1xuXG4vKipcbiAqIEpTT04gdmFsdWUuIEl0J3MgZWl0aGVyIGEgc2NhbGFyLCBhbiBvYmplY3Qgb3IgYW4gYXJyYXkuXG4gKiBAdHlwZWRlZiB7IUpTT05TY2FsYXJEZWZ8IUpTT05PYmplY3REZWZ8IUpTT05BcnJheURlZn1cbiAqL1xubGV0IEpTT05WYWx1ZURlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBZT1VfTVVTVF9VU0U6IHN0cmluZyxcbiAqICAganNvbkxpdGVyYWw6IGZ1bmN0aW9uKCksXG4gKiAgIFRPX01BS0VfVEhJU19UWVBFOiBzdHJpbmcsXG4gKiB9fVxuICovXG5sZXQgSW50ZXJuYWxKc29uTGl0ZXJhbFR5cGVEZWY7XG5cbi8qKlxuICogU2ltcGxlIHdyYXBwZXIgYXJvdW5kIEpTT04ucGFyc2UgdGhhdCBjYXN0cyB0aGUgcmV0dXJuIHZhbHVlXG4gKiB0byBKc29uT2JqZWN0LlxuICogQ3JlYXRlIGEgbmV3IHdyYXBwZXIgaWYgYW4gYXJyYXkgcmV0dXJuIHZhbHVlIGlzIGRlc2lyZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30ganNvbiBKU09OIHN0cmluZyB0byBwYXJzZVxuICogQHJldHVybiB7P0pzb25PYmplY3R9IE1heSBiZSBleHRlbmQgdG8gcGFyc2UgYXJyYXlzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKc29uKGpzb24pIHtcbiAgcmV0dXJuIC8qKiBAdHlwZSB7P0pzb25PYmplY3R9ICovIChKU09OLnBhcnNlKGpzb24pKTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIGdpdmVuIGBqc29uYCBzdHJpbmcgd2l0aG91dCB0aHJvd2luZyBhbiBleGNlcHRpb24gaWYgbm90IHZhbGlkLlxuICogUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBwYXJzaW5nIGZhaWxzLlxuICogUmV0dXJucyB0aGUgYE9iamVjdGAgY29ycmVzcG9uZGluZyB0byB0aGUgSlNPTiBzdHJpbmcgd2hlbiBwYXJzaW5nIHN1Y2NlZWRzLlxuICogQHBhcmFtIHtzdHJpbmd9IGpzb24gSlNPTiBzdHJpbmcgdG8gcGFyc2VcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oIUVycm9yKT19IG9wdF9vbkZhaWxlZCBPcHRpb25hbCBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkXG4gKiAgICAgd2l0aCB0aGUgZXJyb3IgaWYgcGFyc2luZyBmYWlscy5cbiAqIEByZXR1cm4gez9Kc29uT2JqZWN0fSBNYXkgYmUgZXh0ZW5kIHRvIHBhcnNlIGFycmF5cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeVBhcnNlSnNvbihqc29uLCBvcHRfb25GYWlsZWQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcGFyc2VKc29uKGpzb24pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgb3B0X29uRmFpbGVkPy4oZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWVwbHkgY2hlY2tzIHN0cmljdCBlcXVhbGl0eSBvZiBpdGVtcyBpbiBuZXN0ZWQgYXJyYXlzIGFuZCBvYmplY3RzLlxuICpcbiAqIEBwYXJhbSB7SlNPTlZhbHVlRGVmfSBhXG4gKiBAcGFyYW0ge0pTT05WYWx1ZURlZn0gYlxuICogQHBhcmFtIHtudW1iZXJ9IGRlcHRoIFRoZSBtYXhpbXVtIGRlcHRoLiBNdXN0IGJlIGZpbml0ZS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgZGVwdGggYXJndW1lbnQgaXMgbm90IGZpbml0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZXBFcXVhbHMoYSwgYiwgZGVwdGggPSA1KSB7XG4gIGlmICghaXNGaW5pdGUoZGVwdGgpIHx8IGRlcHRoIDwgMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkZXB0aDogJyArIGRlcHRoKTtcbiAgfVxuICBpZiAoYSA9PT0gYikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIC8qKiBAdHlwZSB7IUFycmF5PHthOiBKU09OVmFsdWVEZWYsIGI6IEpTT05WYWx1ZURlZiwgZGVwdGg6IG51bWJlcn0+fSAqL1xuICBjb25zdCBxdWV1ZSA9IFt7YSwgYiwgZGVwdGh9XTtcbiAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCB7YSwgYiwgZGVwdGh9ID0gcXVldWUuc2hpZnQoKTtcbiAgICAvLyBPbmx5IGNoZWNrIGRlZXAgZXF1YWxpdHkgaWYgZGVwdGggPiAwLlxuICAgIGlmIChkZXB0aCA+IDApIHtcbiAgICAgIGlmICh0eXBlb2YgYSAhPT0gdHlwZW9mIGIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGEpICYmIGlzQXJyYXkoYikpIHtcbiAgICAgICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBxdWV1ZS5wdXNoKHthOiBhW2ldLCBiOiBiW2ldLCBkZXB0aDogZGVwdGggLSAxfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKGEgJiYgYiAmJiB0eXBlb2YgYSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IGtleXNBID0gT2JqZWN0LmtleXMoYSk7XG4gICAgICAgIGNvbnN0IGtleXNCID0gT2JqZWN0LmtleXMoYik7XG4gICAgICAgIGlmIChrZXlzQS5sZW5ndGggIT09IGtleXNCLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2Yga2V5c0EpIHtcbiAgICAgICAgICBxdWV1ZS5wdXNoKHthOiBhW2tdLCBiOiBiW2tdLCBkZXB0aDogZGVwdGggLSAxfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIElmIHdlIGdldCBoZXJlLCB0aGVuIGRlcHRoID09IDAgb3IgKGEsIGIpIGFyZSBwcmltaXRpdmVzLlxuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIGhhbmRsZXMgY29uZmlndXJhdGlvbnMgc3BlY2lmaWVkIGluIGEgSlNPTiBmb3JtYXQuXG4gKlxuICogSXQgYWxsb3dzIHRoZSBjb25maWd1cmF0aW9uIGlzIHRvIGJlIHdyaXR0ZW4gaW4gcGxhaW4gSlMgKHdoaWNoIGhhcyBiZXR0ZXJcbiAqIGRldiBlcmdvbm9taWNzIGxpa2UgY29tbWVudHMgYW5kIHRyYWlsaW5nIGNvbW1hcyksIGFuZCBhbGxvd3MgdGhlXG4gKiBjb25maWd1cmF0aW9uIHRvIGJlIHRyYW5zZm9ybWVkIGludG8gYW4gZWZmaWNpZW50IEpTT04tcGFyc2VkIHJlcHJlc2VudGF0aW9uXG4gKiBpbiB0aGUgZGlzdCBidWlsZC4gU2VlIGh0dHBzOi8vdjguZGV2L2Jsb2cvY29zdC1vZi1qYXZhc2NyaXB0LTIwMTkjanNvblxuICpcbiAqIEBwYXJhbSB7IU9iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHshSnNvbk9iamVjdH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpzb25Db25maWd1cmF0aW9uKG9iaikge1xuICByZXR1cm4gLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKG9iaik7XG59XG5cbi8qKlxuICogVGhpcyBjb252ZXJ0cyBhbiBPYmplY3QgaW50byBhIHN1aXRhYmxlIHR5cGUgdG8gYmUgdXNlZCBpbiBgaW5jbHVkZUpzb25MaXRlcmFsYC5cbiAqIFRoaXMgZG9lc24ndCBhY3R1YWxseSBkbyBhbnkgY29udmVyc2lvbiwgaXQgb25seSBjaGFuZ2VzIHRoZSBjbG9zdXJlIHR5cGUuXG4gKlxuICogQHBhcmFtIHs/SlNPTlZhbHVlRGVmfSB2YWx1ZVxuICogQHJldHVybiB7IUludGVybmFsSnNvbkxpdGVyYWxUeXBlRGVmfVxuICovXG5leHBvcnQgZnVuY3Rpb24ganNvbkxpdGVyYWwodmFsdWUpIHtcbiAgcmV0dXJuIC8qKiBAdHlwZSB7IUludGVybmFsSnNvbkxpdGVyYWxUeXBlRGVmfSAqLyAodmFsdWUpO1xufVxuXG4vKipcbiAqIEFsbG93cyBpbmNsdXNpb24gb2YgYSB2YXJpYWJsZSAodGhhdCdzIHdyYXBwZWQgaW4gYSBqc29uTGl0ZXJhbFxuICogY2FsbCkgdG8gYmUgaW5jbHVkZWQgaW5zaWRlIGEganNvbkNvbmZpZ3VyYXRpb24uXG4gKlxuICogQHBhcmFtIHshSW50ZXJuYWxKc29uTGl0ZXJhbFR5cGVEZWZ9IHZhbHVlXG4gKiBAcmV0dXJuIHsqfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5jbHVkZUpzb25MaXRlcmFsKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/types/object/json.js