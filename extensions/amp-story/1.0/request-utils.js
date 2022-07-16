/**
 * @fileoverview Utils for requests on amp-story and dependencies.
 */

import {getChildJsonConfig} from '#core/dom';
import {getWin} from '#core/window';

import {Services} from '#service';

import {user, userAssert} from '#utils/log';

/** @private @const {string} */
export const CONFIG_SRC_ATTRIBUTE_NAME = 'src';

/** @private const {string} */
export const CREDENTIALS_ATTRIBUTE_NAME = 'data-credentials';

const TAG = 'request-utils';

/**
 * @param {!Element} el
 * @param {string} rawUrl
 * @param {Object=} opts
 * @return {(!Promise<!JsonObject>|!Promise<null>)}
 */
export function executeRequest(el, rawUrl, opts = {}) {
  if (!Services.urlForDoc(el).isProtocolValid(rawUrl)) {
    user().error(TAG, 'Invalid config url.');
    return Promise.resolve(null);
  }

  const xhrService = Services.xhrFor(getWin(el));

  return Services.urlReplacementsForDoc(el)
    .expandUrlAsync(user().assertString(rawUrl))
    .then((url) => xhrService.fetchJson(url, opts))
    .then((response) => {
      userAssert(response.ok, 'Invalid HTTP response');
      return response.json();
    });
}

/**
 * Gets the JSON config from the inline element or [src] url.
 * @param {?Element} element
 * @return {(!Promise<!JsonObject>|!Promise<null>)}
 */
export function getElementConfig(element) {
  if (!element) {
    return Promise.resolve();
  }
  const rawUrl = element.getAttribute(CONFIG_SRC_ATTRIBUTE_NAME);
  if (rawUrl) {
    const credentials = element.getAttribute(CREDENTIALS_ATTRIBUTE_NAME);
    return executeRequest(
      element,
      rawUrl,
      credentials ? {credentials} : {}
    ).catch(() => getInlineConfig(element));
  }
  return getInlineConfig(element);
}

/**
 * Retrieves the inline config - will be called if
 * src attribute is invalid or not present.
 * @param  {!Element} element
 * @return {(!Promise<!JsonObject>|!Promise<null>)}
 * @private
 */
function getInlineConfig(element) {
  try {
    return Promise.resolve(getChildJsonConfig(element));
  } catch (err) {
    return Promise.resolve(err);
  }
}
