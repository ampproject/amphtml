import {endsWith} from '#core/types/string';
import {tryDecodeUriComponent} from '#core/types/string/url';

import {userAssert} from '#utils/log';

import * as urls from './config/urls';
import {getSourceOrigin, isProxyOrigin, parseUrlDeprecated} from './url';

const TEST_COOKIE_NAME = '-test-amp-cookie-tmp';

/** @enum {string} */
export const SameSite_Enum = {
  LAX: 'Lax',
  STRICT: 'Strict',
  NONE: 'None',
};

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
  const cookieString = tryGetDocumentCookie_(win);
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
 * @param {!Window} win
 * @return {string}
 */
function tryGetDocumentCookie_(win) {
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
 *   domain:(string|undefined),
 *   sameSite: (!SameSite_Enum|undefined),
 *   secure: (boolean|undefined),
 * }=} options
 *     - highestAvailableDomain: If true, set the cookie at the widest domain
 *       scope allowed by the browser. E.g. on example.com if we are currently
 *       on www.example.com.
 *     - domain: Explicit domain to set. domain overrides HigestAvailableDomain
 *     - allowOnProxyOrigin: Allow setting a cookie on the AMP Cache.
 *     - sameSite: The SameSite_Enum value to use when setting the cookie.
 *     - secure: Whether the cookie should contain Secure (only sent over https).
 */
export function setCookie(win, name, value, expirationTime, options = {}) {
  checkOriginForSettingCookie(win, options, name);
  let domain = undefined;
  // Respect explicitly set domain over higestAvailabeDomain
  if (options.domain) {
    domain = options.domain;
  } else if (options.highestAvailableDomain) {
    domain = /** @type {string} */ (getHighestAvailableDomain(win));
  }
  trySetCookie(
    win,
    name,
    value,
    expirationTime,
    domain,
    options.sameSite,
    options.secure
  );
}

/**
 * Attemp to find the HighestAvailableDomain on
 * @param {!Window} win
 * @return {?string}
 */
export function getHighestAvailableDomain(win) {
  // <meta name='amp-cookie-scope'>. Need to respect the meta first.

  // Note: The same logic applies to shadow docs. Where all shadow docs are
  // considered to be in the same origin. And only the <meta> from
  // shell will be respected. (Header from shadow doc will be removed)
  const metaTag =
    win.document.head &&
    win.document.head.querySelector("meta[name='amp-cookie-scope']");

  if (metaTag) {
    // The content value could be an empty string. Return null instead
    const cookieScope = metaTag.getAttribute('content') || '';
    // Verify the validness of the amp-cookie-scope meta value
    const sourceOrigin = getSourceOrigin(win.location.href);
    // Verify the meta tag content value is valid
    if (endsWith(sourceOrigin, '.' + cookieScope)) {
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

  // Proxy origin w/o <meta name='amp-cookie-scope>
  // We cannot calculate the etld+1 without the public suffix list.
  // Return null instead.
  // Note: This should not affect cookie writing because we don't allow writing
  // cookie to highestAvailableDomain on proxy origin
  // In the case of link decoration on proxy origin,
  // we expect the correct meta tag to be
  // set by publisher or cache order for AMP runtime to find all subdomains.
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
 * @param {!SameSite_Enum=} sameSite
 * @param {boolean|undefined=} secure
 */
function trySetCookie(
  win,
  name,
  value,
  expirationTime,
  domain,
  sameSite,
  secure
) {
  // We do not allow setting cookies on the domain that contains both
  // the cdn. and www. hosts.
  // Note: we need to allow cdn.ampproject.org in order to optin to experiments
  if (domain == 'ampproject.org') {
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
    new Date(expirationTime).toUTCString() +
    getSameSiteString(win, sameSite) +
    (secure ? '; Secure' : '');
  try {
    win.document.cookie = cookie;
  } catch (ignore) {
    // Do not throw if setting the cookie failed Exceptions can be thrown
    // when AMP docs are opened on origins that do not allow setting
    // cookies such as null origins.
  }
}

/**
 * Gets the cookie string to use for SameSite. This only sets the SameSite
 * value if specified, falling back to the browser default. The default value
 * is equivalent to SameSite_Enum.NONE, but is planned to be set to SameSite_Enum.LAX in
 * Chrome 80.
 *
 * Note: In Safari 12, if the value is set to SameSite_Enum.NONE, it is treated by
 * the browser as SameSite_Enum.STRICT.
 * @param {Window} win
 * @param {!SameSite_Enum|undefined} sameSite
 * @return {string} The string to use when setting the cookie.
 */
function getSameSiteString(win, sameSite) {
  if (!sameSite) {
    return '';
  }

  return `; SameSite=${sameSite}`;
}

/**
 * Throws if a given cookie should not be set on the given origin.
 * This is a defense-in-depth. Callers should never run into this.
 *
 * @param {!Window} win
 * @param {!Object} options
 * @param {string} name For the error message.
 */
function checkOriginForSettingCookie(win, options, name) {
  if (options.allowOnProxyOrigin) {
    userAssert(
      !options.highestAvailableDomain,
      'Could not support highestAvailable Domain on proxy origin, ' +
        'specify domain explicitly'
    );
    return;
  }
  userAssert(
    !isProxyOrigin(win.location.href),
    `Should never attempt to set cookie on proxy origin: ${name}`
  );
  const current = parseUrlDeprecated(win.location.href).hostname.toLowerCase();
  const proxy = parseUrlDeprecated(urls.cdn).hostname.toLowerCase();
  userAssert(
    !(current == proxy || endsWith(current, '.' + proxy)),
    'Should never attempt to set cookie on proxy origin. (in depth check): ' +
      name
  );
}

/**
 * Return a temporary cookie name for testing only
 * @param {!Window} win
 * @return {string}
 */
function getTempCookieName(win) {
  let testCookieName = TEST_COOKIE_NAME;
  const counter = 0;
  while (getCookie(win, testCookieName)) {
    // test cookie name conflict, append counter to test cookie name
    testCookieName = TEST_COOKIE_NAME + counter;
  }
  return testCookieName;
}
