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

/** @typedef {{name: string, value: (string|number|null)}} */
export let QueryParameterDef;

/**
 * Builds a URL from query parameters, truncating to a maximum length if
 * necessary.
 * @param {string} baseUrl scheme, domain, and path for the URL.
 * @param {!Object<string,string|number|null>} queryParams query parameters for
 *     the URL.
 * @param {number} maxLength length to truncate the URL to if necessary.
 * @param {?QueryParameterDef=} opt_truncationQueryParam query parameter to
 *     append to the URL iff any query parameters were truncated.
 * @return {string} the fully constructed URL.
 */
export function buildUrl(
  baseUrl, queryParams, maxLength, opt_truncationQueryParam) {
  const encodedParams = [];
  const encodedTruncationParam =
      opt_truncationQueryParam &&
      !(opt_truncationQueryParam.value == null ||
      opt_truncationQueryParam.value === '') ?
        encodeURIComponent(opt_truncationQueryParam.name) + '=' +
      encodeURIComponent(String(opt_truncationQueryParam.value)) :
        null;
  let capacity = maxLength - baseUrl.length;
  if (encodedTruncationParam) {
    capacity -= encodedTruncationParam.length + 1;
  }
  const keys = Object.keys(queryParams);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = queryParams[key];
    if (value == null || value === '') {
      continue;
    }
    const encodedNameAndSep = encodeURIComponent(key) + '=';
    const encodedValue = encodeURIComponent(String(value));
    const fullLength = encodedNameAndSep.length + encodedValue.length + 1;
    if (fullLength > capacity) {
      const truncatedValue = encodedValue
          .substr(0, capacity - encodedNameAndSep.length - 1)
        // Don't end with a partially truncated escape sequence
          .replace(/%\w?$/, '');
      if (truncatedValue) {
        encodedParams.push(encodedNameAndSep + truncatedValue);
      }
      if (encodedTruncationParam) {
        encodedParams.push(encodedTruncationParam);
      }
      break;
    }
    encodedParams.push(encodedNameAndSep + encodedValue);
    capacity -= fullLength;
  }
  if (!encodedParams.length) {
    return baseUrl;
  }
  return baseUrl + '?' + encodedParams.join('&');
}
