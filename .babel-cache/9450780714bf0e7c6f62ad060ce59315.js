/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/** @fileoverview Helpers to wrap functions. */

/**
 * Creates a function that is evaluated only once and returns the cached result
 * subsequently.
 *
 * Please note that `once` only takes the function definition into account,
 * so it will return the same cached value even when the arguments are
 * different.
 *
 * @param {function(...):T} fn
 * @return {function(...):T}
 * @template T
 */
export function once(fn) {
  var evaluated = false;
  var retValue = null;
  var callback = fn;
  return function () {
    if (!evaluated) {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      retValue = callback.apply(self, args);
      evaluated = true;
      callback = null;
    }

    return retValue;
  };
}

/**
 * Wraps a given callback and applies a rate limit.
 * It throttles the calls so that no consequent calls have time interval
 * smaller than the given minimal interval.
 *
 * @param {!Window} win
 * @param {function(...T):R} callback
 * @param {number} minInterval the minimum time interval in millisecond
 * @return {function(...T)}
 * @template T
 * @template R
 */
export function throttle(win, callback, minInterval) {
  var locker = 0;
  var nextCallArgs = null;

  /**
   * @param {!Object} args
   */
  function fire(args) {
    nextCallArgs = null;
    // Lock the fire for minInterval milliseconds
    locker = win.setTimeout(waiter, minInterval);
    callback.apply(null, args);
  }

  /**
   * Waiter function
   */
  function waiter() {
    locker = 0;

    // If during the period there're invocations queued up, fire once.
    if (nextCallArgs) {
      fire(nextCallArgs);
    }
  }

  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (locker) {
      nextCallArgs = args;
    } else {
      fire(args);
    }
  };
}

/**
 * Wraps a given callback and applies a wait timer, so that minInterval
 * milliseconds must pass since the last call before the callback is actually
 * invoked.
 *
 * @param {!Window} win
 * @param {function(...T):R} callback
 * @param {number} minInterval the minimum time interval in millisecond
 * @return {function(...T)}
 * @template T
 * @template R
 */
export function debounce(win, callback, minInterval) {
  var locker = 0;
  var timestamp = 0;
  var nextCallArgs = null;

  /**
   * @param {?Array} args
   */
  function fire(args) {
    nextCallArgs = null;
    callback.apply(null, args);
  }

  /**
   * Wait function for debounce
   */
  function waiter() {
    locker = 0;
    var remaining = minInterval - (win.Date.now() - timestamp);

    if (remaining > 0) {
      locker = win.setTimeout(waiter, remaining);
    } else {
      fire(nextCallArgs);
    }
  }

  return function () {
    timestamp = win.Date.now();

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    nextCallArgs = args;

    if (!locker) {
      locker = win.setTimeout(waiter, minInterval);
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIm9uY2UiLCJmbiIsImV2YWx1YXRlZCIsInJldFZhbHVlIiwiY2FsbGJhY2siLCJhcmdzIiwiYXBwbHkiLCJzZWxmIiwidGhyb3R0bGUiLCJ3aW4iLCJtaW5JbnRlcnZhbCIsImxvY2tlciIsIm5leHRDYWxsQXJncyIsImZpcmUiLCJzZXRUaW1lb3V0Iiwid2FpdGVyIiwiZGVib3VuY2UiLCJ0aW1lc3RhbXAiLCJyZW1haW5pbmciLCJEYXRlIiwibm93Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQSxJQUFULENBQWNDLEVBQWQsRUFBa0I7QUFDdkIsTUFBSUMsU0FBUyxHQUFHLEtBQWhCO0FBQ0EsTUFBSUMsUUFBUSxHQUFHLElBQWY7QUFDQSxNQUFJQyxRQUFRLEdBQUdILEVBQWY7QUFDQSxTQUFPLFlBQWE7QUFDbEIsUUFBSSxDQUFDQyxTQUFMLEVBQWdCO0FBQUEsd0NBRFBHLElBQ087QUFEUEEsUUFBQUEsSUFDTztBQUFBOztBQUNkRixNQUFBQSxRQUFRLEdBQUdDLFFBQVEsQ0FBQ0UsS0FBVCxDQUFlQyxJQUFmLEVBQXFCRixJQUFyQixDQUFYO0FBQ0FILE1BQUFBLFNBQVMsR0FBRyxJQUFaO0FBQ0FFLE1BQUFBLFFBQVEsR0FBRyxJQUFYO0FBQ0Q7O0FBQ0QsV0FBT0QsUUFBUDtBQUNELEdBUEQ7QUFRRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNLLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXVCTCxRQUF2QixFQUFpQ00sV0FBakMsRUFBOEM7QUFDbkQsTUFBSUMsTUFBTSxHQUFHLENBQWI7QUFDQSxNQUFJQyxZQUFZLEdBQUcsSUFBbkI7O0FBRUE7QUFDRjtBQUNBO0FBQ0UsV0FBU0MsSUFBVCxDQUFjUixJQUFkLEVBQW9CO0FBQ2xCTyxJQUFBQSxZQUFZLEdBQUcsSUFBZjtBQUNBO0FBQ0FELElBQUFBLE1BQU0sR0FBR0YsR0FBRyxDQUFDSyxVQUFKLENBQWVDLE1BQWYsRUFBdUJMLFdBQXZCLENBQVQ7QUFFQU4sSUFBQUEsUUFBUSxDQUFDRSxLQUFULENBQWUsSUFBZixFQUFxQkQsSUFBckI7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDRSxXQUFTVSxNQUFULEdBQWtCO0FBQ2hCSixJQUFBQSxNQUFNLEdBQUcsQ0FBVDs7QUFDQTtBQUNBLFFBQUlDLFlBQUosRUFBa0I7QUFDaEJDLE1BQUFBLElBQUksQ0FBQ0QsWUFBRCxDQUFKO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPLFlBQW1CO0FBQUEsdUNBQU5QLElBQU07QUFBTkEsTUFBQUEsSUFBTTtBQUFBOztBQUN4QixRQUFJTSxNQUFKLEVBQVk7QUFDVkMsTUFBQUEsWUFBWSxHQUFHUCxJQUFmO0FBQ0QsS0FGRCxNQUVPO0FBQ0xRLE1BQUFBLElBQUksQ0FBQ1IsSUFBRCxDQUFKO0FBQ0Q7QUFDRixHQU5EO0FBT0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTVyxRQUFULENBQWtCUCxHQUFsQixFQUF1QkwsUUFBdkIsRUFBaUNNLFdBQWpDLEVBQThDO0FBQ25ELE1BQUlDLE1BQU0sR0FBRyxDQUFiO0FBQ0EsTUFBSU0sU0FBUyxHQUFHLENBQWhCO0FBQ0EsTUFBSUwsWUFBWSxHQUFHLElBQW5COztBQUVBO0FBQ0Y7QUFDQTtBQUNFLFdBQVNDLElBQVQsQ0FBY1IsSUFBZCxFQUFvQjtBQUNsQk8sSUFBQUEsWUFBWSxHQUFHLElBQWY7QUFDQVIsSUFBQUEsUUFBUSxDQUFDRSxLQUFULENBQWUsSUFBZixFQUFxQkQsSUFBckI7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDRSxXQUFTVSxNQUFULEdBQWtCO0FBQ2hCSixJQUFBQSxNQUFNLEdBQUcsQ0FBVDtBQUNBLFFBQU1PLFNBQVMsR0FBR1IsV0FBVyxJQUFJRCxHQUFHLENBQUNVLElBQUosQ0FBU0MsR0FBVCxLQUFpQkgsU0FBckIsQ0FBN0I7O0FBQ0EsUUFBSUMsU0FBUyxHQUFHLENBQWhCLEVBQW1CO0FBQ2pCUCxNQUFBQSxNQUFNLEdBQUdGLEdBQUcsQ0FBQ0ssVUFBSixDQUFlQyxNQUFmLEVBQXVCRyxTQUF2QixDQUFUO0FBQ0QsS0FGRCxNQUVPO0FBQ0xMLE1BQUFBLElBQUksQ0FBQ0QsWUFBRCxDQUFKO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPLFlBQW1CO0FBQ3hCSyxJQUFBQSxTQUFTLEdBQUdSLEdBQUcsQ0FBQ1UsSUFBSixDQUFTQyxHQUFULEVBQVo7O0FBRHdCLHVDQUFOZixJQUFNO0FBQU5BLE1BQUFBLElBQU07QUFBQTs7QUFFeEJPLElBQUFBLFlBQVksR0FBR1AsSUFBZjs7QUFDQSxRQUFJLENBQUNNLE1BQUwsRUFBYTtBQUNYQSxNQUFBQSxNQUFNLEdBQUdGLEdBQUcsQ0FBQ0ssVUFBSixDQUFlQyxNQUFmLEVBQXVCTCxXQUF2QixDQUFUO0FBQ0Q7QUFDRixHQU5EO0FBT0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqIEBmaWxlb3ZlcnZpZXcgSGVscGVycyB0byB3cmFwIGZ1bmN0aW9ucy4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBpcyBldmFsdWF0ZWQgb25seSBvbmNlIGFuZCByZXR1cm5zIHRoZSBjYWNoZWQgcmVzdWx0XG4gKiBzdWJzZXF1ZW50bHkuXG4gKlxuICogUGxlYXNlIG5vdGUgdGhhdCBgb25jZWAgb25seSB0YWtlcyB0aGUgZnVuY3Rpb24gZGVmaW5pdGlvbiBpbnRvIGFjY291bnQsXG4gKiBzbyBpdCB3aWxsIHJldHVybiB0aGUgc2FtZSBjYWNoZWQgdmFsdWUgZXZlbiB3aGVuIHRoZSBhcmd1bWVudHMgYXJlXG4gKiBkaWZmZXJlbnQuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbiguLi4pOlR9IGZuXG4gKiBAcmV0dXJuIHtmdW5jdGlvbiguLi4pOlR9XG4gKiBAdGVtcGxhdGUgVFxuICovXG5leHBvcnQgZnVuY3Rpb24gb25jZShmbikge1xuICBsZXQgZXZhbHVhdGVkID0gZmFsc2U7XG4gIGxldCByZXRWYWx1ZSA9IG51bGw7XG4gIGxldCBjYWxsYmFjayA9IGZuO1xuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAoIWV2YWx1YXRlZCkge1xuICAgICAgcmV0VmFsdWUgPSBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgIGV2YWx1YXRlZCA9IHRydWU7XG4gICAgICBjYWxsYmFjayA9IG51bGw7IC8vIEdDXG4gICAgfVxuICAgIHJldHVybiByZXRWYWx1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBXcmFwcyBhIGdpdmVuIGNhbGxiYWNrIGFuZCBhcHBsaWVzIGEgcmF0ZSBsaW1pdC5cbiAqIEl0IHRocm90dGxlcyB0aGUgY2FsbHMgc28gdGhhdCBubyBjb25zZXF1ZW50IGNhbGxzIGhhdmUgdGltZSBpbnRlcnZhbFxuICogc21hbGxlciB0aGFuIHRoZSBnaXZlbiBtaW5pbWFsIGludGVydmFsLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKC4uLlQpOlJ9IGNhbGxiYWNrXG4gKiBAcGFyYW0ge251bWJlcn0gbWluSW50ZXJ2YWwgdGhlIG1pbmltdW0gdGltZSBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZFxuICogQHJldHVybiB7ZnVuY3Rpb24oLi4uVCl9XG4gKiBAdGVtcGxhdGUgVFxuICogQHRlbXBsYXRlIFJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRocm90dGxlKHdpbiwgY2FsbGJhY2ssIG1pbkludGVydmFsKSB7XG4gIGxldCBsb2NrZXIgPSAwO1xuICBsZXQgbmV4dENhbGxBcmdzID0gbnVsbDtcblxuICAvKipcbiAgICogQHBhcmFtIHshT2JqZWN0fSBhcmdzXG4gICAqL1xuICBmdW5jdGlvbiBmaXJlKGFyZ3MpIHtcbiAgICBuZXh0Q2FsbEFyZ3MgPSBudWxsO1xuICAgIC8vIExvY2sgdGhlIGZpcmUgZm9yIG1pbkludGVydmFsIG1pbGxpc2Vjb25kc1xuICAgIGxvY2tlciA9IHdpbi5zZXRUaW1lb3V0KHdhaXRlciwgbWluSW50ZXJ2YWwpO1xuXG4gICAgY2FsbGJhY2suYXBwbHkobnVsbCwgYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogV2FpdGVyIGZ1bmN0aW9uXG4gICAqL1xuICBmdW5jdGlvbiB3YWl0ZXIoKSB7XG4gICAgbG9ja2VyID0gMDtcbiAgICAvLyBJZiBkdXJpbmcgdGhlIHBlcmlvZCB0aGVyZSdyZSBpbnZvY2F0aW9ucyBxdWV1ZWQgdXAsIGZpcmUgb25jZS5cbiAgICBpZiAobmV4dENhbGxBcmdzKSB7XG4gICAgICBmaXJlKG5leHRDYWxsQXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgaWYgKGxvY2tlcikge1xuICAgICAgbmV4dENhbGxBcmdzID0gYXJncztcbiAgICB9IGVsc2Uge1xuICAgICAgZmlyZShhcmdzKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogV3JhcHMgYSBnaXZlbiBjYWxsYmFjayBhbmQgYXBwbGllcyBhIHdhaXQgdGltZXIsIHNvIHRoYXQgbWluSW50ZXJ2YWxcbiAqIG1pbGxpc2Vjb25kcyBtdXN0IHBhc3Mgc2luY2UgdGhlIGxhc3QgY2FsbCBiZWZvcmUgdGhlIGNhbGxiYWNrIGlzIGFjdHVhbGx5XG4gKiBpbnZva2VkLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKC4uLlQpOlJ9IGNhbGxiYWNrXG4gKiBAcGFyYW0ge251bWJlcn0gbWluSW50ZXJ2YWwgdGhlIG1pbmltdW0gdGltZSBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZFxuICogQHJldHVybiB7ZnVuY3Rpb24oLi4uVCl9XG4gKiBAdGVtcGxhdGUgVFxuICogQHRlbXBsYXRlIFJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlYm91bmNlKHdpbiwgY2FsbGJhY2ssIG1pbkludGVydmFsKSB7XG4gIGxldCBsb2NrZXIgPSAwO1xuICBsZXQgdGltZXN0YW1wID0gMDtcbiAgbGV0IG5leHRDYWxsQXJncyA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7P0FycmF5fSBhcmdzXG4gICAqL1xuICBmdW5jdGlvbiBmaXJlKGFyZ3MpIHtcbiAgICBuZXh0Q2FsbEFyZ3MgPSBudWxsO1xuICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZnVuY3Rpb24gZm9yIGRlYm91bmNlXG4gICAqL1xuICBmdW5jdGlvbiB3YWl0ZXIoKSB7XG4gICAgbG9ja2VyID0gMDtcbiAgICBjb25zdCByZW1haW5pbmcgPSBtaW5JbnRlcnZhbCAtICh3aW4uRGF0ZS5ub3coKSAtIHRpbWVzdGFtcCk7XG4gICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgIGxvY2tlciA9IHdpbi5zZXRUaW1lb3V0KHdhaXRlciwgcmVtYWluaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmlyZShuZXh0Q2FsbEFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIHRpbWVzdGFtcCA9IHdpbi5EYXRlLm5vdygpO1xuICAgIG5leHRDYWxsQXJncyA9IGFyZ3M7XG4gICAgaWYgKCFsb2NrZXIpIHtcbiAgICAgIGxvY2tlciA9IHdpbi5zZXRUaW1lb3V0KHdhaXRlciwgbWluSW50ZXJ2YWwpO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/types/function/index.js