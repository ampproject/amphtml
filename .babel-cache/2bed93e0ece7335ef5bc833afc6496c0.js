function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
 * Some exceptions (DOMException, namely) have read-only message.
 * @param {!Error} error
 * @return {!Error};
 */
export function duplicateErrorIfNecessary(error) {
  var messageProperty = Object.getOwnPropertyDescriptor(error, 'message');

  if (messageProperty != null && messageProperty.writable) {
    return error;
  }

  var message = error.message,
      stack = error.stack;
  var e = new Error(message);

  // Copy all the extraneous things we attach.
  for (var prop in error) {
    e[prop] = error[prop];
  }

  // Ensure these are copied.
  e.stack = stack;
  return e;
}

/**
 * @param {...*} var_args
 * @return {!Error}
 * @visibleForTesting
 */
export function createErrorVargs(var_args) {
  var error = null;
  var message = '';

  for (var _iterator = _createForOfIteratorHelperLoose(arguments), _step; !(_step = _iterator()).done;) {
    var arg = _step.value;

    if (arg instanceof Error && !error) {
      error = duplicateErrorIfNecessary(arg);
    } else {
      if (message) {
        message += ' ';
      }

      message += arg;
    }
  }

  if (!error) {
    error = new Error(message);
  } else if (message) {
    error.message = message + ': ' + error.message;
  }

  return error;
}

/**
 * Rethrows the error without terminating the current context. This preserves
 * whether the original error designation is a user error or a dev error.
 * @param {...*} var_args
 */
export function rethrowAsync(var_args) {
  var error = createErrorVargs.apply(null, arguments);
  setTimeout(function () {
    // __AMP_REPORT_ERROR is installed globally per window in the entry point.
    // It may not exist for Bento components without the runtime.
    self.__AMP_REPORT_ERROR == null ? void 0 : self.__AMP_REPORT_ERROR(error);
    throw error;
  });
}

/**
 * Executes the provided callback in a try/catch and rethrows any errors
 * asynchronously.
 *
 * @param {function(S):T} callback
 * @param {S} args
 * @return {T}
 * @template T
 * @template S
 */
export function tryCallback(callback) {
  try {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return callback.apply(null, args);
  } catch (e) {
    rethrowAsync(e);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImR1cGxpY2F0ZUVycm9ySWZOZWNlc3NhcnkiLCJlcnJvciIsIm1lc3NhZ2VQcm9wZXJ0eSIsIk9iamVjdCIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsIndyaXRhYmxlIiwibWVzc2FnZSIsInN0YWNrIiwiZSIsIkVycm9yIiwicHJvcCIsImNyZWF0ZUVycm9yVmFyZ3MiLCJ2YXJfYXJncyIsImFyZ3VtZW50cyIsImFyZyIsInJldGhyb3dBc3luYyIsImFwcGx5Iiwic2V0VGltZW91dCIsInNlbGYiLCJfX0FNUF9SRVBPUlRfRVJST1IiLCJ0cnlDYWxsYmFjayIsImNhbGxiYWNrIiwiYXJncyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNBLHlCQUFULENBQW1DQyxLQUFuQyxFQUEwQztBQUMvQyxNQUFNQyxlQUFlLEdBQUdDLE1BQU0sQ0FBQ0Msd0JBQVAsQ0FBZ0NILEtBQWhDLEVBQXVDLFNBQXZDLENBQXhCOztBQUNBLE1BQUlDLGVBQUosWUFBSUEsZUFBZSxDQUFFRyxRQUFyQixFQUErQjtBQUM3QixXQUFPSixLQUFQO0FBQ0Q7O0FBRUQsTUFBT0ssT0FBUCxHQUF5QkwsS0FBekIsQ0FBT0ssT0FBUDtBQUFBLE1BQWdCQyxLQUFoQixHQUF5Qk4sS0FBekIsQ0FBZ0JNLEtBQWhCO0FBQ0EsTUFBTUMsQ0FBQyxHQUFHLElBQUlDLEtBQUosQ0FBVUgsT0FBVixDQUFWOztBQUNBO0FBQ0EsT0FBSyxJQUFNSSxJQUFYLElBQW1CVCxLQUFuQixFQUEwQjtBQUN4Qk8sSUFBQUEsQ0FBQyxDQUFDRSxJQUFELENBQUQsR0FBVVQsS0FBSyxDQUFDUyxJQUFELENBQWY7QUFDRDs7QUFDRDtBQUNBRixFQUFBQSxDQUFDLENBQUNELEtBQUYsR0FBVUEsS0FBVjtBQUNBLFNBQU9DLENBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTRyxnQkFBVCxDQUEwQkMsUUFBMUIsRUFBb0M7QUFDekMsTUFBSVgsS0FBSyxHQUFHLElBQVo7QUFDQSxNQUFJSyxPQUFPLEdBQUcsRUFBZDs7QUFDQSx1REFBa0JPLFNBQWxCLHdDQUE2QjtBQUFBLFFBQWxCQyxHQUFrQjs7QUFDM0IsUUFBSUEsR0FBRyxZQUFZTCxLQUFmLElBQXdCLENBQUNSLEtBQTdCLEVBQW9DO0FBQ2xDQSxNQUFBQSxLQUFLLEdBQUdELHlCQUF5QixDQUFDYyxHQUFELENBQWpDO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsVUFBSVIsT0FBSixFQUFhO0FBQ1hBLFFBQUFBLE9BQU8sSUFBSSxHQUFYO0FBQ0Q7O0FBQ0RBLE1BQUFBLE9BQU8sSUFBSVEsR0FBWDtBQUNEO0FBQ0Y7O0FBRUQsTUFBSSxDQUFDYixLQUFMLEVBQVk7QUFDVkEsSUFBQUEsS0FBSyxHQUFHLElBQUlRLEtBQUosQ0FBVUgsT0FBVixDQUFSO0FBQ0QsR0FGRCxNQUVPLElBQUlBLE9BQUosRUFBYTtBQUNsQkwsSUFBQUEsS0FBSyxDQUFDSyxPQUFOLEdBQWdCQSxPQUFPLEdBQUcsSUFBVixHQUFpQkwsS0FBSyxDQUFDSyxPQUF2QztBQUNEOztBQUNELFNBQU9MLEtBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTYyxZQUFULENBQXNCSCxRQUF0QixFQUFnQztBQUNyQyxNQUFNWCxLQUFLLEdBQUdVLGdCQUFnQixDQUFDSyxLQUFqQixDQUF1QixJQUF2QixFQUE2QkgsU0FBN0IsQ0FBZDtBQUNBSSxFQUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmO0FBQ0E7QUFDQUMsSUFBQUEsSUFBSSxDQUFDQyxrQkFBTCxvQkFBQUQsSUFBSSxDQUFDQyxrQkFBTCxDQUEwQmxCLEtBQTFCO0FBQ0EsVUFBTUEsS0FBTjtBQUNELEdBTFMsQ0FBVjtBQU1EOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTbUIsV0FBVCxDQUFxQkMsUUFBckIsRUFBd0M7QUFDN0MsTUFBSTtBQUFBLHNDQURtQ0MsSUFDbkM7QUFEbUNBLE1BQUFBLElBQ25DO0FBQUE7O0FBQ0YsV0FBT0QsUUFBUSxDQUFDTCxLQUFULENBQWUsSUFBZixFQUFxQk0sSUFBckIsQ0FBUDtBQUNELEdBRkQsQ0FFRSxPQUFPZCxDQUFQLEVBQVU7QUFDVk8sSUFBQUEsWUFBWSxDQUFDUCxDQUFELENBQVo7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogU29tZSBleGNlcHRpb25zIChET01FeGNlcHRpb24sIG5hbWVseSkgaGF2ZSByZWFkLW9ubHkgbWVzc2FnZS5cbiAqIEBwYXJhbSB7IUVycm9yfSBlcnJvclxuICogQHJldHVybiB7IUVycm9yfTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGR1cGxpY2F0ZUVycm9ySWZOZWNlc3NhcnkoZXJyb3IpIHtcbiAgY29uc3QgbWVzc2FnZVByb3BlcnR5ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlcnJvciwgJ21lc3NhZ2UnKTtcbiAgaWYgKG1lc3NhZ2VQcm9wZXJ0eT8ud3JpdGFibGUpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cblxuICBjb25zdCB7bWVzc2FnZSwgc3RhY2t9ID0gZXJyb3I7XG4gIGNvbnN0IGUgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIC8vIENvcHkgYWxsIHRoZSBleHRyYW5lb3VzIHRoaW5ncyB3ZSBhdHRhY2guXG4gIGZvciAoY29uc3QgcHJvcCBpbiBlcnJvcikge1xuICAgIGVbcHJvcF0gPSBlcnJvcltwcm9wXTtcbiAgfVxuICAvLyBFbnN1cmUgdGhlc2UgYXJlIGNvcGllZC5cbiAgZS5zdGFjayA9IHN0YWNrO1xuICByZXR1cm4gZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzXG4gKiBAcmV0dXJuIHshRXJyb3J9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVycm9yVmFyZ3ModmFyX2FyZ3MpIHtcbiAgbGV0IGVycm9yID0gbnVsbDtcbiAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgZm9yIChjb25zdCBhcmcgb2YgYXJndW1lbnRzKSB7XG4gICAgaWYgKGFyZyBpbnN0YW5jZW9mIEVycm9yICYmICFlcnJvcikge1xuICAgICAgZXJyb3IgPSBkdXBsaWNhdGVFcnJvcklmTmVjZXNzYXJ5KGFyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgIG1lc3NhZ2UgKz0gJyAnO1xuICAgICAgfVxuICAgICAgbWVzc2FnZSArPSBhcmc7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFlcnJvcikge1xuICAgIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICB9IGVsc2UgaWYgKG1lc3NhZ2UpIHtcbiAgICBlcnJvci5tZXNzYWdlID0gbWVzc2FnZSArICc6ICcgKyBlcnJvci5tZXNzYWdlO1xuICB9XG4gIHJldHVybiBlcnJvcjtcbn1cblxuLyoqXG4gKiBSZXRocm93cyB0aGUgZXJyb3Igd2l0aG91dCB0ZXJtaW5hdGluZyB0aGUgY3VycmVudCBjb250ZXh0LiBUaGlzIHByZXNlcnZlc1xuICogd2hldGhlciB0aGUgb3JpZ2luYWwgZXJyb3IgZGVzaWduYXRpb24gaXMgYSB1c2VyIGVycm9yIG9yIGEgZGV2IGVycm9yLlxuICogQHBhcmFtIHsuLi4qfSB2YXJfYXJnc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmV0aHJvd0FzeW5jKHZhcl9hcmdzKSB7XG4gIGNvbnN0IGVycm9yID0gY3JlYXRlRXJyb3JWYXJncy5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAvLyBfX0FNUF9SRVBPUlRfRVJST1IgaXMgaW5zdGFsbGVkIGdsb2JhbGx5IHBlciB3aW5kb3cgaW4gdGhlIGVudHJ5IHBvaW50LlxuICAgIC8vIEl0IG1heSBub3QgZXhpc3QgZm9yIEJlbnRvIGNvbXBvbmVudHMgd2l0aG91dCB0aGUgcnVudGltZS5cbiAgICBzZWxmLl9fQU1QX1JFUE9SVF9FUlJPUj8uKGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfSk7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGNhbGxiYWNrIGluIGEgdHJ5L2NhdGNoIGFuZCByZXRocm93cyBhbnkgZXJyb3JzXG4gKiBhc3luY2hyb25vdXNseS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKFMpOlR9IGNhbGxiYWNrXG4gKiBAcGFyYW0ge1N9IGFyZ3NcbiAqIEByZXR1cm4ge1R9XG4gKiBAdGVtcGxhdGUgVFxuICogQHRlbXBsYXRlIFNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUNhbGxiYWNrKGNhbGxiYWNrLCAuLi5hcmdzKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0aHJvd0FzeW5jKGUpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/error/index.js