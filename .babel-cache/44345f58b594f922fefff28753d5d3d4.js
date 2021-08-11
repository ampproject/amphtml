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
import { map } from "../object";
var QUERY_STRING_REGEX = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;

/**
 * Tries to decode a URI component, falling back to opt_fallback (or an empty
 * string)
 *
 * @param {string} component
 * @param {string=} fallback
 * @return {string}
 */
export function tryDecodeUriComponent(component, fallback) {
  if (fallback === void 0) {
    fallback = '';
  }

  try {
    return decodeURIComponent(component);
  } catch (e) {
    return fallback;
  }
}

/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 *
 * @param {string} queryString
 * @return {!JsonObject}
 */
export function parseQueryString(queryString) {
  var params = map();

  if (!queryString) {
    return params;
  }

  var match;

  while (match = QUERY_STRING_REGEX.exec(queryString)) {
    var name = tryDecodeUriComponent(match[1], match[1]);
    var value = match[2] ? tryDecodeUriComponent(match[2].replace(/\+/g, ' '), match[2]) : '';
    params[name] = value;
  }

  return params;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVybC5qcyJdLCJuYW1lcyI6WyJtYXAiLCJRVUVSWV9TVFJJTkdfUkVHRVgiLCJ0cnlEZWNvZGVVcmlDb21wb25lbnQiLCJjb21wb25lbnQiLCJmYWxsYmFjayIsImRlY29kZVVSSUNvbXBvbmVudCIsImUiLCJwYXJzZVF1ZXJ5U3RyaW5nIiwicXVlcnlTdHJpbmciLCJwYXJhbXMiLCJtYXRjaCIsImV4ZWMiLCJuYW1lIiwidmFsdWUiLCJyZXBsYWNlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxHQUFSO0FBRUEsSUFBTUMsa0JBQWtCLEdBQUcsb0NBQTNCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLHFCQUFULENBQStCQyxTQUEvQixFQUEwQ0MsUUFBMUMsRUFBeUQ7QUFBQSxNQUFmQSxRQUFlO0FBQWZBLElBQUFBLFFBQWUsR0FBSixFQUFJO0FBQUE7O0FBQzlELE1BQUk7QUFDRixXQUFPQyxrQkFBa0IsQ0FBQ0YsU0FBRCxDQUF6QjtBQUNELEdBRkQsQ0FFRSxPQUFPRyxDQUFQLEVBQVU7QUFDVixXQUFPRixRQUFQO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0csZ0JBQVQsQ0FBMEJDLFdBQTFCLEVBQXVDO0FBQzVDLE1BQU1DLE1BQU0sR0FBR1QsR0FBRyxFQUFsQjs7QUFDQSxNQUFJLENBQUNRLFdBQUwsRUFBa0I7QUFDaEIsV0FBT0MsTUFBUDtBQUNEOztBQUVELE1BQUlDLEtBQUo7O0FBQ0EsU0FBUUEsS0FBSyxHQUFHVCxrQkFBa0IsQ0FBQ1UsSUFBbkIsQ0FBd0JILFdBQXhCLENBQWhCLEVBQXVEO0FBQ3JELFFBQU1JLElBQUksR0FBR1YscUJBQXFCLENBQUNRLEtBQUssQ0FBQyxDQUFELENBQU4sRUFBV0EsS0FBSyxDQUFDLENBQUQsQ0FBaEIsQ0FBbEM7QUFDQSxRQUFNRyxLQUFLLEdBQUdILEtBQUssQ0FBQyxDQUFELENBQUwsR0FDVlIscUJBQXFCLENBQUNRLEtBQUssQ0FBQyxDQUFELENBQUwsQ0FBU0ksT0FBVCxDQUFpQixLQUFqQixFQUF3QixHQUF4QixDQUFELEVBQStCSixLQUFLLENBQUMsQ0FBRCxDQUFwQyxDQURYLEdBRVYsRUFGSjtBQUdBRCxJQUFBQSxNQUFNLENBQUNHLElBQUQsQ0FBTixHQUFlQyxLQUFmO0FBQ0Q7O0FBQ0QsU0FBT0osTUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7bWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuXG5jb25zdCBRVUVSWV9TVFJJTkdfUkVHRVggPSAvKD86XlsjP10/fCYpKFtePSZdKykoPzo9KFteJl0qKSk/L2c7XG5cbi8qKlxuICogVHJpZXMgdG8gZGVjb2RlIGEgVVJJIGNvbXBvbmVudCwgZmFsbGluZyBiYWNrIHRvIG9wdF9mYWxsYmFjayAob3IgYW4gZW1wdHlcbiAqIHN0cmluZylcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tcG9uZW50XG4gKiBAcGFyYW0ge3N0cmluZz19IGZhbGxiYWNrXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlEZWNvZGVVcmlDb21wb25lbnQoY29tcG9uZW50LCBmYWxsYmFjayA9ICcnKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb21wb25lbnQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbGxiYWNrO1xuICB9XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSBxdWVyeSBzdHJpbmcgb2YgYW4gVVJMLiBUaGlzIG1ldGhvZCByZXR1cm5zIGEgc2ltcGxlIGtleS92YWx1ZVxuICogbWFwLiBJZiB0aGVyZSBhcmUgZHVwbGljYXRlIGtleXMgdGhlIGxhdGVzdCB2YWx1ZSBpcyByZXR1cm5lZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlTdHJpbmdcbiAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VRdWVyeVN0cmluZyhxdWVyeVN0cmluZykge1xuICBjb25zdCBwYXJhbXMgPSBtYXAoKTtcbiAgaWYgKCFxdWVyeVN0cmluZykge1xuICAgIHJldHVybiBwYXJhbXM7XG4gIH1cblxuICBsZXQgbWF0Y2g7XG4gIHdoaWxlICgobWF0Y2ggPSBRVUVSWV9TVFJJTkdfUkVHRVguZXhlYyhxdWVyeVN0cmluZykpKSB7XG4gICAgY29uc3QgbmFtZSA9IHRyeURlY29kZVVyaUNvbXBvbmVudChtYXRjaFsxXSwgbWF0Y2hbMV0pO1xuICAgIGNvbnN0IHZhbHVlID0gbWF0Y2hbMl1cbiAgICAgID8gdHJ5RGVjb2RlVXJpQ29tcG9uZW50KG1hdGNoWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpLCBtYXRjaFsyXSlcbiAgICAgIDogJyc7XG4gICAgcGFyYW1zW25hbWVdID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHBhcmFtcztcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/types/string/url.js