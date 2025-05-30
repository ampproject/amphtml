import {canSetCookie, setCookie} from 'src/cookies';
import {isProxyOrigin} from 'src/url';

/** @type {string} */
export const AMP_GFP_SET_COOKIES_HEADER_NAME = 'amp-ff-set-cookies';

/**
 * Returns the given domain if the current origin is not the AMP proxy origin,
 * otherwise returns the empty string.
 *
 * On proxy origin, we want cookies to be partitioned by subdomain to prevent
 * sharing across unrelated publishers, in which case we want to set the domain
 * equal to the empty string (leave it unset).
 *
 * @param {!Window} win
 * @param {string} domain
 * @return {string}
 */
function getProxySafeDomain(win, domain) {
  return isProxyOrigin(win.location) ? '' : domain;
}

/**
 * @param {!Window} win
 * @param {!Response} fetchResponse
 */
export function maybeSetCookieFromAdResponse(win, fetchResponse) {
  if (
    !fetchResponse.headers.has(AMP_GFP_SET_COOKIES_HEADER_NAME) ||
    !canSetCookie(win)
  ) {
    return;
  }
  let cookiesToSet = /** @type {!Array<!Object>} */ [];
  try {
    cookiesToSet = JSON.parse(
      fetchResponse.headers.get(AMP_GFP_SET_COOKIES_HEADER_NAME)
    )['cookie'];
  } catch {}
  if (!Array.isArray(cookiesToSet)) {
    return;
  }
  for (const cookieInfo of cookiesToSet) {
    const cookieName = (cookieInfo['version'] ?? 1) === 2 ? '__gpi' : '__gads';
    const value = cookieInfo['value'];
    // On proxy origin, we want cookies to be partitioned by subdomain to
    // prevent sharing across unrelated publishers, so we don't set a domain.
    const domain = getProxySafeDomain(win, cookieInfo['domain']);
    const expiration = Math.max(cookieInfo['expiration'], 0);
    setCookie(win, cookieName, value, expiration, {
      domain,
      secure: false,
    });
  }
}

/**
 * Sets up postmessage listener for cookie opt out signal.
 * @param {!Window} win
 * @param {!Event} event
 */
export function handleCookieOptOutPostMessage(win, event) {
  try {
    const message = JSON.parse(event.data);
    if (message['googMsgType'] === 'gpi-uoo') {
      const userOptOut = !!message['userOptOut'];
      const clearAdsData = !!message['clearAdsData'];
      const domain = getProxySafeDomain(win, win.location.hostname);
      setCookie(
        win,
        '__gpi_opt_out',
        userOptOut ? '1' : '0',
        // Last valid date for 32-bit browsers; 2038-01-19
        2147483646 * 1000,
        {domain}
      );
      if (userOptOut || clearAdsData) {
        setCookie(win, '__gads', 'delete', Date.now() - 1000, {domain});
        setCookie(win, '__gpi', 'delete', Date.now() - 1000, {domain});
      }
    }
  } catch {}
}
