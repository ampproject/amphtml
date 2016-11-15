/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {buildUrl} from './url-builder';
import {makeCorrelator} from '../correlator';
import {getAdCid} from '../../../src/ad-cid';
import {documentInfoForDoc} from '../../../src/document-info';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isProxyOrigin} from '../../../src/url';
import {viewerForDoc} from '../../../src/viewer';
import {base64UrlDecodeToBytes} from '../../../src/utils/base64';
import {domFingerprint} from '../../../src/utils/dom-fingerprint';

/** @const {string} */
const AMP_SIGNATURE_HEADER = 'X-AmpAdSignature';

/** @const {number} */
const MAX_URL_LENGTH = 4096;

/** @enum {string} */
const AmpAdImplementation = {
  AMP_AD_XHR_TO_IFRAME: '2',
  AMP_AD_XHR_TO_IFRAME_OR_AMP: '3',
};

/**
 * Check whether Google Ads supports the A4A rendering pathway is valid for the
 * environment by ensuring native crypto support and page originated in the
 * the {@code cdn.ampproject.org} CDN <em>or</em> we must be running in local
 * dev mode.
 *
 * @param {!Window} win  Host window for the ad.
 * @param {!Element} element The AMP tag element.
 * @returns {boolean}  Whether Google Ads should attempt to render via the A4A
 *   pathway.
 */
export function isGoogleAdsA4AValidEnvironment(win, element) {
  const supportsNativeCrypto = win.crypto &&
      (win.crypto.subtle || win.crypto.webkitSubtle);
  const multiSizeRequest = element.dataset && element.dataset.multiSize;
  // Note: Theoretically, isProxyOrigin is the right way to do this, b/c it
  // will be kept up to date with known proxies.  However, it doesn't seem to
  // be compatible with loading the example files from localhost.  To hack
  // around that, just say that we're A4A eligible if we're in local dev
  // mode, regardless of origin path.
  return supportsNativeCrypto && !multiSizeRequest &&
      (isProxyOrigin(win.location) || getMode().localDev || getMode().test);
}

/**
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {string} baseUrl
 * @param {number} startTime
 * @param {number} slotNumber
 * @param {!Array<!./url-builder.QueryParameterDef>} queryParams
 * @param {!Array<!./url-builder.QueryParameterDef>} unboundedQueryParams
 * @return {!Promise<string>}
 */
export function googleAdUrl(
    a4a, baseUrl, startTime, slotNumber, queryParams, unboundedQueryParams) {
  /** @const {!Promise<string>} */
  const referrerPromise = viewerForDoc(a4a.getAmpDoc()).getReferrerUrl();
  return getAdCid(a4a).then(clientId => referrerPromise.then(referrer =>
      buildAdUrl(
          a4a, baseUrl, startTime, slotNumber, queryParams,
          unboundedQueryParams, clientId, referrer)));
}


/**
 * @param {!ArrayBuffer} creative
 * @param {!Headers} responseHeaders
 * @return {!Promise<!../../../extensions/amp-a4a/0.1/amp-a4a.AdResponseDef>}
 */
export function extractGoogleAdCreativeAndSignature(
    creative, responseHeaders) {
  let signature = null;
  try {
    if (responseHeaders.has(AMP_SIGNATURE_HEADER)) {
      signature =
        base64UrlDecodeToBytes(dev().assertString(
            responseHeaders.get(AMP_SIGNATURE_HEADER)));
    }
  } finally {
    return Promise.resolve(/** @type {
          !../../../extensions/amp-a4a/0.1/amp-a4a.AdResponseDef} */ (
          {creative, signature}));
  }
}

/**
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {string} baseUrl
 * @param {number} startTime
 * @param {number} slotNumber
 * @param {!Array<!./url-builder.QueryParameterDef>} queryParams
 * @param {!Array<!./url-builder.QueryParameterDef>} unboundedQueryParams
 * @param {(string|undefined)} clientId
 * @param {string} referrer
 * @return {string}
 */
function buildAdUrl(
    a4a, baseUrl, startTime, slotNumber, queryParams, unboundedQueryParams,
    clientId, referrer) {
  const global = a4a.win;
  const documentInfo = documentInfoForDoc(a4a.element);
  if (!global.gaGlobal) {
    // Read by GPT for GA/GPT integration.
    global.gaGlobal = {
      vid: clientId,
      hid: documentInfo.pageViewId,
    };
  }
  const slotRect = a4a.getIntersectionElementLayoutBox();
  const viewportRect = a4a.getViewport().getRect();
  const iframeDepth = iframeNestingDepth(global);
  const dtdParam = {name: 'dtd'};
  const adElement = a4a.element;
  const allQueryParams = queryParams.concat(
    [
      {
        name: 'is_amp',
        value: AmpAdImplementation.AMP_AD_XHR_TO_IFRAME_OR_AMP,
      },
      {name: 'amp_v', value: '$internalRuntimeVersion$'},
      {name: 'd_imp', value: '1'},
      {name: 'dt', value: startTime},
      {name: 'adf', value: domFingerprint(adElement)},
      {name: 'c', value: makeCorrelator(clientId, documentInfo.pageViewId)},
      {name: 'output', value: 'html'},
      {name: 'nhd', value: iframeDepth},
      {name: 'eid', value: adElement.getAttribute('data-experiment-id')},
      {name: 'biw', value: viewportRect.width},
      {name: 'bih', value: viewportRect.height},
      {name: 'adx', value: slotRect.left},
      {name: 'ady', value: slotRect.top},
      {name: 'u_hist', value: getHistoryLength(global)},
      dtdParam,
    ],
    unboundedQueryParams,
    [
      {name: 'url', value: documentInfo.canonicalUrl},
      {name: 'top', value: iframeDepth ? topWindowUrlOrDomain(global) : null},
      {
        name: 'loc',
        value: global.location.href == documentInfo.canonicalUrl ?
            null : global.location.href,
      },
      {name: 'ref', value: referrer},
    ]
  );
  dtdParam.value = elapsedTimeWithCeiling(Date.now(), startTime);
  return buildUrl(
      baseUrl, allQueryParams, MAX_URL_LENGTH, {name: 'trunc', value: '1'});
}

/**
 * @param {!Window} win
 * @return {!GoogleAdSlotCounter}
 */
export function getGoogleAdSlotCounter(win) {
  if (!win.AMP_GOOGLE_AD_SLOT_COUNTER) {
    win.AMP_GOOGLE_AD_SLOT_COUNTER = new GoogleAdSlotCounter();
  }
  return win.AMP_GOOGLE_AD_SLOT_COUNTER;
}

class GoogleAdSlotCounter {

  constructor() {
    /** @private {number} */
    this.nextSlotNumber_ = 0;
  }

  /**
   * @return {number}
   */
  nextSlotNumber() {
    return ++this.nextSlotNumber_;
  }

}

/**
 * @param {!Window} global
 * @return {number}
 */
function iframeNestingDepth(global) {
  let win = global;
  let depth = 0;
  while (win != win.parent) {
    win = win.parent;
    depth++;
  }
  dev().assert(win == global.top);
  return depth;
}

/**
 * @param {!Window} global
 * @return {number}
 */
function getHistoryLength(global) {
  // We have seen cases where accessing history length causes errors.
  try {
    return global.history.length;
  } catch (e) {
    return 0;
  }
}

/**
 * @param {!Window} global
 * @return {?string}
 */
function topWindowUrlOrDomain(global) {
  const ancestorOrigins = global.location.ancestorOrigins;
  if (ancestorOrigins) {
    const origin = global.location.origin;
    const topOrigin = ancestorOrigins[ancestorOrigins.length - 1];
    if (origin == topOrigin) {
      return global.top.location.href;
    }
    const secondFromTop = secondWindowFromTop(global);
    if (secondFromTop == global ||
        origin == ancestorOrigins[ancestorOrigins.length - 2]) {
      return secondFromTop./*REVIEW*/document.referrer;
    }
    return topOrigin;
  } else {
    try {
      return global.top.location.href;
    } catch (e) {}
    const secondFromTop = secondWindowFromTop(global);
    try {
      return secondFromTop./*REVIEW*/document.referrer;
    } catch (e) {}
    return null;
  }
}

/**
 * @param {!Window} global
 * @return {!Window}
 */
function secondWindowFromTop(global) {
  let secondFromTop = global;
  while (secondFromTop.parent != secondFromTop.parent.parent) {
    secondFromTop = secondFromTop.parent;
  }
  dev().assert(secondFromTop.parent == global.top);
  return secondFromTop;
}

/**
 * @param {number} time
 * @param {number} start
 * @return {(number|string)}
 */
function elapsedTimeWithCeiling(time, start) {
  const duration = time - start;
  if (duration >= 1e6) {
    return 'M';
  } else if (duration >= 0) {
    return duration;
  }
  return '-M';
}

/**
 * @param {!Window} win
 * @param {string=} opt_cid
 * @return {number} The correlator.
 */
export function getCorrelator(win, opt_cid) {
  if (!win.ampAdPageCorrelator) {
    win.ampAdPageCorrelator = makeCorrelator(
        opt_cid, documentInfoForDoc(win.document).pageViewId);
  }
  return win.ampAdPageCorrelator;
}
