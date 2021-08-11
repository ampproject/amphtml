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
import { ADSENSE_MCRSPV_TAG, getMatchedContentResponsiveHeightAndUpdatePubParams } from "../../../ads/google/utils";
import { ADS_INITIAL_INTERSECTION_EXP } from "../../../src/experiments/ads-initial-intersection-exp";
import { AmpAdUIHandler } from "./amp-ad-ui";
import { AmpAdXOriginIframeHandler } from "./amp-ad-xorigin-iframe-handler";
import { CONSENT_POLICY_STATE // eslint-disable-line no-unused-vars
} from "../../../src/core/constants/consent-state";
import { Layout // eslint-disable-line no-unused-vars
, LayoutPriority, isLayoutSizeDefined } from "../../../src/core/dom/layout";
import { Services } from "../../../src/service";
import { adConfig } from "../../../ads/_config";
import { clamp } from "../../../src/core/math";
import { computedStyle, setStyle } from "../../../src/core/dom/style";
import { dev, devAssert, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { getAdCid } from "../../../src/ad-cid";
import { getAdContainer, isAdPositionAllowed } from "../../../src/ad-helper";
import { getAmpAdRenderOutsideViewport, incrementLoadingAds, is3pThrottled } from "./concurrent-load";
import { getConsentMetadata, getConsentPolicyInfo, getConsentPolicySharedData, getConsentPolicyState } from "../../../src/consent";
import { getExperimentBranch } from "../../../src/experiments";
import { getIframe, preloadBootstrap } from "../../../src/3p-frame";
import { intersectionEntryToJson, measureIntersection } from "../../../src/core/dom/layout/intersection";
import { moveLayoutRect } from "../../../src/core/dom/layout/rect";
import { observeWithSharedInOb, unobserveWithSharedInOb } from "../../../src/core/dom/layout/viewport-observer";
import { toWin } from "../../../src/core/window";

/** @const {string} Tag name for 3P AD implementation. */
export var TAG_3P_IMPL = 'amp-ad-3p-impl';

/** @const {number} */
var MIN_FULL_WIDTH_HEIGHT = 100;

/** @const {number} */
var MAX_FULL_WIDTH_HEIGHT = 500;
export var AmpAd3PImpl = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpAd3PImpl, _AMP$BaseElement);

  var _super = _createSuper(AmpAd3PImpl);

  /**
   * @param {!AmpElement} element
   */
  function AmpAd3PImpl(element) {
    var _this;

    _classCallCheck(this, AmpAd3PImpl);

    _this = _super.call(this, element);

    /**
     * @private {?Element}
     * @visibleForTesting
     */
    _this.iframe_ = null;

    /** @type {?Object} */
    _this.config = null;

    /** @type {?AmpAdUIHandler} */
    _this.uiHandler = null;

    /** @private {?AmpAdXOriginIframeHandler} */
    _this.xOriginIframeHandler_ = null;

    /**
     * @private {?Element}
     * @visibleForTesting
     */
    _this.placeholder_ = null;

    /**
     * @private {?Element}
     * @visibleForTesting
     */
    _this.fallback_ = null;

    /** @private {boolean} */
    _this.isInFixedContainer_ = false;

    /**
     * The (relative) layout box of the ad iframe to the amp-ad tag.
     * @private {?../../../src/layout-rect.LayoutRectDef}
     */
    _this.iframeLayoutBox_ = null;

    /**
     * Call to stop listening to viewport changes.
     * @private {?function()}
     * @visibleForTesting
     */
    _this.unlistenViewportChanges_ = null;

    /** @private {Array<Function>} */
    _this.unlisteners_ = [];

    /**
     * @private {IntersectionObserver}
     * @visibleForTesting
     */
    _this.intersectionObserver_ = null;

    /** @private {?string|undefined} */
    _this.container_ = undefined;

    /** @private {?Promise} */
    _this.layoutPromise_ = null;

    /** @private {string|undefined} */
    _this.type_ = undefined;

    /**
     * For full-width responsive ads: whether the element has already been
     * aligned to the edges of the viewport.
     * @private {boolean}
     */
    _this.isFullWidthAligned_ = false;

    /**
     * Whether full-width responsive was requested for this ad.
     * @private {boolean}
     */
    _this.isFullWidthRequested_ = false;

    /** @private {Promise<!IntersectionObserverEntry>} */
    _this.initialIntersectionPromise_ = null;
    return _this;
  }

  /** @override */
  _createClass(AmpAd3PImpl, [{
    key: "getLayoutPriority",
    value: function getLayoutPriority() {
      // Loads ads after other content,
      var isPWA = !this.element.getAmpDoc().isSingleDoc();
      // give the ad higher priority if it is inside a PWA
      return isPWA ? LayoutPriority.METADATA : LayoutPriority.ADS;
    }
    /** @override */

  }, {
    key: "renderOutsideViewport",
    value: function renderOutsideViewport() {
      if (is3pThrottled(this.win)) {
        return false;
      }

      // Otherwise the ad is good to go.
      var elementCheck = getAmpAdRenderOutsideViewport(this.element);
      return elementCheck !== null ? elementCheck : _get(_getPrototypeOf(AmpAd3PImpl.prototype), "renderOutsideViewport", this).call(this);
    }
    /**
     * @param {!Layout} layout
     * @override
     */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
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
    /** @override */

  }, {
    key: "getConsentPolicy",
    value: function getConsentPolicy() {
      var type = this.element.getAttribute('type');
      var config = adConfig[type];

      if (config && config['consentHandlingOverride']) {
        return null;
      }

      return _get(_getPrototypeOf(AmpAd3PImpl.prototype), "getConsentPolicy", this).call(this);
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      this.type_ = this.element.getAttribute('type');
      var upgradeDelayMs = Math.round(this.getResource().getUpgradeDelayMs());
      dev().info(TAG_3P_IMPL, "upgradeDelay " + this.type_ + ": " + upgradeDelayMs);
      this.placeholder_ = this.getPlaceholder();
      this.fallback_ = this.getFallback();
      this.config = adConfig[this.type_];
      userAssert(this.config, "Type \"" + this.type_ + "\" is not supported in amp-ad");
      this.uiHandler = new AmpAdUIHandler(this);
      this.uiHandler.validateStickyAd();
      this.isFullWidthRequested_ = this.shouldRequestFullWidth_();

      if (this.isFullWidthRequested_) {
        return this.attemptFullWidthSizeChange_();
      }

      var asyncIntersection = getExperimentBranch(this.win, ADS_INITIAL_INTERSECTION_EXP.id) === ADS_INITIAL_INTERSECTION_EXP.experiment;
      this.initialIntersectionPromise_ = asyncIntersection ? measureIntersection(this.element) : Promise.resolve(this.element.getIntersectionChangeEntry());
    }
    /**
     * @return {boolean}
     * @private
     */

  }, {
    key: "shouldRequestFullWidth_",
    value: function shouldRequestFullWidth_() {
      var hasFullWidth = this.element.hasAttribute('data-full-width');

      if (!hasFullWidth) {
        return false;
      }

      userAssert(this.element.getAttribute('width') == '100vw', 'Ad units with data-full-width must have width="100vw".');
      userAssert(!!this.config.fullWidthHeightRatio, 'Ad network does not support full width ads.');
      dev().info(TAG_3P_IMPL, '#${this.getResource().getId()} Full width requested');
      return true;
    }
    /**
     * Prefetches and preconnects URLs related to the ad.
     * @param {boolean=} opt_onLayout
     * @override
     */

  }, {
    key: "preconnectCallback",
    value: function preconnectCallback(opt_onLayout) {
      var _this2 = this;

      var preconnect = Services.preconnectFor(this.win);
      // We always need the bootstrap.
      preloadBootstrap(this.win, this.type_, this.getAmpDoc(), preconnect);

      if (typeof this.config.prefetch == 'string') {
        preconnect.preload(this.getAmpDoc(), this.config.prefetch, 'script');
      } else if (this.config.prefetch) {
        /** @type {!Array} */
        this.config.prefetch.forEach(function (p) {
          preconnect.preload(_this2.getAmpDoc(), p, 'script');
        });
      }

      if (typeof this.config.preconnect == 'string') {
        preconnect.url(this.getAmpDoc(), this.config.preconnect, opt_onLayout);
      } else if (this.config.preconnect) {
        /** @type {!Array} */
        this.config.preconnect.forEach(function (p) {
          preconnect.url(_this2.getAmpDoc(), p, opt_onLayout);
        });
      }

      // If fully qualified src for ad script is specified we preconnect to it.
      var src = this.element.getAttribute('src');

      if (src) {
        // We only preconnect to the src because we cannot know whether the URL
        // will have caching headers set.
        preconnect.url(this.getAmpDoc(), src);
      }
    }
    /**
     * @override
     */

  }, {
    key: "onLayoutMeasure",
    value: function onLayoutMeasure() {
      var _this3 = this;

      this.isInFixedContainer_ = !isAdPositionAllowed(this.element, this.win);

      /** detect ad containers, add the list to element as a new attribute */
      if (this.container_ === undefined) {
        this.container_ = getAdContainer(this.element);
      }

      // We remeasured this tag, let's also remeasure the iframe. Should be
      // free now and it might have changed.
      this.measureIframeLayoutBox_();

      if (this.xOriginIframeHandler_) {
        this.xOriginIframeHandler_.onLayoutMeasure();
      }

      if (this.isFullWidthRequested_ && !this.isFullWidthAligned_) {
        this.isFullWidthAligned_ = true;
        var layoutBox = this.getLayoutBox();
        // Nudge into the correct horizontal position by changing side margin.
        this.getVsync().run({
          measure: function measure(state) {
            state.direction = computedStyle(_this3.win, _this3.element)['direction'];
          },
          mutate: function mutate(state) {
            if (state.direction == 'rtl') {
              setStyle(_this3.element, 'marginRight', layoutBox.left, 'px');
            } else {
              setStyle(_this3.element, 'marginLeft', -layoutBox.left, 'px');
            }
          }
        }, {
          direction: ''
        });
      }
    }
    /**
     * Measure the layout box of the iframe if we rendered it already.
     * @private
     */

  }, {
    key: "measureIframeLayoutBox_",
    value: function measureIframeLayoutBox_() {
      if (this.xOriginIframeHandler_ && this.xOriginIframeHandler_.iframe) {
        var iframeBox = this.getViewport().getLayoutRect(this.xOriginIframeHandler_.iframe);
        var box = this.getLayoutBox();
        // Cache the iframe's relative position to the amp-ad. This is
        // necessary for fixed-position containers which "move" with the
        // viewport.
        this.iframeLayoutBox_ = moveLayoutRect(iframeBox, -box.left, -box.top);
      }
    }
    /**
     * @override
     */

  }, {
    key: "getIntersectionElementLayoutBox",
    value: function getIntersectionElementLayoutBox() {
      if (!this.xOriginIframeHandler_ || !this.xOriginIframeHandler_.iframe) {
        return _get(_getPrototypeOf(AmpAd3PImpl.prototype), "getIntersectionElementLayoutBox", this).call(this);
      }

      var box = this.getLayoutBox();

      if (!this.iframeLayoutBox_) {
        this.measureIframeLayoutBox_();
      }

      var iframe =
      /** @type {!../../../src/layout-rect.LayoutRectDef} */
      devAssert(this.iframeLayoutBox_);
      return moveLayoutRect(iframe, box.left, box.top);
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this4 = this;

      if (this.layoutPromise_) {
        return this.layoutPromise_;
      }

      userAssert(!this.isInFixedContainer_ || this.uiHandler.isStickyAd(), '<amp-ad> is not allowed to be placed in elements with ' + 'position:fixed: %s unless it has sticky attribute', this.element);
      var consentPromise = this.getConsentState();

      var consentPolicyId = _get(_getPrototypeOf(AmpAd3PImpl.prototype), "getConsentPolicy", this).call(this);

      var consentStringPromise = consentPolicyId ? getConsentPolicyInfo(this.element, consentPolicyId) : Promise.resolve(null);
      var consentMetadataPromise = consentPolicyId ? getConsentMetadata(this.element, consentPolicyId) : Promise.resolve(null);
      var sharedDataPromise = consentPolicyId ? getConsentPolicySharedData(this.element, consentPolicyId) : Promise.resolve(null);
      var pageViewId64Promise = Services.documentInfoForDoc(this.element).pageViewId64;
      // For sticky ad only: must wait for scrolling event before loading the ad
      var scrollPromise = this.uiHandler.getScrollPromiseForStickyAd();
      this.layoutPromise_ = Promise.all([getAdCid(this), consentPromise, sharedDataPromise, consentStringPromise, consentMetadataPromise, scrollPromise, pageViewId64Promise]).then(function (consents) {
        _this4.uiHandler.maybeInitStickyAd();

        // Use JsonObject to preserve field names so that ampContext can access
        // values with name
        // ampcontext.js and this file are compiled in different compilation unit
        // Note: Field names can by perserved by using JsonObject, or by adding
        // perserved name to extern. We are doing both right now.
        // Please also add new introduced variable
        // name to the extern list.
        var opt_context = dict({
          'clientId': consents[0] || null,
          'container': _this4.container_,
          'initialConsentState': consents[1],
          'consentSharedData': consents[2],
          'initialConsentValue': consents[3],
          'initialConsentMetadata': consents[4],
          'pageViewId64': consents[6]
        });
        // In this path, the request and render start events are entangled,
        // because both happen inside a cross-domain iframe.  Separating them
        // here, though, allows us to measure the impact of ad throttling via
        // incrementLoadingAds().
        return _this4.initialIntersectionPromise_.then(function (intersection) {
          var iframe = getIframe(toWin(_this4.element.ownerDocument.defaultView), _this4.element, _this4.type_, opt_context, {
            initialIntersection: intersectionEntryToJson(intersection)
          });
          iframe.title = _this4.element.title || 'Advertisement';
          _this4.xOriginIframeHandler_ = new AmpAdXOriginIframeHandler(_this4);
          return _this4.xOriginIframeHandler_.init(iframe);
        });
      }).then(function () {
        observeWithSharedInOb(_this4.element, function (inViewport) {
          return _this4.viewportCallback_(inViewport);
        });
      });
      incrementLoadingAds(this.win, this.layoutPromise_);
      return this.layoutPromise_;
    }
    /**
     * @param {boolean} inViewport
     * @private
     */

  }, {
    key: "viewportCallback_",
    value: function viewportCallback_(inViewport) {
      if (this.xOriginIframeHandler_) {
        this.xOriginIframeHandler_.viewportCallback(inViewport);
      }
    }
    /** @override */

  }, {
    key: "unlayoutOnPause",
    value: function unlayoutOnPause() {
      return true;
    }
    /** @override  */

  }, {
    key: "unlayoutCallback",
    value: function unlayoutCallback() {
      this.unlisteners_.forEach(function (unlisten) {
        return unlisten();
      });
      this.unlisteners_.length = 0;
      unobserveWithSharedInOb(this.element);
      this.layoutPromise_ = null;
      this.uiHandler.applyUnlayoutUI();

      if (this.xOriginIframeHandler_) {
        this.xOriginIframeHandler_.freeXOriginIframe();
        this.xOriginIframeHandler_ = null;
      }

      if (this.uiHandler) {
        this.uiHandler.cleanup();
      }

      return true;
    }
    /**
     * @return {!Promise<?CONSENT_POLICY_STATE>}
     */

  }, {
    key: "getConsentState",
    value: function getConsentState() {
      var consentPolicyId = _get(_getPrototypeOf(AmpAd3PImpl.prototype), "getConsentPolicy", this).call(this);

      return consentPolicyId ? getConsentPolicyState(this.element, consentPolicyId) : Promise.resolve(null);
    }
    /**
     * Calculates and attempts to set the appropriate height & width for a
     * responsive full width ad unit.
     * @return {!Promise}
     * @private
     */

  }, {
    key: "attemptFullWidthSizeChange_",
    value: function attemptFullWidthSizeChange_() {
      var viewportSize = this.getViewport().getSize();
      var maxHeight = Math.min(MAX_FULL_WIDTH_HEIGHT, viewportSize.height);
      var width = viewportSize.width;
      var height = this.getFullWidthHeight_(width, maxHeight);
      // Attempt to resize to the correct height. The width should already be
      // 100vw, but is fixed here so that future resizes of the viewport don't
      // affect it.
      return this.attemptChangeSize(height, width).then(function () {
        dev().info(TAG_3P_IMPL, "Size change accepted: " + width + "x" + height);
      }, function () {
        dev().info(TAG_3P_IMPL, "Size change rejected: " + width + "x" + height);
      });
    }
    /**
     * Calculates the appropriate width for a responsive full width ad unit.
     * @param {number} width
     * @param {number} maxHeight
     * @return {number}
     * @private
     */

  }, {
    key: "getFullWidthHeight_",
    value: function getFullWidthHeight_(width, maxHeight) {
      // TODO(google a4a eng): remove this once adsense switches fully to
      // fast fetch.
      if (this.element.getAttribute('data-auto-format') === ADSENSE_MCRSPV_TAG) {
        return getMatchedContentResponsiveHeightAndUpdatePubParams(width, this.element);
      }

      return clamp(Math.round(width / this.config.fullWidthHeightRatio), MIN_FULL_WIDTH_HEIGHT, maxHeight);
    }
  }]);

  return AmpAd3PImpl;
}(AMP.BaseElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hZC0zcC1pbXBsLmpzIl0sIm5hbWVzIjpbIkFEU0VOU0VfTUNSU1BWX1RBRyIsImdldE1hdGNoZWRDb250ZW50UmVzcG9uc2l2ZUhlaWdodEFuZFVwZGF0ZVB1YlBhcmFtcyIsIkFEU19JTklUSUFMX0lOVEVSU0VDVElPTl9FWFAiLCJBbXBBZFVJSGFuZGxlciIsIkFtcEFkWE9yaWdpbklmcmFtZUhhbmRsZXIiLCJDT05TRU5UX1BPTElDWV9TVEFURSIsIkxheW91dCIsIkxheW91dFByaW9yaXR5IiwiaXNMYXlvdXRTaXplRGVmaW5lZCIsIlNlcnZpY2VzIiwiYWRDb25maWciLCJjbGFtcCIsImNvbXB1dGVkU3R5bGUiLCJzZXRTdHlsZSIsImRldiIsImRldkFzc2VydCIsInVzZXJBc3NlcnQiLCJkaWN0IiwiZ2V0QWRDaWQiLCJnZXRBZENvbnRhaW5lciIsImlzQWRQb3NpdGlvbkFsbG93ZWQiLCJnZXRBbXBBZFJlbmRlck91dHNpZGVWaWV3cG9ydCIsImluY3JlbWVudExvYWRpbmdBZHMiLCJpczNwVGhyb3R0bGVkIiwiZ2V0Q29uc2VudE1ldGFkYXRhIiwiZ2V0Q29uc2VudFBvbGljeUluZm8iLCJnZXRDb25zZW50UG9saWN5U2hhcmVkRGF0YSIsImdldENvbnNlbnRQb2xpY3lTdGF0ZSIsImdldEV4cGVyaW1lbnRCcmFuY2giLCJnZXRJZnJhbWUiLCJwcmVsb2FkQm9vdHN0cmFwIiwiaW50ZXJzZWN0aW9uRW50cnlUb0pzb24iLCJtZWFzdXJlSW50ZXJzZWN0aW9uIiwibW92ZUxheW91dFJlY3QiLCJvYnNlcnZlV2l0aFNoYXJlZEluT2IiLCJ1bm9ic2VydmVXaXRoU2hhcmVkSW5PYiIsInRvV2luIiwiVEFHXzNQX0lNUEwiLCJNSU5fRlVMTF9XSURUSF9IRUlHSFQiLCJNQVhfRlVMTF9XSURUSF9IRUlHSFQiLCJBbXBBZDNQSW1wbCIsImVsZW1lbnQiLCJpZnJhbWVfIiwiY29uZmlnIiwidWlIYW5kbGVyIiwieE9yaWdpbklmcmFtZUhhbmRsZXJfIiwicGxhY2Vob2xkZXJfIiwiZmFsbGJhY2tfIiwiaXNJbkZpeGVkQ29udGFpbmVyXyIsImlmcmFtZUxheW91dEJveF8iLCJ1bmxpc3RlblZpZXdwb3J0Q2hhbmdlc18iLCJ1bmxpc3RlbmVyc18iLCJpbnRlcnNlY3Rpb25PYnNlcnZlcl8iLCJjb250YWluZXJfIiwidW5kZWZpbmVkIiwibGF5b3V0UHJvbWlzZV8iLCJ0eXBlXyIsImlzRnVsbFdpZHRoQWxpZ25lZF8iLCJpc0Z1bGxXaWR0aFJlcXVlc3RlZF8iLCJpbml0aWFsSW50ZXJzZWN0aW9uUHJvbWlzZV8iLCJpc1BXQSIsImdldEFtcERvYyIsImlzU2luZ2xlRG9jIiwiTUVUQURBVEEiLCJBRFMiLCJ3aW4iLCJlbGVtZW50Q2hlY2siLCJsYXlvdXQiLCJnZXRSZXNvdXJjZXMiLCJnZXRSZXNvdXJjZUZvckVsZW1lbnQiLCJ0eXBlIiwiZ2V0QXR0cmlidXRlIiwidXBncmFkZURlbGF5TXMiLCJNYXRoIiwicm91bmQiLCJnZXRSZXNvdXJjZSIsImdldFVwZ3JhZGVEZWxheU1zIiwiaW5mbyIsImdldFBsYWNlaG9sZGVyIiwiZ2V0RmFsbGJhY2siLCJ2YWxpZGF0ZVN0aWNreUFkIiwic2hvdWxkUmVxdWVzdEZ1bGxXaWR0aF8iLCJhdHRlbXB0RnVsbFdpZHRoU2l6ZUNoYW5nZV8iLCJhc3luY0ludGVyc2VjdGlvbiIsImlkIiwiZXhwZXJpbWVudCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZ2V0SW50ZXJzZWN0aW9uQ2hhbmdlRW50cnkiLCJoYXNGdWxsV2lkdGgiLCJoYXNBdHRyaWJ1dGUiLCJmdWxsV2lkdGhIZWlnaHRSYXRpbyIsIm9wdF9vbkxheW91dCIsInByZWNvbm5lY3QiLCJwcmVjb25uZWN0Rm9yIiwicHJlZmV0Y2giLCJwcmVsb2FkIiwiZm9yRWFjaCIsInAiLCJ1cmwiLCJzcmMiLCJtZWFzdXJlSWZyYW1lTGF5b3V0Qm94XyIsIm9uTGF5b3V0TWVhc3VyZSIsImxheW91dEJveCIsImdldExheW91dEJveCIsImdldFZzeW5jIiwicnVuIiwibWVhc3VyZSIsInN0YXRlIiwiZGlyZWN0aW9uIiwibXV0YXRlIiwibGVmdCIsImlmcmFtZSIsImlmcmFtZUJveCIsImdldFZpZXdwb3J0IiwiZ2V0TGF5b3V0UmVjdCIsImJveCIsInRvcCIsImlzU3RpY2t5QWQiLCJjb25zZW50UHJvbWlzZSIsImdldENvbnNlbnRTdGF0ZSIsImNvbnNlbnRQb2xpY3lJZCIsImNvbnNlbnRTdHJpbmdQcm9taXNlIiwiY29uc2VudE1ldGFkYXRhUHJvbWlzZSIsInNoYXJlZERhdGFQcm9taXNlIiwicGFnZVZpZXdJZDY0UHJvbWlzZSIsImRvY3VtZW50SW5mb0ZvckRvYyIsInBhZ2VWaWV3SWQ2NCIsInNjcm9sbFByb21pc2UiLCJnZXRTY3JvbGxQcm9taXNlRm9yU3RpY2t5QWQiLCJhbGwiLCJ0aGVuIiwiY29uc2VudHMiLCJtYXliZUluaXRTdGlja3lBZCIsIm9wdF9jb250ZXh0IiwiaW50ZXJzZWN0aW9uIiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3IiwiaW5pdGlhbEludGVyc2VjdGlvbiIsInRpdGxlIiwiaW5pdCIsImluVmlld3BvcnQiLCJ2aWV3cG9ydENhbGxiYWNrXyIsInZpZXdwb3J0Q2FsbGJhY2siLCJ1bmxpc3RlbiIsImxlbmd0aCIsImFwcGx5VW5sYXlvdXRVSSIsImZyZWVYT3JpZ2luSWZyYW1lIiwiY2xlYW51cCIsInZpZXdwb3J0U2l6ZSIsImdldFNpemUiLCJtYXhIZWlnaHQiLCJtaW4iLCJoZWlnaHQiLCJ3aWR0aCIsImdldEZ1bGxXaWR0aEhlaWdodF8iLCJhdHRlbXB0Q2hhbmdlU2l6ZSIsIkFNUCIsIkJhc2VFbGVtZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSxrQkFERixFQUVFQyxtREFGRjtBQUlBLFNBQVFDLDRCQUFSO0FBQ0EsU0FB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RHFILEtBQWpELFNBQTBERCxNQUExRDtBQUNELE9BSEksRUFJTCxZQUFNO0FBQ0ozSSxRQUFBQSxHQUFHLEdBQUcrRCxJQUFOLENBQVd4QyxXQUFYLDZCQUFpRHFILEtBQWpELFNBQTBERCxNQUExRDtBQUNELE9BTkksQ0FBUDtBQVFEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBcmNBO0FBQUE7QUFBQSxXQXNjRSw2QkFBb0JDLEtBQXBCLEVBQTJCSCxTQUEzQixFQUFzQztBQUNwQztBQUNBO0FBQ0EsVUFBSSxLQUFLOUcsT0FBTCxDQUFhOEIsWUFBYixDQUEwQixrQkFBMUIsTUFBa0R2RSxrQkFBdEQsRUFBMEU7QUFDeEUsZUFBT0MsbURBQW1ELENBQ3hEeUosS0FEd0QsRUFFeEQsS0FBS2pILE9BRm1ELENBQTFEO0FBSUQ7O0FBQ0QsYUFBTzlCLEtBQUssQ0FDVjhELElBQUksQ0FBQ0MsS0FBTCxDQUFXZ0YsS0FBSyxHQUFHLEtBQUsvRyxNQUFMLENBQVlnRCxvQkFBL0IsQ0FEVSxFQUVWckQscUJBRlUsRUFHVmlILFNBSFUsQ0FBWjtBQUtEO0FBcGRIOztBQUFBO0FBQUEsRUFBaUNNLEdBQUcsQ0FBQ0MsV0FBckMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtcbiAgQURTRU5TRV9NQ1JTUFZfVEFHLFxuICBnZXRNYXRjaGVkQ29udGVudFJlc3BvbnNpdmVIZWlnaHRBbmRVcGRhdGVQdWJQYXJhbXMsXG59IGZyb20gJyNhZHMvZ29vZ2xlL3V0aWxzJztcbmltcG9ydCB7QURTX0lOSVRJQUxfSU5URVJTRUNUSU9OX0VYUH0gZnJvbSAnI2V4cGVyaW1lbnRzL2Fkcy1pbml0aWFsLWludGVyc2VjdGlvbi1leHAnO1xuaW1wb3J0IHtBbXBBZFVJSGFuZGxlcn0gZnJvbSAnLi9hbXAtYWQtdWknO1xuaW1wb3J0IHtBbXBBZFhPcmlnaW5JZnJhbWVIYW5kbGVyfSBmcm9tICcuL2FtcC1hZC14b3JpZ2luLWlmcmFtZS1oYW5kbGVyJztcbmltcG9ydCB7XG4gIENPTlNFTlRfUE9MSUNZX1NUQVRFLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG59IGZyb20gJyNjb3JlL2NvbnN0YW50cy9jb25zZW50LXN0YXRlJztcbmltcG9ydCB7XG4gIExheW91dCwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICBMYXlvdXRQcmlvcml0eSxcbiAgaXNMYXlvdXRTaXplRGVmaW5lZCxcbn0gZnJvbSAnI2NvcmUvZG9tL2xheW91dCc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2FkQ29uZmlnfSBmcm9tICcjYWRzL19jb25maWcnO1xuaW1wb3J0IHtjbGFtcH0gZnJvbSAnI2NvcmUvbWF0aCc7XG5pbXBvcnQge2NvbXB1dGVkU3R5bGUsIHNldFN0eWxlfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydCwgdXNlckFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2dldEFkQ2lkfSBmcm9tICcuLi8uLi8uLi9zcmMvYWQtY2lkJztcbmltcG9ydCB7Z2V0QWRDb250YWluZXIsIGlzQWRQb3NpdGlvbkFsbG93ZWR9IGZyb20gJy4uLy4uLy4uL3NyYy9hZC1oZWxwZXInO1xuaW1wb3J0IHtcbiAgZ2V0QW1wQWRSZW5kZXJPdXRzaWRlVmlld3BvcnQsXG4gIGluY3JlbWVudExvYWRpbmdBZHMsXG4gIGlzM3BUaHJvdHRsZWQsXG59IGZyb20gJy4vY29uY3VycmVudC1sb2FkJztcbmltcG9ydCB7XG4gIGdldENvbnNlbnRNZXRhZGF0YSxcbiAgZ2V0Q29uc2VudFBvbGljeUluZm8sXG4gIGdldENvbnNlbnRQb2xpY3lTaGFyZWREYXRhLFxuICBnZXRDb25zZW50UG9saWN5U3RhdGUsXG59IGZyb20gJy4uLy4uLy4uL3NyYy9jb25zZW50JztcbmltcG9ydCB7Z2V0RXhwZXJpbWVudEJyYW5jaH0gZnJvbSAnI2V4cGVyaW1lbnRzJztcbmltcG9ydCB7Z2V0SWZyYW1lLCBwcmVsb2FkQm9vdHN0cmFwfSBmcm9tICcuLi8uLi8uLi9zcmMvM3AtZnJhbWUnO1xuaW1wb3J0IHtcbiAgaW50ZXJzZWN0aW9uRW50cnlUb0pzb24sXG4gIG1lYXN1cmVJbnRlcnNlY3Rpb24sXG59IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvaW50ZXJzZWN0aW9uJztcbmltcG9ydCB7bW92ZUxheW91dFJlY3R9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvcmVjdCc7XG5pbXBvcnQge1xuICBvYnNlcnZlV2l0aFNoYXJlZEluT2IsXG4gIHVub2JzZXJ2ZVdpdGhTaGFyZWRJbk9iLFxufSBmcm9tICcjY29yZS9kb20vbGF5b3V0L3ZpZXdwb3J0LW9ic2VydmVyJztcbmltcG9ydCB7dG9XaW59IGZyb20gJyNjb3JlL3dpbmRvdyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gVGFnIG5hbWUgZm9yIDNQIEFEIGltcGxlbWVudGF0aW9uLiAqL1xuZXhwb3J0IGNvbnN0IFRBR18zUF9JTVBMID0gJ2FtcC1hZC0zcC1pbXBsJztcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgTUlOX0ZVTExfV0lEVEhfSEVJR0hUID0gMTAwO1xuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5jb25zdCBNQVhfRlVMTF9XSURUSF9IRUlHSFQgPSA1MDA7XG5cbmV4cG9ydCBjbGFzcyBBbXBBZDNQSW1wbCBleHRlbmRzIEFNUC5CYXNlRWxlbWVudCB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7P0VsZW1lbnR9XG4gICAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAgICovXG4gICAgdGhpcy5pZnJhbWVfID0gbnVsbDtcblxuICAgIC8qKiBAdHlwZSB7P09iamVjdH0gKi9cbiAgICB0aGlzLmNvbmZpZyA9IG51bGw7XG5cbiAgICAvKiogQHR5cGUgez9BbXBBZFVJSGFuZGxlcn0gKi9cbiAgICB0aGlzLnVpSGFuZGxlciA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9BbXBBZFhPcmlnaW5JZnJhbWVIYW5kbGVyfSAqL1xuICAgIHRoaXMueE9yaWdpbklmcmFtZUhhbmRsZXJfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlIHs/RWxlbWVudH1cbiAgICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICAgKi9cbiAgICB0aGlzLnBsYWNlaG9sZGVyXyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7P0VsZW1lbnR9XG4gICAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAgICovXG4gICAgdGhpcy5mYWxsYmFja18gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNJbkZpeGVkQ29udGFpbmVyXyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIChyZWxhdGl2ZSkgbGF5b3V0IGJveCBvZiB0aGUgYWQgaWZyYW1lIHRvIHRoZSBhbXAtYWQgdGFnLlxuICAgICAqIEBwcml2YXRlIHs/Li4vLi4vLi4vc3JjL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9XG4gICAgICovXG4gICAgdGhpcy5pZnJhbWVMYXlvdXRCb3hfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIENhbGwgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdmlld3BvcnQgY2hhbmdlcy5cbiAgICAgKiBAcHJpdmF0ZSB7P2Z1bmN0aW9uKCl9XG4gICAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAgICovXG4gICAgdGhpcy51bmxpc3RlblZpZXdwb3J0Q2hhbmdlc18gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtBcnJheTxGdW5jdGlvbj59ICovXG4gICAgdGhpcy51bmxpc3RlbmVyc18gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlIHtJbnRlcnNlY3Rpb25PYnNlcnZlcn1cbiAgICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICAgKi9cbiAgICB0aGlzLmludGVyc2VjdGlvbk9ic2VydmVyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9zdHJpbmd8dW5kZWZpbmVkfSAqL1xuICAgIHRoaXMuY29udGFpbmVyXyA9IHVuZGVmaW5lZDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1Byb21pc2V9ICovXG4gICAgdGhpcy5sYXlvdXRQcm9taXNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge3N0cmluZ3x1bmRlZmluZWR9ICovXG4gICAgdGhpcy50eXBlXyA9IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIEZvciBmdWxsLXdpZHRoIHJlc3BvbnNpdmUgYWRzOiB3aGV0aGVyIHRoZSBlbGVtZW50IGhhcyBhbHJlYWR5IGJlZW5cbiAgICAgKiBhbGlnbmVkIHRvIHRoZSBlZGdlcyBvZiB0aGUgdmlld3BvcnQuXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc0Z1bGxXaWR0aEFsaWduZWRfID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGZ1bGwtd2lkdGggcmVzcG9uc2l2ZSB3YXMgcmVxdWVzdGVkIGZvciB0aGlzIGFkLlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuaXNGdWxsV2lkdGhSZXF1ZXN0ZWRfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge1Byb21pc2U8IUludGVyc2VjdGlvbk9ic2VydmVyRW50cnk+fSAqL1xuICAgIHRoaXMuaW5pdGlhbEludGVyc2VjdGlvblByb21pc2VfID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0TGF5b3V0UHJpb3JpdHkoKSB7XG4gICAgLy8gTG9hZHMgYWRzIGFmdGVyIG90aGVyIGNvbnRlbnQsXG4gICAgY29uc3QgaXNQV0EgPSAhdGhpcy5lbGVtZW50LmdldEFtcERvYygpLmlzU2luZ2xlRG9jKCk7XG4gICAgLy8gZ2l2ZSB0aGUgYWQgaGlnaGVyIHByaW9yaXR5IGlmIGl0IGlzIGluc2lkZSBhIFBXQVxuICAgIHJldHVybiBpc1BXQSA/IExheW91dFByaW9yaXR5Lk1FVEFEQVRBIDogTGF5b3V0UHJpb3JpdHkuQURTO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICByZW5kZXJPdXRzaWRlVmlld3BvcnQoKSB7XG4gICAgaWYgKGlzM3BUaHJvdHRsZWQodGhpcy53aW4pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSB0aGUgYWQgaXMgZ29vZCB0byBnby5cbiAgICBjb25zdCBlbGVtZW50Q2hlY2sgPSBnZXRBbXBBZFJlbmRlck91dHNpZGVWaWV3cG9ydCh0aGlzLmVsZW1lbnQpO1xuICAgIHJldHVybiBlbGVtZW50Q2hlY2sgIT09IG51bGwgPyBlbGVtZW50Q2hlY2sgOiBzdXBlci5yZW5kZXJPdXRzaWRlVmlld3BvcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFMYXlvdXR9IGxheW91dFxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGlzTGF5b3V0U3VwcG9ydGVkKGxheW91dCkge1xuICAgIHJldHVybiBpc0xheW91dFNpemVEZWZpbmVkKGxheW91dCk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3Jlc291cmNlLlJlc291cmNlfVxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIGdldFJlc291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0UmVzb3VyY2VzKCkuZ2V0UmVzb3VyY2VGb3JFbGVtZW50KHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldENvbnNlbnRQb2xpY3koKSB7XG4gICAgY29uc3QgdHlwZSA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICBjb25zdCBjb25maWcgPSBhZENvbmZpZ1t0eXBlXTtcbiAgICBpZiAoY29uZmlnICYmIGNvbmZpZ1snY29uc2VudEhhbmRsaW5nT3ZlcnJpZGUnXSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBzdXBlci5nZXRDb25zZW50UG9saWN5KCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGJ1aWxkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy50eXBlXyA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICBjb25zdCB1cGdyYWRlRGVsYXlNcyA9IE1hdGgucm91bmQodGhpcy5nZXRSZXNvdXJjZSgpLmdldFVwZ3JhZGVEZWxheU1zKCkpO1xuICAgIGRldigpLmluZm8oVEFHXzNQX0lNUEwsIGB1cGdyYWRlRGVsYXkgJHt0aGlzLnR5cGVffTogJHt1cGdyYWRlRGVsYXlNc31gKTtcblxuICAgIHRoaXMucGxhY2Vob2xkZXJfID0gdGhpcy5nZXRQbGFjZWhvbGRlcigpO1xuICAgIHRoaXMuZmFsbGJhY2tfID0gdGhpcy5nZXRGYWxsYmFjaygpO1xuXG4gICAgdGhpcy5jb25maWcgPSBhZENvbmZpZ1t0aGlzLnR5cGVfXTtcbiAgICB1c2VyQXNzZXJ0KHRoaXMuY29uZmlnLCBgVHlwZSBcIiR7dGhpcy50eXBlX31cIiBpcyBub3Qgc3VwcG9ydGVkIGluIGFtcC1hZGApO1xuXG4gICAgdGhpcy51aUhhbmRsZXIgPSBuZXcgQW1wQWRVSUhhbmRsZXIodGhpcyk7XG4gICAgdGhpcy51aUhhbmRsZXIudmFsaWRhdGVTdGlja3lBZCgpO1xuXG4gICAgdGhpcy5pc0Z1bGxXaWR0aFJlcXVlc3RlZF8gPSB0aGlzLnNob3VsZFJlcXVlc3RGdWxsV2lkdGhfKCk7XG5cbiAgICBpZiAodGhpcy5pc0Z1bGxXaWR0aFJlcXVlc3RlZF8pIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dGVtcHRGdWxsV2lkdGhTaXplQ2hhbmdlXygpO1xuICAgIH1cblxuICAgIGNvbnN0IGFzeW5jSW50ZXJzZWN0aW9uID1cbiAgICAgIGdldEV4cGVyaW1lbnRCcmFuY2godGhpcy53aW4sIEFEU19JTklUSUFMX0lOVEVSU0VDVElPTl9FWFAuaWQpID09PVxuICAgICAgQURTX0lOSVRJQUxfSU5URVJTRUNUSU9OX0VYUC5leHBlcmltZW50O1xuICAgIHRoaXMuaW5pdGlhbEludGVyc2VjdGlvblByb21pc2VfID0gYXN5bmNJbnRlcnNlY3Rpb25cbiAgICAgID8gbWVhc3VyZUludGVyc2VjdGlvbih0aGlzLmVsZW1lbnQpXG4gICAgICA6IFByb21pc2UucmVzb2x2ZSh0aGlzLmVsZW1lbnQuZ2V0SW50ZXJzZWN0aW9uQ2hhbmdlRW50cnkoKSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNob3VsZFJlcXVlc3RGdWxsV2lkdGhfKCkge1xuICAgIGNvbnN0IGhhc0Z1bGxXaWR0aCA9IHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RhdGEtZnVsbC13aWR0aCcpO1xuICAgIGlmICghaGFzRnVsbFdpZHRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHVzZXJBc3NlcnQoXG4gICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3aWR0aCcpID09ICcxMDB2dycsXG4gICAgICAnQWQgdW5pdHMgd2l0aCBkYXRhLWZ1bGwtd2lkdGggbXVzdCBoYXZlIHdpZHRoPVwiMTAwdndcIi4nXG4gICAgKTtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgISF0aGlzLmNvbmZpZy5mdWxsV2lkdGhIZWlnaHRSYXRpbyxcbiAgICAgICdBZCBuZXR3b3JrIGRvZXMgbm90IHN1cHBvcnQgZnVsbCB3aWR0aCBhZHMuJ1xuICAgICk7XG4gICAgZGV2KCkuaW5mbyhcbiAgICAgIFRBR18zUF9JTVBMLFxuICAgICAgJyMke3RoaXMuZ2V0UmVzb3VyY2UoKS5nZXRJZCgpfSBGdWxsIHdpZHRoIHJlcXVlc3RlZCdcbiAgICApO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZWZldGNoZXMgYW5kIHByZWNvbm5lY3RzIFVSTHMgcmVsYXRlZCB0byB0aGUgYWQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9vbkxheW91dFxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHByZWNvbm5lY3RDYWxsYmFjayhvcHRfb25MYXlvdXQpIHtcbiAgICBjb25zdCBwcmVjb25uZWN0ID0gU2VydmljZXMucHJlY29ubmVjdEZvcih0aGlzLndpbik7XG4gICAgLy8gV2UgYWx3YXlzIG5lZWQgdGhlIGJvb3RzdHJhcC5cbiAgICBwcmVsb2FkQm9vdHN0cmFwKHRoaXMud2luLCB0aGlzLnR5cGVfLCB0aGlzLmdldEFtcERvYygpLCBwcmVjb25uZWN0KTtcbiAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLnByZWZldGNoID09ICdzdHJpbmcnKSB7XG4gICAgICBwcmVjb25uZWN0LnByZWxvYWQodGhpcy5nZXRBbXBEb2MoKSwgdGhpcy5jb25maWcucHJlZmV0Y2gsICdzY3JpcHQnKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuY29uZmlnLnByZWZldGNoKSB7XG4gICAgICAvKiogQHR5cGUgeyFBcnJheX0gKi8gKHRoaXMuY29uZmlnLnByZWZldGNoKS5mb3JFYWNoKChwKSA9PiB7XG4gICAgICAgIHByZWNvbm5lY3QucHJlbG9hZCh0aGlzLmdldEFtcERvYygpLCBwLCAnc2NyaXB0Jyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNvbmZpZy5wcmVjb25uZWN0ID09ICdzdHJpbmcnKSB7XG4gICAgICBwcmVjb25uZWN0LnVybCh0aGlzLmdldEFtcERvYygpLCB0aGlzLmNvbmZpZy5wcmVjb25uZWN0LCBvcHRfb25MYXlvdXQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWcucHJlY29ubmVjdCkge1xuICAgICAgLyoqIEB0eXBlIHshQXJyYXl9ICovICh0aGlzLmNvbmZpZy5wcmVjb25uZWN0KS5mb3JFYWNoKChwKSA9PiB7XG4gICAgICAgIHByZWNvbm5lY3QudXJsKHRoaXMuZ2V0QW1wRG9jKCksIHAsIG9wdF9vbkxheW91dCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gSWYgZnVsbHkgcXVhbGlmaWVkIHNyYyBmb3IgYWQgc2NyaXB0IGlzIHNwZWNpZmllZCB3ZSBwcmVjb25uZWN0IHRvIGl0LlxuICAgIGNvbnN0IHNyYyA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgIGlmIChzcmMpIHtcbiAgICAgIC8vIFdlIG9ubHkgcHJlY29ubmVjdCB0byB0aGUgc3JjIGJlY2F1c2Ugd2UgY2Fubm90IGtub3cgd2hldGhlciB0aGUgVVJMXG4gICAgICAvLyB3aWxsIGhhdmUgY2FjaGluZyBoZWFkZXJzIHNldC5cbiAgICAgIHByZWNvbm5lY3QudXJsKHRoaXMuZ2V0QW1wRG9jKCksIHNyYyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgb25MYXlvdXRNZWFzdXJlKCkge1xuICAgIHRoaXMuaXNJbkZpeGVkQ29udGFpbmVyXyA9ICFpc0FkUG9zaXRpb25BbGxvd2VkKHRoaXMuZWxlbWVudCwgdGhpcy53aW4pO1xuICAgIC8qKiBkZXRlY3QgYWQgY29udGFpbmVycywgYWRkIHRoZSBsaXN0IHRvIGVsZW1lbnQgYXMgYSBuZXcgYXR0cmlidXRlICovXG4gICAgaWYgKHRoaXMuY29udGFpbmVyXyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmNvbnRhaW5lcl8gPSBnZXRBZENvbnRhaW5lcih0aGlzLmVsZW1lbnQpO1xuICAgIH1cbiAgICAvLyBXZSByZW1lYXN1cmVkIHRoaXMgdGFnLCBsZXQncyBhbHNvIHJlbWVhc3VyZSB0aGUgaWZyYW1lLiBTaG91bGQgYmVcbiAgICAvLyBmcmVlIG5vdyBhbmQgaXQgbWlnaHQgaGF2ZSBjaGFuZ2VkLlxuICAgIHRoaXMubWVhc3VyZUlmcmFtZUxheW91dEJveF8oKTtcbiAgICBpZiAodGhpcy54T3JpZ2luSWZyYW1lSGFuZGxlcl8pIHtcbiAgICAgIHRoaXMueE9yaWdpbklmcmFtZUhhbmRsZXJfLm9uTGF5b3V0TWVhc3VyZSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzRnVsbFdpZHRoUmVxdWVzdGVkXyAmJiAhdGhpcy5pc0Z1bGxXaWR0aEFsaWduZWRfKSB7XG4gICAgICB0aGlzLmlzRnVsbFdpZHRoQWxpZ25lZF8gPSB0cnVlO1xuICAgICAgY29uc3QgbGF5b3V0Qm94ID0gdGhpcy5nZXRMYXlvdXRCb3goKTtcblxuICAgICAgLy8gTnVkZ2UgaW50byB0aGUgY29ycmVjdCBob3Jpem9udGFsIHBvc2l0aW9uIGJ5IGNoYW5naW5nIHNpZGUgbWFyZ2luLlxuICAgICAgdGhpcy5nZXRWc3luYygpLnJ1bihcbiAgICAgICAge1xuICAgICAgICAgIG1lYXN1cmU6IChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUuZGlyZWN0aW9uID0gY29tcHV0ZWRTdHlsZSh0aGlzLndpbiwgdGhpcy5lbGVtZW50KVtcbiAgICAgICAgICAgICAgJ2RpcmVjdGlvbidcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgfSxcbiAgICAgICAgICBtdXRhdGU6IChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0YXRlLmRpcmVjdGlvbiA9PSAncnRsJykge1xuICAgICAgICAgICAgICBzZXRTdHlsZSh0aGlzLmVsZW1lbnQsICdtYXJnaW5SaWdodCcsIGxheW91dEJveC5sZWZ0LCAncHgnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNldFN0eWxlKHRoaXMuZWxlbWVudCwgJ21hcmdpbkxlZnQnLCAtbGF5b3V0Qm94LmxlZnQsICdweCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtkaXJlY3Rpb246ICcnfVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWVhc3VyZSB0aGUgbGF5b3V0IGJveCBvZiB0aGUgaWZyYW1lIGlmIHdlIHJlbmRlcmVkIGl0IGFscmVhZHkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtZWFzdXJlSWZyYW1lTGF5b3V0Qm94XygpIHtcbiAgICBpZiAodGhpcy54T3JpZ2luSWZyYW1lSGFuZGxlcl8gJiYgdGhpcy54T3JpZ2luSWZyYW1lSGFuZGxlcl8uaWZyYW1lKSB7XG4gICAgICBjb25zdCBpZnJhbWVCb3ggPSB0aGlzLmdldFZpZXdwb3J0KCkuZ2V0TGF5b3V0UmVjdChcbiAgICAgICAgdGhpcy54T3JpZ2luSWZyYW1lSGFuZGxlcl8uaWZyYW1lXG4gICAgICApO1xuICAgICAgY29uc3QgYm94ID0gdGhpcy5nZXRMYXlvdXRCb3goKTtcbiAgICAgIC8vIENhY2hlIHRoZSBpZnJhbWUncyByZWxhdGl2ZSBwb3NpdGlvbiB0byB0aGUgYW1wLWFkLiBUaGlzIGlzXG4gICAgICAvLyBuZWNlc3NhcnkgZm9yIGZpeGVkLXBvc2l0aW9uIGNvbnRhaW5lcnMgd2hpY2ggXCJtb3ZlXCIgd2l0aCB0aGVcbiAgICAgIC8vIHZpZXdwb3J0LlxuICAgICAgdGhpcy5pZnJhbWVMYXlvdXRCb3hfID0gbW92ZUxheW91dFJlY3QoaWZyYW1lQm94LCAtYm94LmxlZnQsIC1ib3gudG9wKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBnZXRJbnRlcnNlY3Rpb25FbGVtZW50TGF5b3V0Qm94KCkge1xuICAgIGlmICghdGhpcy54T3JpZ2luSWZyYW1lSGFuZGxlcl8gfHwgIXRoaXMueE9yaWdpbklmcmFtZUhhbmRsZXJfLmlmcmFtZSkge1xuICAgICAgcmV0dXJuIHN1cGVyLmdldEludGVyc2VjdGlvbkVsZW1lbnRMYXlvdXRCb3goKTtcbiAgICB9XG4gICAgY29uc3QgYm94ID0gdGhpcy5nZXRMYXlvdXRCb3goKTtcbiAgICBpZiAoIXRoaXMuaWZyYW1lTGF5b3V0Qm94Xykge1xuICAgICAgdGhpcy5tZWFzdXJlSWZyYW1lTGF5b3V0Qm94XygpO1xuICAgIH1cblxuICAgIGNvbnN0IGlmcmFtZSA9IC8qKiBAdHlwZSB7IS4uLy4uLy4uL3NyYy9sYXlvdXQtcmVjdC5MYXlvdXRSZWN0RGVmfSAqLyAoXG4gICAgICBkZXZBc3NlcnQodGhpcy5pZnJhbWVMYXlvdXRCb3hfKVxuICAgICk7XG4gICAgcmV0dXJuIG1vdmVMYXlvdXRSZWN0KGlmcmFtZSwgYm94LmxlZnQsIGJveC50b3ApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICBpZiAodGhpcy5sYXlvdXRQcm9taXNlXykge1xuICAgICAgcmV0dXJuIHRoaXMubGF5b3V0UHJvbWlzZV87XG4gICAgfVxuICAgIHVzZXJBc3NlcnQoXG4gICAgICAhdGhpcy5pc0luRml4ZWRDb250YWluZXJfIHx8IHRoaXMudWlIYW5kbGVyLmlzU3RpY2t5QWQoKSxcbiAgICAgICc8YW1wLWFkPiBpcyBub3QgYWxsb3dlZCB0byBiZSBwbGFjZWQgaW4gZWxlbWVudHMgd2l0aCAnICtcbiAgICAgICAgJ3Bvc2l0aW9uOmZpeGVkOiAlcyB1bmxlc3MgaXQgaGFzIHN0aWNreSBhdHRyaWJ1dGUnLFxuICAgICAgdGhpcy5lbGVtZW50XG4gICAgKTtcblxuICAgIGNvbnN0IGNvbnNlbnRQcm9taXNlID0gdGhpcy5nZXRDb25zZW50U3RhdGUoKTtcbiAgICBjb25zdCBjb25zZW50UG9saWN5SWQgPSBzdXBlci5nZXRDb25zZW50UG9saWN5KCk7XG4gICAgY29uc3QgY29uc2VudFN0cmluZ1Byb21pc2UgPSBjb25zZW50UG9saWN5SWRcbiAgICAgID8gZ2V0Q29uc2VudFBvbGljeUluZm8odGhpcy5lbGVtZW50LCBjb25zZW50UG9saWN5SWQpXG4gICAgICA6IFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICBjb25zdCBjb25zZW50TWV0YWRhdGFQcm9taXNlID0gY29uc2VudFBvbGljeUlkXG4gICAgICA/IGdldENvbnNlbnRNZXRhZGF0YSh0aGlzLmVsZW1lbnQsIGNvbnNlbnRQb2xpY3lJZClcbiAgICAgIDogUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIGNvbnN0IHNoYXJlZERhdGFQcm9taXNlID0gY29uc2VudFBvbGljeUlkXG4gICAgICA/IGdldENvbnNlbnRQb2xpY3lTaGFyZWREYXRhKHRoaXMuZWxlbWVudCwgY29uc2VudFBvbGljeUlkKVxuICAgICAgOiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgY29uc3QgcGFnZVZpZXdJZDY0UHJvbWlzZSA9IFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyhcbiAgICAgIHRoaXMuZWxlbWVudFxuICAgICkucGFnZVZpZXdJZDY0O1xuXG4gICAgLy8gRm9yIHN0aWNreSBhZCBvbmx5OiBtdXN0IHdhaXQgZm9yIHNjcm9sbGluZyBldmVudCBiZWZvcmUgbG9hZGluZyB0aGUgYWRcbiAgICBjb25zdCBzY3JvbGxQcm9taXNlID0gdGhpcy51aUhhbmRsZXIuZ2V0U2Nyb2xsUHJvbWlzZUZvclN0aWNreUFkKCk7XG5cbiAgICB0aGlzLmxheW91dFByb21pc2VfID0gUHJvbWlzZS5hbGwoW1xuICAgICAgZ2V0QWRDaWQodGhpcyksXG4gICAgICBjb25zZW50UHJvbWlzZSxcbiAgICAgIHNoYXJlZERhdGFQcm9taXNlLFxuICAgICAgY29uc2VudFN0cmluZ1Byb21pc2UsXG4gICAgICBjb25zZW50TWV0YWRhdGFQcm9taXNlLFxuICAgICAgc2Nyb2xsUHJvbWlzZSxcbiAgICAgIHBhZ2VWaWV3SWQ2NFByb21pc2UsXG4gICAgXSlcbiAgICAgIC50aGVuKChjb25zZW50cykgPT4ge1xuICAgICAgICB0aGlzLnVpSGFuZGxlci5tYXliZUluaXRTdGlja3lBZCgpO1xuXG4gICAgICAgIC8vIFVzZSBKc29uT2JqZWN0IHRvIHByZXNlcnZlIGZpZWxkIG5hbWVzIHNvIHRoYXQgYW1wQ29udGV4dCBjYW4gYWNjZXNzXG4gICAgICAgIC8vIHZhbHVlcyB3aXRoIG5hbWVcbiAgICAgICAgLy8gYW1wY29udGV4dC5qcyBhbmQgdGhpcyBmaWxlIGFyZSBjb21waWxlZCBpbiBkaWZmZXJlbnQgY29tcGlsYXRpb24gdW5pdFxuXG4gICAgICAgIC8vIE5vdGU6IEZpZWxkIG5hbWVzIGNhbiBieSBwZXJzZXJ2ZWQgYnkgdXNpbmcgSnNvbk9iamVjdCwgb3IgYnkgYWRkaW5nXG4gICAgICAgIC8vIHBlcnNlcnZlZCBuYW1lIHRvIGV4dGVybi4gV2UgYXJlIGRvaW5nIGJvdGggcmlnaHQgbm93LlxuICAgICAgICAvLyBQbGVhc2UgYWxzbyBhZGQgbmV3IGludHJvZHVjZWQgdmFyaWFibGVcbiAgICAgICAgLy8gbmFtZSB0byB0aGUgZXh0ZXJuIGxpc3QuXG4gICAgICAgIGNvbnN0IG9wdF9jb250ZXh0ID0gZGljdCh7XG4gICAgICAgICAgJ2NsaWVudElkJzogY29uc2VudHNbMF0gfHwgbnVsbCxcbiAgICAgICAgICAnY29udGFpbmVyJzogdGhpcy5jb250YWluZXJfLFxuICAgICAgICAgICdpbml0aWFsQ29uc2VudFN0YXRlJzogY29uc2VudHNbMV0sXG4gICAgICAgICAgJ2NvbnNlbnRTaGFyZWREYXRhJzogY29uc2VudHNbMl0sXG4gICAgICAgICAgJ2luaXRpYWxDb25zZW50VmFsdWUnOiBjb25zZW50c1szXSxcbiAgICAgICAgICAnaW5pdGlhbENvbnNlbnRNZXRhZGF0YSc6IGNvbnNlbnRzWzRdLFxuICAgICAgICAgICdwYWdlVmlld0lkNjQnOiBjb25zZW50c1s2XSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSW4gdGhpcyBwYXRoLCB0aGUgcmVxdWVzdCBhbmQgcmVuZGVyIHN0YXJ0IGV2ZW50cyBhcmUgZW50YW5nbGVkLFxuICAgICAgICAvLyBiZWNhdXNlIGJvdGggaGFwcGVuIGluc2lkZSBhIGNyb3NzLWRvbWFpbiBpZnJhbWUuICBTZXBhcmF0aW5nIHRoZW1cbiAgICAgICAgLy8gaGVyZSwgdGhvdWdoLCBhbGxvd3MgdXMgdG8gbWVhc3VyZSB0aGUgaW1wYWN0IG9mIGFkIHRocm90dGxpbmcgdmlhXG4gICAgICAgIC8vIGluY3JlbWVudExvYWRpbmdBZHMoKS5cblxuICAgICAgICByZXR1cm4gdGhpcy5pbml0aWFsSW50ZXJzZWN0aW9uUHJvbWlzZV8udGhlbigoaW50ZXJzZWN0aW9uKSA9PiB7XG4gICAgICAgICAgY29uc3QgaWZyYW1lID0gZ2V0SWZyYW1lKFxuICAgICAgICAgICAgdG9XaW4odGhpcy5lbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpLFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgICAgdGhpcy50eXBlXyxcbiAgICAgICAgICAgIG9wdF9jb250ZXh0LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpbml0aWFsSW50ZXJzZWN0aW9uOiBpbnRlcnNlY3Rpb25FbnRyeVRvSnNvbihpbnRlcnNlY3Rpb24pLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgaWZyYW1lLnRpdGxlID0gdGhpcy5lbGVtZW50LnRpdGxlIHx8ICdBZHZlcnRpc2VtZW50JztcbiAgICAgICAgICB0aGlzLnhPcmlnaW5JZnJhbWVIYW5kbGVyXyA9IG5ldyBBbXBBZFhPcmlnaW5JZnJhbWVIYW5kbGVyKHRoaXMpO1xuICAgICAgICAgIHJldHVybiB0aGlzLnhPcmlnaW5JZnJhbWVIYW5kbGVyXy5pbml0KGlmcmFtZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgb2JzZXJ2ZVdpdGhTaGFyZWRJbk9iKHRoaXMuZWxlbWVudCwgKGluVmlld3BvcnQpID0+XG4gICAgICAgICAgdGhpcy52aWV3cG9ydENhbGxiYWNrXyhpblZpZXdwb3J0KVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgaW5jcmVtZW50TG9hZGluZ0Fkcyh0aGlzLndpbiwgdGhpcy5sYXlvdXRQcm9taXNlXyk7XG4gICAgcmV0dXJuIHRoaXMubGF5b3V0UHJvbWlzZV87XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSBpblZpZXdwb3J0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2aWV3cG9ydENhbGxiYWNrXyhpblZpZXdwb3J0KSB7XG4gICAgaWYgKHRoaXMueE9yaWdpbklmcmFtZUhhbmRsZXJfKSB7XG4gICAgICB0aGlzLnhPcmlnaW5JZnJhbWVIYW5kbGVyXy52aWV3cG9ydENhbGxiYWNrKGluVmlld3BvcnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgdW5sYXlvdXRPblBhdXNlKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAgKi9cbiAgdW5sYXlvdXRDYWxsYmFjaygpIHtcbiAgICB0aGlzLnVubGlzdGVuZXJzXy5mb3JFYWNoKCh1bmxpc3RlbikgPT4gdW5saXN0ZW4oKSk7XG4gICAgdGhpcy51bmxpc3RlbmVyc18ubGVuZ3RoID0gMDtcbiAgICB1bm9ic2VydmVXaXRoU2hhcmVkSW5PYih0aGlzLmVsZW1lbnQpO1xuXG4gICAgdGhpcy5sYXlvdXRQcm9taXNlXyA9IG51bGw7XG4gICAgdGhpcy51aUhhbmRsZXIuYXBwbHlVbmxheW91dFVJKCk7XG4gICAgaWYgKHRoaXMueE9yaWdpbklmcmFtZUhhbmRsZXJfKSB7XG4gICAgICB0aGlzLnhPcmlnaW5JZnJhbWVIYW5kbGVyXy5mcmVlWE9yaWdpbklmcmFtZSgpO1xuICAgICAgdGhpcy54T3JpZ2luSWZyYW1lSGFuZGxlcl8gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy51aUhhbmRsZXIpIHtcbiAgICAgIHRoaXMudWlIYW5kbGVyLmNsZWFudXAoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IVByb21pc2U8P0NPTlNFTlRfUE9MSUNZX1NUQVRFPn1cbiAgICovXG4gIGdldENvbnNlbnRTdGF0ZSgpIHtcbiAgICBjb25zdCBjb25zZW50UG9saWN5SWQgPSBzdXBlci5nZXRDb25zZW50UG9saWN5KCk7XG4gICAgcmV0dXJuIGNvbnNlbnRQb2xpY3lJZFxuICAgICAgPyBnZXRDb25zZW50UG9saWN5U3RhdGUodGhpcy5lbGVtZW50LCBjb25zZW50UG9saWN5SWQpXG4gICAgICA6IFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIGFuZCBhdHRlbXB0cyB0byBzZXQgdGhlIGFwcHJvcHJpYXRlIGhlaWdodCAmIHdpZHRoIGZvciBhXG4gICAqIHJlc3BvbnNpdmUgZnVsbCB3aWR0aCBhZCB1bml0LlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGF0dGVtcHRGdWxsV2lkdGhTaXplQ2hhbmdlXygpIHtcbiAgICBjb25zdCB2aWV3cG9ydFNpemUgPSB0aGlzLmdldFZpZXdwb3J0KCkuZ2V0U2l6ZSgpO1xuICAgIGNvbnN0IG1heEhlaWdodCA9IE1hdGgubWluKE1BWF9GVUxMX1dJRFRIX0hFSUdIVCwgdmlld3BvcnRTaXplLmhlaWdodCk7XG4gICAgY29uc3Qge3dpZHRofSA9IHZpZXdwb3J0U2l6ZTtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmdldEZ1bGxXaWR0aEhlaWdodF8od2lkdGgsIG1heEhlaWdodCk7XG4gICAgLy8gQXR0ZW1wdCB0byByZXNpemUgdG8gdGhlIGNvcnJlY3QgaGVpZ2h0LiBUaGUgd2lkdGggc2hvdWxkIGFscmVhZHkgYmVcbiAgICAvLyAxMDB2dywgYnV0IGlzIGZpeGVkIGhlcmUgc28gdGhhdCBmdXR1cmUgcmVzaXplcyBvZiB0aGUgdmlld3BvcnQgZG9uJ3RcbiAgICAvLyBhZmZlY3QgaXQuXG5cbiAgICByZXR1cm4gdGhpcy5hdHRlbXB0Q2hhbmdlU2l6ZShoZWlnaHQsIHdpZHRoKS50aGVuKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBkZXYoKS5pbmZvKFRBR18zUF9JTVBMLCBgU2l6ZSBjaGFuZ2UgYWNjZXB0ZWQ6ICR7d2lkdGh9eCR7aGVpZ2h0fWApO1xuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgZGV2KCkuaW5mbyhUQUdfM1BfSU1QTCwgYFNpemUgY2hhbmdlIHJlamVjdGVkOiAke3dpZHRofXgke2hlaWdodH1gKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZXMgdGhlIGFwcHJvcHJpYXRlIHdpZHRoIGZvciBhIHJlc3BvbnNpdmUgZnVsbCB3aWR0aCBhZCB1bml0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heEhlaWdodFxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRGdWxsV2lkdGhIZWlnaHRfKHdpZHRoLCBtYXhIZWlnaHQpIHtcbiAgICAvLyBUT0RPKGdvb2dsZSBhNGEgZW5nKTogcmVtb3ZlIHRoaXMgb25jZSBhZHNlbnNlIHN3aXRjaGVzIGZ1bGx5IHRvXG4gICAgLy8gZmFzdCBmZXRjaC5cbiAgICBpZiAodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hdXRvLWZvcm1hdCcpID09PSBBRFNFTlNFX01DUlNQVl9UQUcpIHtcbiAgICAgIHJldHVybiBnZXRNYXRjaGVkQ29udGVudFJlc3BvbnNpdmVIZWlnaHRBbmRVcGRhdGVQdWJQYXJhbXMoXG4gICAgICAgIHdpZHRoLFxuICAgICAgICB0aGlzLmVsZW1lbnRcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBjbGFtcChcbiAgICAgIE1hdGgucm91bmQod2lkdGggLyB0aGlzLmNvbmZpZy5mdWxsV2lkdGhIZWlnaHRSYXRpbyksXG4gICAgICBNSU5fRlVMTF9XSURUSF9IRUlHSFQsXG4gICAgICBtYXhIZWlnaHRcbiAgICApO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-ad/0.1/amp-ad-3p-impl.js