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
import {
  getSourceOrigin,
  isProxyOrigin,
  parseUrlDeprecated,
  tryDecodeUriComponent,
} from './url';
import {urls} from './config';

const TEST_COOKIE_NAME = '-test-amp-cookie-tmp';

/**
 * Returns the value of the cookie. The cookie access is restricted and must
 * go through the privacy review. Before using this method please file a
 * GitHub issue with "Privacy Review" label.
 *
 * Returns the cookie's value or `null`.
 *
 * @param {!Window} win
 * @param {string} name
 * @return {?string}
 */
export function getCookie(win, name) {
  const cookieString = tryGetDocumentCookieNoInline(win);
  if (!cookieString) {
    return null;
  }
  const cookies = cookieString.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const eq = cookie.indexOf('=');
    if (eq == -1) {
      continue;
    }
    if (tryDecodeUriComponent(cookie.substring(0, eq).trim()) == name) {
      const value = cookie.substring(eq + 1).trim();
      return tryDecodeUriComponent(value, value);
    }
  }
  return null;
}

/**
 * This method should not be inlined to prevent TryCatch deoptimization.
 * NoInline keyword at the end of function name also prevents Closure compiler
 * from inlining the function.
 * @param {!Window} win
 * @return {string}
 */
function tryGetDocumentCookieNoInline(win) {
  try {
    return win.document.cookie;
  } catch (e) {
    // Act as if no cookie is available. Exceptions can be thrown when
    // AMP docs are opened on origins that do not allow setting
    // cookies such as null origins.
    return '';
  }
}

/**
 * Sets the value of the cookie. The cookie access is restricted and must
 * go through the privacy review. Before using this method please file a
 * GitHub issue with "Privacy Review" label.
 *
 * @param {!Window} win
 * @param {string} name
 * @param {string} value
 * @param {time} expirationTime
 * @param {{
 *   highestAvailableDomain:(boolean|undefined),
 *   domain:(string|undefined)
 * }=} opt_options
 *     - highestAvailableDomain: If true, set the cookie at the widest domain
 *       scope allowed by the browser. E.g. on example.com if we are currently
 *       on www.example.com.
 *     - domain: Explicit domain to set. domain overrides HigestAvailableDomain
 *     - allowOnProxyOrigin: Allow setting a cookie on the AMP Cache.
 */
export function setCookie(win, name, value, expirationTime, opt_options) {
  checkOriginForSettingCookie(win, opt_options, name);
  let domain = undefined;
  // Respect explicitily set domain over higestAvailabeDomain
  if (opt_options && opt_options.domain) {
    domain = opt_options.domain;
  } else if (opt_options && opt_options.highestAvailableDomain) {
    domain = getHighestAvailableDomain(win);
  }
  trySetCookie(win, name, value, expirationTime, domain);
}

/**
 * Attemp to find the HighestAvailableDomain on
 * @param {!Window} win
 */
export function getHighestAvailableDomain(win) {
  // <meta name='amp-cookie-scope'>. Need to respect the meta first.

  // Note: The same logic applies to shadow docs. Where all shadow docs are
  // considered to be in the same origin. And only the <meta> from
  // shell will be respected. (Header from shadow doc will be removed)
  const metaTag = win.document.head.querySelector(
    "meta[name='amp-cookie-scope']"
  );

  if (metaTag) {
    // The content value could be an empty string. Return null instead
    const cookieScope = metaTag.getAttribute('content') || '';
    // Verify the validness of the amp-cookie-scope meta value
    const sourceOrigin = getSourceOrigin(win.location.href);
    // Verify the meta tag content value is valid
    if (sourceOrigin.endsWith('.' + cookieScope)) {
      return cookieScope;
    } else {
      // When the amp-cookie-scope value is invalid, fallback to the exact origin
      // the document is contained in.
      // sourceOrigin in the format of 'https://xxx or http://xxx'
      return sourceOrigin.split('://')[1];
    }
  }

  if (!isProxyOrigin(win.location.href)) {
    const parts = win.location.hostname.split('.');
    let domain = parts[parts.length - 1];
    const testCookieName = getTempCookieName(win);
    for (let i = parts.length - 2; i >= 0; i--) {
      domain = parts[i] + '.' + domain;
      // Try set a cookie for testing only, expire after 1 sec
      trySetCookie(win, testCookieName, 'delete', Date.now() + 1000, domain);
      if (getCookie(win, testCookieName) == 'delete') {
        // Remove the cookie for testing
        trySetCookie(win, testCookieName, 'delete', Date.now() - 1000, domain);
        return domain;
      }
    }
  }

  // higestAvailableDomain cannot be found
  return null;
}

/**
 * Attempt to set a cookie with the given params.
 *
 * @param {!Window} win
 * @param {string} name
 * @param {string} value
 * @param {time} expirationTime
 * @param {string|undefined} domain
 */
function trySetCookie(win, name, value, expirationTime, domain) {
  // We do not allow setting cookies on the domain that contains both
  // the cdn. and www. hosts.
  if (
    domain == 'ampproject.org' ||
    domain == parseUrlDeprecated(urls.cdn).hostname.toLowerCase()
  ) {
    // Actively delete them.
    value = 'delete';
    expirationTime = 0;
  }
  const cookie =
    encodeURIComponent(name) +
    '=' +
    encodeURIComponent(value) +
    '; path=/' +
    (domain ? '; domain=' + domain : '') +
    '; expires=' +
    new Date(expirationTime).toUTCString();
  try {
    win.document.cookie = cookie;
  } catch (ignore) {
    // Do not throw if setting the cookie failed Exceptions can be thrown
    // when AMP docs are opened on origins that do not allow setting
    // cookies such as null origins.
  }
}

/**
 * Throws if a given cookie should not be set on the given origin.
 * This is a defense-in-depth. Callers should never run into this.
 *
 * @param {!Window} win
 * @param {!Object|undefined} options
 * @param {string} name For the error message.
 */
function checkOriginForSettingCookie(win, options, name) {
  if (options && options.allowOnProxyOrigin) {
    if (options.highestAvailableDomain) {
      throw new Error(
        'Could not support higestAvailable Domain on proxy origin, ' +
          'specify domain explicitly'
      );
    }
    return;
  }

  if (isProxyOrigin(win.location.href)) {
    throw new Error(
      'Should never attempt to set cookie on proxy origin: ' + name
    );
  }

  const current = parseUrlDeprecated(win.location.href).hostname.toLowerCase();
  const proxy = parseUrlDeprecated(urls.cdn).hostname.toLowerCase();
  if (current == proxy || endsWith(current, '.' + proxy)) {
    throw new Error(
      'Should never attempt to set cookie on proxy origin.' +
        ' (in depth check): ' +
        name
    );
  }
}

/**
 * Return a temporaty cookie name for testing only
 * @param {!Window} win
 * @return {string}
 */
function getTempCookieName(win) {
  let testCookieName = TEST_COOKIE_NAME;
  const counter = 0;
  while (getCookie(win, testCookieName)) {
    // test cookie name conflit, append counter to test cookie name
    testCookieName = TEST_COOKIE_NAME + counter;
  }
  return testCookieName;
}
