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
import { toArray } from "../core/types/array";

/**
 * @param {!Window} win
 */
export function install(win) {
  var SetConstructor = win.Set;
  var s = new SetConstructor([1]);

  // Add suppport for `new Set(iterable)`. IE11 lacks it.
  if (s.size < 1) {
    win.Set =
    /** @type {typeof Set} */
    function (iterable) {
      var set = new SetConstructor();

      if (iterable) {
        var asArray = toArray(iterable);

        for (var i = 0; i < asArray.length; i++) {
          set.add(asArray[i]);
        }
      }

      return set;
    };
  }

  // Forces the return value from Set.prototype.add to always be the set
  // instance. IE11 returns undefined.
  if (s.add(0) !== s) {
    var add = s.add;
    win.Object.defineProperty(SetConstructor.prototype, 'add', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function value() {
        add.apply(this, arguments);
        return this;
      }
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNldC5qcyJdLCJuYW1lcyI6WyJ0b0FycmF5IiwiaW5zdGFsbCIsIndpbiIsIlNldENvbnN0cnVjdG9yIiwiU2V0IiwicyIsInNpemUiLCJpdGVyYWJsZSIsInNldCIsImFzQXJyYXkiLCJpIiwibGVuZ3RoIiwiYWRkIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJwcm90b3R5cGUiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJ2YWx1ZSIsImFwcGx5IiwiYXJndW1lbnRzIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxPQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsT0FBVCxDQUFpQkMsR0FBakIsRUFBc0I7QUFDM0IsTUFBWUMsY0FBWixHQUE4QkQsR0FBOUIsQ0FBT0UsR0FBUDtBQUNBLE1BQU1DLENBQUMsR0FBRyxJQUFJRixjQUFKLENBQW1CLENBQUMsQ0FBRCxDQUFuQixDQUFWOztBQUNBO0FBQ0EsTUFBSUUsQ0FBQyxDQUFDQyxJQUFGLEdBQVMsQ0FBYixFQUFnQjtBQUNkSixJQUFBQSxHQUFHLENBQUNFLEdBQUo7QUFBVTtBQUNSLGNBQVVHLFFBQVYsRUFBb0I7QUFDbEIsVUFBTUMsR0FBRyxHQUFHLElBQUlMLGNBQUosRUFBWjs7QUFDQSxVQUFJSSxRQUFKLEVBQWM7QUFDWixZQUFNRSxPQUFPLEdBQUdULE9BQU8sQ0FBQ08sUUFBRCxDQUF2Qjs7QUFDQSxhQUFLLElBQUlHLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdELE9BQU8sQ0FBQ0UsTUFBNUIsRUFBb0NELENBQUMsRUFBckMsRUFBeUM7QUFDdkNGLFVBQUFBLEdBQUcsQ0FBQ0ksR0FBSixDQUFRSCxPQUFPLENBQUNDLENBQUQsQ0FBZjtBQUNEO0FBQ0Y7O0FBQ0QsYUFBT0YsR0FBUDtBQUNELEtBVkg7QUFZRDs7QUFDRDtBQUNBO0FBQ0EsTUFBSUgsQ0FBQyxDQUFDTyxHQUFGLENBQU0sQ0FBTixNQUFhUCxDQUFqQixFQUFvQjtBQUNsQixRQUFPTyxHQUFQLEdBQWNQLENBQWQsQ0FBT08sR0FBUDtBQUVBVixJQUFBQSxHQUFHLENBQUNXLE1BQUosQ0FBV0MsY0FBWCxDQUEwQlgsY0FBYyxDQUFDWSxTQUF6QyxFQUFvRCxLQUFwRCxFQUEyRDtBQUN6REMsTUFBQUEsVUFBVSxFQUFFLEtBRDZDO0FBRXpEQyxNQUFBQSxZQUFZLEVBQUUsSUFGMkM7QUFHekRDLE1BQUFBLFFBQVEsRUFBRSxJQUgrQztBQUl6REMsTUFBQUEsS0FBSyxFQUFFLGlCQUFZO0FBQ2pCUCxRQUFBQSxHQUFHLENBQUNRLEtBQUosQ0FBVSxJQUFWLEVBQWdCQyxTQUFoQjtBQUNBLGVBQU8sSUFBUDtBQUNEO0FBUHdELEtBQTNEO0FBU0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge3RvQXJyYXl9IGZyb20gJyNjb3JlL3R5cGVzL2FycmF5JztcblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbCh3aW4pIHtcbiAgY29uc3Qge1NldDogU2V0Q29uc3RydWN0b3J9ID0gd2luO1xuICBjb25zdCBzID0gbmV3IFNldENvbnN0cnVjdG9yKFsxXSk7XG4gIC8vIEFkZCBzdXBwcG9ydCBmb3IgYG5ldyBTZXQoaXRlcmFibGUpYC4gSUUxMSBsYWNrcyBpdC5cbiAgaWYgKHMuc2l6ZSA8IDEpIHtcbiAgICB3aW4uU2V0ID0gLyoqIEB0eXBlIHt0eXBlb2YgU2V0fSAqLyAoXG4gICAgICBmdW5jdGlvbiAoaXRlcmFibGUpIHtcbiAgICAgICAgY29uc3Qgc2V0ID0gbmV3IFNldENvbnN0cnVjdG9yKCk7XG4gICAgICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgICAgIGNvbnN0IGFzQXJyYXkgPSB0b0FycmF5KGl0ZXJhYmxlKTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFzQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNldC5hZGQoYXNBcnJheVtpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXQ7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuICAvLyBGb3JjZXMgdGhlIHJldHVybiB2YWx1ZSBmcm9tIFNldC5wcm90b3R5cGUuYWRkIHRvIGFsd2F5cyBiZSB0aGUgc2V0XG4gIC8vIGluc3RhbmNlLiBJRTExIHJldHVybnMgdW5kZWZpbmVkLlxuICBpZiAocy5hZGQoMCkgIT09IHMpIHtcbiAgICBjb25zdCB7YWRkfSA9IHM7XG5cbiAgICB3aW4uT2JqZWN0LmRlZmluZVByb3BlcnR5KFNldENvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2FkZCcsIHtcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBhZGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/polyfills/set.js