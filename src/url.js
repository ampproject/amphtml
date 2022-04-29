import {LruCache} from '#core/data-structures/lru-cache';
import * as mode from '#core/mode';
import {arrayOrSingleItemToArray} from '#core/types/array';
import {hasOwn} from '#core/types/object';
import {endsWith} from '#core/types/string';
import {INVALID_PROTOCOLS, parseQueryString} from '#core/types/string/url';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import * as urls from './config/urls';

const SERVING_TYPE_PREFIX = new Set([
  // No viewer
  'c',
  // In viewer
  'v',
  // Ad landing page
  'a',
  // Ad
  'ad',
]);

/**
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */
let cachedAnchorEl;

/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {LruCache}
 */
let urlCache;

/** @const {string} */
export const SOURCE_ORIGIN_PARAM = '__amp_source_origin';

/**
 * Coerces a url into a location;
 * @function
 * @param {string|!Location} url
 * @return {!Location}
 */
const urlAsLocation = (url) =>
  typeof url == 'string' ? parseUrlDeprecated(url) : url;

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
 * isEsm() and is only included in nomodule builds, but still.
 * @param {string} url
 * @param {boolean=} opt_nocache
 *   Cache is always ignored on ESM builds, see https://go.amp.dev/pr/31594
 * @return {!Location}
 */
export function parseUrlDeprecated(url, opt_nocache) {
  if (!cachedAnchorEl) {
    cachedAnchorEl = /** @type {!HTMLAnchorElement} */ (
      self.document.createElement('a')
    );
    urlCache = mode.isEsm()
      ? null
      : self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new LruCache(100));
  }

  return parseUrlWithA(
    cachedAnchorEl,
    url,
    mode.isEsm() || opt_nocache ? null : urlCache
  );
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
  if (mode.isEsm()) {
    // Doing this causes the <a> to auto-set its own href to the resolved path,
    // which would be the baseUrl for the URL constructor.
    anchorEl.href = '';
    return /** @type {?} */ (new URL(url, anchorEl.href));
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

  const info = /** @type {!Location} */ ({
    href: anchorEl.href,
    protocol: anchorEl.protocol,
    host: anchorEl.host,
    hostname: anchorEl.hostname,
    port: anchorEl.port == '0' ? '' : anchorEl.port,
    pathname: anchorEl.pathname,
    search: anchorEl.search,
    hash: anchorEl.hash,
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

  // For data URI anchorEl.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.
  let origin;
  if (anchorEl.origin && anchorEl.origin != 'null') {
    origin = anchorEl.origin;
  } else if (info.protocol == 'data:' || !info.host) {
    origin = info.href;
  } else {
    origin = info.protocol + '//' + info.host;
  }
  info.origin = origin;

  // Freeze during testing to avoid accidental mutation.
  const frozen = mode.isTest() && Object.freeze ? Object.freeze(info) : info;

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
 * @param {string} key
 * @param {string} value
 * @return {string}
 */
function urlEncodeKeyValue(key, value) {
  return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
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
  return appendEncodedParamStringToUrl(
    url,
    urlEncodeKeyValue(key, value),
    opt_addToFront
  );
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
  const location = parseUrlDeprecated(url);
  const existingParams = parseQueryString(location.search);
  const paramsToAdd = {};
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
    let v = params[k];
    if (v == null) {
      continue;
    }

    v = arrayOrSingleItemToArray(v);
    for (let i = 0; i < v.length; i++) {
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
  userAssert(
    isSecureUrlDeprecated(urlString) || /^\/\//.test(urlString),
    '%s %s must start with ' +
      '"https://" or "//" or be relative and served from ' +
      'either https or from localhost. Invalid value: %s',
    elementContext,
    sourceName,
    urlString
  );
  return urlString;
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
  const path = url.pathname.split('/', 2);
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
  const {hash, origin, pathname, search} = parseUrlDeprecated(url);
  const searchRemoved = removeAmpJsParamsFromSearch(search);
  return origin + pathname + searchRemoved + hash;
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
  const paramRegex = new RegExp(`[?&]${paramName}\\b[^&]*`, 'g');
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
  url = urlAsLocation(url);

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
    SERVING_TYPE_PREFIX.has(prefix),
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
  baseUrl = urlAsLocation(baseUrl);
  if (mode.isEsm() || typeof URL == 'function') {
    return new URL(relativeUrlString, baseUrl.href).toString();
  }
  return resolveRelativeUrlFallback_(relativeUrlString, baseUrl);
}

/**
 * Returns absolute URL resolved based on the relative URL and the element.
 * @param {string} relativeUrlString
 * @param {!element} element
 * @return {string}
 */
export function relativeToSourceUrl(relativeUrlString, element) {
  const {sourceUrl} = Services.documentInfoForDoc(element);
  return Services.urlForDoc(element).resolveRelativeUrl(
    relativeUrlString,
    sourceUrl
  );
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
  const relativeUrl = parseUrlDeprecated(relativeUrlString);

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
 * Adds the path to the given url.
 *
 * @param {!Location} url
 * @param {string} path
 * @return {string}
 */
export function appendPathToUrl(url, path) {
  const pathname = url.pathname.replace(/\/?$/, '/') + path.replace(/^\//, '');
  return url.origin + pathname + url.search + url.hash;
}
