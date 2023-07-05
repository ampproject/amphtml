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
 * @param {object} enumObj
 * @return {readonly T[]}
 * @template T
 */
export function enumValues(enumObj) {
  if (isProd()) {
    return Object.values(enumObj);
  }
  return Object.freeze(Object.values(enumObj));
}

/**
 * No effect on runtime. Merely an annotation for the compiler to shorten the
 * property values of large, common enums during production.
 * See babel-plugin-mangle-object-values.
 * @param {T} obj
 * @return {T}
 * @template T
 */
export const mangleObjectValues = (obj) => obj;
