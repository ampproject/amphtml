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
import { urls } from "./config";
import { LruCache } from "./core/data-structures/lru-cache";
import * as mode from "./core/mode";
import { arrayOrSingleItemToArray } from "./core/types/array";
import { dict, hasOwn } from "./core/types/object";
import { endsWith } from "./core/types/string";
import { parseQueryString } from "./core/types/string/url";
import { userAssert } from "./log";
var SERVING_TYPE_PREFIX = new Set([// No viewer
'c', // In viewer
'v', // Ad landing page
'a', // Ad
'ad']);

/**
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */
var cachedAnchorEl;

/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {LruCache}
 */
var urlCache;
// eslint-disable-next-line no-script-url
var INVALID_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'];

/** @const {string} */
export var SOURCE_ORIGIN_PARAM = '__amp_source_origin';

/**
 * Coerces a url into a location;
 * @function
 * @param {string|!Location} url
 * @return {!Location}
 */
var urlAsLocation = function urlAsLocation(url) {
  return typeof url == 'string' ? parseUrlDeprecated(url) : url;
};

/**
 * Returns the correct origin for a given window.
 * TODO(rcebulko): This really belongs under #core/window somewhere, not in url
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
 * TODO(#34453): The URL constructor isn't supported in IE11, but is supported
 * everywhere else. There's a lot of code paths (and all uses of the LruCache)
 * that are built around this polyfill. Once we can drop IE11 support and just
 * use the URL constructor, we can clear out all of parseWithA, all the URL
 * cache logic (incl. additional caches in other call-sites). Most is guarded by
 * IS_ESM and is only included in nomodule builds, but still.
 * @param {string} url
 * @param {boolean=} opt_nocache
 *   Cache is always ignored on ESM builds, see https://go.amp.dev/pr/31594
 * @return {!Location}
 */
export function parseUrlDeprecated(url, opt_nocache) {
  if (!cachedAnchorEl) {
    cachedAnchorEl =
    /** @type {!HTMLAnchorElement} */
    self.document.createElement('a');
    urlCache = false ? null : self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new LruCache(100));
  }

  return parseUrlWithA(cachedAnchorEl, url, false || opt_nocache ? null : urlCache);
}

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {!HTMLAnchorElement} anchorEl
 * @param {string} url
 * @param {LruCache=} opt_cache
 *   Cache is always ignored on ESM builds, see https://go.amp.dev/pr/31594
 * @return {!Location}
 * @restricted
 */
export function parseUrlWithA(anchorEl, url, opt_cache) {
  if (false) {
    // Doing this causes the <a> to auto-set its own href to the resolved path,
    // which would be the baseUrl for the URL constructor.
    anchorEl.href = '';
    return (
      /** @type {?} */
      new URL(url, anchorEl.href)
    );
  }

  if (opt_cache && opt_cache.has(url)) {
    return opt_cache.get(url);
  }

  anchorEl.href = url;

  // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick #3449.
  if (!anchorEl.protocol) {
    anchorEl.href = anchorEl.href;
  }

  var info =
  /** @type {!Location} */
  {
    href: anchorEl.href,
    protocol: anchorEl.protocol,
    host: anchorEl.host,
    hostname: anchorEl.hostname,
    port: anchorEl.port == '0' ? '' : anchorEl.port,
    pathname: anchorEl.pathname,
    search: anchorEl.search,
    hash: anchorEl.hash,
    origin: null // Set below.

  };

  // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.
  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname;
  }

  // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.
  if (info.protocol == 'http:' && info.port == 80 || info.protocol == 'https:' && info.port == 443) {
    info.port = '';
    info.host = info.hostname;
  }

  // For data URI anchorEl.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.
  var origin;

  if (anchorEl.origin && anchorEl.origin != 'null') {
    origin = anchorEl.origin;
  } else if (info.protocol == 'data:' || !info.host) {
    origin = info.href;
  } else {
    origin = info.protocol + '//' + info.host;
  }

  info.origin = origin;
  // Freeze during testing to avoid accidental mutation.
  var frozen = mode.isTest() && Object.freeze ? Object.freeze(info) : info;

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
export function appendEncodedParamStringToUrl(url, paramString, opt_addToFront) {
  if (!paramString) {
    return url;
  }

  var mainAndFragment = url.split('#', 2);
  var mainAndQuery = mainAndFragment[0].split('?', 2);
  var newUrl = mainAndQuery[0] + (mainAndQuery[1] ? opt_addToFront ? "?" + paramString + "&" + mainAndQuery[1] : "?" + mainAndQuery[1] + "&" + paramString : "?" + paramString);
  newUrl += mainAndFragment[1] ? "#" + mainAndFragment[1] : '';
  return newUrl;
}

/**
 * @param {string} key
 * @param {string} value
 * @return {string}
 */
function urlEncodeKeyValue(key, value) {
  return encodeURIComponent(key) + "=" + encodeURIComponent(value);
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
  return appendEncodedParamStringToUrl(url, urlEncodeKeyValue(key, value), opt_addToFront);
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
 * @return {string}
 */
export function addMissingParamsToUrl(url, params) {
  var location = parseUrlDeprecated(url);
  var existingParams = parseQueryString(location.search);
  var paramsToAdd = dict({});
  var keys = Object.keys(params);

  for (var i = 0; i < keys.length; i++) {
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
  var s = [];

  for (var k in params) {
    var v = params[k];

    if (v == null) {
      continue;
    }

    v = arrayOrSingleItemToArray(v);

    for (var i = 0; i < v.length; i++) {
      s.push(urlEncodeKeyValue(k, v[i]));
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
  url = urlAsLocation(url);
  return url.protocol == 'https:' || url.hostname == 'localhost' || url.hostname == '127.0.0.1' || endsWith(url.hostname, '.localhost');
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
export function assertHttpsUrl(urlString, elementContext, sourceName) {
  if (sourceName === void 0) {
    sourceName = 'source';
  }

  userAssert(urlString != null, '%s %s must be available', elementContext, sourceName);
  userAssert(isSecureUrlDeprecated(urlString) || /^\/\//.test(urlString), '%s %s must start with ' + '"https://" or "//" or be relative and served from ' + 'either https or from localhost. Invalid value: %s', elementContext, sourceName, urlString);
  return urlString;
}

/**
 * Asserts that a given url is an absolute HTTP or HTTPS URL.
 * @param {string} urlString
 * @return {string}
 */
export function assertAbsoluteHttpOrHttpsUrl(urlString) {
  userAssert(/^https?\:/i.test(urlString), 'URL must start with "http://" or "https://". Invalid value: %s', urlString);
  return parseUrlDeprecated(urlString).href;
}

/**
 * Returns the URL without fragment. If URL doesn't contain fragment, the same
 * string is returned.
 * @param {string} url
 * @return {string}
 */
export function removeFragment(url) {
  var index = url.indexOf('#');

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
  var index = url.indexOf('#');

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
  return urls.cdnProxyRegex.test(urlAsLocation(url).origin);
}

/**
 * Returns whether the URL origin is localhost.
 * @param {string|!Location} url URL of an AMP document.
 * @return {boolean}
 */
export function isLocalhostOrigin(url) {
  return urls.localhostRegex.test(urlAsLocation(url).origin);
}

/**
 * @param {string} uri
 * @return {boolean}
 */
export function isAmpScriptUri(uri) {
  return uri.startsWith('amp-script:');
}

/**
 * For proxy-origin URLs, returns the serving type. Otherwise, returns null.
 * E.g., 'https://amp-com.cdn.ampproject.org/a/s/amp.com/amp_document.html'
 * returns 'a'.
 * @param {string|!Location} url URL of an AMP document.
 * @return {?string}
 */
export function getProxyServingType(url) {
  url = urlAsLocation(url);

  if (!isProxyOrigin(url)) {
    return null;
  }

  var path = url.pathname.split('/', 2);
  return path[1];
}

/**
 * Returns whether the URL has valid protocol.
 * Deep link protocol is valid, but not javascript etc.
 * @param {string|!Location} url
 * @return {boolean}
 */
export function isProtocolValid(url) {
  return !(url && INVALID_PROTOCOLS.includes(urlAsLocation(url).protocol));
}

/**
 * Returns a URL without AMP JS parameters.
 * @param {string} url
 * @return {string}
 */
export function removeAmpJsParamsFromUrl(url) {
  var _parseUrlDeprecated = parseUrlDeprecated(url),
      hash = _parseUrlDeprecated.hash,
      origin = _parseUrlDeprecated.origin,
      pathname = _parseUrlDeprecated.pathname,
      search = _parseUrlDeprecated.search;

  var searchRemoved = removeAmpJsParamsFromSearch(search);
  return origin + pathname + searchRemoved + hash;
}

/**
 * Returns a URL without a query string.
 * @param {string} url
 * @return {string}
 */
export function removeSearch(url) {
  var index = url.indexOf('?');

  if (index == -1) {
    return url;
  }

  var fragment = getFragment(url);
  return url.substring(0, index) + fragment;
}

/**
 * Removes parameters that start with amp js parameter pattern and returns the
 * new search string.
 * @param {string} urlSearch
 * @return {string}
 */
function removeAmpJsParamsFromSearch(urlSearch) {
  // The below regex is a combo of these original patterns. Combining these,
  // removing the corresponding `.replace` calls, and reusing
  // removeParamsFromSearch saves ~175B. Matches params in query string:
  // - /[?&]amp_js[^&]*/   amp_js_*
  // - /[?&]amp_gsa[^&]*/  amp_gsa
  // - /[?&]amp_r[^&]*/    amp_r
  // - /[?&]amp_kit[^&]*/  amp_kit
  // - /[?&]usqp[^&]*/     usqp (from goog experiment)
  return removeParamsFromSearch(urlSearch, '(amp_(js[^&=]*|gsa|r|kit)|usqp)');
}

/**
 * Removes parameters with param name and returns the new search string.
 * @param {string} urlSearch
 * @param {string} paramName
 * @return {string}
 */
export function removeParamsFromSearch(urlSearch, paramName) {
  // TODO: Accept paramNames as an array.
  if (!urlSearch || urlSearch == '?') {
    return '';
  }

  var paramRegex = new RegExp("[?&]" + paramName + "\\b[^&]*", 'g');
  var search = urlSearch.replace(paramRegex, '').replace(/^[?&]/, '');
  return search ? '?' + search : '';
}

/**
 * Returns the source URL of an AMP document for documents served
 * on a proxy origin or directly.
 * @param {string|!Location} url URL of an AMP document.
 * @return {string}
 */
export function getSourceUrl(url) {
  url = urlAsLocation(url);

  // Not a proxy URL - return the URL itself.
  if (!isProxyOrigin(url)) {
    return url.href;
  }

  // A proxy URL.
  // Example path that is being matched here.
  // https://cdn.ampproject.org/c/s/www.origin.com/foo/
  // The /s/ is optional and signals a secure origin.
  var path = url.pathname.split('/');
  var prefix = path[1];
  userAssert(SERVING_TYPE_PREFIX.has(prefix), 'Unknown path prefix in url %s', url.href);
  var domainOrHttpsSignal = path[2];
  var origin = domainOrHttpsSignal == 's' ? 'https://' + decodeURIComponent(path[3]) : 'http://' + decodeURIComponent(domainOrHttpsSignal);
  // Sanity test that what we found looks like a domain.
  userAssert(origin.indexOf('.') > 0, 'Expected a . in origin %s', origin);
  path.splice(1, domainOrHttpsSignal == 's' ? 3 : 2);
  return origin + path.join('/') + removeAmpJsParamsFromSearch(url.search) + (url.hash || '');
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
  baseUrl = urlAsLocation(baseUrl);

  if (false || typeof URL == 'function') {
    return new URL(relativeUrlString, baseUrl.href).toString();
  }

  return resolveRelativeUrlFallback_(relativeUrlString, baseUrl);
}

/**
 * Fallback for URL resolver when URL class is not available.
 * @param {string} relativeUrlString
 * @param {string|!Location} baseUrl
 * @return {string}
 * @private @visibleForTesting
 */
export function resolveRelativeUrlFallback_(relativeUrlString, baseUrl) {
  baseUrl = urlAsLocation(baseUrl);
  relativeUrlString = relativeUrlString.replace(/\\/g, '/');
  var relativeUrl = parseUrlDeprecated(relativeUrlString);

  // Absolute URL.
  if (relativeUrlString.toLowerCase().startsWith(relativeUrl.protocol)) {
    return relativeUrl.href;
  }

  // Protocol-relative URL.
  if (relativeUrlString.startsWith('//')) {
    return baseUrl.protocol + relativeUrlString;
  }

  // Absolute path.
  if (relativeUrlString.startsWith('/')) {
    return baseUrl.origin + relativeUrlString;
  }

  // Relative path.
  return baseUrl.origin + baseUrl.pathname.replace(/\/[^/]*$/, '/') + relativeUrlString;
}

/**
 * Add "__amp_source_origin" query parameter to the URL.
 * @param {!Window} win
 * @param {string} url
 * @return {string}
 */
export function getCorsUrl(win, url) {
  checkCorsUrl(url);
  var sourceOrigin = getSourceOrigin(win.location.href);
  return addParamToUrl(url, SOURCE_ORIGIN_PARAM, sourceOrigin);
}

/**
 * Checks if the url has __amp_source_origin and throws if it does.
 * @param {string} url
 */
export function checkCorsUrl(url) {
  var parsedUrl = parseUrlDeprecated(url);
  var query = parseQueryString(parsedUrl.search);
  userAssert(!(SOURCE_ORIGIN_PARAM in query), 'Source origin is not allowed in %s', url);
}

/**
 * Adds the path to the given url.
 *
 * @param {!Location} url
 * @param {string} path
 * @return {string}
 */
export function appendPathToUrl(url, path) {
  var pathname = url.pathname.replace(/\/?$/, '/') + path.replace(/^\//, '');
  return url.origin + pathname + url.search + url.hash;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVybC5qcyJdLCJuYW1lcyI6WyJ1cmxzIiwiTHJ1Q2FjaGUiLCJtb2RlIiwiYXJyYXlPclNpbmdsZUl0ZW1Ub0FycmF5IiwiZGljdCIsImhhc093biIsImVuZHNXaXRoIiwicGFyc2VRdWVyeVN0cmluZyIsInVzZXJBc3NlcnQiLCJTRVJWSU5HX1RZUEVfUFJFRklYIiwiU2V0IiwiY2FjaGVkQW5jaG9yRWwiLCJ1cmxDYWNoZSIsIklOVkFMSURfUFJPVE9DT0xTIiwiU09VUkNFX09SSUdJTl9QQVJBTSIsInVybEFzTG9jYXRpb24iLCJ1cmwiLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJnZXRXaW5PcmlnaW4iLCJ3aW4iLCJvcmlnaW4iLCJsb2NhdGlvbiIsImhyZWYiLCJvcHRfbm9jYWNoZSIsInNlbGYiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJfX0FNUF9VUkxfQ0FDSEUiLCJwYXJzZVVybFdpdGhBIiwiYW5jaG9yRWwiLCJvcHRfY2FjaGUiLCJVUkwiLCJoYXMiLCJnZXQiLCJwcm90b2NvbCIsImluZm8iLCJob3N0IiwiaG9zdG5hbWUiLCJwb3J0IiwicGF0aG5hbWUiLCJzZWFyY2giLCJoYXNoIiwiZnJvemVuIiwiaXNUZXN0IiwiT2JqZWN0IiwiZnJlZXplIiwicHV0IiwiYXBwZW5kRW5jb2RlZFBhcmFtU3RyaW5nVG9VcmwiLCJwYXJhbVN0cmluZyIsIm9wdF9hZGRUb0Zyb250IiwibWFpbkFuZEZyYWdtZW50Iiwic3BsaXQiLCJtYWluQW5kUXVlcnkiLCJuZXdVcmwiLCJ1cmxFbmNvZGVLZXlWYWx1ZSIsImtleSIsInZhbHVlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiYWRkUGFyYW1Ub1VybCIsImFkZFBhcmFtc1RvVXJsIiwicGFyYW1zIiwic2VyaWFsaXplUXVlcnlTdHJpbmciLCJhZGRNaXNzaW5nUGFyYW1zVG9VcmwiLCJleGlzdGluZ1BhcmFtcyIsInBhcmFtc1RvQWRkIiwia2V5cyIsImkiLCJsZW5ndGgiLCJzIiwiayIsInYiLCJwdXNoIiwiam9pbiIsImlzU2VjdXJlVXJsRGVwcmVjYXRlZCIsImFzc2VydEh0dHBzVXJsIiwidXJsU3RyaW5nIiwiZWxlbWVudENvbnRleHQiLCJzb3VyY2VOYW1lIiwidGVzdCIsImFzc2VydEFic29sdXRlSHR0cE9ySHR0cHNVcmwiLCJyZW1vdmVGcmFnbWVudCIsImluZGV4IiwiaW5kZXhPZiIsInN1YnN0cmluZyIsImdldEZyYWdtZW50IiwiaXNQcm94eU9yaWdpbiIsImNkblByb3h5UmVnZXgiLCJpc0xvY2FsaG9zdE9yaWdpbiIsImxvY2FsaG9zdFJlZ2V4IiwiaXNBbXBTY3JpcHRVcmkiLCJ1cmkiLCJzdGFydHNXaXRoIiwiZ2V0UHJveHlTZXJ2aW5nVHlwZSIsInBhdGgiLCJpc1Byb3RvY29sVmFsaWQiLCJpbmNsdWRlcyIsInJlbW92ZUFtcEpzUGFyYW1zRnJvbVVybCIsInNlYXJjaFJlbW92ZWQiLCJyZW1vdmVBbXBKc1BhcmFtc0Zyb21TZWFyY2giLCJyZW1vdmVTZWFyY2giLCJmcmFnbWVudCIsInVybFNlYXJjaCIsInJlbW92ZVBhcmFtc0Zyb21TZWFyY2giLCJwYXJhbU5hbWUiLCJwYXJhbVJlZ2V4IiwiUmVnRXhwIiwicmVwbGFjZSIsImdldFNvdXJjZVVybCIsInByZWZpeCIsImRvbWFpbk9ySHR0cHNTaWduYWwiLCJkZWNvZGVVUklDb21wb25lbnQiLCJzcGxpY2UiLCJnZXRTb3VyY2VPcmlnaW4iLCJyZXNvbHZlUmVsYXRpdmVVcmwiLCJyZWxhdGl2ZVVybFN0cmluZyIsImJhc2VVcmwiLCJ0b1N0cmluZyIsInJlc29sdmVSZWxhdGl2ZVVybEZhbGxiYWNrXyIsInJlbGF0aXZlVXJsIiwidG9Mb3dlckNhc2UiLCJnZXRDb3JzVXJsIiwiY2hlY2tDb3JzVXJsIiwic291cmNlT3JpZ2luIiwicGFyc2VkVXJsIiwicXVlcnkiLCJhcHBlbmRQYXRoVG9VcmwiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFTNkcsZUFBVCxDQUF5QjdHLEdBQXpCLEVBQThCNkUsSUFBOUIsRUFBb0M7QUFDekMsTUFBTXRELFFBQVEsR0FBR3ZCLEdBQUcsQ0FBQ3VCLFFBQUosQ0FBYW1FLE9BQWIsQ0FBcUIsTUFBckIsRUFBNkIsR0FBN0IsSUFBb0NiLElBQUksQ0FBQ2EsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEIsQ0FBckQ7QUFDQSxTQUFPMUYsR0FBRyxDQUFDSSxNQUFKLEdBQWFtQixRQUFiLEdBQXdCdkIsR0FBRyxDQUFDd0IsTUFBNUIsR0FBcUN4QixHQUFHLENBQUN5QixJQUFoRDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7dXJsc30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtMcnVDYWNoZX0gZnJvbSAnLi9jb3JlL2RhdGEtc3RydWN0dXJlcy9scnUtY2FjaGUnO1xuaW1wb3J0ICogYXMgbW9kZSBmcm9tICcuL2NvcmUvbW9kZSc7XG5pbXBvcnQge2FycmF5T3JTaW5nbGVJdGVtVG9BcnJheX0gZnJvbSAnLi9jb3JlL3R5cGVzL2FycmF5JztcbmltcG9ydCB7ZGljdCwgaGFzT3dufSBmcm9tICcuL2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7ZW5kc1dpdGh9IGZyb20gJy4vY29yZS90eXBlcy9zdHJpbmcnO1xuaW1wb3J0IHtwYXJzZVF1ZXJ5U3RyaW5nfSBmcm9tICcuL2NvcmUvdHlwZXMvc3RyaW5nL3VybCc7XG5pbXBvcnQge3VzZXJBc3NlcnR9IGZyb20gJy4vbG9nJztcblxuY29uc3QgU0VSVklOR19UWVBFX1BSRUZJWCA9IG5ldyBTZXQoW1xuICAvLyBObyB2aWV3ZXJcbiAgJ2MnLFxuICAvLyBJbiB2aWV3ZXJcbiAgJ3YnLFxuICAvLyBBZCBsYW5kaW5nIHBhZ2VcbiAgJ2EnLFxuICAvLyBBZFxuICAnYWQnLFxuXSk7XG5cbi8qKlxuICogQ2FjaGVkIGEtdGFnIHRvIGF2b2lkIG1lbW9yeSBhbGxvY2F0aW9uIGR1cmluZyBVUkwgcGFyc2luZy5cbiAqIEB0eXBlIHtIVE1MQW5jaG9yRWxlbWVudH1cbiAqL1xubGV0IGNhY2hlZEFuY2hvckVsO1xuXG4vKipcbiAqIFdlIGNhY2hlZCBhbGwgcGFyc2VkIFVSTHMuIEFzIG9mIG5vdyB0aGVyZSBhcmUgbm8gdXNlIGNhc2VzXG4gKiBvZiBBTVAgZG9jcyB0aGF0IHdvdWxkIGV2ZXIgcGFyc2UgYW4gYWN0dWFsIGxhcmdlIG51bWJlciBvZiBVUkxzLFxuICogYnV0IHdlIG9mdGVuIHBhcnNlIHRoZSBzYW1lIG9uZSBvdmVyIGFuZCBvdmVyIGFnYWluLlxuICogQHR5cGUge0xydUNhY2hlfVxuICovXG5sZXQgdXJsQ2FjaGU7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zY3JpcHQtdXJsXG5jb25zdCBJTlZBTElEX1BST1RPQ09MUyA9IFsnamF2YXNjcmlwdDonLCAnZGF0YTonLCAndmJzY3JpcHQ6J107XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmV4cG9ydCBjb25zdCBTT1VSQ0VfT1JJR0lOX1BBUkFNID0gJ19fYW1wX3NvdXJjZV9vcmlnaW4nO1xuXG4vKipcbiAqIENvZXJjZXMgYSB1cmwgaW50byBhIGxvY2F0aW9uO1xuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ3whTG9jYXRpb259IHVybFxuICogQHJldHVybiB7IUxvY2F0aW9ufVxuICovXG5jb25zdCB1cmxBc0xvY2F0aW9uID0gKHVybCkgPT5cbiAgdHlwZW9mIHVybCA9PSAnc3RyaW5nJyA/IHBhcnNlVXJsRGVwcmVjYXRlZCh1cmwpIDogdXJsO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGNvcnJlY3Qgb3JpZ2luIGZvciBhIGdpdmVuIHdpbmRvdy5cbiAqIFRPRE8ocmNlYnVsa28pOiBUaGlzIHJlYWxseSBiZWxvbmdzIHVuZGVyICNjb3JlL3dpbmRvdyBzb21ld2hlcmUsIG5vdCBpbiB1cmxcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtzdHJpbmd9IG9yaWdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0V2luT3JpZ2luKHdpbikge1xuICByZXR1cm4gd2luLm9yaWdpbiB8fCBwYXJzZVVybERlcHJlY2F0ZWQod2luLmxvY2F0aW9uLmhyZWYpLm9yaWdpbjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgTG9jYXRpb24tbGlrZSBvYmplY3QgZm9yIHRoZSBnaXZlbiBVUkwuIElmIGl0IGlzIHJlbGF0aXZlLFxuICogdGhlIFVSTCBnZXRzIHJlc29sdmVkLlxuICogQ29uc2lkZXIgdGhlIHJldHVybmVkIG9iamVjdCBpbW11dGFibGUuIFRoaXMgaXMgZW5mb3JjZWQgZHVyaW5nXG4gKiB0ZXN0aW5nIGJ5IGZyZWV6aW5nIHRoZSBvYmplY3QuXG4gKiBUT0RPKCMzNDQ1Myk6IFRoZSBVUkwgY29uc3RydWN0b3IgaXNuJ3Qgc3VwcG9ydGVkIGluIElFMTEsIGJ1dCBpcyBzdXBwb3J0ZWRcbiAqIGV2ZXJ5d2hlcmUgZWxzZS4gVGhlcmUncyBhIGxvdCBvZiBjb2RlIHBhdGhzIChhbmQgYWxsIHVzZXMgb2YgdGhlIExydUNhY2hlKVxuICogdGhhdCBhcmUgYnVpbHQgYXJvdW5kIHRoaXMgcG9seWZpbGwuIE9uY2Ugd2UgY2FuIGRyb3AgSUUxMSBzdXBwb3J0IGFuZCBqdXN0XG4gKiB1c2UgdGhlIFVSTCBjb25zdHJ1Y3Rvciwgd2UgY2FuIGNsZWFyIG91dCBhbGwgb2YgcGFyc2VXaXRoQSwgYWxsIHRoZSBVUkxcbiAqIGNhY2hlIGxvZ2ljIChpbmNsLiBhZGRpdGlvbmFsIGNhY2hlcyBpbiBvdGhlciBjYWxsLXNpdGVzKS4gTW9zdCBpcyBndWFyZGVkIGJ5XG4gKiBJU19FU00gYW5kIGlzIG9ubHkgaW5jbHVkZWQgaW4gbm9tb2R1bGUgYnVpbGRzLCBidXQgc3RpbGwuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfbm9jYWNoZVxuICogICBDYWNoZSBpcyBhbHdheXMgaWdub3JlZCBvbiBFU00gYnVpbGRzLCBzZWUgaHR0cHM6Ly9nby5hbXAuZGV2L3ByLzMxNTk0XG4gKiBAcmV0dXJuIHshTG9jYXRpb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVVybERlcHJlY2F0ZWQodXJsLCBvcHRfbm9jYWNoZSkge1xuICBpZiAoIWNhY2hlZEFuY2hvckVsKSB7XG4gICAgY2FjaGVkQW5jaG9yRWwgPSAvKiogQHR5cGUgeyFIVE1MQW5jaG9yRWxlbWVudH0gKi8gKFxuICAgICAgc2VsZi5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgICApO1xuICAgIHVybENhY2hlID0gSVNfRVNNXG4gICAgICA/IG51bGxcbiAgICAgIDogc2VsZi5fX0FNUF9VUkxfQ0FDSEUgfHwgKHNlbGYuX19BTVBfVVJMX0NBQ0hFID0gbmV3IExydUNhY2hlKDEwMCkpO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlVXJsV2l0aEEoXG4gICAgY2FjaGVkQW5jaG9yRWwsXG4gICAgdXJsLFxuICAgIElTX0VTTSB8fCBvcHRfbm9jYWNoZSA/IG51bGwgOiB1cmxDYWNoZVxuICApO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBMb2NhdGlvbi1saWtlIG9iamVjdCBmb3IgdGhlIGdpdmVuIFVSTC4gSWYgaXQgaXMgcmVsYXRpdmUsXG4gKiB0aGUgVVJMIGdldHMgcmVzb2x2ZWQuXG4gKiBDb25zaWRlciB0aGUgcmV0dXJuZWQgb2JqZWN0IGltbXV0YWJsZS4gVGhpcyBpcyBlbmZvcmNlZCBkdXJpbmdcbiAqIHRlc3RpbmcgYnkgZnJlZXppbmcgdGhlIG9iamVjdC5cbiAqIEBwYXJhbSB7IUhUTUxBbmNob3JFbGVtZW50fSBhbmNob3JFbFxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHBhcmFtIHtMcnVDYWNoZT19IG9wdF9jYWNoZVxuICogICBDYWNoZSBpcyBhbHdheXMgaWdub3JlZCBvbiBFU00gYnVpbGRzLCBzZWUgaHR0cHM6Ly9nby5hbXAuZGV2L3ByLzMxNTk0XG4gKiBAcmV0dXJuIHshTG9jYXRpb259XG4gKiBAcmVzdHJpY3RlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VVcmxXaXRoQShhbmNob3JFbCwgdXJsLCBvcHRfY2FjaGUpIHtcbiAgaWYgKElTX0VTTSkge1xuICAgIC8vIERvaW5nIHRoaXMgY2F1c2VzIHRoZSA8YT4gdG8gYXV0by1zZXQgaXRzIG93biBocmVmIHRvIHRoZSByZXNvbHZlZCBwYXRoLFxuICAgIC8vIHdoaWNoIHdvdWxkIGJlIHRoZSBiYXNlVXJsIGZvciB0aGUgVVJMIGNvbnN0cnVjdG9yLlxuICAgIGFuY2hvckVsLmhyZWYgPSAnJztcbiAgICByZXR1cm4gLyoqIEB0eXBlIHs/fSAqLyAobmV3IFVSTCh1cmwsIGFuY2hvckVsLmhyZWYpKTtcbiAgfVxuXG4gIGlmIChvcHRfY2FjaGUgJiYgb3B0X2NhY2hlLmhhcyh1cmwpKSB7XG4gICAgcmV0dXJuIG9wdF9jYWNoZS5nZXQodXJsKTtcbiAgfVxuXG4gIGFuY2hvckVsLmhyZWYgPSB1cmw7XG5cbiAgLy8gSUUxMSBkb2Vzbid0IHByb3ZpZGUgZnVsbCBVUkwgY29tcG9uZW50cyB3aGVuIHBhcnNpbmcgcmVsYXRpdmUgVVJMcy5cbiAgLy8gQXNzaWduaW5nIHRvIGl0c2VsZiBhZ2FpbiBkb2VzIHRoZSB0cmljayAjMzQ0OS5cbiAgaWYgKCFhbmNob3JFbC5wcm90b2NvbCkge1xuICAgIGFuY2hvckVsLmhyZWYgPSBhbmNob3JFbC5ocmVmO1xuICB9XG5cbiAgY29uc3QgaW5mbyA9IC8qKiBAdHlwZSB7IUxvY2F0aW9ufSAqLyAoe1xuICAgIGhyZWY6IGFuY2hvckVsLmhyZWYsXG4gICAgcHJvdG9jb2w6IGFuY2hvckVsLnByb3RvY29sLFxuICAgIGhvc3Q6IGFuY2hvckVsLmhvc3QsXG4gICAgaG9zdG5hbWU6IGFuY2hvckVsLmhvc3RuYW1lLFxuICAgIHBvcnQ6IGFuY2hvckVsLnBvcnQgPT0gJzAnID8gJycgOiBhbmNob3JFbC5wb3J0LFxuICAgIHBhdGhuYW1lOiBhbmNob3JFbC5wYXRobmFtZSxcbiAgICBzZWFyY2g6IGFuY2hvckVsLnNlYXJjaCxcbiAgICBoYXNoOiBhbmNob3JFbC5oYXNoLFxuICAgIG9yaWdpbjogbnVsbCwgLy8gU2V0IGJlbG93LlxuICB9KTtcblxuICAvLyBTb21lIElFMTEgc3BlY2lmaWMgcG9seWZpbGxzLlxuICAvLyAxKSBJRTExIHN0cmlwcyBvdXQgdGhlIGxlYWRpbmcgJy8nIGluIHRoZSBwYXRobmFtZS5cbiAgaWYgKGluZm8ucGF0aG5hbWVbMF0gIT09ICcvJykge1xuICAgIGluZm8ucGF0aG5hbWUgPSAnLycgKyBpbmZvLnBhdGhuYW1lO1xuICB9XG5cbiAgLy8gMikgRm9yIFVSTHMgd2l0aCBpbXBsaWNpdCBwb3J0cywgSUUxMSBwYXJzZXMgdG8gZGVmYXVsdCBwb3J0cyB3aGlsZVxuICAvLyBvdGhlciBicm93c2VycyBsZWF2ZSB0aGUgcG9ydCBmaWVsZCBlbXB0eS5cbiAgaWYgKFxuICAgIChpbmZvLnByb3RvY29sID09ICdodHRwOicgJiYgaW5mby5wb3J0ID09IDgwKSB8fFxuICAgIChpbmZvLnByb3RvY29sID09ICdodHRwczonICYmIGluZm8ucG9ydCA9PSA0NDMpXG4gICkge1xuICAgIGluZm8ucG9ydCA9ICcnO1xuICAgIGluZm8uaG9zdCA9IGluZm8uaG9zdG5hbWU7XG4gIH1cblxuICAvLyBGb3IgZGF0YSBVUkkgYW5jaG9yRWwub3JpZ2luIGlzIGVxdWFsIHRvIHRoZSBzdHJpbmcgJ251bGwnIHdoaWNoIGlzIG5vdCB1c2VmdWwuXG4gIC8vIFdlIGluc3RlYWQgcmV0dXJuIHRoZSBhY3R1YWwgb3JpZ2luIHdoaWNoIGlzIHRoZSBmdWxsIFVSTC5cbiAgbGV0IG9yaWdpbjtcbiAgaWYgKGFuY2hvckVsLm9yaWdpbiAmJiBhbmNob3JFbC5vcmlnaW4gIT0gJ251bGwnKSB7XG4gICAgb3JpZ2luID0gYW5jaG9yRWwub3JpZ2luO1xuICB9IGVsc2UgaWYgKGluZm8ucHJvdG9jb2wgPT0gJ2RhdGE6JyB8fCAhaW5mby5ob3N0KSB7XG4gICAgb3JpZ2luID0gaW5mby5ocmVmO1xuICB9IGVsc2Uge1xuICAgIG9yaWdpbiA9IGluZm8ucHJvdG9jb2wgKyAnLy8nICsgaW5mby5ob3N0O1xuICB9XG4gIGluZm8ub3JpZ2luID0gb3JpZ2luO1xuXG4gIC8vIEZyZWV6ZSBkdXJpbmcgdGVzdGluZyB0byBhdm9pZCBhY2NpZGVudGFsIG11dGF0aW9uLlxuICBjb25zdCBmcm96ZW4gPSBtb2RlLmlzVGVzdCgpICYmIE9iamVjdC5mcmVlemUgPyBPYmplY3QuZnJlZXplKGluZm8pIDogaW5mbztcblxuICBpZiAob3B0X2NhY2hlKSB7XG4gICAgb3B0X2NhY2hlLnB1dCh1cmwsIGZyb3plbik7XG4gIH1cblxuICByZXR1cm4gZnJvemVuO1xufVxuXG4vKipcbiAqIEFwcGVuZHMgdGhlIHN0cmluZyBqdXN0IGJlZm9yZSB0aGUgZnJhZ21lbnQgcGFydCAob3Igb3B0aW9uYWxseVxuICogdG8gdGhlIGZyb250IG9mIHRoZSBxdWVyeSBzdHJpbmcpIG9mIHRoZSBVUkwuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW1TdHJpbmdcbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9hZGRUb0Zyb250XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmRFbmNvZGVkUGFyYW1TdHJpbmdUb1VybChcbiAgdXJsLFxuICBwYXJhbVN0cmluZyxcbiAgb3B0X2FkZFRvRnJvbnRcbikge1xuICBpZiAoIXBhcmFtU3RyaW5nKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuICBjb25zdCBtYWluQW5kRnJhZ21lbnQgPSB1cmwuc3BsaXQoJyMnLCAyKTtcbiAgY29uc3QgbWFpbkFuZFF1ZXJ5ID0gbWFpbkFuZEZyYWdtZW50WzBdLnNwbGl0KCc/JywgMik7XG5cbiAgbGV0IG5ld1VybCA9XG4gICAgbWFpbkFuZFF1ZXJ5WzBdICtcbiAgICAobWFpbkFuZFF1ZXJ5WzFdXG4gICAgICA/IG9wdF9hZGRUb0Zyb250XG4gICAgICAgID8gYD8ke3BhcmFtU3RyaW5nfSYke21haW5BbmRRdWVyeVsxXX1gXG4gICAgICAgIDogYD8ke21haW5BbmRRdWVyeVsxXX0mJHtwYXJhbVN0cmluZ31gXG4gICAgICA6IGA/JHtwYXJhbVN0cmluZ31gKTtcbiAgbmV3VXJsICs9IG1haW5BbmRGcmFnbWVudFsxXSA/IGAjJHttYWluQW5kRnJhZ21lbnRbMV19YCA6ICcnO1xuICByZXR1cm4gbmV3VXJsO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiB1cmxFbmNvZGVLZXlWYWx1ZShrZXksIHZhbHVlKSB7XG4gIHJldHVybiBgJHtlbmNvZGVVUklDb21wb25lbnQoa2V5KX09JHtlbmNvZGVVUklDb21wb25lbnQodmFsdWUpfWA7XG59XG5cbi8qKlxuICogQXBwZW5kcyBhIHF1ZXJ5IHN0cmluZyBmaWVsZCBhbmQgdmFsdWUgdG8gYSB1cmwuIGBrZXlgIGFuZCBgdmFsdWVgXG4gKiB3aWxsIGJlIHJhbiB0aHJvdWdoIGBlbmNvZGVVUklDb21wb25lbnRgIGJlZm9yZSBhcHBlbmRpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9hZGRUb0Zyb250XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRQYXJhbVRvVXJsKHVybCwga2V5LCB2YWx1ZSwgb3B0X2FkZFRvRnJvbnQpIHtcbiAgcmV0dXJuIGFwcGVuZEVuY29kZWRQYXJhbVN0cmluZ1RvVXJsKFxuICAgIHVybCxcbiAgICB1cmxFbmNvZGVLZXlWYWx1ZShrZXksIHZhbHVlKSxcbiAgICBvcHRfYWRkVG9Gcm9udFxuICApO1xufVxuXG4vKipcbiAqIEFwcGVuZHMgcXVlcnkgc3RyaW5nIGZpZWxkcyBhbmQgdmFsdWVzIHRvIGEgdXJsLiBUaGUgYHBhcmFtc2Agb2JqZWN0cydcbiAqIGBrZXlgcyBhbmQgYHZhbHVlYHMgd2lsbCBiZSB0cmFuc2Zvcm1lZCBpbnRvIHF1ZXJ5IHN0cmluZyBrZXlzL3ZhbHVlcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7IUpzb25PYmplY3Q8c3RyaW5nLCBzdHJpbmd8IUFycmF5PHN0cmluZz4+fSBwYXJhbXNcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFBhcmFtc1RvVXJsKHVybCwgcGFyYW1zKSB7XG4gIHJldHVybiBhcHBlbmRFbmNvZGVkUGFyYW1TdHJpbmdUb1VybCh1cmwsIHNlcmlhbGl6ZVF1ZXJ5U3RyaW5nKHBhcmFtcykpO1xufVxuXG4vKipcbiAqIEFwcGVuZCBxdWVyeSBzdHJpbmcgZmllbGRzIGFuZCB2YWx1ZXMgdG8gYSB1cmwsIG9ubHkgaWYgdGhlIGtleSBkb2VzIG5vdFxuICogZXhpc3QgaW4gY3VycmVudCBxdWVyeSBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcGFyYW0geyFKc29uT2JqZWN0PHN0cmluZywgc3RyaW5nfCFBcnJheTxzdHJpbmc+Pn0gcGFyYW1zXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRNaXNzaW5nUGFyYW1zVG9VcmwodXJsLCBwYXJhbXMpIHtcbiAgY29uc3QgbG9jYXRpb24gPSBwYXJzZVVybERlcHJlY2F0ZWQodXJsKTtcbiAgY29uc3QgZXhpc3RpbmdQYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKGxvY2F0aW9uLnNlYXJjaCk7XG4gIGNvbnN0IHBhcmFtc1RvQWRkID0gZGljdCh7fSk7XG4gIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhwYXJhbXMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIWhhc093bihleGlzdGluZ1BhcmFtcywga2V5c1tpXSkpIHtcbiAgICAgIHBhcmFtc1RvQWRkW2tleXNbaV1dID0gcGFyYW1zW2tleXNbaV1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYWRkUGFyYW1zVG9VcmwodXJsLCBwYXJhbXNUb0FkZCk7XG59XG5cbi8qKlxuICogU2VyaWFsaXplcyB0aGUgcGFzc2VkIHBhcmFtZXRlciBtYXAgaW50byBhIHF1ZXJ5IHN0cmluZyB3aXRoIGJvdGgga2V5c1xuICogYW5kIHZhbHVlcyBlbmNvZGVkLlxuICogQHBhcmFtIHshSnNvbk9iamVjdDxzdHJpbmcsIHN0cmluZ3whQXJyYXk8c3RyaW5nPj59IHBhcmFtc1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplUXVlcnlTdHJpbmcocGFyYW1zKSB7XG4gIGNvbnN0IHMgPSBbXTtcbiAgZm9yIChjb25zdCBrIGluIHBhcmFtcykge1xuICAgIGxldCB2ID0gcGFyYW1zW2tdO1xuICAgIGlmICh2ID09IG51bGwpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHYgPSBhcnJheU9yU2luZ2xlSXRlbVRvQXJyYXkodik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBzLnB1c2godXJsRW5jb2RlS2V5VmFsdWUoaywgdltpXSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIFVSTCBpcyBzZWN1cmU6IGVpdGhlciBIVFRQUyBvciBsb2NhbGhvc3QgKGZvciB0ZXN0aW5nKS5cbiAqIEBwYXJhbSB7c3RyaW5nfCFMb2NhdGlvbn0gdXJsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTZWN1cmVVcmxEZXByZWNhdGVkKHVybCkge1xuICB1cmwgPSB1cmxBc0xvY2F0aW9uKHVybCk7XG4gIHJldHVybiAoXG4gICAgdXJsLnByb3RvY29sID09ICdodHRwczonIHx8XG4gICAgdXJsLmhvc3RuYW1lID09ICdsb2NhbGhvc3QnIHx8XG4gICAgdXJsLmhvc3RuYW1lID09ICcxMjcuMC4wLjEnIHx8XG4gICAgZW5kc1dpdGgodXJsLmhvc3RuYW1lLCAnLmxvY2FsaG9zdCcpXG4gICk7XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IGEgZ2l2ZW4gdXJsIGlzIEhUVFBTIG9yIHByb3RvY29sIHJlbGF0aXZlLiBJdCdzIGEgdXNlci1sZXZlbFxuICogYXNzZXJ0LlxuICpcbiAqIFByb3ZpZGVzIGFuIGV4Y2VwdGlvbiBmb3IgbG9jYWxob3N0LlxuICpcbiAqIEBwYXJhbSB7P3N0cmluZ3x1bmRlZmluZWR9IHVybFN0cmluZ1xuICogQHBhcmFtIHshRWxlbWVudHxzdHJpbmd9IGVsZW1lbnRDb250ZXh0IEVsZW1lbnQgd2hlcmUgdGhlIHVybCB3YXMgZm91bmQuXG4gKiBAcGFyYW0ge3N0cmluZz19IHNvdXJjZU5hbWUgVXNlZCBmb3IgZXJyb3IgbWVzc2FnZXMuXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRIdHRwc1VybChcbiAgdXJsU3RyaW5nLFxuICBlbGVtZW50Q29udGV4dCxcbiAgc291cmNlTmFtZSA9ICdzb3VyY2UnXG4pIHtcbiAgdXNlckFzc2VydChcbiAgICB1cmxTdHJpbmcgIT0gbnVsbCxcbiAgICAnJXMgJXMgbXVzdCBiZSBhdmFpbGFibGUnLFxuICAgIGVsZW1lbnRDb250ZXh0LFxuICAgIHNvdXJjZU5hbWVcbiAgKTtcbiAgdXNlckFzc2VydChcbiAgICBpc1NlY3VyZVVybERlcHJlY2F0ZWQodXJsU3RyaW5nKSB8fCAvXlxcL1xcLy8udGVzdCh1cmxTdHJpbmcpLFxuICAgICclcyAlcyBtdXN0IHN0YXJ0IHdpdGggJyArXG4gICAgICAnXCJodHRwczovL1wiIG9yIFwiLy9cIiBvciBiZSByZWxhdGl2ZSBhbmQgc2VydmVkIGZyb20gJyArXG4gICAgICAnZWl0aGVyIGh0dHBzIG9yIGZyb20gbG9jYWxob3N0LiBJbnZhbGlkIHZhbHVlOiAlcycsXG4gICAgZWxlbWVudENvbnRleHQsXG4gICAgc291cmNlTmFtZSxcbiAgICB1cmxTdHJpbmdcbiAgKTtcbiAgcmV0dXJuIHVybFN0cmluZztcbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoYXQgYSBnaXZlbiB1cmwgaXMgYW4gYWJzb2x1dGUgSFRUUCBvciBIVFRQUyBVUkwuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsU3RyaW5nXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRBYnNvbHV0ZUh0dHBPckh0dHBzVXJsKHVybFN0cmluZykge1xuICB1c2VyQXNzZXJ0KFxuICAgIC9eaHR0cHM/XFw6L2kudGVzdCh1cmxTdHJpbmcpLFxuICAgICdVUkwgbXVzdCBzdGFydCB3aXRoIFwiaHR0cDovL1wiIG9yIFwiaHR0cHM6Ly9cIi4gSW52YWxpZCB2YWx1ZTogJXMnLFxuICAgIHVybFN0cmluZ1xuICApO1xuICByZXR1cm4gcGFyc2VVcmxEZXByZWNhdGVkKHVybFN0cmluZykuaHJlZjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBVUkwgd2l0aG91dCBmcmFnbWVudC4gSWYgVVJMIGRvZXNuJ3QgY29udGFpbiBmcmFnbWVudCwgdGhlIHNhbWVcbiAqIHN0cmluZyBpcyByZXR1cm5lZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUZyYWdtZW50KHVybCkge1xuICBjb25zdCBpbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gIGlmIChpbmRleCA9PSAtMSkge1xuICAgIHJldHVybiB1cmw7XG4gIH1cbiAgcmV0dXJuIHVybC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGZyYWdtZW50IGZyb20gdGhlIFVSTC4gSWYgdGhlIFVSTCBkb2Vzbid0IGNvbnRhaW4gZnJhZ21lbnQsXG4gKiB0aGUgZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkLlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnJhZ21lbnQodXJsKSB7XG4gIGNvbnN0IGluZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiB1cmwuc3Vic3RyaW5nKGluZGV4KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhlIFVSTCBoYXMgdGhlIG9yaWdpbiBvZiBhIHByb3h5LlxuICogQHBhcmFtIHtzdHJpbmd8IUxvY2F0aW9ufSB1cmwgVVJMIG9mIGFuIEFNUCBkb2N1bWVudC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3h5T3JpZ2luKHVybCkge1xuICByZXR1cm4gdXJscy5jZG5Qcm94eVJlZ2V4LnRlc3QodXJsQXNMb2NhdGlvbih1cmwpLm9yaWdpbik7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoZSBVUkwgb3JpZ2luIGlzIGxvY2FsaG9zdC5cbiAqIEBwYXJhbSB7c3RyaW5nfCFMb2NhdGlvbn0gdXJsIFVSTCBvZiBhbiBBTVAgZG9jdW1lbnQuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNMb2NhbGhvc3RPcmlnaW4odXJsKSB7XG4gIHJldHVybiB1cmxzLmxvY2FsaG9zdFJlZ2V4LnRlc3QodXJsQXNMb2NhdGlvbih1cmwpLm9yaWdpbik7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHVyaVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQW1wU2NyaXB0VXJpKHVyaSkge1xuICByZXR1cm4gdXJpLnN0YXJ0c1dpdGgoJ2FtcC1zY3JpcHQ6Jyk7XG59XG5cbi8qKlxuICogRm9yIHByb3h5LW9yaWdpbiBVUkxzLCByZXR1cm5zIHRoZSBzZXJ2aW5nIHR5cGUuIE90aGVyd2lzZSwgcmV0dXJucyBudWxsLlxuICogRS5nLiwgJ2h0dHBzOi8vYW1wLWNvbS5jZG4uYW1wcHJvamVjdC5vcmcvYS9zL2FtcC5jb20vYW1wX2RvY3VtZW50Lmh0bWwnXG4gKiByZXR1cm5zICdhJy5cbiAqIEBwYXJhbSB7c3RyaW5nfCFMb2NhdGlvbn0gdXJsIFVSTCBvZiBhbiBBTVAgZG9jdW1lbnQuXG4gKiBAcmV0dXJuIHs/c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJveHlTZXJ2aW5nVHlwZSh1cmwpIHtcbiAgdXJsID0gdXJsQXNMb2NhdGlvbih1cmwpO1xuICBpZiAoIWlzUHJveHlPcmlnaW4odXJsKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHBhdGggPSB1cmwucGF0aG5hbWUuc3BsaXQoJy8nLCAyKTtcbiAgcmV0dXJuIHBhdGhbMV07XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoZSBVUkwgaGFzIHZhbGlkIHByb3RvY29sLlxuICogRGVlcCBsaW5rIHByb3RvY29sIGlzIHZhbGlkLCBidXQgbm90IGphdmFzY3JpcHQgZXRjLlxuICogQHBhcmFtIHtzdHJpbmd8IUxvY2F0aW9ufSB1cmxcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3RvY29sVmFsaWQodXJsKSB7XG4gIHJldHVybiAhKHVybCAmJiBJTlZBTElEX1BST1RPQ09MUy5pbmNsdWRlcyh1cmxBc0xvY2F0aW9uKHVybCkucHJvdG9jb2wpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgVVJMIHdpdGhvdXQgQU1QIEpTIHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVBbXBKc1BhcmFtc0Zyb21VcmwodXJsKSB7XG4gIGNvbnN0IHtoYXNoLCBvcmlnaW4sIHBhdGhuYW1lLCBzZWFyY2h9ID0gcGFyc2VVcmxEZXByZWNhdGVkKHVybCk7XG4gIGNvbnN0IHNlYXJjaFJlbW92ZWQgPSByZW1vdmVBbXBKc1BhcmFtc0Zyb21TZWFyY2goc2VhcmNoKTtcbiAgcmV0dXJuIG9yaWdpbiArIHBhdGhuYW1lICsgc2VhcmNoUmVtb3ZlZCArIGhhc2g7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIFVSTCB3aXRob3V0IGEgcXVlcnkgc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU2VhcmNoKHVybCkge1xuICBjb25zdCBpbmRleCA9IHVybC5pbmRleE9mKCc/Jyk7XG4gIGlmIChpbmRleCA9PSAtMSkge1xuICAgIHJldHVybiB1cmw7XG4gIH1cbiAgY29uc3QgZnJhZ21lbnQgPSBnZXRGcmFnbWVudCh1cmwpO1xuICByZXR1cm4gdXJsLnN1YnN0cmluZygwLCBpbmRleCkgKyBmcmFnbWVudDtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIHBhcmFtZXRlcnMgdGhhdCBzdGFydCB3aXRoIGFtcCBqcyBwYXJhbWV0ZXIgcGF0dGVybiBhbmQgcmV0dXJucyB0aGVcbiAqIG5ldyBzZWFyY2ggc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFNlYXJjaFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW1vdmVBbXBKc1BhcmFtc0Zyb21TZWFyY2godXJsU2VhcmNoKSB7XG4gIC8vIFRoZSBiZWxvdyByZWdleCBpcyBhIGNvbWJvIG9mIHRoZXNlIG9yaWdpbmFsIHBhdHRlcm5zLiBDb21iaW5pbmcgdGhlc2UsXG4gIC8vIHJlbW92aW5nIHRoZSBjb3JyZXNwb25kaW5nIGAucmVwbGFjZWAgY2FsbHMsIGFuZCByZXVzaW5nXG4gIC8vIHJlbW92ZVBhcmFtc0Zyb21TZWFyY2ggc2F2ZXMgfjE3NUIuIE1hdGNoZXMgcGFyYW1zIGluIHF1ZXJ5IHN0cmluZzpcbiAgLy8gLSAvWz8mXWFtcF9qc1teJl0qLyAgIGFtcF9qc18qXG4gIC8vIC0gL1s/Jl1hbXBfZ3NhW14mXSovICBhbXBfZ3NhXG4gIC8vIC0gL1s/Jl1hbXBfclteJl0qLyAgICBhbXBfclxuICAvLyAtIC9bPyZdYW1wX2tpdFteJl0qLyAgYW1wX2tpdFxuICAvLyAtIC9bPyZddXNxcFteJl0qLyAgICAgdXNxcCAoZnJvbSBnb29nIGV4cGVyaW1lbnQpXG4gIHJldHVybiByZW1vdmVQYXJhbXNGcm9tU2VhcmNoKHVybFNlYXJjaCwgJyhhbXBfKGpzW14mPV0qfGdzYXxyfGtpdCl8dXNxcCknKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIHBhcmFtZXRlcnMgd2l0aCBwYXJhbSBuYW1lIGFuZCByZXR1cm5zIHRoZSBuZXcgc2VhcmNoIHN0cmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxTZWFyY2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbU5hbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVBhcmFtc0Zyb21TZWFyY2godXJsU2VhcmNoLCBwYXJhbU5hbWUpIHtcbiAgLy8gVE9ETzogQWNjZXB0IHBhcmFtTmFtZXMgYXMgYW4gYXJyYXkuXG4gIGlmICghdXJsU2VhcmNoIHx8IHVybFNlYXJjaCA9PSAnPycpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgY29uc3QgcGFyYW1SZWdleCA9IG5ldyBSZWdFeHAoYFs/Jl0ke3BhcmFtTmFtZX1cXFxcYlteJl0qYCwgJ2cnKTtcbiAgY29uc3Qgc2VhcmNoID0gdXJsU2VhcmNoLnJlcGxhY2UocGFyYW1SZWdleCwgJycpLnJlcGxhY2UoL15bPyZdLywgJycpO1xuICByZXR1cm4gc2VhcmNoID8gJz8nICsgc2VhcmNoIDogJyc7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc291cmNlIFVSTCBvZiBhbiBBTVAgZG9jdW1lbnQgZm9yIGRvY3VtZW50cyBzZXJ2ZWRcbiAqIG9uIGEgcHJveHkgb3JpZ2luIG9yIGRpcmVjdGx5LlxuICogQHBhcmFtIHtzdHJpbmd8IUxvY2F0aW9ufSB1cmwgVVJMIG9mIGFuIEFNUCBkb2N1bWVudC5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZVVybCh1cmwpIHtcbiAgdXJsID0gdXJsQXNMb2NhdGlvbih1cmwpO1xuXG4gIC8vIE5vdCBhIHByb3h5IFVSTCAtIHJldHVybiB0aGUgVVJMIGl0c2VsZi5cbiAgaWYgKCFpc1Byb3h5T3JpZ2luKHVybCkpIHtcbiAgICByZXR1cm4gdXJsLmhyZWY7XG4gIH1cblxuICAvLyBBIHByb3h5IFVSTC5cbiAgLy8gRXhhbXBsZSBwYXRoIHRoYXQgaXMgYmVpbmcgbWF0Y2hlZCBoZXJlLlxuICAvLyBodHRwczovL2Nkbi5hbXBwcm9qZWN0Lm9yZy9jL3Mvd3d3Lm9yaWdpbi5jb20vZm9vL1xuICAvLyBUaGUgL3MvIGlzIG9wdGlvbmFsIGFuZCBzaWduYWxzIGEgc2VjdXJlIG9yaWdpbi5cbiAgY29uc3QgcGF0aCA9IHVybC5wYXRobmFtZS5zcGxpdCgnLycpO1xuICBjb25zdCBwcmVmaXggPSBwYXRoWzFdO1xuICB1c2VyQXNzZXJ0KFxuICAgIFNFUlZJTkdfVFlQRV9QUkVGSVguaGFzKHByZWZpeCksXG4gICAgJ1Vua25vd24gcGF0aCBwcmVmaXggaW4gdXJsICVzJyxcbiAgICB1cmwuaHJlZlxuICApO1xuICBjb25zdCBkb21haW5Pckh0dHBzU2lnbmFsID0gcGF0aFsyXTtcbiAgY29uc3Qgb3JpZ2luID1cbiAgICBkb21haW5Pckh0dHBzU2lnbmFsID09ICdzJ1xuICAgICAgPyAnaHR0cHM6Ly8nICsgZGVjb2RlVVJJQ29tcG9uZW50KHBhdGhbM10pXG4gICAgICA6ICdodHRwOi8vJyArIGRlY29kZVVSSUNvbXBvbmVudChkb21haW5Pckh0dHBzU2lnbmFsKTtcbiAgLy8gU2FuaXR5IHRlc3QgdGhhdCB3aGF0IHdlIGZvdW5kIGxvb2tzIGxpa2UgYSBkb21haW4uXG4gIHVzZXJBc3NlcnQob3JpZ2luLmluZGV4T2YoJy4nKSA+IDAsICdFeHBlY3RlZCBhIC4gaW4gb3JpZ2luICVzJywgb3JpZ2luKTtcbiAgcGF0aC5zcGxpY2UoMSwgZG9tYWluT3JIdHRwc1NpZ25hbCA9PSAncycgPyAzIDogMik7XG4gIHJldHVybiAoXG4gICAgb3JpZ2luICtcbiAgICBwYXRoLmpvaW4oJy8nKSArXG4gICAgcmVtb3ZlQW1wSnNQYXJhbXNGcm9tU2VhcmNoKHVybC5zZWFyY2gpICtcbiAgICAodXJsLmhhc2ggfHwgJycpXG4gICk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc291cmNlIG9yaWdpbiBvZiBhbiBBTVAgZG9jdW1lbnQgZm9yIGRvY3VtZW50cyBzZXJ2ZWRcbiAqIG9uIGEgcHJveHkgb3JpZ2luIG9yIGRpcmVjdGx5LlxuICogQHBhcmFtIHtzdHJpbmd8IUxvY2F0aW9ufSB1cmwgVVJMIG9mIGFuIEFNUCBkb2N1bWVudC5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHNvdXJjZSBvcmlnaW4gb2YgdGhlIFVSTC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZU9yaWdpbih1cmwpIHtcbiAgcmV0dXJuIHBhcnNlVXJsRGVwcmVjYXRlZChnZXRTb3VyY2VVcmwodXJsKSkub3JpZ2luO1xufVxuXG4vKipcbiAqIFJldHVybnMgYWJzb2x1dGUgVVJMIHJlc29sdmVkIGJhc2VkIG9uIHRoZSByZWxhdGl2ZSBVUkwgYW5kIHRoZSBiYXNlLlxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVXJsU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ3whTG9jYXRpb259IGJhc2VVcmxcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVSZWxhdGl2ZVVybChyZWxhdGl2ZVVybFN0cmluZywgYmFzZVVybCkge1xuICBiYXNlVXJsID0gdXJsQXNMb2NhdGlvbihiYXNlVXJsKTtcbiAgaWYgKElTX0VTTSB8fCB0eXBlb2YgVVJMID09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbmV3IFVSTChyZWxhdGl2ZVVybFN0cmluZywgYmFzZVVybC5ocmVmKS50b1N0cmluZygpO1xuICB9XG4gIHJldHVybiByZXNvbHZlUmVsYXRpdmVVcmxGYWxsYmFja18ocmVsYXRpdmVVcmxTdHJpbmcsIGJhc2VVcmwpO1xufVxuXG4vKipcbiAqIEZhbGxiYWNrIGZvciBVUkwgcmVzb2x2ZXIgd2hlbiBVUkwgY2xhc3MgaXMgbm90IGF2YWlsYWJsZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVybFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd8IUxvY2F0aW9ufSBiYXNlVXJsXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZSBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVSZWxhdGl2ZVVybEZhbGxiYWNrXyhyZWxhdGl2ZVVybFN0cmluZywgYmFzZVVybCkge1xuICBiYXNlVXJsID0gdXJsQXNMb2NhdGlvbihiYXNlVXJsKTtcbiAgcmVsYXRpdmVVcmxTdHJpbmcgPSByZWxhdGl2ZVVybFN0cmluZy5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gIGNvbnN0IHJlbGF0aXZlVXJsID0gcGFyc2VVcmxEZXByZWNhdGVkKHJlbGF0aXZlVXJsU3RyaW5nKTtcblxuICAvLyBBYnNvbHV0ZSBVUkwuXG4gIGlmIChyZWxhdGl2ZVVybFN0cmluZy50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgocmVsYXRpdmVVcmwucHJvdG9jb2wpKSB7XG4gICAgcmV0dXJuIHJlbGF0aXZlVXJsLmhyZWY7XG4gIH1cblxuICAvLyBQcm90b2NvbC1yZWxhdGl2ZSBVUkwuXG4gIGlmIChyZWxhdGl2ZVVybFN0cmluZy5zdGFydHNXaXRoKCcvLycpKSB7XG4gICAgcmV0dXJuIGJhc2VVcmwucHJvdG9jb2wgKyByZWxhdGl2ZVVybFN0cmluZztcbiAgfVxuXG4gIC8vIEFic29sdXRlIHBhdGguXG4gIGlmIChyZWxhdGl2ZVVybFN0cmluZy5zdGFydHNXaXRoKCcvJykpIHtcbiAgICByZXR1cm4gYmFzZVVybC5vcmlnaW4gKyByZWxhdGl2ZVVybFN0cmluZztcbiAgfVxuXG4gIC8vIFJlbGF0aXZlIHBhdGguXG4gIHJldHVybiAoXG4gICAgYmFzZVVybC5vcmlnaW4gK1xuICAgIGJhc2VVcmwucGF0aG5hbWUucmVwbGFjZSgvXFwvW14vXSokLywgJy8nKSArXG4gICAgcmVsYXRpdmVVcmxTdHJpbmdcbiAgKTtcbn1cblxuLyoqXG4gKiBBZGQgXCJfX2FtcF9zb3VyY2Vfb3JpZ2luXCIgcXVlcnkgcGFyYW1ldGVyIHRvIHRoZSBVUkwuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29yc1VybCh3aW4sIHVybCkge1xuICBjaGVja0NvcnNVcmwodXJsKTtcbiAgY29uc3Qgc291cmNlT3JpZ2luID0gZ2V0U291cmNlT3JpZ2luKHdpbi5sb2NhdGlvbi5ocmVmKTtcbiAgcmV0dXJuIGFkZFBhcmFtVG9VcmwodXJsLCBTT1VSQ0VfT1JJR0lOX1BBUkFNLCBzb3VyY2VPcmlnaW4pO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgdXJsIGhhcyBfX2FtcF9zb3VyY2Vfb3JpZ2luIGFuZCB0aHJvd3MgaWYgaXQgZG9lcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQ29yc1VybCh1cmwpIHtcbiAgY29uc3QgcGFyc2VkVXJsID0gcGFyc2VVcmxEZXByZWNhdGVkKHVybCk7XG4gIGNvbnN0IHF1ZXJ5ID0gcGFyc2VRdWVyeVN0cmluZyhwYXJzZWRVcmwuc2VhcmNoKTtcbiAgdXNlckFzc2VydChcbiAgICAhKFNPVVJDRV9PUklHSU5fUEFSQU0gaW4gcXVlcnkpLFxuICAgICdTb3VyY2Ugb3JpZ2luIGlzIG5vdCBhbGxvd2VkIGluICVzJyxcbiAgICB1cmxcbiAgKTtcbn1cblxuLyoqXG4gKiBBZGRzIHRoZSBwYXRoIHRvIHRoZSBnaXZlbiB1cmwuXG4gKlxuICogQHBhcmFtIHshTG9jYXRpb259IHVybFxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZFBhdGhUb1VybCh1cmwsIHBhdGgpIHtcbiAgY29uc3QgcGF0aG5hbWUgPSB1cmwucGF0aG5hbWUucmVwbGFjZSgvXFwvPyQvLCAnLycpICsgcGF0aC5yZXBsYWNlKC9eXFwvLywgJycpO1xuICByZXR1cm4gdXJsLm9yaWdpbiArIHBhdGhuYW1lICsgdXJsLnNlYXJjaCArIHVybC5oYXNoO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/url.js