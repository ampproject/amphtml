/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 * Forces the return value from Map.prototype.set to always be the map
 * instance. IE11 returns undefined.
 *
 * @param {!Window} win
 */
export function install(win) {
  var Map = win.Map;
  var m = new Map();

  if (m.set(0, 0) !== m) {
    var set = m.set;
    win.Object.defineProperty(Map.prototype, 'set', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function value() {
        set.apply(this, arguments);
        return this;
      }
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hcC1zZXQuanMiXSwibmFtZXMiOlsiaW5zdGFsbCIsIndpbiIsIk1hcCIsIm0iLCJzZXQiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsInByb3RvdHlwZSIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsInZhbHVlIiwiYXBwbHkiLCJhcmd1bWVudHMiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNBLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQzNCLE1BQU9DLEdBQVAsR0FBY0QsR0FBZCxDQUFPQyxHQUFQO0FBQ0EsTUFBTUMsQ0FBQyxHQUFHLElBQUlELEdBQUosRUFBVjs7QUFDQSxNQUFJQyxDQUFDLENBQUNDLEdBQUYsQ0FBTSxDQUFOLEVBQVMsQ0FBVCxNQUFnQkQsQ0FBcEIsRUFBdUI7QUFDckIsUUFBT0MsR0FBUCxHQUFjRCxDQUFkLENBQU9DLEdBQVA7QUFFQUgsSUFBQUEsR0FBRyxDQUFDSSxNQUFKLENBQVdDLGNBQVgsQ0FBMEJKLEdBQUcsQ0FBQ0ssU0FBOUIsRUFBeUMsS0FBekMsRUFBZ0Q7QUFDOUNDLE1BQUFBLFVBQVUsRUFBRSxLQURrQztBQUU5Q0MsTUFBQUEsWUFBWSxFQUFFLElBRmdDO0FBRzlDQyxNQUFBQSxRQUFRLEVBQUUsSUFIb0M7QUFJOUNDLE1BQUFBLEtBQUssRUFBRSxpQkFBWTtBQUNqQlAsUUFBQUEsR0FBRyxDQUFDUSxLQUFKLENBQVUsSUFBVixFQUFnQkMsU0FBaEI7QUFDQSxlQUFPLElBQVA7QUFDRDtBQVA2QyxLQUFoRDtBQVNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBGb3JjZXMgdGhlIHJldHVybiB2YWx1ZSBmcm9tIE1hcC5wcm90b3R5cGUuc2V0IHRvIGFsd2F5cyBiZSB0aGUgbWFwXG4gKiBpbnN0YW5jZS4gSUUxMSByZXR1cm5zIHVuZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbCh3aW4pIHtcbiAgY29uc3Qge01hcH0gPSB3aW47XG4gIGNvbnN0IG0gPSBuZXcgTWFwKCk7XG4gIGlmIChtLnNldCgwLCAwKSAhPT0gbSkge1xuICAgIGNvbnN0IHtzZXR9ID0gbTtcblxuICAgIHdpbi5PYmplY3QuZGVmaW5lUHJvcGVydHkoTWFwLnByb3RvdHlwZSwgJ3NldCcsIHtcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBzZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/polyfills/map-set.js