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
