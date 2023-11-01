import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {DomFingerprint} from '#core/dom/fingerprint';
import {getPageLayoutBoxBlocking} from '#core/dom/layout/page-layout-box';
import * as mode from '#core/mode';
import {parseJson} from '#core/types/object/json';

import {getBinaryType, isExperimentOn, toggleExperiment} from '#experiments';

import {Services} from '#service';
import {getTimingDataSync} from '#service/variable-source';

import {dev, devAssert, user} from '#utils/log';

import {buildUrl} from './shared/url-builder';

import {GEO_IN_GROUP} from '../../../extensions/amp-geo/0.1/amp-geo-in-group';
import {getOrCreateAdCid} from '../../../src/ad-cid';
import {getMeasuredResources} from '../../../src/ini-load';
import {getMode} from '../../../src/mode';

/** @type {string}  */
const AMP_ANALYTICS_HEADER = 'X-AmpAnalytics';

/** @const {number} */
const MAX_URL_LENGTH = 15360;

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
 * See `VisibilityState_Enum` enum.
 * @const {!{[key: string]: string}}
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
 * Element attribute that stores Google ads experiment IDs.
 *
 * Note: This attribute should be used only for tracking experimental
 * implementations of AMP tags, e.g., by AMPHTML implementors.  It should not be
 * added by a publisher page.
 *
 * @const {string}
 * @visibleForTesting
 */
export const EXPERIMENT_ATTRIBUTE = 'data-experiment-id';

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
export const AMP_EXPERIMENT_ATTRIBUTE = 'data-amp-experiment-id';

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

/** @const {object} */
const CDN_PROXY_REGEXP =
  /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org((\/.*)|($))+/;

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
  return (
    (win['performance'] &&
      win['performance']['timing'] &&
      win['performance']['timing'][timingEvent]) ||
    0
  );
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
  return (
    supportsNativeCrypto(win) &&
    (!!isCdnProxy(win) || getMode(win).localDev || getMode(win).test)
  );
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
  return (
    (type == 'doubleclick' || type == 'adsense') &&
    isExperimentOn(win, 'a4aProfilingRate')
  );
}

/**
 * Has side-effect of incrementing ifi counter on window.
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {!Array<string>=} opt_experimentIds Any experiments IDs (in addition
 *     to those specified on the ad element) that should be included in the
 *     request.
 * @return {!{[key: string]: null|number|string}} block level parameters
 */
export function googleBlockParameters(a4a, opt_experimentIds) {
  const {element: adElement, win} = a4a;
  const slotRect = getPageLayoutBoxBlocking(adElement);
  const iframeDepth = iframeNestingDepth(win);
  const enclosingContainers = getEnclosingContainerTypes(adElement);
  if (
    a4a.uiHandler.isStickyAd() &&
    !enclosingContainers.includes(ValidAdContainerTypes['AMP-STICKY-AD'])
  ) {
    enclosingContainers.push(ValidAdContainerTypes['AMP-STICKY-AD']);
  }
  let eids = adElement.getAttribute(EXPERIMENT_ATTRIBUTE);
  if (opt_experimentIds) {
    eids = mergeExperimentIds(opt_experimentIds, eids);
  }
  const aexp = adElement.getAttribute(AMP_EXPERIMENT_ATTRIBUTE);
  return {
    'adf': DomFingerprint.generate(adElement),
    'nhd': iframeDepth,
    'eid': eids,
    'adx': Math.round(slotRect.left),
    'ady': Math.round(slotRect.top),
    'oid': '2',
    'act': enclosingContainers.length ? enclosingContainers.join() : null,
    // aexp URL param is separated by `!`, not `,`.
    'aexp': aexp ? aexp.replace(/,/g, '!') : null,
  };
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} type matching typing attribute.
 * @param {function(!Element):string} groupFn
 * @return {!Promise<!{[key: string]: !Array<!Promise<!../../../src/base-element.BaseElement}>>>}
 */
export function groupAmpAdsByType(ampdoc, type, groupFn) {
  // Look for amp-ad elements of correct type or those contained within
  // standard container type.  Note that display none containers will not be
  // included as they will never be measured.
  // TODO(keithwrightbos): what about slots that become measured due to removal
  // of display none (e.g. user resizes viewport and media selector makes
  // visible).
  const ampAdSelector = (r) =>
    r.element./*OK*/ querySelector(`amp-ad[type=${type}]`);
  return (
    getMeasuredResources(ampdoc, ampdoc.win, (r) => {
      const isAmpAdType =
        r.element.tagName == 'AMP-AD' && r.element.getAttribute('type') == type;
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
      .then((resources) =>
        Promise.all(
          resources.map((resource) => {
            if (resource.element.tagName == 'AMP-AD') {
              return resource.element;
            }
            // Must be container element so need to wait for child amp-ad to
            // be upgraded.
            return whenUpgradedToCustomElement(
              dev().assertElement(ampAdSelector(resource))
            );
          })
        )
      )
      // Group by networkId.
      .then((elements) =>
        elements.reduce((result, element) => {
          const groupId = groupFn(element);
          (result[groupId] || (result[groupId] = [])).push(element.getImpl());
          return result;
        }, {})
      )
  );
}

/**
 * @param {! ../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {number} startTime
 * @return {!Promise<!{[key: string]: null|number|string}>}
 */
export function googlePageParameters(a4a, startTime) {
  const {win} = a4a;
  const ampDoc = a4a.getAmpDoc();
  // Do not wait longer than 1 second to retrieve referrer to ensure
  // viewer integration issues do not cause ad requests to hang indefinitely.
  const referrerPromise = Services.timerFor(win)
    .timeoutPromise(1000, Services.viewerForDoc(ampDoc).getReferrerUrl())
    .catch(() => {
      dev().expectedError('AMP-A4A', 'Referrer timeout!');
      return '';
    });
  // Collect user agent hints info
  const uaHintsPromise = Services.timerFor(win)
    .timeoutPromise(1000, getUserAgentClientHintParameters(win))
    .catch(() => {
      dev().expectedError('AMP-A4A', 'UACH timeout!');
      return {};
    });
  // Set dom loading time to first visible if page started in prerender state
  // determined by truthy value for visibilityState param.
  const domLoading = a4a.getAmpDoc().getParam('visibilityState')
    ? a4a.getAmpDoc().getLastVisibleTime()
    : getNavigationTiming(win, 'domLoading');
  return Promise.all([
    getOrCreateAdCid(ampDoc, 'AMP_ECID_GOOGLE', '_ga'),
    referrerPromise,
    uaHintsPromise,
  ]).then((promiseResults) => {
    const clientId = promiseResults[0];
    const referrer = promiseResults[1];
    const uaDataValues = promiseResults[2];
    const {canonicalUrl, pageViewId} = Services.documentInfoForDoc(ampDoc);
    // Read by GPT for GA/GPT integration.
    win.gaGlobal = win.gaGlobal || {cid: clientId, hid: pageViewId};
    const {screen} = win;
    const viewport = Services.viewportForDoc(ampDoc);
    const viewportRect = viewport.getRect();
    const viewportSize = viewport.getSize();
    const visibilityState = ampDoc.getVisibilityState();
    return {
      'is_amp': a4a.isXhrAllowed()
        ? AmpAdImplementation.AMP_AD_XHR_TO_IFRAME_OR_AMP
        : AmpAdImplementation.AMP_AD_IFRAME_GET,
      'amp_v': mode.version(),
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
      'debug_experiment_id':
        (/(?:#|,)deid=([\d,]+)/i.exec(win.location.hash) || [])[1] || null,
      'url': canonicalUrl || null,
      'top': win != win.top ? topWindowUrlOrDomain(win) : null,
      'loc': win.location.href == canonicalUrl ? null : win.location.href,
      'ref': referrer || null,
      'bdt': domLoading ? startTime - domLoading : null,
      'uap': uaDataValues?.platform,
      'uapv': uaDataValues?.platformVersion,
      'uaa': uaDataValues?.architecture,
      'uam': uaDataValues?.model,
      'uafv': uaDataValues?.uaFullVersion,
      'uab': uaDataValues?.bitness,
      'uafvl': JSON.stringify(uaDataValues?.fullVersionList),
      'uaw': uaDataValues?.wow64,
    };
  });
}

/**
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {string} baseUrl
 * @param {number} startTime
 * @param {!{[key: string]: null|number|string}} parameters
 * @param {!Array<string>=} opt_experimentIds Any experiments IDs (in addition
 *     to those specified on the ad element) that should be included in the
 *     request.
 * @return {!Promise<string>}
 */
export function googleAdUrl(
  a4a,
  baseUrl,
  startTime,
  parameters,
  opt_experimentIds
) {
  // TODO: Maybe add checks in case these promises fail.
  const blockLevelParameters = googleBlockParameters(a4a, opt_experimentIds);
  return googlePageParameters(a4a, startTime).then((pageLevelParameters) => {
    Object.assign(parameters, blockLevelParameters, pageLevelParameters);
    return truncAndTimeUrl(baseUrl, parameters, startTime);
  });
}

/**
 * @param {string} baseUrl
 * @param {!{[key: string]: null|number|string}} parameters
 * @param {number} startTime
 * @return {string}
 */
export function truncAndTimeUrl(baseUrl, parameters, startTime) {
  return (
    buildUrl(baseUrl, parameters, MAX_URL_LENGTH - 10, TRUNCATION_PARAM) +
    '&dtd=' +
    elapsedTimeWithCeiling(Date.now(), startTime)
  );
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
    if (
      secondFromTop == win ||
      origin == ancestorOrigins[ancestorOrigins.length - 2]
    ) {
      return extractHost(secondFromTop./*OK*/ document.referrer);
    }
    return extractHost(topOrigin);
  } else {
    try {
      return win.top.location.hostname;
    } catch (e) {}
    const secondFromTop = secondWindowFromTop(win);
    try {
      return extractHost(secondFromTop./*OK*/ document.referrer);
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
    win.ampAdPageCorrelator = isExperimentOn(win, 'exp-new-correlator')
      ? Math.floor(4503599627370496 * Math.random())
      : makeCorrelator(
          Services.documentInfoForDoc(elementOrAmpDoc).pageViewId,
          opt_cid
        );
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
    return pageViewIdNumeric + (opt_clientId.replace(/\D/g, '') % 1e6) * 1e6;
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
  return [
    win.screenLeft,
    win.screenTop,
    screenX,
    screenY,
    win.screen ? win.screen.availWidth : undefined,
    win.screen ? win.screen.availTop : undefined,
    outerWidth,
    outerHeight,
    innerWidth,
    innerHeight,
  ].join();
}

/**
 * Returns amp-analytics config for a new CSI trigger.
 * @param {string} on The name of the analytics trigger.
 * @param {!{[key: string]: string}} params Params to be included on the ping.
 * @return {!JsonObject}
 */
function csiTrigger(on, params) {
  return {
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
  };
}

/**
 * Returns amp-analytics config for Google ads network impls.
 * @return {!JsonObject}
 */
export function getCsiAmpAnalyticsConfig() {
  return {
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
  };
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
  const {win} = a4a;
  const ampdoc = a4a.getAmpDoc();
  const navStart = getNavigationTiming(win, 'navigationStart');
  const vars = /** @type {!JsonObject} */ ({
    'correlator': getCorrelator(win, ampdoc),
    'slotId': a4a.element.getAttribute('data-amp-slot-index'),
    'viewerLastVisibleTime': ampdoc.getLastVisibleTime() - navStart,
  });
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
    const analyticsConfig = parseJson(
      responseHeaders.get(AMP_ANALYTICS_HEADER)
    );

    const acUrls = analyticsConfig['url'];
    const btrUrls = analyticsConfig['btrUrl'];
    if (
      (acUrls && !Array.isArray(acUrls)) ||
      (btrUrls && !Array.isArray(btrUrls))
    ) {
      dev().error(
        'AMP-A4A',
        'Invalid analytics',
        responseHeaders.get(AMP_ANALYTICS_HEADER)
      );
    }
    const hasActiveViewRequests = Array.isArray(acUrls) && acUrls.length;
    const hasBeginToRenderRequests = Array.isArray(btrUrls) && btrUrls.length;
    if (!hasActiveViewRequests && !hasBeginToRenderRequests) {
      return null;
    }
    const config = {
      'transport': {'beacon': false, 'xhrpost': false},
      'requests': {},
      'triggers': {},
    };
    if (hasActiveViewRequests) {
      generateActiveViewRequest(config, acUrls);
    }
    if (hasBeginToRenderRequests) {
      generateBeginToRenderRequest(config, btrUrls);
    }
    return config;
  } catch (err) {
    dev().error(
      'AMP-A4A',
      'Invalid analytics',
      err,
      responseHeaders.get(AMP_ANALYTICS_HEADER)
    );
  }
  return null;
}

/**
 * @param {!JsonObject} config
 * @param {!Array<string>} urls
 */
function generateActiveViewRequest(config, urls) {
  config['triggers']['continuousVisible'] = {
    'request': [],
    'on': 'visible',
    'visibilitySpec': {
      'selector': 'amp-ad',
      'selectionMethod': 'closest',
      'visiblePercentageMin': 50,
      'continuousTimeMin': 1000,
    },
  };
  for (let idx = 0; idx < urls.length; idx++) {
    // TODO: Ensure url is valid and not freeform JS?
    config['requests'][`visibility${idx + 1}`] = `${urls[idx]}`;
    config['triggers']['continuousVisible']['request'].push(
      `visibility${idx + 1}`
    );
  }
}

/**
 * @param {!JsonObject} config
 * @param {!Array<string>} urls
 */
function generateBeginToRenderRequest(config, urls) {
  config['triggers']['beginToRender'] = {
    'request': [],
    'on': 'ini-load',
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
  };

  for (let idx = 0; idx < urls.length; idx++) {
    // TODO: Ensure url is valid and not freeform JS?
    config['requests'][`btr${idx + 1}`] = `${urls[idx]}`;
    config['triggers']['beginToRender']['request'].push(`btr${idx + 1}`);
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
  const newIdString = newIds.filter((newId) => Number(newId)).join(',');
  currentIdString = currentIdString || '';
  return (
    currentIdString + (currentIdString && newIdString ? ',' : '') + newIdString
  );
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
  win,
  element,
  config,
  qqid,
  isVerifiedAmpCreative
) {
  // Add CSI pingbacks.
  const correlator = getCorrelator(win, element);
  const slotId = Number(element.getAttribute('data-amp-slot-index'));
  const eids = encodeURIComponent(element.getAttribute(EXPERIMENT_ATTRIBUTE));
  let aexp = element.getAttribute(AMP_EXPERIMENT_ATTRIBUTE);
  if (aexp) {
    // aexp URL param is separated by `!`, not `,`.
    aexp = aexp.replace(/,/g, '!');
  }
  const adType = element.getAttribute('type');
  const initTime = Number(
    getTimingDataSync(win, 'navigationStart') || Date.now()
  );
  const deltaTime = Math.round(
    win.performance && win.performance.now
      ? win.performance.now()
      : Date.now() - initTime
  );
  const baseCsiUrl =
    'https://csi.gstatic.com/csi?s=a4a' +
    `&c=${correlator}&slotId=${slotId}&qqid.${slotId}=${qqid}` +
    `&dt=${initTime}` +
    (eids != 'null' ? `&e.${slotId}=${eids}` : '') +
    (aexp ? `&aexp=${aexp}` : '') +
    `&rls=${mode.version()}&adt.${slotId}=${adType}`;
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
  config['requests']['iniLoadCsi'] =
    baseCsiUrl + `&met.a4a.${slotId}=iniLoadCsi${isAmpSuffix}.${deltaTime}`;
  config['requests']['renderStartCsi'] =
    baseCsiUrl + `&met.a4a.${slotId}=renderStartCsi${isAmpSuffix}.${deltaTime}`;

  // Add CSI ping for visibility.
  config['requests']['visibilityCsi'] =
    baseCsiUrl + `&met.a4a.${slotId}=visibilityCsi.${deltaTime}`;
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
  for (
    let el = adElement.parentElement, counter = 0;
    el && counter < 20;
    el = el.parentElement, counter++
  ) {
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
  if (
    new RegExp(
      `[?|&](${encodeURIComponent(TRUNCATION_PARAM.name)}=` +
        `${encodeURIComponent(String(TRUNCATION_PARAM.value))}|aet=[^&]*)$`
    ).test(adUrl)
  ) {
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
  return (
    {
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
      'mod': '43',
    }[type] || null
  );
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
    nameframeExperimentHeader.split(';').forEach((config) => {
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
const Capability_Enum = {
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
    browserCapabilities |= Capability_Enum.SVG_SUPPORTED;
  }
  const iframeEl = doc.createElement('iframe');
  if (iframeEl.sandbox && iframeEl.sandbox.supports) {
    if (iframeEl.sandbox.supports('allow-top-navigation-by-user-activation')) {
      browserCapabilities |=
        Capability_Enum.SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED;
    }
    if (iframeEl.sandbox.supports('allow-popups-to-escape-sandbox')) {
      browserCapabilities |=
        Capability_Enum.SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED;
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
  const npaSignal = element.getAttribute('always-serve-npa');
  if (npaSignal == '') {
    return Promise.resolve(true);
  }
  return Services.geoForDocOrNull(element).then((geoService) => {
    if (!geoService) {
      // Err on safe side and signal for NPA.
      return true;
    }
    const locations = npaSignal.split(',');
    for (let i = 0; i < locations.length; i++) {
      const geoGroup = geoService.isInCountryGroup(locations[i]);
      if (geoGroup === GEO_IN_GROUP.IN) {
        return true;
      } else if (geoGroup === GEO_IN_GROUP.NOT_DEFINED) {
        user().warn('AMP-AD', `Geo group "${locations[i]}" was not defined.`);
      }
    }
    // Not in any of the defined geo groups.
    return false;
  });
}

/**
 * This method retrieves the high-entropy portions of the user agent
 * information.
 * See https://wicg.github.io/ua-client-hints/#getHighEntropyValues
 * @param {!Window} win
 * @return {!Promise<!UADataValues|undefined>}
 */
function getUserAgentClientHintParameters(win) {
  if (
    !win.navigator ||
    !win.navigator.userAgentData ||
    typeof win.navigator.userAgentData.getHighEntropyValues !== 'function'
  ) {
    return Promise.resolve();
  }

  return win.navigator.userAgentData.getHighEntropyValues([
    'platform',
    'platformVersion',
    'architecture',
    'model',
    'uaFullVersion',
    'bitness',
  ]);
}
