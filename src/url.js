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
 * Appends a query string field and value to a url. `key` and `value`
 * will be ran through `encodeURIComponent` before appending.
 * @param {string} url
 * @param {string} key
 * @param {string} value
 * @return {string}
 */
export function addParamToUrl(url, key, value) {
  // TODO(erwinm, #1376) improve perf possibly by just doing a string
  // scan instead of having to create an element for the parsing.
  const urlObj = parseUrl(url);
  const field = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  const search = urlObj.search ? `${urlObj.search}&${field}` : `?${field}`;
  return urlObj.origin + urlObj.pathname + search + urlObj.hash;
}

/**
 * Appends query string fields and values to a url. The `params` objects'
 * `key`s and `value`s will be transformed into query string keys/values.
 * @param {string} url
 * @param {!Object<string, string>} params
 * @return {string}
 */
export function addParamsToUrl(url, params) {
  return Object.keys(params).reduce((url, key) => {
    return addParamToUrl(url, key, params[key]);
  }, url);
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
      'either https or from localhost. Invalid value: %s',
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


/**
 * Returns whether the URL has the origin of a proxy.
 * @param {string|!Location} url URL of an AMP document.
 * @return {boolean}
 */
export function isProxyOrigin(url) {
  if (typeof url == 'string') {
    url = parseUrl(url);
  }
  const path = url.pathname.split('/');
  const prefix = path[1];
  // List of well known proxy hosts. New proxies must be added here.
  return (url.origin == 'https://cdn.ampproject.org' ||
      (url.origin.indexOf('http://localhost:') == 0 &&
       (prefix == 'c' || prefix == 'v')));
}

/**
 * Returns the source origin of an AMP document for documents served
 * on a proxy origin or directly.
 * @param {string|!Location} url URL of an AMP document.
 * @return {string} The source origin of the URL.
 */
export function getSourceOrigin(url) {
  if (typeof url == 'string') {
    url = parseUrl(url);
  }

  // Not a proxy URL - return the URL's origin.
  if (!isProxyOrigin(url)) {
    return getOrigin(url);
  }

  // A proxy URL.
  // Example path that is being matched here.
  // https://cdn.ampproject.org/c/s/www.origin.com/foo/
  // The /s/ is optional and signals a secure origin.
  const path = url.pathname.split('/');
  const prefix = path[1];
  assert(prefix == 'c' || prefix == 'v',
      'Unknown path prefix in url %s', url.href);
  const domainOrHttpsSignal = path[2];
  const origin = domainOrHttpsSignal == 's'
      ? 'https://' + path[3]
      : 'http://' + domainOrHttpsSignal;
  // Sanity test that what we found looks like a domain.
  assert(origin.indexOf('.') > 0, 'Expected a . in origin %s', origin);
  return origin;
}
