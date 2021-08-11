/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import { isString } from "./string";

/** @fileoverview helpers for dealing with dates and times. */

/**
 * Absolute time in milliseconds.
 * @typedef {number}
 */
export var TimestampDef;

/**
 * Parses the date using the `Date.parse()` rules. Additionally supports the
 * keyword "now" that indicates the "current date/time". Returns either a
 * valid epoch value or null.
 *
 * @param {?string|undefined} s
 * @return {?TimestampDef}
 */
export function parseDate(s) {
  if (!s) {
    return null;
  }

  if (s.toLowerCase() === 'now') {
    return Date.now();
  }

  var parsed = Date.parse(s);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Converts various date formats into a timestamp in ms.
 * @param {!Date|number|string} value
 * @return {?TimestampDef}
 */
export function getDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value == 'number') {
    return value;
  }

  if (isString(value)) {
    return parseDate(
    /** @type {string} */
    value);
  }

  value =
  /** @type {!Date} */
  value;
  return value.getTime();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRhdGUuanMiXSwibmFtZXMiOlsiaXNTdHJpbmciLCJUaW1lc3RhbXBEZWYiLCJwYXJzZURhdGUiLCJzIiwidG9Mb3dlckNhc2UiLCJEYXRlIiwibm93IiwicGFyc2VkIiwicGFyc2UiLCJpc05hTiIsImdldERhdGUiLCJ2YWx1ZSIsImdldFRpbWUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFFBQVI7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLFlBQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsU0FBVCxDQUFtQkMsQ0FBbkIsRUFBc0I7QUFDM0IsTUFBSSxDQUFDQSxDQUFMLEVBQVE7QUFDTixXQUFPLElBQVA7QUFDRDs7QUFDRCxNQUFJQSxDQUFDLENBQUNDLFdBQUYsT0FBb0IsS0FBeEIsRUFBK0I7QUFDN0IsV0FBT0MsSUFBSSxDQUFDQyxHQUFMLEVBQVA7QUFDRDs7QUFDRCxNQUFNQyxNQUFNLEdBQUdGLElBQUksQ0FBQ0csS0FBTCxDQUFXTCxDQUFYLENBQWY7QUFDQSxTQUFPTSxLQUFLLENBQUNGLE1BQUQsQ0FBTCxHQUFnQixJQUFoQixHQUF1QkEsTUFBOUI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTRyxPQUFULENBQWlCQyxLQUFqQixFQUF3QjtBQUM3QixNQUFJLENBQUNBLEtBQUwsRUFBWTtBQUNWLFdBQU8sSUFBUDtBQUNEOztBQUNELE1BQUksT0FBT0EsS0FBUCxJQUFnQixRQUFwQixFQUE4QjtBQUM1QixXQUFPQSxLQUFQO0FBQ0Q7O0FBQ0QsTUFBSVgsUUFBUSxDQUFDVyxLQUFELENBQVosRUFBcUI7QUFDbkIsV0FBT1QsU0FBUztBQUFDO0FBQXVCUyxJQUFBQSxLQUF4QixDQUFoQjtBQUNEOztBQUNEQSxFQUFBQSxLQUFLO0FBQUc7QUFBc0JBLEVBQUFBLEtBQTlCO0FBQ0EsU0FBT0EsS0FBSyxDQUFDQyxPQUFOLEVBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjEgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICcuL3N0cmluZyc7XG5cbi8qKiBAZmlsZW92ZXJ2aWV3IGhlbHBlcnMgZm9yIGRlYWxpbmcgd2l0aCBkYXRlcyBhbmQgdGltZXMuICovXG5cbi8qKlxuICogQWJzb2x1dGUgdGltZSBpbiBtaWxsaXNlY29uZHMuXG4gKiBAdHlwZWRlZiB7bnVtYmVyfVxuICovXG5leHBvcnQgbGV0IFRpbWVzdGFtcERlZjtcblxuLyoqXG4gKiBQYXJzZXMgdGhlIGRhdGUgdXNpbmcgdGhlIGBEYXRlLnBhcnNlKClgIHJ1bGVzLiBBZGRpdGlvbmFsbHkgc3VwcG9ydHMgdGhlXG4gKiBrZXl3b3JkIFwibm93XCIgdGhhdCBpbmRpY2F0ZXMgdGhlIFwiY3VycmVudCBkYXRlL3RpbWVcIi4gUmV0dXJucyBlaXRoZXIgYVxuICogdmFsaWQgZXBvY2ggdmFsdWUgb3IgbnVsbC5cbiAqXG4gKiBAcGFyYW0gez9zdHJpbmd8dW5kZWZpbmVkfSBzXG4gKiBAcmV0dXJuIHs/VGltZXN0YW1wRGVmfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEYXRlKHMpIHtcbiAgaWYgKCFzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHMudG9Mb3dlckNhc2UoKSA9PT0gJ25vdycpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKTtcbiAgfVxuICBjb25zdCBwYXJzZWQgPSBEYXRlLnBhcnNlKHMpO1xuICByZXR1cm4gaXNOYU4ocGFyc2VkKSA/IG51bGwgOiBwYXJzZWQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgdmFyaW91cyBkYXRlIGZvcm1hdHMgaW50byBhIHRpbWVzdGFtcCBpbiBtcy5cbiAqIEBwYXJhbSB7IURhdGV8bnVtYmVyfHN0cmluZ30gdmFsdWVcbiAqIEByZXR1cm4gez9UaW1lc3RhbXBEZWZ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREYXRlKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICByZXR1cm4gcGFyc2VEYXRlKC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAodmFsdWUpKTtcbiAgfVxuICB2YWx1ZSA9IC8qKiBAdHlwZSB7IURhdGV9ICovICh2YWx1ZSk7XG4gIHJldHVybiB2YWx1ZS5nZXRUaW1lKCk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/types/date.js