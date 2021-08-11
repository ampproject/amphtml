import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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
// Because AdSense and DoubleClick are both operated by Google and their A4A
// implementations share some behavior in common, part of the logic for this
// implementation is located in the ads/google/a4a directory rather than here.
// Most other ad networks will want to put their A4A code entirely in the
// extensions/amp-ad-network-${NETWORK_NAME}-impl directory.
import "../../../src/service/real-time-config/real-time-config-impl";
import { ADS_INITIAL_INTERSECTION_EXP } from "../../../src/experiments/ads-initial-intersection-exp";
import { AmpA4A, ConsentTupleDef, DEFAULT_SAFEFRAME_VERSION, XORIGIN_MODE, assignAdUrlToError } from "../../amp-a4a/0.1/amp-a4a";
import { AmpAnalyticsConfigDef, QQID_HEADER, SANDBOX_HEADER, ValidAdContainerTypes, addCsiSignalsToAmpAnalyticsConfig, extractAmpAnalyticsConfig, getCsiAmpAnalyticsConfig, getCsiAmpAnalyticsVariables, getEnclosingContainerTypes, getIdentityToken, getServeNpaPromise, googleAdUrl, googleBlockParameters, googlePageParameters, groupAmpAdsByType, isCdnProxy, isReportingEnabled, maybeAppendErrorParameter, maybeInsertOriginTrialToken, truncAndTimeUrl } from "../../../ads/google/a4a/utils";
import { CONSENT_POLICY_STATE, CONSENT_STRING_TYPE } from "../../../src/core/constants/consent-state";
import { Deferred } from "../../../src/core/data-structures/promise";
import { FlexibleAdSlotDataTypeDef, getFlexibleAdSlotData } from "./flexible-ad-slot-utils";
import { Layout, isLayoutSizeDefined } from "../../../src/core/dom/layout";
import { Navigation } from "../../../src/service/navigation";
import { RTC_VENDORS } from "../../../src/service/real-time-config/callout-vendors";
import { RefreshManager // eslint-disable-line no-unused-vars
, getRefreshManager } from "../../amp-a4a/0.1/refresh-manager";
import { SafeframeHostApi } from "./safeframe-host";
import { Services } from "../../../src/service";
import { TFCD, constructSRABlockParameters, serializeTargeting, sraBlockCallbackHandler } from "./sra-utils";
import { WindowInterface } from "../../../src/core/window/interface";
import { addAmpExperimentIdToElement, addExperimentIdToElement, extractUrlExperimentId, isInManualExperiment } from "../../../ads/google/a4a/traffic-experiments";
import { assertDoesNotContainDisplay } from "../../../src/assert-display";
import { createElementWithAttributes, isRTL, removeElement } from "../../../src/core/dom";
import { deepMerge, dict } from "../../../src/core/types/object";
import { dev, devAssert, user } from "../../../src/log";
import { domFingerprintPlain } from "../../../src/core/dom/fingerprint";
import { escapeCssSelectorIdent } from "../../../src/core/dom/css-selectors";
import { getAmpAdRenderOutsideViewport, incrementLoadingAds, is3pThrottled, waitFor3pThrottle } from "../../amp-ad/0.1/concurrent-load";
import { getCryptoRandomBytesArray, utf8Decode } from "../../../src/core/types/string/bytes";
import { getExperimentBranch, isExperimentOn, randomlySelectUnsetExperiments } from "../../../src/experiments";
import { getMode } from "../../../src/mode";
import { getMultiSizeDimensions } from "../../../ads/google/utils";
import { setImportantStyles, setStyles } from "../../../src/core/dom/style";
import { getOrCreateAdCid } from "../../../src/ad-cid";
import { AMP_SIGNATURE_HEADER } from "../../amp-a4a/0.1/signature-verifier";
import { StoryAdAutoAdvance } from "../../../src/experiments/story-ad-auto-advance";
import { StoryAdPlacements } from "../../../src/experiments/story-ad-placements";
import { StoryAdSegmentExp } from "../../../src/experiments/story-ad-progress-segment";
import { getPageLayoutBoxBlocking } from "../../../src/core/dom/layout/page-layout-box";
import { insertAnalyticsElement } from "../../../src/extension-analytics";
import { isArray } from "../../../src/core/types";
import { isCancellation } from "../../../src/error-reporting";
import { lineDelimitedStreamer, metaJsonCreativeGrouper } from "../../../ads/google/a4a/line-delimited-response-handler";
import { parseQueryString } from "../../../src/core/types/string/url";
import { stringHash32 } from "../../../src/core/types/string";
import { tryParseJson } from "../../../src/core/types/object/json";

/** @type {string} */
var TAG = 'amp-ad-network-doubleclick-impl';

/** @const {string} */
var DOUBLECLICK_BASE_URL = 'https://securepubads.g.doubleclick.net/gampad/ads';

/** @const {string} */
var RTC_SUCCESS = '2';

/** @const {string} */
var DOUBLECLICK_SRA_EXP = 'doubleclickSraExp';

/** @const @enum{string} */
var DOUBLECLICK_SRA_EXP_BRANCHES = {
  SRA_CONTROL: '117152666',
  SRA: '117152667',
  SRA_NO_RECOVER: '21062235'
};

/** @const {string} */
var ZINDEX_EXP = 'zIndexExp';

/**@const @enum{string} */
var ZINDEX_EXP_BRANCHES = {
  NO_ZINDEX: '21065356',
  HOLDBACK: '21065357'
};

/** @const {string} */
var IDLE_CWV_EXP = 'dfp-render-on-idle-cwv-exp';

/** @const @enum{string} */
var IDLE_CWV_EXP_BRANCHES = {
  CONTROL: '20208860',
  EXPERIMENT: '20208859'
};

/**
 * Required size to be sent with fluid requests.
 * @const {string}
 */
var DUMMY_FLUID_SIZE = '320x50';

/** @const @private {string} attribute indicating if lazy fetch is enabled.*/
var LAZY_FETCH_ATTRIBUTE = 'data-lazy-fetch';

/**
 * Macros that can be expanded in json targeting attribute.
 */
var TARGETING_MACRO_ALLOWLIST = {
  'CLIENT_ID': true
};

/**
 * Map of pageview tokens to the instances they belong to.
 * @private {!Object<string, !AmpAdNetworkDoubleclickImpl>}
 */
var tokensToInstances = {};

/** @private {?Promise} */
var sraRequests = null;

/**
 * The random subdomain to load SafeFrame from, if SafeFrame is
 * being loaded from a random subdomain and if the subdomain
 * has been generated.
 * @private {?string}
 */
var safeFrameRandomSubdomain = null;

/** @typedef {{
      adUrl: !Promise<string>,
      lineItemId: string,
      creativeId: string,
      slotId: string,
      slotIndex: string,
    }} */
var TroubleshootDataDef;

/** @private {?JsonObject} */
var windowLocationQueryParameters;

/** @typedef {{width: number, height: number}} */
var SizeDef;

/** @typedef {(SizeDef|../../../src/layout-rect.LayoutRectDef)} */
var LayoutRectOrDimsDef;

/** @final */
export var AmpAdNetworkDoubleclickImpl = /*#__PURE__*/function (_AmpA4A) {
  _inherits(AmpAdNetworkDoubleclickImpl, _AmpA4A);

  var _super = _createSuper(AmpAdNetworkDoubleclickImpl);

  /**
   * @param {!Element} element
   */
  function AmpAdNetworkDoubleclickImpl(element) {
    var _this;

    _classCallCheck(this, AmpAdNetworkDoubleclickImpl);

    _this = _super.call(this, element);

    /**
     * Config to generate amp-analytics element for active view reporting.
     * @type {?JsonObject}
     * @private
     */
    _this.ampAnalyticsConfig_ = null;

    /** @private {!../../../src/service/extensions-impl.Extensions} */
    _this.extensions_ = Services.extensionsFor(_this.win);

    /** @private @const {?../../../src/service/performance-impl.Performance} */
    _this.performance_ = Services.performanceForOrNull(_this.win);

    /** @private {?string} */
    _this.qqid_ = null;

    /** @private {?LayoutRectOrDimsDef} */
    _this.initialSize_ = null;

    /** @type {?string} */
    _this.parameterSize = null;

    /** @private {?{width: number, height: number}} */
    _this.returnedSize_ = null;

    /** @private {?Element} */
    _this.ampAnalyticsElement_ = null;

    /** @type {?JsonObject|Object} */
    _this.jsonTargeting = null;

    /** @type {string} */
    _this.adKey = '0';

    /** @type {!Array<string>} */
    _this.experimentIds = [];

    /** @type {!Array<string>} */
    _this.ampExperimentIds = [];

    /** @protected {boolean} */
    _this.useSra = false;

    /** @protected {?Deferred<?Response>} */
    _this.sraDeferred = null;

    /** @private {?RefreshManager} */
    _this.refreshManager_ = null;

    /** @private {number} */
    _this.refreshCount_ = 0;

    /** @private {number} */
    _this.ifi_ = 0;

    /** @private {boolean} */
    _this.isFluidRequest_ = false;

    /**
     * @private {boolean}
     * Indicates that the primary size of the slot is fluid.
     */
    _this.isFluidPrimaryRequest_ = false;

    /** @private {?string} */
    _this.fluidImpressionUrl_ = null;

    /** @private {?Promise<!../../../ads/google/a4a/utils.IdentityToken>} */
    _this.identityTokenPromise_ = null;

    /** @type {?../../../ads/google/a4a/utils.IdentityToken} */
    _this.identityToken = null;

    /** @private {!TroubleshootDataDef} */
    _this.troubleshootData_ =
    /** @type {!TroubleshootDataDef} */
    {};

    /**
     * @private {?boolean} whether preferential rendered AMP creative, null
     * indicates no creative render.
     */
    _this.isAmpCreative_ = null;

    /** @private {boolean} */
    _this.isIdleRender_ = false;

    /** @private {?./safeframe-host.SafeframeHostApi} */
    _this.safeframeApi_ = null;

    /** @type {boolean} whether safeframe forced via tag */
    _this.forceSafeframe = false;

    if ('forceSafeframe' in _this.element.dataset) {
      if (!/^(1|(true))$/i.test(_this.element.dataset['forceSafeframe'])) {
        user().warn(TAG, 'Ignoring invalid data-force-safeframe attribute: ' + _this.element.dataset['forceSafeframe']);
      } else {
        _this.forceSafeframe = true;
      }
    }

    /** @protected {ConsentTupleDef} */
    _this.consentTuple = {};

    /** @protected {!Deferred<string>} */
    _this.getAdUrlDeferred = new Deferred();

    /**
     * @private {boolean}
     * Set to true when initial expansion effort fails. If true, the slot will
     * attempt to expand again when outside of the viewport.
     */
    _this.reattemptToExpandFluidCreative_ = false;

    /**
     * Whether or not the iframe containing the ad should be sandboxed via the
     * "sandbox" attribute.
     * @private {boolean}
     */
    _this.shouldSandbox_ = false;

    /**
     * Set after the ad request is built.
     * @private {?FlexibleAdSlotDataTypeDef}
     */
    _this.flexibleAdSlotData_ = null;

    /**
     * If true, will add a z-index to flex ad slots upon expansion.
     * @private {boolean}
     */
    _this.inZIndexHoldBack_ = false;

    /**
     * A signal from publishers to serve NPA through ad url.
     * @private {boolean}
     */
    _this.serveNpaSignal_ = false;
    return _this;
  }

  /**
   * @return {number|boolean} render on idle configuration with false
   *    indicating disabled.
   * @private
   */
  _createClass(AmpAdNetworkDoubleclickImpl, [{
    key: "getIdleRenderEnabled_",
    value: function getIdleRenderEnabled_() {
      if (this.isIdleRender_) {
        return this.isIdleRender_;
      }

      // Disable if publisher has indicated a non-default loading strategy.
      if (this.element.getAttribute('data-loading-strategy')) {
        return false;
      }

      var expVal = this.postAdResponseExperimentFeatures['render-idle-vp'];
      var vpRange = parseInt(expVal, 10);

      if (expVal && isNaN(vpRange)) {
        // holdback branch sends non-numeric value.
        return false;
      }

      if (vpRange) {
        return vpRange;
      }

      var fallbackRange = 12;

      if (!this.performance_) {
        return fallbackRange;
      }

      var idleCwvExpSelectedBranch = getExperimentBranch(this.win, IDLE_CWV_EXP);

      if (idleCwvExpSelectedBranch === IDLE_CWV_EXP_BRANCHES.CONTROL) {
        this.performance_.addEnabledExperiment('dfp-idle-cwv-control');
      } else if (idleCwvExpSelectedBranch === IDLE_CWV_EXP_BRANCHES.EXPERIMENT) {
        fallbackRange = 3;
        this.performance_.addEnabledExperiment('dfp-idle-cwv-exp');
      }

      return fallbackRange;
    }
    /** @override */

  }, {
    key: "idleRenderOutsideViewport",
    value: function idleRenderOutsideViewport() {
      var _this2 = this;

      var vpRange = this.getIdleRenderEnabled_();

      if (vpRange === false) {
        return vpRange;
      }

      var renderOutsideViewport = this.renderOutsideViewport();

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
      this.whenWithinViewport(renderOutsideViewport).then(function () {
        return _this2.isIdleRender_ = false;
      });
      return vpRange;
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      this.isFluidPrimaryRequest_ = layout == Layout.FLUID;
      this.isFluidRequest_ = this.isFluidRequest_ || this.isFluidPrimaryRequest_;
      return this.isFluidPrimaryRequest_ || isLayoutSizeDefined(layout);
    }
    /** @override */

  }, {
    key: "isValidElement",
    value: function isValidElement() {
      return this.isAmpAdElement();
    }
    /**
     * Executes page level experiment diversion and pushes any experiment IDs
     * onto this.experimentIds.
     * @param {?string} urlExperimentId
     * @visibleForTesting
     */

  }, {
    key: "setPageLevelExperiments",
    value: function setPageLevelExperiments(urlExperimentId) {
      var _this3 = this;

      var forcedExperimentId;

      if (urlExperimentId) {
        forcedExperimentId = {
          // SRA
          '7': DOUBLECLICK_SRA_EXP_BRANCHES.SRA_CONTROL,
          '8': DOUBLECLICK_SRA_EXP_BRANCHES.SRA,
          '9': DOUBLECLICK_SRA_EXP_BRANCHES.SRA_NO_RECOVER
        }[urlExperimentId];

        if (forcedExperimentId) {
          this.experimentIds.push(forcedExperimentId);
        }
      }

      var experimentInfoList =
      /** @type {!Array<!../../../src/experiments.ExperimentInfo>} */
      [{
        experimentId: DOUBLECLICK_SRA_EXP,
        isTrafficEligible: function isTrafficEligible() {
          return !forcedExperimentId && !_this3.win.document.
          /*OK*/
          querySelector('meta[name=amp-ad-enable-refresh], ' + 'amp-ad[type=doubleclick][data-enable-refresh], ' + 'meta[name=amp-ad-doubleclick-sra]');
        },
        branches: Object.keys(DOUBLECLICK_SRA_EXP_BRANCHES).map(function (key) {
          return DOUBLECLICK_SRA_EXP_BRANCHES[key];
        })
      }, {
        experimentId: ZINDEX_EXP,
        isTrafficEligible: function isTrafficEligible() {
          return true;
        },
        branches: Object.values(ZINDEX_EXP_BRANCHES)
      }, {
        experimentId: ADS_INITIAL_INTERSECTION_EXP.id,
        isTrafficEligible: function isTrafficEligible() {
          return true;
        },
        branches: [ADS_INITIAL_INTERSECTION_EXP.control, ADS_INITIAL_INTERSECTION_EXP.experiment]
      }, {
        experimentId: IDLE_CWV_EXP,
        isTrafficEligible: function isTrafficEligible() {
          return !!_this3.performance_ && !_this3.element.getAttribute('data-loading-strategy');
        },
        branches: Object.values(IDLE_CWV_EXP_BRANCHES)
      }];
      var setExps = this.randomlySelectUnsetExperiments_(experimentInfoList);
      Object.keys(setExps).forEach(function (expName) {
        return setExps[expName] && _this3.experimentIds.push(setExps[expName]);
      });
      var ssrExpIds = this.getSsrExpIds_();

      for (var i = 0; i < ssrExpIds.length; i++) {
        addAmpExperimentIdToElement(ssrExpIds[i], this.element);
      }

      if (setExps[ZINDEX_EXP] == ZINDEX_EXP_BRANCHES.HOLDBACK) {
        this.inZIndexHoldBack_ = true;
      }

      var storyAdPlacementsExpId = getExperimentBranch(this.win, StoryAdPlacements.ID);

      if (storyAdPlacementsExpId) {
        addExperimentIdToElement(storyAdPlacementsExpId, this.element);
      }

      var autoAdvanceExpBranch = getExperimentBranch(this.win, StoryAdAutoAdvance.ID);

      if (autoAdvanceExpBranch) {
        addExperimentIdToElement(autoAdvanceExpBranch, this.element);
      }

      var storyAdSegmentBranch = getExperimentBranch(this.win, StoryAdSegmentExp.ID);

      if (storyAdSegmentBranch) {
        addExperimentIdToElement(storyAdSegmentBranch, this.element);
      }
    }
    /**
     * For easier unit testing.
     * @param {!Array<!../../../src/experiments.ExperimentInfo>} experimentInfoList
     * @return {!Object<string, string>}
     */

  }, {
    key: "randomlySelectUnsetExperiments_",
    value: function randomlySelectUnsetExperiments_(experimentInfoList) {
      return randomlySelectUnsetExperiments(this.win, experimentInfoList);
    }
    /**
     * For easier unit testing.
     * @return {?string}
     */

  }, {
    key: "extractUrlExperimentId_",
    value: function extractUrlExperimentId_() {
      return extractUrlExperimentId(this.win, this.element);
    }
    /** @private */

  }, {
    key: "maybeDeprecationWarn_",
    value: function maybeDeprecationWarn_() {
      var warnDeprecation = function warnDeprecation(feature) {
        return user().warn(TAG, feature + " is no longer supported for DoubleClick." + 'Please refer to ' + 'https://github.com/ampproject/amphtml/issues/11834 ' + 'for more information');
      };

      var usdrd = 'useSameDomainRenderingUntilDeprecated';
      var hasUSDRD = usdrd in this.element.dataset || (tryParseJson(this.element.getAttribute('json')) || {})[usdrd];

      if (hasUSDRD) {
        warnDeprecation(usdrd);
      }

      var useRemoteHtml = this.getAmpDoc().getMetaByName('amp-3p-iframe-src') !== null;

      if (useRemoteHtml) {
        warnDeprecation('remote.html');
      }
    }
    /** @override */

  }, {
    key: "delayAdRequestEnabled",
    value: function delayAdRequestEnabled() {
      if (this.element.getAttribute(LAZY_FETCH_ATTRIBUTE) !== 'true') {
        return false;
      }

      return getAmpAdRenderOutsideViewport(this.element) || 3;
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      var _this4 = this;

      _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "buildCallback", this).call(this);

      this.maybeDeprecationWarn_();
      maybeInsertOriginTrialToken(this.win);
      this.setPageLevelExperiments(this.extractUrlExperimentId_());
      var pubEnabledSra = !!this.win.document.querySelector('meta[name=amp-ad-doubleclick-sra]');
      var delayFetchEnabled = !!this.win.document.querySelector("amp-ad[type=doubleclick][" + escapeCssSelectorIdent(LAZY_FETCH_ATTRIBUTE) + "=true]");

      if (pubEnabledSra && delayFetchEnabled) {
        user().warn(TAG, 'SRA is not compatible with lazy fetching, disabling SRA');
      }

      this.useSra = !delayFetchEnabled && (getMode().localDev && /(\?|&)force_sra=true(&|$)/.test(this.win.location.search) || pubEnabledSra || [DOUBLECLICK_SRA_EXP_BRANCHES.SRA, DOUBLECLICK_SRA_EXP_BRANCHES.SRA_NO_RECOVER].some(function (eid) {
        return _this4.experimentIds.indexOf(eid) >= 0;
      }));
      this.identityTokenPromise_ = this.getAmpDoc().whenFirstVisible().then(function () {
        return getIdentityToken(_this4.win, _this4.getAmpDoc(), _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "getConsentPolicy", _this4).call(_this4));
      });
      this.troubleshootData_.slotId = this.element.getAttribute('data-slot');
      this.troubleshootData_.slotIndex = this.element.getAttribute('data-amp-slot-index');

      if (!this.isFluidRequest_) {
        var multiSizeStr = this.element.getAttribute('data-multi-size');
        this.isFluidRequest_ = !!multiSizeStr && multiSizeStr.indexOf('fluid') != -1;
      }
    }
    /** @override */

  }, {
    key: "shouldPreferentialRenderWithoutCrypto",
    value: function shouldPreferentialRenderWithoutCrypto() {
      devAssert(!isCdnProxy(this.win));
      return true;
    }
    /**
     * @param {?ConsentTupleDef} consentTuple
     * @param {!Array<!AmpAdNetworkDoubleclickImpl>=} instances
     * @return {!Object<string,string|boolean|number>}
     * @visibleForTesting
     */

  }, {
    key: "getPageParameters",
    value: function getPageParameters(consentTuple, instances) {
      instances = instances || [this];
      var tokens = getPageviewStateTokensForAdRequest(instances);
      var additionalConsent = consentTuple.additionalConsent,
          consentString = consentTuple.consentString,
          consentStringType = consentTuple.consentStringType,
          gdprApplies = consentTuple.gdprApplies;
      return {
        'ptt': 13,
        'npa': consentTuple.consentState == CONSENT_POLICY_STATE.INSUFFICIENT || consentTuple.consentState == CONSENT_POLICY_STATE.UNKNOWN || this.serveNpaSignal_ ? 1 : null,
        'gdfp_req': '1',
        'sfv': DEFAULT_SAFEFRAME_VERSION,
        'u_sd': WindowInterface.getDevicePixelRatio(),
        'gct': this.getLocationQueryParameterValue('google_preview') || null,
        'psts': tokens.length ? tokens : null,
        'gdpr': gdprApplies === true ? '1' : gdprApplies === false ? '0' : null,
        'gdpr_consent': consentStringType != CONSENT_STRING_TYPE.US_PRIVACY_STRING ? consentString : null,
        'addtl_consent': additionalConsent,
        'us_privacy': consentStringType == CONSENT_STRING_TYPE.US_PRIVACY_STRING ? consentString : null
      };
    }
    /**
     * @override
     */

  }, {
    key: "skipClientSideValidation",
    value: function skipClientSideValidation(headers) {
      return headers && !headers.has(AMP_SIGNATURE_HEADER);
    }
    /**
     * Constructs block-level url parameters.
     * @return {!Object<string,string|boolean|number>}
     */

  }, {
    key: "getBlockParameters_",
    value: function getBlockParameters_() {
      devAssert(this.initialSize_);
      devAssert(this.jsonTargeting);
      var tfcd = this.jsonTargeting && this.jsonTargeting[TFCD];
      this.win['ampAdGoogleIfiCounter'] = this.win['ampAdGoogleIfiCounter'] || 1;
      this.ifi_ = this.isRefreshing && this.ifi_ || this.win['ampAdGoogleIfiCounter']++;
      var pageLayoutBox = this.isSinglePageStoryAd ? getPageLayoutBoxBlocking(this.element) : null;
      var msz = null;
      var psz = null;
      var fws = null;
      this.flexibleAdSlotData_ = getFlexibleAdSlotData(this.win, this.element.parentElement);
      var _this$flexibleAdSlotD = this.flexibleAdSlotData_,
          fwSignal = _this$flexibleAdSlotD.fwSignal,
          parentWidth = _this$flexibleAdSlotD.parentWidth,
          slotWidth = _this$flexibleAdSlotD.slotWidth;
      // If slotWidth is -1, that means its width must be determined by its
      // parent container, and so should have the same value as parentWidth.
      msz = (slotWidth == -1 ? parentWidth : slotWidth) + "x-1";
      psz = parentWidth + "x-1";
      fws = fwSignal ? fwSignal : '0';
      return _extends({
        'iu': this.element.getAttribute('data-slot'),
        'co': this.jsonTargeting && this.jsonTargeting['cookieOptOut'] ? '1' : null,
        'adk': this.adKey,
        'sz': this.isSinglePageStoryAd ? '1x1' : this.parameterSize,
        'output': 'html',
        'impl': 'ifr',
        'tfcd': tfcd == undefined ? null : tfcd,
        'adtest': isInManualExperiment(this.element) ? 'on' : null,
        'ifi': this.ifi_,
        'rc': this.refreshCount_ || null,
        'fluid': this.isFluidRequest_ ? 'height' : null,
        'fsf': this.forceSafeframe ? '1' : null,
        'msz': msz,
        'psz': psz,
        'fws': fws,
        'scp': serializeTargeting(this.jsonTargeting && this.jsonTargeting['targeting'] || null, this.jsonTargeting && this.jsonTargeting['categoryExclusions'] || null, null),
        'spsa': this.isSinglePageStoryAd ? pageLayoutBox.width + "x" + pageLayoutBox.height : null
      }, googleBlockParameters(this));
    }
    /**
     * Populate's block-level state for ad URL construction.
     * Sets initialSize_ , jsonTargeting, and adKey member fields.
     * @param {ConsentTupleDef} consentTuple
     * @visibleForTesting
     */

  }, {
    key: "populateAdUrlState",
    value: function populateAdUrlState(consentTuple) {
      this.consentTuple = consentTuple;
      // Allow for pub to override height/width via override attribute.
      var width = Number(this.element.getAttribute('data-override-width')) || Number(this.element.getAttribute('width'));
      var height = Number(this.element.getAttribute('data-override-height')) || Number(this.element.getAttribute('height'));
      this.initialSize_ = this.isFluidPrimaryRequest_ ? {
        width: 0,
        height: 0
      } : width && height ? // width/height could be 'auto' in which case we fallback to measured.
      {
        width: width,
        height: height
      } : this.getIntersectionElementLayoutBox();
      this.jsonTargeting = tryParseJson(this.element.getAttribute('json')) || {};
      this.adKey = this.generateAdKey_(this.initialSize_.width + "x" + this.initialSize_.height);
      this.parameterSize = this.getParameterSize_();
    }
    /** @override */

  }, {
    key: "getConsentPolicy",
    value: function getConsentPolicy() {
      // Ensure that build is not blocked by need for consent (delay will occur
      // prior to RTC & ad URL construction).
      return null;
    }
    /** @override */

  }, {
    key: "getAdUrl",
    value: function getAdUrl(opt_consentTuple, opt_rtcResponsesPromise, opt_serveNpaSignal) {
      var _this5 = this;

      if (this.useSra) {
        this.sraDeferred = this.sraDeferred || new Deferred();
      }

      this.serveNpaSignal_ = !!opt_serveNpaSignal;
      var consentTuple = opt_consentTuple || {};

      if (consentTuple.consentState == CONSENT_POLICY_STATE.UNKNOWN && this.element.getAttribute('data-npa-on-unknown-consent') != 'true') {
        user().info(TAG, 'Ad request suppressed due to unknown consent');
        this.getAdUrlDeferred.resolve('');
        return Promise.resolve('');
      }

      if (this.iframe && !this.isRefreshing) {
        dev().warn(TAG, "Frame already exists, sra: " + this.useSra);
        this.getAdUrlDeferred.resolve('');
        return Promise.resolve('');
      }

      opt_rtcResponsesPromise = opt_rtcResponsesPromise || _resolvedPromise();
      // TODO(keithwrightbos): SRA blocks currently unnecessarily generate full
      // ad url.  This could be optimized however non-SRA ad url is required to
      // fallback to non-SRA if single block.
      this.populateAdUrlState(consentTuple);
      // TODO: Check for required and allowed parameters. Probably use
      // validateData, from 3p/3p/js, after moving it someplace common.
      var startTime = Date.now();
      var timerService = Services.timerFor(this.win);
      var identityPromise = timerService.timeoutPromise(1000, this.identityTokenPromise_).catch(function () {
        // On error/timeout, proceed.
        return (
          /**@type {!../../../ads/google/a4a/utils.IdentityToken}*/
          {}
        );
      });
      var checkStillCurrent = this.verifyStillCurrent();
      var rtcParamsPromise = opt_rtcResponsesPromise.then(function (results) {
        checkStillCurrent();
        return _this5.mergeRtcResponses_(results);
      });
      var targetingExpansionPromise = timerService.timeoutPromise(1000, this.expandJsonTargeting_(rtcParamsPromise)).catch(function () {
        dev().warn(TAG, 'JSON Targeting expansion failed/timed out.');
      });
      Promise.all([rtcParamsPromise, identityPromise, targetingExpansionPromise]).then(function (results) {
        checkStillCurrent();
        var rtcParams = results[0];
        _this5.identityToken = results[1];
        googleAdUrl(_this5, DOUBLECLICK_BASE_URL, startTime, Object.assign(_this5.getBlockParameters_(), _this5.buildIdentityParams(), _this5.getPageParameters(consentTuple,
        /* instances= */
        undefined), rtcParams), _this5.experimentIds).then(function (adUrl) {
          return _this5.getAdUrlDeferred.resolve(adUrl);
        });
      });
      this.troubleshootData_.adUrl = this.getAdUrlDeferred.promise;
      return this.getAdUrlDeferred.promise;
    }
    /** @override */

  }, {
    key: "getServeNpaSignal",
    value: function getServeNpaSignal() {
      return getServeNpaPromise(this.element);
    }
    /**
     * Waits for RTC to complete, then overwrites json attr targeting values
     * with expanded vars.
     * @param {!Promise} rtcMergedPromise
     * @return {!Promise}
     */

  }, {
    key: "expandJsonTargeting_",
    value: function expandJsonTargeting_(rtcMergedPromise) {
      var _this6 = this;

      return rtcMergedPromise.then(function () {
        var targeting = _this6.jsonTargeting['targeting'];

        if (!targeting) {
          return _resolvedPromise2();
        }

        var expansionPromises = Object.keys(targeting).map(function (key) {
          return _this6.expandValue_(targeting[key]).then(function (expanded) {
            targeting[key] = expanded;
          });
        });
        return Promise.all(expansionPromises);
      });
    }
    /**
     * Expands json targeting values.
     * @param {string|Array<string>|null} value
     * @return {!Promise<string>|!Promise<Array<string>>}
     */

  }, {
    key: "expandValue_",
    value: function expandValue_(value) {
      var _this7 = this;

      if (!value) {
        return Promise.resolve(value);
      }

      if (isArray(value)) {
        return Promise.all(value.map(function (arrVal) {
          return _this7.expandString_(dev().assertString(arrVal));
        }));
      }

      return this.expandString_(dev().assertString(value));
    }
    /**
     * Expands macros in strings.
     * @param {string} string
     * @return {!Promise<string>}
     */

  }, {
    key: "expandString_",
    value: function expandString_(string) {
      return Services.urlReplacementsForDoc(this.element).
      /*OK*/
      expandStringAsync(string, undefined
      /*opt_bindings*/
      , TARGETING_MACRO_ALLOWLIST);
    }
    /**
     * Converts identity token response to ad request parameters.
     * @return {!Object<string,string>}
     */

  }, {
    key: "buildIdentityParams",
    value: function buildIdentityParams() {
      return this.identityToken ? {
        adsid: this.identityToken.token || null,
        jar: this.identityToken.jar || null,
        pucrd: this.identityToken.pucrd || null
      } : {};
    }
    /**
     * Merges all of the rtcResponses into the JSON targeting and
     * category exclusions.
     * @param {?Array<!rtcResponseDef>} rtcResponseArray
     * @return {?Object|undefined}
     * @private
     */

  }, {
    key: "mergeRtcResponses_",
    value: function mergeRtcResponses_(rtcResponseArray) {
      var _this8 = this;

      if (!rtcResponseArray) {
        return null;
      }

      var artc = [];
      var ati = [];
      var ard = [];
      var exclusions;
      rtcResponseArray.forEach(function (rtcResponse) {
        if (!rtcResponse) {
          return;
        }

        artc.push(rtcResponse.rtcTime);
        ati.push(rtcResponse.error || RTC_SUCCESS);
        ard.push(rtcResponse.callout);

        if (rtcResponse.response) {
          if (rtcResponse.response['targeting']) {
            var rewrittenResponse = _this8.rewriteRtcKeys_(rtcResponse.response['targeting'], rtcResponse.callout);

            _this8.jsonTargeting['targeting'] = !!_this8.jsonTargeting['targeting'] ? deepMerge(_this8.jsonTargeting['targeting'], rewrittenResponse) : rewrittenResponse;
          }

          if (rtcResponse.response['categoryExclusions']) {
            if (!exclusions) {
              exclusions = {};

              if (_this8.jsonTargeting['categoryExclusions']) {
                /** @type {!Array} */
                _this8.jsonTargeting['categoryExclusions'].forEach(function (exclusion) {
                  exclusions[exclusion] = true;
                });
              }
            }

            /** @type {!Array} */
            rtcResponse.response['categoryExclusions'].forEach(function (exclusion) {
              exclusions[exclusion] = true;
            });
          }
        }
      });

      if (exclusions) {
        this.jsonTargeting['categoryExclusions'] = Object.keys(exclusions);
      }

      return {
        'artc': artc.join() || null,
        'ati': ati.join(),
        'ard': ard.join()
      };
    }
    /** @override */

  }, {
    key: "getCustomRealTimeConfigMacros_",
    value: function getCustomRealTimeConfigMacros_() {
      var _this9 = this;

      /**
       * This lists allowed attributes on the amp-ad element to be used as
       * macros for constructing the RTC URL. Add attributes here, in lowercase,
       * to make them available.
       */
      var allowlist = {
        'height': true,
        'width': true,
        'json': true,
        'data-slot': true,
        'data-multi-size': true,
        'data-multi-size-validation': true,
        'data-override-width': true,
        'data-override-height': true,
        'data-amp-slot-index': true
      };
      return {
        PAGEVIEWID: function PAGEVIEWID() {
          return Services.documentInfoForDoc(_this9.element).pageViewId;
        },
        PAGEVIEWID_64: function PAGEVIEWID_64() {
          return Services.documentInfoForDoc(_this9.element).pageViewId64;
        },
        HREF: function HREF() {
          return _this9.win.location.href;
        },
        REFERRER: function REFERRER(opt_timeout) {
          return _this9.getReferrer_(opt_timeout);
        },
        TGT: function TGT() {
          return JSON.stringify((tryParseJson(_this9.element.getAttribute('json')) || {})['targeting']);
        },
        ADCID: function ADCID(opt_timeout) {
          return getOrCreateAdCid(_this9.getAmpDoc(), 'AMP_ECID_GOOGLE', '_ga', parseInt(opt_timeout, 10));
        },
        ATTR: function ATTR(name) {
          if (!allowlist[name.toLowerCase()]) {
            dev().warn(TAG, "Invalid attribute " + name);
          } else {
            return _this9.element.getAttribute(name);
          }
        },
        ELEMENT_POS: function ELEMENT_POS() {
          return getPageLayoutBoxBlocking(_this9.element).top;
        },
        SCROLL_TOP: function SCROLL_TOP() {
          return Services.viewportForDoc(_this9.getAmpDoc()).getScrollTop();
        },
        PAGE_HEIGHT: function PAGE_HEIGHT() {
          return Services.viewportForDoc(_this9.getAmpDoc()).getScrollHeight();
        },
        BKG_STATE: function BKG_STATE() {
          return _this9.getAmpDoc().isVisible() ? 'visible' : 'hidden';
        },
        CANONICAL_URL: function CANONICAL_URL() {
          return Services.documentInfoForDoc(_this9.element).canonicalUrl;
        }
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

  }, {
    key: "getReferrer_",
    value: function getReferrer_(opt_timeout) {
      var timeoutInt = parseInt(opt_timeout, 10);
      var referrerPromise = Services.viewerForDoc(this.getAmpDoc()).getReferrerUrl();

      if (isNaN(timeoutInt) || timeoutInt < 0) {
        return referrerPromise;
      }

      return Services.timerFor(this.win).timeoutPromise(timeoutInt, referrerPromise).catch(function () {
        return undefined;
      });
    }
    /**
     * Appends the callout value to the keys of response to prevent a collision
     * case caused by multiple vendors returning the same keys.
     * @param {!Object<string, string>} response
     * @param {string} callout
     * @return {!Object<string, string>}
     * @private
     */

  }, {
    key: "rewriteRtcKeys_",
    value: function rewriteRtcKeys_(response, callout) {
      // Only perform this substitution for vendor-defined URLs.
      if (!RTC_VENDORS[callout] || RTC_VENDORS[callout].disableKeyAppend) {
        return response;
      }

      var newResponse = {};
      Object.keys(response).forEach(function (key) {
        newResponse[key + "_" + callout] = response[key];
      });
      return newResponse;
    }
    /** @override */

  }, {
    key: "onNetworkFailure",
    value: function onNetworkFailure(error, adUrl) {
      dev().info(TAG, 'network error, attempt adding of error parameter', error);
      return {
        adUrl: maybeAppendErrorParameter(adUrl, 'n')
      };
    }
    /** @override */

  }, {
    key: "maybeValidateAmpCreative",
    value: function maybeValidateAmpCreative(bytes, headers) {
      if (headers.get('AMP-Verification-Checksum-Algorithm') !== 'djb2a-32') {
        return _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "maybeValidateAmpCreative", this).call(this, bytes, headers);
      }

      var checksum = headers.get('AMP-Verification-Checksum');
      return Promise.resolve(checksum && stringHash32(utf8Decode(bytes)) == checksum ? bytes : null);
    }
    /** @override */

  }, {
    key: "extractSize",
    value: function extractSize(responseHeaders) {
      this.ampAnalyticsConfig_ = extractAmpAnalyticsConfig(this, responseHeaders);
      this.qqid_ = responseHeaders.get(QQID_HEADER);
      this.shouldSandbox_ = responseHeaders.get(SANDBOX_HEADER) == 'true';
      this.troubleshootData_.creativeId = dev().assertString(responseHeaders.get('google-creative-id') || '-1');
      this.troubleshootData_.lineItemId = dev().assertString(responseHeaders.get('google-lineitem-id') || '-1');

      if (this.ampAnalyticsConfig_) {
        // Load amp-analytics extensions
        this.extensions_.
        /*OK*/
        installExtensionForDoc(this.getAmpDoc(), 'amp-analytics');
      }

      // If the server returned a size, use that, otherwise use the size that we
      // sent in the ad request.
      var size = _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "extractSize", this).call(this, responseHeaders);

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
        this.setPageviewStateToken(dev().assertString(responseHeaders.get('amp-ff-pageview-tokens')));
      }

      return size;
    }
    /**
     * Returns the width and height of the slot as defined by the width and height
     * attributes, or the dimensions as computed by
     * getIntersectionElementLayoutBox.
     * @return {!LayoutRectOrDimsDef}
     */

  }, {
    key: "getSlotSize",
    value: function getSlotSize() {
      var _this$getDeclaredSlot = this.getDeclaredSlotSize_(),
          height = _this$getDeclaredSlot.height,
          width = _this$getDeclaredSlot.width;

      return width && height ? {
        width: width,
        height: height
      } : // width/height could be 'auto' in which case we fallback to measured.
      this.getIntersectionElementLayoutBox();
    }
    /**
     * Returns the width and height, as defined by the slot element's width and
     * height attributes.
     * @return {!SizeDef}
     */

  }, {
    key: "getDeclaredSlotSize_",
    value: function getDeclaredSlotSize_() {
      var width = Number(this.element.getAttribute('width'));
      var height = Number(this.element.getAttribute('height'));
      return {
        width: width,
        height: height
      };
    }
    /**
     * @return {string} The size parameter.
     * @private
     */

  }, {
    key: "getParameterSize_",
    value: function getParameterSize_() {
      var sz = this.isFluidRequest_ ? DUMMY_FLUID_SIZE : '';

      if (!this.isFluidPrimaryRequest_) {
        sz += (sz.length ? '|' : '') + (this.initialSize_.width + "x" + this.initialSize_.height);
      }

      var multiSizeDataStr = this.element.getAttribute('data-multi-size');

      if (multiSizeDataStr) {
        var multiSizeValidation = this.element.getAttribute('data-multi-size-validation') || 'true';
        // The following call will check all specified multi-size dimensions,
        // verify that they meet all requirements, and then return all the valid
        // dimensions in an array.
        var dimensions = getMultiSizeDimensions(multiSizeDataStr, this.initialSize_.width, this.initialSize_.height, multiSizeValidation == 'true', this.isFluidPrimaryRequest_);

        if (dimensions.length) {
          sz += '|' + dimensions.map(function (dimension) {
            return dimension.join('x');
          }).join('|');
        }
      }

      return sz;
    }
    /** @override */

  }, {
    key: "sandboxHTMLCreativeFrame",
    value: function sandboxHTMLCreativeFrame() {
      return this.shouldSandbox_;
    }
    /** @override */

  }, {
    key: "tearDownSlot",
    value: function tearDownSlot() {
      _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "tearDownSlot", this).call(this);

      this.element.setAttribute('data-amp-slot-index', this.win.ampAdSlotIdCounter++);

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

  }, {
    key: "renderNonAmpCreative",
    value: function renderNonAmpCreative() {
      var _this10 = this;

      // If render idle with throttling, impose one second render delay for
      // non-AMP creatives.  This is not done in the scheduler to ensure as many
      // slots as possible are marked for layout given scheduler imposes 5 seconds
      // past previous execution.
      if (this.postAdResponseExperimentFeatures['render-idle-throttle'] && this.isIdleRender_) {
        if (is3pThrottled(this.win)) {
          return waitFor3pThrottle().then(function () {
            return _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "renderNonAmpCreative", _this10).call(_this10);
          });
        } else {
          incrementLoadingAds(this.win);
          return _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "renderNonAmpCreative", this).call(this, true);
        }
      }

      return _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "renderNonAmpCreative", this).call(this);
    }
    /** @override */

  }, {
    key: "viewportCallbackTemp",
    value: function viewportCallbackTemp(inViewport) {
      _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "viewportCallbackTemp", this).call(this, inViewport);

      if (this.reattemptToExpandFluidCreative_ && !inViewport) {
        // If the initial expansion attempt failed (e.g., the slot was within the
        // viewport), then we will re-attempt to expand it here whenever the slot
        // is outside the viewport.
        this.expandFluidCreative_();
      }
    }
    /** @override  */

  }, {
    key: "unlayoutCallback",
    value: function unlayoutCallback() {
      if (this.refreshManager_) {
        this.refreshManager_.unobserve();
      }

      if (!this.useSra && this.isAmpCreative_) {
        // Allow non-AMP creatives to remain unless SRA.
        return false;
      }

      this.destroySafeFrameApi_();
      return _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "unlayoutCallback", this).call(this);
    }
    /** @override */

  }, {
    key: "getSafeframePath",
    value: function getSafeframePath() {
      safeFrameRandomSubdomain = safeFrameRandomSubdomain || this.getRandomString_();
      return "https://" + safeFrameRandomSubdomain + ".safeframe.googlesyndication.com/safeframe/" + (this.safeframeVersion + "/html/container.html");
    }
    /** @visibleForTesting */

  }, {
    key: "cleanupAfterTest",
    value: function cleanupAfterTest() {
      this.destroySafeFrameApi_();
    }
    /** @private */

  }, {
    key: "destroySafeFrameApi_",
    value: function destroySafeFrameApi_() {
      if (!this.safeframeApi_) {
        return;
      }

      this.safeframeApi_.destroy();
      this.safeframeApi_ = null;
    }
    /** @override */

  }, {
    key: "refresh",
    value: function refresh(refreshEndCallback) {
      this.refreshCount_++;
      return _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "refresh", this).call(this, refreshEndCallback);
    }
    /** @override */

  }, {
    key: "onCreativeRender",
    value: function onCreativeRender(creativeMetaData, opt_onLoadPromise) {
      var _this11 = this;

      _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "onCreativeRender", this).call(this, creativeMetaData);

      this.isAmpCreative_ = !!creativeMetaData;

      if (creativeMetaData && !creativeMetaData.customElementExtensions.includes('amp-ad-exit')) {
        // Capture phase click handlers on the ad if amp-ad-exit not present
        // (assume it will handle capture).
        devAssert(this.iframe);
        Navigation.installAnchorClickInterceptor(this.getAmpDoc(), devAssert(this.iframe.contentWindow));
      }

      if (this.ampAnalyticsConfig_) {
        devAssert(!this.ampAnalyticsElement_);

        if (isReportingEnabled(this)) {
          addCsiSignalsToAmpAnalyticsConfig(this.win, this.element, this.ampAnalyticsConfig_, this.qqid_, !!creativeMetaData);
        }

        this.ampAnalyticsElement_ = insertAnalyticsElement(this.element, this.ampAnalyticsConfig_,
        /*loadAnalytics*/
        true, !!this.postAdResponseExperimentFeatures['avr_disable_immediate']);
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
      var size = this.returnedSize_ || this.getSlotSize();
      var isMultiSizeFluid = this.isFluidRequest_ && this.returnedSize_ && // TODO(@glevitzky, 11583) Remove this clause once we stop sending back
      // the size header for fluid ads. Fluid size headers always come back as
      // 0x0.
      !(size.width == 0 && size.height == 0);
      setStyles(dev().assertElement(this.iframe), {
        width: size.width + "px",
        height: size.height + "px",
        position: isMultiSizeFluid ? 'relative' : null
      });

      // Check if this is a multi-size creative that's narrower than the ad slot.
      if (this.returnedSize_ && this.returnedSize_.width && this.returnedSize_.width < this.getSlotSize().width) {
        setStyles(dev().assertElement(this.iframe), {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        });
      }

      if (this.qqid_) {
        this.element.setAttribute('data-google-query-id', this.qqid_);
      }

      dev().assertElement(this.iframe).id = "google_ads_iframe_" + this.ifi_;

      if (isMultiSizeFluid) {
        // This is a fluid + multi-size request, where the returned creative is
        // multi-size. The slot needs to not be styled with width: 100%, or the
        // creative will be centered instead of left-aligned.
        this.element.removeAttribute('height');
        setStyles(this.element, {
          width: size.width + "px"
        });
      }

      if (opt_onLoadPromise) {
        opt_onLoadPromise.then(function () {
          _this11.expandFluidCreative_();
        });
      }

      this.refreshManager_ = this.refreshManager_ || getRefreshManager(this, function () {
        if (_this11.useSra) {
          user().warn(TAG, 'Refresh not compatible with SRA.');
          return false;
        }

        if (getEnclosingContainerTypes(_this11.element).filter(function (container) {
          return container != ValidAdContainerTypes['AMP-CAROUSEL'] && container != ValidAdContainerTypes['AMP-STICKY-AD'];
        }).length) {
          user().warn(TAG, 'Refresh not compatible with ad-containers, except for ' + 'AMP-CAROUSEL and AMP-STICKY-AD');
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

  }, {
    key: "expandFluidCreative_",
    value: function expandFluidCreative_() {
      var _this12 = this;

      if (this.isFluidRequest_ && // If a size was returned in the response, then this is a multi-size
      // response, not a fluid response.
      !this.returnedSize_ && this.isVerifiedAmpCreative()) {
        // This is an AMP fluid creative that will be rendered in a friendly
        // frame.
        if (!this.iframe || !this.iframe.contentWindow || !this.iframe.contentWindow.document || !this.iframe.contentWindow.document.body) {
          dev().error(TAG, 'Attempting to expand fluid creative without ' + 'a properly set up friendly frame. Slot id: ' + this.element.getAttribute('data-amp-slot-index'));
          return Promise.reject('Cannot access body of friendly frame');
        }

        return this.setCssPosition_('static').then(function () {
          return _this12.attemptChangeHeight(_this12.iframe.contentWindow.document.body.
          /*OK*/
          clientHeight).then(function () {
            _this12.fireFluidDelayedImpression();

            _this12.reattemptToExpandFluidCreative_ = false;
          }).catch(function () {
            user().warn(TAG, 'Attempt to change size failed on fluid ' + 'creative. Will re-attempt when slot is out of the viewport.');

            var _this12$getSlotSize = _this12.getSlotSize(),
                height = _this12$getSlotSize.height,
                width = _this12$getSlotSize.width;

            if (width && height) {
              // This call is idempotent, so it's okay to make it multiple
              // times.
              _this12.fireFluidDelayedImpression();
            }

            _this12.reattemptToExpandFluidCreative_ = true;

            _this12.setCssPosition_('absolute');
          });
        });
      }

      return _resolvedPromise3();
    }
    /**
     * Sets the CSS 'position' property of this.element.
     * @param {string} position The CSS position value.
     * @return {!Promise} A promise that resolves when mutation is complete.
     * @private
     */

  }, {
    key: "setCssPosition_",
    value: function setCssPosition_(position) {
      var _this13 = this;

      return this.mutateElement(function () {
        setImportantStyles(_this13.element, {
          position: position
        });
      }, this.element);
    }
    /**
     * @param {string} size
     * @return {string} The ad unit hash key string.
     * @private
     */

  }, {
    key: "generateAdKey_",
    value: function generateAdKey_(size) {
      var element = this.element;
      var domFingerprint = domFingerprintPlain(element);
      var slot = element.getAttribute('data-slot') || '';
      var multiSize = element.getAttribute('data-multi-size') || '';
      var string = slot + ":" + size + ":" + multiSize + ":" + domFingerprint;
      return stringHash32(string);
    }
    /**
     * Attempts to resize the ad, if the returned size is smaller than the primary
     * dimensions.
     * @param {number} newWidth
     * @param {number} newHeight
     * @private
     */

  }, {
    key: "handleResize_",
    value: function handleResize_(newWidth, newHeight) {
      var isFluidRequestAndFixedResponse = !!(this.isFluidRequest_ && newWidth && newHeight);

      var _this$getDeclaredSlot2 = this.getDeclaredSlotSize_(),
          height = _this$getDeclaredSlot2.height,
          width = _this$getDeclaredSlot2.width;

      var returnedSizeDifferent = newWidth != width || newHeight != height;
      var heightNotIncreased = newHeight <= height;

      if (isFluidRequestAndFixedResponse || returnedSizeDifferent && heightNotIncreased) {
        this.attemptChangeSize(newHeight, newWidth).catch(function () {});

        if (newWidth > width && ( // If 'fluid' were the primary requested size, ensure we do not trigger
        // slot adjustment if the returned size is one of the requested multi-
        // sizes. Slot adjustment should only be triggered when the creative
        // size is not one of the requested sizes.
        !this.isFluidPrimaryRequest_ || this.parameterSize && this.parameterSize.indexOf(newWidth + "x" + newHeight) == -1)) {
          this.adjustSlotPostExpansion_(newWidth);
        }
      }
    }
    /**
     * Ensures that slot is properly centered after being expanded.
     * @param {number} newWidth The new width of the slot.
     * @private
     */

  }, {
    key: "adjustSlotPostExpansion_",
    value: function adjustSlotPostExpansion_(newWidth) {
      if (!devAssert(this.flexibleAdSlotData_, 'Attempted to expand slot without flexible ad slot data.')) {
        return;
      }

      var _this$flexibleAdSlotD2 = this.flexibleAdSlotData_,
          parentStyle = _this$flexibleAdSlotD2.parentStyle,
          parentWidth = _this$flexibleAdSlotD2.parentWidth;
      var isRtl = isRTL(this.win.document);
      var dirStr = isRtl ? 'Right' : 'Left';
      var
      /** !Object<string, string> */
      style = this.inZIndexHoldBack_ ? {
        'z-index': '11'
      } : {};

      // Compute offset margins if the slot is not centered by default.
      if (parentStyle.textAlign != 'center') {
        var getMarginStr = function getMarginStr(marginNum) {
          return Math.round(marginNum) + "px";
        };

        if (newWidth <= parentWidth) {
          // Must center creative within its parent container
          var parentPadding = parseInt(parentStyle["padding" + dirStr], 10) || 0;
          var parentBorder = parseInt(parentStyle["border" + dirStr + "Width"], 10) || 0;
          var whitespace = (this.flexibleAdSlotData_.parentWidth - newWidth) / 2;
          style[isRtl ? 'margin-right' : 'margin-left'] = getMarginStr(whitespace - parentPadding - parentBorder);
        } else {
          // Must center creative within the viewport
          var viewportWidth = this.getViewport().getRect().width;
          var pageLayoutBox = getPageLayoutBoxBlocking(this.element);

          var _whitespace = (viewportWidth - newWidth) / 2;

          if (isRtl) {
            style['margin-right'] = getMarginStr(pageLayoutBox.right + _whitespace - viewportWidth);
          } else {
            style['margin-left'] = getMarginStr(-(pageLayoutBox.left - _whitespace));
          }
        }
      }

      setStyles(this.element, assertDoesNotContainDisplay(style));
    }
    /** @override */

  }, {
    key: "sendXhrRequest",
    value: function sendXhrRequest(adUrl) {
      var _this14 = this;

      if (!this.useSra) {
        return _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "sendXhrRequest", this).call(this, adUrl);
      }

      var checkStillCurrent = this.verifyStillCurrent();
      // InitiateSraRequests resolves when all blocks have had their SRA
      // responses returned such that sraDeferred being non-null indicates this
      // element was somehow not included so report.
      this.initiateSraRequests().then(function () {
        checkStillCurrent();

        if (!_this14.sraDeferred) {
          dev().warn(TAG, "SRA failed to include element " + _this14.ifi_);

          if (isExperimentOn(_this14.win, 'doubleclickSraReportExcludedBlock')) {
            _this14.getAmpDoc().getBody().appendChild(createElementWithAttributes(_this14.win.document, 'amp-pixel', dict({
              'src': 'https://pagead2.googlesyndication.com/pagead/gen_204?' + ("id=" + encodeURIComponent('a4a::sra') + "&ifi=" + _this14.ifi_)
            })));
          }
        }
      });
      // Wait for SRA request which will call response promise when this block's
      // response has been returned. Null response indicates single slot should
      // execute using non-SRA method.
      return this.sraDeferred.promise.then(function (response) {
        checkStillCurrent();
        _this14.sraDeferred = null;
        return response || _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "sendXhrRequest", _this14).call(_this14, adUrl);
      });
    }
    /**
     * @param {string} impressions
     * @param {boolean=} scrubReferer
     * @visibleForTesting
     */

  }, {
    key: "fireDelayedImpressions",
    value: function fireDelayedImpressions(impressions, scrubReferer) {
      var _this15 = this;

      if (!impressions) {
        return;
      }

      impressions.split(',').forEach(function (url) {
        try {
          if (!Services.urlForDoc(_this15.element).isSecure(url)) {
            dev().warn(TAG, "insecure impression url: " + url);
            return;
          }

          // Create amp-pixel and append to document to send impression.
          _this15.win.document.body.appendChild(createElementWithAttributes(_this15.win.document, 'amp-pixel', dict({
            'src': url,
            'referrerpolicy': scrubReferer ? 'no-referrer' : ''
          })));
        } catch (unusedError) {}
      });
    }
    /**
     * Fires the fluid delayed impression, if the URL is available.
     */

  }, {
    key: "fireFluidDelayedImpression",
    value: function fireFluidDelayedImpression() {
      if (this.fluidImpressionUrl_) {
        this.fireDelayedImpressions(this.fluidImpressionUrl_);
        this.fluidImpressionUrl_ = null;
      }
    }
    /**
     * Groups slots by type and networkId from data-slot parameter.  Exposed for
     * ease of testing.
     * @return {!Promise<!Object<string,!Array<!Promise<!../../../src/base-element.BaseElement>>>>}
     * @visibleForTesting
     */

  }, {
    key: "groupSlotsForSra",
    value: function groupSlotsForSra() {
      return groupAmpAdsByType(this.getAmpDoc(), this.element.getAttribute('type'), getNetworkId);
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

  }, {
    key: "initiateSraRequests",
    value: function initiateSraRequests() {
      var _this16 = this;

      // Use cancellation of the first slot's promiseId as indication of
      // unlayoutCallback execution.  Assume that if called for one slot, it will
      // be called for all and we should cancel SRA execution.
      var checkStillCurrent = this.verifyStillCurrent();
      var noFallbackExp = this.experimentIds.includes(DOUBLECLICK_SRA_EXP_BRANCHES.SRA_NO_RECOVER);
      sraRequests = sraRequests || this.groupSlotsForSra().then(function (groupIdToBlocksAry) {
        checkStillCurrent();
        var sraRequestPromises = [];
        Object.keys(groupIdToBlocksAry).forEach(function (networkId) {
          var blocks = devAssert(groupIdToBlocksAry[networkId]);
          // TODO: filter blocks with SRA disabled?
          sraRequestPromises.push(Promise.all(blocks).then(function (instances) {
            devAssert(instances.length);
            checkStillCurrent();
            // Exclude any instances that do not have an adPromise_ as this
            // indicates they were invalid.
            var typeInstances =
            /** @type {!Array<!AmpAdNetworkDoubleclickImpl>}*/
            instances.filter(function (instance) {
              var isValid = instance.hasAdPromise();

              if (!isValid) {
                dev().info(TAG, 'Ignoring instance without ad promise as ' + 'likely invalid', instance.element);
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
              dev().info(TAG, "single block in network " + networkId);
              // Ensure deferred exists, may not if getAdUrl did not yet
              // execute.
              typeInstances[0].sraDeferred = typeInstances[0].sraDeferred || new Deferred();
              typeInstances[0].sraDeferred.resolve(null);
              return;
            }

            var sraUrl;
            // Construct and send SRA request.
            // TODO(keithwrightbos) - how do we handle per slot 204 response?
            return constructSRARequest_(_this16, typeInstances).then(function (sraUrlIn) {
              checkStillCurrent();
              sraUrl = sraUrlIn;
              return Services.xhrFor(_this16.win).fetch(sraUrl, {
                mode: 'cors',
                method: 'GET',
                credentials: 'include'
              });
            }).then(function (response) {
              checkStillCurrent();
              // Chunk handler called with metadata and creative for each
              // slot in order of URLs given which is then passed to
              // resolver used for sendXhrRequest.
              var sraRequestAdUrlResolvers = typeInstances.map(function (instance) {
                return instance.sraDeferred.resolve;
              });
              var slotCallback = metaJsonCreativeGrouper(function (creative, headersObj, done) {
                checkStillCurrent();
                sraBlockCallbackHandler(creative, headersObj, done, sraRequestAdUrlResolvers, sraUrl, _this16.isInNoSigningExp());
              });
              lineDelimitedStreamer(_this16.win, response, slotCallback);
              return Promise.all(typeInstances.map(function (instance) {
                return instance.sraDeferred.promise;
              }));
            }).catch(function (error) {
              if (isCancellation(error)) {
                // Cancellation should be propagated to slot promises
                // causing their adPromise chains within A4A to handle
                // appropriately.
                typeInstances.forEach(function (instance) {
                  return instance.sraDeferred && instance.sraDeferred.reject(error);
                });
              } else if (noFallbackExp || !!_this16.win.document.querySelector('meta[name=amp-ad-doubleclick-sra]')) {
                // If publisher has explicitly enabled SRA mode (not
                // experiment), then assume error is network failure,
                // collapse slot, reset url to empty string to ensure
                // no fallback to frame GET (given expectation of SRA
                // consistency), and propagate error to A4A ad promise
                // chain.
                assignAdUrlToError(
                /** @type {!Error} */
                error, sraUrl);

                _this16.warnOnError('SRA request failure', error);

                // Publisher explicitly wants SRA so do not attempt to
                // recover as SRA guarantees cannot be enforced.
                typeInstances.forEach(function (instance) {
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
                typeInstances.forEach(function (instance) {
                  return instance.sraDeferred.resolve(null);
                });
              }
            });
          }));
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

  }, {
    key: "warnOnError",
    value: function warnOnError(message, error) {
      dev().warn(TAG, message, error);
    }
    /**
     * Generate a 32-byte random string.
     * Uses the win.crypto when available.
     * @return {string} The random string
     * @private
     */

  }, {
    key: "getRandomString_",
    value: function getRandomString_() {
      // 16 hex characters * 2 bytes per character = 32 bytes
      var length = 16;
      var randomValues = getCryptoRandomBytesArray(this.win, length);
      var randomSubdomain = '';

      for (var i = 0; i < length; i++) {
        // If crypto isn't available, just use Math.random.
        var randomValue = randomValues ? randomValues[i] : Math.floor(Math.random() * 255);

        // Ensure each byte is represented with two hexadecimal characters.
        if (randomValue <= 15) {
          randomSubdomain += '0';
        }

        randomSubdomain += randomValue.toString(16);
      }

      return randomSubdomain;
    }
    /** @override */

  }, {
    key: "getPreconnectUrls",
    value: function getPreconnectUrls() {
      return ['https://securepubads.g.doubleclick.net/'];
    }
    /** @override */

  }, {
    key: "getNonAmpCreativeRenderingMethod",
    value: function getNonAmpCreativeRenderingMethod(headerValue) {
      return this.forceSafeframe || this.isFluidRequest_ ? XORIGIN_MODE.SAFEFRAME : _get(_getPrototypeOf(AmpAdNetworkDoubleclickImpl.prototype), "getNonAmpCreativeRenderingMethod", this).call(this, headerValue);
    }
    /**
     * Note that location is parsed once on first access and cached.
     * @param {string} parameterName
     * @return {string|undefined} parameter value from window.location.search
     * @visibleForTesting
     */

  }, {
    key: "getLocationQueryParameterValue",
    value: function getLocationQueryParameterValue(parameterName) {
      windowLocationQueryParameters = windowLocationQueryParameters || parseQueryString(this.win.location && this.win.location.search || '');
      return windowLocationQueryParameters[parameterName];
    }
    /** @override */

  }, {
    key: "getAdditionalContextMetadata",
    value: function getAdditionalContextMetadata(isSafeFrame) {
      if (isSafeFrame === void 0) {
        isSafeFrame = false;
      }

      if (!this.isFluidRequest_ && !isSafeFrame) {
        return;
      }

      var creativeSize = this.getCreativeSize();
      devAssert(creativeSize, 'this.getCreativeSize returned null');

      if (this.isRefreshing) {
        if (this.safeframeApi_) {
          this.safeframeApi_.destroy();
        }

        this.safeframeApi_ = new SafeframeHostApi(this, this.isFluidRequest_,
        /** @type {{height, width}} */
        creativeSize);
      } else {
        this.safeframeApi_ = this.safeframeApi_ || new SafeframeHostApi(this, this.isFluidRequest_,
        /** @type {{height, width}} */
        creativeSize);
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

  }, {
    key: "postTroubleshootMessage",
    value: function postTroubleshootMessage() {
      var _this17 = this;

      if (!this.win.opener || !/[?|&]dfpdeb/.test(this.win.location.search)) {
        return null;
      }

      devAssert(this.troubleshootData_.adUrl, 'ad URL does not exist yet');
      return this.troubleshootData_.adUrl.then(function (adUrl) {
        var slotId = _this17.troubleshootData_.slotId + '_' + _this17.troubleshootData_.slotIndex;
        var payload = dict({
          'gutData': JSON.stringify(dict({
            'events': [{
              'timestamp': Date.now(),
              'slotid': slotId,
              'messageId': 4
            }],
            'slots': [{
              'contentUrl': adUrl || '',
              'id': slotId,
              'leafAdUnitName': _this17.troubleshootData_.slotId,
              'domId': slotId,
              'lineItemId': _this17.troubleshootData_.lineItemId,
              'creativeId': _this17.troubleshootData_.creativeId
            }]
          })),
          'userAgent': navigator.userAgent,
          'referrer': _this17.win.location.href,
          'messageType': 'LOAD'
        });

        _this17.win.opener.
        /*OK*/
        postMessage(payload, '*');
      });
    }
    /**
     * Sets the pageview state token associated with the slot. Token does not
     * expire.
     * @param {string} token
     */

  }, {
    key: "setPageviewStateToken",
    value: function setPageviewStateToken(token) {
      tokensToInstances[token] = this;
    }
    /**
     * Checks for the presence of a pageview token in the module level object
     * and removes it if present.
     */

  }, {
    key: "removePageviewStateToken",
    value: function removePageviewStateToken() {
      for (var token in tokensToInstances) {
        if (tokensToInstances[token] == this) {
          delete tokensToInstances[token];
          break;
        }
      }
    }
    /** @override */

  }, {
    key: "getA4aAnalyticsVars",
    value: function getA4aAnalyticsVars(analyticsTrigger) {
      return getCsiAmpAnalyticsVariables(analyticsTrigger, this, this.qqid_);
    }
    /** @override */

  }, {
    key: "getA4aAnalyticsConfig",
    value: function getA4aAnalyticsConfig() {
      return getCsiAmpAnalyticsConfig();
    }
    /**
     * @return {boolean} True if 'fluid' is one of the requested sizes, false
     * otherwise.
     */

  }, {
    key: "isFluidRequest",
    value: function isFluidRequest() {
      return this.isFluidRequest_;
    }
  }]);

  return AmpAdNetworkDoubleclickImpl;
}(AmpA4A);
AMP.extension(TAG, '0.1', function (AMP) {
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
  var networkId = /^(?:\/)?(\d+)/.exec(dev().assertString(element.getAttribute('data-slot')));
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
  var startTime = Date.now();
  return Promise.all(instances.map(function (instance) {
    return instance.getAdUrlDeferred.promise;
  })).then(function () {
    return googlePageParameters(a4a, startTime);
  }).then(function (googPageLevelParameters) {
    var blockParameters = constructSRABlockParameters(instances);
    return truncAndTimeUrl(DOUBLECLICK_BASE_URL, Object.assign(blockParameters, googPageLevelParameters, instances[0].getPageParameters(instances[0].consentTuple, instances)), startTime);
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
  var pageviewStateTokensInAdRequest = [];

  for (var token in tokensToInstances) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuanMiXSwibmFtZXMiOlsiQURTX0lOSVRJQUxfSU5URVJTRUNUSU9OX0VYUCIsIkFtcEE0QSIsIkNvbnNlbnRUdXBsZURlZiIsIkRFRkFVTFRfU0FGRUZSQU1FX1ZFUlNJT04iLCJYT1JJR0lOX01PREUiLCJhc3NpZ25BZFVybFRvRXJyb3IiLCJBbXBBbmFseXRpY3NDb25maWdEZWYiLCJRUUlEX0hFQURFUiIsIlNBTkRCT1hfSEVBREVSIiwiVmFsaWRBZENvbnRhaW5lclR5cGVzIiwiYWRkQ3NpU2lnbmFsc1RvQW1wQW5hbHl0aWNzQ29uZmlnIiwiZXh0cmFjdEFtcEFuYWx5dGljc0NvbmZpZyIsImdldENzaUFtcEFuYWx5dGljc0NvbmZpZyIsImdldENzaUFtcEFuYWx5dGljc1ZhcmlhYmxlcyIsImdldEVuY2xvc2luZ0NvbnRhaW5lclR5cGVzIiwiZ2V0SWRlbnRpdHlUb2tlbiIsImdldFNlcnZlTnBhUHJvbWlzZSIsImdvb2dsZUFkVXJsIiwiZ29vZ2xlQmxvY2tQYXJhbWV0ZXJzIiwiZ29vZ2xlUGFnZVBhcmFtZXRlcnMiLCJncm91cEFtcEFkc0J5VHlwZSIsImlzQ2RuUHJveHkiLCJpc1JlcG9ydGluZ0VuYWJsZWQiLCJtYXliZUFwcGVuZEVycm9yUGFyYW1ldGVyIiwibWF5YmVJbnNlcnRPcmlnaW5UcmlhbFRva2VuIiwidHJ1bmNBbmRUaW1lVXJsIiwiQ09OU0VOVF9QT0xJQ1lfU1RBVEUiLCJDT05TRU5UX1NUUklOR19UWVBFIiwiRGVmZXJyZWQiLCJGbGV4aWJsZUFkU2xvdERhdGFUeXBlRGVmIiwiZ2V0RmxleGlibGVBZFNsb3REYXRhIiwiTGF5b3V0IiwiaXNMYXlvdXRTaXplRGVmaW5lZCIsIk5hdmlnYXRpb24iLCJSVENfVkVORE9SUyIsIlJlZnJlc2hNYW5hZ2VyIiwiZ2V0UmVmcmVzaE1hbmFnZXIiLCJTYWZlZnJhbWVIb3N0QXBpIiwiU2VydmljZXMiLCJURkNEIiwiY29uc3RydWN0U1JBQmxvY2tQYXJhbWV0ZXJzIiwic2VyaWFsaXplVGFyZ2V0aW5nIiwic3JhQmxvY2tDYWxsYmFja0hhbmRsZXIiLCJXaW5kb3dJbnRlcmZhY2UiLCJhZGRBbXBFeHBlcmltZW50SWRUb0VsZW1lbnQiLCJhZGRFeHBlcmltZW50SWRUb0VsZW1lbnQiLCJleHRyYWN0VXJsRXhwZXJpbWVudElkIiwiaXNJbk1hbnVhbEV4cGVyaW1lbnQiLCJhc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXkiLCJjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMiLCJpc1JUTCIsInJlbW92ZUVsZW1lbnQiLCJkZWVwTWVyZ2UiLCJkaWN0IiwiZGV2IiwiZGV2QXNzZXJ0IiwidXNlciIsImRvbUZpbmdlcnByaW50UGxhaW4iLCJlc2NhcGVDc3NTZWxlY3RvcklkZW50IiwiZ2V0QW1wQWRSZW5kZXJPdXRzaWRlVmlld3BvcnQiLCJpbmNyZW1lbnRMb2FkaW5nQWRzIiwiaXMzcFRocm90dGxlZCIsIndhaXRGb3IzcFRocm90dGxlIiwiZ2V0Q3J5cHRvUmFuZG9tQnl0ZXNBcnJheSIsInV0ZjhEZWNvZGUiLCJnZXRFeHBlcmltZW50QnJhbmNoIiwiaXNFeHBlcmltZW50T24iLCJyYW5kb21seVNlbGVjdFVuc2V0RXhwZXJpbWVudHMiLCJnZXRNb2RlIiwiZ2V0TXVsdGlTaXplRGltZW5zaW9ucyIsInNldEltcG9ydGFudFN0eWxlcyIsInNldFN0eWxlcyIsImdldE9yQ3JlYXRlQWRDaWQiLCJBTVBfU0lHTkFUVVJFX0hFQURFUiIsIlN0b3J5QWRBdXRvQWR2YW5jZSIsIlN0b3J5QWRQbGFjZW1lbnRzIiwiU3RvcnlBZFNlZ21lbnRFeHAiLCJnZXRQYWdlTGF5b3V0Qm94QmxvY2tpbmciLCJpbnNlcnRBbmFseXRpY3NFbGVtZW50IiwiaXNBcnJheSIsImlzQ2FuY2VsbGF0aW9uIiwibGluZURlbGltaXRlZFN0cmVhbWVyIiwibWV0YUpzb25DcmVhdGl2ZUdyb3VwZXIiLCJwYXJzZVF1ZXJ5U3RyaW5nIiwic3RyaW5nSGFzaDMyIiwidHJ5UGFyc2VKc29uIiwiVEFHIiwiRE9VQkxFQ0xJQ0tfQkFTRV9VUkwiLCJSVENfU1VDQ0VTUyIsIkRPVUJMRUNMSUNLX1NSQV9FWFAiLCJET1VCTEVDTElDS19TUkFfRVhQX0JSQU5DSEVTIiwiU1JBX0NPTlRST0wiLCJTUkEiLCJTUkFfTk9fUkVDT1ZFUiIsIlpJTkRFWF9FWFAiLCJaSU5ERVhfRVhQX0JSQU5DSEVTIiwiTk9fWklOREVYIiwiSE9MREJBQ0siLCJJRExFX0NXVl9FWFAiLCJJRExFX0NXVl9FWFBfQlJBTkNIRVMiLCJDT05UUk9MIiwiRVhQRVJJTUVOVCIsIkRVTU1ZX0ZMVUlEX1NJWkUiLCJMQVpZX0ZFVENIX0FUVFJJQlVURSIsIlRBUkdFVElOR19NQUNST19BTExPV0xJU1QiLCJ0b2tlbnNUb0luc3RhbmNlcyIsInNyYVJlcXVlc3RzIiwic2FmZUZyYW1lUmFuZG9tU3ViZG9tYWluIiwiVHJvdWJsZXNob290RGF0YURlZiIsIndpbmRvd0xvY2F0aW9uUXVlcnlQYXJhbWV0ZXJzIiwiU2l6ZURlZiIsIkxheW91dFJlY3RPckRpbXNEZWYiLCJBbXBBZE5ldHdvcmtEb3VibGVjbGlja0ltcGwiLCJlbGVtZW50IiwiYW1wQW5hbHl0aWNzQ29uZmlnXyIsImV4dGVuc2lvbnNfIiwiZXh0ZW5zaW9uc0ZvciIsIndpbiIsInBlcmZvcm1hbmNlXyIsInBlcmZvcm1hbmNlRm9yT3JOdWxsIiwicXFpZF8iLCJpbml0aWFsU2l6ZV8iLCJwYXJhbWV0ZXJTaXplIiwicmV0dXJuZWRTaXplXyIsImFtcEFuYWx5dGljc0VsZW1lbnRfIiwianNvblRhcmdldGluZyIsImFkS2V5IiwiZXhwZXJpbWVudElkcyIsImFtcEV4cGVyaW1lbnRJZHMiLCJ1c2VTcmEiLCJzcmFEZWZlcnJlZCIsInJlZnJlc2hNYW5hZ2VyXyIsInJlZnJlc2hDb3VudF8iLCJpZmlfIiwiaXNGbHVpZFJlcXVlc3RfIiwiaXNGbHVpZFByaW1hcnlSZXF1ZXN0XyIsImZsdWlkSW1wcmVzc2lvblVybF8iLCJpZGVudGl0eVRva2VuUHJvbWlzZV8iLCJpZGVudGl0eVRva2VuIiwidHJvdWJsZXNob290RGF0YV8iLCJpc0FtcENyZWF0aXZlXyIsImlzSWRsZVJlbmRlcl8iLCJzYWZlZnJhbWVBcGlfIiwiZm9yY2VTYWZlZnJhbWUiLCJkYXRhc2V0IiwidGVzdCIsIndhcm4iLCJjb25zZW50VHVwbGUiLCJnZXRBZFVybERlZmVycmVkIiwicmVhdHRlbXB0VG9FeHBhbmRGbHVpZENyZWF0aXZlXyIsInNob3VsZFNhbmRib3hfIiwiZmxleGlibGVBZFNsb3REYXRhXyIsImluWkluZGV4SG9sZEJhY2tfIiwic2VydmVOcGFTaWduYWxfIiwiZ2V0QXR0cmlidXRlIiwiZXhwVmFsIiwicG9zdEFkUmVzcG9uc2VFeHBlcmltZW50RmVhdHVyZXMiLCJ2cFJhbmdlIiwicGFyc2VJbnQiLCJpc05hTiIsImZhbGxiYWNrUmFuZ2UiLCJpZGxlQ3d2RXhwU2VsZWN0ZWRCcmFuY2giLCJhZGRFbmFibGVkRXhwZXJpbWVudCIsImdldElkbGVSZW5kZXJFbmFibGVkXyIsInJlbmRlck91dHNpZGVWaWV3cG9ydCIsIndoZW5XaXRoaW5WaWV3cG9ydCIsInRoZW4iLCJsYXlvdXQiLCJGTFVJRCIsImlzQW1wQWRFbGVtZW50IiwidXJsRXhwZXJpbWVudElkIiwiZm9yY2VkRXhwZXJpbWVudElkIiwicHVzaCIsImV4cGVyaW1lbnRJbmZvTGlzdCIsImV4cGVyaW1lbnRJZCIsImlzVHJhZmZpY0VsaWdpYmxlIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYnJhbmNoZXMiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwia2V5IiwidmFsdWVzIiwiaWQiLCJjb250cm9sIiwiZXhwZXJpbWVudCIsInNldEV4cHMiLCJyYW5kb21seVNlbGVjdFVuc2V0RXhwZXJpbWVudHNfIiwiZm9yRWFjaCIsImV4cE5hbWUiLCJzc3JFeHBJZHMiLCJnZXRTc3JFeHBJZHNfIiwiaSIsImxlbmd0aCIsInN0b3J5QWRQbGFjZW1lbnRzRXhwSWQiLCJJRCIsImF1dG9BZHZhbmNlRXhwQnJhbmNoIiwic3RvcnlBZFNlZ21lbnRCcmFuY2giLCJ3YXJuRGVwcmVjYXRpb24iLCJmZWF0dXJlIiwidXNkcmQiLCJoYXNVU0RSRCIsInVzZVJlbW90ZUh0bWwiLCJnZXRBbXBEb2MiLCJnZXRNZXRhQnlOYW1lIiwibWF5YmVEZXByZWNhdGlvbldhcm5fIiwic2V0UGFnZUxldmVsRXhwZXJpbWVudHMiLCJleHRyYWN0VXJsRXhwZXJpbWVudElkXyIsInB1YkVuYWJsZWRTcmEiLCJkZWxheUZldGNoRW5hYmxlZCIsImxvY2FsRGV2IiwibG9jYXRpb24iLCJzZWFyY2giLCJzb21lIiwiZWlkIiwiaW5kZXhPZiIsIndoZW5GaXJzdFZpc2libGUiLCJzbG90SWQiLCJzbG90SW5kZXgiLCJtdWx0aVNpemVTdHIiLCJpbnN0YW5jZXMiLCJ0b2tlbnMiLCJnZXRQYWdldmlld1N0YXRlVG9rZW5zRm9yQWRSZXF1ZXN0IiwiYWRkaXRpb25hbENvbnNlbnQiLCJjb25zZW50U3RyaW5nIiwiY29uc2VudFN0cmluZ1R5cGUiLCJnZHByQXBwbGllcyIsImNvbnNlbnRTdGF0ZSIsIklOU1VGRklDSUVOVCIsIlVOS05PV04iLCJnZXREZXZpY2VQaXhlbFJhdGlvIiwiZ2V0TG9jYXRpb25RdWVyeVBhcmFtZXRlclZhbHVlIiwiVVNfUFJJVkFDWV9TVFJJTkciLCJoZWFkZXJzIiwiaGFzIiwidGZjZCIsImlzUmVmcmVzaGluZyIsInBhZ2VMYXlvdXRCb3giLCJpc1NpbmdsZVBhZ2VTdG9yeUFkIiwibXN6IiwicHN6IiwiZndzIiwicGFyZW50RWxlbWVudCIsImZ3U2lnbmFsIiwicGFyZW50V2lkdGgiLCJzbG90V2lkdGgiLCJ1bmRlZmluZWQiLCJ3aWR0aCIsImhlaWdodCIsIk51bWJlciIsImdldEludGVyc2VjdGlvbkVsZW1lbnRMYXlvdXRCb3giLCJnZW5lcmF0ZUFkS2V5XyIsImdldFBhcmFtZXRlclNpemVfIiwib3B0X2NvbnNlbnRUdXBsZSIsIm9wdF9ydGNSZXNwb25zZXNQcm9taXNlIiwib3B0X3NlcnZlTnBhU2lnbmFsIiwiaW5mbyIsInJlc29sdmUiLCJQcm9taXNlIiwiaWZyYW1lIiwicG9wdWxhdGVBZFVybFN0YXRlIiwic3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsInRpbWVyU2VydmljZSIsInRpbWVyRm9yIiwiaWRlbnRpdHlQcm9taXNlIiwidGltZW91dFByb21pc2UiLCJjYXRjaCIsImNoZWNrU3RpbGxDdXJyZW50IiwidmVyaWZ5U3RpbGxDdXJyZW50IiwicnRjUGFyYW1zUHJvbWlzZSIsInJlc3VsdHMiLCJtZXJnZVJ0Y1Jlc3BvbnNlc18iLCJ0YXJnZXRpbmdFeHBhbnNpb25Qcm9taXNlIiwiZXhwYW5kSnNvblRhcmdldGluZ18iLCJhbGwiLCJydGNQYXJhbXMiLCJhc3NpZ24iLCJnZXRCbG9ja1BhcmFtZXRlcnNfIiwiYnVpbGRJZGVudGl0eVBhcmFtcyIsImdldFBhZ2VQYXJhbWV0ZXJzIiwiYWRVcmwiLCJwcm9taXNlIiwicnRjTWVyZ2VkUHJvbWlzZSIsInRhcmdldGluZyIsImV4cGFuc2lvblByb21pc2VzIiwiZXhwYW5kVmFsdWVfIiwiZXhwYW5kZWQiLCJ2YWx1ZSIsImFyclZhbCIsImV4cGFuZFN0cmluZ18iLCJhc3NlcnRTdHJpbmciLCJzdHJpbmciLCJ1cmxSZXBsYWNlbWVudHNGb3JEb2MiLCJleHBhbmRTdHJpbmdBc3luYyIsImFkc2lkIiwidG9rZW4iLCJqYXIiLCJwdWNyZCIsInJ0Y1Jlc3BvbnNlQXJyYXkiLCJhcnRjIiwiYXRpIiwiYXJkIiwiZXhjbHVzaW9ucyIsInJ0Y1Jlc3BvbnNlIiwicnRjVGltZSIsImVycm9yIiwiY2FsbG91dCIsInJlc3BvbnNlIiwicmV3cml0dGVuUmVzcG9uc2UiLCJyZXdyaXRlUnRjS2V5c18iLCJleGNsdXNpb24iLCJqb2luIiwiYWxsb3dsaXN0IiwiUEFHRVZJRVdJRCIsImRvY3VtZW50SW5mb0ZvckRvYyIsInBhZ2VWaWV3SWQiLCJQQUdFVklFV0lEXzY0IiwicGFnZVZpZXdJZDY0IiwiSFJFRiIsImhyZWYiLCJSRUZFUlJFUiIsIm9wdF90aW1lb3V0IiwiZ2V0UmVmZXJyZXJfIiwiVEdUIiwiSlNPTiIsInN0cmluZ2lmeSIsIkFEQ0lEIiwiQVRUUiIsIm5hbWUiLCJ0b0xvd2VyQ2FzZSIsIkVMRU1FTlRfUE9TIiwidG9wIiwiU0NST0xMX1RPUCIsInZpZXdwb3J0Rm9yRG9jIiwiZ2V0U2Nyb2xsVG9wIiwiUEFHRV9IRUlHSFQiLCJnZXRTY3JvbGxIZWlnaHQiLCJCS0dfU1RBVEUiLCJpc1Zpc2libGUiLCJDQU5PTklDQUxfVVJMIiwiY2Fub25pY2FsVXJsIiwidGltZW91dEludCIsInJlZmVycmVyUHJvbWlzZSIsInZpZXdlckZvckRvYyIsImdldFJlZmVycmVyVXJsIiwiZGlzYWJsZUtleUFwcGVuZCIsIm5ld1Jlc3BvbnNlIiwiYnl0ZXMiLCJnZXQiLCJjaGVja3N1bSIsInJlc3BvbnNlSGVhZGVycyIsImNyZWF0aXZlSWQiLCJsaW5lSXRlbUlkIiwiaW5zdGFsbEV4dGVuc2lvbkZvckRvYyIsInNpemUiLCJoYW5kbGVSZXNpemVfIiwiZ2V0U2xvdFNpemUiLCJyZW1vdmVQYWdldmlld1N0YXRlVG9rZW4iLCJzZXRQYWdldmlld1N0YXRlVG9rZW4iLCJnZXREZWNsYXJlZFNsb3RTaXplXyIsInN6IiwibXVsdGlTaXplRGF0YVN0ciIsIm11bHRpU2l6ZVZhbGlkYXRpb24iLCJkaW1lbnNpb25zIiwiZGltZW5zaW9uIiwic2V0QXR0cmlidXRlIiwiYW1wQWRTbG90SWRDb3VudGVyIiwiaW5WaWV3cG9ydCIsImV4cGFuZEZsdWlkQ3JlYXRpdmVfIiwidW5vYnNlcnZlIiwiZGVzdHJveVNhZmVGcmFtZUFwaV8iLCJnZXRSYW5kb21TdHJpbmdfIiwic2FmZWZyYW1lVmVyc2lvbiIsImRlc3Ryb3kiLCJyZWZyZXNoRW5kQ2FsbGJhY2siLCJjcmVhdGl2ZU1ldGFEYXRhIiwib3B0X29uTG9hZFByb21pc2UiLCJjdXN0b21FbGVtZW50RXh0ZW5zaW9ucyIsImluY2x1ZGVzIiwiaW5zdGFsbEFuY2hvckNsaWNrSW50ZXJjZXB0b3IiLCJjb250ZW50V2luZG93IiwiaW5pdGlhdGVSZWZyZXNoQ3ljbGUiLCJpc1JlbGF5b3V0TmVlZGVkRmxhZyIsImlzTXVsdGlTaXplRmx1aWQiLCJhc3NlcnRFbGVtZW50IiwicG9zaXRpb24iLCJsZWZ0IiwidHJhbnNmb3JtIiwicmVtb3ZlQXR0cmlidXRlIiwiZmlsdGVyIiwiY29udGFpbmVyIiwicG9zdFRyb3VibGVzaG9vdE1lc3NhZ2UiLCJpc1ZlcmlmaWVkQW1wQ3JlYXRpdmUiLCJib2R5IiwicmVqZWN0Iiwic2V0Q3NzUG9zaXRpb25fIiwiYXR0ZW1wdENoYW5nZUhlaWdodCIsImNsaWVudEhlaWdodCIsImZpcmVGbHVpZERlbGF5ZWRJbXByZXNzaW9uIiwibXV0YXRlRWxlbWVudCIsImRvbUZpbmdlcnByaW50Iiwic2xvdCIsIm11bHRpU2l6ZSIsIm5ld1dpZHRoIiwibmV3SGVpZ2h0IiwiaXNGbHVpZFJlcXVlc3RBbmRGaXhlZFJlc3BvbnNlIiwicmV0dXJuZWRTaXplRGlmZmVyZW50IiwiaGVpZ2h0Tm90SW5jcmVhc2VkIiwiYXR0ZW1wdENoYW5nZVNpemUiLCJhZGp1c3RTbG90UG9zdEV4cGFuc2lvbl8iLCJwYXJlbnRTdHlsZSIsImlzUnRsIiwiZGlyU3RyIiwic3R5bGUiLCJ0ZXh0QWxpZ24iLCJnZXRNYXJnaW5TdHIiLCJtYXJnaW5OdW0iLCJNYXRoIiwicm91bmQiLCJwYXJlbnRQYWRkaW5nIiwicGFyZW50Qm9yZGVyIiwid2hpdGVzcGFjZSIsInZpZXdwb3J0V2lkdGgiLCJnZXRWaWV3cG9ydCIsImdldFJlY3QiLCJyaWdodCIsImluaXRpYXRlU3JhUmVxdWVzdHMiLCJnZXRCb2R5IiwiYXBwZW5kQ2hpbGQiLCJlbmNvZGVVUklDb21wb25lbnQiLCJpbXByZXNzaW9ucyIsInNjcnViUmVmZXJlciIsInNwbGl0IiwidXJsIiwidXJsRm9yRG9jIiwiaXNTZWN1cmUiLCJ1bnVzZWRFcnJvciIsImZpcmVEZWxheWVkSW1wcmVzc2lvbnMiLCJnZXROZXR3b3JrSWQiLCJub0ZhbGxiYWNrRXhwIiwiZ3JvdXBTbG90c0ZvclNyYSIsImdyb3VwSWRUb0Jsb2Nrc0FyeSIsInNyYVJlcXVlc3RQcm9taXNlcyIsIm5ldHdvcmtJZCIsImJsb2NrcyIsInR5cGVJbnN0YW5jZXMiLCJpbnN0YW5jZSIsImlzVmFsaWQiLCJoYXNBZFByb21pc2UiLCJzcmFVcmwiLCJjb25zdHJ1Y3RTUkFSZXF1ZXN0XyIsInNyYVVybEluIiwieGhyRm9yIiwiZmV0Y2giLCJtb2RlIiwibWV0aG9kIiwiY3JlZGVudGlhbHMiLCJzcmFSZXF1ZXN0QWRVcmxSZXNvbHZlcnMiLCJzbG90Q2FsbGJhY2siLCJjcmVhdGl2ZSIsImhlYWRlcnNPYmoiLCJkb25lIiwiaXNJbk5vU2lnbmluZ0V4cCIsIndhcm5PbkVycm9yIiwicmVzZXRBZFVybCIsImF0dGVtcHRDb2xsYXBzZSIsIm1lc3NhZ2UiLCJyYW5kb21WYWx1ZXMiLCJyYW5kb21TdWJkb21haW4iLCJyYW5kb21WYWx1ZSIsImZsb29yIiwicmFuZG9tIiwidG9TdHJpbmciLCJoZWFkZXJWYWx1ZSIsIlNBRkVGUkFNRSIsInBhcmFtZXRlck5hbWUiLCJpc1NhZmVGcmFtZSIsImNyZWF0aXZlU2l6ZSIsImdldENyZWF0aXZlU2l6ZSIsImdldFNhZmVmcmFtZU5hbWVBdHRyIiwib3BlbmVyIiwicGF5bG9hZCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsInBvc3RNZXNzYWdlIiwiYW5hbHl0aWNzVHJpZ2dlciIsIkFNUCIsImV4dGVuc2lvbiIsInJlZ2lzdGVyRWxlbWVudCIsInJlc2V0U3JhU3RhdGVGb3JUZXN0aW5nIiwicmVzZXRMb2NhdGlvblF1ZXJ5UGFyYW1ldGVyc0ZvclRlc3RpbmciLCJleGVjIiwiYTRhIiwiZ29vZ1BhZ2VMZXZlbFBhcmFtZXRlcnMiLCJibG9ja1BhcmFtZXRlcnMiLCJpbnN0YW5jZXNJbkFkUmVxdWVzdCIsInBhZ2V2aWV3U3RhdGVUb2tlbnNJbkFkUmVxdWVzdCIsInJlc2V0VG9rZW5zVG9JbnN0YW5jZXNNYXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7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UDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyx5QkFBVCxHQUFxQztBQUMxQzNZLEVBQUFBLGlCQUFpQixHQUFHLEVBQXBCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLy8gQmVjYXVzZSBBZFNlbnNlIGFuZCBEb3VibGVDbGljayBhcmUgYm90aCBvcGVyYXRlZCBieSBHb29nbGUgYW5kIHRoZWlyIEE0QVxuLy8gaW1wbGVtZW50YXRpb25zIHNoYXJlIHNvbWUgYmVoYXZpb3IgaW4gY29tbW9uLCBwYXJ0IG9mIHRoZSBsb2dpYyBmb3IgdGhpc1xuLy8gaW1wbGVtZW50YXRpb24gaXMgbG9jYXRlZCBpbiB0aGUgYWRzL2dvb2dsZS9hNGEgZGlyZWN0b3J5IHJhdGhlciB0aGFuIGhlcmUuXG4vLyBNb3N0IG90aGVyIGFkIG5ldHdvcmtzIHdpbGwgd2FudCB0byBwdXQgdGhlaXIgQTRBIGNvZGUgZW50aXJlbHkgaW4gdGhlXG4vLyBleHRlbnNpb25zL2FtcC1hZC1uZXR3b3JrLSR7TkVUV09SS19OQU1FfS1pbXBsIGRpcmVjdG9yeS5cblxuaW1wb3J0ICcjc2VydmljZS9yZWFsLXRpbWUtY29uZmlnL3JlYWwtdGltZS1jb25maWctaW1wbCc7XG5pbXBvcnQge0FEU19JTklUSUFMX0lOVEVSU0VDVElPTl9FWFB9IGZyb20gJyNleHBlcmltZW50cy9hZHMtaW5pdGlhbC1pbnRlcnNlY3Rpb24tZXhwJztcbmltcG9ydCB7XG4gIEFtcEE0QSxcbiAgQ29uc2VudFR1cGxlRGVmLFxuICBERUZBVUxUX1NBRkVGUkFNRV9WRVJTSU9OLFxuICBYT1JJR0lOX01PREUsXG4gIGFzc2lnbkFkVXJsVG9FcnJvcixcbn0gZnJvbSAnLi4vLi4vYW1wLWE0YS8wLjEvYW1wLWE0YSc7XG5pbXBvcnQge1xuICBBbXBBbmFseXRpY3NDb25maWdEZWYsXG4gIFFRSURfSEVBREVSLFxuICBTQU5EQk9YX0hFQURFUixcbiAgVmFsaWRBZENvbnRhaW5lclR5cGVzLFxuICBhZGRDc2lTaWduYWxzVG9BbXBBbmFseXRpY3NDb25maWcsXG4gIGV4dHJhY3RBbXBBbmFseXRpY3NDb25maWcsXG4gIGdldENzaUFtcEFuYWx5dGljc0NvbmZpZyxcbiAgZ2V0Q3NpQW1wQW5hbHl0aWNzVmFyaWFibGVzLFxuICBnZXRFbmNsb3NpbmdDb250YWluZXJUeXBlcyxcbiAgZ2V0SWRlbnRpdHlUb2tlbixcbiAgZ2V0U2VydmVOcGFQcm9taXNlLFxuICBnb29nbGVBZFVybCxcbiAgZ29vZ2xlQmxvY2tQYXJhbWV0ZXJzLFxuICBnb29nbGVQYWdlUGFyYW1ldGVycyxcbiAgZ3JvdXBBbXBBZHNCeVR5cGUsXG4gIGlzQ2RuUHJveHksXG4gIGlzUmVwb3J0aW5nRW5hYmxlZCxcbiAgbWF5YmVBcHBlbmRFcnJvclBhcmFtZXRlcixcbiAgbWF5YmVJbnNlcnRPcmlnaW5UcmlhbFRva2VuLFxuICB0cnVuY0FuZFRpbWVVcmwsXG59IGZyb20gJyNhZHMvZ29vZ2xlL2E0YS91dGlscyc7XG5pbXBvcnQge1xuICBDT05TRU5UX1BPTElDWV9TVEFURSxcbiAgQ09OU0VOVF9TVFJJTkdfVFlQRSxcbn0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2NvbnNlbnQtc3RhdGUnO1xuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuaW1wb3J0IHtcbiAgRmxleGlibGVBZFNsb3REYXRhVHlwZURlZixcbiAgZ2V0RmxleGlibGVBZFNsb3REYXRhLFxufSBmcm9tICcuL2ZsZXhpYmxlLWFkLXNsb3QtdXRpbHMnO1xuaW1wb3J0IHtMYXlvdXQsIGlzTGF5b3V0U2l6ZURlZmluZWR9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQnO1xuaW1wb3J0IHtOYXZpZ2F0aW9ufSBmcm9tICcjc2VydmljZS9uYXZpZ2F0aW9uJztcbmltcG9ydCB7UlRDX1ZFTkRPUlN9IGZyb20gJyNzZXJ2aWNlL3JlYWwtdGltZS1jb25maWcvY2FsbG91dC12ZW5kb3JzJztcbmltcG9ydCB7XG4gIFJlZnJlc2hNYW5hZ2VyLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIGdldFJlZnJlc2hNYW5hZ2VyLFxufSBmcm9tICcuLi8uLi9hbXAtYTRhLzAuMS9yZWZyZXNoLW1hbmFnZXInO1xuaW1wb3J0IHtTYWZlZnJhbWVIb3N0QXBpfSBmcm9tICcuL3NhZmVmcmFtZS1ob3N0JztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7XG4gIFRGQ0QsXG4gIGNvbnN0cnVjdFNSQUJsb2NrUGFyYW1ldGVycyxcbiAgc2VyaWFsaXplVGFyZ2V0aW5nLFxuICBzcmFCbG9ja0NhbGxiYWNrSGFuZGxlcixcbn0gZnJvbSAnLi9zcmEtdXRpbHMnO1xuaW1wb3J0IHtXaW5kb3dJbnRlcmZhY2V9IGZyb20gJyNjb3JlL3dpbmRvdy9pbnRlcmZhY2UnO1xuaW1wb3J0IHtcbiAgYWRkQW1wRXhwZXJpbWVudElkVG9FbGVtZW50LFxuICBhZGRFeHBlcmltZW50SWRUb0VsZW1lbnQsXG4gIGV4dHJhY3RVcmxFeHBlcmltZW50SWQsXG4gIGlzSW5NYW51YWxFeHBlcmltZW50LFxufSBmcm9tICcjYWRzL2dvb2dsZS9hNGEvdHJhZmZpYy1leHBlcmltZW50cyc7XG5pbXBvcnQge2Fzc2VydERvZXNOb3RDb250YWluRGlzcGxheX0gZnJvbSAnLi4vLi4vLi4vc3JjL2Fzc2VydC1kaXNwbGF5JztcbmltcG9ydCB7Y3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzLCBpc1JUTCwgcmVtb3ZlRWxlbWVudH0gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7ZGVlcE1lcmdlLCBkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydCwgdXNlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RvbUZpbmdlcnByaW50UGxhaW59IGZyb20gJyNjb3JlL2RvbS9maW5nZXJwcmludCc7XG5pbXBvcnQge2VzY2FwZUNzc1NlbGVjdG9ySWRlbnR9IGZyb20gJyNjb3JlL2RvbS9jc3Mtc2VsZWN0b3JzJztcbmltcG9ydCB7XG4gIGdldEFtcEFkUmVuZGVyT3V0c2lkZVZpZXdwb3J0LFxuICBpbmNyZW1lbnRMb2FkaW5nQWRzLFxuICBpczNwVGhyb3R0bGVkLFxuICB3YWl0Rm9yM3BUaHJvdHRsZSxcbn0gZnJvbSAnLi4vLi4vYW1wLWFkLzAuMS9jb25jdXJyZW50LWxvYWQnO1xuaW1wb3J0IHtnZXRDcnlwdG9SYW5kb21CeXRlc0FycmF5LCB1dGY4RGVjb2RlfSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcvYnl0ZXMnO1xuaW1wb3J0IHtcbiAgZ2V0RXhwZXJpbWVudEJyYW5jaCxcbiAgaXNFeHBlcmltZW50T24sXG4gIHJhbmRvbWx5U2VsZWN0VW5zZXRFeHBlcmltZW50cyxcbn0gZnJvbSAnI2V4cGVyaW1lbnRzJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtnZXRNdWx0aVNpemVEaW1lbnNpb25zfSBmcm9tICcjYWRzL2dvb2dsZS91dGlscyc7XG5pbXBvcnQge3NldEltcG9ydGFudFN0eWxlcywgc2V0U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG5pbXBvcnQge2dldE9yQ3JlYXRlQWRDaWR9IGZyb20gJy4uLy4uLy4uL3NyYy9hZC1jaWQnO1xuXG5pbXBvcnQge0FNUF9TSUdOQVRVUkVfSEVBREVSfSBmcm9tICcuLi8uLi9hbXAtYTRhLzAuMS9zaWduYXR1cmUtdmVyaWZpZXInO1xuaW1wb3J0IHtTdG9yeUFkQXV0b0FkdmFuY2V9IGZyb20gJyNleHBlcmltZW50cy9zdG9yeS1hZC1hdXRvLWFkdmFuY2UnO1xuaW1wb3J0IHtTdG9yeUFkUGxhY2VtZW50c30gZnJvbSAnI2V4cGVyaW1lbnRzL3N0b3J5LWFkLXBsYWNlbWVudHMnO1xuaW1wb3J0IHtTdG9yeUFkU2VnbWVudEV4cH0gZnJvbSAnI2V4cGVyaW1lbnRzL3N0b3J5LWFkLXByb2dyZXNzLXNlZ21lbnQnO1xuaW1wb3J0IHtnZXRQYWdlTGF5b3V0Qm94QmxvY2tpbmd9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvcGFnZS1sYXlvdXQtYm94JztcbmltcG9ydCB7aW5zZXJ0QW5hbHl0aWNzRWxlbWVudH0gZnJvbSAnLi4vLi4vLi4vc3JjL2V4dGVuc2lvbi1hbmFseXRpY3MnO1xuaW1wb3J0IHtpc0FycmF5fSBmcm9tICcjY29yZS90eXBlcyc7XG5pbXBvcnQge2lzQ2FuY2VsbGF0aW9ufSBmcm9tICcuLi8uLi8uLi9zcmMvZXJyb3ItcmVwb3J0aW5nJztcbmltcG9ydCB7XG4gIGxpbmVEZWxpbWl0ZWRTdHJlYW1lcixcbiAgbWV0YUpzb25DcmVhdGl2ZUdyb3VwZXIsXG59IGZyb20gJyNhZHMvZ29vZ2xlL2E0YS9saW5lLWRlbGltaXRlZC1yZXNwb25zZS1oYW5kbGVyJztcbmltcG9ydCB7cGFyc2VRdWVyeVN0cmluZ30gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nL3VybCc7XG5pbXBvcnQge3N0cmluZ0hhc2gzMn0gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nJztcbmltcG9ydCB7dHJ5UGFyc2VKc29ufSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QvanNvbic7XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwnO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBET1VCTEVDTElDS19CQVNFX1VSTCA9XG4gICdodHRwczovL3NlY3VyZXB1YmFkcy5nLmRvdWJsZWNsaWNrLm5ldC9nYW1wYWQvYWRzJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgUlRDX1NVQ0NFU1MgPSAnMic7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IERPVUJMRUNMSUNLX1NSQV9FWFAgPSAnZG91YmxlY2xpY2tTcmFFeHAnO1xuXG4vKiogQGNvbnN0IEBlbnVte3N0cmluZ30gKi9cbmNvbnN0IERPVUJMRUNMSUNLX1NSQV9FWFBfQlJBTkNIRVMgPSB7XG4gIFNSQV9DT05UUk9MOiAnMTE3MTUyNjY2JyxcbiAgU1JBOiAnMTE3MTUyNjY3JyxcbiAgU1JBX05PX1JFQ09WRVI6ICcyMTA2MjIzNScsXG59O1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBaSU5ERVhfRVhQID0gJ3pJbmRleEV4cCc7XG5cbi8qKkBjb25zdCBAZW51bXtzdHJpbmd9ICovXG5jb25zdCBaSU5ERVhfRVhQX0JSQU5DSEVTID0ge1xuICBOT19aSU5ERVg6ICcyMTA2NTM1NicsXG4gIEhPTERCQUNLOiAnMjEwNjUzNTcnLFxufTtcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgSURMRV9DV1ZfRVhQID0gJ2RmcC1yZW5kZXItb24taWRsZS1jd3YtZXhwJztcblxuLyoqIEBjb25zdCBAZW51bXtzdHJpbmd9ICovXG5jb25zdCBJRExFX0NXVl9FWFBfQlJBTkNIRVMgPSB7XG4gIENPTlRST0w6ICcyMDIwODg2MCcsXG4gIEVYUEVSSU1FTlQ6ICcyMDIwODg1OScsXG59O1xuXG4vKipcbiAqIFJlcXVpcmVkIHNpemUgdG8gYmUgc2VudCB3aXRoIGZsdWlkIHJlcXVlc3RzLlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmNvbnN0IERVTU1ZX0ZMVUlEX1NJWkUgPSAnMzIweDUwJztcblxuLyoqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfSBhdHRyaWJ1dGUgaW5kaWNhdGluZyBpZiBsYXp5IGZldGNoIGlzIGVuYWJsZWQuKi9cbmNvbnN0IExBWllfRkVUQ0hfQVRUUklCVVRFID0gJ2RhdGEtbGF6eS1mZXRjaCc7XG5cbi8qKlxuICogTWFjcm9zIHRoYXQgY2FuIGJlIGV4cGFuZGVkIGluIGpzb24gdGFyZ2V0aW5nIGF0dHJpYnV0ZS5cbiAqL1xuY29uc3QgVEFSR0VUSU5HX01BQ1JPX0FMTE9XTElTVCA9IHtcbiAgJ0NMSUVOVF9JRCc6IHRydWUsXG59O1xuXG4vKipcbiAqIE1hcCBvZiBwYWdldmlldyB0b2tlbnMgdG8gdGhlIGluc3RhbmNlcyB0aGV5IGJlbG9uZyB0by5cbiAqIEBwcml2YXRlIHshT2JqZWN0PHN0cmluZywgIUFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbD59XG4gKi9cbmxldCB0b2tlbnNUb0luc3RhbmNlcyA9IHt9O1xuXG4vKiogQHByaXZhdGUgez9Qcm9taXNlfSAqL1xubGV0IHNyYVJlcXVlc3RzID0gbnVsbDtcblxuLyoqXG4gKiBUaGUgcmFuZG9tIHN1YmRvbWFpbiB0byBsb2FkIFNhZmVGcmFtZSBmcm9tLCBpZiBTYWZlRnJhbWUgaXNcbiAqIGJlaW5nIGxvYWRlZCBmcm9tIGEgcmFuZG9tIHN1YmRvbWFpbiBhbmQgaWYgdGhlIHN1YmRvbWFpblxuICogaGFzIGJlZW4gZ2VuZXJhdGVkLlxuICogQHByaXZhdGUgez9zdHJpbmd9XG4gKi9cbmxldCBzYWZlRnJhbWVSYW5kb21TdWJkb21haW4gPSBudWxsO1xuXG4vKiogQHR5cGVkZWYge3tcbiAgICAgIGFkVXJsOiAhUHJvbWlzZTxzdHJpbmc+LFxuICAgICAgbGluZUl0ZW1JZDogc3RyaW5nLFxuICAgICAgY3JlYXRpdmVJZDogc3RyaW5nLFxuICAgICAgc2xvdElkOiBzdHJpbmcsXG4gICAgICBzbG90SW5kZXg6IHN0cmluZyxcbiAgICB9fSAqL1xubGV0IFRyb3VibGVzaG9vdERhdGFEZWY7XG5cbi8qKiBAcHJpdmF0ZSB7P0pzb25PYmplY3R9ICovXG5sZXQgd2luZG93TG9jYXRpb25RdWVyeVBhcmFtZXRlcnM7XG5cbi8qKiBAdHlwZWRlZiB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gKi9cbmxldCBTaXplRGVmO1xuXG4vKiogQHR5cGVkZWYgeyhTaXplRGVmfC4uLy4uLy4uL3NyYy9sYXlvdXQtcmVjdC5MYXlvdXRSZWN0RGVmKX0gKi9cbmxldCBMYXlvdXRSZWN0T3JEaW1zRGVmO1xuXG4vKiogQGZpbmFsICovXG5leHBvcnQgY2xhc3MgQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsIGV4dGVuZHMgQW1wQTRBIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50KTtcblxuICAgIC8qKlxuICAgICAqIENvbmZpZyB0byBnZW5lcmF0ZSBhbXAtYW5hbHl0aWNzIGVsZW1lbnQgZm9yIGFjdGl2ZSB2aWV3IHJlcG9ydGluZy5cbiAgICAgKiBAdHlwZSB7P0pzb25PYmplY3R9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmFtcEFuYWx5dGljc0NvbmZpZ18gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvZXh0ZW5zaW9ucy1pbXBsLkV4dGVuc2lvbnN9ICovXG4gICAgdGhpcy5leHRlbnNpb25zXyA9IFNlcnZpY2VzLmV4dGVuc2lvbnNGb3IodGhpcy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7Py4uLy4uLy4uL3NyYy9zZXJ2aWNlL3BlcmZvcm1hbmNlLWltcGwuUGVyZm9ybWFuY2V9ICovXG4gICAgdGhpcy5wZXJmb3JtYW5jZV8gPSBTZXJ2aWNlcy5wZXJmb3JtYW5jZUZvck9yTnVsbCh0aGlzLndpbik7XG5cbiAgICAvKiogQHByaXZhdGUgez9zdHJpbmd9ICovXG4gICAgdGhpcy5xcWlkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9MYXlvdXRSZWN0T3JEaW1zRGVmfSAqL1xuICAgIHRoaXMuaW5pdGlhbFNpemVfID0gbnVsbDtcblxuICAgIC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cbiAgICB0aGlzLnBhcmFtZXRlclNpemUgPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gKi9cbiAgICB0aGlzLnJldHVybmVkU2l6ZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLmFtcEFuYWx5dGljc0VsZW1lbnRfID0gbnVsbDtcblxuICAgIC8qKiBAdHlwZSB7P0pzb25PYmplY3R8T2JqZWN0fSAqL1xuICAgIHRoaXMuanNvblRhcmdldGluZyA9IG51bGw7XG5cbiAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICB0aGlzLmFkS2V5ID0gJzAnO1xuXG4gICAgLyoqIEB0eXBlIHshQXJyYXk8c3RyaW5nPn0gKi9cbiAgICB0aGlzLmV4cGVyaW1lbnRJZHMgPSBbXTtcblxuICAgIC8qKiBAdHlwZSB7IUFycmF5PHN0cmluZz59ICovXG4gICAgdGhpcy5hbXBFeHBlcmltZW50SWRzID0gW107XG5cbiAgICAvKiogQHByb3RlY3RlZCB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnVzZVNyYSA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgez9EZWZlcnJlZDw/UmVzcG9uc2U+fSAqL1xuICAgIHRoaXMuc3JhRGVmZXJyZWQgPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/UmVmcmVzaE1hbmFnZXJ9ICovXG4gICAgdGhpcy5yZWZyZXNoTWFuYWdlcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5yZWZyZXNoQ291bnRfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuaWZpXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0ZsdWlkUmVxdWVzdF8gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqIEluZGljYXRlcyB0aGF0IHRoZSBwcmltYXJ5IHNpemUgb2YgdGhlIHNsb3QgaXMgZmx1aWQuXG4gICAgICovXG4gICAgdGhpcy5pc0ZsdWlkUHJpbWFyeVJlcXVlc3RfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgez9zdHJpbmd9ICovXG4gICAgdGhpcy5mbHVpZEltcHJlc3Npb25VcmxfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1Byb21pc2U8IS4uLy4uLy4uL2Fkcy9nb29nbGUvYTRhL3V0aWxzLklkZW50aXR5VG9rZW4+fSAqL1xuICAgIHRoaXMuaWRlbnRpdHlUb2tlblByb21pc2VfID0gbnVsbDtcblxuICAgIC8qKiBAdHlwZSB7Py4uLy4uLy4uL2Fkcy9nb29nbGUvYTRhL3V0aWxzLklkZW50aXR5VG9rZW59ICovXG4gICAgdGhpcy5pZGVudGl0eVRva2VuID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IVRyb3VibGVzaG9vdERhdGFEZWZ9ICovXG4gICAgdGhpcy50cm91Ymxlc2hvb3REYXRhXyA9IC8qKiBAdHlwZSB7IVRyb3VibGVzaG9vdERhdGFEZWZ9ICovICh7fSk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7P2Jvb2xlYW59IHdoZXRoZXIgcHJlZmVyZW50aWFsIHJlbmRlcmVkIEFNUCBjcmVhdGl2ZSwgbnVsbFxuICAgICAqIGluZGljYXRlcyBubyBjcmVhdGl2ZSByZW5kZXIuXG4gICAgICovXG4gICAgdGhpcy5pc0FtcENyZWF0aXZlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0lkbGVSZW5kZXJfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgez8uL3NhZmVmcmFtZS1ob3N0LlNhZmVmcmFtZUhvc3RBcGl9ICovXG4gICAgdGhpcy5zYWZlZnJhbWVBcGlfID0gbnVsbDtcblxuICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gd2hldGhlciBzYWZlZnJhbWUgZm9yY2VkIHZpYSB0YWcgKi9cbiAgICB0aGlzLmZvcmNlU2FmZWZyYW1lID0gZmFsc2U7XG4gICAgaWYgKCdmb3JjZVNhZmVmcmFtZScgaW4gdGhpcy5lbGVtZW50LmRhdGFzZXQpIHtcbiAgICAgIGlmICghL14oMXwodHJ1ZSkpJC9pLnRlc3QodGhpcy5lbGVtZW50LmRhdGFzZXRbJ2ZvcmNlU2FmZWZyYW1lJ10pKSB7XG4gICAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICAgIFRBRyxcbiAgICAgICAgICAnSWdub3JpbmcgaW52YWxpZCBkYXRhLWZvcmNlLXNhZmVmcmFtZSBhdHRyaWJ1dGU6ICcgK1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmRhdGFzZXRbJ2ZvcmNlU2FmZWZyYW1lJ11cbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZm9yY2VTYWZlZnJhbWUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAcHJvdGVjdGVkIHtDb25zZW50VHVwbGVEZWZ9ICovXG4gICAgdGhpcy5jb25zZW50VHVwbGUgPSB7fTtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHshRGVmZXJyZWQ8c3RyaW5nPn0gKi9cbiAgICB0aGlzLmdldEFkVXJsRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqIFNldCB0byB0cnVlIHdoZW4gaW5pdGlhbCBleHBhbnNpb24gZWZmb3J0IGZhaWxzLiBJZiB0cnVlLCB0aGUgc2xvdCB3aWxsXG4gICAgICogYXR0ZW1wdCB0byBleHBhbmQgYWdhaW4gd2hlbiBvdXRzaWRlIG9mIHRoZSB2aWV3cG9ydC5cbiAgICAgKi9cbiAgICB0aGlzLnJlYXR0ZW1wdFRvRXhwYW5kRmx1aWRDcmVhdGl2ZV8gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgb3Igbm90IHRoZSBpZnJhbWUgY29udGFpbmluZyB0aGUgYWQgc2hvdWxkIGJlIHNhbmRib3hlZCB2aWEgdGhlXG4gICAgICogXCJzYW5kYm94XCIgYXR0cmlidXRlLlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuc2hvdWxkU2FuZGJveF8gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFNldCBhZnRlciB0aGUgYWQgcmVxdWVzdCBpcyBidWlsdC5cbiAgICAgKiBAcHJpdmF0ZSB7P0ZsZXhpYmxlQWRTbG90RGF0YVR5cGVEZWZ9XG4gICAgICovXG4gICAgdGhpcy5mbGV4aWJsZUFkU2xvdERhdGFfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIElmIHRydWUsIHdpbGwgYWRkIGEgei1pbmRleCB0byBmbGV4IGFkIHNsb3RzIHVwb24gZXhwYW5zaW9uLlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuaW5aSW5kZXhIb2xkQmFja18gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEEgc2lnbmFsIGZyb20gcHVibGlzaGVycyB0byBzZXJ2ZSBOUEEgdGhyb3VnaCBhZCB1cmwuXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5zZXJ2ZU5wYVNpZ25hbF8gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ8Ym9vbGVhbn0gcmVuZGVyIG9uIGlkbGUgY29uZmlndXJhdGlvbiB3aXRoIGZhbHNlXG4gICAqICAgIGluZGljYXRpbmcgZGlzYWJsZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRJZGxlUmVuZGVyRW5hYmxlZF8oKSB7XG4gICAgaWYgKHRoaXMuaXNJZGxlUmVuZGVyXykge1xuICAgICAgcmV0dXJuIHRoaXMuaXNJZGxlUmVuZGVyXztcbiAgICB9XG4gICAgLy8gRGlzYWJsZSBpZiBwdWJsaXNoZXIgaGFzIGluZGljYXRlZCBhIG5vbi1kZWZhdWx0IGxvYWRpbmcgc3RyYXRlZ3kuXG4gICAgaWYgKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbG9hZGluZy1zdHJhdGVneScpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGV4cFZhbCA9IHRoaXMucG9zdEFkUmVzcG9uc2VFeHBlcmltZW50RmVhdHVyZXNbJ3JlbmRlci1pZGxlLXZwJ107XG4gICAgY29uc3QgdnBSYW5nZSA9IHBhcnNlSW50KGV4cFZhbCwgMTApO1xuICAgIGlmIChleHBWYWwgJiYgaXNOYU4odnBSYW5nZSkpIHtcbiAgICAgIC8vIGhvbGRiYWNrIGJyYW5jaCBzZW5kcyBub24tbnVtZXJpYyB2YWx1ZS5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodnBSYW5nZSkge1xuICAgICAgcmV0dXJuIHZwUmFuZ2U7XG4gICAgfVxuXG4gICAgbGV0IGZhbGxiYWNrUmFuZ2UgPSAxMjtcbiAgICBpZiAoIXRoaXMucGVyZm9ybWFuY2VfKSB7XG4gICAgICByZXR1cm4gZmFsbGJhY2tSYW5nZTtcbiAgICB9XG5cbiAgICBjb25zdCBpZGxlQ3d2RXhwU2VsZWN0ZWRCcmFuY2ggPSBnZXRFeHBlcmltZW50QnJhbmNoKFxuICAgICAgdGhpcy53aW4sXG4gICAgICBJRExFX0NXVl9FWFBcbiAgICApO1xuICAgIGlmIChpZGxlQ3d2RXhwU2VsZWN0ZWRCcmFuY2ggPT09IElETEVfQ1dWX0VYUF9CUkFOQ0hFUy5DT05UUk9MKSB7XG4gICAgICB0aGlzLnBlcmZvcm1hbmNlXy5hZGRFbmFibGVkRXhwZXJpbWVudCgnZGZwLWlkbGUtY3d2LWNvbnRyb2wnKTtcbiAgICB9IGVsc2UgaWYgKGlkbGVDd3ZFeHBTZWxlY3RlZEJyYW5jaCA9PT0gSURMRV9DV1ZfRVhQX0JSQU5DSEVTLkVYUEVSSU1FTlQpIHtcbiAgICAgIGZhbGxiYWNrUmFuZ2UgPSAzO1xuICAgICAgdGhpcy5wZXJmb3JtYW5jZV8uYWRkRW5hYmxlZEV4cGVyaW1lbnQoJ2RmcC1pZGxlLWN3di1leHAnKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbGxiYWNrUmFuZ2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlkbGVSZW5kZXJPdXRzaWRlVmlld3BvcnQoKSB7XG4gICAgY29uc3QgdnBSYW5nZSA9IHRoaXMuZ2V0SWRsZVJlbmRlckVuYWJsZWRfKCk7XG4gICAgaWYgKHZwUmFuZ2UgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gdnBSYW5nZTtcbiAgICB9XG4gICAgY29uc3QgcmVuZGVyT3V0c2lkZVZpZXdwb3J0ID0gdGhpcy5yZW5kZXJPdXRzaWRlVmlld3BvcnQoKTtcbiAgICAvLyBGYWxzZSB3aWxsIG9jY3VyIHdoZW4gdGhyb3R0bGUgaW4gZWZmZWN0LlxuICAgIGlmICh0eXBlb2YgcmVuZGVyT3V0c2lkZVZpZXdwb3J0ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldHVybiByZW5kZXJPdXRzaWRlVmlld3BvcnQ7XG4gICAgfVxuICAgIHRoaXMuaXNJZGxlUmVuZGVyXyA9IHRydWU7XG4gICAgLy8gTk9URShrZWl0aHdyaWdodGJvcyk6IGhhbmRsZSByYWNlIGNvbmRpdGlvbiB3aGVyZSBwcmV2aW91c1xuICAgIC8vIGlkbGVSZW5kZXJPdXRzaWRlVmlld3BvcnQgbWFya2VkIHNsb3QgYXMgaWRsZSByZW5kZXIgZGVzcGl0ZSBuZXZlclxuICAgIC8vIGJlaW5nIHNjaGVkdWxlIGR1ZSB0byBiZWluZyBiZXlvbmQgdmlld3BvcnQgbWF4IG9mZnNldC4gIElmIHNsb3RcbiAgICAvLyBjb21lcyB3aXRoaW4gc3RhbmRhcmQgb3V0c2lkZSB2aWV3cG9ydCByYW5nZSwgdGhlbiBlbnN1cmUgdGhyb3R0bGluZ1xuICAgIC8vIHdpbGwgbm90IGJlIGFwcGxpZWQuXG4gICAgdGhpcy53aGVuV2l0aGluVmlld3BvcnQocmVuZGVyT3V0c2lkZVZpZXdwb3J0KS50aGVuKFxuICAgICAgKCkgPT4gKHRoaXMuaXNJZGxlUmVuZGVyXyA9IGZhbHNlKVxuICAgICk7XG4gICAgcmV0dXJuIHZwUmFuZ2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzTGF5b3V0U3VwcG9ydGVkKGxheW91dCkge1xuICAgIHRoaXMuaXNGbHVpZFByaW1hcnlSZXF1ZXN0XyA9IGxheW91dCA9PSBMYXlvdXQuRkxVSUQ7XG4gICAgdGhpcy5pc0ZsdWlkUmVxdWVzdF8gPSB0aGlzLmlzRmx1aWRSZXF1ZXN0XyB8fCB0aGlzLmlzRmx1aWRQcmltYXJ5UmVxdWVzdF87XG4gICAgcmV0dXJuIHRoaXMuaXNGbHVpZFByaW1hcnlSZXF1ZXN0XyB8fCBpc0xheW91dFNpemVEZWZpbmVkKGxheW91dCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzVmFsaWRFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLmlzQW1wQWRFbGVtZW50KCk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgcGFnZSBsZXZlbCBleHBlcmltZW50IGRpdmVyc2lvbiBhbmQgcHVzaGVzIGFueSBleHBlcmltZW50IElEc1xuICAgKiBvbnRvIHRoaXMuZXhwZXJpbWVudElkcy5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSB1cmxFeHBlcmltZW50SWRcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBzZXRQYWdlTGV2ZWxFeHBlcmltZW50cyh1cmxFeHBlcmltZW50SWQpIHtcbiAgICBsZXQgZm9yY2VkRXhwZXJpbWVudElkO1xuICAgIGlmICh1cmxFeHBlcmltZW50SWQpIHtcbiAgICAgIGZvcmNlZEV4cGVyaW1lbnRJZCA9IHtcbiAgICAgICAgLy8gU1JBXG4gICAgICAgICc3JzogRE9VQkxFQ0xJQ0tfU1JBX0VYUF9CUkFOQ0hFUy5TUkFfQ09OVFJPTCxcbiAgICAgICAgJzgnOiBET1VCTEVDTElDS19TUkFfRVhQX0JSQU5DSEVTLlNSQSxcbiAgICAgICAgJzknOiBET1VCTEVDTElDS19TUkFfRVhQX0JSQU5DSEVTLlNSQV9OT19SRUNPVkVSLFxuICAgICAgfVt1cmxFeHBlcmltZW50SWRdO1xuICAgICAgaWYgKGZvcmNlZEV4cGVyaW1lbnRJZCkge1xuICAgICAgICB0aGlzLmV4cGVyaW1lbnRJZHMucHVzaChmb3JjZWRFeHBlcmltZW50SWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBleHBlcmltZW50SW5mb0xpc3QgPVxuICAgICAgLyoqIEB0eXBlIHshQXJyYXk8IS4uLy4uLy4uL3NyYy9leHBlcmltZW50cy5FeHBlcmltZW50SW5mbz59ICovIChbXG4gICAgICAgIHtcbiAgICAgICAgICBleHBlcmltZW50SWQ6IERPVUJMRUNMSUNLX1NSQV9FWFAsXG4gICAgICAgICAgaXNUcmFmZmljRWxpZ2libGU6ICgpID0+XG4gICAgICAgICAgICAhZm9yY2VkRXhwZXJpbWVudElkICYmXG4gICAgICAgICAgICAhdGhpcy53aW4uZG9jdW1lbnQuLypPSyovIHF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICdtZXRhW25hbWU9YW1wLWFkLWVuYWJsZS1yZWZyZXNoXSwgJyArXG4gICAgICAgICAgICAgICAgJ2FtcC1hZFt0eXBlPWRvdWJsZWNsaWNrXVtkYXRhLWVuYWJsZS1yZWZyZXNoXSwgJyArXG4gICAgICAgICAgICAgICAgJ21ldGFbbmFtZT1hbXAtYWQtZG91YmxlY2xpY2stc3JhXSdcbiAgICAgICAgICAgICksXG4gICAgICAgICAgYnJhbmNoZXM6IE9iamVjdC5rZXlzKERPVUJMRUNMSUNLX1NSQV9FWFBfQlJBTkNIRVMpLm1hcChcbiAgICAgICAgICAgIChrZXkpID0+IERPVUJMRUNMSUNLX1NSQV9FWFBfQlJBTkNIRVNba2V5XVxuICAgICAgICAgICksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBleHBlcmltZW50SWQ6IFpJTkRFWF9FWFAsXG4gICAgICAgICAgaXNUcmFmZmljRWxpZ2libGU6ICgpID0+IHRydWUsXG4gICAgICAgICAgYnJhbmNoZXM6IE9iamVjdC52YWx1ZXMoWklOREVYX0VYUF9CUkFOQ0hFUyksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBleHBlcmltZW50SWQ6IEFEU19JTklUSUFMX0lOVEVSU0VDVElPTl9FWFAuaWQsXG4gICAgICAgICAgaXNUcmFmZmljRWxpZ2libGU6ICgpID0+IHRydWUsXG4gICAgICAgICAgYnJhbmNoZXM6IFtcbiAgICAgICAgICAgIEFEU19JTklUSUFMX0lOVEVSU0VDVElPTl9FWFAuY29udHJvbCxcbiAgICAgICAgICAgIEFEU19JTklUSUFMX0lOVEVSU0VDVElPTl9FWFAuZXhwZXJpbWVudCxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZXhwZXJpbWVudElkOiBJRExFX0NXVl9FWFAsXG4gICAgICAgICAgaXNUcmFmZmljRWxpZ2libGU6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICEhdGhpcy5wZXJmb3JtYW5jZV8gJiZcbiAgICAgICAgICAgICAgIXRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbG9hZGluZy1zdHJhdGVneScpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYnJhbmNoZXM6IE9iamVjdC52YWx1ZXMoSURMRV9DV1ZfRVhQX0JSQU5DSEVTKSxcbiAgICAgICAgfSxcbiAgICAgIF0pO1xuICAgIGNvbnN0IHNldEV4cHMgPSB0aGlzLnJhbmRvbWx5U2VsZWN0VW5zZXRFeHBlcmltZW50c18oZXhwZXJpbWVudEluZm9MaXN0KTtcbiAgICBPYmplY3Qua2V5cyhzZXRFeHBzKS5mb3JFYWNoKFxuICAgICAgKGV4cE5hbWUpID0+IHNldEV4cHNbZXhwTmFtZV0gJiYgdGhpcy5leHBlcmltZW50SWRzLnB1c2goc2V0RXhwc1tleHBOYW1lXSlcbiAgICApO1xuXG4gICAgY29uc3Qgc3NyRXhwSWRzID0gdGhpcy5nZXRTc3JFeHBJZHNfKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzc3JFeHBJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFkZEFtcEV4cGVyaW1lbnRJZFRvRWxlbWVudChzc3JFeHBJZHNbaV0sIHRoaXMuZWxlbWVudCk7XG4gICAgfVxuICAgIGlmIChzZXRFeHBzW1pJTkRFWF9FWFBdID09IFpJTkRFWF9FWFBfQlJBTkNIRVMuSE9MREJBQ0spIHtcbiAgICAgIHRoaXMuaW5aSW5kZXhIb2xkQmFja18gPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHN0b3J5QWRQbGFjZW1lbnRzRXhwSWQgPSBnZXRFeHBlcmltZW50QnJhbmNoKFxuICAgICAgdGhpcy53aW4sXG4gICAgICBTdG9yeUFkUGxhY2VtZW50cy5JRFxuICAgICk7XG4gICAgaWYgKHN0b3J5QWRQbGFjZW1lbnRzRXhwSWQpIHtcbiAgICAgIGFkZEV4cGVyaW1lbnRJZFRvRWxlbWVudChzdG9yeUFkUGxhY2VtZW50c0V4cElkLCB0aGlzLmVsZW1lbnQpO1xuICAgIH1cblxuICAgIGNvbnN0IGF1dG9BZHZhbmNlRXhwQnJhbmNoID0gZ2V0RXhwZXJpbWVudEJyYW5jaChcbiAgICAgIHRoaXMud2luLFxuICAgICAgU3RvcnlBZEF1dG9BZHZhbmNlLklEXG4gICAgKTtcbiAgICBpZiAoYXV0b0FkdmFuY2VFeHBCcmFuY2gpIHtcbiAgICAgIGFkZEV4cGVyaW1lbnRJZFRvRWxlbWVudChhdXRvQWR2YW5jZUV4cEJyYW5jaCwgdGhpcy5lbGVtZW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdG9yeUFkU2VnbWVudEJyYW5jaCA9IGdldEV4cGVyaW1lbnRCcmFuY2goXG4gICAgICB0aGlzLndpbixcbiAgICAgIFN0b3J5QWRTZWdtZW50RXhwLklEXG4gICAgKTtcbiAgICBpZiAoc3RvcnlBZFNlZ21lbnRCcmFuY2gpIHtcbiAgICAgIGFkZEV4cGVyaW1lbnRJZFRvRWxlbWVudChzdG9yeUFkU2VnbWVudEJyYW5jaCwgdGhpcy5lbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRm9yIGVhc2llciB1bml0IHRlc3RpbmcuXG4gICAqIEBwYXJhbSB7IUFycmF5PCEuLi8uLi8uLi9zcmMvZXhwZXJpbWVudHMuRXhwZXJpbWVudEluZm8+fSBleHBlcmltZW50SW5mb0xpc3RcbiAgICogQHJldHVybiB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz59XG4gICAqL1xuICByYW5kb21seVNlbGVjdFVuc2V0RXhwZXJpbWVudHNfKGV4cGVyaW1lbnRJbmZvTGlzdCkge1xuICAgIHJldHVybiByYW5kb21seVNlbGVjdFVuc2V0RXhwZXJpbWVudHModGhpcy53aW4sIGV4cGVyaW1lbnRJbmZvTGlzdCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGVhc2llciB1bml0IHRlc3RpbmcuXG4gICAqIEByZXR1cm4gez9zdHJpbmd9XG4gICAqL1xuICBleHRyYWN0VXJsRXhwZXJpbWVudElkXygpIHtcbiAgICByZXR1cm4gZXh0cmFjdFVybEV4cGVyaW1lbnRJZCh0aGlzLndpbiwgdGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBtYXliZURlcHJlY2F0aW9uV2Fybl8oKSB7XG4gICAgY29uc3Qgd2FybkRlcHJlY2F0aW9uID0gKGZlYXR1cmUpID0+XG4gICAgICB1c2VyKCkud2FybihcbiAgICAgICAgVEFHLFxuICAgICAgICBgJHtmZWF0dXJlfSBpcyBubyBsb25nZXIgc3VwcG9ydGVkIGZvciBEb3VibGVDbGljay5gICtcbiAgICAgICAgICAnUGxlYXNlIHJlZmVyIHRvICcgK1xuICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2lzc3Vlcy8xMTgzNCAnICtcbiAgICAgICAgICAnZm9yIG1vcmUgaW5mb3JtYXRpb24nXG4gICAgICApO1xuICAgIGNvbnN0IHVzZHJkID0gJ3VzZVNhbWVEb21haW5SZW5kZXJpbmdVbnRpbERlcHJlY2F0ZWQnO1xuICAgIGNvbnN0IGhhc1VTRFJEID1cbiAgICAgIHVzZHJkIGluIHRoaXMuZWxlbWVudC5kYXRhc2V0IHx8XG4gICAgICAodHJ5UGFyc2VKc29uKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2pzb24nKSkgfHwge30pW3VzZHJkXTtcbiAgICBpZiAoaGFzVVNEUkQpIHtcbiAgICAgIHdhcm5EZXByZWNhdGlvbih1c2RyZCk7XG4gICAgfVxuICAgIGNvbnN0IHVzZVJlbW90ZUh0bWwgPVxuICAgICAgdGhpcy5nZXRBbXBEb2MoKS5nZXRNZXRhQnlOYW1lKCdhbXAtM3AtaWZyYW1lLXNyYycpICE9PSBudWxsO1xuICAgIGlmICh1c2VSZW1vdGVIdG1sKSB7XG4gICAgICB3YXJuRGVwcmVjYXRpb24oJ3JlbW90ZS5odG1sJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkZWxheUFkUmVxdWVzdEVuYWJsZWQoKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoTEFaWV9GRVRDSF9BVFRSSUJVVEUpICE9PSAndHJ1ZScpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGdldEFtcEFkUmVuZGVyT3V0c2lkZVZpZXdwb3J0KHRoaXMuZWxlbWVudCkgfHwgMztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjaygpIHtcbiAgICBzdXBlci5idWlsZENhbGxiYWNrKCk7XG4gICAgdGhpcy5tYXliZURlcHJlY2F0aW9uV2Fybl8oKTtcbiAgICBtYXliZUluc2VydE9yaWdpblRyaWFsVG9rZW4odGhpcy53aW4pO1xuICAgIHRoaXMuc2V0UGFnZUxldmVsRXhwZXJpbWVudHModGhpcy5leHRyYWN0VXJsRXhwZXJpbWVudElkXygpKTtcbiAgICBjb25zdCBwdWJFbmFibGVkU3JhID0gISF0aGlzLndpbi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgJ21ldGFbbmFtZT1hbXAtYWQtZG91YmxlY2xpY2stc3JhXSdcbiAgICApO1xuICAgIGNvbnN0IGRlbGF5RmV0Y2hFbmFibGVkID0gISF0aGlzLndpbi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgYGFtcC1hZFt0eXBlPWRvdWJsZWNsaWNrXVske2VzY2FwZUNzc1NlbGVjdG9ySWRlbnQoXG4gICAgICAgIExBWllfRkVUQ0hfQVRUUklCVVRFXG4gICAgICApfT10cnVlXWBcbiAgICApO1xuICAgIGlmIChwdWJFbmFibGVkU3JhICYmIGRlbGF5RmV0Y2hFbmFibGVkKSB7XG4gICAgICB1c2VyKCkud2FybihcbiAgICAgICAgVEFHLFxuICAgICAgICAnU1JBIGlzIG5vdCBjb21wYXRpYmxlIHdpdGggbGF6eSBmZXRjaGluZywgZGlzYWJsaW5nIFNSQSdcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMudXNlU3JhID1cbiAgICAgICFkZWxheUZldGNoRW5hYmxlZCAmJlxuICAgICAgKChnZXRNb2RlKCkubG9jYWxEZXYgJiZcbiAgICAgICAgLyhcXD98Jilmb3JjZV9zcmE9dHJ1ZSgmfCQpLy50ZXN0KHRoaXMud2luLmxvY2F0aW9uLnNlYXJjaCkpIHx8XG4gICAgICAgIHB1YkVuYWJsZWRTcmEgfHxcbiAgICAgICAgW1xuICAgICAgICAgIERPVUJMRUNMSUNLX1NSQV9FWFBfQlJBTkNIRVMuU1JBLFxuICAgICAgICAgIERPVUJMRUNMSUNLX1NSQV9FWFBfQlJBTkNIRVMuU1JBX05PX1JFQ09WRVIsXG4gICAgICAgIF0uc29tZSgoZWlkKSA9PiB0aGlzLmV4cGVyaW1lbnRJZHMuaW5kZXhPZihlaWQpID49IDApKTtcbiAgICB0aGlzLmlkZW50aXR5VG9rZW5Qcm9taXNlXyA9IHRoaXMuZ2V0QW1wRG9jKClcbiAgICAgIC53aGVuRmlyc3RWaXNpYmxlKClcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIGdldElkZW50aXR5VG9rZW4odGhpcy53aW4sIHRoaXMuZ2V0QW1wRG9jKCksIHN1cGVyLmdldENvbnNlbnRQb2xpY3koKSlcbiAgICAgICk7XG4gICAgdGhpcy50cm91Ymxlc2hvb3REYXRhXy5zbG90SWQgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXNsb3QnKTtcbiAgICB0aGlzLnRyb3VibGVzaG9vdERhdGFfLnNsb3RJbmRleCA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXG4gICAgICAnZGF0YS1hbXAtc2xvdC1pbmRleCdcbiAgICApO1xuICAgIGlmICghdGhpcy5pc0ZsdWlkUmVxdWVzdF8pIHtcbiAgICAgIGNvbnN0IG11bHRpU2l6ZVN0ciA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbXVsdGktc2l6ZScpO1xuICAgICAgdGhpcy5pc0ZsdWlkUmVxdWVzdF8gPVxuICAgICAgICAhIW11bHRpU2l6ZVN0ciAmJiBtdWx0aVNpemVTdHIuaW5kZXhPZignZmx1aWQnKSAhPSAtMTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNob3VsZFByZWZlcmVudGlhbFJlbmRlcldpdGhvdXRDcnlwdG8oKSB7XG4gICAgZGV2QXNzZXJ0KCFpc0NkblByb3h5KHRoaXMud2luKSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHs/Q29uc2VudFR1cGxlRGVmfSBjb25zZW50VHVwbGVcbiAgICogQHBhcmFtIHshQXJyYXk8IUFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbD49fSBpbnN0YW5jZXNcbiAgICogQHJldHVybiB7IU9iamVjdDxzdHJpbmcsc3RyaW5nfGJvb2xlYW58bnVtYmVyPn1cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBnZXRQYWdlUGFyYW1ldGVycyhjb25zZW50VHVwbGUsIGluc3RhbmNlcykge1xuICAgIGluc3RhbmNlcyA9IGluc3RhbmNlcyB8fCBbdGhpc107XG4gICAgY29uc3QgdG9rZW5zID0gZ2V0UGFnZXZpZXdTdGF0ZVRva2Vuc0ZvckFkUmVxdWVzdChpbnN0YW5jZXMpO1xuICAgIGNvbnN0IHthZGRpdGlvbmFsQ29uc2VudCwgY29uc2VudFN0cmluZywgY29uc2VudFN0cmluZ1R5cGUsIGdkcHJBcHBsaWVzfSA9XG4gICAgICBjb25zZW50VHVwbGU7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJ3B0dCc6IDEzLFxuICAgICAgJ25wYSc6XG4gICAgICAgIGNvbnNlbnRUdXBsZS5jb25zZW50U3RhdGUgPT0gQ09OU0VOVF9QT0xJQ1lfU1RBVEUuSU5TVUZGSUNJRU5UIHx8XG4gICAgICAgIGNvbnNlbnRUdXBsZS5jb25zZW50U3RhdGUgPT0gQ09OU0VOVF9QT0xJQ1lfU1RBVEUuVU5LTk9XTiB8fFxuICAgICAgICB0aGlzLnNlcnZlTnBhU2lnbmFsX1xuICAgICAgICAgID8gMVxuICAgICAgICAgIDogbnVsbCxcbiAgICAgICdnZGZwX3JlcSc6ICcxJyxcbiAgICAgICdzZnYnOiBERUZBVUxUX1NBRkVGUkFNRV9WRVJTSU9OLFxuICAgICAgJ3Vfc2QnOiBXaW5kb3dJbnRlcmZhY2UuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpLFxuICAgICAgJ2djdCc6IHRoaXMuZ2V0TG9jYXRpb25RdWVyeVBhcmFtZXRlclZhbHVlKCdnb29nbGVfcHJldmlldycpIHx8IG51bGwsXG4gICAgICAncHN0cyc6IHRva2Vucy5sZW5ndGggPyB0b2tlbnMgOiBudWxsLFxuICAgICAgJ2dkcHInOiBnZHByQXBwbGllcyA9PT0gdHJ1ZSA/ICcxJyA6IGdkcHJBcHBsaWVzID09PSBmYWxzZSA/ICcwJyA6IG51bGwsXG4gICAgICAnZ2Rwcl9jb25zZW50JzpcbiAgICAgICAgY29uc2VudFN0cmluZ1R5cGUgIT0gQ09OU0VOVF9TVFJJTkdfVFlQRS5VU19QUklWQUNZX1NUUklOR1xuICAgICAgICAgID8gY29uc2VudFN0cmluZ1xuICAgICAgICAgIDogbnVsbCxcbiAgICAgICdhZGR0bF9jb25zZW50JzogYWRkaXRpb25hbENvbnNlbnQsXG4gICAgICAndXNfcHJpdmFjeSc6XG4gICAgICAgIGNvbnNlbnRTdHJpbmdUeXBlID09IENPTlNFTlRfU1RSSU5HX1RZUEUuVVNfUFJJVkFDWV9TVFJJTkdcbiAgICAgICAgICA/IGNvbnNlbnRTdHJpbmdcbiAgICAgICAgICA6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHNraXBDbGllbnRTaWRlVmFsaWRhdGlvbihoZWFkZXJzKSB7XG4gICAgcmV0dXJuIGhlYWRlcnMgJiYgIWhlYWRlcnMuaGFzKEFNUF9TSUdOQVRVUkVfSEVBREVSKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGJsb2NrLWxldmVsIHVybCBwYXJhbWV0ZXJzLlxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZyxzdHJpbmd8Ym9vbGVhbnxudW1iZXI+fVxuICAgKi9cbiAgZ2V0QmxvY2tQYXJhbWV0ZXJzXygpIHtcbiAgICBkZXZBc3NlcnQodGhpcy5pbml0aWFsU2l6ZV8pO1xuICAgIGRldkFzc2VydCh0aGlzLmpzb25UYXJnZXRpbmcpO1xuICAgIGNvbnN0IHRmY2QgPSB0aGlzLmpzb25UYXJnZXRpbmcgJiYgdGhpcy5qc29uVGFyZ2V0aW5nW1RGQ0RdO1xuICAgIHRoaXMud2luWydhbXBBZEdvb2dsZUlmaUNvdW50ZXInXSA9IHRoaXMud2luWydhbXBBZEdvb2dsZUlmaUNvdW50ZXInXSB8fCAxO1xuICAgIHRoaXMuaWZpXyA9XG4gICAgICAodGhpcy5pc1JlZnJlc2hpbmcgJiYgdGhpcy5pZmlfKSB8fCB0aGlzLndpblsnYW1wQWRHb29nbGVJZmlDb3VudGVyJ10rKztcbiAgICBjb25zdCBwYWdlTGF5b3V0Qm94ID0gdGhpcy5pc1NpbmdsZVBhZ2VTdG9yeUFkXG4gICAgICA/IGdldFBhZ2VMYXlvdXRCb3hCbG9ja2luZyh0aGlzLmVsZW1lbnQpXG4gICAgICA6IG51bGw7XG4gICAgbGV0IG1zeiA9IG51bGw7XG4gICAgbGV0IHBzeiA9IG51bGw7XG4gICAgbGV0IGZ3cyA9IG51bGw7XG4gICAgdGhpcy5mbGV4aWJsZUFkU2xvdERhdGFfID0gZ2V0RmxleGlibGVBZFNsb3REYXRhKFxuICAgICAgdGhpcy53aW4sXG4gICAgICB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudFxuICAgICk7XG4gICAgY29uc3Qge2Z3U2lnbmFsLCBwYXJlbnRXaWR0aCwgc2xvdFdpZHRofSA9IHRoaXMuZmxleGlibGVBZFNsb3REYXRhXztcbiAgICAvLyBJZiBzbG90V2lkdGggaXMgLTEsIHRoYXQgbWVhbnMgaXRzIHdpZHRoIG11c3QgYmUgZGV0ZXJtaW5lZCBieSBpdHNcbiAgICAvLyBwYXJlbnQgY29udGFpbmVyLCBhbmQgc28gc2hvdWxkIGhhdmUgdGhlIHNhbWUgdmFsdWUgYXMgcGFyZW50V2lkdGguXG4gICAgbXN6ID0gYCR7c2xvdFdpZHRoID09IC0xID8gcGFyZW50V2lkdGggOiBzbG90V2lkdGh9eC0xYDtcbiAgICBwc3ogPSBgJHtwYXJlbnRXaWR0aH14LTFgO1xuICAgIGZ3cyA9IGZ3U2lnbmFsID8gZndTaWduYWwgOiAnMCc7XG4gICAgcmV0dXJuIHtcbiAgICAgICdpdSc6IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2xvdCcpLFxuICAgICAgJ2NvJzpcbiAgICAgICAgdGhpcy5qc29uVGFyZ2V0aW5nICYmIHRoaXMuanNvblRhcmdldGluZ1snY29va2llT3B0T3V0J10gPyAnMScgOiBudWxsLFxuICAgICAgJ2Fkayc6IHRoaXMuYWRLZXksXG4gICAgICAnc3onOiB0aGlzLmlzU2luZ2xlUGFnZVN0b3J5QWQgPyAnMXgxJyA6IHRoaXMucGFyYW1ldGVyU2l6ZSxcbiAgICAgICdvdXRwdXQnOiAnaHRtbCcsXG4gICAgICAnaW1wbCc6ICdpZnInLFxuICAgICAgJ3RmY2QnOiB0ZmNkID09IHVuZGVmaW5lZCA/IG51bGwgOiB0ZmNkLFxuICAgICAgJ2FkdGVzdCc6IGlzSW5NYW51YWxFeHBlcmltZW50KHRoaXMuZWxlbWVudCkgPyAnb24nIDogbnVsbCxcbiAgICAgICdpZmknOiB0aGlzLmlmaV8sXG4gICAgICAncmMnOiB0aGlzLnJlZnJlc2hDb3VudF8gfHwgbnVsbCxcbiAgICAgICdmbHVpZCc6IHRoaXMuaXNGbHVpZFJlcXVlc3RfID8gJ2hlaWdodCcgOiBudWxsLFxuICAgICAgJ2ZzZic6IHRoaXMuZm9yY2VTYWZlZnJhbWUgPyAnMScgOiBudWxsLFxuICAgICAgJ21zeic6IG1zeixcbiAgICAgICdwc3onOiBwc3osXG4gICAgICAnZndzJzogZndzLFxuICAgICAgJ3NjcCc6IHNlcmlhbGl6ZVRhcmdldGluZyhcbiAgICAgICAgKHRoaXMuanNvblRhcmdldGluZyAmJiB0aGlzLmpzb25UYXJnZXRpbmdbJ3RhcmdldGluZyddKSB8fCBudWxsLFxuICAgICAgICAodGhpcy5qc29uVGFyZ2V0aW5nICYmIHRoaXMuanNvblRhcmdldGluZ1snY2F0ZWdvcnlFeGNsdXNpb25zJ10pIHx8XG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgbnVsbFxuICAgICAgKSxcbiAgICAgICdzcHNhJzogdGhpcy5pc1NpbmdsZVBhZ2VTdG9yeUFkXG4gICAgICAgID8gYCR7cGFnZUxheW91dEJveC53aWR0aH14JHtwYWdlTGF5b3V0Qm94LmhlaWdodH1gXG4gICAgICAgIDogbnVsbCxcbiAgICAgIC4uLmdvb2dsZUJsb2NrUGFyYW1ldGVycyh0aGlzKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBvcHVsYXRlJ3MgYmxvY2stbGV2ZWwgc3RhdGUgZm9yIGFkIFVSTCBjb25zdHJ1Y3Rpb24uXG4gICAqIFNldHMgaW5pdGlhbFNpemVfICwganNvblRhcmdldGluZywgYW5kIGFkS2V5IG1lbWJlciBmaWVsZHMuXG4gICAqIEBwYXJhbSB7Q29uc2VudFR1cGxlRGVmfSBjb25zZW50VHVwbGVcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBwb3B1bGF0ZUFkVXJsU3RhdGUoY29uc2VudFR1cGxlKSB7XG4gICAgdGhpcy5jb25zZW50VHVwbGUgPSBjb25zZW50VHVwbGU7XG4gICAgLy8gQWxsb3cgZm9yIHB1YiB0byBvdmVycmlkZSBoZWlnaHQvd2lkdGggdmlhIG92ZXJyaWRlIGF0dHJpYnV0ZS5cbiAgICBjb25zdCB3aWR0aCA9XG4gICAgICBOdW1iZXIodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1vdmVycmlkZS13aWR0aCcpKSB8fFxuICAgICAgTnVtYmVyKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykpO1xuICAgIGNvbnN0IGhlaWdodCA9XG4gICAgICBOdW1iZXIodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1vdmVycmlkZS1oZWlnaHQnKSkgfHxcbiAgICAgIE51bWJlcih0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSk7XG4gICAgdGhpcy5pbml0aWFsU2l6ZV8gPSB0aGlzLmlzRmx1aWRQcmltYXJ5UmVxdWVzdF9cbiAgICAgID8ge3dpZHRoOiAwLCBoZWlnaHQ6IDB9XG4gICAgICA6IHdpZHRoICYmIGhlaWdodFxuICAgICAgPyAvLyB3aWR0aC9oZWlnaHQgY291bGQgYmUgJ2F1dG8nIGluIHdoaWNoIGNhc2Ugd2UgZmFsbGJhY2sgdG8gbWVhc3VyZWQuXG4gICAgICAgIHt3aWR0aCwgaGVpZ2h0fVxuICAgICAgOiB0aGlzLmdldEludGVyc2VjdGlvbkVsZW1lbnRMYXlvdXRCb3goKTtcbiAgICB0aGlzLmpzb25UYXJnZXRpbmcgPSB0cnlQYXJzZUpzb24odGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnanNvbicpKSB8fCB7fTtcbiAgICB0aGlzLmFkS2V5ID0gdGhpcy5nZW5lcmF0ZUFkS2V5XyhcbiAgICAgIGAke3RoaXMuaW5pdGlhbFNpemVfLndpZHRofXgke3RoaXMuaW5pdGlhbFNpemVfLmhlaWdodH1gXG4gICAgKTtcbiAgICB0aGlzLnBhcmFtZXRlclNpemUgPSB0aGlzLmdldFBhcmFtZXRlclNpemVfKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldENvbnNlbnRQb2xpY3koKSB7XG4gICAgLy8gRW5zdXJlIHRoYXQgYnVpbGQgaXMgbm90IGJsb2NrZWQgYnkgbmVlZCBmb3IgY29uc2VudCAoZGVsYXkgd2lsbCBvY2N1clxuICAgIC8vIHByaW9yIHRvIFJUQyAmIGFkIFVSTCBjb25zdHJ1Y3Rpb24pLlxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRBZFVybChvcHRfY29uc2VudFR1cGxlLCBvcHRfcnRjUmVzcG9uc2VzUHJvbWlzZSwgb3B0X3NlcnZlTnBhU2lnbmFsKSB7XG4gICAgaWYgKHRoaXMudXNlU3JhKSB7XG4gICAgICB0aGlzLnNyYURlZmVycmVkID0gdGhpcy5zcmFEZWZlcnJlZCB8fCBuZXcgRGVmZXJyZWQoKTtcbiAgICB9XG4gICAgdGhpcy5zZXJ2ZU5wYVNpZ25hbF8gPSAhIW9wdF9zZXJ2ZU5wYVNpZ25hbDtcbiAgICBjb25zdCBjb25zZW50VHVwbGUgPSBvcHRfY29uc2VudFR1cGxlIHx8IHt9O1xuICAgIGlmIChcbiAgICAgIGNvbnNlbnRUdXBsZS5jb25zZW50U3RhdGUgPT0gQ09OU0VOVF9QT0xJQ1lfU1RBVEUuVU5LTk9XTiAmJlxuICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1ucGEtb24tdW5rbm93bi1jb25zZW50JykgIT0gJ3RydWUnXG4gICAgKSB7XG4gICAgICB1c2VyKCkuaW5mbyhUQUcsICdBZCByZXF1ZXN0IHN1cHByZXNzZWQgZHVlIHRvIHVua25vd24gY29uc2VudCcpO1xuICAgICAgdGhpcy5nZXRBZFVybERlZmVycmVkLnJlc29sdmUoJycpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgnJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlmcmFtZSAmJiAhdGhpcy5pc1JlZnJlc2hpbmcpIHtcbiAgICAgIGRldigpLndhcm4oVEFHLCBgRnJhbWUgYWxyZWFkeSBleGlzdHMsIHNyYTogJHt0aGlzLnVzZVNyYX1gKTtcbiAgICAgIHRoaXMuZ2V0QWRVcmxEZWZlcnJlZC5yZXNvbHZlKCcnKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoJycpO1xuICAgIH1cbiAgICBvcHRfcnRjUmVzcG9uc2VzUHJvbWlzZSA9IG9wdF9ydGNSZXNwb25zZXNQcm9taXNlIHx8IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIC8vIFRPRE8oa2VpdGh3cmlnaHRib3MpOiBTUkEgYmxvY2tzIGN1cnJlbnRseSB1bm5lY2Vzc2FyaWx5IGdlbmVyYXRlIGZ1bGxcbiAgICAvLyBhZCB1cmwuICBUaGlzIGNvdWxkIGJlIG9wdGltaXplZCBob3dldmVyIG5vbi1TUkEgYWQgdXJsIGlzIHJlcXVpcmVkIHRvXG4gICAgLy8gZmFsbGJhY2sgdG8gbm9uLVNSQSBpZiBzaW5nbGUgYmxvY2suXG4gICAgdGhpcy5wb3B1bGF0ZUFkVXJsU3RhdGUoY29uc2VudFR1cGxlKTtcbiAgICAvLyBUT0RPOiBDaGVjayBmb3IgcmVxdWlyZWQgYW5kIGFsbG93ZWQgcGFyYW1ldGVycy4gUHJvYmFibHkgdXNlXG4gICAgLy8gdmFsaWRhdGVEYXRhLCBmcm9tIDNwLzNwL2pzLCBhZnRlciBtb3ZpbmcgaXQgc29tZXBsYWNlIGNvbW1vbi5cbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IHRpbWVyU2VydmljZSA9IFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMud2luKTtcblxuICAgIGNvbnN0IGlkZW50aXR5UHJvbWlzZSA9IHRpbWVyU2VydmljZVxuICAgICAgLnRpbWVvdXRQcm9taXNlKDEwMDAsIHRoaXMuaWRlbnRpdHlUb2tlblByb21pc2VfKVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgLy8gT24gZXJyb3IvdGltZW91dCwgcHJvY2VlZC5cbiAgICAgICAgcmV0dXJuIC8qKkB0eXBlIHshLi4vLi4vLi4vYWRzL2dvb2dsZS9hNGEvdXRpbHMuSWRlbnRpdHlUb2tlbn0qLyAoe30pO1xuICAgICAgfSk7XG5cbiAgICBjb25zdCBjaGVja1N0aWxsQ3VycmVudCA9IHRoaXMudmVyaWZ5U3RpbGxDdXJyZW50KCk7XG5cbiAgICBjb25zdCBydGNQYXJhbXNQcm9taXNlID0gb3B0X3J0Y1Jlc3BvbnNlc1Byb21pc2UudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgIHJldHVybiB0aGlzLm1lcmdlUnRjUmVzcG9uc2VzXyhyZXN1bHRzKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHRhcmdldGluZ0V4cGFuc2lvblByb21pc2UgPSB0aW1lclNlcnZpY2VcbiAgICAgIC50aW1lb3V0UHJvbWlzZSgxMDAwLCB0aGlzLmV4cGFuZEpzb25UYXJnZXRpbmdfKHJ0Y1BhcmFtc1Byb21pc2UpKVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgZGV2KCkud2FybihUQUcsICdKU09OIFRhcmdldGluZyBleHBhbnNpb24gZmFpbGVkL3RpbWVkIG91dC4nKTtcbiAgICAgIH0pO1xuXG4gICAgUHJvbWlzZS5hbGwoW1xuICAgICAgcnRjUGFyYW1zUHJvbWlzZSxcbiAgICAgIGlkZW50aXR5UHJvbWlzZSxcbiAgICAgIHRhcmdldGluZ0V4cGFuc2lvblByb21pc2UsXG4gICAgXSkudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgIGNvbnN0IHJ0Y1BhcmFtcyA9IHJlc3VsdHNbMF07XG4gICAgICB0aGlzLmlkZW50aXR5VG9rZW4gPSByZXN1bHRzWzFdO1xuICAgICAgZ29vZ2xlQWRVcmwoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIERPVUJMRUNMSUNLX0JBU0VfVVJMLFxuICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgdGhpcy5nZXRCbG9ja1BhcmFtZXRlcnNfKCksXG4gICAgICAgICAgdGhpcy5idWlsZElkZW50aXR5UGFyYW1zKCksXG4gICAgICAgICAgdGhpcy5nZXRQYWdlUGFyYW1ldGVycyhjb25zZW50VHVwbGUsIC8qIGluc3RhbmNlcz0gKi8gdW5kZWZpbmVkKSxcbiAgICAgICAgICBydGNQYXJhbXNcbiAgICAgICAgKSxcbiAgICAgICAgdGhpcy5leHBlcmltZW50SWRzXG4gICAgICApLnRoZW4oKGFkVXJsKSA9PiB0aGlzLmdldEFkVXJsRGVmZXJyZWQucmVzb2x2ZShhZFVybCkpO1xuICAgIH0pO1xuICAgIHRoaXMudHJvdWJsZXNob290RGF0YV8uYWRVcmwgPSB0aGlzLmdldEFkVXJsRGVmZXJyZWQucHJvbWlzZTtcbiAgICByZXR1cm4gdGhpcy5nZXRBZFVybERlZmVycmVkLnByb21pc2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFNlcnZlTnBhU2lnbmFsKCkge1xuICAgIHJldHVybiBnZXRTZXJ2ZU5wYVByb21pc2UodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgUlRDIHRvIGNvbXBsZXRlLCB0aGVuIG92ZXJ3cml0ZXMganNvbiBhdHRyIHRhcmdldGluZyB2YWx1ZXNcbiAgICogd2l0aCBleHBhbmRlZCB2YXJzLlxuICAgKiBAcGFyYW0geyFQcm9taXNlfSBydGNNZXJnZWRQcm9taXNlXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgZXhwYW5kSnNvblRhcmdldGluZ18ocnRjTWVyZ2VkUHJvbWlzZSkge1xuICAgIHJldHVybiBydGNNZXJnZWRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0aW5nID0gdGhpcy5qc29uVGFyZ2V0aW5nWyd0YXJnZXRpbmcnXTtcbiAgICAgIGlmICghdGFyZ2V0aW5nKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGV4cGFuc2lvblByb21pc2VzID0gT2JqZWN0LmtleXModGFyZ2V0aW5nKS5tYXAoKGtleSkgPT5cbiAgICAgICAgdGhpcy5leHBhbmRWYWx1ZV8odGFyZ2V0aW5nW2tleV0pLnRoZW4oKGV4cGFuZGVkKSA9PiB7XG4gICAgICAgICAgdGFyZ2V0aW5nW2tleV0gPSBleHBhbmRlZDtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZXhwYW5zaW9uUHJvbWlzZXMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMganNvbiB0YXJnZXRpbmcgdmFsdWVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ3xBcnJheTxzdHJpbmc+fG51bGx9IHZhbHVlXG4gICAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz58IVByb21pc2U8QXJyYXk8c3RyaW5nPj59XG4gICAqL1xuICBleHBhbmRWYWx1ZV8odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgIHZhbHVlLm1hcCgoYXJyVmFsKSA9PiB0aGlzLmV4cGFuZFN0cmluZ18oZGV2KCkuYXNzZXJ0U3RyaW5nKGFyclZhbCkpKVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhwYW5kU3RyaW5nXyhkZXYoKS5hc3NlcnRTdHJpbmcodmFsdWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIG1hY3JvcyBpbiBzdHJpbmdzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nXG4gICAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59XG4gICAqL1xuICBleHBhbmRTdHJpbmdfKHN0cmluZykge1xuICAgIHJldHVybiBTZXJ2aWNlcy51cmxSZXBsYWNlbWVudHNGb3JEb2MoXG4gICAgICB0aGlzLmVsZW1lbnRcbiAgICApLi8qT0sqLyBleHBhbmRTdHJpbmdBc3luYyhcbiAgICAgIHN0cmluZyxcbiAgICAgIHVuZGVmaW5lZCAvKm9wdF9iaW5kaW5ncyovLFxuICAgICAgVEFSR0VUSU5HX01BQ1JPX0FMTE9XTElTVFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgaWRlbnRpdHkgdG9rZW4gcmVzcG9uc2UgdG8gYWQgcmVxdWVzdCBwYXJhbWV0ZXJzLlxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZyxzdHJpbmc+fVxuICAgKi9cbiAgYnVpbGRJZGVudGl0eVBhcmFtcygpIHtcbiAgICByZXR1cm4gdGhpcy5pZGVudGl0eVRva2VuXG4gICAgICA/IHtcbiAgICAgICAgICBhZHNpZDogdGhpcy5pZGVudGl0eVRva2VuLnRva2VuIHx8IG51bGwsXG4gICAgICAgICAgamFyOiB0aGlzLmlkZW50aXR5VG9rZW4uamFyIHx8IG51bGwsXG4gICAgICAgICAgcHVjcmQ6IHRoaXMuaWRlbnRpdHlUb2tlbi5wdWNyZCB8fCBudWxsLFxuICAgICAgICB9XG4gICAgICA6IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyBhbGwgb2YgdGhlIHJ0Y1Jlc3BvbnNlcyBpbnRvIHRoZSBKU09OIHRhcmdldGluZyBhbmRcbiAgICogY2F0ZWdvcnkgZXhjbHVzaW9ucy5cbiAgICogQHBhcmFtIHs/QXJyYXk8IXJ0Y1Jlc3BvbnNlRGVmPn0gcnRjUmVzcG9uc2VBcnJheVxuICAgKiBAcmV0dXJuIHs/T2JqZWN0fHVuZGVmaW5lZH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1lcmdlUnRjUmVzcG9uc2VzXyhydGNSZXNwb25zZUFycmF5KSB7XG4gICAgaWYgKCFydGNSZXNwb25zZUFycmF5KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgYXJ0YyA9IFtdO1xuICAgIGNvbnN0IGF0aSA9IFtdO1xuICAgIGNvbnN0IGFyZCA9IFtdO1xuICAgIGxldCBleGNsdXNpb25zO1xuICAgIHJ0Y1Jlc3BvbnNlQXJyYXkuZm9yRWFjaCgocnRjUmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghcnRjUmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXJ0Yy5wdXNoKHJ0Y1Jlc3BvbnNlLnJ0Y1RpbWUpO1xuICAgICAgYXRpLnB1c2gocnRjUmVzcG9uc2UuZXJyb3IgfHwgUlRDX1NVQ0NFU1MpO1xuICAgICAgYXJkLnB1c2gocnRjUmVzcG9uc2UuY2FsbG91dCk7XG4gICAgICBpZiAocnRjUmVzcG9uc2UucmVzcG9uc2UpIHtcbiAgICAgICAgaWYgKHJ0Y1Jlc3BvbnNlLnJlc3BvbnNlWyd0YXJnZXRpbmcnXSkge1xuICAgICAgICAgIGNvbnN0IHJld3JpdHRlblJlc3BvbnNlID0gdGhpcy5yZXdyaXRlUnRjS2V5c18oXG4gICAgICAgICAgICBydGNSZXNwb25zZS5yZXNwb25zZVsndGFyZ2V0aW5nJ10sXG4gICAgICAgICAgICBydGNSZXNwb25zZS5jYWxsb3V0XG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLmpzb25UYXJnZXRpbmdbJ3RhcmdldGluZyddID0gISF0aGlzLmpzb25UYXJnZXRpbmdbJ3RhcmdldGluZyddXG4gICAgICAgICAgICA/IGRlZXBNZXJnZSh0aGlzLmpzb25UYXJnZXRpbmdbJ3RhcmdldGluZyddLCByZXdyaXR0ZW5SZXNwb25zZSlcbiAgICAgICAgICAgIDogcmV3cml0dGVuUmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ0Y1Jlc3BvbnNlLnJlc3BvbnNlWydjYXRlZ29yeUV4Y2x1c2lvbnMnXSkge1xuICAgICAgICAgIGlmICghZXhjbHVzaW9ucykge1xuICAgICAgICAgICAgZXhjbHVzaW9ucyA9IHt9O1xuICAgICAgICAgICAgaWYgKHRoaXMuanNvblRhcmdldGluZ1snY2F0ZWdvcnlFeGNsdXNpb25zJ10pIHtcbiAgICAgICAgICAgICAgLyoqIEB0eXBlIHshQXJyYXl9ICovIChcbiAgICAgICAgICAgICAgICB0aGlzLmpzb25UYXJnZXRpbmdbJ2NhdGVnb3J5RXhjbHVzaW9ucyddXG4gICAgICAgICAgICAgICkuZm9yRWFjaCgoZXhjbHVzaW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhjbHVzaW9uc1tleGNsdXNpb25dID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8qKiBAdHlwZSB7IUFycmF5fSAqLyAoXG4gICAgICAgICAgICBydGNSZXNwb25zZS5yZXNwb25zZVsnY2F0ZWdvcnlFeGNsdXNpb25zJ11cbiAgICAgICAgICApLmZvckVhY2goKGV4Y2x1c2lvbikgPT4ge1xuICAgICAgICAgICAgZXhjbHVzaW9uc1tleGNsdXNpb25dID0gdHJ1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChleGNsdXNpb25zKSB7XG4gICAgICB0aGlzLmpzb25UYXJnZXRpbmdbJ2NhdGVnb3J5RXhjbHVzaW9ucyddID0gT2JqZWN0LmtleXMoZXhjbHVzaW9ucyk7XG4gICAgfVxuICAgIHJldHVybiB7J2FydGMnOiBhcnRjLmpvaW4oKSB8fCBudWxsLCAnYXRpJzogYXRpLmpvaW4oKSwgJ2FyZCc6IGFyZC5qb2luKCl9O1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRDdXN0b21SZWFsVGltZUNvbmZpZ01hY3Jvc18oKSB7XG4gICAgLyoqXG4gICAgICogVGhpcyBsaXN0cyBhbGxvd2VkIGF0dHJpYnV0ZXMgb24gdGhlIGFtcC1hZCBlbGVtZW50IHRvIGJlIHVzZWQgYXNcbiAgICAgKiBtYWNyb3MgZm9yIGNvbnN0cnVjdGluZyB0aGUgUlRDIFVSTC4gQWRkIGF0dHJpYnV0ZXMgaGVyZSwgaW4gbG93ZXJjYXNlLFxuICAgICAqIHRvIG1ha2UgdGhlbSBhdmFpbGFibGUuXG4gICAgICovXG4gICAgY29uc3QgYWxsb3dsaXN0ID0ge1xuICAgICAgJ2hlaWdodCc6IHRydWUsXG4gICAgICAnd2lkdGgnOiB0cnVlLFxuICAgICAgJ2pzb24nOiB0cnVlLFxuICAgICAgJ2RhdGEtc2xvdCc6IHRydWUsXG4gICAgICAnZGF0YS1tdWx0aS1zaXplJzogdHJ1ZSxcbiAgICAgICdkYXRhLW11bHRpLXNpemUtdmFsaWRhdGlvbic6IHRydWUsXG4gICAgICAnZGF0YS1vdmVycmlkZS13aWR0aCc6IHRydWUsXG4gICAgICAnZGF0YS1vdmVycmlkZS1oZWlnaHQnOiB0cnVlLFxuICAgICAgJ2RhdGEtYW1wLXNsb3QtaW5kZXgnOiB0cnVlLFxuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIFBBR0VWSUVXSUQ6ICgpID0+IFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLmVsZW1lbnQpLnBhZ2VWaWV3SWQsXG4gICAgICBQQUdFVklFV0lEXzY0OiAoKSA9PlxuICAgICAgICBTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2ModGhpcy5lbGVtZW50KS5wYWdlVmlld0lkNjQsXG4gICAgICBIUkVGOiAoKSA9PiB0aGlzLndpbi5sb2NhdGlvbi5ocmVmLFxuICAgICAgUkVGRVJSRVI6IChvcHRfdGltZW91dCkgPT4gdGhpcy5nZXRSZWZlcnJlcl8ob3B0X3RpbWVvdXQpLFxuICAgICAgVEdUOiAoKSA9PlxuICAgICAgICBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAodHJ5UGFyc2VKc29uKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2pzb24nKSkgfHwge30pWyd0YXJnZXRpbmcnXVxuICAgICAgICApLFxuICAgICAgQURDSUQ6IChvcHRfdGltZW91dCkgPT5cbiAgICAgICAgZ2V0T3JDcmVhdGVBZENpZChcbiAgICAgICAgICB0aGlzLmdldEFtcERvYygpLFxuICAgICAgICAgICdBTVBfRUNJRF9HT09HTEUnLFxuICAgICAgICAgICdfZ2EnLFxuICAgICAgICAgIHBhcnNlSW50KG9wdF90aW1lb3V0LCAxMClcbiAgICAgICAgKSxcbiAgICAgIEFUVFI6IChuYW1lKSA9PiB7XG4gICAgICAgIGlmICghYWxsb3dsaXN0W25hbWUudG9Mb3dlckNhc2UoKV0pIHtcbiAgICAgICAgICBkZXYoKS53YXJuKFRBRywgYEludmFsaWQgYXR0cmlidXRlICR7bmFtZX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIEVMRU1FTlRfUE9TOiAoKSA9PiBnZXRQYWdlTGF5b3V0Qm94QmxvY2tpbmcodGhpcy5lbGVtZW50KS50b3AsXG4gICAgICBTQ1JPTExfVE9QOiAoKSA9PlxuICAgICAgICBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyh0aGlzLmdldEFtcERvYygpKS5nZXRTY3JvbGxUb3AoKSxcbiAgICAgIFBBR0VfSEVJR0hUOiAoKSA9PlxuICAgICAgICBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyh0aGlzLmdldEFtcERvYygpKS5nZXRTY3JvbGxIZWlnaHQoKSxcbiAgICAgIEJLR19TVEFURTogKCkgPT4gKHRoaXMuZ2V0QW1wRG9jKCkuaXNWaXNpYmxlKCkgPyAndmlzaWJsZScgOiAnaGlkZGVuJyksXG4gICAgICBDQU5PTklDQUxfVVJMOiAoKSA9PlxuICAgICAgICBTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2ModGhpcy5lbGVtZW50KS5jYW5vbmljYWxVcmwsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWZlcnJlciBvciB1bmRlZmluZWQgaWYgdGhlIHJlZmVycmVyIGlzIG5vdCByZXNvbHZlZFxuICAgKiBiZWZvcmUgdGhlIGdpdmVuIHRpbWVvdXRcbiAgICogQHBhcmFtIHtudW1iZXI9fSBvcHRfdGltZW91dFxuICAgKiBAcmV0dXJuIHshKFByb21pc2U8c3RyaW5nPnxQcm9taXNlPHVuZGVmaW5lZD4pfSBBIHByb21pc2Ugd2l0aCBhIHJlZmVycmVyIG9yIHVuZGVmaW5lZFxuICAgKiBpZiB0aW1lZCBvdXRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFJlZmVycmVyXyhvcHRfdGltZW91dCkge1xuICAgIGNvbnN0IHRpbWVvdXRJbnQgPSBwYXJzZUludChvcHRfdGltZW91dCwgMTApO1xuICAgIGNvbnN0IHJlZmVycmVyUHJvbWlzZSA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhcbiAgICAgIHRoaXMuZ2V0QW1wRG9jKClcbiAgICApLmdldFJlZmVycmVyVXJsKCk7XG4gICAgaWYgKGlzTmFOKHRpbWVvdXRJbnQpIHx8IHRpbWVvdXRJbnQgPCAwKSB7XG4gICAgICByZXR1cm4gcmVmZXJyZXJQcm9taXNlO1xuICAgIH1cbiAgICByZXR1cm4gU2VydmljZXMudGltZXJGb3IodGhpcy53aW4pXG4gICAgICAudGltZW91dFByb21pc2UodGltZW91dEludCwgcmVmZXJyZXJQcm9taXNlKVxuICAgICAgLmNhdGNoKCgpID0+IHVuZGVmaW5lZCk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyB0aGUgY2FsbG91dCB2YWx1ZSB0byB0aGUga2V5cyBvZiByZXNwb25zZSB0byBwcmV2ZW50IGEgY29sbGlzaW9uXG4gICAqIGNhc2UgY2F1c2VkIGJ5IG11bHRpcGxlIHZlbmRvcnMgcmV0dXJuaW5nIHRoZSBzYW1lIGtleXMuXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz59IHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjYWxsb3V0XG4gICAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmV3cml0ZVJ0Y0tleXNfKHJlc3BvbnNlLCBjYWxsb3V0KSB7XG4gICAgLy8gT25seSBwZXJmb3JtIHRoaXMgc3Vic3RpdHV0aW9uIGZvciB2ZW5kb3ItZGVmaW5lZCBVUkxzLlxuICAgIGlmICghUlRDX1ZFTkRPUlNbY2FsbG91dF0gfHwgUlRDX1ZFTkRPUlNbY2FsbG91dF0uZGlzYWJsZUtleUFwcGVuZCkge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cbiAgICBjb25zdCBuZXdSZXNwb25zZSA9IHt9O1xuICAgIE9iamVjdC5rZXlzKHJlc3BvbnNlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIG5ld1Jlc3BvbnNlW2Ake2tleX1fJHtjYWxsb3V0fWBdID0gcmVzcG9uc2Vba2V5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3UmVzcG9uc2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uTmV0d29ya0ZhaWx1cmUoZXJyb3IsIGFkVXJsKSB7XG4gICAgZGV2KCkuaW5mbyhUQUcsICduZXR3b3JrIGVycm9yLCBhdHRlbXB0IGFkZGluZyBvZiBlcnJvciBwYXJhbWV0ZXInLCBlcnJvcik7XG4gICAgcmV0dXJuIHthZFVybDogbWF5YmVBcHBlbmRFcnJvclBhcmFtZXRlcihhZFVybCwgJ24nKX07XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG1heWJlVmFsaWRhdGVBbXBDcmVhdGl2ZShieXRlcywgaGVhZGVycykge1xuICAgIGlmIChoZWFkZXJzLmdldCgnQU1QLVZlcmlmaWNhdGlvbi1DaGVja3N1bS1BbGdvcml0aG0nKSAhPT0gJ2RqYjJhLTMyJykge1xuICAgICAgcmV0dXJuIHN1cGVyLm1heWJlVmFsaWRhdGVBbXBDcmVhdGl2ZShieXRlcywgaGVhZGVycyk7XG4gICAgfVxuICAgIGNvbnN0IGNoZWNrc3VtID0gaGVhZGVycy5nZXQoJ0FNUC1WZXJpZmljYXRpb24tQ2hlY2tzdW0nKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgY2hlY2tzdW0gJiYgc3RyaW5nSGFzaDMyKHV0ZjhEZWNvZGUoYnl0ZXMpKSA9PSBjaGVja3N1bSA/IGJ5dGVzIDogbnVsbFxuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGV4dHJhY3RTaXplKHJlc3BvbnNlSGVhZGVycykge1xuICAgIHRoaXMuYW1wQW5hbHl0aWNzQ29uZmlnXyA9IGV4dHJhY3RBbXBBbmFseXRpY3NDb25maWcodGhpcywgcmVzcG9uc2VIZWFkZXJzKTtcbiAgICB0aGlzLnFxaWRfID0gcmVzcG9uc2VIZWFkZXJzLmdldChRUUlEX0hFQURFUik7XG4gICAgdGhpcy5zaG91bGRTYW5kYm94XyA9IHJlc3BvbnNlSGVhZGVycy5nZXQoU0FOREJPWF9IRUFERVIpID09ICd0cnVlJztcbiAgICB0aGlzLnRyb3VibGVzaG9vdERhdGFfLmNyZWF0aXZlSWQgPSBkZXYoKS5hc3NlcnRTdHJpbmcoXG4gICAgICByZXNwb25zZUhlYWRlcnMuZ2V0KCdnb29nbGUtY3JlYXRpdmUtaWQnKSB8fCAnLTEnXG4gICAgKTtcbiAgICB0aGlzLnRyb3VibGVzaG9vdERhdGFfLmxpbmVJdGVtSWQgPSBkZXYoKS5hc3NlcnRTdHJpbmcoXG4gICAgICByZXNwb25zZUhlYWRlcnMuZ2V0KCdnb29nbGUtbGluZWl0ZW0taWQnKSB8fCAnLTEnXG4gICAgKTtcbiAgICBpZiAodGhpcy5hbXBBbmFseXRpY3NDb25maWdfKSB7XG4gICAgICAvLyBMb2FkIGFtcC1hbmFseXRpY3MgZXh0ZW5zaW9uc1xuICAgICAgdGhpcy5leHRlbnNpb25zXy4vKk9LKi8gaW5zdGFsbEV4dGVuc2lvbkZvckRvYyhcbiAgICAgICAgdGhpcy5nZXRBbXBEb2MoKSxcbiAgICAgICAgJ2FtcC1hbmFseXRpY3MnXG4gICAgICApO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgc2VydmVyIHJldHVybmVkIGEgc2l6ZSwgdXNlIHRoYXQsIG90aGVyd2lzZSB1c2UgdGhlIHNpemUgdGhhdCB3ZVxuICAgIC8vIHNlbnQgaW4gdGhlIGFkIHJlcXVlc3QuXG4gICAgbGV0IHNpemUgPSBzdXBlci5leHRyYWN0U2l6ZShyZXNwb25zZUhlYWRlcnMpO1xuICAgIGlmIChzaXplKSB7XG4gICAgICB0aGlzLnJldHVybmVkU2l6ZV8gPSBzaXplO1xuICAgICAgdGhpcy5oYW5kbGVSZXNpemVfKHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2l6ZSA9IHRoaXMuZ2V0U2xvdFNpemUoKTtcbiAgICB9XG4gICAgLy8gSWYgdGhpcyBpcyBhIG11bHRpLXNpemUgY3JlYXRpdmUsIGZpcmUgZGVsYXllZCBpbXByZXNzaW9uIG5vdy4gSWYgaXQnc1xuICAgIC8vIGZsdWlkLCB3YWl0IHVudGlsIGFmdGVyIHJlc2l6ZSBoYXBwZW5zLlxuICAgIGlmICh0aGlzLmlzRmx1aWRSZXF1ZXN0XyAmJiAhdGhpcy5yZXR1cm5lZFNpemVfKSB7XG4gICAgICB0aGlzLmZsdWlkSW1wcmVzc2lvblVybF8gPSByZXNwb25zZUhlYWRlcnMuZ2V0KCdYLUFtcEltcHMnKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcmVzcG9uc2UgaW5jbHVkZWQgYSBwYWdldmlldyBzdGF0ZSB0b2tlbiwgY2hlY2sgZm9yIGFuIGV4aXN0aW5nXG4gICAgLy8gdG9rZW4gYW5kIHJlbW92ZSBpdC4gVGhlbiBzYXZlIHRoZSBuZXcgb25lIHRvIHRoZSBtb2R1bGUgbGV2ZWwgb2JqZWN0LlxuICAgIGlmIChyZXNwb25zZUhlYWRlcnMuZ2V0KCdhbXAtZmYtcGFnZXZpZXctdG9rZW5zJykpIHtcbiAgICAgIHRoaXMucmVtb3ZlUGFnZXZpZXdTdGF0ZVRva2VuKCk7XG4gICAgICB0aGlzLnNldFBhZ2V2aWV3U3RhdGVUb2tlbihcbiAgICAgICAgZGV2KCkuYXNzZXJ0U3RyaW5nKHJlc3BvbnNlSGVhZGVycy5nZXQoJ2FtcC1mZi1wYWdldmlldy10b2tlbnMnKSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpemU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgc2xvdCBhcyBkZWZpbmVkIGJ5IHRoZSB3aWR0aCBhbmQgaGVpZ2h0XG4gICAqIGF0dHJpYnV0ZXMsIG9yIHRoZSBkaW1lbnNpb25zIGFzIGNvbXB1dGVkIGJ5XG4gICAqIGdldEludGVyc2VjdGlvbkVsZW1lbnRMYXlvdXRCb3guXG4gICAqIEByZXR1cm4geyFMYXlvdXRSZWN0T3JEaW1zRGVmfVxuICAgKi9cbiAgZ2V0U2xvdFNpemUoKSB7XG4gICAgY29uc3Qge2hlaWdodCwgd2lkdGh9ID0gdGhpcy5nZXREZWNsYXJlZFNsb3RTaXplXygpO1xuICAgIHJldHVybiB3aWR0aCAmJiBoZWlnaHRcbiAgICAgID8ge3dpZHRoLCBoZWlnaHR9XG4gICAgICA6IC8vIHdpZHRoL2hlaWdodCBjb3VsZCBiZSAnYXV0bycgaW4gd2hpY2ggY2FzZSB3ZSBmYWxsYmFjayB0byBtZWFzdXJlZC5cbiAgICAgICAgdGhpcy5nZXRJbnRlcnNlY3Rpb25FbGVtZW50TGF5b3V0Qm94KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgd2lkdGggYW5kIGhlaWdodCwgYXMgZGVmaW5lZCBieSB0aGUgc2xvdCBlbGVtZW50J3Mgd2lkdGggYW5kXG4gICAqIGhlaWdodCBhdHRyaWJ1dGVzLlxuICAgKiBAcmV0dXJuIHshU2l6ZURlZn1cbiAgICovXG4gIGdldERlY2xhcmVkU2xvdFNpemVfKCkge1xuICAgIGNvbnN0IHdpZHRoID0gTnVtYmVyKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykpO1xuICAgIGNvbnN0IGhlaWdodCA9IE51bWJlcih0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSk7XG4gICAgcmV0dXJuIHt3aWR0aCwgaGVpZ2h0fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzaXplIHBhcmFtZXRlci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldFBhcmFtZXRlclNpemVfKCkge1xuICAgIGxldCBzeiA9IHRoaXMuaXNGbHVpZFJlcXVlc3RfID8gRFVNTVlfRkxVSURfU0laRSA6ICcnO1xuICAgIGlmICghdGhpcy5pc0ZsdWlkUHJpbWFyeVJlcXVlc3RfKSB7XG4gICAgICBzeiArPVxuICAgICAgICAoc3oubGVuZ3RoID8gJ3wnIDogJycpICtcbiAgICAgICAgYCR7dGhpcy5pbml0aWFsU2l6ZV8ud2lkdGh9eCR7dGhpcy5pbml0aWFsU2l6ZV8uaGVpZ2h0fWA7XG4gICAgfVxuICAgIGNvbnN0IG11bHRpU2l6ZURhdGFTdHIgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW11bHRpLXNpemUnKTtcbiAgICBpZiAobXVsdGlTaXplRGF0YVN0cikge1xuICAgICAgY29uc3QgbXVsdGlTaXplVmFsaWRhdGlvbiA9XG4gICAgICAgIHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbXVsdGktc2l6ZS12YWxpZGF0aW9uJykgfHwgJ3RydWUnO1xuICAgICAgLy8gVGhlIGZvbGxvd2luZyBjYWxsIHdpbGwgY2hlY2sgYWxsIHNwZWNpZmllZCBtdWx0aS1zaXplIGRpbWVuc2lvbnMsXG4gICAgICAvLyB2ZXJpZnkgdGhhdCB0aGV5IG1lZXQgYWxsIHJlcXVpcmVtZW50cywgYW5kIHRoZW4gcmV0dXJuIGFsbCB0aGUgdmFsaWRcbiAgICAgIC8vIGRpbWVuc2lvbnMgaW4gYW4gYXJyYXkuXG4gICAgICBjb25zdCBkaW1lbnNpb25zID0gZ2V0TXVsdGlTaXplRGltZW5zaW9ucyhcbiAgICAgICAgbXVsdGlTaXplRGF0YVN0cixcbiAgICAgICAgdGhpcy5pbml0aWFsU2l6ZV8ud2lkdGgsXG4gICAgICAgIHRoaXMuaW5pdGlhbFNpemVfLmhlaWdodCxcbiAgICAgICAgbXVsdGlTaXplVmFsaWRhdGlvbiA9PSAndHJ1ZScsXG4gICAgICAgIHRoaXMuaXNGbHVpZFByaW1hcnlSZXF1ZXN0X1xuICAgICAgKTtcbiAgICAgIGlmIChkaW1lbnNpb25zLmxlbmd0aCkge1xuICAgICAgICBzeiArPVxuICAgICAgICAgICd8JyArIGRpbWVuc2lvbnMubWFwKChkaW1lbnNpb24pID0+IGRpbWVuc2lvbi5qb2luKCd4JykpLmpvaW4oJ3wnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN6O1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzYW5kYm94SFRNTENyZWF0aXZlRnJhbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2hvdWxkU2FuZGJveF87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHRlYXJEb3duU2xvdCgpIHtcbiAgICBzdXBlci50ZWFyRG93blNsb3QoKTtcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgJ2RhdGEtYW1wLXNsb3QtaW5kZXgnLFxuICAgICAgdGhpcy53aW4uYW1wQWRTbG90SWRDb3VudGVyKytcbiAgICApO1xuICAgIGlmICh0aGlzLmFtcEFuYWx5dGljc0VsZW1lbnRfKSB7XG4gICAgICByZW1vdmVFbGVtZW50KHRoaXMuYW1wQW5hbHl0aWNzRWxlbWVudF8pO1xuICAgICAgdGhpcy5hbXBBbmFseXRpY3NFbGVtZW50XyA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuYW1wQW5hbHl0aWNzQ29uZmlnXyA9IG51bGw7XG4gICAgdGhpcy5qc29uVGFyZ2V0aW5nID0gbnVsbDtcbiAgICB0aGlzLmlzQW1wQ3JlYXRpdmVfID0gbnVsbDtcbiAgICB0aGlzLmlzSWRsZVJlbmRlcl8gPSBmYWxzZTtcbiAgICB0aGlzLnBhcmFtZXRlclNpemUgPSBudWxsO1xuICAgIHRoaXMucmV0dXJuZWRTaXplXyA9IG51bGw7XG4gICAgLy8gUmVzZXQgU1JBIHJlcXVlc3RzIHRvIGFsbG93IGZvciByZXN1bWVDYWxsYmFjayB0byByZS1mZXRjaFxuICAgIC8vIGFkIHJlcXVlc3RzLiAgQXNzdW1lcyB0aGF0IHVubGF5b3V0Q2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgZm9yIGFsbCBzbG90c1xuICAgIC8vIGluIHJhcGlkIHN1Y2Nlc3Npb24gKG1lYW5pbmcgb25MYXlvdXRNZWFzdXJlIGluaXRpYXRlZCBwcm9taXNlIGNoYWluXG4gICAgLy8gd2lsbCBub3QgYmUgc3RhcnRlZCB1bnRpbCByZXN1bWVDYWxsYmFjaykuXG4gICAgc3JhUmVxdWVzdHMgPSBudWxsO1xuICAgIHRoaXMuc3JhRGVmZXJyZWQgPSBudWxsO1xuICAgIHRoaXMucXFpZF8gPSBudWxsO1xuICAgIHRoaXMuc2hvdWxkU2FuZGJveF8gPSBmYWxzZTtcbiAgICB0aGlzLmNvbnNlbnRUdXBsZSA9IHt9O1xuICAgIHRoaXMuZ2V0QWRVcmxEZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIHRoaXMucmVtb3ZlUGFnZXZpZXdTdGF0ZVRva2VuKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlbmRlck5vbkFtcENyZWF0aXZlKCkge1xuICAgIC8vIElmIHJlbmRlciBpZGxlIHdpdGggdGhyb3R0bGluZywgaW1wb3NlIG9uZSBzZWNvbmQgcmVuZGVyIGRlbGF5IGZvclxuICAgIC8vIG5vbi1BTVAgY3JlYXRpdmVzLiAgVGhpcyBpcyBub3QgZG9uZSBpbiB0aGUgc2NoZWR1bGVyIHRvIGVuc3VyZSBhcyBtYW55XG4gICAgLy8gc2xvdHMgYXMgcG9zc2libGUgYXJlIG1hcmtlZCBmb3IgbGF5b3V0IGdpdmVuIHNjaGVkdWxlciBpbXBvc2VzIDUgc2Vjb25kc1xuICAgIC8vIHBhc3QgcHJldmlvdXMgZXhlY3V0aW9uLlxuICAgIGlmIChcbiAgICAgIHRoaXMucG9zdEFkUmVzcG9uc2VFeHBlcmltZW50RmVhdHVyZXNbJ3JlbmRlci1pZGxlLXRocm90dGxlJ10gJiZcbiAgICAgIHRoaXMuaXNJZGxlUmVuZGVyX1xuICAgICkge1xuICAgICAgaWYgKGlzM3BUaHJvdHRsZWQodGhpcy53aW4pKSB7XG4gICAgICAgIHJldHVybiB3YWl0Rm9yM3BUaHJvdHRsZSgpLnRoZW4oKCkgPT4gc3VwZXIucmVuZGVyTm9uQW1wQ3JlYXRpdmUoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmNyZW1lbnRMb2FkaW5nQWRzKHRoaXMud2luKTtcbiAgICAgICAgcmV0dXJuIHN1cGVyLnJlbmRlck5vbkFtcENyZWF0aXZlKHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VwZXIucmVuZGVyTm9uQW1wQ3JlYXRpdmUoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgdmlld3BvcnRDYWxsYmFja1RlbXAoaW5WaWV3cG9ydCkge1xuICAgIHN1cGVyLnZpZXdwb3J0Q2FsbGJhY2tUZW1wKGluVmlld3BvcnQpO1xuICAgIGlmICh0aGlzLnJlYXR0ZW1wdFRvRXhwYW5kRmx1aWRDcmVhdGl2ZV8gJiYgIWluVmlld3BvcnQpIHtcbiAgICAgIC8vIElmIHRoZSBpbml0aWFsIGV4cGFuc2lvbiBhdHRlbXB0IGZhaWxlZCAoZS5nLiwgdGhlIHNsb3Qgd2FzIHdpdGhpbiB0aGVcbiAgICAgIC8vIHZpZXdwb3J0KSwgdGhlbiB3ZSB3aWxsIHJlLWF0dGVtcHQgdG8gZXhwYW5kIGl0IGhlcmUgd2hlbmV2ZXIgdGhlIHNsb3RcbiAgICAgIC8vIGlzIG91dHNpZGUgdGhlIHZpZXdwb3J0LlxuICAgICAgdGhpcy5leHBhbmRGbHVpZENyZWF0aXZlXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgICovXG4gIHVubGF5b3V0Q2FsbGJhY2soKSB7XG4gICAgaWYgKHRoaXMucmVmcmVzaE1hbmFnZXJfKSB7XG4gICAgICB0aGlzLnJlZnJlc2hNYW5hZ2VyXy51bm9ic2VydmUoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnVzZVNyYSAmJiB0aGlzLmlzQW1wQ3JlYXRpdmVfKSB7XG4gICAgICAvLyBBbGxvdyBub24tQU1QIGNyZWF0aXZlcyB0byByZW1haW4gdW5sZXNzIFNSQS5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5kZXN0cm95U2FmZUZyYW1lQXBpXygpO1xuICAgIHJldHVybiBzdXBlci51bmxheW91dENhbGxiYWNrKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFNhZmVmcmFtZVBhdGgoKSB7XG4gICAgc2FmZUZyYW1lUmFuZG9tU3ViZG9tYWluID1cbiAgICAgIHNhZmVGcmFtZVJhbmRvbVN1YmRvbWFpbiB8fCB0aGlzLmdldFJhbmRvbVN0cmluZ18oKTtcblxuICAgIHJldHVybiAoXG4gICAgICBgaHR0cHM6Ly8ke3NhZmVGcmFtZVJhbmRvbVN1YmRvbWFpbn0uc2FmZWZyYW1lLmdvb2dsZXN5bmRpY2F0aW9uLmNvbS9zYWZlZnJhbWUvYCArXG4gICAgICBgJHt0aGlzLnNhZmVmcmFtZVZlcnNpb259L2h0bWwvY29udGFpbmVyLmh0bWxgXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbiAgY2xlYW51cEFmdGVyVGVzdCgpIHtcbiAgICB0aGlzLmRlc3Ryb3lTYWZlRnJhbWVBcGlfKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgZGVzdHJveVNhZmVGcmFtZUFwaV8oKSB7XG4gICAgaWYgKCF0aGlzLnNhZmVmcmFtZUFwaV8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zYWZlZnJhbWVBcGlfLmRlc3Ryb3koKTtcbiAgICB0aGlzLnNhZmVmcmFtZUFwaV8gPSBudWxsO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICByZWZyZXNoKHJlZnJlc2hFbmRDYWxsYmFjaykge1xuICAgIHRoaXMucmVmcmVzaENvdW50XysrO1xuICAgIHJldHVybiBzdXBlci5yZWZyZXNoKHJlZnJlc2hFbmRDYWxsYmFjayk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uQ3JlYXRpdmVSZW5kZXIoY3JlYXRpdmVNZXRhRGF0YSwgb3B0X29uTG9hZFByb21pc2UpIHtcbiAgICBzdXBlci5vbkNyZWF0aXZlUmVuZGVyKGNyZWF0aXZlTWV0YURhdGEpO1xuICAgIHRoaXMuaXNBbXBDcmVhdGl2ZV8gPSAhIWNyZWF0aXZlTWV0YURhdGE7XG4gICAgaWYgKFxuICAgICAgY3JlYXRpdmVNZXRhRGF0YSAmJlxuICAgICAgIWNyZWF0aXZlTWV0YURhdGEuY3VzdG9tRWxlbWVudEV4dGVuc2lvbnMuaW5jbHVkZXMoJ2FtcC1hZC1leGl0JylcbiAgICApIHtcbiAgICAgIC8vIENhcHR1cmUgcGhhc2UgY2xpY2sgaGFuZGxlcnMgb24gdGhlIGFkIGlmIGFtcC1hZC1leGl0IG5vdCBwcmVzZW50XG4gICAgICAvLyAoYXNzdW1lIGl0IHdpbGwgaGFuZGxlIGNhcHR1cmUpLlxuICAgICAgZGV2QXNzZXJ0KHRoaXMuaWZyYW1lKTtcbiAgICAgIE5hdmlnYXRpb24uaW5zdGFsbEFuY2hvckNsaWNrSW50ZXJjZXB0b3IoXG4gICAgICAgIHRoaXMuZ2V0QW1wRG9jKCksXG4gICAgICAgIGRldkFzc2VydCh0aGlzLmlmcmFtZS5jb250ZW50V2luZG93KVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuYW1wQW5hbHl0aWNzQ29uZmlnXykge1xuICAgICAgZGV2QXNzZXJ0KCF0aGlzLmFtcEFuYWx5dGljc0VsZW1lbnRfKTtcbiAgICAgIGlmIChpc1JlcG9ydGluZ0VuYWJsZWQodGhpcykpIHtcbiAgICAgICAgYWRkQ3NpU2lnbmFsc1RvQW1wQW5hbHl0aWNzQ29uZmlnKFxuICAgICAgICAgIHRoaXMud2luLFxuICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICB0aGlzLmFtcEFuYWx5dGljc0NvbmZpZ18sXG4gICAgICAgICAgdGhpcy5xcWlkXyxcbiAgICAgICAgICAhIWNyZWF0aXZlTWV0YURhdGFcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYW1wQW5hbHl0aWNzRWxlbWVudF8gPSBpbnNlcnRBbmFseXRpY3NFbGVtZW50KFxuICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgIHRoaXMuYW1wQW5hbHl0aWNzQ29uZmlnXyxcbiAgICAgICAgLypsb2FkQW5hbHl0aWNzKi8gdHJ1ZSxcbiAgICAgICAgISF0aGlzLnBvc3RBZFJlc3BvbnNlRXhwZXJpbWVudEZlYXR1cmVzWydhdnJfZGlzYWJsZV9pbW1lZGlhdGUnXVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNSZWZyZXNoaW5nKSB7XG4gICAgICBkZXZBc3NlcnQodGhpcy5yZWZyZXNoTWFuYWdlcl8pO1xuICAgICAgdGhpcy5yZWZyZXNoTWFuYWdlcl8uaW5pdGlhdGVSZWZyZXNoQ3ljbGUoKTtcbiAgICAgIHRoaXMuaXNSZWZyZXNoaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmlzUmVsYXlvdXROZWVkZWRGbGFnID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gRm9yY2Ugc2l6ZSBvZiBmcmFtZSB0byBtYXRjaCBjcmVhdGl2ZSBvciwgaWYgY3JlYXRpdmUgc2l6ZSBpcyB1bmtub3duLFxuICAgIC8vIHRoZSBzbG90LiBUaGlzIGVuc3VyZXMgdGhhdCB0aGUgY3JlYXRpdmUgaXMgY2VudGVyZWQgaW4gdGhlIGZvcm1lciBjYXNlLFxuICAgIC8vIGFuZCBub3QgdHJ1bmNhdGVkIGluIHRoZSBsYXR0ZXIuXG4gICAgY29uc3Qgc2l6ZSA9IHRoaXMucmV0dXJuZWRTaXplXyB8fCB0aGlzLmdldFNsb3RTaXplKCk7XG4gICAgY29uc3QgaXNNdWx0aVNpemVGbHVpZCA9XG4gICAgICB0aGlzLmlzRmx1aWRSZXF1ZXN0XyAmJlxuICAgICAgdGhpcy5yZXR1cm5lZFNpemVfICYmXG4gICAgICAvLyBUT0RPKEBnbGV2aXR6a3ksIDExNTgzKSBSZW1vdmUgdGhpcyBjbGF1c2Ugb25jZSB3ZSBzdG9wIHNlbmRpbmcgYmFja1xuICAgICAgLy8gdGhlIHNpemUgaGVhZGVyIGZvciBmbHVpZCBhZHMuIEZsdWlkIHNpemUgaGVhZGVycyBhbHdheXMgY29tZSBiYWNrIGFzXG4gICAgICAvLyAweDAuXG4gICAgICAhKHNpemUud2lkdGggPT0gMCAmJiBzaXplLmhlaWdodCA9PSAwKTtcbiAgICBzZXRTdHlsZXMoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmlmcmFtZSksIHtcbiAgICAgIHdpZHRoOiBgJHtzaXplLndpZHRofXB4YCxcbiAgICAgIGhlaWdodDogYCR7c2l6ZS5oZWlnaHR9cHhgLFxuICAgICAgcG9zaXRpb246IGlzTXVsdGlTaXplRmx1aWQgPyAncmVsYXRpdmUnIDogbnVsbCxcbiAgICB9KTtcblxuICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBtdWx0aS1zaXplIGNyZWF0aXZlIHRoYXQncyBuYXJyb3dlciB0aGFuIHRoZSBhZCBzbG90LlxuICAgIGlmIChcbiAgICAgIHRoaXMucmV0dXJuZWRTaXplXyAmJlxuICAgICAgdGhpcy5yZXR1cm5lZFNpemVfLndpZHRoICYmXG4gICAgICB0aGlzLnJldHVybmVkU2l6ZV8ud2lkdGggPCB0aGlzLmdldFNsb3RTaXplKCkud2lkdGhcbiAgICApIHtcbiAgICAgIHNldFN0eWxlcyhkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuaWZyYW1lKSwge1xuICAgICAgICB0b3A6ICc1MCUnLFxuICAgICAgICBsZWZ0OiAnNTAlJyxcbiAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlKC01MCUsIC01MCUpJyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnFxaWRfKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLWdvb2dsZS1xdWVyeS1pZCcsIHRoaXMucXFpZF8pO1xuICAgIH1cbiAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuaWZyYW1lKS5pZCA9IGBnb29nbGVfYWRzX2lmcmFtZV8ke3RoaXMuaWZpX31gO1xuICAgIGlmIChpc011bHRpU2l6ZUZsdWlkKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgZmx1aWQgKyBtdWx0aS1zaXplIHJlcXVlc3QsIHdoZXJlIHRoZSByZXR1cm5lZCBjcmVhdGl2ZSBpc1xuICAgICAgLy8gbXVsdGktc2l6ZS4gVGhlIHNsb3QgbmVlZHMgdG8gbm90IGJlIHN0eWxlZCB3aXRoIHdpZHRoOiAxMDAlLCBvciB0aGVcbiAgICAgIC8vIGNyZWF0aXZlIHdpbGwgYmUgY2VudGVyZWQgaW5zdGVhZCBvZiBsZWZ0LWFsaWduZWQuXG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIHNldFN0eWxlcyh0aGlzLmVsZW1lbnQsIHt3aWR0aDogYCR7c2l6ZS53aWR0aH1weGB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0X29uTG9hZFByb21pc2UpIHtcbiAgICAgIG9wdF9vbkxvYWRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmV4cGFuZEZsdWlkQ3JlYXRpdmVfKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnJlZnJlc2hNYW5hZ2VyXyA9XG4gICAgICB0aGlzLnJlZnJlc2hNYW5hZ2VyXyB8fFxuICAgICAgZ2V0UmVmcmVzaE1hbmFnZXIodGhpcywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy51c2VTcmEpIHtcbiAgICAgICAgICB1c2VyKCkud2FybihUQUcsICdSZWZyZXNoIG5vdCBjb21wYXRpYmxlIHdpdGggU1JBLicpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgZ2V0RW5jbG9zaW5nQ29udGFpbmVyVHlwZXModGhpcy5lbGVtZW50KS5maWx0ZXIoXG4gICAgICAgICAgICAoY29udGFpbmVyKSA9PlxuICAgICAgICAgICAgICBjb250YWluZXIgIT0gVmFsaWRBZENvbnRhaW5lclR5cGVzWydBTVAtQ0FST1VTRUwnXSAmJlxuICAgICAgICAgICAgICBjb250YWluZXIgIT0gVmFsaWRBZENvbnRhaW5lclR5cGVzWydBTVAtU1RJQ0tZLUFEJ11cbiAgICAgICAgICApLmxlbmd0aFxuICAgICAgICApIHtcbiAgICAgICAgICB1c2VyKCkud2FybihcbiAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICdSZWZyZXNoIG5vdCBjb21wYXRpYmxlIHdpdGggYWQtY29udGFpbmVycywgZXhjZXB0IGZvciAnICtcbiAgICAgICAgICAgICAgJ0FNUC1DQVJPVVNFTCBhbmQgQU1QLVNUSUNLWS1BRCdcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5wb3N0VHJvdWJsZXNob290TWVzc2FnZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIGV4cGFuZCBhIGZsdWlkIGNyZWF0aXZlLiBJZiB0aGUgYXR0ZW1wdCBmYWlscywgd2Ugd2lsbFxuICAgKiByZS1hdHRlbXB0IHdoZW5ldmVyIHRoZSBzbG90IGlzIG91dCBvZiB0aGUgdmlld3BvcnQgdW50aWwgd2Ugc3VjY2VlZCxcbiAgICogY29udGluZ2VudCBvbiB3aGVuIHZpZXdwb3J0Q2FsbGJhY2sgaXMgaW52b2tlZC5cbiAgICogQHJldHVybiB7IVByb21pc2V9IFRoZSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgb25jZSB0aGUgaGVpZ2h0IGNoYW5nZVxuICAgKiAgIGF0dGVtcHQgZWl0aGVyIHN1Y2NlZWRzIG9yIGlzIHJlamVjdGVkLiBJZiBubyBhdHRlbXB0IGlzIG1hZGUsXG4gICAqICAgUHJvbWlzZS5yZXNvdmxlKCkgaXMgcmV0dXJuZWQuIElmIGZvciBhbnkgcmVhc29uIHRoZSBib2R5IG9mIHRoZSBpZnJhbWVcbiAgICogICBjYW5ub3QgYmUgYWNjZXNzZWQsIHRoZSBwcm9taXNlIHdpbGwgYmUgcmVqZWN0ZWQuIFVzZWQgbWFpbmx5IGZvclxuICAgKiAgIHRlc3RpbmcuXG4gICAqL1xuICBleHBhbmRGbHVpZENyZWF0aXZlXygpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLmlzRmx1aWRSZXF1ZXN0XyAmJlxuICAgICAgLy8gSWYgYSBzaXplIHdhcyByZXR1cm5lZCBpbiB0aGUgcmVzcG9uc2UsIHRoZW4gdGhpcyBpcyBhIG11bHRpLXNpemVcbiAgICAgIC8vIHJlc3BvbnNlLCBub3QgYSBmbHVpZCByZXNwb25zZS5cbiAgICAgICF0aGlzLnJldHVybmVkU2l6ZV8gJiZcbiAgICAgIHRoaXMuaXNWZXJpZmllZEFtcENyZWF0aXZlKClcbiAgICApIHtcbiAgICAgIC8vIFRoaXMgaXMgYW4gQU1QIGZsdWlkIGNyZWF0aXZlIHRoYXQgd2lsbCBiZSByZW5kZXJlZCBpbiBhIGZyaWVuZGx5XG4gICAgICAvLyBmcmFtZS5cbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuaWZyYW1lIHx8XG4gICAgICAgICF0aGlzLmlmcmFtZS5jb250ZW50V2luZG93IHx8XG4gICAgICAgICF0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50IHx8XG4gICAgICAgICF0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHlcbiAgICAgICkge1xuICAgICAgICBkZXYoKS5lcnJvcihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ0F0dGVtcHRpbmcgdG8gZXhwYW5kIGZsdWlkIGNyZWF0aXZlIHdpdGhvdXQgJyArXG4gICAgICAgICAgICAnYSBwcm9wZXJseSBzZXQgdXAgZnJpZW5kbHkgZnJhbWUuIFNsb3QgaWQ6ICcgK1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbXAtc2xvdC1pbmRleCcpXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnQ2Fubm90IGFjY2VzcyBib2R5IG9mIGZyaWVuZGx5IGZyYW1lJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zZXRDc3NQb3NpdGlvbl8oJ3N0YXRpYycpLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRlbXB0Q2hhbmdlSGVpZ2h0KFxuICAgICAgICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuYm9keS4vKk9LKi8gY2xpZW50SGVpZ2h0XG4gICAgICAgIClcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZpcmVGbHVpZERlbGF5ZWRJbXByZXNzaW9uKCk7XG4gICAgICAgICAgICB0aGlzLnJlYXR0ZW1wdFRvRXhwYW5kRmx1aWRDcmVhdGl2ZV8gPSBmYWxzZTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICB1c2VyKCkud2FybihcbiAgICAgICAgICAgICAgVEFHLFxuICAgICAgICAgICAgICAnQXR0ZW1wdCB0byBjaGFuZ2Ugc2l6ZSBmYWlsZWQgb24gZmx1aWQgJyArXG4gICAgICAgICAgICAgICAgJ2NyZWF0aXZlLiBXaWxsIHJlLWF0dGVtcHQgd2hlbiBzbG90IGlzIG91dCBvZiB0aGUgdmlld3BvcnQuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IHtoZWlnaHQsIHdpZHRofSA9IHRoaXMuZ2V0U2xvdFNpemUoKTtcbiAgICAgICAgICAgIGlmICh3aWR0aCAmJiBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBjYWxsIGlzIGlkZW1wb3RlbnQsIHNvIGl0J3Mgb2theSB0byBtYWtlIGl0IG11bHRpcGxlXG4gICAgICAgICAgICAgIC8vIHRpbWVzLlxuICAgICAgICAgICAgICB0aGlzLmZpcmVGbHVpZERlbGF5ZWRJbXByZXNzaW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlYXR0ZW1wdFRvRXhwYW5kRmx1aWRDcmVhdGl2ZV8gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zZXRDc3NQb3NpdGlvbl8oJ2Fic29sdXRlJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIENTUyAncG9zaXRpb24nIHByb3BlcnR5IG9mIHRoaXMuZWxlbWVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHBvc2l0aW9uIFRoZSBDU1MgcG9zaXRpb24gdmFsdWUuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIG11dGF0aW9uIGlzIGNvbXBsZXRlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0Q3NzUG9zaXRpb25fKHBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMubXV0YXRlRWxlbWVudCgoKSA9PiB7XG4gICAgICBzZXRJbXBvcnRhbnRTdHlsZXModGhpcy5lbGVtZW50LCB7cG9zaXRpb259KTtcbiAgICB9LCB0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGFkIHVuaXQgaGFzaCBrZXkgc3RyaW5nLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2VuZXJhdGVBZEtleV8oc2l6ZSkge1xuICAgIGNvbnN0IHtlbGVtZW50fSA9IHRoaXM7XG4gICAgY29uc3QgZG9tRmluZ2VycHJpbnQgPSBkb21GaW5nZXJwcmludFBsYWluKGVsZW1lbnQpO1xuICAgIGNvbnN0IHNsb3QgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zbG90JykgfHwgJyc7XG4gICAgY29uc3QgbXVsdGlTaXplID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbXVsdGktc2l6ZScpIHx8ICcnO1xuICAgIGNvbnN0IHN0cmluZyA9IGAke3Nsb3R9OiR7c2l6ZX06JHttdWx0aVNpemV9OiR7ZG9tRmluZ2VycHJpbnR9YDtcbiAgICByZXR1cm4gc3RyaW5nSGFzaDMyKHN0cmluZyk7XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdHMgdG8gcmVzaXplIHRoZSBhZCwgaWYgdGhlIHJldHVybmVkIHNpemUgaXMgc21hbGxlciB0aGFuIHRoZSBwcmltYXJ5XG4gICAqIGRpbWVuc2lvbnMuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuZXdXaWR0aFxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3SGVpZ2h0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVSZXNpemVfKG5ld1dpZHRoLCBuZXdIZWlnaHQpIHtcbiAgICBjb25zdCBpc0ZsdWlkUmVxdWVzdEFuZEZpeGVkUmVzcG9uc2UgPSAhIShcbiAgICAgIHRoaXMuaXNGbHVpZFJlcXVlc3RfICYmXG4gICAgICBuZXdXaWR0aCAmJlxuICAgICAgbmV3SGVpZ2h0XG4gICAgKTtcbiAgICBjb25zdCB7aGVpZ2h0LCB3aWR0aH0gPSB0aGlzLmdldERlY2xhcmVkU2xvdFNpemVfKCk7XG4gICAgY29uc3QgcmV0dXJuZWRTaXplRGlmZmVyZW50ID0gbmV3V2lkdGggIT0gd2lkdGggfHwgbmV3SGVpZ2h0ICE9IGhlaWdodDtcbiAgICBjb25zdCBoZWlnaHROb3RJbmNyZWFzZWQgPSBuZXdIZWlnaHQgPD0gaGVpZ2h0O1xuICAgIGlmIChcbiAgICAgIGlzRmx1aWRSZXF1ZXN0QW5kRml4ZWRSZXNwb25zZSB8fFxuICAgICAgKHJldHVybmVkU2l6ZURpZmZlcmVudCAmJiBoZWlnaHROb3RJbmNyZWFzZWQpXG4gICAgKSB7XG4gICAgICB0aGlzLmF0dGVtcHRDaGFuZ2VTaXplKG5ld0hlaWdodCwgbmV3V2lkdGgpLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIGlmIChcbiAgICAgICAgbmV3V2lkdGggPiB3aWR0aCAmJlxuICAgICAgICAvLyBJZiAnZmx1aWQnIHdlcmUgdGhlIHByaW1hcnkgcmVxdWVzdGVkIHNpemUsIGVuc3VyZSB3ZSBkbyBub3QgdHJpZ2dlclxuICAgICAgICAvLyBzbG90IGFkanVzdG1lbnQgaWYgdGhlIHJldHVybmVkIHNpemUgaXMgb25lIG9mIHRoZSByZXF1ZXN0ZWQgbXVsdGktXG4gICAgICAgIC8vIHNpemVzLiBTbG90IGFkanVzdG1lbnQgc2hvdWxkIG9ubHkgYmUgdHJpZ2dlcmVkIHdoZW4gdGhlIGNyZWF0aXZlXG4gICAgICAgIC8vIHNpemUgaXMgbm90IG9uZSBvZiB0aGUgcmVxdWVzdGVkIHNpemVzLlxuICAgICAgICAoIXRoaXMuaXNGbHVpZFByaW1hcnlSZXF1ZXN0XyB8fFxuICAgICAgICAgICh0aGlzLnBhcmFtZXRlclNpemUgJiZcbiAgICAgICAgICAgIHRoaXMucGFyYW1ldGVyU2l6ZS5pbmRleE9mKGAke25ld1dpZHRofXgke25ld0hlaWdodH1gKSA9PSAtMSkpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5hZGp1c3RTbG90UG9zdEV4cGFuc2lvbl8obmV3V2lkdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHRoYXQgc2xvdCBpcyBwcm9wZXJseSBjZW50ZXJlZCBhZnRlciBiZWluZyBleHBhbmRlZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld1dpZHRoIFRoZSBuZXcgd2lkdGggb2YgdGhlIHNsb3QuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhZGp1c3RTbG90UG9zdEV4cGFuc2lvbl8obmV3V2lkdGgpIHtcbiAgICBpZiAoXG4gICAgICAhZGV2QXNzZXJ0KFxuICAgICAgICB0aGlzLmZsZXhpYmxlQWRTbG90RGF0YV8sXG4gICAgICAgICdBdHRlbXB0ZWQgdG8gZXhwYW5kIHNsb3Qgd2l0aG91dCBmbGV4aWJsZSBhZCBzbG90IGRhdGEuJ1xuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7cGFyZW50U3R5bGUsIHBhcmVudFdpZHRofSA9IHRoaXMuZmxleGlibGVBZFNsb3REYXRhXztcbiAgICBjb25zdCBpc1J0bCA9IGlzUlRMKHRoaXMud2luLmRvY3VtZW50KTtcbiAgICBjb25zdCBkaXJTdHIgPSBpc1J0bCA/ICdSaWdodCcgOiAnTGVmdCc7XG4gICAgY29uc3QgLyoqICFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+ICovIHN0eWxlID0gdGhpcy5pblpJbmRleEhvbGRCYWNrX1xuICAgICAgICA/IHsnei1pbmRleCc6ICcxMSd9XG4gICAgICAgIDoge307XG4gICAgLy8gQ29tcHV0ZSBvZmZzZXQgbWFyZ2lucyBpZiB0aGUgc2xvdCBpcyBub3QgY2VudGVyZWQgYnkgZGVmYXVsdC5cbiAgICBpZiAocGFyZW50U3R5bGUudGV4dEFsaWduICE9ICdjZW50ZXInKSB7XG4gICAgICBjb25zdCBnZXRNYXJnaW5TdHIgPSAobWFyZ2luTnVtKSA9PiBgJHtNYXRoLnJvdW5kKG1hcmdpbk51bSl9cHhgO1xuICAgICAgaWYgKG5ld1dpZHRoIDw9IHBhcmVudFdpZHRoKSB7XG4gICAgICAgIC8vIE11c3QgY2VudGVyIGNyZWF0aXZlIHdpdGhpbiBpdHMgcGFyZW50IGNvbnRhaW5lclxuICAgICAgICBjb25zdCBwYXJlbnRQYWRkaW5nID1cbiAgICAgICAgICBwYXJzZUludChwYXJlbnRTdHlsZVtgcGFkZGluZyR7ZGlyU3RyfWBdLCAxMCkgfHwgMDtcbiAgICAgICAgY29uc3QgcGFyZW50Qm9yZGVyID1cbiAgICAgICAgICBwYXJzZUludChwYXJlbnRTdHlsZVtgYm9yZGVyJHtkaXJTdHJ9V2lkdGhgXSwgMTApIHx8IDA7XG4gICAgICAgIGNvbnN0IHdoaXRlc3BhY2UgPVxuICAgICAgICAgICh0aGlzLmZsZXhpYmxlQWRTbG90RGF0YV8ucGFyZW50V2lkdGggLSBuZXdXaWR0aCkgLyAyO1xuICAgICAgICBzdHlsZVtpc1J0bCA/ICdtYXJnaW4tcmlnaHQnIDogJ21hcmdpbi1sZWZ0J10gPSBnZXRNYXJnaW5TdHIoXG4gICAgICAgICAgd2hpdGVzcGFjZSAtIHBhcmVudFBhZGRpbmcgLSBwYXJlbnRCb3JkZXJcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE11c3QgY2VudGVyIGNyZWF0aXZlIHdpdGhpbiB0aGUgdmlld3BvcnRcbiAgICAgICAgY29uc3Qgdmlld3BvcnRXaWR0aCA9IHRoaXMuZ2V0Vmlld3BvcnQoKS5nZXRSZWN0KCkud2lkdGg7XG4gICAgICAgIGNvbnN0IHBhZ2VMYXlvdXRCb3ggPSBnZXRQYWdlTGF5b3V0Qm94QmxvY2tpbmcodGhpcy5lbGVtZW50KTtcbiAgICAgICAgY29uc3Qgd2hpdGVzcGFjZSA9ICh2aWV3cG9ydFdpZHRoIC0gbmV3V2lkdGgpIC8gMjtcbiAgICAgICAgaWYgKGlzUnRsKSB7XG4gICAgICAgICAgc3R5bGVbJ21hcmdpbi1yaWdodCddID0gZ2V0TWFyZ2luU3RyKFxuICAgICAgICAgICAgcGFnZUxheW91dEJveC5yaWdodCArIHdoaXRlc3BhY2UgLSB2aWV3cG9ydFdpZHRoXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZVsnbWFyZ2luLWxlZnQnXSA9IGdldE1hcmdpblN0cihcbiAgICAgICAgICAgIC0ocGFnZUxheW91dEJveC5sZWZ0IC0gd2hpdGVzcGFjZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHNldFN0eWxlcyh0aGlzLmVsZW1lbnQsIGFzc2VydERvZXNOb3RDb250YWluRGlzcGxheShzdHlsZSkpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZW5kWGhyUmVxdWVzdChhZFVybCkge1xuICAgIGlmICghdGhpcy51c2VTcmEpIHtcbiAgICAgIHJldHVybiBzdXBlci5zZW5kWGhyUmVxdWVzdChhZFVybCk7XG4gICAgfVxuICAgIGNvbnN0IGNoZWNrU3RpbGxDdXJyZW50ID0gdGhpcy52ZXJpZnlTdGlsbEN1cnJlbnQoKTtcbiAgICAvLyBJbml0aWF0ZVNyYVJlcXVlc3RzIHJlc29sdmVzIHdoZW4gYWxsIGJsb2NrcyBoYXZlIGhhZCB0aGVpciBTUkFcbiAgICAvLyByZXNwb25zZXMgcmV0dXJuZWQgc3VjaCB0aGF0IHNyYURlZmVycmVkIGJlaW5nIG5vbi1udWxsIGluZGljYXRlcyB0aGlzXG4gICAgLy8gZWxlbWVudCB3YXMgc29tZWhvdyBub3QgaW5jbHVkZWQgc28gcmVwb3J0LlxuICAgIHRoaXMuaW5pdGlhdGVTcmFSZXF1ZXN0cygpLnRoZW4oKCkgPT4ge1xuICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgIGlmICghdGhpcy5zcmFEZWZlcnJlZCkge1xuICAgICAgICBkZXYoKS53YXJuKFRBRywgYFNSQSBmYWlsZWQgdG8gaW5jbHVkZSBlbGVtZW50ICR7dGhpcy5pZmlffWApO1xuICAgICAgICBpZiAoaXNFeHBlcmltZW50T24odGhpcy53aW4sICdkb3VibGVjbGlja1NyYVJlcG9ydEV4Y2x1ZGVkQmxvY2snKSkge1xuICAgICAgICAgIHRoaXMuZ2V0QW1wRG9jKClcbiAgICAgICAgICAgIC5nZXRCb2R5KClcbiAgICAgICAgICAgIC5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgY3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzKFxuICAgICAgICAgICAgICAgIHRoaXMud2luLmRvY3VtZW50LFxuICAgICAgICAgICAgICAgICdhbXAtcGl4ZWwnLFxuICAgICAgICAgICAgICAgIGRpY3Qoe1xuICAgICAgICAgICAgICAgICAgJ3NyYyc6XG4gICAgICAgICAgICAgICAgICAgICdodHRwczovL3BhZ2VhZDIuZ29vZ2xlc3luZGljYXRpb24uY29tL3BhZ2VhZC9nZW5fMjA0PycgK1xuICAgICAgICAgICAgICAgICAgICBgaWQ9JHtlbmNvZGVVUklDb21wb25lbnQoJ2E0YTo6c3JhJyl9JmlmaT0ke3RoaXMuaWZpX31gLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBXYWl0IGZvciBTUkEgcmVxdWVzdCB3aGljaCB3aWxsIGNhbGwgcmVzcG9uc2UgcHJvbWlzZSB3aGVuIHRoaXMgYmxvY2snc1xuICAgIC8vIHJlc3BvbnNlIGhhcyBiZWVuIHJldHVybmVkLiBOdWxsIHJlc3BvbnNlIGluZGljYXRlcyBzaW5nbGUgc2xvdCBzaG91bGRcbiAgICAvLyBleGVjdXRlIHVzaW5nIG5vbi1TUkEgbWV0aG9kLlxuICAgIHJldHVybiB0aGlzLnNyYURlZmVycmVkLnByb21pc2UudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICB0aGlzLnNyYURlZmVycmVkID0gbnVsbDtcbiAgICAgIHJldHVybiByZXNwb25zZSB8fCBzdXBlci5zZW5kWGhyUmVxdWVzdChhZFVybCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGltcHJlc3Npb25zXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHNjcnViUmVmZXJlclxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIGZpcmVEZWxheWVkSW1wcmVzc2lvbnMoaW1wcmVzc2lvbnMsIHNjcnViUmVmZXJlcikge1xuICAgIGlmICghaW1wcmVzc2lvbnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW1wcmVzc2lvbnMuc3BsaXQoJywnKS5mb3JFYWNoKCh1cmwpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghU2VydmljZXMudXJsRm9yRG9jKHRoaXMuZWxlbWVudCkuaXNTZWN1cmUodXJsKSkge1xuICAgICAgICAgIGRldigpLndhcm4oVEFHLCBgaW5zZWN1cmUgaW1wcmVzc2lvbiB1cmw6ICR7dXJsfWApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBDcmVhdGUgYW1wLXBpeGVsIGFuZCBhcHBlbmQgdG8gZG9jdW1lbnQgdG8gc2VuZCBpbXByZXNzaW9uLlxuICAgICAgICB0aGlzLndpbi5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyhcbiAgICAgICAgICAgIHRoaXMud2luLmRvY3VtZW50LFxuICAgICAgICAgICAgJ2FtcC1waXhlbCcsXG4gICAgICAgICAgICBkaWN0KHtcbiAgICAgICAgICAgICAgJ3NyYyc6IHVybCxcbiAgICAgICAgICAgICAgJ3JlZmVycmVycG9saWN5Jzogc2NydWJSZWZlcmVyID8gJ25vLXJlZmVycmVyJyA6ICcnLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9IGNhdGNoICh1bnVzZWRFcnJvcikge31cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXJlcyB0aGUgZmx1aWQgZGVsYXllZCBpbXByZXNzaW9uLCBpZiB0aGUgVVJMIGlzIGF2YWlsYWJsZS5cbiAgICovXG4gIGZpcmVGbHVpZERlbGF5ZWRJbXByZXNzaW9uKCkge1xuICAgIGlmICh0aGlzLmZsdWlkSW1wcmVzc2lvblVybF8pIHtcbiAgICAgIHRoaXMuZmlyZURlbGF5ZWRJbXByZXNzaW9ucyh0aGlzLmZsdWlkSW1wcmVzc2lvblVybF8pO1xuICAgICAgdGhpcy5mbHVpZEltcHJlc3Npb25VcmxfID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR3JvdXBzIHNsb3RzIGJ5IHR5cGUgYW5kIG5ldHdvcmtJZCBmcm9tIGRhdGEtc2xvdCBwYXJhbWV0ZXIuICBFeHBvc2VkIGZvclxuICAgKiBlYXNlIG9mIHRlc3RpbmcuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFPYmplY3Q8c3RyaW5nLCFBcnJheTwhUHJvbWlzZTwhLi4vLi4vLi4vc3JjL2Jhc2UtZWxlbWVudC5CYXNlRWxlbWVudD4+Pj59XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgZ3JvdXBTbG90c0ZvclNyYSgpIHtcbiAgICByZXR1cm4gZ3JvdXBBbXBBZHNCeVR5cGUoXG4gICAgICB0aGlzLmdldEFtcERvYygpLFxuICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLFxuICAgICAgZ2V0TmV0d29ya0lkXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBTUkEgcmVxdWVzdCB2aWEgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICogLSBjcmVhdGUgb25seSBvbmUgZXhlY3V0b3IgcGVyIHBhZ2VcbiAgICogLSBnZXQgYWxsIGRvdWJsZWNsaWNrIGFtcC1hZCBpbnN0YW5jZXMgb24gdGhlIHBhZ2VcbiAgICogLSBncm91cCBieSBuZXR3b3JrSUQgYWxsb3dpbmcgZm9yIHNlcGFyYXRlIFNSQSByZXF1ZXN0c1xuICAgKiAtIGZvciBlYWNoIGdyb3VwaW5nLCBjb25zdHJ1Y3QgU1JBIHJlcXVlc3RcbiAgICogLSBoYW5kbGUgY2h1bmtzIGZvciBzdHJlYW1pbmcgcmVzcG9uc2UgZm9yIGVhY2ggYmxvY2tcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgaW5pdGlhdGVTcmFSZXF1ZXN0cygpIHtcbiAgICAvLyBVc2UgY2FuY2VsbGF0aW9uIG9mIHRoZSBmaXJzdCBzbG90J3MgcHJvbWlzZUlkIGFzIGluZGljYXRpb24gb2ZcbiAgICAvLyB1bmxheW91dENhbGxiYWNrIGV4ZWN1dGlvbi4gIEFzc3VtZSB0aGF0IGlmIGNhbGxlZCBmb3Igb25lIHNsb3QsIGl0IHdpbGxcbiAgICAvLyBiZSBjYWxsZWQgZm9yIGFsbCBhbmQgd2Ugc2hvdWxkIGNhbmNlbCBTUkEgZXhlY3V0aW9uLlxuICAgIGNvbnN0IGNoZWNrU3RpbGxDdXJyZW50ID0gdGhpcy52ZXJpZnlTdGlsbEN1cnJlbnQoKTtcbiAgICBjb25zdCBub0ZhbGxiYWNrRXhwID0gdGhpcy5leHBlcmltZW50SWRzLmluY2x1ZGVzKFxuICAgICAgRE9VQkxFQ0xJQ0tfU1JBX0VYUF9CUkFOQ0hFUy5TUkFfTk9fUkVDT1ZFUlxuICAgICk7XG4gICAgc3JhUmVxdWVzdHMgPVxuICAgICAgc3JhUmVxdWVzdHMgfHxcbiAgICAgIHRoaXMuZ3JvdXBTbG90c0ZvclNyYSgpLnRoZW4oKGdyb3VwSWRUb0Jsb2Nrc0FyeSkgPT4ge1xuICAgICAgICBjaGVja1N0aWxsQ3VycmVudCgpO1xuICAgICAgICBjb25zdCBzcmFSZXF1ZXN0UHJvbWlzZXMgPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMoZ3JvdXBJZFRvQmxvY2tzQXJ5KS5mb3JFYWNoKChuZXR3b3JrSWQpID0+IHtcbiAgICAgICAgICBjb25zdCBibG9ja3MgPSBkZXZBc3NlcnQoZ3JvdXBJZFRvQmxvY2tzQXJ5W25ldHdvcmtJZF0pO1xuICAgICAgICAgIC8vIFRPRE86IGZpbHRlciBibG9ja3Mgd2l0aCBTUkEgZGlzYWJsZWQ/XG4gICAgICAgICAgc3JhUmVxdWVzdFByb21pc2VzLnB1c2goXG4gICAgICAgICAgICBQcm9taXNlLmFsbChibG9ja3MpLnRoZW4oKGluc3RhbmNlcykgPT4ge1xuICAgICAgICAgICAgICBkZXZBc3NlcnQoaW5zdGFuY2VzLmxlbmd0aCk7XG4gICAgICAgICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgICAgICAgIC8vIEV4Y2x1ZGUgYW55IGluc3RhbmNlcyB0aGF0IGRvIG5vdCBoYXZlIGFuIGFkUHJvbWlzZV8gYXMgdGhpc1xuICAgICAgICAgICAgICAvLyBpbmRpY2F0ZXMgdGhleSB3ZXJlIGludmFsaWQuXG4gICAgICAgICAgICAgIGNvbnN0IHR5cGVJbnN0YW5jZXMgPVxuICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7IUFycmF5PCFBbXBBZE5ldHdvcmtEb3VibGVjbGlja0ltcGw+fSovIChcbiAgICAgICAgICAgICAgICAgIGluc3RhbmNlc1xuICAgICAgICAgICAgICAgICkuZmlsdGVyKChpbnN0YW5jZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IGluc3RhbmNlLmhhc0FkUHJvbWlzZSgpO1xuICAgICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRldigpLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgVEFHLFxuICAgICAgICAgICAgICAgICAgICAgICdJZ25vcmluZyBpbnN0YW5jZSB3aXRob3V0IGFkIHByb21pc2UgYXMgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnbGlrZWx5IGludmFsaWQnLFxuICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoIXR5cGVJbnN0YW5jZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gT25seSBjb250YWluZWQgaW52YWxpZCBlbGVtZW50cy5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gSWYgbm90IHdpdGhpbiBubyByZWNvdmVyeSBTUkEgZXhwZXJpbWVudCwgZGV0ZXJtaW5lIGlmIG1vcmVcbiAgICAgICAgICAgICAgLy8gdGhhbiBvbmUgYmxvY2sgZm9yIHRoaXMgZWxlbWVudCwgaWYgbm90IGRvIG5vdCBzZXQgc3JhIHJlcXVlc3RcbiAgICAgICAgICAgICAgLy8gcHJvbWlzZSB3aGljaCByZXN1bHRzIGluIHNlbmRpbmcgYXMgbm9uLVNSQSByZXF1ZXN0IChiZW5lZml0XG4gICAgICAgICAgICAgIC8vIGlzIGl0IGFsbG93cyBkaXJlY3QgY2FjaGUgbWV0aG9kKS5cbiAgICAgICAgICAgICAgaWYgKCFub0ZhbGxiYWNrRXhwICYmIHR5cGVJbnN0YW5jZXMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICBkZXYoKS5pbmZvKFRBRywgYHNpbmdsZSBibG9jayBpbiBuZXR3b3JrICR7bmV0d29ya0lkfWApO1xuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBkZWZlcnJlZCBleGlzdHMsIG1heSBub3QgaWYgZ2V0QWRVcmwgZGlkIG5vdCB5ZXRcbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlLlxuICAgICAgICAgICAgICAgIHR5cGVJbnN0YW5jZXNbMF0uc3JhRGVmZXJyZWQgPVxuICAgICAgICAgICAgICAgICAgdHlwZUluc3RhbmNlc1swXS5zcmFEZWZlcnJlZCB8fCBuZXcgRGVmZXJyZWQoKTtcbiAgICAgICAgICAgICAgICB0eXBlSW5zdGFuY2VzWzBdLnNyYURlZmVycmVkLnJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxldCBzcmFVcmw7XG4gICAgICAgICAgICAgIC8vIENvbnN0cnVjdCBhbmQgc2VuZCBTUkEgcmVxdWVzdC5cbiAgICAgICAgICAgICAgLy8gVE9ETyhrZWl0aHdyaWdodGJvcykgLSBob3cgZG8gd2UgaGFuZGxlIHBlciBzbG90IDIwNCByZXNwb25zZT9cbiAgICAgICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdFNSQVJlcXVlc3RfKHRoaXMsIHR5cGVJbnN0YW5jZXMpXG4gICAgICAgICAgICAgICAgLnRoZW4oKHNyYVVybEluKSA9PiB7XG4gICAgICAgICAgICAgICAgICBjaGVja1N0aWxsQ3VycmVudCgpO1xuICAgICAgICAgICAgICAgICAgc3JhVXJsID0gc3JhVXJsSW47XG4gICAgICAgICAgICAgICAgICByZXR1cm4gU2VydmljZXMueGhyRm9yKHRoaXMud2luKS5mZXRjaChzcmFVcmwsIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNoZWNrU3RpbGxDdXJyZW50KCk7XG4gICAgICAgICAgICAgICAgICAvLyBDaHVuayBoYW5kbGVyIGNhbGxlZCB3aXRoIG1ldGFkYXRhIGFuZCBjcmVhdGl2ZSBmb3IgZWFjaFxuICAgICAgICAgICAgICAgICAgLy8gc2xvdCBpbiBvcmRlciBvZiBVUkxzIGdpdmVuIHdoaWNoIGlzIHRoZW4gcGFzc2VkIHRvXG4gICAgICAgICAgICAgICAgICAvLyByZXNvbHZlciB1c2VkIGZvciBzZW5kWGhyUmVxdWVzdC5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IHNyYVJlcXVlc3RBZFVybFJlc29sdmVycyA9IHR5cGVJbnN0YW5jZXMubWFwKFxuICAgICAgICAgICAgICAgICAgICAoaW5zdGFuY2UpID0+IGluc3RhbmNlLnNyYURlZmVycmVkLnJlc29sdmVcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzbG90Q2FsbGJhY2sgPSBtZXRhSnNvbkNyZWF0aXZlR3JvdXBlcihcbiAgICAgICAgICAgICAgICAgICAgKGNyZWF0aXZlLCBoZWFkZXJzT2JqLCBkb25lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY2hlY2tTdGlsbEN1cnJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICBzcmFCbG9ja0NhbGxiYWNrSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc09iaixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmFSZXF1ZXN0QWRVcmxSZXNvbHZlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmFVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzSW5Ob1NpZ25pbmdFeHAoKVxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICBsaW5lRGVsaW1pdGVkU3RyZWFtZXIodGhpcy53aW4sIHJlc3BvbnNlLCBzbG90Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICAgICAgICAgICAgICB0eXBlSW5zdGFuY2VzLm1hcChcbiAgICAgICAgICAgICAgICAgICAgICAoaW5zdGFuY2UpID0+IGluc3RhbmNlLnNyYURlZmVycmVkLnByb21pc2VcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChpc0NhbmNlbGxhdGlvbihlcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FuY2VsbGF0aW9uIHNob3VsZCBiZSBwcm9wYWdhdGVkIHRvIHNsb3QgcHJvbWlzZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gY2F1c2luZyB0aGVpciBhZFByb21pc2UgY2hhaW5zIHdpdGhpbiBBNEEgdG8gaGFuZGxlXG4gICAgICAgICAgICAgICAgICAgIC8vIGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICAgIHR5cGVJbnN0YW5jZXMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgICAoaW5zdGFuY2UpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zcmFEZWZlcnJlZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Uuc3JhRGVmZXJyZWQucmVqZWN0KGVycm9yKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbm9GYWxsYmFja0V4cCB8fFxuICAgICAgICAgICAgICAgICAgICAhIXRoaXMud2luLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgJ21ldGFbbmFtZT1hbXAtYWQtZG91YmxlY2xpY2stc3JhXSdcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHB1Ymxpc2hlciBoYXMgZXhwbGljaXRseSBlbmFibGVkIFNSQSBtb2RlIChub3RcbiAgICAgICAgICAgICAgICAgICAgLy8gZXhwZXJpbWVudCksIHRoZW4gYXNzdW1lIGVycm9yIGlzIG5ldHdvcmsgZmFpbHVyZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gY29sbGFwc2Ugc2xvdCwgcmVzZXQgdXJsIHRvIGVtcHR5IHN0cmluZyB0byBlbnN1cmVcbiAgICAgICAgICAgICAgICAgICAgLy8gbm8gZmFsbGJhY2sgdG8gZnJhbWUgR0VUIChnaXZlbiBleHBlY3RhdGlvbiBvZiBTUkFcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc2lzdGVuY3kpLCBhbmQgcHJvcGFnYXRlIGVycm9yIHRvIEE0QSBhZCBwcm9taXNlXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoYWluLlxuICAgICAgICAgICAgICAgICAgICBhc3NpZ25BZFVybFRvRXJyb3IoLyoqIEB0eXBlIHshRXJyb3J9ICovIChlcnJvciksIHNyYVVybCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2Fybk9uRXJyb3IoJ1NSQSByZXF1ZXN0IGZhaWx1cmUnLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIC8vIFB1Ymxpc2hlciBleHBsaWNpdGx5IHdhbnRzIFNSQSBzbyBkbyBub3QgYXR0ZW1wdCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyByZWNvdmVyIGFzIFNSQSBndWFyYW50ZWVzIGNhbm5vdCBiZSBlbmZvcmNlZC5cbiAgICAgICAgICAgICAgICAgICAgdHlwZUluc3RhbmNlcy5mb3JFYWNoKChpbnN0YW5jZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGFkIHVybCB0byBlbnN1cmUgbGF5b3V0Q2FsbGJhY2sgZG9lcyBub3RcbiAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxsYmFjayB0byBmcmFtZSBnZXQgd2hpY2ggd291bGQgbG9zZSBTUkFcbiAgICAgICAgICAgICAgICAgICAgICAvLyBndWFyYW50ZWVzLlxuICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnJlc2V0QWRVcmwoKTtcbiAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5hdHRlbXB0Q29sbGFwc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zcmFEZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9wcG9ydHVuaXN0aWMgU1JBIHVzZWQgc28gZmFsbGJhY2sgdG8gaW5kaXZpZHVhbFxuICAgICAgICAgICAgICAgICAgICAvLyBYSFIgcmVxdWVzdHMuXG4gICAgICAgICAgICAgICAgICAgIHR5cGVJbnN0YW5jZXMuZm9yRWFjaCgoaW5zdGFuY2UpID0+XG4gICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Uuc3JhRGVmZXJyZWQucmVzb2x2ZShudWxsKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHNyYVJlcXVlc3RQcm9taXNlcyk7XG4gICAgICB9KTtcbiAgICByZXR1cm4gc3JhUmVxdWVzdHM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAgICogQHBhcmFtIHsqfSBlcnJvclxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIHdhcm5PbkVycm9yKG1lc3NhZ2UsIGVycm9yKSB7XG4gICAgZGV2KCkud2FybihUQUcsIG1lc3NhZ2UsIGVycm9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDMyLWJ5dGUgcmFuZG9tIHN0cmluZy5cbiAgICogVXNlcyB0aGUgd2luLmNyeXB0byB3aGVuIGF2YWlsYWJsZS5cbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgcmFuZG9tIHN0cmluZ1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0UmFuZG9tU3RyaW5nXygpIHtcbiAgICAvLyAxNiBoZXggY2hhcmFjdGVycyAqIDIgYnl0ZXMgcGVyIGNoYXJhY3RlciA9IDMyIGJ5dGVzXG4gICAgY29uc3QgbGVuZ3RoID0gMTY7XG5cbiAgICBjb25zdCByYW5kb21WYWx1ZXMgPSBnZXRDcnlwdG9SYW5kb21CeXRlc0FycmF5KHRoaXMud2luLCBsZW5ndGgpO1xuXG4gICAgbGV0IHJhbmRvbVN1YmRvbWFpbiA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIElmIGNyeXB0byBpc24ndCBhdmFpbGFibGUsIGp1c3QgdXNlIE1hdGgucmFuZG9tLlxuICAgICAgY29uc3QgcmFuZG9tVmFsdWUgPSByYW5kb21WYWx1ZXNcbiAgICAgICAgPyByYW5kb21WYWx1ZXNbaV1cbiAgICAgICAgOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTUpO1xuICAgICAgLy8gRW5zdXJlIGVhY2ggYnl0ZSBpcyByZXByZXNlbnRlZCB3aXRoIHR3byBoZXhhZGVjaW1hbCBjaGFyYWN0ZXJzLlxuICAgICAgaWYgKHJhbmRvbVZhbHVlIDw9IDE1KSB7XG4gICAgICAgIHJhbmRvbVN1YmRvbWFpbiArPSAnMCc7XG4gICAgICB9XG4gICAgICByYW5kb21TdWJkb21haW4gKz0gcmFuZG9tVmFsdWUudG9TdHJpbmcoMTYpO1xuICAgIH1cblxuICAgIHJldHVybiByYW5kb21TdWJkb21haW47XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFByZWNvbm5lY3RVcmxzKCkge1xuICAgIHJldHVybiBbJ2h0dHBzOi8vc2VjdXJlcHViYWRzLmcuZG91YmxlY2xpY2submV0LyddO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXROb25BbXBDcmVhdGl2ZVJlbmRlcmluZ01ldGhvZChoZWFkZXJWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmZvcmNlU2FmZWZyYW1lIHx8IHRoaXMuaXNGbHVpZFJlcXVlc3RfXG4gICAgICA/IFhPUklHSU5fTU9ERS5TQUZFRlJBTUVcbiAgICAgIDogc3VwZXIuZ2V0Tm9uQW1wQ3JlYXRpdmVSZW5kZXJpbmdNZXRob2QoaGVhZGVyVmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGUgdGhhdCBsb2NhdGlvbiBpcyBwYXJzZWQgb25jZSBvbiBmaXJzdCBhY2Nlc3MgYW5kIGNhY2hlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtZXRlck5hbWVcbiAgICogQHJldHVybiB7c3RyaW5nfHVuZGVmaW5lZH0gcGFyYW1ldGVyIHZhbHVlIGZyb20gd2luZG93LmxvY2F0aW9uLnNlYXJjaFxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIGdldExvY2F0aW9uUXVlcnlQYXJhbWV0ZXJWYWx1ZShwYXJhbWV0ZXJOYW1lKSB7XG4gICAgd2luZG93TG9jYXRpb25RdWVyeVBhcmFtZXRlcnMgPVxuICAgICAgd2luZG93TG9jYXRpb25RdWVyeVBhcmFtZXRlcnMgfHxcbiAgICAgIHBhcnNlUXVlcnlTdHJpbmcoKHRoaXMud2luLmxvY2F0aW9uICYmIHRoaXMud2luLmxvY2F0aW9uLnNlYXJjaCkgfHwgJycpO1xuICAgIHJldHVybiB3aW5kb3dMb2NhdGlvblF1ZXJ5UGFyYW1ldGVyc1twYXJhbWV0ZXJOYW1lXTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0QWRkaXRpb25hbENvbnRleHRNZXRhZGF0YShpc1NhZmVGcmFtZSA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmlzRmx1aWRSZXF1ZXN0XyAmJiAhaXNTYWZlRnJhbWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY3JlYXRpdmVTaXplID0gdGhpcy5nZXRDcmVhdGl2ZVNpemUoKTtcbiAgICBkZXZBc3NlcnQoY3JlYXRpdmVTaXplLCAndGhpcy5nZXRDcmVhdGl2ZVNpemUgcmV0dXJuZWQgbnVsbCcpO1xuICAgIGlmICh0aGlzLmlzUmVmcmVzaGluZykge1xuICAgICAgaWYgKHRoaXMuc2FmZWZyYW1lQXBpXykge1xuICAgICAgICB0aGlzLnNhZmVmcmFtZUFwaV8uZGVzdHJveSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5zYWZlZnJhbWVBcGlfID0gbmV3IFNhZmVmcmFtZUhvc3RBcGkoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIHRoaXMuaXNGbHVpZFJlcXVlc3RfLFxuICAgICAgICAvKiogQHR5cGUge3toZWlnaHQsIHdpZHRofX0gKi8gKGNyZWF0aXZlU2l6ZSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2FmZWZyYW1lQXBpXyA9XG4gICAgICAgIHRoaXMuc2FmZWZyYW1lQXBpXyB8fFxuICAgICAgICBuZXcgU2FmZWZyYW1lSG9zdEFwaShcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHRoaXMuaXNGbHVpZFJlcXVlc3RfLFxuICAgICAgICAgIC8qKiBAdHlwZSB7e2hlaWdodCwgd2lkdGh9fSAqLyAoY3JlYXRpdmVTaXplKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNhZmVmcmFtZUFwaV8uZ2V0U2FmZWZyYW1lTmFtZUF0dHIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBhIHBvc3RNZXNzYWdlIGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBzbG90IHRvIHRoZSBERlBcbiAgICogVHJvdWJsZXNob290IFVJLiBBIHByb21pc2UgaXMgcmV0dXJuZWQgaWYgYSBtZXNzYWdlIGlzIHBvc3RlZCwgb3RoZXJ3aXNlXG4gICAqIG51bGwgaXMgcmV0dXJuZWQuIFRoZSBwcm9taXNlIGlzIHJldHVybmVkIG9ubHkgZm9yIHRlc3QgY29udmVuaWVuY2UuXG4gICAqXG4gICAqIEByZXR1cm4gez9Qcm9taXNlfVxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIHBvc3RUcm91Ymxlc2hvb3RNZXNzYWdlKCkge1xuICAgIGlmICghdGhpcy53aW4ub3BlbmVyIHx8ICEvWz98Jl1kZnBkZWIvLnRlc3QodGhpcy53aW4ubG9jYXRpb24uc2VhcmNoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldkFzc2VydCh0aGlzLnRyb3VibGVzaG9vdERhdGFfLmFkVXJsLCAnYWQgVVJMIGRvZXMgbm90IGV4aXN0IHlldCcpO1xuICAgIHJldHVybiB0aGlzLnRyb3VibGVzaG9vdERhdGFfLmFkVXJsLnRoZW4oKGFkVXJsKSA9PiB7XG4gICAgICBjb25zdCBzbG90SWQgPVxuICAgICAgICB0aGlzLnRyb3VibGVzaG9vdERhdGFfLnNsb3RJZCArICdfJyArIHRoaXMudHJvdWJsZXNob290RGF0YV8uc2xvdEluZGV4O1xuICAgICAgY29uc3QgcGF5bG9hZCA9IGRpY3Qoe1xuICAgICAgICAnZ3V0RGF0YSc6IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgIGRpY3Qoe1xuICAgICAgICAgICAgJ2V2ZW50cyc6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICd0aW1lc3RhbXAnOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICdzbG90aWQnOiBzbG90SWQsXG4gICAgICAgICAgICAgICAgJ21lc3NhZ2VJZCc6IDQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Nsb3RzJzogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJ2NvbnRlbnRVcmwnOiBhZFVybCB8fCAnJyxcbiAgICAgICAgICAgICAgICAnaWQnOiBzbG90SWQsXG4gICAgICAgICAgICAgICAgJ2xlYWZBZFVuaXROYW1lJzogdGhpcy50cm91Ymxlc2hvb3REYXRhXy5zbG90SWQsXG4gICAgICAgICAgICAgICAgJ2RvbUlkJzogc2xvdElkLFxuICAgICAgICAgICAgICAgICdsaW5lSXRlbUlkJzogdGhpcy50cm91Ymxlc2hvb3REYXRhXy5saW5lSXRlbUlkLFxuICAgICAgICAgICAgICAgICdjcmVhdGl2ZUlkJzogdGhpcy50cm91Ymxlc2hvb3REYXRhXy5jcmVhdGl2ZUlkLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KVxuICAgICAgICApLFxuICAgICAgICAndXNlckFnZW50JzogbmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgJ3JlZmVycmVyJzogdGhpcy53aW4ubG9jYXRpb24uaHJlZixcbiAgICAgICAgJ21lc3NhZ2VUeXBlJzogJ0xPQUQnLFxuICAgICAgfSk7XG4gICAgICB0aGlzLndpbi5vcGVuZXIuLypPSyovIHBvc3RNZXNzYWdlKHBheWxvYWQsICcqJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcGFnZXZpZXcgc3RhdGUgdG9rZW4gYXNzb2NpYXRlZCB3aXRoIHRoZSBzbG90LiBUb2tlbiBkb2VzIG5vdFxuICAgKiBleHBpcmUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlblxuICAgKi9cbiAgc2V0UGFnZXZpZXdTdGF0ZVRva2VuKHRva2VuKSB7XG4gICAgdG9rZW5zVG9JbnN0YW5jZXNbdG9rZW5dID0gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgZm9yIHRoZSBwcmVzZW5jZSBvZiBhIHBhZ2V2aWV3IHRva2VuIGluIHRoZSBtb2R1bGUgbGV2ZWwgb2JqZWN0XG4gICAqIGFuZCByZW1vdmVzIGl0IGlmIHByZXNlbnQuXG4gICAqL1xuICByZW1vdmVQYWdldmlld1N0YXRlVG9rZW4oKSB7XG4gICAgZm9yIChjb25zdCB0b2tlbiBpbiB0b2tlbnNUb0luc3RhbmNlcykge1xuICAgICAgaWYgKHRva2Vuc1RvSW5zdGFuY2VzW3Rva2VuXSA9PSB0aGlzKSB7XG4gICAgICAgIGRlbGV0ZSB0b2tlbnNUb0luc3RhbmNlc1t0b2tlbl07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0QTRhQW5hbHl0aWNzVmFycyhhbmFseXRpY3NUcmlnZ2VyKSB7XG4gICAgcmV0dXJuIGdldENzaUFtcEFuYWx5dGljc1ZhcmlhYmxlcyhhbmFseXRpY3NUcmlnZ2VyLCB0aGlzLCB0aGlzLnFxaWRfKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0QTRhQW5hbHl0aWNzQ29uZmlnKCkge1xuICAgIHJldHVybiBnZXRDc2lBbXBBbmFseXRpY3NDb25maWcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmICdmbHVpZCcgaXMgb25lIG9mIHRoZSByZXF1ZXN0ZWQgc2l6ZXMsIGZhbHNlXG4gICAqIG90aGVyd2lzZS5cbiAgICovXG4gIGlzRmx1aWRSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmlzRmx1aWRSZXF1ZXN0XztcbiAgfVxufVxuXG5BTVAuZXh0ZW5zaW9uKFRBRywgJzAuMScsIChBTVApID0+IHtcbiAgQU1QLnJlZ2lzdGVyRWxlbWVudChUQUcsIEFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbCk7XG59KTtcblxuLyoqIEB2aXNpYmxlRm9yVGVzdGluZyAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0U3JhU3RhdGVGb3JUZXN0aW5nKCkge1xuICBzcmFSZXF1ZXN0cyA9IG51bGw7XG59XG5cbi8qKiBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldExvY2F0aW9uUXVlcnlQYXJhbWV0ZXJzRm9yVGVzdGluZygpIHtcbiAgd2luZG93TG9jYXRpb25RdWVyeVBhcmFtZXRlcnMgPSBudWxsO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge3N0cmluZ30gbmV0d29ya0lkIGZyb20gZGF0YS1hZC1zbG90IGF0dHJpYnV0ZS5cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmV0d29ya0lkKGVsZW1lbnQpIHtcbiAgY29uc3QgbmV0d29ya0lkID0gL14oPzpcXC8pPyhcXGQrKS8uZXhlYyhcbiAgICBkZXYoKS5hc3NlcnRTdHJpbmcoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2xvdCcpKVxuICApO1xuICAvLyBUT0RPOiBndWFyYW50ZWUgZGF0YS1hZC1zbG90IGZvcm1hdCBhcyBwYXJ0IG9mIGlzVmFsaWRFbGVtZW50P1xuICByZXR1cm4gbmV0d29ya0lkID8gbmV0d29ya0lkWzFdIDogJyc7XG59XG5cbi8qKlxuICogQHBhcmFtIHshLi4vLi4vLi4vZXh0ZW5zaW9ucy9hbXAtYTRhLzAuMS9hbXAtYTRhLkFtcEE0QX0gYTRhXG4gKiBAcGFyYW0geyFBcnJheTwhQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsPn0gaW5zdGFuY2VzXG4gKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fSBTUkEgcmVxdWVzdCBVUkxcbiAqL1xuZnVuY3Rpb24gY29uc3RydWN0U1JBUmVxdWVzdF8oYTRhLCBpbnN0YW5jZXMpIHtcbiAgLy8gVE9ETyhicmFkZnJpenplbGwpOiBOZWVkIHRvIGFkZCBzdXBwb3J0IGZvciBSVEMuXG4gIGRldkFzc2VydChpbnN0YW5jZXMgJiYgaW5zdGFuY2VzLmxlbmd0aCk7XG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gIHJldHVybiBQcm9taXNlLmFsbChcbiAgICBpbnN0YW5jZXMubWFwKChpbnN0YW5jZSkgPT4gaW5zdGFuY2UuZ2V0QWRVcmxEZWZlcnJlZC5wcm9taXNlKVxuICApXG4gICAgLnRoZW4oKCkgPT4gZ29vZ2xlUGFnZVBhcmFtZXRlcnMoYTRhLCBzdGFydFRpbWUpKVxuICAgIC50aGVuKChnb29nUGFnZUxldmVsUGFyYW1ldGVycykgPT4ge1xuICAgICAgY29uc3QgYmxvY2tQYXJhbWV0ZXJzID0gY29uc3RydWN0U1JBQmxvY2tQYXJhbWV0ZXJzKGluc3RhbmNlcyk7XG4gICAgICByZXR1cm4gdHJ1bmNBbmRUaW1lVXJsKFxuICAgICAgICBET1VCTEVDTElDS19CQVNFX1VSTCxcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICBibG9ja1BhcmFtZXRlcnMsXG4gICAgICAgICAgZ29vZ1BhZ2VMZXZlbFBhcmFtZXRlcnMsXG4gICAgICAgICAgaW5zdGFuY2VzWzBdLmdldFBhZ2VQYXJhbWV0ZXJzKGluc3RhbmNlc1swXS5jb25zZW50VHVwbGUsIGluc3RhbmNlcylcbiAgICAgICAgKSxcbiAgICAgICAgc3RhcnRUaW1lXG4gICAgICApO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBhZ2V2aWV3IHRva2VucyB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbiB0aGUgYWQgcmVxdWVzdC4gVG9rZW5zXG4gKiBzaG91bGQgY29tZSBvbmx5IGZyb20gaW5zdGFuY2VzIHRoYXQgYXJlIG5vdCBiZWluZyByZXF1ZXN0ZWQgaW4gdGhpcyByZXF1ZXN0LlxuICogQHBhcmFtIHshQXJyYXk8IUFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbD59IGluc3RhbmNlc0luQWRSZXF1ZXN0XG4gKiBAcmV0dXJuIHshQXJyYXk8c3RyaW5nPn0gQXJyYXkgb2YgcGFnZXZpZXcgdG9rZW5zIHRvIGluY2x1ZGUgaW4gdGhlIGFkXG4gKiByZXF1ZXN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFnZXZpZXdTdGF0ZVRva2Vuc0ZvckFkUmVxdWVzdChpbnN0YW5jZXNJbkFkUmVxdWVzdCkge1xuICBjb25zdCBwYWdldmlld1N0YXRlVG9rZW5zSW5BZFJlcXVlc3QgPSBbXTtcbiAgZm9yIChjb25zdCB0b2tlbiBpbiB0b2tlbnNUb0luc3RhbmNlcykge1xuICAgIGlmICghaW5zdGFuY2VzSW5BZFJlcXVlc3QuaW5jbHVkZXModG9rZW5zVG9JbnN0YW5jZXNbdG9rZW5dKSkge1xuICAgICAgcGFnZXZpZXdTdGF0ZVRva2Vuc0luQWRSZXF1ZXN0LnB1c2godG9rZW4pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFnZXZpZXdTdGF0ZVRva2Vuc0luQWRSZXF1ZXN0O1xufVxuXG4vKipcbiAqIFJlc2V0cyB0aGUgdG9rZW5zVG9JbnN0YW5jZXMgbWFwcGluZyBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRUb2tlbnNUb0luc3RhbmNlc01hcCgpIHtcbiAgdG9rZW5zVG9JbnN0YW5jZXMgPSB7fTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl.js