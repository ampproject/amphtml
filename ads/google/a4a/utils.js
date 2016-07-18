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
import {documentInfoFor} from '../../../src/document-info';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {timer} from '../../../src/timer';
import {isProxyOrigin} from '../../../src/url';
import {viewerFor} from '../../../src/viewer';
import {viewportFor} from '../../../src/viewport';

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
 * @returns {boolean}  Whether Google Ads should attempt to render via the A4A
 *   pathway.
 */
export function isGoogleAdsA4AValidEnvironment(win) {
  const supportsNativeCrypto = win.crypto &&
      (win.crypto.subtle || win.crypto.webkitSubtle);
  // Note: Theoretically, isProxyOrigin is the right way to do this, b/c it
  // will be kept up to date with known proxies.  However, it doesn't seem to
  // be compatible with loading the example files from localhost.  To hack
  // around that, just say that we're A4A eligible if we're in local dev
  // mode, regardless of origin path.
  return supportsNativeCrypto &&
      (isProxyOrigin(win.location) || getMode().localDev);
}

/**
 * @param {!AmpA4A} a4a
 * @param {string} baseUrl
 * @param {number} startTime
 * @param {number} slotNumber
 * @param {!Array<!QueryParameter>} queryParams
 * @param {!Array<!QueryParameter>} unboundedQueryParams
 * @return {!Promise<string>}
 */
export function googleAdUrl(
    a4a, baseUrl, startTime, slotNumber, queryParams, unboundedQueryParams) {
  const referrerPromise = viewerFor(a4a.getWin()).getReferrerUrl();
  return getAdCid(a4a).then(clientId => referrerPromise.then(referrer =>
      buildAdUrl(
          a4a, baseUrl, startTime, slotNumber, queryParams,
          unboundedQueryParams, clientId, referrer)));
}


/**
 * @param {string} str
 * @return {!Uint8Array}
 * @visibleForTesting
 */
export function base64ToByteArray(str) {
  const bytesAsString = atob(str);
  const len = bytesAsString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = bytesAsString.charCodeAt(i);
  }
  return bytes;
}

/**
 * @param {!ArrayBuffer} creative
 * @param {!Headers} responseHeaders
 * @return {!Promise<!AdResponseDef>}
 */
export function extractGoogleAdCreativeAndSignature(
    creative, responseHeaders) {
  let signature = null;
  try {
    if (responseHeaders.has(AMP_SIGNATURE_HEADER)) {
      signature = base64ToByteArray(responseHeaders.get(AMP_SIGNATURE_HEADER));
    }
  } finally {
    return Promise.resolve({creative, signature});
  }
}

/**
 * @param {!AmpA4A} a4a
 * @param {string} baseUrl
 * @param {number} startTime
 * @param {number} slotNumber
 * @param {!Array<!QueryParameter>} queryParams
 * @param {!Array<!QueryParameter>} unboundedQueryParams
 * @param {(string|undefined)} clientId
 * @param {string} referrer
 * @return {string}
 */
function buildAdUrl(
    a4a, baseUrl, startTime, slotNumber, queryParams, unboundedQueryParams,
    clientId, referrer) {
  const global = a4a.getWin();
  const documentInfo = documentInfoFor(global);
  if (!global.gaGlobal) {
    // Read by GPT for GA/GPT integration.
    global.gaGlobal = {
      vid: clientId,
      hid: documentInfo.pageViewId,
    };
  }
  const slotRect = a4a.getIntersectionElementLayoutBox();
  const viewportRect = viewportFor(global).getRect();
  const iframeDepth = iframeNestingDepth(global);
  const dtdParam = {name: 'dtd'};
  const allQueryParams = [
    ...queryParams,
    {
      name: 'is_amp',
      value: a4a.supportsShadowDom() ?
          AmpAdImplementation.AMP_AD_XHR_TO_IFRAME_OR_AMP :
          AmpAdImplementation.AMP_AD_XHR_TO_IFRAME,
    },
    {name: 'amp_v', value: '$internalRuntimeVersion$'},
    {name: 'dt', value: startTime},
    {name: 'adk', value: adKey(slotNumber, slotRect, viewportRect)},
    {name: 'c', value: makeCorrelator(clientId, documentInfo.pageViewId)},
    {name: 'output', value: 'html'},
    {name: 'nhd', value: iframeDepth},
    {name: 'eid', value: a4a.element.getAttribute('data-experiment-id')},
    {name: 'bih', value: viewportRect.height},
    {name: 'biw', value: viewportRect.width},
    {name: 'adx', value: slotRect.left},
    {name: 'ady', value: slotRect.top},
    {name: 'u_hist', value: getHistoryLength(global)},
    dtdParam,
    ...unboundedQueryParams,
    {name: 'url', value: documentInfo.canonicalUrl},
    {name: 'top', value: iframeDepth ? topWindowUrlOrDomain(global) : null},
    {
      name: 'loc',
      value: global.location.href == documentInfo.canonicalUrl ?
          null : global.location.href,
    },
    {name: 'ref', value: referrer},
  ];
  dtdParam.value = elapsedTimeWithCeiling(timer.now(), startTime);
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
  dev.assert(win == global.top);
  return depth;
}

/**
 * @param {number} slotNumber
 * @param {!LayoutRectDef} slotRect
 * @param {!LayoutRectDef} viewportRect
 * @return {string}
 */
function adKey(slotNumber, slotRect, viewportRect) {
  return formatFixedWidthInteger(slotNumber, 2) +
    // ad slot top, in 1/5 viewport height units
    formatFixedWidthInteger(slotRect.top * 5 / viewportRect.height, 4) +
    // ad slot left, in 1/5 viewport width units
    formatFixedWidthInteger(slotRect.left * 5 / viewportRect.width, 4);
}

/**
 * @param {number} num Number, non-negative.
 * @param {number} digits Number of digits, max 20.
 * @return {string}
 */
function formatFixedWidthInteger(num, digits) {
  const intPart = String(Math.max(Math.round(num), 0));
  const len = intPart.length;
  digits = Math.min(digits, 20);
  if (len > digits) {
    return '99999999999999999999'.substr(0, digits);
  }
  return '00000000000000000000'.substr(0, digits - len) + intPart;
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
  dev.assert(secondFromTop.parent == global.top);
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
