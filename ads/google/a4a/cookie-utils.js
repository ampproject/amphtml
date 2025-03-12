import {setCookie} from 'src/cookies';
import {isProxyOrigin} from 'src/url';

/** @type {string} */
export const AMP_GFP_SET_COOKIES_HEADER_NAME = 'amp-ff-set-cookies';

/**
 * @param {!Window} win
 * @param {!Response} fetchResponse
 */
export function maybeSetCookieFromAdResponse(win, fetchResponse) {
  if (
    !fetchResponse.headers.has(AMP_GFP_SET_COOKIES_HEADER_NAME) ||
    // Cookies are only allowed to be set on non-proxy origins.
    isProxyOrigin(win.location)
  ) {
    return;
  }
  let cookiesToSet = /** @type {!Array<!Object>} */ [];
  try {
    cookiesToSet = JSON.parse(
      fetchResponse.headers.get(AMP_GFP_SET_COOKIES_HEADER_NAME)
    );
  } catch {}
  for (const cookieInfo of cookiesToSet) {
    const cookieName =
      (cookieInfo['_version_'] ?? 1) === 2 ? '__gpi' : '__gads';
    const value = cookieInfo['_value_'];
    const domain = cookieInfo['_domain_'];
    const expiration = Math.max(cookieInfo['_expiration_'], 0);
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
  // Cookie setting above is blocked on proxy origins, but we add this check
  // just in case.
  if (isProxyOrigin(win.location)) {
    return;
  }
  try {
    const message = JSON.parse(event.data);
    if (message['googMsgType'] === 'gpi-uoo') {
      const userOptOut = !!message['userOptOut'];
      const clearAdsData = !!message['clearAdsData'];
      const domain = win.location.hostname;
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
