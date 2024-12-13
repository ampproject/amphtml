// Export all type-checking helpers for convenience
export {isArray} from './array';
export {isEnumValue} from './enum';
export {isString} from './string';
export {isObject} from './object';

/**
 * Determines if value is an ELement
 * @param {*} value
 * @return {value is Element}
 */
export function isElement(value) {
  return value?.nodeType == /* Node.ELEMENT_NODE */ 1;
}

/**
 * Determines if value is of number type and finite.
 * NaN and Infinity are not considered a finite number.
 * String numbers are not considered numbers.
 * @param {*} value
 * @return {boolean}
 */
export function isFiniteNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

/**
 * Returns true if obj is a PromiseLike.
 *
 * @param {*} obj
 * @return {obj is Promise<*>}
 */
export function isPromise(obj) {
  return typeof obj?.then === 'function';
}
