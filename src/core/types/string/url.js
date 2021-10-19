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

import {map} from '#core/types/object';

const QUERY_STRING_REGEX = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;

/**
 * Tries to decode a URI component, falling back to opt_fallback (or an empty
 * string)
 *
 * @param {string} component
 * @param {string=} fallback
 * @return {string}
 */
export function tryDecodeUriComponent(component, fallback = '') {
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
  const params = map();
  if (!queryString) {
    return params;
  }

  let match;
  while ((match = QUERY_STRING_REGEX.exec(queryString))) {
    const name = tryDecodeUriComponent(match[1], match[1]);
    const value = match[2]
      ? tryDecodeUriComponent(match[2].replace(/\+/g, ' '), match[2])
      : '';
    params[name] = value;
  }
  return params;
}
