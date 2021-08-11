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
 * Converts an array-like object to an array.
 * @param {?IArrayLike<T>|string} arrayLike
 * @return {!Array<T>}
 * @template T
 */
export function toArray(arrayLike) {
  return arrayLike ? Array.prototype.slice.call(arrayLike) : [];
}

/**
 * Determines if value is actually an Array.
 * @param {*} value
 * @return {boolean}
 */
var isArray = Array.isArray;
export { isArray };

/**
 * If the specified argument is an array, it's returned as is. If it's a
 * single item, the array containing this item is created and returned.
 *
 * The double-template pattern here solves a bug where CC can be passed a value
 * with declared type {string|!Array<string>} and return a value with a type of
 * {!Array<string|Array<string>>}.
 *
 * @param {!Array<T>|S} arrayOrSingleItem
 * @return {!Array<T>|!Array<S>}
 * @template S
 * @template T
 */
export function arrayOrSingleItemToArray(arrayOrSingleItem) {
  return isArray(arrayOrSingleItem) ?
  /** @type {!Array<T>} */
  arrayOrSingleItem : [
  /** @type {!S} */
  arrayOrSingleItem];
}

/**
 * Compares if two arrays contains exactly same elements of same number
 * of same order. Note that it does NOT handle NaN case as expected.
 *
 * @param {!Array<T>} arr1
 * @param {!Array<T>} arr2
 * @return {boolean}
 * @template T
 */
export function areEqualOrdered(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Removes elements that shouldRemove returns true for from the array.
 *
 * @param {!Array<T>} array
 * @param {function(T, number, !Array<T>):boolean} shouldRemove
 * @return {!Array<T>}
 * @template T
 */
export function remove(array, shouldRemove) {
  var removed = [];
  var index = 0;

  for (var i = 0; i < array.length; i++) {
    var item = array[i];

    if (shouldRemove(item, i, array)) {
      removed.push(item);
    } else {
      if (index < i) {
        array[index] = item;
      }

      index++;
    }
  }

  if (index < array.length) {
    array.length = index;
  }

  return removed;
}

/**
 * Returns the index of the first element matching the predicate.
 * Like Array#findIndex.
 *
 * @param {!Array<T>} array
 * @param {function(T, number, !Array<T>):boolean} predicate
 * @return {number}
 * @template T
 */
export function findIndex(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }

  return -1;
}

/**
 * Converts the given iterator to an array.
 *
 * @param {!Iterator<T>} iterator
 * @return {Array<T>}
 * @template T
 */
export function fromIterator(iterator) {
  var array = [];

  for (var e = iterator.next(); !e.done; e = iterator.next()) {
    array.push(e.value);
  }

  return array;
}

/**
 * Adds item to array if it is not already present.
 *
 * @param {Array<T>} array
 * @param {T} item
 * @return {boolean}
 * @template T
 */
export function pushIfNotExist(array, item) {
  if (array.indexOf(item) < 0) {
    array.push(item);
    return true;
  }

  return false;
}

/**
 * Removes the first matching item in the array. Returns `true` if the array
 * has changed.
 *
 * @param {!Array<T>} array
 * @param {T} item
 * @return {boolean}
 * @template T
 */
export function removeItem(array, item) {
  var index = array.indexOf(item);

  if (index == -1) {
    return false;
  }

  array.splice(index, 1);
  return true;
}

/**
 * Returns the last item in an array.
 *
 * @param {Array<T>} array
 * @template T
 * @return {?T}
 */
export function lastItem(array) {
  return array[array.length - 1];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFycmF5LmpzIl0sIm5hbWVzIjpbInRvQXJyYXkiLCJhcnJheUxpa2UiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImlzQXJyYXkiLCJhcnJheU9yU2luZ2xlSXRlbVRvQXJyYXkiLCJhcnJheU9yU2luZ2xlSXRlbSIsImFyZUVxdWFsT3JkZXJlZCIsImFycjEiLCJhcnIyIiwibGVuZ3RoIiwiaSIsInJlbW92ZSIsImFycmF5Iiwic2hvdWxkUmVtb3ZlIiwicmVtb3ZlZCIsImluZGV4IiwiaXRlbSIsInB1c2giLCJmaW5kSW5kZXgiLCJwcmVkaWNhdGUiLCJmcm9tSXRlcmF0b3IiLCJpdGVyYXRvciIsImUiLCJuZXh0IiwiZG9uZSIsInZhbHVlIiwicHVzaElmTm90RXhpc3QiLCJpbmRleE9mIiwicmVtb3ZlSXRlbSIsInNwbGljZSIsImxhc3RJdGVtIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQSxPQUFULENBQWlCQyxTQUFqQixFQUE0QjtBQUNqQyxTQUFPQSxTQUFTLEdBQUdDLEtBQUssQ0FBQ0MsU0FBTixDQUFnQkMsS0FBaEIsQ0FBc0JDLElBQXRCLENBQTJCSixTQUEzQixDQUFILEdBQTJDLEVBQTNEO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLElBQU9LLE9BQVAsR0FBa0JKLEtBQWxCLENBQU9JLE9BQVA7OztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyx3QkFBVCxDQUFrQ0MsaUJBQWxDLEVBQXFEO0FBQzFELFNBQU9GLE9BQU8sQ0FBQ0UsaUJBQUQsQ0FBUDtBQUNIO0FBQTBCQSxFQUFBQSxpQkFEdkIsR0FFSDtBQUFDO0FBQW1CQSxFQUFBQSxpQkFBcEIsQ0FGSjtBQUdEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsZUFBVCxDQUF5QkMsSUFBekIsRUFBK0JDLElBQS9CLEVBQXFDO0FBQzFDLE1BQUlELElBQUksQ0FBQ0UsTUFBTCxLQUFnQkQsSUFBSSxDQUFDQyxNQUF6QixFQUFpQztBQUMvQixXQUFPLEtBQVA7QUFDRDs7QUFDRCxPQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdILElBQUksQ0FBQ0UsTUFBekIsRUFBaUNDLENBQUMsRUFBbEMsRUFBc0M7QUFDcEMsUUFBSUgsSUFBSSxDQUFDRyxDQUFELENBQUosS0FBWUYsSUFBSSxDQUFDRSxDQUFELENBQXBCLEVBQXlCO0FBQ3ZCLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBQ0QsU0FBTyxJQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsTUFBVCxDQUFnQkMsS0FBaEIsRUFBdUJDLFlBQXZCLEVBQXFDO0FBQzFDLE1BQU1DLE9BQU8sR0FBRyxFQUFoQjtBQUNBLE1BQUlDLEtBQUssR0FBRyxDQUFaOztBQUNBLE9BQUssSUFBSUwsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0UsS0FBSyxDQUFDSCxNQUExQixFQUFrQ0MsQ0FBQyxFQUFuQyxFQUF1QztBQUNyQyxRQUFNTSxJQUFJLEdBQUdKLEtBQUssQ0FBQ0YsQ0FBRCxDQUFsQjs7QUFDQSxRQUFJRyxZQUFZLENBQUNHLElBQUQsRUFBT04sQ0FBUCxFQUFVRSxLQUFWLENBQWhCLEVBQWtDO0FBQ2hDRSxNQUFBQSxPQUFPLENBQUNHLElBQVIsQ0FBYUQsSUFBYjtBQUNELEtBRkQsTUFFTztBQUNMLFVBQUlELEtBQUssR0FBR0wsQ0FBWixFQUFlO0FBQ2JFLFFBQUFBLEtBQUssQ0FBQ0csS0FBRCxDQUFMLEdBQWVDLElBQWY7QUFDRDs7QUFDREQsTUFBQUEsS0FBSztBQUNOO0FBQ0Y7O0FBQ0QsTUFBSUEsS0FBSyxHQUFHSCxLQUFLLENBQUNILE1BQWxCLEVBQTBCO0FBQ3hCRyxJQUFBQSxLQUFLLENBQUNILE1BQU4sR0FBZU0sS0FBZjtBQUNEOztBQUNELFNBQU9ELE9BQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNJLFNBQVQsQ0FBbUJOLEtBQW5CLEVBQTBCTyxTQUExQixFQUFxQztBQUMxQyxPQUFLLElBQUlULENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdFLEtBQUssQ0FBQ0gsTUFBMUIsRUFBa0NDLENBQUMsRUFBbkMsRUFBdUM7QUFDckMsUUFBSVMsU0FBUyxDQUFDUCxLQUFLLENBQUNGLENBQUQsQ0FBTixFQUFXQSxDQUFYLEVBQWNFLEtBQWQsQ0FBYixFQUFtQztBQUNqQyxhQUFPRixDQUFQO0FBQ0Q7QUFDRjs7QUFDRCxTQUFPLENBQUMsQ0FBUjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTVSxZQUFULENBQXNCQyxRQUF0QixFQUFnQztBQUNyQyxNQUFNVCxLQUFLLEdBQUcsRUFBZDs7QUFDQSxPQUFLLElBQUlVLENBQUMsR0FBR0QsUUFBUSxDQUFDRSxJQUFULEVBQWIsRUFBOEIsQ0FBQ0QsQ0FBQyxDQUFDRSxJQUFqQyxFQUF1Q0YsQ0FBQyxHQUFHRCxRQUFRLENBQUNFLElBQVQsRUFBM0MsRUFBNEQ7QUFDMURYLElBQUFBLEtBQUssQ0FBQ0ssSUFBTixDQUFXSyxDQUFDLENBQUNHLEtBQWI7QUFDRDs7QUFDRCxTQUFPYixLQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU2MsY0FBVCxDQUF3QmQsS0FBeEIsRUFBK0JJLElBQS9CLEVBQXFDO0FBQzFDLE1BQUlKLEtBQUssQ0FBQ2UsT0FBTixDQUFjWCxJQUFkLElBQXNCLENBQTFCLEVBQTZCO0FBQzNCSixJQUFBQSxLQUFLLENBQUNLLElBQU4sQ0FBV0QsSUFBWDtBQUNBLFdBQU8sSUFBUDtBQUNEOztBQUNELFNBQU8sS0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU1ksVUFBVCxDQUFvQmhCLEtBQXBCLEVBQTJCSSxJQUEzQixFQUFpQztBQUN0QyxNQUFNRCxLQUFLLEdBQUdILEtBQUssQ0FBQ2UsT0FBTixDQUFjWCxJQUFkLENBQWQ7O0FBQ0EsTUFBSUQsS0FBSyxJQUFJLENBQUMsQ0FBZCxFQUFpQjtBQUNmLFdBQU8sS0FBUDtBQUNEOztBQUNESCxFQUFBQSxLQUFLLENBQUNpQixNQUFOLENBQWFkLEtBQWIsRUFBb0IsQ0FBcEI7QUFDQSxTQUFPLElBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU2UsUUFBVCxDQUFrQmxCLEtBQWxCLEVBQXlCO0FBQzlCLFNBQU9BLEtBQUssQ0FBQ0EsS0FBSyxDQUFDSCxNQUFOLEdBQWUsQ0FBaEIsQ0FBWjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQ29udmVydHMgYW4gYXJyYXktbGlrZSBvYmplY3QgdG8gYW4gYXJyYXkuXG4gKiBAcGFyYW0gez9JQXJyYXlMaWtlPFQ+fHN0cmluZ30gYXJyYXlMaWtlXG4gKiBAcmV0dXJuIHshQXJyYXk8VD59XG4gKiBAdGVtcGxhdGUgVFxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9BcnJheShhcnJheUxpa2UpIHtcbiAgcmV0dXJuIGFycmF5TGlrZSA/IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycmF5TGlrZSkgOiBbXTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHZhbHVlIGlzIGFjdHVhbGx5IGFuIEFycmF5LlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGNvbnN0IHtpc0FycmF5fSA9IEFycmF5O1xuXG4vKipcbiAqIElmIHRoZSBzcGVjaWZpZWQgYXJndW1lbnQgaXMgYW4gYXJyYXksIGl0J3MgcmV0dXJuZWQgYXMgaXMuIElmIGl0J3MgYVxuICogc2luZ2xlIGl0ZW0sIHRoZSBhcnJheSBjb250YWluaW5nIHRoaXMgaXRlbSBpcyBjcmVhdGVkIGFuZCByZXR1cm5lZC5cbiAqXG4gKiBUaGUgZG91YmxlLXRlbXBsYXRlIHBhdHRlcm4gaGVyZSBzb2x2ZXMgYSBidWcgd2hlcmUgQ0MgY2FuIGJlIHBhc3NlZCBhIHZhbHVlXG4gKiB3aXRoIGRlY2xhcmVkIHR5cGUge3N0cmluZ3whQXJyYXk8c3RyaW5nPn0gYW5kIHJldHVybiBhIHZhbHVlIHdpdGggYSB0eXBlIG9mXG4gKiB7IUFycmF5PHN0cmluZ3xBcnJheTxzdHJpbmc+Pn0uXG4gKlxuICogQHBhcmFtIHshQXJyYXk8VD58U30gYXJyYXlPclNpbmdsZUl0ZW1cbiAqIEByZXR1cm4geyFBcnJheTxUPnwhQXJyYXk8Uz59XG4gKiBAdGVtcGxhdGUgU1xuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5T3JTaW5nbGVJdGVtVG9BcnJheShhcnJheU9yU2luZ2xlSXRlbSkge1xuICByZXR1cm4gaXNBcnJheShhcnJheU9yU2luZ2xlSXRlbSlcbiAgICA/IC8qKiBAdHlwZSB7IUFycmF5PFQ+fSAqLyAoYXJyYXlPclNpbmdsZUl0ZW0pXG4gICAgOiBbLyoqIEB0eXBlIHshU30gKi8gKGFycmF5T3JTaW5nbGVJdGVtKV07XG59XG5cbi8qKlxuICogQ29tcGFyZXMgaWYgdHdvIGFycmF5cyBjb250YWlucyBleGFjdGx5IHNhbWUgZWxlbWVudHMgb2Ygc2FtZSBudW1iZXJcbiAqIG9mIHNhbWUgb3JkZXIuIE5vdGUgdGhhdCBpdCBkb2VzIE5PVCBoYW5kbGUgTmFOIGNhc2UgYXMgZXhwZWN0ZWQuXG4gKlxuICogQHBhcmFtIHshQXJyYXk8VD59IGFycjFcbiAqIEBwYXJhbSB7IUFycmF5PFQ+fSBhcnIyXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFyZUVxdWFsT3JkZXJlZChhcnIxLCBhcnIyKSB7XG4gIGlmIChhcnIxLmxlbmd0aCAhPT0gYXJyMi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIxLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFycjFbaV0gIT09IGFycjJbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBlbGVtZW50cyB0aGF0IHNob3VsZFJlbW92ZSByZXR1cm5zIHRydWUgZm9yIGZyb20gdGhlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7IUFycmF5PFQ+fSBhcnJheVxuICogQHBhcmFtIHtmdW5jdGlvbihULCBudW1iZXIsICFBcnJheTxUPik6Ym9vbGVhbn0gc2hvdWxkUmVtb3ZlXG4gKiBAcmV0dXJuIHshQXJyYXk8VD59XG4gKiBAdGVtcGxhdGUgVFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlKGFycmF5LCBzaG91bGRSZW1vdmUpIHtcbiAgY29uc3QgcmVtb3ZlZCA9IFtdO1xuICBsZXQgaW5kZXggPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgaXRlbSA9IGFycmF5W2ldO1xuICAgIGlmIChzaG91bGRSZW1vdmUoaXRlbSwgaSwgYXJyYXkpKSB7XG4gICAgICByZW1vdmVkLnB1c2goaXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpbmRleCA8IGkpIHtcbiAgICAgICAgYXJyYXlbaW5kZXhdID0gaXRlbTtcbiAgICAgIH1cbiAgICAgIGluZGV4Kys7XG4gICAgfVxuICB9XG4gIGlmIChpbmRleCA8IGFycmF5Lmxlbmd0aCkge1xuICAgIGFycmF5Lmxlbmd0aCA9IGluZGV4O1xuICB9XG4gIHJldHVybiByZW1vdmVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBlbGVtZW50IG1hdGNoaW5nIHRoZSBwcmVkaWNhdGUuXG4gKiBMaWtlIEFycmF5I2ZpbmRJbmRleC5cbiAqXG4gKiBAcGFyYW0geyFBcnJheTxUPn0gYXJyYXlcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oVCwgbnVtYmVyLCAhQXJyYXk8VD4pOmJvb2xlYW59IHByZWRpY2F0ZVxuICogQHJldHVybiB7bnVtYmVyfVxuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbmRleChhcnJheSwgcHJlZGljYXRlKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAocHJlZGljYXRlKGFycmF5W2ldLCBpLCBhcnJheSkpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGdpdmVuIGl0ZXJhdG9yIHRvIGFuIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7IUl0ZXJhdG9yPFQ+fSBpdGVyYXRvclxuICogQHJldHVybiB7QXJyYXk8VD59XG4gKiBAdGVtcGxhdGUgVFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbUl0ZXJhdG9yKGl0ZXJhdG9yKSB7XG4gIGNvbnN0IGFycmF5ID0gW107XG4gIGZvciAobGV0IGUgPSBpdGVyYXRvci5uZXh0KCk7ICFlLmRvbmU7IGUgPSBpdGVyYXRvci5uZXh0KCkpIHtcbiAgICBhcnJheS5wdXNoKGUudmFsdWUpO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBBZGRzIGl0ZW0gdG8gYXJyYXkgaWYgaXQgaXMgbm90IGFscmVhZHkgcHJlc2VudC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PFQ+fSBhcnJheVxuICogQHBhcmFtIHtUfSBpdGVtXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1c2hJZk5vdEV4aXN0KGFycmF5LCBpdGVtKSB7XG4gIGlmIChhcnJheS5pbmRleE9mKGl0ZW0pIDwgMCkge1xuICAgIGFycmF5LnB1c2goaXRlbSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIGZpcnN0IG1hdGNoaW5nIGl0ZW0gaW4gdGhlIGFycmF5LiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJyYXlcbiAqIGhhcyBjaGFuZ2VkLlxuICpcbiAqIEBwYXJhbSB7IUFycmF5PFQ+fSBhcnJheVxuICogQHBhcmFtIHtUfSBpdGVtXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUl0ZW0oYXJyYXksIGl0ZW0pIHtcbiAgY29uc3QgaW5kZXggPSBhcnJheS5pbmRleE9mKGl0ZW0pO1xuICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGFzdCBpdGVtIGluIGFuIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8VD59IGFycmF5XG4gKiBAdGVtcGxhdGUgVFxuICogQHJldHVybiB7P1R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXN0SXRlbShhcnJheSkge1xuICByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/types/array.js