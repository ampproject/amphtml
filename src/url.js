/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {assert} from './asserts';


/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * @param {string} url
 * @return {!Location}
 */
export function parseUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  const info = {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash
  };
  // For data URI a.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.
  info.origin = (a.origin && a.origin != 'null') ? a.origin : getOrigin(info);
  assert(info.origin, 'Origin must exist');
  return info;
}


/**
 * Asserts that a given url is HTTPS or protocol relative.
 * Provides an exception for localhost.
 * @param {string} urlString
 * @param {!Element} elementContext Element where the url was found.
 * @return {string}
 */
export function assertHttpsUrl(urlString, elementContext) {
  const url = parseUrl(urlString);
  assert(
      url.protocol == 'https:' || /^(\/\/)/.test(urlString) ||
      url.hostname == 'localhost' ||
          url.hostname.lastIndexOf('.localhost') ==
          // Poor person's endsWith
          url.hostname.length - '.localhost'.length,
      '%s source must start with ' +
      '"https://" or "//" or be relative and served from ' +
      'https. Invalid value: %s',
      elementContext, urlString);
  return urlString;
}


/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 * @param {string} queryString
 * @return {!Object<string, string>}
 */
export function parseQueryString(queryString) {
  const params = Object.create(null);
  if (!queryString) {
    return params;
  }
  if (queryString.indexOf('?') == 0 || queryString.indexOf('#') == 0) {
    queryString = queryString.substr(1);
  }
  const pairs = queryString.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const eqIndex = pair.indexOf('=');
    let name;
    let value;
    if (eqIndex != -1) {
      name = decodeURIComponent(pair.substring(0, eqIndex)).trim();
      value = decodeURIComponent(pair.substring(eqIndex + 1)).trim();
    } else {
      name = decodeURIComponent(pair).trim();
      value = '';
    }
    if (name) {
      params[name] = value;
    }
  }
  return params;
}


/**
 * Don't use this directly, only exported for testing. The value
 * is available via the origin property of the object returned by
 * parseUrl.
 * @param {!Location} info
 * @return {string}
 * @visibleForTesting
 */
export function getOrigin(info) {
  if (info.protocol == 'data:' || !info.host) {
    return info.href;
  }
  return info.protocol + '//' + info.host;
}


/**
 * Returns the URL without fragment. If URL doesn't contain fragment, the same
 * string is returned.
 * @param {string} url
 * @return {string}
 */
export function removeFragment(url) {
  const index = url.indexOf('#');
  if (index == -1) {
    return url;
  }
  return url.substring(0, index);
}
