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

/**
 * Checks whether `val` is a valid value of `enumObj`.
 *
 * @param {!Object<T>} enumObj
 * @param {T} val
 * @return {boolean}
 * @template T
 */
export function isEnumValue(enumObj, val) {
  for (var k in enumObj) {
    if (enumObj[k] === val) {
      return true;
    }
  }

  return false;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVudW0uanMiXSwibmFtZXMiOlsiaXNFbnVtVmFsdWUiLCJlbnVtT2JqIiwidmFsIiwiayJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNBLFdBQVQsQ0FBcUJDLE9BQXJCLEVBQThCQyxHQUE5QixFQUFtQztBQUN4QyxPQUFLLElBQU1DLENBQVgsSUFBZ0JGLE9BQWhCLEVBQXlCO0FBQ3ZCLFFBQUlBLE9BQU8sQ0FBQ0UsQ0FBRCxDQUFQLEtBQWVELEdBQW5CLEVBQXdCO0FBQ3RCLGFBQU8sSUFBUDtBQUNEO0FBQ0Y7O0FBQ0QsU0FBTyxLQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBgdmFsYCBpcyBhIHZhbGlkIHZhbHVlIG9mIGBlbnVtT2JqYC5cbiAqXG4gKiBAcGFyYW0geyFPYmplY3Q8VD59IGVudW1PYmpcbiAqIEBwYXJhbSB7VH0gdmFsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW51bVZhbHVlKGVudW1PYmosIHZhbCkge1xuICBmb3IgKGNvbnN0IGsgaW4gZW51bU9iaikge1xuICAgIGlmIChlbnVtT2JqW2tdID09PSB2YWwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/types/enum.js