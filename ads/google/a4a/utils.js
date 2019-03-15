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

import {CONSENT_POLICY_STATE} from '../../../src/consent-state';
import {DomFingerprint} from '../../../src/utils/dom-fingerprint';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {buildUrl} from './shared/url-builder';
import {computedStyle} from '../../../src/style';
import {dev, devAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  getBinaryType,
  isExperimentOn,
  toggleExperiment,
} from '../../../src/experiments';
import {getConsentPolicyState} from '../../../src/consent';
import {getMode} from '../../../src/mode';
import {getOrCreateAdCid} from '../../../src/ad-cid';
import {getTimingDataSync} from '../../../src/service/variable-source';
import {parseJson} from '../../../src/json';
import {whenUpgradedToCustomElement} from '../../../src/dom';

/** @type {string}  */
const AMP_ANALYTICS_HEADER = 'X-AmpAnalytics';

/** @const {number} */
const MAX_URL_LENGTH = 16384;

/** @enum {string} */
const AmpAdImplementation = {
  AMP_AD_XHR_TO_IFRAME: '2',
  AMP_AD_XHR_TO_IFRAME_OR_AMP: '3',
  AMP_AD_IFRAME_GET: '5',
};

/** @const {!Object} */
export const ValidAdContainerTypes = {
  'AMP-CAROUSEL': 'ac',
  'AMP-FX-FLYING-CARPET': 'fc',
  'AMP-LIGHTBOX': 'lb',
  'AMP-STICKY-AD': 'sa',
};

/**
 * See `VisibilityState` enum.
 * @const {!Object<string, string>}
 */
const visibilityStateCodes = {
  'visible': '1',
  'hidden': '2',
  'prerender': '3',
  'unloaded': '5',
};

/** @const {string} */
export const QQID_HEADER = 'X-QQID';

/** @type {string} */
export const SANDBOX_HEADER = 'amp-ff-sandbox';

/**
 * Element attribute that stores experiment IDs.
 *
 * Note: This attribute should be used only for tracking experimental
 * implementations of AMP tags, e.g., by AMPHTML implementors.  It should not be
 * added by a publisher page.
 *
 * @const {string}
 * @visibleForTesting
 */
export const EXPERIMENT_ATTRIBUTE = 'data-experiment-id';

/** @typedef {{urls: !Array<string>}}
 */
export let AmpAnalyticsConfigDef;

/**
 * @typedef {{instantLoad: boolean, writeInBody: boolean}}
 */
export let NameframeExperimentConfig;

/**
 * @const {!./shared/url-builder.QueryParameterDef}
 * @visibleForTesting
 */
export const TRUNCATION_PARAM = {name: 'trunc', value: '1'};

/** @const {Object} */
const CDN_PROXY_REGEXP = /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org((\/.*)|($))+/;

/** @const {!{branch: string, control: string, experiment: string}} */
export const ADX_ADY_EXP = {
  branch: 'amp-ad-ff-adx-ady',
  control: '21062398',
  experiment: '21062593',
};

/**
 * Returns the value of some navigation timing parameter.
 * Feature detection is used for safety on browsers that do not support the
 * performance API.
 * @param {!Window} win
 * @param {string} timingEvent The name of the timing event, e.g.
 *     'navigationStart' or 'domContentLoadEventStart'.
 * @return {number}
 */
function getNavigationTiming(win, timingEvent) {
  return (win['performance'] && win['performance']['timing'] &&
      win['performance']['timing'][timingEvent]) || 0;
}

/**
 * Check whether Google Ads supports the A4A rendering pathway is valid for the
 * environment by ensuring native crypto support and page originated in the
 * {@code cdn.ampproject.org} CDN <em>or</em> we must be running in local
 * dev mode.
 *
 * @param {!Window} win  Host window for the ad.
 * @return {boolean}  Whether Google Ads should attempt to render via the A4A
 *   pathway.
 */
export function isGoogleAdsA4AValidEnvironment(win) {
  return supportsNativeCrypto(win) && (
    !!isCdnProxy(win) || getMode(win).localDev || getMode(win).test);
}

/**
 * Checks whether native crypto is supported for win.
 * @param {!Window} win  Host window for the ad.
 * @return {boolean} Whether native crypto is supported.
 */
export function supportsNativeCrypto(win) {
  return win.crypto && (win.crypto.subtle || win.crypto.webkitSubtle);
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
  const {win} = ampElement;
  // In local dev mode, neither the canary nor prod config files is available,
  // so manually set the profiling rate, for testing/dev.
  if (getMode(ampElement.win).localDev && !getMode(ampElement.win).test) {
    toggleExperiment(win, 'a4aProfilingRate', true, true);
  }
  return (type == 'doubleclick' || type == 'adsense') &&
      isExperimentOn(win, 'a4aProfilingRate');
}

/**
 * Has side-effect of incrementing ifi counter on window.
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {!Array<string>=} opt_experimentIds Any experiments IDs (in addition
 *     to those specified on the ad element) that should be included in the
 *     request.
 * @return {!Object<string,null|number|string>} block level parameters
 */
export function googleBlockParameters(a4a, opt_experimentIds) {
  const {element: adElement, win} = a4a;
  const slotRect = a4a.getPageLayoutBox();
  const iframeDepth = iframeNestingDepth(win);
  const enclosingContainers = getEnclosingContainerTypes(adElement);
  let eids = adElement.getAttribute('data-experiment-id');
  if (opt_experimentIds) {
    eids = mergeExperimentIds(opt_experimentIds, eids);
  }
  if (new RegExp(`(^|,)${ADX_ADY_EXP.experiment}($|,)`).test(eids)) {
    slotRect.left = slotRect.left || 1;
    slotRect.top = slotRect.top || 1;
  }
  return {
    'adf': DomFingerprint.generate(adElement),
    'nhd': iframeDepth,
    'eid': eids,
    'adx': slotRect.left,
    'ady': slotRect.top,
    'oid': '2',
    'act': enclosingContainers.length ? enclosingContainers.join() : null,
  };
}

/**
 * @param {!Window} win
 * @param {string} type matching typing attribute.
 * @param {function(!Element):string} groupFn
 * @return {!Promise<!Object<string,!Array<!Promise<!../../../src/base-element.BaseElement>>>>}
 */
export function groupAmpAdsByType(win, type, groupFn) {
  // Look for amp-ad elements of correct type or those contained within
  // standard container type.  Note that display none containers will not be
  // included as they will never be measured.
  // TODO(keithwrightbos): what about slots that become measured due to removal
  // of display none (e.g. user resizes viewport and media selector makes
  // visible).
  const ampAdSelector =
      r => r.element./*OK*/querySelector(`amp-ad[type=${type}]`);
  const {documentElement} = win.document;
  return Services.resourcesForDoc(documentElement).getMeasuredResources(win,
      r => {
        const isAmpAdType = r.element.tagName == 'AMP-AD' &&
          r.element.getAttribute('type') == type;
        if (isAmpAdType) {
          return true;
        }
        const isAmpAdContainerElement =
          Object.keys(ValidAdContainerTypes).includes(r.element.tagName) &&
          !!ampAdSelector(r);
        return isAmpAdContainerElement;
      })
      // Need to wait on any contained element resolution followed by build
      // of child ad.
      .then(resources => Promise.all(resources.map(
          resource => {
            if (resource.element.tagName == 'AMP-AD') {
              return resource.element;
            }
            // Must be container element so need to wait for child amp-ad to
            // be upgraded.
            return whenUpgradedToCustomElement(
                dev().assertElement(ampAdSelector(resource)));
          })))
      // Group by networkId.
      .then(elements => elements.reduce((result, element) => {
        const groupId = groupFn(element);
        (result[groupId] || (result[groupId] = [])).push(element.getImpl());
        return result;
      }, {}));
}

/**
 * @param {! ../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {number} startTime
 * @return {!Promise<!Object<string,null|number|string>>}
 */
export function googlePageParameters(a4a, startTime) {
  const {win} = a4a;
  const ampDoc = a4a.getAmpDoc();
  // Do not wait longer than 1 second to retrieve referrer to ensure
  // viewer integration issues do not cause ad requests to hang indefinitely.
  const referrerPromise = Services.timerFor(win).timeoutPromise(
      1000, Services.viewerForDoc(ampDoc).getReferrerUrl())
      .catch(() => {
        dev().expectedError('AMP-A4A', 'Referrer timeout!');
        return '';
      });
  const domLoading = getNavigationTiming(win, 'domLoading');
  return Promise.all([
    getOrCreateAdCid(ampDoc, 'AMP_ECID_GOOGLE', '_ga'), referrerPromise])
      .then(promiseResults => {
        const clientId = promiseResults[0];
        const referrer = promiseResults[1];
        const {pageViewId, canonicalUrl} = Services.documentInfoForDoc(ampDoc);
        // Read by GPT for GA/GPT integration.
        win.gaGlobal = win.gaGlobal || {cid: clientId, hid: pageViewId};
        const {screen} = win;
        const viewport = Services.viewportForDoc(ampDoc);
        const viewportRect = viewport.getRect();
        const viewportSize = viewport.getSize();
        const visibilityState = Services.viewerForDoc(ampDoc)
            .getVisibilityState();
        return {
          'is_amp': a4a.isXhrAllowed() ?
            AmpAdImplementation.AMP_AD_XHR_TO_IFRAME_OR_AMP :
            AmpAdImplementation.AMP_AD_IFRAME_GET,
          'amp_v': '$internalRuntimeVersion$',
          'd_imp': '1',
          'c': getCorrelator(win, ampDoc, clientId),
          'ga_cid': win.gaGlobal.cid || null,
          'ga_hid': win.gaGlobal.hid || null,
          'dt': startTime,
          'biw': viewportRect.width,
          'bih': viewportRect.height,
          'u_aw': screen ? screen.availWidth : null,
          'u_ah': screen ? screen.availHeight : null,
          'u_cd': screen ? screen.colorDepth : null,
          'u_w': screen ? screen.width : null,
          'u_h': screen ? screen.height : null,
          'u_tz': -new Date().getTimezoneOffset(),
          'u_his': getHistoryLength(win),
          'isw': win != win.top ? viewportSize.width : null,
          'ish': win != win.top ? viewportSize.height : null,
          'art': getAmpRuntimeTypeParameter(win),
          'vis': visibilityStateCodes[visibilityState] || '0',
          'scr_x': viewport.getScrollLeft(),
          'scr_y': viewport.getScrollTop(),
          'bc': getBrowserCapabilitiesBitmap(win) || null,
          'debug_experiment_id':
              (/(?:#|,)deid=([\d,]+)/i.exec(win.location.hash) || [])[1] ||
                  null,
          'url': canonicalUrl || null,
          'top': win != win.top ? topWindowUrlOrDomain(win) : null,
          'loc': win.location.href == canonicalUrl ? null : win.location.href,
          'ref': referrer || null,
          'bdt': domLoading ? startTime - domLoading : null,
        };
      });
}

/**
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {string} baseUrl
 * @param {number} startTime
 * @param {!Object<string,null|number|string>} parameters
 * @param {!Array<string>=} opt_experimentIds Any experiments IDs (in addition
 *     to those specified on the ad element) that should be included in the
 *     request.
 * @return {!Promise<string>}
 */
export function googleAdUrl(
  a4a, baseUrl, startTime, parameters, opt_experimentIds) {
  // TODO: Maybe add checks in case these promises fail.
  const blockLevelParameters = googleBlockParameters(a4a, opt_experimentIds);
  return googlePageParameters(a4a, startTime)
      .then(pageLevelParameters => {
        Object.assign(parameters, blockLevelParameters, pageLevelParameters);
        return truncAndTimeUrl(baseUrl, parameters, startTime);
      });
}

/**
 * @param {string} baseUrl
 * @param {!Object<string,null|number|string>} parameters
 * @param {number} startTime
 * @return {string}
 */
export function truncAndTimeUrl(baseUrl, parameters, startTime) {
  return buildUrl(
      baseUrl, parameters, MAX_URL_LENGTH - 10, TRUNCATION_PARAM)
    + '&dtd=' + elapsedTimeWithCeiling(Date.now(), startTime);
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
  devAssert(w == win.top);
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
 * @param {string} url
 * @return {string} hostname portion of url
 * @visibleForTesting
 */
export function extractHost(url) {
  return (/^(?:https?:\/\/)?([^\/\?:]+)/i.exec(url) || [])[1] || url;
}

/**
 * @param {!Window} win
 * @return {?string}
 */
function topWindowUrlOrDomain(win) {
  const {ancestorOrigins} = win.location;
  if (ancestorOrigins) {
    const {origin} = win.location;
    const topOrigin = ancestorOrigins[ancestorOrigins.length - 1];
    if (origin == topOrigin) {
      return win.top.location.hostname;
    }
    const secondFromTop = secondWindowFromTop(win);
    if (secondFromTop == win ||
        origin == ancestorOrigins[ancestorOrigins.length - 2]) {
      return extractHost(secondFromTop./*OK*/document.referrer);
    }
    return extractHost(topOrigin);
  } else {
    try {
      return win.top.location.hostname;
    } catch (e) {}
    const secondFromTop = secondWindowFromTop(win);
    try {
      return extractHost(secondFromTop./*OK*/document.referrer);
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
  devAssert(secondFromTop.parent == win.top);
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
 * `nodeOrDoc` must be passed for correct behavior in shadow AMP (PWA) case.
 * @param {!Window} win
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string=} opt_cid
 * @return {number} The correlator.
 */
export function getCorrelator(win, elementOrAmpDoc, opt_cid) {
  if (!win.ampAdPageCorrelator) {
    win.ampAdPageCorrelator = isExperimentOn(win, 'exp-new-correlator') ?
      Math.floor(4503599627370496 * Math.random()) :
      makeCorrelator(
          Services.documentInfoForDoc(elementOrAmpDoc).pageViewId, opt_cid);
  }
  return win.ampAdPageCorrelator;
}

/**
 * @param {string} pageViewId
 * @param {string=} opt_clientId
 * @return {number}
 */
function makeCorrelator(pageViewId, opt_clientId) {
  const pageViewIdNumeric = Number(pageViewId || 0);
  if (opt_clientId) {
    return pageViewIdNumeric + ((opt_clientId.replace(/\D/g, '') % 1e6) * 1e6);
  } else {
    // In this case, pageViewIdNumeric is only 4 digits => too low entropy
    // to be useful as a page correlator.  So synthesize one from scratch.
    // 4503599627370496 == 2^52.  The guaranteed range of JS Number is at least
    // 2^53 - 1.
    return Math.floor(4503599627370496 * Math.random());
  }
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
}

/**
 * Returns amp-analytics config for a new CSI trigger.
 * @param {string} on The name of the analytics trigger.
 * @param {!Object<string, string>} params Params to be included on the ping.
 * @return {!JsonObject}
 */
function csiTrigger(on, params) {
  return dict({
    'on': on,
    'request': 'csi',
    'sampleSpec': {
      // Pings are sampled on a per-pageview basis. A prefix is included in the
      // sampleOn spec so that the hash is orthogonal to any other sampling in
      // amp.
      'sampleOn': 'a4a-csi-${pageViewId}',
      'threshold': 1, // 1% sample
    },
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
    'extraUrlParams': params,
  });
}

/**
 * Returns amp-analytics config for Google ads network impls.
 * @return {!JsonObject}
 */
export function getCsiAmpAnalyticsConfig() {
  return dict({
    'requests': {
      'csi': 'https://csi.gstatic.com/csi?',
    },
    'transport': {'xhrpost': false},
    'triggers': {
      'adRequestStart': csiTrigger('ad-request-start', {
        // afs => ad fetch start
        'met.a4a': 'afs_lvt.${viewerLastVisibleTime}~afs.${time}',
      }),
      'adResponseEnd': csiTrigger('ad-response-end', {
        // afe => ad fetch end
        'met.a4a': 'afe.${time}',
      }),
      'adRenderStart': csiTrigger('ad-render-start', {
        // ast => ad schedule time
        // ars => ad render start
        'met.a4a':
            'ast.${scheduleTime}~ars_lvt.${viewerLastVisibleTime}~ars.${time}',
        'qqid': '${qqid}',
      }),
      'adIframeLoaded': csiTrigger('ad-iframe-loaded', {
        // ail => ad iframe loaded
        'met.a4a': 'ail.${time}',
      }),
    },
    'extraUrlParams': {
      's': 'ampad',
      'ctx': '2',
      'c': '${correlator}',
      'slotId': '${slotId}',
      // Time that the beacon was actually sent. Note that there can be delays
      // between the time at which the event is fired and when ${nowMs} is
      // evaluated when the URL is built by amp-analytics.
      'puid': '${requestCount}~${timestamp}',
    },
  });
}

/**
 * Returns variables to be included in the amp-analytics event for A4A.
 * @param {string} analyticsTrigger The name of the analytics trigger.
 * @param {!AMP.BaseElement} a4a The A4A element.
 * @param {?string} qqid The query ID or null if the query ID has not been set
 *     yet.
 */
export function getCsiAmpAnalyticsVariables(analyticsTrigger, a4a, qqid) {
  const {win} = a4a;
  const ampdoc = a4a.getAmpDoc();
  const viewer = Services.viewerForDoc(ampdoc);
  const navStart = getNavigationTiming(win, 'navigationStart');
  const vars = {
    'correlator': getCorrelator(win, ampdoc),
    'slotId': a4a.element.getAttribute('data-amp-slot-index'),
    'viewerLastVisibleTime': viewer.getLastVisibleTime() - navStart,
  };
  if (qqid) {
    vars['qqid'] = qqid;
  }
  if (analyticsTrigger == 'ad-render-start') {
    vars['scheduleTime'] = a4a.element.layoutScheduleTime - navStart;
  }
  return vars;
}

/**
 * Extracts configuration used to build amp-analytics element for active view.
 *
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {!Headers} responseHeaders
 *   XHR service FetchResponseHeaders object containing the response
 *   headers.
 * @return {?JsonObject} config or null if invalid/missing.
 */
export function extractAmpAnalyticsConfig(a4a, responseHeaders) {
  if (!responseHeaders.has(AMP_ANALYTICS_HEADER)) {
    return null;
  }
  try {
    const analyticsConfig =
        parseJson(responseHeaders.get(AMP_ANALYTICS_HEADER));
    devAssert(Array.isArray(analyticsConfig['url']));
    const urls = analyticsConfig['url'];
    if (!urls.length) {
      return null;
    }

    const config = /** @type {JsonObject}*/ ({
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
      },
    });

    // Discover and build visibility endpoints.
    const requests = dict();
    for (let idx = 1; idx <= urls.length; idx++) {
      // TODO: Ensure url is valid and not freeform JS?
      requests[`visibility${idx}`] = `${urls[idx - 1]}`;
    }
    // Security review needed here.
    config['requests'] = requests;
    config['triggers']['continuousVisible']['request'] =
        Object.keys(requests);
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
 * @return {string}  New experiment list string, including newId iff it is
 *   a valid (integer) experiment ID.
 * @see parseExperimentIds, validateExperimentIds
 */
export function mergeExperimentIds(newIds, currentIdString) {
  const newIdString = newIds.filter(newId => Number(newId)).join(',');
  currentIdString = currentIdString || '';
  return currentIdString + (currentIdString && newIdString ? ',' : '')
      + newIdString;
}

/**
 * Adds two CSI signals to the given amp-analytics configuration object, one
 * for render-start, and one for ini-load.
 *
 * @param {!Window} win
 * @param {!Element} element The ad slot.
 * @param {!JsonObject} config The original config object.
 * @param {?string} qqid
 * @param {boolean} isVerifiedAmpCreative
 * @return {?JsonObject} config or null if invalid/missing.
 */
export function addCsiSignalsToAmpAnalyticsConfig(
  win, element, config, qqid, isVerifiedAmpCreative) {
  // Add CSI pingbacks.
  const correlator = getCorrelator(win, element);
  const slotId = Number(element.getAttribute('data-amp-slot-index'));
  const eids = encodeURIComponent(
      element.getAttribute(EXPERIMENT_ATTRIBUTE));
  const adType = element.getAttribute('type');
  const initTime =
      Number(getTimingDataSync(win, 'navigationStart') || Date.now());
  const deltaTime = Math.round(win.performance && win.performance.now ?
    win.performance.now() : (Date.now() - initTime));
  const baseCsiUrl = 'https://csi.gstatic.com/csi?s=a4a' +
      `&c=${correlator}&slotId=${slotId}&qqid.${slotId}=${qqid}` +
      `&dt=${initTime}` +
      (eids != 'null' ? `&e.${slotId}=${eids}` : '') +
      `&rls=$internalRuntimeVersion$&adt.${slotId}=${adType}`;
  const isAmpSuffix = isVerifiedAmpCreative ? 'Friendly' : 'CrossDomain';
  config['triggers']['continuousVisibleIniLoad'] = {
    'on': 'ini-load',
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
    'request': 'iniLoadCsi',
  };
  config['triggers']['continuousVisibleRenderStart'] = {
    'on': 'render-start',
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
    'request': 'renderStartCsi',
  };
  config['requests']['iniLoadCsi'] = baseCsiUrl +
      `&met.a4a.${slotId}=iniLoadCsi${isAmpSuffix}.${deltaTime}`;
  config['requests']['renderStartCsi'] = baseCsiUrl +
      `&met.a4a.${slotId}=renderStartCsi${isAmpSuffix}.${deltaTime}`;

  // Add CSI ping for visibility.
  config['requests']['visibilityCsi'] = baseCsiUrl +
      `&met.a4a.${slotId}=visibilityCsi.${deltaTime}`;
  config['triggers']['continuousVisible']['request'].push('visibilityCsi');
  return config;
}

/**
 * Returns an array of two-letter codes representing the amp-ad containers
 * enclosing the given ad element.
 *
 * @param {!Element} adElement
 * @return {!Array<string>}
 */
export function getEnclosingContainerTypes(adElement) {
  const containerTypeSet = {};
  for (let el = adElement.parentElement, counter = 0;
    el && counter < 20; el = el.parentElement, counter++) {
    const tagName = el.tagName.toUpperCase();
    if (ValidAdContainerTypes[tagName]) {
      containerTypeSet[ValidAdContainerTypes[tagName]] = true;
    }
  }
  return Object.keys(containerTypeSet);
}

/**
 * Appends parameter to ad request indicating error state so long as error
 * parameter is not already present or url has been truncated.
 * @param {string} adUrl used for network request
 * @param {string} parameterValue to be appended
 * @return {string|undefined} potentially modified url, undefined
 */
export function maybeAppendErrorParameter(adUrl, parameterValue) {
  devAssert(!!adUrl && !!parameterValue);
  // Add parameter indicating error so long as the url has not already been
  // truncated and error parameter is not already present.  Note that we assume
  // that added, error parameter length will be less than truncation parameter
  // so adding will not cause length to exceed maximum.
  if (new RegExp(`[?|&](${encodeURIComponent(TRUNCATION_PARAM.name)}=` +
      `${encodeURIComponent(String(TRUNCATION_PARAM.value))}|aet=[^&]*)$`)
      .test(adUrl)) {
    return;
  }
  const modifiedAdUrl = adUrl + `&aet=${parameterValue}`;
  devAssert(modifiedAdUrl.length <= MAX_URL_LENGTH);
  return modifiedAdUrl;
}

/**
 * Returns a numerical code representing the binary type.
 * @param {string} type
 * @return {?string}
 */
export function getBinaryTypeNumericalCode(type) {
  return {
    'production': '0',
    'control': '1',
    'canary': '2',
    'rc': '3',
  }[type] || null;
}

/** @const {!RegExp} */
const IDENTITY_DOMAIN_REGEXP_ = /\.google\.(?:com?\.)?[a-z]{2,3}$/;

/** @typedef {{
      token: (string|undefined),
      jar: (string|undefined),
      pucrd: (string|undefined),
      freshLifetimeSecs: (number|undefined),
      validLifetimeSecs: (number|undefined),
      fetchTimeMs: (number|undefined)
   }} */
export let IdentityToken;

/**
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {?string} consentPolicyId
 * @return {!Promise<!IdentityToken>}
 */
export function getIdentityToken(win, ampDoc, consentPolicyId) {
  // If configured to use amp-consent, delay request until consent state is
  // resolved.
  win['goog_identity_prom'] = win['goog_identity_prom'] ||
      (consentPolicyId
        ? getConsentPolicyState(ampDoc.getHeadNode(), consentPolicyId)
        : Promise.resolve(CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED))
          .then(consentState =>
            consentState == CONSENT_POLICY_STATE.INSUFFICIENT ||
            consentState == CONSENT_POLICY_STATE.UNKNOWN ?
            /** @type{!IdentityToken} */({}) :
              executeIdentityTokenFetch(win, ampDoc));
  return /** @type {!Promise<!IdentityToken>} */(win['goog_identity_prom']);
}

/**
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {number=} redirectsRemaining (default 1)
 * @param {string=} domain
 * @param {number=} startTime
 * @return {!Promise<!IdentityToken>}
 */
function executeIdentityTokenFetch(win, ampDoc, redirectsRemaining = 1,
  domain = undefined, startTime = Date.now()) {
  const url = getIdentityTokenRequestUrl(win, ampDoc, domain);
  return Services.xhrFor(win).fetchJson(url, {
    mode: 'cors',
    method: 'GET',
    ampCors: false,
    credentials: 'include',
  }).then(res => res.json())
      .then(obj => {
        const token = obj['newToken'];
        const jar = obj['1p_jar'] || '';
        const pucrd = obj['pucrd'] || '';
        const freshLifetimeSecs = parseInt(obj['freshLifetimeSecs'] || '', 10);
        const validLifetimeSecs = parseInt(obj['validLifetimeSecs'] || '', 10);
        const altDomain = obj['altDomain'];
        const fetchTimeMs = Date.now() - startTime;
        if (IDENTITY_DOMAIN_REGEXP_.test(altDomain)) {
          if (!redirectsRemaining--) {
            // Max redirects, log?
            return {fetchTimeMs};
          }
          return executeIdentityTokenFetch(
              win, ampDoc, redirectsRemaining, altDomain, startTime);
        } else if (freshLifetimeSecs > 0 && validLifetimeSecs > 0 &&
            typeof token == 'string') {
          return {token, jar, pucrd, freshLifetimeSecs, validLifetimeSecs,
            fetchTimeMs};
        }
        // returning empty
        return {fetchTimeMs};
      })
      .catch(unusedErr => {
        // TODO log?
        return {};
      });
}

/**
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {string=} domain
 * @return {string} url
 * @visibleForTesting
 */
export function getIdentityTokenRequestUrl(win, ampDoc, domain = undefined) {
  if (!domain && win != win.top && win.location.ancestorOrigins) {
    const matches = IDENTITY_DOMAIN_REGEXP_.exec(
        win.location.ancestorOrigins[win.location.ancestorOrigins.length - 1]);
    domain = (matches && matches[0]) || undefined;
  }
  domain = domain || '.google.com';
  const canonical =
    extractHost(Services.documentInfoForDoc(ampDoc).canonicalUrl);
  return `https://adservice${domain}/adsid/integrator.json?domain=${canonical}`;
}

/**
 * Returns whether we are running on the AMP CDN.
 * @param {!Window} win
 * @return {boolean}
 */
export function isCdnProxy(win) {
  return CDN_PROXY_REGEXP.test(win.location.origin);
}

/**
 * Populates the fields of the given Nameframe experiment config object.
 * @param {!Headers} headers
 * @param {!NameframeExperimentConfig} nameframeConfig
 */
export function setNameframeExperimentConfigs(headers, nameframeConfig) {
  const nameframeExperimentHeader = headers.get('amp-nameframe-exp');
  if (nameframeExperimentHeader) {
    nameframeExperimentHeader.split(';').forEach(config => {
      if (config == 'instantLoad' || config == 'writeInBody') {
        nameframeConfig[config] = true;
      }
    });
  }
}

/**
 * Enum for browser capabilities. NOTE: Since JS is 32-bit, do not add anymore
 * than 32 capabilities to this enum.
 * @enum {number}
 */
const Capability = {
  SVG_SUPPORTED: 1 << 0,
  SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED: 1 << 1,
  SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED: 1 << 2,
};

/**
 * Returns a bitmap representing what features are supported by this browser.
 * @param {!Window} win
 * @return {number}
 */
function getBrowserCapabilitiesBitmap(win) {
  let browserCapabilities = 0;
  const doc = win.document;
  if (win.SVGElement && doc.createElementNS) {
    browserCapabilities |= Capability.SVG_SUPPORTED;
  }
  const iframeEl = doc.createElement('iframe');
  if (iframeEl.sandbox && iframeEl.sandbox.supports) {
    if (iframeEl.sandbox.supports('allow-top-navigation-by-user-activation')) {
      browserCapabilities |=
        Capability.SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED;
    }
    if (iframeEl.sandbox.supports('allow-popups-to-escape-sandbox')) {
      browserCapabilities |=
        Capability.SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED;
    }
  }
  return browserCapabilities;
}

/**
 * Returns an enum value representing the AMP binary type, or null if this is a
 * canonical page.
 * @param {!Window} win
 * @return {?string} The binary type enum.
 * @visibleForTesting
 */
export function getAmpRuntimeTypeParameter(win) {
  const art = getBinaryTypeNumericalCode(getBinaryType(win));
  return isCdnProxy(win) && art != '0' ? art : null;
}

/**
 * Returns the fixed size of the given element, or the fixed size of its nearest
 * ancestor that has a fixed size, if the given element has none.
 * @param {!Window} win
 * @param {?Element} element
 * @param {number=} maxDepth The maximum number of ancestors to check.
 * @return {number} The width of the given element, or of the nearest ancestor
 *    with a fixed size, if the given element has none.
 */
export function getContainerWidth(win, element, maxDepth = 100) {
  let el = element;
  let depth = maxDepth;
  // Find the first ancestor with a fixed size.
  while (el && depth--) {
    const layout = el.getAttribute('layout');
    switch (layout) {
      case Layout.FIXED:
        return parseInt(el.getAttribute('width'), 10) || 0;
      case Layout.RESPONSIVE:
      case Layout.FILL:
      case Layout.FIXED_HEIGHT:
      case Layout.FLUID:
        // The above layouts determine the width of the element by the
        // containing element, or by CSS max-width property.
        const maxWidth = parseInt(computedStyle(win, el).maxWidth, 10);
        if (maxWidth || maxWidth == 0) {
          return maxWidth;
        }
        el = el.parentElement;
        break;
      case Layout.CONTAINER:
        // Container layout allows the container's size to be determined by
        // the children within it, so in principle we can grow as large as the
        // viewport.
        const viewport = Services.viewportForDoc(dev().assertElement(element));
        return viewport.getSize().width;
      case Layout.NODISPLAY:
      case Layout.FLEX_ITEM:
        return 0;
      default:
        // If no layout is provided, we must use getComputedStyle.
        return parseInt(computedStyle(win, el).width, 10) || 0;
    }
  }
  return -1;
}
