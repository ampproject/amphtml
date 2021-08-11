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
// Export all type-checking helpers for convenience
export { isArray } from "./array";
export { isEnumValue } from "./enum";
export { isString } from "./string";
export { isObject } from "./object";

/**
 * Determines if value is an ELement
 * @param {*} value
 * @return {boolean}
 */
export function isElement(value) {
  return (value == null ? void 0 : value.nodeType) ==
  /* Node.ELEMENT_NODE */
  1;
}

/**
 * Determines if value is of number type and finite.
 * NaN and Infinity are not considered a finite number.
 * String numbers are not considered numbers.
 * @param {*} value
 * @return {boolean}
 */
export function isFiniteNumber(value) {
  return typeof value === 'number' && isFinite(value);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImlzQXJyYXkiLCJpc0VudW1WYWx1ZSIsImlzU3RyaW5nIiwiaXNPYmplY3QiLCJpc0VsZW1lbnQiLCJ2YWx1ZSIsIm5vZGVUeXBlIiwiaXNGaW5pdGVOdW1iZXIiLCJpc0Zpbml0ZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQSxTQUFRQSxPQUFSO0FBQ0EsU0FBUUMsV0FBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxRQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLFNBQVQsQ0FBbUJDLEtBQW5CLEVBQTBCO0FBQy9CLFNBQU8sQ0FBQUEsS0FBSyxRQUFMLFlBQUFBLEtBQUssQ0FBRUMsUUFBUDtBQUFtQjtBQUF3QixHQUFsRDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxjQUFULENBQXdCRixLQUF4QixFQUErQjtBQUNwQyxTQUFPLE9BQU9BLEtBQVAsS0FBaUIsUUFBakIsSUFBNkJHLFFBQVEsQ0FBQ0gsS0FBRCxDQUE1QztBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8vIEV4cG9ydCBhbGwgdHlwZS1jaGVja2luZyBoZWxwZXJzIGZvciBjb252ZW5pZW5jZVxuZXhwb3J0IHtpc0FycmF5fSBmcm9tICcuL2FycmF5JztcbmV4cG9ydCB7aXNFbnVtVmFsdWV9IGZyb20gJy4vZW51bSc7XG5leHBvcnQge2lzU3RyaW5nfSBmcm9tICcuL3N0cmluZyc7XG5leHBvcnQge2lzT2JqZWN0fSBmcm9tICcuL29iamVjdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB2YWx1ZSBpcyBhbiBFTGVtZW50XG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbGVtZW50KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZT8ubm9kZVR5cGUgPT0gLyogTm9kZS5FTEVNRU5UX05PREUgKi8gMTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHZhbHVlIGlzIG9mIG51bWJlciB0eXBlIGFuZCBmaW5pdGUuXG4gKiBOYU4gYW5kIEluZmluaXR5IGFyZSBub3QgY29uc2lkZXJlZCBhIGZpbml0ZSBudW1iZXIuXG4gKiBTdHJpbmcgbnVtYmVycyBhcmUgbm90IGNvbnNpZGVyZWQgbnVtYmVycy5cbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Zpbml0ZU51bWJlcih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh2YWx1ZSk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/types/index.js