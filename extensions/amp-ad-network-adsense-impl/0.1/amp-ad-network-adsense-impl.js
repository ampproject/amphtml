// Because AdSense and DoubleClick are both operated by Google and their A4A
// implementations share some behavior in common, part of the logic for this
// implementation is located in the ads/google/a4a directory rather than here.
// Most other ad networks will want to put their A4A code entirely in the
// extensions/amp-ad-network-${NETWORK_NAME}-impl directory.

import {
  addAmpExperimentIdToElement,
  addExperimentIdToElement,
  isInManualExperiment,
} from '#ads/google/a4a/traffic-experiments';
import {
  QQID_HEADER,
  SANDBOX_HEADER,
  ValidAdContainerTypes,
  addCsiSignalsToAmpAnalyticsConfig,
  additionalDimensions,
  extractAmpAnalyticsConfig,
  getCsiAmpAnalyticsConfig,
  getCsiAmpAnalyticsVariables,
  getEnclosingContainerTypes,
  getServeNpaPromise,
  googleAdUrl,
  isCdnProxy,
  isReportingEnabled,
  maybeAppendErrorParameter,
} from '#ads/google/a4a/utils';

import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';
import {removeElement} from '#core/dom';
import {domFingerprintPlain} from '#core/dom/fingerprint';
import {computedStyle, setStyles} from '#core/dom/style';
import {stringHash32} from '#core/types/string';
import {utf8Decode} from '#core/types/string/bytes';

import {
  getExperimentBranch,
  randomlySelectUnsetExperiments,
} from '#experiments';
import {AttributionReporting} from '#experiments/attribution-reporting';
import {StoryAdPlacements} from '#experiments/story-ad-placements';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';

import {Services} from '#service';
import {Navigation} from '#service/navigation';

import {getData} from '#utils/event-helper';
import {dev, devAssert, user} from '#utils/log';
import {isAttributionReportingAllowed} from '#utils/privacy-sandbox-utils';

import {AdsenseSharedState} from './adsense-shared-state';
import {ResponsiveState} from './responsive-state';

import {getDefaultBootstrapBaseUrl} from '../../../src/3p-frame';
import {insertAnalyticsElement} from '../../../src/extension-analytics';
import {getMode} from '../../../src/mode';
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {AMP_SIGNATURE_HEADER} from '../../amp-a4a/0.1/signature-verifier';
import {getAmpAdRenderOutsideViewport} from '../../amp-ad/0.1/concurrent-load';

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

    /** @private {?ResponsiveState}.  */
    this.responsiveState_ = ResponsiveState.createIfResponsive(element);

    /**
     * @private {?boolean} whether preferential rendered AMP creative, null
     * indicates no creative render.
     */
    this.isAmpCreative_ = null;

    /** @private {number} slot index specific to google inventory */
    this.ifi_ = 0;

    /**
     * Whether or not the iframe containing the ad should be sandboxed via the
     * "sandbox" attribute.
     * @private {boolean}
     */
    this.shouldSandbox_ = false;
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
    if (
      this.responsiveState_ != null &&
      !this.responsiveState_.isValidElement()
    ) {
      return false;
    }
    if (!this.element.getAttribute('data-ad-client')) {
      return false;
    }
    return this.isAmpAdElement();
  }

  /** @override */
  delayAdRequestEnabled() {
    return getAmpAdRenderOutsideViewport(this.element) || 3;
  }

  /** @override
      @return {!Promise|undefined}.
  */
  buildCallback() {
    super.buildCallback();

    // Convert the full-width tag to container width for desktop users.
    if (
      this.element.hasAttribute('data-auto-format') &&
      !ResponsiveState.isLayoutViewportNarrow(this.element)
    ) {
      return ResponsiveState.convertToContainerWidth(this.element).then(
        (state) => {
          if (state != null) {
            this.responsiveState_ = state;
          }
          this.divertExperiments();
        }
      );
    } else {
      return ResponsiveState.maybeUpgradeToResponsive(
        this.element,
        this.getAdClientId_()
      ).then((state) => {
        if (state != null) {
          this.responsiveState_ = state;
        }
        if (this.responsiveState_ != null) {
          return this.responsiveState_.attemptToMatchResponsiveHeight();
        }
        // This should happen last, as some diversion criteria rely on some of the
        // preceding logic (specifically responsive logic).
        this.divertExperiments();
      });
    }
  }

  /** @override */
  getConsentPolicy() {
    // Ensure that build is not blocked by need for consent (delay will occur
    // prior to ad URL construction).
    return null;
  }

  /**
   * Selects into experiments based on url fragment and/or page level diversion.
   * @visibleForTesting
   */
  divertExperiments() {
    const experimentInfoList =
      /** @type {!Array<!../../../src/experiments.ExperimentInfo>} */ ([
        {
          experimentId: AttributionReporting.ID,
          isTrafficEligible: () =>
            isAttributionReportingAllowed(this.win.document),
          branches: [
            AttributionReporting.ENABLE,
            AttributionReporting.DISABLE,
            AttributionReporting.ENABLE_NO_ASYNC,
            AttributionReporting.DISABLE_NO_ASYNC,
          ],
        },
      ]);
    const setExps = randomlySelectUnsetExperiments(
      this.win,
      experimentInfoList
    );
    Object.keys(setExps).forEach((expName) =>
      addExperimentIdToElement(setExps[expName], this.element)
    );

    const ssrExpIds = this.getSsrExpIds_();
    for (let i = 0; i < ssrExpIds.length; i++) {
      addAmpExperimentIdToElement(ssrExpIds[i], this.element);
    }

    const storyAdPlacementsExpId = getExperimentBranch(
      this.win,
      StoryAdPlacements.ID
    );
    if (storyAdPlacementsExpId) {
      addExperimentIdToElement(storyAdPlacementsExpId, this.element);
    }

    const storyAdSegmentBranch = getExperimentBranch(
      this.win,
      StoryAdSegmentExp.ID
    );
    if (storyAdSegmentBranch) {
      addExperimentIdToElement(storyAdSegmentBranch, this.element);
    }
  }

  /**
   * @return {string} ad client ID for the current ad unit.
   * @private
   */
  getAdClientId_() {
    const adClientId = (
      this.element.getAttribute('data-ad-client') || ''
    ).toLowerCase();
    if (!/^ca-/i.test(adClientId)) {
      return `ca-${adClientId}`;
    }
    return adClientId;
  }

  /** @override */
  getAdUrl(consentTuple, opt_unusedRtcResponsesPromise, opt_serveNpaSignal) {
    let consentState = undefined;
    let consentString = undefined;
    let gdprApplies = undefined;
    let additionalConsent = undefined;
    let consentStringType = undefined;
    let consentSharedData = undefined;
    if (consentTuple) {
      consentState = consentTuple.consentState;
      consentString = consentTuple.consentString;
      gdprApplies = consentTuple.gdprApplies;
      additionalConsent = consentTuple.additionalConsent;
      consentStringType = consentTuple.consentStringType;
      consentSharedData = consentTuple.consentSharedData;
    }
    if (
      consentState == CONSENT_POLICY_STATE.UNKNOWN &&
      this.element.getAttribute('data-npa-on-unknown-consent') != 'true'
    ) {
      user().info(TAG, 'Ad request suppressed due to unknown consent');
      return Promise.resolve('');
    }
    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after moving it someplace common.
    const startTime = Date.now();
    const global = this.win;
    const adClientId = this.getAdClientId_();
    const adTestOn =
      this.element.getAttribute('data-adtest') ||
      isInManualExperiment(this.element);

    const width = Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('height'));
    if (
      this.responsiveState_ != null &&
      this.responsiveState_.isContainerWidthState()
    ) {
      this.size_ = {width, height};
    } else {
      this.size_ = this.getIntersectionElementLayoutBox();
    }

    const sizeToSend = this.isSinglePageStoryAd
      ? {width: 1, height: 1}
      : this.size_;
    const format = `${sizeToSend.width}x${sizeToSend.height}`;
    const slotId = this.element.getAttribute('data-amp-slot-index');
    // data-amp-slot-index is set by the upgradeCallback method of amp-ad.
    // TODO(bcassels): Uncomment the assertion, fixing the tests.
    // But not all tests arrange to call upgradeCallback.
    // devAssert(slotId != undefined);
    const adk = this.adKey_(format);
    this.uniqueSlotId_ = slotId + adk;
    const slotname = this.element.getAttribute('data-ad-slot');
    const sharedStateParams = sharedState.addNewSlot(
      format,
      this.uniqueSlotId_,
      adClientId,
      slotname
    );
    const viewportSize = this.getViewport().getSize();
    if (!this.ifi_) {
      this.win['ampAdGoogleIfiCounter'] =
        this.win['ampAdGoogleIfiCounter'] || 1;
      this.ifi_ = this.win['ampAdGoogleIfiCounter']++;
    }
    const enclosingContainers = getEnclosingContainerTypes(this.element);
    const pfx =
      enclosingContainers.includes(
        ValidAdContainerTypes['AMP-FX-FLYING-CARPET']
      ) || enclosingContainers.includes(ValidAdContainerTypes['AMP-STICKY-AD']);
    const parameters = {
      'client': adClientId,
      'format': format,
      'w': sizeToSend.width,
      'h': sizeToSend.height,
      'ptt': 12,
      'iu': slotname,
      'fa': {bottom: 1, top: 2}[this.element.getAttribute('sticky')],
      'npa':
        consentState == CONSENT_POLICY_STATE.INSUFFICIENT ||
        consentState == CONSENT_POLICY_STATE.UNKNOWN ||
        !!opt_serveNpaSignal
          ? 1
          : null,
      'adtest': adTestOn ? 'on' : null,
      'adk': adk,
      'output': 'html',
      'bc': global.SVGElement && global.document.createElementNS ? '1' : null,
      'ctypes': this.getCtypes_(),
      'host': this.element.getAttribute('data-ad-host'),
      'h_ch': this.element.getAttribute('data-ad-host-channel'),
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
      'ifi': this.ifi_,
      'rafmt':
        this.responsiveState_ != null
          ? this.responsiveState_.getRafmtParam()
          : null,
      'gdpr': gdprApplies === true ? '1' : gdprApplies === false ? '0' : null,
      'gdpr_consent':
        consentStringType != CONSENT_STRING_TYPE.US_PRIVACY_STRING
          ? consentString
          : null,
      'addtl_consent': additionalConsent,
      'us_privacy':
        consentStringType == CONSENT_STRING_TYPE.US_PRIVACY_STRING
          ? consentString
          : null,
      'pfx': pfx ? '1' : '0',
      'aanf': /^(true|false)$/i.test(this.element.getAttribute('data-no-fill'))
        ? this.element.getAttribute('data-no-fill')
        : null,
      // Matched content specific fields.
      'crui': this.element.getAttribute('data-matched-content-ui-type'),
      'cr_row': this.element.getAttribute('data-matched-content-rows-num'),
      'cr_col': this.element.getAttribute('data-matched-content-columns-num'),
      // Package code (also known as URL group) that was used to
      // create ad.
      'pwprc': this.element.getAttribute('data-package'),
      'spsa': this.isSinglePageStoryAd
        ? `${this.size_.width}x${this.size_.height}`
        : null,
      'tfcd': consentSharedData?.['adsense-tfcd'] ?? null,
      'tfua': consentSharedData?.['adsense-tfua'] ?? null,
    };

    const experimentIds = [];
    return googleAdUrl(
      this,
      ADSENSE_BASE_URL,
      startTime,
      {
        ...parameters,
      },
      experimentIds
    );
  }

  /** @override */
  getServeNpaSignal() {
    return getServeNpaPromise(this.element);
  }

  /** @override */
  onNetworkFailure(error, adUrl) {
    dev().info(TAG, 'network error, attempt adding of error parameter', error);
    return {adUrl: maybeAppendErrorParameter(adUrl, 'n')};
  }

  /** @override */
  maybeValidateAmpCreative(bytes, headers) {
    if (headers.get('AMP-Verification-Checksum-Algorithm') !== 'djb2a-32') {
      return super.maybeValidateAmpCreative(bytes, headers);
    }
    const checksum = headers.get('AMP-Verification-Checksum');
    return Promise.resolve(
      checksum && stringHash32(utf8Decode(bytes)) == checksum ? bytes : null
    );
  }

  /** @override */
  extractSize(responseHeaders) {
    this.ampAnalyticsConfig_ = extractAmpAnalyticsConfig(this, responseHeaders);
    this.qqid_ = responseHeaders.get(QQID_HEADER);
    this.shouldSandbox_ = responseHeaders.get(SANDBOX_HEADER) == 'true';
    if (this.ampAnalyticsConfig_) {
      // Load amp-analytics extensions
      this.extensions_./*OK*/ installExtensionForDoc(
        this.getAmpDoc(),
        'amp-analytics'
      );
    }
    return this.size_;
  }

  /**
   * @override
   */
  skipClientSideValidation(headers) {
    return headers && !headers.has(AMP_SIGNATURE_HEADER);
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
      this.win.location.search
    );
    // If the RE passes, then length is necessarily > 1.
    if (ctypesReMatch) {
      return ctypesReMatch[1];
    }
    return null;
  }

  /** @override */
  isXhrAllowed() {
    return isCdnProxy(this.win);
  }

  /** @override */
  sandboxHTMLCreativeFrame() {
    return this.shouldSandbox_;
  }

  /** @override */
  onCreativeRender(creativeMetaData) {
    super.onCreativeRender(creativeMetaData);
    if (this.iframe != null) {
      ResponsiveState.maybeAttachSettingsListener(
        this.element,
        this.iframe,
        this.getAdClientId_()
      );
    }
    this.isAmpCreative_ = !!creativeMetaData;
    if (
      creativeMetaData &&
      !creativeMetaData.customElementExtensions.includes('amp-ad-exit')
    ) {
      // Capture phase click handlers on the ad if amp-ad-exit not present
      // (assume it will handle capture).
      devAssert(this.iframe);
      Navigation.installAnchorClickInterceptor(
        this.getAmpDoc(),
        devAssert(this.iframe.contentWindow)
      );
    }
    if (this.ampAnalyticsConfig_) {
      devAssert(!this.ampAnalyticsElement_);
      if (isReportingEnabled(this)) {
        addCsiSignalsToAmpAnalyticsConfig(
          this.win,
          this.element,
          this.ampAnalyticsConfig_,
          this.qqid_,
          !!creativeMetaData
        );
      }
      this.ampAnalyticsElement_ = insertAnalyticsElement(
        this.element,
        this.ampAnalyticsConfig_,
        /*loadAnalytics*/ true,
        !!this.postAdResponseExperimentFeatures['avr_disable_immediate']
      );
    }

    setStyles(dev().assertElement(this.iframe), {
      width: `${this.size_.width}px`,
      height: `${this.size_.height}px`,
    });

    if (this.qqid_) {
      this.element.setAttribute('data-google-query-id', this.qqid_);
    }
    dev().assertElement(this.iframe).id = `google_ads_iframe_${this.ifi_}`;
  }

  /** @override */
  unlayoutCallback() {
    if (this.isAmpCreative_) {
      // Allow AMP creatives to remain in case SERP viewer swipe back.
      return false;
    }
    const superResult = super.unlayoutCallback();
    this.element.setAttribute(
      'data-amp-slot-index',
      this.win.ampAdSlotIdCounter++
    );
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
    this.shouldSandbox_ = false;
    return superResult;
  }

  /** @override */
  onLayoutMeasure() {
    super.onLayoutMeasure();
    this.responsiveState_ && this.responsiveState_.alignToViewport();
  }

  /** @override */
  getPreconnectUrls() {
    Services.preconnectFor(this.win).preload(
      this.getAmpDoc(),
      getDefaultBootstrapBaseUrl(this.win, 'nameframe')
    );
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

  /** @override */
  letCreativeTriggerRenderStart() {
    if (
      this.element &&
      this.element.parentElement &&
      this.element.parentElement.tagName == 'AMP-STICKY-AD'
    ) {
      const stickyMsgListener = (event) => {
        if (
          getData(event) == 'fill_sticky' &&
          event['source'] == this.iframe.contentWindow
        ) {
          this.renderStarted();
          setStyles(this.iframe, {'visibility': ''});
          this.win.removeEventListener('message', stickyMsgListener);
        }
      };
      this.win.addEventListener('message', stickyMsgListener);
      return true;
    }
    return false;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkAdsenseImpl);
});
