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

// Because AdSense and DoubleClick are both operated by Google and their A4A
// implementations share some behavior in common, part of the logic for this
// implementation is located in the ads/google/a4a directory rather than here.
// Most other ad networks will want to put their A4A code entirely in the
// extensions/amp-ad-network-${NETWORK_NAME}-impl directory.

import '../../amp-a4a/0.1/real-time-config-manager';
import {
  AmpA4A,
  DEFAULT_SAFEFRAME_VERSION,
  XORIGIN_MODE,
  assignAdUrlToError,
} from '../../amp-a4a/0.1/amp-a4a';
import {
  AmpAnalyticsConfigDef,
  QQID_HEADER,
  ValidAdContainerTypes,
  addCsiSignalsToAmpAnalyticsConfig,
  extractAmpAnalyticsConfig,
  getCsiAmpAnalyticsConfig,
  getCsiAmpAnalyticsVariables,
  getEnclosingContainerTypes,
  getIdentityToken,
  googleAdUrl,
  googleBlockParameters,
  googlePageParameters,
  groupAmpAdsByType,
  isCdnProxy,
  isReportingEnabled,
  maybeAppendErrorParameter,
  truncAndTimeUrl,
} from '../../../ads/google/a4a/utils';
import {CONSENT_POLICY_STATE} from '../../../src/consent-state';
import {Deferred} from '../../../src/utils/promise';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Navigation} from '../../../src/service/navigation';
import {RTC_VENDORS} from '../../amp-a4a/0.1/callout-vendors';
import {
  RefreshManager, // eslint-disable-line no-unused-vars
  getRefreshManager,
} from '../../amp-a4a/0.1/refresh-manager';
import {SafeframeHostApi} from './safeframe-host';
import {Services} from '../../../src/services';
import {
  TFCD,
  constructSRABlockParameters,
  serializeTargeting,
  sraBlockCallbackHandler,
} from './sra-utils';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {deepMerge, dict} from '../../../src/utils/object';
import {dev, user} from '../../../src/log';
import {domFingerprintPlain} from '../../../src/utils/dom-fingerprint';
import {getMode} from '../../../src/mode';
import {getMultiSizeDimensions} from '../../../ads/google/utils';
import {getOrCreateAdCid} from '../../../src/ad-cid';
import {
  incrementLoadingAds,
  is3pThrottled,
  waitFor3pThrottle,
} from '../../amp-ad/0.1/concurrent-load';
import {insertAnalyticsElement} from '../../../src/extension-analytics';
import {isCancellation} from '../../../src/error';
import {isExperimentOn} from '../../../src/experiments';
import {
  isInManualExperiment,
} from '../../../ads/google/a4a/traffic-experiments';
import {isSecureUrlDeprecated, parseQueryString} from '../../../src/url';
import {
  lineDelimitedStreamer,
  metaJsonCreativeGrouper,
} from '../../../ads/google/a4a/line-delimited-response-handler';
import {randomlySelectUnsetExperiments} from '../../../src/experiments';
import {setStyles} from '../../../src/style';
import {stringHash32} from '../../../src/string';
import {tryParseJson} from '../../../src/json';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

/** @const {string} */
const DOUBLECLICK_BASE_URL =
    'https://securepubads.g.doubleclick.net/gampad/ads';

/** @const {string} */
const RTC_SUCCESS = '2';

/** @const {string} */
const DOUBLECLICK_SRA_EXP = 'doubleclickSraExp';

/** @const @enum{string} */
const DOUBLECLICK_SRA_EXP_BRANCHES = {
  SRA_CONTROL: '117152666',
  SRA: '117152667',
  SRA_NO_RECOVER: '21062235',
};

/**
 * Map of pageview tokens to the instances they belong to.
 * @private {!Object<string, !AmpAdNetworkDoubleclickImpl>}
 */
let tokensToInstances = {};

/** @private {?Promise} */
let sraRequests = null;

/** @typedef {{
      adUrl: !Promise<string>,
      lineItemId: string,
      creativeId: string,
      slotId: string,
      slotIndex: string,
    }} */
let TroubleshootDataDef;

/** @private {?JsonObject} */
let windowLocationQueryParameters;

/**
 * @typedef
 * {({width: number, height: number}|../../../src/layout-rect.LayoutRectDef)}
 */
let LayoutRectOrDimsDef;

/** @final */
export class AmpAdNetworkDoubleclickImpl extends AmpA4A {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /**
     * Config to generate amp-analytics element for active view reporting.
     * @type {?JsonObject}
     * @private
     */
    this.ampAnalyticsConfig_ = null;

    /** @private {!../../../src/service/extensions-impl.Extensions} */
    this.extensions_ = Services.extensionsFor(this.win);

    /** @private {?string} */
    this.qqid_ = null;

    /** @private {?LayoutRectOrDimsDef} */
    this.initialSize_ = null;

    /** @type {?string} */
    this.parameterSize = null;

    /** @private {?{width: number, height: number}} */
    this.returnedSize_ = null;

    /** @private {?Element} */
    this.ampAnalyticsElement_ = null;

    /** @type {?Object<string,*>}*/
    this.jsonTargeting = null;

    /** @type {number} */
    this.adKey = 0;

    /** @type {!Array<string>} */
    this.experimentIds = [];

    /** @protected {boolean} */
    this.useSra = false;

    /** @protected {!Deferred<?../../../src/utils/xhr-utils.FetchResponse>} */
    this.sraDeferred = new Deferred();

    /** @private {?RefreshManager} */
    this.refreshManager_ = null;

    /** @private {number} */
    this.refreshCount_ = 0;

    /** @private {number} */
    this.ifi_ = 0;

    /** @private {boolean} */
    this.isFluidRequest_ = false;

    /** @private {?string} */
    this.fluidImpressionUrl_ = null;

    /** @private {?Promise<!../../../ads/google/a4a/utils.IdentityToken>} */
    this.identityTokenPromise_ = null;

    /** @type {?../../../ads/google/a4a/utils.IdentityToken} */
    this.identityToken = null;

    /** @private {!TroubleshootDataDef} */
    this.troubleshootData_ = /** @type {!TroubleshootDataDef} */ ({});

    /**
     * @private {?boolean} whether preferential rendered AMP creative, null
     * indicates no creative render.
     */
    this.isAmpCreative_ = null;

    /** @private {boolean} */
    this.isIdleRender_ = false;

    /** @private {?./safeframe-host.SafeframeHostApi} */
    this.safeframeApi_ = null;

    /** @type {boolean} whether safeframe forced via tag */
    this.forceSafeframe = false;
    if ('forceSafeframe' in this.element.dataset) {
      if (!/^(1|(true))$/i.test(this.element.dataset['forceSafeframe'])) {
        user().warn(TAG, 'Ignoring invalid data-force-safeframe attribute: ' +
            this.element.dataset['forceSafeframe']);
      } else {
        this.forceSafeframe = true;
      }
    }

    /** @protected {?CONSENT_POLICY_STATE} */
    this.consentState = null;

    /** @protected {!Deferred<string>} */
    this.getAdUrlDeferred = new Deferred();
  }

  /**
   * @return {number|boolean} render on idle configuration with false
   *    indicating disabled.
   * @private
   */
  getIdleRenderEnabled_() {
    if (this.isIdleRender_) {
      return this.isIdleRender_;
    }
    // Disable if publisher has indicated a non-default loading strategy.
    if (this.element.getAttribute('data-loading-strategy')) {
      return false;
    }
    const expVal = this.postAdResponseExperimentFeatures['render-idle-vp'];
    const vpRange = parseInt(expVal, 10);
    if (expVal && isNaN(vpRange)) {
      // holdback branch sends non-numeric value.
      return false;
    }
    return vpRange || 12;
  }

  /** @override */
  idleRenderOutsideViewport() {
    const vpRange = this.getIdleRenderEnabled_();
    if (vpRange === false) {
      return vpRange;
    }
    this.isIdleRender_ = true;
    // NOTE(keithwrightbos): handle race condition where previous
    // idleRenderOutsideViewport marked slot as idle render despite never
    // being schedule due to being beyond viewport max offset.  If slot
    // comes within standard outside viewport range, then ensure throttling
    // will not be applied.
    this.getResource().whenWithinViewport(this.renderOutsideViewport()).then(
        () => this.isIdleRender_ = false);
    return vpRange;
  }

  /** @override */
  isLayoutSupported(layout) {
    this.isFluidRequest_ = layout == Layout.FLUID;
    return this.isFluidRequest_ || isLayoutSizeDefined(layout);
  }

  /** @override */
  isValidElement() {
    return this.isAmpAdElement();
  }

  /**
   * Executes page level experiment diversion and pushes any experiment IDs
   * onto this.experimentIds.
   * @visibleForTesting
   */
  setPageLevelExperiments() {
    if (!isCdnProxy(this.win) && !isExperimentOn(
        this.win, 'expDfpInvOrigDeprecated')) {
      this.experimentIds.push('21060933');
    }
    const experimentInfoMap =
    /** @type {!Object<string,
        !../../../src/experiments.ExperimentInfo>} */ ({
        // Only select into SRA experiments if SRA not already explicitly
        // enabled and refresh is not being used by any slot.
        [DOUBLECLICK_SRA_EXP]: {
          isTrafficEligible: () => !this.win.document./*OK*/querySelector(
              'meta[name=amp-ad-enable-refresh], ' +
              'amp-ad[type=doubleclick][data-enable-refresh], ' +
              'meta[name=amp-ad-doubleclick-sra]'),
          branches: Object.keys(DOUBLECLICK_SRA_EXP_BRANCHES).map(
              key => DOUBLECLICK_SRA_EXP_BRANCHES[key]),
        },
      });
    const setExps = this.randomlySelectUnsetExperiments_(experimentInfoMap);
    Object.keys(setExps).forEach(expName =>
      setExps[expName] && this.experimentIds.push(setExps[expName]));
  }

  /**
   * For easier unit testing.
   * @param {!Object<string, !../../../src/experiments.ExperimentInfo>} experimentInfoMap
   * @return {!Object<string, string>}
   */
  randomlySelectUnsetExperiments_(experimentInfoMap) {
    return randomlySelectUnsetExperiments(this.win, experimentInfoMap);
  }

  /** @private */
  maybeDeprecationWarn_() {
    const warnDeprecation = feature => user().warn(
        TAG, `${feature} is no longer supported for DoubleClick.` +
          'Please refer to ' +
          'https://github.com/ampproject/amphtml/issues/11834 ' +
          'for more information');
    const usdrd = 'useSameDomainRenderingUntilDeprecated';
    const hasUSDRD = usdrd in this.element.dataset ||
          (tryParseJson(this.element.getAttribute('json')) || {})[usdrd];
    if (hasUSDRD) {
      warnDeprecation(usdrd);
    }
    const useRemoteHtml =
      !!this.win.document.querySelector('meta[name=amp-3p-iframe-src]');
    if (useRemoteHtml) {
      warnDeprecation('remote.html');
    }
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.maybeDeprecationWarn_();
    this.setPageLevelExperiments();
    this.useSra = (getMode().localDev && /(\?|&)force_sra=true(&|$)/.test(
        this.win.location.search)) ||
        !!this.win.document.querySelector(
            'meta[name=amp-ad-doubleclick-sra]') ||
        !!this.experimentIds.filter(exp =>
          exp == DOUBLECLICK_SRA_EXP_BRANCHES.SRA ||
          exp == DOUBLECLICK_SRA_EXP_BRANCHES.SRA_NO_RECOVER).length;
    this.identityTokenPromise_ = Services.viewerForDoc(this.getAmpDoc())
        .whenFirstVisible()
        .then(() => getIdentityToken(this.win, this.getAmpDoc()));
    this.troubleshootData_.slotId = this.element.getAttribute('data-slot');
    this.troubleshootData_.slotIndex =
        this.element.getAttribute('data-amp-slot-index');
  }

  /** @override */
  shouldPreferentialRenderWithoutCrypto() {
    dev().assert(!isCdnProxy(this.win));
    return true;
  }

  /**
   * @param {?CONSENT_POLICY_STATE} consentState
   * @param {!Array<!AmpAdNetworkDoubleclickImpl>=} instances
   * @return {!Object<string,string|boolean|number>}
   * @visibleForTesting
   */
  getPageParameters(consentState, instances) {
    instances = instances || [this];
    return {
      'npa': consentState == CONSENT_POLICY_STATE.INSUFFICIENT ||
          consentState == CONSENT_POLICY_STATE.UNKNOWN ? 1 : null,
      'gdfp_req': '1',
      'sfv': DEFAULT_SAFEFRAME_VERSION,
      'u_sd': this.win.devicePixelRatio,
      'gct': this.getLocationQueryParameterValue('google_preview') || null,
      'psts': getPageviewStateTokensForAdRequest(instances),
    };
  }

  /**
   * Constructs block-level url parameters with side effect of setting
   * size_, jsonTargeting, and adKey_ fields.
   * @return {!Object<string,string|boolean|number>}
   */
  getBlockParameters_() {
    dev().assert(this.initialSize_);
    dev().assert(this.jsonTargeting);
    const tfcd = this.jsonTargeting && this.jsonTargeting[TFCD];
    this.win['ampAdGoogleIfiCounter'] = this.win['ampAdGoogleIfiCounter'] || 1;
    this.ifi_ = (this.isRefreshing && this.ifi_) ||
        this.win['ampAdGoogleIfiCounter']++;
    const pageLayoutBox = this.isSinglePageStoryAd ?
      this.element.getPageLayoutBox() : null;
    return Object.assign({
      'iu': this.element.getAttribute('data-slot'),
      'co': this.jsonTargeting &&
          this.jsonTargeting['cookieOptOut'] ? '1' : null,
      'adk': this.adKey,
      'sz': this.isSinglePageStoryAd ? '1x1' : this.parameterSize,
      'output': 'html',
      'impl': 'ifr',
      'tfcd': tfcd == undefined ? null : tfcd,
      'adtest': isInManualExperiment(this.element) ? 'on' : null,
      'ifi': this.ifi_,
      'rc': this.refreshCount_ || null,
      'frc': Number(this.fromResumeCallback) || null,
      'fluid': this.isFluidRequest_ ? 'height' : null,
      'fsf': this.forceSafeframe ? '1' : null,
      'scp': serializeTargeting(
          (this.jsonTargeting && this.jsonTargeting['targeting']) || null,
          (this.jsonTargeting &&
            this.jsonTargeting['categoryExclusions']) || null),
      'spsa': this.isSinglePageStoryAd ?
        `${pageLayoutBox.width}x${pageLayoutBox.height}` : null,
    }, googleBlockParameters(this));
  }

  /**
   * Populate's block-level state for ad URL construction.
   * @param {?CONSENT_POLICY_STATE} consentState
   * @visibleForTesting
   */
  populateAdUrlState(consentState) {
    this.consentState = consentState;
    // Allow for pub to override height/width via override attribute.
    const width = Number(this.element.getAttribute('data-override-width')) ||
      Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('data-override-height')) ||
      Number(this.element.getAttribute('height'));
    this.initialSize_ = this.isFluidRequest_ ? {width: 0, height: 0} :
      (width && height ?
        // width/height could be 'auto' in which case we fallback to measured.
        {width, height} : this.getIntersectionElementLayoutBox());
    this.jsonTargeting =
      tryParseJson(this.element.getAttribute('json')) || {};
    this.adKey = this.generateAdKey_(
        `${this.initialSize_.width}x${this.initialSize_.height}`);
    this.parameterSize = this.isFluidRequest_ ?
      '320x50' : `${this.initialSize_.width}x${this.initialSize_.height}`;
    const multiSizeDataStr = this.element.getAttribute('data-multi-size');
    if (multiSizeDataStr) {
      if (this.element.getAttribute('layout') == 'responsive') {
        // TODO(levitzky) Define the behavior and remove this warning.
        user().warn(TAG, 'Behavior of multi-size and responsive layout is ' +
            'currently not well defined. Forcefully overriding layout to ' +
            '`fixed`.');
        this.element.setAttribute('layout', 'fixed');
      }
      const multiSizeValidation = this.element
          .getAttribute('data-multi-size-validation') || 'true';
      // The following call will check all specified multi-size dimensions,
      // verify that they meet all requirements, and then return all the valid
      // dimensions in an array.
      const dimensions = getMultiSizeDimensions(
          multiSizeDataStr,
          this.initialSize_.width,
          this.initialSize_.height,
          multiSizeValidation == 'true',
          this.isFluidRequest_);
      if (dimensions.length) {
        this.parameterSize += '|' + dimensions
            .map(dimension => dimension.join('x'))
            .join('|');
      }
    }
  }

  /** @override */
  getConsentPolicy() {
    // Ensure that build is not blocked by need for consent (delay will occur
    // prior to RTC & ad URL construction).
    return null;
  }

  /** @override */
  getAdUrl(consentState, opt_rtcResponsesPromise) {
    if (consentState == CONSENT_POLICY_STATE.UNKNOWN &&
        this.element.getAttribute('data-npa-on-unknown-consent') != 'true') {
      user().info(TAG, 'Ad request suppressed due to unknown consent');
      this.getAdUrlDeferred.resolve('');
      return Promise.resolve('');
    }
    if (this.iframe && !this.isRefreshing) {
      dev().warn(TAG, `Frame already exists, sra: ${this.useSra}`);
      this.getAdUrlDeferred.resolve('');
      return Promise.resolve('');
    }
    opt_rtcResponsesPromise = opt_rtcResponsesPromise || Promise.resolve();
    // TODO(keithwrightbos): SRA blocks currently unnecessarily generate full
    // ad url.  This could be optimized however non-SRA ad url is required to
    // fallback to non-SRA if single block.
    this.populateAdUrlState(consentState);
    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after noving it someplace common.
    const startTime = Date.now();
    const identityPromise = Services.timerFor(this.win)
        .timeoutPromise(1000, this.identityTokenPromise_)
        .catch(() => {
          // On error/timeout, proceed.
          return /**@type {!../../../ads/google/a4a/utils.IdentityToken}*/({});
        });
    const checkStillCurrent = this.verifyStillCurrent();
    Promise.all([opt_rtcResponsesPromise, identityPromise])
        .then(results => {
          checkStillCurrent();
          const rtcParams = this.mergeRtcResponses_(results[0]);
          this.identityToken = results[1];
          googleAdUrl(
              this, DOUBLECLICK_BASE_URL, startTime, Object.assign(
                  this.getBlockParameters_(), this.buildIdentityParams(),
                  this.getPageParameters(consentState), rtcParams),
              this.experimentIds)
              .then(adUrl => this.getAdUrlDeferred.resolve(adUrl));
        });
    this.troubleshootData_.adUrl = this.getAdUrlDeferred.promise;
    return this.getAdUrlDeferred.promise;
  }

  /**
   * Converts identity token response to ad request parameters.
   * @return {!Object<string,string>}
   */
  buildIdentityParams() {
    return this.identityToken ? {
      adsid: this.identityToken.token || null,
      jar: this.identityToken.jar || null,
      pucrd: this.identityToken.pucrd || null,
    } : {};
  }

  /**
   * Merges all of the rtcResponses into the JSON targeting and
   * category exclusions.
   * @param {?Array<!rtcResponseDef>} rtcResponseArray
   * @private
   */
  mergeRtcResponses_(rtcResponseArray) {
    if (!rtcResponseArray) {
      return null;
    }
    const artc = [];
    const ati = [];
    const ard = [];
    let exclusions;
    rtcResponseArray.forEach(rtcResponse => {
      if (!rtcResponse) {
        return;
      }
      artc.push(rtcResponse.rtcTime);
      ati.push(rtcResponse.error || RTC_SUCCESS);
      ard.push(rtcResponse.callout);
      if (rtcResponse.response) {
        if (rtcResponse.response['targeting']) {
          const rewrittenResponse = this.rewriteRtcKeys_(
              rtcResponse.response['targeting'],
              rtcResponse.callout);
          this.jsonTargeting['targeting'] =
              !!this.jsonTargeting['targeting'] ?
                deepMerge(this.jsonTargeting['targeting'],
                    rewrittenResponse) :
                rewrittenResponse;
        }
        if (rtcResponse.response['categoryExclusions']) {
          if (!exclusions) {
            exclusions = {};
            if (this.jsonTargeting['categoryExclusions']) {
              this.jsonTargeting['categoryExclusions'].forEach(exclusion => {
                exclusions[exclusion] = true;
              });
            }
          }
          rtcResponse.response['categoryExclusions'].forEach(exclusion => {
            exclusions[exclusion] = true;
          });
        }
      }
    });
    if (exclusions) {
      this.jsonTargeting['categoryExclusions'] = Object.keys(exclusions);
    }
    return {'artc': artc.join() || null, 'ati': ati.join(), 'ard': ard.join()};
  }

  /** @override */
  getCustomRealTimeConfigMacros_() {
    /**
     * This whitelist allow attributes on the amp-ad element to be used as
     * macros for constructing the RTC URL. Add attributes here, in lowercase,
     * to make them available.
     */
    const whitelist = {
      'height': true,
      'width': true,
      'data-slot': true,
      'data-multi-size': true,
      'data-multi-size-validation': true,
      'data-override-width': true,
      'data-override-height': true,
    };
    return {
      PAGEVIEWID: () => Services.documentInfoForDoc(this.element).pageViewId,
      HREF: () => this.win.location.href,
      REFERRER: opt_timeout => this.getReferrer_(opt_timeout),
      TGT: () =>
        JSON.stringify(
            (tryParseJson(
                this.element.getAttribute('json')) || {})['targeting']),
      ADCID: opt_timeout => getOrCreateAdCid(
          this.getAmpDoc(), 'AMP_ECID_GOOGLE', '_ga',
          parseInt(opt_timeout, 10)),
      ATTR: name => {
        if (!whitelist[name.toLowerCase()]) {
          dev().warn('TAG', `Invalid attribute ${name}`);
        } else {
          return this.element.getAttribute(name);
        }
      },
      CANONICAL_URL: () =>
        Services.documentInfoForDoc(this.element).canonicalUrl,
    };
  }

  /**
   * Returns the referrer or undefined if the referrer is not resolved
   * before the given timeout
   * @param {number=} opt_timeout
   * @return {!(Promise<string>|Promise<undefined>)} A promise with a referrer or undefined
   * if timed out
   * @private
   */
  getReferrer_(opt_timeout) {
    const timeoutInt = parseInt(opt_timeout, 10);
    const referrerPromise = Services.viewerForDoc(this.getAmpDoc())
        .getReferrerUrl();
    if (isNaN(timeoutInt) || timeoutInt < 0) {
      return referrerPromise;
    }
    return Services.timerFor(this.win)
        .timeoutPromise(timeoutInt, referrerPromise)
        .catch(() => undefined);
  }

  /**
   * Appends the callout value to the keys of response to prevent a collision
   * case caused by multiple vendors returning the same keys.
   * @param {!Object<string, string>} response
   * @param {string} callout
   * @return {!Object<string, string>}
   * @private
   */
  rewriteRtcKeys_(response, callout) {
    // Only perform this substitution for vendor-defined URLs.
    if (!RTC_VENDORS[callout] || RTC_VENDORS[callout].disableKeyAppend) {
      return response;
    }
    const newResponse = {};
    Object.keys(response).forEach(key => {
      newResponse[`${key}_${callout}`] = response[key];
    });
    return newResponse;
  }

  /** @override */
  onNetworkFailure(error, adUrl) {
    dev().info(TAG, 'network error, attempt adding of error parameter', error);
    return {adUrl: maybeAppendErrorParameter(adUrl, 'n')};
  }

  /** @override */
  extractSize(responseHeaders) {
    this.ampAnalyticsConfig_ = extractAmpAnalyticsConfig(this, responseHeaders);
    this.qqid_ = responseHeaders.get(QQID_HEADER);
    this.troubleshootData_.creativeId =
        responseHeaders.get('google-creative-id');
    this.troubleshootData_.lineItemId =
        responseHeaders.get('google-lineitem-id');
    if (this.ampAnalyticsConfig_) {
      // Load amp-analytics extensions
      this.extensions_./*OK*/installExtensionForDoc(
          this.getAmpDoc(), 'amp-analytics');
    }
    // If the server returned a size, use that, otherwise use the size that we
    // sent in the ad request.
    let size = super.extractSize(responseHeaders);
    if (size) {
      this.returnedSize_ = size;
      this.handleResize_(size.width, size.height);
    } else {
      size = this.getSlotSize();
    }
    // If this is a multi-size creative, fire delayed impression now. If it's
    // fluid, wait until after resize happens.
    if (this.isFluidRequest_ && !this.returnedSize_) {
      this.fluidImpressionUrl_ = responseHeaders.get('X-AmpImps');
    }

    // If the response included a pageview state token, check for an existing
    // token and remove it. Then save the new one to the module level object.
    if (responseHeaders.get('amp-ff-pageview-tokens')) {
      this.removePageviewStateToken();
      this.setPageviewStateToken(
          responseHeaders.get('amp-ff-pageview-tokens'));
    }

    return size;
  }

  /**
   * Returns the width and height of the slot as defined by the width and height
   * attributes, or the dimensions as computed by
   * getIntersectionElementLayoutBox.
   * @return {{width: number, height: number}|../../../src/layout-rect.LayoutRectDef}
   */
  getSlotSize() {
    const width = Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('height'));
    return width && height
      ? {width, height}
      // width/height could be 'auto' in which case we fallback to measured.
      : this.getIntersectionElementLayoutBox();
  }

  /** @override */
  tearDownSlot() {
    super.tearDownSlot();
    this.element.setAttribute('data-amp-slot-index',
        this.win.ampAdSlotIdCounter++);
    if (this.ampAnalyticsElement_) {
      removeElement(this.ampAnalyticsElement_);
      this.ampAnalyticsElement_ = null;
    }
    this.ampAnalyticsConfig_ = null;
    this.jsonTargeting = null;
    this.isAmpCreative_ = null;
    this.isIdleRender_ = false;
    this.parameterSize = null;
    this.returnedSize_ = null;
    // Reset SRA requests to allow for resumeCallback to re-fetch
    // ad requests.  Assumes that unlayoutCallback will be called for all slots
    // in rapid succession (meaning onLayoutMeasure initiated promise chain
    // will not be started until resumeCallback).
    sraRequests = null;
    this.sraDeferred = new Deferred();
    this.qqid_ = null;
    this.consentState = null;
    this.getAdUrlDeferred = new Deferred();
    this.removePageviewStateToken();
  }

  /** @override */
  renderNonAmpCreative() {
    // If render idle with throttling, impose one second render delay for
    // non-AMP creatives.  This is not done in the scheduler to ensure as many
    // slots as possible are marked for layout given scheduler imposes 5 seconds
    // past previous execution.
    if (this.postAdResponseExperimentFeatures['render-idle-throttle'] &&
          this.isIdleRender_) {
      if (is3pThrottled(this.win)) {
        return waitFor3pThrottle().then(() => super.renderNonAmpCreative());
      } else {
        incrementLoadingAds(this.win);
        return super.renderNonAmpCreative(true);
      }
    }
    return super.renderNonAmpCreative();
  }

  /** @override  */
  unlayoutCallback() {
    if (this.refreshManager_) {
      this.refreshManager_.unobserve();
    }
    if (!this.useSra && this.isAmpCreative_) {
      // Allow non-AMP creatives to remain unless SRA.
      return false;
    }
    this.destroySafeFrameApi_();
    return super.unlayoutCallback();
  }

  /** @visibleForTesting */
  cleanupAfterTest() {
    this.destroySafeFrameApi_();
  }

  /** @private */
  destroySafeFrameApi_() {
    if (!this.safeframeApi_) {
      return;
    }
    this.safeframeApi_.destroy();
    this.safeframeApi_ = null;
  }

  /** @override */
  refresh(refreshEndCallback) {
    this.refreshCount_++;
    return super.refresh(refreshEndCallback);
  }

  /** @override */
  onCreativeRender(creativeMetaData) {
    super.onCreativeRender(creativeMetaData);
    this.isAmpCreative_ = !!creativeMetaData;
    if (creativeMetaData &&
        !creativeMetaData.customElementExtensions.includes('amp-ad-exit')) {
      // Capture phase click handlers on the ad if amp-ad-exit not present
      // (assume it will handle capture).
      dev().assert(this.iframe);
      Navigation.installAnchorClickInterceptor(
          this.getAmpDoc(), this.iframe.contentWindow);
    }
    if (this.ampAnalyticsConfig_) {
      dev().assert(!this.ampAnalyticsElement_);
      if (isReportingEnabled(this)) {
        addCsiSignalsToAmpAnalyticsConfig(
            this.win,
            this.element,
            this.ampAnalyticsConfig_,
            this.qqid_,
            !!creativeMetaData);
      }
      this.ampAnalyticsElement_ = insertAnalyticsElement(
          this.element, this.ampAnalyticsConfig_, /*loadAnalytics*/ true,
          !!this.postAdResponseExperimentFeatures['avr_disable_immediate']);
    }
    if (this.isRefreshing) {
      dev().assert(this.refreshManager_);
      this.refreshManager_.initiateRefreshCycle();
      this.isRefreshing = false;
      this.isRelayoutNeededFlag = false;
    }

    // Force size of frame to match creative or, if creative size is unknown,
    // the slot. This ensures that the creative is centered in the former case,
    // and not truncated in the latter.
    const size = this.returnedSize_ || this.getSlotSize();
    const isMultiSizeFluid = this.isFluidRequest_ && this.returnedSize_ &&
        // TODO(@glevitzky, 11583) Remove this clause once we stop sending back
        // the size header for fluid ads. Fluid size headers always come back as
        // 0x0.
        !(size.width == 0 && size.height == 0);
    setStyles(dev().assertElement(this.iframe), {
      width: `${size.width}px`,
      height: `${size.height}px`,
      position: isMultiSizeFluid ? 'relative' : null,
    });
    if (isMultiSizeFluid) {
      // This is a fluid + multi-size request, where the returned creative is
      // multi-size. The slot needs to not be styled with width: 100%, or the
      // creative will be centered instead of left-aligned.
      this.element.removeAttribute('height');
      setStyles(this.element, {width: `${size.width}px`});
    }

    this.refreshManager_ = this.refreshManager_ ||
        getRefreshManager(this, () => {
          if (this.useSra) {
            user().warn(TAG, 'Refresh not compatible with SRA.');
            return false;
          }
          if (getEnclosingContainerTypes(this.element).filter(container =>
            container != ValidAdContainerTypes['AMP-CAROUSEL'] &&
                container != ValidAdContainerTypes['AMP-STICKY-AD']).length) {
            user().warn(TAG,
                'Refresh not compatible with ad-containers, except for ' +
                'AMP-CAROUSEL and AMP-STICKY-AD');
            return false;
          }
          return true;
        });

    this.postTroubleshootMessage();
  }

  /**
   * @param {string} size
   * @return {string} The ad unit hash key string.
   * @private
   */
  generateAdKey_(size) {
    const {element} = this;
    const domFingerprint = domFingerprintPlain(element);
    const slot = element.getAttribute('data-slot') || '';
    const multiSize = element.getAttribute('data-multi-size') || '';
    const string = `${slot}:${size}:${multiSize}:${domFingerprint}`;
    return stringHash32(string);
  }

  /**
   * Attempts to resize the ad, if the returned size is smaller than the primary
   * dimensions.
   * @param {number} width
   * @param {number} height
   * @private
   */
  handleResize_(width, height) {
    const pWidth = this.element.getAttribute('width');
    const pHeight = this.element.getAttribute('height');
    // We want to resize only if neither returned dimension is larger than its
    // primary counterpart, and if at least one of the returned dimensions
    // differ from its primary counterpart.
    if ((this.isFluidRequest_ && width && height) ||
        ((width != pWidth || height != pHeight) &&
         (width <= pWidth && height <= pHeight))) {
      this.attemptChangeSize(height, width).catch(() => {});
    }
  }

  /** @override */
  sendXhrRequest(adUrl) {
    if (!this.useSra) {
      return super.sendXhrRequest(adUrl);
    }
    // Wait for SRA request which will call response promise when this block's
    // response has been returned.
    this.initiateSraRequests();
    // Null response indicates single slot should execute using non-SRA method.
    return this.sraDeferred.promise.then(
        response => response || super.sendXhrRequest(adUrl));
  }

  /**
   * @param {string} impressions
   * @param {boolean=} scrubReferer
   * @visibleForTesting
   */
  fireDelayedImpressions(impressions, scrubReferer) {
    if (!impressions) {
      return;
    }
    impressions.split(',').forEach(url => {
      try {
        if (!isSecureUrlDeprecated(url)) {
          dev().warn(TAG, `insecure impression url: ${url}`);
          return;
        }
        // Create amp-pixel and append to document to send impression.
        this.win.document.body.appendChild(
            createElementWithAttributes(
                this.win.document,
                'amp-pixel',
                dict({
                  'src': url,
                  'referrerpolicy': scrubReferer ? 'no-referrer' : '',
                })));
      } catch (unusedError) {}
    });
  }

  /**
   * Groups slots by type and networkId from data-slot parameter.  Exposed for
   * ease of testing.
   * @return {!Promise<!Object<string,!Array<!Promise<!../../../src/base-element.BaseElement>>>>}
   * @visibleForTesting
   */
  groupSlotsForSra() {
    return groupAmpAdsByType(
        this.win, this.element.getAttribute('type'), getNetworkId);
  }

  /**
   * Executes SRA request via the following steps:
   * - create only one executor per page
   * - get all doubleclick amp-ad instances on the page
   * - group by networkID allowing for separate SRA requests
   * - for each grouping, construct SRA request
   * - handle chunks for streaming response for each block
   * @visibleForTesting
   */
  initiateSraRequests() {
    if (sraRequests) {
      return;
    }
    // Use cancellation of the first slot's promiseId as indication of
    // unlayoutCallback execution.  Assume that if called for one slot, it will
    // be called for all and we should cancel SRA execution.
    const checkStillCurrent = this.verifyStillCurrent();
    sraRequests = this.groupSlotsForSra()
        .then(groupIdToBlocksAry => {
          checkStillCurrent();
          Object.keys(groupIdToBlocksAry).forEach(networkId => {
            const blocks = dev().assert(groupIdToBlocksAry[networkId]);
            // TODO: filter blocks with SRA disabled?
            Promise.all(blocks).then(instances => {
              dev().assert(instances.length);
              checkStillCurrent();
              // Exclude any instances that do not have an adPromise_ as this
              // indicates they were invalid.
              const typeInstances =
              /** @type {!Array<!AmpAdNetworkDoubleclickImpl>}*/(instances)
                    .filter(instance => {
                      const isValid = instance.hasAdPromise();
                      if (!isValid) {
                        dev().info(TAG,
                            'Ignoring instance without ad promise as ' +
                            'likely invalid',
                            instance.element);
                      }
                      return isValid;
                    });
              if (!typeInstances.length) {
              // Only contained invalid elements.
                return;
              }
              // Determine if more than one block for this element, if not do
              // not set sra request promise which results in sending as non-SRA
              // request (benefit is it allows direct cache method).
              if (typeInstances.length == 1) {
                dev().info(TAG, `single block in network ${networkId}`);
                typeInstances[0].sraDeferred.resolve(null);
                return;
              }
              let sraUrl;
              // Construct and send SRA request.
              // Chunk handler called with metadata and creative for each slot
              // in order of URLs given which is then passed to resolver used
              // for sendXhrRequest.
              const sraRequestAdUrlResolvers =
              typeInstances.map(instance => instance.sraDeferred.resolve);
              const slotCallback = metaJsonCreativeGrouper(
                  (creative, headersObj, done) => {
                    checkStillCurrent();
                    sraBlockCallbackHandler(creative, headersObj, done,
                        sraRequestAdUrlResolvers, sraUrl);
                  });
              // TODO(keithwrightbos) - how do we handle per slot 204 response?
              return constructSRARequest_(this, typeInstances)
                  .then(sraUrlIn => {
                    checkStillCurrent();
                    sraUrl = sraUrlIn;
                    return Services.xhrFor(this.win).fetch(sraUrl, {
                      mode: 'cors',
                      method: 'GET',
                      credentials: 'include',
                    });
                  })
                  .then(response => {
                    checkStillCurrent();
                    return lineDelimitedStreamer(
                        this.win, response, slotCallback);
                  })
                  .catch(error => {
                    if (isCancellation(error)) {
                      // Cancellation should be propagated to slot promises
                      // causing their adPromise chains within A4A to handle
                      // appropriately.
                      typeInstances.forEach(instance =>
                        instance.sraDeferred.reject(error));
                    } else if (!!this.win.document.querySelector(
                        'meta[name=amp-ad-doubleclick-sra]') ||
                        this.experimentIds.includes(
                            DOUBLECLICK_SRA_EXP_BRANCHES.SRA_NO_RECOVER)) {
                      // If publisher has explicitly enabled SRA mode (not
                      // experiment), then assume error is network failure,
                      // collapse slot, reset url to empty string to ensure
                      // no fallback to frame GET (given expectation of SRA
                      // consistency), and propagate error to A4A ad promise
                      // chain.
                      assignAdUrlToError(/** @type {!Error} */(error), sraUrl);
                      this.warnOnError('SRA request failure', error);
                      // Publisher explicitly wants SRA so do not attempt to
                      // recover as SRA guarantees cannot be enforced.
                      typeInstances.forEach(instance => {
                        // Reset ad url to ensure layoutCallback does not
                        // fallback to frame get which would lose SRA
                        // guarantees.
                        instance.resetAdUrl();
                        instance.attemptCollapse();
                        instance.sraDeferred.reject(error);
                      });
                    } else {
                      // Opportunistic SRA used so fallback to individual
                      // XHR requests.
                      typeInstances.forEach(instance =>
                        instance.sraDeferred.resolve(null));
                    }
                  });
            });
          });
        });
  }

  /**
   * @param {string} message
   * @param {*} error
   * @visibleForTesting
   */
  warnOnError(message, error) {
    dev().warn(TAG, message, error);
  }

  /** @override */
  getPreconnectUrls() {
    return ['https://securepubads.g.doubleclick.net/'];
  }

  /** @override */
  getNonAmpCreativeRenderingMethod(headerValue) {
    return this.forceSafeframe || this.isFluidRequest_
      ? XORIGIN_MODE.SAFEFRAME
      : super.getNonAmpCreativeRenderingMethod(headerValue);
  }

  /**
   * Note that location is parsed once on first access and cached.
   * @param {string} parameterName
   * @return {string|undefined} parameter value from window.location.search
   * @visibleForTesting
   */
  getLocationQueryParameterValue(parameterName) {
    windowLocationQueryParameters = windowLocationQueryParameters ||
        parseQueryString((this.win.location && this.win.location.search) || '');
    return windowLocationQueryParameters[parameterName];
  }

  /** @override */
  getAdditionalContextMetadata(isSafeFrame = false) {
    if (!this.isFluidRequest_ && !isSafeFrame) {
      return;
    }
    const creativeSize = this.getCreativeSize();
    dev().assert(creativeSize, 'this.getCreativeSize returned null');
    this.safeframeApi_ = this.safeframeApi_ ||
        new SafeframeHostApi(
            this, this.isFluidRequest_,
            /** @type {{height, width}} */(creativeSize),
            this.fluidImpressionUrl_);

    return this.safeframeApi_.getSafeframeNameAttr();
  }

  /**
   * Emits a postMessage containing information about this slot to the DFP
   * Troubleshoot UI. A promise is returned if a message is posted, otherwise
   * null is returned. The promise is returned only for test convenience.
   *
   * @return {?Promise}
   * @visibleForTesting
   */
  postTroubleshootMessage() {
    if (!this.win.opener || !/[?|&]dfpdeb/.test(this.win.location.search)) {
      return null;
    }
    dev().assert(this.troubleshootData_.adUrl, 'ad URL does not exist yet');
    return this.troubleshootData_.adUrl.then(adUrl => {
      const slotId = this.troubleshootData_.slotId + '_' +
          this.troubleshootData_.slotIndex;
      const payload = dict({
        'gutData': JSON.stringify(dict({
          'events': [{
            'timestamp': Date.now(),
            'slotid': slotId,
            'messageId': 4,
          }],
          'slots': [{
            'contentUrl': adUrl || '',
            'id': slotId,
            'leafAdUnitName': this.troubleshootData_.slotId,
            'domId': slotId,
            'lineItemId': this.troubleshootData_.lineItemId,
            'creativeId': this.troubleshootData_.creativeId,
          }],
        })),
        'userAgent': navigator.userAgent,
        'referrer': this.win.location.href,
        'messageType': 'LOAD',
      });
      this.win.opener./*OK*/postMessage(payload, '*');
    });
  }

  /**
   * Sets the pageview state token associated with the slot. Token does not
   * expire.
   * @param {string} token
   */
  setPageviewStateToken(token) {
    tokensToInstances[token] = this;
  }

  /**
   * Checks for the presence of a pageview token in the module level object
   * and removes it if present.
   */
  removePageviewStateToken() {
    for (const token in tokensToInstances) {
      if (tokensToInstances[token] == this) {
        delete tokensToInstances[token];
        break;
      }
    }
  }

  /** @override */
  getA4aAnalyticsVars(analyticsTrigger) {
    return getCsiAmpAnalyticsVariables(analyticsTrigger, this, this.qqid_);
  }

  /** @override */
  getA4aAnalyticsConfig() {
    return getCsiAmpAnalyticsConfig();
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdNetworkDoubleclickImpl);
});


/** @visibleForTesting */
export function resetSraStateForTesting() {
  sraRequests = null;
}

/** @visibleForTesting */
export function resetLocationQueryParametersForTesting() {
  windowLocationQueryParameters = null;
}

/**
 * @param {!Element} element
 * @return {string} networkId from data-ad-slot attribute.
 * @visibleForTesting
 */
export function getNetworkId(element) {
  const networkId = /^(?:\/)?(\d+)/.exec(
      dev().assertString(element.getAttribute('data-slot')));
  // TODO: guarantee data-ad-slot format as part of isValidElement?
  return networkId ? networkId[1] : '';
}


/**
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {!Array<!AmpAdNetworkDoubleclickImpl>} instances
 * @return {!Promise<string>} SRA request URL
 */
function constructSRARequest_(a4a, instances) {
  // TODO(bradfrizzell): Need to add support for RTC.
  dev().assert(instances && instances.length);
  const startTime = Date.now();
  return Promise.all(
      instances.map(instance => instance.getAdUrlDeferred.promise))
      .then(() => googlePageParameters(a4a, startTime))
      .then(googPageLevelParameters => {
        const blockParameters = constructSRABlockParameters(instances);
        return truncAndTimeUrl(DOUBLECLICK_BASE_URL,
            Object.assign(blockParameters, googPageLevelParameters,
                instances[0].getPageParameters(instances[0].consentState,
                    instances)), startTime);
      });
}

/**
 * Returns the pageview tokens that should be included in the ad request. Tokens
 * should come only from instances that are not being requested in this request.
 * @param {!Array<!AmpAdNetworkDoubleclickImpl>} instancesInAdRequest
 * @return {!Array<string>} Array of pageview tokens to include in the ad
 * request.
 */
export function getPageviewStateTokensForAdRequest(instancesInAdRequest) {
  const pageviewStateTokensInAdRequest = [];
  for (const token in tokensToInstances) {
    if (!instancesInAdRequest.includes(
        tokensToInstances[token])) {
      pageviewStateTokensInAdRequest.push(token);
    }
  }
  return pageviewStateTokensInAdRequest;
}

/**
 * Resets the tokensToInstances mapping for testing purposes.
 * @visibleForTesting
 */
export function resetTokensToInstancesMap() {
  tokensToInstances = {};
}
