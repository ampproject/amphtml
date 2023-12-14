// Because AdSense and DoubleClick are both operated by Google and their A4A
// implementations share some behavior in common, part of the logic for this
// implementation is located in the ads/google/a4a directory rather than here.
// Most other ad networks will want to put their A4A code entirely in the
// extensions/amp-ad-network-${NETWORK_NAME}-impl directory.

import '#service/real-time-config/real-time-config-impl';
import {
  lineDelimitedStreamer,
  metaJsonCreativeGrouper,
} from '#ads/google/a4a/line-delimited-response-handler';
import {
  addAmpExperimentIdToElement,
  addExperimentIdToElement,
  extractUrlExperimentId,
  isInManualExperiment,
} from '#ads/google/a4a/traffic-experiments';
import {
  AmpAnalyticsConfigDef,
  QQID_HEADER,
  SANDBOX_HEADER,
  ValidAdContainerTypes,
  addCsiSignalsToAmpAnalyticsConfig,
  extractAmpAnalyticsConfig,
  getCsiAmpAnalyticsConfig,
  getCsiAmpAnalyticsVariables,
  getEnclosingContainerTypes,
  getServeNpaPromise,
  googleAdUrl,
  googleBlockParameters,
  googlePageParameters,
  groupAmpAdsByType,
  isCdnProxy,
  isReportingEnabled,
  maybeAppendErrorParameter,
  truncAndTimeUrl,
} from '#ads/google/a4a/utils';
import {getMultiSizeDimensions} from '#ads/google/utils';

import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';
import {Deferred} from '#core/data-structures/promise';
import {createElementWithAttributes, isRTL, removeElement} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {domFingerprintPlain} from '#core/dom/fingerprint';
import {Layout_Enum, isLayoutSizeDefined} from '#core/dom/layout';
import {getPageLayoutBoxBlocking} from '#core/dom/layout/page-layout-box';
import {
  assertDoesNotContainDisplay,
  setImportantStyles,
  setStyles,
} from '#core/dom/style';
import {isArray} from '#core/types';
import {deepMerge} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';
import {stringHash32} from '#core/types/string';
import {getCryptoRandomBytesArray, utf8Decode} from '#core/types/string/bytes';
import {parseQueryString} from '#core/types/string/url';
import {WindowInterface} from '#core/window/interface';

import {
  getExperimentBranch,
  isExperimentOn,
  randomlySelectUnsetExperiments,
} from '#experiments';
import {AttributionReporting} from '#experiments/attribution-reporting';
import {StoryAdPlacements} from '#experiments/story-ad-placements';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';

import {Services} from '#service';
import {Navigation} from '#service/navigation';
import {RTC_VENDORS} from '#service/real-time-config/callout-vendors';

import {dev, devAssert, user} from '#utils/log';
import {isAttributionReportingAllowed} from '#utils/privacy-sandbox-utils';

import {
  FlexibleAdSlotDataTypeDef,
  getFlexibleAdSlotData,
} from './flexible-ad-slot-utils';
import {SafeframeHostApi} from './safeframe-host';
import {
  TFCD,
  TFUA,
  constructSRABlockParameters,
  serializeTargeting,
  sraBlockCallbackHandler,
} from './sra-utils';

import {getOrCreateAdCid} from '../../../src/ad-cid';
import {isCancellation} from '../../../src/error-reporting';
import {insertAnalyticsElement} from '../../../src/extension-analytics';
import {getMode} from '../../../src/mode';
import {
  AmpA4A,
  ConsentTupleDef,
  DEFAULT_SAFEFRAME_VERSION,
  XORIGIN_MODE,
  assignAdUrlToError,
} from '../../amp-a4a/0.1/amp-a4a';
import {
  RefreshManager, // eslint-disable-line @typescript-eslint/no-unused-vars
  getRefreshManager,
} from '../../amp-a4a/0.1/refresh-manager';
import {AMP_SIGNATURE_HEADER} from '../../amp-a4a/0.1/signature-verifier';
import {
  getAmpAdRenderOutsideViewport,
  incrementLoadingAds,
  is3pThrottled,
  waitFor3pThrottle,
} from '../../amp-ad/0.1/concurrent-load';

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

/** @const {string} */
const ZINDEX_EXP = 'zIndexExp';

/**@const @enum{string} */
const ZINDEX_EXP_BRANCHES = {
  NO_ZINDEX: '21065356',
  HOLDBACK: '21065357',
};

/** @const {string} */
const IDLE_CWV_EXP = 'dfp-render-on-idle-cwv-exp';

/** @const @enum{string} */
const IDLE_CWV_EXP_BRANCHES = {
  CONTROL: '20208860',
  EXPERIMENT: '20208859',
};

/**
 * Required size to be sent with fluid requests.
 * @const {string}
 */
const DUMMY_FLUID_SIZE = '320x50';

/** @const @private {string} attribute indicating if lazy fetch is enabled.*/
const LAZY_FETCH_ATTRIBUTE = 'data-lazy-fetch';

/**
 * Macros that can be expanded in json targeting attribute.
 */
const TARGETING_MACRO_ALLOWLIST = {
  'CLIENT_ID': true,
};

/**
 * Map of pageview tokens to the instances they belong to.
 * @private {!{[key: string]: !AmpAdNetworkDoubleclickImpl}}
 */
let tokensToInstances = {};

/** @private {?Promise} */
let sraRequests = null;

/**
 * The random subdomain to load SafeFrame from, if SafeFrame is
 * being loaded from a random subdomain and if the subdomain
 * has been generated.
 * @private {?string}
 */
let safeFrameRandomSubdomain = null;

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

/** @typedef {{width: number, height: number}} */
let SizeDef;

/** @typedef {(SizeDef|../../../src/layout-rect.LayoutRectDef)} */
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

    /** @private @const {?../../../src/service/performance-impl.Performance} */
    this.performance_ = Services.performanceForOrNull(this.win);

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

    /** @type {?JsonObject|Object} */
    this.jsonTargeting = null;

    /** @type {string} */
    this.adKey = '0';

    /** @type {!Array<string>} */
    this.experimentIds = [];

    /** @type {!Array<string>} */
    this.ampExperimentIds = [];

    /** @protected {boolean} */
    this.useSra = false;

    /** @protected {?Deferred<?Response>} */
    this.sraDeferred = null;

    /** @private {?RefreshManager} */
    this.refreshManager_ = null;

    /** @private {number} */
    this.refreshCount_ = 0;

    /** @private {number} */
    this.ifi_ = 0;

    /** @private {boolean} */
    this.isFluidRequest_ = false;

    /**
     * @private {boolean}
     * Indicates that the primary size of the slot is fluid.
     */
    this.isFluidPrimaryRequest_ = false;

    /** @private {?string} */
    this.fluidImpressionUrl_ = null;

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
        user().warn(
          TAG,
          'Ignoring invalid data-force-safeframe attribute: ' +
            this.element.dataset['forceSafeframe']
        );
      } else {
        this.forceSafeframe = true;
      }
    }

    /** @protected {ConsentTupleDef} */
    this.consentTuple = {};

    /** @protected {!Deferred<string>} */
    this.getAdUrlDeferred = new Deferred();

    /**
     * @private {boolean}
     * Set to true when initial expansion effort fails. If true, the slot will
     * attempt to expand again when outside of the viewport.
     */
    this.reattemptToExpandFluidCreative_ = false;

    /**
     * Whether or not the iframe containing the ad should be sandboxed via the
     * "sandbox" attribute.
     * @private {boolean}
     */
    this.shouldSandbox_ = false;

    /**
     * Set after the ad request is built.
     * @private {?FlexibleAdSlotDataTypeDef}
     */
    this.flexibleAdSlotData_ = null;

    /**
     * If true, will add a z-index to flex ad slots upon expansion.
     * @private {boolean}
     */
    this.inZIndexHoldBack_ = false;

    /**
     * A signal from publishers to serve NPA through ad url.
     * @private {boolean}
     */
    this.serveNpaSignal_ = false;
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

    if (vpRange) {
      return vpRange;
    }

    let fallbackRange = 12;
    if (!this.performance_) {
      return fallbackRange;
    }

    const idleCwvExpSelectedBranch = getExperimentBranch(
      this.win,
      IDLE_CWV_EXP
    );
    if (idleCwvExpSelectedBranch === IDLE_CWV_EXP_BRANCHES.CONTROL) {
      this.performance_.addEnabledExperiment('dfp-idle-cwv-control');
    } else if (idleCwvExpSelectedBranch === IDLE_CWV_EXP_BRANCHES.EXPERIMENT) {
      fallbackRange = 3;
      this.performance_.addEnabledExperiment('dfp-idle-cwv-exp');
    }
    return fallbackRange;
  }

  /** @override */
  idleRenderOutsideViewport() {
    const vpRange = this.getIdleRenderEnabled_();
    if (vpRange === false) {
      return vpRange;
    }
    const renderOutsideViewport = this.renderOutsideViewport();
    // False will occur when throttle in effect.
    if (typeof renderOutsideViewport === 'boolean') {
      return renderOutsideViewport;
    }
    this.isIdleRender_ = true;
    // NOTE(keithwrightbos): handle race condition where previous
    // idleRenderOutsideViewport marked slot as idle render despite never
    // being schedule due to being beyond viewport max offset.  If slot
    // comes within standard outside viewport range, then ensure throttling
    // will not be applied.
    this.whenWithinViewport(renderOutsideViewport).then(
      () => (this.isIdleRender_ = false)
    );
    return vpRange;
  }

  /** @override */
  isLayoutSupported(layout) {
    this.isFluidPrimaryRequest_ = layout == Layout_Enum.FLUID;
    this.isFluidRequest_ = this.isFluidRequest_ || this.isFluidPrimaryRequest_;
    return this.isFluidPrimaryRequest_ || isLayoutSizeDefined(layout);
  }

  /** @override */
  isValidElement() {
    return this.isAmpAdElement();
  }

  /**
   * Executes page level experiment diversion and pushes any experiment IDs
   * onto this.experimentIds.
   * @param {?string} urlExperimentId
   * @visibleForTesting
   */
  setPageLevelExperiments(urlExperimentId) {
    let forcedExperimentId;
    if (urlExperimentId) {
      forcedExperimentId = {
        // SRA
        '7': DOUBLECLICK_SRA_EXP_BRANCHES.SRA_CONTROL,
        '8': DOUBLECLICK_SRA_EXP_BRANCHES.SRA,
        '9': DOUBLECLICK_SRA_EXP_BRANCHES.SRA_NO_RECOVER,
      }[urlExperimentId];
      if (forcedExperimentId) {
        this.experimentIds.push(forcedExperimentId);
      }
    }
    const experimentInfoList =
      /** @type {!Array<!../../../src/experiments.ExperimentInfo>} */ ([
        {
          experimentId: DOUBLECLICK_SRA_EXP,
          isTrafficEligible: () =>
            !forcedExperimentId &&
            !this.win.document./*OK*/ querySelector(
              'meta[name=amp-ad-enable-refresh], ' +
                'amp-ad[type=doubleclick][data-enable-refresh], ' +
                'meta[name=amp-ad-doubleclick-sra]'
            ),
          branches: Object.keys(DOUBLECLICK_SRA_EXP_BRANCHES).map(
            (key) => DOUBLECLICK_SRA_EXP_BRANCHES[key]
          ),
        },
        {
          experimentId: ZINDEX_EXP,
          isTrafficEligible: () => true,
          branches: Object.values(ZINDEX_EXP_BRANCHES),
        },
        {
          experimentId: IDLE_CWV_EXP,
          isTrafficEligible: () => {
            return (
              !!this.performance_ &&
              !this.element.getAttribute('data-loading-strategy')
            );
          },
          branches: Object.values(IDLE_CWV_EXP_BRANCHES),
        },
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
    const setExps = this.randomlySelectUnsetExperiments_(experimentInfoList);
    Object.keys(setExps).forEach(
      (expName) => setExps[expName] && this.experimentIds.push(setExps[expName])
    );

    const ssrExpIds = this.getSsrExpIds_();
    for (let i = 0; i < ssrExpIds.length; i++) {
      addAmpExperimentIdToElement(ssrExpIds[i], this.element);
    }
    if (setExps[ZINDEX_EXP] == ZINDEX_EXP_BRANCHES.HOLDBACK) {
      this.inZIndexHoldBack_ = true;
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
   * For easier unit testing.
   * @param {!Array<!../../../src/experiments.ExperimentInfo>} experimentInfoList
   * @return {!{[key: string]: string}}
   */
  randomlySelectUnsetExperiments_(experimentInfoList) {
    return randomlySelectUnsetExperiments(this.win, experimentInfoList);
  }

  /**
   * For easier unit testing.
   * @return {?string}
   */
  extractUrlExperimentId_() {
    return extractUrlExperimentId(this.win, this.element);
  }

  /** @private */
  maybeDeprecationWarn_() {
    const warnDeprecation = (feature) =>
      user().warn(
        TAG,
        `${feature} is no longer supported for DoubleClick.` +
          'Please refer to ' +
          'https://github.com/ampproject/amphtml/issues/11834 ' +
          'for more information'
      );
    const usdrd = 'useSameDomainRenderingUntilDeprecated';
    const hasUSDRD =
      usdrd in this.element.dataset ||
      (tryParseJson(this.element.getAttribute('json')) || {})[usdrd];
    if (hasUSDRD) {
      warnDeprecation(usdrd);
    }
    const useRemoteHtml =
      this.getAmpDoc().getMetaByName('amp-3p-iframe-src') !== null;
    if (useRemoteHtml) {
      warnDeprecation('remote.html');
    }
  }

  /** @override */
  delayAdRequestEnabled() {
    if (this.element.getAttribute(LAZY_FETCH_ATTRIBUTE) !== 'true') {
      return false;
    }
    return getAmpAdRenderOutsideViewport(this.element) || 3;
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.maybeDeprecationWarn_();
    this.setPageLevelExperiments(this.extractUrlExperimentId_());
    const pubEnabledSra = !!this.win.document.querySelector(
      'meta[name=amp-ad-doubleclick-sra]'
    );
    const delayFetchEnabled = !!this.win.document.querySelector(
      `amp-ad[type=doubleclick][${escapeCssSelectorIdent(
        LAZY_FETCH_ATTRIBUTE
      )}=true]`
    );
    if (pubEnabledSra && delayFetchEnabled) {
      user().warn(
        TAG,
        'SRA is not compatible with lazy fetching, disabling SRA'
      );
    }
    this.useSra =
      !delayFetchEnabled &&
      ((getMode().localDev &&
        /(\?|&)force_sra=true(&|$)/.test(this.win.location.search)) ||
        pubEnabledSra ||
        [
          DOUBLECLICK_SRA_EXP_BRANCHES.SRA,
          DOUBLECLICK_SRA_EXP_BRANCHES.SRA_NO_RECOVER,
        ].some((eid) => this.experimentIds.indexOf(eid) >= 0));
    this.troubleshootData_.slotId = this.element.getAttribute('data-slot');
    this.troubleshootData_.slotIndex = this.element.getAttribute(
      'data-amp-slot-index'
    );
    if (!this.isFluidRequest_) {
      const multiSizeStr = this.element.getAttribute('data-multi-size');
      this.isFluidRequest_ =
        !!multiSizeStr && multiSizeStr.indexOf('fluid') != -1;
    }
  }

  /** @override */
  shouldPreferentialRenderWithoutCrypto() {
    devAssert(!isCdnProxy(this.win));
    return true;
  }

  /**
   * @param {?ConsentTupleDef} consentTuple
   * @param {!Array<!AmpAdNetworkDoubleclickImpl>=} instances
   * @return {!{[key: string]: string|boolean|number}}
   * @visibleForTesting
   */
  getPageParameters(consentTuple, instances) {
    instances = instances || [this];
    const tokens = getPageviewStateTokensForAdRequest(instances);
    const {
      additionalConsent,
      consentSharedData,
      consentString,
      consentStringType,
      gdprApplies,
    } = consentTuple;

    const tfcdFromSharedData = consentSharedData?.['doubleclick-tfcd'];
    const tfuaFromSharedData = consentSharedData?.['doubleclick-tfua'];
    const tfcdFromJson = this.jsonTargeting && this.jsonTargeting[TFCD];
    const tfuaFromJson = this.jsonTargeting && this.jsonTargeting[TFUA];

    return {
      'ptt': 13,
      'npa':
        consentTuple.consentState == CONSENT_POLICY_STATE.INSUFFICIENT ||
        consentTuple.consentState == CONSENT_POLICY_STATE.UNKNOWN ||
        this.serveNpaSignal_
          ? 1
          : null,
      'gdfp_req': '1',
      'sfv': DEFAULT_SAFEFRAME_VERSION,
      'u_sd': WindowInterface.getDevicePixelRatio(),
      'gct': this.getLocationQueryParameterValue('google_preview') || null,
      'psts': tokens.length ? tokens : null,
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
      'tfcd': combineConsentParams(tfcdFromSharedData, tfcdFromJson),
      'tfua': combineConsentParams(tfuaFromSharedData, tfuaFromJson),
    };
  }

  /**
   * @override
   */
  skipClientSideValidation(headers) {
    return headers && !headers.has(AMP_SIGNATURE_HEADER);
  }

  /**
   * Constructs block-level url parameters.
   * @return {!{[key: string]: string|boolean|number}}
   */
  getBlockParameters_() {
    devAssert(this.initialSize_);
    this.win['ampAdGoogleIfiCounter'] = this.win['ampAdGoogleIfiCounter'] || 1;
    this.ifi_ =
      (this.isRefreshing && this.ifi_) || this.win['ampAdGoogleIfiCounter']++;
    const pageLayoutBox = this.isSinglePageStoryAd
      ? getPageLayoutBoxBlocking(this.element)
      : null;
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

    // For amp-sticky-ad, it returns 0, so we follow them for amp-ad sticky ads here.
    if (this.uiHandler.isStickyAd()) {
      msz = '0x-1';
      psz = '0x-1';
    } else {
      msz = `${slotWidth == -1 ? parentWidth : slotWidth}x-1`;
      psz = `${parentWidth}x-1`;
    }
    fws = fwSignal ? fwSignal : '0';
    return {
      'iu': this.element.getAttribute('data-slot'),
      'co':
        this.jsonTargeting && this.jsonTargeting['cookieOptOut'] ? '1' : null,
      'adk': this.adKey,
      'sz': this.isSinglePageStoryAd ? '1x1' : this.parameterSize,
      'output': 'html',
      'impl': 'ifr',
      'adtest': isInManualExperiment(this.element) ? 'on' : null,
      'ifi': this.ifi_,
      'rc': this.refreshCount_ || null,
      'fluid': this.isFluidRequest_ ? 'height' : null,
      'fsf': this.forceSafeframe ? '1' : null,
      'msz': msz,
      'psz': psz,
      'fws': fws,
      'scp': serializeTargeting(
        (this.jsonTargeting && this.jsonTargeting['targeting']) || null,
        (this.jsonTargeting && this.jsonTargeting['categoryExclusions']) ||
          null,
        null
      ),
      'spsa': this.isSinglePageStoryAd
        ? `${pageLayoutBox.width}x${pageLayoutBox.height}`
        : null,
      'ppid': (this.jsonTargeting && this.jsonTargeting['ppid']) || null,
      ...googleBlockParameters(this),
    };
  }

  /**
   * Populate's block-level state for ad URL construction.
   * Sets initialSize_ , jsonTargeting, and adKey member fields.
   * @param {ConsentTupleDef} consentTuple
   * @visibleForTesting
   */
  populateAdUrlState(consentTuple) {
    this.consentTuple = consentTuple;
    // Allow for pub to override height/width via override attribute.
    const width =
      Number(this.element.getAttribute('data-override-width')) ||
      Number(this.element.getAttribute('width'));
    const height =
      Number(this.element.getAttribute('data-override-height')) ||
      Number(this.element.getAttribute('height'));
    this.initialSize_ = this.isFluidPrimaryRequest_
      ? {width: 0, height: 0}
      : width && height
        ? // width/height could be 'auto' in which case we fallback to measured.
          {width, height}
        : this.getIntersectionElementLayoutBox();
    this.jsonTargeting = tryParseJson(this.element.getAttribute('json')) || {};
    this.adKey = this.generateAdKey_(
      `${this.initialSize_.width}x${this.initialSize_.height}`
    );
    this.parameterSize = this.getParameterSize_();
  }

  /** @override */
  getConsentPolicy() {
    // Ensure that build is not blocked by need for consent (delay will occur
    // prior to RTC & ad URL construction).
    return null;
  }

  /** @override */
  getAdUrl(opt_consentTuple, opt_rtcResponsesPromise, opt_serveNpaSignal) {
    if (this.useSra) {
      this.sraDeferred = this.sraDeferred || new Deferred();
    }
    this.serveNpaSignal_ = !!opt_serveNpaSignal;
    const consentTuple = opt_consentTuple || {};
    if (
      consentTuple.consentState == CONSENT_POLICY_STATE.UNKNOWN &&
      this.element.getAttribute('data-npa-on-unknown-consent') != 'true'
    ) {
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
    this.populateAdUrlState(consentTuple);
    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after moving it someplace common.
    const startTime = Date.now();
    const timerService = Services.timerFor(this.win);

    const checkStillCurrent = this.verifyStillCurrent();

    const rtcParamsPromise = opt_rtcResponsesPromise.then((results) => {
      checkStillCurrent();
      return this.mergeRtcResponses_(results);
    });

    const targetingExpansionPromise = timerService
      .timeoutPromise(1000, this.expandJsonTargeting_(rtcParamsPromise))
      .catch(() => {
        dev().warn(TAG, 'JSON Targeting expansion failed/timed out.');
      });

    Promise.all([rtcParamsPromise, targetingExpansionPromise]).then(
      (results) => {
        checkStillCurrent();
        const rtcParams = results[0];
        googleAdUrl(
          this,
          DOUBLECLICK_BASE_URL,
          startTime,
          Object.assign(
            this.getBlockParameters_(),
            this.getPageParameters(consentTuple, /* instances= */ undefined),
            rtcParams
          ),
          this.experimentIds
        ).then((adUrl) => this.getAdUrlDeferred.resolve(adUrl));
      }
    );
    this.troubleshootData_.adUrl = this.getAdUrlDeferred.promise;
    return this.getAdUrlDeferred.promise;
  }

  /** @override */
  getServeNpaSignal() {
    return getServeNpaPromise(this.element);
  }

  /**
   * Waits for RTC to complete, then overwrites json attr targeting values
   * with expanded vars.
   * @param {!Promise} rtcMergedPromise
   * @return {!Promise}
   */
  expandJsonTargeting_(rtcMergedPromise) {
    return rtcMergedPromise.then(() => {
      const targeting = this.jsonTargeting['targeting'];
      if (!targeting) {
        return Promise.resolve();
      }
      const expansionPromises = Object.keys(targeting).map((key) =>
        this.expandValue_(targeting[key]).then((expanded) => {
          targeting[key] = expanded;
        })
      );
      return Promise.all(expansionPromises);
    });
  }

  /**
   * Expands json targeting values.
   * @param {string|Array<string>|null} value
   * @return {!Promise<string>|!Promise<Array<string>>}
   */
  expandValue_(value) {
    if (!value) {
      return Promise.resolve(value);
    }
    if (isArray(value)) {
      return Promise.all(
        value.map((arrVal) => this.expandString_(dev().assertString(arrVal)))
      );
    }
    return this.expandString_(dev().assertString(value));
  }

  /**
   * Expands macros in strings.
   * @param {string} string
   * @return {!Promise<string>}
   */
  expandString_(string) {
    return Services.urlReplacementsForDoc(
      this.element
    )./*OK*/ expandStringAsync(
      string,
      undefined /*opt_bindings*/,
      TARGETING_MACRO_ALLOWLIST
    );
  }

  /**
   * Merges all of the rtcResponses into the JSON targeting and
   * category exclusions.
   * @param {?Array<!rtcResponseDef>} rtcResponseArray
   * @return {?Object|undefined}
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
    rtcResponseArray.forEach((rtcResponse) => {
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
            rtcResponse.callout
          );
          this.jsonTargeting['targeting'] = !!this.jsonTargeting['targeting']
            ? deepMerge(this.jsonTargeting['targeting'], rewrittenResponse)
            : rewrittenResponse;
        }
        if (rtcResponse.response['categoryExclusions']) {
          if (!exclusions) {
            exclusions = {};
            if (this.jsonTargeting['categoryExclusions']) {
              /** @type {!Array} */ (
                this.jsonTargeting['categoryExclusions']
              ).forEach((exclusion) => {
                exclusions[exclusion] = true;
              });
            }
          }
          /** @type {!Array} */ (
            rtcResponse.response['categoryExclusions']
          ).forEach((exclusion) => {
            exclusions[exclusion] = true;
          });
        }
        if (rtcResponse.response['ppid']) {
          this.jsonTargeting['ppid'] = rtcResponse.response['ppid'];
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
     * This lists allowed attributes on the amp-ad element to be used as
     * macros for constructing the RTC URL. Add attributes here, in lowercase,
     * to make them available.
     */
    const allowlist = {
      'height': true,
      'width': true,
      'json': true,
      'data-slot': true,
      'data-multi-size': true,
      'data-multi-size-validation': true,
      'data-override-width': true,
      'data-override-height': true,
      'data-amp-slot-index': true,
    };
    return {
      PAGEVIEWID: () => Services.documentInfoForDoc(this.element).pageViewId,
      PAGEVIEWID_64: () =>
        Services.documentInfoForDoc(this.element).pageViewId64,
      HREF: () => this.win.location.href,
      REFERRER: (opt_timeout) => this.getReferrer_(opt_timeout),
      TGT: () =>
        JSON.stringify(
          (tryParseJson(this.element.getAttribute('json')) || {})['targeting']
        ),
      ADCID: (opt_timeout) =>
        getOrCreateAdCid(
          this.getAmpDoc(),
          'AMP_ECID_GOOGLE',
          '_ga',
          parseInt(opt_timeout, 10)
        ),
      ATTR: (name) => {
        if (!allowlist[name.toLowerCase()]) {
          dev().warn(TAG, `Invalid attribute ${name}`);
        } else {
          return this.element.getAttribute(name);
        }
      },
      ELEMENT_POS: () => getPageLayoutBoxBlocking(this.element).top,
      SCROLL_TOP: () =>
        Services.viewportForDoc(this.getAmpDoc()).getScrollTop(),
      PAGE_HEIGHT: () =>
        Services.viewportForDoc(this.getAmpDoc()).getScrollHeight(),
      BKG_STATE: () => (this.getAmpDoc().isVisible() ? 'visible' : 'hidden'),
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
    const referrerPromise = Services.viewerForDoc(
      this.getAmpDoc()
    ).getReferrerUrl();
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
   * @param {!{[key: string]: string}} response
   * @param {string} callout
   * @return {!{[key: string]: string}}
   * @private
   */
  rewriteRtcKeys_(response, callout) {
    // Only perform this substitution for vendor-defined URLs.
    if (!RTC_VENDORS[callout] || RTC_VENDORS[callout].disableKeyAppend) {
      return response;
    }
    const newResponse = {};
    Object.keys(response).forEach((key) => {
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
    this.troubleshootData_.creativeId = dev().assertString(
      responseHeaders.get('google-creative-id') || '-1'
    );
    this.troubleshootData_.lineItemId = dev().assertString(
      responseHeaders.get('google-lineitem-id') || '-1'
    );
    if (this.ampAnalyticsConfig_) {
      // Load amp-analytics extensions
      this.extensions_./*OK*/ installExtensionForDoc(
        this.getAmpDoc(),
        'amp-analytics'
      );
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
        dev().assertString(responseHeaders.get('amp-ff-pageview-tokens'))
      );
    }

    return size;
  }

  /**
   * Returns the width and height of the slot as defined by the width and height
   * attributes, or the dimensions as computed by
   * getIntersectionElementLayoutBox.
   * @return {!LayoutRectOrDimsDef}
   */
  getSlotSize() {
    const {height, width} = this.getDeclaredSlotSize_();
    return width && height
      ? {width, height}
      : // width/height could be 'auto' in which case we fallback to measured.
        this.getIntersectionElementLayoutBox();
  }

  /**
   * Returns the width and height, as defined by the slot element's width and
   * height attributes.
   * @return {!SizeDef}
   */
  getDeclaredSlotSize_() {
    const width = Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('height'));
    return {width, height};
  }

  /**
   * @return {string} The size parameter.
   * @private
   */
  getParameterSize_() {
    let sz = this.isFluidRequest_ ? DUMMY_FLUID_SIZE : '';
    if (!this.isFluidPrimaryRequest_) {
      sz +=
        (sz.length ? '|' : '') +
        `${this.initialSize_.width}x${this.initialSize_.height}`;
    }
    const multiSizeDataStr = this.element.getAttribute('data-multi-size');
    if (multiSizeDataStr) {
      const multiSizeValidation =
        this.element.getAttribute('data-multi-size-validation') || 'true';
      // The following call will check all specified multi-size dimensions,
      // verify that they meet all requirements, and then return all the valid
      // dimensions in an array.
      const dimensions = getMultiSizeDimensions(
        multiSizeDataStr,
        this.initialSize_.width,
        this.initialSize_.height,
        multiSizeValidation == 'true',
        this.isFluidPrimaryRequest_
      );
      if (dimensions.length) {
        sz +=
          '|' + dimensions.map((dimension) => dimension.join('x')).join('|');
      }
    }
    return sz;
  }

  /** @override */
  sandboxHTMLCreativeFrame() {
    return this.shouldSandbox_;
  }

  /** @override */
  tearDownSlot() {
    super.tearDownSlot();
    this.element.setAttribute(
      'data-amp-slot-index',
      this.win.ampAdSlotIdCounter++
    );
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
    this.sraDeferred = null;
    this.qqid_ = null;
    this.shouldSandbox_ = false;
    this.consentTuple = {};
    this.getAdUrlDeferred = new Deferred();
    this.removePageviewStateToken();
  }

  /** @override */
  renderNonAmpCreative() {
    // If render idle with throttling, impose one second render delay for
    // non-AMP creatives.  This is not done in the scheduler to ensure as many
    // slots as possible are marked for layout given scheduler imposes 5 seconds
    // past previous execution.
    if (
      this.postAdResponseExperimentFeatures['render-idle-throttle'] &&
      this.isIdleRender_
    ) {
      if (is3pThrottled(this.win)) {
        return waitFor3pThrottle().then(() => super.renderNonAmpCreative());
      } else {
        incrementLoadingAds(this.win);
        return super.renderNonAmpCreative(true);
      }
    }
    return super.renderNonAmpCreative();
  }

  /** @override */
  viewportCallback(inViewport) {
    super.viewportCallback(inViewport);
    if (this.reattemptToExpandFluidCreative_ && !inViewport) {
      // If the initial expansion attempt failed (e.g., the slot was within the
      // viewport), then we will re-attempt to expand it here whenever the slot
      // is outside the viewport.
      this.expandFluidCreative_();
    }
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

  /** @override */
  getSafeframePath() {
    safeFrameRandomSubdomain =
      safeFrameRandomSubdomain || this.getRandomString_();

    return (
      `https://${safeFrameRandomSubdomain}.safeframe.googlesyndication.com/safeframe/` +
      `${this.safeframeVersion}/html/container.html`
    );
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
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    super.onCreativeRender(creativeMetaData);
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
    if (this.isRefreshing) {
      devAssert(this.refreshManager_);
      this.refreshManager_.initiateRefreshCycle();
      this.isRefreshing = false;
      this.isRelayoutNeededFlag = false;
    }

    // Force size of frame to match creative or, if creative size is unknown,
    // the slot. This ensures that the creative is centered in the former case,
    // and not truncated in the latter.
    const size = this.returnedSize_ || this.getSlotSize();
    const isMultiSizeFluid =
      this.isFluidRequest_ &&
      this.returnedSize_ &&
      // TODO(@glevitzky, 11583) Remove this clause once we stop sending back
      // the size header for fluid ads. Fluid size headers always come back as
      // 0x0.
      !(size.width == 0 && size.height == 0);
    setStyles(dev().assertElement(this.iframe), {
      width: `${size.width}px`,
      height: `${size.height}px`,
      position: isMultiSizeFluid ? 'relative' : null,
    });

    // Check if this is a multi-size creative that's narrower than the ad slot.
    if (
      this.returnedSize_ &&
      this.returnedSize_.width &&
      this.returnedSize_.width < this.getSlotSize().width
    ) {
      setStyles(dev().assertElement(this.iframe), {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
    }

    if (this.qqid_) {
      this.element.setAttribute('data-google-query-id', this.qqid_);
    }
    dev().assertElement(this.iframe).id = `google_ads_iframe_${this.ifi_}`;
    if (isMultiSizeFluid) {
      // This is a fluid + multi-size request, where the returned creative is
      // multi-size. The slot needs to not be styled with width: 100%, or the
      // creative will be centered instead of left-aligned.
      this.element.removeAttribute('height');
      setStyles(this.element, {width: `${size.width}px`});
    }

    if (opt_onLoadPromise) {
      opt_onLoadPromise.then(() => {
        this.expandFluidCreative_();
      });
    }

    this.refreshManager_ =
      this.refreshManager_ ||
      getRefreshManager(this, () => {
        if (this.useSra) {
          user().warn(TAG, 'Refresh not compatible with SRA.');
          return false;
        }
        if (
          getEnclosingContainerTypes(this.element).filter(
            (container) =>
              container != ValidAdContainerTypes['AMP-CAROUSEL'] &&
              container != ValidAdContainerTypes['AMP-STICKY-AD']
          ).length
        ) {
          user().warn(
            TAG,
            'Refresh not compatible with ad-containers, except for ' +
              'AMP-CAROUSEL and AMP-STICKY-AD'
          );
          return false;
        }
        return true;
      });

    this.postTroubleshootMessage();
  }

  /**
   * Attempts to expand a fluid creative. If the attempt fails, we will
   * re-attempt whenever the slot is out of the viewport until we succeed,
   * contingent on when viewportCallback is invoked.
   * @return {!Promise} The promise that resolves once the height change
   *   attempt either succeeds or is rejected. If no attempt is made,
   *   Promise.resovle() is returned. If for any reason the body of the iframe
   *   cannot be accessed, the promise will be rejected. Used mainly for
   *   testing.
   */
  expandFluidCreative_() {
    if (
      this.isFluidRequest_ &&
      // If a size was returned in the response, then this is a multi-size
      // response, not a fluid response.
      !this.returnedSize_ &&
      this.isVerifiedAmpCreative()
    ) {
      // This is an AMP fluid creative that will be rendered in a friendly
      // frame.
      if (
        !this.iframe ||
        !this.iframe.contentWindow ||
        !this.iframe.contentWindow.document ||
        !this.iframe.contentWindow.document.body
      ) {
        dev().error(
          TAG,
          'Attempting to expand fluid creative without ' +
            'a properly set up friendly frame. Slot id: ' +
            this.element.getAttribute('data-amp-slot-index')
        );
        return Promise.reject('Cannot access body of friendly frame');
      }
      return this.setCssPosition_('static').then(() => {
        return this.attemptChangeHeight(
          this.iframe.contentWindow.document.body./*OK*/ clientHeight
        )
          .then(() => {
            this.fireFluidDelayedImpression();
            this.reattemptToExpandFluidCreative_ = false;
          })
          .catch(() => {
            user().warn(
              TAG,
              'Attempt to change size failed on fluid ' +
                'creative. Will re-attempt when slot is out of the viewport.'
            );
            const {height, width} = this.getSlotSize();
            if (width && height) {
              // This call is idempotent, so it's okay to make it multiple
              // times.
              this.fireFluidDelayedImpression();
            }
            this.reattemptToExpandFluidCreative_ = true;
            this.setCssPosition_('absolute');
          });
      });
    }
    return Promise.resolve();
  }

  /**
   * Sets the CSS 'position' property of this.element.
   * @param {string} position The CSS position value.
   * @return {!Promise} A promise that resolves when mutation is complete.
   * @private
   */
  setCssPosition_(position) {
    return this.mutateElement(() => {
      setImportantStyles(this.element, {position});
    }, this.element);
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
   * @param {number} newWidth
   * @param {number} newHeight
   * @private
   */
  handleResize_(newWidth, newHeight) {
    const isFluidRequestAndFixedResponse = !!(
      this.isFluidRequest_ &&
      newWidth &&
      newHeight
    );
    const {height, width} = this.getDeclaredSlotSize_();
    const returnedSizeDifferent = newWidth != width || newHeight != height;
    const heightNotIncreased = newHeight <= height;
    if (
      isFluidRequestAndFixedResponse ||
      (returnedSizeDifferent && heightNotIncreased)
    ) {
      this.attemptChangeSize(newHeight, newWidth).catch(() => {});
      if (
        newWidth > width &&
        // If 'fluid' were the primary requested size, ensure we do not trigger
        // slot adjustment if the returned size is one of the requested multi-
        // sizes. Slot adjustment should only be triggered when the creative
        // size is not one of the requested sizes.
        (!this.isFluidPrimaryRequest_ ||
          (this.parameterSize &&
            this.parameterSize.indexOf(`${newWidth}x${newHeight}`) == -1))
      ) {
        this.adjustSlotPostExpansion_(newWidth);
      }
    }
  }

  /**
   * Ensures that slot is properly centered after being expanded.
   * @param {number} newWidth The new width of the slot.
   * @private
   */
  adjustSlotPostExpansion_(newWidth) {
    if (
      !devAssert(
        this.flexibleAdSlotData_,
        'Attempted to expand slot without flexible ad slot data.'
      )
    ) {
      return;
    }
    const {parentStyle, parentWidth} = this.flexibleAdSlotData_;
    const isRtl = isRTL(this.win.document);
    const dirStr = isRtl ? 'Right' : 'Left';
    const /** !{[key: string]: string} */ style = this.inZIndexHoldBack_
        ? {'z-index': '11'}
        : {};
    // Compute offset margins if the slot is not centered by default.
    if (parentStyle.textAlign != 'center') {
      const getMarginStr = (marginNum) => `${Math.round(marginNum)}px`;
      if (newWidth <= parentWidth) {
        // Must center creative within its parent container
        const parentPadding =
          parseInt(parentStyle[`padding${dirStr}`], 10) || 0;
        const parentBorder =
          parseInt(parentStyle[`border${dirStr}Width`], 10) || 0;
        const whitespace =
          (this.flexibleAdSlotData_.parentWidth - newWidth) / 2;
        style[isRtl ? 'margin-right' : 'margin-left'] = getMarginStr(
          whitespace - parentPadding - parentBorder
        );
      } else {
        // Must center creative within the viewport
        const viewportWidth = this.getViewport().getRect().width;
        const pageLayoutBox = getPageLayoutBoxBlocking(this.element);
        const whitespace = (viewportWidth - newWidth) / 2;
        if (isRtl) {
          style['margin-right'] = getMarginStr(
            pageLayoutBox.right + whitespace - viewportWidth
          );
        } else {
          style['margin-left'] = getMarginStr(
            -(pageLayoutBox.left - whitespace)
          );
        }
      }
    }
    setStyles(this.element, assertDoesNotContainDisplay(style));
  }

  /** @override */
  sendXhrRequest(adUrl) {
    if (!this.useSra) {
      return super.sendXhrRequest(adUrl);
    }
    const checkStillCurrent = this.verifyStillCurrent();
    // InitiateSraRequests resolves when all blocks have had their SRA
    // responses returned such that sraDeferred being non-null indicates this
    // element was somehow not included so report.
    this.initiateSraRequests().then(() => {
      checkStillCurrent();
      if (!this.sraDeferred) {
        dev().warn(TAG, `SRA failed to include element ${this.ifi_}`);
        if (isExperimentOn(this.win, 'doubleclickSraReportExcludedBlock')) {
          this.getAmpDoc()
            .getBody()
            .appendChild(
              createElementWithAttributes(this.win.document, 'amp-pixel', {
                'src':
                  'https://pagead2.googlesyndication.com/pagead/gen_204?' +
                  `id=${encodeURIComponent('a4a::sra')}&ifi=${this.ifi_}`,
              })
            );
        }
      }
    });
    // Wait for SRA request which will call response promise when this block's
    // response has been returned. Null response indicates single slot should
    // execute using non-SRA method.
    return this.sraDeferred.promise.then((response) => {
      checkStillCurrent();
      this.sraDeferred = null;
      return response || super.sendXhrRequest(adUrl);
    });
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
    impressions.split(',').forEach((url) => {
      try {
        if (!Services.urlForDoc(this.element).isSecure(url)) {
          dev().warn(TAG, `insecure impression url: ${url}`);
          return;
        }
        // Create amp-pixel and append to document to send impression.
        this.getAmpDoc()
          .getBody()
          .appendChild(
            createElementWithAttributes(this.win.document, 'amp-pixel', {
              'src': url,
              'referrerpolicy': scrubReferer ? 'no-referrer' : '',
            })
          );
      } catch (unusedError) {}
    });
  }

  /**
   * Fires the fluid delayed impression, if the URL is available.
   */
  fireFluidDelayedImpression() {
    if (this.fluidImpressionUrl_) {
      this.fireDelayedImpressions(this.fluidImpressionUrl_);
      this.fluidImpressionUrl_ = null;
    }
  }

  /**
   * Groups slots by type and networkId from data-slot parameter.  Exposed for
   * ease of testing.
   * @return {!Promise<!{[key: string]: !Array<!Promise<!../../../src/base-element.BaseElement}>>>}
   * @visibleForTesting
   */
  groupSlotsForSra() {
    return groupAmpAdsByType(
      this.getAmpDoc(),
      this.element.getAttribute('type'),
      getNetworkId
    );
  }

  /**
   * Executes SRA request via the following steps:
   * - create only one executor per page
   * - get all doubleclick amp-ad instances on the page
   * - group by networkID allowing for separate SRA requests
   * - for each grouping, construct SRA request
   * - handle chunks for streaming response for each block
   * @return {!Promise}
   * @visibleForTesting
   */
  initiateSraRequests() {
    // Use cancellation of the first slot's promiseId as indication of
    // unlayoutCallback execution.  Assume that if called for one slot, it will
    // be called for all and we should cancel SRA execution.
    const checkStillCurrent = this.verifyStillCurrent();
    const noFallbackExp = this.experimentIds.includes(
      DOUBLECLICK_SRA_EXP_BRANCHES.SRA_NO_RECOVER
    );
    sraRequests =
      sraRequests ||
      this.groupSlotsForSra().then((groupIdToBlocksAry) => {
        checkStillCurrent();
        const sraRequestPromises = [];
        Object.keys(groupIdToBlocksAry).forEach((networkId) => {
          const blocks = devAssert(groupIdToBlocksAry[networkId]);
          // TODO: filter blocks with SRA disabled?
          sraRequestPromises.push(
            Promise.all(blocks).then((instances) => {
              devAssert(instances.length);
              checkStillCurrent();
              // Exclude any instances that do not have an adPromise_ as this
              // indicates they were invalid.
              const typeInstances =
                /** @type {!Array<!AmpAdNetworkDoubleclickImpl>}*/ (
                  instances
                ).filter((instance) => {
                  const isValid = instance.hasAdPromise();
                  if (!isValid) {
                    dev().info(
                      TAG,
                      'Ignoring instance without ad promise as ' +
                        'likely invalid',
                      instance.element
                    );
                  }
                  return isValid;
                });
              if (!typeInstances.length) {
                // Only contained invalid elements.
                return;
              }
              // If not within no recovery SRA experiment, determine if more
              // than one block for this element, if not do not set sra request
              // promise which results in sending as non-SRA request (benefit
              // is it allows direct cache method).
              if (!noFallbackExp && typeInstances.length == 1) {
                dev().info(TAG, `single block in network ${networkId}`);
                // Ensure deferred exists, may not if getAdUrl did not yet
                // execute.
                typeInstances[0].sraDeferred =
                  typeInstances[0].sraDeferred || new Deferred();
                typeInstances[0].sraDeferred.resolve(null);
                return;
              }
              let sraUrl;
              // Construct and send SRA request.
              // TODO(keithwrightbos) - how do we handle per slot 204 response?
              return constructSRARequest_(this, typeInstances)
                .then((sraUrlIn) => {
                  checkStillCurrent();
                  sraUrl = sraUrlIn;
                  return Services.xhrFor(this.win).fetch(sraUrl, {
                    mode: 'cors',
                    method: 'GET',
                    credentials: 'include',
                  });
                })
                .then((response) => {
                  checkStillCurrent();
                  // Chunk handler called with metadata and creative for each
                  // slot in order of URLs given which is then passed to
                  // resolver used for sendXhrRequest.
                  const sraRequestAdUrlResolvers = typeInstances.map(
                    (instance) => instance.sraDeferred.resolve
                  );
                  const slotCallback = metaJsonCreativeGrouper(
                    (creative, headersObj, done) => {
                      checkStillCurrent();
                      sraBlockCallbackHandler(
                        creative,
                        headersObj,
                        done,
                        sraRequestAdUrlResolvers,
                        sraUrl,
                        this.isInNoSigningExp()
                      );
                    }
                  );
                  lineDelimitedStreamer(this.win, response, slotCallback);
                  return Promise.all(
                    typeInstances.map(
                      (instance) => instance.sraDeferred.promise
                    )
                  );
                })
                .catch((error) => {
                  if (isCancellation(error)) {
                    // Cancellation should be propagated to slot promises
                    // causing their adPromise chains within A4A to handle
                    // appropriately.
                    typeInstances.forEach(
                      (instance) =>
                        instance.sraDeferred &&
                        instance.sraDeferred.reject(error)
                    );
                  } else if (
                    noFallbackExp ||
                    !!this.win.document.querySelector(
                      'meta[name=amp-ad-doubleclick-sra]'
                    )
                  ) {
                    // If publisher has explicitly enabled SRA mode (not
                    // experiment), then assume error is network failure,
                    // collapse slot, reset url to empty string to ensure
                    // no fallback to frame GET (given expectation of SRA
                    // consistency), and propagate error to A4A ad promise
                    // chain.
                    assignAdUrlToError(/** @type {!Error} */ (error), sraUrl);
                    this.warnOnError('SRA request failure', error);
                    // Publisher explicitly wants SRA so do not attempt to
                    // recover as SRA guarantees cannot be enforced.
                    typeInstances.forEach((instance) => {
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
                    typeInstances.forEach((instance) =>
                      instance.sraDeferred.resolve(null)
                    );
                  }
                });
            })
          );
        });
        return Promise.all(sraRequestPromises);
      });
    return sraRequests;
  }

  /**
   * @param {string} message
   * @param {*} error
   * @visibleForTesting
   */
  warnOnError(message, error) {
    dev().warn(TAG, message, error);
  }

  /**
   * Generate a 32-byte random string.
   * Uses the win.crypto when available.
   * @return {string} The random string
   * @private
   */
  getRandomString_() {
    // 16 hex characters * 2 bytes per character = 32 bytes
    const length = 16;

    const randomValues = getCryptoRandomBytesArray(this.win, length);

    let randomSubdomain = '';
    for (let i = 0; i < length; i++) {
      // If crypto isn't available, just use Math.random.
      const randomValue = randomValues
        ? randomValues[i]
        : Math.floor(Math.random() * 255);
      // Ensure each byte is represented with two hexadecimal characters.
      if (randomValue <= 15) {
        randomSubdomain += '0';
      }
      randomSubdomain += randomValue.toString(16);
    }

    return randomSubdomain;
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
    windowLocationQueryParameters =
      windowLocationQueryParameters ||
      parseQueryString((this.win.location && this.win.location.search) || '');
    return windowLocationQueryParameters[parameterName];
  }

  /** @override */
  getAdditionalContextMetadata(isSafeFrame = false) {
    if (!this.isFluidRequest_ && !isSafeFrame) {
      return;
    }
    const creativeSize = this.getCreativeSize();
    devAssert(creativeSize, 'this.getCreativeSize returned null');
    if (this.isRefreshing) {
      if (this.safeframeApi_) {
        this.safeframeApi_.destroy();
      }
      this.safeframeApi_ = new SafeframeHostApi(
        this,
        this.isFluidRequest_,
        /** @type {{height, width}} */ (creativeSize)
      );
    } else {
      this.safeframeApi_ =
        this.safeframeApi_ ||
        new SafeframeHostApi(
          this,
          this.isFluidRequest_,
          /** @type {{height, width}} */ (creativeSize)
        );
    }

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
    devAssert(this.troubleshootData_.adUrl, 'ad URL does not exist yet');
    return this.troubleshootData_.adUrl.then((adUrl) => {
      const slotId =
        this.troubleshootData_.slotId + '_' + this.troubleshootData_.slotIndex;
      const payload = {
        'gutData': JSON.stringify({
          'events': [
            {
              'timestamp': Date.now(),
              'slotid': slotId,
              'messageId': 4,
            },
          ],
          'slots': [
            {
              'contentUrl': adUrl || '',
              'id': slotId,
              'leafAdUnitName': this.troubleshootData_.slotId,
              'domId': slotId,
              'lineItemId': this.troubleshootData_.lineItemId,
              'creativeId': this.troubleshootData_.creativeId,
            },
          ],
        }),
        'userAgent': navigator.userAgent,
        'referrer': this.win.location.href,
        'messageType': 'LOAD',
      };
      this.win.opener./*OK*/ postMessage(payload, '*');
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

  /**
   * @return {boolean} True if 'fluid' is one of the requested sizes, false
   * otherwise.
   */
  isFluidRequest() {
    return this.isFluidRequest_;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
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
    dev().assertString(element.getAttribute('data-slot'))
  );
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
  devAssert(instances && instances.length);
  const startTime = Date.now();
  return Promise.all(
    instances.map((instance) => instance.getAdUrlDeferred.promise)
  )
    .then(() => googlePageParameters(a4a, startTime))
    .then((googPageLevelParameters) => {
      const blockParameters = constructSRABlockParameters(instances);
      return truncAndTimeUrl(
        DOUBLECLICK_BASE_URL,
        Object.assign(
          blockParameters,
          googPageLevelParameters,
          instances[0].getPageParameters(instances[0].consentTuple, instances)
        ),
        startTime
      );
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
    if (!instancesInAdRequest.includes(tokensToInstances[token])) {
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

/**
 * Function to handle the three-state boolean logic of tfcd/tfua params.
 * - If any params are 1, return 1.
 * - Else if any of them are 0, return 0.
 * - Else return null
 * @param {?number} param1
 * @param {?number} param2
 * @return {?string}
 */
function combineConsentParams(param1, param2) {
  if (String(param1) === '1' || String(param2) === '1') {
    return '1';
  } else if (String(param1) === '0' || String(param2) === '0') {
    return '0';
  }
  return null;
}
