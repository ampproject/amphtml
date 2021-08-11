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
import { CONSENT_POLICY_STATE } from "../../../src/core/constants/consent-state";
import { DomFingerprint } from "../../../src/core/dom/fingerprint";
import { GEO_IN_GROUP } from "../../../extensions/amp-geo/0.1/amp-geo-in-group";
import { Services } from "../../../src/service";
import { buildUrl } from "./shared/url-builder";
import { dev, devAssert, user } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { getBinaryType, isExperimentOn, toggleExperiment } from "../../../src/experiments";
import { getConsentPolicyState } from "../../../src/consent";
import { getMeasuredResources } from "../../../src/ini-load";
import { getMode } from "../../../src/mode";
import { getOrCreateAdCid } from "../../../src/ad-cid";
import { getPageLayoutBoxBlocking } from "../../../src/core/dom/layout/page-layout-box";
import { getTimingDataSync } from "../../../src/service/variable-source";
import { internalRuntimeVersion } from "../../../src/internal-version";
import { parseJson } from "../../../src/core/types/object/json";
import { whenUpgradedToCustomElement } from "../../../src/amp-element-helpers";
import { createElementWithAttributes } from "../../../src/core/dom";

/** @type {string}  */
var AMP_ANALYTICS_HEADER = 'X-AmpAnalytics';

/** @const {number} */
var MAX_URL_LENGTH = 15360;

/** @enum {string} */
var AmpAdImplementation = {
  AMP_AD_XHR_TO_IFRAME: '2',
  AMP_AD_XHR_TO_IFRAME_OR_AMP: '3',
  AMP_AD_IFRAME_GET: '5'
};

/** @const {!Object} */
export var ValidAdContainerTypes = {
  'AMP-CAROUSEL': 'ac',
  'AMP-FX-FLYING-CARPET': 'fc',
  'AMP-LIGHTBOX': 'lb',
  'AMP-STICKY-AD': 'sa'
};

/**
 * See `VisibilityState` enum.
 * @const {!Object<string, string>}
 */
var visibilityStateCodes = {
  'visible': '1',
  'hidden': '2',
  'prerender': '3',
  'unloaded': '5'
};

/** @const {string} */
export var QQID_HEADER = 'X-QQID';

/** @type {string} */
export var SANDBOX_HEADER = 'amp-ff-sandbox';

/**
 * Element attribute that stores Google ads experiment IDs.
 *
 * Note: This attribute should be used only for tracking experimental
 * implementations of AMP tags, e.g., by AMPHTML implementors.  It should not be
 * added by a publisher page.
 *
 * @const {string}
 * @visibleForTesting
 */
export var EXPERIMENT_ATTRIBUTE = 'data-experiment-id';

/**
 * Element attribute that stores AMP experiment IDs.
 *
 * Note: This attribute should be used only for tracking experimental
 * implementations of AMP tags, e.g., by AMPHTML implementors.  It should not be
 * added by a publisher page.
 *
 * @const {string}
 * @visibleForTesting
 */
export var AMP_EXPERIMENT_ATTRIBUTE = 'data-amp-experiment-id';

/** @typedef {{urls: !Array<string>}}
 */
export var AmpAnalyticsConfigDef;

/**
 * @typedef {{instantLoad: boolean, writeInBody: boolean}}
 */
export var NameframeExperimentConfig;

/**
 * @const {!./shared/url-builder.QueryParameterDef}
 * @visibleForTesting
 */
export var TRUNCATION_PARAM = {
  name: 'trunc',
  value: '1'
};

/** @const {Object} */
var CDN_PROXY_REGEXP = /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org((\/.*)|($))+/;

/** @const {string} */
var TOKEN_VALUE = 'A8Ujr8y+9sg/ZBmCs90ZfQGOUFJsAS/YaHYtjLAsNn05OaQXSmZeRZ2U1wAj3PD74WY9re2x/TwinJoOaYuqFQoAAACBeyJvcmlnaW4iOiJodHRwczovL2FtcHByb2plY3QubmV0OjQ0MyIsImZlYXR1cmUiOiJDb252ZXJzaW9uTWVhc3VyZW1lbnQiLCJleHBpcnkiOjE2MzE2NjM5OTksImlzU3ViZG9tYWluIjp0cnVlLCJ1c2FnZSI6InN1YnNldCJ9';

/**
 * Inserts origin-trial token for `attribution-reporting` if not already
 * present in the DOM.
 * @param {!Window} win
 */
export function maybeInsertOriginTrialToken(win) {
  if (win.document.head.querySelector("meta[content='" + TOKEN_VALUE + "']")) {
    return;
  }

  var metaEl = createElementWithAttributes(win.document, 'meta', {
    'http-equiv': 'origin-trial',
    content: TOKEN_VALUE
  });
  win.document.head.appendChild(metaEl);
}

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
  return win['performance'] && win['performance']['timing'] && win['performance']['timing'][timingEvent] || 0;
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
  return supportsNativeCrypto(win) && (!!isCdnProxy(win) || getMode(win).localDev || getMode(win).test);
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
  var type = ampElement.element.getAttribute('type');
  var win = ampElement.win;

  // In local dev mode, neither the canary nor prod config files is available,
  // so manually set the profiling rate, for testing/dev.
  if (getMode(ampElement.win).localDev && !getMode(ampElement.win).test) {
    toggleExperiment(win, 'a4aProfilingRate', true, true);
  }

  return (type == 'doubleclick' || type == 'adsense') && isExperimentOn(win, 'a4aProfilingRate');
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
  var adElement = a4a.element,
      win = a4a.win;
  var slotRect = getPageLayoutBoxBlocking(adElement);
  var iframeDepth = iframeNestingDepth(win);
  var enclosingContainers = getEnclosingContainerTypes(adElement);
  var eids = adElement.getAttribute(EXPERIMENT_ATTRIBUTE);

  if (opt_experimentIds) {
    eids = mergeExperimentIds(opt_experimentIds, eids);
  }

  var aexp = adElement.getAttribute(AMP_EXPERIMENT_ATTRIBUTE);
  return {
    'adf': DomFingerprint.generate(adElement),
    'nhd': iframeDepth,
    'eid': eids,
    'adx': Math.round(slotRect.left),
    'ady': Math.round(slotRect.top),
    'oid': '2',
    'act': enclosingContainers.length ? enclosingContainers.join() : null,
    // aexp URL param is separated by `!`, not `,`.
    'aexp': aexp ? aexp.replace(/,/g, '!') : null
  };
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} type matching typing attribute.
 * @param {function(!Element):string} groupFn
 * @return {!Promise<!Object<string,!Array<!Promise<!../../../src/base-element.BaseElement>>>>}
 */
export function groupAmpAdsByType(ampdoc, type, groupFn) {
  // Look for amp-ad elements of correct type or those contained within
  // standard container type.  Note that display none containers will not be
  // included as they will never be measured.
  // TODO(keithwrightbos): what about slots that become measured due to removal
  // of display none (e.g. user resizes viewport and media selector makes
  // visible).
  var ampAdSelector = function ampAdSelector(r) {
    return r.element.
    /*OK*/
    querySelector("amp-ad[type=" + type + "]");
  };

  return getMeasuredResources(ampdoc, ampdoc.win, function (r) {
    var isAmpAdType = r.element.tagName == 'AMP-AD' && r.element.getAttribute('type') == type;

    if (isAmpAdType) {
      return true;
    }

    var isAmpAdContainerElement = Object.keys(ValidAdContainerTypes).includes(r.element.tagName) && !!ampAdSelector(r);
    return isAmpAdContainerElement;
  }) // Need to wait on any contained element resolution followed by build
  // of child ad.
  .then(function (resources) {
    return Promise.all(resources.map(function (resource) {
      if (resource.element.tagName == 'AMP-AD') {
        return resource.element;
      }

      // Must be container element so need to wait for child amp-ad to
      // be upgraded.
      return whenUpgradedToCustomElement(dev().assertElement(ampAdSelector(resource)));
    }));
  }) // Group by networkId.
  .then(function (elements) {
    return elements.reduce(function (result, element) {
      var groupId = groupFn(element);
      (result[groupId] || (result[groupId] = [])).push(element.getImpl());
      return result;
    }, {});
  });
}

/**
 * @param {! ../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {number} startTime
 * @return {!Promise<!Object<string,null|number|string>>}
 */
export function googlePageParameters(a4a, startTime) {
  var win = a4a.win;
  var ampDoc = a4a.getAmpDoc();
  // Do not wait longer than 1 second to retrieve referrer to ensure
  // viewer integration issues do not cause ad requests to hang indefinitely.
  var referrerPromise = Services.timerFor(win).timeoutPromise(1000, Services.viewerForDoc(ampDoc).getReferrerUrl()).catch(function () {
    dev().expectedError('AMP-A4A', 'Referrer timeout!');
    return '';
  });
  // Set dom loading time to first visible if page started in prerender state
  // determined by truthy value for visibilityState param.
  var domLoading = a4a.getAmpDoc().getParam('visibilityState') ? a4a.getAmpDoc().getLastVisibleTime() : getNavigationTiming(win, 'domLoading');
  return Promise.all([getOrCreateAdCid(ampDoc, 'AMP_ECID_GOOGLE', '_ga'), referrerPromise]).then(function (promiseResults) {
    var clientId = promiseResults[0];
    var referrer = promiseResults[1];

    var _Services$documentInf = Services.documentInfoForDoc(ampDoc),
        canonicalUrl = _Services$documentInf.canonicalUrl,
        pageViewId = _Services$documentInf.pageViewId;

    // Read by GPT for GA/GPT integration.
    win.gaGlobal = win.gaGlobal || {
      cid: clientId,
      hid: pageViewId
    };
    var screen = win.screen;
    var viewport = Services.viewportForDoc(ampDoc);
    var viewportRect = viewport.getRect();
    var viewportSize = viewport.getSize();
    var visibilityState = ampDoc.getVisibilityState();
    return {
      'is_amp': a4a.isXhrAllowed() ? AmpAdImplementation.AMP_AD_XHR_TO_IFRAME_OR_AMP : AmpAdImplementation.AMP_AD_IFRAME_GET,
      'amp_v': internalRuntimeVersion(),
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
      'scr_x': Math.round(viewport.getScrollLeft()),
      'scr_y': Math.round(viewport.getScrollTop()),
      'bc': getBrowserCapabilitiesBitmap(win) || null,
      'debug_experiment_id': (/(?:#|,)deid=([\d,]+)/i.exec(win.location.hash) || [])[1] || null,
      'url': canonicalUrl || null,
      'top': win != win.top ? topWindowUrlOrDomain(win) : null,
      'loc': win.location.href == canonicalUrl ? null : win.location.href,
      'ref': referrer || null,
      'bdt': domLoading ? startTime - domLoading : null
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
export function googleAdUrl(a4a, baseUrl, startTime, parameters, opt_experimentIds) {
  // TODO: Maybe add checks in case these promises fail.
  var blockLevelParameters = googleBlockParameters(a4a, opt_experimentIds);
  return googlePageParameters(a4a, startTime).then(function (pageLevelParameters) {
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
  return buildUrl(baseUrl, parameters, MAX_URL_LENGTH - 10, TRUNCATION_PARAM) + '&dtd=' + elapsedTimeWithCeiling(Date.now(), startTime);
}

/**
 * @param {!Window} win
 * @return {number}
 */
function iframeNestingDepth(win) {
  var w = win;
  var depth = 0;

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
  var ancestorOrigins = win.location.ancestorOrigins;

  if (ancestorOrigins) {
    var origin = win.location.origin;
    var topOrigin = ancestorOrigins[ancestorOrigins.length - 1];

    if (origin == topOrigin) {
      return win.top.location.hostname;
    }

    var secondFromTop = secondWindowFromTop(win);

    if (secondFromTop == win || origin == ancestorOrigins[ancestorOrigins.length - 2]) {
      return extractHost(secondFromTop.
      /*OK*/
      document.referrer);
    }

    return extractHost(topOrigin);
  } else {
    try {
      return win.top.location.hostname;
    } catch (e) {}

    var _secondFromTop = secondWindowFromTop(win);

    try {
      return extractHost(_secondFromTop.
      /*OK*/
      document.referrer);
    } catch (e) {}

    return null;
  }
}

/**
 * @param {!Window} win
 * @return {!Window}
 */
function secondWindowFromTop(win) {
  var secondFromTop = win;
  var depth = 0;

  while (secondFromTop.parent != secondFromTop.parent.parent && depth < 100) {
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
  var duration = time - start;

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
    win.ampAdPageCorrelator = isExperimentOn(win, 'exp-new-correlator') ? Math.floor(4503599627370496 * Math.random()) : makeCorrelator(Services.documentInfoForDoc(elementOrAmpDoc).pageViewId, opt_cid);
  }

  return win.ampAdPageCorrelator;
}

/**
 * @param {string} pageViewId
 * @param {string=} opt_clientId
 * @return {number}
 */
function makeCorrelator(pageViewId, opt_clientId) {
  var pageViewIdNumeric = Number(pageViewId || 0);

  if (opt_clientId) {
    return pageViewIdNumeric + opt_clientId.replace(/\D/g, '') % 1e6 * 1e6;
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
 * @param {?{width: number, height: number}} viewportSize
 * @return {string}
 * @visibleForTesting
 */
export function additionalDimensions(win, viewportSize) {
  // Some browsers throw errors on some of these.
  var screenX, screenY, outerWidth, outerHeight, innerWidth, innerHeight;

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

  return [win.screenLeft, win.screenTop, screenX, screenY, win.screen ? win.screen.availWidth : undefined, win.screen ? win.screen.availTop : undefined, outerWidth, outerHeight, innerWidth, innerHeight].join();
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
      'threshold': 1 // 1% sample

    },
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
    'extraUrlParams': params
  });
}

/**
 * Returns amp-analytics config for Google ads network impls.
 * @return {!JsonObject}
 */
export function getCsiAmpAnalyticsConfig() {
  return dict({
    'requests': {
      'csi': 'https://csi.gstatic.com/csi?'
    },
    'transport': {
      'xhrpost': false
    },
    'triggers': {
      'adRequestStart': csiTrigger('ad-request-start', {
        // afs => ad fetch start
        'met.a4a': 'afs_lvt.${viewerLastVisibleTime}~afs.${time}'
      }),
      'adResponseEnd': csiTrigger('ad-response-end', {
        // afe => ad fetch end
        'met.a4a': 'afe.${time}'
      }),
      'adRenderStart': csiTrigger('ad-render-start', {
        // ast => ad schedule time
        // ars => ad render start
        'met.a4a': 'ast.${scheduleTime}~ars_lvt.${viewerLastVisibleTime}~ars.${time}',
        'qqid': '${qqid}'
      }),
      'adIframeLoaded': csiTrigger('ad-iframe-loaded', {
        // ail => ad iframe loaded
        'met.a4a': 'ail.${time}'
      })
    },
    'extraUrlParams': {
      's': 'ampad',
      'ctx': '2',
      'c': '${correlator}',
      'slotId': '${slotId}',
      // Time that the beacon was actually sent. Note that there can be delays
      // between the time at which the event is fired and when ${nowMs} is
      // evaluated when the URL is built by amp-analytics.
      'puid': '${requestCount}~${timestamp}'
    }
  });
}

/**
 * Returns variables to be included in the amp-analytics event for A4A.
 * @param {string} analyticsTrigger The name of the analytics trigger.
 * @param {!AMP.BaseElement} a4a The A4A element.
 * @param {?string} qqid The query ID or null if the query ID has not been set
 *     yet.
 * @return {!JsonObject}
 */
export function getCsiAmpAnalyticsVariables(analyticsTrigger, a4a, qqid) {
  var win = a4a.win;
  var ampdoc = a4a.getAmpDoc();
  var navStart = getNavigationTiming(win, 'navigationStart');
  var vars =
  /** @type {!JsonObject} */
  {
    'correlator': getCorrelator(win, ampdoc),
    'slotId': a4a.element.getAttribute('data-amp-slot-index'),
    'viewerLastVisibleTime': ampdoc.getLastVisibleTime() - navStart
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
 * Extracts configuration used to build amp-analytics element for active view
 * and begin to render.
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
    var analyticsConfig = parseJson(responseHeaders.get(AMP_ANALYTICS_HEADER));
    var acUrls = analyticsConfig['url'];
    var btrUrls = analyticsConfig['btrUrl'];

    if (acUrls && !Array.isArray(acUrls) || btrUrls && !Array.isArray(btrUrls)) {
      dev().error('AMP-A4A', 'Invalid analytics', responseHeaders.get(AMP_ANALYTICS_HEADER));
    }

    var hasActiveViewRequests = Array.isArray(acUrls) && acUrls.length;
    var hasBeginToRenderRequests = Array.isArray(btrUrls) && btrUrls.length;

    if (!hasActiveViewRequests && !hasBeginToRenderRequests) {
      return null;
    }

    var config = dict({
      'transport': {
        'beacon': false,
        'xhrpost': false
      },
      'requests': {},
      'triggers': {}
    });

    if (hasActiveViewRequests) {
      generateActiveViewRequest(config, acUrls);
    }

    if (hasBeginToRenderRequests) {
      generateBeginToRenderRequest(config, btrUrls);
    }

    return config;
  } catch (err) {
    dev().error('AMP-A4A', 'Invalid analytics', err, responseHeaders.get(AMP_ANALYTICS_HEADER));
  }

  return null;
}

/**
 * @param {!JsonObject} config
 * @param {!Array<string>} urls
 */
function generateActiveViewRequest(config, urls) {
  config['triggers']['continuousVisible'] = dict({
    'request': [],
    'on': 'visible',
    'visibilitySpec': {
      'selector': 'amp-ad',
      'selectionMethod': 'closest',
      'visiblePercentageMin': 50,
      'continuousTimeMin': 1000
    }
  });

  for (var idx = 0; idx < urls.length; idx++) {
    // TODO: Ensure url is valid and not freeform JS?
    config['requests']["visibility" + (idx + 1)] = "" + urls[idx];
    config['triggers']['continuousVisible']['request'].push("visibility" + (idx + 1));
  }
}

/**
 * @param {!JsonObject} config
 * @param {!Array<string>} urls
 */
function generateBeginToRenderRequest(config, urls) {
  config['triggers']['beginToRender'] = dict({
    'request': [],
    'on': 'ini-load',
    'selector': 'amp-ad',
    'selectionMethod': 'closest'
  });

  for (var idx = 0; idx < urls.length; idx++) {
    // TODO: Ensure url is valid and not freeform JS?
    config['requests']["btr" + (idx + 1)] = "" + urls[idx];
    config['triggers']['beginToRender']['request'].push("btr" + (idx + 1));
  }
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
  var newIdString = newIds.filter(function (newId) {
    return Number(newId);
  }).join(',');
  currentIdString = currentIdString || '';
  return currentIdString + (currentIdString && newIdString ? ',' : '') + newIdString;
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
export function addCsiSignalsToAmpAnalyticsConfig(win, element, config, qqid, isVerifiedAmpCreative) {
  // Add CSI pingbacks.
  var correlator = getCorrelator(win, element);
  var slotId = Number(element.getAttribute('data-amp-slot-index'));
  var eids = encodeURIComponent(element.getAttribute(EXPERIMENT_ATTRIBUTE));
  var aexp = element.getAttribute(AMP_EXPERIMENT_ATTRIBUTE);

  if (aexp) {
    // aexp URL param is separated by `!`, not `,`.
    aexp = aexp.replace(/,/g, '!');
  }

  var adType = element.getAttribute('type');
  var initTime = Number(getTimingDataSync(win, 'navigationStart') || Date.now());
  var deltaTime = Math.round(win.performance && win.performance.now ? win.performance.now() : Date.now() - initTime);
  var baseCsiUrl = 'https://csi.gstatic.com/csi?s=a4a' + ("&c=" + correlator + "&slotId=" + slotId + "&qqid." + slotId + "=" + qqid) + ("&dt=" + initTime) + (eids != 'null' ? "&e." + slotId + "=" + eids : '') + (aexp ? "&aexp=" + aexp : '') + ("&rls=" + internalRuntimeVersion() + "&adt." + slotId + "=" + adType);
  var isAmpSuffix = isVerifiedAmpCreative ? 'Friendly' : 'CrossDomain';
  config['triggers']['continuousVisibleIniLoad'] = {
    'on': 'ini-load',
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
    'request': 'iniLoadCsi'
  };
  config['triggers']['continuousVisibleRenderStart'] = {
    'on': 'render-start',
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
    'request': 'renderStartCsi'
  };
  config['requests']['iniLoadCsi'] = baseCsiUrl + ("&met.a4a." + slotId + "=iniLoadCsi" + isAmpSuffix + "." + deltaTime);
  config['requests']['renderStartCsi'] = baseCsiUrl + ("&met.a4a." + slotId + "=renderStartCsi" + isAmpSuffix + "." + deltaTime);
  // Add CSI ping for visibility.
  config['requests']['visibilityCsi'] = baseCsiUrl + ("&met.a4a." + slotId + "=visibilityCsi." + deltaTime);
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
  var containerTypeSet = {};

  for (var el = adElement.parentElement, counter = 0; el && counter < 20; el = el.parentElement, counter++) {
    var tagName = el.tagName.toUpperCase();

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
  if (new RegExp("[?|&](" + encodeURIComponent(TRUNCATION_PARAM.name) + "=" + (encodeURIComponent(String(TRUNCATION_PARAM.value)) + "|aet=[^&]*)$")).test(adUrl)) {
    return;
  }

  var modifiedAdUrl = adUrl + ("&aet=" + parameterValue);
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
    'experimental': '2',
    'rc': '3',
    'nightly': '4',
    'nightly-control': '5',
    'experimentA': '10',
    'experimentB': '11',
    'experimentC': '12',
    'nomod': '42',
    'mod': '43'
  }[type] || null;
}

/** @const {!RegExp} */
var IDENTITY_DOMAIN_REGEXP_ = /\.google\.(?:com?\.)?[a-z]{2,3}$/;

/** @typedef {{
      token: (string|undefined),
      jar: (string|undefined),
      pucrd: (string|undefined),
      freshLifetimeSecs: (number|undefined),
      validLifetimeSecs: (number|undefined),
      fetchTimeMs: (number|undefined)
   }} */
export var IdentityToken;

/**
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {?string} consentPolicyId
 * @return {!Promise<!IdentityToken>}
 */
export function getIdentityToken(win, ampDoc, consentPolicyId) {
  // If configured to use amp-consent, delay request until consent state is
  // resolved.
  win['goog_identity_prom'] = win['goog_identity_prom'] || (consentPolicyId ? getConsentPolicyState(ampDoc.getHeadNode(), consentPolicyId) : Promise.resolve(CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED)).then(function (consentState) {
    return consentState == CONSENT_POLICY_STATE.INSUFFICIENT || consentState == CONSENT_POLICY_STATE.UNKNOWN ?
    /** @type {!IdentityToken} */
    {} : executeIdentityTokenFetch(win, ampDoc);
  });
  return (
    /** @type {!Promise<!IdentityToken>} */
    win['goog_identity_prom']
  );
}

/**
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {number=} redirectsRemaining (default 1)
 * @param {string=} domain
 * @param {number=} startTime
 * @return {!Promise<!IdentityToken>}
 */
function executeIdentityTokenFetch(win, ampDoc, redirectsRemaining, domain, startTime) {
  if (redirectsRemaining === void 0) {
    redirectsRemaining = 1;
  }

  if (domain === void 0) {
    domain = undefined;
  }

  if (startTime === void 0) {
    startTime = Date.now();
  }

  var url = getIdentityTokenRequestUrl(win, ampDoc, domain);
  return Services.xhrFor(win).fetchJson(url, {
    mode: 'cors',
    method: 'GET',
    ampCors: false,
    credentials: 'include'
  }).then(function (res) {
    return res.json();
  }).then(function (obj) {
    var token = obj['newToken'];
    var jar = obj['1p_jar'] || '';
    var pucrd = obj['pucrd'] || '';
    var freshLifetimeSecs = parseInt(obj['freshLifetimeSecs'] || '', 10);
    var validLifetimeSecs = parseInt(obj['validLifetimeSecs'] || '', 10);
    var altDomain = obj['altDomain'];
    var fetchTimeMs = Date.now() - startTime;

    if (IDENTITY_DOMAIN_REGEXP_.test(altDomain)) {
      if (!redirectsRemaining--) {
        // Max redirects, log?
        return {
          fetchTimeMs: fetchTimeMs
        };
      }

      return executeIdentityTokenFetch(win, ampDoc, redirectsRemaining, altDomain, startTime);
    } else if (freshLifetimeSecs > 0 && validLifetimeSecs > 0 && typeof token == 'string') {
      return {
        token: token,
        jar: jar,
        pucrd: pucrd,
        freshLifetimeSecs: freshLifetimeSecs,
        validLifetimeSecs: validLifetimeSecs,
        fetchTimeMs: fetchTimeMs
      };
    }

    // returning empty
    return {
      fetchTimeMs: fetchTimeMs
    };
  }).catch(function (unusedErr) {
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
export function getIdentityTokenRequestUrl(win, ampDoc, domain) {
  if (domain === void 0) {
    domain = undefined;
  }

  if (!domain && win != win.top && win.location.ancestorOrigins) {
    var matches = IDENTITY_DOMAIN_REGEXP_.exec(win.location.ancestorOrigins[win.location.ancestorOrigins.length - 1]);
    domain = matches && matches[0] || undefined;
  }

  domain = domain || '.google.com';
  var canonical = extractHost(Services.documentInfoForDoc(ampDoc).canonicalUrl);
  return "https://adservice" + domain + "/adsid/integrator.json?domain=" + canonical;
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
  var nameframeExperimentHeader = headers.get('amp-nameframe-exp');

  if (nameframeExperimentHeader) {
    nameframeExperimentHeader.split(';').forEach(function (config) {
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
var Capability = {
  SVG_SUPPORTED: 1 << 0,
  SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED: 1 << 1,
  SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED: 1 << 2
};

/**
 * Returns a bitmap representing what features are supported by this browser.
 * @param {!Window} win
 * @return {number}
 */
function getBrowserCapabilitiesBitmap(win) {
  var browserCapabilities = 0;
  var doc = win.document;

  if (win.SVGElement && doc.createElementNS) {
    browserCapabilities |= Capability.SVG_SUPPORTED;
  }

  var iframeEl = doc.createElement('iframe');

  if (iframeEl.sandbox && iframeEl.sandbox.supports) {
    if (iframeEl.sandbox.supports('allow-top-navigation-by-user-activation')) {
      browserCapabilities |= Capability.SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED;
    }

    if (iframeEl.sandbox.supports('allow-popups-to-escape-sandbox')) {
      browserCapabilities |= Capability.SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED;
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
  var art = getBinaryTypeNumericalCode(getBinaryType(win));
  return isCdnProxy(win) && art != '0' ? art : null;
}

/**
 * Checks if the `always-serve-npa` attribute is present and valid
 * based on the geolocation.
 * @param {!Element} element
 * @return {!Promise<boolean>}
 * @visibleForTesting
 */
export function getServeNpaPromise(element) {
  if (!element.hasAttribute('always-serve-npa')) {
    return Promise.resolve(false);
  }

  var npaSignal = element.getAttribute('always-serve-npa');

  if (npaSignal == '') {
    return Promise.resolve(true);
  }

  return Services.geoForDocOrNull(element).then(function (geoService) {
    if (!geoService) {
      // Err on safe side and signal for NPA.
      return true;
    }

    var locations = npaSignal.split(',');

    for (var i = 0; i < locations.length; i++) {
      var geoGroup = geoService.isInCountryGroup(locations[i]);

      if (geoGroup === GEO_IN_GROUP.IN) {
        return true;
      } else if (geoGroup === GEO_IN_GROUP.NOT_DEFINED) {
        user().warn('AMP-AD', "Geo group \"" + locations[i] + "\" was not defined.");
      }
    }

    // Not in any of the defined geo groups.
    return false;
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbIkNPTlNFTlRfUE9MSUNZX1NUQVRFIiwiRG9tRmluZ2VycHJpbnQiLCJHRU9fSU5fR1JPVVAiLCJTZXJ2aWNlcyIsImJ1aWxkVXJsIiwiZGV2IiwiZGV2QXNzZXJ0IiwidXNlciIsImRpY3QiLCJnZXRCaW5hcnlUeXBlIiwiaXNFeHBlcmltZW50T24iLCJ0b2dnbGVFeHBlcmltZW50IiwiZ2V0Q29uc2VudFBvbGljeVN0YXRlIiwiZ2V0TWVhc3VyZWRSZXNvdXJjZXMiLCJnZXRNb2RlIiwiZ2V0T3JDcmVhdGVBZENpZCIsImdldFBhZ2VMYXlvdXRCb3hCbG9ja2luZyIsImdldFRpbWluZ0RhdGFTeW5jIiwiaW50ZXJuYWxSdW50aW1lVmVyc2lvbiIsInBhcnNlSnNvbiIsIndoZW5VcGdyYWRlZFRvQ3VzdG9tRWxlbWVudCIsImNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyIsIkFNUF9BTkFMWVRJQ1NfSEVBREVSIiwiTUFYX1VSTF9MRU5HVEgiLCJBbXBBZEltcGxlbWVudGF0aW9uIiwiQU1QX0FEX1hIUl9UT19JRlJBTUUiLCJBTVBfQURfWEhSX1RPX0lGUkFNRV9PUl9BTVAiLCJBTVBfQURfSUZSQU1FX0dFVCIsIlZhbGlkQWRDb250YWluZXJUeXBlcyIsInZpc2liaWxpdHlTdGF0ZUNvZGVzIiwiUVFJRF9IRUFERVIiLCJTQU5EQk9YX0hFQURFUiIsIkVYUEVSSU1FTlRfQVRUUklCVVRFIiwiQU1QX0VYUEVSSU1FTlRfQVRUUklCVVRFIiwiQW1wQW5hbHl0aWNzQ29uZmlnRGVmIiwiTmFtZWZyYW1lRXhwZXJpbWVudENvbmZpZyIsIlRSVU5DQVRJT05fUEFSQU0iLCJuYW1lIiwidmFsdWUiLCJDRE5fUFJPWFlfUkVHRVhQIiwiVE9LRU5fVkFMVUUiLCJtYXliZUluc2VydE9yaWdpblRyaWFsVG9rZW4iLCJ3aW4iLCJkb2N1bWVudCIsImhlYWQiLCJxdWVyeVNlbGVjdG9yIiwibWV0YUVsIiwiY29udGVudCIsImFwcGVuZENoaWxkIiwiZ2V0TmF2aWdhdGlvblRpbWluZyIsInRpbWluZ0V2ZW50IiwiaXNHb29nbGVBZHNBNEFWYWxpZEVudmlyb25tZW50Iiwic3VwcG9ydHNOYXRpdmVDcnlwdG8iLCJpc0NkblByb3h5IiwibG9jYWxEZXYiLCJ0ZXN0IiwiY3J5cHRvIiwic3VidGxlIiwid2Via2l0U3VidGxlIiwiaXNSZXBvcnRpbmdFbmFibGVkIiwiYW1wRWxlbWVudCIsInR5cGUiLCJlbGVtZW50IiwiZ2V0QXR0cmlidXRlIiwiZ29vZ2xlQmxvY2tQYXJhbWV0ZXJzIiwiYTRhIiwib3B0X2V4cGVyaW1lbnRJZHMiLCJhZEVsZW1lbnQiLCJzbG90UmVjdCIsImlmcmFtZURlcHRoIiwiaWZyYW1lTmVzdGluZ0RlcHRoIiwiZW5jbG9zaW5nQ29udGFpbmVycyIsImdldEVuY2xvc2luZ0NvbnRhaW5lclR5cGVzIiwiZWlkcyIsIm1lcmdlRXhwZXJpbWVudElkcyIsImFleHAiLCJnZW5lcmF0ZSIsIk1hdGgiLCJyb3VuZCIsImxlZnQiLCJ0b3AiLCJsZW5ndGgiLCJqb2luIiwicmVwbGFjZSIsImdyb3VwQW1wQWRzQnlUeXBlIiwiYW1wZG9jIiwiZ3JvdXBGbiIsImFtcEFkU2VsZWN0b3IiLCJyIiwiaXNBbXBBZFR5cGUiLCJ0YWdOYW1lIiwiaXNBbXBBZENvbnRhaW5lckVsZW1lbnQiLCJPYmplY3QiLCJrZXlzIiwiaW5jbHVkZXMiLCJ0aGVuIiwicmVzb3VyY2VzIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInJlc291cmNlIiwiYXNzZXJ0RWxlbWVudCIsImVsZW1lbnRzIiwicmVkdWNlIiwicmVzdWx0IiwiZ3JvdXBJZCIsInB1c2giLCJnZXRJbXBsIiwiZ29vZ2xlUGFnZVBhcmFtZXRlcnMiLCJzdGFydFRpbWUiLCJhbXBEb2MiLCJnZXRBbXBEb2MiLCJyZWZlcnJlclByb21pc2UiLCJ0aW1lckZvciIsInRpbWVvdXRQcm9taXNlIiwidmlld2VyRm9yRG9jIiwiZ2V0UmVmZXJyZXJVcmwiLCJjYXRjaCIsImV4cGVjdGVkRXJyb3IiLCJkb21Mb2FkaW5nIiwiZ2V0UGFyYW0iLCJnZXRMYXN0VmlzaWJsZVRpbWUiLCJwcm9taXNlUmVzdWx0cyIsImNsaWVudElkIiwicmVmZXJyZXIiLCJkb2N1bWVudEluZm9Gb3JEb2MiLCJjYW5vbmljYWxVcmwiLCJwYWdlVmlld0lkIiwiZ2FHbG9iYWwiLCJjaWQiLCJoaWQiLCJzY3JlZW4iLCJ2aWV3cG9ydCIsInZpZXdwb3J0Rm9yRG9jIiwidmlld3BvcnRSZWN0IiwiZ2V0UmVjdCIsInZpZXdwb3J0U2l6ZSIsImdldFNpemUiLCJ2aXNpYmlsaXR5U3RhdGUiLCJnZXRWaXNpYmlsaXR5U3RhdGUiLCJpc1hockFsbG93ZWQiLCJnZXRDb3JyZWxhdG9yIiwid2lkdGgiLCJoZWlnaHQiLCJhdmFpbFdpZHRoIiwiYXZhaWxIZWlnaHQiLCJjb2xvckRlcHRoIiwiRGF0ZSIsImdldFRpbWV6b25lT2Zmc2V0IiwiZ2V0SGlzdG9yeUxlbmd0aCIsImdldEFtcFJ1bnRpbWVUeXBlUGFyYW1ldGVyIiwiZ2V0U2Nyb2xsTGVmdCIsImdldFNjcm9sbFRvcCIsImdldEJyb3dzZXJDYXBhYmlsaXRpZXNCaXRtYXAiLCJleGVjIiwibG9jYXRpb24iLCJoYXNoIiwidG9wV2luZG93VXJsT3JEb21haW4iLCJocmVmIiwiZ29vZ2xlQWRVcmwiLCJiYXNlVXJsIiwicGFyYW1ldGVycyIsImJsb2NrTGV2ZWxQYXJhbWV0ZXJzIiwicGFnZUxldmVsUGFyYW1ldGVycyIsImFzc2lnbiIsInRydW5jQW5kVGltZVVybCIsImVsYXBzZWRUaW1lV2l0aENlaWxpbmciLCJub3ciLCJ3IiwiZGVwdGgiLCJwYXJlbnQiLCJoaXN0b3J5IiwiZSIsImV4dHJhY3RIb3N0IiwidXJsIiwiYW5jZXN0b3JPcmlnaW5zIiwib3JpZ2luIiwidG9wT3JpZ2luIiwiaG9zdG5hbWUiLCJzZWNvbmRGcm9tVG9wIiwic2Vjb25kV2luZG93RnJvbVRvcCIsInRpbWUiLCJzdGFydCIsImR1cmF0aW9uIiwiZWxlbWVudE9yQW1wRG9jIiwib3B0X2NpZCIsImFtcEFkUGFnZUNvcnJlbGF0b3IiLCJmbG9vciIsInJhbmRvbSIsIm1ha2VDb3JyZWxhdG9yIiwib3B0X2NsaWVudElkIiwicGFnZVZpZXdJZE51bWVyaWMiLCJOdW1iZXIiLCJhZGRpdGlvbmFsRGltZW5zaW9ucyIsInNjcmVlblgiLCJzY3JlZW5ZIiwib3V0ZXJXaWR0aCIsIm91dGVySGVpZ2h0IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0Iiwic2NyZWVuTGVmdCIsInNjcmVlblRvcCIsInVuZGVmaW5lZCIsImF2YWlsVG9wIiwiY3NpVHJpZ2dlciIsIm9uIiwicGFyYW1zIiwiZ2V0Q3NpQW1wQW5hbHl0aWNzQ29uZmlnIiwiZ2V0Q3NpQW1wQW5hbHl0aWNzVmFyaWFibGVzIiwiYW5hbHl0aWNzVHJpZ2dlciIsInFxaWQiLCJuYXZTdGFydCIsInZhcnMiLCJsYXlvdXRTY2hlZHVsZVRpbWUiLCJleHRyYWN0QW1wQW5hbHl0aWNzQ29uZmlnIiwicmVzcG9uc2VIZWFkZXJzIiwiaGFzIiwiYW5hbHl0aWNzQ29uZmlnIiwiZ2V0IiwiYWNVcmxzIiwiYnRyVXJscyIsIkFycmF5IiwiaXNBcnJheSIsImVycm9yIiwiaGFzQWN0aXZlVmlld1JlcXVlc3RzIiwiaGFzQmVnaW5Ub1JlbmRlclJlcXVlc3RzIiwiY29uZmlnIiwiZ2VuZXJhdGVBY3RpdmVWaWV3UmVxdWVzdCIsImdlbmVyYXRlQmVnaW5Ub1JlbmRlclJlcXVlc3QiLCJlcnIiLCJ1cmxzIiwiaWR4IiwibmV3SWRzIiwiY3VycmVudElkU3RyaW5nIiwibmV3SWRTdHJpbmciLCJmaWx0ZXIiLCJuZXdJZCIsImFkZENzaVNpZ25hbHNUb0FtcEFuYWx5dGljc0NvbmZpZyIsImlzVmVyaWZpZWRBbXBDcmVhdGl2ZSIsImNvcnJlbGF0b3IiLCJzbG90SWQiLCJlbmNvZGVVUklDb21wb25lbnQiLCJhZFR5cGUiLCJpbml0VGltZSIsImRlbHRhVGltZSIsInBlcmZvcm1hbmNlIiwiYmFzZUNzaVVybCIsImlzQW1wU3VmZml4IiwiY29udGFpbmVyVHlwZVNldCIsImVsIiwicGFyZW50RWxlbWVudCIsImNvdW50ZXIiLCJ0b1VwcGVyQ2FzZSIsIm1heWJlQXBwZW5kRXJyb3JQYXJhbWV0ZXIiLCJhZFVybCIsInBhcmFtZXRlclZhbHVlIiwiUmVnRXhwIiwiU3RyaW5nIiwibW9kaWZpZWRBZFVybCIsImdldEJpbmFyeVR5cGVOdW1lcmljYWxDb2RlIiwiSURFTlRJVFlfRE9NQUlOX1JFR0VYUF8iLCJJZGVudGl0eVRva2VuIiwiZ2V0SWRlbnRpdHlUb2tlbiIsImNvbnNlbnRQb2xpY3lJZCIsImdldEhlYWROb2RlIiwicmVzb2x2ZSIsIlVOS05PV05fTk9UX1JFUVVJUkVEIiwiY29uc2VudFN0YXRlIiwiSU5TVUZGSUNJRU5UIiwiVU5LTk9XTiIsImV4ZWN1dGVJZGVudGl0eVRva2VuRmV0Y2giLCJyZWRpcmVjdHNSZW1haW5pbmciLCJkb21haW4iLCJnZXRJZGVudGl0eVRva2VuUmVxdWVzdFVybCIsInhockZvciIsImZldGNoSnNvbiIsIm1vZGUiLCJtZXRob2QiLCJhbXBDb3JzIiwiY3JlZGVudGlhbHMiLCJyZXMiLCJqc29uIiwib2JqIiwidG9rZW4iLCJqYXIiLCJwdWNyZCIsImZyZXNoTGlmZXRpbWVTZWNzIiwicGFyc2VJbnQiLCJ2YWxpZExpZmV0aW1lU2VjcyIsImFsdERvbWFpbiIsImZldGNoVGltZU1zIiwidW51c2VkRXJyIiwibWF0Y2hlcyIsImNhbm9uaWNhbCIsInNldE5hbWVmcmFtZUV4cGVyaW1lbnRDb25maWdzIiwiaGVhZGVycyIsIm5hbWVmcmFtZUNvbmZpZyIsIm5hbWVmcmFtZUV4cGVyaW1lbnRIZWFkZXIiLCJzcGxpdCIsImZvckVhY2giLCJDYXBhYmlsaXR5IiwiU1ZHX1NVUFBPUlRFRCIsIlNBTkRCT1hJTkdfQUxMT1dfVE9QX05BVklHQVRJT05fQllfVVNFUl9BQ1RJVkFUSU9OX1NVUFBPUlRFRCIsIlNBTkRCT1hJTkdfQUxMT1dfUE9QVVBTX1RPX0VTQ0FQRV9TQU5EQk9YX1NVUFBPUlRFRCIsImJyb3dzZXJDYXBhYmlsaXRpZXMiLCJkb2MiLCJTVkdFbGVtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwiaWZyYW1lRWwiLCJjcmVhdGVFbGVtZW50Iiwic2FuZGJveCIsInN1cHBvcnRzIiwiYXJ0IiwiZ2V0U2VydmVOcGFQcm9taXNlIiwiaGFzQXR0cmlidXRlIiwibnBhU2lnbmFsIiwiZ2VvRm9yRG9jT3JOdWxsIiwiZ2VvU2VydmljZSIsImxvY2F0aW9ucyIsImkiLCJnZW9Hcm91cCIsImlzSW5Db3VudHJ5R3JvdXAiLCJJTiIsIk5PVF9ERUZJTkVEIiwid2FybiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsb0JBQVI7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsWUFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxTQUFiLEVBQXdCQyxJQUF4QjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxhQUFSLEVBQXVCQyxjQUF2QixFQUF1Q0MsZ0JBQXZDO0FBQ0EsU0FBUUMscUJBQVI7QUFDQSxTQUFRQyxvQkFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLHdCQUFSO0FBQ0EsU0FBUUMsaUJBQVI7QUFDQSxTQUFRQyxzQkFBUjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQywyQkFBUjtBQUNBLFNBQVFDLDJCQUFSOztBQUVBO0FBQ0EsSUFBTUMsb0JBQW9CLEdBQUcsZ0JBQTdCOztBQUVBO0FBQ0EsSUFBTUMsY0FBYyxHQUFHLEtBQXZCOztBQUVBO0FBQ0EsSUFBTUMsbUJBQW1CLEdBQUc7QUFDMUJDLEVBQUFBLG9CQUFvQixFQUFFLEdBREk7QUFFMUJDLEVBQUFBLDJCQUEyQixFQUFFLEdBRkg7QUFHMUJDLEVBQUFBLGlCQUFpQixFQUFFO0FBSE8sQ0FBNUI7O0FBTUE7QUFDQSxP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QyxJQUFsQyxDQUF1QyxVQUFDOE4sVUFBRCxFQUFnQjtBQUM1RCxRQUFJLENBQUNBLFVBQUwsRUFBaUI7QUFDZjtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUNELFFBQU1DLFNBQVMsR0FBR0gsU0FBUyxDQUFDakIsS0FBVixDQUFnQixHQUFoQixDQUFsQjs7QUFDQSxTQUFLLElBQUlxQixDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHRCxTQUFTLENBQUM3TyxNQUE5QixFQUFzQzhPLENBQUMsRUFBdkMsRUFBMkM7QUFDekMsVUFBTUMsUUFBUSxHQUFHSCxVQUFVLENBQUNJLGdCQUFYLENBQTRCSCxTQUFTLENBQUNDLENBQUQsQ0FBckMsQ0FBakI7O0FBQ0EsVUFBSUMsUUFBUSxLQUFLOVQsWUFBWSxDQUFDZ1UsRUFBOUIsRUFBa0M7QUFDaEMsZUFBTyxJQUFQO0FBQ0QsT0FGRCxNQUVPLElBQUlGLFFBQVEsS0FBSzlULFlBQVksQ0FBQ2lVLFdBQTlCLEVBQTJDO0FBQ2hENVQsUUFBQUEsSUFBSSxHQUFHNlQsSUFBUCxDQUFZLFFBQVosbUJBQW9DTixTQUFTLENBQUNDLENBQUQsQ0FBN0M7QUFDRDtBQUNGOztBQUNEO0FBQ0EsV0FBTyxLQUFQO0FBQ0QsR0FoQk0sQ0FBUDtBQWlCRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0NPTlNFTlRfUE9MSUNZX1NUQVRFfSBmcm9tICcjY29yZS9jb25zdGFudHMvY29uc2VudC1zdGF0ZSc7XG5pbXBvcnQge0RvbUZpbmdlcnByaW50fSBmcm9tICcjY29yZS9kb20vZmluZ2VycHJpbnQnO1xuaW1wb3J0IHtHRU9fSU5fR1JPVVB9IGZyb20gJy4uLy4uLy4uL2V4dGVuc2lvbnMvYW1wLWdlby8wLjEvYW1wLWdlby1pbi1ncm91cCc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2J1aWxkVXJsfSBmcm9tICcuL3NoYXJlZC91cmwtYnVpbGRlcic7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0LCB1c2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7ZGljdH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7Z2V0QmluYXJ5VHlwZSwgaXNFeHBlcmltZW50T24sIHRvZ2dsZUV4cGVyaW1lbnR9IGZyb20gJyNleHBlcmltZW50cyc7XG5pbXBvcnQge2dldENvbnNlbnRQb2xpY3lTdGF0ZX0gZnJvbSAnLi4vLi4vLi4vc3JjL2NvbnNlbnQnO1xuaW1wb3J0IHtnZXRNZWFzdXJlZFJlc291cmNlc30gZnJvbSAnLi4vLi4vLi4vc3JjL2luaS1sb2FkJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtnZXRPckNyZWF0ZUFkQ2lkfSBmcm9tICcuLi8uLi8uLi9zcmMvYWQtY2lkJztcbmltcG9ydCB7Z2V0UGFnZUxheW91dEJveEJsb2NraW5nfSBmcm9tICcjY29yZS9kb20vbGF5b3V0L3BhZ2UtbGF5b3V0LWJveCc7XG5pbXBvcnQge2dldFRpbWluZ0RhdGFTeW5jfSBmcm9tICcjc2VydmljZS92YXJpYWJsZS1zb3VyY2UnO1xuaW1wb3J0IHtpbnRlcm5hbFJ1bnRpbWVWZXJzaW9ufSBmcm9tICcuLi8uLi8uLi9zcmMvaW50ZXJuYWwtdmVyc2lvbic7XG5pbXBvcnQge3BhcnNlSnNvbn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHt3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnR9IGZyb20gJy4uLy4uLy4uL3NyYy9hbXAtZWxlbWVudC1oZWxwZXJzJztcbmltcG9ydCB7Y3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzfSBmcm9tICcjY29yZS9kb20nO1xuXG4vKiogQHR5cGUge3N0cmluZ30gICovXG5jb25zdCBBTVBfQU5BTFlUSUNTX0hFQURFUiA9ICdYLUFtcEFuYWx5dGljcyc7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmNvbnN0IE1BWF9VUkxfTEVOR1RIID0gMTUzNjA7XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuY29uc3QgQW1wQWRJbXBsZW1lbnRhdGlvbiA9IHtcbiAgQU1QX0FEX1hIUl9UT19JRlJBTUU6ICcyJyxcbiAgQU1QX0FEX1hIUl9UT19JRlJBTUVfT1JfQU1QOiAnMycsXG4gIEFNUF9BRF9JRlJBTUVfR0VUOiAnNScsXG59O1xuXG4vKiogQGNvbnN0IHshT2JqZWN0fSAqL1xuZXhwb3J0IGNvbnN0IFZhbGlkQWRDb250YWluZXJUeXBlcyA9IHtcbiAgJ0FNUC1DQVJPVVNFTCc6ICdhYycsXG4gICdBTVAtRlgtRkxZSU5HLUNBUlBFVCc6ICdmYycsXG4gICdBTVAtTElHSFRCT1gnOiAnbGInLFxuICAnQU1QLVNUSUNLWS1BRCc6ICdzYScsXG59O1xuXG4vKipcbiAqIFNlZSBgVmlzaWJpbGl0eVN0YXRlYCBlbnVtLlxuICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn1cbiAqL1xuY29uc3QgdmlzaWJpbGl0eVN0YXRlQ29kZXMgPSB7XG4gICd2aXNpYmxlJzogJzEnLFxuICAnaGlkZGVuJzogJzInLFxuICAncHJlcmVuZGVyJzogJzMnLFxuICAndW5sb2FkZWQnOiAnNScsXG59O1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgUVFJRF9IRUFERVIgPSAnWC1RUUlEJztcblxuLyoqIEB0eXBlIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgU0FOREJPWF9IRUFERVIgPSAnYW1wLWZmLXNhbmRib3gnO1xuXG4vKipcbiAqIEVsZW1lbnQgYXR0cmlidXRlIHRoYXQgc3RvcmVzIEdvb2dsZSBhZHMgZXhwZXJpbWVudCBJRHMuXG4gKlxuICogTm90ZTogVGhpcyBhdHRyaWJ1dGUgc2hvdWxkIGJlIHVzZWQgb25seSBmb3IgdHJhY2tpbmcgZXhwZXJpbWVudGFsXG4gKiBpbXBsZW1lbnRhdGlvbnMgb2YgQU1QIHRhZ3MsIGUuZy4sIGJ5IEFNUEhUTUwgaW1wbGVtZW50b3JzLiAgSXQgc2hvdWxkIG5vdCBiZVxuICogYWRkZWQgYnkgYSBwdWJsaXNoZXIgcGFnZS5cbiAqXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY29uc3QgRVhQRVJJTUVOVF9BVFRSSUJVVEUgPSAnZGF0YS1leHBlcmltZW50LWlkJztcblxuLyoqXG4gKiBFbGVtZW50IGF0dHJpYnV0ZSB0aGF0IHN0b3JlcyBBTVAgZXhwZXJpbWVudCBJRHMuXG4gKlxuICogTm90ZTogVGhpcyBhdHRyaWJ1dGUgc2hvdWxkIGJlIHVzZWQgb25seSBmb3IgdHJhY2tpbmcgZXhwZXJpbWVudGFsXG4gKiBpbXBsZW1lbnRhdGlvbnMgb2YgQU1QIHRhZ3MsIGUuZy4sIGJ5IEFNUEhUTUwgaW1wbGVtZW50b3JzLiAgSXQgc2hvdWxkIG5vdCBiZVxuICogYWRkZWQgYnkgYSBwdWJsaXNoZXIgcGFnZS5cbiAqXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY29uc3QgQU1QX0VYUEVSSU1FTlRfQVRUUklCVVRFID0gJ2RhdGEtYW1wLWV4cGVyaW1lbnQtaWQnO1xuXG4vKiogQHR5cGVkZWYge3t1cmxzOiAhQXJyYXk8c3RyaW5nPn19XG4gKi9cbmV4cG9ydCBsZXQgQW1wQW5hbHl0aWNzQ29uZmlnRGVmO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7aW5zdGFudExvYWQ6IGJvb2xlYW4sIHdyaXRlSW5Cb2R5OiBib29sZWFufX1cbiAqL1xuZXhwb3J0IGxldCBOYW1lZnJhbWVFeHBlcmltZW50Q29uZmlnO1xuXG4vKipcbiAqIEBjb25zdCB7IS4vc2hhcmVkL3VybC1idWlsZGVyLlF1ZXJ5UGFyYW1ldGVyRGVmfVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBjb25zdCBUUlVOQ0FUSU9OX1BBUkFNID0ge25hbWU6ICd0cnVuYycsIHZhbHVlOiAnMSd9O1xuXG4vKiogQGNvbnN0IHtPYmplY3R9ICovXG5jb25zdCBDRE5fUFJPWFlfUkVHRVhQID1cbiAgL15odHRwczpcXC9cXC8oW2EtekEtWjAtOV8tXStcXC4pP2NkblxcLmFtcHByb2plY3RcXC5vcmcoKFxcLy4qKXwoJCkpKy87XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRPS0VOX1ZBTFVFID1cbiAgJ0E4VWpyOHkrOXNnL1pCbUNzOTBaZlFHT1VGSnNBUy9ZYUhZdGpMQXNObjA1T2FRWFNtWmVSWjJVMXdBajNQRDc0V1k5cmUyeC9Ud2luSm9PYVl1cUZRb0FBQUNCZXlKdmNtbG5hVzRpT2lKb2RIUndjem92TDJGdGNIQnliMnBsWTNRdWJtVjBPalEwTXlJc0ltWmxZWFIxY21VaU9pSkRiMjUyWlhKemFXOXVUV1ZoYzNWeVpXMWxiblFpTENKbGVIQnBjbmtpT2pFMk16RTJOak01T1Rrc0ltbHpVM1ZpWkc5dFlXbHVJanAwY25WbExDSjFjMkZuWlNJNkluTjFZbk5sZENKOSc7XG5cbi8qKlxuICogSW5zZXJ0cyBvcmlnaW4tdHJpYWwgdG9rZW4gZm9yIGBhdHRyaWJ1dGlvbi1yZXBvcnRpbmdgIGlmIG5vdCBhbHJlYWR5XG4gKiBwcmVzZW50IGluIHRoZSBET00uXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF5YmVJbnNlcnRPcmlnaW5UcmlhbFRva2VuKHdpbikge1xuICBpZiAod2luLmRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcihgbWV0YVtjb250ZW50PScke1RPS0VOX1ZBTFVFfSddYCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgbWV0YUVsID0gY3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzKHdpbi5kb2N1bWVudCwgJ21ldGEnLCB7XG4gICAgJ2h0dHAtZXF1aXYnOiAnb3JpZ2luLXRyaWFsJyxcbiAgICBjb250ZW50OiBUT0tFTl9WQUxVRSxcbiAgfSk7XG4gIHdpbi5kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKG1ldGFFbCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2Ygc29tZSBuYXZpZ2F0aW9uIHRpbWluZyBwYXJhbWV0ZXIuXG4gKiBGZWF0dXJlIGRldGVjdGlvbiBpcyB1c2VkIGZvciBzYWZldHkgb24gYnJvd3NlcnMgdGhhdCBkbyBub3Qgc3VwcG9ydCB0aGVcbiAqIHBlcmZvcm1hbmNlIEFQSS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge3N0cmluZ30gdGltaW5nRXZlbnQgVGhlIG5hbWUgb2YgdGhlIHRpbWluZyBldmVudCwgZS5nLlxuICogICAgICduYXZpZ2F0aW9uU3RhcnQnIG9yICdkb21Db250ZW50TG9hZEV2ZW50U3RhcnQnLlxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXROYXZpZ2F0aW9uVGltaW5nKHdpbiwgdGltaW5nRXZlbnQpIHtcbiAgcmV0dXJuIChcbiAgICAod2luWydwZXJmb3JtYW5jZSddICYmXG4gICAgICB3aW5bJ3BlcmZvcm1hbmNlJ11bJ3RpbWluZyddICYmXG4gICAgICB3aW5bJ3BlcmZvcm1hbmNlJ11bJ3RpbWluZyddW3RpbWluZ0V2ZW50XSkgfHxcbiAgICAwXG4gICk7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBHb29nbGUgQWRzIHN1cHBvcnRzIHRoZSBBNEEgcmVuZGVyaW5nIHBhdGh3YXkgaXMgdmFsaWQgZm9yIHRoZVxuICogZW52aXJvbm1lbnQgYnkgZW5zdXJpbmcgbmF0aXZlIGNyeXB0byBzdXBwb3J0IGFuZCBwYWdlIG9yaWdpbmF0ZWQgaW4gdGhlXG4gKiB7QGNvZGUgY2RuLmFtcHByb2plY3Qub3JnfSBDRE4gPGVtPm9yPC9lbT4gd2UgbXVzdCBiZSBydW5uaW5nIGluIGxvY2FsXG4gKiBkZXYgbW9kZS5cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpbiAgSG9zdCB3aW5kb3cgZm9yIHRoZSBhZC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59ICBXaGV0aGVyIEdvb2dsZSBBZHMgc2hvdWxkIGF0dGVtcHQgdG8gcmVuZGVyIHZpYSB0aGUgQTRBXG4gKiAgIHBhdGh3YXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0dvb2dsZUFkc0E0QVZhbGlkRW52aXJvbm1lbnQod2luKSB7XG4gIHJldHVybiAoXG4gICAgc3VwcG9ydHNOYXRpdmVDcnlwdG8od2luKSAmJlxuICAgICghIWlzQ2RuUHJveHkod2luKSB8fCBnZXRNb2RlKHdpbikubG9jYWxEZXYgfHwgZ2V0TW9kZSh3aW4pLnRlc3QpXG4gICk7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgbmF0aXZlIGNyeXB0byBpcyBzdXBwb3J0ZWQgZm9yIHdpbi5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luICBIb3N0IHdpbmRvdyBmb3IgdGhlIGFkLlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBuYXRpdmUgY3J5cHRvIGlzIHN1cHBvcnRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1cHBvcnRzTmF0aXZlQ3J5cHRvKHdpbikge1xuICByZXR1cm4gd2luLmNyeXB0byAmJiAod2luLmNyeXB0by5zdWJ0bGUgfHwgd2luLmNyeXB0by53ZWJraXRTdWJ0bGUpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IUFNUC5CYXNlRWxlbWVudH0gYW1wRWxlbWVudCBUaGUgZWxlbWVudCBvbiB3aG9zZSBsaWZlY3ljbGUgdGhpc1xuICogICAgcmVwb3J0ZXIgd2lsbCBiZSByZXBvcnRpbmcuXG4gKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIHJlcG9ydGluZyBpcyBlbmFibGVkIGZvciB0aGlzIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVwb3J0aW5nRW5hYmxlZChhbXBFbGVtZW50KSB7XG4gIC8vIENhcnZlLW91dHM6IFdlIG9ubHkgd2FudCB0byBlbmFibGUgcHJvZmlsaW5nIHBpbmdiYWNrcyB3aGVuOlxuICAvLyAgIC0gVGhlIGFkIGlzIGZyb20gb25lIG9mIHRoZSBHb29nbGUgbmV0d29ya3MgKEFkU2Vuc2Ugb3IgRG91YmxlY2xpY2spLlxuICAvLyAgIC0gVGhlIGFkIHNsb3QgaXMgaW4gdGhlIEE0QS12cy0zcCBhbXAtYWQgY29udHJvbCBicmFuY2ggKGVpdGhlciB2aWFcbiAgLy8gICAgIGludGVybmFsLCBjbGllbnQtc2lkZSBzZWxlY3Rpb24gb3IgdmlhIGV4dGVybmFsLCBHb29nbGUgU2VhcmNoXG4gIC8vICAgICBzZWxlY3Rpb24pLlxuICAvLyAgIC0gV2UgaGF2ZW4ndCB0dXJuZWQgb2ZmIHByb2ZpbGluZyB2aWEgdGhlIHJhdGUgY29udHJvbHMgaW5cbiAgLy8gICAgIGJ1aWxkLXN5c3RlbS9nbG9iYWwtY29uZmlnL3tjYW5hcnkscHJvZH0tY29uZmlnLmpzb25cbiAgLy8gSWYgYW55IG9mIHRob3NlIGZhaWwsIHdlIHVzZSB0aGUgYEJhc2VMaWZlY3ljbGVSZXBvcnRlcmAsIHdoaWNoIGlzIGFcbiAgLy8gYSBuby1vcCAoc2VuZHMgbm8gcGluZ3MpLlxuICBjb25zdCB0eXBlID0gYW1wRWxlbWVudC5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpO1xuICBjb25zdCB7d2lufSA9IGFtcEVsZW1lbnQ7XG4gIC8vIEluIGxvY2FsIGRldiBtb2RlLCBuZWl0aGVyIHRoZSBjYW5hcnkgbm9yIHByb2QgY29uZmlnIGZpbGVzIGlzIGF2YWlsYWJsZSxcbiAgLy8gc28gbWFudWFsbHkgc2V0IHRoZSBwcm9maWxpbmcgcmF0ZSwgZm9yIHRlc3RpbmcvZGV2LlxuICBpZiAoZ2V0TW9kZShhbXBFbGVtZW50LndpbikubG9jYWxEZXYgJiYgIWdldE1vZGUoYW1wRWxlbWVudC53aW4pLnRlc3QpIHtcbiAgICB0b2dnbGVFeHBlcmltZW50KHdpbiwgJ2E0YVByb2ZpbGluZ1JhdGUnLCB0cnVlLCB0cnVlKTtcbiAgfVxuICByZXR1cm4gKFxuICAgICh0eXBlID09ICdkb3VibGVjbGljaycgfHwgdHlwZSA9PSAnYWRzZW5zZScpICYmXG4gICAgaXNFeHBlcmltZW50T24od2luLCAnYTRhUHJvZmlsaW5nUmF0ZScpXG4gICk7XG59XG5cbi8qKlxuICogSGFzIHNpZGUtZWZmZWN0IG9mIGluY3JlbWVudGluZyBpZmkgY291bnRlciBvbiB3aW5kb3cuXG4gKiBAcGFyYW0geyEuLi8uLi8uLi9leHRlbnNpb25zL2FtcC1hNGEvMC4xL2FtcC1hNGEuQW1wQTRBfSBhNGFcbiAqIEBwYXJhbSB7IUFycmF5PHN0cmluZz49fSBvcHRfZXhwZXJpbWVudElkcyBBbnkgZXhwZXJpbWVudHMgSURzIChpbiBhZGRpdGlvblxuICogICAgIHRvIHRob3NlIHNwZWNpZmllZCBvbiB0aGUgYWQgZWxlbWVudCkgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlXG4gKiAgICAgcmVxdWVzdC5cbiAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLG51bGx8bnVtYmVyfHN0cmluZz59IGJsb2NrIGxldmVsIHBhcmFtZXRlcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdvb2dsZUJsb2NrUGFyYW1ldGVycyhhNGEsIG9wdF9leHBlcmltZW50SWRzKSB7XG4gIGNvbnN0IHtlbGVtZW50OiBhZEVsZW1lbnQsIHdpbn0gPSBhNGE7XG4gIGNvbnN0IHNsb3RSZWN0ID0gZ2V0UGFnZUxheW91dEJveEJsb2NraW5nKGFkRWxlbWVudCk7XG4gIGNvbnN0IGlmcmFtZURlcHRoID0gaWZyYW1lTmVzdGluZ0RlcHRoKHdpbik7XG4gIGNvbnN0IGVuY2xvc2luZ0NvbnRhaW5lcnMgPSBnZXRFbmNsb3NpbmdDb250YWluZXJUeXBlcyhhZEVsZW1lbnQpO1xuICBsZXQgZWlkcyA9IGFkRWxlbWVudC5nZXRBdHRyaWJ1dGUoRVhQRVJJTUVOVF9BVFRSSUJVVEUpO1xuICBpZiAob3B0X2V4cGVyaW1lbnRJZHMpIHtcbiAgICBlaWRzID0gbWVyZ2VFeHBlcmltZW50SWRzKG9wdF9leHBlcmltZW50SWRzLCBlaWRzKTtcbiAgfVxuICBjb25zdCBhZXhwID0gYWRFbGVtZW50LmdldEF0dHJpYnV0ZShBTVBfRVhQRVJJTUVOVF9BVFRSSUJVVEUpO1xuICByZXR1cm4ge1xuICAgICdhZGYnOiBEb21GaW5nZXJwcmludC5nZW5lcmF0ZShhZEVsZW1lbnQpLFxuICAgICduaGQnOiBpZnJhbWVEZXB0aCxcbiAgICAnZWlkJzogZWlkcyxcbiAgICAnYWR4JzogTWF0aC5yb3VuZChzbG90UmVjdC5sZWZ0KSxcbiAgICAnYWR5JzogTWF0aC5yb3VuZChzbG90UmVjdC50b3ApLFxuICAgICdvaWQnOiAnMicsXG4gICAgJ2FjdCc6IGVuY2xvc2luZ0NvbnRhaW5lcnMubGVuZ3RoID8gZW5jbG9zaW5nQ29udGFpbmVycy5qb2luKCkgOiBudWxsLFxuICAgIC8vIGFleHAgVVJMIHBhcmFtIGlzIHNlcGFyYXRlZCBieSBgIWAsIG5vdCBgLGAuXG4gICAgJ2FleHAnOiBhZXhwID8gYWV4cC5yZXBsYWNlKC8sL2csICchJykgOiBudWxsLFxuICB9O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBtYXRjaGluZyB0eXBpbmcgYXR0cmlidXRlLlxuICogQHBhcmFtIHtmdW5jdGlvbighRWxlbWVudCk6c3RyaW5nfSBncm91cEZuXG4gKiBAcmV0dXJuIHshUHJvbWlzZTwhT2JqZWN0PHN0cmluZywhQXJyYXk8IVByb21pc2U8IS4uLy4uLy4uL3NyYy9iYXNlLWVsZW1lbnQuQmFzZUVsZW1lbnQ+Pj4+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBBbXBBZHNCeVR5cGUoYW1wZG9jLCB0eXBlLCBncm91cEZuKSB7XG4gIC8vIExvb2sgZm9yIGFtcC1hZCBlbGVtZW50cyBvZiBjb3JyZWN0IHR5cGUgb3IgdGhvc2UgY29udGFpbmVkIHdpdGhpblxuICAvLyBzdGFuZGFyZCBjb250YWluZXIgdHlwZS4gIE5vdGUgdGhhdCBkaXNwbGF5IG5vbmUgY29udGFpbmVycyB3aWxsIG5vdCBiZVxuICAvLyBpbmNsdWRlZCBhcyB0aGV5IHdpbGwgbmV2ZXIgYmUgbWVhc3VyZWQuXG4gIC8vIFRPRE8oa2VpdGh3cmlnaHRib3MpOiB3aGF0IGFib3V0IHNsb3RzIHRoYXQgYmVjb21lIG1lYXN1cmVkIGR1ZSB0byByZW1vdmFsXG4gIC8vIG9mIGRpc3BsYXkgbm9uZSAoZS5nLiB1c2VyIHJlc2l6ZXMgdmlld3BvcnQgYW5kIG1lZGlhIHNlbGVjdG9yIG1ha2VzXG4gIC8vIHZpc2libGUpLlxuICBjb25zdCBhbXBBZFNlbGVjdG9yID0gKHIpID0+XG4gICAgci5lbGVtZW50Li8qT0sqLyBxdWVyeVNlbGVjdG9yKGBhbXAtYWRbdHlwZT0ke3R5cGV9XWApO1xuICByZXR1cm4gKFxuICAgIGdldE1lYXN1cmVkUmVzb3VyY2VzKGFtcGRvYywgYW1wZG9jLndpbiwgKHIpID0+IHtcbiAgICAgIGNvbnN0IGlzQW1wQWRUeXBlID1cbiAgICAgICAgci5lbGVtZW50LnRhZ05hbWUgPT0gJ0FNUC1BRCcgJiYgci5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpID09IHR5cGU7XG4gICAgICBpZiAoaXNBbXBBZFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCBpc0FtcEFkQ29udGFpbmVyRWxlbWVudCA9XG4gICAgICAgIE9iamVjdC5rZXlzKFZhbGlkQWRDb250YWluZXJUeXBlcykuaW5jbHVkZXMoci5lbGVtZW50LnRhZ05hbWUpICYmXG4gICAgICAgICEhYW1wQWRTZWxlY3RvcihyKTtcbiAgICAgIHJldHVybiBpc0FtcEFkQ29udGFpbmVyRWxlbWVudDtcbiAgICB9KVxuICAgICAgLy8gTmVlZCB0byB3YWl0IG9uIGFueSBjb250YWluZWQgZWxlbWVudCByZXNvbHV0aW9uIGZvbGxvd2VkIGJ5IGJ1aWxkXG4gICAgICAvLyBvZiBjaGlsZCBhZC5cbiAgICAgIC50aGVuKChyZXNvdXJjZXMpID0+XG4gICAgICAgIFByb21pc2UuYWxsKFxuICAgICAgICAgIHJlc291cmNlcy5tYXAoKHJlc291cmNlKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzb3VyY2UuZWxlbWVudC50YWdOYW1lID09ICdBTVAtQUQnKSB7XG4gICAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS5lbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTXVzdCBiZSBjb250YWluZXIgZWxlbWVudCBzbyBuZWVkIHRvIHdhaXQgZm9yIGNoaWxkIGFtcC1hZCB0b1xuICAgICAgICAgICAgLy8gYmUgdXBncmFkZWQuXG4gICAgICAgICAgICByZXR1cm4gd2hlblVwZ3JhZGVkVG9DdXN0b21FbGVtZW50KFxuICAgICAgICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KGFtcEFkU2VsZWN0b3IocmVzb3VyY2UpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgICAvLyBHcm91cCBieSBuZXR3b3JrSWQuXG4gICAgICAudGhlbigoZWxlbWVudHMpID0+XG4gICAgICAgIGVsZW1lbnRzLnJlZHVjZSgocmVzdWx0LCBlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgZ3JvdXBJZCA9IGdyb3VwRm4oZWxlbWVudCk7XG4gICAgICAgICAgKHJlc3VsdFtncm91cElkXSB8fCAocmVzdWx0W2dyb3VwSWRdID0gW10pKS5wdXNoKGVsZW1lbnQuZ2V0SW1wbCgpKTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LCB7fSlcbiAgICAgIClcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEgLi4vLi4vLi4vZXh0ZW5zaW9ucy9hbXAtYTRhLzAuMS9hbXAtYTRhLkFtcEE0QX0gYTRhXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnRUaW1lXG4gKiBAcmV0dXJuIHshUHJvbWlzZTwhT2JqZWN0PHN0cmluZyxudWxsfG51bWJlcnxzdHJpbmc+Pn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdvb2dsZVBhZ2VQYXJhbWV0ZXJzKGE0YSwgc3RhcnRUaW1lKSB7XG4gIGNvbnN0IHt3aW59ID0gYTRhO1xuICBjb25zdCBhbXBEb2MgPSBhNGEuZ2V0QW1wRG9jKCk7XG4gIC8vIERvIG5vdCB3YWl0IGxvbmdlciB0aGFuIDEgc2Vjb25kIHRvIHJldHJpZXZlIHJlZmVycmVyIHRvIGVuc3VyZVxuICAvLyB2aWV3ZXIgaW50ZWdyYXRpb24gaXNzdWVzIGRvIG5vdCBjYXVzZSBhZCByZXF1ZXN0cyB0byBoYW5nIGluZGVmaW5pdGVseS5cbiAgY29uc3QgcmVmZXJyZXJQcm9taXNlID0gU2VydmljZXMudGltZXJGb3Iod2luKVxuICAgIC50aW1lb3V0UHJvbWlzZSgxMDAwLCBTZXJ2aWNlcy52aWV3ZXJGb3JEb2MoYW1wRG9jKS5nZXRSZWZlcnJlclVybCgpKVxuICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICBkZXYoKS5leHBlY3RlZEVycm9yKCdBTVAtQTRBJywgJ1JlZmVycmVyIHRpbWVvdXQhJyk7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSk7XG4gIC8vIFNldCBkb20gbG9hZGluZyB0aW1lIHRvIGZpcnN0IHZpc2libGUgaWYgcGFnZSBzdGFydGVkIGluIHByZXJlbmRlciBzdGF0ZVxuICAvLyBkZXRlcm1pbmVkIGJ5IHRydXRoeSB2YWx1ZSBmb3IgdmlzaWJpbGl0eVN0YXRlIHBhcmFtLlxuICBjb25zdCBkb21Mb2FkaW5nID0gYTRhLmdldEFtcERvYygpLmdldFBhcmFtKCd2aXNpYmlsaXR5U3RhdGUnKVxuICAgID8gYTRhLmdldEFtcERvYygpLmdldExhc3RWaXNpYmxlVGltZSgpXG4gICAgOiBnZXROYXZpZ2F0aW9uVGltaW5nKHdpbiwgJ2RvbUxvYWRpbmcnKTtcbiAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICBnZXRPckNyZWF0ZUFkQ2lkKGFtcERvYywgJ0FNUF9FQ0lEX0dPT0dMRScsICdfZ2EnKSxcbiAgICByZWZlcnJlclByb21pc2UsXG4gIF0pLnRoZW4oKHByb21pc2VSZXN1bHRzKSA9PiB7XG4gICAgY29uc3QgY2xpZW50SWQgPSBwcm9taXNlUmVzdWx0c1swXTtcbiAgICBjb25zdCByZWZlcnJlciA9IHByb21pc2VSZXN1bHRzWzFdO1xuICAgIGNvbnN0IHtjYW5vbmljYWxVcmwsIHBhZ2VWaWV3SWR9ID0gU2VydmljZXMuZG9jdW1lbnRJbmZvRm9yRG9jKGFtcERvYyk7XG4gICAgLy8gUmVhZCBieSBHUFQgZm9yIEdBL0dQVCBpbnRlZ3JhdGlvbi5cbiAgICB3aW4uZ2FHbG9iYWwgPSB3aW4uZ2FHbG9iYWwgfHwge2NpZDogY2xpZW50SWQsIGhpZDogcGFnZVZpZXdJZH07XG4gICAgY29uc3Qge3NjcmVlbn0gPSB3aW47XG4gICAgY29uc3Qgdmlld3BvcnQgPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyhhbXBEb2MpO1xuICAgIGNvbnN0IHZpZXdwb3J0UmVjdCA9IHZpZXdwb3J0LmdldFJlY3QoKTtcbiAgICBjb25zdCB2aWV3cG9ydFNpemUgPSB2aWV3cG9ydC5nZXRTaXplKCk7XG4gICAgY29uc3QgdmlzaWJpbGl0eVN0YXRlID0gYW1wRG9jLmdldFZpc2liaWxpdHlTdGF0ZSgpO1xuICAgIHJldHVybiB7XG4gICAgICAnaXNfYW1wJzogYTRhLmlzWGhyQWxsb3dlZCgpXG4gICAgICAgID8gQW1wQWRJbXBsZW1lbnRhdGlvbi5BTVBfQURfWEhSX1RPX0lGUkFNRV9PUl9BTVBcbiAgICAgICAgOiBBbXBBZEltcGxlbWVudGF0aW9uLkFNUF9BRF9JRlJBTUVfR0VULFxuICAgICAgJ2FtcF92JzogaW50ZXJuYWxSdW50aW1lVmVyc2lvbigpLFxuICAgICAgJ2RfaW1wJzogJzEnLFxuICAgICAgJ2MnOiBnZXRDb3JyZWxhdG9yKHdpbiwgYW1wRG9jLCBjbGllbnRJZCksXG4gICAgICAnZ2FfY2lkJzogd2luLmdhR2xvYmFsLmNpZCB8fCBudWxsLFxuICAgICAgJ2dhX2hpZCc6IHdpbi5nYUdsb2JhbC5oaWQgfHwgbnVsbCxcbiAgICAgICdkdCc6IHN0YXJ0VGltZSxcbiAgICAgICdiaXcnOiB2aWV3cG9ydFJlY3Qud2lkdGgsXG4gICAgICAnYmloJzogdmlld3BvcnRSZWN0LmhlaWdodCxcbiAgICAgICd1X2F3Jzogc2NyZWVuID8gc2NyZWVuLmF2YWlsV2lkdGggOiBudWxsLFxuICAgICAgJ3VfYWgnOiBzY3JlZW4gPyBzY3JlZW4uYXZhaWxIZWlnaHQgOiBudWxsLFxuICAgICAgJ3VfY2QnOiBzY3JlZW4gPyBzY3JlZW4uY29sb3JEZXB0aCA6IG51bGwsXG4gICAgICAndV93Jzogc2NyZWVuID8gc2NyZWVuLndpZHRoIDogbnVsbCxcbiAgICAgICd1X2gnOiBzY3JlZW4gPyBzY3JlZW4uaGVpZ2h0IDogbnVsbCxcbiAgICAgICd1X3R6JzogLW5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKSxcbiAgICAgICd1X2hpcyc6IGdldEhpc3RvcnlMZW5ndGgod2luKSxcbiAgICAgICdpc3cnOiB3aW4gIT0gd2luLnRvcCA/IHZpZXdwb3J0U2l6ZS53aWR0aCA6IG51bGwsXG4gICAgICAnaXNoJzogd2luICE9IHdpbi50b3AgPyB2aWV3cG9ydFNpemUuaGVpZ2h0IDogbnVsbCxcbiAgICAgICdhcnQnOiBnZXRBbXBSdW50aW1lVHlwZVBhcmFtZXRlcih3aW4pLFxuICAgICAgJ3Zpcyc6IHZpc2liaWxpdHlTdGF0ZUNvZGVzW3Zpc2liaWxpdHlTdGF0ZV0gfHwgJzAnLFxuICAgICAgJ3Njcl94JzogTWF0aC5yb3VuZCh2aWV3cG9ydC5nZXRTY3JvbGxMZWZ0KCkpLFxuICAgICAgJ3Njcl95JzogTWF0aC5yb3VuZCh2aWV3cG9ydC5nZXRTY3JvbGxUb3AoKSksXG4gICAgICAnYmMnOiBnZXRCcm93c2VyQ2FwYWJpbGl0aWVzQml0bWFwKHdpbikgfHwgbnVsbCxcbiAgICAgICdkZWJ1Z19leHBlcmltZW50X2lkJzpcbiAgICAgICAgKC8oPzojfCwpZGVpZD0oW1xcZCxdKykvaS5leGVjKHdpbi5sb2NhdGlvbi5oYXNoKSB8fCBbXSlbMV0gfHwgbnVsbCxcbiAgICAgICd1cmwnOiBjYW5vbmljYWxVcmwgfHwgbnVsbCxcbiAgICAgICd0b3AnOiB3aW4gIT0gd2luLnRvcCA/IHRvcFdpbmRvd1VybE9yRG9tYWluKHdpbikgOiBudWxsLFxuICAgICAgJ2xvYyc6IHdpbi5sb2NhdGlvbi5ocmVmID09IGNhbm9uaWNhbFVybCA/IG51bGwgOiB3aW4ubG9jYXRpb24uaHJlZixcbiAgICAgICdyZWYnOiByZWZlcnJlciB8fCBudWxsLFxuICAgICAgJ2JkdCc6IGRvbUxvYWRpbmcgPyBzdGFydFRpbWUgLSBkb21Mb2FkaW5nIDogbnVsbCxcbiAgICB9O1xuICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuLi8uLi8uLi9leHRlbnNpb25zL2FtcC1hNGEvMC4xL2FtcC1hNGEuQW1wQTRBfSBhNGFcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVXJsXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnRUaW1lXG4gKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLG51bGx8bnVtYmVyfHN0cmluZz59IHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7IUFycmF5PHN0cmluZz49fSBvcHRfZXhwZXJpbWVudElkcyBBbnkgZXhwZXJpbWVudHMgSURzIChpbiBhZGRpdGlvblxuICogICAgIHRvIHRob3NlIHNwZWNpZmllZCBvbiB0aGUgYWQgZWxlbWVudCkgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlXG4gKiAgICAgcmVxdWVzdC5cbiAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnb29nbGVBZFVybChcbiAgYTRhLFxuICBiYXNlVXJsLFxuICBzdGFydFRpbWUsXG4gIHBhcmFtZXRlcnMsXG4gIG9wdF9leHBlcmltZW50SWRzXG4pIHtcbiAgLy8gVE9ETzogTWF5YmUgYWRkIGNoZWNrcyBpbiBjYXNlIHRoZXNlIHByb21pc2VzIGZhaWwuXG4gIGNvbnN0IGJsb2NrTGV2ZWxQYXJhbWV0ZXJzID0gZ29vZ2xlQmxvY2tQYXJhbWV0ZXJzKGE0YSwgb3B0X2V4cGVyaW1lbnRJZHMpO1xuICByZXR1cm4gZ29vZ2xlUGFnZVBhcmFtZXRlcnMoYTRhLCBzdGFydFRpbWUpLnRoZW4oKHBhZ2VMZXZlbFBhcmFtZXRlcnMpID0+IHtcbiAgICBPYmplY3QuYXNzaWduKHBhcmFtZXRlcnMsIGJsb2NrTGV2ZWxQYXJhbWV0ZXJzLCBwYWdlTGV2ZWxQYXJhbWV0ZXJzKTtcbiAgICByZXR1cm4gdHJ1bmNBbmRUaW1lVXJsKGJhc2VVcmwsIHBhcmFtZXRlcnMsIHN0YXJ0VGltZSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVXJsXG4gKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLG51bGx8bnVtYmVyfHN0cmluZz59IHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFRpbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRydW5jQW5kVGltZVVybChiYXNlVXJsLCBwYXJhbWV0ZXJzLCBzdGFydFRpbWUpIHtcbiAgcmV0dXJuIChcbiAgICBidWlsZFVybChiYXNlVXJsLCBwYXJhbWV0ZXJzLCBNQVhfVVJMX0xFTkdUSCAtIDEwLCBUUlVOQ0FUSU9OX1BBUkFNKSArXG4gICAgJyZkdGQ9JyArXG4gICAgZWxhcHNlZFRpbWVXaXRoQ2VpbGluZyhEYXRlLm5vdygpLCBzdGFydFRpbWUpXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gaWZyYW1lTmVzdGluZ0RlcHRoKHdpbikge1xuICBsZXQgdyA9IHdpbjtcbiAgbGV0IGRlcHRoID0gMDtcbiAgd2hpbGUgKHcgIT0gdy5wYXJlbnQgJiYgZGVwdGggPCAxMDApIHtcbiAgICB3ID0gdy5wYXJlbnQ7XG4gICAgZGVwdGgrKztcbiAgfVxuICBkZXZBc3NlcnQodyA9PSB3aW4udG9wKTtcbiAgcmV0dXJuIGRlcHRoO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldEhpc3RvcnlMZW5ndGgod2luKSB7XG4gIC8vIFdlIGhhdmUgc2VlbiBjYXNlcyB3aGVyZSBhY2Nlc3NpbmcgaGlzdG9yeSBsZW5ndGggY2F1c2VzIGVycm9ycy5cbiAgdHJ5IHtcbiAgICByZXR1cm4gd2luLmhpc3RvcnkubGVuZ3RoO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGhvc3RuYW1lIHBvcnRpb24gb2YgdXJsXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RIb3N0KHVybCkge1xuICByZXR1cm4gKC9eKD86aHR0cHM/OlxcL1xcLyk/KFteXFwvXFw/Ol0rKS9pLmV4ZWModXJsKSB8fCBbXSlbMV0gfHwgdXJsO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHs/c3RyaW5nfVxuICovXG5mdW5jdGlvbiB0b3BXaW5kb3dVcmxPckRvbWFpbih3aW4pIHtcbiAgY29uc3Qge2FuY2VzdG9yT3JpZ2luc30gPSB3aW4ubG9jYXRpb247XG4gIGlmIChhbmNlc3Rvck9yaWdpbnMpIHtcbiAgICBjb25zdCB7b3JpZ2lufSA9IHdpbi5sb2NhdGlvbjtcbiAgICBjb25zdCB0b3BPcmlnaW4gPSBhbmNlc3Rvck9yaWdpbnNbYW5jZXN0b3JPcmlnaW5zLmxlbmd0aCAtIDFdO1xuICAgIGlmIChvcmlnaW4gPT0gdG9wT3JpZ2luKSB7XG4gICAgICByZXR1cm4gd2luLnRvcC5sb2NhdGlvbi5ob3N0bmFtZTtcbiAgICB9XG4gICAgY29uc3Qgc2Vjb25kRnJvbVRvcCA9IHNlY29uZFdpbmRvd0Zyb21Ub3Aod2luKTtcbiAgICBpZiAoXG4gICAgICBzZWNvbmRGcm9tVG9wID09IHdpbiB8fFxuICAgICAgb3JpZ2luID09IGFuY2VzdG9yT3JpZ2luc1thbmNlc3Rvck9yaWdpbnMubGVuZ3RoIC0gMl1cbiAgICApIHtcbiAgICAgIHJldHVybiBleHRyYWN0SG9zdChzZWNvbmRGcm9tVG9wLi8qT0sqLyBkb2N1bWVudC5yZWZlcnJlcik7XG4gICAgfVxuICAgIHJldHVybiBleHRyYWN0SG9zdCh0b3BPcmlnaW4pO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gd2luLnRvcC5sb2NhdGlvbi5ob3N0bmFtZTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIGNvbnN0IHNlY29uZEZyb21Ub3AgPSBzZWNvbmRXaW5kb3dGcm9tVG9wKHdpbik7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBleHRyYWN0SG9zdChzZWNvbmRGcm9tVG9wLi8qT0sqLyBkb2N1bWVudC5yZWZlcnJlcik7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHshV2luZG93fVxuICovXG5mdW5jdGlvbiBzZWNvbmRXaW5kb3dGcm9tVG9wKHdpbikge1xuICBsZXQgc2Vjb25kRnJvbVRvcCA9IHdpbjtcbiAgbGV0IGRlcHRoID0gMDtcbiAgd2hpbGUgKHNlY29uZEZyb21Ub3AucGFyZW50ICE9IHNlY29uZEZyb21Ub3AucGFyZW50LnBhcmVudCAmJiBkZXB0aCA8IDEwMCkge1xuICAgIHNlY29uZEZyb21Ub3AgPSBzZWNvbmRGcm9tVG9wLnBhcmVudDtcbiAgICBkZXB0aCsrO1xuICB9XG4gIGRldkFzc2VydChzZWNvbmRGcm9tVG9wLnBhcmVudCA9PSB3aW4udG9wKTtcbiAgcmV0dXJuIHNlY29uZEZyb21Ub3A7XG59XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFxuICogQHJldHVybiB7KG51bWJlcnxzdHJpbmcpfVxuICovXG5mdW5jdGlvbiBlbGFwc2VkVGltZVdpdGhDZWlsaW5nKHRpbWUsIHN0YXJ0KSB7XG4gIGNvbnN0IGR1cmF0aW9uID0gdGltZSAtIHN0YXJ0O1xuICBpZiAoZHVyYXRpb24gPj0gMWU2KSB7XG4gICAgcmV0dXJuICdNJztcbiAgfSBlbHNlIGlmIChkdXJhdGlvbiA+PSAwKSB7XG4gICAgcmV0dXJuIGR1cmF0aW9uO1xuICB9XG4gIHJldHVybiAnLU0nO1xufVxuXG4vKipcbiAqIGBub2RlT3JEb2NgIG11c3QgYmUgcGFzc2VkIGZvciBjb3JyZWN0IGJlaGF2aW9yIGluIHNoYWRvdyBBTVAgKFBXQSkgY2FzZS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFFbGVtZW50fCEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfY2lkXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBjb3JyZWxhdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29ycmVsYXRvcih3aW4sIGVsZW1lbnRPckFtcERvYywgb3B0X2NpZCkge1xuICBpZiAoIXdpbi5hbXBBZFBhZ2VDb3JyZWxhdG9yKSB7XG4gICAgd2luLmFtcEFkUGFnZUNvcnJlbGF0b3IgPSBpc0V4cGVyaW1lbnRPbih3aW4sICdleHAtbmV3LWNvcnJlbGF0b3InKVxuICAgICAgPyBNYXRoLmZsb29yKDQ1MDM1OTk2MjczNzA0OTYgKiBNYXRoLnJhbmRvbSgpKVxuICAgICAgOiBtYWtlQ29ycmVsYXRvcihcbiAgICAgICAgICBTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2MoZWxlbWVudE9yQW1wRG9jKS5wYWdlVmlld0lkLFxuICAgICAgICAgIG9wdF9jaWRcbiAgICAgICAgKTtcbiAgfVxuICByZXR1cm4gd2luLmFtcEFkUGFnZUNvcnJlbGF0b3I7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhZ2VWaWV3SWRcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X2NsaWVudElkXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIG1ha2VDb3JyZWxhdG9yKHBhZ2VWaWV3SWQsIG9wdF9jbGllbnRJZCkge1xuICBjb25zdCBwYWdlVmlld0lkTnVtZXJpYyA9IE51bWJlcihwYWdlVmlld0lkIHx8IDApO1xuICBpZiAob3B0X2NsaWVudElkKSB7XG4gICAgcmV0dXJuIHBhZ2VWaWV3SWROdW1lcmljICsgKG9wdF9jbGllbnRJZC5yZXBsYWNlKC9cXEQvZywgJycpICUgMWU2KSAqIDFlNjtcbiAgfSBlbHNlIHtcbiAgICAvLyBJbiB0aGlzIGNhc2UsIHBhZ2VWaWV3SWROdW1lcmljIGlzIG9ubHkgNCBkaWdpdHMgPT4gdG9vIGxvdyBlbnRyb3B5XG4gICAgLy8gdG8gYmUgdXNlZnVsIGFzIGEgcGFnZSBjb3JyZWxhdG9yLiAgU28gc3ludGhlc2l6ZSBvbmUgZnJvbSBzY3JhdGNoLlxuICAgIC8vIDQ1MDM1OTk2MjczNzA0OTYgPT0gMl41Mi4gIFRoZSBndWFyYW50ZWVkIHJhbmdlIG9mIEpTIE51bWJlciBpcyBhdCBsZWFzdFxuICAgIC8vIDJeNTMgLSAxLlxuICAgIHJldHVybiBNYXRoLmZsb29yKDQ1MDM1OTk2MjczNzA0OTYgKiBNYXRoLnJhbmRvbSgpKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbGxlY3QgYWRkaXRpb25hbCBkaW1lbnNpb25zIGZvciB0aGUgYnJkaW0gcGFyYW1ldGVyLlxuICogQHBhcmFtIHshV2luZG93fSB3aW4gVGhlIHdpbmRvdyBmb3Igd2hpY2ggd2UgcmVhZCB0aGUgYnJvd3NlciBkaW1lbnNpb25zLlxuICogQHBhcmFtIHs/e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gdmlld3BvcnRTaXplXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZGl0aW9uYWxEaW1lbnNpb25zKHdpbiwgdmlld3BvcnRTaXplKSB7XG4gIC8vIFNvbWUgYnJvd3NlcnMgdGhyb3cgZXJyb3JzIG9uIHNvbWUgb2YgdGhlc2UuXG4gIGxldCBzY3JlZW5YLCBzY3JlZW5ZLCBvdXRlcldpZHRoLCBvdXRlckhlaWdodCwgaW5uZXJXaWR0aCwgaW5uZXJIZWlnaHQ7XG4gIHRyeSB7XG4gICAgc2NyZWVuWCA9IHdpbi5zY3JlZW5YO1xuICAgIHNjcmVlblkgPSB3aW4uc2NyZWVuWTtcbiAgfSBjYXRjaCAoZSkge31cbiAgdHJ5IHtcbiAgICBvdXRlcldpZHRoID0gd2luLm91dGVyV2lkdGg7XG4gICAgb3V0ZXJIZWlnaHQgPSB3aW4ub3V0ZXJIZWlnaHQ7XG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHRyeSB7XG4gICAgaW5uZXJXaWR0aCA9IHZpZXdwb3J0U2l6ZS53aWR0aDtcbiAgICBpbm5lckhlaWdodCA9IHZpZXdwb3J0U2l6ZS5oZWlnaHQ7XG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHJldHVybiBbXG4gICAgd2luLnNjcmVlbkxlZnQsXG4gICAgd2luLnNjcmVlblRvcCxcbiAgICBzY3JlZW5YLFxuICAgIHNjcmVlblksXG4gICAgd2luLnNjcmVlbiA/IHdpbi5zY3JlZW4uYXZhaWxXaWR0aCA6IHVuZGVmaW5lZCxcbiAgICB3aW4uc2NyZWVuID8gd2luLnNjcmVlbi5hdmFpbFRvcCA6IHVuZGVmaW5lZCxcbiAgICBvdXRlcldpZHRoLFxuICAgIG91dGVySGVpZ2h0LFxuICAgIGlubmVyV2lkdGgsXG4gICAgaW5uZXJIZWlnaHQsXG4gIF0uam9pbigpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW1wLWFuYWx5dGljcyBjb25maWcgZm9yIGEgbmV3IENTSSB0cmlnZ2VyLlxuICogQHBhcmFtIHtzdHJpbmd9IG9uIFRoZSBuYW1lIG9mIHRoZSBhbmFseXRpY3MgdHJpZ2dlci5cbiAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz59IHBhcmFtcyBQYXJhbXMgdG8gYmUgaW5jbHVkZWQgb24gdGhlIHBpbmcuXG4gKiBAcmV0dXJuIHshSnNvbk9iamVjdH1cbiAqL1xuZnVuY3Rpb24gY3NpVHJpZ2dlcihvbiwgcGFyYW1zKSB7XG4gIHJldHVybiBkaWN0KHtcbiAgICAnb24nOiBvbixcbiAgICAncmVxdWVzdCc6ICdjc2knLFxuICAgICdzYW1wbGVTcGVjJzoge1xuICAgICAgLy8gUGluZ3MgYXJlIHNhbXBsZWQgb24gYSBwZXItcGFnZXZpZXcgYmFzaXMuIEEgcHJlZml4IGlzIGluY2x1ZGVkIGluIHRoZVxuICAgICAgLy8gc2FtcGxlT24gc3BlYyBzbyB0aGF0IHRoZSBoYXNoIGlzIG9ydGhvZ29uYWwgdG8gYW55IG90aGVyIHNhbXBsaW5nIGluXG4gICAgICAvLyBhbXAuXG4gICAgICAnc2FtcGxlT24nOiAnYTRhLWNzaS0ke3BhZ2VWaWV3SWR9JyxcbiAgICAgICd0aHJlc2hvbGQnOiAxLCAvLyAxJSBzYW1wbGVcbiAgICB9LFxuICAgICdzZWxlY3Rvcic6ICdhbXAtYWQnLFxuICAgICdzZWxlY3Rpb25NZXRob2QnOiAnY2xvc2VzdCcsXG4gICAgJ2V4dHJhVXJsUGFyYW1zJzogcGFyYW1zLFxuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFtcC1hbmFseXRpY3MgY29uZmlnIGZvciBHb29nbGUgYWRzIG5ldHdvcmsgaW1wbHMuXG4gKiBAcmV0dXJuIHshSnNvbk9iamVjdH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENzaUFtcEFuYWx5dGljc0NvbmZpZygpIHtcbiAgcmV0dXJuIGRpY3Qoe1xuICAgICdyZXF1ZXN0cyc6IHtcbiAgICAgICdjc2knOiAnaHR0cHM6Ly9jc2kuZ3N0YXRpYy5jb20vY3NpPycsXG4gICAgfSxcbiAgICAndHJhbnNwb3J0Jzogeyd4aHJwb3N0JzogZmFsc2V9LFxuICAgICd0cmlnZ2Vycyc6IHtcbiAgICAgICdhZFJlcXVlc3RTdGFydCc6IGNzaVRyaWdnZXIoJ2FkLXJlcXVlc3Qtc3RhcnQnLCB7XG4gICAgICAgIC8vIGFmcyA9PiBhZCBmZXRjaCBzdGFydFxuICAgICAgICAnbWV0LmE0YSc6ICdhZnNfbHZ0LiR7dmlld2VyTGFzdFZpc2libGVUaW1lfX5hZnMuJHt0aW1lfScsXG4gICAgICB9KSxcbiAgICAgICdhZFJlc3BvbnNlRW5kJzogY3NpVHJpZ2dlcignYWQtcmVzcG9uc2UtZW5kJywge1xuICAgICAgICAvLyBhZmUgPT4gYWQgZmV0Y2ggZW5kXG4gICAgICAgICdtZXQuYTRhJzogJ2FmZS4ke3RpbWV9JyxcbiAgICAgIH0pLFxuICAgICAgJ2FkUmVuZGVyU3RhcnQnOiBjc2lUcmlnZ2VyKCdhZC1yZW5kZXItc3RhcnQnLCB7XG4gICAgICAgIC8vIGFzdCA9PiBhZCBzY2hlZHVsZSB0aW1lXG4gICAgICAgIC8vIGFycyA9PiBhZCByZW5kZXIgc3RhcnRcbiAgICAgICAgJ21ldC5hNGEnOlxuICAgICAgICAgICdhc3QuJHtzY2hlZHVsZVRpbWV9fmFyc19sdnQuJHt2aWV3ZXJMYXN0VmlzaWJsZVRpbWV9fmFycy4ke3RpbWV9JyxcbiAgICAgICAgJ3FxaWQnOiAnJHtxcWlkfScsXG4gICAgICB9KSxcbiAgICAgICdhZElmcmFtZUxvYWRlZCc6IGNzaVRyaWdnZXIoJ2FkLWlmcmFtZS1sb2FkZWQnLCB7XG4gICAgICAgIC8vIGFpbCA9PiBhZCBpZnJhbWUgbG9hZGVkXG4gICAgICAgICdtZXQuYTRhJzogJ2FpbC4ke3RpbWV9JyxcbiAgICAgIH0pLFxuICAgIH0sXG4gICAgJ2V4dHJhVXJsUGFyYW1zJzoge1xuICAgICAgJ3MnOiAnYW1wYWQnLFxuICAgICAgJ2N0eCc6ICcyJyxcbiAgICAgICdjJzogJyR7Y29ycmVsYXRvcn0nLFxuICAgICAgJ3Nsb3RJZCc6ICcke3Nsb3RJZH0nLFxuICAgICAgLy8gVGltZSB0aGF0IHRoZSBiZWFjb24gd2FzIGFjdHVhbGx5IHNlbnQuIE5vdGUgdGhhdCB0aGVyZSBjYW4gYmUgZGVsYXlzXG4gICAgICAvLyBiZXR3ZWVuIHRoZSB0aW1lIGF0IHdoaWNoIHRoZSBldmVudCBpcyBmaXJlZCBhbmQgd2hlbiAke25vd01zfSBpc1xuICAgICAgLy8gZXZhbHVhdGVkIHdoZW4gdGhlIFVSTCBpcyBidWlsdCBieSBhbXAtYW5hbHl0aWNzLlxuICAgICAgJ3B1aWQnOiAnJHtyZXF1ZXN0Q291bnR9fiR7dGltZXN0YW1wfScsXG4gICAgfSxcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB2YXJpYWJsZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGFtcC1hbmFseXRpY3MgZXZlbnQgZm9yIEE0QS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhbmFseXRpY3NUcmlnZ2VyIFRoZSBuYW1lIG9mIHRoZSBhbmFseXRpY3MgdHJpZ2dlci5cbiAqIEBwYXJhbSB7IUFNUC5CYXNlRWxlbWVudH0gYTRhIFRoZSBBNEEgZWxlbWVudC5cbiAqIEBwYXJhbSB7P3N0cmluZ30gcXFpZCBUaGUgcXVlcnkgSUQgb3IgbnVsbCBpZiB0aGUgcXVlcnkgSUQgaGFzIG5vdCBiZWVuIHNldFxuICogICAgIHlldC5cbiAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3NpQW1wQW5hbHl0aWNzVmFyaWFibGVzKGFuYWx5dGljc1RyaWdnZXIsIGE0YSwgcXFpZCkge1xuICBjb25zdCB7d2lufSA9IGE0YTtcbiAgY29uc3QgYW1wZG9jID0gYTRhLmdldEFtcERvYygpO1xuICBjb25zdCBuYXZTdGFydCA9IGdldE5hdmlnYXRpb25UaW1pbmcod2luLCAnbmF2aWdhdGlvblN0YXJ0Jyk7XG4gIGNvbnN0IHZhcnMgPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoe1xuICAgICdjb3JyZWxhdG9yJzogZ2V0Q29ycmVsYXRvcih3aW4sIGFtcGRvYyksXG4gICAgJ3Nsb3RJZCc6IGE0YS5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbXAtc2xvdC1pbmRleCcpLFxuICAgICd2aWV3ZXJMYXN0VmlzaWJsZVRpbWUnOiBhbXBkb2MuZ2V0TGFzdFZpc2libGVUaW1lKCkgLSBuYXZTdGFydCxcbiAgfSk7XG4gIGlmIChxcWlkKSB7XG4gICAgdmFyc1sncXFpZCddID0gcXFpZDtcbiAgfVxuICBpZiAoYW5hbHl0aWNzVHJpZ2dlciA9PSAnYWQtcmVuZGVyLXN0YXJ0Jykge1xuICAgIHZhcnNbJ3NjaGVkdWxlVGltZSddID0gYTRhLmVsZW1lbnQubGF5b3V0U2NoZWR1bGVUaW1lIC0gbmF2U3RhcnQ7XG4gIH1cbiAgcmV0dXJuIHZhcnM7XG59XG5cbi8qKlxuICogRXh0cmFjdHMgY29uZmlndXJhdGlvbiB1c2VkIHRvIGJ1aWxkIGFtcC1hbmFseXRpY3MgZWxlbWVudCBmb3IgYWN0aXZlIHZpZXdcbiAqIGFuZCBiZWdpbiB0byByZW5kZXIuXG4gKlxuICogQHBhcmFtIHshLi4vLi4vLi4vZXh0ZW5zaW9ucy9hbXAtYTRhLzAuMS9hbXAtYTRhLkFtcEE0QX0gYTRhXG4gKiBAcGFyYW0geyFIZWFkZXJzfSByZXNwb25zZUhlYWRlcnNcbiAqICAgWEhSIHNlcnZpY2UgRmV0Y2hSZXNwb25zZUhlYWRlcnMgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc3BvbnNlXG4gKiAgIGhlYWRlcnMuXG4gKiBAcmV0dXJuIHs/SnNvbk9iamVjdH0gY29uZmlnIG9yIG51bGwgaWYgaW52YWxpZC9taXNzaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEFtcEFuYWx5dGljc0NvbmZpZyhhNGEsIHJlc3BvbnNlSGVhZGVycykge1xuICBpZiAoIXJlc3BvbnNlSGVhZGVycy5oYXMoQU1QX0FOQUxZVElDU19IRUFERVIpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBhbmFseXRpY3NDb25maWcgPSBwYXJzZUpzb24oXG4gICAgICByZXNwb25zZUhlYWRlcnMuZ2V0KEFNUF9BTkFMWVRJQ1NfSEVBREVSKVxuICAgICk7XG5cbiAgICBjb25zdCBhY1VybHMgPSBhbmFseXRpY3NDb25maWdbJ3VybCddO1xuICAgIGNvbnN0IGJ0clVybHMgPSBhbmFseXRpY3NDb25maWdbJ2J0clVybCddO1xuICAgIGlmIChcbiAgICAgIChhY1VybHMgJiYgIUFycmF5LmlzQXJyYXkoYWNVcmxzKSkgfHxcbiAgICAgIChidHJVcmxzICYmICFBcnJheS5pc0FycmF5KGJ0clVybHMpKVxuICAgICkge1xuICAgICAgZGV2KCkuZXJyb3IoXG4gICAgICAgICdBTVAtQTRBJyxcbiAgICAgICAgJ0ludmFsaWQgYW5hbHl0aWNzJyxcbiAgICAgICAgcmVzcG9uc2VIZWFkZXJzLmdldChBTVBfQU5BTFlUSUNTX0hFQURFUilcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IGhhc0FjdGl2ZVZpZXdSZXF1ZXN0cyA9IEFycmF5LmlzQXJyYXkoYWNVcmxzKSAmJiBhY1VybHMubGVuZ3RoO1xuICAgIGNvbnN0IGhhc0JlZ2luVG9SZW5kZXJSZXF1ZXN0cyA9IEFycmF5LmlzQXJyYXkoYnRyVXJscykgJiYgYnRyVXJscy5sZW5ndGg7XG4gICAgaWYgKCFoYXNBY3RpdmVWaWV3UmVxdWVzdHMgJiYgIWhhc0JlZ2luVG9SZW5kZXJSZXF1ZXN0cykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbmZpZyA9IGRpY3Qoe1xuICAgICAgJ3RyYW5zcG9ydCc6IHsnYmVhY29uJzogZmFsc2UsICd4aHJwb3N0JzogZmFsc2V9LFxuICAgICAgJ3JlcXVlc3RzJzoge30sXG4gICAgICAndHJpZ2dlcnMnOiB7fSxcbiAgICB9KTtcbiAgICBpZiAoaGFzQWN0aXZlVmlld1JlcXVlc3RzKSB7XG4gICAgICBnZW5lcmF0ZUFjdGl2ZVZpZXdSZXF1ZXN0KGNvbmZpZywgYWNVcmxzKTtcbiAgICB9XG4gICAgaWYgKGhhc0JlZ2luVG9SZW5kZXJSZXF1ZXN0cykge1xuICAgICAgZ2VuZXJhdGVCZWdpblRvUmVuZGVyUmVxdWVzdChjb25maWcsIGJ0clVybHMpO1xuICAgIH1cbiAgICByZXR1cm4gY29uZmlnO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBkZXYoKS5lcnJvcihcbiAgICAgICdBTVAtQTRBJyxcbiAgICAgICdJbnZhbGlkIGFuYWx5dGljcycsXG4gICAgICBlcnIsXG4gICAgICByZXNwb25zZUhlYWRlcnMuZ2V0KEFNUF9BTkFMWVRJQ1NfSEVBREVSKVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQHBhcmFtIHshSnNvbk9iamVjdH0gY29uZmlnXG4gKiBAcGFyYW0geyFBcnJheTxzdHJpbmc+fSB1cmxzXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQWN0aXZlVmlld1JlcXVlc3QoY29uZmlnLCB1cmxzKSB7XG4gIGNvbmZpZ1sndHJpZ2dlcnMnXVsnY29udGludW91c1Zpc2libGUnXSA9IGRpY3Qoe1xuICAgICdyZXF1ZXN0JzogW10sXG4gICAgJ29uJzogJ3Zpc2libGUnLFxuICAgICd2aXNpYmlsaXR5U3BlYyc6IHtcbiAgICAgICdzZWxlY3Rvcic6ICdhbXAtYWQnLFxuICAgICAgJ3NlbGVjdGlvbk1ldGhvZCc6ICdjbG9zZXN0JyxcbiAgICAgICd2aXNpYmxlUGVyY2VudGFnZU1pbic6IDUwLFxuICAgICAgJ2NvbnRpbnVvdXNUaW1lTWluJzogMTAwMCxcbiAgICB9LFxuICB9KTtcbiAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgdXJscy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgLy8gVE9ETzogRW5zdXJlIHVybCBpcyB2YWxpZCBhbmQgbm90IGZyZWVmb3JtIEpTP1xuICAgIGNvbmZpZ1sncmVxdWVzdHMnXVtgdmlzaWJpbGl0eSR7aWR4ICsgMX1gXSA9IGAke3VybHNbaWR4XX1gO1xuICAgIGNvbmZpZ1sndHJpZ2dlcnMnXVsnY29udGludW91c1Zpc2libGUnXVsncmVxdWVzdCddLnB1c2goXG4gICAgICBgdmlzaWJpbGl0eSR7aWR4ICsgMX1gXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZ1xuICogQHBhcmFtIHshQXJyYXk8c3RyaW5nPn0gdXJsc1xuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUJlZ2luVG9SZW5kZXJSZXF1ZXN0KGNvbmZpZywgdXJscykge1xuICBjb25maWdbJ3RyaWdnZXJzJ11bJ2JlZ2luVG9SZW5kZXInXSA9IGRpY3Qoe1xuICAgICdyZXF1ZXN0JzogW10sXG4gICAgJ29uJzogJ2luaS1sb2FkJyxcbiAgICAnc2VsZWN0b3InOiAnYW1wLWFkJyxcbiAgICAnc2VsZWN0aW9uTWV0aG9kJzogJ2Nsb3Nlc3QnLFxuICB9KTtcblxuICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCB1cmxzLmxlbmd0aDsgaWR4KyspIHtcbiAgICAvLyBUT0RPOiBFbnN1cmUgdXJsIGlzIHZhbGlkIGFuZCBub3QgZnJlZWZvcm0gSlM/XG4gICAgY29uZmlnWydyZXF1ZXN0cyddW2BidHIke2lkeCArIDF9YF0gPSBgJHt1cmxzW2lkeF19YDtcbiAgICBjb25maWdbJ3RyaWdnZXJzJ11bJ2JlZ2luVG9SZW5kZXInXVsncmVxdWVzdCddLnB1c2goYGJ0ciR7aWR4ICsgMX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIEFkZCBuZXcgZXhwZXJpbWVudCBJRHMgdG8gYSAocG9zc2libHkgZW1wdHkpIGV4aXN0aW5nIHNldCBvZiBleHBlcmltZW50IElEcy5cbiAqIFRoZSB7QGNvZGUgY3VycmVudElkU3RyaW5nfSBtYXkgYmUge0Bjb2RlIG51bGx9IG9yIHtAY29kZSAnJ30sIGJ1dCBpZiBpdCBpc1xuICogcG9wdWxhdGVkLCBpdCBtdXN0IGNvbnRhaW4gYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBpbnRlZ2VyIGV4cGVyaW1lbnQgSURzXG4gKiAocGVyIHtAY29kZSBwYXJzZUV4cGVyaW1lbnRJZHMoKX0pLiAgUmV0dXJucyB0aGUgbmV3IHNldCBvZiBJRHMsIGVuY29kZWRcbiAqIGFzIGEgY29tbWEtc2VwYXJhdGVkIGxpc3QuICBEb2VzIG5vdCBkZS1kdXBsaWNhdGUgSUQgZW50cmllcy5cbiAqXG4gKiBAcGFyYW0geyFBcnJheTxzdHJpbmc+fSBuZXdJZHMgSURzIHRvIG1lcmdlIGluLiBTaG91bGQgY29udGFpbiBzdHJpbmdpZmllZFxuICogICAgIGludGVnZXIgKGJhc2UgMTApIGV4cGVyaW1lbnQgSURzLlxuICogQHBhcmFtIHs/c3RyaW5nfSBjdXJyZW50SWRTdHJpbmcgIElmIHByZXNlbnQsIGEgc3RyaW5nIGNvbnRhaW5pbmcgYVxuICogICBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBpbnRlZ2VyIGV4cGVyaW1lbnQgSURzLlxuICogQHJldHVybiB7c3RyaW5nfSAgTmV3IGV4cGVyaW1lbnQgbGlzdCBzdHJpbmcsIGluY2x1ZGluZyBuZXdJZCBpZmYgaXQgaXNcbiAqICAgYSB2YWxpZCAoaW50ZWdlcikgZXhwZXJpbWVudCBJRC5cbiAqIEBzZWUgcGFyc2VFeHBlcmltZW50SWRzLCB2YWxpZGF0ZUV4cGVyaW1lbnRJZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlRXhwZXJpbWVudElkcyhuZXdJZHMsIGN1cnJlbnRJZFN0cmluZykge1xuICBjb25zdCBuZXdJZFN0cmluZyA9IG5ld0lkcy5maWx0ZXIoKG5ld0lkKSA9PiBOdW1iZXIobmV3SWQpKS5qb2luKCcsJyk7XG4gIGN1cnJlbnRJZFN0cmluZyA9IGN1cnJlbnRJZFN0cmluZyB8fCAnJztcbiAgcmV0dXJuIChcbiAgICBjdXJyZW50SWRTdHJpbmcgKyAoY3VycmVudElkU3RyaW5nICYmIG5ld0lkU3RyaW5nID8gJywnIDogJycpICsgbmV3SWRTdHJpbmdcbiAgKTtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBDU0kgc2lnbmFscyB0byB0aGUgZ2l2ZW4gYW1wLWFuYWx5dGljcyBjb25maWd1cmF0aW9uIG9iamVjdCwgb25lXG4gKiBmb3IgcmVuZGVyLXN0YXJ0LCBhbmQgb25lIGZvciBpbmktbG9hZC5cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudCBUaGUgYWQgc2xvdC5cbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZyBUaGUgb3JpZ2luYWwgY29uZmlnIG9iamVjdC5cbiAqIEBwYXJhbSB7P3N0cmluZ30gcXFpZFxuICogQHBhcmFtIHtib29sZWFufSBpc1ZlcmlmaWVkQW1wQ3JlYXRpdmVcbiAqIEByZXR1cm4gez9Kc29uT2JqZWN0fSBjb25maWcgb3IgbnVsbCBpZiBpbnZhbGlkL21pc3NpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRDc2lTaWduYWxzVG9BbXBBbmFseXRpY3NDb25maWcoXG4gIHdpbixcbiAgZWxlbWVudCxcbiAgY29uZmlnLFxuICBxcWlkLFxuICBpc1ZlcmlmaWVkQW1wQ3JlYXRpdmVcbikge1xuICAvLyBBZGQgQ1NJIHBpbmdiYWNrcy5cbiAgY29uc3QgY29ycmVsYXRvciA9IGdldENvcnJlbGF0b3Iod2luLCBlbGVtZW50KTtcbiAgY29uc3Qgc2xvdElkID0gTnVtYmVyKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWFtcC1zbG90LWluZGV4JykpO1xuICBjb25zdCBlaWRzID0gZW5jb2RlVVJJQ29tcG9uZW50KGVsZW1lbnQuZ2V0QXR0cmlidXRlKEVYUEVSSU1FTlRfQVRUUklCVVRFKSk7XG4gIGxldCBhZXhwID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoQU1QX0VYUEVSSU1FTlRfQVRUUklCVVRFKTtcbiAgaWYgKGFleHApIHtcbiAgICAvLyBhZXhwIFVSTCBwYXJhbSBpcyBzZXBhcmF0ZWQgYnkgYCFgLCBub3QgYCxgLlxuICAgIGFleHAgPSBhZXhwLnJlcGxhY2UoLywvZywgJyEnKTtcbiAgfVxuICBjb25zdCBhZFR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpO1xuICBjb25zdCBpbml0VGltZSA9IE51bWJlcihcbiAgICBnZXRUaW1pbmdEYXRhU3luYyh3aW4sICduYXZpZ2F0aW9uU3RhcnQnKSB8fCBEYXRlLm5vdygpXG4gICk7XG4gIGNvbnN0IGRlbHRhVGltZSA9IE1hdGgucm91bmQoXG4gICAgd2luLnBlcmZvcm1hbmNlICYmIHdpbi5wZXJmb3JtYW5jZS5ub3dcbiAgICAgID8gd2luLnBlcmZvcm1hbmNlLm5vdygpXG4gICAgICA6IERhdGUubm93KCkgLSBpbml0VGltZVxuICApO1xuICBjb25zdCBiYXNlQ3NpVXJsID1cbiAgICAnaHR0cHM6Ly9jc2kuZ3N0YXRpYy5jb20vY3NpP3M9YTRhJyArXG4gICAgYCZjPSR7Y29ycmVsYXRvcn0mc2xvdElkPSR7c2xvdElkfSZxcWlkLiR7c2xvdElkfT0ke3FxaWR9YCArXG4gICAgYCZkdD0ke2luaXRUaW1lfWAgK1xuICAgIChlaWRzICE9ICdudWxsJyA/IGAmZS4ke3Nsb3RJZH09JHtlaWRzfWAgOiAnJykgK1xuICAgIChhZXhwID8gYCZhZXhwPSR7YWV4cH1gIDogJycpICtcbiAgICBgJnJscz0ke2ludGVybmFsUnVudGltZVZlcnNpb24oKX0mYWR0LiR7c2xvdElkfT0ke2FkVHlwZX1gO1xuICBjb25zdCBpc0FtcFN1ZmZpeCA9IGlzVmVyaWZpZWRBbXBDcmVhdGl2ZSA/ICdGcmllbmRseScgOiAnQ3Jvc3NEb21haW4nO1xuICBjb25maWdbJ3RyaWdnZXJzJ11bJ2NvbnRpbnVvdXNWaXNpYmxlSW5pTG9hZCddID0ge1xuICAgICdvbic6ICdpbmktbG9hZCcsXG4gICAgJ3NlbGVjdG9yJzogJ2FtcC1hZCcsXG4gICAgJ3NlbGVjdGlvbk1ldGhvZCc6ICdjbG9zZXN0JyxcbiAgICAncmVxdWVzdCc6ICdpbmlMb2FkQ3NpJyxcbiAgfTtcbiAgY29uZmlnWyd0cmlnZ2VycyddWydjb250aW51b3VzVmlzaWJsZVJlbmRlclN0YXJ0J10gPSB7XG4gICAgJ29uJzogJ3JlbmRlci1zdGFydCcsXG4gICAgJ3NlbGVjdG9yJzogJ2FtcC1hZCcsXG4gICAgJ3NlbGVjdGlvbk1ldGhvZCc6ICdjbG9zZXN0JyxcbiAgICAncmVxdWVzdCc6ICdyZW5kZXJTdGFydENzaScsXG4gIH07XG4gIGNvbmZpZ1sncmVxdWVzdHMnXVsnaW5pTG9hZENzaSddID1cbiAgICBiYXNlQ3NpVXJsICsgYCZtZXQuYTRhLiR7c2xvdElkfT1pbmlMb2FkQ3NpJHtpc0FtcFN1ZmZpeH0uJHtkZWx0YVRpbWV9YDtcbiAgY29uZmlnWydyZXF1ZXN0cyddWydyZW5kZXJTdGFydENzaSddID1cbiAgICBiYXNlQ3NpVXJsICsgYCZtZXQuYTRhLiR7c2xvdElkfT1yZW5kZXJTdGFydENzaSR7aXNBbXBTdWZmaXh9LiR7ZGVsdGFUaW1lfWA7XG5cbiAgLy8gQWRkIENTSSBwaW5nIGZvciB2aXNpYmlsaXR5LlxuICBjb25maWdbJ3JlcXVlc3RzJ11bJ3Zpc2liaWxpdHlDc2knXSA9XG4gICAgYmFzZUNzaVVybCArIGAmbWV0LmE0YS4ke3Nsb3RJZH09dmlzaWJpbGl0eUNzaS4ke2RlbHRhVGltZX1gO1xuICBjb25maWdbJ3RyaWdnZXJzJ11bJ2NvbnRpbnVvdXNWaXNpYmxlJ11bJ3JlcXVlc3QnXS5wdXNoKCd2aXNpYmlsaXR5Q3NpJyk7XG4gIHJldHVybiBjb25maWc7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiB0d28tbGV0dGVyIGNvZGVzIHJlcHJlc2VudGluZyB0aGUgYW1wLWFkIGNvbnRhaW5lcnNcbiAqIGVuY2xvc2luZyB0aGUgZ2l2ZW4gYWQgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBhZEVsZW1lbnRcbiAqIEByZXR1cm4geyFBcnJheTxzdHJpbmc+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW5jbG9zaW5nQ29udGFpbmVyVHlwZXMoYWRFbGVtZW50KSB7XG4gIGNvbnN0IGNvbnRhaW5lclR5cGVTZXQgPSB7fTtcbiAgZm9yIChcbiAgICBsZXQgZWwgPSBhZEVsZW1lbnQucGFyZW50RWxlbWVudCwgY291bnRlciA9IDA7XG4gICAgZWwgJiYgY291bnRlciA8IDIwO1xuICAgIGVsID0gZWwucGFyZW50RWxlbWVudCwgY291bnRlcisrXG4gICkge1xuICAgIGNvbnN0IHRhZ05hbWUgPSBlbC50YWdOYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgaWYgKFZhbGlkQWRDb250YWluZXJUeXBlc1t0YWdOYW1lXSkge1xuICAgICAgY29udGFpbmVyVHlwZVNldFtWYWxpZEFkQ29udGFpbmVyVHlwZXNbdGFnTmFtZV1dID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbnRhaW5lclR5cGVTZXQpO1xufVxuXG4vKipcbiAqIEFwcGVuZHMgcGFyYW1ldGVyIHRvIGFkIHJlcXVlc3QgaW5kaWNhdGluZyBlcnJvciBzdGF0ZSBzbyBsb25nIGFzIGVycm9yXG4gKiBwYXJhbWV0ZXIgaXMgbm90IGFscmVhZHkgcHJlc2VudCBvciB1cmwgaGFzIGJlZW4gdHJ1bmNhdGVkLlxuICogQHBhcmFtIHtzdHJpbmd9IGFkVXJsIHVzZWQgZm9yIG5ldHdvcmsgcmVxdWVzdFxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtZXRlclZhbHVlIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJuIHtzdHJpbmd8dW5kZWZpbmVkfSBwb3RlbnRpYWxseSBtb2RpZmllZCB1cmwsIHVuZGVmaW5lZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF5YmVBcHBlbmRFcnJvclBhcmFtZXRlcihhZFVybCwgcGFyYW1ldGVyVmFsdWUpIHtcbiAgZGV2QXNzZXJ0KCEhYWRVcmwgJiYgISFwYXJhbWV0ZXJWYWx1ZSk7XG4gIC8vIEFkZCBwYXJhbWV0ZXIgaW5kaWNhdGluZyBlcnJvciBzbyBsb25nIGFzIHRoZSB1cmwgaGFzIG5vdCBhbHJlYWR5IGJlZW5cbiAgLy8gdHJ1bmNhdGVkIGFuZCBlcnJvciBwYXJhbWV0ZXIgaXMgbm90IGFscmVhZHkgcHJlc2VudC4gIE5vdGUgdGhhdCB3ZSBhc3N1bWVcbiAgLy8gdGhhdCBhZGRlZCwgZXJyb3IgcGFyYW1ldGVyIGxlbmd0aCB3aWxsIGJlIGxlc3MgdGhhbiB0cnVuY2F0aW9uIHBhcmFtZXRlclxuICAvLyBzbyBhZGRpbmcgd2lsbCBub3QgY2F1c2UgbGVuZ3RoIHRvIGV4Y2VlZCBtYXhpbXVtLlxuICBpZiAoXG4gICAgbmV3IFJlZ0V4cChcbiAgICAgIGBbP3wmXSgke2VuY29kZVVSSUNvbXBvbmVudChUUlVOQ0FUSU9OX1BBUkFNLm5hbWUpfT1gICtcbiAgICAgICAgYCR7ZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhUUlVOQ0FUSU9OX1BBUkFNLnZhbHVlKSl9fGFldD1bXiZdKikkYFxuICAgICkudGVzdChhZFVybClcbiAgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IG1vZGlmaWVkQWRVcmwgPSBhZFVybCArIGAmYWV0PSR7cGFyYW1ldGVyVmFsdWV9YDtcbiAgZGV2QXNzZXJ0KG1vZGlmaWVkQWRVcmwubGVuZ3RoIDw9IE1BWF9VUkxfTEVOR1RIKTtcbiAgcmV0dXJuIG1vZGlmaWVkQWRVcmw7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIG51bWVyaWNhbCBjb2RlIHJlcHJlc2VudGluZyB0aGUgYmluYXJ5IHR5cGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHJldHVybiB7P3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJpbmFyeVR5cGVOdW1lcmljYWxDb2RlKHR5cGUpIHtcbiAgcmV0dXJuIChcbiAgICB7XG4gICAgICAncHJvZHVjdGlvbic6ICcwJyxcbiAgICAgICdjb250cm9sJzogJzEnLFxuICAgICAgJ2V4cGVyaW1lbnRhbCc6ICcyJyxcbiAgICAgICdyYyc6ICczJyxcbiAgICAgICduaWdodGx5JzogJzQnLFxuICAgICAgJ25pZ2h0bHktY29udHJvbCc6ICc1JyxcbiAgICAgICdleHBlcmltZW50QSc6ICcxMCcsXG4gICAgICAnZXhwZXJpbWVudEInOiAnMTEnLFxuICAgICAgJ2V4cGVyaW1lbnRDJzogJzEyJyxcbiAgICAgICdub21vZCc6ICc0MicsXG4gICAgICAnbW9kJzogJzQzJyxcbiAgICB9W3R5cGVdIHx8IG51bGxcbiAgKTtcbn1cblxuLyoqIEBjb25zdCB7IVJlZ0V4cH0gKi9cbmNvbnN0IElERU5USVRZX0RPTUFJTl9SRUdFWFBfID0gL1xcLmdvb2dsZVxcLig/OmNvbT9cXC4pP1thLXpdezIsM30kLztcblxuLyoqIEB0eXBlZGVmIHt7XG4gICAgICB0b2tlbjogKHN0cmluZ3x1bmRlZmluZWQpLFxuICAgICAgamFyOiAoc3RyaW5nfHVuZGVmaW5lZCksXG4gICAgICBwdWNyZDogKHN0cmluZ3x1bmRlZmluZWQpLFxuICAgICAgZnJlc2hMaWZldGltZVNlY3M6IChudW1iZXJ8dW5kZWZpbmVkKSxcbiAgICAgIHZhbGlkTGlmZXRpbWVTZWNzOiAobnVtYmVyfHVuZGVmaW5lZCksXG4gICAgICBmZXRjaFRpbWVNczogKG51bWJlcnx1bmRlZmluZWQpXG4gICB9fSAqL1xuZXhwb3J0IGxldCBJZGVudGl0eVRva2VuO1xuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcERvY1xuICogQHBhcmFtIHs/c3RyaW5nfSBjb25zZW50UG9saWN5SWRcbiAqIEByZXR1cm4geyFQcm9taXNlPCFJZGVudGl0eVRva2VuPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldElkZW50aXR5VG9rZW4od2luLCBhbXBEb2MsIGNvbnNlbnRQb2xpY3lJZCkge1xuICAvLyBJZiBjb25maWd1cmVkIHRvIHVzZSBhbXAtY29uc2VudCwgZGVsYXkgcmVxdWVzdCB1bnRpbCBjb25zZW50IHN0YXRlIGlzXG4gIC8vIHJlc29sdmVkLlxuICB3aW5bJ2dvb2dfaWRlbnRpdHlfcHJvbSddID1cbiAgICB3aW5bJ2dvb2dfaWRlbnRpdHlfcHJvbSddIHx8XG4gICAgKGNvbnNlbnRQb2xpY3lJZFxuICAgICAgPyBnZXRDb25zZW50UG9saWN5U3RhdGUoYW1wRG9jLmdldEhlYWROb2RlKCksIGNvbnNlbnRQb2xpY3lJZClcbiAgICAgIDogUHJvbWlzZS5yZXNvbHZlKENPTlNFTlRfUE9MSUNZX1NUQVRFLlVOS05PV05fTk9UX1JFUVVJUkVEKVxuICAgICkudGhlbigoY29uc2VudFN0YXRlKSA9PlxuICAgICAgY29uc2VudFN0YXRlID09IENPTlNFTlRfUE9MSUNZX1NUQVRFLklOU1VGRklDSUVOVCB8fFxuICAgICAgY29uc2VudFN0YXRlID09IENPTlNFTlRfUE9MSUNZX1NUQVRFLlVOS05PV05cbiAgICAgICAgPyAvKiogQHR5cGUgeyFJZGVudGl0eVRva2VufSAqLyAoe30pXG4gICAgICAgIDogZXhlY3V0ZUlkZW50aXR5VG9rZW5GZXRjaCh3aW4sIGFtcERvYylcbiAgICApO1xuICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTwhSWRlbnRpdHlUb2tlbj59ICovICh3aW5bJ2dvb2dfaWRlbnRpdHlfcHJvbSddKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBEb2NcbiAqIEBwYXJhbSB7bnVtYmVyPX0gcmVkaXJlY3RzUmVtYWluaW5nIChkZWZhdWx0IDEpXG4gKiBAcGFyYW0ge3N0cmluZz19IGRvbWFpblxuICogQHBhcmFtIHtudW1iZXI9fSBzdGFydFRpbWVcbiAqIEByZXR1cm4geyFQcm9taXNlPCFJZGVudGl0eVRva2VuPn1cbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZUlkZW50aXR5VG9rZW5GZXRjaChcbiAgd2luLFxuICBhbXBEb2MsXG4gIHJlZGlyZWN0c1JlbWFpbmluZyA9IDEsXG4gIGRvbWFpbiA9IHVuZGVmaW5lZCxcbiAgc3RhcnRUaW1lID0gRGF0ZS5ub3coKVxuKSB7XG4gIGNvbnN0IHVybCA9IGdldElkZW50aXR5VG9rZW5SZXF1ZXN0VXJsKHdpbiwgYW1wRG9jLCBkb21haW4pO1xuICByZXR1cm4gU2VydmljZXMueGhyRm9yKHdpbilcbiAgICAuZmV0Y2hKc29uKHVybCwge1xuICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIGFtcENvcnM6IGZhbHNlLFxuICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgICB9KVxuICAgIC50aGVuKChyZXMpID0+IHJlcy5qc29uKCkpXG4gICAgLnRoZW4oKG9iaikgPT4ge1xuICAgICAgY29uc3QgdG9rZW4gPSBvYmpbJ25ld1Rva2VuJ107XG4gICAgICBjb25zdCBqYXIgPSBvYmpbJzFwX2phciddIHx8ICcnO1xuICAgICAgY29uc3QgcHVjcmQgPSBvYmpbJ3B1Y3JkJ10gfHwgJyc7XG4gICAgICBjb25zdCBmcmVzaExpZmV0aW1lU2VjcyA9IHBhcnNlSW50KG9ialsnZnJlc2hMaWZldGltZVNlY3MnXSB8fCAnJywgMTApO1xuICAgICAgY29uc3QgdmFsaWRMaWZldGltZVNlY3MgPSBwYXJzZUludChvYmpbJ3ZhbGlkTGlmZXRpbWVTZWNzJ10gfHwgJycsIDEwKTtcbiAgICAgIGNvbnN0IGFsdERvbWFpbiA9IG9ialsnYWx0RG9tYWluJ107XG4gICAgICBjb25zdCBmZXRjaFRpbWVNcyA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICBpZiAoSURFTlRJVFlfRE9NQUlOX1JFR0VYUF8udGVzdChhbHREb21haW4pKSB7XG4gICAgICAgIGlmICghcmVkaXJlY3RzUmVtYWluaW5nLS0pIHtcbiAgICAgICAgICAvLyBNYXggcmVkaXJlY3RzLCBsb2c/XG4gICAgICAgICAgcmV0dXJuIHtmZXRjaFRpbWVNc307XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4ZWN1dGVJZGVudGl0eVRva2VuRmV0Y2goXG4gICAgICAgICAgd2luLFxuICAgICAgICAgIGFtcERvYyxcbiAgICAgICAgICByZWRpcmVjdHNSZW1haW5pbmcsXG4gICAgICAgICAgYWx0RG9tYWluLFxuICAgICAgICAgIHN0YXJ0VGltZVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZnJlc2hMaWZldGltZVNlY3MgPiAwICYmXG4gICAgICAgIHZhbGlkTGlmZXRpbWVTZWNzID4gMCAmJlxuICAgICAgICB0eXBlb2YgdG9rZW4gPT0gJ3N0cmluZydcbiAgICAgICkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRva2VuLFxuICAgICAgICAgIGphcixcbiAgICAgICAgICBwdWNyZCxcbiAgICAgICAgICBmcmVzaExpZmV0aW1lU2VjcyxcbiAgICAgICAgICB2YWxpZExpZmV0aW1lU2VjcyxcbiAgICAgICAgICBmZXRjaFRpbWVNcyxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIHJldHVybmluZyBlbXB0eVxuICAgICAgcmV0dXJuIHtmZXRjaFRpbWVNc307XG4gICAgfSlcbiAgICAuY2F0Y2goKHVudXNlZEVycikgPT4ge1xuICAgICAgLy8gVE9ETyBsb2c/XG4gICAgICByZXR1cm4ge307XG4gICAgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wRG9jXG4gKiBAcGFyYW0ge3N0cmluZz19IGRvbWFpblxuICogQHJldHVybiB7c3RyaW5nfSB1cmxcbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWRlbnRpdHlUb2tlblJlcXVlc3RVcmwod2luLCBhbXBEb2MsIGRvbWFpbiA9IHVuZGVmaW5lZCkge1xuICBpZiAoIWRvbWFpbiAmJiB3aW4gIT0gd2luLnRvcCAmJiB3aW4ubG9jYXRpb24uYW5jZXN0b3JPcmlnaW5zKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IElERU5USVRZX0RPTUFJTl9SRUdFWFBfLmV4ZWMoXG4gICAgICB3aW4ubG9jYXRpb24uYW5jZXN0b3JPcmlnaW5zW3dpbi5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnMubGVuZ3RoIC0gMV1cbiAgICApO1xuICAgIGRvbWFpbiA9IChtYXRjaGVzICYmIG1hdGNoZXNbMF0pIHx8IHVuZGVmaW5lZDtcbiAgfVxuICBkb21haW4gPSBkb21haW4gfHwgJy5nb29nbGUuY29tJztcbiAgY29uc3QgY2Fub25pY2FsID0gZXh0cmFjdEhvc3QoXG4gICAgU2VydmljZXMuZG9jdW1lbnRJbmZvRm9yRG9jKGFtcERvYykuY2Fub25pY2FsVXJsXG4gICk7XG4gIHJldHVybiBgaHR0cHM6Ly9hZHNlcnZpY2Uke2RvbWFpbn0vYWRzaWQvaW50ZWdyYXRvci5qc29uP2RvbWFpbj0ke2Nhbm9uaWNhbH1gO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB3ZSBhcmUgcnVubmluZyBvbiB0aGUgQU1QIENETi5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDZG5Qcm94eSh3aW4pIHtcbiAgcmV0dXJuIENETl9QUk9YWV9SRUdFWFAudGVzdCh3aW4ubG9jYXRpb24ub3JpZ2luKTtcbn1cblxuLyoqXG4gKiBQb3B1bGF0ZXMgdGhlIGZpZWxkcyBvZiB0aGUgZ2l2ZW4gTmFtZWZyYW1lIGV4cGVyaW1lbnQgY29uZmlnIG9iamVjdC5cbiAqIEBwYXJhbSB7IUhlYWRlcnN9IGhlYWRlcnNcbiAqIEBwYXJhbSB7IU5hbWVmcmFtZUV4cGVyaW1lbnRDb25maWd9IG5hbWVmcmFtZUNvbmZpZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0TmFtZWZyYW1lRXhwZXJpbWVudENvbmZpZ3MoaGVhZGVycywgbmFtZWZyYW1lQ29uZmlnKSB7XG4gIGNvbnN0IG5hbWVmcmFtZUV4cGVyaW1lbnRIZWFkZXIgPSBoZWFkZXJzLmdldCgnYW1wLW5hbWVmcmFtZS1leHAnKTtcbiAgaWYgKG5hbWVmcmFtZUV4cGVyaW1lbnRIZWFkZXIpIHtcbiAgICBuYW1lZnJhbWVFeHBlcmltZW50SGVhZGVyLnNwbGl0KCc7JykuZm9yRWFjaCgoY29uZmlnKSA9PiB7XG4gICAgICBpZiAoY29uZmlnID09ICdpbnN0YW50TG9hZCcgfHwgY29uZmlnID09ICd3cml0ZUluQm9keScpIHtcbiAgICAgICAgbmFtZWZyYW1lQ29uZmlnW2NvbmZpZ10gPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRW51bSBmb3IgYnJvd3NlciBjYXBhYmlsaXRpZXMuIE5PVEU6IFNpbmNlIEpTIGlzIDMyLWJpdCwgZG8gbm90IGFkZCBhbnltb3JlXG4gKiB0aGFuIDMyIGNhcGFiaWxpdGllcyB0byB0aGlzIGVudW0uXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5jb25zdCBDYXBhYmlsaXR5ID0ge1xuICBTVkdfU1VQUE9SVEVEOiAxIDw8IDAsXG4gIFNBTkRCT1hJTkdfQUxMT1dfVE9QX05BVklHQVRJT05fQllfVVNFUl9BQ1RJVkFUSU9OX1NVUFBPUlRFRDogMSA8PCAxLFxuICBTQU5EQk9YSU5HX0FMTE9XX1BPUFVQU19UT19FU0NBUEVfU0FOREJPWF9TVVBQT1JURUQ6IDEgPDwgMixcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGJpdG1hcCByZXByZXNlbnRpbmcgd2hhdCBmZWF0dXJlcyBhcmUgc3VwcG9ydGVkIGJ5IHRoaXMgYnJvd3Nlci5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldEJyb3dzZXJDYXBhYmlsaXRpZXNCaXRtYXAod2luKSB7XG4gIGxldCBicm93c2VyQ2FwYWJpbGl0aWVzID0gMDtcbiAgY29uc3QgZG9jID0gd2luLmRvY3VtZW50O1xuICBpZiAod2luLlNWR0VsZW1lbnQgJiYgZG9jLmNyZWF0ZUVsZW1lbnROUykge1xuICAgIGJyb3dzZXJDYXBhYmlsaXRpZXMgfD0gQ2FwYWJpbGl0eS5TVkdfU1VQUE9SVEVEO1xuICB9XG4gIGNvbnN0IGlmcmFtZUVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICBpZiAoaWZyYW1lRWwuc2FuZGJveCAmJiBpZnJhbWVFbC5zYW5kYm94LnN1cHBvcnRzKSB7XG4gICAgaWYgKGlmcmFtZUVsLnNhbmRib3guc3VwcG9ydHMoJ2FsbG93LXRvcC1uYXZpZ2F0aW9uLWJ5LXVzZXItYWN0aXZhdGlvbicpKSB7XG4gICAgICBicm93c2VyQ2FwYWJpbGl0aWVzIHw9XG4gICAgICAgIENhcGFiaWxpdHkuU0FOREJPWElOR19BTExPV19UT1BfTkFWSUdBVElPTl9CWV9VU0VSX0FDVElWQVRJT05fU1VQUE9SVEVEO1xuICAgIH1cbiAgICBpZiAoaWZyYW1lRWwuc2FuZGJveC5zdXBwb3J0cygnYWxsb3ctcG9wdXBzLXRvLWVzY2FwZS1zYW5kYm94JykpIHtcbiAgICAgIGJyb3dzZXJDYXBhYmlsaXRpZXMgfD1cbiAgICAgICAgQ2FwYWJpbGl0eS5TQU5EQk9YSU5HX0FMTE9XX1BPUFVQU19UT19FU0NBUEVfU0FOREJPWF9TVVBQT1JURUQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBicm93c2VyQ2FwYWJpbGl0aWVzO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gZW51bSB2YWx1ZSByZXByZXNlbnRpbmcgdGhlIEFNUCBiaW5hcnkgdHlwZSwgb3IgbnVsbCBpZiB0aGlzIGlzIGFcbiAqIGNhbm9uaWNhbCBwYWdlLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4gez9zdHJpbmd9IFRoZSBiaW5hcnkgdHlwZSBlbnVtLlxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbXBSdW50aW1lVHlwZVBhcmFtZXRlcih3aW4pIHtcbiAgY29uc3QgYXJ0ID0gZ2V0QmluYXJ5VHlwZU51bWVyaWNhbENvZGUoZ2V0QmluYXJ5VHlwZSh3aW4pKTtcbiAgcmV0dXJuIGlzQ2RuUHJveHkod2luKSAmJiBhcnQgIT0gJzAnID8gYXJ0IDogbnVsbDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGBhbHdheXMtc2VydmUtbnBhYCBhdHRyaWJ1dGUgaXMgcHJlc2VudCBhbmQgdmFsaWRcbiAqIGJhc2VkIG9uIHRoZSBnZW9sb2NhdGlvbi5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFQcm9taXNlPGJvb2xlYW4+fVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2ZU5wYVByb21pc2UoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKCdhbHdheXMtc2VydmUtbnBhJykpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgfVxuICBjb25zdCBucGFTaWduYWwgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYWx3YXlzLXNlcnZlLW5wYScpO1xuICBpZiAobnBhU2lnbmFsID09ICcnKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbiAgfVxuICByZXR1cm4gU2VydmljZXMuZ2VvRm9yRG9jT3JOdWxsKGVsZW1lbnQpLnRoZW4oKGdlb1NlcnZpY2UpID0+IHtcbiAgICBpZiAoIWdlb1NlcnZpY2UpIHtcbiAgICAgIC8vIEVyciBvbiBzYWZlIHNpZGUgYW5kIHNpZ25hbCBmb3IgTlBBLlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNvbnN0IGxvY2F0aW9ucyA9IG5wYVNpZ25hbC5zcGxpdCgnLCcpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBnZW9Hcm91cCA9IGdlb1NlcnZpY2UuaXNJbkNvdW50cnlHcm91cChsb2NhdGlvbnNbaV0pO1xuICAgICAgaWYgKGdlb0dyb3VwID09PSBHRU9fSU5fR1JPVVAuSU4pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGdlb0dyb3VwID09PSBHRU9fSU5fR1JPVVAuTk9UX0RFRklORUQpIHtcbiAgICAgICAgdXNlcigpLndhcm4oJ0FNUC1BRCcsIGBHZW8gZ3JvdXAgXCIke2xvY2F0aW9uc1tpXX1cIiB3YXMgbm90IGRlZmluZWQuYCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE5vdCBpbiBhbnkgb2YgdGhlIGRlZmluZWQgZ2VvIGdyb3Vwcy5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/ads/google/a4a/utils.js