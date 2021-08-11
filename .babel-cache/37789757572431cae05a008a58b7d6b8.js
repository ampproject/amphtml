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
 * Returns true if the element is in the array and false otherwise.
 *
 * @param {*} value
 * @param {number=} opt_fromIndex
 * @return {boolean}
 * @this {Array}
 */
function includes(value, opt_fromIndex) {
  var fromIndex = opt_fromIndex || 0;
  // eslint-disable-next-line local/no-invalid-this
  var len = this.length;
  var i = fromIndex >= 0 ? fromIndex : Math.max(len + fromIndex, 0);

  for (; i < len; i++) {
    // eslint-disable-next-line local/no-invalid-this
    var other = this[i];

    // If value has been found OR (value is NaN AND other is NaN)

    /*eslint "no-self-compare": 0*/
    if (other === value || value !== value && other !== other) {
      return true;
    }
  }

  return false;
}

/**
 * Sets the Array.contains polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (!win.Array.prototype.includes) {
    win.Object.defineProperty(win.Array.prototype, 'includes', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: includes
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFycmF5LWluY2x1ZGVzLmpzIl0sIm5hbWVzIjpbImluY2x1ZGVzIiwidmFsdWUiLCJvcHRfZnJvbUluZGV4IiwiZnJvbUluZGV4IiwibGVuIiwibGVuZ3RoIiwiaSIsIk1hdGgiLCJtYXgiLCJvdGhlciIsImluc3RhbGwiLCJ3aW4iLCJBcnJheSIsInByb3RvdHlwZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZW51bWVyYWJsZSIsImNvbmZpZ3VyYWJsZSIsIndyaXRhYmxlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNBLFFBQVQsQ0FBa0JDLEtBQWxCLEVBQXlCQyxhQUF6QixFQUF3QztBQUN0QyxNQUFNQyxTQUFTLEdBQUdELGFBQWEsSUFBSSxDQUFuQztBQUNBO0FBQ0EsTUFBTUUsR0FBRyxHQUFHLEtBQUtDLE1BQWpCO0FBQ0EsTUFBSUMsQ0FBQyxHQUFHSCxTQUFTLElBQUksQ0FBYixHQUFpQkEsU0FBakIsR0FBNkJJLElBQUksQ0FBQ0MsR0FBTCxDQUFTSixHQUFHLEdBQUdELFNBQWYsRUFBMEIsQ0FBMUIsQ0FBckM7O0FBQ0EsU0FBT0csQ0FBQyxHQUFHRixHQUFYLEVBQWdCRSxDQUFDLEVBQWpCLEVBQXFCO0FBQ25CO0FBQ0EsUUFBTUcsS0FBSyxHQUFHLEtBQUtILENBQUwsQ0FBZDs7QUFDQTs7QUFDQTtBQUNBLFFBQUlHLEtBQUssS0FBS1IsS0FBVixJQUFvQkEsS0FBSyxLQUFLQSxLQUFWLElBQW1CUSxLQUFLLEtBQUtBLEtBQXJELEVBQTZEO0FBQzNELGFBQU8sSUFBUDtBQUNEO0FBQ0Y7O0FBQ0QsU0FBTyxLQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQzNCLE1BQUksQ0FBQ0EsR0FBRyxDQUFDQyxLQUFKLENBQVVDLFNBQVYsQ0FBb0JiLFFBQXpCLEVBQW1DO0FBQ2pDVyxJQUFBQSxHQUFHLENBQUNHLE1BQUosQ0FBV0MsY0FBWCxDQUEwQkosR0FBRyxDQUFDQyxLQUFKLENBQVVDLFNBQXBDLEVBQStDLFVBQS9DLEVBQTJEO0FBQ3pERyxNQUFBQSxVQUFVLEVBQUUsS0FENkM7QUFFekRDLE1BQUFBLFlBQVksRUFBRSxJQUYyQztBQUd6REMsTUFBQUEsUUFBUSxFQUFFLElBSCtDO0FBSXpEakIsTUFBQUEsS0FBSyxFQUFFRDtBQUprRCxLQUEzRDtBQU1EO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgaXMgaW4gdGhlIGFycmF5IGFuZCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHBhcmFtIHtudW1iZXI9fSBvcHRfZnJvbUluZGV4XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHRoaXMge0FycmF5fVxuICovXG5mdW5jdGlvbiBpbmNsdWRlcyh2YWx1ZSwgb3B0X2Zyb21JbmRleCkge1xuICBjb25zdCBmcm9tSW5kZXggPSBvcHRfZnJvbUluZGV4IHx8IDA7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBsb2NhbC9uby1pbnZhbGlkLXRoaXNcbiAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGg7XG4gIGxldCBpID0gZnJvbUluZGV4ID49IDAgPyBmcm9tSW5kZXggOiBNYXRoLm1heChsZW4gKyBmcm9tSW5kZXgsIDApO1xuICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGxvY2FsL25vLWludmFsaWQtdGhpc1xuICAgIGNvbnN0IG90aGVyID0gdGhpc1tpXTtcbiAgICAvLyBJZiB2YWx1ZSBoYXMgYmVlbiBmb3VuZCBPUiAodmFsdWUgaXMgTmFOIEFORCBvdGhlciBpcyBOYU4pXG4gICAgLyplc2xpbnQgXCJuby1zZWxmLWNvbXBhcmVcIjogMCovXG4gICAgaWYgKG90aGVyID09PSB2YWx1ZSB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcikpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgQXJyYXkuY29udGFpbnMgcG9seWZpbGwgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbCh3aW4pIHtcbiAgaWYgKCF3aW4uQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzKSB7XG4gICAgd2luLk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW4uQXJyYXkucHJvdG90eXBlLCAnaW5jbHVkZXMnLCB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IGluY2x1ZGVzLFxuICAgIH0pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/polyfills/array-includes.js