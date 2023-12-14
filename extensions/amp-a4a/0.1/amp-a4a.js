import {signingServerURLs} from '#ads/_a4a-config';

import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {Deferred, tryResolve} from '#core/data-structures/promise';
import {createElementWithAttributes} from '#core/dom';
import {
  LayoutPriority_Enum,
  Layout_Enum,
  applyFillContent,
  isLayoutSizeDefined,
} from '#core/dom/layout';
import {intersectionEntryToJson} from '#core/dom/layout/intersection';
import {observeIntersections} from '#core/dom/layout/viewport-observer';
import {DetachedDomStream, streamResponseToWriter} from '#core/dom/stream';
import {setStyle} from '#core/dom/style';
import {duplicateErrorIfNecessary} from '#core/error';
import {isArray, isEnumValue, isObject} from '#core/types';
import {parseJson} from '#core/types/object/json';
import {padStart} from '#core/types/string';
import {utf8Decode} from '#core/types/string/bytes';
import {tryDecodeUriComponent} from '#core/types/string/url';

import {Services} from '#service';
import {installRealTimeConfigServiceForDoc} from '#service/real-time-config/real-time-config-impl';
import {installUrlReplacementsForEmbed} from '#service/url-replacements-impl';

import {triggerAnalyticsEvent} from '#utils/analytics';
import {DomTransformStream} from '#utils/dom-tranform-stream';
import {listenOnce} from '#utils/event-helper';
import {dev, devAssert, logHashParam, user, userAssert} from '#utils/log';
import {isAttributionReportingAllowed} from '#utils/privacy-sandbox-utils';

import {A4AVariableSource} from './a4a-variable-source';
import {getExtensionsFromMetadata} from './amp-ad-utils';
import {processHead} from './head-validation';
import {createSecureDocSkeleton, createSecureFrame} from './secure-frame';
import {SignatureVerifier, VerificationStatus} from './signature-verifier';
import {whenWithinViewport} from './within-viewport';

import {
  applySandbox,
  generateSentinel,
  getDefaultBootstrapBaseUrl,
} from '../../../src/3p-frame';
import {isAdPositionAllowed} from '../../../src/ad-helper';
import {ChunkPriority_Enum, chunk} from '../../../src/chunk';
import {
  getConsentMetadata,
  getConsentPolicyInfo,
  getConsentPolicySharedData,
  getConsentPolicyState,
} from '../../../src/consent';
import {cancellation, isCancellation} from '../../../src/error-reporting';
import {insertAnalyticsElement} from '../../../src/extension-analytics';
import {
  installFriendlyIframeEmbed,
  isSrcdocSupported,
  preloadFriendlyIframeEmbedExtensions,
} from '../../../src/friendly-iframe-embed';
import {getContextMetadata} from '../../../src/iframe-attributes';
import {getMode} from '../../../src/mode';
import {assertHttpsUrl} from '../../../src/url';
import {
  getAmpAdRenderOutsideViewport,
  incrementLoadingAds,
  is3pThrottled,
} from '../../amp-ad/0.1/concurrent-load';
import {GEO_IN_GROUP} from '../../amp-geo/0.1/amp-geo-in-group';

/** @type {Array<string>} */
const METADATA_STRINGS = [
  '<script amp-ad-metadata type=application/json>',
  '<script type="application/json" amp-ad-metadata>',
  '<script type=application/json amp-ad-metadata>',
];

// TODO(tdrl): Temporary, while we're verifying whether SafeFrame is an
// acceptable solution to the 'Safari on iOS doesn't fetch iframe src from
// cache' issue.  See https://github.com/ampproject/amphtml/issues/5614
/** @type {string} */
export const DEFAULT_SAFEFRAME_VERSION = '1-0-37';

/** @const {string} */
export const CREATIVE_SIZE_HEADER = 'X-CreativeSize';

/** @type {string} @visibleForTesting */
export const RENDERING_TYPE_HEADER = 'X-AmpAdRender';

/** @type {string} @visibleForTesting */
export const SAFEFRAME_VERSION_HEADER = 'X-AmpSafeFrameVersion';

/** @type {string} @visibleForTesting */
export const EXPERIMENT_FEATURE_HEADER_NAME = 'amp-ff-exps';

/** @type {string} */
const TAG = 'amp-a4a';

/** @type {string} */
export const NO_CONTENT_RESPONSE = 'NO-CONTENT-RESPONSE';

/** @type {string} */
export const NETWORK_FAILURE = 'NETWORK-FAILURE';

/** @type {string} */
export const INVALID_SPSA_RESPONSE = 'INVALID-SPSA-RESPONSE';

/** @type {string} */
export const IFRAME_GET = 'IFRAME-GET';

/** @enum {string} */
export const XORIGIN_MODE = {
  CLIENT_CACHE: 'client_cache',
  SAFEFRAME: 'safeframe',
  NAMEFRAME: 'nameframe',
  IFRAME_GET: 'iframe_get',
};

/** @type {!Object} @private */
const SHARED_IFRAME_PROPERTIES = {
  'frameborder': '0',
  'allowfullscreen': '',
  'allowtransparency': '',
  'scrolling': 'no',
  'marginwidth': '0',
  'marginheight': '0',
};

/** @typedef {{width: number, height: number}} */
export let SizeInfoDef;

/** @typedef {{
      minifiedCreative: string,
      customElementExtensions: !Array<string>,
      customStylesheets: !Array<{href: string}>,
      images: (Array<string>|undefined),
      ctaType: (string|undefined),
      ctaUrl: (string|undefined),
    }} */
export let CreativeMetaDataDef;

/** @typedef {{
      consentState: (?CONSENT_POLICY_STATE|undefined),
      consentString: (?string|undefined),
      consentStringType: (?CONSENT_STRING_TYPE|boolean),
      gdprApplies: (?boolean|undefined),
      additionalConsent: (?string|undefined),
      consentSharedData: (?Object|undefined),
    }} */
export let ConsentTupleDef;

/**
 * Name of A4A lifecycle triggers.
 * @enum {string}
 */
export const AnalyticsTrigger = {
  AD_REQUEST_START: 'ad-request-start',
  AD_RESPONSE_END: 'ad-response-end',
  AD_RENDER_START: 'ad-render-start',
  AD_RENDER_END: 'ad-render-end',
  AD_IFRAME_LOADED: 'ad-iframe-loaded',
  // This trigger is not part of the normal ads lifecycle and only fires when an
  // ad is refreshed.
  AD_REFRESH: 'ad-refresh',
};

/**
 * Maps the names of lifecycle events to analytics triggers.
 * @const {!{[key: string]: !AnalyticsTrigger}}
 */
const LIFECYCLE_STAGE_TO_ANALYTICS_TRIGGER = {
  'adRequestStart': AnalyticsTrigger.AD_REQUEST_START,
  'adRequestEnd': AnalyticsTrigger.AD_RESPONSE_END,
  'renderFriendlyStart': AnalyticsTrigger.AD_RENDER_START,
  'renderCrossDomainStart': AnalyticsTrigger.AD_RENDER_START,
  'renderSafeFrameStart': AnalyticsTrigger.AD_RENDER_START,
  'renderFriendlyEnd': AnalyticsTrigger.AD_RENDER_END,
  'renderCrossDomainEnd': AnalyticsTrigger.AD_RENDER_END,
  'friendlyIframeIniLoad': AnalyticsTrigger.AD_IFRAME_LOADED,
  'crossDomainIframeLoaded': AnalyticsTrigger.AD_IFRAME_LOADED,
};

/**
 * Utility function that ensures any error thrown is handled by optional
 * onError handler (if none provided or handler throws, error is swallowed and
 * undefined is returned).
 * @param {!Function} fn to protect
 * @param {T=} inThis An optional object to use as the 'this' object
 *    when calling the function.  If not provided, undefined is bound as this
 *    when calling function.
 * @param {function(this:T, !Error, ...*):?=} onError function given error
 *    and arguments provided to function call.
 * @return {!Function} protected function
 * @template T
 * @visibleForTesting
 */
export function protectFunctionWrapper(
  fn,
  inThis = undefined,
  onError = undefined
) {
  return (...fnArgs) => {
    try {
      return fn.apply(inThis, fnArgs);
    } catch (err) {
      if (onError) {
        try {
          // Ideally we could use [err, ...var_args] but linter disallows
          // spread so instead using unshift :(
          fnArgs.unshift(err);
          return onError.apply(inThis, fnArgs);
        } catch (captureErr) {
          // swallow error if error handler throws.
        }
      }
      // In the event of no optional on error function or its execution throws,
      // return undefined.
      return undefined;
    }
  };
}

/** Abstract class for AMP Ad Fast Fetch enabled networks */
export class AmpA4A extends AMP.BaseElement {
  // TODO: Add more error handling throughout code.
  // TODO: Handle creatives that do not fill.

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
    devAssert(AMP.AmpAdUIHandler);
    devAssert(AMP.AmpAdXOriginIframeHandler);

    /** @private {?Promise<undefined>} */
    this.keysetPromise_ = null;

    /**
     * In no signing experiment metadata will be data from head validation.
     * @private {?Promise<?CreativeMetaDataDef|?./head-validation.ValidatedHeadDef>}
     */
    this.adPromise_ = null;

    /**
     * @private {number} unique ID of the currently executing promise to allow
     * for cancellation.
     */
    this.promiseId_ = 0;

    /** @private {?string} */
    this.adUrl_ = null;

    /** @private {?../../../src/friendly-iframe-embed.FriendlyIframeEmbed} */
    this.friendlyIframeEmbed_ = null;

    /** @type {?AMP.AmpAdUIHandler} */
    this.uiHandler = null;

    /** @private {?AMP.AmpAdXOriginIframeHandler} */
    this.xOriginIframeHandler_ = null;

    /** @private {boolean} whether creative has been verified as AMP */
    this.isVerifiedAmpCreative_ = false;

    /** @private {?ArrayBuffer} */
    this.creativeBody_ = null;

    /**
     * Initialize this with the slot width/height attributes, and override
     * later with what the network implementation returns via extractSize.
     * Note: Either value may be 'auto' (i.e., non-numeric).
     *
     * @private {?({width, height}|../../../src/layout-rect.LayoutRectDef)}
     */
    this.creativeSize_ = null;

    /** @private {?../../../src/layout-rect.LayoutSizeDef} */
    this.originalSlotSize_ = null;

    /**
     * Note(keithwrightbos) - ensure the default here is null so that ios
     * uses safeframe when response header is not specified.
     * @private {?XORIGIN_MODE}
     */
    this.experimentalNonAmpCreativeRenderMethod_ =
      this.getNonAmpCreativeRenderingMethod();

    /**
     * Gets a notion of current time, in ms.  The value is not necessarily
     * absolute, so should be used only for computing deltas.  When available,
     * the performance system will be used; otherwise Date.now() will be
     * returned.
     *
     * @const {function():number}
     */
    this.getNow_ =
      this.win.performance && this.win.performance.now
        ? this.win.performance.now.bind(this.win.performance)
        : Date.now;

    /** @const {string} */
    this.sentinel = generateSentinel(window);

    /**
     * Used to indicate whether this slot should be collapsed or not. Marked
     * true if the ad response has status 204, is null, or has a null
     * arrayBuffer.
     * @private {boolean}
     */
    this.isCollapsed_ = false;

    /**
     * Frame in which the creative renders (friendly if validated AMP, xdomain
     * otherwise).
     * @type {?HTMLIFrameElement}
     */
    this.iframe = null;

    /** @type {string} */
    this.safeframeVersion = DEFAULT_SAFEFRAME_VERSION;

    /**
     * @protected {boolean} Indicates whether the ad is currently in the
     *    process of being refreshed.
     */
    this.isRefreshing = false;

    /** @protected {boolean} */
    this.isRelayoutNeededFlag = false;

    /**
     * Mapping of feature name to value extracted from ad response header
     * amp-ff-exps with comma separated pairs of '=' separated key/value.
     * @type {!{[key: string]: string}}
     */
    this.postAdResponseExperimentFeatures = {};

    /**
     * The configuration for amp-analytics. If null, no amp-analytics element
     * will be inserted and no analytics events will be fired.
     * This will be initialized inside of buildCallback.
     * @private {?JsonObject}
     */
    this.a4aAnalyticsConfig_ = null;

    /**
     * The amp-analytics element that for this impl's analytics config. It will
     * be null before buildCallback() executes or if the impl does not provide
     * an analytice config.
     * @private {?Element}
     * @visibleForTesting
     */
    this.a4aAnalyticsElement_ = null;

    /**
     * Indicates that this slot is a single page ad within an AMP story.
     * @type {boolean}
     */
    this.isSinglePageStoryAd = false;

    /**
     * Transfers elements from the detached body to the given body element.
     * @private {?function(!Element)}
     */
    this.transferDomBody_ = null;

    /** @private {?UnlistenDef} */
    this.unobserveIntersections_ = null;
  }

  /** @override */
  getLayoutPriority() {
    // Priority used for scheduling preload and layout callback.  Because
    // AMP creatives will be injected as part of the promise chain created
    // within onLayoutMeasure, this is only relevant to non-AMP creatives
    // therefore we want this to match the 3p priority.
    const isPWA = !this.element.getAmpDoc().isSingleDoc();
    // give the ad higher priority if it is inside a PWA
    return isPWA ? LayoutPriority_Enum.METADATA : LayoutPriority_Enum.ADS;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  isRelayoutNeeded() {
    return this.isRelayoutNeededFlag;
  }

  /** @override
      @return {!Promise|undefined}
  */
  buildCallback() {
    this.creativeSize_ = {
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
    };
    const upgradeDelayMs = Math.round(this.getResource().getUpgradeDelayMs());
    dev().info(
      TAG,
      `upgradeDelay ${this.element.getAttribute('type')}: ${upgradeDelayMs}`
    );

    this.uiHandler = new AMP.AmpAdUIHandler(this);
    this.uiHandler.validateStickyAd();

    this.uiHandler
      .getScrollPromiseForStickyAd()
      .then(() => this.uiHandler.maybeInitStickyAd());

    if (this.uiHandler.isStickyAd()) {
      chunk(this.element, () => this.layoutCallback(), ChunkPriority_Enum.LOW);
    }

    // Disable crypto key fetching if we are not going to use it in no-signing path.
    // TODO(ccordry): clean up with no-signing launch.
    if (!this.isInNoSigningExp()) {
      const verifier = signatureVerifierFor(this.win);
      this.keysetPromise_ = this.getAmpDoc()
        .whenFirstVisible()
        .then(() => {
          this.getSigningServiceNames().forEach((signingServiceName) => {
            verifier.loadKeyset(signingServiceName);
          });
        });
    }

    this.a4aAnalyticsConfig_ = this.getA4aAnalyticsConfig();
    if (this.a4aAnalyticsConfig_) {
      // TODO(warrengm): Consider having page-level singletons for networks that
      // use the same config for all ads.
      this.a4aAnalyticsElement_ = insertAnalyticsElement(
        this.element,
        this.a4aAnalyticsConfig_,
        true /* loadAnalytics */
      );
    }

    this.isSinglePageStoryAd = this.element.hasAttribute('amp-story');
  }

  /** @override */
  renderOutsideViewport() {
    // Ensure non-verified AMP creatives are throttled.
    if (
      !this.isVerifiedAmpCreative_ &&
      is3pThrottled(this.win) &&
      !this.inNonAmpPreferenceExp()
    ) {
      return false;
    }
    // Otherwise the ad is good to go.
    const elementCheck = getAmpAdRenderOutsideViewport(this.element);
    return elementCheck !== null ? elementCheck : super.renderOutsideViewport();
  }

  /**
   * To be overridden by network specific implementation indicating if element
   * (and environment generally) are valid for sending XHR queries.
   * @return {boolean} whether element is valid and ad request should be
   *    sent.  If false, no ad request is sent and slot will be collapsed if
   *    possible.
   */
  isValidElement() {
    return true;
  }

  /**
   * Returns the creativeSize, which is the size extracted from the ad response.
   * @return {?({width, height}|../../../src/layout-rect.LayoutRectDef)}
   */
  getCreativeSize() {
    return this.creativeSize_;
  }

  /**
   * @return {boolean|number} whether ad request should be delayed until
   *    renderOutsideViewport is met or if number, the amount of viewports.
   */
  delayAdRequestEnabled() {
    return false;
  }

  /**
   * Returns preconnect urls for A4A. Ad network should overwrite in their
   * Fast Fetch implementation and return an array of urls for the runtime to
   * preconnect to.
   * @return {!Array<string>}
   */
  getPreconnectUrls() {
    return [];
  }

  /**
   * Returns prefetch urls for A4A. Ad network should overwrite in their
   * Fast Fetch implementation and return an array of urls for the runtime to
   * prefetch.
   * @return {!Array<string>}
   */
  getPrefetchUrls() {
    return [];
  }

  /**
   * Returns true if this element was loaded from an amp-ad element.  For use by
   * network-specific implementations that don't want to allow themselves to be
   * embedded directly into a page.
   * @return {boolean}
   */
  isAmpAdElement() {
    return (
      this.element.tagName == 'AMP-AD' || this.element.tagName == 'AMP-EMBED'
    );
  }

  /**
   * Prefetches and preconnects URLs related to the ad using adPreconnect
   * registration which assumes ad request domain used for 3p is applicable.
   * @param {boolean=} unusedOnLayout
   * @override
   */
  preconnectCallback(unusedOnLayout) {
    const preconnect = this.getPreconnectUrls();
    // NOTE(keithwrightbos): Does not take isValidElement into account so could
    // preconnect unnecessarily, however it is assumed that isValidElement
    // matches amp-ad loader predicate such that A4A impl does not load.
    if (preconnect) {
      preconnect.forEach((p) => {
        Services.preconnectFor(this.win).url(
          this.getAmpDoc(),
          p,
          /*opt_preloadAs*/ true
        );
      });
    }
  }

  /** @override */
  pauseCallback() {
    if (this.friendlyIframeEmbed_) {
      this.friendlyIframeEmbed_.pause();
    }
  }

  /** @override */
  resumeCallback() {
    // FIE that was not destroyed on unlayoutCallback does not require a new
    // ad request.
    if (this.friendlyIframeEmbed_) {
      this.friendlyIframeEmbed_.resume();
      return;
    }
    // If layout of page has not changed, onLayoutMeasure will not be called
    // so do so explicitly.
    const resource = this.getResource();
    if (resource.hasBeenMeasured() && !resource.isMeasureRequested()) {
      this.onLayoutMeasure();
    }
  }

  /**
   * @return {!../../../src/service/resource.Resource}
   * @visibleForTesting
   */
  getResource() {
    return this.element.getResources().getResourceForElement(this.element);
  }

  /**
   * @return {boolean} whether adPromise was initialized (indicator of
   *    element validity).
   * @protected
   */
  hasAdPromise() {
    return !!this.adPromise_;
  }

  /**
   * Should only be called after XHR response headers have been processed and
   * postAdResponseExperimentFeatures is populated.
   * @return {boolean} whether in experiment giving non-AMP creatives same
   *    benefits as AMP (increased priority, no throttle)
   * @visibleForTesting
   */
  inNonAmpPreferenceExp() {
    return (
      !!this.postAdResponseExperimentFeatures['pref_neutral_enabled'] &&
      ['adsense', 'doubleclick'].includes(this.element.getAttribute('type'))
    );
  }

  /**
   * @return {boolean} whether environment/element should initialize ad request
   *    promise chain.
   * @private
   */
  shouldInitializePromiseChain_() {
    const slotRect = this.getIntersectionElementLayoutBox();
    const fixedSizeZeroHeightOrWidth =
      this.getLayout() != Layout_Enum.FLUID &&
      (slotRect.height == 0 || slotRect.width == 0);
    if (
      fixedSizeZeroHeightOrWidth ||
      this.element.hasAttribute('hidden') ||
      // TODO(levitzky): May need additional checks for other display:hidden cases.
      this.element.classList.contains('i-amphtml-hidden-by-media-query')
    ) {
      dev().fine(
        TAG,
        'onLayoutMeasure canceled due height/width 0',
        this.element
      );
      return false;
    }
    if (
      !this.uiHandler.isStickyAd() &&
      !isAdPositionAllowed(this.element, this.win)
    ) {
      user().warn(
        TAG,
        `<${this.element.tagName}> is not allowed to be ` +
          `placed in elements with position: fixed or sticky: ${this.element}`
      );
      return false;
    }
    // OnLayoutMeasure can be called when page is in prerender so delay until
    // visible.  Assume that it is ok to call isValidElement as it should
    // only being looking at window, immutable properties (i.e. location) and
    // its element ancestry.
    if (!this.isValidElement()) {
      // TODO(kjwright): collapse?
      user().warn(
        TAG,
        this.element.getAttribute('type'),
        'Amp ad element ignored as invalid',
        this.element
      );
      return false;
    }
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    this.initiateAdRequest();
  }

  /**
   * Resolves when underlying element is within the viewport range given or
   * has been loaded already.
   * @param {number|boolean} viewport derived from renderOutsideViewport.
   * @return {!Promise}
   * @protected
   */
  whenWithinViewport(viewport) {
    devAssert(viewport !== false);
    const resource = this.getResource();
    if (WITHIN_VIEWPORT_INOB || getMode().localDev || getMode().test) {
      // Resolve is already laid out or viewport is true.
      if (!resource.isLayoutPending() || viewport === true) {
        return Promise.resolve();
      }
      // Track when within the specified number of viewports.
      const viewportNum = dev().assertNumber(viewport);
      return whenWithinViewport(this.element, viewportNum);
    }
    return resource.whenWithinViewport(viewport);
  }

  /**
   * This is the entry point into the ad promise chain.
   *
   * Calling this function will initiate the following sequence of events: ad
   * url construction, ad request issuance, creative verification, and metadata
   * parsing.
   *
   * @protected
   */
  initiateAdRequest() {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.onLayoutMeasure();
    }
    if (this.adPromise_ || !this.shouldInitializePromiseChain_()) {
      return;
    }

    // Increment unique promise ID so that if its value changes within the
    // promise chain due to cancel from unlayout, the promise will be rejected.
    ++this.promiseId_;

    // Shorthand for: reject promise if current promise chain is out of date.
    const checkStillCurrent = this.verifyStillCurrent();

    // Return value from this chain: True iff rendering was "successful"
    // (i.e., shouldn't try to render later via iframe); false iff should
    // try to render later in iframe.
    // Cases to handle in this chain:
    //   - Everything ok  => Render; return true
    //   - Empty network response returned => Don't render; return true
    //   - Can't parse creative out of response => Don't render; return false
    //   - Can parse, but creative is empty => Don't render; return true
    //   - Validation fails => return false
    //   - Rendering fails => return false
    //   - Chain cancelled => don't return; drop error
    //   - Uncaught error otherwise => don't return; percolate error up
    this.adPromise_ = this.getAmpDoc()
      .whenFirstVisible()
      .then(() => {
        checkStillCurrent();
        // See if experiment that delays request until slot is within
        // renderOutsideViewport. Within render outside viewport will not
        // resolve if already within viewport thus the check for already
        // meeting the definition as opposed to waiting on the promise.
        const delay = this.delayAdRequestEnabled();
        if (delay) {
          return this.whenWithinViewport(
            typeof delay == 'number' ? delay : this.renderOutsideViewport()
          );
        }
      })
      // Possibly block on amp-consent.
      /** @return {!Promise<Array<Promise>>} */
      .then(() => {
        checkStillCurrent();
        const consentPolicyId = super.getConsentPolicy();

        if (consentPolicyId) {
          const consentStatePromise = getConsentPolicyState(
            this.element,
            consentPolicyId
          ).catch((err) => {
            user().error(TAG, 'Error determining consent state', err);
            return CONSENT_POLICY_STATE.UNKNOWN;
          });

          const consentStringPromise = getConsentPolicyInfo(
            this.element,
            consentPolicyId
          ).catch((err) => {
            user().error(TAG, 'Error determining consent string', err);
            return null;
          });

          const consentMetadataPromise = getConsentMetadata(
            this.element,
            consentPolicyId
          ).catch((err) => {
            user().error(TAG, 'Error determining consent metadata', err);
            return null;
          });

          const consentSharedDataPromise = getConsentPolicySharedData(
            this.element,
            consentPolicyId
          ).catch((err) => {
            user().error(TAG, 'Error determining consent shared data', err);
            return null;
          });

          return Promise.all([
            consentStatePromise,
            consentStringPromise,
            consentMetadataPromise,
            consentSharedDataPromise,
          ]);
        }

        return Promise.resolve([null, null, null, null]);
      })
      // This block returns the ad URL, if one is available.
      /** @return {!Promise<?string>} */
      .then((consentResponse) => {
        checkStillCurrent();

        const consentState = consentResponse[0];
        const consentString = consentResponse[1];
        const consentMetadata = consentResponse[2];
        const consentSharedData = consentResponse[3];
        const gdprApplies = consentMetadata
          ? consentMetadata['gdprApplies']
          : consentMetadata;
        const additionalConsent = consentMetadata
          ? consentMetadata['additionalConsent']
          : consentMetadata;
        const consentStringType = consentMetadata
          ? consentMetadata['consentStringType']
          : consentMetadata;

        return /** @type {!Promise<?string>} */ (
          this.getServeNpaSignal().then((npaSignal) =>
            this.getAdUrl(
              {
                consentState,
                consentString,
                consentStringType,
                gdprApplies,
                additionalConsent,
                consentSharedData,
              },
              this.tryExecuteRealTimeConfig_(
                consentState,
                consentString,
                /** @type {?{[key: string]: string|number|boolean|undefined}} */ (
                  consentMetadata
                )
              ),
              npaSignal
            )
          )
        );
      })
      // This block returns the (possibly empty) response to the XHR request.
      /** @return {!Promise<?Response>} */
      .then((adUrl) => {
        checkStillCurrent();
        this.adUrl_ = adUrl;
        // If we should skip the XHR, we will instead request and render
        // by simply writing a frame into the page using
        // renderViaIframeGet
        if (!this.isXhrAllowed() && !!this.adUrl_) {
          this.experimentalNonAmpCreativeRenderMethod_ =
            XORIGIN_MODE.IFRAME_GET;
          return Promise.reject(IFRAME_GET);
        }
        return adUrl && this.sendXhrRequest(adUrl);
      })
      // The following block returns either the response (as a
      // {bytes, headers} object), or null if no response is available /
      // response is empty.
      /** @return {!Promise<!Response>} */
      .then((fetchResponse) => {
        checkStillCurrent();
        this.maybeTriggerAnalyticsEvent_('adRequestEnd');
        // If the response is null (can occur for non-200 responses)  or
        // arrayBuffer is null, force collapse.
        if (
          !fetchResponse ||
          !fetchResponse.arrayBuffer ||
          fetchResponse.headers.has('amp-ff-empty-creative')
        ) {
          this.forceCollapse();
          return Promise.reject(NO_CONTENT_RESPONSE);
        }
        if (
          fetchResponse.headers &&
          fetchResponse.headers.has(EXPERIMENT_FEATURE_HEADER_NAME)
        ) {
          this.populatePostAdResponseExperimentFeatures_(
            fetchResponse.headers.get(EXPERIMENT_FEATURE_HEADER_NAME)
          );
        }
        if (
          getMode().localDev &&
          this.win.location &&
          this.win.location.search
        ) {
          // Allow for setting experiment features via query param which
          // will potentially override values returned in response.
          const match = /(?:\?|&)a4a_feat_exp=([^&]+)/.exec(
            this.win.location.search
          );
          if (match && match[1]) {
            dev().info(TAG, `Using debug exp features: ${match[1]}`);
            this.populatePostAdResponseExperimentFeatures_(
              tryDecodeUriComponent(match[1])
            );
          }
        }
        // TODO(tdrl): Temporary, while we're verifying whether SafeFrame is
        // an acceptable solution to the 'Safari on iOS doesn't fetch
        // iframe src from cache' issue.  See
        // https://github.com/ampproject/amphtml/issues/5614
        const method = this.getNonAmpCreativeRenderingMethod(
          fetchResponse.headers.get(RENDERING_TYPE_HEADER)
        );
        this.experimentalNonAmpCreativeRenderMethod_ = method;
        if (
          this.experimentalNonAmpCreativeRenderMethod_ == XORIGIN_MODE.NAMEFRAME
        ) {
          Services.preconnectFor(this.win).preload(
            this.getAmpDoc(),
            getDefaultBootstrapBaseUrl(this.win, 'nameframe')
          );
        }
        const safeframeVersionHeader = fetchResponse.headers.get(
          SAFEFRAME_VERSION_HEADER
        );
        if (
          /^[0-9-]+$/.test(safeframeVersionHeader) &&
          safeframeVersionHeader != DEFAULT_SAFEFRAME_VERSION
        ) {
          this.safeframeVersion = safeframeVersionHeader;
          Services.preconnectFor(this.win).preload(
            this.getAmpDoc(),
            this.getSafeframePath()
          );
        }
        return fetchResponse;
      })
      .then((fetchResponse) =>
        this.isInNoSigningExp()
          ? this.streamResponse_(fetchResponse, checkStillCurrent)
          : this.startValidationFlow_(fetchResponse, checkStillCurrent)
      )
      .catch((error) => {
        switch (error.message || error) {
          case IFRAME_GET:
          case NETWORK_FAILURE:
            return null;
          case INVALID_SPSA_RESPONSE:
          case NO_CONTENT_RESPONSE:
            return {
              minifiedCreative: '',
              customElementExtensions: [],
              customStylesheets: [],
            };
        }
        // If error in chain occurs, report it and return null so that
        // layoutCallback can render via cross domain iframe assuming ad
        // url or creative exist.
        this.promiseErrorHandler_(error);
        return null;
      });
  }

  /**
   * @visibleForTesting
   * @return {boolean}
   */
  isInNoSigningExp() {
    return NO_SIGNING_RTV;
  }

  /**
   * Allow subclasses to skip client side validation of non-amp creatives
   * based on http headers for perfomance. When true, ads will fall back to
   * x-domain earlier.
   * @param {!Headers} unusedHeaders
   * @return {boolean}
   */
  skipClientSideValidation(unusedHeaders) {
    return false;
  }

  /**
   * Start streaming response into the detached document.
   * @param {!Response} httpResponse
   * @param {function()} checkStillCurrent
   * @return {Promise<?./head-validation.ValidatedHeadDef>}
   */
  streamResponse_(httpResponse, checkStillCurrent) {
    if (httpResponse.status === 204) {
      this.forceCollapse();
      return Promise.reject(NO_CONTENT_RESPONSE);
    }

    // Extract size will also parse x-ampanalytics header for some subclasses.
    const size = this.extractSize(httpResponse.headers);
    this.creativeSize_ = size || this.creativeSize_;

    if (
      !isPlatformSupported(this.win) ||
      this.skipClientSideValidation(httpResponse.headers)
    ) {
      return this.handleFallback_(httpResponse, checkStillCurrent);
    }

    // Duplicating httpResponse stream as safeframe/nameframe rendering will need the
    // unaltered httpResponse content.
    const fallbackHttpResponse = httpResponse.clone();

    // This transformation consumes the detached DOM chunks and
    // exposes our waitForHead and transferBody methods.
    const transformStream = new DomTransformStream(this.win);
    // Receives chunks of text and writes to detached DOM.
    const detachedStream = new DetachedDomStream(
      this.win,
      (chunk) => transformStream.onChunk(chunk),
      (doc) => transformStream.onEnd(doc)
    );

    this.transferDomBody_ = transformStream.transferBody.bind(transformStream);

    // Decodes our httpResponse bytes and pipes them to the
    // DetachedDomStream.
    return streamResponseToWriter(this.win, httpResponse, detachedStream)
      .then((responseBodyHasContent) => {
        checkStillCurrent();
        // `amp-ff-empty-creative` header is not present, and httpResponse.body
        // is empty.
        if (!responseBodyHasContent) {
          this.forceCollapse();
          return Promise.reject(NO_CONTENT_RESPONSE);
        }
      })
      .then(() => {
        checkStillCurrent();
        return transformStream.waitForHead();
      })
      .then((head) => {
        checkStillCurrent();
        return this.validateHeadElement_(head);
      })
      .then((sanitizedHeadElement) => {
        checkStillCurrent();
        // We should not render as FIE.
        if (!sanitizedHeadElement) {
          return this.handleFallback_(fallbackHttpResponse, checkStillCurrent);
        }
        this.updateLayoutPriority(LayoutPriority_Enum.CONTENT);
        this.isVerifiedAmpCreative_ = true;
        return sanitizedHeadElement;
      });
  }

  /**
   * Handles case where creative cannot or has chosen not to be rendered
   * safely in FIE. Returning null forces x-domain render in
   * attemptToRenderCreative
   * @param {!Response} fallbackHttpResponse
   * @param {function()} checkStillCurrent
   * @return {!Promise<null>}
   */
  handleFallback_(fallbackHttpResponse, checkStillCurrent) {
    // Experiment to give non-AMP creatives same benefits as AMP so
    // update priority.
    if (this.inNonAmpPreferenceExp()) {
      this.updateLayoutPriority(LayoutPriority_Enum.CONTENT);
    }
    return fallbackHttpResponse.arrayBuffer().then((domTextContent) => {
      checkStillCurrent();
      this.creativeBody_ = domTextContent;
      return null;
    });
  }

  /**
   * Prepare the creative <head> by removing any non-secure elements and
   * exracting extensions
   * @param {!Element} headElement
   * @return {?./head-validation.ValidatedHeadDef} head data or null if we should fall back to xdomain.
   */
  validateHeadElement_(headElement) {
    return processHead(this.win, this.element, headElement);
  }

  /**
   * Encapsulates logic for validation flow starting with resolving res body
   * to array buffer.
   * @param {!Response} fetchResponse
   * @param {function()} checkStillCurrent
   * @return {Promise<?CreativeMetaDataDef>}
   */
  startValidationFlow_(fetchResponse, checkStillCurrent) {
    // Note: Resolving a .then inside a .then because we need to capture
    // two fields of fetchResponse, one of which is, itself, a promise,
    // and one of which isn't.  If we just return
    // fetchResponse.arrayBuffer(), the next step in the chain will
    // resolve it to a concrete value, but we'll lose track of
    // fetchResponse.headers.
    return (
      fetchResponse
        .arrayBuffer()
        .then((bytes) => {
          if (bytes.byteLength == 0) {
            // The server returned no content. Instead of displaying a blank
            // rectangle, we collapse the slot instead.
            this.forceCollapse();
            return Promise.reject(NO_CONTENT_RESPONSE);
          }
          return {
            bytes,
            headers: fetchResponse.headers,
          };
        })
        /** @return {?Promise<?ArrayBuffer>} */
        .then((responseParts) => {
          checkStillCurrent();
          // Keep a handle to the creative body so that we can render into
          // SafeFrame or NameFrame later, if necessary.  TODO(tdrl): Temporary,
          // while we
          // assess whether this is the right solution to the Safari+iOS iframe
          // src cache issue.  If we decide to keep a SafeFrame-like solution,
          // we should restructure the promise chain to pass this info along
          // more cleanly, without use of an object variable outside the chain.
          if (!responseParts) {
            return null;
          }
          const {bytes, headers} = responseParts;
          const size = this.extractSize(responseParts.headers);
          this.creativeSize_ = size || this.creativeSize_;
          if (
            this.experimentalNonAmpCreativeRenderMethod_ !=
              XORIGIN_MODE.CLIENT_CACHE &&
            bytes
          ) {
            this.creativeBody_ = bytes;
          }
          return this.maybeValidateAmpCreative(bytes, headers);
        })
        .then((creative) => {
          checkStillCurrent();
          // Need to know if creative was verified as part of render outside
          // viewport but cannot wait on promise.  Sadly, need a state a
          // variable.
          this.isVerifiedAmpCreative_ = !!creative;
          return creative && utf8Decode(creative);
        })
        // This block returns CreativeMetaDataDef iff the creative was verified
        // as AMP and could be properly parsed for friendly iframe render.
        /** @return {?CreativeMetaDataDef} */
        .then((creativeDecoded) => {
          checkStillCurrent();
          // Note: It's critical that #getAmpAdMetadata be called
          // on precisely the same creative that was validated
          // via #validateAdResponse_.  See GitHub issue
          // https://github.com/ampproject/amphtml/issues/4187
          let creativeMetaDataDef;

          if (
            !isPlatformSupported(this.win) ||
            !creativeDecoded ||
            !(creativeMetaDataDef = this.getAmpAdMetadata(creativeDecoded))
          ) {
            if (this.inNonAmpPreferenceExp()) {
              // Experiment to give non-AMP creatives same benefits as AMP so
              // update priority.
              this.updateLayoutPriority(LayoutPriority_Enum.CONTENT);
            }
            return null;
          }

          // Update priority.
          this.updateLayoutPriority(LayoutPriority_Enum.CONTENT);

          // Load any extensions; do not wait on their promises as this
          // is just to prefetch.
          const extensions = getExtensionsFromMetadata(creativeMetaDataDef);
          preloadFriendlyIframeEmbedExtensions(this.win, extensions);

          // Preload any fonts.
          (creativeMetaDataDef.customStylesheets || []).forEach((font) =>
            Services.preconnectFor(this.win).preload(
              this.getAmpDoc(),
              font.href
            )
          );

          const urls = Services.urlForDoc(this.element);
          // Preload any AMP images.
          (creativeMetaDataDef.images || []).forEach(
            (image) =>
              urls.isSecure(image) &&
              Services.preconnectFor(this.win).preload(this.getAmpDoc(), image)
          );
          return creativeMetaDataDef;
        })
    );
  }

  /**
   * This block returns the ad creative if it exists and validates as AMP;
   * null otherwise.
   * @param {!ArrayBuffer} bytes
   * @param {!Headers} headers
   * @return {!Promise<?ArrayBuffer>}
   */
  maybeValidateAmpCreative(bytes, headers) {
    const checkStillCurrent = this.verifyStillCurrent();
    return this.keysetPromise_
      .then(() => {
        if (
          this.element.getAttribute('type') == 'fake' &&
          !this.element.getAttribute('checksig')
        ) {
          // do not verify signature for fake type ad, unless the ad
          // specfically requires via 'checksig' attribute
          return Promise.resolve(VerificationStatus.OK);
        }
        return signatureVerifierFor(this.win).verify(bytes, headers);
      })
      .then((status) => {
        checkStillCurrent();
        let result = null;
        switch (status) {
          case VerificationStatus.OK:
            result = bytes;
            break;
          case VerificationStatus.CRYPTO_UNAVAILABLE:
            result = this.shouldPreferentialRenderWithoutCrypto()
              ? bytes
              : null;
            break;
          // TODO(@taymonbeal, #9274): differentiate between these
          case VerificationStatus.ERROR_KEY_NOT_FOUND:
          case VerificationStatus.ERROR_SIGNATURE_MISMATCH:
            user().error(
              TAG,
              this.element.getAttribute('type'),
              'Signature verification failed'
            );
          case VerificationStatus.UNVERIFIED:
        }
        if (this.isSinglePageStoryAd && !result) {
          throw new Error(INVALID_SPSA_RESPONSE);
        }
        return result;
      });
  }

  /**
   * Populates object mapping of feature to value used for post ad response
   * behavior experimentation.  Assumes comma separated, = delimited key/value
   * pairs.  If key appears more than once, last value wins.
   * @param {string} input
   * @private
   */
  populatePostAdResponseExperimentFeatures_(input) {
    input.split(',').forEach((line) => {
      if (!line) {
        return;
      }
      const parts = line.split('=');
      if (parts.length != 2 || !parts[0]) {
        dev().warn(TAG, `invalid experiment feature ${line}`);
        return;
      }
      this.postAdResponseExperimentFeatures[parts[0]] = parts[1];
    });
  }

  /**
   * Refreshes ad slot by fetching a new creative and rendering it. This leaves
   * the current creative displayed until the next one is ready.
   *
   * @param {function()} refreshEndCallback When called, this function will
   *   restart the refresh cycle.
   * @return {Promise} A promise that resolves when all asynchronous portions of
   *   the refresh function complete. This is particularly handy for testing.
   */
  refresh(refreshEndCallback) {
    devAssert(!this.isRefreshing);
    this.isRefreshing = true;
    this.tearDownSlot();
    this.initiateAdRequest();
    if (!this.adPromise_) {
      // For whatever reasons, the adPromise has been nullified, and we will be
      // unable to proceed. The current creative will continue to be displayed.
      return Promise.resolve();
    }
    const promiseId = this.promiseId_;
    return devAssert(this.adPromise_).then(() => {
      if (!this.isRefreshing || promiseId != this.promiseId_) {
        // If this refresh cycle was canceled, such as in a no-content
        // response case, keep showing the old creative.
        refreshEndCallback();
        return;
      }
      return this.mutateElement(() => {
        // Fire an ad-refresh event so that 3rd parties can track when an ad
        // has changed.
        triggerAnalyticsEvent(this.element, AnalyticsTrigger.AD_REFRESH);

        this.togglePlaceholder(true);
        // This delay provides a 1 second buffer where the ad loader is
        // displayed in between the creatives.
        return Services.timerFor(this.win)
          .promise(1000)
          .then(() => {
            this.isRelayoutNeededFlag = true;
            this.getResource().layoutCanceled();
            // Only Require relayout after page visible
            this.getAmpDoc()
              .whenNextVisible()
              .then(() => {
                Services.ownersForDoc(this.getAmpDoc())./*OK*/ requireLayout(
                  this.element
                );
              });
          });
      });
    });
  }

  /**
   * Handles uncaught errors within promise flow.
   * @param {*} error
   * @param {boolean=} opt_ignoreStack
   * @private
   */
  promiseErrorHandler_(error, opt_ignoreStack) {
    if (isCancellation(error)) {
      // Rethrow if cancellation.
      throw error;
    }

    if (error && error.message) {
      error = duplicateErrorIfNecessary(/** @type {!Error} */ (error));
    } else {
      error = new Error('unknown error ' + error);
    }
    if (opt_ignoreStack) {
      error.ignoreStack = opt_ignoreStack;
    }

    // Add `type` to the message. Ensure to preserve the original stack.
    const type = this.element.getAttribute('type') || 'notype';
    if (error.message.indexOf(`${TAG}: ${type}:`) != 0) {
      error.message = `${TAG}: ${type}: ${error.message}`;
    }

    // Additional arguments.
    assignAdUrlToError(/** @type {!Error} */ (error), this.adUrl_);

    if (getMode().development || getMode().localDev || logHashParam()) {
      user().error(TAG, error);
    } else {
      user().warn(TAG, error);
      // Report with 1% sampling as an expected dev error.
      if (Math.random() < 0.01) {
        dev().expectedError(TAG, error);
      }
    }
  }

  /** @override */
  layoutCallback() {
    if (this.isRefreshing) {
      this.destroyFrame(true);
    }
    return this.attemptToRenderCreative().then(() => {
      this.unobserveIntersections_ = observeIntersections(
        this.element,
        ({isIntersecting}) => this.viewportCallback(isIntersecting)
      );
    });
  }

  /**
   * Attemps to render the returned creative following the resolution of the
   * adPromise.
   *
   * @return {!Promise<boolean>|!Promise<undefined>} A promise that resolves
   *   when the rendering attempt has finished.
   * @protected
   */
  attemptToRenderCreative() {
    // Promise may be null if element was determined to be invalid for A4A.
    if (!this.adPromise_) {
      if (this.shouldInitializePromiseChain_()) {
        dev().error(TAG, 'Null promise in layoutCallback');
      }
      return Promise.resolve();
    }
    const checkStillCurrent = this.verifyStillCurrent();
    // Promise chain will have determined if creative is valid AMP.

    return this.adPromise_
      .then((creativeMetaData) => {
        checkStillCurrent();

        if (this.isCollapsed_) {
          return Promise.resolve();
        }
        // If this.iframe already exists, and we're not currently in the middle
        // of refreshing, bail out here. This should only happen in
        // testing context, not in production.
        if (this.iframe && !this.isRefreshing) {
          return Promise.resolve();
        }

        if (!creativeMetaData) {
          // Non-AMP creative case, will verify ad url existence.
          return this.renderNonAmpCreative();
        }

        let friendlyRenderPromise;

        if (this.isInNoSigningExp()) {
          friendlyRenderPromise = this.renderFriendlyTrustless_(
            /** @type {!./head-validation.ValidatedHeadDef} */ (
              creativeMetaData
            ),
            checkStillCurrent
          );
        } else {
          friendlyRenderPromise = this.renderAmpCreative_(
            /** @type {!CreativeMetaDataDef} */ (creativeMetaData)
          );
        }

        // Must be an AMP creative.
        return friendlyRenderPromise.catch((err) => {
          checkStillCurrent();
          // Failed to render via AMP creative path so fallback to non-AMP
          // rendering within cross domain iframe.
          user().warn(
            TAG,
            this.element.getAttribute('type'),
            'Error injecting creative in friendly frame',
            err
          );
          return this.renderNonAmpCreative();
        });
      })
      .catch((error) => {
        this.promiseErrorHandler_(error);
        throw cancellation();
      });
  }

  /**
   * Returns whether or not the ad request may be sent using XHR.
   * @return {boolean}
   */
  isXhrAllowed() {
    return true;
  }

  /** @override */
  attemptChangeSize(newHeight, newWidth) {
    // Store original size of slot in order to allow re-expansion on
    // unlayoutCallback so that it is reverted to original size in case
    // of resumeCallback.
    this.originalSlotSize_ = this.originalSlotSize_ || this.getLayoutSize();
    return super.attemptChangeSize(newHeight, newWidth);
  }

  /** @override  */
  unlayoutCallback() {
    this.unobserveIntersections_?.();
    this.unobserveIntersections_ = null;
    this.tearDownSlot();
    return true;
  }

  /**
   * Attempts to tear down and set all state variables to initial conditions.
   * @protected
   */
  tearDownSlot() {
    // Increment promiseId to cause any pending promise to cancel.
    this.promiseId_++;
    this.uiHandler.applyUnlayoutUI();
    if (this.originalSlotSize_) {
      super
        .attemptChangeSize(
          this.originalSlotSize_.height,
          this.originalSlotSize_.width
        )
        .then(() => {
          this.originalSlotSize_ = null;
        })
        .catch((err) => {
          // TODO(keithwrightbos): if we are unable to revert size, on next
          // trigger of promise chain the ad request may fail due to invalid
          // slot size.  Determine how to handle this case.
          dev().warn(TAG, 'unable to revert to original size', err);
        });
    }

    this.isCollapsed_ = false;

    // Remove rendering frame, if it exists.
    this.destroyFrame();
    this.adPromise_ = null;
    this.adUrl_ = null;
    this.creativeBody_ = null;
    this.isVerifiedAmpCreative_ = false;
    this.transferDomBody_ = null;
    this.experimentalNonAmpCreativeRenderMethod_ =
      this.getNonAmpCreativeRenderingMethod();
    this.postAdResponseExperimentFeatures = {};
  }

  /** @override */
  detachedCallback() {
    super.detachedCallback();
    this.destroyFrame(true);
  }

  /**
   * Remove the iframe and clean it up.
   */
  maybeDestroyIframe_() {
    if (this.iframe && this.iframe.parentElement) {
      this.iframe.parentElement.removeChild(this.iframe);
      this.iframe = null;
    }
  }

  /**
   * Attempts to remove the current frame and free any associated resources.
   * This function will no-op if this ad slot is currently in the process of
   * being refreshed.
   *
   * @param {boolean=} force Forces the removal of the frame, even if
   *   this.isRefreshing is true.
   * @protected
   */
  destroyFrame(force = false) {
    if (!force && this.isRefreshing) {
      return;
    }
    // Allow embed to release its resources.
    if (this.friendlyIframeEmbed_) {
      this.friendlyIframeEmbed_.destroy();
      this.friendlyIframeEmbed_ = null;
    }
    this.maybeDestroyIframe_();
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.freeXOriginIframe();
      this.xOriginIframeHandler_ = null;
    }
    if (this.uiHandler) {
      this.uiHandler.cleanup();
    }
  }

  /**
   * @param {boolean}  inViewport
   * @protected
   */
  viewportCallback(inViewport) {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.viewportCallback(inViewport);
    }
  }

  /**
   * Gets the Ad URL to send an XHR Request to.  To be implemented
   * by network.
   * @param {!ConsentTupleDef=} opt_ununsedConsentTuple
   * @param {Promise<!Array<rtcResponseDef>>=} opt_rtcResponsesPromise
   * @param {boolean=} opt_serveNpaSignal
   * @return {!Promise<string>|string}
   */
  getAdUrl(
    opt_ununsedConsentTuple,
    opt_rtcResponsesPromise,
    opt_serveNpaSignal
  ) {
    throw new Error('getAdUrl not implemented!');
  }

  /**
   * Checks if the `always-serve-npa` attribute is present and valid
   * based on the geolocation.  To be implemented by network.
   * @return {!Promise<boolean>}
   */
  getServeNpaSignal() {
    return Promise.resolve(false);
  }

  /**
   * Checks if the `block-rtc` attribute is present and valid
   * based on the geolocation.
   * @return {!Promise<boolean>}
   */
  getBlockRtc_() {
    if (!this.element.getAttribute('block-rtc')) {
      return Promise.resolve(false);
    }
    return Services.geoForDocOrNull(this.element).then((geoService) => {
      userAssert(geoService, '%s: requires <amp-geo> to use `block-rtc`', TAG);
      const blockRtcLocations = this.element.getAttribute('block-rtc');
      const locations = blockRtcLocations.split(',');
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
   * Resets ad url state to null, used to prevent frame get fallback if error
   * is thrown after url construction but prior to layoutCallback.
   */
  resetAdUrl() {
    this.adUrl_ = null;
  }

  /**
   * @return {function()} function that when called will verify if current
   *    ad retrieval is current (meaning unlayoutCallback was not executed).
   *    If not, will throw cancellation exception;
   * @throws {Error}
   */
  verifyStillCurrent() {
    const promiseId = this.promiseId_;
    return () => {
      if (promiseId != this.promiseId_) {
        throw cancellation();
      }
    };
  }

  /**
   * Determine the desired size of the creative based on the HTTP response
   * headers. Must be less than or equal to the original size of the ad slot
   * along each dimension. May be overridden by network.
   *
   * @param {!Headers} responseHeaders
   * @return {?SizeInfoDef}
   */
  extractSize(responseHeaders) {
    const headerValue = responseHeaders.get(CREATIVE_SIZE_HEADER);
    if (!headerValue) {
      return null;
    }
    const match = /^([0-9]+)x([0-9]+)$/.exec(headerValue);
    if (!match) {
      // TODO(@taymonbeal, #9274): replace this with real error reporting
      user().error(TAG, `Invalid size header: ${headerValue}`);
      return null;
    }
    return /** @type {?SizeInfoDef} */ ({
      width: Number(match[1]),
      height: Number(match[2]),
    });
  }

  /**
   * Forces the UI Handler to collapse this slot.
   * @visibleForTesting
   */
  forceCollapse() {
    if (this.isRefreshing) {
      // If, for whatever reason, the new creative would collapse this slot,
      // stick with the old creative until the next refresh cycle.
      this.isRefreshing = false;
      return;
    }
    devAssert(this.uiHandler);
    // Store original size to allow for reverting on unlayoutCallback so that
    // subsequent pageview allows for ad request.
    this.originalSlotSize_ = this.originalSlotSize_ || this.getLayoutSize();
    this.uiHandler.applyNoContentUI();
    this.isCollapsed_ = true;
  }

  /**
   * Callback executed when creative has successfully rendered within the
   * publisher page but prior to load (or ini-load for friendly frame AMP
   * creative render).  To be overridden by network implementations as needed.
   *
   * @param {?CreativeMetaDataDef} creativeMetaData metadata if AMP creative,
   *    null otherwise.
   * @param {!Promise=} opt_onLoadPromise Promise that resolves when the FIE's
   *    child window fires the `onload` event.
   */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    this.maybeTriggerAnalyticsEvent_(
      creativeMetaData ? 'renderFriendlyEnd' : 'renderCrossDomainEnd'
    );
  }

  /**
   * @param {!Element} iframe that was just created.  To be overridden for
   * testing.
   * @visibleForTesting
   */
  onCrossDomainIframeCreated(iframe) {
    dev().info(
      TAG,
      this.element.getAttribute('type'),
      `onCrossDomainIframeCreated ${iframe}`
    );
  }

  /** @return {boolean} whether html creatives should be sandboxed. */
  sandboxHTMLCreativeFrame() {
    return true;
  }

  /**
   * Send ad request, extract the creative and signature from the response.
   * @param {string} adUrl Request URL to send XHR to.
   * @return {!Promise<?Response>}
   * @protected
   */
  sendXhrRequest(adUrl) {
    this.maybeTriggerAnalyticsEvent_('adRequestStart');
    const xhrInit = {
      mode: 'cors',
      method: 'GET',
      credentials: 'include',
    };
    return Services.xhrFor(this.win)
      .fetch(adUrl, xhrInit)
      .catch((error) => {
        if (error.response && error.response.status > 200) {
          // Invalid server response code so we should collapse.
          return null;
        }
        // If an error occurs, let the ad be rendered via iframe after delay.
        // TODO(taymonbeal): Figure out a more sophisticated test for deciding
        // whether to retry with an iframe after an ad request failure or just
        // give up and render the fallback content (or collapse the ad slot).
        const networkFailureHandlerResult = this.onNetworkFailure(
          error,
          /** @type {string} */ (this.adUrl_)
        );
        devAssert(!!networkFailureHandlerResult);
        if (networkFailureHandlerResult.frameGetDisabled) {
          // Reset adUrl to null which will cause layoutCallback to not
          // fetch via frame GET.
          dev().info(
            TAG,
            'frame get disabled as part of network failure handler'
          );
          this.resetAdUrl();
        } else {
          this.adUrl_ = networkFailureHandlerResult.adUrl || this.adUrl_;
          return Promise.reject(NETWORK_FAILURE);
        }
        return null;
      });
  }

  /**
   * Called on network failure sending XHR CORS ad request allowing for
   * modification of ad url and prevent frame GET request on layoutCallback.
   * By default, GET frame request will be executed with same ad URL as used
   * for XHR CORS request.
   * @param {*} unusedError from network failure
   * @param {string} unusedAdUrl used for network request
   * @return {!{adUrl: (string|undefined), frameGetDisabled: (boolean|undefined)}}
   */
  onNetworkFailure(unusedError, unusedAdUrl) {
    return {};
  }

  /**
   * To be overridden by network specific implementation indicating which
   * signing service(s) is to be used.
   * @return {!Array<string>} A list of signing services.
   */
  getSigningServiceNames() {
    return getMode().localDev ? ['google', 'google-dev'] : ['google'];
  }

  /**
   * Render non-AMP creative within cross domain iframe.
   * @param {boolean=} throttleApplied Whether incrementLoadingAds has already
   *    been called
   * @return {Promise<boolean>} Whether the creative was successfully rendered.
   */
  renderNonAmpCreative(throttleApplied) {
    if (this.element.getAttribute('disable3pfallback') == 'true') {
      user().warn(
        TAG,
        this.element.getAttribute('type'),
        'fallback to 3p disabled'
      );
      return Promise.resolve(false);
    }
    // TODO(keithwrightbos): remove when no longer needed.
    dev().warn(TAG, 'fallback to 3p');
    // Haven't rendered yet, so try rendering via one of our
    // cross-domain iframe solutions.
    const method = this.experimentalNonAmpCreativeRenderMethod_;
    let renderPromise = Promise.resolve(false);
    if (
      (method == XORIGIN_MODE.SAFEFRAME || method == XORIGIN_MODE.NAMEFRAME) &&
      this.creativeBody_
    ) {
      renderPromise = this.renderViaNameAttrOfXOriginIframe_(
        this.creativeBody_
      );
      this.creativeBody_ = null; // Free resources.
    } else if (this.adUrl_) {
      assertHttpsUrl(this.adUrl_, this.element);
      renderPromise = this.renderViaIframeGet_(this.adUrl_);
    } else {
      // Ad URL may not exist if buildAdUrl throws error or returns empty.
      // If error occurred, it would have already been reported but let's
      // report to user in case of empty.
      user().warn(
        TAG,
        this.element.getAttribute('type'),
        "No creative or URL available -- A4A can't render any ad"
      );
    }
    if (!throttleApplied && !this.inNonAmpPreferenceExp()) {
      incrementLoadingAds(this.win, renderPromise);
    }
    return renderPromise.then((result) => {
      this.maybeTriggerAnalyticsEvent_('crossDomainIframeLoaded');
      // Pass on the result to the next value in the promise change.
      return result;
    });
  }

  /**
   * @param {!./head-validation.ValidatedHeadDef} headData
   * @param {function()} checkStillCurrent
   * @return {!Promise} Whether the creative was successfully rendered.
   */
  renderFriendlyTrustless_(headData, checkStillCurrent) {
    checkStillCurrent();
    devAssert(this.element.ownerDocument);
    this.maybeTriggerAnalyticsEvent_('renderFriendlyStart');

    const {height, width} = this.creativeSize_;
    const {extensions, fonts, head} = headData;
    this.maybeDestroyIframe_();
    this.iframe = createSecureFrame(
      this.win,
      this.getIframeTitle(),
      height,
      width
    );
    if (!this.uiHandler.isStickyAd()) {
      applyFillContent(this.iframe);
    }

    let body = '';
    const transferComplete = new Deferred();
    // If srcdoc is not supported, streaming is also not supported so we
    // can go ahead and write the ad content body.
    if (!isSrcdocSupported()) {
      body = head.ownerDocument.body./*OK */ outerHTML;
      transferComplete.resolve();
    } else {
      // Once skeleton doc has be written to srcdoc we start transferring
      // body chunks.
      listenOnce(this.iframe, 'load', () => {
        const fieBody = this.iframe.contentDocument.body;
        this.transferDomBody_(devAssert(fieBody)).then(
          transferComplete.resolve
        );
      });
    }

    const secureDoc = createSecureDocSkeleton(
      devAssert(this.adUrl_),
      head./*OK*/ outerHTML,
      body
    );

    const fieInstallPromise = this.installFriendlyIframeEmbed_(
      secureDoc,
      extensions,
      fonts,
      true // skipHtmlMerge
    );

    // Tell the FIE it is done after transferring.
    Promise.all([fieInstallPromise, transferComplete.promise]).then(
      (values) => {
        const friendlyIframeEmbed = values[0];
        // #installFriendlyIframeEmbed will return null if removed before install is complete.
        friendlyIframeEmbed && friendlyIframeEmbed.renderCompleted();
      }
    );

    const extensionIds = extensions.map((extension) => extension.extensionId);
    return fieInstallPromise.then((friendlyIframeEmbed) => {
      checkStillCurrent();
      this.makeFieVisible_(
        friendlyIframeEmbed,
        // TODO(ccordry): subclasses are passed creativeMetadata which does
        // not exist in unsigned case. All it is currently used for is to
        // check if it is an AMP creative, and extension list.
        {
          minifiedCreative: '',
          customStylesheets: [],
          customElementExtensions: extensionIds,
        },
        checkStillCurrent
      );
    });
  }

  /**
   * Render a validated AMP creative directly in the parent page.
   * @param {!CreativeMetaDataDef} creativeMetaData Metadata required to render
   *     AMP creative.
   * @return {!Promise} Whether the creative was successfully rendered.
   * @private
   */
  renderAmpCreative_(creativeMetaData) {
    devAssert(creativeMetaData.minifiedCreative, 'missing minified creative');
    devAssert(!!this.element.ownerDocument, 'missing owner document?!');
    this.maybeTriggerAnalyticsEvent_('renderFriendlyStart');
    // Create and setup friendly iframe.
    this.maybeDestroyIframe_();
    this.iframe = /** @type {!HTMLIFrameElement} */ (
      createElementWithAttributes(
        /** @type {!Document} */ (this.element.ownerDocument),
        'iframe',
        {
          // NOTE: It is possible for either width or height to be 'auto',
          // a non-numeric value.
          'height': this.creativeSize_.height,
          'width': this.creativeSize_.width,
          'frameborder': '0',
          'allowfullscreen': '',
          'allowtransparency': '',
          'scrolling': 'no',
          'title': this.getIframeTitle(),
          'role': 'region',
          'aria-label': 'Advertisement',
          'tabindex': '0',
        }
      )
    );
    if (!this.uiHandler.isStickyAd()) {
      applyFillContent(this.iframe);
    }
    const fontsArray = [];
    if (creativeMetaData.customStylesheets) {
      creativeMetaData.customStylesheets.forEach((s) => {
        const href = s['href'];
        if (href) {
          fontsArray.push(href);
        }
      });
    }
    const checkStillCurrent = this.verifyStillCurrent();
    const {minifiedCreative} = creativeMetaData;
    const extensions = getExtensionsFromMetadata(creativeMetaData);
    return this.installFriendlyIframeEmbed_(
      minifiedCreative,
      extensions,
      fontsArray || [],
      false // skipHtmlMerge
    ).then((friendlyIframeEmbed) =>
      this.makeFieVisible_(
        friendlyIframeEmbed,
        creativeMetaData,
        checkStillCurrent
      )
    );
  }

  /**
   * Convert the iframe to FIE impl and append to DOM.
   * @param {string} html
   * @param {!Array<{extensionId: string, extensionVersion: string}>} extensions
   * @param {!Array<string>} fonts
   * @param {boolean} skipHtmlMerge
   * @return {!Promise<!../../../src/friendly-iframe-embed.FriendlyIframeEmbed>}
   */
  installFriendlyIframeEmbed_(html, extensions, fonts, skipHtmlMerge) {
    return installFriendlyIframeEmbed(
      devAssert(this.iframe),
      this.element,
      {
        host: this.element,
        // Need to guarantee that this is no longer null
        url: devAssert(this.adUrl_),
        html,
        extensions,
        fonts,
        skipHtmlMerge,
      },
      (embedWin, ampdoc) => this.preinstallCallback_(embedWin, ampdoc)
    );
  }

  /**
   *
   * @param {!Window} embedWin
   * @param {../../../src/service/ampdoc-impl.AmpDoc=} ampdoc
   */
  preinstallCallback_(embedWin, ampdoc) {
    const parentAmpdoc = this.getAmpDoc();
    installUrlReplacementsForEmbed(
      ampdoc,
      new A4AVariableSource(parentAmpdoc, embedWin)
    );
  }

  /**
   * Make FIE visible and execute any loading / rendering complete callbacks.
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} friendlyIframeEmbed
   * @param {CreativeMetaDataDef} creativeMetaData
   * @param {function()} checkStillCurrent
   */
  makeFieVisible_(friendlyIframeEmbed, creativeMetaData, checkStillCurrent) {
    checkStillCurrent();
    this.friendlyIframeEmbed_ = friendlyIframeEmbed;
    // Ensure visibility hidden has been removed (set by boilerplate).
    const frameBody = this.getFieBody_(friendlyIframeEmbed);
    setStyle(frameBody, 'visibility', 'visible');

    protectFunctionWrapper(this.onCreativeRender, this, (err) => {
      dev().error(
        TAG,
        this.element.getAttribute('type'),
        'Error executing onCreativeRender',
        err
      );
    })(creativeMetaData, friendlyIframeEmbed.whenWindowLoaded());

    friendlyIframeEmbed.whenIniLoaded().then(() => {
      checkStillCurrent();
      this.maybeTriggerAnalyticsEvent_('friendlyIframeIniLoad');
    });

    // There's no need to wait for all resources to load.
    // StartRender is enough
  }

  /**
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} friendlyIframeEmbed
   * @return {!Element}
   */
  getFieBody_(friendlyIframeEmbed) {
    const frameDoc =
      friendlyIframeEmbed.iframe.contentDocument ||
      friendlyIframeEmbed.win.document;
    return devAssert(frameDoc.body);
  }

  /**
   * Shared functionality for cross-domain iframe-based rendering methods.
   * @param {!JsonObject<string, string>} attributes The attributes of the iframe.
   * @return {!Promise} awaiting load event for ad frame
   * @private
   */
  iframeRenderHelper_(attributes) {
    const mergedAttributes = Object.assign(attributes, {
      'height': this.creativeSize_.height,
      'width': this.creativeSize_.width,
      'title': this.getIframeTitle(),
      'role': 'region',
      'aria-label': 'Advertisement',
      'tabindex': '0',
    });

    if (this.sentinel) {
      mergedAttributes['data-amp-3p-sentinel'] = this.sentinel;
    }
    // Block synchronous XHR in ad. These are very rare, but super bad for UX
    // as they block the UI thread for the arbitrary amount of time until the
    // request completes.
    let featurePolicies = "sync-xhr 'none';";

    if (isAttributionReportingAllowed(this.win.document)) {
      featurePolicies += "attribution-reporting 'src';";
    }

    mergedAttributes['allow'] = featurePolicies;

    this.maybeDestroyIframe_();
    this.iframe = /** @type {!HTMLIFrameElement} */ (
      createElementWithAttributes(
        /** @type {!Document} */ (this.element.ownerDocument),
        'iframe',
        /** @type {!JsonObject} */ (
          Object.assign(mergedAttributes, SHARED_IFRAME_PROPERTIES)
        )
      )
    );
    if (this.sandboxHTMLCreativeFrame()) {
      applySandbox(this.iframe);
    }
    // TODO(keithwrightbos): noContentCallback?
    this.xOriginIframeHandler_ = new AMP.AmpAdXOriginIframeHandler(this);
    // Iframe is appended to element as part of xorigin frame handler init.
    // Executive onCreativeRender after init to ensure it can get reference
    // to frame but prior to load to allow for earlier access.
    const frameLoadPromise = this.xOriginIframeHandler_.init(
      this.iframe,
      /* opt_isA4A */ true,
      this.letCreativeTriggerRenderStart()
    );
    protectFunctionWrapper(this.onCreativeRender, this, (err) => {
      dev().error(
        TAG,
        this.element.getAttribute('type'),
        'Error executing onCreativeRender',
        err
      );
    })(null);
    return frameLoadPromise;
  }

  /**
   * Creates iframe whose src matches that of the ad URL. For standard
   * Fast Fetch running on the AMP cdn, an XHR request will typically have
   * already been sent to the same adUrl, and the response should
   * have been cached causing the browser to render without callout.  However,
   * it is possible for cache miss to occur which can be detected server-side
   * by missing ORIGIN header.
   *
   * Additionally, this method is also used in certain cases to send the only
   * request, i.e. the initial XHR is skipped.
   *
   * Note: As of 2016-10-18, the fill-from-cache assumption appears to fail on
   * Safari-on-iOS, which issues a fresh network request, even though the
   * content is already in cache.
   *
   * @param {string} adUrl  Ad request URL, as sent to #sendXhrRequest (i.e.,
   *    before any modifications that XHR module does to it.)
   * @return {!Promise} awaiting ad completed insertion.
   * @private
   */
  renderViaIframeGet_(adUrl) {
    this.maybeTriggerAnalyticsEvent_('renderCrossDomainStart');
    const contextMetadata = getContextMetadata(
      this.win,
      this.element,
      this.sentinel
    );

    const intersection = this.element.getIntersectionChangeEntry();
    contextMetadata['_context']['initialIntersection'] =
      intersectionEntryToJson(intersection);
    return this.iframeRenderHelper_({
      'src': Services.xhrFor(this.win).getCorsUrl(this.win, adUrl),
      'name': JSON.stringify(contextMetadata),
    });
  }

  /**
   * Whether AMP Ad Xorigin Iframe handler should wait for the creative to
   * call render-start, rather than triggering it itself. Example use case
   * is that amp-sticky-ad should trigger render-start itself so that the
   * sticky container isn't shown before an ad is ready.
   * @return {boolean}
   */
  letCreativeTriggerRenderStart() {
    return false;
  }

  /**
   * Render the creative via some "cross domain iframe that accepts the creative
   * in the name attribute".  This could be SafeFrame or the AMP-native
   * NameFrame.
   *
   * @param {!ArrayBuffer} creativeBody
   * @return {!Promise} awaiting load event for ad frame
   * @private
   */
  renderViaNameAttrOfXOriginIframe_(creativeBody) {
    /** @type {?string} */
    const method = this.experimentalNonAmpCreativeRenderMethod_;
    devAssert(
      method == XORIGIN_MODE.SAFEFRAME || method == XORIGIN_MODE.NAMEFRAME,
      'Unrecognized A4A cross-domain rendering mode: %s',
      method
    );
    this.maybeTriggerAnalyticsEvent_('renderSafeFrameStart');
    const checkStillCurrent = this.verifyStillCurrent();
    return tryResolve(() => utf8Decode(creativeBody)).then((creative) => {
      checkStillCurrent();
      let srcPath;
      let name = '';
      switch (method) {
        case XORIGIN_MODE.SAFEFRAME:
          srcPath = this.getSafeframePath() + '?n=0';
          break;
        case XORIGIN_MODE.NAMEFRAME:
          srcPath = getDefaultBootstrapBaseUrl(this.win, 'nameframe');
          // Name will be set for real below in nameframe case.
          break;
        default:
          // Shouldn't be able to get here, but...  Because of the assert,
          // above, we can only get here in non-dev mode, so give user feedback.
          user().error(
            'A4A',
            'A4A received unrecognized cross-domain name' +
              ' attribute iframe rendering mode request: %s.  Unable to' +
              ' render a creative for' +
              ' slot %s.',
            method,
            this.element.getAttribute('id')
          );
          return Promise.reject('Unrecognized rendering mode request');
      }
      // TODO(bradfrizzell): change name of function and var
      let contextMetadata = getContextMetadata(
        this.win,
        this.element,
        this.sentinel,
        this.getAdditionalContextMetadata(method == XORIGIN_MODE.SAFEFRAME)
      );

      const intersection = this.element.getIntersectionChangeEntry();
      contextMetadata['initialIntersection'] =
        intersectionEntryToJson(intersection);
      if (method == XORIGIN_MODE.NAMEFRAME) {
        contextMetadata['creative'] = creative;
        name = JSON.stringify(contextMetadata);
      } else if (method == XORIGIN_MODE.SAFEFRAME) {
        contextMetadata = JSON.stringify(contextMetadata);
        name =
          `${this.safeframeVersion};${creative.length};${creative}` +
          `${contextMetadata}`;
      }

      return this.iframeRenderHelper_({'src': srcPath, 'name': name});
    });
  }

  /**
   *
   * Throws {@code SyntaxError} if the metadata block delimiters are missing
   * or corrupted or if the metadata content doesn't parse as JSON.
   * @param {string} creative from which CSS is extracted
   * @return {?CreativeMetaDataDef} Object result of parsing JSON data blob inside
   *     the metadata markers on the ad text, or null if no metadata markers are
   *     found.
   * TODO(keithwrightbos@): report error cases
   */
  getAmpAdMetadata(creative) {
    let metadataStart = -1;
    let metadataString;
    for (let i = 0; i < METADATA_STRINGS.length; i++) {
      metadataString = METADATA_STRINGS[i];
      metadataStart = creative.lastIndexOf(metadataString);
      if (metadataStart >= 0) {
        break;
      }
    }
    if (metadataStart < 0) {
      // Couldn't find a metadata blob.
      dev().warn(
        TAG,
        this.element.getAttribute('type'),
        'Could not locate start index for amp meta data in: %s',
        creative
      );
      return null;
    }
    const metadataEnd = creative.lastIndexOf('</script>');
    if (metadataEnd < 0) {
      // Couldn't find a metadata blob.
      dev().warn(
        TAG,
        this.element.getAttribute('type'),
        'Could not locate closing script tag for amp meta data in: %s',
        creative
      );
      return null;
    }
    try {
      const metaDataObj = parseJson(
        creative.slice(metadataStart + metadataString.length, metadataEnd)
      );
      const ampRuntimeUtf16CharOffsets =
        metaDataObj['ampRuntimeUtf16CharOffsets'];
      if (
        !isArray(ampRuntimeUtf16CharOffsets) ||
        ampRuntimeUtf16CharOffsets.length != 2 ||
        typeof ampRuntimeUtf16CharOffsets[0] !== 'number' ||
        typeof ampRuntimeUtf16CharOffsets[1] !== 'number'
      ) {
        throw new Error('Invalid runtime offsets');
      }
      const metaData = {};
      if (metaDataObj['customElementExtensions']) {
        metaData.customElementExtensions =
          metaDataObj['customElementExtensions'];
        if (!isArray(metaData.customElementExtensions)) {
          throw new Error(
            'Invalid extensions',
            metaData.customElementExtensions
          );
        }
      } else {
        metaData.customElementExtensions = [];
      }
      if (metaDataObj['extensions']) {
        metaData.extensions = metaDataObj['extensions'];
      }
      if (metaDataObj['customStylesheets']) {
        // Expect array of objects with at least one key being 'href' whose
        // value is URL.
        metaData.customStylesheets = metaDataObj['customStylesheets'];
        const errorMsg = 'Invalid custom stylesheets';
        if (!isArray(metaData.customStylesheets)) {
          throw new Error(errorMsg);
        }

        const urls = Services.urlForDoc(this.element);
        /** @type {!Array} */ (metaData.customStylesheets).forEach(
          (stylesheet) => {
            if (
              !isObject(stylesheet) ||
              !stylesheet['href'] ||
              typeof stylesheet['href'] !== 'string' ||
              !urls.isSecure(stylesheet['href'])
            ) {
              throw new Error(errorMsg);
            }
          }
        );
      }
      if (isArray(metaDataObj['images'])) {
        // Load maximum of 5 images.
        metaData.images = metaDataObj['images'].splice(0, 5);
      }
      if (this.isSinglePageStoryAd) {
        // CTA Type is a required meta tag. CTA Url can come from meta tag, or
        // (temporarily) amp-ad-exit config.
        // TODO(#24080): maybe rerequire cta url?
        if (!metaDataObj['ctaType']) {
          throw new Error(INVALID_SPSA_RESPONSE);
        }
        this.element.setAttribute('data-vars-ctatype', metaDataObj['ctaType']);
        this.element.setAttribute('data-vars-ctaurl', metaDataObj['ctaUrl']);
      }
      // TODO(keithwrightbos): OK to assume ampRuntimeUtf16CharOffsets is before
      // metadata as its in the head?
      metaData.minifiedCreative =
        creative.slice(0, ampRuntimeUtf16CharOffsets[0]) +
        creative.slice(ampRuntimeUtf16CharOffsets[1], metadataStart) +
        creative.slice(metadataEnd + '</script>'.length);
      return metaData;
    } catch (err) {
      dev().warn(
        TAG,
        this.element.getAttribute('type'),
        'Invalid amp metadata: %s',
        creative.slice(metadataStart + metadataString.length, metadataEnd)
      );
      if (this.isSinglePageStoryAd) {
        throw err;
      }
      return null;
    }
  }

  /**
   * @return {string} full url to safeframe implementation.
   */
  getSafeframePath() {
    return (
      'https://tpc.googlesyndication.com/safeframe/' +
      `${this.safeframeVersion}/html/container.html`
    );
  }

  /**
   * Checks if the given lifecycle event has a corresponding amp-analytics event
   * and fires the analytics trigger if so.
   * @param {string} lifecycleStage
   * @private
   */
  maybeTriggerAnalyticsEvent_(lifecycleStage) {
    if (!this.a4aAnalyticsConfig_) {
      // No config exists that will listen to this event.
      return;
    }
    const analyticsEvent = devAssert(
      LIFECYCLE_STAGE_TO_ANALYTICS_TRIGGER[lifecycleStage]
    );
    const analyticsVars = /** @type {!JsonObject} */ ({
      'time': Math.round(this.getNow_()),
      ...this.getA4aAnalyticsVars(analyticsEvent),
    });
    triggerAnalyticsEvent(this.element, analyticsEvent, analyticsVars);
  }

  /**
   * Returns variables to be included on an analytics event. This can be
   * overridden by specific network implementations.
   * Note that this function is called for each time an analytics event is
   * fired.
   * @param {string} unusedAnalyticsEvent The name of the analytics event.
   * @return {!JsonObject}
   */
  getA4aAnalyticsVars(unusedAnalyticsEvent) {
    return {};
  }

  /**
   * Returns network-specific config for amp-analytics. It should overridden
   * with network-specific configurations.
   * This function may return null. If so, no amp-analytics element will be
   * added to this A4A element and no A4A triggers will be fired.
   * @return {?JsonObject}
   */
  getA4aAnalyticsConfig() {
    return null;
  }

  /**
   * Attempts to execute Real Time Config, if the ad network has enabled it.
   * If it is not supported by the network, but the publisher has included
   * the rtc-config attribute on the amp-ad element, warn. Additionaly,
   * if the publisher has included a valid `block-rtc` attribute, don't send.
   * @param {?CONSENT_POLICY_STATE} consentState
   * @param {?string} consentString
   * @param {?{[key: string]: string|number|boolean|undefined}} consentMetadata
   * @return {Promise<!Array<!rtcResponseDef>>|undefined}
   */
  tryExecuteRealTimeConfig_(consentState, consentString, consentMetadata) {
    if (this.element.getAttribute('rtc-config')) {
      installRealTimeConfigServiceForDoc(this.getAmpDoc());
      return this.getBlockRtc_().then((shouldBlock) =>
        shouldBlock
          ? undefined
          : Services.realTimeConfigForDoc(this.getAmpDoc()).then(
              (realTimeConfig) =>
                realTimeConfig.maybeExecuteRealTimeConfig(
                  this.element,
                  this.getCustomRealTimeConfigMacros_(),
                  consentState,
                  consentString,
                  consentMetadata,
                  this.verifyStillCurrent()
                )
            )
      );
    }
  }

  /**
   * To be overriden by network impl. Should return a mapping of macro keys
   * to values for substitution in publisher-specified URLs for RTC.
   * @return {!Object<string,
   *   !../../../src/service/variable-source.AsyncResolverDef>}
   */
  getCustomRealTimeConfigMacros_() {
    return {};
  }

  /**
   * Whether preferential render should still be utilized if web crypto is
   * unavailable, and crypto signature header is present.
   * @return {boolean}
   */
  shouldPreferentialRenderWithoutCrypto() {
    return false;
  }

  /**
   * @param {string=} headerValue Method as given in header.
   * @return {?XORIGIN_MODE}
   */
  getNonAmpCreativeRenderingMethod(headerValue) {
    if (headerValue) {
      if (!isEnumValue(XORIGIN_MODE, headerValue)) {
        dev().error(
          'AMP-A4A',
          `cross-origin render mode header ${headerValue}`
        );
      } else {
        return /** @type {XORIGIN_MODE} */ (headerValue);
      }
    }
    return Services.platformFor(this.win).isIos()
      ? XORIGIN_MODE.NAMEFRAME
      : null;
  }

  /**
   * Returns base object that will be written to cross-domain iframe name
   * attribute.
   * @param {boolean=} opt_isSafeframe Whether creative is rendering into
   *   a safeframe.
   * @return {!JsonObject|undefined}
   */
  getAdditionalContextMetadata(opt_isSafeframe) {}

  /**
   * Returns whether the received creative is verified AMP.
   * @return {boolean} True if the creative is verified AMP, false otherwise.
   */
  isVerifiedAmpCreative() {
    return this.isVerifiedAmpCreative_;
  }

  /**
   * Returns the amp-ad title attribute or a fallback string.
   * @return {string} iframe title attribute
   */
  getIframeTitle() {
    return this.element.getAttribute('title') || '3rd party ad content';
  }

  /**
   * Returns any enabled SSR experiments via the amp-usqp meta tag. These
   * correspond to the proto field ids in cs/AmpTransformerParams.
   *
   * These experiments do not have a fully unique experiment id for each value,
   * so we concatenate the key and value to generate a psuedo id. We assume
   * that any experiment is either a boolean (so two branches), or an enum with
   * 100 or less branches. So, the value is padded a leading 0 if necessary.
   *
   * @protected
   * @return {!Array<string>}
   */
  getSsrExpIds_() {
    const exps = [];
    const meta = this.getAmpDoc().getMetaByName('amp-usqp');
    if (meta) {
      const keyValues = meta.split(',');
      for (let i = 0; i < keyValues.length; i++) {
        const kv = keyValues[i].split('=');
        if (kv.length !== 2) {
          continue;
        }
        // Reasonably assume that all important exps are either booleans, or
        // enums with 100 or less branches.
        const val = Number(kv[1]);
        if (!isNaN(kv[0]) && val >= 0 && val < 100) {
          const padded = padStart(kv[1], 2, '0');
          exps.push(kv[0] + padded);
        }
      }
    }
    return exps;
  }
}

/**
 * Attachs query string portion of ad url to error.
 * @param {!Error} error
 * @param {?string} adUrl
 */
export function assignAdUrlToError(error, adUrl) {
  if (!adUrl || (error.args && error.args['au'])) {
    return;
  }
  const adQueryIdx = adUrl.indexOf('?');
  if (adQueryIdx == -1) {
    return;
  }
  (error.args || (error.args = {}))['au'] = adUrl.substring(
    adQueryIdx + 1,
    adQueryIdx + 251
  );
}

/**
 * Returns the signature verifier for the given window. Lazily creates it if it
 * doesn't already exist.
 *
 * This ensures that only one signature verifier exists per window, which allows
 * multiple Fast Fetch ad slots on a page (even ones from different ad networks)
 * to share the same cached public keys.
 *
 * @param {!Window} win
 * @return {!SignatureVerifier}
 * @visibleForTesting
 */
export function signatureVerifierFor(win) {
  const propertyName = 'AMP_FAST_FETCH_SIGNATURE_VERIFIER_';
  return (
    win[propertyName] ||
    (win[propertyName] = new SignatureVerifier(win, signingServerURLs))
  );
}

/**
 * @param {!Window} win
 * @return {boolean}
 * @visibleForTesting
 */
export function isPlatformSupported(win) {
  // Require Shadow DOM support for a4a.
  return isNative(win.Element.prototype.attachShadow);
}

/**
 * Returns `true` if the passed function exists and is native to the browser.
 * @param {Function|undefined} func
 * @return {boolean}
 */
function isNative(func) {
  return !!func && func.toString().indexOf('[native code]') != -1;
}
