/**
 * Checks whether `val` is a valid value of `enumObj`.
 *
 * @param {!Object<T>} enumObj
 * @param {T} val
 * @return {boolean}
 * @template T
 */
export function isEnumValue(enumObj, val) {
  for (const k in enumObj) {
    if (enumObj[k] === val) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the keys of an object before they are mangled by the minifier.
 * @param {!Object<T>} enumObj
 * @return {!Array<string>}
 */
export function enumKeys(enumObj) {
  return Object.keys(enumObj);
}

/**
 * Returns the values of an object.
 * @param {!Object<T>} enumObj
 * @return {!Array<T>}
 */
export function enumValues(enumObj) {
  return Object.values(enumObj);
}

/**
 * Returns an object clone of a enum with un-mangled keys.
 * @param {!Object<T>} enumObj
 * @return {!Array<T>}
 */
export function enumToObject(enumObj) {
  // This implementation only works when the code is unminified.
  // In a minified build, the callsite will be replaced with an optimized
  // object definition.
  const keys = enumKeys(enumObj);
  const values = enumKeys(enumObj);
  const obj = {};
  for (let i = 0; i < keys.length; i++) {
    obj[keys[i]] = values[i];
  }
  return obj;
}
