import '#service/real-time-config/real-time-config-impl';
import {Deferred} from '#core/data-structures/promise';
import {domFingerprintPlain} from '#core/dom/fingerprint';
import {getPageLayoutBoxBlocking} from '#core/dom/layout/page-layout-box';
import * as mode from '#core/mode';
import {stringHash32} from '#core/types/string';
import {WindowInterface} from '#core/window/interface';

import {getBinaryType, isExperimentOn} from '#experiments';

import {Services} from '#service';

import {dev} from '#utils/log';

import {getFlexibleAdSlotData} from './flexible-ad-slot-utils';

import {getOrCreateAdCid} from '../../../src/ad-cid';
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {RefreshManager} from '../../amp-a4a/0.1/refresh-manager';

/** @type {string} */
const TAG = 'amp-ad-network-valueimpression-impl';

/** @const {string} */
const DOUBLECLICK_BASE_URL =
  'https://securepubads.g.doubleclick.net/gampad/ads';

/** @const {object} */
const CDN_PROXY_REGEXP =
  /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org((\/.*)|($))+/;

/** @enum {string} */
const AmpAdImplementation = {
  AMP_AD_XHR_TO_IFRAME: '2',
  AMP_AD_XHR_TO_IFRAME_OR_AMP: '3',
  AMP_AD_IFRAME_GET: '5',
};

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
 * See `VisibilityState_Enum` enum.
 * @const {!{[key: string]: string}}
 */
const visibilityStateCodes = {
  'visible': '1',
  'hidden': '2',
  'prerender': '3',
  'unloaded': '5',
};

/** @const {number} */
const MAX_URL_LENGTH = 15360;

/**
 * @const {!./shared/url-builder.QueryParameterDef}
 * @visibleForTesting
 */
const TRUNCATION_PARAM = {name: 'trunc', value: '1'};

/** @const {string} */
const RTC_SUCCESS = '2';

/** @final */
export class AmpAdNetworkValueimpressionImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @protected {!Deferred<string>} */
    this.getAdUrlDeferred = new Deferred();

    this.remoteSettings = null;

    /**
     * Set after the ad request is built.
     * @private {?FlexibleAdSlotDataTypeDef}
     */
    this.flexibleAdSlotData_ = null;

    /** @private {?RefreshManager} */
    this.refreshManager_ = null;

    /** @private {number} */
    this.ifi_ = 0;
  }

  /** @override */
  isValidElement() {
    return this.isAmpAdElement();
  }

  /** @override */
  tearDownSlot() {
    super.tearDownSlot();
    this.remoteSettings = null;
    this.getAdUrlDeferred = new Deferred();
  }

  /** @override */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    super.onCreativeRender(creativeMetaData);

    this.iframe.setAttribute(
      'width',
      Number(this.element.getAttribute('width'))
    );
    this.iframe.setAttribute(
      'height',
      Number(this.element.getAttribute('height'))
    );

    if (
      this.remoteSettings.refreshInterval !== false &&
      this.remoteSettings.refreshInterval > 0
    ) {
      this.refreshManager_ =
        this.refreshManager_ ||
        new RefreshManager(
          this,
          {
            'visiblePercentageMin': 50,
            'continuousTimeMin': 1,
          },
          this.remoteSettings.refreshInterval
        );
    }

    if (this.isRefreshing) {
      this.refreshManager_.initiateRefreshCycle();
      this.isRefreshing = false;
    }
  }

  /** @override */
  getCustomRealTimeConfigMacros_() {
    /**
     * This lists allowed attributes on the amp-ad element to be used as
     * macros for constructing the RTC URL. Add attributes here, in lowercase,
     * to make them available.
     */
    return {
      autoCollect: () => {
        const data = {
          'href': this.win.location.href,
          'canonical_url': Services.documentInfoForDoc(this.element)
            .canonicalUrl,
          'width': this.element.getAttribute('width'),
          'height': this.element.getAttribute('height'),
          'element_pos': getPageLayoutBoxBlocking(this.element).top,
          'scroll_top': Services.viewportForDoc(
            this.getAmpDoc()
          ).getScrollTop(),
          'page_height': Services.viewportForDoc(
            this.getAmpDoc()
          ).getScrollHeight(),
          'bkg_state': this.getAmpDoc().isVisible() ? 'visible' : 'hidden',
        };
        return Object.keys(data)
          .map((key) => key + '=' + data[key])
          .join('&');
      },
    };
  }

  /**
   * @param {string} size
   * @param {string} slot
   * @return {string} The ad unit hash key string.
   * @private
   */
  generateAdKey_(size, slot) {
    const {element} = this;
    const domFingerprint = domFingerprintPlain(element);
    const multiSize = element.getAttribute('data-multi-size') || '';
    const string = `${slot}:${size}:${multiSize}:${domFingerprint}`;
    return stringHash32(string);
  }

  /** @override */
  getAdUrl(opt_consentTuple, opt_rtcResponsesPromise, opt_serveNpaSignal) {
    const consentTuple = opt_consentTuple || {};
    const {consentString, gdprApplies} = consentTuple;
    const {win} = this;
    const ampDoc = this.getAmpDoc();

    opt_rtcResponsesPromise = opt_rtcResponsesPromise || Promise.resolve();
    let artc = [];
    let ati = [];
    let ard = [];
    const rtcParamsPromise = opt_rtcResponsesPromise.then((results) => {
      if (!results) {
        return null;
      }
      results.forEach((rtcResponse) => {
        if (rtcResponse) {
          artc.push(rtcResponse.rtcTime);
          ati.push(rtcResponse.error || RTC_SUCCESS);
          ard.push(rtcResponse.callout);
        }
      });

      artc = artc.join();
      ati = ati.join();
      ard = ard.join();

      if (results.length === 1 && results[0].response) {
        return results[0].response;
      }
      return null;
    });

    const referrerPromise = Services.timerFor(win)
      .timeoutPromise(1000, Services.viewerForDoc(ampDoc).getReferrerUrl())
      .catch(() => {
        dev().expectedError('AMP-A4A', 'Referrer timeout!');
        return '';
      });
    const startTime = Date.now();

    Promise.all([
      rtcParamsPromise,
      referrerPromise,
      getOrCreateAdCid(ampDoc, 'AMP_ECID_GOOGLE', '_ga'),
    ]).then((results) => {
      const clientId = results[2];
      const referrer = results[1];
      this.remoteSettings = results[0];
      if (!this.remoteSettings) {
        return this.getAdUrlDeferred.resolve('');
      }

      if (!this.remoteSettings.dfpSlot) {
        if (
          this.remoteSettings.targeting &&
          this.remoteSettings.targeting.hb_cache_id &&
          this.remoteSettings.targeting.hb_cache_host &&
          this.remoteSettings.targeting.hb_cache_path
        ) {
          return this.getAdUrlDeferred.resolve(
            'https://' +
              this.remoteSettings.targeting.hb_cache_host +
              this.remoteSettings.targeting.hb_cache_path +
              '?showAdm=1&uuid=' +
              this.remoteSettings.targeting.hb_cache_id
          );
        } else {
          return this.getAdUrlDeferred.resolve('');
          // return Promise.resolve('');
        }
      }

      const width = Number(this.element.getAttribute('width'));
      const height = Number(this.element.getAttribute('height'));
      const size = `${width}x${height}`;
      const adKey = this.generateAdKey_(size, this.remoteSettings.dfpSlot);

      let msz = null;
      let psz = null;
      let fws = null;
      this.flexibleAdSlotData_ = getFlexibleAdSlotData(
        this.win,
        this.element.parentElement
      );
      const {fwSignal, parentWidth, slotWidth} = this.flexibleAdSlotData_;
      // If slotWidth is -1, that means its width must be determined by its
      // parent container, and so should have the same value as parentWidth.
      if (this.uiHandler.isStickyAd()) {
        msz = '0x-1';
        psz = '0x-1';
      } else {
        msz = `${slotWidth == -1 ? parentWidth : slotWidth}x-1`;
        psz = `${parentWidth}x-1`;
      }
      fws = fwSignal ? fwSignal : '0';

      const {canonicalUrl, pageViewId} = Services.documentInfoForDoc(ampDoc);
      const domLoading = ampDoc.getParam('visibilityState')
        ? ampDoc.getLastVisibleTime()
        : getNavigationTiming(win, 'domLoading');
      // Read by GPT for GA/GPT integration.
      const {screen} = win;
      const viewport = Services.viewportForDoc(ampDoc);
      const viewportRect = viewport.getRect();
      const viewportSize = viewport.getSize();
      const visibilityState = ampDoc.getVisibilityState();
      win.gaGlobal = win.gaGlobal || {cid: clientId, hid: pageViewId};

      const targeting = {
        'vli_sf': 1,
        'vli_adslot': this.remoteSettings.zoneID,
        'vli_adtype': 'display',
      };
      Object.assign(targeting, this.remoteSettings.targeting);
      this.win['ampAdGoogleIfiCounter'] =
        this.win['ampAdGoogleIfiCounter'] || 1;
      this.ifi_ =
        (this.isRefreshing && this.ifi_) || this.win['ampAdGoogleIfiCounter']++;
      const parameters = {
        'iu': this.remoteSettings.dfpSlot,
        'adk': adKey,
        'sz': size,
        'output': 'html',
        'impl': 'ifr',
        'ifi': this.ifi_,
        'msz': msz,
        'psz': psz,
        'fws': fws,
        'scp': Object.keys(targeting)
          .map((key) => key + '=' + targeting[key])
          .join('&'),
        'gdfp_req': 1,
        'sfv': '1-0-37',
        'u_sd': WindowInterface.getDevicePixelRatio(),
        'artc': artc,
        'ati': ati,
        'ard': ard,
        'is_amp': this.isXhrAllowed()
          ? AmpAdImplementation.AMP_AD_XHR_TO_IFRAME_OR_AMP
          : AmpAdImplementation.AMP_AD_IFRAME_GET,
        'amp_v': mode.version(),
        'd_imp': 1,
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
        'url': canonicalUrl || null,
        'top': win != win.top ? topWindowUrlOrDomain(win, referrer) : null,
        'loc': win.location.href == canonicalUrl ? null : win.location.href,
        'ref': referrer || null,
        'bdt': domLoading ? startTime - domLoading : null,
        'dtd': elapsedTimeWithCeiling(Date.now(), startTime),
        'gdpr': gdprApplies === true ? '1' : gdprApplies === false ? '0' : null,
        'gdpr_consent': consentString,
      };
      const adUrl = buildUrl(
        DOUBLECLICK_BASE_URL,
        parameters,
        MAX_URL_LENGTH - 10,
        TRUNCATION_PARAM
      );
      this.getAdUrlDeferred.resolve(adUrl);
    });
    return this.getAdUrlDeferred.promise;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkValueimpressionImpl);
});

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
 * Returns an enum value representing the AMP binary type, or null if this is a
 * canonical page.
 * @param {!Window} win
 * @return {?string} The binary type enum.
 * @visibleForTesting
 */
function getAmpRuntimeTypeParameter(win) {
  const art = getBinaryTypeNumericalCode(getBinaryType(win));
  return isCdnProxy(win) && art != '0' ? art : null;
}

/**
 * Returns a numerical code representing the binary type.
 * @param {string} type
 * @return {?string}
 */
function getBinaryTypeNumericalCode(type) {
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
function isCdnProxy(win) {
  return CDN_PROXY_REGEXP.test(win.location.origin);
}

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
 * Builds a URL from query parameters, truncating to a maximum length if
 * necessary.
 * @param {string} baseUrl scheme, domain, and path for the URL.
 * @param {!{[key: string]: string|number|null}} queryParams query parameters for
 *     the URL.
 * @param {number} maxLength length to truncate the URL to if necessary.
 * @param {?QueryParameterDef=} opt_truncationQueryParam query parameter to
 *     append to the URL iff any query parameters were truncated.
 * @return {string} the fully constructed URL.
 */
function buildUrl(baseUrl, queryParams, maxLength, opt_truncationQueryParam) {
  const encodedParams = [];
  const encodedTruncationParam =
    opt_truncationQueryParam &&
    !(
      opt_truncationQueryParam.value == null ||
      opt_truncationQueryParam.value === ''
    )
      ? encodeURIComponent(opt_truncationQueryParam.name) +
        '=' +
        encodeURIComponent(String(opt_truncationQueryParam.value))
      : null;
  let capacity = maxLength - baseUrl.length;
  if (encodedTruncationParam) {
    capacity -= encodedTruncationParam.length + 1;
  }
  const keys = Object.keys(queryParams);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = queryParams[key];
    if (value == null || value === '') {
      continue;
    }
    const encodedNameAndSep = encodeURIComponent(key) + '=';
    const encodedValue = encodeURIComponent(String(value));
    const fullLength = encodedNameAndSep.length + encodedValue.length + 1;
    if (fullLength > capacity) {
      const truncatedValue = encodedValue
        .substr(0, capacity - encodedNameAndSep.length - 1)
        // Don't end with a partially truncated escape sequence
        .replace(/%\w?$/, '');
      if (truncatedValue) {
        encodedParams.push(encodedNameAndSep + truncatedValue);
      }
      if (encodedTruncationParam) {
        encodedParams.push(encodedTruncationParam);
      }
      break;
    }
    encodedParams.push(encodedNameAndSep + encodedValue);
    capacity -= fullLength;
  }
  if (!encodedParams.length) {
    return baseUrl;
  }
  return baseUrl + '?' + encodedParams.join('&');
}

/**
 * `nodeOrDoc` must be passed for correct behavior in shadow AMP (PWA) case.
 * @param {!Window} win
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string=} opt_cid
 * @return {number} The correlator.
 */
function getCorrelator(win, elementOrAmpDoc, opt_cid) {
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
 * @param {string} url
 * @return {string} hostname portion of url
 * @visibleForTesting
 */
function extractHost(url) {
  return (/^(?:https?:\/\/)?([^\/\?:]+)/i.exec(url) || [])[1] || url;
}

/**
 * @param {!Window} win
 * @param {string} referrer
 * @return {?string}
 */
function topWindowUrlOrDomain(win, referrer) {
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
      return extractHost(referrer);
    }
    return extractHost(topOrigin);
  } else {
    try {
      return win.top.location.hostname;
    } catch (e) {}
    try {
      return extractHost(referrer);
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
  return secondFromTop;
}
