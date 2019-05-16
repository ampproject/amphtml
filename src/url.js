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

import {LruCache} from './utils/lru-cache';
import {dict, hasOwn} from './utils/object';
import {endsWith, startsWith} from './string';
import {getMode} from './mode';
import {isArray} from './types';
import {parseQueryString_} from './url-parse-query-string';
import {tryDecodeUriComponent_} from './url-try-decode-uri-component';
import {urls} from './config';
import {userAssert} from './log';

/**
 * @type {!JsonObject}
 */
const SERVING_TYPE_PREFIX = dict({
  // No viewer
  'c': true,
  // In viewer
  'v': true,
  // Ad landing page
  'a': true,
  // Ad
  'ad': true,
  // Actions viewer
  'action': true,
});

/**
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */
let a;

/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {LruCache}
 */
let cache;

/** @private @const Matches amp_js_* parameters in query string. */
const AMP_JS_PARAMS_REGEX = /[?&]amp_js[^&]*/;

/** @private @const Matches amp_gsa parameters in query string. */
const AMP_GSA_PARAMS_REGEX = /[?&]amp_gsa[^&]*/;

/** @private @const Matches amp_r parameters in query string. */
const AMP_R_PARAMS_REGEX = /[?&]amp_r[^&]*/;

/** @private @const Matches amp_kit parameters in query string. */
const AMP_KIT_PARAMS_REGEX = /[?&]amp_kit[^&]*/;

/** @private @const Matches usqp parameters from goog experiment in query string. */
const GOOGLE_EXPERIMENT_PARAMS_REGEX = /[?&]usqp[^&]*/;

const INVALID_PROTOCOLS = [
  /*eslint no-script-url: 0*/ 'javascript:',
  /*eslint no-script-url: 0*/ 'data:',
  /*eslint no-script-url: 0*/ 'vbscript:',
];

/** @const {string} */
export const SOURCE_ORIGIN_PARAM = '__amp_source_origin';

/**
 * Returns the correct origin for a given window.
 * @param {!Window} win
 * @return {string} origin
 */
export function getWinOrigin(win) {
  return win.origin || parseUrlDeprecated(win.location.href).origin;
}

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {string} url
 * @param {boolean=} opt_nocache
 * @return {!Location}
 */
export function parseUrlDeprecated(url, opt_nocache) {
  if (!a) {
    a = /** @type {!HTMLAnchorElement} */ (self.document.createElement('a'));
    cache = self.UrlCache || (self.UrlCache = new LruCache(100));
  }

  return parseUrlWithA(a, url, opt_nocache ? null : cache);
}

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {!HTMLAnchorElement} a
 * @param {string} url
 * @param {LruCache=} opt_cache
 * @return {!Location}
 * @restricted
 */
export function parseUrlWithA(a, url, opt_cache) {
  if (opt_cache && opt_cache.has(url)) {
    return opt_cache.get(url);
  }

  a.href = url;

  // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick #3449.
  if (!a.protocol) {
    a.href = a.href;
  }

  const info = /** @type {!Location} */ ({
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: null, // Set below.
  });

  // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.
  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname;
  }

  // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.
  if (
    (info.protocol == 'http:' && info.port == 80) ||
    (info.protocol == 'https:' && info.port == 443)
  ) {
    info.port = '';
    info.host = info.hostname;
  }

  // For data URI a.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.
  if (a.origin && a.origin != 'null') {
    info.origin = a.origin;
  } else if (info.protocol == 'data:' || !info.host) {
    info.origin = info.href;
  } else {
    info.origin = info.protocol + '//' + info.host;
  }

  // Freeze during testing to avoid accidental mutation.
  const frozen = getMode().test && Object.freeze ? Object.freeze(info) : info;

  if (opt_cache) {
    opt_cache.put(url, frozen);
  }

  return frozen;
}

/**
 * Appends the string just before the fragment part (or optionally
 * to the front of the query string) of the URL.
 * @param {string} url
 * @param {string} paramString
 * @param {boolean=} opt_addToFront
 * @return {string}
 */
export function appendEncodedParamStringToUrl(
  url,
  paramString,
  opt_addToFront
) {
  if (!paramString) {
    return url;
  }
  const mainAndFragment = url.split('#', 2);
  const mainAndQuery = mainAndFragment[0].split('?', 2);

  let newUrl =
    mainAndQuery[0] +
    (mainAndQuery[1]
      ? opt_addToFront
        ? `?${paramString}&${mainAndQuery[1]}`
        : `?${mainAndQuery[1]}&${paramString}`
      : `?${paramString}`);
  newUrl += mainAndFragment[1] ? `#${mainAndFragment[1]}` : '';
  return newUrl;
}
/**
 * Appends a query string field and value to a url. `key` and `value`
 * will be ran through `encodeURIComponent` before appending.
 * @param {string} url
 * @param {string} key
 * @param {string} value
 * @param {boolean=} opt_addToFront
 * @return {string}
 */
export function addParamToUrl(url, key, value, opt_addToFront) {
  const field = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  return appendEncodedParamStringToUrl(url, field, opt_addToFront);
}

/**
 * Appends query string fields and values to a url. The `params` objects'
 * `key`s and `value`s will be transformed into query string keys/values.
 * @param {string} url
 * @param {!JsonObject<string, string|!Array<string>>} params
 * @return {string}
 */
export function addParamsToUrl(url, params) {
  return appendEncodedParamStringToUrl(url, serializeQueryString(params));
}

/**
 * Append query string fields and values to a url, only if the key does not
 * exist in current query string.
 * @param {string} url
 * @param {!JsonObject<string, string|!Array<string>>} params
 */
export function addMissingParamsToUrl(url, params) {
  const location = parseUrlDeprecated(url);
  const existingParams = parseQueryString(location.search);
  const paramsToAdd = dict({});
  const keys = Object.keys(params);
  for (let i = 0; i < keys.length; i++) {
    if (!hasOwn(existingParams, keys[i])) {
      paramsToAdd[keys[i]] = params[keys[i]];
    }
  }
  return addParamsToUrl(url, paramsToAdd);
}

/**
 * Serializes the passed parameter map into a query string with both keys
 * and values encoded.
 * @param {!JsonObject<string, string|!Array<string>>} params
 * @return {string}
 */
export function serializeQueryString(params) {
  const s = [];
  for (const k in params) {
    const v = params[k];
    if (v == null) {
      continue;
    } else if (isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const sv = /** @type {string} */ (v[i]);
        s.push(`${encodeURIComponent(k)}=${encodeURIComponent(sv)}`);
      }
    } else {
      const sv = /** @type {string} */ (v);
      s.push(`${encodeURIComponent(k)}=${encodeURIComponent(sv)}`);
    }
  }
  return s.join('&');
}

/**
 * Returns `true` if the URL is secure: either HTTPS or localhost (for testing).
 * @param {string|!Location} url
 * @return {boolean}
 */
export function isSecureUrlDeprecated(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }
  return (
    url.protocol == 'https:' ||
    url.hostname == 'localhost' ||
    url.hostname == '127.0.0.1' ||
    endsWith(url.hostname, '.localhost')
  );
}

/**
 * Asserts that a given url is HTTPS or protocol relative. It's a user-level
 * assert.
 *
 * Provides an exception for localhost.
 *
 * @param {?string|undefined} urlString
 * @param {!Element|string} elementContext Element where the url was found.
 * @param {string=} sourceName Used for error messages.
 * @return {string}
 */
export function assertHttpsUrl(
  urlString,
  elementContext,
  sourceName = 'source'
) {
  userAssert(
    urlString != null,
    '%s %s must be available',
    elementContext,
    sourceName
  );
  // (erwinm, #4560): type cast necessary until #4560 is fixed.
  const theUrlString = /** @type {string} */ (urlString);
  userAssert(
    isSecureUrlDeprecated(theUrlString) || /^(\/\/)/.test(theUrlString),
    '%s %s must start with ' +
      '"https://" or "//" or be relative and served from ' +
      'either https or from localhost. Invalid value: %s',
    elementContext,
    sourceName,
    theUrlString
  );
  return theUrlString;
}

/**
 * Asserts that a given url is an absolute HTTP or HTTPS URL.
 * @param {string} urlString
 * @return {string}
 */
export function assertAbsoluteHttpOrHttpsUrl(urlString) {
  userAssert(
    /^https?\:/i.test(urlString),
    'URL must start with "http://" or "https://". Invalid value: %s',
    urlString
  );
  return parseUrlDeprecated(urlString).href;
}

/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 *
 * This function is implemented in a separate file to avoid a circular
 * dependency.
 *
 * @param {string} queryString
 * @return {!JsonObject}
 */
export function parseQueryString(queryString) {
  return parseQueryString_(queryString);
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
 * Returns the fragment from the URL. If the URL doesn't contain fragment,
 * the empty string is returned.
 * @param {string} url
 * @return {string}
 */
export function getFragment(url) {
  const index = url.indexOf('#');
  if (index == -1) {
    return '';
  }
  return url.substring(index);
}

/**
 * Returns whether the URL has the origin of a proxy.
 * @param {string|!Location} url URL of an AMP document.
 * @return {boolean}
 */
export function isProxyOrigin(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }
  return urls.cdnProxyRegex.test(url.origin);
}

/**
 * For proxy-origin URLs, returns the serving type. Otherwise, returns null.
 * E.g., 'https://amp-com.cdn.ampproject.org/a/s/amp.com/amp_document.html'
 * returns 'a'.
 * @param {string|!Location} url URL of an AMP document.
 * @return {?string}
 */
export function getProxyServingType(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }
  if (!isProxyOrigin(url)) {
    return null;
  }
  const path = url.pathname.split('/', 2);
  return path[1];
}

/**
 * Returns whether the URL origin is localhost.
 * @param {string|!Location} url URL of an AMP document.
 * @return {boolean}
 */
export function isLocalhostOrigin(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }
  return urls.localhostRegex.test(url.origin);
}

/**
 * Returns whether the URL has valid protocol.
 * Deep link protocol is valid, but not javascript etc.
 * @param {string|!Location} url
 * @return {boolean}
 */
export function isProtocolValid(url) {
  if (!url) {
    return true;
  }
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }
  return !INVALID_PROTOCOLS.includes(url.protocol);
}

/**
 * Returns a URL without AMP JS parameters.
 * @param {string} url
 * @return {string}
 */
export function removeAmpJsParamsFromUrl(url) {
  const parsed = parseUrlDeprecated(url);
  const search = removeAmpJsParamsFromSearch(parsed.search);
  return parsed.origin + parsed.pathname + search + parsed.hash;
}

/**
 * Returns a URL without a query string.
 * @param {string} url
 * @return {string}
 */
export function removeSearch(url) {
  const index = url.indexOf('?');
  if (index == -1) {
    return url;
  }
  const fragment = getFragment(url);
  return url.substring(0, index) + fragment;
}

/**
 * Removes parameters that start with amp js parameter pattern and returns the
 * new search string.
 * @param {string} urlSearch
 * @return {string}
 */
function removeAmpJsParamsFromSearch(urlSearch) {
  if (!urlSearch || urlSearch == '?') {
    return '';
  }
  const search = urlSearch
    .replace(AMP_JS_PARAMS_REGEX, '')
    .replace(AMP_GSA_PARAMS_REGEX, '')
    .replace(AMP_R_PARAMS_REGEX, '')
    .replace(AMP_KIT_PARAMS_REGEX, '')
    .replace(GOOGLE_EXPERIMENT_PARAMS_REGEX, '')
    .replace(/^[?&]/, ''); // Removes first ? or &.
  return search ? '?' + search : '';
}

/**
 * Removes parameters with param name and returns the new search string.
 * @param {string} urlSearch
 * @param {string} paramName
 * @return {string}
 */
export function removeParamsFromSearch(urlSearch, paramName) {
  // TODO: reuse the function in removeAmpJsParamsFromSearch. Accept paramNames
  // as an array.
  if (!urlSearch || urlSearch == '?') {
    return '';
  }
  const paramRegex = new RegExp(`[?&]${paramName}=[^&]*`, 'g');
  const search = urlSearch.replace(paramRegex, '').replace(/^[?&]/, '');
  return search ? '?' + search : '';
}

/**
 * Returns the source URL of an AMP document for documents served
 * on a proxy origin or directly.
 * @param {string|!Location} url URL of an AMP document.
 * @return {string}
 */
export function getSourceUrl(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }

  // Not a proxy URL - return the URL itself.
  if (!isProxyOrigin(url)) {
    return url.href;
  }

  // A proxy URL.
  // Example path that is being matched here.
  // https://cdn.ampproject.org/c/s/www.origin.com/foo/
  // The /s/ is optional and signals a secure origin.
  const path = url.pathname.split('/');
  const prefix = path[1];
  userAssert(
    SERVING_TYPE_PREFIX[prefix],
    'Unknown path prefix in url %s',
    url.href
  );
  const domainOrHttpsSignal = path[2];
  const origin =
    domainOrHttpsSignal == 's'
      ? 'https://' + decodeURIComponent(path[3])
      : 'http://' + decodeURIComponent(domainOrHttpsSignal);
  // Sanity test that what we found looks like a domain.
  userAssert(origin.indexOf('.') > 0, 'Expected a . in origin %s', origin);
  path.splice(1, domainOrHttpsSignal == 's' ? 3 : 2);
  return (
    origin +
    path.join('/') +
    removeAmpJsParamsFromSearch(url.search) +
    (url.hash || '')
  );
}

/**
 * Returns the source origin of an AMP document for documents served
 * on a proxy origin or directly.
 * @param {string|!Location} url URL of an AMP document.
 * @return {string} The source origin of the URL.
 */
export function getSourceOrigin(url) {
  return parseUrlDeprecated(getSourceUrl(url)).origin;
}

/**
 * Returns absolute URL resolved based on the relative URL and the base.
 * @param {string} relativeUrlString
 * @param {string|!Location} baseUrl
 * @return {string}
 */
export function resolveRelativeUrl(relativeUrlString, baseUrl) {
  if (typeof baseUrl == 'string') {
    baseUrl = parseUrlDeprecated(baseUrl);
  }
  if (typeof URL == 'function') {
    return new URL(relativeUrlString, baseUrl.href).toString();
  }
  return resolveRelativeUrlFallback_(relativeUrlString, baseUrl);
}

/**
 * Fallback for URL resolver when URL class is not available.
 * @param {string} relativeUrlString
 * @param {string|!Location} baseUrl
 * @return {string}
 * @private Visible for testing.
 */
export function resolveRelativeUrlFallback_(relativeUrlString, baseUrl) {
  if (typeof baseUrl == 'string') {
    baseUrl = parseUrlDeprecated(baseUrl);
  }
  relativeUrlString = relativeUrlString.replace(/\\/g, '/');
  const relativeUrl = parseUrlDeprecated(relativeUrlString);

  // Absolute URL.
  if (startsWith(relativeUrlString.toLowerCase(), relativeUrl.protocol)) {
    return relativeUrl.href;
  }

  // Protocol-relative URL.
  if (startsWith(relativeUrlString, '//')) {
    return baseUrl.protocol + relativeUrlString;
  }

  // Absolute path.
  if (startsWith(relativeUrlString, '/')) {
    return baseUrl.origin + relativeUrlString;
  }

  // Relative path.
  return (
    baseUrl.origin +
    baseUrl.pathname.replace(/\/[^/]*$/, '/') +
    relativeUrlString
  );
}

/**
 * Add "__amp_source_origin" query parameter to the URL.
 * @param {!Window} win
 * @param {string} url
 * @return {string}
 */
export function getCorsUrl(win, url) {
  checkCorsUrl(url);
  const sourceOrigin = getSourceOrigin(win.location.href);
  return addParamToUrl(url, SOURCE_ORIGIN_PARAM, sourceOrigin);
}

/**
 * Checks if the url has __amp_source_origin and throws if it does.
 * @param {string} url
 */
export function checkCorsUrl(url) {
  const parsedUrl = parseUrlDeprecated(url);
  const query = parseQueryString(parsedUrl.search);
  userAssert(
    !(SOURCE_ORIGIN_PARAM in query),
    'Source origin is not allowed in %s',
    url
  );
}

/**
 * Tries to decode a URI component, falling back to opt_fallback (or an empty
 * string)
 *
 * @param {string} component
 * @param {string=} opt_fallback
 * @return {string}
 */
export function tryDecodeUriComponent(component, opt_fallback) {
  return tryDecodeUriComponent_(component, opt_fallback);
}
