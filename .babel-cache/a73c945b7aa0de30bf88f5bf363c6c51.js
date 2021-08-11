function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it.return != null) it.return();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;} /**
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
var _Object$prototype = Object.prototype,hasOwn_ = _Object$prototype.hasOwnProperty,toString_ = _Object$prototype.toString;

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
  return (/** @type {!JsonObject} */(opt_initial || {}));
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
export function deepMerge(target, source) {var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  // Keep track of seen objects to detect recursive references.
  var seen = [];

  /** @type {!Array<{t: !Object, s: !Object, d: number}>} */
  var queue = [];
  queue.push({ t: target, s: source, d: 0 });

  // BFS to ensure objects don't have recursive references at shallower depths.
  while (queue.length > 0) {
    var _queue$shift = queue.shift(),d = _queue$shift.d,s = _queue$shift.s,t = _queue$shift.t;
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
    for (var _i = 0, _Object$keys = Object.keys(s); _i < _Object$keys.length; _i++) {var key = _Object$keys[_i];
      var newValue = s[key];
      // Perform a deep merge IFF both target and source have the same key
      // whose corresponding values are objects.
      if (hasOwn(t, key)) {
        var oldValue = t[key];
        if (isObject(newValue) && isObject(oldValue)) {
          queue.push({ t: oldValue, s: newValue, d: d + 1 });
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
  var result = /** @type {?R} */(obj[prop]);
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
  return (/** @type {!JsonObject} */(copy));
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
  var value = obj;var _iterator = _createForOfIteratorHelper(
  parts),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var part = _step.value;
      if (
      part &&
      value &&
      value[part] !== undefined &&
      _typeof(value) == 'object' &&
      hasOwn(value, part))
      {
        value = value[part];
        continue;
      }
      value = undefined;
      break;
    }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
  return value;
}
// /Users/mszylkowski/src/amphtml/src/core/types/object/index.js