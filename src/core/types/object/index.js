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
const {toString: toString_, hasOwnProperty: hasOwn_} = Object.prototype;

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
  const obj = Object.create(null);
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
  return /** @type {!JsonObject} */ (opt_initial || {});
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
export function deepMerge(target, source, depth = 10) {
  // Keep track of seen objects to detect recursive references.
  const seen = [];

  /** @type {!Array<{t: !Object, s: !Object, d: number}>} */
  const queue = [];
  queue.push({t: target, s: source, d: 0});

  // BFS to ensure objects don't have recursive references at shallower depths.
  while (queue.length > 0) {
    const {t, s, d} = queue.shift();
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
    for (const key of Object.keys(s)) {
      const newValue = s[key];
      // Perform a deep merge IFF both target and source have the same key
      // whose corresponding values are objects.
      if (hasOwn(t, key)) {
        const oldValue = t[key];
        if (isObject(newValue) && isObject(oldValue)) {
          queue.push({t: oldValue, s: newValue, d: d + 1});
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
  return Object.keys(o).reduce((acc, key) => {
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

  for (const k in o1) {
    if (o1[k] !== o2[k]) {
      return false;
    }
  }
  for (const k in o2) {
    if (o2[k] !== o1[k]) {
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
  let result = /** @type {?R} */ (obj[prop]);
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
  const copy = map();
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
