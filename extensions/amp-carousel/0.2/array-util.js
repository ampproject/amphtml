import {mod} from '../../../src/utils/math';

/**
 * Calculates the distance between two indicies in an Array, treating the first
 * and last indicies as adjacent. In the array ['a', 'b', 'c'], the
 * wrappingDistance between 'a' and 'c' is 1. Likewise, the wrappingDistance
 * betweeb 'a' and 'b' is also 1.
 * @param {number} a A start index.
 * @param {number} b An end index.
 * @param {!Array} arr An array.
 */
export function wrappingDistance(a, b, arr) {
  return a === b ? 0 : Math.min(
      forwardWrappingDistance(a, b, arr),
      backwardWrappingDistance(a, b, arr));
}

/**
 * Calculates the forwards distance between two indicies in an Array, treating
 * the first and last indicies as adjacent. In the array ['a', 'b', 'c'], the
 * forwardWrappingDistance between 'b' and 'a' is 2.
 * @param {number} a A start index.
 * @param {number} b An end index.
 * @param {!Array} arr An array.
 */
export function forwardWrappingDistance(a, b, {length}) {
  return a === b ? length : mod(b - a, length);
}

/**
 * Calculates the backwards distance between two indicies in an Array, treating
 * the first and last indicies as adjacent. In the array ['a', 'b', 'c'], the
 * backwardWrappingDistance between 'a' and 'b' is 2.
 * @param {number} a A start index.
 * @param {number} b An end index.
 * @param {!Array} arr An array.
 */
export function backwardWrappingDistance(a, b, {length}) {
  return a === b ? length : mod(a - b, length);
}
