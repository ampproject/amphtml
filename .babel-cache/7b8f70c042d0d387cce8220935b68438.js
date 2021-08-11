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
 * Forces the return value from WeakMap.prototype.set to always be the map
 * instance. IE11 returns undefined.
 *
 * @param {!Window} win
 */
export function install(win) {
  var WeakMap = win.WeakMap;
  var m = new WeakMap();

  if (m.set({}, 0) !== m) {
    var set = m.set;
    win.Object.defineProperty(WeakMap.prototype, 'set', {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYWttYXAtc2V0LmpzIl0sIm5hbWVzIjpbImluc3RhbGwiLCJ3aW4iLCJXZWFrTWFwIiwibSIsInNldCIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwicHJvdG90eXBlIiwiZW51bWVyYWJsZSIsImNvbmZpZ3VyYWJsZSIsIndyaXRhYmxlIiwidmFsdWUiLCJhcHBseSIsImFyZ3VtZW50cyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0EsT0FBVCxDQUFpQkMsR0FBakIsRUFBc0I7QUFDM0IsTUFBT0MsT0FBUCxHQUFrQkQsR0FBbEIsQ0FBT0MsT0FBUDtBQUNBLE1BQU1DLENBQUMsR0FBRyxJQUFJRCxPQUFKLEVBQVY7O0FBQ0EsTUFBSUMsQ0FBQyxDQUFDQyxHQUFGLENBQU0sRUFBTixFQUFVLENBQVYsTUFBaUJELENBQXJCLEVBQXdCO0FBQ3RCLFFBQU9DLEdBQVAsR0FBY0QsQ0FBZCxDQUFPQyxHQUFQO0FBRUFILElBQUFBLEdBQUcsQ0FBQ0ksTUFBSixDQUFXQyxjQUFYLENBQTBCSixPQUFPLENBQUNLLFNBQWxDLEVBQTZDLEtBQTdDLEVBQW9EO0FBQ2xEQyxNQUFBQSxVQUFVLEVBQUUsS0FEc0M7QUFFbERDLE1BQUFBLFlBQVksRUFBRSxJQUZvQztBQUdsREMsTUFBQUEsUUFBUSxFQUFFLElBSHdDO0FBSWxEQyxNQUFBQSxLQUFLLEVBQUUsaUJBQVk7QUFDakJQLFFBQUFBLEdBQUcsQ0FBQ1EsS0FBSixDQUFVLElBQVYsRUFBZ0JDLFNBQWhCO0FBQ0EsZUFBTyxJQUFQO0FBQ0Q7QUFQaUQsS0FBcEQ7QUFTRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogRm9yY2VzIHRoZSByZXR1cm4gdmFsdWUgZnJvbSBXZWFrTWFwLnByb3RvdHlwZS5zZXQgdG8gYWx3YXlzIGJlIHRoZSBtYXBcbiAqIGluc3RhbmNlLiBJRTExIHJldHVybnMgdW5kZWZpbmVkLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsKHdpbikge1xuICBjb25zdCB7V2Vha01hcH0gPSB3aW47XG4gIGNvbnN0IG0gPSBuZXcgV2Vha01hcCgpO1xuICBpZiAobS5zZXQoe30sIDApICE9PSBtKSB7XG4gICAgY29uc3Qge3NldH0gPSBtO1xuXG4gICAgd2luLk9iamVjdC5kZWZpbmVQcm9wZXJ0eShXZWFrTWFwLnByb3RvdHlwZSwgJ3NldCcsIHtcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBzZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/polyfills/weakmap-set.js