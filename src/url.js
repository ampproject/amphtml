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

import {endsWith} from './string';
import {user} from './log';
import {getMode} from './mode';
import {urls} from './config';
import {isArray} from './types';

/**
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */
let a;

/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {Object<string, !Location>}
 */
let cache;

/** @private @const Matches amp_js_* paramters in query string. */
const AMP_JS_PARAMS_REGEX = /[?&]amp_js[^&]*/;

/** @const {string} */
export const SOURCE_ORIGIN_PARAM = '__amp_source_origin';

/**
 * @typedef {({
 *   href: string,
 *   protocol: string,
 *   host: string,
 *   hostname: string,
 *   port: string,
 *   pathname: string,
 *   search: string,
 *   hash: string,
 *   origin: string
 * }|!Location)}
 */
export let Location;

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {string} url
 * @param {boolean=} opt_nocache
 * @return {!Location}
 */
export function parseUrl(url, opt_nocache) {
  if (!a) {
    a = /** @type {!HTMLAnchorElement} */ (self.document.createElement('a'));
    cache = self.UrlCache || (self.UrlCache = Object.create(null));
  }

  const fromCache = cache[url];
  if (fromCache) {
    return fromCache;
  }
  a.href = url;
  // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick.
  // TODO(lannka, #3449): Remove all the polyfills once we don't support IE11
  // and it passes tests in all browsers.
  if (!a.protocol) {
    a.href = a.href;
  }

  const info = {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: null,  // Set below.
  };

  // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.
  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname;
  }

  // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.
  if ((info.protocol == 'http:' && info.port == 80)
      || (info.protocol == 'https:' && info.port == 443)) {
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
  const frozen = (getMode().test && Object.freeze) ? Object.freeze(info) : info;

  if (opt_nocache) {
    return frozen;
  }
  return cache[url] = frozen;
}

/**
 * Appends the string just before the fragment part (or optionally
 * to the front of the query string) of the URL.
 * @param {string} url
 * @param {string} paramString
 * @param {boolean=} opt_addToFront
 * @return {string}
 */
function appendParamStringToUrl(url, paramString, opt_addToFront) {
  if (!paramString) {
    return url;
  }
  const mainAndFragment = url.split('#', 2);
  const mainAndQuery = mainAndFragment[0].split('?', 2);

  let newUrl = mainAndQuery[0] + (
      mainAndQuery[1]
          ? (opt_addToFront
              ? `?${paramString}&${mainAndQuery[1]}`
              : `?${mainAndQuery[1]}&${paramString}`)
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
  return appendParamStringToUrl(url, field, opt_addToFront);
}

/**
 * Appends query string fields and values to a url. The `params` objects'
 * `key`s and `value`s will be transformed into query string keys/values.
 * @param {string} url
 * @param {!Object<string, string|!Array<string>>} params
 * @return {string}
 */
export function addParamsToUrl(url, params) {
  return appendParamStringToUrl(url, serializeQueryString(params));
}

/**
 * Serializes the passed parameter map into a query string with both keys
 * and values encoded.
 * @param {!Object<string, string|!Array<string>>} params
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
    urlString, elementContext, sourceName = 'source') {
  user().assert(urlString != null, '%s %s must be available',
      elementContext, sourceName);
  // (erwinm, #4560): type cast necessary until #4560 is fixed
  const url = parseUrl(/** @type {string} */ (urlString));
  user().assert(
      url.protocol == 'https:' || /^(\/\/)/.test(urlString) ||
      url.hostname == 'localhost' || endsWith(url.hostname, '.localhost'),
      '%s %s must start with ' +
      '"https://" or "//" or be relative and served from ' +
      'either https or from localhost. Invalid value: %s',
      elementContext, sourceName, urlString);
  return /** @type {string} */ (urlString);
}

/**
 * Asserts that a given url is an absolute HTTP or HTTPS URL.
 * @param {string} urlString
 * @return {string}
 */
export function assertAbsoluteHttpOrHttpsUrl(urlString) {
  user().assert(/^https?\:/i.test(urlString),
      'URL must start with "http://" or "https://". Invalid value: %s',
      urlString);
  return parseUrl(urlString).href;
}


/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 * @param {string} queryString
 * @return {!Object<string>}
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
  return (url.origin == urls.cdn ||
      (url.origin.indexOf('http://localhost:') == 0 &&
       (prefix == 'c' || prefix == 'v')));
}

/**
 * Removes parameters that start with amp js parameter pattern and returns the new
 * search string.
 * @param {string} urlSearch
 * @return {string}
 */
function removeAmpJsParams(urlSearch) {
  if (!urlSearch || urlSearch == '?') {
    return '';
  }
  const search = urlSearch
      .replace(AMP_JS_PARAMS_REGEX, '')
      .replace(/^[?&]/, '');  // Removes first ? or &.
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
    url = parseUrl(url);
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
  user().assert(prefix == 'c' || prefix == 'v',
      'Unknown path prefix in url %s', url.href);
  const domainOrHttpsSignal = path[2];
  const origin = domainOrHttpsSignal == 's'
      ? 'https://' + decodeURIComponent(path[3])
      : 'http://' + decodeURIComponent(domainOrHttpsSignal);
  // Sanity test that what we found looks like a domain.
  user().assert(origin.indexOf('.') > 0, 'Expected a . in origin %s', origin);
  path.splice(1, domainOrHttpsSignal == 's' ? 3 : 2);
  return origin + path.join('/') + removeAmpJsParams(url.search) +
      (url.hash || '');
}

/**
 * Returns the source origin of an AMP document for documents served
 * on a proxy origin or directly.
 * @param {string|!Location} url URL of an AMP document.
 * @return {string} The source origin of the URL.
 */
export function getSourceOrigin(url) {
  return parseUrl(getSourceUrl(url)).origin;
}

/**
 * Returns absolute URL resolved based on the relative URL and the base.
 * @param {string} relativeUrlString
 * @param {string|!Location} baseUrl
 * @return {string}
 */
export function resolveRelativeUrl(relativeUrlString, baseUrl) {
  if (typeof baseUrl == 'string') {
    baseUrl = parseUrl(baseUrl);
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
    baseUrl = parseUrl(baseUrl);
  }
  relativeUrlString = relativeUrlString.replace(/\\/g, '/');
  const relativeUrl = parseUrl(relativeUrlString);

  // Absolute URL.
  if (relativeUrlString.toLowerCase().indexOf(relativeUrl.protocol) == 0) {
    return relativeUrl.href;
  }

  // Protocol-relative URL.
  if (relativeUrlString.indexOf('//') == 0) {
    return baseUrl.protocol + relativeUrlString;
  }

  // Absolute path.
  if (relativeUrlString.indexOf('/') == 0) {
    return baseUrl.origin + relativeUrlString;
  }

  // Relative path.
  const basePath = baseUrl.pathname.split('/');
  return baseUrl.origin +
      (basePath.length > 1 ?
          basePath.slice(0, basePath.length - 1).join('/') :
          '') +
      '/' + relativeUrlString;
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
 * Checks if the url have __amp_source_origin and throws if it does.
 * @param {string} url
 */
export function checkCorsUrl(url) {
  const parsedUrl = parseUrl(url);
  const query = parseQueryString(parsedUrl.search);
  user().assert(!(SOURCE_ORIGIN_PARAM in query),
      'Source origin is not allowed in %s', url);
}
