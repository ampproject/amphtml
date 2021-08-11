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
import { devAssert } from "./assert";

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
  var max1Bound = max1;
  var min1Bound = min1;

  if (min1 > max1) {
    max1Bound = min1;
    min1Bound = max1;
  }

  if (val < min1Bound) {
    val = min1Bound;
  } else if (val > max1Bound) {
    val = max1Bound;
  }

  return (val - min1) * (max2 - min2) / (max1 - min1) + min2;
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
  return a > 0 && b > 0 ? a % b : (a % b + b) % b;
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
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGguanMiXSwibmFtZXMiOlsiZGV2QXNzZXJ0IiwibWFwUmFuZ2UiLCJ2YWwiLCJtaW4xIiwibWF4MSIsIm1pbjIiLCJtYXgyIiwibWF4MUJvdW5kIiwibWluMUJvdW5kIiwibW9kIiwiYSIsImIiLCJjbGFtcCIsIm1pbiIsIm1heCIsIk1hdGgiLCJib3VuZFZhbHVlIiwiZXh0ZW50IiwibWFnbml0dWRlIiwiZGVsdGFYIiwiZGVsdGFZIiwic3FydCIsImRpc3RhbmNlIiwieDEiLCJ5MSIsIngyIiwieTIiLCJwb2xhclRvQ2FydGVzaWFuIiwiY2VudGVyWCIsImNlbnRlclkiLCJyYWRpdXMiLCJhbmdsZUluRGVncmVlcyIsImFuZ2xlSW5SYWRpYW5zIiwiUEkiLCJ4IiwiY29zIiwieSIsInNpbiIsInN1bSIsInZhbHVlcyIsInJlZHVjZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsU0FBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXVCQyxJQUF2QixFQUE2QkMsSUFBN0IsRUFBbUNDLElBQW5DLEVBQXlDQyxJQUF6QyxFQUErQztBQUNwRCxNQUFJQyxTQUFTLEdBQUdILElBQWhCO0FBQ0EsTUFBSUksU0FBUyxHQUFHTCxJQUFoQjs7QUFDQSxNQUFJQSxJQUFJLEdBQUdDLElBQVgsRUFBaUI7QUFDZkcsSUFBQUEsU0FBUyxHQUFHSixJQUFaO0FBQ0FLLElBQUFBLFNBQVMsR0FBR0osSUFBWjtBQUNEOztBQUVELE1BQUlGLEdBQUcsR0FBR00sU0FBVixFQUFxQjtBQUNuQk4sSUFBQUEsR0FBRyxHQUFHTSxT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Q0E7QUFDQTtBQUNBLE9BQU8sU0FBU00sR0FBVCxDQUFhQyxNQUFiLEVBQXFCO0FBQzFCLFNBQU9BLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLFVBQVU5QixDQUFWLEVBQWFDLENBQWIsRUFBZ0I7QUFDbkMsV0FBT0QsQ0FBQyxHQUFHQyxDQUFYO0FBQ0QsR0FGTSxDQUFQO0FBR0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtkZXZBc3NlcnR9IGZyb20gJyNjb3JlL2Fzc2VydCc7XG5cbi8qKlxuICogTWFwcyBhIHZhbHVlIGluIGEgZmlyc3QgcmFuZ2UgdG8gaXRzIGVxdWl2YWxlbnQgaW4gYSBzZWNvbmQgcmFuZ2VcbiAqIEV4LjogNSBpbiB0aGUgcmFuZ2UgWzAsMTBdIGdpdmVzIDYwIGluIHRoZSByYW5nZVs0MCw4MF1cbiAqXG4gKiBOT1RFOiBsb3dlci91cHBlciBib3VuZHMgb24gdGhlIHNvdXJjZSByYW5nZSBhcmUgZGV0ZWN0ZWQgYXV0b21hdGljYWxseSxcbiAqIGhvd2V2ZXIgdGhlIGJvdW5kcyBvbiB0aGUgdGFyZ2V0IHJhbmdlIGFyZSBub3QgYWx0ZXJlZCAodGh1cyB0aGUgdGFyZ2V0XG4gKiByYW5nZSBjb3VsZCBiZSBkZWNyZWFzaW5nKS5cbiAqIEV4MTogOCBpbiB0aGUgcmFuZ2UgWzAsIDEwXSBnaXZlcyAyIGluIHRoZSByYW5nZSBbMTAsIDBdXG4gKiBFeDI6IGFsc28sIDggaW4gdGhlIHJhbmdlIFsxMCwgMF0gZ2l2ZXMgMiBpbiB0aGUgcmFuZ2UgWzEwLCAwXVxuICpcbiAqIE5PVEU6IElucHV0IHZhbHVlIGlzIGVuZm9yY2VkIHRvIGJlIGJvdW5kZWQgaW5zaWRlIHRoZSBzb3VyY2UgcmFuZ2VcbiAqIEV4MTogLTIgaW4gdGhlIHJhbmdlIFswLCAxMF0gaXMgaW50ZXJwcmV0ZWQgYXMgMCBhbmQgdGh1cyBnaXZlcyA0MCBpbiBbNDAsODBdXG4gKiBFeDI6IDE5IGluIHRoZSByYW5nZSBbMCwgNV0gaXMgaW50ZXJwcmV0ZWQgYXMgNSBhbmQgdGh1cyBnaXZlcyA4MCBpbiBbNDAsODBdXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbCB0aGUgdmFsdWUgaW4gdGhlIHNvdXJjZSByYW5nZVxuICogQHBhcmFtIHtudW1iZXJ9IG1pbjEgdGhlIGxvd2VyIGJvdW5kIG9mIHRoZSBzb3VyY2UgcmFuZ2VcbiAqIEBwYXJhbSB7bnVtYmVyfSBtYXgxIHRoZSB1cHBlciBib3VuZCBvZiB0aGUgc291cmNlIHJhbmdlXG4gKiBAcGFyYW0ge251bWJlcn0gbWluMiB0aGUgbG93ZXIgYm91bmQgb2YgdGhlIHRhcmdldCByYW5nZVxuICogQHBhcmFtIHtudW1iZXJ9IG1heDIgdGhlIHVwcGVyIGJvdW5kIG9mIHRoZSB0YXJnZXQgcmFuZ2VcbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIGVxdWl2YWxlbnQgdmFsdWUgaW4gdGhlIHRhcmdldCByYW5nZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwUmFuZ2UodmFsLCBtaW4xLCBtYXgxLCBtaW4yLCBtYXgyKSB7XG4gIGxldCBtYXgxQm91bmQgPSBtYXgxO1xuICBsZXQgbWluMUJvdW5kID0gbWluMTtcbiAgaWYgKG1pbjEgPiBtYXgxKSB7XG4gICAgbWF4MUJvdW5kID0gbWluMTtcbiAgICBtaW4xQm91bmQgPSBtYXgxO1xuICB9XG5cbiAgaWYgKHZhbCA8IG1pbjFCb3VuZCkge1xuICAgIHZhbCA9IG1pbjFCb3VuZDtcbiAgfSBlbHNlIGlmICh2YWwgPiBtYXgxQm91bmQpIHtcbiAgICB2YWwgPSBtYXgxQm91bmQ7XG4gIH1cblxuICByZXR1cm4gKCh2YWwgLSBtaW4xKSAqIChtYXgyIC0gbWluMikpIC8gKG1heDEgLSBtaW4xKSArIG1pbjI7XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIG1vZHVsdXMgb2YgdmFsdWVzIGBhYCBhbmQgYGJgLlxuICpcbiAqIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgdGhlICUgb3BlcmF0b3IgaW4gSmF2YVNjcmlwdCBkb2Vzbid0IGltcGxlbWVudFxuICogbW9kdWx1cyBiZWhhdmlvciBhcyBjYW4gYmUgc2VlbiBieSB0aGUgc3BlYyBoZXJlOlxuICogaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTExLjUuMy5cbiAqIEl0IGluc3RlYWQgaXMgdXNlZCB0byBvYnRhaW4gdGhlIHJlbWFpbmRlciBvZiBhIGRpdmlzaW9uLlxuICogVGhpcyBmdW5jdGlvbiB1c2VzIHRoZSByZW1haW5kZXIgKCUpIG9wZXJhdG9yIHRvIGRldGVybWluZSB0aGUgbW9kdWx1cy5cbiAqIERlcml2ZWQgZnJvbSBoZXJlOlxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjU3MjY3NjAvamF2YXNjcmlwdC1tb2R1bGFyLWFyaXRobWV0aWMvNDczNTQzNTYjNDczNTQzNTZcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gYVxuICogQHBhcmFtIHtudW1iZXJ9IGJcbiAqIEByZXR1cm4ge251bWJlcn0gcmV0dXJucyB0aGUgbW9kdWx1cyBvZiB0aGUgdHdvIG51bWJlcnMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8ubWluKDEwLCA1KTtcbiAqIC8vID0+IDBcbiAqXG4gKiBfLm1vZCgtMSwgNSk7XG4gKiAvLyA9PiA0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtb2QoYSwgYikge1xuICByZXR1cm4gYSA+IDAgJiYgYiA+IDAgPyBhICUgYiA6ICgoYSAlIGIpICsgYikgJSBiO1xufVxuXG4vKipcbiAqIFJlc3RyaWN0cyBhIG51bWJlciB0byBiZSBpbiB0aGUgZ2l2ZW4gbWluL21heCByYW5nZS4gVGhlIG1pbmltdW0gdmFsdWUgbXVzdFxuICogYmUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBtYXhpbXVtIHZhbHVlLlxuICpcbiAqIEV4YW1wbGVzOlxuICogY2xhbXAoMC41LCAwLCAxKSAtPiAwLjVcbiAqIGNsYW1wKDEuNSwgMCwgMSkgLT4gMVxuICogY2xhbXAoLTAuNSwgMCwgMSkgLT4gMFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWwgdGhlIHZhbHVlIHRvIGNsYW1wLlxuICogQHBhcmFtIHtudW1iZXJ9IG1pbiB0aGUgbG93ZXIgYm91bmQuXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4IHRoZSB1cHBlciBib3VuZC5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIGNsYW1wZWQgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcCh2YWwsIG1pbiwgbWF4KSB7XG4gIGRldkFzc2VydChtaW4gPD0gbWF4LCAnTWluaW11bSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIG1heGltdW0uJyk7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWwsIG1pbiksIG1heCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB2YWx1ZSBib3VuZCB0byBtaW4gYW5kIG1heCB2YWx1ZXMgKy8tIGV4dGVudC4gVGhlIGxvd2VyIGJvdW5kIG11c3RcbiAqIGJlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgdXBwZXIgYm91bmQuXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsIHRoZSB2YWx1ZSB0byBib3VuZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gdGhlIGxvd2VyIGJvdW5kLlxuICogQHBhcmFtIHtudW1iZXJ9IG1heCB0aGUgdXBwZXIgYm91bmRcbiAqIEBwYXJhbSB7bnVtYmVyfSBleHRlbnQgdGhlIGFsbG93ZWQgZXh0ZW50IGJleW9uZCB0aGUgYm91bmRzLlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgYm91bmRlZCB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJvdW5kVmFsdWUodmFsLCBtaW4sIG1heCwgZXh0ZW50KSB7XG4gIGRldkFzc2VydChtaW4gPD0gbWF4LCAnTG93ZXIgYm91bmQgaXMgZ3JlYXRlciB0aGFuIHRoZSB1cHBlciBib3VuZC4nKTtcbiAgcmV0dXJuIGNsYW1wKHZhbCwgbWluIC0gZXh0ZW50LCBtYXggKyBleHRlbnQpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGxlbmd0aCBvZiBhIHZlY3RvciBnaXZlbiBpbiBYLSBhbmQgWS1jb29yZGluYXRlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWx0YVggZGlzdGFuY2UgaW4gdGhlIFggZGlyZWN0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGRlbHRhWSBkaXN0YW5jZSBpbiB0aGUgWSBkaXJlY3Rpb24uXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBtYWduaXR1ZGUgb2YgdGhlIHZlY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hZ25pdHVkZShkZWx0YVgsIGRlbHRhWSkge1xuICByZXR1cm4gTWF0aC5zcXJ0KGRlbHRhWCAqIGRlbHRhWCArIGRlbHRhWSAqIGRlbHRhWSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzLlxuICogQHBhcmFtIHtudW1iZXJ9IHgxIFgtY29vcmRpbmF0ZSBvZiB0aGUgZmlyc3QgcG9pbnQuXG4gKiBAcGFyYW0ge251bWJlcn0geTEgWS1jb29yZGluYXRlIG9mIHRoZSBmaXJzdCBwb2ludC5cbiAqIEBwYXJhbSB7bnVtYmVyfSB4MiBYLWNvb3JkaW5hdGUgb2YgdGhlIHNlY29uZCBwb2ludC5cbiAqIEBwYXJhbSB7bnVtYmVyfSB5MiBZLWNvb3JkaW5hdGUgb2YgdGhlIHNlY29uZCBwb2ludC5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byBwb2ludHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZSh4MSwgeTEsIHgyLCB5Mikge1xuICByZXR1cm4gbWFnbml0dWRlKHgyIC0geDEsIHkyIC0geTEpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJYXG4gKiBAcGFyYW0ge251bWJlcn0gY2VudGVyWVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1xuICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlSW5EZWdyZWVzXG4gKiBAcmV0dXJuIHt7XG4gKiAgeDogbnVtYmVyLFxuICogIHk6IG51bWJlcixcbiAqIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwb2xhclRvQ2FydGVzaWFuKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgYW5nbGVJbkRlZ3JlZXMpIHtcbiAgY29uc3QgYW5nbGVJblJhZGlhbnMgPSAoKGFuZ2xlSW5EZWdyZWVzIC0gOTApICogTWF0aC5QSSkgLyAxODAuMDtcblxuICByZXR1cm4ge1xuICAgIHg6IGNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyksXG4gICAgeTogY2VudGVyWSArIHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTdW1zIHVwIHRoZSB2YWx1ZXMgb2YgdGhlIGdpdmVuIGFycmF5IGFuZCByZXR1cm5zIHRoZSByZXN1bHRcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gdmFsdWVzXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdW0odmFsdWVzKSB7XG4gIHJldHVybiB2YWx1ZXMucmVkdWNlKGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEgKyBiO1xuICB9KTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/math.js