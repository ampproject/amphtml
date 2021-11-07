import {mod} from '#core/math';

/**
 * Calculates the forwards distance between two indicies in an Array, treating
 * the first and last indicies as adjacent. In the array ['a', 'b', 'c'], the
 * forwardWrappingDistance between 'b' and 'a' is 2.
 * @param {number} a A start index.
 * @param {number} b An end index.
 * @param {!IArrayLike} arr An array like Object.
 * @return {number}
 */
export function forwardWrappingDistance(a, b, arr) {
  const {length} = arr;
  return a === b ? length : mod(b - a, length);
}

/**
 * Calculates the backwards distance between two indicies in an Array, treating
 * the first and last indicies as adjacent. In the array ['a', 'b', 'c'], the
 * backwardWrappingDistance between 'a' and 'b' is 2.
 * @param {number} a A start index.
 * @param {number} b An end index.
 * @param {!IArrayLike} arr An array like Object.
 * @return {number}
 */
export function backwardWrappingDistance(a, b, arr) {
  const {length} = arr;
  return a === b ? length : mod(a - b, length);
}
