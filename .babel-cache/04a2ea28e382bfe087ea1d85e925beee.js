import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { A4AVariableSource } from "./a4a-variable-source";
import { ADS_INITIAL_INTERSECTION_EXP } from "../../../src/experiments/ads-initial-intersection-exp";
import { CONSENT_POLICY_STATE } from "../../../src/core/constants/consent-state";
import { Deferred, tryResolve } from "../../../src/core/data-structures/promise";
import { DetachedDomStream, streamResponseToWriter } from "../../../src/core/dom/stream";
import { DomTransformStream } from "../../../src/utils/dom-tranform-stream";
import { GEO_IN_GROUP } from "../../amp-geo/0.1/amp-geo-in-group";
import { Layout, LayoutPriority, applyFillContent, isLayoutSizeDefined } from "../../../src/core/dom/layout";
import { Services } from "../../../src/service";
import { SignatureVerifier, VerificationStatus } from "./signature-verifier";
import { applySandbox, generateSentinel, getDefaultBootstrapBaseUrl } from "../../../src/3p-frame";
import { assertHttpsUrl } from "../../../src/url";
import { cancellation, isCancellation } from "../../../src/error-reporting";
import { createElementWithAttributes } from "../../../src/core/dom";
import { createSecureDocSkeleton, createSecureFrame, isAttributionReportingSupported } from "./secure-frame";
import { dev, devAssert, user, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { duplicateErrorIfNecessary } from "../../../src/core/error";
import { getAmpAdRenderOutsideViewport, incrementLoadingAds, is3pThrottled } from "../../amp-ad/0.1/concurrent-load";
import { getConsentMetadata, getConsentPolicyInfo, getConsentPolicyState } from "../../../src/consent";
import { getContextMetadata } from "../../../src/iframe-attributes";
import { getExperimentBranch, isExperimentOn } from "../../../src/experiments";
import { getExtensionsFromMetadata } from "./amp-ad-utils";
import { getMode } from "../../../src/mode";
import { insertAnalyticsElement } from "../../../src/extension-analytics";
import { installFriendlyIframeEmbed, isSrcdocSupported, preloadFriendlyIframeEmbedExtensions } from "../../../src/friendly-iframe-embed";
import { installRealTimeConfigServiceForDoc } from "../../../src/service/real-time-config/real-time-config-impl";
import { installUrlReplacementsForEmbed } from "../../../src/service/url-replacements-impl";
import { intersectionEntryToJson, measureIntersection } from "../../../src/core/dom/layout/intersection";
import { isAdPositionAllowed } from "../../../src/ad-helper";
import { isArray, isEnumValue, isObject } from "../../../src/core/types";
import { tryDecodeUriComponent } from "../../../src/core/types/string/url";
import { listenOnce } from "../../../src/event-helper";
import { observeWithSharedInOb, unobserveWithSharedInOb } from "../../../src/core/dom/layout/viewport-observer";
import { padStart } from "../../../src/core/types/string";
import { parseJson } from "../../../src/core/types/object/json";
import { processHead } from "./head-validation";
import { setStyle } from "../../../src/core/dom/style";
import { signingServerURLs } from "../../../ads/_a4a-config";
import { triggerAnalyticsEvent } from "../../../src/analytics";
import { utf8Decode } from "../../../src/core/types/string/bytes";
import { whenWithinViewport as _whenWithinViewport } from "./within-viewport";

/** @type {Array<string>} */
var METADATA_STRINGS = ['<script amp-ad-metadata type=application/json>', '<script type="application/json" amp-ad-metadata>', '<script type=application/json amp-ad-metadata>'];
// TODO(tdrl): Temporary, while we're verifying whether SafeFrame is an
// acceptable solution to the 'Safari on iOS doesn't fetch iframe src from
// cache' issue.  See https://github.com/ampproject/amphtml/issues/5614

/** @type {string} */
export var DEFAULT_SAFEFRAME_VERSION = '1-0-37';

/** @const {string} */
export var CREATIVE_SIZE_HEADER = 'X-CreativeSize';

/** @type {string} @visibleForTesting */
export var RENDERING_TYPE_HEADER = 'X-AmpAdRender';

/** @type {string} @visibleForTesting */
export var SAFEFRAME_VERSION_HEADER = 'X-AmpSafeFrameVersion';

/** @type {string} @visibleForTesting */
export var EXPERIMENT_FEATURE_HEADER_NAME = 'amp-ff-exps';

/** @type {string} */
var TAG = 'amp-a4a';

/** @type {string} */
export var NO_CONTENT_RESPONSE = 'NO-CONTENT-RESPONSE';

/** @type {string} */
export var NETWORK_FAILURE = 'NETWORK-FAILURE';

/** @type {string} */
export var INVALID_SPSA_RESPONSE = 'INVALID-SPSA-RESPONSE';

/** @type {string} */
export var IFRAME_GET = 'IFRAME-GET';

/** @enum {string} */
export var XORIGIN_MODE = {
  CLIENT_CACHE: 'client_cache',
  SAFEFRAME: 'safeframe',
  NAMEFRAME: 'nameframe',
  IFRAME_GET: 'iframe_get'
};

/** @type {!Object} @private */
var SHARED_IFRAME_PROPERTIES = dict({
  'frameborder': '0',
  'allowfullscreen': '',
  'allowtransparency': '',
  'scrolling': 'no',
  'marginwidth': '0',
  'marginheight': '0'
});

/** @typedef {{width: number, height: number}} */
export var SizeInfoDef;

/** @typedef {{
      minifiedCreative: string,
      customElementExtensions: !Array<string>,
      customStylesheets: !Array<{href: string}>,
      images: (Array<string>|undefined),
      ctaType: (string|undefined),
      ctaUrl: (string|undefined),
    }} */
export var CreativeMetaDataDef;

/** @typedef {{
      consentState: (?CONSENT_POLICY_STATE|undefined),
      consentString: (?string|undefined),
      consentStringType: (?CONSENT_STRING_TYPE|boolean),
      gdprApplies: (?boolean|undefined),
      additionalConsent: (?string|undefined),
    }} */
export var ConsentTupleDef;

/**
 * Name of A4A lifecycle triggers.
 * @enum {string}
 */
export var AnalyticsTrigger = {
  AD_REQUEST_START: 'ad-request-start',
  AD_RESPONSE_END: 'ad-response-end',
  AD_RENDER_START: 'ad-render-start',
  AD_RENDER_END: 'ad-render-end',
  AD_IFRAME_LOADED: 'ad-iframe-loaded',
  // This trigger is not part of the normal ads lifecycle and only fires when an
  // ad is refreshed.
  AD_REFRESH: 'ad-refresh'
};

/**
 * Maps the names of lifecycle events to analytics triggers.
 * @const {!Object<string, !AnalyticsTrigger>}
 */
var LIFECYCLE_STAGE_TO_ANALYTICS_TRIGGER = {
  'adRequestStart': AnalyticsTrigger.AD_REQUEST_START,
  'adRequestEnd': AnalyticsTrigger.AD_RESPONSE_END,
  'renderFriendlyStart': AnalyticsTrigger.AD_RENDER_START,
  'renderCrossDomainStart': AnalyticsTrigger.AD_RENDER_START,
  'renderSafeFrameStart': AnalyticsTrigger.AD_RENDER_START,
  'renderFriendlyEnd': AnalyticsTrigger.AD_RENDER_END,
  'renderCrossDomainEnd': AnalyticsTrigger.AD_RENDER_END,
  'friendlyIframeIniLoad': AnalyticsTrigger.AD_IFRAME_LOADED,
  'crossDomainIframeLoaded': AnalyticsTrigger.AD_IFRAME_LOADED
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
export function protectFunctionWrapper(fn, inThis, onError) {
  if (inThis === void 0) {
    inThis = undefined;
  }

  if (onError === void 0) {
    onError = undefined;
  }

  return function () {
    for (var _len = arguments.length, fnArgs = new Array(_len), _key = 0; _key < _len; _key++) {
      fnArgs[_key] = arguments[_key];
    }

    try {
      return fn.apply(inThis, fnArgs);
    } catch (err) {
      if (onError) {
        try {
          // Ideally we could use [err, ...var_args] but linter disallows
          // spread so instead using unshift :(
          fnArgs.unshift(err);
          return onError.apply(inThis, fnArgs);
        } catch (captureErr) {// swallow error if error handler throws.
        }
      }

      // In the event of no optional on error function or its execution throws,
      // return undefined.
      return undefined;
    }
  };
}

/** Abstract class for AMP Ad Fast Fetch enabled networks */
export var AmpA4A = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpA4A, _AMP$BaseElement);

  var _super = _createSuper(AmpA4A);

  // TODO: Add more error handling throughout code.
  // TODO: Handle creatives that do not fill.

  /**
   * @param {!Element} element
   */
  function AmpA4A(element) {
    var _this;

    _classCallCheck(this, AmpA4A);

    _this = _super.call(this, element);
    devAssert(AMP.AmpAdUIHandler);
    devAssert(AMP.AmpAdXOriginIframeHandler);

    /** @private {?Promise<undefined>} */
    _this.keysetPromise_ = null;

    /**
     * In no signing experiment metadata will be data from head validation.
     * @private {?Promise<?CreativeMetaDataDef|?./head-validation.ValidatedHeadDef>}
     */
    _this.adPromise_ = null;

    /**
     * @private {number} unique ID of the currently executing promise to allow
     * for cancellation.
     */
    _this.promiseId_ = 0;

    /** @private {?string} */
    _this.adUrl_ = null;

    /** @private {?../../../src/friendly-iframe-embed.FriendlyIframeEmbed} */
    _this.friendlyIframeEmbed_ = null;

    /** @type {?AMP.AmpAdUIHandler} */
    _this.uiHandler = null;

    /** @private {?AMP.AmpAdXOriginIframeHandler} */
    _this.xOriginIframeHandler_ = null;

    /** @private {boolean} whether creative has been verified as AMP */
    _this.isVerifiedAmpCreative_ = false;

    /** @private {?ArrayBuffer} */
    _this.creativeBody_ = null;

    /**
     * Initialize this with the slot width/height attributes, and override
     * later with what the network implementation returns via extractSize.
     * Note: Either value may be 'auto' (i.e., non-numeric).
     *
     * @private {?({width, height}|../../../src/layout-rect.LayoutRectDef)}
     */
    _this.creativeSize_ = null;

    /** @private {?../../../src/layout-rect.LayoutSizeDef} */
    _this.originalSlotSize_ = null;

    /** @private {Promise<!IntersectionObserverEntry>} */
    _this.initialIntersectionPromise_ = null;

    /**
     * Note(keithwrightbos) - ensure the default here is null so that ios
     * uses safeframe when response header is not specified.
     * @private {?XORIGIN_MODE}
     */
    _this.experimentalNonAmpCreativeRenderMethod_ = _this.getNonAmpCreativeRenderingMethod();

    /**
     * Gets a notion of current time, in ms.  The value is not necessarily
     * absolute, so should be used only for computing deltas.  When available,
     * the performance system will be used; otherwise Date.now() will be
     * returned.
     *
     * @const {function():number}
     */
    _this.getNow_ = _this.win.performance && _this.win.performance.now ? _this.win.performance.now.bind(_this.win.performance) : Date.now;

    /** @const {string} */
    _this.sentinel = generateSentinel(window);

    /**
     * Used to indicate whether this slot should be collapsed or not. Marked
     * true if the ad response has status 204, is null, or has a null
     * arrayBuffer.
     * @private {boolean}
     */
    _this.isCollapsed_ = false;

    /**
     * Frame in which the creative renders (friendly if validated AMP, xdomain
     * otherwise).
     * @type {?HTMLIFrameElement}
     */
    _this.iframe = null;

    /** @type {string} */
    _this.safeframeVersion = DEFAULT_SAFEFRAME_VERSION;

    /**
     * @protected {boolean} Indicates whether the ad is currently in the
     *    process of being refreshed.
     */
    _this.isRefreshing = false;

    /** @protected {boolean} */
    _this.isRelayoutNeededFlag = false;

    /**
     * Mapping of feature name to value extracted from ad response header
     * amp-ff-exps with comma separated pairs of '=' separated key/value.
     * @type {!Object<string,string>}
     */
    _this.postAdResponseExperimentFeatures = {};

    /**
     * The configuration for amp-analytics. If null, no amp-analytics element
     * will be inserted and no analytics events will be fired.
     * This will be initialized inside of buildCallback.
     * @private {?JsonObject}
     */
    _this.a4aAnalyticsConfig_ = null;

    /**
     * The amp-analytics element that for this impl's analytics config. It will
     * be null before buildCallback() executes or if the impl does not provide
     * an analytice config.
     * @private {?Element}
     * @visibleForTesting
     */
    _this.a4aAnalyticsElement_ = null;

    /**
     * Indicates that this slot is a single page ad within an AMP story.
     * @type {boolean}
     */
    _this.isSinglePageStoryAd = false;

    /**
     * Transfers elements from the detached body to the given body element.
     * @private {?function(!Element)}
     */
    _this.transferDomBody_ = null;

    /** @private {function(boolean)} */
    _this.boundViewportCallback_ = _this.viewportCallbackTemp.bind(_assertThisInitialized(_this));
    return _this;
  }

  /** @override */
  _createClass(AmpA4A, [{
    key: "getLayoutPriority",
    value: function getLayoutPriority() {
      // Priority used for scheduling preload and layout callback.  Because
      // AMP creatives will be injected as part of the promise chain created
      // within onLayoutMeasure, this is only relevant to non-AMP creatives
      // therefore we want this to match the 3p priority.
      var isPWA = !this.element.getAmpDoc().isSingleDoc();
      // give the ad higher priority if it is inside a PWA
      return isPWA ? LayoutPriority.METADATA : LayoutPriority.ADS;
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }
    /** @override */

  }, {
    key: "isRelayoutNeeded",
    value: function isRelayoutNeeded() {
      return this.isRelayoutNeededFlag;
    }
    /** @override
        @return {!Promise|undefined}
    */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      var _this2 = this;

      this.creativeSize_ = {
        width: this.element.getAttribute('width'),
        height: this.element.getAttribute('height')
      };
      var upgradeDelayMs = Math.round(this.getResource().getUpgradeDelayMs());
      dev().info(TAG, "upgradeDelay " + this.element.getAttribute('type') + ": " + upgradeDelayMs);
      this.uiHandler = new AMP.AmpAdUIHandler(this);
      this.uiHandler.validateStickyAd();
      var verifier = signatureVerifierFor(this.win);
      this.keysetPromise_ = this.getAmpDoc().whenFirstVisible().then(function () {
        _this2.getSigningServiceNames().forEach(function (signingServiceName) {
          verifier.loadKeyset(signingServiceName);
        });
      });
      this.a4aAnalyticsConfig_ = this.getA4aAnalyticsConfig();

      if (this.a4aAnalyticsConfig_) {
        // TODO(warrengm): Consider having page-level singletons for networks that
        // use the same config for all ads.
        this.a4aAnalyticsElement_ = insertAnalyticsElement(this.element, this.a4aAnalyticsConfig_, true
        /* loadAnalytics */
        );
      }

      this.isSinglePageStoryAd = this.element.hasAttribute('amp-story');
      var asyncIntersection = getExperimentBranch(this.win, ADS_INITIAL_INTERSECTION_EXP.id) === ADS_INITIAL_INTERSECTION_EXP.experiment;
      this.initialIntersectionPromise_ = asyncIntersection ? measureIntersection(this.element) : Promise.resolve(this.element.getIntersectionChangeEntry());
    }
    /** @override */

  }, {
    key: "renderOutsideViewport",
    value: function renderOutsideViewport() {
      // Ensure non-verified AMP creatives are throttled.
      if (!this.isVerifiedAmpCreative_ && is3pThrottled(this.win) && !this.inNonAmpPreferenceExp()) {
        return false;
      }

      // Otherwise the ad is good to go.
      var elementCheck = getAmpAdRenderOutsideViewport(this.element);
      return elementCheck !== null ? elementCheck : _get(_getPrototypeOf(AmpA4A.prototype), "renderOutsideViewport", this).call(this);
    }
    /**
     * To be overridden by network specific implementation indicating if element
     * (and environment generally) are valid for sending XHR queries.
     * @return {boolean} whether element is valid and ad request should be
     *    sent.  If false, no ad request is sent and slot will be collapsed if
     *    possible.
     */

  }, {
    key: "isValidElement",
    value: function isValidElement() {
      return true;
    }
    /**
     * Returns the creativeSize, which is the size extracted from the ad response.
     * @return {?({width, height}|../../../src/layout-rect.LayoutRectDef)}
     */

  }, {
    key: "getCreativeSize",
    value: function getCreativeSize() {
      return this.creativeSize_;
    }
    /**
     * @return {boolean|number} whether ad request should be delayed until
     *    renderOutsideViewport is met or if number, the amount of viewports.
     */

  }, {
    key: "delayAdRequestEnabled",
    value: function delayAdRequestEnabled() {
      return false;
    }
    /**
     * Returns preconnect urls for A4A. Ad network should overwrite in their
     * Fast Fetch implementation and return an array of urls for the runtime to
     * preconnect to.
     * @return {!Array<string>}
     */

  }, {
    key: "getPreconnectUrls",
    value: function getPreconnectUrls() {
      return [];
    }
    /**
     * Returns prefetch urls for A4A. Ad network should overwrite in their
     * Fast Fetch implementation and return an array of urls for the runtime to
     * prefetch.
     * @return {!Array<string>}
     */

  }, {
    key: "getPrefetchUrls",
    value: function getPrefetchUrls() {
      return [];
    }
    /**
     * Returns true if this element was loaded from an amp-ad element.  For use by
     * network-specific implementations that don't want to allow themselves to be
     * embedded directly into a page.
     * @return {boolean}
     */

  }, {
    key: "isAmpAdElement",
    value: function isAmpAdElement() {
      return this.element.tagName == 'AMP-AD' || this.element.tagName == 'AMP-EMBED';
    }
    /**
     * Prefetches and preconnects URLs related to the ad using adPreconnect
     * registration which assumes ad request domain used for 3p is applicable.
     * @param {boolean=} unusedOnLayout
     * @override
     */

  }, {
    key: "preconnectCallback",
    value: function preconnectCallback(unusedOnLayout) {
      var _this3 = this;

      var preconnect = this.getPreconnectUrls();

      // NOTE(keithwrightbos): Does not take isValidElement into account so could
      // preconnect unnecessarily, however it is assumed that isValidElement
      // matches amp-ad loader predicate such that A4A impl does not load.
      if (preconnect) {
        preconnect.forEach(function (p) {
          Services.preconnectFor(_this3.win).url(_this3.getAmpDoc(), p,
          /*opt_preloadAs*/
          true);
        });
      }
    }
    /** @override */

  }, {
    key: "pauseCallback",
    value: function pauseCallback() {
      if (this.friendlyIframeEmbed_) {
        this.friendlyIframeEmbed_.pause();
      }
    }
    /** @override */

  }, {
    key: "resumeCallback",
    value: function resumeCallback() {
      // FIE that was not destroyed on unlayoutCallback does not require a new
      // ad request.
      if (this.friendlyIframeEmbed_) {
        this.friendlyIframeEmbed_.resume();
        return;
      }

      // If layout of page has not changed, onLayoutMeasure will not be called
      // so do so explicitly.
      var resource = this.getResource();

      if (resource.hasBeenMeasured() && !resource.isMeasureRequested()) {
        this.onLayoutMeasure();
      }
    }
    /**
     * @return {!../../../src/service/resource.Resource}
     * @visibleForTesting
     */

  }, {
    key: "getResource",
    value: function getResource() {
      return this.element.getResources().getResourceForElement(this.element);
    }
    /**
     * @return {boolean} whether adPromise was initialized (indicator of
     *    element validity).
     * @protected
     */

  }, {
    key: "hasAdPromise",
    value: function hasAdPromise() {
      return !!this.adPromise_;
    }
    /**
     * Should only be called after XHR response headers have been processed and
     * postAdResponseExperimentFeatures is populated.
     * @return {boolean} whether in experiment giving non-AMP creatives same
     *    benefits as AMP (increased priority, no throttle)
     * @visibleForTesting
     */

  }, {
    key: "inNonAmpPreferenceExp",
    value: function inNonAmpPreferenceExp() {
      return !!this.postAdResponseExperimentFeatures['pref_neutral_enabled'] && ['adsense', 'doubleclick'].includes(this.element.getAttribute('type'));
    }
    /**
     * @return {boolean} whether environment/element should initialize ad request
     *    promise chain.
     * @private
     */

  }, {
    key: "shouldInitializePromiseChain_",
    value: function shouldInitializePromiseChain_() {
      var slotRect = this.getIntersectionElementLayoutBox();
      var fixedSizeZeroHeightOrWidth = this.getLayout() != Layout.FLUID && (slotRect.height == 0 || slotRect.width == 0);

      if (fixedSizeZeroHeightOrWidth || this.element.hasAttribute('hidden') || // TODO(levitzky): May need additional checks for other display:hidden cases.
      this.element.classList.contains('i-amphtml-hidden-by-media-query')) {
        dev().fine(TAG, 'onLayoutMeasure canceled due height/width 0', this.element);
        return false;
      }

      if (!this.uiHandler.isStickyAd() && !isAdPositionAllowed(this.element, this.win)) {
        user().warn(TAG, "<" + this.element.tagName + "> is not allowed to be " + ("placed in elements with position: fixed or sticky: " + this.element));
        return false;
      }

      // OnLayoutMeasure can be called when page is in prerender so delay until
      // visible.  Assume that it is ok to call isValidElement as it should
      // only being looking at window, immutable properties (i.e. location) and
      // its element ancestry.
      if (!this.isValidElement()) {
        // TODO(kjwright): collapse?
        user().warn(TAG, this.element.getAttribute('type'), 'Amp ad element ignored as invalid', this.element);
        return false;
      }

      return true;
    }
    /** @override */

  }, {
    key: "onLayoutMeasure",
    value: function onLayoutMeasure() {
      this.initiateAdRequest();
    }
    /**
     * Resolves when underlying element is within the viewport range given or
     * has been loaded already.
     * @param {number|boolean} viewport derived from renderOutsideViewport.
     * @return {!Promise}
     * @protected
     */

  }, {
    key: "whenWithinViewport",
    value: function whenWithinViewport(viewport) {
      devAssert(viewport !== false);
      var resource = this.getResource();

      if (false || getMode().localDev || getMode().test) {
        // Resolve is already laid out or viewport is true.
        if (!resource.isLayoutPending() || viewport === true) {
          return _resolvedPromise();
        }

        // Track when within the specified number of viewports.
        var viewportNum = dev().assertNumber(viewport);
        return _whenWithinViewport(this.element, viewportNum);
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

  }, {
    key: "initiateAdRequest",
    value: function initiateAdRequest() {
      var _this4 = this;

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
      var checkStillCurrent = this.verifyStillCurrent();
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
      this.adPromise_ = this.getAmpDoc().whenFirstVisible().then(function () {
        checkStillCurrent();

        // See if experiment that delays request until slot is within
        // renderOutsideViewport. Within render outside viewport will not
        // resolve if already within viewport thus the check for already
        // meeting the definition as opposed to waiting on the promise.
        var delay = _this4.delayAdRequestEnabled();

        if (delay) {
          return _this4.whenWithinViewport(typeof delay == 'number' ? delay : _this4.renderOutsideViewport());
        }
      }) // Possibly block on amp-consent.

      /** @return {!Promise<Array<Promise>>} */
      .then(function () {
        checkStillCurrent();

        var consentPolicyId = _get(_getPrototypeOf(AmpA4A.prototype), "getConsentPolicy", _this4).call(_this4);

        if (consentPolicyId) {
          var consentStatePromise = getConsentPolicyState(_this4.element, consentPolicyId).catch(function (err) {
            user().error(TAG, 'Error determining consent state', err);
            return CONSENT_POLICY_STATE.UNKNOWN;
          });
          var consentStringPromise = getConsentPolicyInfo(_this4.element, consentPolicyId).catch(function (err) {
            user().error(TAG, 'Error determining consent string', err);
            return null;
          });
          var consentMetadataPromise = getConsentMetadata(_this4.element, consentPolicyId).catch(function (err) {
            user().error(TAG, 'Error determining consent metadata', err);
            return null;
          });
          return Promise.all([consentStatePromise, consentStringPromise, consentMetadataPromise]);
        }

        return Promise.resolve([null, null, null]);
      }) // This block returns the ad URL, if one is available.

      /** @return {!Promise<?string>} */
      .then(function (consentResponse) {
        checkStillCurrent();
        var consentState = consentResponse[0];
        var consentString = consentResponse[1];
        var consentMetadata = consentResponse[2];
        var gdprApplies = consentMetadata ? consentMetadata['gdprApplies'] : consentMetadata;
        var additionalConsent = consentMetadata ? consentMetadata['additionalConsent'] : consentMetadata;
        var consentStringType = consentMetadata ? consentMetadata['consentStringType'] : consentMetadata;
        return (
          /** @type {!Promise<?string>} */
          _this4.getServeNpaSignal().then(function (npaSignal) {
            return _this4.getAdUrl({
              consentState: consentState,
              consentString: consentString,
              consentStringType: consentStringType,
              gdprApplies: gdprApplies,
              additionalConsent: additionalConsent
            }, _this4.tryExecuteRealTimeConfig_(consentState, consentString,
            /** @type {?Object<string, string|number|boolean|undefined>} */
            consentMetadata), npaSignal);
          })
        );
      }) // This block returns the (possibly empty) response to the XHR request.

      /** @return {!Promise<?Response>} */
      .then(function (adUrl) {
        checkStillCurrent();
        _this4.adUrl_ = adUrl;

        // If we should skip the XHR, we will instead request and render
        // by simply writing a frame into the page using
        // renderViaIframeGet
        if (!_this4.isXhrAllowed() && !!_this4.adUrl_) {
          _this4.experimentalNonAmpCreativeRenderMethod_ = XORIGIN_MODE.IFRAME_GET;
          return Promise.reject(IFRAME_GET);
        }

        return adUrl && _this4.sendXhrRequest(adUrl);
      }) // The following block returns either the response (as a
      // {bytes, headers} object), or null if no response is available /
      // response is empty.

      /** @return {!Promise<!Response>} */
      .then(function (fetchResponse) {
        checkStillCurrent();

        _this4.maybeTriggerAnalyticsEvent_('adRequestEnd');

        // If the response is null (can occur for non-200 responses)  or
        // arrayBuffer is null, force collapse.
        if (!fetchResponse || !fetchResponse.arrayBuffer || fetchResponse.headers.has('amp-ff-empty-creative')) {
          _this4.forceCollapse();

          return Promise.reject(NO_CONTENT_RESPONSE);
        }

        if (fetchResponse.headers && fetchResponse.headers.has(EXPERIMENT_FEATURE_HEADER_NAME)) {
          _this4.populatePostAdResponseExperimentFeatures_(fetchResponse.headers.get(EXPERIMENT_FEATURE_HEADER_NAME));
        }

        if (getMode().localDev && _this4.win.location && _this4.win.location.search) {
          // Allow for setting experiment features via query param which
          // will potentially override values returned in response.
          var match = /(?:\?|&)a4a_feat_exp=([^&]+)/.exec(_this4.win.location.search);

          if (match && match[1]) {
            dev().info(TAG, "Using debug exp features: " + match[1]);

            _this4.populatePostAdResponseExperimentFeatures_(tryDecodeUriComponent(match[1]));
          }
        }

        // TODO(tdrl): Temporary, while we're verifying whether SafeFrame is
        // an acceptable solution to the 'Safari on iOS doesn't fetch
        // iframe src from cache' issue.  See
        // https://github.com/ampproject/amphtml/issues/5614
        var method = _this4.getNonAmpCreativeRenderingMethod(fetchResponse.headers.get(RENDERING_TYPE_HEADER));

        _this4.experimentalNonAmpCreativeRenderMethod_ = method;

        if (_this4.experimentalNonAmpCreativeRenderMethod_ == XORIGIN_MODE.NAMEFRAME) {
          Services.preconnectFor(_this4.win).preload(_this4.getAmpDoc(), getDefaultBootstrapBaseUrl(_this4.win, 'nameframe'));
        }

        var safeframeVersionHeader = fetchResponse.headers.get(SAFEFRAME_VERSION_HEADER);

        if (/^[0-9-]+$/.test(safeframeVersionHeader) && safeframeVersionHeader != DEFAULT_SAFEFRAME_VERSION) {
          _this4.safeframeVersion = safeframeVersionHeader;
          Services.preconnectFor(_this4.win).preload(_this4.getAmpDoc(), _this4.getSafeframePath());
        }

        return fetchResponse;
      }).then(function (fetchResponse) {
        return _this4.isInNoSigningExp() ? _this4.streamResponse_(fetchResponse, checkStillCurrent) : _this4.startValidationFlow_(fetchResponse, checkStillCurrent);
      }).catch(function (error) {
        switch (error.message || error) {
          case IFRAME_GET:
          case NETWORK_FAILURE:
            return null;

          case INVALID_SPSA_RESPONSE:
          case NO_CONTENT_RESPONSE:
            return {
              minifiedCreative: '',
              customElementExtensions: [],
              customStylesheets: []
            };
        }

        // If error in chain occurs, report it and return null so that
        // layoutCallback can render via cross domain iframe assuming ad
        // url or creative exist.
        _this4.promiseErrorHandler_(error);

        return null;
      });
    }
    /**
     * @visibleForTesting
     * @return {boolean}
     */

  }, {
    key: "isInNoSigningExp",
    value: function isInNoSigningExp() {
      return true;
    }
    /**
     * Allow subclasses to skip client side validation of non-amp creatives
     * based on http headers for perfomance. When true, ads will fall back to
     * x-domain earlier.
     * @param {!Headers} unusedHeaders
     * @return {boolean}
     */

  }, {
    key: "skipClientSideValidation",
    value: function skipClientSideValidation(unusedHeaders) {
      return false;
    }
    /**
     * Start streaming response into the detached document.
     * @param {!Response} httpResponse
     * @param {function()} checkStillCurrent
     * @return {Promise<?./head-validation.ValidatedHeadDef>}
     */

  }, {
    key: "streamResponse_",
    value: function streamResponse_(httpResponse, checkStillCurrent) {
      var _this5 = this;

      if (httpResponse.status === 204) {
        this.forceCollapse();
        return Promise.reject(NO_CONTENT_RESPONSE);
      }

      // Extract size will also parse x-ampanalytics header for some subclasses.
      var size = this.extractSize(httpResponse.headers);
      this.creativeSize_ = size || this.creativeSize_;

      if (!isPlatformSupported(this.win) || this.skipClientSideValidation(httpResponse.headers)) {
        return this.handleFallback_(httpResponse, checkStillCurrent);
      }

      // Duplicating httpResponse stream as safeframe/nameframe rendering will need the
      // unaltered httpResponse content.
      var fallbackHttpResponse = httpResponse.clone();
      // This transformation consumes the detached DOM chunks and
      // exposes our waitForHead and transferBody methods.
      var transformStream = new DomTransformStream(this.win);
      // Receives chunks of text and writes to detached DOM.
      var detachedStream = new DetachedDomStream(this.win, function (chunk) {
        return transformStream.onChunk(chunk);
      }, function (doc) {
        return transformStream.onEnd(doc);
      });
      this.transferDomBody_ = transformStream.transferBody.bind(transformStream);
      // Decodes our httpResponse bytes and pipes them to the
      // DetachedDomStream.
      return streamResponseToWriter(this.win, httpResponse, detachedStream).then(function (responseBodyHasContent) {
        checkStillCurrent();

        // `amp-ff-empty-creative` header is not present, and httpResponse.body
        // is empty.
        if (!responseBodyHasContent) {
          _this5.forceCollapse();

          return Promise.reject(NO_CONTENT_RESPONSE);
        }
      }).then(function () {
        checkStillCurrent();
        return transformStream.waitForHead();
      }).then(function (head) {
        checkStillCurrent();
        return _this5.validateHeadElement_(head);
      }).then(function (sanitizedHeadElement) {
        checkStillCurrent();

        // We should not render as FIE.
        if (!sanitizedHeadElement) {
          return _this5.handleFallback_(fallbackHttpResponse, checkStillCurrent);
        }

        _this5.updateLayoutPriority(LayoutPriority.CONTENT);

        _this5.isVerifiedAmpCreative_ = true;
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

  }, {
    key: "handleFallback_",
    value: function handleFallback_(fallbackHttpResponse, checkStillCurrent) {
      var _this6 = this;

      // Experiment to give non-AMP creatives same benefits as AMP so
      // update priority.
      if (this.inNonAmpPreferenceExp()) {
        this.updateLayoutPriority(LayoutPriority.CONTENT);
      }

      return fallbackHttpResponse.arrayBuffer().then(function (domTextContent) {
        checkStillCurrent();
        _this6.creativeBody_ = domTextContent;
        return null;
      });
    }
    /**
     * Prepare the creative <head> by removing any non-secure elements and
     * exracting extensions
     * @param {!Element} headElement
     * @return {?./head-validation.ValidatedHeadDef} head data or null if we should fall back to xdomain.
     */

  }, {
    key: "validateHeadElement_",
    value: function validateHeadElement_(headElement) {
      return processHead(this.win, this.element, headElement);
    }
    /**
     * Encapsulates logic for validation flow starting with resolving res body
     * to array buffer.
     * @param {!Response} fetchResponse
     * @param {function()} checkStillCurrent
     * @return {Promise<?CreativeMetaDataDef>}
     */

  }, {
    key: "startValidationFlow_",
    value: function startValidationFlow_(fetchResponse, checkStillCurrent) {
      var _this7 = this;

      // Note: Resolving a .then inside a .then because we need to capture
      // two fields of fetchResponse, one of which is, itself, a promise,
      // and one of which isn't.  If we just return
      // fetchResponse.arrayBuffer(), the next step in the chain will
      // resolve it to a concrete value, but we'll lose track of
      // fetchResponse.headers.
      return fetchResponse.arrayBuffer().then(function (bytes) {
        if (bytes.byteLength == 0) {
          // The server returned no content. Instead of displaying a blank
          // rectangle, we collapse the slot instead.
          _this7.forceCollapse();

          return Promise.reject(NO_CONTENT_RESPONSE);
        }

        return {
          bytes: bytes,
          headers: fetchResponse.headers
        };
      })
      /** @return {?Promise<?ArrayBuffer>} */
      .then(function (responseParts) {
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

        var bytes = responseParts.bytes,
            headers = responseParts.headers;

        var size = _this7.extractSize(responseParts.headers);

        _this7.creativeSize_ = size || _this7.creativeSize_;

        if (_this7.experimentalNonAmpCreativeRenderMethod_ != XORIGIN_MODE.CLIENT_CACHE && bytes) {
          _this7.creativeBody_ = bytes;
        }

        return _this7.maybeValidateAmpCreative(bytes, headers);
      }).then(function (creative) {
        checkStillCurrent();
        // Need to know if creative was verified as part of render outside
        // viewport but cannot wait on promise.  Sadly, need a state a
        // variable.
        _this7.isVerifiedAmpCreative_ = !!creative;
        return creative && utf8Decode(creative);
      }) // This block returns CreativeMetaDataDef iff the creative was verified
      // as AMP and could be properly parsed for friendly iframe render.

      /** @return {?CreativeMetaDataDef} */
      .then(function (creativeDecoded) {
        checkStillCurrent();
        // Note: It's critical that #getAmpAdMetadata be called
        // on precisely the same creative that was validated
        // via #validateAdResponse_.  See GitHub issue
        // https://github.com/ampproject/amphtml/issues/4187
        var creativeMetaDataDef;

        if (!isPlatformSupported(_this7.win) || !creativeDecoded || !(creativeMetaDataDef = _this7.getAmpAdMetadata(creativeDecoded))) {
          if (_this7.inNonAmpPreferenceExp()) {
            // Experiment to give non-AMP creatives same benefits as AMP so
            // update priority.
            _this7.updateLayoutPriority(LayoutPriority.CONTENT);
          }

          return null;
        }

        // Update priority.
        _this7.updateLayoutPriority(LayoutPriority.CONTENT);

        // Load any extensions; do not wait on their promises as this
        // is just to prefetch.
        var extensions = getExtensionsFromMetadata(creativeMetaDataDef);
        preloadFriendlyIframeEmbedExtensions(_this7.win, extensions);
        // Preload any fonts.
        (creativeMetaDataDef.customStylesheets || []).forEach(function (font) {
          return Services.preconnectFor(_this7.win).preload(_this7.getAmpDoc(), font.href);
        });
        var urls = Services.urlForDoc(_this7.element);
        // Preload any AMP images.
        (creativeMetaDataDef.images || []).forEach(function (image) {
          return urls.isSecure(image) && Services.preconnectFor(_this7.win).preload(_this7.getAmpDoc(), image);
        });
        return creativeMetaDataDef;
      });
    }
    /**
     * This block returns the ad creative if it exists and validates as AMP;
     * null otherwise.
     * @param {!ArrayBuffer} bytes
     * @param {!Headers} headers
     * @return {!Promise<?ArrayBuffer>}
     */

  }, {
    key: "maybeValidateAmpCreative",
    value: function maybeValidateAmpCreative(bytes, headers) {
      var _this8 = this;

      var checkStillCurrent = this.verifyStillCurrent();
      return this.keysetPromise_.then(function () {
        if (_this8.element.getAttribute('type') == 'fake' && !_this8.element.getAttribute('checksig')) {
          // do not verify signature for fake type ad, unless the ad
          // specfically requires via 'checksig' attribute
          return Promise.resolve(VerificationStatus.OK);
        }

        return signatureVerifierFor(_this8.win).verify(bytes, headers);
      }).then(function (status) {
        checkStillCurrent();
        var result = null;

        switch (status) {
          case VerificationStatus.OK:
            result = bytes;
            break;

          case VerificationStatus.CRYPTO_UNAVAILABLE:
            result = _this8.shouldPreferentialRenderWithoutCrypto() ? bytes : null;
            break;
          // TODO(@taymonbeal, #9274): differentiate between these

          case VerificationStatus.ERROR_KEY_NOT_FOUND:
          case VerificationStatus.ERROR_SIGNATURE_MISMATCH:
            user().error(TAG, _this8.element.getAttribute('type'), 'Signature verification failed');

          case VerificationStatus.UNVERIFIED:
        }

        if (_this8.isSinglePageStoryAd && !result) {
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

  }, {
    key: "populatePostAdResponseExperimentFeatures_",
    value: function populatePostAdResponseExperimentFeatures_(input) {
      var _this9 = this;

      input.split(',').forEach(function (line) {
        if (!line) {
          return;
        }

        var parts = line.split('=');

        if (parts.length != 2 || !parts[0]) {
          dev().warn(TAG, "invalid experiment feature " + line);
          return;
        }

        _this9.postAdResponseExperimentFeatures[parts[0]] = parts[1];
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

  }, {
    key: "refresh",
    value: function refresh(refreshEndCallback) {
      var _this10 = this;

      devAssert(!this.isRefreshing);
      this.isRefreshing = true;
      this.tearDownSlot();
      this.initiateAdRequest();

      if (!this.adPromise_) {
        // For whatever reasons, the adPromise has been nullified, and we will be
        // unable to proceed. The current creative will continue to be displayed.
        return _resolvedPromise2();
      }

      var promiseId = this.promiseId_;
      return devAssert(this.adPromise_).then(function () {
        if (!_this10.isRefreshing || promiseId != _this10.promiseId_) {
          // If this refresh cycle was canceled, such as in a no-content
          // response case, keep showing the old creative.
          refreshEndCallback();
          return;
        }

        return _this10.mutateElement(function () {
          // Fire an ad-refresh event so that 3rd parties can track when an ad
          // has changed.
          triggerAnalyticsEvent(_this10.element, AnalyticsTrigger.AD_REFRESH);

          _this10.togglePlaceholder(true);

          // This delay provides a 1 second buffer where the ad loader is
          // displayed in between the creatives.
          return Services.timerFor(_this10.win).promise(1000).then(function () {
            _this10.isRelayoutNeededFlag = true;

            _this10.getResource().layoutCanceled();

            // Only Require relayout after page visible
            _this10.getAmpDoc().whenNextVisible().then(function () {
              Services.ownersForDoc(_this10.getAmpDoc()).
              /*OK*/
              requireLayout(_this10.element);
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

  }, {
    key: "promiseErrorHandler_",
    value: function promiseErrorHandler_(error, opt_ignoreStack) {
      if (isCancellation(error)) {
        // Rethrow if cancellation.
        throw error;
      }

      if (error && error.message) {
        error = duplicateErrorIfNecessary(
        /** @type {!Error} */
        error);
      } else {
        error = new Error('unknown error ' + error);
      }

      if (opt_ignoreStack) {
        error.ignoreStack = opt_ignoreStack;
      }

      // Add `type` to the message. Ensure to preserve the original stack.
      var type = this.element.getAttribute('type') || 'notype';

      if (error.message.indexOf(TAG + ": " + type + ":") != 0) {
        error.message = TAG + ": " + type + ": " + error.message;
      }

      // Additional arguments.
      assignAdUrlToError(
      /** @type {!Error} */
      error, this.adUrl_);

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

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this11 = this;

      if (this.isRefreshing) {
        this.destroyFrame(true);
      }

      return this.attemptToRenderCreative().then(function () {
        observeWithSharedInOb(_this11.element, _this11.boundViewportCallback_);
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

  }, {
    key: "attemptToRenderCreative",
    value: function attemptToRenderCreative() {
      var _this12 = this;

      // Promise may be null if element was determined to be invalid for A4A.
      if (!this.adPromise_) {
        if (this.shouldInitializePromiseChain_()) {
          dev().error(TAG, 'Null promise in layoutCallback');
        }

        return _resolvedPromise3();
      }

      var checkStillCurrent = this.verifyStillCurrent();
      // Promise chain will have determined if creative is valid AMP.
      return Promise.all([this.adPromise_, this.uiHandler.getScrollPromiseForStickyAd()]).then(function (values) {
        checkStillCurrent();

        _this12.uiHandler.maybeInitStickyAd();

        var creativeMetaData = values[0];

        if (_this12.isCollapsed_) {
          return _resolvedPromise4();
        }

        // If this.iframe already exists, and we're not currently in the middle
        // of refreshing, bail out here. This should only happen in
        // testing context, not in production.
        if (_this12.iframe && !_this12.isRefreshing) {
          return _resolvedPromise5();
        }

        if (!creativeMetaData) {
          // Non-AMP creative case, will verify ad url existence.
          return _this12.renderNonAmpCreative();
        }

        var friendlyRenderPromise;

        if (_this12.isInNoSigningExp()) {
          friendlyRenderPromise = _this12.renderFriendlyTrustless_(
          /** @type {!./head-validation.ValidatedHeadDef} */
          creativeMetaData, checkStillCurrent);
        } else {
          friendlyRenderPromise = _this12.renderAmpCreative_(
          /** @type {!CreativeMetaDataDef} */
          creativeMetaData);
        }

        // Must be an AMP creative.
        return friendlyRenderPromise.catch(function (err) {
          checkStillCurrent();
          // Failed to render via AMP creative path so fallback to non-AMP
          // rendering within cross domain iframe.
          user().warn(TAG, _this12.element.getAttribute('type'), 'Error injecting creative in friendly frame', err);
          return _this12.renderNonAmpCreative();
        });
      }).catch(function (error) {
        _this12.promiseErrorHandler_(error);

        throw cancellation();
      });
    }
    /**
     * Returns whether or not the ad request may be sent using XHR.
     * @return {boolean}
     */

  }, {
    key: "isXhrAllowed",
    value: function isXhrAllowed() {
      return true;
    }
    /** @override */

  }, {
    key: "attemptChangeSize",
    value: function attemptChangeSize(newHeight, newWidth) {
      // Store original size of slot in order to allow re-expansion on
      // unlayoutCallback so that it is reverted to original size in case
      // of resumeCallback.
      this.originalSlotSize_ = this.originalSlotSize_ || this.getLayoutSize();
      return _get(_getPrototypeOf(AmpA4A.prototype), "attemptChangeSize", this).call(this, newHeight, newWidth);
    }
    /** @override  */

  }, {
    key: "unlayoutCallback",
    value: function unlayoutCallback() {
      unobserveWithSharedInOb(this.element);
      this.tearDownSlot();
      return true;
    }
    /**
     * Attempts to tear down and set all state variables to initial conditions.
     * @protected
     */

  }, {
    key: "tearDownSlot",
    value: function tearDownSlot() {
      var _this13 = this;

      // Increment promiseId to cause any pending promise to cancel.
      this.promiseId_++;
      this.uiHandler.applyUnlayoutUI();

      if (this.originalSlotSize_) {
        _get(_getPrototypeOf(AmpA4A.prototype), "attemptChangeSize", this).call(this, this.originalSlotSize_.height, this.originalSlotSize_.width).then(function () {
          _this13.originalSlotSize_ = null;
        }).catch(function (err) {
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
      this.experimentalNonAmpCreativeRenderMethod_ = this.getNonAmpCreativeRenderingMethod();
      this.postAdResponseExperimentFeatures = {};
    }
    /** @override */

  }, {
    key: "detachedCallback",
    value: function detachedCallback() {
      _get(_getPrototypeOf(AmpA4A.prototype), "detachedCallback", this).call(this);

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

  }, {
    key: "destroyFrame",
    value: function destroyFrame(force) {
      if (force === void 0) {
        force = false;
      }

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

      if (this.uiHandler) {
        this.uiHandler.cleanup();
      }
    } // TODO: Rename to viewportCallback once BaseElement.viewportCallback has been removed.

    /**
     * @param {boolean}  inViewport
     * @protected
     */

  }, {
    key: "viewportCallbackTemp",
    value: function viewportCallbackTemp(inViewport) {
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

  }, {
    key: "getAdUrl",
    value: function getAdUrl(opt_ununsedConsentTuple, opt_rtcResponsesPromise, opt_serveNpaSignal) {
      throw new Error('getAdUrl not implemented!');
    }
    /**
     * Checks if the `always-serve-npa` attribute is present and valid
     * based on the geolocation.  To be implemented by network.
     * @return {!Promise<boolean>}
     */

  }, {
    key: "getServeNpaSignal",
    value: function getServeNpaSignal() {
      return Promise.resolve(false);
    }
    /**
     * Checks if the `block-rtc` attribute is present and valid
     * based on the geolocation.
     * @return {!Promise<boolean>}
     */

  }, {
    key: "getBlockRtc_",
    value: function getBlockRtc_() {
      var _this14 = this;

      if (!this.element.getAttribute('block-rtc')) {
        return Promise.resolve(false);
      }

      return Services.geoForDocOrNull(this.element).then(function (geoService) {
        userAssert(geoService, '%s: requires <amp-geo> to use `block-rtc`', TAG);

        var blockRtcLocations = _this14.element.getAttribute('block-rtc');

        var locations = blockRtcLocations.split(',');

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
    /**
     * Resets ad url state to null, used to prevent frame get fallback if error
     * is thrown after url construction but prior to layoutCallback.
     */

  }, {
    key: "resetAdUrl",
    value: function resetAdUrl() {
      this.adUrl_ = null;
    }
    /**
     * @return {function()} function that when called will verify if current
     *    ad retrieval is current (meaning unlayoutCallback was not executed).
     *    If not, will throw cancellation exception;
     * @throws {Error}
     */

  }, {
    key: "verifyStillCurrent",
    value: function verifyStillCurrent() {
      var _this15 = this;

      var promiseId = this.promiseId_;
      return function () {
        if (promiseId != _this15.promiseId_) {
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

  }, {
    key: "extractSize",
    value: function extractSize(responseHeaders) {
      var headerValue = responseHeaders.get(CREATIVE_SIZE_HEADER);

      if (!headerValue) {
        return null;
      }

      var match = /^([0-9]+)x([0-9]+)$/.exec(headerValue);

      if (!match) {
        // TODO(@taymonbeal, #9274): replace this with real error reporting
        user().error(TAG, "Invalid size header: " + headerValue);
        return null;
      }

      return (
        /** @type {?SizeInfoDef} */
        {
          width: Number(match[1]),
          height: Number(match[2])
        }
      );
    }
    /**
     * Forces the UI Handler to collapse this slot.
     * @visibleForTesting
     */

  }, {
    key: "forceCollapse",
    value: function forceCollapse() {
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

  }, {
    key: "onCreativeRender",
    value: function onCreativeRender(creativeMetaData, opt_onLoadPromise) {
      this.maybeTriggerAnalyticsEvent_(creativeMetaData ? 'renderFriendlyEnd' : 'renderCrossDomainEnd');
    }
    /**
     * @param {!Element} iframe that was just created.  To be overridden for
     * testing.
     * @visibleForTesting
     */

  }, {
    key: "onCrossDomainIframeCreated",
    value: function onCrossDomainIframeCreated(iframe) {
      dev().info(TAG, this.element.getAttribute('type'), "onCrossDomainIframeCreated " + iframe);
    }
    /** @return {boolean} whether html creatives should be sandboxed. */

  }, {
    key: "sandboxHTMLCreativeFrame",
    value: function sandboxHTMLCreativeFrame() {
      return true;
    }
    /**
     * Send ad request, extract the creative and signature from the response.
     * @param {string} adUrl Request URL to send XHR to.
     * @return {!Promise<?Response>}
     * @protected
     */

  }, {
    key: "sendXhrRequest",
    value: function sendXhrRequest(adUrl) {
      var _this16 = this;

      this.maybeTriggerAnalyticsEvent_('adRequestStart');
      var xhrInit = {
        mode: 'cors',
        method: 'GET',
        credentials: 'include'
      };
      return Services.xhrFor(this.win).fetch(adUrl, xhrInit).catch(function (error) {
        if (error.response && error.response.status > 200) {
          // Invalid server response code so we should collapse.
          return null;
        }

        // If an error occurs, let the ad be rendered via iframe after delay.
        // TODO(taymonbeal): Figure out a more sophisticated test for deciding
        // whether to retry with an iframe after an ad request failure or just
        // give up and render the fallback content (or collapse the ad slot).
        var networkFailureHandlerResult = _this16.onNetworkFailure(error,
        /** @type {string} */
        _this16.adUrl_);

        devAssert(!!networkFailureHandlerResult);

        if (networkFailureHandlerResult.frameGetDisabled) {
          // Reset adUrl to null which will cause layoutCallback to not
          // fetch via frame GET.
          dev().info(TAG, 'frame get disabled as part of network failure handler');

          _this16.resetAdUrl();
        } else {
          _this16.adUrl_ = networkFailureHandlerResult.adUrl || _this16.adUrl_;
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

  }, {
    key: "onNetworkFailure",
    value: function onNetworkFailure(unusedError, unusedAdUrl) {
      return {};
    }
    /**
     * To be overridden by network specific implementation indicating which
     * signing service(s) is to be used.
     * @return {!Array<string>} A list of signing services.
     */

  }, {
    key: "getSigningServiceNames",
    value: function getSigningServiceNames() {
      return getMode().localDev ? ['google', 'google-dev'] : ['google'];
    }
    /**
     * Render non-AMP creative within cross domain iframe.
     * @param {boolean=} throttleApplied Whether incrementLoadingAds has already
     *    been called
     * @return {Promise<boolean>} Whether the creative was successfully rendered.
     */

  }, {
    key: "renderNonAmpCreative",
    value: function renderNonAmpCreative(throttleApplied) {
      var _this17 = this;

      if (this.element.getAttribute('disable3pfallback') == 'true') {
        user().warn(TAG, this.element.getAttribute('type'), 'fallback to 3p disabled');
        return Promise.resolve(false);
      }

      // TODO(keithwrightbos): remove when no longer needed.
      dev().warn(TAG, 'fallback to 3p');
      // Haven't rendered yet, so try rendering via one of our
      // cross-domain iframe solutions.
      var method = this.experimentalNonAmpCreativeRenderMethod_;
      var renderPromise = Promise.resolve(false);

      if ((method == XORIGIN_MODE.SAFEFRAME || method == XORIGIN_MODE.NAMEFRAME) && this.creativeBody_) {
        renderPromise = this.renderViaNameAttrOfXOriginIframe_(this.creativeBody_);
        this.creativeBody_ = null;
      } else if (this.adUrl_) {
        assertHttpsUrl(this.adUrl_, this.element);
        renderPromise = this.renderViaIframeGet_(this.adUrl_);
      } else {
        // Ad URL may not exist if buildAdUrl throws error or returns empty.
        // If error occurred, it would have already been reported but let's
        // report to user in case of empty.
        user().warn(TAG, this.element.getAttribute('type'), "No creative or URL available -- A4A can't render any ad");
      }

      if (!throttleApplied && !this.inNonAmpPreferenceExp()) {
        incrementLoadingAds(this.win, renderPromise);
      }

      return renderPromise.then(function (result) {
        _this17.maybeTriggerAnalyticsEvent_('crossDomainIframeLoaded');

        // Pass on the result to the next value in the promise change.
        return result;
      });
    }
    /**
     * @param {!./head-validation.ValidatedHeadDef} headData
     * @param {function()} checkStillCurrent
     * @return {!Promise} Whether the creative was successfully rendered.
     */

  }, {
    key: "renderFriendlyTrustless_",
    value: function renderFriendlyTrustless_(headData, checkStillCurrent) {
      var _this18 = this;

      checkStillCurrent();
      devAssert(this.element.ownerDocument);
      this.maybeTriggerAnalyticsEvent_('renderFriendlyStart');
      var _this$creativeSize_ = this.creativeSize_,
          height = _this$creativeSize_.height,
          width = _this$creativeSize_.width;
      var extensions = headData.extensions,
          fonts = headData.fonts,
          head = headData.head;
      this.iframe = createSecureFrame(this.win, this.getIframeTitle(), height, width);

      if (!this.uiHandler.isStickyAd()) {
        applyFillContent(this.iframe);
      }

      var body = '';
      var transferComplete = new Deferred();

      // If srcdoc is not supported, streaming is also not supported so we
      // can go ahead and write the ad content body.
      if (!isSrcdocSupported()) {
        body = head.ownerDocument.body.
        /*OK */
        outerHTML;
        transferComplete.resolve();
      } else {
        // Once skeleton doc has be written to srcdoc we start transferring
        // body chunks.
        listenOnce(this.iframe, 'load', function () {
          var fieBody = _this18.iframe.contentDocument.body;

          _this18.transferDomBody_(devAssert(fieBody)).then(transferComplete.resolve);
        });
      }

      var secureDoc = createSecureDocSkeleton(devAssert(this.adUrl_), head.
      /*OK*/
      outerHTML, body);
      var fieInstallPromise = this.installFriendlyIframeEmbed_(secureDoc, extensions, fonts, true // skipHtmlMerge
      );
      // Tell the FIE it is done after transferring.
      Promise.all([fieInstallPromise, transferComplete.promise]).then(function (values) {
        var friendlyIframeEmbed = values[0];
        // #installFriendlyIframeEmbed will return null if removed before install is complete.
        friendlyIframeEmbed && friendlyIframeEmbed.renderCompleted();
      });
      var extensionIds = extensions.map(function (extension) {
        return extension.extensionId;
      });
      return fieInstallPromise.then(function (friendlyIframeEmbed) {
        checkStillCurrent();

        _this18.makeFieVisible_(friendlyIframeEmbed, // TODO(ccordry): subclasses are passed creativeMetadata which does
        // not exist in unsigned case. All it is currently used for is to
        // check if it is an AMP creative, and extension list.
        {
          minifiedCreative: '',
          customStylesheets: [],
          customElementExtensions: extensionIds
        }, checkStillCurrent);
      });
    }
    /**
     * Render a validated AMP creative directly in the parent page.
     * @param {!CreativeMetaDataDef} creativeMetaData Metadata required to render
     *     AMP creative.
     * @return {!Promise} Whether the creative was successfully rendered.
     * @private
     */

  }, {
    key: "renderAmpCreative_",
    value: function renderAmpCreative_(creativeMetaData) {
      var _this19 = this;

      devAssert(creativeMetaData.minifiedCreative, 'missing minified creative');
      devAssert(!!this.element.ownerDocument, 'missing owner document?!');
      this.maybeTriggerAnalyticsEvent_('renderFriendlyStart');
      // Create and setup friendly iframe.
      this.iframe =
      /** @type {!HTMLIFrameElement} */
      createElementWithAttributes(
      /** @type {!Document} */
      this.element.ownerDocument, 'iframe', dict({
        // NOTE: It is possible for either width or height to be 'auto',
        // a non-numeric value.
        'height': this.creativeSize_.height,
        'width': this.creativeSize_.width,
        'frameborder': '0',
        'allowfullscreen': '',
        'allowtransparency': '',
        'scrolling': 'no',
        'title': this.getIframeTitle()
      }));

      if (!this.uiHandler.isStickyAd()) {
        applyFillContent(this.iframe);
      }

      var fontsArray = [];

      if (creativeMetaData.customStylesheets) {
        creativeMetaData.customStylesheets.forEach(function (s) {
          var href = s['href'];

          if (href) {
            fontsArray.push(href);
          }
        });
      }

      var checkStillCurrent = this.verifyStillCurrent();
      var minifiedCreative = creativeMetaData.minifiedCreative;
      var extensions = getExtensionsFromMetadata(creativeMetaData);
      return this.installFriendlyIframeEmbed_(minifiedCreative, extensions, fontsArray || [], false // skipHtmlMerge
      ).then(function (friendlyIframeEmbed) {
        return _this19.makeFieVisible_(friendlyIframeEmbed, creativeMetaData, checkStillCurrent);
      });
    }
    /**
     * Convert the iframe to FIE impl and append to DOM.
     * @param {string} html
     * @param {!Array<{extensionId: string, extensionVersion: string}>} extensions
     * @param {!Array<string>} fonts
     * @param {boolean} skipHtmlMerge
     * @return {!Promise<!../../../src/friendly-iframe-embed.FriendlyIframeEmbed>}
     */

  }, {
    key: "installFriendlyIframeEmbed_",
    value: function installFriendlyIframeEmbed_(html, extensions, fonts, skipHtmlMerge) {
      var _this20 = this;

      return installFriendlyIframeEmbed(devAssert(this.iframe), this.element, {
        host: this.element,
        // Need to guarantee that this is no longer null
        url: devAssert(this.adUrl_),
        html: html,
        extensions: extensions,
        fonts: fonts,
        skipHtmlMerge: skipHtmlMerge
      }, function (embedWin, ampdoc) {
        return _this20.preinstallCallback_(embedWin, ampdoc);
      });
    }
    /**
     *
     * @param {!Window} embedWin
     * @param {../../../src/service/ampdoc-impl.AmpDoc=} ampdoc
     */

  }, {
    key: "preinstallCallback_",
    value: function preinstallCallback_(embedWin, ampdoc) {
      var parentAmpdoc = this.getAmpDoc();
      installUrlReplacementsForEmbed(ampdoc, new A4AVariableSource(parentAmpdoc, embedWin));
    }
    /**
     * Make FIE visible and execute any loading / rendering complete callbacks.
     * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} friendlyIframeEmbed
     * @param {CreativeMetaDataDef} creativeMetaData
     * @param {function()} checkStillCurrent
     */

  }, {
    key: "makeFieVisible_",
    value: function makeFieVisible_(friendlyIframeEmbed, creativeMetaData, checkStillCurrent) {
      var _this21 = this;

      checkStillCurrent();
      this.friendlyIframeEmbed_ = friendlyIframeEmbed;
      // Ensure visibility hidden has been removed (set by boilerplate).
      var frameBody = this.getFieBody_(friendlyIframeEmbed);
      setStyle(frameBody, 'visibility', 'visible');
      protectFunctionWrapper(this.onCreativeRender, this, function (err) {
        dev().error(TAG, _this21.element.getAttribute('type'), 'Error executing onCreativeRender', err);
      })(creativeMetaData, friendlyIframeEmbed.whenWindowLoaded());
      friendlyIframeEmbed.whenIniLoaded().then(function () {
        checkStillCurrent();

        _this21.maybeTriggerAnalyticsEvent_('friendlyIframeIniLoad');
      });
    }
    /**
     * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} friendlyIframeEmbed
     * @return {!Element}
     */

  }, {
    key: "getFieBody_",
    value: function getFieBody_(friendlyIframeEmbed) {
      var frameDoc = friendlyIframeEmbed.iframe.contentDocument || friendlyIframeEmbed.win.document;
      return devAssert(frameDoc.body);
    }
    /**
     * Shared functionality for cross-domain iframe-based rendering methods.
     * @param {!JsonObject<string, string>} attributes The attributes of the iframe.
     * @return {!Promise} awaiting load event for ad frame
     * @private
     */

  }, {
    key: "iframeRenderHelper_",
    value: function iframeRenderHelper_(attributes) {
      var _this22 = this;

      var mergedAttributes = Object.assign(attributes, dict({
        'height': this.creativeSize_.height,
        'width': this.creativeSize_.width,
        'title': this.getIframeTitle()
      }));

      if (this.sentinel) {
        mergedAttributes['data-amp-3p-sentinel'] = this.sentinel;
      }

      // Block synchronous XHR in ad. These are very rare, but super bad for UX
      // as they block the UI thread for the arbitrary amount of time until the
      // request completes.
      var featurePolicies = "sync-xhr 'none';";

      if (isAttributionReportingSupported(this.win.document)) {
        featurePolicies += "attribution-reporting 'src';";
      }

      mergedAttributes['allow'] = featurePolicies;
      this.iframe =
      /** @type {!HTMLIFrameElement} */
      createElementWithAttributes(
      /** @type {!Document} */
      this.element.ownerDocument, 'iframe',
      /** @type {!JsonObject} */
      Object.assign(mergedAttributes, SHARED_IFRAME_PROPERTIES));

      if (this.sandboxHTMLCreativeFrame()) {
        applySandbox(this.iframe);
      }

      // TODO(keithwrightbos): noContentCallback?
      this.xOriginIframeHandler_ = new AMP.AmpAdXOriginIframeHandler(this);
      // Iframe is appended to element as part of xorigin frame handler init.
      // Executive onCreativeRender after init to ensure it can get reference
      // to frame but prior to load to allow for earlier access.
      var frameLoadPromise = this.xOriginIframeHandler_.init(this.iframe,
      /* opt_isA4A */
      true, this.letCreativeTriggerRenderStart());
      protectFunctionWrapper(this.onCreativeRender, this, function (err) {
        dev().error(TAG, _this22.element.getAttribute('type'), 'Error executing onCreativeRender', err);
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

  }, {
    key: "renderViaIframeGet_",
    value: function renderViaIframeGet_(adUrl) {
      var _this23 = this;

      this.maybeTriggerAnalyticsEvent_('renderCrossDomainStart');
      var contextMetadata = getContextMetadata(this.win, this.element, this.sentinel);
      return this.initialIntersectionPromise_.then(function (intersection) {
        contextMetadata['_context']['initialIntersection'] = intersectionEntryToJson(intersection);
        return _this23.iframeRenderHelper_(dict({
          'src': Services.xhrFor(_this23.win).getCorsUrl(_this23.win, adUrl),
          'name': JSON.stringify(contextMetadata)
        }));
      });
    }
    /**
     * Whether AMP Ad Xorigin Iframe handler should wait for the creative to
     * call render-start, rather than triggering it itself. Example use case
     * is that amp-sticky-ad should trigger render-start itself so that the
     * sticky container isn't shown before an ad is ready.
     * @return {boolean}
     */

  }, {
    key: "letCreativeTriggerRenderStart",
    value: function letCreativeTriggerRenderStart() {
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

  }, {
    key: "renderViaNameAttrOfXOriginIframe_",
    value: function renderViaNameAttrOfXOriginIframe_(creativeBody) {
      var _this24 = this;

      /** @type {?string} */
      var method = this.experimentalNonAmpCreativeRenderMethod_;
      devAssert(method == XORIGIN_MODE.SAFEFRAME || method == XORIGIN_MODE.NAMEFRAME, 'Unrecognized A4A cross-domain rendering mode: %s', method);
      this.maybeTriggerAnalyticsEvent_('renderSafeFrameStart');
      var checkStillCurrent = this.verifyStillCurrent();
      return tryResolve(function () {
        return utf8Decode(creativeBody);
      }).then(function (creative) {
        checkStillCurrent();
        var srcPath;
        var name = '';

        switch (method) {
          case XORIGIN_MODE.SAFEFRAME:
            srcPath = _this24.getSafeframePath() + '?n=0';
            break;

          case XORIGIN_MODE.NAMEFRAME:
            srcPath = getDefaultBootstrapBaseUrl(_this24.win, 'nameframe');
            // Name will be set for real below in nameframe case.
            break;

          default:
            // Shouldn't be able to get here, but...  Because of the assert,
            // above, we can only get here in non-dev mode, so give user feedback.
            user().error('A4A', 'A4A received unrecognized cross-domain name' + ' attribute iframe rendering mode request: %s.  Unable to' + ' render a creative for' + ' slot %s.', method, _this24.element.getAttribute('id'));
            return Promise.reject('Unrecognized rendering mode request');
        }

        // TODO(bradfrizzell): change name of function and var
        var contextMetadata = getContextMetadata(_this24.win, _this24.element, _this24.sentinel, _this24.getAdditionalContextMetadata(method == XORIGIN_MODE.SAFEFRAME));
        return _this24.initialIntersectionPromise_.then(function (intersection) {
          contextMetadata['initialIntersection'] = intersectionEntryToJson(intersection);

          if (method == XORIGIN_MODE.NAMEFRAME) {
            contextMetadata['creative'] = creative;
            name = JSON.stringify(contextMetadata);
          } else if (method == XORIGIN_MODE.SAFEFRAME) {
            contextMetadata = JSON.stringify(contextMetadata);
            name = _this24.safeframeVersion + ";" + creative.length + ";" + creative + ("" + contextMetadata);
          }

          return _this24.iframeRenderHelper_(dict({
            'src': srcPath,
            'name': name
          }));
        });
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

  }, {
    key: "getAmpAdMetadata",
    value: function getAmpAdMetadata(creative) {
      var metadataStart = -1;
      var metadataString;

      for (var i = 0; i < METADATA_STRINGS.length; i++) {
        metadataString = METADATA_STRINGS[i];
        metadataStart = creative.lastIndexOf(metadataString);

        if (metadataStart >= 0) {
          break;
        }
      }

      if (metadataStart < 0) {
        // Couldn't find a metadata blob.
        dev().warn(TAG, this.element.getAttribute('type'), 'Could not locate start index for amp meta data in: %s', creative);
        return null;
      }

      var metadataEnd = creative.lastIndexOf('</script>');

      if (metadataEnd < 0) {
        // Couldn't find a metadata blob.
        dev().warn(TAG, this.element.getAttribute('type'), 'Could not locate closing script tag for amp meta data in: %s', creative);
        return null;
      }

      try {
        var metaDataObj = parseJson(creative.slice(metadataStart + metadataString.length, metadataEnd));
        var ampRuntimeUtf16CharOffsets = metaDataObj['ampRuntimeUtf16CharOffsets'];

        if (!isArray(ampRuntimeUtf16CharOffsets) || ampRuntimeUtf16CharOffsets.length != 2 || typeof ampRuntimeUtf16CharOffsets[0] !== 'number' || typeof ampRuntimeUtf16CharOffsets[1] !== 'number') {
          throw new Error('Invalid runtime offsets');
        }

        var metaData = {};

        if (metaDataObj['customElementExtensions']) {
          metaData.customElementExtensions = metaDataObj['customElementExtensions'];

          if (!isArray(metaData.customElementExtensions)) {
            throw new Error('Invalid extensions', metaData.customElementExtensions);
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
          var errorMsg = 'Invalid custom stylesheets';

          if (!isArray(metaData.customStylesheets)) {
            throw new Error(errorMsg);
          }

          var urls = Services.urlForDoc(this.element);

          /** @type {!Array} */
          metaData.customStylesheets.forEach(function (stylesheet) {
            if (!isObject(stylesheet) || !stylesheet['href'] || typeof stylesheet['href'] !== 'string' || !urls.isSecure(stylesheet['href'])) {
              throw new Error(errorMsg);
            }
          });
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
        metaData.minifiedCreative = creative.slice(0, ampRuntimeUtf16CharOffsets[0]) + creative.slice(ampRuntimeUtf16CharOffsets[1], metadataStart) + creative.slice(metadataEnd + '</script>'.length);
        return metaData;
      } catch (err) {
        dev().warn(TAG, this.element.getAttribute('type'), 'Invalid amp metadata: %s', creative.slice(metadataStart + metadataString.length, metadataEnd));

        if (this.isSinglePageStoryAd) {
          throw err;
        }

        return null;
      }
    }
    /**
     * @return {string} full url to safeframe implementation.
     */

  }, {
    key: "getSafeframePath",
    value: function getSafeframePath() {
      return 'https://tpc.googlesyndication.com/safeframe/' + (this.safeframeVersion + "/html/container.html");
    }
    /**
     * @return {boolean} whether this is a sticky ad unit
     */

  }, {
    key: "isStickyAd",
    value: function isStickyAd() {
      return false;
    }
    /**
     * Checks if the given lifecycle event has a corresponding amp-analytics event
     * and fires the analytics trigger if so.
     * @param {string} lifecycleStage
     * @private
     */

  }, {
    key: "maybeTriggerAnalyticsEvent_",
    value: function maybeTriggerAnalyticsEvent_(lifecycleStage) {
      if (!this.a4aAnalyticsConfig_) {
        // No config exists that will listen to this event.
        return;
      }

      var analyticsEvent = devAssert(LIFECYCLE_STAGE_TO_ANALYTICS_TRIGGER[lifecycleStage]);
      var analyticsVars =
      /** @type {!JsonObject} */
      Object.assign(dict({
        'time': Math.round(this.getNow_())
      }), this.getA4aAnalyticsVars(analyticsEvent));
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

  }, {
    key: "getA4aAnalyticsVars",
    value: function getA4aAnalyticsVars(unusedAnalyticsEvent) {
      return dict({});
    }
    /**
     * Returns network-specific config for amp-analytics. It should overridden
     * with network-specific configurations.
     * This function may return null. If so, no amp-analytics element will be
     * added to this A4A element and no A4A triggers will be fired.
     * @return {?JsonObject}
     */

  }, {
    key: "getA4aAnalyticsConfig",
    value: function getA4aAnalyticsConfig() {
      return null;
    }
    /**
     * Attempts to execute Real Time Config, if the ad network has enabled it.
     * If it is not supported by the network, but the publisher has included
     * the rtc-config attribute on the amp-ad element, warn. Additionaly,
     * if the publisher has included a valid `block-rtc` attribute, don't send.
     * @param {?CONSENT_POLICY_STATE} consentState
     * @param {?string} consentString
     * @param {?Object<string, string|number|boolean|undefined>} consentMetadata
     * @return {Promise<!Array<!rtcResponseDef>>|undefined}
     */

  }, {
    key: "tryExecuteRealTimeConfig_",
    value: function tryExecuteRealTimeConfig_(consentState, consentString, consentMetadata) {
      var _this25 = this;

      if (this.element.getAttribute('rtc-config')) {
        installRealTimeConfigServiceForDoc(this.getAmpDoc());
        return this.getBlockRtc_().then(function (shouldBlock) {
          return shouldBlock ? undefined : Services.realTimeConfigForDoc(_this25.getAmpDoc()).then(function (realTimeConfig) {
            return realTimeConfig.maybeExecuteRealTimeConfig(_this25.element, _this25.getCustomRealTimeConfigMacros_(), consentState, consentString, consentMetadata, _this25.verifyStillCurrent());
          });
        });
      }
    }
    /**
     * To be overriden by network impl. Should return a mapping of macro keys
     * to values for substitution in publisher-specified URLs for RTC.
     * @return {!Object<string,
     *   !../../../src/service/variable-source.AsyncResolverDef>}
     */

  }, {
    key: "getCustomRealTimeConfigMacros_",
    value: function getCustomRealTimeConfigMacros_() {
      return {};
    }
    /**
     * Whether preferential render should still be utilized if web crypto is
     * unavailable, and crypto signature header is present.
     * @return {boolean}
     */

  }, {
    key: "shouldPreferentialRenderWithoutCrypto",
    value: function shouldPreferentialRenderWithoutCrypto() {
      return false;
    }
    /**
     * @param {string=} headerValue Method as given in header.
     * @return {?XORIGIN_MODE}
     */

  }, {
    key: "getNonAmpCreativeRenderingMethod",
    value: function getNonAmpCreativeRenderingMethod(headerValue) {
      if (headerValue) {
        if (!isEnumValue(XORIGIN_MODE, headerValue)) {
          dev().error('AMP-A4A', "cross-origin render mode header " + headerValue);
        } else {
          return (
            /** @type {XORIGIN_MODE} */
            headerValue
          );
        }
      }

      return Services.platformFor(this.win).isIos() ? XORIGIN_MODE.NAMEFRAME : null;
    }
    /**
     * Returns base object that will be written to cross-domain iframe name
     * attribute.
     * @param {boolean=} opt_isSafeframe Whether creative is rendering into
     *   a safeframe.
     * @return {!JsonObject|undefined}
     */

  }, {
    key: "getAdditionalContextMetadata",
    value: function getAdditionalContextMetadata(opt_isSafeframe) {}
    /**
     * Returns whether the received creative is verified AMP.
     * @return {boolean} True if the creative is verified AMP, false otherwise.
     */

  }, {
    key: "isVerifiedAmpCreative",
    value: function isVerifiedAmpCreative() {
      return this.isVerifiedAmpCreative_;
    }
    /**
     * Returns the amp-ad title attribute or a fallback string.
     * @return {string} iframe title attribute
     */

  }, {
    key: "getIframeTitle",
    value: function getIframeTitle() {
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

  }, {
    key: "getSsrExpIds_",
    value: function getSsrExpIds_() {
      var exps = [];
      var meta = this.getAmpDoc().getMetaByName('amp-usqp');

      if (meta) {
        var keyValues = meta.split(',');

        for (var i = 0; i < keyValues.length; i++) {
          var kv = keyValues[i].split('=');

          if (kv.length !== 2) {
            continue;
          }

          // Reasonably assume that all important exps are either booleans, or
          // enums with 100 or less branches.
          var val = Number(kv[1]);

          if (!isNaN(kv[0]) && val >= 0 && val < 100) {
            var padded = padStart(kv[1], 2, '0');
            exps.push(kv[0] + padded);
          }
        }
      }

      return exps;
    }
  }]);

  return AmpA4A;
}(AMP.BaseElement);

/**
 * Attachs query string portion of ad url to error.
 * @param {!Error} error
 * @param {?string} adUrl
 */
export function assignAdUrlToError(error, adUrl) {
  if (!adUrl || error.args && error.args['au']) {
    return;
  }

  var adQueryIdx = adUrl.indexOf('?');

  if (adQueryIdx == -1) {
    return;
  }

  (error.args || (error.args = {}))['au'] = adUrl.substring(adQueryIdx + 1, adQueryIdx + 251);
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
  var propertyName = 'AMP_FAST_FETCH_SIGNATURE_VERIFIER_';
  return win[propertyName] || (win[propertyName] = new SignatureVerifier(win, signingServerURLs));
}

/**
 * @param {!Window} win
 * @return {boolean}
 * @visibleForTesting
 */
export function isPlatformSupported(win) {
  // Require Shadow DOM support for a4a.
  if (!isNative(win.Element.prototype.attachShadow) && isExperimentOn(win, 'disable-a4a-non-sd')) {
    return false;
  }

  return true;
}

/**
 * Returns `true` if the passed function exists and is native to the browser.
 * @param {Function|undefined} func
 * @return {boolean}
 */
function isNative(func) {
  return !!func && func.toString().indexOf('[native code]') != -1;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hNGEuanMiXSwibmFtZXMiOlsiQTRBVmFyaWFibGVTb3VyY2UiLCJBRFNfSU5JVElBTF9JTlRFUlNFQ1RJT05fRVhQIiwiQ09OU0VOVF9QT0xJQ1lfU1RBVEUiLCJEZWZlcnJlZCIsInRyeVJlc29sdmUiLCJEZXRhY2hlZERvbVN0cmVhbSIsInN0cmVhbVJlc3BvbnNlVG9Xcml0ZXIiLCJEb21UcmFuc2Zvcm1TdHJlYW0iLCJHRU9fSU5fR1JPVVAiLCJMYXlvdXQiLCJMYXlvdXRQcmlvcml0eSIsImFwcGx5RmlsbENvbnRlbnQiLCJpc0xheW91dFNpemVEZWZpbmVkIiwiU2VydmljZXMiLCJTaWduYXR1cmVWZXJpZmllciIsIlZlcmlmaWNhdGlvblN0YXR1cyIsImFwcGx5U2FuZGJveCIsImdlbmVyYXRlU2VudGluZWwiLCJnZXREZWZhdWx0Qm9vdHN0cmFwQmFzZVVybCIsImFzc2VydEh0dHBzVXJsIiwiY2FuY2VsbGF0aW9uIiwiaXNDYW5jZWxsYXRpb24iLCJjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMiLCJjcmVhdGVTZWN1cmVEb2NTa2VsZXRvbiIsImNyZWF0ZVNlY3VyZUZyYW1lIiwiaXNBdHRyaWJ1dGlvblJlcG9ydGluZ1N1cHBvcnRlZCIsImRldiIsImRldkFzc2VydCIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiZGljdCIsImR1cGxpY2F0ZUVycm9ySWZOZWNlc3NhcnkiLCJnZXRBbXBBZFJlbmRlck91dHNpZGVWaWV3cG9ydCIsImluY3JlbWVudExvYWRpbmdBZHMiLCJpczNwVGhyb3R0bGVkIiwiZ2V0Q29uc2VudE1ldGFkYXRhIiwiZ2V0Q29uc2VudFBvbGljeUluZm8iLCJnZXRDb25zZW50UG9saWN5U3RhdGUiLCJnZXRDb250ZXh0TWV0YWRhdGEiLCJnZXRFeHBlcmltZW50QnJhbmNoIiwiaXNFeHBlcmltZW50T24iLCJnZXRFeHRlbnNpb25zRnJvbU1ldGFkYXRhIiwiZ2V0TW9kZSIsImluc2VydEFuYWx5dGljc0VsZW1lbnQiLCJpbnN0YWxsRnJpZW5kbHlJZnJhbWVFbWJlZCIsImlzU3JjZG9jU3VwcG9ydGVkIiwicHJlbG9hZEZyaWVuZGx5SWZyYW1lRW1iZWRFeHRlbnNpb25zIiwiaW5zdGFsbFJlYWxUaW1lQ29uZmlnU2VydmljZUZvckRvYyIsImluc3RhbGxVcmxSZXBsYWNlbWVudHNGb3JFbWJlZCIsImludGVyc2VjdGlvbkVudHJ5VG9Kc29uIiwibWVhc3VyZUludGVyc2VjdGlvbiIsImlzQWRQb3NpdGlvbkFsbG93ZWQiLCJpc0FycmF5IiwiaXNFbnVtVmFsdWUiLCJpc09iamVjdCIsInRyeURlY29kZVVyaUNvbXBvbmVudCIsImxpc3Rlbk9uY2UiLCJvYnNlcnZlV2l0aFNoYXJlZEluT2IiLCJ1bm9ic2VydmVXaXRoU2hhcmVkSW5PYiIsInBhZFN0YXJ0IiwicGFyc2VKc29uIiwicHJvY2Vzc0hlYWQiLCJzZXRTdHlsZSIsInNpZ25pbmdTZXJ2ZXJVUkxzIiwidHJpZ2dlckFuYWx5dGljc0V2ZW50IiwidXRmOERlY29kZSIsIndoZW5XaXRoaW5WaWV3cG9ydCIsIk1FVEFEQVRBX1NUUklOR1MiLCJERUZBVUxUX1NBRkVGUkFNRV9WRVJTSU9OIiwiQ1JFQVRJVkVfU0laRV9IRUFERVIiLCJSRU5ERVJJTkdfVFlQRV9IRUFERVIiLCJTQUZFRlJBTUVfVkVSU0lPTl9IRUFERVIiLCJFWFBFUklNRU5UX0ZFQVRVUkVfSEVBREVSX05BTUUiLCJUQUciLCJOT19DT05URU5UX1JFU1BPTlNFIiwiTkVUV09SS19GQUlMVVJFIiwiSU5WQUxJRF9TUFNBX1JFU1BPTlNFIiwiSUZSQU1FX0dFVCIsIlhPUklHSU5fTU9ERSIsIkNMSUVOVF9DQUNIRSIsIlNBRkVGUkFNRSIsIk5BTUVGUkFNRSIsIlNIQVJFRF9JRlJBTUVfUFJPUEVSVElFUyIsIlNpemVJbmZvRGVmIiwiQ3JlYXRpdmVNZXRhRGF0YURlZiIsIkNvbnNlbnRUdXBsZURlZiIsIkFuYWx5dGljc1RyaWdnZXIiLCJBRF9SRVFVRVNUX1NUQVJUIiwiQURfUkVTUE9OU0VfRU5EIiwiQURfUkVOREVSX1NUQVJUIiwiQURfUkVOREVSX0VORCIsIkFEX0lGUkFNRV9MT0FERUQiLCJBRF9SRUZSRVNIIiwiTElGRUNZQ0xFX1NUQUdFX1RPX0FOQUxZVElDU19UUklHR0VSIiwicHJvdGVjdEZ1bmN0aW9uV3JhcHBlciIsImZuIiwiaW5UaGlzIiwib25FcnJvciIsInVuZGVmaW5lZCIsImZuQXJncyIsImFwcGx5IiwiZXJyIiwidW5zaGlmdCIsImNhcHR1cmVFcnIiLCJBbXBBNEEiLCJlbGVtZW50IiwiQU1QIiwiQW1wQWRVSUhhbmRsZXIiLCJBbXBBZFhPcmlnaW5JZnJhbWVIYW5kbGVyIiwia2V5c2V0UHJvbWlzZV8iLCJhZFByb21pc2VfIiwicHJvbWlzZUlkXyIsImFkVXJsXyIsImZyaWVuZGx5SWZyYW1lRW1iZWRfIiwidWlIYW5kbGVyIiwieE9yaWdpbklmcmFtZUhhbmRsZXJfIiwiaXNWZXJpZmllZEFtcENyZWF0aXZlXyIsImNyZWF0aXZlQm9keV8iLCJjcmVhdGl2ZVNpemVfIiwib3JpZ2luYWxTbG90U2l6ZV8iLCJpbml0aWFsSW50ZXJzZWN0aW9uUHJvbWlzZV8iLCJleHBlcmltZW50YWxOb25BbXBDcmVhdGl2ZVJlbmRlck1ldGhvZF8iLCJnZXROb25BbXBDcmVhdGl2ZVJlbmRlcmluZ01ldGhvZCIsImdldE5vd18iLCJ3aW4iLCJwZXJmb3JtYW5jZSIsIm5vdyIsImJpbmQiLCJEYXRlIiwic2VudGluZWwiLCJ3aW5kb3ciLCJpc0NvbGxhcHNlZF8iLCJpZnJhbWUiLCJzYWZlZnJhbWVWZXJzaW9uIiwiaXNSZWZyZXNoaW5nIiwiaXNSZWxheW91dE5lZWRlZEZsYWciLCJwb3N0QWRSZXNwb25zZUV4cGVyaW1lbnRGZWF0dXJlcyIsImE0YUFuYWx5dGljc0NvbmZpZ18iLCJhNGFBbmFseXRpY3NFbGVtZW50XyIsImlzU2luZ2xlUGFnZVN0b3J5QWQiLCJ0cmFuc2ZlckRvbUJvZHlfIiwiYm91bmRWaWV3cG9ydENhbGxiYWNrXyIsInZpZXdwb3J0Q2FsbGJhY2tUZW1wIiwiaXNQV0EiLCJnZXRBbXBEb2MiLCJpc1NpbmdsZURvYyIsIk1FVEFEQVRBIiwiQURTIiwibGF5b3V0Iiwid2lkdGgiLCJnZXRBdHRyaWJ1dGUiLCJoZWlnaHQiLCJ1cGdyYWRlRGVsYXlNcyIsIk1hdGgiLCJyb3VuZCIsImdldFJlc291cmNlIiwiZ2V0VXBncmFkZURlbGF5TXMiLCJpbmZvIiwidmFsaWRhdGVTdGlja3lBZCIsInZlcmlmaWVyIiwic2lnbmF0dXJlVmVyaWZpZXJGb3IiLCJ3aGVuRmlyc3RWaXNpYmxlIiwidGhlbiIsImdldFNpZ25pbmdTZXJ2aWNlTmFtZXMiLCJmb3JFYWNoIiwic2lnbmluZ1NlcnZpY2VOYW1lIiwibG9hZEtleXNldCIsImdldEE0YUFuYWx5dGljc0NvbmZpZyIsImhhc0F0dHJpYnV0ZSIsImFzeW5jSW50ZXJzZWN0aW9uIiwiaWQiLCJleHBlcmltZW50IiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXRJbnRlcnNlY3Rpb25DaGFuZ2VFbnRyeSIsImluTm9uQW1wUHJlZmVyZW5jZUV4cCIsImVsZW1lbnRDaGVjayIsInRhZ05hbWUiLCJ1bnVzZWRPbkxheW91dCIsInByZWNvbm5lY3QiLCJnZXRQcmVjb25uZWN0VXJscyIsInAiLCJwcmVjb25uZWN0Rm9yIiwidXJsIiwicGF1c2UiLCJyZXN1bWUiLCJyZXNvdXJjZSIsImhhc0JlZW5NZWFzdXJlZCIsImlzTWVhc3VyZVJlcXVlc3RlZCIsIm9uTGF5b3V0TWVhc3VyZSIsImdldFJlc291cmNlcyIsImdldFJlc291cmNlRm9yRWxlbWVudCIsImluY2x1ZGVzIiwic2xvdFJlY3QiLCJnZXRJbnRlcnNlY3Rpb25FbGVtZW50TGF5b3V0Qm94IiwiZml4ZWRTaXplWmVyb0hlaWdodE9yV2lkdGgiLCJnZXRMYXlvdXQiLCJGTFVJRCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiZmluZSIsImlzU3RpY2t5QWQiLCJ3YXJuIiwiaXNWYWxpZEVsZW1lbnQiLCJpbml0aWF0ZUFkUmVxdWVzdCIsInZpZXdwb3J0IiwibG9jYWxEZXYiLCJ0ZXN0IiwiaXNMYXlvdXRQZW5kaW5nIiwidmlld3BvcnROdW0iLCJhc3NlcnROdW1iZXIiLCJzaG91bGRJbml0aWFsaXplUHJvbWlzZUNoYWluXyIsImNoZWNrU3RpbGxDdXJyZW50IiwidmVyaWZ5U3RpbGxDdXJyZW50IiwiZGVsYXkiLCJkZWxheUFkUmVxdWVzdEVuYWJsZWQiLCJyZW5kZXJPdXRzaWRlVmlld3BvcnQiLCJjb25zZW50UG9saWN5SWQiLCJjb25zZW50U3RhdGVQcm9taXNlIiwiY2F0Y2giLCJlcnJvciIsIlVOS05PV04iLCJjb25zZW50U3RyaW5nUHJvbWlzZSIsImNvbnNlbnRNZXRhZGF0YVByb21pc2UiLCJhbGwiLCJjb25zZW50UmVzcG9uc2UiLCJjb25zZW50U3RhdGUiLCJjb25zZW50U3RyaW5nIiwiY29uc2VudE1ldGFkYXRhIiwiZ2RwckFwcGxpZXMiLCJhZGRpdGlvbmFsQ29uc2VudCIsImNvbnNlbnRTdHJpbmdUeXBlIiwiZ2V0U2VydmVOcGFTaWduYWwiLCJucGFTaWduYWwiLCJnZXRBZFVybCIsInRyeUV4ZWN1dGVSZWFsVGltZUNvbmZpZ18iLCJhZFVybCIsImlzWGhyQWxsb3dlZCIsInJlamVjdCIsInNlbmRYaHJSZXF1ZXN0IiwiZmV0Y2hSZXNwb25zZSIsIm1heWJlVHJpZ2dlckFuYWx5dGljc0V2ZW50XyIsImFycmF5QnVmZmVyIiwiaGVhZGVycyIsImhhcyIsImZvcmNlQ29sbGFwc2UiLCJwb3B1bGF0ZVBvc3RBZFJlc3BvbnNlRXhwZXJpbWVudEZlYXR1cmVzXyIsImdldCIsImxvY2F0aW9uIiwic2VhcmNoIiwibWF0Y2giLCJleGVjIiwibWV0aG9kIiwicHJlbG9hZCIsInNhZmVmcmFtZVZlcnNpb25IZWFkZXIiLCJnZXRTYWZlZnJhbWVQYXRoIiwiaXNJbk5vU2lnbmluZ0V4cCIsInN0cmVhbVJlc3BvbnNlXyIsInN0YXJ0VmFsaWRhdGlvbkZsb3dfIiwibWVzc2FnZSIsIm1pbmlmaWVkQ3JlYXRpdmUiLCJjdXN0b21FbGVtZW50RXh0ZW5zaW9ucyIsImN1c3RvbVN0eWxlc2hlZXRzIiwicHJvbWlzZUVycm9ySGFuZGxlcl8iLCJ1bnVzZWRIZWFkZXJzIiwiaHR0cFJlc3BvbnNlIiwic3RhdHVzIiwic2l6ZSIsImV4dHJhY3RTaXplIiwiaXNQbGF0Zm9ybVN1cHBvcnRlZCIsInNraXBDbGllbnRTaWRlVmFsaWRhdGlvbiIsImhhbmRsZUZhbGxiYWNrXyIsImZhbGxiYWNrSHR0cFJlc3BvbnNlIiwiY2xvbmUiLCJ0cmFuc2Zvcm1TdHJlYW0iLCJkZXRhY2hlZFN0cmVhbSIsImNodW5rIiwib25DaHVuayIsImRvYyIsIm9uRW5kIiwidHJhbnNmZXJCb2R5IiwicmVzcG9uc2VCb2R5SGFzQ29udGVudCIsIndhaXRGb3JIZWFkIiwiaGVhZCIsInZhbGlkYXRlSGVhZEVsZW1lbnRfIiwic2FuaXRpemVkSGVhZEVsZW1lbnQiLCJ1cGRhdGVMYXlvdXRQcmlvcml0eSIsIkNPTlRFTlQiLCJkb21UZXh0Q29udGVudCIsImhlYWRFbGVtZW50IiwiYnl0ZXMiLCJieXRlTGVuZ3RoIiwicmVzcG9uc2VQYXJ0cyIsIm1heWJlVmFsaWRhdGVBbXBDcmVhdGl2ZSIsImNyZWF0aXZlIiwiY3JlYXRpdmVEZWNvZGVkIiwiY3JlYXRpdmVNZXRhRGF0YURlZiIsImdldEFtcEFkTWV0YWRhdGEiLCJleHRlbnNpb25zIiwiZm9udCIsImhyZWYiLCJ1cmxzIiwidXJsRm9yRG9jIiwiaW1hZ2VzIiwiaW1hZ2UiLCJpc1NlY3VyZSIsIk9LIiwidmVyaWZ5IiwicmVzdWx0IiwiQ1JZUFRPX1VOQVZBSUxBQkxFIiwic2hvdWxkUHJlZmVyZW50aWFsUmVuZGVyV2l0aG91dENyeXB0byIsIkVSUk9SX0tFWV9OT1RfRk9VTkQiLCJFUlJPUl9TSUdOQVRVUkVfTUlTTUFUQ0giLCJVTlZFUklGSUVEIiwiRXJyb3IiLCJpbnB1dCIsInNwbGl0IiwibGluZSIsInBhcnRzIiwibGVuZ3RoIiwicmVmcmVzaEVuZENhbGxiYWNrIiwidGVhckRvd25TbG90IiwicHJvbWlzZUlkIiwibXV0YXRlRWxlbWVudCIsInRvZ2dsZVBsYWNlaG9sZGVyIiwidGltZXJGb3IiLCJwcm9taXNlIiwibGF5b3V0Q2FuY2VsZWQiLCJ3aGVuTmV4dFZpc2libGUiLCJvd25lcnNGb3JEb2MiLCJyZXF1aXJlTGF5b3V0Iiwib3B0X2lnbm9yZVN0YWNrIiwiaWdub3JlU3RhY2siLCJ0eXBlIiwiaW5kZXhPZiIsImFzc2lnbkFkVXJsVG9FcnJvciIsImRldmVsb3BtZW50IiwibG9nIiwicmFuZG9tIiwiZXhwZWN0ZWRFcnJvciIsImRlc3Ryb3lGcmFtZSIsImF0dGVtcHRUb1JlbmRlckNyZWF0aXZlIiwiZ2V0U2Nyb2xsUHJvbWlzZUZvclN0aWNreUFkIiwidmFsdWVzIiwibWF5YmVJbml0U3RpY2t5QWQiLCJjcmVhdGl2ZU1ldGFEYXRhIiwicmVuZGVyTm9uQW1wQ3JlYXRpdmUiLCJmcmllbmRseVJlbmRlclByb21pc2UiLCJyZW5kZXJGcmllbmRseVRydXN0bGVzc18iLCJyZW5kZXJBbXBDcmVhdGl2ZV8iLCJuZXdIZWlnaHQiLCJuZXdXaWR0aCIsImdldExheW91dFNpemUiLCJhcHBseVVubGF5b3V0VUkiLCJmb3JjZSIsImRlc3Ryb3kiLCJwYXJlbnRFbGVtZW50IiwicmVtb3ZlQ2hpbGQiLCJmcmVlWE9yaWdpbklmcmFtZSIsImNsZWFudXAiLCJpblZpZXdwb3J0Iiwidmlld3BvcnRDYWxsYmFjayIsIm9wdF91bnVuc2VkQ29uc2VudFR1cGxlIiwib3B0X3J0Y1Jlc3BvbnNlc1Byb21pc2UiLCJvcHRfc2VydmVOcGFTaWduYWwiLCJnZW9Gb3JEb2NPck51bGwiLCJnZW9TZXJ2aWNlIiwiYmxvY2tSdGNMb2NhdGlvbnMiLCJsb2NhdGlvbnMiLCJpIiwiZ2VvR3JvdXAiLCJpc0luQ291bnRyeUdyb3VwIiwiSU4iLCJOT1RfREVGSU5FRCIsInJlc3BvbnNlSGVhZGVycyIsImhlYWRlclZhbHVlIiwiTnVtYmVyIiwiYXBwbHlOb0NvbnRlbnRVSSIsIm9wdF9vbkxvYWRQcm9taXNlIiwieGhySW5pdCIsIm1vZGUiLCJjcmVkZW50aWFscyIsInhockZvciIsImZldGNoIiwicmVzcG9uc2UiLCJuZXR3b3JrRmFpbHVyZUhhbmRsZXJSZXN1bHQiLCJvbk5ldHdvcmtGYWlsdXJlIiwiZnJhbWVHZXREaXNhYmxlZCIsInJlc2V0QWRVcmwiLCJ1bnVzZWRFcnJvciIsInVudXNlZEFkVXJsIiwidGhyb3R0bGVBcHBsaWVkIiwicmVuZGVyUHJvbWlzZSIsInJlbmRlclZpYU5hbWVBdHRyT2ZYT3JpZ2luSWZyYW1lXyIsInJlbmRlclZpYUlmcmFtZUdldF8iLCJoZWFkRGF0YSIsIm93bmVyRG9jdW1lbnQiLCJmb250cyIsImdldElmcmFtZVRpdGxlIiwiYm9keSIsInRyYW5zZmVyQ29tcGxldGUiLCJvdXRlckhUTUwiLCJmaWVCb2R5IiwiY29udGVudERvY3VtZW50Iiwic2VjdXJlRG9jIiwiZmllSW5zdGFsbFByb21pc2UiLCJpbnN0YWxsRnJpZW5kbHlJZnJhbWVFbWJlZF8iLCJmcmllbmRseUlmcmFtZUVtYmVkIiwicmVuZGVyQ29tcGxldGVkIiwiZXh0ZW5zaW9uSWRzIiwibWFwIiwiZXh0ZW5zaW9uIiwiZXh0ZW5zaW9uSWQiLCJtYWtlRmllVmlzaWJsZV8iLCJmb250c0FycmF5IiwicyIsInB1c2giLCJodG1sIiwic2tpcEh0bWxNZXJnZSIsImhvc3QiLCJlbWJlZFdpbiIsImFtcGRvYyIsInByZWluc3RhbGxDYWxsYmFja18iLCJwYXJlbnRBbXBkb2MiLCJmcmFtZUJvZHkiLCJnZXRGaWVCb2R5XyIsIm9uQ3JlYXRpdmVSZW5kZXIiLCJ3aGVuV2luZG93TG9hZGVkIiwid2hlbkluaUxvYWRlZCIsImZyYW1lRG9jIiwiZG9jdW1lbnQiLCJhdHRyaWJ1dGVzIiwibWVyZ2VkQXR0cmlidXRlcyIsIk9iamVjdCIsImFzc2lnbiIsImZlYXR1cmVQb2xpY2llcyIsInNhbmRib3hIVE1MQ3JlYXRpdmVGcmFtZSIsImZyYW1lTG9hZFByb21pc2UiLCJpbml0IiwibGV0Q3JlYXRpdmVUcmlnZ2VyUmVuZGVyU3RhcnQiLCJjb250ZXh0TWV0YWRhdGEiLCJpbnRlcnNlY3Rpb24iLCJpZnJhbWVSZW5kZXJIZWxwZXJfIiwiZ2V0Q29yc1VybCIsIkpTT04iLCJzdHJpbmdpZnkiLCJjcmVhdGl2ZUJvZHkiLCJzcmNQYXRoIiwibmFtZSIsImdldEFkZGl0aW9uYWxDb250ZXh0TWV0YWRhdGEiLCJtZXRhZGF0YVN0YXJ0IiwibWV0YWRhdGFTdHJpbmciLCJsYXN0SW5kZXhPZiIsIm1ldGFkYXRhRW5kIiwibWV0YURhdGFPYmoiLCJzbGljZSIsImFtcFJ1bnRpbWVVdGYxNkNoYXJPZmZzZXRzIiwibWV0YURhdGEiLCJlcnJvck1zZyIsInN0eWxlc2hlZXQiLCJzcGxpY2UiLCJzZXRBdHRyaWJ1dGUiLCJsaWZlY3ljbGVTdGFnZSIsImFuYWx5dGljc0V2ZW50IiwiYW5hbHl0aWNzVmFycyIsImdldEE0YUFuYWx5dGljc1ZhcnMiLCJ1bnVzZWRBbmFseXRpY3NFdmVudCIsImdldEJsb2NrUnRjXyIsInNob3VsZEJsb2NrIiwicmVhbFRpbWVDb25maWdGb3JEb2MiLCJyZWFsVGltZUNvbmZpZyIsIm1heWJlRXhlY3V0ZVJlYWxUaW1lQ29uZmlnIiwiZ2V0Q3VzdG9tUmVhbFRpbWVDb25maWdNYWNyb3NfIiwicGxhdGZvcm1Gb3IiLCJpc0lvcyIsIm9wdF9pc1NhZmVmcmFtZSIsImV4cHMiLCJtZXRhIiwiZ2V0TWV0YUJ5TmFtZSIsImtleVZhbHVlcyIsImt2IiwidmFsIiwiaXNOYU4iLCJwYWRkZWQiLCJCYXNlRWxlbWVudCIsImFyZ3MiLCJhZFF1ZXJ5SWR4Iiwic3Vic3RyaW5nIiwicHJvcGVydHlOYW1lIiwiaXNOYXRpdmUiLCJFbGVtZW50IiwicHJvdG90eXBlIiwiYXR0YWNoU2hhZG93IiwiZnVuYyIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxT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RTtBQUNBLFdBQU8sS0FBUDtBQUNEOztBQUNELFNBQU8sSUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTNlcsUUFBVCxDQUFrQkksSUFBbEIsRUFBd0I7QUFDdEIsU0FBTyxDQUFDLENBQUNBLElBQUYsSUFBVUEsSUFBSSxDQUFDQyxRQUFMLEdBQWdCaEssT0FBaEIsQ0FBd0IsZUFBeEIsS0FBNEMsQ0FBQyxDQUE5RDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7QTRBVmFyaWFibGVTb3VyY2V9IGZyb20gJy4vYTRhLXZhcmlhYmxlLXNvdXJjZSc7XG5pbXBvcnQge0FEU19JTklUSUFMX0lOVEVSU0VDVElPTl9FWFB9IGZyb20gJyNleHBlcmltZW50cy9hZHMtaW5pdGlhbC1pbnRlcnNlY3Rpb24tZXhwJztcbmltcG9ydCB7Q09OU0VOVF9QT0xJQ1lfU1RBVEV9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9jb25zZW50LXN0YXRlJztcbmltcG9ydCB7RGVmZXJyZWQsIHRyeVJlc29sdmV9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7RGV0YWNoZWREb21TdHJlYW0sIHN0cmVhbVJlc3BvbnNlVG9Xcml0ZXJ9IGZyb20gJyNjb3JlL2RvbS9zdHJlYW0nO1xuaW1wb3J0IHtEb21UcmFuc2Zvcm1TdHJlYW19IGZyb20gJy4uLy4uLy4uL3NyYy91dGlscy9kb20tdHJhbmZvcm0tc3RyZWFtJztcbmltcG9ydCB7R0VPX0lOX0dST1VQfSBmcm9tICcuLi8uLi9hbXAtZ2VvLzAuMS9hbXAtZ2VvLWluLWdyb3VwJztcbmltcG9ydCB7XG4gIExheW91dCxcbiAgTGF5b3V0UHJpb3JpdHksXG4gIGFwcGx5RmlsbENvbnRlbnQsXG4gIGlzTGF5b3V0U2l6ZURlZmluZWQsXG59IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtTaWduYXR1cmVWZXJpZmllciwgVmVyaWZpY2F0aW9uU3RhdHVzfSBmcm9tICcuL3NpZ25hdHVyZS12ZXJpZmllcic7XG5pbXBvcnQge1xuICBhcHBseVNhbmRib3gsXG4gIGdlbmVyYXRlU2VudGluZWwsXG4gIGdldERlZmF1bHRCb290c3RyYXBCYXNlVXJsLFxufSBmcm9tICcuLi8uLi8uLi9zcmMvM3AtZnJhbWUnO1xuaW1wb3J0IHthc3NlcnRIdHRwc1VybH0gZnJvbSAnLi4vLi4vLi4vc3JjL3VybCc7XG5pbXBvcnQge2NhbmNlbGxhdGlvbiwgaXNDYW5jZWxsYXRpb259IGZyb20gJy4uLy4uLy4uL3NyYy9lcnJvci1yZXBvcnRpbmcnO1xuaW1wb3J0IHtjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXN9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge1xuICBjcmVhdGVTZWN1cmVEb2NTa2VsZXRvbixcbiAgY3JlYXRlU2VjdXJlRnJhbWUsXG4gIGlzQXR0cmlidXRpb25SZXBvcnRpbmdTdXBwb3J0ZWQsXG59IGZyb20gJy4vc2VjdXJlLWZyYW1lJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtkdXBsaWNhdGVFcnJvcklmTmVjZXNzYXJ5fSBmcm9tICcjY29yZS9lcnJvcic7XG5pbXBvcnQge1xuICBnZXRBbXBBZFJlbmRlck91dHNpZGVWaWV3cG9ydCxcbiAgaW5jcmVtZW50TG9hZGluZ0FkcyxcbiAgaXMzcFRocm90dGxlZCxcbn0gZnJvbSAnLi4vLi4vYW1wLWFkLzAuMS9jb25jdXJyZW50LWxvYWQnO1xuaW1wb3J0IHtcbiAgZ2V0Q29uc2VudE1ldGFkYXRhLFxuICBnZXRDb25zZW50UG9saWN5SW5mbyxcbiAgZ2V0Q29uc2VudFBvbGljeVN0YXRlLFxufSBmcm9tICcuLi8uLi8uLi9zcmMvY29uc2VudCc7XG5pbXBvcnQge2dldENvbnRleHRNZXRhZGF0YX0gZnJvbSAnLi4vLi4vLi4vc3JjL2lmcmFtZS1hdHRyaWJ1dGVzJztcbmltcG9ydCB7Z2V0RXhwZXJpbWVudEJyYW5jaCwgaXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cyc7XG5pbXBvcnQge2dldEV4dGVuc2lvbnNGcm9tTWV0YWRhdGF9IGZyb20gJy4vYW1wLWFkLXV0aWxzJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtpbnNlcnRBbmFseXRpY3NFbGVtZW50fSBmcm9tICcuLi8uLi8uLi9zcmMvZXh0ZW5zaW9uLWFuYWx5dGljcyc7XG5pbXBvcnQge1xuICBpbnN0YWxsRnJpZW5kbHlJZnJhbWVFbWJlZCxcbiAgaXNTcmNkb2NTdXBwb3J0ZWQsXG4gIHByZWxvYWRGcmllbmRseUlmcmFtZUVtYmVkRXh0ZW5zaW9ucyxcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL2ZyaWVuZGx5LWlmcmFtZS1lbWJlZCc7XG5pbXBvcnQge2luc3RhbGxSZWFsVGltZUNvbmZpZ1NlcnZpY2VGb3JEb2N9IGZyb20gJyNzZXJ2aWNlL3JlYWwtdGltZS1jb25maWcvcmVhbC10aW1lLWNvbmZpZy1pbXBsJztcbmltcG9ydCB7aW5zdGFsbFVybFJlcGxhY2VtZW50c0ZvckVtYmVkfSBmcm9tICcjc2VydmljZS91cmwtcmVwbGFjZW1lbnRzLWltcGwnO1xuaW1wb3J0IHtcbiAgaW50ZXJzZWN0aW9uRW50cnlUb0pzb24sXG4gIG1lYXN1cmVJbnRlcnNlY3Rpb24sXG59IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvaW50ZXJzZWN0aW9uJztcbmltcG9ydCB7aXNBZFBvc2l0aW9uQWxsb3dlZH0gZnJvbSAnLi4vLi4vLi4vc3JjL2FkLWhlbHBlcic7XG5pbXBvcnQge2lzQXJyYXksIGlzRW51bVZhbHVlLCBpc09iamVjdH0gZnJvbSAnI2NvcmUvdHlwZXMnO1xuaW1wb3J0IHt0cnlEZWNvZGVVcmlDb21wb25lbnR9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZy91cmwnO1xuXG5pbXBvcnQge2xpc3Rlbk9uY2V9IGZyb20gJy4uLy4uLy4uL3NyYy9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtcbiAgb2JzZXJ2ZVdpdGhTaGFyZWRJbk9iLFxuICB1bm9ic2VydmVXaXRoU2hhcmVkSW5PYixcbn0gZnJvbSAnI2NvcmUvZG9tL2xheW91dC92aWV3cG9ydC1vYnNlcnZlcic7XG5pbXBvcnQge3BhZFN0YXJ0fSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcnO1xuaW1wb3J0IHtwYXJzZUpzb259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdC9qc29uJztcbmltcG9ydCB7cHJvY2Vzc0hlYWR9IGZyb20gJy4vaGVhZC12YWxpZGF0aW9uJztcbmltcG9ydCB7c2V0U3R5bGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge3NpZ25pbmdTZXJ2ZXJVUkxzfSBmcm9tICcjYWRzL19hNGEtY29uZmlnJztcblxuaW1wb3J0IHt0cmlnZ2VyQW5hbHl0aWNzRXZlbnR9IGZyb20gJy4uLy4uLy4uL3NyYy9hbmFseXRpY3MnO1xuaW1wb3J0IHt1dGY4RGVjb2RlfSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcvYnl0ZXMnO1xuaW1wb3J0IHt3aGVuV2l0aGluVmlld3BvcnR9IGZyb20gJy4vd2l0aGluLXZpZXdwb3J0JztcblxuLyoqIEB0eXBlIHtBcnJheTxzdHJpbmc+fSAqL1xuY29uc3QgTUVUQURBVEFfU1RSSU5HUyA9IFtcbiAgJzxzY3JpcHQgYW1wLWFkLW1ldGFkYXRhIHR5cGU9YXBwbGljYXRpb24vanNvbj4nLFxuICAnPHNjcmlwdCB0eXBlPVwiYXBwbGljYXRpb24vanNvblwiIGFtcC1hZC1tZXRhZGF0YT4nLFxuICAnPHNjcmlwdCB0eXBlPWFwcGxpY2F0aW9uL2pzb24gYW1wLWFkLW1ldGFkYXRhPicsXG5dO1xuXG4vLyBUT0RPKHRkcmwpOiBUZW1wb3JhcnksIHdoaWxlIHdlJ3JlIHZlcmlmeWluZyB3aGV0aGVyIFNhZmVGcmFtZSBpcyBhblxuLy8gYWNjZXB0YWJsZSBzb2x1dGlvbiB0byB0aGUgJ1NhZmFyaSBvbiBpT1MgZG9lc24ndCBmZXRjaCBpZnJhbWUgc3JjIGZyb21cbi8vIGNhY2hlJyBpc3N1ZS4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2lzc3Vlcy81NjE0XG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NBRkVGUkFNRV9WRVJTSU9OID0gJzEtMC0zNyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmV4cG9ydCBjb25zdCBDUkVBVElWRV9TSVpFX0hFQURFUiA9ICdYLUNyZWF0aXZlU2l6ZSc7XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbmV4cG9ydCBjb25zdCBSRU5ERVJJTkdfVFlQRV9IRUFERVIgPSAnWC1BbXBBZFJlbmRlcic7XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbmV4cG9ydCBjb25zdCBTQUZFRlJBTUVfVkVSU0lPTl9IRUFERVIgPSAnWC1BbXBTYWZlRnJhbWVWZXJzaW9uJztcblxuLyoqIEB0eXBlIHtzdHJpbmd9IEB2aXNpYmxlRm9yVGVzdGluZyAqL1xuZXhwb3J0IGNvbnN0IEVYUEVSSU1FTlRfRkVBVFVSRV9IRUFERVJfTkFNRSA9ICdhbXAtZmYtZXhwcyc7XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1hNGEnO1xuXG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmV4cG9ydCBjb25zdCBOT19DT05URU5UX1JFU1BPTlNFID0gJ05PLUNPTlRFTlQtUkVTUE9OU0UnO1xuXG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmV4cG9ydCBjb25zdCBORVRXT1JLX0ZBSUxVUkUgPSAnTkVUV09SSy1GQUlMVVJFJztcblxuLyoqIEB0eXBlIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgSU5WQUxJRF9TUFNBX1JFU1BPTlNFID0gJ0lOVkFMSUQtU1BTQS1SRVNQT05TRSc7XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IElGUkFNRV9HRVQgPSAnSUZSQU1FLUdFVCc7XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IFhPUklHSU5fTU9ERSA9IHtcbiAgQ0xJRU5UX0NBQ0hFOiAnY2xpZW50X2NhY2hlJyxcbiAgU0FGRUZSQU1FOiAnc2FmZWZyYW1lJyxcbiAgTkFNRUZSQU1FOiAnbmFtZWZyYW1lJyxcbiAgSUZSQU1FX0dFVDogJ2lmcmFtZV9nZXQnLFxufTtcblxuLyoqIEB0eXBlIHshT2JqZWN0fSBAcHJpdmF0ZSAqL1xuY29uc3QgU0hBUkVEX0lGUkFNRV9QUk9QRVJUSUVTID0gZGljdCh7XG4gICdmcmFtZWJvcmRlcic6ICcwJyxcbiAgJ2FsbG93ZnVsbHNjcmVlbic6ICcnLFxuICAnYWxsb3d0cmFuc3BhcmVuY3knOiAnJyxcbiAgJ3Njcm9sbGluZyc6ICdubycsXG4gICdtYXJnaW53aWR0aCc6ICcwJyxcbiAgJ21hcmdpbmhlaWdodCc6ICcwJyxcbn0pO1xuXG4vKiogQHR5cGVkZWYge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19ICovXG5leHBvcnQgbGV0IFNpemVJbmZvRGVmO1xuXG4vKiogQHR5cGVkZWYge3tcbiAgICAgIG1pbmlmaWVkQ3JlYXRpdmU6IHN0cmluZyxcbiAgICAgIGN1c3RvbUVsZW1lbnRFeHRlbnNpb25zOiAhQXJyYXk8c3RyaW5nPixcbiAgICAgIGN1c3RvbVN0eWxlc2hlZXRzOiAhQXJyYXk8e2hyZWY6IHN0cmluZ30+LFxuICAgICAgaW1hZ2VzOiAoQXJyYXk8c3RyaW5nPnx1bmRlZmluZWQpLFxuICAgICAgY3RhVHlwZTogKHN0cmluZ3x1bmRlZmluZWQpLFxuICAgICAgY3RhVXJsOiAoc3RyaW5nfHVuZGVmaW5lZCksXG4gICAgfX0gKi9cbmV4cG9ydCBsZXQgQ3JlYXRpdmVNZXRhRGF0YURlZjtcblxuLyoqIEB0eXBlZGVmIHt7XG4gICAgICBjb25zZW50U3RhdGU6ICg/Q09OU0VOVF9QT0xJQ1lfU1RBVEV8dW5kZWZpbmVkKSxcbiAgICAgIGNvbnNlbnRTdHJpbmc6ICg/c3RyaW5nfHVuZGVmaW5lZCksXG4gICAgICBjb25zZW50U3RyaW5nVHlwZTogKD9DT05TRU5UX1NUUklOR19UWVBFfGJvb2xlYW4pLFxuICAgICAgZ2RwckFwcGxpZXM6ICg/Ym9vbGVhbnx1bmRlZmluZWQpLFxuICAgICAgYWRkaXRpb25hbENvbnNlbnQ6ICg/c3RyaW5nfHVuZGVmaW5lZCksXG4gICAgfX0gKi9cbmV4cG9ydCBsZXQgQ29uc2VudFR1cGxlRGVmO1xuXG4vKipcbiAqIE5hbWUgb2YgQTRBIGxpZmVjeWNsZSB0cmlnZ2Vycy5cbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBBbmFseXRpY3NUcmlnZ2VyID0ge1xuICBBRF9SRVFVRVNUX1NUQVJUOiAnYWQtcmVxdWVzdC1zdGFydCcsXG4gIEFEX1JFU1BPTlNFX0VORDogJ2FkLXJlc3BvbnNlLWVuZCcsXG4gIEFEX1JFTkRFUl9TVEFSVDogJ2FkLXJlbmRlci1zdGFydCcsXG4gIEFEX1JFTkRFUl9FTkQ6ICdhZC1yZW5kZXItZW5kJyxcbiAgQURfSUZSQU1FX0xPQURFRDogJ2FkLWlmcmFtZS1sb2FkZWQnLFxuICAvLyBUaGlzIHRyaWdnZXIgaXMgbm90IHBhcnQgb2YgdGhlIG5vcm1hbCBhZHMgbGlmZWN5Y2xlIGFuZCBvbmx5IGZpcmVzIHdoZW4gYW5cbiAgLy8gYWQgaXMgcmVmcmVzaGVkLlxuICBBRF9SRUZSRVNIOiAnYWQtcmVmcmVzaCcsXG59O1xuXG4vKipcbiAqIE1hcHMgdGhlIG5hbWVzIG9mIGxpZmVjeWNsZSBldmVudHMgdG8gYW5hbHl0aWNzIHRyaWdnZXJzLlxuICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgIUFuYWx5dGljc1RyaWdnZXI+fVxuICovXG5jb25zdCBMSUZFQ1lDTEVfU1RBR0VfVE9fQU5BTFlUSUNTX1RSSUdHRVIgPSB7XG4gICdhZFJlcXVlc3RTdGFydCc6IEFuYWx5dGljc1RyaWdnZXIuQURfUkVRVUVTVF9TVEFSVCxcbiAgJ2FkUmVxdWVzdEVuZCc6IEFuYWx5dGljc1RyaWdnZXIuQURfUkVTUE9OU0VfRU5ELFxuICAncmVuZGVyRnJpZW5kbHlTdGFydCc6IEFuYWx5dGljc1RyaWdnZXIuQURfUkVOREVSX1NUQVJULFxuICAncmVuZGVyQ3Jvc3NEb21haW5TdGFydCc6IEFuYWx5dGljc1RyaWdnZXIuQURfUkVOREVSX1NUQVJULFxuICAncmVuZGVyU2FmZUZyYW1lU3RhcnQnOiBBbmFseXRpY3NUcmlnZ2VyLkFEX1JFTkRFUl9TVEFSVCxcbiAgJ3JlbmRlckZyaWVuZGx5RW5kJzogQW5hbHl0aWNzVHJpZ2dlci5BRF9SRU5ERVJfRU5ELFxuICAncmVuZGVyQ3Jvc3NEb21haW5FbmQnOiBBbmFseXRpY3NUcmlnZ2VyLkFEX1JFTkRFUl9FTkQsXG4gICdmcmllbmRseUlmcmFtZUluaUxvYWQnOiBBbmFseXRpY3NUcmlnZ2VyLkFEX0lGUkFNRV9MT0FERUQsXG4gICdjcm9zc0RvbWFpbklmcmFtZUxvYWRlZCc6IEFuYWx5dGljc1RyaWdnZXIuQURfSUZSQU1FX0xPQURFRCxcbn07XG5cbi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbiB0aGF0IGVuc3VyZXMgYW55IGVycm9yIHRocm93biBpcyBoYW5kbGVkIGJ5IG9wdGlvbmFsXG4gKiBvbkVycm9yIGhhbmRsZXIgKGlmIG5vbmUgcHJvdmlkZWQgb3IgaGFuZGxlciB0aHJvd3MsIGVycm9yIGlzIHN3YWxsb3dlZCBhbmRcbiAqIHVuZGVmaW5lZCBpcyByZXR1cm5lZCkuXG4gKiBAcGFyYW0geyFGdW5jdGlvbn0gZm4gdG8gcHJvdGVjdFxuICogQHBhcmFtIHtUPX0gaW5UaGlzIEFuIG9wdGlvbmFsIG9iamVjdCB0byB1c2UgYXMgdGhlICd0aGlzJyBvYmplY3RcbiAqICAgIHdoZW4gY2FsbGluZyB0aGUgZnVuY3Rpb24uICBJZiBub3QgcHJvdmlkZWQsIHVuZGVmaW5lZCBpcyBib3VuZCBhcyB0aGlzXG4gKiAgICB3aGVuIGNhbGxpbmcgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKHRoaXM6VCwgIUVycm9yLCAuLi4qKTo/PX0gb25FcnJvciBmdW5jdGlvbiBnaXZlbiBlcnJvclxuICogICAgYW5kIGFyZ3VtZW50cyBwcm92aWRlZCB0byBmdW5jdGlvbiBjYWxsLlxuICogQHJldHVybiB7IUZ1bmN0aW9ufSBwcm90ZWN0ZWQgZnVuY3Rpb25cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3RlY3RGdW5jdGlvbldyYXBwZXIoXG4gIGZuLFxuICBpblRoaXMgPSB1bmRlZmluZWQsXG4gIG9uRXJyb3IgPSB1bmRlZmluZWRcbikge1xuICByZXR1cm4gKC4uLmZuQXJncykgPT4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkoaW5UaGlzLCBmbkFyZ3MpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKG9uRXJyb3IpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBJZGVhbGx5IHdlIGNvdWxkIHVzZSBbZXJyLCAuLi52YXJfYXJnc10gYnV0IGxpbnRlciBkaXNhbGxvd3NcbiAgICAgICAgICAvLyBzcHJlYWQgc28gaW5zdGVhZCB1c2luZyB1bnNoaWZ0IDooXG4gICAgICAgICAgZm5BcmdzLnVuc2hpZnQoZXJyKTtcbiAgICAgICAgICByZXR1cm4gb25FcnJvci5hcHBseShpblRoaXMsIGZuQXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGNhcHR1cmVFcnIpIHtcbiAgICAgICAgICAvLyBzd2FsbG93IGVycm9yIGlmIGVycm9yIGhhbmRsZXIgdGhyb3dzLlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBJbiB0aGUgZXZlbnQgb2Ygbm8gb3B0aW9uYWwgb24gZXJyb3IgZnVuY3Rpb24gb3IgaXRzIGV4ZWN1dGlvbiB0aHJvd3MsXG4gICAgICAvLyByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH07XG59XG5cbi8qKiBBYnN0cmFjdCBjbGFzcyBmb3IgQU1QIEFkIEZhc3QgRmV0Y2ggZW5hYmxlZCBuZXR3b3JrcyAqL1xuZXhwb3J0IGNsYXNzIEFtcEE0QSBleHRlbmRzIEFNUC5CYXNlRWxlbWVudCB7XG4gIC8vIFRPRE86IEFkZCBtb3JlIGVycm9yIGhhbmRsaW5nIHRocm91Z2hvdXQgY29kZS5cbiAgLy8gVE9ETzogSGFuZGxlIGNyZWF0aXZlcyB0aGF0IGRvIG5vdCBmaWxsLlxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG4gICAgZGV2QXNzZXJ0KEFNUC5BbXBBZFVJSGFuZGxlcik7XG4gICAgZGV2QXNzZXJ0KEFNUC5BbXBBZFhPcmlnaW5JZnJhbWVIYW5kbGVyKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1Byb21pc2U8dW5kZWZpbmVkPn0gKi9cbiAgICB0aGlzLmtleXNldFByb21pc2VfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEluIG5vIHNpZ25pbmcgZXhwZXJpbWVudCBtZXRhZGF0YSB3aWxsIGJlIGRhdGEgZnJvbSBoZWFkIHZhbGlkYXRpb24uXG4gICAgICogQHByaXZhdGUgez9Qcm9taXNlPD9DcmVhdGl2ZU1ldGFEYXRhRGVmfD8uL2hlYWQtdmFsaWRhdGlvbi5WYWxpZGF0ZWRIZWFkRGVmPn1cbiAgICAgKi9cbiAgICB0aGlzLmFkUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUge251bWJlcn0gdW5pcXVlIElEIG9mIHRoZSBjdXJyZW50bHkgZXhlY3V0aW5nIHByb21pc2UgdG8gYWxsb3dcbiAgICAgKiBmb3IgY2FuY2VsbGF0aW9uLlxuICAgICAqL1xuICAgIHRoaXMucHJvbWlzZUlkXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUgez9zdHJpbmd9ICovXG4gICAgdGhpcy5hZFVybF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li4vLi4vLi4vc3JjL2ZyaWVuZGx5LWlmcmFtZS1lbWJlZC5GcmllbmRseUlmcmFtZUVtYmVkfSAqL1xuICAgIHRoaXMuZnJpZW5kbHlJZnJhbWVFbWJlZF8gPSBudWxsO1xuXG4gICAgLyoqIEB0eXBlIHs/QU1QLkFtcEFkVUlIYW5kbGVyfSAqL1xuICAgIHRoaXMudWlIYW5kbGVyID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0FNUC5BbXBBZFhPcmlnaW5JZnJhbWVIYW5kbGVyfSAqL1xuICAgIHRoaXMueE9yaWdpbklmcmFtZUhhbmRsZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gd2hldGhlciBjcmVhdGl2ZSBoYXMgYmVlbiB2ZXJpZmllZCBhcyBBTVAgKi9cbiAgICB0aGlzLmlzVmVyaWZpZWRBbXBDcmVhdGl2ZV8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0FycmF5QnVmZmVyfSAqL1xuICAgIHRoaXMuY3JlYXRpdmVCb2R5XyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoaXMgd2l0aCB0aGUgc2xvdCB3aWR0aC9oZWlnaHQgYXR0cmlidXRlcywgYW5kIG92ZXJyaWRlXG4gICAgICogbGF0ZXIgd2l0aCB3aGF0IHRoZSBuZXR3b3JrIGltcGxlbWVudGF0aW9uIHJldHVybnMgdmlhIGV4dHJhY3RTaXplLlxuICAgICAqIE5vdGU6IEVpdGhlciB2YWx1ZSBtYXkgYmUgJ2F1dG8nIChpLmUuLCBub24tbnVtZXJpYykuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZSB7Pyh7d2lkdGgsIGhlaWdodH18Li4vLi4vLi4vc3JjL2xheW91dC1yZWN0LkxheW91dFJlY3REZWYpfVxuICAgICAqL1xuICAgIHRoaXMuY3JlYXRpdmVTaXplXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez8uLi8uLi8uLi9zcmMvbGF5b3V0LXJlY3QuTGF5b3V0U2l6ZURlZn0gKi9cbiAgICB0aGlzLm9yaWdpbmFsU2xvdFNpemVfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7UHJvbWlzZTwhSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeT59ICovXG4gICAgdGhpcy5pbml0aWFsSW50ZXJzZWN0aW9uUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogTm90ZShrZWl0aHdyaWdodGJvcykgLSBlbnN1cmUgdGhlIGRlZmF1bHQgaGVyZSBpcyBudWxsIHNvIHRoYXQgaW9zXG4gICAgICogdXNlcyBzYWZlZnJhbWUgd2hlbiByZXNwb25zZSBoZWFkZXIgaXMgbm90IHNwZWNpZmllZC5cbiAgICAgKiBAcHJpdmF0ZSB7P1hPUklHSU5fTU9ERX1cbiAgICAgKi9cbiAgICB0aGlzLmV4cGVyaW1lbnRhbE5vbkFtcENyZWF0aXZlUmVuZGVyTWV0aG9kXyA9XG4gICAgICB0aGlzLmdldE5vbkFtcENyZWF0aXZlUmVuZGVyaW5nTWV0aG9kKCk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGEgbm90aW9uIG9mIGN1cnJlbnQgdGltZSwgaW4gbXMuICBUaGUgdmFsdWUgaXMgbm90IG5lY2Vzc2FyaWx5XG4gICAgICogYWJzb2x1dGUsIHNvIHNob3VsZCBiZSB1c2VkIG9ubHkgZm9yIGNvbXB1dGluZyBkZWx0YXMuICBXaGVuIGF2YWlsYWJsZSxcbiAgICAgKiB0aGUgcGVyZm9ybWFuY2Ugc3lzdGVtIHdpbGwgYmUgdXNlZDsgb3RoZXJ3aXNlIERhdGUubm93KCkgd2lsbCBiZVxuICAgICAqIHJldHVybmVkLlxuICAgICAqXG4gICAgICogQGNvbnN0IHtmdW5jdGlvbigpOm51bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmdldE5vd18gPVxuICAgICAgdGhpcy53aW4ucGVyZm9ybWFuY2UgJiYgdGhpcy53aW4ucGVyZm9ybWFuY2Uubm93XG4gICAgICAgID8gdGhpcy53aW4ucGVyZm9ybWFuY2Uubm93LmJpbmQodGhpcy53aW4ucGVyZm9ybWFuY2UpXG4gICAgICAgIDogRGF0ZS5ub3c7XG5cbiAgICAvKiogQGNvbnN0IHtzdHJpbmd9ICovXG4gICAgdGhpcy5zZW50aW5lbCA9IGdlbmVyYXRlU2VudGluZWwod2luZG93KTtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gaW5kaWNhdGUgd2hldGhlciB0aGlzIHNsb3Qgc2hvdWxkIGJlIGNvbGxhcHNlZCBvciBub3QuIE1hcmtlZFxuICAgICAqIHRydWUgaWYgdGhlIGFkIHJlc3BvbnNlIGhhcyBzdGF0dXMgMjA0LCBpcyBudWxsLCBvciBoYXMgYSBudWxsXG4gICAgICogYXJyYXlCdWZmZXIuXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc0NvbGxhcHNlZF8gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEZyYW1lIGluIHdoaWNoIHRoZSBjcmVhdGl2ZSByZW5kZXJzIChmcmllbmRseSBpZiB2YWxpZGF0ZWQgQU1QLCB4ZG9tYWluXG4gICAgICogb3RoZXJ3aXNlKS5cbiAgICAgKiBAdHlwZSB7P0hUTUxJRnJhbWVFbGVtZW50fVxuICAgICAqL1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcblxuICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAgIHRoaXMuc2FmZWZyYW1lVmVyc2lvbiA9IERFRkFVTFRfU0FGRUZSQU1FX1ZFUlNJT047XG5cbiAgICAvKipcbiAgICAgKiBAcHJvdGVjdGVkIHtib29sZWFufSBJbmRpY2F0ZXMgd2hldGhlciB0aGUgYWQgaXMgY3VycmVudGx5IGluIHRoZVxuICAgICAqICAgIHByb2Nlc3Mgb2YgYmVpbmcgcmVmcmVzaGVkLlxuICAgICAqL1xuICAgIHRoaXMuaXNSZWZyZXNoaW5nID0gZmFsc2U7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzUmVsYXlvdXROZWVkZWRGbGFnID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBNYXBwaW5nIG9mIGZlYXR1cmUgbmFtZSB0byB2YWx1ZSBleHRyYWN0ZWQgZnJvbSBhZCByZXNwb25zZSBoZWFkZXJcbiAgICAgKiBhbXAtZmYtZXhwcyB3aXRoIGNvbW1hIHNlcGFyYXRlZCBwYWlycyBvZiAnPScgc2VwYXJhdGVkIGtleS92YWx1ZS5cbiAgICAgKiBAdHlwZSB7IU9iamVjdDxzdHJpbmcsc3RyaW5nPn1cbiAgICAgKi9cbiAgICB0aGlzLnBvc3RBZFJlc3BvbnNlRXhwZXJpbWVudEZlYXR1cmVzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgYW1wLWFuYWx5dGljcy4gSWYgbnVsbCwgbm8gYW1wLWFuYWx5dGljcyBlbGVtZW50XG4gICAgICogd2lsbCBiZSBpbnNlcnRlZCBhbmQgbm8gYW5hbHl0aWNzIGV2ZW50cyB3aWxsIGJlIGZpcmVkLlxuICAgICAqIFRoaXMgd2lsbCBiZSBpbml0aWFsaXplZCBpbnNpZGUgb2YgYnVpbGRDYWxsYmFjay5cbiAgICAgKiBAcHJpdmF0ZSB7P0pzb25PYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5hNGFBbmFseXRpY3NDb25maWdfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhbXAtYW5hbHl0aWNzIGVsZW1lbnQgdGhhdCBmb3IgdGhpcyBpbXBsJ3MgYW5hbHl0aWNzIGNvbmZpZy4gSXQgd2lsbFxuICAgICAqIGJlIG51bGwgYmVmb3JlIGJ1aWxkQ2FsbGJhY2soKSBleGVjdXRlcyBvciBpZiB0aGUgaW1wbCBkb2VzIG5vdCBwcm92aWRlXG4gICAgICogYW4gYW5hbHl0aWNlIGNvbmZpZy5cbiAgICAgKiBAcHJpdmF0ZSB7P0VsZW1lbnR9XG4gICAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAgICovXG4gICAgdGhpcy5hNGFBbmFseXRpY3NFbGVtZW50XyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBJbmRpY2F0ZXMgdGhhdCB0aGlzIHNsb3QgaXMgYSBzaW5nbGUgcGFnZSBhZCB3aXRoaW4gYW4gQU1QIHN0b3J5LlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuaXNTaW5nbGVQYWdlU3RvcnlBZCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogVHJhbnNmZXJzIGVsZW1lbnRzIGZyb20gdGhlIGRldGFjaGVkIGJvZHkgdG8gdGhlIGdpdmVuIGJvZHkgZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZSB7P2Z1bmN0aW9uKCFFbGVtZW50KX1cbiAgICAgKi9cbiAgICB0aGlzLnRyYW5zZmVyRG9tQm9keV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtmdW5jdGlvbihib29sZWFuKX0gKi9cbiAgICB0aGlzLmJvdW5kVmlld3BvcnRDYWxsYmFja18gPSB0aGlzLnZpZXdwb3J0Q2FsbGJhY2tUZW1wLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldExheW91dFByaW9yaXR5KCkge1xuICAgIC8vIFByaW9yaXR5IHVzZWQgZm9yIHNjaGVkdWxpbmcgcHJlbG9hZCBhbmQgbGF5b3V0IGNhbGxiYWNrLiAgQmVjYXVzZVxuICAgIC8vIEFNUCBjcmVhdGl2ZXMgd2lsbCBiZSBpbmplY3RlZCBhcyBwYXJ0IG9mIHRoZSBwcm9taXNlIGNoYWluIGNyZWF0ZWRcbiAgICAvLyB3aXRoaW4gb25MYXlvdXRNZWFzdXJlLCB0aGlzIGlzIG9ubHkgcmVsZXZhbnQgdG8gbm9uLUFNUCBjcmVhdGl2ZXNcbiAgICAvLyB0aGVyZWZvcmUgd2Ugd2FudCB0aGlzIHRvIG1hdGNoIHRoZSAzcCBwcmlvcml0eS5cbiAgICBjb25zdCBpc1BXQSA9ICF0aGlzLmVsZW1lbnQuZ2V0QW1wRG9jKCkuaXNTaW5nbGVEb2MoKTtcbiAgICAvLyBnaXZlIHRoZSBhZCBoaWdoZXIgcHJpb3JpdHkgaWYgaXQgaXMgaW5zaWRlIGEgUFdBXG4gICAgcmV0dXJuIGlzUFdBID8gTGF5b3V0UHJpb3JpdHkuTUVUQURBVEEgOiBMYXlvdXRQcmlvcml0eS5BRFM7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzTGF5b3V0U3VwcG9ydGVkKGxheW91dCkge1xuICAgIHJldHVybiBpc0xheW91dFNpemVEZWZpbmVkKGxheW91dCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzUmVsYXlvdXROZWVkZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNSZWxheW91dE5lZWRlZEZsYWc7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlXG4gICAgICBAcmV0dXJuIHshUHJvbWlzZXx1bmRlZmluZWR9XG4gICovXG4gIGJ1aWxkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5jcmVhdGl2ZVNpemVfID0ge1xuICAgICAgd2lkdGg6IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyksXG4gICAgICBoZWlnaHQ6IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpLFxuICAgIH07XG4gICAgY29uc3QgdXBncmFkZURlbGF5TXMgPSBNYXRoLnJvdW5kKHRoaXMuZ2V0UmVzb3VyY2UoKS5nZXRVcGdyYWRlRGVsYXlNcygpKTtcbiAgICBkZXYoKS5pbmZvKFxuICAgICAgVEFHLFxuICAgICAgYHVwZ3JhZGVEZWxheSAke3RoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKX06ICR7dXBncmFkZURlbGF5TXN9YFxuICAgICk7XG5cbiAgICB0aGlzLnVpSGFuZGxlciA9IG5ldyBBTVAuQW1wQWRVSUhhbmRsZXIodGhpcyk7XG4gICAgdGhpcy51aUhhbmRsZXIudmFsaWRhdGVTdGlja3lBZCgpO1xuXG4gICAgY29uc3QgdmVyaWZpZXIgPSBzaWduYXR1cmVWZXJpZmllckZvcih0aGlzLndpbik7XG4gICAgdGhpcy5rZXlzZXRQcm9taXNlXyA9IHRoaXMuZ2V0QW1wRG9jKClcbiAgICAgIC53aGVuRmlyc3RWaXNpYmxlKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5nZXRTaWduaW5nU2VydmljZU5hbWVzKCkuZm9yRWFjaCgoc2lnbmluZ1NlcnZpY2VOYW1lKSA9PiB7XG4gICAgICAgICAgdmVyaWZpZXIubG9hZEtleXNldChzaWduaW5nU2VydmljZU5hbWUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5hNGFBbmFseXRpY3NDb25maWdfID0gdGhpcy5nZXRBNGFBbmFseXRpY3NDb25maWcoKTtcbiAgICBpZiAodGhpcy5hNGFBbmFseXRpY3NDb25maWdfKSB7XG4gICAgICAvLyBUT0RPKHdhcnJlbmdtKTogQ29uc2lkZXIgaGF2aW5nIHBhZ2UtbGV2ZWwgc2luZ2xldG9ucyBmb3IgbmV0d29ya3MgdGhhdFxuICAgICAgLy8gdXNlIHRoZSBzYW1lIGNvbmZpZyBmb3IgYWxsIGFkcy5cbiAgICAgIHRoaXMuYTRhQW5hbHl0aWNzRWxlbWVudF8gPSBpbnNlcnRBbmFseXRpY3NFbGVtZW50KFxuICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgIHRoaXMuYTRhQW5hbHl0aWNzQ29uZmlnXyxcbiAgICAgICAgdHJ1ZSAvKiBsb2FkQW5hbHl0aWNzICovXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuaXNTaW5nbGVQYWdlU3RvcnlBZCA9IHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FtcC1zdG9yeScpO1xuXG4gICAgY29uc3QgYXN5bmNJbnRlcnNlY3Rpb24gPVxuICAgICAgZ2V0RXhwZXJpbWVudEJyYW5jaCh0aGlzLndpbiwgQURTX0lOSVRJQUxfSU5URVJTRUNUSU9OX0VYUC5pZCkgPT09XG4gICAgICBBRFNfSU5JVElBTF9JTlRFUlNFQ1RJT05fRVhQLmV4cGVyaW1lbnQ7XG4gICAgdGhpcy5pbml0aWFsSW50ZXJzZWN0aW9uUHJvbWlzZV8gPSBhc3luY0ludGVyc2VjdGlvblxuICAgICAgPyBtZWFzdXJlSW50ZXJzZWN0aW9uKHRoaXMuZWxlbWVudClcbiAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuZWxlbWVudC5nZXRJbnRlcnNlY3Rpb25DaGFuZ2VFbnRyeSgpKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVuZGVyT3V0c2lkZVZpZXdwb3J0KCkge1xuICAgIC8vIEVuc3VyZSBub24tdmVyaWZpZWQgQU1QIGNyZWF0aXZlcyBhcmUgdGhyb3R0bGVkLlxuICAgIGlmIChcbiAgICAgICF0aGlzLmlzVmVyaWZpZWRBbXBDcmVhdGl2ZV8gJiZcbiAgICAgIGlzM3BUaHJvdHRsZWQodGhpcy53aW4pICYmXG4gICAgICAhdGhpcy5pbk5vbkFtcFByZWZlcmVuY2VFeHAoKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2UgdGhlIGFkIGlzIGdvb2QgdG8gZ28uXG4gICAgY29uc3QgZWxlbWVudENoZWNrID0gZ2V0QW1wQWRSZW5kZXJPdXRzaWRlVmlld3BvcnQodGhpcy5lbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudENoZWNrICE9PSBudWxsID8gZWxlbWVudENoZWNrIDogc3VwZXIucmVuZGVyT3V0c2lkZVZpZXdwb3J0KCk7XG4gIH1cblxuICAvKipcbiAgICogVG8gYmUgb3ZlcnJpZGRlbiBieSBuZXR3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGluZGljYXRpbmcgaWYgZWxlbWVudFxuICAgKiAoYW5kIGVudmlyb25tZW50IGdlbmVyYWxseSkgYXJlIHZhbGlkIGZvciBzZW5kaW5nIFhIUiBxdWVyaWVzLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIGVsZW1lbnQgaXMgdmFsaWQgYW5kIGFkIHJlcXVlc3Qgc2hvdWxkIGJlXG4gICAqICAgIHNlbnQuICBJZiBmYWxzZSwgbm8gYWQgcmVxdWVzdCBpcyBzZW50IGFuZCBzbG90IHdpbGwgYmUgY29sbGFwc2VkIGlmXG4gICAqICAgIHBvc3NpYmxlLlxuICAgKi9cbiAgaXNWYWxpZEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3JlYXRpdmVTaXplLCB3aGljaCBpcyB0aGUgc2l6ZSBleHRyYWN0ZWQgZnJvbSB0aGUgYWQgcmVzcG9uc2UuXG4gICAqIEByZXR1cm4gez8oe3dpZHRoLCBoZWlnaHR9fC4uLy4uLy4uL3NyYy9sYXlvdXQtcmVjdC5MYXlvdXRSZWN0RGVmKX1cbiAgICovXG4gIGdldENyZWF0aXZlU2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGl2ZVNpemVfO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW58bnVtYmVyfSB3aGV0aGVyIGFkIHJlcXVlc3Qgc2hvdWxkIGJlIGRlbGF5ZWQgdW50aWxcbiAgICogICAgcmVuZGVyT3V0c2lkZVZpZXdwb3J0IGlzIG1ldCBvciBpZiBudW1iZXIsIHRoZSBhbW91bnQgb2Ygdmlld3BvcnRzLlxuICAgKi9cbiAgZGVsYXlBZFJlcXVlc3RFbmFibGVkKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHByZWNvbm5lY3QgdXJscyBmb3IgQTRBLiBBZCBuZXR3b3JrIHNob3VsZCBvdmVyd3JpdGUgaW4gdGhlaXJcbiAgICogRmFzdCBGZXRjaCBpbXBsZW1lbnRhdGlvbiBhbmQgcmV0dXJuIGFuIGFycmF5IG9mIHVybHMgZm9yIHRoZSBydW50aW1lIHRvXG4gICAqIHByZWNvbm5lY3QgdG8uXG4gICAqIEByZXR1cm4geyFBcnJheTxzdHJpbmc+fVxuICAgKi9cbiAgZ2V0UHJlY29ubmVjdFVybHMoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgcHJlZmV0Y2ggdXJscyBmb3IgQTRBLiBBZCBuZXR3b3JrIHNob3VsZCBvdmVyd3JpdGUgaW4gdGhlaXJcbiAgICogRmFzdCBGZXRjaCBpbXBsZW1lbnRhdGlvbiBhbmQgcmV0dXJuIGFuIGFycmF5IG9mIHVybHMgZm9yIHRoZSBydW50aW1lIHRvXG4gICAqIHByZWZldGNoLlxuICAgKiBAcmV0dXJuIHshQXJyYXk8c3RyaW5nPn1cbiAgICovXG4gIGdldFByZWZldGNoVXJscygpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgZWxlbWVudCB3YXMgbG9hZGVkIGZyb20gYW4gYW1wLWFkIGVsZW1lbnQuICBGb3IgdXNlIGJ5XG4gICAqIG5ldHdvcmstc3BlY2lmaWMgaW1wbGVtZW50YXRpb25zIHRoYXQgZG9uJ3Qgd2FudCB0byBhbGxvdyB0aGVtc2VsdmVzIHRvIGJlXG4gICAqIGVtYmVkZGVkIGRpcmVjdGx5IGludG8gYSBwYWdlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNBbXBBZEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuZWxlbWVudC50YWdOYW1lID09ICdBTVAtQUQnIHx8IHRoaXMuZWxlbWVudC50YWdOYW1lID09ICdBTVAtRU1CRUQnXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVmZXRjaGVzIGFuZCBwcmVjb25uZWN0cyBVUkxzIHJlbGF0ZWQgdG8gdGhlIGFkIHVzaW5nIGFkUHJlY29ubmVjdFxuICAgKiByZWdpc3RyYXRpb24gd2hpY2ggYXNzdW1lcyBhZCByZXF1ZXN0IGRvbWFpbiB1c2VkIGZvciAzcCBpcyBhcHBsaWNhYmxlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnVzZWRPbkxheW91dFxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHByZWNvbm5lY3RDYWxsYmFjayh1bnVzZWRPbkxheW91dCkge1xuICAgIGNvbnN0IHByZWNvbm5lY3QgPSB0aGlzLmdldFByZWNvbm5lY3RVcmxzKCk7XG4gICAgLy8gTk9URShrZWl0aHdyaWdodGJvcyk6IERvZXMgbm90IHRha2UgaXNWYWxpZEVsZW1lbnQgaW50byBhY2NvdW50IHNvIGNvdWxkXG4gICAgLy8gcHJlY29ubmVjdCB1bm5lY2Vzc2FyaWx5LCBob3dldmVyIGl0IGlzIGFzc3VtZWQgdGhhdCBpc1ZhbGlkRWxlbWVudFxuICAgIC8vIG1hdGNoZXMgYW1wLWFkIGxvYWRlciBwcmVkaWNhdGUgc3VjaCB0aGF0IEE0QSBpbXBsIGRvZXMgbm90IGxvYWQuXG4gICAgaWYgKHByZWNvbm5lY3QpIHtcbiAgICAgIHByZWNvbm5lY3QuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICBTZXJ2aWNlcy5wcmVjb25uZWN0Rm9yKHRoaXMud2luKS51cmwoXG4gICAgICAgICAgdGhpcy5nZXRBbXBEb2MoKSxcbiAgICAgICAgICBwLFxuICAgICAgICAgIC8qb3B0X3ByZWxvYWRBcyovIHRydWVcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcGF1c2VDYWxsYmFjaygpIHtcbiAgICBpZiAodGhpcy5mcmllbmRseUlmcmFtZUVtYmVkXykge1xuICAgICAgdGhpcy5mcmllbmRseUlmcmFtZUVtYmVkXy5wYXVzZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVzdW1lQ2FsbGJhY2soKSB7XG4gICAgLy8gRklFIHRoYXQgd2FzIG5vdCBkZXN0cm95ZWQgb24gdW5sYXlvdXRDYWxsYmFjayBkb2VzIG5vdCByZXF1aXJlIGEgbmV3XG4gICAgLy8gYWQgcmVxdWVzdC5cbiAgICBpZiAodGhpcy5mcmllbmRseUlmcmFtZUVtYmVkXykge1xuICAgICAgdGhpcy5mcmllbmRseUlmcmFtZUVtYmVkXy5yZXN1bWUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gSWYgbGF5b3V0IG9mIHBhZ2UgaGFzIG5vdCBjaGFuZ2VkLCBvbkxheW91dE1lYXN1cmUgd2lsbCBub3QgYmUgY2FsbGVkXG4gICAgLy8gc28gZG8gc28gZXhwbGljaXRseS5cbiAgICBjb25zdCByZXNvdXJjZSA9IHRoaXMuZ2V0UmVzb3VyY2UoKTtcbiAgICBpZiAocmVzb3VyY2UuaGFzQmVlbk1lYXN1cmVkKCkgJiYgIXJlc291cmNlLmlzTWVhc3VyZVJlcXVlc3RlZCgpKSB7XG4gICAgICB0aGlzLm9uTGF5b3V0TWVhc3VyZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvcmVzb3VyY2UuUmVzb3VyY2V9XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgZ2V0UmVzb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5nZXRSZXNvdXJjZXMoKS5nZXRSZXNvdXJjZUZvckVsZW1lbnQodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIGFkUHJvbWlzZSB3YXMgaW5pdGlhbGl6ZWQgKGluZGljYXRvciBvZlxuICAgKiAgICBlbGVtZW50IHZhbGlkaXR5KS5cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgaGFzQWRQcm9taXNlKCkge1xuICAgIHJldHVybiAhIXRoaXMuYWRQcm9taXNlXztcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG91bGQgb25seSBiZSBjYWxsZWQgYWZ0ZXIgWEhSIHJlc3BvbnNlIGhlYWRlcnMgaGF2ZSBiZWVuIHByb2Nlc3NlZCBhbmRcbiAgICogcG9zdEFkUmVzcG9uc2VFeHBlcmltZW50RmVhdHVyZXMgaXMgcG9wdWxhdGVkLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIGluIGV4cGVyaW1lbnQgZ2l2aW5nIG5vbi1BTVAgY3JlYXRpdmVzIHNhbWVcbiAgICogICAgYmVuZWZpdHMgYXMgQU1QIChpbmNyZWFzZWQgcHJpb3JpdHksIG5vIHRocm90dGxlKVxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIGluTm9uQW1wUHJlZmVyZW5jZUV4cCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgISF0aGlzLnBvc3RBZFJlc3BvbnNlRXhwZXJpbWVudEZlYXR1cmVzWydwcmVmX25ldXRyYWxfZW5hYmxlZCddICYmXG4gICAgICBbJ2Fkc2Vuc2UnLCAnZG91YmxlY2xpY2snXS5pbmNsdWRlcyh0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIGVudmlyb25tZW50L2VsZW1lbnQgc2hvdWxkIGluaXRpYWxpemUgYWQgcmVxdWVzdFxuICAgKiAgICBwcm9taXNlIGNoYWluLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2hvdWxkSW5pdGlhbGl6ZVByb21pc2VDaGFpbl8oKSB7XG4gICAgY29uc3Qgc2xvdFJlY3QgPSB0aGlzLmdldEludGVyc2VjdGlvbkVsZW1lbnRMYXlvdXRCb3goKTtcbiAgICBjb25zdCBmaXhlZFNpemVaZXJvSGVpZ2h0T3JXaWR0aCA9XG4gICAgICB0aGlzLmdldExheW91dCgpICE9IExheW91dC5GTFVJRCAmJlxuICAgICAgKHNsb3RSZWN0LmhlaWdodCA9PSAwIHx8IHNsb3RSZWN0LndpZHRoID09IDApO1xuICAgIGlmIChcbiAgICAgIGZpeGVkU2l6ZVplcm9IZWlnaHRPcldpZHRoIHx8XG4gICAgICB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSB8fFxuICAgICAgLy8gVE9ETyhsZXZpdHpreSk6IE1heSBuZWVkIGFkZGl0aW9uYWwgY2hlY2tzIGZvciBvdGhlciBkaXNwbGF5OmhpZGRlbiBjYXNlcy5cbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ktYW1waHRtbC1oaWRkZW4tYnktbWVkaWEtcXVlcnknKVxuICAgICkge1xuICAgICAgZGV2KCkuZmluZShcbiAgICAgICAgVEFHLFxuICAgICAgICAnb25MYXlvdXRNZWFzdXJlIGNhbmNlbGVkIGR1ZSBoZWlnaHQvd2lkdGggMCcsXG4gICAgICAgIHRoaXMuZWxlbWVudFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgIXRoaXMudWlIYW5kbGVyLmlzU3RpY2t5QWQoKSAmJlxuICAgICAgIWlzQWRQb3NpdGlvbkFsbG93ZWQodGhpcy5lbGVtZW50LCB0aGlzLndpbilcbiAgICApIHtcbiAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICBUQUcsXG4gICAgICAgIGA8JHt0aGlzLmVsZW1lbnQudGFnTmFtZX0+IGlzIG5vdCBhbGxvd2VkIHRvIGJlIGAgK1xuICAgICAgICAgIGBwbGFjZWQgaW4gZWxlbWVudHMgd2l0aCBwb3NpdGlvbjogZml4ZWQgb3Igc3RpY2t5OiAke3RoaXMuZWxlbWVudH1gXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBPbkxheW91dE1lYXN1cmUgY2FuIGJlIGNhbGxlZCB3aGVuIHBhZ2UgaXMgaW4gcHJlcmVuZGVyIHNvIGRlbGF5IHVudGlsXG4gICAgLy8gdmlzaWJsZS4gIEFzc3VtZSB0aGF0IGl0IGlzIG9rIHRvIGNhbGwgaXNWYWxpZEVsZW1lbnQgYXMgaXQgc2hvdWxkXG4gICAgLy8gb25seSBiZWluZyBsb29raW5nIGF0IHdpbmRvdywgaW1tdXRhYmxlIHByb3BlcnRpZXMgKGkuZS4gbG9jYXRpb24pIGFuZFxuICAgIC8vIGl0cyBlbGVtZW50IGFuY2VzdHJ5LlxuICAgIGlmICghdGhpcy5pc1ZhbGlkRWxlbWVudCgpKSB7XG4gICAgICAvLyBUT0RPKGtqd3JpZ2h0KTogY29sbGFwc2U/XG4gICAgICB1c2VyKCkud2FybihcbiAgICAgICAgVEFHLFxuICAgICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyksXG4gICAgICAgICdBbXAgYWQgZWxlbWVudCBpZ25vcmVkIGFzIGludmFsaWQnLFxuICAgICAgICB0aGlzLmVsZW1lbnRcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvbkxheW91dE1lYXN1cmUoKSB7XG4gICAgdGhpcy5pbml0aWF0ZUFkUmVxdWVzdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIHdoZW4gdW5kZXJseWluZyBlbGVtZW50IGlzIHdpdGhpbiB0aGUgdmlld3BvcnQgcmFuZ2UgZ2l2ZW4gb3JcbiAgICogaGFzIGJlZW4gbG9hZGVkIGFscmVhZHkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfGJvb2xlYW59IHZpZXdwb3J0IGRlcml2ZWQgZnJvbSByZW5kZXJPdXRzaWRlVmlld3BvcnQuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICB3aGVuV2l0aGluVmlld3BvcnQodmlld3BvcnQpIHtcbiAgICBkZXZBc3NlcnQodmlld3BvcnQgIT09IGZhbHNlKTtcbiAgICBjb25zdCByZXNvdXJjZSA9IHRoaXMuZ2V0UmVzb3VyY2UoKTtcbiAgICBpZiAoV0lUSElOX1ZJRVdQT1JUX0lOT0IgfHwgZ2V0TW9kZSgpLmxvY2FsRGV2IHx8IGdldE1vZGUoKS50ZXN0KSB7XG4gICAgICAvLyBSZXNvbHZlIGlzIGFscmVhZHkgbGFpZCBvdXQgb3Igdmlld3BvcnQgaXMgdHJ1ZS5cbiAgICAgIGlmICghcmVzb3VyY2UuaXNMYXlvdXRQZW5kaW5nKCkgfHwgdmlld3BvcnQgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgICAgLy8gVHJhY2sgd2hlbiB3aXRoaW4gdGhlIHNwZWNpZmllZCBudW1iZXIgb2Ygdmlld3BvcnRzLlxuICAgICAgY29uc3Qgdmlld3BvcnROdW0gPSBkZXYoKS5hc3NlcnROdW1iZXIodmlld3BvcnQpO1xuICAgICAgcmV0dXJuIHdoZW5XaXRoaW5WaWV3cG9ydCh0aGlzLmVsZW1lbnQsIHZpZXdwb3J0TnVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc291cmNlLndoZW5XaXRoaW5WaWV3cG9ydCh2aWV3cG9ydCk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgZW50cnkgcG9pbnQgaW50byB0aGUgYWQgcHJvbWlzZSBjaGFpbi5cbiAgICpcbiAgICogQ2FsbGluZyB0aGlzIGZ1bmN0aW9uIHdpbGwgaW5pdGlhdGUgdGhlIGZvbGxvd2luZyBzZXF1ZW5jZSBvZiBldmVudHM6IGFkXG4gICAqIHVybCBjb25zdHJ1Y3Rpb24sIGFkIHJlcXVlc3QgaXNzdWFuY2UsIGNyZWF0aXZlIHZlcmlmaWNhdGlvbiwgYW5kIG1ldGFkYXRhXG4gICAqIHBhcnNpbmcuXG4gICAqXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGluaXRpYXRlQWRSZXF1ZXN0KCkge1xuICAgIGlmICh0aGlzLnhPcmlnaW5JZnJhbWVIYW5kbGVyXykge1xuICAgICAgdGhpcy54T3JpZ2luSWZyYW1lSGFuZGxlcl8ub25MYXlvdXRNZWFzdXJlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmFkUHJvbWlzZV8gfHwgIXRoaXMuc2hvdWxkSW5pdGlhbGl6ZVByb21pc2VDaGFpbl8oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEluY3JlbWVudCB1bmlxdWUgcHJvbWlzZSBJRCBzbyB0aGF0IGlmIGl0cyB2YWx1ZSBjaGFuZ2VzIHdpdGhpbiB0aGVcbiAgICAvLyBwcm9taXNlIGNoYWluIGR1ZSB0byBjYW5jZWwgZnJvbSB1bmxheW91dCwgdGhlIHByb21pc2Ugd2lsbCBiZSByZWplY3RlZC5cbiAgICArK3RoaXMucHJvbWlzZUlkXztcblxuICAgIC8vIFNob3J0aGFuZCBmb3I6IHJlamVjdCBwcm9taXNlIGlmIGN1cnJlbnQgcHJvbWlzZSBjaGFpbiBpcyBvdXQgb2YgZGF0ZS5cbiAgICBjb25zdCBjaGVja1N0aWxsQ3VycmVudCA9IHRoaXMudmVyaWZ5U3RpbGxDdXJyZW50KCk7XG5cbiAgICAvLyBSZXR1cm4gdmFsdWUgZnJvbSB0aGlzIGNoYWluOiBUcnVlIGlmZiByZW5kZXJpbmcgd2FzIFwic3VjY2Vzc2Z1bFwiXG4gICAgLy8gKGkuZS4sIHNob3VsZG4ndCB0cnkgdG8gcmVuZGVyIGxhdGVyIHZpYSBpZnJhbWUpOyBmYWxzZSBpZmYgc2hvdWxkXG4gICAgLy8gdHJ5IHRvIHJlbmRlciBsYXRlciBpbiBpZnJhbWUuXG4gICAgLy8gQ2FzZXMgdG8gaGFuZGxlIGluIHRoaXMgY2hhaW46XG4gICAgLy8gICAtIEV2ZXJ5dGhpbmcgb2sgID0+IFJlbmRlcjsgcmV0dXJuIHRydWVcbiAgICAvLyAgIC0gRW1wdHkgbmV0d29yayByZXNwb25zZSByZXR1cm5lZCA9PiBEb24ndCByZW5kZXI7IHJldHVybiB0cnVlXG4gICAgLy8gICAtIENhbid0IHBhcnNlIGNyZWF0aXZlIG91dCBvZiByZXNwb25zZSA9PiBEb24ndCByZW5kZXI7IHJldHVybiBmYWxzZVxuICAgIC8vICAgLSBDYW4gcGFyc2UsIGJ1dCBjcmVhdGl2ZSBpcyBlbXB0eSA9PiBEb24ndCByZW5kZXI7IHJldHVybiB0cnVlXG4gICAgLy8gICAtIFZhbGlkYXRpb24gZmFpbHMgPT4gcmV0dXJuIGZhbHNlXG4gICAgLy8gICAtIFJlbmRlcmluZyBmYWlscyA9PiByZXR1cm4gZmFsc2VcbiAgICAvLyAgIC0gQ2hhaW4gY2FuY2VsbGVkID0+IGRvbid0IHJldHVybjsgZHJvcCBlcnJvclxuICAgIC8vICAgLSBVbmNhdWdodCBlcnJvciBvdGhlcndpc2UgPT4gZG9uJ3QgcmV0dXJuOyBwZXJjb2xhdGUgZXJyb3IgdXBcbiAgICB0aGlzLmFkUHJvbWlzZV8gPSB0aGlzLmdldEFtcERvYygpXG4gICAgICAud2hlbkZpcnN0VmlzaWJsZSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgIC8vIFNlZSBpZiBleHBlcmltZW50IHRoYXQgZGVsYXlzIHJlcXVlc3QgdW50aWwgc2xvdCBpcyB3aXRoaW5cbiAgICAgICAgLy8gcmVuZGVyT3V0c2lkZVZpZXdwb3J0LiBXaXRoaW4gcmVuZGVyIG91dHNpZGUgdmlld3BvcnQgd2lsbCBub3RcbiAgICAgICAgLy8gcmVzb2x2ZSBpZiBhbHJlYWR5IHdpdGhpbiB2aWV3cG9ydCB0aHVzIHRoZSBjaGVjayBmb3IgYWxyZWFkeVxuICAgICAgICAvLyBtZWV0aW5nIHRoZSBkZWZpbml0aW9uIGFzIG9wcG9zZWQgdG8gd2FpdGluZyBvbiB0aGUgcHJvbWlzZS5cbiAgICAgICAgY29uc3QgZGVsYXkgPSB0aGlzLmRlbGF5QWRSZXF1ZXN0RW5hYmxlZCgpO1xuICAgICAgICBpZiAoZGVsYXkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy53aGVuV2l0aGluVmlld3BvcnQoXG4gICAgICAgICAgICB0eXBlb2YgZGVsYXkgPT0gJ251bWJlcicgPyBkZWxheSA6IHRoaXMucmVuZGVyT3V0c2lkZVZpZXdwb3J0KClcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLy8gUG9zc2libHkgYmxvY2sgb24gYW1wLWNvbnNlbnQuXG4gICAgICAvKiogQHJldHVybiB7IVByb21pc2U8QXJyYXk8UHJvbWlzZT4+fSAqL1xuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBjaGVja1N0aWxsQ3VycmVudCgpO1xuICAgICAgICBjb25zdCBjb25zZW50UG9saWN5SWQgPSBzdXBlci5nZXRDb25zZW50UG9saWN5KCk7XG5cbiAgICAgICAgaWYgKGNvbnNlbnRQb2xpY3lJZCkge1xuICAgICAgICAgIGNvbnN0IGNvbnNlbnRTdGF0ZVByb21pc2UgPSBnZXRDb25zZW50UG9saWN5U3RhdGUoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgICBjb25zZW50UG9saWN5SWRcbiAgICAgICAgICApLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdFcnJvciBkZXRlcm1pbmluZyBjb25zZW50IHN0YXRlJywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiBDT05TRU5UX1BPTElDWV9TVEFURS5VTktOT1dOO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY29uc3QgY29uc2VudFN0cmluZ1Byb21pc2UgPSBnZXRDb25zZW50UG9saWN5SW5mbyhcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgIGNvbnNlbnRQb2xpY3lJZFxuICAgICAgICAgICkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgdXNlcigpLmVycm9yKFRBRywgJ0Vycm9yIGRldGVybWluaW5nIGNvbnNlbnQgc3RyaW5nJywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY29uc3QgY29uc2VudE1ldGFkYXRhUHJvbWlzZSA9IGdldENvbnNlbnRNZXRhZGF0YShcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgIGNvbnNlbnRQb2xpY3lJZFxuICAgICAgICAgICkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgdXNlcigpLmVycm9yKFRBRywgJ0Vycm9yIGRldGVybWluaW5nIGNvbnNlbnQgbWV0YWRhdGEnLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgY29uc2VudFN0YXRlUHJvbWlzZSxcbiAgICAgICAgICAgIGNvbnNlbnRTdHJpbmdQcm9taXNlLFxuICAgICAgICAgICAgY29uc2VudE1ldGFkYXRhUHJvbWlzZSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW251bGwsIG51bGwsIG51bGxdKTtcbiAgICAgIH0pXG4gICAgICAvLyBUaGlzIGJsb2NrIHJldHVybnMgdGhlIGFkIFVSTCwgaWYgb25lIGlzIGF2YWlsYWJsZS5cbiAgICAgIC8qKiBAcmV0dXJuIHshUHJvbWlzZTw/c3RyaW5nPn0gKi9cbiAgICAgIC50aGVuKChjb25zZW50UmVzcG9uc2UpID0+IHtcbiAgICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcblxuICAgICAgICBjb25zdCBjb25zZW50U3RhdGUgPSBjb25zZW50UmVzcG9uc2VbMF07XG4gICAgICAgIGNvbnN0IGNvbnNlbnRTdHJpbmcgPSBjb25zZW50UmVzcG9uc2VbMV07XG4gICAgICAgIGNvbnN0IGNvbnNlbnRNZXRhZGF0YSA9IGNvbnNlbnRSZXNwb25zZVsyXTtcbiAgICAgICAgY29uc3QgZ2RwckFwcGxpZXMgPSBjb25zZW50TWV0YWRhdGFcbiAgICAgICAgICA/IGNvbnNlbnRNZXRhZGF0YVsnZ2RwckFwcGxpZXMnXVxuICAgICAgICAgIDogY29uc2VudE1ldGFkYXRhO1xuICAgICAgICBjb25zdCBhZGRpdGlvbmFsQ29uc2VudCA9IGNvbnNlbnRNZXRhZGF0YVxuICAgICAgICAgID8gY29uc2VudE1ldGFkYXRhWydhZGRpdGlvbmFsQ29uc2VudCddXG4gICAgICAgICAgOiBjb25zZW50TWV0YWRhdGE7XG4gICAgICAgIGNvbnN0IGNvbnNlbnRTdHJpbmdUeXBlID0gY29uc2VudE1ldGFkYXRhXG4gICAgICAgICAgPyBjb25zZW50TWV0YWRhdGFbJ2NvbnNlbnRTdHJpbmdUeXBlJ11cbiAgICAgICAgICA6IGNvbnNlbnRNZXRhZGF0YTtcblxuICAgICAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTw/c3RyaW5nPn0gKi8gKFxuICAgICAgICAgIHRoaXMuZ2V0U2VydmVOcGFTaWduYWwoKS50aGVuKChucGFTaWduYWwpID0+XG4gICAgICAgICAgICB0aGlzLmdldEFkVXJsKFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc2VudFN0YXRlLFxuICAgICAgICAgICAgICAgIGNvbnNlbnRTdHJpbmcsXG4gICAgICAgICAgICAgICAgY29uc2VudFN0cmluZ1R5cGUsXG4gICAgICAgICAgICAgICAgZ2RwckFwcGxpZXMsXG4gICAgICAgICAgICAgICAgYWRkaXRpb25hbENvbnNlbnQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRoaXMudHJ5RXhlY3V0ZVJlYWxUaW1lQ29uZmlnXyhcbiAgICAgICAgICAgICAgICBjb25zZW50U3RhdGUsXG4gICAgICAgICAgICAgICAgY29uc2VudFN0cmluZyxcbiAgICAgICAgICAgICAgICAvKiogQHR5cGUgez9PYmplY3Q8c3RyaW5nLCBzdHJpbmd8bnVtYmVyfGJvb2xlYW58dW5kZWZpbmVkPn0gKi8gKFxuICAgICAgICAgICAgICAgICAgY29uc2VudE1ldGFkYXRhXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICBucGFTaWduYWxcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLy8gVGhpcyBibG9jayByZXR1cm5zIHRoZSAocG9zc2libHkgZW1wdHkpIHJlc3BvbnNlIHRvIHRoZSBYSFIgcmVxdWVzdC5cbiAgICAgIC8qKiBAcmV0dXJuIHshUHJvbWlzZTw/UmVzcG9uc2U+fSAqL1xuICAgICAgLnRoZW4oKGFkVXJsKSA9PiB7XG4gICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgIHRoaXMuYWRVcmxfID0gYWRVcmw7XG4gICAgICAgIC8vIElmIHdlIHNob3VsZCBza2lwIHRoZSBYSFIsIHdlIHdpbGwgaW5zdGVhZCByZXF1ZXN0IGFuZCByZW5kZXJcbiAgICAgICAgLy8gYnkgc2ltcGx5IHdyaXRpbmcgYSBmcmFtZSBpbnRvIHRoZSBwYWdlIHVzaW5nXG4gICAgICAgIC8vIHJlbmRlclZpYUlmcmFtZUdldFxuICAgICAgICBpZiAoIXRoaXMuaXNYaHJBbGxvd2VkKCkgJiYgISF0aGlzLmFkVXJsXykge1xuICAgICAgICAgIHRoaXMuZXhwZXJpbWVudGFsTm9uQW1wQ3JlYXRpdmVSZW5kZXJNZXRob2RfID1cbiAgICAgICAgICAgIFhPUklHSU5fTU9ERS5JRlJBTUVfR0VUO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChJRlJBTUVfR0VUKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWRVcmwgJiYgdGhpcy5zZW5kWGhyUmVxdWVzdChhZFVybCk7XG4gICAgICB9KVxuICAgICAgLy8gVGhlIGZvbGxvd2luZyBibG9jayByZXR1cm5zIGVpdGhlciB0aGUgcmVzcG9uc2UgKGFzIGFcbiAgICAgIC8vIHtieXRlcywgaGVhZGVyc30gb2JqZWN0KSwgb3IgbnVsbCBpZiBubyByZXNwb25zZSBpcyBhdmFpbGFibGUgL1xuICAgICAgLy8gcmVzcG9uc2UgaXMgZW1wdHkuXG4gICAgICAvKiogQHJldHVybiB7IVByb21pc2U8IVJlc3BvbnNlPn0gKi9cbiAgICAgIC50aGVuKChmZXRjaFJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgIHRoaXMubWF5YmVUcmlnZ2VyQW5hbHl0aWNzRXZlbnRfKCdhZFJlcXVlc3RFbmQnKTtcbiAgICAgICAgLy8gSWYgdGhlIHJlc3BvbnNlIGlzIG51bGwgKGNhbiBvY2N1ciBmb3Igbm9uLTIwMCByZXNwb25zZXMpICBvclxuICAgICAgICAvLyBhcnJheUJ1ZmZlciBpcyBudWxsLCBmb3JjZSBjb2xsYXBzZS5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICFmZXRjaFJlc3BvbnNlIHx8XG4gICAgICAgICAgIWZldGNoUmVzcG9uc2UuYXJyYXlCdWZmZXIgfHxcbiAgICAgICAgICBmZXRjaFJlc3BvbnNlLmhlYWRlcnMuaGFzKCdhbXAtZmYtZW1wdHktY3JlYXRpdmUnKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmZvcmNlQ29sbGFwc2UoKTtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoTk9fQ09OVEVOVF9SRVNQT05TRSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGZldGNoUmVzcG9uc2UuaGVhZGVycyAmJlxuICAgICAgICAgIGZldGNoUmVzcG9uc2UuaGVhZGVycy5oYXMoRVhQRVJJTUVOVF9GRUFUVVJFX0hFQURFUl9OQU1FKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLnBvcHVsYXRlUG9zdEFkUmVzcG9uc2VFeHBlcmltZW50RmVhdHVyZXNfKFxuICAgICAgICAgICAgZmV0Y2hSZXNwb25zZS5oZWFkZXJzLmdldChFWFBFUklNRU5UX0ZFQVRVUkVfSEVBREVSX05BTUUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgZ2V0TW9kZSgpLmxvY2FsRGV2ICYmXG4gICAgICAgICAgdGhpcy53aW4ubG9jYXRpb24gJiZcbiAgICAgICAgICB0aGlzLndpbi5sb2NhdGlvbi5zZWFyY2hcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gQWxsb3cgZm9yIHNldHRpbmcgZXhwZXJpbWVudCBmZWF0dXJlcyB2aWEgcXVlcnkgcGFyYW0gd2hpY2hcbiAgICAgICAgICAvLyB3aWxsIHBvdGVudGlhbGx5IG92ZXJyaWRlIHZhbHVlcyByZXR1cm5lZCBpbiByZXNwb25zZS5cbiAgICAgICAgICBjb25zdCBtYXRjaCA9IC8oPzpcXD98JilhNGFfZmVhdF9leHA9KFteJl0rKS8uZXhlYyhcbiAgICAgICAgICAgIHRoaXMud2luLmxvY2F0aW9uLnNlYXJjaFxuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKG1hdGNoICYmIG1hdGNoWzFdKSB7XG4gICAgICAgICAgICBkZXYoKS5pbmZvKFRBRywgYFVzaW5nIGRlYnVnIGV4cCBmZWF0dXJlczogJHttYXRjaFsxXX1gKTtcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGVQb3N0QWRSZXNwb25zZUV4cGVyaW1lbnRGZWF0dXJlc18oXG4gICAgICAgICAgICAgIHRyeURlY29kZVVyaUNvbXBvbmVudChtYXRjaFsxXSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8odGRybCk6IFRlbXBvcmFyeSwgd2hpbGUgd2UncmUgdmVyaWZ5aW5nIHdoZXRoZXIgU2FmZUZyYW1lIGlzXG4gICAgICAgIC8vIGFuIGFjY2VwdGFibGUgc29sdXRpb24gdG8gdGhlICdTYWZhcmkgb24gaU9TIGRvZXNuJ3QgZmV0Y2hcbiAgICAgICAgLy8gaWZyYW1lIHNyYyBmcm9tIGNhY2hlJyBpc3N1ZS4gIFNlZVxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2lzc3Vlcy81NjE0XG4gICAgICAgIGNvbnN0IG1ldGhvZCA9IHRoaXMuZ2V0Tm9uQW1wQ3JlYXRpdmVSZW5kZXJpbmdNZXRob2QoXG4gICAgICAgICAgZmV0Y2hSZXNwb25zZS5oZWFkZXJzLmdldChSRU5ERVJJTkdfVFlQRV9IRUFERVIpXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZXhwZXJpbWVudGFsTm9uQW1wQ3JlYXRpdmVSZW5kZXJNZXRob2RfID0gbWV0aG9kO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5leHBlcmltZW50YWxOb25BbXBDcmVhdGl2ZVJlbmRlck1ldGhvZF8gPT0gWE9SSUdJTl9NT0RFLk5BTUVGUkFNRVxuICAgICAgICApIHtcbiAgICAgICAgICBTZXJ2aWNlcy5wcmVjb25uZWN0Rm9yKHRoaXMud2luKS5wcmVsb2FkKFxuICAgICAgICAgICAgdGhpcy5nZXRBbXBEb2MoKSxcbiAgICAgICAgICAgIGdldERlZmF1bHRCb290c3RyYXBCYXNlVXJsKHRoaXMud2luLCAnbmFtZWZyYW1lJylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNhZmVmcmFtZVZlcnNpb25IZWFkZXIgPSBmZXRjaFJlc3BvbnNlLmhlYWRlcnMuZ2V0KFxuICAgICAgICAgIFNBRkVGUkFNRV9WRVJTSU9OX0hFQURFUlxuICAgICAgICApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgL15bMC05LV0rJC8udGVzdChzYWZlZnJhbWVWZXJzaW9uSGVhZGVyKSAmJlxuICAgICAgICAgIHNhZmVmcmFtZVZlcnNpb25IZWFkZXIgIT0gREVGQVVMVF9TQUZFRlJBTUVfVkVSU0lPTlxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLnNhZmVmcmFtZVZlcnNpb24gPSBzYWZlZnJhbWVWZXJzaW9uSGVhZGVyO1xuICAgICAgICAgIFNlcnZpY2VzLnByZWNvbm5lY3RGb3IodGhpcy53aW4pLnByZWxvYWQoXG4gICAgICAgICAgICB0aGlzLmdldEFtcERvYygpLFxuICAgICAgICAgICAgdGhpcy5nZXRTYWZlZnJhbWVQYXRoKClcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmZXRjaFJlc3BvbnNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChmZXRjaFJlc3BvbnNlKSA9PlxuICAgICAgICB0aGlzLmlzSW5Ob1NpZ25pbmdFeHAoKVxuICAgICAgICAgID8gdGhpcy5zdHJlYW1SZXNwb25zZV8oZmV0Y2hSZXNwb25zZSwgY2hlY2tTdGlsbEN1cnJlbnQpXG4gICAgICAgICAgOiB0aGlzLnN0YXJ0VmFsaWRhdGlvbkZsb3dfKGZldGNoUmVzcG9uc2UsIGNoZWNrU3RpbGxDdXJyZW50KVxuICAgICAgKVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBzd2l0Y2ggKGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpIHtcbiAgICAgICAgICBjYXNlIElGUkFNRV9HRVQ6XG4gICAgICAgICAgY2FzZSBORVRXT1JLX0ZBSUxVUkU6XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICBjYXNlIElOVkFMSURfU1BTQV9SRVNQT05TRTpcbiAgICAgICAgICBjYXNlIE5PX0NPTlRFTlRfUkVTUE9OU0U6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtaW5pZmllZENyZWF0aXZlOiAnJyxcbiAgICAgICAgICAgICAgY3VzdG9tRWxlbWVudEV4dGVuc2lvbnM6IFtdLFxuICAgICAgICAgICAgICBjdXN0b21TdHlsZXNoZWV0czogW10sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIGVycm9yIGluIGNoYWluIG9jY3VycywgcmVwb3J0IGl0IGFuZCByZXR1cm4gbnVsbCBzbyB0aGF0XG4gICAgICAgIC8vIGxheW91dENhbGxiYWNrIGNhbiByZW5kZXIgdmlhIGNyb3NzIGRvbWFpbiBpZnJhbWUgYXNzdW1pbmcgYWRcbiAgICAgICAgLy8gdXJsIG9yIGNyZWF0aXZlIGV4aXN0LlxuICAgICAgICB0aGlzLnByb21pc2VFcnJvckhhbmRsZXJfKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzSW5Ob1NpZ25pbmdFeHAoKSB7XG4gICAgcmV0dXJuIE5PX1NJR05JTkdfUlRWO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93IHN1YmNsYXNzZXMgdG8gc2tpcCBjbGllbnQgc2lkZSB2YWxpZGF0aW9uIG9mIG5vbi1hbXAgY3JlYXRpdmVzXG4gICAqIGJhc2VkIG9uIGh0dHAgaGVhZGVycyBmb3IgcGVyZm9tYW5jZS4gV2hlbiB0cnVlLCBhZHMgd2lsbCBmYWxsIGJhY2sgdG9cbiAgICogeC1kb21haW4gZWFybGllci5cbiAgICogQHBhcmFtIHshSGVhZGVyc30gdW51c2VkSGVhZGVyc1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc2tpcENsaWVudFNpZGVWYWxpZGF0aW9uKHVudXNlZEhlYWRlcnMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgc3RyZWFtaW5nIHJlc3BvbnNlIGludG8gdGhlIGRldGFjaGVkIGRvY3VtZW50LlxuICAgKiBAcGFyYW0geyFSZXNwb25zZX0gaHR0cFJlc3BvbnNlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gY2hlY2tTdGlsbEN1cnJlbnRcbiAgICogQHJldHVybiB7UHJvbWlzZTw/Li9oZWFkLXZhbGlkYXRpb24uVmFsaWRhdGVkSGVhZERlZj59XG4gICAqL1xuICBzdHJlYW1SZXNwb25zZV8oaHR0cFJlc3BvbnNlLCBjaGVja1N0aWxsQ3VycmVudCkge1xuICAgIGlmIChodHRwUmVzcG9uc2Uuc3RhdHVzID09PSAyMDQpIHtcbiAgICAgIHRoaXMuZm9yY2VDb2xsYXBzZSgpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KE5PX0NPTlRFTlRfUkVTUE9OU0UpO1xuICAgIH1cblxuICAgIC8vIEV4dHJhY3Qgc2l6ZSB3aWxsIGFsc28gcGFyc2UgeC1hbXBhbmFseXRpY3MgaGVhZGVyIGZvciBzb21lIHN1YmNsYXNzZXMuXG4gICAgY29uc3Qgc2l6ZSA9IHRoaXMuZXh0cmFjdFNpemUoaHR0cFJlc3BvbnNlLmhlYWRlcnMpO1xuICAgIHRoaXMuY3JlYXRpdmVTaXplXyA9IHNpemUgfHwgdGhpcy5jcmVhdGl2ZVNpemVfO1xuXG4gICAgaWYgKFxuICAgICAgIWlzUGxhdGZvcm1TdXBwb3J0ZWQodGhpcy53aW4pIHx8XG4gICAgICB0aGlzLnNraXBDbGllbnRTaWRlVmFsaWRhdGlvbihodHRwUmVzcG9uc2UuaGVhZGVycylcbiAgICApIHtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZUZhbGxiYWNrXyhodHRwUmVzcG9uc2UsIGNoZWNrU3RpbGxDdXJyZW50KTtcbiAgICB9XG5cbiAgICAvLyBEdXBsaWNhdGluZyBodHRwUmVzcG9uc2Ugc3RyZWFtIGFzIHNhZmVmcmFtZS9uYW1lZnJhbWUgcmVuZGVyaW5nIHdpbGwgbmVlZCB0aGVcbiAgICAvLyB1bmFsdGVyZWQgaHR0cFJlc3BvbnNlIGNvbnRlbnQuXG4gICAgY29uc3QgZmFsbGJhY2tIdHRwUmVzcG9uc2UgPSBodHRwUmVzcG9uc2UuY2xvbmUoKTtcblxuICAgIC8vIFRoaXMgdHJhbnNmb3JtYXRpb24gY29uc3VtZXMgdGhlIGRldGFjaGVkIERPTSBjaHVua3MgYW5kXG4gICAgLy8gZXhwb3NlcyBvdXIgd2FpdEZvckhlYWQgYW5kIHRyYW5zZmVyQm9keSBtZXRob2RzLlxuICAgIGNvbnN0IHRyYW5zZm9ybVN0cmVhbSA9IG5ldyBEb21UcmFuc2Zvcm1TdHJlYW0odGhpcy53aW4pO1xuICAgIC8vIFJlY2VpdmVzIGNodW5rcyBvZiB0ZXh0IGFuZCB3cml0ZXMgdG8gZGV0YWNoZWQgRE9NLlxuICAgIGNvbnN0IGRldGFjaGVkU3RyZWFtID0gbmV3IERldGFjaGVkRG9tU3RyZWFtKFxuICAgICAgdGhpcy53aW4sXG4gICAgICAoY2h1bmspID0+IHRyYW5zZm9ybVN0cmVhbS5vbkNodW5rKGNodW5rKSxcbiAgICAgIChkb2MpID0+IHRyYW5zZm9ybVN0cmVhbS5vbkVuZChkb2MpXG4gICAgKTtcblxuICAgIHRoaXMudHJhbnNmZXJEb21Cb2R5XyA9IHRyYW5zZm9ybVN0cmVhbS50cmFuc2ZlckJvZHkuYmluZCh0cmFuc2Zvcm1TdHJlYW0pO1xuXG4gICAgLy8gRGVjb2RlcyBvdXIgaHR0cFJlc3BvbnNlIGJ5dGVzIGFuZCBwaXBlcyB0aGVtIHRvIHRoZVxuICAgIC8vIERldGFjaGVkRG9tU3RyZWFtLlxuICAgIHJldHVybiBzdHJlYW1SZXNwb25zZVRvV3JpdGVyKHRoaXMud2luLCBodHRwUmVzcG9uc2UsIGRldGFjaGVkU3RyZWFtKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlQm9keUhhc0NvbnRlbnQpID0+IHtcbiAgICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgICAgLy8gYGFtcC1mZi1lbXB0eS1jcmVhdGl2ZWAgaGVhZGVyIGlzIG5vdCBwcmVzZW50LCBhbmQgaHR0cFJlc3BvbnNlLmJvZHlcbiAgICAgICAgLy8gaXMgZW1wdHkuXG4gICAgICAgIGlmICghcmVzcG9uc2VCb2R5SGFzQ29udGVudCkge1xuICAgICAgICAgIHRoaXMuZm9yY2VDb2xsYXBzZSgpO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChOT19DT05URU5UX1JFU1BPTlNFKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVN0cmVhbS53YWl0Rm9ySGVhZCgpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChoZWFkKSA9PiB7XG4gICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlSGVhZEVsZW1lbnRfKGhlYWQpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChzYW5pdGl6ZWRIZWFkRWxlbWVudCkgPT4ge1xuICAgICAgICBjaGVja1N0aWxsQ3VycmVudCgpO1xuICAgICAgICAvLyBXZSBzaG91bGQgbm90IHJlbmRlciBhcyBGSUUuXG4gICAgICAgIGlmICghc2FuaXRpemVkSGVhZEVsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVGYWxsYmFja18oZmFsbGJhY2tIdHRwUmVzcG9uc2UsIGNoZWNrU3RpbGxDdXJyZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUxheW91dFByaW9yaXR5KExheW91dFByaW9yaXR5LkNPTlRFTlQpO1xuICAgICAgICB0aGlzLmlzVmVyaWZpZWRBbXBDcmVhdGl2ZV8gPSB0cnVlO1xuICAgICAgICByZXR1cm4gc2FuaXRpemVkSGVhZEVsZW1lbnQ7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGNhc2Ugd2hlcmUgY3JlYXRpdmUgY2Fubm90IG9yIGhhcyBjaG9zZW4gbm90IHRvIGJlIHJlbmRlcmVkXG4gICAqIHNhZmVseSBpbiBGSUUuIFJldHVybmluZyBudWxsIGZvcmNlcyB4LWRvbWFpbiByZW5kZXIgaW5cbiAgICogYXR0ZW1wdFRvUmVuZGVyQ3JlYXRpdmVcbiAgICogQHBhcmFtIHshUmVzcG9uc2V9IGZhbGxiYWNrSHR0cFJlc3BvbnNlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gY2hlY2tTdGlsbEN1cnJlbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8bnVsbD59XG4gICAqL1xuICBoYW5kbGVGYWxsYmFja18oZmFsbGJhY2tIdHRwUmVzcG9uc2UsIGNoZWNrU3RpbGxDdXJyZW50KSB7XG4gICAgLy8gRXhwZXJpbWVudCB0byBnaXZlIG5vbi1BTVAgY3JlYXRpdmVzIHNhbWUgYmVuZWZpdHMgYXMgQU1QIHNvXG4gICAgLy8gdXBkYXRlIHByaW9yaXR5LlxuICAgIGlmICh0aGlzLmluTm9uQW1wUHJlZmVyZW5jZUV4cCgpKSB7XG4gICAgICB0aGlzLnVwZGF0ZUxheW91dFByaW9yaXR5KExheW91dFByaW9yaXR5LkNPTlRFTlQpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsbGJhY2tIdHRwUmVzcG9uc2UuYXJyYXlCdWZmZXIoKS50aGVuKChkb21UZXh0Q29udGVudCkgPT4ge1xuICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgIHRoaXMuY3JlYXRpdmVCb2R5XyA9IGRvbVRleHRDb250ZW50O1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcGFyZSB0aGUgY3JlYXRpdmUgPGhlYWQ+IGJ5IHJlbW92aW5nIGFueSBub24tc2VjdXJlIGVsZW1lbnRzIGFuZFxuICAgKiBleHJhY3RpbmcgZXh0ZW5zaW9uc1xuICAgKiBAcGFyYW0geyFFbGVtZW50fSBoZWFkRWxlbWVudFxuICAgKiBAcmV0dXJuIHs/Li9oZWFkLXZhbGlkYXRpb24uVmFsaWRhdGVkSGVhZERlZn0gaGVhZCBkYXRhIG9yIG51bGwgaWYgd2Ugc2hvdWxkIGZhbGwgYmFjayB0byB4ZG9tYWluLlxuICAgKi9cbiAgdmFsaWRhdGVIZWFkRWxlbWVudF8oaGVhZEVsZW1lbnQpIHtcbiAgICByZXR1cm4gcHJvY2Vzc0hlYWQodGhpcy53aW4sIHRoaXMuZWxlbWVudCwgaGVhZEVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuY2Fwc3VsYXRlcyBsb2dpYyBmb3IgdmFsaWRhdGlvbiBmbG93IHN0YXJ0aW5nIHdpdGggcmVzb2x2aW5nIHJlcyBib2R5XG4gICAqIHRvIGFycmF5IGJ1ZmZlci5cbiAgICogQHBhcmFtIHshUmVzcG9uc2V9IGZldGNoUmVzcG9uc2VcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBjaGVja1N0aWxsQ3VycmVudFxuICAgKiBAcmV0dXJuIHtQcm9taXNlPD9DcmVhdGl2ZU1ldGFEYXRhRGVmPn1cbiAgICovXG4gIHN0YXJ0VmFsaWRhdGlvbkZsb3dfKGZldGNoUmVzcG9uc2UsIGNoZWNrU3RpbGxDdXJyZW50KSB7XG4gICAgLy8gTm90ZTogUmVzb2x2aW5nIGEgLnRoZW4gaW5zaWRlIGEgLnRoZW4gYmVjYXVzZSB3ZSBuZWVkIHRvIGNhcHR1cmVcbiAgICAvLyB0d28gZmllbGRzIG9mIGZldGNoUmVzcG9uc2UsIG9uZSBvZiB3aGljaCBpcywgaXRzZWxmLCBhIHByb21pc2UsXG4gICAgLy8gYW5kIG9uZSBvZiB3aGljaCBpc24ndC4gIElmIHdlIGp1c3QgcmV0dXJuXG4gICAgLy8gZmV0Y2hSZXNwb25zZS5hcnJheUJ1ZmZlcigpLCB0aGUgbmV4dCBzdGVwIGluIHRoZSBjaGFpbiB3aWxsXG4gICAgLy8gcmVzb2x2ZSBpdCB0byBhIGNvbmNyZXRlIHZhbHVlLCBidXQgd2UnbGwgbG9zZSB0cmFjayBvZlxuICAgIC8vIGZldGNoUmVzcG9uc2UuaGVhZGVycy5cbiAgICByZXR1cm4gKFxuICAgICAgZmV0Y2hSZXNwb25zZVxuICAgICAgICAuYXJyYXlCdWZmZXIoKVxuICAgICAgICAudGhlbigoYnl0ZXMpID0+IHtcbiAgICAgICAgICBpZiAoYnl0ZXMuYnl0ZUxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAvLyBUaGUgc2VydmVyIHJldHVybmVkIG5vIGNvbnRlbnQuIEluc3RlYWQgb2YgZGlzcGxheWluZyBhIGJsYW5rXG4gICAgICAgICAgICAvLyByZWN0YW5nbGUsIHdlIGNvbGxhcHNlIHRoZSBzbG90IGluc3RlYWQuXG4gICAgICAgICAgICB0aGlzLmZvcmNlQ29sbGFwc2UoKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChOT19DT05URU5UX1JFU1BPTlNFKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJ5dGVzLFxuICAgICAgICAgICAgaGVhZGVyczogZmV0Y2hSZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgICAgIC8qKiBAcmV0dXJuIHs/UHJvbWlzZTw/QXJyYXlCdWZmZXI+fSAqL1xuICAgICAgICAudGhlbigocmVzcG9uc2VQYXJ0cykgPT4ge1xuICAgICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgICAgLy8gS2VlcCBhIGhhbmRsZSB0byB0aGUgY3JlYXRpdmUgYm9keSBzbyB0aGF0IHdlIGNhbiByZW5kZXIgaW50b1xuICAgICAgICAgIC8vIFNhZmVGcmFtZSBvciBOYW1lRnJhbWUgbGF0ZXIsIGlmIG5lY2Vzc2FyeS4gIFRPRE8odGRybCk6IFRlbXBvcmFyeSxcbiAgICAgICAgICAvLyB3aGlsZSB3ZVxuICAgICAgICAgIC8vIGFzc2VzcyB3aGV0aGVyIHRoaXMgaXMgdGhlIHJpZ2h0IHNvbHV0aW9uIHRvIHRoZSBTYWZhcmkraU9TIGlmcmFtZVxuICAgICAgICAgIC8vIHNyYyBjYWNoZSBpc3N1ZS4gIElmIHdlIGRlY2lkZSB0byBrZWVwIGEgU2FmZUZyYW1lLWxpa2Ugc29sdXRpb24sXG4gICAgICAgICAgLy8gd2Ugc2hvdWxkIHJlc3RydWN0dXJlIHRoZSBwcm9taXNlIGNoYWluIHRvIHBhc3MgdGhpcyBpbmZvIGFsb25nXG4gICAgICAgICAgLy8gbW9yZSBjbGVhbmx5LCB3aXRob3V0IHVzZSBvZiBhbiBvYmplY3QgdmFyaWFibGUgb3V0c2lkZSB0aGUgY2hhaW4uXG4gICAgICAgICAgaWYgKCFyZXNwb25zZVBhcnRzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qge2J5dGVzLCBoZWFkZXJzfSA9IHJlc3BvbnNlUGFydHM7XG4gICAgICAgICAgY29uc3Qgc2l6ZSA9IHRoaXMuZXh0cmFjdFNpemUocmVzcG9uc2VQYXJ0cy5oZWFkZXJzKTtcbiAgICAgICAgICB0aGlzLmNyZWF0aXZlU2l6ZV8gPSBzaXplIHx8IHRoaXMuY3JlYXRpdmVTaXplXztcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRhbE5vbkFtcENyZWF0aXZlUmVuZGVyTWV0aG9kXyAhPVxuICAgICAgICAgICAgICBYT1JJR0lOX01PREUuQ0xJRU5UX0NBQ0hFICYmXG4gICAgICAgICAgICBieXRlc1xuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGl2ZUJvZHlfID0gYnl0ZXM7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLm1heWJlVmFsaWRhdGVBbXBDcmVhdGl2ZShieXRlcywgaGVhZGVycyk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChjcmVhdGl2ZSkgPT4ge1xuICAgICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgICAgLy8gTmVlZCB0byBrbm93IGlmIGNyZWF0aXZlIHdhcyB2ZXJpZmllZCBhcyBwYXJ0IG9mIHJlbmRlciBvdXRzaWRlXG4gICAgICAgICAgLy8gdmlld3BvcnQgYnV0IGNhbm5vdCB3YWl0IG9uIHByb21pc2UuICBTYWRseSwgbmVlZCBhIHN0YXRlIGFcbiAgICAgICAgICAvLyB2YXJpYWJsZS5cbiAgICAgICAgICB0aGlzLmlzVmVyaWZpZWRBbXBDcmVhdGl2ZV8gPSAhIWNyZWF0aXZlO1xuICAgICAgICAgIHJldHVybiBjcmVhdGl2ZSAmJiB1dGY4RGVjb2RlKGNyZWF0aXZlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLy8gVGhpcyBibG9jayByZXR1cm5zIENyZWF0aXZlTWV0YURhdGFEZWYgaWZmIHRoZSBjcmVhdGl2ZSB3YXMgdmVyaWZpZWRcbiAgICAgICAgLy8gYXMgQU1QIGFuZCBjb3VsZCBiZSBwcm9wZXJseSBwYXJzZWQgZm9yIGZyaWVuZGx5IGlmcmFtZSByZW5kZXIuXG4gICAgICAgIC8qKiBAcmV0dXJuIHs/Q3JlYXRpdmVNZXRhRGF0YURlZn0gKi9cbiAgICAgICAgLnRoZW4oKGNyZWF0aXZlRGVjb2RlZCkgPT4ge1xuICAgICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgICAgLy8gTm90ZTogSXQncyBjcml0aWNhbCB0aGF0ICNnZXRBbXBBZE1ldGFkYXRhIGJlIGNhbGxlZFxuICAgICAgICAgIC8vIG9uIHByZWNpc2VseSB0aGUgc2FtZSBjcmVhdGl2ZSB0aGF0IHdhcyB2YWxpZGF0ZWRcbiAgICAgICAgICAvLyB2aWEgI3ZhbGlkYXRlQWRSZXNwb25zZV8uICBTZWUgR2l0SHViIGlzc3VlXG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvYW1waHRtbC9pc3N1ZXMvNDE4N1xuICAgICAgICAgIGxldCBjcmVhdGl2ZU1ldGFEYXRhRGVmO1xuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWlzUGxhdGZvcm1TdXBwb3J0ZWQodGhpcy53aW4pIHx8XG4gICAgICAgICAgICAhY3JlYXRpdmVEZWNvZGVkIHx8XG4gICAgICAgICAgICAhKGNyZWF0aXZlTWV0YURhdGFEZWYgPSB0aGlzLmdldEFtcEFkTWV0YWRhdGEoY3JlYXRpdmVEZWNvZGVkKSlcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmluTm9uQW1wUHJlZmVyZW5jZUV4cCgpKSB7XG4gICAgICAgICAgICAgIC8vIEV4cGVyaW1lbnQgdG8gZ2l2ZSBub24tQU1QIGNyZWF0aXZlcyBzYW1lIGJlbmVmaXRzIGFzIEFNUCBzb1xuICAgICAgICAgICAgICAvLyB1cGRhdGUgcHJpb3JpdHkuXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlTGF5b3V0UHJpb3JpdHkoTGF5b3V0UHJpb3JpdHkuQ09OVEVOVCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBVcGRhdGUgcHJpb3JpdHkuXG4gICAgICAgICAgdGhpcy51cGRhdGVMYXlvdXRQcmlvcml0eShMYXlvdXRQcmlvcml0eS5DT05URU5UKTtcblxuICAgICAgICAgIC8vIExvYWQgYW55IGV4dGVuc2lvbnM7IGRvIG5vdCB3YWl0IG9uIHRoZWlyIHByb21pc2VzIGFzIHRoaXNcbiAgICAgICAgICAvLyBpcyBqdXN0IHRvIHByZWZldGNoLlxuICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbnMgPSBnZXRFeHRlbnNpb25zRnJvbU1ldGFkYXRhKGNyZWF0aXZlTWV0YURhdGFEZWYpO1xuICAgICAgICAgIHByZWxvYWRGcmllbmRseUlmcmFtZUVtYmVkRXh0ZW5zaW9ucyh0aGlzLndpbiwgZXh0ZW5zaW9ucyk7XG5cbiAgICAgICAgICAvLyBQcmVsb2FkIGFueSBmb250cy5cbiAgICAgICAgICAoY3JlYXRpdmVNZXRhRGF0YURlZi5jdXN0b21TdHlsZXNoZWV0cyB8fCBbXSkuZm9yRWFjaCgoZm9udCkgPT5cbiAgICAgICAgICAgIFNlcnZpY2VzLnByZWNvbm5lY3RGb3IodGhpcy53aW4pLnByZWxvYWQoXG4gICAgICAgICAgICAgIHRoaXMuZ2V0QW1wRG9jKCksXG4gICAgICAgICAgICAgIGZvbnQuaHJlZlxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBjb25zdCB1cmxzID0gU2VydmljZXMudXJsRm9yRG9jKHRoaXMuZWxlbWVudCk7XG4gICAgICAgICAgLy8gUHJlbG9hZCBhbnkgQU1QIGltYWdlcy5cbiAgICAgICAgICAoY3JlYXRpdmVNZXRhRGF0YURlZi5pbWFnZXMgfHwgW10pLmZvckVhY2goXG4gICAgICAgICAgICAoaW1hZ2UpID0+XG4gICAgICAgICAgICAgIHVybHMuaXNTZWN1cmUoaW1hZ2UpICYmXG4gICAgICAgICAgICAgIFNlcnZpY2VzLnByZWNvbm5lY3RGb3IodGhpcy53aW4pLnByZWxvYWQodGhpcy5nZXRBbXBEb2MoKSwgaW1hZ2UpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gY3JlYXRpdmVNZXRhRGF0YURlZjtcbiAgICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgYmxvY2sgcmV0dXJucyB0aGUgYWQgY3JlYXRpdmUgaWYgaXQgZXhpc3RzIGFuZCB2YWxpZGF0ZXMgYXMgQU1QO1xuICAgKiBudWxsIG90aGVyd2lzZS5cbiAgICogQHBhcmFtIHshQXJyYXlCdWZmZXJ9IGJ5dGVzXG4gICAqIEBwYXJhbSB7IUhlYWRlcnN9IGhlYWRlcnNcbiAgICogQHJldHVybiB7IVByb21pc2U8P0FycmF5QnVmZmVyPn1cbiAgICovXG4gIG1heWJlVmFsaWRhdGVBbXBDcmVhdGl2ZShieXRlcywgaGVhZGVycykge1xuICAgIGNvbnN0IGNoZWNrU3RpbGxDdXJyZW50ID0gdGhpcy52ZXJpZnlTdGlsbEN1cnJlbnQoKTtcbiAgICByZXR1cm4gdGhpcy5rZXlzZXRQcm9taXNlX1xuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpID09ICdmYWtlJyAmJlxuICAgICAgICAgICF0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjaGVja3NpZycpXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIGRvIG5vdCB2ZXJpZnkgc2lnbmF0dXJlIGZvciBmYWtlIHR5cGUgYWQsIHVubGVzcyB0aGUgYWRcbiAgICAgICAgICAvLyBzcGVjZmljYWxseSByZXF1aXJlcyB2aWEgJ2NoZWNrc2lnJyBhdHRyaWJ1dGVcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFZlcmlmaWNhdGlvblN0YXR1cy5PSyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNpZ25hdHVyZVZlcmlmaWVyRm9yKHRoaXMud2luKS52ZXJpZnkoYnl0ZXMsIGhlYWRlcnMpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChzdGF0dXMpID0+IHtcbiAgICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IG51bGw7XG4gICAgICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgICAgY2FzZSBWZXJpZmljYXRpb25TdGF0dXMuT0s6XG4gICAgICAgICAgICByZXN1bHQgPSBieXRlcztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgVmVyaWZpY2F0aW9uU3RhdHVzLkNSWVBUT19VTkFWQUlMQUJMRTpcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuc2hvdWxkUHJlZmVyZW50aWFsUmVuZGVyV2l0aG91dENyeXB0bygpXG4gICAgICAgICAgICAgID8gYnl0ZXNcbiAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgLy8gVE9ETyhAdGF5bW9uYmVhbCwgIzkyNzQpOiBkaWZmZXJlbnRpYXRlIGJldHdlZW4gdGhlc2VcbiAgICAgICAgICBjYXNlIFZlcmlmaWNhdGlvblN0YXR1cy5FUlJPUl9LRVlfTk9UX0ZPVU5EOlxuICAgICAgICAgIGNhc2UgVmVyaWZpY2F0aW9uU3RhdHVzLkVSUk9SX1NJR05BVFVSRV9NSVNNQVRDSDpcbiAgICAgICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICAgICAgVEFHLFxuICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyksXG4gICAgICAgICAgICAgICdTaWduYXR1cmUgdmVyaWZpY2F0aW9uIGZhaWxlZCdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgY2FzZSBWZXJpZmljYXRpb25TdGF0dXMuVU5WRVJJRklFRDpcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc1NpbmdsZVBhZ2VTdG9yeUFkICYmICFyZXN1bHQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoSU5WQUxJRF9TUFNBX1JFU1BPTlNFKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUG9wdWxhdGVzIG9iamVjdCBtYXBwaW5nIG9mIGZlYXR1cmUgdG8gdmFsdWUgdXNlZCBmb3IgcG9zdCBhZCByZXNwb25zZVxuICAgKiBiZWhhdmlvciBleHBlcmltZW50YXRpb24uICBBc3N1bWVzIGNvbW1hIHNlcGFyYXRlZCwgPSBkZWxpbWl0ZWQga2V5L3ZhbHVlXG4gICAqIHBhaXJzLiAgSWYga2V5IGFwcGVhcnMgbW9yZSB0aGFuIG9uY2UsIGxhc3QgdmFsdWUgd2lucy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwb3B1bGF0ZVBvc3RBZFJlc3BvbnNlRXhwZXJpbWVudEZlYXR1cmVzXyhpbnB1dCkge1xuICAgIGlucHV0LnNwbGl0KCcsJykuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgaWYgKCFsaW5lKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBhcnRzID0gbGluZS5zcGxpdCgnPScpO1xuICAgICAgaWYgKHBhcnRzLmxlbmd0aCAhPSAyIHx8ICFwYXJ0c1swXSkge1xuICAgICAgICBkZXYoKS53YXJuKFRBRywgYGludmFsaWQgZXhwZXJpbWVudCBmZWF0dXJlICR7bGluZX1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5wb3N0QWRSZXNwb25zZUV4cGVyaW1lbnRGZWF0dXJlc1twYXJ0c1swXV0gPSBwYXJ0c1sxXTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZyZXNoZXMgYWQgc2xvdCBieSBmZXRjaGluZyBhIG5ldyBjcmVhdGl2ZSBhbmQgcmVuZGVyaW5nIGl0LiBUaGlzIGxlYXZlc1xuICAgKiB0aGUgY3VycmVudCBjcmVhdGl2ZSBkaXNwbGF5ZWQgdW50aWwgdGhlIG5leHQgb25lIGlzIHJlYWR5LlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IHJlZnJlc2hFbmRDYWxsYmFjayBXaGVuIGNhbGxlZCwgdGhpcyBmdW5jdGlvbiB3aWxsXG4gICAqICAgcmVzdGFydCB0aGUgcmVmcmVzaCBjeWNsZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhbGwgYXN5bmNocm9ub3VzIHBvcnRpb25zIG9mXG4gICAqICAgdGhlIHJlZnJlc2ggZnVuY3Rpb24gY29tcGxldGUuIFRoaXMgaXMgcGFydGljdWxhcmx5IGhhbmR5IGZvciB0ZXN0aW5nLlxuICAgKi9cbiAgcmVmcmVzaChyZWZyZXNoRW5kQ2FsbGJhY2spIHtcbiAgICBkZXZBc3NlcnQoIXRoaXMuaXNSZWZyZXNoaW5nKTtcbiAgICB0aGlzLmlzUmVmcmVzaGluZyA9IHRydWU7XG4gICAgdGhpcy50ZWFyRG93blNsb3QoKTtcbiAgICB0aGlzLmluaXRpYXRlQWRSZXF1ZXN0KCk7XG4gICAgaWYgKCF0aGlzLmFkUHJvbWlzZV8pIHtcbiAgICAgIC8vIEZvciB3aGF0ZXZlciByZWFzb25zLCB0aGUgYWRQcm9taXNlIGhhcyBiZWVuIG51bGxpZmllZCwgYW5kIHdlIHdpbGwgYmVcbiAgICAgIC8vIHVuYWJsZSB0byBwcm9jZWVkLiBUaGUgY3VycmVudCBjcmVhdGl2ZSB3aWxsIGNvbnRpbnVlIHRvIGJlIGRpc3BsYXllZC5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgY29uc3QgcHJvbWlzZUlkID0gdGhpcy5wcm9taXNlSWRfO1xuICAgIHJldHVybiBkZXZBc3NlcnQodGhpcy5hZFByb21pc2VfKS50aGVuKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5pc1JlZnJlc2hpbmcgfHwgcHJvbWlzZUlkICE9IHRoaXMucHJvbWlzZUlkXykge1xuICAgICAgICAvLyBJZiB0aGlzIHJlZnJlc2ggY3ljbGUgd2FzIGNhbmNlbGVkLCBzdWNoIGFzIGluIGEgbm8tY29udGVudFxuICAgICAgICAvLyByZXNwb25zZSBjYXNlLCBrZWVwIHNob3dpbmcgdGhlIG9sZCBjcmVhdGl2ZS5cbiAgICAgICAgcmVmcmVzaEVuZENhbGxiYWNrKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICAvLyBGaXJlIGFuIGFkLXJlZnJlc2ggZXZlbnQgc28gdGhhdCAzcmQgcGFydGllcyBjYW4gdHJhY2sgd2hlbiBhbiBhZFxuICAgICAgICAvLyBoYXMgY2hhbmdlZC5cbiAgICAgICAgdHJpZ2dlckFuYWx5dGljc0V2ZW50KHRoaXMuZWxlbWVudCwgQW5hbHl0aWNzVHJpZ2dlci5BRF9SRUZSRVNIKTtcblxuICAgICAgICB0aGlzLnRvZ2dsZVBsYWNlaG9sZGVyKHRydWUpO1xuICAgICAgICAvLyBUaGlzIGRlbGF5IHByb3ZpZGVzIGEgMSBzZWNvbmQgYnVmZmVyIHdoZXJlIHRoZSBhZCBsb2FkZXIgaXNcbiAgICAgICAgLy8gZGlzcGxheWVkIGluIGJldHdlZW4gdGhlIGNyZWF0aXZlcy5cbiAgICAgICAgcmV0dXJuIFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMud2luKVxuICAgICAgICAgIC5wcm9taXNlKDEwMDApXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc1JlbGF5b3V0TmVlZGVkRmxhZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmdldFJlc291cmNlKCkubGF5b3V0Q2FuY2VsZWQoKTtcbiAgICAgICAgICAgIC8vIE9ubHkgUmVxdWlyZSByZWxheW91dCBhZnRlciBwYWdlIHZpc2libGVcbiAgICAgICAgICAgIHRoaXMuZ2V0QW1wRG9jKClcbiAgICAgICAgICAgICAgLndoZW5OZXh0VmlzaWJsZSgpXG4gICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBTZXJ2aWNlcy5vd25lcnNGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSkuLypPSyovIHJlcXVpcmVMYXlvdXQoXG4gICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdW5jYXVnaHQgZXJyb3JzIHdpdGhpbiBwcm9taXNlIGZsb3cuXG4gICAqIEBwYXJhbSB7Kn0gZXJyb3JcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2lnbm9yZVN0YWNrXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm9taXNlRXJyb3JIYW5kbGVyXyhlcnJvciwgb3B0X2lnbm9yZVN0YWNrKSB7XG4gICAgaWYgKGlzQ2FuY2VsbGF0aW9uKGVycm9yKSkge1xuICAgICAgLy8gUmV0aHJvdyBpZiBjYW5jZWxsYXRpb24uXG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkge1xuICAgICAgZXJyb3IgPSBkdXBsaWNhdGVFcnJvcklmTmVjZXNzYXJ5KC8qKiBAdHlwZSB7IUVycm9yfSAqLyAoZXJyb3IpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ3Vua25vd24gZXJyb3IgJyArIGVycm9yKTtcbiAgICB9XG4gICAgaWYgKG9wdF9pZ25vcmVTdGFjaykge1xuICAgICAgZXJyb3IuaWdub3JlU3RhY2sgPSBvcHRfaWdub3JlU3RhY2s7XG4gICAgfVxuXG4gICAgLy8gQWRkIGB0eXBlYCB0byB0aGUgbWVzc2FnZS4gRW5zdXJlIHRvIHByZXNlcnZlIHRoZSBvcmlnaW5hbCBzdGFjay5cbiAgICBjb25zdCB0eXBlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpIHx8ICdub3R5cGUnO1xuICAgIGlmIChlcnJvci5tZXNzYWdlLmluZGV4T2YoYCR7VEFHfTogJHt0eXBlfTpgKSAhPSAwKSB7XG4gICAgICBlcnJvci5tZXNzYWdlID0gYCR7VEFHfTogJHt0eXBlfTogJHtlcnJvci5tZXNzYWdlfWA7XG4gICAgfVxuXG4gICAgLy8gQWRkaXRpb25hbCBhcmd1bWVudHMuXG4gICAgYXNzaWduQWRVcmxUb0Vycm9yKC8qKiBAdHlwZSB7IUVycm9yfSAqLyAoZXJyb3IpLCB0aGlzLmFkVXJsXyk7XG5cbiAgICBpZiAoZ2V0TW9kZSgpLmRldmVsb3BtZW50IHx8IGdldE1vZGUoKS5sb2NhbERldiB8fCBnZXRNb2RlKCkubG9nKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoVEFHLCBlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVzZXIoKS53YXJuKFRBRywgZXJyb3IpO1xuICAgICAgLy8gUmVwb3J0IHdpdGggMSUgc2FtcGxpbmcgYXMgYW4gZXhwZWN0ZWQgZGV2IGVycm9yLlxuICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjAxKSB7XG4gICAgICAgIGRldigpLmV4cGVjdGVkRXJyb3IoVEFHLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICBpZiAodGhpcy5pc1JlZnJlc2hpbmcpIHtcbiAgICAgIHRoaXMuZGVzdHJveUZyYW1lKHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hdHRlbXB0VG9SZW5kZXJDcmVhdGl2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgb2JzZXJ2ZVdpdGhTaGFyZWRJbk9iKHRoaXMuZWxlbWVudCwgdGhpcy5ib3VuZFZpZXdwb3J0Q2FsbGJhY2tfKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXBzIHRvIHJlbmRlciB0aGUgcmV0dXJuZWQgY3JlYXRpdmUgZm9sbG93aW5nIHRoZSByZXNvbHV0aW9uIG9mIHRoZVxuICAgKiBhZFByb21pc2UuXG4gICAqXG4gICAqIEByZXR1cm4geyFQcm9taXNlPGJvb2xlYW4+fCFQcm9taXNlPHVuZGVmaW5lZD59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzXG4gICAqICAgd2hlbiB0aGUgcmVuZGVyaW5nIGF0dGVtcHQgaGFzIGZpbmlzaGVkLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBhdHRlbXB0VG9SZW5kZXJDcmVhdGl2ZSgpIHtcbiAgICAvLyBQcm9taXNlIG1heSBiZSBudWxsIGlmIGVsZW1lbnQgd2FzIGRldGVybWluZWQgdG8gYmUgaW52YWxpZCBmb3IgQTRBLlxuICAgIGlmICghdGhpcy5hZFByb21pc2VfKSB7XG4gICAgICBpZiAodGhpcy5zaG91bGRJbml0aWFsaXplUHJvbWlzZUNoYWluXygpKSB7XG4gICAgICAgIGRldigpLmVycm9yKFRBRywgJ051bGwgcHJvbWlzZSBpbiBsYXlvdXRDYWxsYmFjaycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICBjb25zdCBjaGVja1N0aWxsQ3VycmVudCA9IHRoaXMudmVyaWZ5U3RpbGxDdXJyZW50KCk7XG4gICAgLy8gUHJvbWlzZSBjaGFpbiB3aWxsIGhhdmUgZGV0ZXJtaW5lZCBpZiBjcmVhdGl2ZSBpcyB2YWxpZCBBTVAuXG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5hZFByb21pc2VfLFxuICAgICAgdGhpcy51aUhhbmRsZXIuZ2V0U2Nyb2xsUHJvbWlzZUZvclN0aWNreUFkKCksXG4gICAgXSlcbiAgICAgIC50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcblxuICAgICAgICB0aGlzLnVpSGFuZGxlci5tYXliZUluaXRTdGlja3lBZCgpO1xuICAgICAgICBjb25zdCBjcmVhdGl2ZU1ldGFEYXRhID0gdmFsdWVzWzBdO1xuICAgICAgICBpZiAodGhpcy5pc0NvbGxhcHNlZF8pIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdGhpcy5pZnJhbWUgYWxyZWFkeSBleGlzdHMsIGFuZCB3ZSdyZSBub3QgY3VycmVudGx5IGluIHRoZSBtaWRkbGVcbiAgICAgICAgLy8gb2YgcmVmcmVzaGluZywgYmFpbCBvdXQgaGVyZS4gVGhpcyBzaG91bGQgb25seSBoYXBwZW4gaW5cbiAgICAgICAgLy8gdGVzdGluZyBjb250ZXh0LCBub3QgaW4gcHJvZHVjdGlvbi5cbiAgICAgICAgaWYgKHRoaXMuaWZyYW1lICYmICF0aGlzLmlzUmVmcmVzaGluZykge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY3JlYXRpdmVNZXRhRGF0YSkge1xuICAgICAgICAgIC8vIE5vbi1BTVAgY3JlYXRpdmUgY2FzZSwgd2lsbCB2ZXJpZnkgYWQgdXJsIGV4aXN0ZW5jZS5cbiAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJOb25BbXBDcmVhdGl2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZyaWVuZGx5UmVuZGVyUHJvbWlzZTtcblxuICAgICAgICBpZiAodGhpcy5pc0luTm9TaWduaW5nRXhwKCkpIHtcbiAgICAgICAgICBmcmllbmRseVJlbmRlclByb21pc2UgPSB0aGlzLnJlbmRlckZyaWVuZGx5VHJ1c3RsZXNzXyhcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7IS4vaGVhZC12YWxpZGF0aW9uLlZhbGlkYXRlZEhlYWREZWZ9ICovIChcbiAgICAgICAgICAgICAgY3JlYXRpdmVNZXRhRGF0YVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGNoZWNrU3RpbGxDdXJyZW50XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcmllbmRseVJlbmRlclByb21pc2UgPSB0aGlzLnJlbmRlckFtcENyZWF0aXZlXyhcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7IUNyZWF0aXZlTWV0YURhdGFEZWZ9ICovIChjcmVhdGl2ZU1ldGFEYXRhKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNdXN0IGJlIGFuIEFNUCBjcmVhdGl2ZS5cbiAgICAgICAgcmV0dXJuIGZyaWVuZGx5UmVuZGVyUHJvbWlzZS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgICAgICAvLyBGYWlsZWQgdG8gcmVuZGVyIHZpYSBBTVAgY3JlYXRpdmUgcGF0aCBzbyBmYWxsYmFjayB0byBub24tQU1QXG4gICAgICAgICAgLy8gcmVuZGVyaW5nIHdpdGhpbiBjcm9zcyBkb21haW4gaWZyYW1lLlxuICAgICAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICAgICAgVEFHLFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLFxuICAgICAgICAgICAgJ0Vycm9yIGluamVjdGluZyBjcmVhdGl2ZSBpbiBmcmllbmRseSBmcmFtZScsXG4gICAgICAgICAgICBlcnJcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlck5vbkFtcENyZWF0aXZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgdGhpcy5wcm9taXNlRXJyb3JIYW5kbGVyXyhlcnJvcik7XG4gICAgICAgIHRocm93IGNhbmNlbGxhdGlvbigpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgYWQgcmVxdWVzdCBtYXkgYmUgc2VudCB1c2luZyBYSFIuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1hockFsbG93ZWQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGF0dGVtcHRDaGFuZ2VTaXplKG5ld0hlaWdodCwgbmV3V2lkdGgpIHtcbiAgICAvLyBTdG9yZSBvcmlnaW5hbCBzaXplIG9mIHNsb3QgaW4gb3JkZXIgdG8gYWxsb3cgcmUtZXhwYW5zaW9uIG9uXG4gICAgLy8gdW5sYXlvdXRDYWxsYmFjayBzbyB0aGF0IGl0IGlzIHJldmVydGVkIHRvIG9yaWdpbmFsIHNpemUgaW4gY2FzZVxuICAgIC8vIG9mIHJlc3VtZUNhbGxiYWNrLlxuICAgIHRoaXMub3JpZ2luYWxTbG90U2l6ZV8gPSB0aGlzLm9yaWdpbmFsU2xvdFNpemVfIHx8IHRoaXMuZ2V0TGF5b3V0U2l6ZSgpO1xuICAgIHJldHVybiBzdXBlci5hdHRlbXB0Q2hhbmdlU2l6ZShuZXdIZWlnaHQsIG5ld1dpZHRoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgICovXG4gIHVubGF5b3V0Q2FsbGJhY2soKSB7XG4gICAgdW5vYnNlcnZlV2l0aFNoYXJlZEluT2IodGhpcy5lbGVtZW50KTtcbiAgICB0aGlzLnRlYXJEb3duU2xvdCgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIHRlYXIgZG93biBhbmQgc2V0IGFsbCBzdGF0ZSB2YXJpYWJsZXMgdG8gaW5pdGlhbCBjb25kaXRpb25zLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICB0ZWFyRG93blNsb3QoKSB7XG4gICAgLy8gSW5jcmVtZW50IHByb21pc2VJZCB0byBjYXVzZSBhbnkgcGVuZGluZyBwcm9taXNlIHRvIGNhbmNlbC5cbiAgICB0aGlzLnByb21pc2VJZF8rKztcbiAgICB0aGlzLnVpSGFuZGxlci5hcHBseVVubGF5b3V0VUkoKTtcbiAgICBpZiAodGhpcy5vcmlnaW5hbFNsb3RTaXplXykge1xuICAgICAgc3VwZXJcbiAgICAgICAgLmF0dGVtcHRDaGFuZ2VTaXplKFxuICAgICAgICAgIHRoaXMub3JpZ2luYWxTbG90U2l6ZV8uaGVpZ2h0LFxuICAgICAgICAgIHRoaXMub3JpZ2luYWxTbG90U2l6ZV8ud2lkdGhcbiAgICAgICAgKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5vcmlnaW5hbFNsb3RTaXplXyA9IG51bGw7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgLy8gVE9ETyhrZWl0aHdyaWdodGJvcyk6IGlmIHdlIGFyZSB1bmFibGUgdG8gcmV2ZXJ0IHNpemUsIG9uIG5leHRcbiAgICAgICAgICAvLyB0cmlnZ2VyIG9mIHByb21pc2UgY2hhaW4gdGhlIGFkIHJlcXVlc3QgbWF5IGZhaWwgZHVlIHRvIGludmFsaWRcbiAgICAgICAgICAvLyBzbG90IHNpemUuICBEZXRlcm1pbmUgaG93IHRvIGhhbmRsZSB0aGlzIGNhc2UuXG4gICAgICAgICAgZGV2KCkud2FybihUQUcsICd1bmFibGUgdG8gcmV2ZXJ0IHRvIG9yaWdpbmFsIHNpemUnLCBlcnIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmlzQ29sbGFwc2VkXyA9IGZhbHNlO1xuXG4gICAgLy8gUmVtb3ZlIHJlbmRlcmluZyBmcmFtZSwgaWYgaXQgZXhpc3RzLlxuICAgIHRoaXMuZGVzdHJveUZyYW1lKCk7XG4gICAgdGhpcy5hZFByb21pc2VfID0gbnVsbDtcbiAgICB0aGlzLmFkVXJsXyA9IG51bGw7XG4gICAgdGhpcy5jcmVhdGl2ZUJvZHlfID0gbnVsbDtcbiAgICB0aGlzLmlzVmVyaWZpZWRBbXBDcmVhdGl2ZV8gPSBmYWxzZTtcbiAgICB0aGlzLnRyYW5zZmVyRG9tQm9keV8gPSBudWxsO1xuICAgIHRoaXMuZXhwZXJpbWVudGFsTm9uQW1wQ3JlYXRpdmVSZW5kZXJNZXRob2RfID1cbiAgICAgIHRoaXMuZ2V0Tm9uQW1wQ3JlYXRpdmVSZW5kZXJpbmdNZXRob2QoKTtcbiAgICB0aGlzLnBvc3RBZFJlc3BvbnNlRXhwZXJpbWVudEZlYXR1cmVzID0ge307XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRldGFjaGVkQ2FsbGJhY2soKSB7XG4gICAgc3VwZXIuZGV0YWNoZWRDYWxsYmFjaygpO1xuICAgIHRoaXMuZGVzdHJveUZyYW1lKHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIHJlbW92ZSB0aGUgY3VycmVudCBmcmFtZSBhbmQgZnJlZSBhbnkgYXNzb2NpYXRlZCByZXNvdXJjZXMuXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBuby1vcCBpZiB0aGlzIGFkIHNsb3QgaXMgY3VycmVudGx5IGluIHRoZSBwcm9jZXNzIG9mXG4gICAqIGJlaW5nIHJlZnJlc2hlZC5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFuPX0gZm9yY2UgRm9yY2VzIHRoZSByZW1vdmFsIG9mIHRoZSBmcmFtZSwgZXZlbiBpZlxuICAgKiAgIHRoaXMuaXNSZWZyZXNoaW5nIGlzIHRydWUuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGRlc3Ryb3lGcmFtZShmb3JjZSA9IGZhbHNlKSB7XG4gICAgaWYgKCFmb3JjZSAmJiB0aGlzLmlzUmVmcmVzaGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBBbGxvdyBlbWJlZCB0byByZWxlYXNlIGl0cyByZXNvdXJjZXMuXG4gICAgaWYgKHRoaXMuZnJpZW5kbHlJZnJhbWVFbWJlZF8pIHtcbiAgICAgIHRoaXMuZnJpZW5kbHlJZnJhbWVFbWJlZF8uZGVzdHJveSgpO1xuICAgICAgdGhpcy5mcmllbmRseUlmcmFtZUVtYmVkXyA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLmlmcmFtZSAmJiB0aGlzLmlmcmFtZS5wYXJlbnRFbGVtZW50KSB7XG4gICAgICB0aGlzLmlmcmFtZS5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuaWZyYW1lKTtcbiAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMueE9yaWdpbklmcmFtZUhhbmRsZXJfKSB7XG4gICAgICB0aGlzLnhPcmlnaW5JZnJhbWVIYW5kbGVyXy5mcmVlWE9yaWdpbklmcmFtZSgpO1xuICAgICAgdGhpcy54T3JpZ2luSWZyYW1lSGFuZGxlcl8gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy51aUhhbmRsZXIpIHtcbiAgICAgIHRoaXMudWlIYW5kbGVyLmNsZWFudXAoKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPOiBSZW5hbWUgdG8gdmlld3BvcnRDYWxsYmFjayBvbmNlIEJhc2VFbGVtZW50LnZpZXdwb3J0Q2FsbGJhY2sgaGFzIGJlZW4gcmVtb3ZlZC5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gIGluVmlld3BvcnRcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgdmlld3BvcnRDYWxsYmFja1RlbXAoaW5WaWV3cG9ydCkge1xuICAgIGlmICh0aGlzLnhPcmlnaW5JZnJhbWVIYW5kbGVyXykge1xuICAgICAgdGhpcy54T3JpZ2luSWZyYW1lSGFuZGxlcl8udmlld3BvcnRDYWxsYmFjayhpblZpZXdwb3J0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgQWQgVVJMIHRvIHNlbmQgYW4gWEhSIFJlcXVlc3QgdG8uICBUbyBiZSBpbXBsZW1lbnRlZFxuICAgKiBieSBuZXR3b3JrLlxuICAgKiBAcGFyYW0geyFDb25zZW50VHVwbGVEZWY9fSBvcHRfdW51bnNlZENvbnNlbnRUdXBsZVxuICAgKiBAcGFyYW0ge1Byb21pc2U8IUFycmF5PHJ0Y1Jlc3BvbnNlRGVmPj49fSBvcHRfcnRjUmVzcG9uc2VzUHJvbWlzZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfc2VydmVOcGFTaWduYWxcbiAgICogQHJldHVybiB7IVByb21pc2U8c3RyaW5nPnxzdHJpbmd9XG4gICAqL1xuICBnZXRBZFVybChcbiAgICBvcHRfdW51bnNlZENvbnNlbnRUdXBsZSxcbiAgICBvcHRfcnRjUmVzcG9uc2VzUHJvbWlzZSxcbiAgICBvcHRfc2VydmVOcGFTaWduYWxcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdnZXRBZFVybCBub3QgaW1wbGVtZW50ZWQhJyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBgYWx3YXlzLXNlcnZlLW5wYWAgYXR0cmlidXRlIGlzIHByZXNlbnQgYW5kIHZhbGlkXG4gICAqIGJhc2VkIG9uIHRoZSBnZW9sb2NhdGlvbi4gIFRvIGJlIGltcGxlbWVudGVkIGJ5IG5ldHdvcmsuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPGJvb2xlYW4+fVxuICAgKi9cbiAgZ2V0U2VydmVOcGFTaWduYWwoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBgYmxvY2stcnRjYCBhdHRyaWJ1dGUgaXMgcHJlc2VudCBhbmQgdmFsaWRcbiAgICogYmFzZWQgb24gdGhlIGdlb2xvY2F0aW9uLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxib29sZWFuPn1cbiAgICovXG4gIGdldEJsb2NrUnRjXygpIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2Jsb2NrLXJ0YycpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICB9XG4gICAgcmV0dXJuIFNlcnZpY2VzLmdlb0ZvckRvY09yTnVsbCh0aGlzLmVsZW1lbnQpLnRoZW4oKGdlb1NlcnZpY2UpID0+IHtcbiAgICAgIHVzZXJBc3NlcnQoZ2VvU2VydmljZSwgJyVzOiByZXF1aXJlcyA8YW1wLWdlbz4gdG8gdXNlIGBibG9jay1ydGNgJywgVEFHKTtcbiAgICAgIGNvbnN0IGJsb2NrUnRjTG9jYXRpb25zID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnYmxvY2stcnRjJyk7XG4gICAgICBjb25zdCBsb2NhdGlvbnMgPSBibG9ja1J0Y0xvY2F0aW9ucy5zcGxpdCgnLCcpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZ2VvR3JvdXAgPSBnZW9TZXJ2aWNlLmlzSW5Db3VudHJ5R3JvdXAobG9jYXRpb25zW2ldKTtcbiAgICAgICAgaWYgKGdlb0dyb3VwID09PSBHRU9fSU5fR1JPVVAuSU4pIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChnZW9Hcm91cCA9PT0gR0VPX0lOX0dST1VQLk5PVF9ERUZJTkVEKSB7XG4gICAgICAgICAgdXNlcigpLndhcm4oJ0FNUC1BRCcsIGBHZW8gZ3JvdXAgXCIke2xvY2F0aW9uc1tpXX1cIiB3YXMgbm90IGRlZmluZWQuYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIE5vdCBpbiBhbnkgb2YgdGhlIGRlZmluZWQgZ2VvIGdyb3Vwcy5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgYWQgdXJsIHN0YXRlIHRvIG51bGwsIHVzZWQgdG8gcHJldmVudCBmcmFtZSBnZXQgZmFsbGJhY2sgaWYgZXJyb3JcbiAgICogaXMgdGhyb3duIGFmdGVyIHVybCBjb25zdHJ1Y3Rpb24gYnV0IHByaW9yIHRvIGxheW91dENhbGxiYWNrLlxuICAgKi9cbiAgcmVzZXRBZFVybCgpIHtcbiAgICB0aGlzLmFkVXJsXyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7ZnVuY3Rpb24oKX0gZnVuY3Rpb24gdGhhdCB3aGVuIGNhbGxlZCB3aWxsIHZlcmlmeSBpZiBjdXJyZW50XG4gICAqICAgIGFkIHJldHJpZXZhbCBpcyBjdXJyZW50IChtZWFuaW5nIHVubGF5b3V0Q2FsbGJhY2sgd2FzIG5vdCBleGVjdXRlZCkuXG4gICAqICAgIElmIG5vdCwgd2lsbCB0aHJvdyBjYW5jZWxsYXRpb24gZXhjZXB0aW9uO1xuICAgKiBAdGhyb3dzIHtFcnJvcn1cbiAgICovXG4gIHZlcmlmeVN0aWxsQ3VycmVudCgpIHtcbiAgICBjb25zdCBwcm9taXNlSWQgPSB0aGlzLnByb21pc2VJZF87XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChwcm9taXNlSWQgIT0gdGhpcy5wcm9taXNlSWRfKSB7XG4gICAgICAgIHRocm93IGNhbmNlbGxhdGlvbigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHRoZSBkZXNpcmVkIHNpemUgb2YgdGhlIGNyZWF0aXZlIGJhc2VkIG9uIHRoZSBIVFRQIHJlc3BvbnNlXG4gICAqIGhlYWRlcnMuIE11c3QgYmUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBvcmlnaW5hbCBzaXplIG9mIHRoZSBhZCBzbG90XG4gICAqIGFsb25nIGVhY2ggZGltZW5zaW9uLiBNYXkgYmUgb3ZlcnJpZGRlbiBieSBuZXR3b3JrLlxuICAgKlxuICAgKiBAcGFyYW0geyFIZWFkZXJzfSByZXNwb25zZUhlYWRlcnNcbiAgICogQHJldHVybiB7P1NpemVJbmZvRGVmfVxuICAgKi9cbiAgZXh0cmFjdFNpemUocmVzcG9uc2VIZWFkZXJzKSB7XG4gICAgY29uc3QgaGVhZGVyVmFsdWUgPSByZXNwb25zZUhlYWRlcnMuZ2V0KENSRUFUSVZFX1NJWkVfSEVBREVSKTtcbiAgICBpZiAoIWhlYWRlclZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbWF0Y2ggPSAvXihbMC05XSspeChbMC05XSspJC8uZXhlYyhoZWFkZXJWYWx1ZSk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgLy8gVE9ETyhAdGF5bW9uYmVhbCwgIzkyNzQpOiByZXBsYWNlIHRoaXMgd2l0aCByZWFsIGVycm9yIHJlcG9ydGluZ1xuICAgICAgdXNlcigpLmVycm9yKFRBRywgYEludmFsaWQgc2l6ZSBoZWFkZXI6ICR7aGVhZGVyVmFsdWV9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7P1NpemVJbmZvRGVmfSAqLyAoe1xuICAgICAgd2lkdGg6IE51bWJlcihtYXRjaFsxXSksXG4gICAgICBoZWlnaHQ6IE51bWJlcihtYXRjaFsyXSksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2VzIHRoZSBVSSBIYW5kbGVyIHRvIGNvbGxhcHNlIHRoaXMgc2xvdC5cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBmb3JjZUNvbGxhcHNlKCkge1xuICAgIGlmICh0aGlzLmlzUmVmcmVzaGluZykge1xuICAgICAgLy8gSWYsIGZvciB3aGF0ZXZlciByZWFzb24sIHRoZSBuZXcgY3JlYXRpdmUgd291bGQgY29sbGFwc2UgdGhpcyBzbG90LFxuICAgICAgLy8gc3RpY2sgd2l0aCB0aGUgb2xkIGNyZWF0aXZlIHVudGlsIHRoZSBuZXh0IHJlZnJlc2ggY3ljbGUuXG4gICAgICB0aGlzLmlzUmVmcmVzaGluZyA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkZXZBc3NlcnQodGhpcy51aUhhbmRsZXIpO1xuICAgIC8vIFN0b3JlIG9yaWdpbmFsIHNpemUgdG8gYWxsb3cgZm9yIHJldmVydGluZyBvbiB1bmxheW91dENhbGxiYWNrIHNvIHRoYXRcbiAgICAvLyBzdWJzZXF1ZW50IHBhZ2V2aWV3IGFsbG93cyBmb3IgYWQgcmVxdWVzdC5cbiAgICB0aGlzLm9yaWdpbmFsU2xvdFNpemVfID0gdGhpcy5vcmlnaW5hbFNsb3RTaXplXyB8fCB0aGlzLmdldExheW91dFNpemUoKTtcbiAgICB0aGlzLnVpSGFuZGxlci5hcHBseU5vQ29udGVudFVJKCk7XG4gICAgdGhpcy5pc0NvbGxhcHNlZF8gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGV4ZWN1dGVkIHdoZW4gY3JlYXRpdmUgaGFzIHN1Y2Nlc3NmdWxseSByZW5kZXJlZCB3aXRoaW4gdGhlXG4gICAqIHB1Ymxpc2hlciBwYWdlIGJ1dCBwcmlvciB0byBsb2FkIChvciBpbmktbG9hZCBmb3IgZnJpZW5kbHkgZnJhbWUgQU1QXG4gICAqIGNyZWF0aXZlIHJlbmRlcikuICBUbyBiZSBvdmVycmlkZGVuIGJ5IG5ldHdvcmsgaW1wbGVtZW50YXRpb25zIGFzIG5lZWRlZC5cbiAgICpcbiAgICogQHBhcmFtIHs/Q3JlYXRpdmVNZXRhRGF0YURlZn0gY3JlYXRpdmVNZXRhRGF0YSBtZXRhZGF0YSBpZiBBTVAgY3JlYXRpdmUsXG4gICAqICAgIG51bGwgb3RoZXJ3aXNlLlxuICAgKiBAcGFyYW0geyFQcm9taXNlPX0gb3B0X29uTG9hZFByb21pc2UgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIEZJRSdzXG4gICAqICAgIGNoaWxkIHdpbmRvdyBmaXJlcyB0aGUgYG9ubG9hZGAgZXZlbnQuXG4gICAqL1xuICBvbkNyZWF0aXZlUmVuZGVyKGNyZWF0aXZlTWV0YURhdGEsIG9wdF9vbkxvYWRQcm9taXNlKSB7XG4gICAgdGhpcy5tYXliZVRyaWdnZXJBbmFseXRpY3NFdmVudF8oXG4gICAgICBjcmVhdGl2ZU1ldGFEYXRhID8gJ3JlbmRlckZyaWVuZGx5RW5kJyA6ICdyZW5kZXJDcm9zc0RvbWFpbkVuZCdcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGlmcmFtZSB0aGF0IHdhcyBqdXN0IGNyZWF0ZWQuICBUbyBiZSBvdmVycmlkZGVuIGZvclxuICAgKiB0ZXN0aW5nLlxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIG9uQ3Jvc3NEb21haW5JZnJhbWVDcmVhdGVkKGlmcmFtZSkge1xuICAgIGRldigpLmluZm8oXG4gICAgICBUQUcsXG4gICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyksXG4gICAgICBgb25Dcm9zc0RvbWFpbklmcmFtZUNyZWF0ZWQgJHtpZnJhbWV9YFxuICAgICk7XG4gIH1cblxuICAvKiogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciBodG1sIGNyZWF0aXZlcyBzaG91bGQgYmUgc2FuZGJveGVkLiAqL1xuICBzYW5kYm94SFRNTENyZWF0aXZlRnJhbWUoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhZCByZXF1ZXN0LCBleHRyYWN0IHRoZSBjcmVhdGl2ZSBhbmQgc2lnbmF0dXJlIGZyb20gdGhlIHJlc3BvbnNlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWRVcmwgUmVxdWVzdCBVUkwgdG8gc2VuZCBYSFIgdG8uXG4gICAqIEByZXR1cm4geyFQcm9taXNlPD9SZXNwb25zZT59XG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIHNlbmRYaHJSZXF1ZXN0KGFkVXJsKSB7XG4gICAgdGhpcy5tYXliZVRyaWdnZXJBbmFseXRpY3NFdmVudF8oJ2FkUmVxdWVzdFN0YXJ0Jyk7XG4gICAgY29uc3QgeGhySW5pdCA9IHtcbiAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgIH07XG4gICAgcmV0dXJuIFNlcnZpY2VzLnhockZvcih0aGlzLndpbilcbiAgICAgIC5mZXRjaChhZFVybCwgeGhySW5pdClcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlICYmIGVycm9yLnJlc3BvbnNlLnN0YXR1cyA+IDIwMCkge1xuICAgICAgICAgIC8vIEludmFsaWQgc2VydmVyIHJlc3BvbnNlIGNvZGUgc28gd2Ugc2hvdWxkIGNvbGxhcHNlLlxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIGFuIGVycm9yIG9jY3VycywgbGV0IHRoZSBhZCBiZSByZW5kZXJlZCB2aWEgaWZyYW1lIGFmdGVyIGRlbGF5LlxuICAgICAgICAvLyBUT0RPKHRheW1vbmJlYWwpOiBGaWd1cmUgb3V0IGEgbW9yZSBzb3BoaXN0aWNhdGVkIHRlc3QgZm9yIGRlY2lkaW5nXG4gICAgICAgIC8vIHdoZXRoZXIgdG8gcmV0cnkgd2l0aCBhbiBpZnJhbWUgYWZ0ZXIgYW4gYWQgcmVxdWVzdCBmYWlsdXJlIG9yIGp1c3RcbiAgICAgICAgLy8gZ2l2ZSB1cCBhbmQgcmVuZGVyIHRoZSBmYWxsYmFjayBjb250ZW50IChvciBjb2xsYXBzZSB0aGUgYWQgc2xvdCkuXG4gICAgICAgIGNvbnN0IG5ldHdvcmtGYWlsdXJlSGFuZGxlclJlc3VsdCA9IHRoaXMub25OZXR3b3JrRmFpbHVyZShcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi8gKHRoaXMuYWRVcmxfKVxuICAgICAgICApO1xuICAgICAgICBkZXZBc3NlcnQoISFuZXR3b3JrRmFpbHVyZUhhbmRsZXJSZXN1bHQpO1xuICAgICAgICBpZiAobmV0d29ya0ZhaWx1cmVIYW5kbGVyUmVzdWx0LmZyYW1lR2V0RGlzYWJsZWQpIHtcbiAgICAgICAgICAvLyBSZXNldCBhZFVybCB0byBudWxsIHdoaWNoIHdpbGwgY2F1c2UgbGF5b3V0Q2FsbGJhY2sgdG8gbm90XG4gICAgICAgICAgLy8gZmV0Y2ggdmlhIGZyYW1lIEdFVC5cbiAgICAgICAgICBkZXYoKS5pbmZvKFxuICAgICAgICAgICAgVEFHLFxuICAgICAgICAgICAgJ2ZyYW1lIGdldCBkaXNhYmxlZCBhcyBwYXJ0IG9mIG5ldHdvcmsgZmFpbHVyZSBoYW5kbGVyJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgdGhpcy5yZXNldEFkVXJsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5hZFVybF8gPSBuZXR3b3JrRmFpbHVyZUhhbmRsZXJSZXN1bHQuYWRVcmwgfHwgdGhpcy5hZFVybF87XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KE5FVFdPUktfRkFJTFVSRSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gbmV0d29yayBmYWlsdXJlIHNlbmRpbmcgWEhSIENPUlMgYWQgcmVxdWVzdCBhbGxvd2luZyBmb3JcbiAgICogbW9kaWZpY2F0aW9uIG9mIGFkIHVybCBhbmQgcHJldmVudCBmcmFtZSBHRVQgcmVxdWVzdCBvbiBsYXlvdXRDYWxsYmFjay5cbiAgICogQnkgZGVmYXVsdCwgR0VUIGZyYW1lIHJlcXVlc3Qgd2lsbCBiZSBleGVjdXRlZCB3aXRoIHNhbWUgYWQgVVJMIGFzIHVzZWRcbiAgICogZm9yIFhIUiBDT1JTIHJlcXVlc3QuXG4gICAqIEBwYXJhbSB7Kn0gdW51c2VkRXJyb3IgZnJvbSBuZXR3b3JrIGZhaWx1cmVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVudXNlZEFkVXJsIHVzZWQgZm9yIG5ldHdvcmsgcmVxdWVzdFxuICAgKiBAcmV0dXJuIHshe2FkVXJsOiAoc3RyaW5nfHVuZGVmaW5lZCksIGZyYW1lR2V0RGlzYWJsZWQ6IChib29sZWFufHVuZGVmaW5lZCl9fVxuICAgKi9cbiAgb25OZXR3b3JrRmFpbHVyZSh1bnVzZWRFcnJvciwgdW51c2VkQWRVcmwpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICAvKipcbiAgICogVG8gYmUgb3ZlcnJpZGRlbiBieSBuZXR3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGluZGljYXRpbmcgd2hpY2hcbiAgICogc2lnbmluZyBzZXJ2aWNlKHMpIGlzIHRvIGJlIHVzZWQuXG4gICAqIEByZXR1cm4geyFBcnJheTxzdHJpbmc+fSBBIGxpc3Qgb2Ygc2lnbmluZyBzZXJ2aWNlcy5cbiAgICovXG4gIGdldFNpZ25pbmdTZXJ2aWNlTmFtZXMoKSB7XG4gICAgcmV0dXJuIGdldE1vZGUoKS5sb2NhbERldiA/IFsnZ29vZ2xlJywgJ2dvb2dsZS1kZXYnXSA6IFsnZ29vZ2xlJ107XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIG5vbi1BTVAgY3JlYXRpdmUgd2l0aGluIGNyb3NzIGRvbWFpbiBpZnJhbWUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHRocm90dGxlQXBwbGllZCBXaGV0aGVyIGluY3JlbWVudExvYWRpbmdBZHMgaGFzIGFscmVhZHlcbiAgICogICAgYmVlbiBjYWxsZWRcbiAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn0gV2hldGhlciB0aGUgY3JlYXRpdmUgd2FzIHN1Y2Nlc3NmdWxseSByZW5kZXJlZC5cbiAgICovXG4gIHJlbmRlck5vbkFtcENyZWF0aXZlKHRocm90dGxlQXBwbGllZCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXNhYmxlM3BmYWxsYmFjaycpID09ICd0cnVlJykge1xuICAgICAgdXNlcigpLndhcm4oXG4gICAgICAgIFRBRyxcbiAgICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLFxuICAgICAgICAnZmFsbGJhY2sgdG8gM3AgZGlzYWJsZWQnXG4gICAgICApO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuICAgIC8vIFRPRE8oa2VpdGh3cmlnaHRib3MpOiByZW1vdmUgd2hlbiBubyBsb25nZXIgbmVlZGVkLlxuICAgIGRldigpLndhcm4oVEFHLCAnZmFsbGJhY2sgdG8gM3AnKTtcbiAgICAvLyBIYXZlbid0IHJlbmRlcmVkIHlldCwgc28gdHJ5IHJlbmRlcmluZyB2aWEgb25lIG9mIG91clxuICAgIC8vIGNyb3NzLWRvbWFpbiBpZnJhbWUgc29sdXRpb25zLlxuICAgIGNvbnN0IG1ldGhvZCA9IHRoaXMuZXhwZXJpbWVudGFsTm9uQW1wQ3JlYXRpdmVSZW5kZXJNZXRob2RfO1xuICAgIGxldCByZW5kZXJQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICBpZiAoXG4gICAgICAobWV0aG9kID09IFhPUklHSU5fTU9ERS5TQUZFRlJBTUUgfHwgbWV0aG9kID09IFhPUklHSU5fTU9ERS5OQU1FRlJBTUUpICYmXG4gICAgICB0aGlzLmNyZWF0aXZlQm9keV9cbiAgICApIHtcbiAgICAgIHJlbmRlclByb21pc2UgPSB0aGlzLnJlbmRlclZpYU5hbWVBdHRyT2ZYT3JpZ2luSWZyYW1lXyhcbiAgICAgICAgdGhpcy5jcmVhdGl2ZUJvZHlfXG4gICAgICApO1xuICAgICAgdGhpcy5jcmVhdGl2ZUJvZHlfID0gbnVsbDsgLy8gRnJlZSByZXNvdXJjZXMuXG4gICAgfSBlbHNlIGlmICh0aGlzLmFkVXJsXykge1xuICAgICAgYXNzZXJ0SHR0cHNVcmwodGhpcy5hZFVybF8sIHRoaXMuZWxlbWVudCk7XG4gICAgICByZW5kZXJQcm9taXNlID0gdGhpcy5yZW5kZXJWaWFJZnJhbWVHZXRfKHRoaXMuYWRVcmxfKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQWQgVVJMIG1heSBub3QgZXhpc3QgaWYgYnVpbGRBZFVybCB0aHJvd3MgZXJyb3Igb3IgcmV0dXJucyBlbXB0eS5cbiAgICAgIC8vIElmIGVycm9yIG9jY3VycmVkLCBpdCB3b3VsZCBoYXZlIGFscmVhZHkgYmVlbiByZXBvcnRlZCBidXQgbGV0J3NcbiAgICAgIC8vIHJlcG9ydCB0byB1c2VyIGluIGNhc2Ugb2YgZW1wdHkuXG4gICAgICB1c2VyKCkud2FybihcbiAgICAgICAgVEFHLFxuICAgICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyksXG4gICAgICAgIFwiTm8gY3JlYXRpdmUgb3IgVVJMIGF2YWlsYWJsZSAtLSBBNEEgY2FuJ3QgcmVuZGVyIGFueSBhZFwiXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIXRocm90dGxlQXBwbGllZCAmJiAhdGhpcy5pbk5vbkFtcFByZWZlcmVuY2VFeHAoKSkge1xuICAgICAgaW5jcmVtZW50TG9hZGluZ0Fkcyh0aGlzLndpbiwgcmVuZGVyUHJvbWlzZSk7XG4gICAgfVxuICAgIHJldHVybiByZW5kZXJQcm9taXNlLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgdGhpcy5tYXliZVRyaWdnZXJBbmFseXRpY3NFdmVudF8oJ2Nyb3NzRG9tYWluSWZyYW1lTG9hZGVkJyk7XG4gICAgICAvLyBQYXNzIG9uIHRoZSByZXN1bHQgdG8gdGhlIG5leHQgdmFsdWUgaW4gdGhlIHByb21pc2UgY2hhbmdlLlxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2hlYWQtdmFsaWRhdGlvbi5WYWxpZGF0ZWRIZWFkRGVmfSBoZWFkRGF0YVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGNoZWNrU3RpbGxDdXJyZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBXaGV0aGVyIHRoZSBjcmVhdGl2ZSB3YXMgc3VjY2Vzc2Z1bGx5IHJlbmRlcmVkLlxuICAgKi9cbiAgcmVuZGVyRnJpZW5kbHlUcnVzdGxlc3NfKGhlYWREYXRhLCBjaGVja1N0aWxsQ3VycmVudCkge1xuICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgZGV2QXNzZXJ0KHRoaXMuZWxlbWVudC5vd25lckRvY3VtZW50KTtcbiAgICB0aGlzLm1heWJlVHJpZ2dlckFuYWx5dGljc0V2ZW50XygncmVuZGVyRnJpZW5kbHlTdGFydCcpO1xuXG4gICAgY29uc3Qge2hlaWdodCwgd2lkdGh9ID0gdGhpcy5jcmVhdGl2ZVNpemVfO1xuICAgIGNvbnN0IHtleHRlbnNpb25zLCBmb250cywgaGVhZH0gPSBoZWFkRGF0YTtcbiAgICB0aGlzLmlmcmFtZSA9IGNyZWF0ZVNlY3VyZUZyYW1lKFxuICAgICAgdGhpcy53aW4sXG4gICAgICB0aGlzLmdldElmcmFtZVRpdGxlKCksXG4gICAgICBoZWlnaHQsXG4gICAgICB3aWR0aFxuICAgICk7XG4gICAgaWYgKCF0aGlzLnVpSGFuZGxlci5pc1N0aWNreUFkKCkpIHtcbiAgICAgIGFwcGx5RmlsbENvbnRlbnQodGhpcy5pZnJhbWUpO1xuICAgIH1cblxuICAgIGxldCBib2R5ID0gJyc7XG4gICAgY29uc3QgdHJhbnNmZXJDb21wbGV0ZSA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIC8vIElmIHNyY2RvYyBpcyBub3Qgc3VwcG9ydGVkLCBzdHJlYW1pbmcgaXMgYWxzbyBub3Qgc3VwcG9ydGVkIHNvIHdlXG4gICAgLy8gY2FuIGdvIGFoZWFkIGFuZCB3cml0ZSB0aGUgYWQgY29udGVudCBib2R5LlxuICAgIGlmICghaXNTcmNkb2NTdXBwb3J0ZWQoKSkge1xuICAgICAgYm9keSA9IGhlYWQub3duZXJEb2N1bWVudC5ib2R5Li8qT0sgKi8gb3V0ZXJIVE1MO1xuICAgICAgdHJhbnNmZXJDb21wbGV0ZS5yZXNvbHZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE9uY2Ugc2tlbGV0b24gZG9jIGhhcyBiZSB3cml0dGVuIHRvIHNyY2RvYyB3ZSBzdGFydCB0cmFuc2ZlcnJpbmdcbiAgICAgIC8vIGJvZHkgY2h1bmtzLlxuICAgICAgbGlzdGVuT25jZSh0aGlzLmlmcmFtZSwgJ2xvYWQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpZUJvZHkgPSB0aGlzLmlmcmFtZS5jb250ZW50RG9jdW1lbnQuYm9keTtcbiAgICAgICAgdGhpcy50cmFuc2ZlckRvbUJvZHlfKGRldkFzc2VydChmaWVCb2R5KSkudGhlbihcbiAgICAgICAgICB0cmFuc2ZlckNvbXBsZXRlLnJlc29sdmVcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNlY3VyZURvYyA9IGNyZWF0ZVNlY3VyZURvY1NrZWxldG9uKFxuICAgICAgZGV2QXNzZXJ0KHRoaXMuYWRVcmxfKSxcbiAgICAgIGhlYWQuLypPSyovIG91dGVySFRNTCxcbiAgICAgIGJvZHlcbiAgICApO1xuXG4gICAgY29uc3QgZmllSW5zdGFsbFByb21pc2UgPSB0aGlzLmluc3RhbGxGcmllbmRseUlmcmFtZUVtYmVkXyhcbiAgICAgIHNlY3VyZURvYyxcbiAgICAgIGV4dGVuc2lvbnMsXG4gICAgICBmb250cyxcbiAgICAgIHRydWUgLy8gc2tpcEh0bWxNZXJnZVxuICAgICk7XG5cbiAgICAvLyBUZWxsIHRoZSBGSUUgaXQgaXMgZG9uZSBhZnRlciB0cmFuc2ZlcnJpbmcuXG4gICAgUHJvbWlzZS5hbGwoW2ZpZUluc3RhbGxQcm9taXNlLCB0cmFuc2ZlckNvbXBsZXRlLnByb21pc2VdKS50aGVuKFxuICAgICAgKHZhbHVlcykgPT4ge1xuICAgICAgICBjb25zdCBmcmllbmRseUlmcmFtZUVtYmVkID0gdmFsdWVzWzBdO1xuICAgICAgICAvLyAjaW5zdGFsbEZyaWVuZGx5SWZyYW1lRW1iZWQgd2lsbCByZXR1cm4gbnVsbCBpZiByZW1vdmVkIGJlZm9yZSBpbnN0YWxsIGlzIGNvbXBsZXRlLlxuICAgICAgICBmcmllbmRseUlmcmFtZUVtYmVkICYmIGZyaWVuZGx5SWZyYW1lRW1iZWQucmVuZGVyQ29tcGxldGVkKCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IGV4dGVuc2lvbklkcyA9IGV4dGVuc2lvbnMubWFwKChleHRlbnNpb24pID0+IGV4dGVuc2lvbi5leHRlbnNpb25JZCk7XG4gICAgcmV0dXJuIGZpZUluc3RhbGxQcm9taXNlLnRoZW4oKGZyaWVuZGx5SWZyYW1lRW1iZWQpID0+IHtcbiAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICB0aGlzLm1ha2VGaWVWaXNpYmxlXyhcbiAgICAgICAgZnJpZW5kbHlJZnJhbWVFbWJlZCxcbiAgICAgICAgLy8gVE9ETyhjY29yZHJ5KTogc3ViY2xhc3NlcyBhcmUgcGFzc2VkIGNyZWF0aXZlTWV0YWRhdGEgd2hpY2ggZG9lc1xuICAgICAgICAvLyBub3QgZXhpc3QgaW4gdW5zaWduZWQgY2FzZS4gQWxsIGl0IGlzIGN1cnJlbnRseSB1c2VkIGZvciBpcyB0b1xuICAgICAgICAvLyBjaGVjayBpZiBpdCBpcyBhbiBBTVAgY3JlYXRpdmUsIGFuZCBleHRlbnNpb24gbGlzdC5cbiAgICAgICAge1xuICAgICAgICAgIG1pbmlmaWVkQ3JlYXRpdmU6ICcnLFxuICAgICAgICAgIGN1c3RvbVN0eWxlc2hlZXRzOiBbXSxcbiAgICAgICAgICBjdXN0b21FbGVtZW50RXh0ZW5zaW9uczogZXh0ZW5zaW9uSWRzLFxuICAgICAgICB9LFxuICAgICAgICBjaGVja1N0aWxsQ3VycmVudFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgYSB2YWxpZGF0ZWQgQU1QIGNyZWF0aXZlIGRpcmVjdGx5IGluIHRoZSBwYXJlbnQgcGFnZS5cbiAgICogQHBhcmFtIHshQ3JlYXRpdmVNZXRhRGF0YURlZn0gY3JlYXRpdmVNZXRhRGF0YSBNZXRhZGF0YSByZXF1aXJlZCB0byByZW5kZXJcbiAgICogICAgIEFNUCBjcmVhdGl2ZS5cbiAgICogQHJldHVybiB7IVByb21pc2V9IFdoZXRoZXIgdGhlIGNyZWF0aXZlIHdhcyBzdWNjZXNzZnVsbHkgcmVuZGVyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW5kZXJBbXBDcmVhdGl2ZV8oY3JlYXRpdmVNZXRhRGF0YSkge1xuICAgIGRldkFzc2VydChjcmVhdGl2ZU1ldGFEYXRhLm1pbmlmaWVkQ3JlYXRpdmUsICdtaXNzaW5nIG1pbmlmaWVkIGNyZWF0aXZlJyk7XG4gICAgZGV2QXNzZXJ0KCEhdGhpcy5lbGVtZW50Lm93bmVyRG9jdW1lbnQsICdtaXNzaW5nIG93bmVyIGRvY3VtZW50PyEnKTtcbiAgICB0aGlzLm1heWJlVHJpZ2dlckFuYWx5dGljc0V2ZW50XygncmVuZGVyRnJpZW5kbHlTdGFydCcpO1xuICAgIC8vIENyZWF0ZSBhbmQgc2V0dXAgZnJpZW5kbHkgaWZyYW1lLlxuICAgIHRoaXMuaWZyYW1lID0gLyoqIEB0eXBlIHshSFRNTElGcmFtZUVsZW1lbnR9ICovIChcbiAgICAgIGNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyhcbiAgICAgICAgLyoqIEB0eXBlIHshRG9jdW1lbnR9ICovICh0aGlzLmVsZW1lbnQub3duZXJEb2N1bWVudCksXG4gICAgICAgICdpZnJhbWUnLFxuICAgICAgICBkaWN0KHtcbiAgICAgICAgICAvLyBOT1RFOiBJdCBpcyBwb3NzaWJsZSBmb3IgZWl0aGVyIHdpZHRoIG9yIGhlaWdodCB0byBiZSAnYXV0bycsXG4gICAgICAgICAgLy8gYSBub24tbnVtZXJpYyB2YWx1ZS5cbiAgICAgICAgICAnaGVpZ2h0JzogdGhpcy5jcmVhdGl2ZVNpemVfLmhlaWdodCxcbiAgICAgICAgICAnd2lkdGgnOiB0aGlzLmNyZWF0aXZlU2l6ZV8ud2lkdGgsXG4gICAgICAgICAgJ2ZyYW1lYm9yZGVyJzogJzAnLFxuICAgICAgICAgICdhbGxvd2Z1bGxzY3JlZW4nOiAnJyxcbiAgICAgICAgICAnYWxsb3d0cmFuc3BhcmVuY3knOiAnJyxcbiAgICAgICAgICAnc2Nyb2xsaW5nJzogJ25vJyxcbiAgICAgICAgICAndGl0bGUnOiB0aGlzLmdldElmcmFtZVRpdGxlKCksXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcbiAgICBpZiAoIXRoaXMudWlIYW5kbGVyLmlzU3RpY2t5QWQoKSkge1xuICAgICAgYXBwbHlGaWxsQ29udGVudCh0aGlzLmlmcmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IGZvbnRzQXJyYXkgPSBbXTtcbiAgICBpZiAoY3JlYXRpdmVNZXRhRGF0YS5jdXN0b21TdHlsZXNoZWV0cykge1xuICAgICAgY3JlYXRpdmVNZXRhRGF0YS5jdXN0b21TdHlsZXNoZWV0cy5mb3JFYWNoKChzKSA9PiB7XG4gICAgICAgIGNvbnN0IGhyZWYgPSBzWydocmVmJ107XG4gICAgICAgIGlmIChocmVmKSB7XG4gICAgICAgICAgZm9udHNBcnJheS5wdXNoKGhyZWYpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgY2hlY2tTdGlsbEN1cnJlbnQgPSB0aGlzLnZlcmlmeVN0aWxsQ3VycmVudCgpO1xuICAgIGNvbnN0IHttaW5pZmllZENyZWF0aXZlfSA9IGNyZWF0aXZlTWV0YURhdGE7XG4gICAgY29uc3QgZXh0ZW5zaW9ucyA9IGdldEV4dGVuc2lvbnNGcm9tTWV0YWRhdGEoY3JlYXRpdmVNZXRhRGF0YSk7XG4gICAgcmV0dXJuIHRoaXMuaW5zdGFsbEZyaWVuZGx5SWZyYW1lRW1iZWRfKFxuICAgICAgbWluaWZpZWRDcmVhdGl2ZSxcbiAgICAgIGV4dGVuc2lvbnMsXG4gICAgICBmb250c0FycmF5IHx8IFtdLFxuICAgICAgZmFsc2UgLy8gc2tpcEh0bWxNZXJnZVxuICAgICkudGhlbigoZnJpZW5kbHlJZnJhbWVFbWJlZCkgPT5cbiAgICAgIHRoaXMubWFrZUZpZVZpc2libGVfKFxuICAgICAgICBmcmllbmRseUlmcmFtZUVtYmVkLFxuICAgICAgICBjcmVhdGl2ZU1ldGFEYXRhLFxuICAgICAgICBjaGVja1N0aWxsQ3VycmVudFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB0aGUgaWZyYW1lIHRvIEZJRSBpbXBsIGFuZCBhcHBlbmQgdG8gRE9NLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICAgKiBAcGFyYW0geyFBcnJheTx7ZXh0ZW5zaW9uSWQ6IHN0cmluZywgZXh0ZW5zaW9uVmVyc2lvbjogc3RyaW5nfT59IGV4dGVuc2lvbnNcbiAgICogQHBhcmFtIHshQXJyYXk8c3RyaW5nPn0gZm9udHNcbiAgICogQHBhcmFtIHtib29sZWFufSBza2lwSHRtbE1lcmdlXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCEuLi8uLi8uLi9zcmMvZnJpZW5kbHktaWZyYW1lLWVtYmVkLkZyaWVuZGx5SWZyYW1lRW1iZWQ+fVxuICAgKi9cbiAgaW5zdGFsbEZyaWVuZGx5SWZyYW1lRW1iZWRfKGh0bWwsIGV4dGVuc2lvbnMsIGZvbnRzLCBza2lwSHRtbE1lcmdlKSB7XG4gICAgcmV0dXJuIGluc3RhbGxGcmllbmRseUlmcmFtZUVtYmVkKFxuICAgICAgZGV2QXNzZXJ0KHRoaXMuaWZyYW1lKSxcbiAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgIHtcbiAgICAgICAgaG9zdDogdGhpcy5lbGVtZW50LFxuICAgICAgICAvLyBOZWVkIHRvIGd1YXJhbnRlZSB0aGF0IHRoaXMgaXMgbm8gbG9uZ2VyIG51bGxcbiAgICAgICAgdXJsOiBkZXZBc3NlcnQodGhpcy5hZFVybF8pLFxuICAgICAgICBodG1sLFxuICAgICAgICBleHRlbnNpb25zLFxuICAgICAgICBmb250cyxcbiAgICAgICAgc2tpcEh0bWxNZXJnZSxcbiAgICAgIH0sXG4gICAgICAoZW1iZWRXaW4sIGFtcGRvYykgPT4gdGhpcy5wcmVpbnN0YWxsQ2FsbGJhY2tfKGVtYmVkV2luLCBhbXBkb2MpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IGVtYmVkV2luXG4gICAqIEBwYXJhbSB7Li4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jPX0gYW1wZG9jXG4gICAqL1xuICBwcmVpbnN0YWxsQ2FsbGJhY2tfKGVtYmVkV2luLCBhbXBkb2MpIHtcbiAgICBjb25zdCBwYXJlbnRBbXBkb2MgPSB0aGlzLmdldEFtcERvYygpO1xuICAgIGluc3RhbGxVcmxSZXBsYWNlbWVudHNGb3JFbWJlZChcbiAgICAgIGFtcGRvYyxcbiAgICAgIG5ldyBBNEFWYXJpYWJsZVNvdXJjZShwYXJlbnRBbXBkb2MsIGVtYmVkV2luKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBGSUUgdmlzaWJsZSBhbmQgZXhlY3V0ZSBhbnkgbG9hZGluZyAvIHJlbmRlcmluZyBjb21wbGV0ZSBjYWxsYmFja3MuXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9mcmllbmRseS1pZnJhbWUtZW1iZWQuRnJpZW5kbHlJZnJhbWVFbWJlZH0gZnJpZW5kbHlJZnJhbWVFbWJlZFxuICAgKiBAcGFyYW0ge0NyZWF0aXZlTWV0YURhdGFEZWZ9IGNyZWF0aXZlTWV0YURhdGFcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBjaGVja1N0aWxsQ3VycmVudFxuICAgKi9cbiAgbWFrZUZpZVZpc2libGVfKGZyaWVuZGx5SWZyYW1lRW1iZWQsIGNyZWF0aXZlTWV0YURhdGEsIGNoZWNrU3RpbGxDdXJyZW50KSB7XG4gICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICB0aGlzLmZyaWVuZGx5SWZyYW1lRW1iZWRfID0gZnJpZW5kbHlJZnJhbWVFbWJlZDtcbiAgICAvLyBFbnN1cmUgdmlzaWJpbGl0eSBoaWRkZW4gaGFzIGJlZW4gcmVtb3ZlZCAoc2V0IGJ5IGJvaWxlcnBsYXRlKS5cbiAgICBjb25zdCBmcmFtZUJvZHkgPSB0aGlzLmdldEZpZUJvZHlfKGZyaWVuZGx5SWZyYW1lRW1iZWQpO1xuICAgIHNldFN0eWxlKGZyYW1lQm9keSwgJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuXG4gICAgcHJvdGVjdEZ1bmN0aW9uV3JhcHBlcih0aGlzLm9uQ3JlYXRpdmVSZW5kZXIsIHRoaXMsIChlcnIpID0+IHtcbiAgICAgIGRldigpLmVycm9yKFxuICAgICAgICBUQUcsXG4gICAgICAgIHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSxcbiAgICAgICAgJ0Vycm9yIGV4ZWN1dGluZyBvbkNyZWF0aXZlUmVuZGVyJyxcbiAgICAgICAgZXJyXG4gICAgICApO1xuICAgIH0pKGNyZWF0aXZlTWV0YURhdGEsIGZyaWVuZGx5SWZyYW1lRW1iZWQud2hlbldpbmRvd0xvYWRlZCgpKTtcblxuICAgIGZyaWVuZGx5SWZyYW1lRW1iZWQud2hlbkluaUxvYWRlZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgIHRoaXMubWF5YmVUcmlnZ2VyQW5hbHl0aWNzRXZlbnRfKCdmcmllbmRseUlmcmFtZUluaUxvYWQnKTtcbiAgICB9KTtcblxuICAgIC8vIFRoZXJlJ3Mgbm8gbmVlZCB0byB3YWl0IGZvciBhbGwgcmVzb3VyY2VzIHRvIGxvYWQuXG4gICAgLy8gU3RhcnRSZW5kZXIgaXMgZW5vdWdoXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL2ZyaWVuZGx5LWlmcmFtZS1lbWJlZC5GcmllbmRseUlmcmFtZUVtYmVkfSBmcmllbmRseUlmcmFtZUVtYmVkXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKi9cbiAgZ2V0RmllQm9keV8oZnJpZW5kbHlJZnJhbWVFbWJlZCkge1xuICAgIGNvbnN0IGZyYW1lRG9jID1cbiAgICAgIGZyaWVuZGx5SWZyYW1lRW1iZWQuaWZyYW1lLmNvbnRlbnREb2N1bWVudCB8fFxuICAgICAgZnJpZW5kbHlJZnJhbWVFbWJlZC53aW4uZG9jdW1lbnQ7XG4gICAgcmV0dXJuIGRldkFzc2VydChmcmFtZURvYy5ib2R5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaGFyZWQgZnVuY3Rpb25hbGl0eSBmb3IgY3Jvc3MtZG9tYWluIGlmcmFtZS1iYXNlZCByZW5kZXJpbmcgbWV0aG9kcy5cbiAgICogQHBhcmFtIHshSnNvbk9iamVjdDxzdHJpbmcsIHN0cmluZz59IGF0dHJpYnV0ZXMgVGhlIGF0dHJpYnV0ZXMgb2YgdGhlIGlmcmFtZS5cbiAgICogQHJldHVybiB7IVByb21pc2V9IGF3YWl0aW5nIGxvYWQgZXZlbnQgZm9yIGFkIGZyYW1lXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpZnJhbWVSZW5kZXJIZWxwZXJfKGF0dHJpYnV0ZXMpIHtcbiAgICBjb25zdCBtZXJnZWRBdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICBkaWN0KHtcbiAgICAgICAgJ2hlaWdodCc6IHRoaXMuY3JlYXRpdmVTaXplXy5oZWlnaHQsXG4gICAgICAgICd3aWR0aCc6IHRoaXMuY3JlYXRpdmVTaXplXy53aWR0aCxcbiAgICAgICAgJ3RpdGxlJzogdGhpcy5nZXRJZnJhbWVUaXRsZSgpLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgaWYgKHRoaXMuc2VudGluZWwpIHtcbiAgICAgIG1lcmdlZEF0dHJpYnV0ZXNbJ2RhdGEtYW1wLTNwLXNlbnRpbmVsJ10gPSB0aGlzLnNlbnRpbmVsO1xuICAgIH1cbiAgICAvLyBCbG9jayBzeW5jaHJvbm91cyBYSFIgaW4gYWQuIFRoZXNlIGFyZSB2ZXJ5IHJhcmUsIGJ1dCBzdXBlciBiYWQgZm9yIFVYXG4gICAgLy8gYXMgdGhleSBibG9jayB0aGUgVUkgdGhyZWFkIGZvciB0aGUgYXJiaXRyYXJ5IGFtb3VudCBvZiB0aW1lIHVudGlsIHRoZVxuICAgIC8vIHJlcXVlc3QgY29tcGxldGVzLlxuICAgIGxldCBmZWF0dXJlUG9saWNpZXMgPSBcInN5bmMteGhyICdub25lJztcIjtcblxuICAgIGlmIChpc0F0dHJpYnV0aW9uUmVwb3J0aW5nU3VwcG9ydGVkKHRoaXMud2luLmRvY3VtZW50KSkge1xuICAgICAgZmVhdHVyZVBvbGljaWVzICs9IFwiYXR0cmlidXRpb24tcmVwb3J0aW5nICdzcmMnO1wiO1xuICAgIH1cblxuICAgIG1lcmdlZEF0dHJpYnV0ZXNbJ2FsbG93J10gPSBmZWF0dXJlUG9saWNpZXM7XG5cbiAgICB0aGlzLmlmcmFtZSA9IC8qKiBAdHlwZSB7IUhUTUxJRnJhbWVFbGVtZW50fSAqLyAoXG4gICAgICBjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMoXG4gICAgICAgIC8qKiBAdHlwZSB7IURvY3VtZW50fSAqLyAodGhpcy5lbGVtZW50Lm93bmVyRG9jdW1lbnQpLFxuICAgICAgICAnaWZyYW1lJyxcbiAgICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24obWVyZ2VkQXR0cmlidXRlcywgU0hBUkVEX0lGUkFNRV9QUk9QRVJUSUVTKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgICBpZiAodGhpcy5zYW5kYm94SFRNTENyZWF0aXZlRnJhbWUoKSkge1xuICAgICAgYXBwbHlTYW5kYm94KHRoaXMuaWZyYW1lKTtcbiAgICB9XG4gICAgLy8gVE9ETyhrZWl0aHdyaWdodGJvcyk6IG5vQ29udGVudENhbGxiYWNrP1xuICAgIHRoaXMueE9yaWdpbklmcmFtZUhhbmRsZXJfID0gbmV3IEFNUC5BbXBBZFhPcmlnaW5JZnJhbWVIYW5kbGVyKHRoaXMpO1xuICAgIC8vIElmcmFtZSBpcyBhcHBlbmRlZCB0byBlbGVtZW50IGFzIHBhcnQgb2YgeG9yaWdpbiBmcmFtZSBoYW5kbGVyIGluaXQuXG4gICAgLy8gRXhlY3V0aXZlIG9uQ3JlYXRpdmVSZW5kZXIgYWZ0ZXIgaW5pdCB0byBlbnN1cmUgaXQgY2FuIGdldCByZWZlcmVuY2VcbiAgICAvLyB0byBmcmFtZSBidXQgcHJpb3IgdG8gbG9hZCB0byBhbGxvdyBmb3IgZWFybGllciBhY2Nlc3MuXG4gICAgY29uc3QgZnJhbWVMb2FkUHJvbWlzZSA9IHRoaXMueE9yaWdpbklmcmFtZUhhbmRsZXJfLmluaXQoXG4gICAgICB0aGlzLmlmcmFtZSxcbiAgICAgIC8qIG9wdF9pc0E0QSAqLyB0cnVlLFxuICAgICAgdGhpcy5sZXRDcmVhdGl2ZVRyaWdnZXJSZW5kZXJTdGFydCgpXG4gICAgKTtcbiAgICBwcm90ZWN0RnVuY3Rpb25XcmFwcGVyKHRoaXMub25DcmVhdGl2ZVJlbmRlciwgdGhpcywgKGVycikgPT4ge1xuICAgICAgZGV2KCkuZXJyb3IoXG4gICAgICAgIFRBRyxcbiAgICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLFxuICAgICAgICAnRXJyb3IgZXhlY3V0aW5nIG9uQ3JlYXRpdmVSZW5kZXInLFxuICAgICAgICBlcnJcbiAgICAgICk7XG4gICAgfSkobnVsbCk7XG4gICAgcmV0dXJuIGZyYW1lTG9hZFByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBpZnJhbWUgd2hvc2Ugc3JjIG1hdGNoZXMgdGhhdCBvZiB0aGUgYWQgVVJMLiBGb3Igc3RhbmRhcmRcbiAgICogRmFzdCBGZXRjaCBydW5uaW5nIG9uIHRoZSBBTVAgY2RuLCBhbiBYSFIgcmVxdWVzdCB3aWxsIHR5cGljYWxseSBoYXZlXG4gICAqIGFscmVhZHkgYmVlbiBzZW50IHRvIHRoZSBzYW1lIGFkVXJsLCBhbmQgdGhlIHJlc3BvbnNlIHNob3VsZFxuICAgKiBoYXZlIGJlZW4gY2FjaGVkIGNhdXNpbmcgdGhlIGJyb3dzZXIgdG8gcmVuZGVyIHdpdGhvdXQgY2FsbG91dC4gIEhvd2V2ZXIsXG4gICAqIGl0IGlzIHBvc3NpYmxlIGZvciBjYWNoZSBtaXNzIHRvIG9jY3VyIHdoaWNoIGNhbiBiZSBkZXRlY3RlZCBzZXJ2ZXItc2lkZVxuICAgKiBieSBtaXNzaW5nIE9SSUdJTiBoZWFkZXIuXG4gICAqXG4gICAqIEFkZGl0aW9uYWxseSwgdGhpcyBtZXRob2QgaXMgYWxzbyB1c2VkIGluIGNlcnRhaW4gY2FzZXMgdG8gc2VuZCB0aGUgb25seVxuICAgKiByZXF1ZXN0LCBpLmUuIHRoZSBpbml0aWFsIFhIUiBpcyBza2lwcGVkLlxuICAgKlxuICAgKiBOb3RlOiBBcyBvZiAyMDE2LTEwLTE4LCB0aGUgZmlsbC1mcm9tLWNhY2hlIGFzc3VtcHRpb24gYXBwZWFycyB0byBmYWlsIG9uXG4gICAqIFNhZmFyaS1vbi1pT1MsIHdoaWNoIGlzc3VlcyBhIGZyZXNoIG5ldHdvcmsgcmVxdWVzdCwgZXZlbiB0aG91Z2ggdGhlXG4gICAqIGNvbnRlbnQgaXMgYWxyZWFkeSBpbiBjYWNoZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFkVXJsICBBZCByZXF1ZXN0IFVSTCwgYXMgc2VudCB0byAjc2VuZFhoclJlcXVlc3QgKGkuZS4sXG4gICAqICAgIGJlZm9yZSBhbnkgbW9kaWZpY2F0aW9ucyB0aGF0IFhIUiBtb2R1bGUgZG9lcyB0byBpdC4pXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBhd2FpdGluZyBhZCBjb21wbGV0ZWQgaW5zZXJ0aW9uLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVuZGVyVmlhSWZyYW1lR2V0XyhhZFVybCkge1xuICAgIHRoaXMubWF5YmVUcmlnZ2VyQW5hbHl0aWNzRXZlbnRfKCdyZW5kZXJDcm9zc0RvbWFpblN0YXJ0Jyk7XG4gICAgY29uc3QgY29udGV4dE1ldGFkYXRhID0gZ2V0Q29udGV4dE1ldGFkYXRhKFxuICAgICAgdGhpcy53aW4sXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICB0aGlzLnNlbnRpbmVsXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzLmluaXRpYWxJbnRlcnNlY3Rpb25Qcm9taXNlXy50aGVuKChpbnRlcnNlY3Rpb24pID0+IHtcbiAgICAgIGNvbnRleHRNZXRhZGF0YVsnX2NvbnRleHQnXVsnaW5pdGlhbEludGVyc2VjdGlvbiddID1cbiAgICAgICAgaW50ZXJzZWN0aW9uRW50cnlUb0pzb24oaW50ZXJzZWN0aW9uKTtcbiAgICAgIHJldHVybiB0aGlzLmlmcmFtZVJlbmRlckhlbHBlcl8oXG4gICAgICAgIGRpY3Qoe1xuICAgICAgICAgICdzcmMnOiBTZXJ2aWNlcy54aHJGb3IodGhpcy53aW4pLmdldENvcnNVcmwodGhpcy53aW4sIGFkVXJsKSxcbiAgICAgICAgICAnbmFtZSc6IEpTT04uc3RyaW5naWZ5KGNvbnRleHRNZXRhZGF0YSksXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgQU1QIEFkIFhvcmlnaW4gSWZyYW1lIGhhbmRsZXIgc2hvdWxkIHdhaXQgZm9yIHRoZSBjcmVhdGl2ZSB0b1xuICAgKiBjYWxsIHJlbmRlci1zdGFydCwgcmF0aGVyIHRoYW4gdHJpZ2dlcmluZyBpdCBpdHNlbGYuIEV4YW1wbGUgdXNlIGNhc2VcbiAgICogaXMgdGhhdCBhbXAtc3RpY2t5LWFkIHNob3VsZCB0cmlnZ2VyIHJlbmRlci1zdGFydCBpdHNlbGYgc28gdGhhdCB0aGVcbiAgICogc3RpY2t5IGNvbnRhaW5lciBpc24ndCBzaG93biBiZWZvcmUgYW4gYWQgaXMgcmVhZHkuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBsZXRDcmVhdGl2ZVRyaWdnZXJSZW5kZXJTdGFydCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBjcmVhdGl2ZSB2aWEgc29tZSBcImNyb3NzIGRvbWFpbiBpZnJhbWUgdGhhdCBhY2NlcHRzIHRoZSBjcmVhdGl2ZVxuICAgKiBpbiB0aGUgbmFtZSBhdHRyaWJ1dGVcIi4gIFRoaXMgY291bGQgYmUgU2FmZUZyYW1lIG9yIHRoZSBBTVAtbmF0aXZlXG4gICAqIE5hbWVGcmFtZS5cbiAgICpcbiAgICogQHBhcmFtIHshQXJyYXlCdWZmZXJ9IGNyZWF0aXZlQm9keVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gYXdhaXRpbmcgbG9hZCBldmVudCBmb3IgYWQgZnJhbWVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlbmRlclZpYU5hbWVBdHRyT2ZYT3JpZ2luSWZyYW1lXyhjcmVhdGl2ZUJvZHkpIHtcbiAgICAvKiogQHR5cGUgez9zdHJpbmd9ICovXG4gICAgY29uc3QgbWV0aG9kID0gdGhpcy5leHBlcmltZW50YWxOb25BbXBDcmVhdGl2ZVJlbmRlck1ldGhvZF87XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgbWV0aG9kID09IFhPUklHSU5fTU9ERS5TQUZFRlJBTUUgfHwgbWV0aG9kID09IFhPUklHSU5fTU9ERS5OQU1FRlJBTUUsXG4gICAgICAnVW5yZWNvZ25pemVkIEE0QSBjcm9zcy1kb21haW4gcmVuZGVyaW5nIG1vZGU6ICVzJyxcbiAgICAgIG1ldGhvZFxuICAgICk7XG4gICAgdGhpcy5tYXliZVRyaWdnZXJBbmFseXRpY3NFdmVudF8oJ3JlbmRlclNhZmVGcmFtZVN0YXJ0Jyk7XG4gICAgY29uc3QgY2hlY2tTdGlsbEN1cnJlbnQgPSB0aGlzLnZlcmlmeVN0aWxsQ3VycmVudCgpO1xuICAgIHJldHVybiB0cnlSZXNvbHZlKCgpID0+IHV0ZjhEZWNvZGUoY3JlYXRpdmVCb2R5KSkudGhlbigoY3JlYXRpdmUpID0+IHtcbiAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICBsZXQgc3JjUGF0aDtcbiAgICAgIGxldCBuYW1lID0gJyc7XG4gICAgICBzd2l0Y2ggKG1ldGhvZCkge1xuICAgICAgICBjYXNlIFhPUklHSU5fTU9ERS5TQUZFRlJBTUU6XG4gICAgICAgICAgc3JjUGF0aCA9IHRoaXMuZ2V0U2FmZWZyYW1lUGF0aCgpICsgJz9uPTAnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFhPUklHSU5fTU9ERS5OQU1FRlJBTUU6XG4gICAgICAgICAgc3JjUGF0aCA9IGdldERlZmF1bHRCb290c3RyYXBCYXNlVXJsKHRoaXMud2luLCAnbmFtZWZyYW1lJyk7XG4gICAgICAgICAgLy8gTmFtZSB3aWxsIGJlIHNldCBmb3IgcmVhbCBiZWxvdyBpbiBuYW1lZnJhbWUgY2FzZS5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBTaG91bGRuJ3QgYmUgYWJsZSB0byBnZXQgaGVyZSwgYnV0Li4uICBCZWNhdXNlIG9mIHRoZSBhc3NlcnQsXG4gICAgICAgICAgLy8gYWJvdmUsIHdlIGNhbiBvbmx5IGdldCBoZXJlIGluIG5vbi1kZXYgbW9kZSwgc28gZ2l2ZSB1c2VyIGZlZWRiYWNrLlxuICAgICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICAgICdBNEEnLFxuICAgICAgICAgICAgJ0E0QSByZWNlaXZlZCB1bnJlY29nbml6ZWQgY3Jvc3MtZG9tYWluIG5hbWUnICtcbiAgICAgICAgICAgICAgJyBhdHRyaWJ1dGUgaWZyYW1lIHJlbmRlcmluZyBtb2RlIHJlcXVlc3Q6ICVzLiAgVW5hYmxlIHRvJyArXG4gICAgICAgICAgICAgICcgcmVuZGVyIGEgY3JlYXRpdmUgZm9yJyArXG4gICAgICAgICAgICAgICcgc2xvdCAlcy4nLFxuICAgICAgICAgICAgbWV0aG9kLFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnaWQnKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdVbnJlY29nbml6ZWQgcmVuZGVyaW5nIG1vZGUgcmVxdWVzdCcpO1xuICAgICAgfVxuICAgICAgLy8gVE9ETyhicmFkZnJpenplbGwpOiBjaGFuZ2UgbmFtZSBvZiBmdW5jdGlvbiBhbmQgdmFyXG4gICAgICBsZXQgY29udGV4dE1ldGFkYXRhID0gZ2V0Q29udGV4dE1ldGFkYXRhKFxuICAgICAgICB0aGlzLndpbixcbiAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICB0aGlzLnNlbnRpbmVsLFxuICAgICAgICB0aGlzLmdldEFkZGl0aW9uYWxDb250ZXh0TWV0YWRhdGEobWV0aG9kID09IFhPUklHSU5fTU9ERS5TQUZFRlJBTUUpXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsSW50ZXJzZWN0aW9uUHJvbWlzZV8udGhlbigoaW50ZXJzZWN0aW9uKSA9PiB7XG4gICAgICAgIGNvbnRleHRNZXRhZGF0YVsnaW5pdGlhbEludGVyc2VjdGlvbiddID1cbiAgICAgICAgICBpbnRlcnNlY3Rpb25FbnRyeVRvSnNvbihpbnRlcnNlY3Rpb24pO1xuICAgICAgICBpZiAobWV0aG9kID09IFhPUklHSU5fTU9ERS5OQU1FRlJBTUUpIHtcbiAgICAgICAgICBjb250ZXh0TWV0YWRhdGFbJ2NyZWF0aXZlJ10gPSBjcmVhdGl2ZTtcbiAgICAgICAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoY29udGV4dE1ldGFkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT0gWE9SSUdJTl9NT0RFLlNBRkVGUkFNRSkge1xuICAgICAgICAgIGNvbnRleHRNZXRhZGF0YSA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHRNZXRhZGF0YSk7XG4gICAgICAgICAgbmFtZSA9XG4gICAgICAgICAgICBgJHt0aGlzLnNhZmVmcmFtZVZlcnNpb259OyR7Y3JlYXRpdmUubGVuZ3RofTske2NyZWF0aXZlfWAgK1xuICAgICAgICAgICAgYCR7Y29udGV4dE1ldGFkYXRhfWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5pZnJhbWVSZW5kZXJIZWxwZXJfKGRpY3QoeydzcmMnOiBzcmNQYXRoLCAnbmFtZSc6IG5hbWV9KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBUaHJvd3Mge0Bjb2RlIFN5bnRheEVycm9yfSBpZiB0aGUgbWV0YWRhdGEgYmxvY2sgZGVsaW1pdGVycyBhcmUgbWlzc2luZ1xuICAgKiBvciBjb3JydXB0ZWQgb3IgaWYgdGhlIG1ldGFkYXRhIGNvbnRlbnQgZG9lc24ndCBwYXJzZSBhcyBKU09OLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY3JlYXRpdmUgZnJvbSB3aGljaCBDU1MgaXMgZXh0cmFjdGVkXG4gICAqIEByZXR1cm4gez9DcmVhdGl2ZU1ldGFEYXRhRGVmfSBPYmplY3QgcmVzdWx0IG9mIHBhcnNpbmcgSlNPTiBkYXRhIGJsb2IgaW5zaWRlXG4gICAqICAgICB0aGUgbWV0YWRhdGEgbWFya2VycyBvbiB0aGUgYWQgdGV4dCwgb3IgbnVsbCBpZiBubyBtZXRhZGF0YSBtYXJrZXJzIGFyZVxuICAgKiAgICAgZm91bmQuXG4gICAqIFRPRE8oa2VpdGh3cmlnaHRib3NAKTogcmVwb3J0IGVycm9yIGNhc2VzXG4gICAqL1xuICBnZXRBbXBBZE1ldGFkYXRhKGNyZWF0aXZlKSB7XG4gICAgbGV0IG1ldGFkYXRhU3RhcnQgPSAtMTtcbiAgICBsZXQgbWV0YWRhdGFTdHJpbmc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNRVRBREFUQV9TVFJJTkdTLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtZXRhZGF0YVN0cmluZyA9IE1FVEFEQVRBX1NUUklOR1NbaV07XG4gICAgICBtZXRhZGF0YVN0YXJ0ID0gY3JlYXRpdmUubGFzdEluZGV4T2YobWV0YWRhdGFTdHJpbmcpO1xuICAgICAgaWYgKG1ldGFkYXRhU3RhcnQgPj0gMCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1ldGFkYXRhU3RhcnQgPCAwKSB7XG4gICAgICAvLyBDb3VsZG4ndCBmaW5kIGEgbWV0YWRhdGEgYmxvYi5cbiAgICAgIGRldigpLndhcm4oXG4gICAgICAgIFRBRyxcbiAgICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLFxuICAgICAgICAnQ291bGQgbm90IGxvY2F0ZSBzdGFydCBpbmRleCBmb3IgYW1wIG1ldGEgZGF0YSBpbjogJXMnLFxuICAgICAgICBjcmVhdGl2ZVxuICAgICAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBtZXRhZGF0YUVuZCA9IGNyZWF0aXZlLmxhc3RJbmRleE9mKCc8L3NjcmlwdD4nKTtcbiAgICBpZiAobWV0YWRhdGFFbmQgPCAwKSB7XG4gICAgICAvLyBDb3VsZG4ndCBmaW5kIGEgbWV0YWRhdGEgYmxvYi5cbiAgICAgIGRldigpLndhcm4oXG4gICAgICAgIFRBRyxcbiAgICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLFxuICAgICAgICAnQ291bGQgbm90IGxvY2F0ZSBjbG9zaW5nIHNjcmlwdCB0YWcgZm9yIGFtcCBtZXRhIGRhdGEgaW46ICVzJyxcbiAgICAgICAgY3JlYXRpdmVcbiAgICAgICk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1ldGFEYXRhT2JqID0gcGFyc2VKc29uKFxuICAgICAgICBjcmVhdGl2ZS5zbGljZShtZXRhZGF0YVN0YXJ0ICsgbWV0YWRhdGFTdHJpbmcubGVuZ3RoLCBtZXRhZGF0YUVuZClcbiAgICAgICk7XG4gICAgICBjb25zdCBhbXBSdW50aW1lVXRmMTZDaGFyT2Zmc2V0cyA9XG4gICAgICAgIG1ldGFEYXRhT2JqWydhbXBSdW50aW1lVXRmMTZDaGFyT2Zmc2V0cyddO1xuICAgICAgaWYgKFxuICAgICAgICAhaXNBcnJheShhbXBSdW50aW1lVXRmMTZDaGFyT2Zmc2V0cykgfHxcbiAgICAgICAgYW1wUnVudGltZVV0ZjE2Q2hhck9mZnNldHMubGVuZ3RoICE9IDIgfHxcbiAgICAgICAgdHlwZW9mIGFtcFJ1bnRpbWVVdGYxNkNoYXJPZmZzZXRzWzBdICE9PSAnbnVtYmVyJyB8fFxuICAgICAgICB0eXBlb2YgYW1wUnVudGltZVV0ZjE2Q2hhck9mZnNldHNbMV0gIT09ICdudW1iZXInXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJ1bnRpbWUgb2Zmc2V0cycpO1xuICAgICAgfVxuICAgICAgY29uc3QgbWV0YURhdGEgPSB7fTtcbiAgICAgIGlmIChtZXRhRGF0YU9ialsnY3VzdG9tRWxlbWVudEV4dGVuc2lvbnMnXSkge1xuICAgICAgICBtZXRhRGF0YS5jdXN0b21FbGVtZW50RXh0ZW5zaW9ucyA9XG4gICAgICAgICAgbWV0YURhdGFPYmpbJ2N1c3RvbUVsZW1lbnRFeHRlbnNpb25zJ107XG4gICAgICAgIGlmICghaXNBcnJheShtZXRhRGF0YS5jdXN0b21FbGVtZW50RXh0ZW5zaW9ucykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnSW52YWxpZCBleHRlbnNpb25zJyxcbiAgICAgICAgICAgIG1ldGFEYXRhLmN1c3RvbUVsZW1lbnRFeHRlbnNpb25zXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWV0YURhdGEuY3VzdG9tRWxlbWVudEV4dGVuc2lvbnMgPSBbXTtcbiAgICAgIH1cbiAgICAgIGlmIChtZXRhRGF0YU9ialsnZXh0ZW5zaW9ucyddKSB7XG4gICAgICAgIG1ldGFEYXRhLmV4dGVuc2lvbnMgPSBtZXRhRGF0YU9ialsnZXh0ZW5zaW9ucyddO1xuICAgICAgfVxuICAgICAgaWYgKG1ldGFEYXRhT2JqWydjdXN0b21TdHlsZXNoZWV0cyddKSB7XG4gICAgICAgIC8vIEV4cGVjdCBhcnJheSBvZiBvYmplY3RzIHdpdGggYXQgbGVhc3Qgb25lIGtleSBiZWluZyAnaHJlZicgd2hvc2VcbiAgICAgICAgLy8gdmFsdWUgaXMgVVJMLlxuICAgICAgICBtZXRhRGF0YS5jdXN0b21TdHlsZXNoZWV0cyA9IG1ldGFEYXRhT2JqWydjdXN0b21TdHlsZXNoZWV0cyddO1xuICAgICAgICBjb25zdCBlcnJvck1zZyA9ICdJbnZhbGlkIGN1c3RvbSBzdHlsZXNoZWV0cyc7XG4gICAgICAgIGlmICghaXNBcnJheShtZXRhRGF0YS5jdXN0b21TdHlsZXNoZWV0cykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXJscyA9IFNlcnZpY2VzLnVybEZvckRvYyh0aGlzLmVsZW1lbnQpO1xuICAgICAgICAvKiogQHR5cGUgeyFBcnJheX0gKi8gKG1ldGFEYXRhLmN1c3RvbVN0eWxlc2hlZXRzKS5mb3JFYWNoKFxuICAgICAgICAgIChzdHlsZXNoZWV0KSA9PiB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICFpc09iamVjdChzdHlsZXNoZWV0KSB8fFxuICAgICAgICAgICAgICAhc3R5bGVzaGVldFsnaHJlZiddIHx8XG4gICAgICAgICAgICAgIHR5cGVvZiBzdHlsZXNoZWV0WydocmVmJ10gIT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgICAgICF1cmxzLmlzU2VjdXJlKHN0eWxlc2hlZXRbJ2hyZWYnXSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0FycmF5KG1ldGFEYXRhT2JqWydpbWFnZXMnXSkpIHtcbiAgICAgICAgLy8gTG9hZCBtYXhpbXVtIG9mIDUgaW1hZ2VzLlxuICAgICAgICBtZXRhRGF0YS5pbWFnZXMgPSBtZXRhRGF0YU9ialsnaW1hZ2VzJ10uc3BsaWNlKDAsIDUpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaXNTaW5nbGVQYWdlU3RvcnlBZCkge1xuICAgICAgICAvLyBDVEEgVHlwZSBpcyBhIHJlcXVpcmVkIG1ldGEgdGFnLiBDVEEgVXJsIGNhbiBjb21lIGZyb20gbWV0YSB0YWcsIG9yXG4gICAgICAgIC8vICh0ZW1wb3JhcmlseSkgYW1wLWFkLWV4aXQgY29uZmlnLlxuICAgICAgICAvLyBUT0RPKCMyNDA4MCk6IG1heWJlIHJlcmVxdWlyZSBjdGEgdXJsP1xuICAgICAgICBpZiAoIW1ldGFEYXRhT2JqWydjdGFUeXBlJ10pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoSU5WQUxJRF9TUFNBX1JFU1BPTlNFKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXZhcnMtY3RhdHlwZScsIG1ldGFEYXRhT2JqWydjdGFUeXBlJ10pO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXZhcnMtY3RhdXJsJywgbWV0YURhdGFPYmpbJ2N0YVVybCddKTtcbiAgICAgIH1cbiAgICAgIC8vIFRPRE8oa2VpdGh3cmlnaHRib3MpOiBPSyB0byBhc3N1bWUgYW1wUnVudGltZVV0ZjE2Q2hhck9mZnNldHMgaXMgYmVmb3JlXG4gICAgICAvLyBtZXRhZGF0YSBhcyBpdHMgaW4gdGhlIGhlYWQ/XG4gICAgICBtZXRhRGF0YS5taW5pZmllZENyZWF0aXZlID1cbiAgICAgICAgY3JlYXRpdmUuc2xpY2UoMCwgYW1wUnVudGltZVV0ZjE2Q2hhck9mZnNldHNbMF0pICtcbiAgICAgICAgY3JlYXRpdmUuc2xpY2UoYW1wUnVudGltZVV0ZjE2Q2hhck9mZnNldHNbMV0sIG1ldGFkYXRhU3RhcnQpICtcbiAgICAgICAgY3JlYXRpdmUuc2xpY2UobWV0YWRhdGFFbmQgKyAnPC9zY3JpcHQ+Jy5sZW5ndGgpO1xuICAgICAgcmV0dXJuIG1ldGFEYXRhO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZGV2KCkud2FybihcbiAgICAgICAgVEFHLFxuICAgICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyksXG4gICAgICAgICdJbnZhbGlkIGFtcCBtZXRhZGF0YTogJXMnLFxuICAgICAgICBjcmVhdGl2ZS5zbGljZShtZXRhZGF0YVN0YXJ0ICsgbWV0YWRhdGFTdHJpbmcubGVuZ3RoLCBtZXRhZGF0YUVuZClcbiAgICAgICk7XG4gICAgICBpZiAodGhpcy5pc1NpbmdsZVBhZ2VTdG9yeUFkKSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IGZ1bGwgdXJsIHRvIHNhZmVmcmFtZSBpbXBsZW1lbnRhdGlvbi5cbiAgICovXG4gIGdldFNhZmVmcmFtZVBhdGgoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICdodHRwczovL3RwYy5nb29nbGVzeW5kaWNhdGlvbi5jb20vc2FmZWZyYW1lLycgK1xuICAgICAgYCR7dGhpcy5zYWZlZnJhbWVWZXJzaW9ufS9odG1sL2NvbnRhaW5lci5odG1sYFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciB0aGlzIGlzIGEgc3RpY2t5IGFkIHVuaXRcbiAgICovXG4gIGlzU3RpY2t5QWQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gbGlmZWN5Y2xlIGV2ZW50IGhhcyBhIGNvcnJlc3BvbmRpbmcgYW1wLWFuYWx5dGljcyBldmVudFxuICAgKiBhbmQgZmlyZXMgdGhlIGFuYWx5dGljcyB0cmlnZ2VyIGlmIHNvLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGlmZWN5Y2xlU3RhZ2VcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1heWJlVHJpZ2dlckFuYWx5dGljc0V2ZW50XyhsaWZlY3ljbGVTdGFnZSkge1xuICAgIGlmICghdGhpcy5hNGFBbmFseXRpY3NDb25maWdfKSB7XG4gICAgICAvLyBObyBjb25maWcgZXhpc3RzIHRoYXQgd2lsbCBsaXN0ZW4gdG8gdGhpcyBldmVudC5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYW5hbHl0aWNzRXZlbnQgPSBkZXZBc3NlcnQoXG4gICAgICBMSUZFQ1lDTEVfU1RBR0VfVE9fQU5BTFlUSUNTX1RSSUdHRVJbbGlmZWN5Y2xlU3RhZ2VdXG4gICAgKTtcbiAgICBjb25zdCBhbmFseXRpY3NWYXJzID0gLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKFxuICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgZGljdCh7J3RpbWUnOiBNYXRoLnJvdW5kKHRoaXMuZ2V0Tm93XygpKX0pLFxuICAgICAgICB0aGlzLmdldEE0YUFuYWx5dGljc1ZhcnMoYW5hbHl0aWNzRXZlbnQpXG4gICAgICApXG4gICAgKTtcbiAgICB0cmlnZ2VyQW5hbHl0aWNzRXZlbnQodGhpcy5lbGVtZW50LCBhbmFseXRpY3NFdmVudCwgYW5hbHl0aWNzVmFycyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB2YXJpYWJsZXMgdG8gYmUgaW5jbHVkZWQgb24gYW4gYW5hbHl0aWNzIGV2ZW50LiBUaGlzIGNhbiBiZVxuICAgKiBvdmVycmlkZGVuIGJ5IHNwZWNpZmljIG5ldHdvcmsgaW1wbGVtZW50YXRpb25zLlxuICAgKiBOb3RlIHRoYXQgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgZm9yIGVhY2ggdGltZSBhbiBhbmFseXRpY3MgZXZlbnQgaXNcbiAgICogZmlyZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bnVzZWRBbmFseXRpY3NFdmVudCBUaGUgbmFtZSBvZiB0aGUgYW5hbHl0aWNzIGV2ZW50LlxuICAgKiBAcmV0dXJuIHshSnNvbk9iamVjdH1cbiAgICovXG4gIGdldEE0YUFuYWx5dGljc1ZhcnModW51c2VkQW5hbHl0aWNzRXZlbnQpIHtcbiAgICByZXR1cm4gZGljdCh7fSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBuZXR3b3JrLXNwZWNpZmljIGNvbmZpZyBmb3IgYW1wLWFuYWx5dGljcy4gSXQgc2hvdWxkIG92ZXJyaWRkZW5cbiAgICogd2l0aCBuZXR3b3JrLXNwZWNpZmljIGNvbmZpZ3VyYXRpb25zLlxuICAgKiBUaGlzIGZ1bmN0aW9uIG1heSByZXR1cm4gbnVsbC4gSWYgc28sIG5vIGFtcC1hbmFseXRpY3MgZWxlbWVudCB3aWxsIGJlXG4gICAqIGFkZGVkIHRvIHRoaXMgQTRBIGVsZW1lbnQgYW5kIG5vIEE0QSB0cmlnZ2VycyB3aWxsIGJlIGZpcmVkLlxuICAgKiBAcmV0dXJuIHs/SnNvbk9iamVjdH1cbiAgICovXG4gIGdldEE0YUFuYWx5dGljc0NvbmZpZygpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBleGVjdXRlIFJlYWwgVGltZSBDb25maWcsIGlmIHRoZSBhZCBuZXR3b3JrIGhhcyBlbmFibGVkIGl0LlxuICAgKiBJZiBpdCBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBuZXR3b3JrLCBidXQgdGhlIHB1Ymxpc2hlciBoYXMgaW5jbHVkZWRcbiAgICogdGhlIHJ0Yy1jb25maWcgYXR0cmlidXRlIG9uIHRoZSBhbXAtYWQgZWxlbWVudCwgd2Fybi4gQWRkaXRpb25hbHksXG4gICAqIGlmIHRoZSBwdWJsaXNoZXIgaGFzIGluY2x1ZGVkIGEgdmFsaWQgYGJsb2NrLXJ0Y2AgYXR0cmlidXRlLCBkb24ndCBzZW5kLlxuICAgKiBAcGFyYW0gez9DT05TRU5UX1BPTElDWV9TVEFURX0gY29uc2VudFN0YXRlXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gY29uc2VudFN0cmluZ1xuICAgKiBAcGFyYW0gez9PYmplY3Q8c3RyaW5nLCBzdHJpbmd8bnVtYmVyfGJvb2xlYW58dW5kZWZpbmVkPn0gY29uc2VudE1ldGFkYXRhXG4gICAqIEByZXR1cm4ge1Byb21pc2U8IUFycmF5PCFydGNSZXNwb25zZURlZj4+fHVuZGVmaW5lZH1cbiAgICovXG4gIHRyeUV4ZWN1dGVSZWFsVGltZUNvbmZpZ18oY29uc2VudFN0YXRlLCBjb25zZW50U3RyaW5nLCBjb25zZW50TWV0YWRhdGEpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgncnRjLWNvbmZpZycpKSB7XG4gICAgICBpbnN0YWxsUmVhbFRpbWVDb25maWdTZXJ2aWNlRm9yRG9jKHRoaXMuZ2V0QW1wRG9jKCkpO1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QmxvY2tSdGNfKCkudGhlbigoc2hvdWxkQmxvY2spID0+XG4gICAgICAgIHNob3VsZEJsb2NrXG4gICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICA6IFNlcnZpY2VzLnJlYWxUaW1lQ29uZmlnRm9yRG9jKHRoaXMuZ2V0QW1wRG9jKCkpLnRoZW4oXG4gICAgICAgICAgICAgIChyZWFsVGltZUNvbmZpZykgPT5cbiAgICAgICAgICAgICAgICByZWFsVGltZUNvbmZpZy5tYXliZUV4ZWN1dGVSZWFsVGltZUNvbmZpZyhcbiAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q3VzdG9tUmVhbFRpbWVDb25maWdNYWNyb3NfKCksXG4gICAgICAgICAgICAgICAgICBjb25zZW50U3RhdGUsXG4gICAgICAgICAgICAgICAgICBjb25zZW50U3RyaW5nLFxuICAgICAgICAgICAgICAgICAgY29uc2VudE1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgdGhpcy52ZXJpZnlTdGlsbEN1cnJlbnQoKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRvIGJlIG92ZXJyaWRlbiBieSBuZXR3b3JrIGltcGwuIFNob3VsZCByZXR1cm4gYSBtYXBwaW5nIG9mIG1hY3JvIGtleXNcbiAgICogdG8gdmFsdWVzIGZvciBzdWJzdGl0dXRpb24gaW4gcHVibGlzaGVyLXNwZWNpZmllZCBVUkxzIGZvciBSVEMuXG4gICAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLFxuICAgKiAgICEuLi8uLi8uLi9zcmMvc2VydmljZS92YXJpYWJsZS1zb3VyY2UuQXN5bmNSZXNvbHZlckRlZj59XG4gICAqL1xuICBnZXRDdXN0b21SZWFsVGltZUNvbmZpZ01hY3Jvc18oKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgcHJlZmVyZW50aWFsIHJlbmRlciBzaG91bGQgc3RpbGwgYmUgdXRpbGl6ZWQgaWYgd2ViIGNyeXB0byBpc1xuICAgKiB1bmF2YWlsYWJsZSwgYW5kIGNyeXB0byBzaWduYXR1cmUgaGVhZGVyIGlzIHByZXNlbnQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBzaG91bGRQcmVmZXJlbnRpYWxSZW5kZXJXaXRob3V0Q3J5cHRvKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZz19IGhlYWRlclZhbHVlIE1ldGhvZCBhcyBnaXZlbiBpbiBoZWFkZXIuXG4gICAqIEByZXR1cm4gez9YT1JJR0lOX01PREV9XG4gICAqL1xuICBnZXROb25BbXBDcmVhdGl2ZVJlbmRlcmluZ01ldGhvZChoZWFkZXJWYWx1ZSkge1xuICAgIGlmIChoZWFkZXJWYWx1ZSkge1xuICAgICAgaWYgKCFpc0VudW1WYWx1ZShYT1JJR0lOX01PREUsIGhlYWRlclZhbHVlKSkge1xuICAgICAgICBkZXYoKS5lcnJvcihcbiAgICAgICAgICAnQU1QLUE0QScsXG4gICAgICAgICAgYGNyb3NzLW9yaWdpbiByZW5kZXIgbW9kZSBoZWFkZXIgJHtoZWFkZXJWYWx1ZX1gXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gLyoqIEB0eXBlIHtYT1JJR0lOX01PREV9ICovIChoZWFkZXJWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBTZXJ2aWNlcy5wbGF0Zm9ybUZvcih0aGlzLndpbikuaXNJb3MoKVxuICAgICAgPyBYT1JJR0lOX01PREUuTkFNRUZSQU1FXG4gICAgICA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBiYXNlIG9iamVjdCB0aGF0IHdpbGwgYmUgd3JpdHRlbiB0byBjcm9zcy1kb21haW4gaWZyYW1lIG5hbWVcbiAgICogYXR0cmlidXRlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfaXNTYWZlZnJhbWUgV2hldGhlciBjcmVhdGl2ZSBpcyByZW5kZXJpbmcgaW50b1xuICAgKiAgIGEgc2FmZWZyYW1lLlxuICAgKiBAcmV0dXJuIHshSnNvbk9iamVjdHx1bmRlZmluZWR9XG4gICAqL1xuICBnZXRBZGRpdGlvbmFsQ29udGV4dE1ldGFkYXRhKG9wdF9pc1NhZmVmcmFtZSkge31cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSByZWNlaXZlZCBjcmVhdGl2ZSBpcyB2ZXJpZmllZCBBTVAuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIGNyZWF0aXZlIGlzIHZlcmlmaWVkIEFNUCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNWZXJpZmllZEFtcENyZWF0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLmlzVmVyaWZpZWRBbXBDcmVhdGl2ZV87XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYW1wLWFkIHRpdGxlIGF0dHJpYnV0ZSBvciBhIGZhbGxiYWNrIHN0cmluZy5cbiAgICogQHJldHVybiB7c3RyaW5nfSBpZnJhbWUgdGl0bGUgYXR0cmlidXRlXG4gICAqL1xuICBnZXRJZnJhbWVUaXRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndGl0bGUnKSB8fCAnM3JkIHBhcnR5IGFkIGNvbnRlbnQnO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW55IGVuYWJsZWQgU1NSIGV4cGVyaW1lbnRzIHZpYSB0aGUgYW1wLXVzcXAgbWV0YSB0YWcuIFRoZXNlXG4gICAqIGNvcnJlc3BvbmQgdG8gdGhlIHByb3RvIGZpZWxkIGlkcyBpbiBjcy9BbXBUcmFuc2Zvcm1lclBhcmFtcy5cbiAgICpcbiAgICogVGhlc2UgZXhwZXJpbWVudHMgZG8gbm90IGhhdmUgYSBmdWxseSB1bmlxdWUgZXhwZXJpbWVudCBpZCBmb3IgZWFjaCB2YWx1ZSxcbiAgICogc28gd2UgY29uY2F0ZW5hdGUgdGhlIGtleSBhbmQgdmFsdWUgdG8gZ2VuZXJhdGUgYSBwc3VlZG8gaWQuIFdlIGFzc3VtZVxuICAgKiB0aGF0IGFueSBleHBlcmltZW50IGlzIGVpdGhlciBhIGJvb2xlYW4gKHNvIHR3byBicmFuY2hlcyksIG9yIGFuIGVudW0gd2l0aFxuICAgKiAxMDAgb3IgbGVzcyBicmFuY2hlcy4gU28sIHRoZSB2YWx1ZSBpcyBwYWRkZWQgYSBsZWFkaW5nIDAgaWYgbmVjZXNzYXJ5LlxuICAgKlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEByZXR1cm4geyFBcnJheTxzdHJpbmc+fVxuICAgKi9cbiAgZ2V0U3NyRXhwSWRzXygpIHtcbiAgICBjb25zdCBleHBzID0gW107XG4gICAgY29uc3QgbWV0YSA9IHRoaXMuZ2V0QW1wRG9jKCkuZ2V0TWV0YUJ5TmFtZSgnYW1wLXVzcXAnKTtcbiAgICBpZiAobWV0YSkge1xuICAgICAgY29uc3Qga2V5VmFsdWVzID0gbWV0YS5zcGxpdCgnLCcpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlWYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga3YgPSBrZXlWYWx1ZXNbaV0uc3BsaXQoJz0nKTtcbiAgICAgICAgaWYgKGt2Lmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlYXNvbmFibHkgYXNzdW1lIHRoYXQgYWxsIGltcG9ydGFudCBleHBzIGFyZSBlaXRoZXIgYm9vbGVhbnMsIG9yXG4gICAgICAgIC8vIGVudW1zIHdpdGggMTAwIG9yIGxlc3MgYnJhbmNoZXMuXG4gICAgICAgIGNvbnN0IHZhbCA9IE51bWJlcihrdlsxXSk7XG4gICAgICAgIGlmICghaXNOYU4oa3ZbMF0pICYmIHZhbCA+PSAwICYmIHZhbCA8IDEwMCkge1xuICAgICAgICAgIGNvbnN0IHBhZGRlZCA9IHBhZFN0YXJ0KGt2WzFdLCAyLCAnMCcpO1xuICAgICAgICAgIGV4cHMucHVzaChrdlswXSArIHBhZGRlZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4cHM7XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRhY2hzIHF1ZXJ5IHN0cmluZyBwb3J0aW9uIG9mIGFkIHVybCB0byBlcnJvci5cbiAqIEBwYXJhbSB7IUVycm9yfSBlcnJvclxuICogQHBhcmFtIHs/c3RyaW5nfSBhZFVybFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduQWRVcmxUb0Vycm9yKGVycm9yLCBhZFVybCkge1xuICBpZiAoIWFkVXJsIHx8IChlcnJvci5hcmdzICYmIGVycm9yLmFyZ3NbJ2F1J10pKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGFkUXVlcnlJZHggPSBhZFVybC5pbmRleE9mKCc/Jyk7XG4gIGlmIChhZFF1ZXJ5SWR4ID09IC0xKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIChlcnJvci5hcmdzIHx8IChlcnJvci5hcmdzID0ge30pKVsnYXUnXSA9IGFkVXJsLnN1YnN0cmluZyhcbiAgICBhZFF1ZXJ5SWR4ICsgMSxcbiAgICBhZFF1ZXJ5SWR4ICsgMjUxXG4gICk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2lnbmF0dXJlIHZlcmlmaWVyIGZvciB0aGUgZ2l2ZW4gd2luZG93LiBMYXppbHkgY3JlYXRlcyBpdCBpZiBpdFxuICogZG9lc24ndCBhbHJlYWR5IGV4aXN0LlxuICpcbiAqIFRoaXMgZW5zdXJlcyB0aGF0IG9ubHkgb25lIHNpZ25hdHVyZSB2ZXJpZmllciBleGlzdHMgcGVyIHdpbmRvdywgd2hpY2ggYWxsb3dzXG4gKiBtdWx0aXBsZSBGYXN0IEZldGNoIGFkIHNsb3RzIG9uIGEgcGFnZSAoZXZlbiBvbmVzIGZyb20gZGlmZmVyZW50IGFkIG5ldHdvcmtzKVxuICogdG8gc2hhcmUgdGhlIHNhbWUgY2FjaGVkIHB1YmxpYyBrZXlzLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHshU2lnbmF0dXJlVmVyaWZpZXJ9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNpZ25hdHVyZVZlcmlmaWVyRm9yKHdpbikge1xuICBjb25zdCBwcm9wZXJ0eU5hbWUgPSAnQU1QX0ZBU1RfRkVUQ0hfU0lHTkFUVVJFX1ZFUklGSUVSXyc7XG4gIHJldHVybiAoXG4gICAgd2luW3Byb3BlcnR5TmFtZV0gfHxcbiAgICAod2luW3Byb3BlcnR5TmFtZV0gPSBuZXcgU2lnbmF0dXJlVmVyaWZpZXIod2luLCBzaWduaW5nU2VydmVyVVJMcykpXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUGxhdGZvcm1TdXBwb3J0ZWQod2luKSB7XG4gIC8vIFJlcXVpcmUgU2hhZG93IERPTSBzdXBwb3J0IGZvciBhNGEuXG4gIGlmIChcbiAgICAhaXNOYXRpdmUod2luLkVsZW1lbnQucHJvdG90eXBlLmF0dGFjaFNoYWRvdykgJiZcbiAgICBpc0V4cGVyaW1lbnRPbih3aW4sICdkaXNhYmxlLWE0YS1ub24tc2QnKVxuICApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHBhc3NlZCBmdW5jdGlvbiBleGlzdHMgYW5kIGlzIG5hdGl2ZSB0byB0aGUgYnJvd3Nlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb258dW5kZWZpbmVkfSBmdW5jXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc05hdGl2ZShmdW5jKSB7XG4gIHJldHVybiAhIWZ1bmMgJiYgZnVuYy50b1N0cmluZygpLmluZGV4T2YoJ1tuYXRpdmUgY29kZV0nKSAhPSAtMTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-a4a/0.1/amp-a4a.js