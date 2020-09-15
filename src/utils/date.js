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
 * Parses the date using the `Date.parse()` rules. Additionally supports the
 * keyword "now" that indicates the "current date/time". Returns either a
 * valid epoch value or null.
 *
 * @param {?string|undefined} s
 * @return {?number}
 */
export function parseDate(s) {
  if (!s) {
    return null;
  }
  if (s.toLowerCase() === 'now') {
    return Date.now();
  }
  const parsed = Date.parse(s);
  return isNaN(parsed) ? null : parsed;
}

/**
 * @param {!Date|number|string|T} value
 * @return {number|T}
 * @template T
 */
export function getDate(value) {
  if (!value) {
    return null;
  }
  if (typeof value == 'number') {
    return value;
  }
  if (typeof value == 'string') {
    return parseDate(value);
  }
  // Must be a `Date` object.
  return value.getTime();
}
