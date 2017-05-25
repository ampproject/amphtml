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
import {isCanary} from '../../../src/experiments';
import {getClientScopedAdCid} from '../../../src/ad-cid';
import {documentInfoForDoc} from '../../../src/services';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isProxyOrigin} from '../../../src/url';
import {viewerForDoc} from '../../../src/services';
import {base64UrlDecodeToBytes} from '../../../src/utils/base64';
import {domFingerprint} from '../../../src/utils/dom-fingerprint';
import {
  isExperimentOn,
  toggleExperiment,
} from '../../../src/experiments';

/** @const {string} */
const AMP_SIGNATURE_HEADER = 'X-AmpAdSignature';

/** @const {string} */
const CREATIVE_SIZE_HEADER = 'X-CreativeSize';

/** @type {string}  */
const AMP_ANALYTICS_HEADER = 'X-AmpAnalytics';

/** @const {number} */
const MAX_URL_LENGTH = 4096;

/** @enum {string} */
const AmpAdImplementation = {
  AMP_AD_XHR_TO_IFRAME: '2',
  AMP_AD_XHR_TO_IFRAME_OR_AMP: '3',
};

/** @const {!Object} */
export const ValidAdContainerTypes = {
  'AMP-STICKY-AD': 'sa',
  'AMP-FX-FLYING-CARPET': 'fc',
  'AMP-LIGHTBOX': 'lb',
};

/** @const {string} */
export const QQID_HEADER = 'X-QQID';

/**
 * Element attribute that stores experiment IDs.
 *
 * Note: This attribute should be used only for tracking experimental
 * implementations of AMP tags, e.g., by AMPHTML implementors.  It should not be
 * added by a publisher page.
 *
 * @const {!string}
 * @visibleForTesting
 */
export const EXPERIMENT_ATTRIBUTE = 'data-experiment-id';

/** @typedef {{urls: !Array<string>}}
 */
export let AmpAnalyticsConfigDef;

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
      (isProxyOrigin(win.location) || getMode().localDev || getMode().test);
}

/**
 * @param {!AMP.BaseElement} ampElement The element on whose lifecycle this
 *    reporter will be reporting.
 * @return {boolean} whether reporting is enabled for this element
 */
export function isReportingEnabled(ampElement) {
  // Carve-outs: We only want to enable profiling pingbacks when:
  //   - The ad is from one of the Google networks (AdSense or Doubleclick).
  //   - The ad slot is in the A4A-vs-3p amp-ad control branch (either via
  //     internal, client-side selection or via external, Google Search
  //     selection).
  //   - We haven't turned off profiling via the rate controls in
  //     build-system/global-config/{canary,prod}-config.json
  // If any of those fail, we use the `BaseLifecycleReporter`, which is a
  // a no-op (sends no pings).
  const type = ampElement.element.getAttribute('type');
  const win = ampElement.win;
  const experimentName = 'a4aProfilingRate';
  // In local dev mode, neither the canary nor prod config files is available,
  // so manually set the profiling rate, for testing/dev.
  if (getMode().localDev) {
    toggleExperiment(win, experimentName, true, true);
  }
  return (type == 'doubleclick' || type == 'adsense') &&
      isExperimentOn(win, experimentName);
}

/**
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {string} baseUrl
 * @param {number} startTime
 * @param {!Array<!./url-builder.QueryParameterDef>} queryParams
 * @param {!Array<!./url-builder.QueryParameterDef>} unboundedQueryParams
 *     Parameters that will be put at the end of the URL, where they may be
 *     elided for length reasons. Intended for parameters with potentially
 *     long values, like URLs.
 * @param {!Array<string>=} opt_experimentIds Any experiments IDs (in addition
 *     to those specified on the ad element) that should be included in the
 *     request.
 * @return {!Promise<string>}
 */
export function googleAdUrl(
    a4a, baseUrl, startTime, queryParams, unboundedQueryParams,
    opt_experimentIds) {
  // TODO: Maybe add checks in case these promises fail.
  /** @const {!Promise<string>} */
  const referrerPromise = viewerForDoc(a4a.getAmpDoc()).getReferrerUrl();
  return getClientScopedAdCid(a4a.getAmpDoc(), 'AMP_ECID_GOOGLE').then(
      clientId => referrerPromise.then(referrer => {
        const adElement = a4a.element;
        window['ampAdGoogleIfiCounter'] = window['ampAdGoogleIfiCounter'] || 1;
        const slotNumber = window['ampAdGoogleIfiCounter']++;
        const win = a4a.win;
        const documentInfo = documentInfoForDoc(adElement);
      // Read by GPT for GA/GPT integration.
        win.gaGlobal = win.gaGlobal ||
      {cid: clientId, hid: documentInfo.pageViewId};
        const slotRect = a4a.getPageLayoutBox();
        const screen = win.screen;
        const viewport = a4a.getViewport();
        const viewportRect = viewport.getRect();
        const iframeDepth = iframeNestingDepth(win);
        const viewportSize = viewport.getSize();
    // Detect container types.
        const containerTypeSet = {};
        for (let el = adElement.parentElement, counter = 0;
        el && counter < 20; el = el.parentElement, counter++) {
          const tagName = el.tagName.toUpperCase();
          if (ValidAdContainerTypes[tagName]) {
            containerTypeSet[ValidAdContainerTypes[tagName]] = true;
          }
        }
        const pfx =
        (containerTypeSet[ValidAdContainerTypes['AMP-FX-FLYING-CARPET']]
         || containerTypeSet[ValidAdContainerTypes['AMP-STICKY-AD']])
        ? '1' : '0';
        queryParams.push({name: 'act', value:
      Object.keys(containerTypeSet).join()});
        if (isCanary(win)) {
      // The semantics here are:
      //   0: production branch (this is never actually sent)
      //   1: control branch (this is not yet supported, so is never sent)
      //   2: canary branch
      queryParams.push({name: 'art', value: '2'});
    }
        let eids = adElement.getAttribute('data-experiment-id');
        if (opt_experimentIds) {
      eids = mergeExperimentIds(opt_experimentIds, eids);
    }
        const allQueryParams = queryParams.concat(
      [
        {
          name: 'is_amp',
          value: AmpAdImplementation.AMP_AD_XHR_TO_IFRAME_OR_AMP,
        },
        {name: 'amp_v', value: '$internalRuntimeVersion$'},
        {name: 'd_imp', value: '1'},
        {name: 'dt', value: startTime},
        {name: 'ifi', value: slotNumber},
        {name: 'adf', value: domFingerprint(adElement)},
        {name: 'c', value: getCorrelator(win, clientId)},
        {name: 'output', value: 'html'},
        {name: 'nhd', value: iframeDepth},
        {name: 'iu', value: adElement.getAttribute('data-ad-slot')},
        {name: 'eid', value: eids},
        {name: 'biw', value: viewportRect.width},
        {name: 'bih', value: viewportRect.height},
        {name: 'adx', value: slotRect.left},
        {name: 'ady', value: slotRect.top},
        {name: 'u_aw', value: screen ? screen.availWidth : null},
        {name: 'u_ah', value: screen ? screen.availHeight : null},
        {name: 'u_cd', value: screen ? screen.colorDepth : null},
        {name: 'u_w', value: screen ? screen.width : null},
        {name: 'u_h', value: screen ? screen.height : null},
        {name: 'u_tz', value: -new Date().getTimezoneOffset()},
        {name: 'u_his', value: getHistoryLength(win)},
        {name: 'oid', value: '2'},
        {name: 'brdim', value: additionalDimensions(win, viewportSize)},
        {name: 'isw', value: viewportSize.width},
        {name: 'ish', value: viewportSize.height},
        {name: 'pfx', value: pfx},
        {name: 'rc', value: a4a.fromResumeCallback ? 1 : null},
      ],
      unboundedQueryParams,
      [
        {name: 'url', value: documentInfo.canonicalUrl},
        {name: 'top', value: iframeDepth ? topWindowUrlOrDomain(win) : null},
            {
              name: 'loc',
              value: win.location.href == documentInfo.canonicalUrl ?
            null : win.location.href,
            },
        {name: 'ref', value: referrer},
      ]
    );
        const url = buildUrl(baseUrl, allQueryParams, MAX_URL_LENGTH - 10,
                         {name: 'trunc', value: '1'});
        return url + '&dtd=' + elapsedTimeWithCeiling(Date.now(), startTime);
      }));
}

/**
 * @param {!ArrayBuffer} creative
 * @param {!../../../src/service/xhr-impl.FetchResponseHeaders} responseHeaders
 * @return {!Promise<!../../../extensions/amp-a4a/0.1/amp-a4a.AdResponseDef>}
 */
export function extractGoogleAdCreativeAndSignature(
    creative, responseHeaders) {
  let signature = null;
  let size = null;
  try {
    if (responseHeaders.has(AMP_SIGNATURE_HEADER)) {
      signature =
        base64UrlDecodeToBytes(dev().assertString(
            responseHeaders.get(AMP_SIGNATURE_HEADER)));
    }
    if (responseHeaders.has(CREATIVE_SIZE_HEADER)) {
      const sizeHeader = responseHeaders.get(CREATIVE_SIZE_HEADER);
      dev().assert(new RegExp('[0-9]+x[0-9]+').test(sizeHeader));
      const sizeArr = sizeHeader
          .split('x')
          .map(dim => Number(dim));
      size = {width: sizeArr[0], height: sizeArr[1]};
    }
  } finally {
    return Promise.resolve(/** @type {
          !../../../extensions/amp-a4a/0.1/amp-a4a.AdResponseDef} */ (
          {creative, signature, size}));
  }
}

/**
 * @param {!Window} win
 * @return {number}
 */
function iframeNestingDepth(win) {
  let w = win;
  let depth = 0;
  while (w != w.parent && depth < 100) {
    w = w.parent;
    depth++;
  }
  dev().assert(w == win.top);
  return depth;
}

/**
 * @param {!Window} win
 * @return {number}
 */
function getHistoryLength(win) {
  // We have seen cases where accessing history length causes errors.
  try {
    return win.history.length;
  } catch (e) {
    return 0;
  }
}

/**
 * @param {!Window} win
 * @return {?string}
 */
function topWindowUrlOrDomain(win) {
  const ancestorOrigins = win.location.ancestorOrigins;
  if (ancestorOrigins) {
    const origin = win.location.origin;
    const topOrigin = ancestorOrigins[ancestorOrigins.length - 1];
    if (origin == topOrigin) {
      return win.top.location.href;
    }
    const secondFromTop = secondWindowFromTop(win);
    if (secondFromTop == win ||
        origin == ancestorOrigins[ancestorOrigins.length - 2]) {
      return secondFromTop./*REVIEW*/document.referrer;
    }
    return topOrigin;
  } else {
    try {
      return win.top.location.href;
    } catch (e) {}
    const secondFromTop = secondWindowFromTop(win);
    try {
      return secondFromTop./*REVIEW*/document.referrer;
    } catch (e) {}
    return null;
  }
}

/**
 * @param {!Window} win
 * @return {!Window}
 */
function secondWindowFromTop(win) {
  let secondFromTop = win;
  let depth = 0;
  while (secondFromTop.parent != secondFromTop.parent.parent &&
        depth < 100) {
    secondFromTop = secondFromTop.parent;
    depth++;
  }
  dev().assert(secondFromTop.parent == win.top);
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

/**
 * Collect additional dimensions for the brdim parameter.
 * @param {!Window} win The window for which we read the browser dimensions.
 * @param {{width: number, height: number}|null} viewportSize
 * @return {string}
 * @visibleForTesting
 */
export function additionalDimensions(win, viewportSize) {
  // Some browsers throw errors on some of these.
  let screenX, screenY, outerWidth, outerHeight, innerWidth, innerHeight;
  try {
    screenX = win.screenX;
    screenY = win.screenY;
  } catch (e) {}
  try {
    outerWidth = win.outerWidth;
    outerHeight = win.outerHeight;
  } catch (e) {}
  try {
    innerWidth = viewportSize.width;
    innerHeight = viewportSize.height;
  } catch (e) {}
  return [win.screenLeft,
          win.screenTop,
          screenX,
          screenY,
          win.screen ? win.screen.availWidth : undefined,
          win.screen ? win.screen.availTop : undefined,
          outerWidth,
          outerHeight,
          innerWidth,
          innerHeight].join();
};

/**
 * Extracts configuration used to build amp-analytics element for active view.
 *
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {!../../../src/service/xhr-impl.FetchResponseHeaders} responseHeaders
 *   XHR service FetchResponseHeaders object containing the response
 *   headers.
 * @param {number=} opt_deltaTime The time difference, in ms, between the
 *   lifecycle reporter's initialization and now.
 * @param {number=} opt_initTime The initialization time, in ms, of the
 *   lifecycle reporter.
 *   TODO(levitzky) Remove the above two params once AV numbers stabilize.
 * @return {?JSONType} config or null if invalid/missing.
 */
export function extractAmpAnalyticsConfig(
    a4a, responseHeaders, opt_deltaTime = -1, opt_initTime = -1) {
  if (!responseHeaders.has(AMP_ANALYTICS_HEADER)) {
    return null;
  }
  try {
    const analyticsConfig =
      JSON.parse(responseHeaders.get(AMP_ANALYTICS_HEADER));
    dev().assert(Array.isArray(analyticsConfig['url']));
    const urls = analyticsConfig.url;
    if (!urls.length) {
      return null;
    }

    const config = /** @type {JSONType}*/ ({
      'transport': {'beacon': false, 'xhrpost': false},
      'triggers': {
        'continuousVisible': {
          'on': 'visible',
          'visibilitySpec': {
            'selector': 'amp-ad',
            'selectionMethod': 'closest',
            'visiblePercentageMin': 50,
            'continuousTimeMin': 1000,
          },
        },
        'continuousVisibleIniLoad': {
          'on': 'ini-load',
          'selector': 'amp-ad',
          'selectionMethod': 'closest',
        },
        'continuousVisibleRenderStart': {
          'on': 'render-start',
          'selector': 'amp-ad',
          'selectionMethod': 'closest',
        },
      },
    });
    const requests = {};
    for (let idx = 1; idx <= urls.length; idx++) {
      // TODO: Ensure url is valid and not freeform JS?
      requests[`visibility${idx}`] = `${urls[idx - 1]}`;
    }
    // Security review needed here.
    config['requests'] = requests;
    config['triggers']['continuousVisible']['request'] =
        Object.keys(requests);
    // Add CSI pingbacks.
    const correlator = getCorrelator(a4a.win);
    const slotId = a4a.element.getAttribute('data-amp-slot-index');
    const qqid = (responseHeaders && responseHeaders.has(QQID_HEADER))
        ? responseHeaders.get(QQID_HEADER) : 'null';
    const eids = encodeURIComponent(
        a4a.element.getAttribute(EXPERIMENT_ATTRIBUTE));
    const adType = a4a.element.getAttribute('type');
    const baseCsiUrl = 'https://csi.gstatic.com/csi?s=a4a' +
        `&c=${correlator}&slotId=${slotId}&qqid.${slotId}=${qqid}` +
        `&dt=${opt_initTime}` +
        (eids != 'null' ? `&e.${slotId}=${eids}` : ``) +
        `&rls=$internalRuntimeVersion$&adt.${slotId}=${adType}`;
    opt_deltaTime = Math.round(opt_deltaTime);
    config['requests']['iniLoadCsi'] = baseCsiUrl +
        `&met.a4a.${slotId}=iniLoadCsi.${opt_deltaTime}`;
    config['requests']['renderStartCsi'] = baseCsiUrl +
        `&met.a4a.${slotId}=renderStartCsi.${opt_deltaTime}`;
    config['triggers']['continuousVisibleIniLoad']['request'] =
        'iniLoadCsi';
    config['triggers']['continuousVisibleRenderStart']['request'] =
        'renderStartCsi';
    return config;
  } catch (err) {
    dev().error('AMP-A4A', 'Invalid analytics', err,
        responseHeaders.get(AMP_ANALYTICS_HEADER));
  }
  return null;
}

/**
 * Add new experiment IDs to a (possibly empty) existing set of experiment IDs.
 * The {@code currentIdString} may be {@code null} or {@code ''}, but if it is
 * populated, it must contain a comma-separated list of integer experiment IDs
 * (per {@code parseExperimentIds()}).  Returns the new set of IDs, encoded
 * as a comma-separated list.  Does not de-duplicate ID entries.
 *
 * @param {!Array<string>} newIds IDs to merge in. Should contain stringified
 *     integer (base 10) experiment IDs.
 * @param {?string} currentIdString  If present, a string containing a
 *   comma-separated list of integer experiment IDs.
 * @returns {string}  New experiment list string, including newId iff it is
 *   a valid (integer) experiment ID.
 * @see parseExperimentIds, validateExperimentIds
 */
export function mergeExperimentIds(newIds, currentIdString) {
  const newIdString = newIds.filter(newId => Number(newId)).join(',');
  currentIdString = currentIdString || '';
  return currentIdString + (currentIdString && newIdString ? ',' : '')
      + newIdString;
}
