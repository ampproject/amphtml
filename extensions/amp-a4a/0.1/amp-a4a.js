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

import {A4AVariableSource} from './a4a-variable-source';
import {
  CONSENT_POLICY_STATE, // eslint-disable-line no-unused-vars
} from '../../../src/consent-state';
import {Layout, LayoutPriority, isLayoutSizeDefined} from '../../../src/layout';
import {
  SINGLE_PASS_EXPERIMENT_IDS,
  addExperimentIdToElement,
} from '../../../ads/google/a4a/traffic-experiments';
import {Services} from '../../../src/services';
import {SignatureVerifier, VerificationStatus} from './signature-verifier';
import {
  applySandbox,
  generateSentinel,
  getDefaultBootstrapBaseUrl,
} from '../../../src/3p-frame';
import {
  assertHttpsUrl,
  tryDecodeUriComponent,
} from '../../../src/url';
import {cancellation, isCancellation} from '../../../src/error';
import {createElementWithAttributes} from '../../../src/dom';
import {
  dev,
  devAssert,
  duplicateErrorIfNecessary,
  user,
} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  getAmpAdRenderOutsideViewport,
  incrementLoadingAds,
  is3pThrottled,
} from '../../amp-ad/0.1/concurrent-load';
import {
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../src/consent';
import {getContextMetadata} from '../../../src/iframe-attributes';
import {getMode} from '../../../src/mode';
import {insertAnalyticsElement} from '../../../src/extension-analytics';
import {
  installFriendlyIframeEmbed,
  setFriendlyIframeEmbedVisible,
} from '../../../src/friendly-iframe-embed';
import {
  installUrlReplacementsForEmbed,
} from '../../../src/service/url-replacements-impl';
import {isAdPositionAllowed} from '../../../src/ad-helper';
import {isArray, isEnumValue, isObject} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {parseJson} from '../../../src/json';
import {setStyle} from '../../../src/style';
import {signingServerURLs} from '../../../ads/_a4a-config';
import {triggerAnalyticsEvent} from '../../../src/analytics';
import {tryResolve} from '../../../src/utils/promise';
import {utf8Decode} from '../../../src/utils/bytes';

/** @type {Array<string>} */
const METADATA_STRINGS = [
  '<script amp-ad-metadata type=application/json>',
  '<script type="application/json" amp-ad-metadata>',
  '<script type=application/json amp-ad-metadata>'];

// TODO(tdrl): Temporary, while we're verifying whether SafeFrame is an
// acceptable solution to the 'Safari on iOS doesn't fetch iframe src from
// cache' issue.  See https://github.com/ampproject/amphtml/issues/5614
/** @type {string} */
export const DEFAULT_SAFEFRAME_VERSION = '1-0-23';

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
const SHARED_IFRAME_PROPERTIES = dict({
  'frameborder': '0',
  'allowfullscreen': '',
  'allowtransparency': '',
  'scrolling': 'no',
  'marginwidth': '0',
  'marginheight': '0',
});

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
 * @const {!Object<string, !AnalyticsTrigger>}
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
  fn, inThis = undefined, onError = undefined) {
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

    /** @private {?Promise<?CreativeMetaDataDef>} */
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

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
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
    this.getNow_ = (this.win.performance && this.win.performance.now) ?
      this.win.performance.now.bind(this.win.performance) : Date.now;

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
     * {?HTMLIframeElement}
     */
    this.iframe = null;

    /**
     * TODO(keithwrightbos) - remove once resume behavior is verified.
     * {boolean} whether most recent ad request was generated as part
     *    of resume callback.
     */
    this.fromResumeCallback = false;

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
     * @type {!Object<string,string>}
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
  }

  /** @override */
  getLayoutPriority() {
    // Priority used for scheduling preload and layout callback.  Because
    // AMP creatives will be injected as part of the promise chain created
    // within onLayoutMeasure, this is only relevant to non-AMP creatives
    // therefore we want this to match the 3p priority.
    const isPWA = !this.element.getAmpDoc().isSingleDoc();
    // give the ad higher priority if it is inside a PWA
    return isPWA ? LayoutPriority.METADATA : LayoutPriority.ADS;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  isRelayoutNeeded() {
    return this.isRelayoutNeededFlag;
  }

  /** @override */
  buildCallback() {
    this.creativeSize_ = {
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
    };
    const upgradeDelayMs = Math.round(this.getResource().getUpgradeDelayMs());
    dev().info(TAG,
        `upgradeDelay ${this.element.getAttribute('type')}: ${upgradeDelayMs}`);

    this.uiHandler = new AMP.AmpAdUIHandler(this);

    const verifier = signatureVerifierFor(this.win);
    this.keysetPromise_ =
        Services.viewerForDoc(this.getAmpDoc()).whenFirstVisible().then(() => {
          this.getSigningServiceNames().forEach(signingServiceName => {
            verifier.loadKeyset(signingServiceName);
          });
        });

    this.a4aAnalyticsConfig_ = this.getA4aAnalyticsConfig();
    if (this.a4aAnalyticsConfig_) {
      // TODO(warrengm): Consider having page-level singletons for networks that
      // use the same config for all ads.
      this.a4aAnalyticsElement_ = insertAnalyticsElement(
          this.element, this.a4aAnalyticsConfig_, true /* loadAnalytics */);
    }

    this.isSinglePageStoryAd = this.element.hasAttribute('amp-story');
  }

  /** @override */
  renderOutsideViewport() {
    // Ensure non-verified AMP creatives are throttled.
    if (!this.isVerifiedAmpCreative_ && is3pThrottled(this.win) &&
        !this.inNonAmpPreferenceExp()) {
      return false;
    }
    // Otherwise the ad is good to go.
    const elementCheck = getAmpAdRenderOutsideViewport(this.element);
    return elementCheck !== null ?
      elementCheck : super.renderOutsideViewport();
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
    return this.element.tagName == 'AMP-AD' ||
        this.element.tagName == 'AMP-EMBED';
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
      preconnect.forEach(p => {
        this.preconnect.url(p, /*opt_preloadAs*/true);
      });
    }
  }

  /** @override */
  resumeCallback() {
    // FIE that was not destroyed on unlayoutCallback does not require a new
    // ad request.
    if (this.friendlyIframeEmbed_) {
      return;
    }
    this.fromResumeCallback = true;
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
    return !!this.postAdResponseExperimentFeatures['pref_neutral_enabled'] &&
      ['adsense', 'doubleclick'].includes(this.element.getAttribute('type'));
  }

  /**
   * @return {boolean} whether environment/element should initialize ad request
   *    promise chain.
   * @private
   */
  shouldInitializePromiseChain_() {
    const slotRect = this.getIntersectionElementLayoutBox();
    if (this.getLayout() != Layout.FLUID &&
        (slotRect.height == 0 || slotRect.width == 0)) {
      dev().fine(
          TAG, 'onLayoutMeasure canceled due height/width 0', this.element);
      return false;
    }
    if (!isAdPositionAllowed(this.element, this.win)) {
      user().warn(TAG, `<${this.element.tagName}> is not allowed to be ` +
        `placed in elements with position:fixed: ${this.element}`);
      return false;
    }
    // OnLayoutMeasure can be called when page is in prerender so delay until
    // visible.  Assume that it is ok to call isValidElement as it should
    // only being looking at window, immutable properties (i.e. location) and
    // its element ancestry.
    if (!this.isValidElement()) {
      // TODO(kjwright): collapse?
      user().warn(TAG, this.element.getAttribute('type'),
          'Amp ad element ignored as invalid', this.element);
      return false;
    }
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    this.initiateAdRequest();
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
    this.adPromise_ = Services.viewerForDoc(this.getAmpDoc()).whenFirstVisible()
        .then(() => {
          checkStillCurrent();
          // See if experiment that delays request until slot is within
          // renderOutsideViewport. Within render outside viewport will not
          // resolve if already within viewport thus the check for already
          // meeting the definition as opposed to waiting on the promise.
          const delay = this.delayAdRequestEnabled();
          if (delay) {
            return this.getResource().whenWithinViewport(
                typeof delay == 'number' ? delay :
                  this.renderOutsideViewport());
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
            ).catch(err => {
              user().error(TAG, 'Error determining consent state', err);
              return CONSENT_POLICY_STATE.UNKNOWN;
            });

            const consentStringPromise = getConsentPolicyInfo(
                this.element,
                consentPolicyId
            ).catch(err => {
              user().error(TAG, 'Error determining consent string', err);
              return null;
            });

            return Promise.all([
              consentStatePromise,
              consentStringPromise,
            ]);
          }

          return Promise.resolve([null, null]);
        })
        // This block returns the ad URL, if one is available.
        /** @return {!Promise<?string>} */
        .then(consentResponse => {
          checkStillCurrent();

          const consentState = consentResponse[0];
          const consentString = consentResponse[1];

          return /** @type {!Promise<?string>} */(this.getAdUrl(
              consentState, this.tryExecuteRealTimeConfig_(
                  consentState,
                  consentString
              )));
        })
        // This block returns the (possibly empty) response to the XHR request.
        /** @return {!Promise<?Response>} */
        .then(adUrl => {
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
        /** @return {?Promise<?{bytes: !ArrayBuffer, headers: !Headers}>} */
        .then(fetchResponse => {
          checkStillCurrent();
          this.maybeTriggerAnalyticsEvent_('adRequestEnd');
          // If the response is null (can occur for non-200 responses)  or
          // arrayBuffer is null, force collapse.
          if (!fetchResponse || !fetchResponse.arrayBuffer ||
              fetchResponse.headers.has('amp-ff-empty-creative')) {
            this.forceCollapse();
            return Promise.reject(NO_CONTENT_RESPONSE);
          }
          if (fetchResponse.headers && fetchResponse.headers.has(
              EXPERIMENT_FEATURE_HEADER_NAME)) {
            this.populatePostAdResponseExperimentFeatures_(
                fetchResponse.headers.get(EXPERIMENT_FEATURE_HEADER_NAME));
          }
          if (getMode().localDev && this.win.location &&
              this.win.location.search) {
            // Allow for setting experiment features via query param which
            // will potentially override values returned in response.
            const match = /(?:\?|&)a4a_feat_exp=([^&]+)/.exec(
                this.win.location.search);
            if (match && match[1]) {
              dev().info(TAG, `Using debug exp features: ${match[1]}`);
              this.populatePostAdResponseExperimentFeatures_(
                  tryDecodeUriComponent(match[1]));
            }
          }
          // TODO(tdrl): Temporary, while we're verifying whether SafeFrame is
          // an acceptable solution to the 'Safari on iOS doesn't fetch
          // iframe src from cache' issue.  See
          // https://github.com/ampproject/amphtml/issues/5614
          const method = this.getNonAmpCreativeRenderingMethod(
              fetchResponse.headers.get(RENDERING_TYPE_HEADER));
          this.experimentalNonAmpCreativeRenderMethod_ = method;
          if (this.experimentalNonAmpCreativeRenderMethod_ ==
              XORIGIN_MODE.NAMEFRAME) {
            this.preconnect.preload(
                getDefaultBootstrapBaseUrl(this.win, 'nameframe'));
          }
          const safeframeVersionHeader =
            fetchResponse.headers.get(SAFEFRAME_VERSION_HEADER);
          if (/^[0-9-]+$/.test(safeframeVersionHeader) &&
              safeframeVersionHeader != DEFAULT_SAFEFRAME_VERSION) {
            this.safeframeVersion = safeframeVersionHeader;
            this.preconnect.preload(this.getSafeframePath());
          }
          // Note: Resolving a .then inside a .then because we need to capture
          // two fields of fetchResponse, one of which is, itself, a promise,
          // and one of which isn't.  If we just return
          // fetchResponse.arrayBuffer(), the next step in the chain will
          // resolve it to a concrete value, but we'll lose track of
          // fetchResponse.headers.
          return fetchResponse.arrayBuffer().then(bytes => {
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
          });
        })
        /** @return {!Promise<?ArrayBuffer>} */
        .then(responseParts => {
          checkStillCurrent();
          // Keep a handle to the creative body so that we can render into
          // SafeFrame or NameFrame later, if necessary.  TODO(tdrl): Temporary,
          // while we
          // assess whether this is the right solution to the Safari+iOS iframe
          // src cache issue.  If we decide to keep a SafeFrame-like solution,
          // we should restructure the promise chain to pass this info along
          // more cleanly, without use of an object variable outside the chain.
          if (!responseParts) {
            return Promise.resolve();
          }
          const {bytes, headers} = responseParts;
          const size = this.extractSize(responseParts.headers);
          this.creativeSize_ = size || this.creativeSize_;
          if (this.experimentalNonAmpCreativeRenderMethod_ !=
              XORIGIN_MODE.CLIENT_CACHE &&
              bytes) {
            this.creativeBody_ = bytes;
          }
          return this.maybeValidateAmpCreative(bytes, headers);
        })
        .then(creative => {
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
        .then(creativeDecoded => {
          checkStillCurrent();
          // Note: It's critical that #getAmpAdMetadata be called
          // on precisely the same creative that was validated
          // via #validateAdResponse_.  See GitHub issue
          // https://github.com/ampproject/amphtml/issues/4187
          let creativeMetaDataDef;
          if (!creativeDecoded ||
            !(creativeMetaDataDef = this.getAmpAdMetadata(creativeDecoded))) {
            if (this.inNonAmpPreferenceExp()) {
              // Experiment to give non-AMP creatives same benefits as AMP so
              // update priority.
              this.updateLayoutPriority(LayoutPriority.CONTENT);
            }
            return null;
          }

          // Update priority.
          this.updateLayoutPriority(LayoutPriority.CONTENT);
          // Load any extensions; do not wait on their promises as this
          // is just to prefetch.
          const extensions = Services.extensionsFor(this.win);
          creativeMetaDataDef.customElementExtensions.forEach(
              extensionId => extensions.preloadExtension(extensionId));
          // Preload any fonts.
          (creativeMetaDataDef.customStylesheets || []).forEach(font =>
            this.preconnect.preload(font.href));

          const urls = Services.urlForDoc(this.element);
          // Preload any AMP images.
          (creativeMetaDataDef.images || []).forEach(image =>
            urls.isSecure(image) && this.preconnect.preload(image));
          return creativeMetaDataDef;
        })
        .catch(error => {
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
          if (this.element.getAttribute('type') == 'fake' &&
              !this.element.getAttribute('checksig')) {
            // do not verify signature for fake type ad, unless the ad
            // specfically requires via 'checksig' attribute
            return Promise.resolve(VerificationStatus.OK);
          }
          return signatureVerifierFor(this.win).verify(bytes, headers);
        })
        .then(status => {
          checkStillCurrent();
          let result = null;
          switch (status) {
            case VerificationStatus.OK:
              result = bytes;
              break;
            case VerificationStatus.CRYPTO_UNAVAILABLE:
              result = this.shouldPreferentialRenderWithoutCrypto() ?
                bytes : null;
              break;
            // TODO(@taymonbeal, #9274): differentiate between these
            case VerificationStatus.ERROR_KEY_NOT_FOUND:
            case VerificationStatus.ERROR_SIGNATURE_MISMATCH:
              user().error(
                  TAG, this.element.getAttribute('type'),
                  'Signature verification failed');
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
    input.split(',').forEach(line => {
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
        return Services.timerFor(this.win).promise(1000).then(() => {
          this.isRelayoutNeededFlag = true;
          this.getResource().layoutCanceled();
          // Only Require relayout after page visible
          Services.viewerForDoc(this.getAmpDoc()).whenNextVisible().then(() => {
            Services.resourcesForDoc(this.getAmpDoc())
                ./*OK*/requireLayout(this.element);
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
      error = duplicateErrorIfNecessary(/** @type {!Error} */(error));
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
    assignAdUrlToError(/** @type {!Error} */(error), this.adUrl_);

    if (getMode().development || getMode().localDev || getMode().log) {
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
    return this.attemptToRenderCreative();
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
    return this.adPromise_.then(creativeMetaData => {
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
      // Must be an AMP creative.
      return this.renderAmpCreative_(creativeMetaData)
          .catch(err => {
            checkStillCurrent();
            // Failed to render via AMP creative path so fallback to non-AMP
            // rendering within cross domain iframe.
            user().warn(TAG, this.element.getAttribute('type'),
                'Error injecting creative in friendly frame', err);
            return this.renderNonAmpCreative();
          });
    }).catch(error => {
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
    this.originalSlotSize_ = this.originalSlotSize_ || this.getLayoutBox();
    return super.attemptChangeSize(newHeight, newWidth);
  }

  /** @override  */
  unlayoutCallback() {
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
      super.attemptChangeSize(
          this.originalSlotSize_.height, this.originalSlotSize_.width)
          .then(() => {
            this.originalSlotSize_ = null;
          })
          .catch(err => {
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
    this.fromResumeCallback = false;
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
    if (this.iframe && this.iframe.parentElement) {
      this.iframe.parentElement.removeChild(this.iframe);
      this.iframe = null;
    }
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.freeXOriginIframe();
      this.xOriginIframeHandler_ = null;
    }
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.friendlyIframeEmbed_) {
      setFriendlyIframeEmbedVisible(this.friendlyIframeEmbed_, inViewport);
    }
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.viewportCallback(inViewport);
    }
  }

  /** @override */
  createPlaceholderCallback() {
    return this.uiHandler.createPlaceholder();
  }

  /**
   * Gets the Ad URL to send an XHR Request to.  To be implemented
   * by network.
   * @param {?CONSENT_POLICY_STATE} unusedConsentState
   * @param {Promise<!Array<rtcResponseDef>>=} opt_rtcResponsesPromise
   * @return {!Promise<string>|string}
   */
  getAdUrl(unusedConsentState, opt_rtcResponsesPromise) {
    throw new Error('getAdUrl not implemented!');
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
    return /** @type {?SizeInfoDef} */ (
      {width: Number(match[1]), height: Number(match[2])});
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
    this.originalSlotSize_ = this.originalSlotSize_ || this.getLayoutBox();
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
        creativeMetaData ? 'renderFriendlyEnd' : 'renderCrossDomainEnd');
  }

  /**
   * @param {!Element} iframe that was just created.  To be overridden for
   * testing.
   * @visibleForTesting
   */
  onCrossDomainIframeCreated(iframe) {
    dev().info(TAG, this.element.getAttribute('type'),
        `onCrossDomainIframeCreated ${iframe}`);
  }

  /** @return {boolean} whether html creatives should be sandboxed. */
  sandboxHTMLCreativeFrame() {
    return isExperimentOn(this.win, 'sandbox-ads');
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
        .catch(error => {
          if (error.response && error.response.status > 200) {
            // Invalid server response code so we should collapse.
            return null;
          }
          // If an error occurs, let the ad be rendered via iframe after delay.
          // TODO(taymonbeal): Figure out a more sophisticated test for deciding
          // whether to retry with an iframe after an ad request failure or just
          // give up and render the fallback content (or collapse the ad slot).
          const networkFailureHandlerResult =
              this.onNetworkFailure(error, /** @type {string} */ (this.adUrl_));
          devAssert(!!networkFailureHandlerResult);
          if (networkFailureHandlerResult.frameGetDisabled) {
            // Reset adUrl to null which will cause layoutCallback to not
            // fetch via frame GET.
            dev().info(
                TAG, 'frame get disabled as part of network failure handler');
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
      user().warn(TAG, this.element.getAttribute('type'),
          'fallback to 3p disabled');
      return Promise.resolve(false);
    }
    // TODO(keithwrightbos): remove when no longer needed.
    dev().warn(TAG, 'fallback to 3p');
    // Haven't rendered yet, so try rendering via one of our
    // cross-domain iframe solutions.
    const method = this.experimentalNonAmpCreativeRenderMethod_;
    let renderPromise = Promise.resolve(false);
    if ((method == XORIGIN_MODE.SAFEFRAME ||
         method == XORIGIN_MODE.NAMEFRAME) &&
        this.creativeBody_) {
      renderPromise = this.renderViaNameAttrOfXOriginIframe_(
          this.creativeBody_);
      this.creativeBody_ = null; // Free resources.
    } else if (this.adUrl_) {
      assertHttpsUrl(this.adUrl_, this.element);
      renderPromise = this.renderViaIframeGet_(this.adUrl_);
    } else {
      // Ad URL may not exist if buildAdUrl throws error or returns empty.
      // If error occurred, it would have already been reported but let's
      // report to user in case of empty.
      user().warn(TAG, this.element.getAttribute('type'),
          'No creative or URL available -- A4A can\'t render any ad');
    }
    if (!throttleApplied && !this.inNonAmpPreferenceExp()) {
      incrementLoadingAds(this.win, renderPromise);
    }
    return renderPromise.then(
        result => {
          this.maybeTriggerAnalyticsEvent_('crossDomainIframeLoaded');
          // Pass on the result to the next value in the promise change.
          return result;
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
    devAssert(creativeMetaData.minifiedCreative,
        'missing minified creative');
    devAssert(!!this.element.ownerDocument, 'missing owner document?!');
    this.maybeTriggerAnalyticsEvent_('renderFriendlyStart');
    // Create and setup friendly iframe.
    this.iframe = /** @type {!HTMLIFrameElement} */(
      createElementWithAttributes(
          /** @type {!Document} */(this.element.ownerDocument), 'iframe',
          dict({
            // NOTE: It is possible for either width or height to be 'auto',
            // a non-numeric value.
            'height': this.creativeSize_.height,
            'width': this.creativeSize_.width,
            'frameborder': '0',
            'allowfullscreen': '',
            'allowtransparency': '',
            'scrolling': 'no',
          })));
    this.applyFillContent(this.iframe);
    const fontsArray = [];
    if (creativeMetaData.customStylesheets) {
      creativeMetaData.customStylesheets.forEach(s => {
        const href = s['href'];
        if (href) {
          fontsArray.push(href);
        }
      });
    }
    const checkStillCurrent = this.verifyStillCurrent();
    return installFriendlyIframeEmbed(
        this.iframe, this.element, {
          host: this.element,
          // Need to guarantee that this is no longer null
          url: /** @type {string} */ (this.adUrl_),
          html: creativeMetaData.minifiedCreative,
          extensionIds: creativeMetaData.customElementExtensions || [],
          fonts: fontsArray,
        }, embedWin => {
          installUrlReplacementsForEmbed(this.getAmpDoc(), embedWin,
              new A4AVariableSource(this.getAmpDoc(), embedWin));
        }).then(friendlyIframeEmbed => {
      checkStillCurrent();
      this.friendlyIframeEmbed_ = friendlyIframeEmbed;
      setFriendlyIframeEmbedVisible(
          friendlyIframeEmbed, this.isInViewport());
      // Ensure visibility hidden has been removed (set by boilerplate).
      const frameDoc = friendlyIframeEmbed.iframe.contentDocument ||
              friendlyIframeEmbed.win.document;
      setStyle(frameDoc.body, 'visibility', 'visible');
      protectFunctionWrapper(this.onCreativeRender, this, err => {
        dev().error(TAG, this.element.getAttribute('type'),
            'Error executing onCreativeRender', err);
      })(creativeMetaData, friendlyIframeEmbed.whenWindowLoaded());
      friendlyIframeEmbed.whenIniLoaded().then(() => {
        checkStillCurrent();
        this.maybeTriggerAnalyticsEvent_('friendlyIframeIniLoad');
      });

      // There's no need to wait for all resources to load.
      // StartRender is enough
    });
  }

  /**
   * Shared functionality for cross-domain iframe-based rendering methods.
   * @param {!JsonObject<string, string>} attributes The attributes of the iframe.
   * @return {!Promise} awaiting load event for ad frame
   * @private
   */
  iframeRenderHelper_(attributes) {
    const mergedAttributes = Object.assign(attributes, dict({
      'height': this.creativeSize_.height,
      'width': this.creativeSize_.width,
    }));

    if (this.sentinel) {
      mergedAttributes['data-amp-3p-sentinel'] = this.sentinel;
    }
    if (isExperimentOn(this.win, 'no-sync-xhr-in-ads')) {
      // Block synchronous XHR in ad. These are very rare, but super bad for UX
      // as they block the UI thread for the arbitrary amount of time until the
      // request completes.
      mergedAttributes['allow'] = 'sync-xhr \'none\';';
    }
    this.iframe = createElementWithAttributes(
        /** @type {!Document} */ (this.element.ownerDocument),
        'iframe', /** @type {!JsonObject} */ (
          Object.assign(mergedAttributes, SHARED_IFRAME_PROPERTIES)));
    if (this.sandboxHTMLCreativeFrame()) {
      applySandbox(this.iframe);
    }
    // TODO(keithwrightbos): noContentCallback?
    this.xOriginIframeHandler_ = new AMP.AmpAdXOriginIframeHandler(this);
    // Iframe is appended to element as part of xorigin frame handler init.
    // Executive onCreativeRender after init to ensure it can get reference
    // to frame but prior to load to allow for earlier access.
    const frameLoadPromise =
        this.xOriginIframeHandler_.init(this.iframe, /* opt_isA4A */ true);
    protectFunctionWrapper(this.onCreativeRender, this, err => {
      dev().error(TAG, this.element.getAttribute('type'),
          'Error executing onCreativeRender', err);
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
    return this.iframeRenderHelper_(dict({
      'src': Services.xhrFor(this.win).getCorsUrl(this.win, adUrl),
      'name': JSON.stringify(
          getContextMetadata(this.win, this.element, this.sentinel)),
    }));
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
    devAssert(method == XORIGIN_MODE.SAFEFRAME ||
        method == XORIGIN_MODE.NAMEFRAME,
    'Unrecognized A4A cross-domain rendering mode: %s', method);
    this.maybeTriggerAnalyticsEvent_('renderSafeFrameStart');
    const checkStillCurrent = this.verifyStillCurrent();
    return tryResolve(() => utf8Decode(creativeBody)).then(creative => {
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
          user().error('A4A', 'A4A received unrecognized cross-domain name'
              + ' attribute iframe rendering mode request: %s.  Unable to'
              + ' render a creative for'
              + ' slot %s.', method, this.element.getAttribute('id'));
          return Promise.reject('Unrecognized rendering mode request');
      }
      // TODO(bradfrizzell): change name of function and var
      let contextMetadata = getContextMetadata(
          this.win, this.element, this.sentinel,
          this.getAdditionalContextMetadata(method == XORIGIN_MODE.SAFEFRAME));
      // TODO(bradfrizzell) Clean up name assigning.
      if (method == XORIGIN_MODE.NAMEFRAME) {
        contextMetadata['creative'] = creative;
        name = JSON.stringify(contextMetadata);
      } else if (method == XORIGIN_MODE.SAFEFRAME) {
        contextMetadata = JSON.stringify(contextMetadata);
        name = `${this.safeframeVersion};${creative.length};${creative}` +
            `${contextMetadata}`;
      }
      return this.iframeRenderHelper_(dict({'src': srcPath, 'name': name}));
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
      dev().warn(TAG, this.element.getAttribute('type'),
          'Could not locate start index for amp meta data in: %s', creative);
      return null;
    }
    const metadataEnd = creative.lastIndexOf('</script>');
    if (metadataEnd < 0) {
      // Couldn't find a metadata blob.
      dev().warn(TAG, this.element.getAttribute('type'),
          'Could not locate closing script tag for amp meta data in: %s',
          creative);
      return null;
    }
    try {
      const metaDataObj = parseJson(
          creative.slice(metadataStart + metadataString.length, metadataEnd));
      const ampRuntimeUtf16CharOffsets =
        metaDataObj['ampRuntimeUtf16CharOffsets'];
      if (!isArray(ampRuntimeUtf16CharOffsets) ||
          ampRuntimeUtf16CharOffsets.length != 2 ||
          typeof ampRuntimeUtf16CharOffsets[0] !== 'number' ||
          typeof ampRuntimeUtf16CharOffsets[1] !== 'number') {
        throw new Error('Invalid runtime offsets');
      }
      const metaData = {};
      if (metaDataObj['customElementExtensions']) {
        metaData.customElementExtensions =
          metaDataObj['customElementExtensions'];
        if (!isArray(metaData.customElementExtensions)) {
          throw new Error(
              'Invalid extensions', metaData.customElementExtensions);
        }
      } else {
        metaData.customElementExtensions = [];
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
        metaData.customStylesheets.forEach(stylesheet => {
          if (!isObject(stylesheet) || !stylesheet['href'] ||
              typeof stylesheet['href'] !== 'string' ||
              !urls.isSecure(stylesheet['href'])) {
            throw new Error(errorMsg);
          }
        });
      }
      if (isArray(metaDataObj['images'])) {
        // Load maximum of 5 images.
        metaData.images = metaDataObj['images'].splice(0, 5);
      }
      if (this.isSinglePageStoryAd) {
        if (!metaDataObj['ctaUrl'] || !metaDataObj['ctaType']) {
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
          TAG, this.element.getAttribute('type'), 'Invalid amp metadata: %s',
          creative.slice(metadataStart + metadataString.length, metadataEnd));
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
    return 'https://tpc.googlesyndication.com/safeframe/' +
      `${this.safeframeVersion}/html/container.html`;
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
    const analyticsEvent =
        devAssert(LIFECYCLE_STAGE_TO_ANALYTICS_TRIGGER[lifecycleStage]);
    const analyticsVars = /** @type {!JsonObject} */ (Object.assign(
        dict({'time': Math.round(this.getNow_())}),
        this.getA4aAnalyticsVars(analyticsEvent)));
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
    return dict({});
  }

  /**
   * Returns network-specific config for amp-analytics. It should overridden
   * with network-specific configurations.
   * This function may return null. If so, no amp-analytics element will be
   * added to this A4A element and no A4A triggers will be fired.
   * @return {?JsonObject}
   */
  getA4aAnalyticsConfig() { return null; }

  /**
   * Attempts to execute Real Time Config, if the ad network has enabled it.
   * If it is not supported by the network, but the publisher has included
   * the rtc-config attribute on the amp-ad element, warn.
   * @param {?CONSENT_POLICY_STATE} consentState
   * @param {?string} consentString
   * @return {Promise<!Array<!rtcResponseDef>>|undefined}
   */
  tryExecuteRealTimeConfig_(consentState, consentString) {
    if (!!AMP.RealTimeConfigManager) {
      try {
        return new AMP.RealTimeConfigManager(this)
            .maybeExecuteRealTimeConfig(
                this.getCustomRealTimeConfigMacros_(),
                consentState,
                consentString
            );
      } catch (err) {
        user().error(TAG, 'Could not perform Real Time Config.', err);
      }
    } else if (this.element.getAttribute('rtc-config')) {
      user().error(TAG, 'RTC not supported for ad network ' +
                   `${this.element.getAttribute('type')}`);

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
   */
  getNonAmpCreativeRenderingMethod(headerValue) {
    if (headerValue) {
      if (!isEnumValue(XORIGIN_MODE, headerValue)) {
        dev().error(
            'AMP-A4A', `cross-origin render mode header ${headerValue}`);
      } else {
        return headerValue;
      }
    }
    return Services.platformFor(this.win).isIos() ?
      XORIGIN_MODE.NAMEFRAME : null;
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
   * Adds single pass experiment IDs if the javascript binary has
   * "singlePassType" mode.
   */
  maybeAddSinglePassExperiment() {
    const type = getMode().singlePassType;
    if (type === 'sp') {
      addExperimentIdToElement(SINGLE_PASS_EXPERIMENT_IDS.SINGLE_PASS,
          this.element);
    } else if (type === 'mp') {
      addExperimentIdToElement(SINGLE_PASS_EXPERIMENT_IDS.MULTI_PASS,
          this.element);
    }
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
  (error.args || (error.args = {}))['au'] =
    adUrl.substring(adQueryIdx + 1, adQueryIdx + 251);
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
  return win[propertyName] ||
      (win[propertyName] = new SignatureVerifier(win, signingServerURLs));
}
