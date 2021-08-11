function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
var _Object$prototype = Object.prototype,
    hasOwn_ = _Object$prototype.hasOwnProperty,
    toString_ = _Object$prototype.toString;

/**
 * Determines if value is actually an Object.
 * @param {*} value
 * @return {boolean}
 */
export function isObject(value) {
  return toString_.call(value) === '[object Object]';
}

/**
 * Returns a map-like object.
 * If opt_initial is provided, copies its own properties into the
 * newly created object.
 * @param {T=} opt_initial This should typically be an object literal.
 * @return {T}
 * @template T
 */
export function map(opt_initial) {
  var obj = Object.create(null);

  if (opt_initial) {
    Object.assign(obj, opt_initial);
  }

  return obj;
}

/**
 * Return an empty JsonObject or makes the passed in object literal
 * an JsonObject.
 * The JsonObject type is just a simple object that is at-dict.
 * See
 * https://github.com/google/closure-compiler/wiki/@struct-and-@dict-Annotations
 * for what a dict is type-wise.
 * The linter enforces that the argument is, in fact, at-dict like.
 * @param {!Object=} opt_initial
 * @return {!JsonObject}
 */
export function dict(opt_initial) {
  // We do not copy. The linter enforces that the passed in object is a literal
  // and thus the caller cannot have a reference to it.
  return (
    /** @type {!JsonObject} */
    opt_initial || {}
  );
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
 * Returns obj[key] iff key is obj's own property (is not inherited).
 * Otherwise, returns undefined.
 *
 * @param {Object} obj
 * @param {string} key
 * @return {*}
 */
export function ownProperty(obj, key) {
  if (hasOwn(obj, key)) {
    return obj[key];
  } else {
    return undefined;
  }
}

/**
 * Deep merges source into target.
 *
 * @param {!Object} target
 * @param {!Object} source
 * @param {number} depth The maximum merge depth. If exceeded, Object.assign
 *                       will be used instead.
 * @return {!Object}
 * @throws {Error} If source contains a circular reference.
 * Note: Only nested objects are deep-merged, primitives and arrays are not.
 */
export function deepMerge(target, source, depth) {
  if (depth === void 0) {
    depth = 10;
  }

  // Keep track of seen objects to detect recursive references.
  var seen = [];

  /** @type {!Array<{t: !Object, s: !Object, d: number}>} */
  var queue = [];
  queue.push({
    t: target,
    s: source,
    d: 0
  });

  // BFS to ensure objects don't have recursive references at shallower depths.
  while (queue.length > 0) {
    var _queue$shift = queue.shift(),
        d = _queue$shift.d,
        s = _queue$shift.s,
        t = _queue$shift.t;

    if (seen.includes(s)) {
      throw new Error('Source object has a circular reference.');
    }

    seen.push(s);

    if (t === s) {
      continue;
    }

    if (d > depth) {
      Object.assign(t, s);
      continue;
    }

    for (var _i = 0, _Object$keys = Object.keys(s); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      var newValue = s[key];

      // Perform a deep merge IFF both target and source have the same key
      // whose corresponding values are objects.
      if (hasOwn(t, key)) {
        var oldValue = t[key];

        if (isObject(newValue) && isObject(oldValue)) {
          queue.push({
            t: oldValue,
            s: newValue,
            d: d + 1
          });
          continue;
        }
      }

      t[key] = newValue;
    }
  }

  return target;
}

/**
 * @param {!Object} o An object to remove properties from
 * @param {!Array<string>} props A list of properties to remove from the Object
 * @return {!Object} An object with the given properties removed
 */
export function omit(o, props) {
  return Object.keys(o).reduce(function (acc, key) {
    if (!props.includes(key)) {
      acc[key] = o[key];
    }

    return acc;
  }, {});
}

/**
 * @param {!Object|null|undefined} o1
 * @param {!Object|null|undefined} o2
 * @return {boolean}
 */
export function objectsEqualShallow(o1, o2) {
  if (o1 == null || o2 == null) {
    // Null is only equal to null, and undefined to undefined.
    return o1 === o2;
  }

  for (var k in o1) {
    if (o1[k] !== o2[k]) {
      return false;
    }
  }

  for (var _k in o2) {
    if (o2[_k] !== o1[_k]) {
      return false;
    }
  }

  return true;
}

/**
 * @param {T} obj
 * @param {string} prop
 * @param {function(T, string):R} factory
 * @return {R}
 * @template T,R
 */
export function memo(obj, prop, factory) {
  var result =
  /** @type {?R} */
  obj[prop];

  if (result === undefined) {
    result = factory(obj, prop);
    obj[prop] = result;
  }

  return result;
}

/**
 * Recreates objects with prototype-less copies.
 * @param {!JsonObject} obj
 * @return {!JsonObject}
 */
export function recreateNonProtoObject(obj) {
  var copy = map();

  for (var k in obj) {
    if (!hasOwn(obj, k)) {
      continue;
    }

    var v = obj[k];
    copy[k] = isObject(v) ? recreateNonProtoObject(v) : v;
  }

  return (
    /** @type {!JsonObject} */
    copy
  );
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
  var parts = expr.split('.');
  var value = obj;

  for (var _iterator = _createForOfIteratorHelperLoose(parts), _step; !(_step = _iterator()).done;) {
    var part = _step.value;

    if (part && value && value[part] !== undefined && typeof value == 'object' && hasOwn(value, part)) {
      value = value[part];
      continue;
    }

    value = undefined;
    break;
  }

  return value;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093bl8iLCJoYXNPd25Qcm9wZXJ0eSIsInRvU3RyaW5nXyIsInRvU3RyaW5nIiwiaXNPYmplY3QiLCJ2YWx1ZSIsImNhbGwiLCJtYXAiLCJvcHRfaW5pdGlhbCIsIm9iaiIsImNyZWF0ZSIsImFzc2lnbiIsImRpY3QiLCJoYXNPd24iLCJrZXkiLCJvd25Qcm9wZXJ0eSIsInVuZGVmaW5lZCIsImRlZXBNZXJnZSIsInRhcmdldCIsInNvdXJjZSIsImRlcHRoIiwic2VlbiIsInF1ZXVlIiwicHVzaCIsInQiLCJzIiwiZCIsImxlbmd0aCIsInNoaWZ0IiwiaW5jbHVkZXMiLCJFcnJvciIsImtleXMiLCJuZXdWYWx1ZSIsIm9sZFZhbHVlIiwib21pdCIsIm8iLCJwcm9wcyIsInJlZHVjZSIsImFjYyIsIm9iamVjdHNFcXVhbFNoYWxsb3ciLCJvMSIsIm8yIiwiayIsIm1lbW8iLCJwcm9wIiwiZmFjdG9yeSIsInJlc3VsdCIsInJlY3JlYXRlTm9uUHJvdG9PYmplY3QiLCJjb3B5IiwidiIsImdldFZhbHVlRm9yRXhwciIsImV4cHIiLCJwYXJ0cyIsInNwbGl0IiwicGFydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esd0JBQXVEQSxNQUFNLENBQUNDLFNBQTlEO0FBQUEsSUFBdUJDLE9BQXZCLHFCQUFPQyxjQUFQO0FBQUEsSUFBMENDLFNBQTFDLHFCQUFnQ0MsUUFBaEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsUUFBVCxDQUFrQkMsS0FBbEIsRUFBeUI7QUFDOUIsU0FBT0gsU0FBUyxDQUFDSSxJQUFWLENBQWVELEtBQWYsTUFBMEIsaUJBQWpDO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTRSxlQUFULENBQXlCekMsR0FBekIsRUFBOEIwQyxJQUE5QixFQUFvQztBQUN6QztBQUNBLE1BQUlBLElBQUksSUFBSSxHQUFaLEVBQWlCO0FBQ2YsV0FBTzFDLEdBQVA7QUFDRDs7QUFDRDtBQUNBLE1BQU0yQyxLQUFLLEdBQUdELElBQUksQ0FBQ0UsS0FBTCxDQUFXLEdBQVgsQ0FBZDtBQUNBLE1BQUloRCxLQUFLLEdBQUdJLEdBQVo7O0FBQ0EsdURBQW1CMkMsS0FBbkIsd0NBQTBCO0FBQUEsUUFBZkUsSUFBZTs7QUFDeEIsUUFDRUEsSUFBSSxJQUNKakQsS0FEQSxJQUVBQSxLQUFLLENBQUNpRCxJQUFELENBQUwsS0FBZ0J0QyxTQUZoQixJQUdBLE9BQU9YLEtBQVAsSUFBZ0IsUUFIaEIsSUFJQVEsTUFBTSxDQUFDUixLQUFELEVBQVFpRCxJQUFSLENBTFIsRUFNRTtBQUNBakQsTUFBQUEsS0FBSyxHQUFHQSxLQUFLLENBQUNpRCxJQUFELENBQWI7QUFDQTtBQUNEOztBQUNEakQsSUFBQUEsS0FBSyxHQUFHVyxTQUFSO0FBQ0E7QUFDRDs7QUFDRCxTQUFPWCxLQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyogQGNvbnN0ICovXG5jb25zdCB7aGFzT3duUHJvcGVydHk6IGhhc093bl8sIHRvU3RyaW5nOiB0b1N0cmluZ199ID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHZhbHVlIGlzIGFjdHVhbGx5IGFuIE9iamVjdC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gdG9TdHJpbmdfLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBPYmplY3RdJztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgbWFwLWxpa2Ugb2JqZWN0LlxuICogSWYgb3B0X2luaXRpYWwgaXMgcHJvdmlkZWQsIGNvcGllcyBpdHMgb3duIHByb3BlcnRpZXMgaW50byB0aGVcbiAqIG5ld2x5IGNyZWF0ZWQgb2JqZWN0LlxuICogQHBhcmFtIHtUPX0gb3B0X2luaXRpYWwgVGhpcyBzaG91bGQgdHlwaWNhbGx5IGJlIGFuIG9iamVjdCBsaXRlcmFsLlxuICogQHJldHVybiB7VH1cbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXAob3B0X2luaXRpYWwpIHtcbiAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKG9wdF9pbml0aWFsKSB7XG4gICAgT2JqZWN0LmFzc2lnbihvYmosIG9wdF9pbml0aWFsKTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIFJldHVybiBhbiBlbXB0eSBKc29uT2JqZWN0IG9yIG1ha2VzIHRoZSBwYXNzZWQgaW4gb2JqZWN0IGxpdGVyYWxcbiAqIGFuIEpzb25PYmplY3QuXG4gKiBUaGUgSnNvbk9iamVjdCB0eXBlIGlzIGp1c3QgYSBzaW1wbGUgb2JqZWN0IHRoYXQgaXMgYXQtZGljdC5cbiAqIFNlZVxuICogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWNvbXBpbGVyL3dpa2kvQHN0cnVjdC1hbmQtQGRpY3QtQW5ub3RhdGlvbnNcbiAqIGZvciB3aGF0IGEgZGljdCBpcyB0eXBlLXdpc2UuXG4gKiBUaGUgbGludGVyIGVuZm9yY2VzIHRoYXQgdGhlIGFyZ3VtZW50IGlzLCBpbiBmYWN0LCBhdC1kaWN0IGxpa2UuXG4gKiBAcGFyYW0geyFPYmplY3Q9fSBvcHRfaW5pdGlhbFxuICogQHJldHVybiB7IUpzb25PYmplY3R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaWN0KG9wdF9pbml0aWFsKSB7XG4gIC8vIFdlIGRvIG5vdCBjb3B5LiBUaGUgbGludGVyIGVuZm9yY2VzIHRoYXQgdGhlIHBhc3NlZCBpbiBvYmplY3QgaXMgYSBsaXRlcmFsXG4gIC8vIGFuZCB0aHVzIHRoZSBjYWxsZXIgY2Fubm90IGhhdmUgYSByZWZlcmVuY2UgdG8gaXQuXG4gIHJldHVybiAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAob3B0X2luaXRpYWwgfHwge30pO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4ga2V5IGlzIGEgcHJvcGVydHkgaW4gdGhlIG1hcC5cbiAqXG4gKiBAcGFyYW0ge1R9ICBvYmogYSBtYXAgbGlrZSBwcm9wZXJ0eS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAga2V5XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc093bihvYmosIGtleSkge1xuICByZXR1cm4gaGFzT3duXy5jYWxsKG9iaiwga2V5KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIG9ialtrZXldIGlmZiBrZXkgaXMgb2JqJ3Mgb3duIHByb3BlcnR5IChpcyBub3QgaW5oZXJpdGVkKS5cbiAqIE90aGVyd2lzZSwgcmV0dXJucyB1bmRlZmluZWQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHJldHVybiB7Kn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG93blByb3BlcnR5KG9iaiwga2V5KSB7XG4gIGlmIChoYXNPd24ob2JqLCBrZXkpKSB7XG4gICAgcmV0dXJuIG9ialtrZXldO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWVwIG1lcmdlcyBzb3VyY2UgaW50byB0YXJnZXQuXG4gKlxuICogQHBhcmFtIHshT2JqZWN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7IU9iamVjdH0gc291cmNlXG4gKiBAcGFyYW0ge251bWJlcn0gZGVwdGggVGhlIG1heGltdW0gbWVyZ2UgZGVwdGguIElmIGV4Y2VlZGVkLCBPYmplY3QuYXNzaWduXG4gKiAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBiZSB1c2VkIGluc3RlYWQuXG4gKiBAcmV0dXJuIHshT2JqZWN0fVxuICogQHRocm93cyB7RXJyb3J9IElmIHNvdXJjZSBjb250YWlucyBhIGNpcmN1bGFyIHJlZmVyZW5jZS5cbiAqIE5vdGU6IE9ubHkgbmVzdGVkIG9iamVjdHMgYXJlIGRlZXAtbWVyZ2VkLCBwcmltaXRpdmVzIGFuZCBhcnJheXMgYXJlIG5vdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZXBNZXJnZSh0YXJnZXQsIHNvdXJjZSwgZGVwdGggPSAxMCkge1xuICAvLyBLZWVwIHRyYWNrIG9mIHNlZW4gb2JqZWN0cyB0byBkZXRlY3QgcmVjdXJzaXZlIHJlZmVyZW5jZXMuXG4gIGNvbnN0IHNlZW4gPSBbXTtcblxuICAvKiogQHR5cGUgeyFBcnJheTx7dDogIU9iamVjdCwgczogIU9iamVjdCwgZDogbnVtYmVyfT59ICovXG4gIGNvbnN0IHF1ZXVlID0gW107XG4gIHF1ZXVlLnB1c2goe3Q6IHRhcmdldCwgczogc291cmNlLCBkOiAwfSk7XG5cbiAgLy8gQkZTIHRvIGVuc3VyZSBvYmplY3RzIGRvbid0IGhhdmUgcmVjdXJzaXZlIHJlZmVyZW5jZXMgYXQgc2hhbGxvd2VyIGRlcHRocy5cbiAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCB7ZCwgcywgdH0gPSBxdWV1ZS5zaGlmdCgpO1xuICAgIGlmIChzZWVuLmluY2x1ZGVzKHMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvdXJjZSBvYmplY3QgaGFzIGEgY2lyY3VsYXIgcmVmZXJlbmNlLicpO1xuICAgIH1cbiAgICBzZWVuLnB1c2gocyk7XG4gICAgaWYgKHQgPT09IHMpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoZCA+IGRlcHRoKSB7XG4gICAgICBPYmplY3QuYXNzaWduKHQsIHMpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHMpKSB7XG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IHNba2V5XTtcbiAgICAgIC8vIFBlcmZvcm0gYSBkZWVwIG1lcmdlIElGRiBib3RoIHRhcmdldCBhbmQgc291cmNlIGhhdmUgdGhlIHNhbWUga2V5XG4gICAgICAvLyB3aG9zZSBjb3JyZXNwb25kaW5nIHZhbHVlcyBhcmUgb2JqZWN0cy5cbiAgICAgIGlmIChoYXNPd24odCwga2V5KSkge1xuICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHRba2V5XTtcbiAgICAgICAgaWYgKGlzT2JqZWN0KG5ld1ZhbHVlKSAmJiBpc09iamVjdChvbGRWYWx1ZSkpIHtcbiAgICAgICAgICBxdWV1ZS5wdXNoKHt0OiBvbGRWYWx1ZSwgczogbmV3VmFsdWUsIGQ6IGQgKyAxfSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRba2V5XSA9IG5ld1ZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IU9iamVjdH0gbyBBbiBvYmplY3QgdG8gcmVtb3ZlIHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHshQXJyYXk8c3RyaW5nPn0gcHJvcHMgQSBsaXN0IG9mIHByb3BlcnRpZXMgdG8gcmVtb3ZlIGZyb20gdGhlIE9iamVjdFxuICogQHJldHVybiB7IU9iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIGdpdmVuIHByb3BlcnRpZXMgcmVtb3ZlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gb21pdChvLCBwcm9wcykge1xuICByZXR1cm4gT2JqZWN0LmtleXMobykucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGlmICghcHJvcHMuaW5jbHVkZXMoa2V5KSkge1xuICAgICAgYWNjW2tleV0gPSBvW2tleV07XG4gICAgfVxuICAgIHJldHVybiBhY2M7XG4gIH0sIHt9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFPYmplY3R8bnVsbHx1bmRlZmluZWR9IG8xXG4gKiBAcGFyYW0geyFPYmplY3R8bnVsbHx1bmRlZmluZWR9IG8yXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0c0VxdWFsU2hhbGxvdyhvMSwgbzIpIHtcbiAgaWYgKG8xID09IG51bGwgfHwgbzIgPT0gbnVsbCkge1xuICAgIC8vIE51bGwgaXMgb25seSBlcXVhbCB0byBudWxsLCBhbmQgdW5kZWZpbmVkIHRvIHVuZGVmaW5lZC5cbiAgICByZXR1cm4gbzEgPT09IG8yO1xuICB9XG5cbiAgZm9yIChjb25zdCBrIGluIG8xKSB7XG4gICAgaWYgKG8xW2tdICE9PSBvMltrXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGsgaW4gbzIpIHtcbiAgICBpZiAobzJba10gIT09IG8xW2tdKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQHBhcmFtIHtUfSBvYmpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKFQsIHN0cmluZyk6Un0gZmFjdG9yeVxuICogQHJldHVybiB7Un1cbiAqIEB0ZW1wbGF0ZSBULFJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lbW8ob2JqLCBwcm9wLCBmYWN0b3J5KSB7XG4gIGxldCByZXN1bHQgPSAvKiogQHR5cGUgez9SfSAqLyAob2JqW3Byb3BdKTtcbiAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmVzdWx0ID0gZmFjdG9yeShvYmosIHByb3ApO1xuICAgIG9ialtwcm9wXSA9IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJlY3JlYXRlcyBvYmplY3RzIHdpdGggcHJvdG90eXBlLWxlc3MgY29waWVzLlxuICogQHBhcmFtIHshSnNvbk9iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHshSnNvbk9iamVjdH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlY3JlYXRlTm9uUHJvdG9PYmplY3Qob2JqKSB7XG4gIGNvbnN0IGNvcHkgPSBtYXAoKTtcbiAgZm9yIChjb25zdCBrIGluIG9iaikge1xuICAgIGlmICghaGFzT3duKG9iaiwgaykpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCB2ID0gb2JqW2tdO1xuICAgIGNvcHlba10gPSBpc09iamVjdCh2KSA/IHJlY3JlYXRlTm9uUHJvdG9PYmplY3QodikgOiB2O1xuICB9XG4gIHJldHVybiAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoY29weSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHZhbHVlIGZyb20gYW4gb2JqZWN0IGZvciBhIGZpZWxkLWJhc2VkIGV4cHJlc3Npb24uIFRoZSBleHByZXNzaW9uXG4gKiBpcyBhIHNpbXBsZSBuZXN0ZWQgZG90LW5vdGF0aW9uIG9mIGZpZWxkcywgc3VjaCBhcyBgZmllbGQxLmZpZWxkMmAuIElmIGFueVxuICogZmllbGQgaW4gYSBjaGFpbiBkb2VzIG5vdCBleGlzdCBvciBpcyBub3QgYW4gb2JqZWN0IG9yIGFycmF5LCB0aGUgcmV0dXJuZWRcbiAqIHZhbHVlIHdpbGwgYmUgYHVuZGVmaW5lZGAuXG4gKlxuICogQHBhcmFtIHshSnNvbk9iamVjdH0gb2JqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXhwclxuICogQHJldHVybiB7Kn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbHVlRm9yRXhwcihvYmosIGV4cHIpIHtcbiAgLy8gVGhlIGAuYCBpbmRpY2F0ZXMgXCJ0aGUgb2JqZWN0IGl0c2VsZlwiLlxuICBpZiAoZXhwciA9PSAnLicpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG4gIC8vIE90aGVyd2lzZSwgbmF2aWdhdGUgdmlhIHByb3BlcnRpZXMuXG4gIGNvbnN0IHBhcnRzID0gZXhwci5zcGxpdCgnLicpO1xuICBsZXQgdmFsdWUgPSBvYmo7XG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgIGlmIChcbiAgICAgIHBhcnQgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICB2YWx1ZVtwYXJ0XSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiZcbiAgICAgIGhhc093bih2YWx1ZSwgcGFydClcbiAgICApIHtcbiAgICAgIHZhbHVlID0gdmFsdWVbcGFydF07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/types/object/index.js