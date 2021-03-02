/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {pureDevAssert as devAssert} from '../core/assert';

/**
 * Maps a value in a first range to its equivalent in a second range
 * Ex.: 5 in the range [0,10] gives 60 in the range[40,80]
 *
 * NOTE: lower/upper bounds on the source range are detected automatically,
 * however the bounds on the target range are not altered (thus the target
 * range could be decreasing).
 * Ex1: 8 in the range [0, 10] gives 2 in the range [10, 0]
 * Ex2: also, 8 in the range [10, 0] gives 2 in the range [10, 0]
 *
 * NOTE: Input value is enforced to be bounded inside the source range
 * Ex1: -2 in the range [0, 10] is interpreted as 0 and thus gives 40 in [40,80]
 * Ex2: 19 in the range [0, 5] is interpreted as 5 and thus gives 80 in [40,80]
 *
 * @param {number} val the value in the source range
 * @param {number} min1 the lower bound of the source range
 * @param {number} max1 the upper bound of the source range
 * @param {number} min2 the lower bound of the target range
 * @param {number} max2 the upper bound of the target range
 * @return {number} the equivalent value in the target range
 */
export function mapRange(val, min1, max1, min2, max2) {
  let max1Bound = max1;
  let min1Bound = min1;
  if (min1 > max1) {
    max1Bound = min1;
    min1Bound = max1;
  }

  if (val < min1Bound) {
    val = min1Bound;
  } else if (val > max1Bound) {
    val = max1Bound;
  }

  return ((val - min1) * (max2 - min2)) / (max1 - min1) + min2;
}

/**
 * Computes the modulus of values `a` and `b`.
 *
 * This is needed because the % operator in JavaScript doesn't implement
 * modulus behavior as can be seen by the spec here:
 * http://www.ecma-international.org/ecma-262/5.1/#sec-11.5.3.
 * It instead is used to obtain the remainder of a division.
 * This function uses the remainder (%) operator to determine the modulus.
 * Derived from here:
 * https://stackoverflow.com/questions/25726760/javascript-modular-arithmetic/47354356#47354356
 *
 * @param {number} a
 * @param {number} b
 * @return {number} returns the modulus of the two numbers.
 * @example
 *
 * _.min(10, 5);
 * // => 0
 *
 * _.mod(-1, 5);
 * // => 4
 */
export function mod(a, b) {
  return a > 0 && b > 0 ? a % b : ((a % b) + b) % b;
}

/**
 * Restricts a number to be in the given min/max range. The minimum value must
 * be less than or equal to the maximum value.
 *
 * Examples:
 * clamp(0.5, 0, 1) -> 0.5
 * clamp(1.5, 0, 1) -> 1
 * clamp(-0.5, 0, 1) -> 0
 *
 * @param {number} val the value to clamp.
 * @param {number} min the lower bound.
 * @param {number} max the upper bound.
 * @return {number} the clamped value.
 */
export function clamp(val, min, max) {
  devAssert(min <= max, 'Minimum value is greater than the maximum.');
  return Math.min(Math.max(val, min), max);
}

/**
 * Returns value bound to min and max values +/- extent. The lower bound must
 * be less than or equal to the upper bound.
 * @param {number} val the value to bound.
 * @param {number} min the lower bound.
 * @param {number} max the upper bound
 * @param {number} extent the allowed extent beyond the bounds.
 * @return {number} the bounded value.
 */
export function boundValue(val, min, max, extent) {
  devAssert(min <= max, 'Lower bound is greater than the upper bound.');
  return clamp(val, min - extent, max + extent);
}

/**
 * Returns the length of a vector given in X- and Y-coordinates.
 * @param {number} deltaX distance in the X direction.
 * @param {number} deltaY distance in the Y direction.
 * @return {number} the magnitude of the vector.
 */
export function magnitude(deltaX, deltaY) {
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

/**
 * Returns the distance between two points.
 * @param {number} x1 X-coordinate of the first point.
 * @param {number} y1 Y-coordinate of the first point.
 * @param {number} x2 X-coordinate of the second point.
 * @param {number} y2 Y-coordinate of the second point.
 * @return {number} the distance between the two points.
 */
export function distance(x1, y1, x2, y2) {
  return magnitude(x2 - x1, y2 - y1);
}

/**
 * @param {number} centerX
 * @param {number} centerY
 * @param {number} radius
 * @param {number} angleInDegrees
 * @return {{
 *  x: number,
 *  y: number,
 * }}
 */
export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Sums up the values of the given array and returns the result
 * @param {Array<number>} values
 * @return {number}
 */
export function sum(values) {
  return values.reduce(function (a, b) {
    return a + b;
  });
}
