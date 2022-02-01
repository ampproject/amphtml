import {isProd} from '#core/mode/prod';

/**
 * Checks whether `val` is a valid value of `enumObj`.
 *
 * @param {Record<string, T>} enumObj
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
 * Returns all enum values of `enumObj`.
 *
 * @param {Object} enumObj
 * @return {readonly T[]}
 * @template T
 */
export function enumValues(enumObj) {
  if (isProd()) {
    return Object.values(enumObj);
  }
  return Object.freeze(Object.values(enumObj));
}
