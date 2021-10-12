import {adConfig} from '#ads/_config';

import {Services} from '#service';

import {dev} from '#utils/log';

/**
 * @param {AMP.BaseElement} adElement
 * @return {!Promise<string|undefined>} A promise for a CID or undefined if
 *     - the ad network does not request one or
 *     - `amp-analytics` which provides the CID service was not installed.
 */
export function getAdCid(adElement) {
  const config = adConfig[adElement.element.getAttribute('type')];
  if (!config || !config['clientIdScope']) {
    return Promise.resolve();
  }
  return getOrCreateAdCid(
    adElement.getAmpDoc(),
    config['clientIdScope'],
    config['clientIdCookieName']
  );
}

/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampDoc
 * @param {string} clientIdScope
 * @param {string=} opt_clientIdCookieName
 * @param {number=} opt_timeout
 * @return {!Promise<string|undefined>} A promise for a CID or undefined.
 */
export function getOrCreateAdCid(
  ampDoc,
  clientIdScope,
  opt_clientIdCookieName,
  opt_timeout
) {
  const timeout =
    isNaN(opt_timeout) || opt_timeout == null ? 1000 : opt_timeout;
  const cidPromise = Services.cidForDoc(ampDoc).then((cidService) => {
    if (!cidService) {
      return;
    }
    return cidService
      .get(
        {
          scope: dev().assertString(clientIdScope),
          createCookieIfNotPresent: true,
          cookieName: opt_clientIdCookieName,
        },
        Promise.resolve(undefined)
      )
      .catch((error) => {
        // Not getting a CID is not fatal.
        dev().error('AD-CID', error);
        return undefined;
      });
  });
  // The CID should never be crucial for an ad. If it does not come within
  // 1 second, assume it will never arrive.
  return Services.timerFor(ampDoc.win)
    .timeoutPromise(timeout, cidPromise, 'cid timeout')
    .catch((error) => {
      // Timeout is not fatal.
      dev().warn('AD-CID', error);
      return undefined;
    });
}
