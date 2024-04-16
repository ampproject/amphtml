import {getCookie} from '../../../src/cookies';
import {isInFie} from '../../../src/iframe-helper';
import {getMode} from '../../../src/mode';
import {isProxyOrigin} from '../../../src/url';

/**
 * COOKIE macro resolver
 * @param {!Window} win
 * @param {!Element} element
 * @param {string} name
 * @return {?string}
 */
export function cookieReader(win, element, name) {
  if (!isCookieAllowed(win, element)) {
    return null;
  }
  return getCookie(win, name);
}

/**
 * Determine if cookie writing/reading feature is supported in current
 * environment.
 * Disable cookie writer in friendly iframe and proxy origin and inabox.
 * @param {!Window} win
 * @param {!Element} element
 * @return {boolean}
 */
export function isCookieAllowed(win, element) {
  return (
    !isInFie(element) &&
    !isProxyOrigin(win.location) &&
    !(getMode(win).runtime == 'inabox')
  );
}
