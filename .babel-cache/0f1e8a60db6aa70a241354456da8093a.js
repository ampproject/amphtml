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

/**
 * Parses the number x and returns its sign. For positive x returns 1, for
 * negative, -1. For 0 and -0, returns 0 and -0 respectively. For any number
 * that parses to NaN, returns NaN.
 *
 * @param {number} x
 * @return {number}
 */
export function sign(x) {
  x = Number(x);

  // If x is 0, -0, or NaN, return it.
  if (!x) {
    return x;
  }

  return x > 0 ? 1 : -1;
}

/**
 * Sets the Math.sign polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (!win.Math.sign) {
    win.Object.defineProperty(win.Math, 'sign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: sign
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGgtc2lnbi5qcyJdLCJuYW1lcyI6WyJzaWduIiwieCIsIk51bWJlciIsImluc3RhbGwiLCJ3aW4iLCJNYXRoIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJ2YWx1ZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNBLElBQVQsQ0FBY0MsQ0FBZCxFQUFpQjtBQUN0QkEsRUFBQUEsQ0FBQyxHQUFHQyxNQUFNLENBQUNELENBQUQsQ0FBVjs7QUFFQTtBQUNBLE1BQUksQ0FBQ0EsQ0FBTCxFQUFRO0FBQ04sV0FBT0EsQ0FBUDtBQUNEOztBQUVELFNBQU9BLENBQUMsR0FBRyxDQUFKLEdBQVEsQ0FBUixHQUFZLENBQUMsQ0FBcEI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0UsT0FBVCxDQUFpQkMsR0FBakIsRUFBc0I7QUFDM0IsTUFBSSxDQUFDQSxHQUFHLENBQUNDLElBQUosQ0FBU0wsSUFBZCxFQUFvQjtBQUNsQkksSUFBQUEsR0FBRyxDQUFDRSxNQUFKLENBQVdDLGNBQVgsQ0FBMEJILEdBQUcsQ0FBQ0MsSUFBOUIsRUFBb0MsTUFBcEMsRUFBNEM7QUFDMUNHLE1BQUFBLFVBQVUsRUFBRSxLQUQ4QjtBQUUxQ0MsTUFBQUEsWUFBWSxFQUFFLElBRjRCO0FBRzFDQyxNQUFBQSxRQUFRLEVBQUUsSUFIZ0M7QUFJMUNDLE1BQUFBLEtBQUssRUFBRVg7QUFKbUMsS0FBNUM7QUFNRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogUGFyc2VzIHRoZSBudW1iZXIgeCBhbmQgcmV0dXJucyBpdHMgc2lnbi4gRm9yIHBvc2l0aXZlIHggcmV0dXJucyAxLCBmb3JcbiAqIG5lZ2F0aXZlLCAtMS4gRm9yIDAgYW5kIC0wLCByZXR1cm5zIDAgYW5kIC0wIHJlc3BlY3RpdmVseS4gRm9yIGFueSBudW1iZXJcbiAqIHRoYXQgcGFyc2VzIHRvIE5hTiwgcmV0dXJucyBOYU4uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHhcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNpZ24oeCkge1xuICB4ID0gTnVtYmVyKHgpO1xuXG4gIC8vIElmIHggaXMgMCwgLTAsIG9yIE5hTiwgcmV0dXJuIGl0LlxuICBpZiAoIXgpIHtcbiAgICByZXR1cm4geDtcbiAgfVxuXG4gIHJldHVybiB4ID4gMCA/IDEgOiAtMTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBNYXRoLnNpZ24gcG9seWZpbGwgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbCh3aW4pIHtcbiAgaWYgKCF3aW4uTWF0aC5zaWduKSB7XG4gICAgd2luLk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW4uTWF0aCwgJ3NpZ24nLCB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IHNpZ24sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/polyfills/math-sign.js