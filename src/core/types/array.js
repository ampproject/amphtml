/**
 * Converts an array-like object to an array.
 * @param {?ArrayLike<T>|string} arrayLike
 * @return {Array<T>}
 * @template T
 */
export function toArray(arrayLike) {
  return arrayLike ? Array.prototype.slice.call(arrayLike) : [];
}

/**
 * Determines if value is actually an Array.
 * @param {*} value
 * @return {value is Array}
 */
export const {isArray} = Array;

/**
 * If the specified argument is an array, it's returned as is. If it's a
 * single item, the array containing this item is created and returned.
 *
 * The double-template pattern here solves a bug where CC can be passed a value
 * with declared type {string|!Array<string>} and return a value with a type of
 * {!Array<string|Array<string>>}.
 *
 * @param {Array<T>|S} arrayOrSingleItem
 * @return {Array<T>|Array<S>}
 * @template S
 * @template T
 */
export function arrayOrSingleItemToArray(arrayOrSingleItem) {
  return isArray(arrayOrSingleItem)
    ? /** @type {Array<T>} */ (arrayOrSingleItem)
    : [/** @type {S} */ (arrayOrSingleItem)];
}

/**
 * Compares if two arrays contains exactly same elements of same number
 * of same order. Note that it does NOT handle NaN case as expected.
 *
 * @param {Array<T>} arr1
 * @param {Array<T>} arr2
 * @return {boolean}
 * @template T
 */
export function areEqualOrdered(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Removes elements that shouldRemove returns true for from the array.
 *
 * @param {Array<T>} array
 * @param {function(T, number, Array<T>):boolean} shouldRemove
 * @return {Array<T>}
 * @template T
 */
export function remove(array, shouldRemove) {
  const removed = [];
  let index = 0;
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
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
 * @param {Array<T>} array
 * @param {function(T, number, Array<T>):boolean} predicate
 * @return {number}
 * @template T
 */
export function findIndex(array, predicate) {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }
  return -1;
}

/**
 * Converts the given iterator to an array.
 *
 * @param {Iterator<T>} iterator
 * @return {Array<T>}
 * @template T
 */
export function fromIterator(iterator) {
  const array = [];
  for (let e = iterator.next(); !e.done; e = iterator.next()) {
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
 * @param {Array<T>} array
 * @param {T} item
 * @return {boolean}
 * @template T
 */
export function removeItem(array, item) {
  const index = array.indexOf(item);
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
