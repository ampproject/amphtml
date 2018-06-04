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

import {ADSENSE_RSPV_WHITELISTED_HEIGHT} from '../../../ads/google/utils';
import {AdsenseSharedState} from './adsense-shared-state';
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {CONSENT_POLICY_STATE} from '../../../src/consent-state';
import {Navigation} from '../../../src/service/navigation';
import {
  QQID_HEADER,
  ValidAdContainerTypes,
  addCsiSignalsToAmpAnalyticsConfig,
  additionalDimensions,
  extractAmpAnalyticsConfig,
  getCsiAmpAnalyticsConfig,
  getCsiAmpAnalyticsVariables,
  getEnclosingContainerTypes,
  getIdentityToken,
  googleAdUrl,
  isCdnProxy,
  isReportingEnabled,
  maybeAppendErrorParameter,
} from '../../../ads/google/a4a/utils';
import {Services} from '../../../src/services';
import {
  addExperimentIdToElement,
  isInManualExperiment,
} from '../../../ads/google/a4a/traffic-experiments';
import {clamp} from '../../../src/utils/math';
import {
  computedStyle,
  setStyle,
  setStyles,
} from '../../../src/style';
import {dev, user} from '../../../src/log';
import {domFingerprintPlain} from '../../../src/utils/dom-fingerprint';
import {
  getAdSenseAmpAutoAdsExpBranch,
} from '../../../ads/google/adsense-amp-auto-ads';
import {getDefaultBootstrapBaseUrl} from '../../../src/3p-frame';
import {getMode} from '../../../src/mode';
import {
  googleLifecycleReporterFactory,
  setGoogleLifecycleVarsFromHeaders,
} from '../../../ads/google/a4a/google-data-reporter';
import {insertAnalyticsElement} from '../../../src/extension-analytics';
import {
  randomlySelectUnsetExperiments,
} from '../../../src/experiments';
import {removeElement} from '../../../src/dom';
import {stringHash32} from '../../../src/string';

/** @const {string} */
const ADSENSE_BASE_URL = 'https://googleads.g.doubleclick.net/pagead/ads';

/** @const {string} */
const TAG = 'amp-ad-network-adsense-impl';

/**
 * Shared state for AdSense ad slots. This is used primarily for ad request url
 * parameters that depend on previous slots.
 * @const {!AdsenseSharedState}
 */
const sharedState = new AdsenseSharedState();

/** @visibleForTesting */
export function resetSharedState() {
  sharedState.reset();
}

/** @final */
export class AmpAdNetworkAdsenseImpl extends AmpA4A {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /**
     * @type {!../../../ads/google/a4a/performance.GoogleAdLifecycleReporter}
     */
    this.lifecycleReporter_ = this.lifecycleReporter_ ||
        this.initLifecycleReporter();

    /**
     * A unique identifier for this slot.
     * Not initialized until getAdUrl() is called; updated upon each invocation
     * of getAdUrl().
     * @private {?string}
     */
    this.uniqueSlotId_ = null;

    /**
     * Config to generate amp-analytics element for active view reporting.
     * @type {?JsonObject}
     * @private
     */
    this.ampAnalyticsConfig_ = null;

    /** @private {!../../../src/service/extensions-impl.Extensions} */
    this.extensions_ = Services.extensionsFor(this.win);

    /** @private {?({width, height}|../../../src/layout-rect.LayoutRectDef)} */
    this.size_ = null;

    /**
     * amp-analytics element generated based on this.ampAnalyticsConfig_
     * @private {?Element}
     */
    this.ampAnalyticsElement_ = null;

    /** @private {?string} */
    this.qqid_ = null;

    /**
     * For full-width responsive ads: whether the element has already been
     * aligned to the edges of the viewport.
     * @private {boolean}
     */
    this.responsiveAligned_ = false;

    /**
     * The contents of the data-auto-format attribute, or empty string if the
     * attribute was not set.
     * @private {?string}
     */
    this.autoFormat_ = null;

    /** @private {?Promise<!../../../ads/google/a4a/utils.IdentityToken>} */
    this.identityTokenPromise_ = null;

    /**
     * @private {?boolean} whether preferential rendered AMP creative, null
     * indicates no creative render.
     */
    this.isAmpCreative_ = null;
  }

  /**
   * @return {boolean}
   * @private
   */
  isResponsive_() {
    return this.autoFormat_ == 'rspv';
  }

  /** @override */
  isValidElement() {
    /**
     * isValidElement used to also check that we are in a valid A4A environment,
     * however this is not necessary as that is checked by adsenseIsA4AEnabled,
     * which is always called as part of the upgrade path from an amp-ad element
     * to an amp-ad-adsense element. Thus, if we are an amp-ad, we can be sure
     * that it has been verified.
     */
    if (this.isResponsive_()) {
      if (!this.element.hasAttribute('data-full-width')) {
        user().warn(TAG,
            'Responsive AdSense ad units require the attribute ' +
            'data-full-width.');
        return false;
      }

      const height = this.element.getAttribute('height');
      const width = this.element.getAttribute('width');
      if (height != ADSENSE_RSPV_WHITELISTED_HEIGHT) {
        user().warn(TAG,
            `Specified height ${height} in <amp-ad> tag is not equal to the ` +
            `required height of ${ADSENSE_RSPV_WHITELISTED_HEIGHT} for ` +
            'responsive AdSense ad units.');
        return false;
      }
      if (width != '100vw') {
        user().warn(TAG,
            `Invalid width ${width} for full-width responsive <amp-ad> tag. ` +
            'Width must be 100vw.');
        return false;
      }
    }
    return !!this.element.getAttribute('data-ad-client') &&
        this.isAmpAdElement();
  }

  /** @override */
  delayAdRequestEnabled() {
    return true;
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.identityTokenPromise_ = Services.viewerForDoc(this.getAmpDoc())
        .whenFirstVisible()
        .then(() => getIdentityToken(this.win, this.getAmpDoc()));
    this.autoFormat_ =
        this.element.getAttribute('data-auto-format') || '';

    if (this.isResponsive_()) {
      // Attempt to resize to the correct height. The width should already be
      // 100vw, but is fixed here so that future resizes of the viewport don't
      // affect it.
      const viewportSize = this.getViewport().getSize();
      return this.attemptChangeSize(
          AmpAdNetworkAdsenseImpl.getResponsiveHeightForContext_(
              viewportSize),
          viewportSize.width).catch(() => {});
    }
  }

  /** @override */
  getConsentPolicy() {
    // Ensure that build is not blocked by need for consent (delay will occur
    // prior to ad URL construction).
    return null;
  }

  /** @override */
  getAdUrl(consentState) {
    if (consentState == CONSENT_POLICY_STATE.UNKNOWN &&
        this.element.getAttribute('data-npa-on-unknown-consent') != 'true') {
      user().info(TAG, 'Ad request suppressed due to unknown consent');
      return Promise.resolve('');
    }
    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after moving it someplace common.
    const startTime = Date.now();
    const global = this.win;
    let adClientId = this.element.getAttribute('data-ad-client');
    // Ensure client id format: lower case with 'ca-' prefix.
    adClientId = adClientId.toLowerCase();
    if (adClientId.substring(0, 3) != 'ca-') {
      adClientId = 'ca-' + adClientId;
    }
    const adTestOn = this.element.getAttribute('data-adtest') ||
        isInManualExperiment(this.element);
    const width = Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('height'));

    const adsenseFormatExpName = 'as-use-attr-for-format';
    const experimentInfoMap =
        /** @type {!Object<string,
        !../../../src/experiments.ExperimentInfo>} */ ({});
    experimentInfoMap[adsenseFormatExpName] = {
      isTrafficEligible: () => !this.isResponsive_() &&
        !isNaN(width) && width > 0 &&
        !isNaN(height) && height > 0,
      branches: ['21062003', '21062004'],
    };

    const adsenseFormatExpId =
        randomlySelectUnsetExperiments(
            this.win, experimentInfoMap)[adsenseFormatExpName];
    addExperimentIdToElement(adsenseFormatExpId, this.element);

    this.size_ = adsenseFormatExpId == '21062004'
      ? {width, height}
      : this.getIntersectionElementLayoutBox();
    const format = `${this.size_.width}x${this.size_.height}`;
    const slotId = this.element.getAttribute('data-amp-slot-index');
    // data-amp-slot-index is set by the upgradeCallback method of amp-ad.
    // TODO(bcassels): Uncomment the assertion, fixing the tests.
    // But not all tests arrange to call upgradeCallback.
    // dev().assert(slotId != undefined);
    const adk = this.adKey_(format);
    this.uniqueSlotId_ = slotId + adk;
    const slotname = this.element.getAttribute('data-ad-slot');
    const sharedStateParams = sharedState.addNewSlot(
        format, this.uniqueSlotId_, adClientId, slotname);
    const viewportSize = this.getViewport().getSize();
    this.win['ampAdGoogleIfiCounter'] = this.win['ampAdGoogleIfiCounter'] || 1;
    const enclosingContainers = getEnclosingContainerTypes(this.element);
    const pfx = enclosingContainers.includes(
        ValidAdContainerTypes['AMP-FX-FLYING-CARPET']) ||
        enclosingContainers.includes(ValidAdContainerTypes['AMP-STICKY-AD']);
    const parameters = {
      'client': adClientId,
      format,
      'w': this.size_.width,
      'h': this.size_.height,
      'iu': slotname,
      'npa': consentState == CONSENT_POLICY_STATE.INSUFFICIENT ||
          consentState == CONSENT_POLICY_STATE.UNKNOWN ? 1 : null,
      'adtest': adTestOn ? 'on' : null,
      adk,
      'output': 'html',
      'bc': global.SVGElement && global.document.createElementNS ? '1' : null,
      'ctypes': this.getCtypes_(),
      'host': this.element.getAttribute('data-ad-host'),
      'hl': this.element.getAttribute('data-language'),
      'to': this.element.getAttribute('data-tag-origin'),
      'pv': sharedStateParams.pv,
      'channel': this.element.getAttribute('data-ad-channel'),
      'wgl': global['WebGLRenderingContext'] ? '1' : '0',
      'asnt': this.sentinel,
      'dff': computedStyle(this.win, this.element)['font-family'],
      'prev_fmts': sharedStateParams.prevFmts || null,
      'prev_slotnames': sharedStateParams.prevSlotnames || null,
      'brdim': additionalDimensions(this.win, viewportSize),
      'ifi': this.win['ampAdGoogleIfiCounter']++,
      'rc': this.fromResumeCallback ? 1 : null,
      'rafmt': this.isResponsive_() ? 13 : null,
      'pfx': pfx ? '1' : '0',
      // Matched content specific fields.
      'crui': this.element.getAttribute('data-matched-content-ui-type'),
      'cr_row': this.element.getAttribute('data-matched-content-rows-num'),
      'cr_col': this.element.getAttribute('data-matched-content-columns-num'),
      // Package code (also known as URL group) that was used to
      // create ad.
      'pwprc': this.element.getAttribute('data-package'),
    };

    const experimentIds = [];
    const ampAutoAdsBranch = getAdSenseAmpAutoAdsExpBranch(this.win);
    if (ampAutoAdsBranch) {
      experimentIds.push(ampAutoAdsBranch);
    }
    const identityPromise = Services.timerFor(this.win)
        .timeoutPromise(1000, this.identityTokenPromise_)
        .catch(unusedErr => {
          // On error/timeout, proceed.
          return /**@type {!../../../ads/google/a4a/utils.IdentityToken}*/(
            {});
        });
    return identityPromise.then(identity => {
      return googleAdUrl(
          this, ADSENSE_BASE_URL, startTime, Object.assign(
              {
                adsid: identity.token || null,
                jar: identity.jar || null,
                pucrd: identity.pucrd || null,
              },
              parameters), experimentIds);
    });
  }

  /** @override */
  onNetworkFailure(error, adUrl) {
    dev().info(TAG, 'network error, attempt adding of error parameter', error);
    return {adUrl: maybeAppendErrorParameter(adUrl, 'n')};
  }

  /** @override */
  extractSize(responseHeaders) {
    setGoogleLifecycleVarsFromHeaders(responseHeaders, this.lifecycleReporter_);
    this.ampAnalyticsConfig_ = extractAmpAnalyticsConfig(this, responseHeaders);
    this.qqid_ = responseHeaders.get(QQID_HEADER);
    if (this.ampAnalyticsConfig_) {
      // Load amp-analytics extensions
      this.extensions_./*OK*/installExtensionForDoc(
          this.getAmpDoc(), 'amp-analytics');
    }
    return this.size_;
  }

  /**
   * @param {string} format
   * @return {string} The ad unit hash key string.
   * @private
   */
  adKey_(format) {
    const {element} = this;
    const slot = element.getAttribute('data-ad-slot') || '';
    const string = `${slot}:${format}:${domFingerprintPlain(element)}`;
    return stringHash32(string);
  }

  /**
   * @return {?string}
   * @private
   */
  getCtypes_() {
    if (!getMode().localDev) {
      return null;
    }
    const ctypesReMatch = /[?&]force_a4a_ctypes=([^&]+)/.exec(
        this.win.location.search);
    // If the RE passes, then length is necessarily > 1.
    if (ctypesReMatch) {
      return ctypesReMatch[1];
    }
    return null;
  }

  /** @override */
  emitLifecycleEvent(eventName, opt_extraVariables) {
    if (opt_extraVariables) {
      this.lifecycleReporter_.setPingParameters(opt_extraVariables);
    }
    this.lifecycleReporter_.sendPing(eventName);
  }

  /**
   * @return {!../../../ads/google/a4a/performance.BaseLifecycleReporter}
   */
  initLifecycleReporter() {
    return googleLifecycleReporterFactory(this);
  }

  /** @override */
  isXhrAllowed() {
    return isCdnProxy(this.win) || getMode(this.win).localDev ||
        getMode(this.win).test;
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
            !!creativeMetaData,
            this.lifecycleReporter_.getDeltaTime(),
            this.lifecycleReporter_.getInitTime());
      }
      this.ampAnalyticsElement_ = insertAnalyticsElement(
          this.element, this.ampAnalyticsConfig_, /*loadAnalytics*/ true,
          !!this.postAdResponseExperimentFeatures['avr_disable_immediate']);
    }

    this.lifecycleReporter_.addPingsForVisibility(this.element);

    setStyles(dev().assertElement(this.iframe), {
      width: `${this.size_.width}px`,
      height: `${this.size_.height}px`,
    });
  }

  /** @override */
  unlayoutCallback() {
    switch (this.postAdResponseExperimentFeatures['unlayout_exp']) {
      case 'all':
        // Ensure all creatives are removed.
        this.isAmpCreative_ = false;
        break;
      case 'remain':
        if (this.qqid_ && this.isAmpCreative_ === null) {
          // Ad response received but not yet rendered.  Note that no fills
          // would fall into this case even if layoutCallback has executed.
          // Assume high probability of continued no fill therefore do not
          // tear down.
          dev().info(TAG, 'unlayoutCallback - unrendered creative can remain');
          return false;
        }
    }
    if (this.isAmpCreative_) {
      // Allow AMP creatives to remain in case SERP viewer swipe back.
      return false;
    }
    const superResult = super.unlayoutCallback();
    this.element.setAttribute('data-amp-slot-index',
        this.win.ampAdSlotIdCounter++);
    this.lifecycleReporter_ = this.initLifecycleReporter();
    if (this.uniqueSlotId_) {
      sharedState.removeSlot(this.uniqueSlotId_);
    }
    if (this.ampAnalyticsElement_) {
      removeElement(this.ampAnalyticsElement_);
      this.ampAnalyticsElement_ = null;
    }
    this.ampAnalyticsConfig_ = null;
    this.qqid_ = null;
    this.isAmpCreative_ = null;
    return superResult;
  }

  /** @override */
  onLayoutMeasure() {
    super.onLayoutMeasure();

    if (this.isResponsive_() && !this.responsiveAligned_) {
      this.responsiveAligned_ = true;

      const layoutBox = this.getLayoutBox();

      // Nudge into the correct horizontal position by changing side margin.
      this.getVsync().run({
        measure: state => {
          state.direction =
            computedStyle(this.win, this.element)['direction'];
        },
        mutate: state => {
          if (state.direction == 'rtl') {
            setStyle(this.element, 'marginRight', layoutBox.left, 'px');
          } else {
            setStyle(this.element, 'marginLeft', -layoutBox.left, 'px');
          }
        },
      }, {direction: ''});
    }
  }

  /** @override */
  getPreconnectUrls() {
    this.preconnect.preload(getDefaultBootstrapBaseUrl(this.win, 'nameframe'));
    return ['https://googleads.g.doubleclick.net'];
  }

  /** @override */
  getA4aAnalyticsVars(analyticsTrigger) {
    return getCsiAmpAnalyticsVariables(analyticsTrigger, this, this.qqid_);
  }

  /** @override */
  getA4aAnalyticsConfig() {
    return getCsiAmpAnalyticsConfig();
  }

  /**
   * Calculates the appropriate height for a full-width responsive ad of the
   * given width.
   * @param {!{width: number, height: number}} viewportSize
   * @return {number}
   * @private
   */
  static getResponsiveHeightForContext_(viewportSize) {
    const minHeight = 100;
    const maxHeight = Math.min(300, viewportSize.height);
    // We aim for a 6:5 aspect ratio.
    const idealHeight = Math.round(viewportSize.width / 1.2);
    return clamp(idealHeight, minHeight, maxHeight);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdNetworkAdsenseImpl);
});
