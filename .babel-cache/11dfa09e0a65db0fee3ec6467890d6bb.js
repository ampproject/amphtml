import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

var _templateObject;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { AdvanceExpToTime, StoryAdAutoAdvance, divertStoryAdAutoAdvance } from "../../../src/experiments/story-ad-auto-advance";
import { AnalyticsEvents, AnalyticsVars, STORY_AD_ANALYTICS, StoryAdAnalytics } from "./story-ad-analytics";
import { CSS } from "../../../build/amp-story-auto-ads-0.1.css";
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { EventType, dispatch } from "../../amp-story/1.0/events";
import { Services } from "../../../src/service";
import { StateProperty, UIType } from "../../amp-story/1.0/amp-story-store-service";
import { StoryAdConfig } from "./story-ad-config";
import { StoryAdPageManager } from "./story-ad-page-manager";
import { StoryAdSegmentExp, ViewerSetTimeToBranch } from "../../../src/experiments/story-ad-progress-segment";
import { CSS as adBadgeCSS } from "../../../build/amp-story-auto-ads-ad-badge-0.1.css";
import { createShadowRootWithStyle } from "../../amp-story/1.0/utils";
import { dev, devAssert, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { divertStoryAdPlacements } from "../../../src/experiments/story-ad-placements";
import { forceExperimentBranch, getExperimentBranch } from "../../../src/experiments";
import { getPlacementAlgo } from "./algorithm-utils";
import { getServicePromiseForDoc } from "../../../src/service-helpers";
import { CSS as progessBarCSS } from "../../../build/amp-story-auto-ads-progress-bar-0.1.css";
import { setStyle } from "../../../src/core/dom/style";
import { CSS as sharedCSS } from "../../../build/amp-story-auto-ads-shared-0.1.css";
import { toggleAttribute } from "../../../src/core/dom";
import { svgFor } from "../../../src/core/dom/static-template";

/** @const {string} */
var TAG = 'amp-story-auto-ads';

/** @const {string} */
var AD_TAG = 'amp-ad';

/** @const {string} */
var MUSTACHE_TAG = 'amp-mustache';

/** @enum {string} */
export var Attributes = {
  AD_SHOWING: 'ad-showing',
  DESKTOP_ONE_PANEL: 'desktop-one-panel',
  DESKTOP_PANELS: 'desktop-panels',
  DIR: 'dir',
  PAUSED: 'paused'
};
export var AmpStoryAutoAds = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpStoryAutoAds, _AMP$BaseElement);

  var _super = _createSuper(AmpStoryAutoAds);

  /** @param {!AmpElement} element */
  function AmpStoryAutoAds(element) {
    var _this;

    _classCallCheck(this, AmpStoryAutoAds);

    _this = _super.call(this, element);

    /** @private */
    _this.doc_ = _this.win.document;

    /** @private {?../../amp-story/1.0/amp-story.AmpStory} */
    _this.ampStory_ = null;

    /** @private {?StoryAdPage} */
    _this.visibleAdPage_ = null;

    /** @private {!JsonObject} */
    _this.config_ = dict();

    /** @private {?Promise} */
    _this.analytics_ = null;

    /** @private {?Element} */
    _this.adBadgeContainer_ = null;

    /** @private {?Element} */
    _this.progressBarBackground_ = null;

    /** @private {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    _this.storeService_ = null;

    /** @private {?StoryAdPlacementAlgorithm} */
    _this.placementAlgorithm_ = null;

    /** @private {?StoryAdPageManager} */
    _this.adPageManager_ = null;
    return _this;
  }

  /** @override */
  _createClass(AmpStoryAutoAds, [{
    key: "buildCallback",
    value: function buildCallback() {
      var _this2 = this;

      return Services.storyStoreServiceForOrNull(this.win).then(function (storeService) {
        devAssert(storeService, 'Could not retrieve AmpStoryStoreService');
        _this2.storeService_ = storeService;

        if (!_this2.isAutomaticAdInsertionAllowed_()) {
          return;
        }

        var ampStoryElement = _this2.element.parentElement;
        userAssert(ampStoryElement.tagName === 'AMP-STORY', "<" + TAG + "> should be child of <amp-story>");

        var ampdoc = _this2.getAmpDoc();

        var extensionService = Services.extensionsFor(_this2.win);
        extensionService.
        /*OK*/
        installExtensionForDoc(ampdoc, AD_TAG);
        return ampStoryElement.getImpl().then(function (impl) {
          _this2.ampStory_ = impl;
        });
      });
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported() {
      return true;
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this3 = this;

      if (!this.isAutomaticAdInsertionAllowed_()) {
        return _resolvedPromise();
      }

      return this.ampStory_.signals().whenSignal(CommonSignals.INI_LOAD).then(function () {
        return _this3.handleConfig_();
      }).then(function () {
        _this3.adPageManager_ = new StoryAdPageManager(_this3.ampStory_, _this3.config_);
        divertStoryAdPlacements(_this3.win);
        divertStoryAdAutoAdvance(_this3.win);
        _this3.placementAlgorithm_ = getPlacementAlgo(_this3.win, _this3.storeService_, _this3.adPageManager_);

        // Bail out early on short stories.
        if (!_this3.placementAlgorithm_.isStoryEligible()) {
          return;
        }

        _this3.analytics_ = getServicePromiseForDoc(_this3.element, STORY_AD_ANALYTICS);

        _this3.createAdOverlay_();

        _this3.maybeCreateProgressBar_();

        _this3.initializeListeners_();

        _this3.initializePages_();
      });
    }
    /**
     * Force an immediate ad placement without waiting for ad being loaded,
     * and then navigate to the ad page.
     * @param {!StoryAdPage} adPage
     */

  }, {
    key: "forcePlaceAdAfterPage_",
    value: function forcePlaceAdAfterPage_(adPage) {
      var _this4 = this;

      var pageBeforeAdId =
      /** @type {string} */
      this.storeService_.get(StateProperty.CURRENT_PAGE_ID);
      adPage.registerLoadCallback(function () {
        return _this4.adPageManager_.maybeInsertPageAfter(pageBeforeAdId, adPage).then(function () {
          return _this4.navigateToFirstAdPage_(adPage);
        });
      });
    }
    /**
     * Fires event to navigate to ad page once inserted into the story.
     * @param {!StoryAdPage} adPage
     */

  }, {
    key: "navigateToFirstAdPage_",
    value: function navigateToFirstAdPage_(adPage) {
      var firstAdPageElement = adPage.getPageElement();
      // Setting distance manually to avoid flash of next page.
      firstAdPageElement.setAttribute('distance', '1');
      var payload = dict({
        'targetPageId': 'i-amphtml-ad-page-1',
        'direction': 'next'
      });
      var eventInit = {
        bubbles: true
      };
      dispatch(this.win, firstAdPageElement, EventType.SWITCH_PAGE, payload, eventInit);
    }
    /**
     * Sets config and installs additional extensions if necessary.
     * @private
     * @return {Promise}
     */

  }, {
    key: "handleConfig_",
    value: function handleConfig_() {
      var _this5 = this;

      return new StoryAdConfig(this.element, this.win).getConfig().then(function (config) {
        _this5.config_ = config;

        if (config['type'] === 'custom') {
          Services.extensionsFor(_this5.win).
          /*OK*/
          installExtensionForDoc(_this5.element.getAmpDoc(), MUSTACHE_TAG, 'latest');
        }

        return config;
      });
    }
    /**
     * Determines whether or not ad insertion is allowed based on how the story
     * is served, and the number of pages in the story.
     * @return {boolean}
     * @private
     */

  }, {
    key: "isAutomaticAdInsertionAllowed_",
    value: function isAutomaticAdInsertionAllowed_() {
      return !!this.storeService_.get(StateProperty.CAN_INSERT_AUTOMATIC_AD);
    }
    /**
     * Subscribes to all relevant state changes from the containing story.
     * @private
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this6 = this;

      this.storeService_.subscribe(StateProperty.AD_STATE, function (isAd) {
        _this6.onAdStateUpdate_(isAd);
      });
      this.storeService_.subscribe(StateProperty.RTL_STATE, function (rtlState) {
        _this6.onRtlStateUpdate_(rtlState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
        _this6.onUIStateUpdate_(uiState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, function (pageId) {
        var pageIndex = _this6.storeService_.get(StateProperty.CURRENT_PAGE_INDEX);

        _this6.handleActivePageChange_(dev().assertNumber(pageIndex), dev().assertString(pageId));
      });
    }
    /**
     * Reacts to the ad state updates and passes the information along as
     * attributes to the shadowed ad badge.
     * @param {boolean} isAd
     */

  }, {
    key: "onAdStateUpdate_",
    value: function onAdStateUpdate_(isAd) {
      var _this7 = this;

      this.mutateElement(function () {
        if (isAd) {
          _this7.adBadgeContainer_.setAttribute(Attributes.AD_SHOWING, '');

          // TODO(#33969) can no longer be null when launched.
          _this7.progressBarBackground_ && _this7.progressBarBackground_.setAttribute(Attributes.AD_SHOWING, '');
        } else {
          _this7.adBadgeContainer_.removeAttribute(Attributes.AD_SHOWING);

          // TODO(#33969) can no longer be null when launched.
          _this7.progressBarBackground_ && _this7.progressBarBackground_.removeAttribute(Attributes.AD_SHOWING);
        }
      });
    }
    /**
     * Reacts to the rtl state updates and passes the information along as
     * attributes to the shadowed ad badge.
     * @param {boolean} rtlState
     */

  }, {
    key: "onRtlStateUpdate_",
    value: function onRtlStateUpdate_(rtlState) {
      var _this8 = this;

      this.mutateElement(function () {
        rtlState ? _this8.adBadgeContainer_.setAttribute(Attributes.DIR, 'rtl') : _this8.adBadgeContainer_.removeAttribute(Attributes.DIR);
      });
    }
    /**
     * Reacts to UI state updates and passes the information along as
     * attributes to the shadowed ad badge.
     * @param {!UIType} uiState
     * @private
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      var _this9 = this;

      this.mutateElement(function () {
        var _this9$progressBarBac, _this9$progressBarBac2;

        var DESKTOP_ONE_PANEL = Attributes.DESKTOP_ONE_PANEL,
            DESKTOP_PANELS = Attributes.DESKTOP_PANELS;

        _this9.adBadgeContainer_.removeAttribute(DESKTOP_PANELS);

        _this9.adBadgeContainer_.removeAttribute(DESKTOP_ONE_PANEL);

        // TODO(#33969) can no longer be null when launched.
        (_this9$progressBarBac = _this9.progressBarBackground_) == null ? void 0 : _this9$progressBarBac.removeAttribute(DESKTOP_PANELS);
        (_this9$progressBarBac2 = _this9.progressBarBackground_) == null ? void 0 : _this9$progressBarBac2.removeAttribute(DESKTOP_ONE_PANEL);

        if (uiState === UIType.DESKTOP_PANELS) {
          var _this9$progressBarBac3;

          _this9.adBadgeContainer_.setAttribute(DESKTOP_PANELS, '');

          (_this9$progressBarBac3 = _this9.progressBarBackground_) == null ? void 0 : _this9$progressBarBac3.setAttribute(DESKTOP_PANELS, '');
        }

        if (uiState === UIType.DESKTOP_ONE_PANEL) {
          var _this9$progressBarBac4;

          _this9.adBadgeContainer_.setAttribute(DESKTOP_ONE_PANEL, '');

          (_this9$progressBarBac4 = _this9.progressBarBackground_) == null ? void 0 : _this9$progressBarBac4.setAttribute(DESKTOP_ONE_PANEL, '');
        }
      });
    }
    /**
     * Create a hidden UI that will be shown when ad is displayed
     * @private
     */

  }, {
    key: "createAdOverlay_",
    value: function createAdOverlay_() {
      var root = this.doc_.createElement('div');
      root.className = 'i-amphtml-ad-overlay-host';
      this.adBadgeContainer_ = this.doc_.createElement('aside');
      this.adBadgeContainer_.className = 'i-amphtml-ad-overlay-container';
      var badge = this.doc_.createElement('div');
      badge.className = 'i-amphtml-story-ad-badge';
      this.adBadgeContainer_.appendChild(badge);
      createShadowRootWithStyle(root, this.adBadgeContainer_, adBadgeCSS);
      var svg = svgFor(this.doc_);
      var badgeSVG = svg(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["<svg\n      width=\"39\"\n      height=\"31\"\n      viewBox=\"0 0 39 31\"\n      fill=\"none\"\n      class=\"i-amphtml-story-ad-badge-svg\"\n      xmlns=\"http://www.w3.org/2000/svg\"\n    >\n      <g filter=\"url(#filter0_d)\">\n        <path\n          d=\"M17.3672 19.3633H12.7441L11.8652 22H9.06152L13.8252 9.20312H16.2686L21.0586 22H18.2549L17.3672 19.3633ZM13.4561 17.2275H16.6553L15.0469 12.4375L13.4561 17.2275ZM22.1914 17.1748C22.1914 15.6924 22.5225 14.5117 23.1846 13.6328C23.8525 12.7539 24.7637 12.3145 25.918 12.3145C26.8438 12.3145 27.6084 12.6602 28.2119 13.3516V8.5H30.7607V22H28.4668L28.3438 20.9893C27.7109 21.7803 26.8965 22.1758 25.9004 22.1758C24.7812 22.1758 23.8818 21.7363 23.2021 20.8574C22.5283 19.9727 22.1914 18.7451 22.1914 17.1748ZM24.7314 17.3594C24.7314 18.25 24.8867 18.9326 25.1973 19.4072C25.5078 19.8818 25.959 20.1191 26.5508 20.1191C27.3359 20.1191 27.8896 19.7881 28.2119 19.126V15.373C27.8955 14.7109 27.3477 14.3799 26.5684 14.3799C25.3438 14.3799 24.7314 15.373 24.7314 17.3594Z\"\n          fill=\"white\"\n        ></path>\n        <path\n          d=\"M17.3672 19.3633L17.4857 19.3234L17.457 19.2383H17.3672V19.3633ZM12.7441 19.3633V19.2383H12.654L12.6256 19.3238L12.7441 19.3633ZM11.8652 22V22.125H11.9553L11.9838 22.0395L11.8652 22ZM9.06152 22L8.94438 21.9564L8.88161 22.125H9.06152V22ZM13.8252 9.20312V9.07812H13.7383L13.708 9.15952L13.8252 9.20312ZM16.2686 9.20312L16.3856 9.15931L16.3552 9.07812H16.2686V9.20312ZM21.0586 22V22.125H21.2389L21.1757 21.9562L21.0586 22ZM18.2549 22L18.1364 22.0399L18.1651 22.125H18.2549V22ZM13.4561 17.2275L13.3374 17.1881L13.2828 17.3525H13.4561V17.2275ZM16.6553 17.2275V17.3525H16.8291L16.7738 17.1877L16.6553 17.2275ZM15.0469 12.4375L15.1654 12.3977L15.0462 12.0429L14.9282 12.3981L15.0469 12.4375ZM17.3672 19.2383H12.7441V19.4883H17.3672V19.2383ZM12.6256 19.3238L11.7466 21.9605L11.9838 22.0395L12.8627 19.4028L12.6256 19.3238ZM11.8652 21.875H9.06152V22.125H11.8652V21.875ZM9.17867 22.0436L13.9423 9.24673L13.708 9.15952L8.94438 21.9564L9.17867 22.0436ZM13.8252 9.32812H16.2686V9.07812H13.8252V9.32812ZM16.1515 9.24694L20.9415 22.0438L21.1757 21.9562L16.3856 9.15931L16.1515 9.24694ZM21.0586 21.875H18.2549V22.125H21.0586V21.875ZM18.3733 21.9601L17.4857 19.3234L17.2487 19.4032L18.1364 22.0399L18.3733 21.9601ZM13.4561 17.3525H16.6553V17.1025H13.4561V17.3525ZM16.7738 17.1877L15.1654 12.3977L14.9284 12.4773L16.5368 17.2673L16.7738 17.1877ZM14.9282 12.3981L13.3374 17.1881L13.5747 17.2669L15.1655 12.4769L14.9282 12.3981ZM23.1846 13.6328L23.085 13.5572L23.0847 13.5576L23.1846 13.6328ZM28.2119 13.3516L28.1177 13.4338L28.3369 13.6849V13.3516H28.2119ZM28.2119 8.5V8.375H28.0869V8.5H28.2119ZM30.7607 8.5H30.8857V8.375H30.7607V8.5ZM30.7607 22V22.125H30.8857V22H30.7607ZM28.4668 22L28.3427 22.0151L28.3561 22.125H28.4668V22ZM28.3438 20.9893L28.4678 20.9742L28.4319 20.679L28.2461 20.9112L28.3438 20.9893ZM23.2021 20.8574L23.1027 20.9332L23.1033 20.9339L23.2021 20.8574ZM28.2119 19.126L28.3243 19.1807L28.3369 19.1548V19.126H28.2119ZM28.2119 15.373H28.3369V15.3447L28.3247 15.3192L28.2119 15.373ZM22.3164 17.1748C22.3164 15.7102 22.6435 14.5588 23.2844 13.708L23.0847 13.5576C22.4015 14.4646 22.0664 15.6746 22.0664 17.1748H22.3164ZM23.2841 13.7084C23.9272 12.8623 24.8007 12.4395 25.918 12.4395V12.1895C24.7267 12.1895 23.7779 12.6455 23.0851 13.5572L23.2841 13.7084ZM25.918 12.4395C26.808 12.4395 27.5382 12.7698 28.1177 13.4338L28.3061 13.2694C27.6786 12.5505 26.8795 12.1895 25.918 12.1895V12.4395ZM28.3369 13.3516V8.5H28.0869V13.3516H28.3369ZM28.2119 8.625H30.7607V8.375H28.2119V8.625ZM30.6357 8.5V22H30.8857V8.5H30.6357ZM30.7607 21.875H28.4668V22.125H30.7607V21.875ZM28.5909 21.9849L28.4678 20.9742L28.2197 21.0044L28.3427 22.0151L28.5909 21.9849ZM28.2461 20.9112C27.6366 21.6731 26.8578 22.0508 25.9004 22.0508V22.3008C26.9352 22.3008 27.7853 21.8874 28.4414 21.0673L28.2461 20.9112ZM25.9004 22.0508C24.8196 22.0508 23.9568 21.629 23.301 20.781L23.1033 20.9339C23.8068 21.8437 24.7429 22.3008 25.9004 22.3008V22.0508ZM23.3016 20.7817C22.65 19.9261 22.3164 18.7287 22.3164 17.1748H22.0664C22.0664 18.7615 22.4067 20.0193 23.1027 20.9332L23.3016 20.7817ZM24.6064 17.3594C24.6064 18.2616 24.7632 18.9722 25.0927 19.4757L25.3019 19.3388C25.0102 18.8931 24.8564 18.2384 24.8564 17.3594H24.6064ZM25.0927 19.4757C25.4275 19.9874 25.919 20.2441 26.5508 20.2441V19.9941C25.999 19.9941 25.5881 19.7763 25.3019 19.3388L25.0927 19.4757ZM26.5508 20.2441C26.961 20.2441 27.319 20.1575 27.6191 19.9781C27.9196 19.7984 28.1541 19.5304 28.3243 19.1807L28.0995 19.0713C27.9475 19.3837 27.744 19.6122 27.4908 19.7636C27.2371 19.9152 26.9257 19.9941 26.5508 19.9941V20.2441ZM28.3369 19.126V15.373H28.0869V19.126H28.3369ZM28.3247 15.3192C28.1576 14.9694 27.9261 14.7011 27.6284 14.5212C27.3311 14.3416 26.9758 14.2549 26.5684 14.2549V14.5049C26.9402 14.5049 27.2485 14.5837 27.4991 14.7352C27.7492 14.8863 27.9499 15.1146 28.0991 15.4269L28.3247 15.3192ZM26.5684 14.2549C25.9153 14.2549 25.4145 14.5235 25.0843 15.0592C24.7601 15.5849 24.6064 16.3574 24.6064 17.3594H24.8564C24.8564 16.375 25.0089 15.6578 25.2971 15.1904C25.5791 14.7329 25.9968 14.5049 26.5684 14.5049V14.2549Z\"\n          fill=\"white\"\n        ></path>\n      </g>\n      <defs>\n        <filter\n          id=\"filter0_d\"\n          x=\"0.881836\"\n          y=\"0.375\"\n          width=\"38.0041\"\n          height=\"29.9258\"\n          filterUnits=\"userSpaceOnUse\"\n          color-interpolation-filters=\"sRGB\"\n        >\n          <feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\" />\n          <feColorMatrix\n            in=\"SourceAlpha\"\n            type=\"matrix\"\n            values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\"\n          />\n          <feOffset />\n          <feGaussianBlur stdDeviation=\"4\" />\n          <feColorMatrix\n            type=\"matrix\"\n            values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0\"\n          />\n          <feBlend\n            mode=\"normal\"\n            in2=\"BackgroundImageFix\"\n            result=\"effect1_dropShadow\"\n          />\n          <feBlend\n            mode=\"normal\"\n            in=\"SourceGraphic\"\n            in2=\"effect1_dropShadow\"\n            result=\"shape\"\n          />\n        </filter>\n      </defs>\n    </svg> "])));
      badge.appendChild(badgeSVG);
      this.ampStory_.element.appendChild(root);
    }
    /**
     * Create progress bar if auto advance exp is on.
     * TODO(#33969) move to chosen UI and delete the others.
     */

  }, {
    key: "maybeCreateProgressBar_",
    value: function maybeCreateProgressBar_() {
      var autoAdvanceExpBranch = getExperimentBranch(this.win, StoryAdAutoAdvance.ID);
      var storyNextUpParam = Services.viewerForDoc(this.element).getParam('storyNextUp');

      if (storyNextUpParam && ViewerSetTimeToBranch[storyNextUpParam]) {
        // Actual progress bar creation handled in progress-bar.js.
        forceExperimentBranch(this.win, StoryAdSegmentExp.ID, ViewerSetTimeToBranch[storyNextUpParam]);
      } else if (autoAdvanceExpBranch && autoAdvanceExpBranch !== StoryAdAutoAdvance.CONTROL) {
        this.createProgressBar_(AdvanceExpToTime[autoAdvanceExpBranch]);
      } else if (storyNextUpParam) {
        this.createProgressBar_(storyNextUpParam);
      }
    }
    /**
     * Create progress bar that will be shown when ad is advancing.
     * @param {string} time
     */

  }, {
    key: "createProgressBar_",
    value: function createProgressBar_(time) {
      var _this10 = this;

      var progressBar = this.doc_.createElement('div');
      progressBar.className = 'i-amphtml-story-ad-progress-bar';
      setStyle(progressBar, 'animationDuration', time);
      this.progressBarBackground_ = this.doc_.createElement('div');
      this.progressBarBackground_.className = 'i-amphtml-story-ad-progress-background';
      var host = this.doc_.createElement('div');
      host.className = 'i-amphtml-story-ad-progress-bar-host';
      this.progressBarBackground_.appendChild(progressBar);
      createShadowRootWithStyle(host, this.progressBarBackground_, progessBarCSS);
      this.ampStory_.element.appendChild(host);
      // TODO(#33969) move this to init listeners when no longer conditional.
      this.storeService_.subscribe(StateProperty.PAUSED_STATE, function (isPaused) {
        _this10.onPauseStateUpdate_(isPaused);
      });
    }
    /**
     * If video is paused and ad is showing pause the progress bar.
     * @param {boolean} isPaused
     */

  }, {
    key: "onPauseStateUpdate_",
    value: function onPauseStateUpdate_(isPaused) {
      var adShowing = this.storeService_.get(StateProperty.AD_STATE);

      if (!adShowing) {
        return;
      }

      toggleAttribute(this.progressBarBackground_, Attributes.PAUSED, isPaused);
    }
    /**
     * Create new page containing ad and start preloading.
     * @private
     */

  }, {
    key: "initializePages_",
    value: function initializePages_() {
      var pages = this.placementAlgorithm_.initializePages();
      this.maybeForceAdPlacement_(devAssert(pages[0]));
    }
    /**
     * Development mode forces navigation to ad page for better dev-x.
     * @param {StoryAdPage} adPage
     */

  }, {
    key: "maybeForceAdPlacement_",
    value: function maybeForceAdPlacement_(adPage) {
      if (this.element.hasAttribute('development') && this.config_['type'] === 'fake') {
        this.forcePlaceAdAfterPage_(adPage);
      }
    }
    /**
     * Respond to page navigation event. This method is not called for the first
     * page that is shown on load.
     * @param {number} pageIndex Does not update when ad is showing.
     * @param {string} pageId
     * @private
     */

  }, {
    key: "handleActivePageChange_",
    value: function handleActivePageChange_(pageIndex, pageId) {
      if (this.adPageManager_.numberOfAdsCreated() === 0) {
        // This is protection against us running our placement algorithm in a
        // story where no ads have been created. Most likely because INI_LOAD on
        // the story has not fired yet but we still are receiving page changes.
        return;
      }

      this.placementAlgorithm_.onPageChange(pageId);

      if (this.visibleAdPage_) {
        this.transitionFromAdShowing_();
      }

      if (this.adPageManager_.hasId(pageId)) {
        this.transitionToAdShowing_(pageIndex, pageId);
      }
    }
    /**
     * Called when switching away from an ad.
     */

  }, {
    key: "transitionFromAdShowing_",
    value: function transitionFromAdShowing_() {
      var _this$analyticsEvent_;

      // We are transitioning away from an ad
      var adPageId = this.visibleAdPage_.getId();
      var adIndex = this.adPageManager_.getIndexById(adPageId);
      this.removeVisibleAttribute_();
      // Fire the exit event.
      this.analyticsEvent_(AnalyticsEvents.AD_EXITED, (_this$analyticsEvent_ = {}, _this$analyticsEvent_[AnalyticsVars.AD_EXITED] = Date.now(), _this$analyticsEvent_[AnalyticsVars.AD_INDEX] = adIndex, _this$analyticsEvent_));
    }
    /**
     * We are switching to an ad.
     * @param {number} pageIndex
     * @param {string} adPageId
     */

  }, {
    key: "transitionToAdShowing_",
    value: function transitionToAdShowing_(pageIndex, adPageId) {
      var _this$analyticsEvent_2;

      var adPage = this.adPageManager_.getAdPageById(adPageId);
      var adIndex = this.adPageManager_.getIndexById(adPageId);

      if (!adPage.hasBeenViewed()) {
        this.placementAlgorithm_.onNewAdView(pageIndex);
      }

      // Tell the iframe that it is visible.
      this.setVisibleAttribute_(adPage);
      // Fire the view event on the corresponding Ad.
      this.analyticsEvent_(AnalyticsEvents.AD_VIEWED, (_this$analyticsEvent_2 = {}, _this$analyticsEvent_2[AnalyticsVars.AD_VIEWED] = Date.now(), _this$analyticsEvent_2[AnalyticsVars.AD_INDEX] = adIndex, _this$analyticsEvent_2));
    }
    /**
     * Sets a `amp-story-visible` attribute on the fie body so that embedded ads
     * can know when they are visible and do things like trigger animations.
     * @param {StoryAdPage} adPage
     */

  }, {
    key: "setVisibleAttribute_",
    value: function setVisibleAttribute_(adPage) {
      var _this11 = this;

      this.mutateElement(function () {
        adPage.toggleVisibility();
        _this11.visibleAdPage_ = adPage;
      });
    }
    /**
     *  Removes `amp-story-visible` attribute from the fie body.
     */

  }, {
    key: "removeVisibleAttribute_",
    value: function removeVisibleAttribute_() {
      var _this12 = this;

      this.mutateElement(function () {
        if (_this12.visibleAdPage_) {
          _this12.visibleAdPage_.toggleVisibility();

          _this12.visibleAdPage_ = null;
        }
      });
    }
    /**
     * Construct an analytics event and trigger it.
     * @param {string} eventType
     * @param {!Object<string, number>} vars A map of vars and their values.
     * @private
     */

  }, {
    key: "analyticsEvent_",
    value: function analyticsEvent_(eventType, vars) {
      var _this13 = this;

      this.analytics_.then(function (analytics) {
        return analytics.fireEvent(_this13.element, vars['adIndex'], eventType, vars);
      });
    }
  }]);

  return AmpStoryAutoAds;
}(AMP.BaseElement);
AMP.extension('amp-story-auto-ads', '0.1', function (AMP) {
  AMP.registerElement('amp-story-auto-ads', AmpStoryAutoAds, CSS + sharedCSS);
  AMP.registerServiceForDoc(STORY_AD_ANALYTICS, StoryAdAnalytics);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1hdXRvLWFkcy5qcyJdLCJuYW1lcyI6WyJBZHZhbmNlRXhwVG9UaW1lIiwiU3RvcnlBZEF1dG9BZHZhbmNlIiwiZGl2ZXJ0U3RvcnlBZEF1dG9BZHZhbmNlIiwiQW5hbHl0aWNzRXZlbnRzIiwiQW5hbHl0aWNzVmFycyIsIlNUT1JZX0FEX0FOQUxZVElDUyIsIlN0b3J5QWRBbmFseXRpY3MiLCJDU1MiLCJDb21tb25TaWduYWxzIiwiRXZlbnRUeXBlIiwiZGlzcGF0Y2giLCJTZXJ2aWNlcyIsIlN0YXRlUHJvcGVydHkiLCJVSVR5cGUiLCJTdG9yeUFkQ29uZmlnIiwiU3RvcnlBZFBhZ2VNYW5hZ2VyIiwiU3RvcnlBZFNlZ21lbnRFeHAiLCJWaWV3ZXJTZXRUaW1lVG9CcmFuY2giLCJhZEJhZGdlQ1NTIiwiY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSIsImRldiIsImRldkFzc2VydCIsInVzZXJBc3NlcnQiLCJkaWN0IiwiZGl2ZXJ0U3RvcnlBZFBsYWNlbWVudHMiLCJmb3JjZUV4cGVyaW1lbnRCcmFuY2giLCJnZXRFeHBlcmltZW50QnJhbmNoIiwiZ2V0UGxhY2VtZW50QWxnbyIsImdldFNlcnZpY2VQcm9taXNlRm9yRG9jIiwicHJvZ2Vzc0JhckNTUyIsInNldFN0eWxlIiwic2hhcmVkQ1NTIiwidG9nZ2xlQXR0cmlidXRlIiwic3ZnRm9yIiwiVEFHIiwiQURfVEFHIiwiTVVTVEFDSEVfVEFHIiwiQXR0cmlidXRlcyIsIkFEX1NIT1dJTkciLCJERVNLVE9QX09ORV9QQU5FTCIsIkRFU0tUT1BfUEFORUxTIiwiRElSIiwiUEFVU0VEIiwiQW1wU3RvcnlBdXRvQWRzIiwiZWxlbWVudCIsImRvY18iLCJ3aW4iLCJkb2N1bWVudCIsImFtcFN0b3J5XyIsInZpc2libGVBZFBhZ2VfIiwiY29uZmlnXyIsImFuYWx5dGljc18iLCJhZEJhZGdlQ29udGFpbmVyXyIsInByb2dyZXNzQmFyQmFja2dyb3VuZF8iLCJzdG9yZVNlcnZpY2VfIiwicGxhY2VtZW50QWxnb3JpdGhtXyIsImFkUGFnZU1hbmFnZXJfIiwic3RvcnlTdG9yZVNlcnZpY2VGb3JPck51bGwiLCJ0aGVuIiwic3RvcmVTZXJ2aWNlIiwiaXNBdXRvbWF0aWNBZEluc2VydGlvbkFsbG93ZWRfIiwiYW1wU3RvcnlFbGVtZW50IiwicGFyZW50RWxlbWVudCIsInRhZ05hbWUiLCJhbXBkb2MiLCJnZXRBbXBEb2MiLCJleHRlbnNpb25TZXJ2aWNlIiwiZXh0ZW5zaW9uc0ZvciIsImluc3RhbGxFeHRlbnNpb25Gb3JEb2MiLCJnZXRJbXBsIiwiaW1wbCIsInNpZ25hbHMiLCJ3aGVuU2lnbmFsIiwiSU5JX0xPQUQiLCJoYW5kbGVDb25maWdfIiwiaXNTdG9yeUVsaWdpYmxlIiwiY3JlYXRlQWRPdmVybGF5XyIsIm1heWJlQ3JlYXRlUHJvZ3Jlc3NCYXJfIiwiaW5pdGlhbGl6ZUxpc3RlbmVyc18iLCJpbml0aWFsaXplUGFnZXNfIiwiYWRQYWdlIiwicGFnZUJlZm9yZUFkSWQiLCJnZXQiLCJDVVJSRU5UX1BBR0VfSUQiLCJyZWdpc3RlckxvYWRDYWxsYmFjayIsIm1heWJlSW5zZXJ0UGFnZUFmdGVyIiwibmF2aWdhdGVUb0ZpcnN0QWRQYWdlXyIsImZpcnN0QWRQYWdlRWxlbWVudCIsImdldFBhZ2VFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwicGF5bG9hZCIsImV2ZW50SW5pdCIsImJ1YmJsZXMiLCJTV0lUQ0hfUEFHRSIsImdldENvbmZpZyIsImNvbmZpZyIsIkNBTl9JTlNFUlRfQVVUT01BVElDX0FEIiwic3Vic2NyaWJlIiwiQURfU1RBVEUiLCJpc0FkIiwib25BZFN0YXRlVXBkYXRlXyIsIlJUTF9TVEFURSIsInJ0bFN0YXRlIiwib25SdGxTdGF0ZVVwZGF0ZV8iLCJVSV9TVEFURSIsInVpU3RhdGUiLCJvblVJU3RhdGVVcGRhdGVfIiwicGFnZUlkIiwicGFnZUluZGV4IiwiQ1VSUkVOVF9QQUdFX0lOREVYIiwiaGFuZGxlQWN0aXZlUGFnZUNoYW5nZV8iLCJhc3NlcnROdW1iZXIiLCJhc3NlcnRTdHJpbmciLCJtdXRhdGVFbGVtZW50IiwicmVtb3ZlQXR0cmlidXRlIiwicm9vdCIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJiYWRnZSIsImFwcGVuZENoaWxkIiwic3ZnIiwiYmFkZ2VTVkciLCJhdXRvQWR2YW5jZUV4cEJyYW5jaCIsIklEIiwic3RvcnlOZXh0VXBQYXJhbSIsInZpZXdlckZvckRvYyIsImdldFBhcmFtIiwiQ09OVFJPTCIsImNyZWF0ZVByb2dyZXNzQmFyXyIsInRpbWUiLCJwcm9ncmVzc0JhciIsImhvc3QiLCJQQVVTRURfU1RBVEUiLCJpc1BhdXNlZCIsIm9uUGF1c2VTdGF0ZVVwZGF0ZV8iLCJhZFNob3dpbmciLCJwYWdlcyIsImluaXRpYWxpemVQYWdlcyIsIm1heWJlRm9yY2VBZFBsYWNlbWVudF8iLCJoYXNBdHRyaWJ1dGUiLCJmb3JjZVBsYWNlQWRBZnRlclBhZ2VfIiwibnVtYmVyT2ZBZHNDcmVhdGVkIiwib25QYWdlQ2hhbmdlIiwidHJhbnNpdGlvbkZyb21BZFNob3dpbmdfIiwiaGFzSWQiLCJ0cmFuc2l0aW9uVG9BZFNob3dpbmdfIiwiYWRQYWdlSWQiLCJnZXRJZCIsImFkSW5kZXgiLCJnZXRJbmRleEJ5SWQiLCJyZW1vdmVWaXNpYmxlQXR0cmlidXRlXyIsImFuYWx5dGljc0V2ZW50XyIsIkFEX0VYSVRFRCIsIkRhdGUiLCJub3ciLCJBRF9JTkRFWCIsImdldEFkUGFnZUJ5SWQiLCJoYXNCZWVuVmlld2VkIiwib25OZXdBZFZpZXciLCJzZXRWaXNpYmxlQXR0cmlidXRlXyIsIkFEX1ZJRVdFRCIsInRvZ2dsZVZpc2liaWxpdHkiLCJldmVudFR5cGUiLCJ2YXJzIiwiYW5hbHl0aWNzIiwiZmlyZUV2ZW50IiwiQU1QIiwiQmFzZUVsZW1lbnQiLCJleHRlbnNpb24iLCJyZWdpc3RlckVsZW1lbnQiLCJyZWdpc3RlclNlcnZpY2VGb3JEb2MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7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QUwsR0FBc0IrQixNQUF0QjtBQUNELE9BSEQ7QUFJRDtBQUVEO0FBQ0Y7QUFDQTs7QUFwZ0JBO0FBQUE7QUFBQSxXQXFnQkUsbUNBQTBCO0FBQUE7O0FBQ3hCLFdBQUtpQyxhQUFMLENBQW1CLFlBQU07QUFDdkIsWUFBSSxPQUFJLENBQUNoRSxjQUFULEVBQXlCO0FBQ3ZCLFVBQUEsT0FBSSxDQUFDQSxjQUFMLENBQW9CZ0gsZ0JBQXBCOztBQUNBLFVBQUEsT0FBSSxDQUFDaEgsY0FBTCxHQUFzQixJQUF0QjtBQUNEO0FBQ0YsT0FMRDtBQU1EO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW5oQkE7QUFBQTtBQUFBLFdBb2hCRSx5QkFBZ0JpSCxTQUFoQixFQUEyQkMsSUFBM0IsRUFBaUM7QUFBQTs7QUFDL0IsV0FBS2hILFVBQUwsQ0FBZ0JPLElBQWhCLENBQXFCLFVBQUMwRyxTQUFEO0FBQUEsZUFDbkJBLFNBQVMsQ0FBQ0MsU0FBVixDQUFvQixPQUFJLENBQUN6SCxPQUF6QixFQUFrQ3VILElBQUksQ0FBQyxTQUFELENBQXRDLEVBQW1ERCxTQUFuRCxFQUE4REMsSUFBOUQsQ0FEbUI7QUFBQSxPQUFyQjtBQUdEO0FBeGhCSDs7QUFBQTtBQUFBLEVBQXFDRyxHQUFHLENBQUNDLFdBQXpDO0FBMmhCQUQsR0FBRyxDQUFDRSxTQUFKLENBQWMsb0JBQWQsRUFBb0MsS0FBcEMsRUFBMkMsVUFBQ0YsR0FBRCxFQUFTO0FBQ2xEQSxFQUFBQSxHQUFHLENBQUNHLGVBQUosQ0FBb0Isb0JBQXBCLEVBQTBDOUgsZUFBMUMsRUFBMkRwQyxHQUFHLEdBQUd3QixTQUFqRTtBQUNBdUksRUFBQUEsR0FBRyxDQUFDSSxxQkFBSixDQUEwQnJLLGtCQUExQixFQUE4Q0MsZ0JBQTlDO0FBQ0QsQ0FIRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBBZHZhbmNlRXhwVG9UaW1lLFxuICBTdG9yeUFkQXV0b0FkdmFuY2UsXG4gIGRpdmVydFN0b3J5QWRBdXRvQWR2YW5jZSxcbn0gZnJvbSAnI2V4cGVyaW1lbnRzL3N0b3J5LWFkLWF1dG8tYWR2YW5jZSc7XG5pbXBvcnQge1xuICBBbmFseXRpY3NFdmVudHMsXG4gIEFuYWx5dGljc1ZhcnMsXG4gIFNUT1JZX0FEX0FOQUxZVElDUyxcbiAgU3RvcnlBZEFuYWx5dGljcyxcbn0gZnJvbSAnLi9zdG9yeS1hZC1hbmFseXRpY3MnO1xuaW1wb3J0IHtDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1hdXRvLWFkcy0wLjEuY3NzJztcbmltcG9ydCB7Q29tbW9uU2lnbmFsc30gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2NvbW1vbi1zaWduYWxzJztcbmltcG9ydCB7RXZlbnRUeXBlLCBkaXNwYXRjaH0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC9ldmVudHMnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtcbiAgU3RhdGVQcm9wZXJ0eSxcbiAgVUlUeXBlLFxufSBmcm9tICcuLi8uLi9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7U3RvcnlBZENvbmZpZ30gZnJvbSAnLi9zdG9yeS1hZC1jb25maWcnO1xuaW1wb3J0IHtTdG9yeUFkUGFnZU1hbmFnZXJ9IGZyb20gJy4vc3RvcnktYWQtcGFnZS1tYW5hZ2VyJztcbmltcG9ydCB7XG4gIFN0b3J5QWRTZWdtZW50RXhwLFxuICBWaWV3ZXJTZXRUaW1lVG9CcmFuY2gsXG59IGZyb20gJyNleHBlcmltZW50cy9zdG9yeS1hZC1wcm9ncmVzcy1zZWdtZW50JztcbmltcG9ydCB7Q1NTIGFzIGFkQmFkZ2VDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1hdXRvLWFkcy1hZC1iYWRnZS0wLjEuY3NzJztcbmltcG9ydCB7Y3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZX0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC91dGlscyc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0LCB1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7ZGljdH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7ZGl2ZXJ0U3RvcnlBZFBsYWNlbWVudHN9IGZyb20gJyNleHBlcmltZW50cy9zdG9yeS1hZC1wbGFjZW1lbnRzJztcbmltcG9ydCB7Zm9yY2VFeHBlcmltZW50QnJhbmNoLCBnZXRFeHBlcmltZW50QnJhbmNofSBmcm9tICcjZXhwZXJpbWVudHMnO1xuaW1wb3J0IHtnZXRQbGFjZW1lbnRBbGdvfSBmcm9tICcuL2FsZ29yaXRobS11dGlscyc7XG5pbXBvcnQge2dldFNlcnZpY2VQcm9taXNlRm9yRG9jfSBmcm9tICcuLi8uLi8uLi9zcmMvc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7Q1NTIGFzIHByb2dlc3NCYXJDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1hdXRvLWFkcy1wcm9ncmVzcy1iYXItMC4xLmNzcyc7XG5pbXBvcnQge3NldFN0eWxlfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHtDU1MgYXMgc2hhcmVkQ1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3RvcnktYXV0by1hZHMtc2hhcmVkLTAuMS5jc3MnO1xuaW1wb3J0IHt0b2dnbGVBdHRyaWJ1dGV9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge3N2Z0Zvcn0gZnJvbSAnI2NvcmUvZG9tL3N0YXRpYy10ZW1wbGF0ZSc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdhbXAtc3RvcnktYXV0by1hZHMnO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBBRF9UQUcgPSAnYW1wLWFkJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgTVVTVEFDSEVfVEFHID0gJ2FtcC1tdXN0YWNoZSc7XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZXMgPSB7XG4gIEFEX1NIT1dJTkc6ICdhZC1zaG93aW5nJyxcbiAgREVTS1RPUF9PTkVfUEFORUw6ICdkZXNrdG9wLW9uZS1wYW5lbCcsXG4gIERFU0tUT1BfUEFORUxTOiAnZGVza3RvcC1wYW5lbHMnLFxuICBESVI6ICdkaXInLFxuICBQQVVTRUQ6ICdwYXVzZWQnLFxufTtcblxuZXhwb3J0IGNsYXNzIEFtcFN0b3J5QXV0b0FkcyBleHRlbmRzIEFNUC5CYXNlRWxlbWVudCB7XG4gIC8qKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50ICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50KTtcblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuZG9jXyA9IHRoaXMud2luLmRvY3VtZW50O1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3RvcnkuQW1wU3Rvcnl9ICovXG4gICAgdGhpcy5hbXBTdG9yeV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/U3RvcnlBZFBhZ2V9ICovXG4gICAgdGhpcy52aXNpYmxlQWRQYWdlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgeyFKc29uT2JqZWN0fSAqL1xuICAgIHRoaXMuY29uZmlnXyA9IGRpY3QoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1Byb21pc2V9ICovXG4gICAgdGhpcy5hbmFseXRpY3NfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5hZEJhZGdlQ29udGFpbmVyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMucHJvZ3Jlc3NCYXJCYWNrZ3JvdW5kXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez8uLi8uLi9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9TdG9yeUFkUGxhY2VtZW50QWxnb3JpdGhtfSAqL1xuICAgIHRoaXMucGxhY2VtZW50QWxnb3JpdGhtXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9TdG9yeUFkUGFnZU1hbmFnZXJ9ICovXG4gICAgdGhpcy5hZFBhZ2VNYW5hZ2VyXyA9IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGJ1aWxkQ2FsbGJhY2soKSB7XG4gICAgcmV0dXJuIFNlcnZpY2VzLnN0b3J5U3RvcmVTZXJ2aWNlRm9yT3JOdWxsKHRoaXMud2luKS50aGVuKFxuICAgICAgKHN0b3JlU2VydmljZSkgPT4ge1xuICAgICAgICBkZXZBc3NlcnQoc3RvcmVTZXJ2aWNlLCAnQ291bGQgbm90IHJldHJpZXZlIEFtcFN0b3J5U3RvcmVTZXJ2aWNlJyk7XG4gICAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IHN0b3JlU2VydmljZTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNBdXRvbWF0aWNBZEluc2VydGlvbkFsbG93ZWRfKCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhbXBTdG9yeUVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgdXNlckFzc2VydChcbiAgICAgICAgICBhbXBTdG9yeUVsZW1lbnQudGFnTmFtZSA9PT0gJ0FNUC1TVE9SWScsXG4gICAgICAgICAgYDwke1RBR30+IHNob3VsZCBiZSBjaGlsZCBvZiA8YW1wLXN0b3J5PmBcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBhbXBkb2MgPSB0aGlzLmdldEFtcERvYygpO1xuICAgICAgICBjb25zdCBleHRlbnNpb25TZXJ2aWNlID0gU2VydmljZXMuZXh0ZW5zaW9uc0Zvcih0aGlzLndpbik7XG4gICAgICAgIGV4dGVuc2lvblNlcnZpY2UuLypPSyovIGluc3RhbGxFeHRlbnNpb25Gb3JEb2MoYW1wZG9jLCBBRF9UQUcpO1xuICAgICAgICByZXR1cm4gYW1wU3RvcnlFbGVtZW50LmdldEltcGwoKS50aGVuKChpbXBsKSA9PiB7XG4gICAgICAgICAgdGhpcy5hbXBTdG9yeV8gPSBpbXBsO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0xheW91dFN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbGF5b3V0Q2FsbGJhY2soKSB7XG4gICAgaWYgKCF0aGlzLmlzQXV0b21hdGljQWRJbnNlcnRpb25BbGxvd2VkXygpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFtcFN0b3J5X1xuICAgICAgLnNpZ25hbHMoKVxuICAgICAgLndoZW5TaWduYWwoQ29tbW9uU2lnbmFscy5JTklfTE9BRClcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuaGFuZGxlQ29uZmlnXygpKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmFkUGFnZU1hbmFnZXJfID0gbmV3IFN0b3J5QWRQYWdlTWFuYWdlcihcbiAgICAgICAgICB0aGlzLmFtcFN0b3J5XyxcbiAgICAgICAgICB0aGlzLmNvbmZpZ19cbiAgICAgICAgKTtcbiAgICAgICAgZGl2ZXJ0U3RvcnlBZFBsYWNlbWVudHModGhpcy53aW4pO1xuICAgICAgICBkaXZlcnRTdG9yeUFkQXV0b0FkdmFuY2UodGhpcy53aW4pO1xuICAgICAgICB0aGlzLnBsYWNlbWVudEFsZ29yaXRobV8gPSBnZXRQbGFjZW1lbnRBbGdvKFxuICAgICAgICAgIHRoaXMud2luLFxuICAgICAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyxcbiAgICAgICAgICB0aGlzLmFkUGFnZU1hbmFnZXJfXG4gICAgICAgICk7XG4gICAgICAgIC8vIEJhaWwgb3V0IGVhcmx5IG9uIHNob3J0IHN0b3JpZXMuXG4gICAgICAgIGlmICghdGhpcy5wbGFjZW1lbnRBbGdvcml0aG1fLmlzU3RvcnlFbGlnaWJsZSgpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5hbHl0aWNzXyA9IGdldFNlcnZpY2VQcm9taXNlRm9yRG9jKFxuICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICBTVE9SWV9BRF9BTkFMWVRJQ1NcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBZE92ZXJsYXlfKCk7XG4gICAgICAgIHRoaXMubWF5YmVDcmVhdGVQcm9ncmVzc0Jhcl8oKTtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplTGlzdGVuZXJzXygpO1xuICAgICAgICB0aGlzLmluaXRpYWxpemVQYWdlc18oKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlIGFuIGltbWVkaWF0ZSBhZCBwbGFjZW1lbnQgd2l0aG91dCB3YWl0aW5nIGZvciBhZCBiZWluZyBsb2FkZWQsXG4gICAqIGFuZCB0aGVuIG5hdmlnYXRlIHRvIHRoZSBhZCBwYWdlLlxuICAgKiBAcGFyYW0geyFTdG9yeUFkUGFnZX0gYWRQYWdlXG4gICAqL1xuICBmb3JjZVBsYWNlQWRBZnRlclBhZ2VfKGFkUGFnZSkge1xuICAgIGNvbnN0IHBhZ2VCZWZvcmVBZElkID0gLyoqIEB0eXBlIHtzdHJpbmd9ICovIChcbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5DVVJSRU5UX1BBR0VfSUQpXG4gICAgKTtcbiAgICBhZFBhZ2UucmVnaXN0ZXJMb2FkQ2FsbGJhY2soKCkgPT5cbiAgICAgIHRoaXMuYWRQYWdlTWFuYWdlcl9cbiAgICAgICAgLm1heWJlSW5zZXJ0UGFnZUFmdGVyKHBhZ2VCZWZvcmVBZElkLCBhZFBhZ2UpXG4gICAgICAgIC50aGVuKCgpID0+IHRoaXMubmF2aWdhdGVUb0ZpcnN0QWRQYWdlXyhhZFBhZ2UpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRmlyZXMgZXZlbnQgdG8gbmF2aWdhdGUgdG8gYWQgcGFnZSBvbmNlIGluc2VydGVkIGludG8gdGhlIHN0b3J5LlxuICAgKiBAcGFyYW0geyFTdG9yeUFkUGFnZX0gYWRQYWdlXG4gICAqL1xuICBuYXZpZ2F0ZVRvRmlyc3RBZFBhZ2VfKGFkUGFnZSkge1xuICAgIGNvbnN0IGZpcnN0QWRQYWdlRWxlbWVudCA9IGFkUGFnZS5nZXRQYWdlRWxlbWVudCgpO1xuICAgIC8vIFNldHRpbmcgZGlzdGFuY2UgbWFudWFsbHkgdG8gYXZvaWQgZmxhc2ggb2YgbmV4dCBwYWdlLlxuICAgIGZpcnN0QWRQYWdlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2Rpc3RhbmNlJywgJzEnKTtcbiAgICBjb25zdCBwYXlsb2FkID0gZGljdCh7XG4gICAgICAndGFyZ2V0UGFnZUlkJzogJ2ktYW1waHRtbC1hZC1wYWdlLTEnLFxuICAgICAgJ2RpcmVjdGlvbic6ICduZXh0JyxcbiAgICB9KTtcbiAgICBjb25zdCBldmVudEluaXQgPSB7YnViYmxlczogdHJ1ZX07XG4gICAgZGlzcGF0Y2goXG4gICAgICB0aGlzLndpbixcbiAgICAgIGZpcnN0QWRQYWdlRWxlbWVudCxcbiAgICAgIEV2ZW50VHlwZS5TV0lUQ0hfUEFHRSxcbiAgICAgIHBheWxvYWQsXG4gICAgICBldmVudEluaXRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgY29uZmlnIGFuZCBpbnN0YWxscyBhZGRpdGlvbmFsIGV4dGVuc2lvbnMgaWYgbmVjZXNzYXJ5LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgaGFuZGxlQ29uZmlnXygpIHtcbiAgICByZXR1cm4gbmV3IFN0b3J5QWRDb25maWcodGhpcy5lbGVtZW50LCB0aGlzLndpbilcbiAgICAgIC5nZXRDb25maWcoKVxuICAgICAgLnRoZW4oKGNvbmZpZykgPT4ge1xuICAgICAgICB0aGlzLmNvbmZpZ18gPSBjb25maWc7XG4gICAgICAgIGlmIChjb25maWdbJ3R5cGUnXSA9PT0gJ2N1c3RvbScpIHtcbiAgICAgICAgICBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKHRoaXMud2luKS4vKk9LKi8gaW5zdGFsbEV4dGVuc2lvbkZvckRvYyhcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5nZXRBbXBEb2MoKSxcbiAgICAgICAgICAgIE1VU1RBQ0hFX1RBRyxcbiAgICAgICAgICAgICdsYXRlc3QnXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCBhZCBpbnNlcnRpb24gaXMgYWxsb3dlZCBiYXNlZCBvbiBob3cgdGhlIHN0b3J5XG4gICAqIGlzIHNlcnZlZCwgYW5kIHRoZSBudW1iZXIgb2YgcGFnZXMgaW4gdGhlIHN0b3J5LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaXNBdXRvbWF0aWNBZEluc2VydGlvbkFsbG93ZWRfKCkge1xuICAgIHJldHVybiAhIXRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5DQU5fSU5TRVJUX0FVVE9NQVRJQ19BRCk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlcyB0byBhbGwgcmVsZXZhbnQgc3RhdGUgY2hhbmdlcyBmcm9tIHRoZSBjb250YWluaW5nIHN0b3J5LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUxpc3RlbmVyc18oKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShTdGF0ZVByb3BlcnR5LkFEX1NUQVRFLCAoaXNBZCkgPT4ge1xuICAgICAgdGhpcy5vbkFkU3RhdGVVcGRhdGVfKGlzQWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuUlRMX1NUQVRFLFxuICAgICAgKHJ0bFN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMub25SdGxTdGF0ZVVwZGF0ZV8ocnRsU3RhdGUpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuVUlfU1RBVEUsXG4gICAgICAodWlTdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLm9uVUlTdGF0ZVVwZGF0ZV8odWlTdGF0ZSk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lELCAocGFnZUlkKSA9PiB7XG4gICAgICBjb25zdCBwYWdlSW5kZXggPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFxuICAgICAgICBTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JTkRFWFxuICAgICAgKTtcblxuICAgICAgdGhpcy5oYW5kbGVBY3RpdmVQYWdlQ2hhbmdlXyhcbiAgICAgICAgZGV2KCkuYXNzZXJ0TnVtYmVyKHBhZ2VJbmRleCksXG4gICAgICAgIGRldigpLmFzc2VydFN0cmluZyhwYWdlSWQpXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byB0aGUgYWQgc3RhdGUgdXBkYXRlcyBhbmQgcGFzc2VzIHRoZSBpbmZvcm1hdGlvbiBhbG9uZyBhc1xuICAgKiBhdHRyaWJ1dGVzIHRvIHRoZSBzaGFkb3dlZCBhZCBiYWRnZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBpc0FkXG4gICAqL1xuICBvbkFkU3RhdGVVcGRhdGVfKGlzQWQpIHtcbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgaWYgKGlzQWQpIHtcbiAgICAgICAgdGhpcy5hZEJhZGdlQ29udGFpbmVyXy5zZXRBdHRyaWJ1dGUoQXR0cmlidXRlcy5BRF9TSE9XSU5HLCAnJyk7XG4gICAgICAgIC8vIFRPRE8oIzMzOTY5KSBjYW4gbm8gbG9uZ2VyIGJlIG51bGwgd2hlbiBsYXVuY2hlZC5cbiAgICAgICAgdGhpcy5wcm9ncmVzc0JhckJhY2tncm91bmRfICYmXG4gICAgICAgICAgdGhpcy5wcm9ncmVzc0JhckJhY2tncm91bmRfLnNldEF0dHJpYnV0ZShBdHRyaWJ1dGVzLkFEX1NIT1dJTkcsICcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYWRCYWRnZUNvbnRhaW5lcl8ucmVtb3ZlQXR0cmlidXRlKEF0dHJpYnV0ZXMuQURfU0hPV0lORyk7XG4gICAgICAgIC8vIFRPRE8oIzMzOTY5KSBjYW4gbm8gbG9uZ2VyIGJlIG51bGwgd2hlbiBsYXVuY2hlZC5cbiAgICAgICAgdGhpcy5wcm9ncmVzc0JhckJhY2tncm91bmRfICYmXG4gICAgICAgICAgdGhpcy5wcm9ncmVzc0JhckJhY2tncm91bmRfLnJlbW92ZUF0dHJpYnV0ZShBdHRyaWJ1dGVzLkFEX1NIT1dJTkcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byB0aGUgcnRsIHN0YXRlIHVwZGF0ZXMgYW5kIHBhc3NlcyB0aGUgaW5mb3JtYXRpb24gYWxvbmcgYXNcbiAgICogYXR0cmlidXRlcyB0byB0aGUgc2hhZG93ZWQgYWQgYmFkZ2UuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcnRsU3RhdGVcbiAgICovXG4gIG9uUnRsU3RhdGVVcGRhdGVfKHJ0bFN0YXRlKSB7XG4gICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgIHJ0bFN0YXRlXG4gICAgICAgID8gdGhpcy5hZEJhZGdlQ29udGFpbmVyXy5zZXRBdHRyaWJ1dGUoQXR0cmlidXRlcy5ESVIsICdydGwnKVxuICAgICAgICA6IHRoaXMuYWRCYWRnZUNvbnRhaW5lcl8ucmVtb3ZlQXR0cmlidXRlKEF0dHJpYnV0ZXMuRElSKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gVUkgc3RhdGUgdXBkYXRlcyBhbmQgcGFzc2VzIHRoZSBpbmZvcm1hdGlvbiBhbG9uZyBhc1xuICAgKiBhdHRyaWJ1dGVzIHRvIHRoZSBzaGFkb3dlZCBhZCBiYWRnZS5cbiAgICogQHBhcmFtIHshVUlUeXBlfSB1aVN0YXRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblVJU3RhdGVVcGRhdGVfKHVpU3RhdGUpIHtcbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgY29uc3Qge0RFU0tUT1BfT05FX1BBTkVMLCBERVNLVE9QX1BBTkVMU30gPSBBdHRyaWJ1dGVzO1xuICAgICAgdGhpcy5hZEJhZGdlQ29udGFpbmVyXy5yZW1vdmVBdHRyaWJ1dGUoREVTS1RPUF9QQU5FTFMpO1xuICAgICAgdGhpcy5hZEJhZGdlQ29udGFpbmVyXy5yZW1vdmVBdHRyaWJ1dGUoREVTS1RPUF9PTkVfUEFORUwpO1xuICAgICAgLy8gVE9ETygjMzM5NjkpIGNhbiBubyBsb25nZXIgYmUgbnVsbCB3aGVuIGxhdW5jaGVkLlxuICAgICAgdGhpcy5wcm9ncmVzc0JhckJhY2tncm91bmRfPy5yZW1vdmVBdHRyaWJ1dGUoREVTS1RPUF9QQU5FTFMpO1xuICAgICAgdGhpcy5wcm9ncmVzc0JhckJhY2tncm91bmRfPy5yZW1vdmVBdHRyaWJ1dGUoREVTS1RPUF9PTkVfUEFORUwpO1xuXG4gICAgICBpZiAodWlTdGF0ZSA9PT0gVUlUeXBlLkRFU0tUT1BfUEFORUxTKSB7XG4gICAgICAgIHRoaXMuYWRCYWRnZUNvbnRhaW5lcl8uc2V0QXR0cmlidXRlKERFU0tUT1BfUEFORUxTLCAnJyk7XG4gICAgICAgIHRoaXMucHJvZ3Jlc3NCYXJCYWNrZ3JvdW5kXz8uc2V0QXR0cmlidXRlKERFU0tUT1BfUEFORUxTLCAnJyk7XG4gICAgICB9XG4gICAgICBpZiAodWlTdGF0ZSA9PT0gVUlUeXBlLkRFU0tUT1BfT05FX1BBTkVMKSB7XG4gICAgICAgIHRoaXMuYWRCYWRnZUNvbnRhaW5lcl8uc2V0QXR0cmlidXRlKERFU0tUT1BfT05FX1BBTkVMLCAnJyk7XG4gICAgICAgIHRoaXMucHJvZ3Jlc3NCYXJCYWNrZ3JvdW5kXz8uc2V0QXR0cmlidXRlKERFU0tUT1BfT05FX1BBTkVMLCAnJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgaGlkZGVuIFVJIHRoYXQgd2lsbCBiZSBzaG93biB3aGVuIGFkIGlzIGRpc3BsYXllZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlQWRPdmVybGF5XygpIHtcbiAgICBjb25zdCByb290ID0gdGhpcy5kb2NfLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHJvb3QuY2xhc3NOYW1lID0gJ2ktYW1waHRtbC1hZC1vdmVybGF5LWhvc3QnO1xuXG4gICAgdGhpcy5hZEJhZGdlQ29udGFpbmVyXyA9IHRoaXMuZG9jXy5jcmVhdGVFbGVtZW50KCdhc2lkZScpO1xuICAgIHRoaXMuYWRCYWRnZUNvbnRhaW5lcl8uY2xhc3NOYW1lID0gJ2ktYW1waHRtbC1hZC1vdmVybGF5LWNvbnRhaW5lcic7XG5cbiAgICBjb25zdCBiYWRnZSA9IHRoaXMuZG9jXy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBiYWRnZS5jbGFzc05hbWUgPSAnaS1hbXBodG1sLXN0b3J5LWFkLWJhZGdlJztcblxuICAgIHRoaXMuYWRCYWRnZUNvbnRhaW5lcl8uYXBwZW5kQ2hpbGQoYmFkZ2UpO1xuICAgIGNyZWF0ZVNoYWRvd1Jvb3RXaXRoU3R5bGUocm9vdCwgdGhpcy5hZEJhZGdlQ29udGFpbmVyXywgYWRCYWRnZUNTUyk7XG5cbiAgICBjb25zdCBzdmcgPSBzdmdGb3IodGhpcy5kb2NfKTtcbiAgICBjb25zdCBiYWRnZVNWRyA9IHN2Z2A8c3ZnXG4gICAgICB3aWR0aD1cIjM5XCJcbiAgICAgIGhlaWdodD1cIjMxXCJcbiAgICAgIHZpZXdCb3g9XCIwIDAgMzkgMzFcIlxuICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktYWQtYmFkZ2Utc3ZnXCJcbiAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgID5cbiAgICAgIDxnIGZpbHRlcj1cInVybCgjZmlsdGVyMF9kKVwiPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNMTcuMzY3MiAxOS4zNjMzSDEyLjc0NDFMMTEuODY1MiAyMkg5LjA2MTUyTDEzLjgyNTIgOS4yMDMxMkgxNi4yNjg2TDIxLjA1ODYgMjJIMTguMjU0OUwxNy4zNjcyIDE5LjM2MzNaTTEzLjQ1NjEgMTcuMjI3NUgxNi42NTUzTDE1LjA0NjkgMTIuNDM3NUwxMy40NTYxIDE3LjIyNzVaTTIyLjE5MTQgMTcuMTc0OEMyMi4xOTE0IDE1LjY5MjQgMjIuNTIyNSAxNC41MTE3IDIzLjE4NDYgMTMuNjMyOEMyMy44NTI1IDEyLjc1MzkgMjQuNzYzNyAxMi4zMTQ1IDI1LjkxOCAxMi4zMTQ1QzI2Ljg0MzggMTIuMzE0NSAyNy42MDg0IDEyLjY2MDIgMjguMjExOSAxMy4zNTE2VjguNUgzMC43NjA3VjIySDI4LjQ2NjhMMjguMzQzOCAyMC45ODkzQzI3LjcxMDkgMjEuNzgwMyAyNi44OTY1IDIyLjE3NTggMjUuOTAwNCAyMi4xNzU4QzI0Ljc4MTIgMjIuMTc1OCAyMy44ODE4IDIxLjczNjMgMjMuMjAyMSAyMC44NTc0QzIyLjUyODMgMTkuOTcyNyAyMi4xOTE0IDE4Ljc0NTEgMjIuMTkxNCAxNy4xNzQ4Wk0yNC43MzE0IDE3LjM1OTRDMjQuNzMxNCAxOC4yNSAyNC44ODY3IDE4LjkzMjYgMjUuMTk3MyAxOS40MDcyQzI1LjUwNzggMTkuODgxOCAyNS45NTkgMjAuMTE5MSAyNi41NTA4IDIwLjExOTFDMjcuMzM1OSAyMC4xMTkxIDI3Ljg4OTYgMTkuNzg4MSAyOC4yMTE5IDE5LjEyNlYxNS4zNzNDMjcuODk1NSAxNC43MTA5IDI3LjM0NzcgMTQuMzc5OSAyNi41Njg0IDE0LjM3OTlDMjUuMzQzOCAxNC4zNzk5IDI0LjczMTQgMTUuMzczIDI0LjczMTQgMTcuMzU5NFpcIlxuICAgICAgICAgIGZpbGw9XCJ3aGl0ZVwiXG4gICAgICAgID48L3BhdGg+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk0xNy4zNjcyIDE5LjM2MzNMMTcuNDg1NyAxOS4zMjM0TDE3LjQ1NyAxOS4yMzgzSDE3LjM2NzJWMTkuMzYzM1pNMTIuNzQ0MSAxOS4zNjMzVjE5LjIzODNIMTIuNjU0TDEyLjYyNTYgMTkuMzIzOEwxMi43NDQxIDE5LjM2MzNaTTExLjg2NTIgMjJWMjIuMTI1SDExLjk1NTNMMTEuOTgzOCAyMi4wMzk1TDExLjg2NTIgMjJaTTkuMDYxNTIgMjJMOC45NDQzOCAyMS45NTY0TDguODgxNjEgMjIuMTI1SDkuMDYxNTJWMjJaTTEzLjgyNTIgOS4yMDMxMlY5LjA3ODEySDEzLjczODNMMTMuNzA4IDkuMTU5NTJMMTMuODI1MiA5LjIwMzEyWk0xNi4yNjg2IDkuMjAzMTJMMTYuMzg1NiA5LjE1OTMxTDE2LjM1NTIgOS4wNzgxMkgxNi4yNjg2VjkuMjAzMTJaTTIxLjA1ODYgMjJWMjIuMTI1SDIxLjIzODlMMjEuMTc1NyAyMS45NTYyTDIxLjA1ODYgMjJaTTE4LjI1NDkgMjJMMTguMTM2NCAyMi4wMzk5TDE4LjE2NTEgMjIuMTI1SDE4LjI1NDlWMjJaTTEzLjQ1NjEgMTcuMjI3NUwxMy4zMzc0IDE3LjE4ODFMMTMuMjgyOCAxNy4zNTI1SDEzLjQ1NjFWMTcuMjI3NVpNMTYuNjU1MyAxNy4yMjc1VjE3LjM1MjVIMTYuODI5MUwxNi43NzM4IDE3LjE4NzdMMTYuNjU1MyAxNy4yMjc1Wk0xNS4wNDY5IDEyLjQzNzVMMTUuMTY1NCAxMi4zOTc3TDE1LjA0NjIgMTIuMDQyOUwxNC45MjgyIDEyLjM5ODFMMTUuMDQ2OSAxMi40Mzc1Wk0xNy4zNjcyIDE5LjIzODNIMTIuNzQ0MVYxOS40ODgzSDE3LjM2NzJWMTkuMjM4M1pNMTIuNjI1NiAxOS4zMjM4TDExLjc0NjYgMjEuOTYwNUwxMS45ODM4IDIyLjAzOTVMMTIuODYyNyAxOS40MDI4TDEyLjYyNTYgMTkuMzIzOFpNMTEuODY1MiAyMS44NzVIOS4wNjE1MlYyMi4xMjVIMTEuODY1MlYyMS44NzVaTTkuMTc4NjcgMjIuMDQzNkwxMy45NDIzIDkuMjQ2NzNMMTMuNzA4IDkuMTU5NTJMOC45NDQzOCAyMS45NTY0TDkuMTc4NjcgMjIuMDQzNlpNMTMuODI1MiA5LjMyODEySDE2LjI2ODZWOS4wNzgxMkgxMy44MjUyVjkuMzI4MTJaTTE2LjE1MTUgOS4yNDY5NEwyMC45NDE1IDIyLjA0MzhMMjEuMTc1NyAyMS45NTYyTDE2LjM4NTYgOS4xNTkzMUwxNi4xNTE1IDkuMjQ2OTRaTTIxLjA1ODYgMjEuODc1SDE4LjI1NDlWMjIuMTI1SDIxLjA1ODZWMjEuODc1Wk0xOC4zNzMzIDIxLjk2MDFMMTcuNDg1NyAxOS4zMjM0TDE3LjI0ODcgMTkuNDAzMkwxOC4xMzY0IDIyLjAzOTlMMTguMzczMyAyMS45NjAxWk0xMy40NTYxIDE3LjM1MjVIMTYuNjU1M1YxNy4xMDI1SDEzLjQ1NjFWMTcuMzUyNVpNMTYuNzczOCAxNy4xODc3TDE1LjE2NTQgMTIuMzk3N0wxNC45Mjg0IDEyLjQ3NzNMMTYuNTM2OCAxNy4yNjczTDE2Ljc3MzggMTcuMTg3N1pNMTQuOTI4MiAxMi4zOTgxTDEzLjMzNzQgMTcuMTg4MUwxMy41NzQ3IDE3LjI2NjlMMTUuMTY1NSAxMi40NzY5TDE0LjkyODIgMTIuMzk4MVpNMjMuMTg0NiAxMy42MzI4TDIzLjA4NSAxMy41NTcyTDIzLjA4NDcgMTMuNTU3NkwyMy4xODQ2IDEzLjYzMjhaTTI4LjIxMTkgMTMuMzUxNkwyOC4xMTc3IDEzLjQzMzhMMjguMzM2OSAxMy42ODQ5VjEzLjM1MTZIMjguMjExOVpNMjguMjExOSA4LjVWOC4zNzVIMjguMDg2OVY4LjVIMjguMjExOVpNMzAuNzYwNyA4LjVIMzAuODg1N1Y4LjM3NUgzMC43NjA3VjguNVpNMzAuNzYwNyAyMlYyMi4xMjVIMzAuODg1N1YyMkgzMC43NjA3Wk0yOC40NjY4IDIyTDI4LjM0MjcgMjIuMDE1MUwyOC4zNTYxIDIyLjEyNUgyOC40NjY4VjIyWk0yOC4zNDM4IDIwLjk4OTNMMjguNDY3OCAyMC45NzQyTDI4LjQzMTkgMjAuNjc5TDI4LjI0NjEgMjAuOTExMkwyOC4zNDM4IDIwLjk4OTNaTTIzLjIwMjEgMjAuODU3NEwyMy4xMDI3IDIwLjkzMzJMMjMuMTAzMyAyMC45MzM5TDIzLjIwMjEgMjAuODU3NFpNMjguMjExOSAxOS4xMjZMMjguMzI0MyAxOS4xODA3TDI4LjMzNjkgMTkuMTU0OFYxOS4xMjZIMjguMjExOVpNMjguMjExOSAxNS4zNzNIMjguMzM2OVYxNS4zNDQ3TDI4LjMyNDcgMTUuMzE5MkwyOC4yMTE5IDE1LjM3M1pNMjIuMzE2NCAxNy4xNzQ4QzIyLjMxNjQgMTUuNzEwMiAyMi42NDM1IDE0LjU1ODggMjMuMjg0NCAxMy43MDhMMjMuMDg0NyAxMy41NTc2QzIyLjQwMTUgMTQuNDY0NiAyMi4wNjY0IDE1LjY3NDYgMjIuMDY2NCAxNy4xNzQ4SDIyLjMxNjRaTTIzLjI4NDEgMTMuNzA4NEMyMy45MjcyIDEyLjg2MjMgMjQuODAwNyAxMi40Mzk1IDI1LjkxOCAxMi40Mzk1VjEyLjE4OTVDMjQuNzI2NyAxMi4xODk1IDIzLjc3NzkgMTIuNjQ1NSAyMy4wODUxIDEzLjU1NzJMMjMuMjg0MSAxMy43MDg0Wk0yNS45MTggMTIuNDM5NUMyNi44MDggMTIuNDM5NSAyNy41MzgyIDEyLjc2OTggMjguMTE3NyAxMy40MzM4TDI4LjMwNjEgMTMuMjY5NEMyNy42Nzg2IDEyLjU1MDUgMjYuODc5NSAxMi4xODk1IDI1LjkxOCAxMi4xODk1VjEyLjQzOTVaTTI4LjMzNjkgMTMuMzUxNlY4LjVIMjguMDg2OVYxMy4zNTE2SDI4LjMzNjlaTTI4LjIxMTkgOC42MjVIMzAuNzYwN1Y4LjM3NUgyOC4yMTE5VjguNjI1Wk0zMC42MzU3IDguNVYyMkgzMC44ODU3VjguNUgzMC42MzU3Wk0zMC43NjA3IDIxLjg3NUgyOC40NjY4VjIyLjEyNUgzMC43NjA3VjIxLjg3NVpNMjguNTkwOSAyMS45ODQ5TDI4LjQ2NzggMjAuOTc0MkwyOC4yMTk3IDIxLjAwNDRMMjguMzQyNyAyMi4wMTUxTDI4LjU5MDkgMjEuOTg0OVpNMjguMjQ2MSAyMC45MTEyQzI3LjYzNjYgMjEuNjczMSAyNi44NTc4IDIyLjA1MDggMjUuOTAwNCAyMi4wNTA4VjIyLjMwMDhDMjYuOTM1MiAyMi4zMDA4IDI3Ljc4NTMgMjEuODg3NCAyOC40NDE0IDIxLjA2NzNMMjguMjQ2MSAyMC45MTEyWk0yNS45MDA0IDIyLjA1MDhDMjQuODE5NiAyMi4wNTA4IDIzLjk1NjggMjEuNjI5IDIzLjMwMSAyMC43ODFMMjMuMTAzMyAyMC45MzM5QzIzLjgwNjggMjEuODQzNyAyNC43NDI5IDIyLjMwMDggMjUuOTAwNCAyMi4zMDA4VjIyLjA1MDhaTTIzLjMwMTYgMjAuNzgxN0MyMi42NSAxOS45MjYxIDIyLjMxNjQgMTguNzI4NyAyMi4zMTY0IDE3LjE3NDhIMjIuMDY2NEMyMi4wNjY0IDE4Ljc2MTUgMjIuNDA2NyAyMC4wMTkzIDIzLjEwMjcgMjAuOTMzMkwyMy4zMDE2IDIwLjc4MTdaTTI0LjYwNjQgMTcuMzU5NEMyNC42MDY0IDE4LjI2MTYgMjQuNzYzMiAxOC45NzIyIDI1LjA5MjcgMTkuNDc1N0wyNS4zMDE5IDE5LjMzODhDMjUuMDEwMiAxOC44OTMxIDI0Ljg1NjQgMTguMjM4NCAyNC44NTY0IDE3LjM1OTRIMjQuNjA2NFpNMjUuMDkyNyAxOS40NzU3QzI1LjQyNzUgMTkuOTg3NCAyNS45MTkgMjAuMjQ0MSAyNi41NTA4IDIwLjI0NDFWMTkuOTk0MUMyNS45OTkgMTkuOTk0MSAyNS41ODgxIDE5Ljc3NjMgMjUuMzAxOSAxOS4zMzg4TDI1LjA5MjcgMTkuNDc1N1pNMjYuNTUwOCAyMC4yNDQxQzI2Ljk2MSAyMC4yNDQxIDI3LjMxOSAyMC4xNTc1IDI3LjYxOTEgMTkuOTc4MUMyNy45MTk2IDE5Ljc5ODQgMjguMTU0MSAxOS41MzA0IDI4LjMyNDMgMTkuMTgwN0wyOC4wOTk1IDE5LjA3MTNDMjcuOTQ3NSAxOS4zODM3IDI3Ljc0NCAxOS42MTIyIDI3LjQ5MDggMTkuNzYzNkMyNy4yMzcxIDE5LjkxNTIgMjYuOTI1NyAxOS45OTQxIDI2LjU1MDggMTkuOTk0MVYyMC4yNDQxWk0yOC4zMzY5IDE5LjEyNlYxNS4zNzNIMjguMDg2OVYxOS4xMjZIMjguMzM2OVpNMjguMzI0NyAxNS4zMTkyQzI4LjE1NzYgMTQuOTY5NCAyNy45MjYxIDE0LjcwMTEgMjcuNjI4NCAxNC41MjEyQzI3LjMzMTEgMTQuMzQxNiAyNi45NzU4IDE0LjI1NDkgMjYuNTY4NCAxNC4yNTQ5VjE0LjUwNDlDMjYuOTQwMiAxNC41MDQ5IDI3LjI0ODUgMTQuNTgzNyAyNy40OTkxIDE0LjczNTJDMjcuNzQ5MiAxNC44ODYzIDI3Ljk0OTkgMTUuMTE0NiAyOC4wOTkxIDE1LjQyNjlMMjguMzI0NyAxNS4zMTkyWk0yNi41Njg0IDE0LjI1NDlDMjUuOTE1MyAxNC4yNTQ5IDI1LjQxNDUgMTQuNTIzNSAyNS4wODQzIDE1LjA1OTJDMjQuNzYwMSAxNS41ODQ5IDI0LjYwNjQgMTYuMzU3NCAyNC42MDY0IDE3LjM1OTRIMjQuODU2NEMyNC44NTY0IDE2LjM3NSAyNS4wMDg5IDE1LjY1NzggMjUuMjk3MSAxNS4xOTA0QzI1LjU3OTEgMTQuNzMyOSAyNS45OTY4IDE0LjUwNDkgMjYuNTY4NCAxNC41MDQ5VjE0LjI1NDlaXCJcbiAgICAgICAgICBmaWxsPVwid2hpdGVcIlxuICAgICAgICA+PC9wYXRoPlxuICAgICAgPC9nPlxuICAgICAgPGRlZnM+XG4gICAgICAgIDxmaWx0ZXJcbiAgICAgICAgICBpZD1cImZpbHRlcjBfZFwiXG4gICAgICAgICAgeD1cIjAuODgxODM2XCJcbiAgICAgICAgICB5PVwiMC4zNzVcIlxuICAgICAgICAgIHdpZHRoPVwiMzguMDA0MVwiXG4gICAgICAgICAgaGVpZ2h0PVwiMjkuOTI1OFwiXG4gICAgICAgICAgZmlsdGVyVW5pdHM9XCJ1c2VyU3BhY2VPblVzZVwiXG4gICAgICAgICAgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPVwic1JHQlwiXG4gICAgICAgID5cbiAgICAgICAgICA8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PVwiMFwiIHJlc3VsdD1cIkJhY2tncm91bmRJbWFnZUZpeFwiIC8+XG4gICAgICAgICAgPGZlQ29sb3JNYXRyaXhcbiAgICAgICAgICAgIGluPVwiU291cmNlQWxwaGFcIlxuICAgICAgICAgICAgdHlwZT1cIm1hdHJpeFwiXG4gICAgICAgICAgICB2YWx1ZXM9XCIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZmVPZmZzZXQgLz5cbiAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPVwiNFwiIC8+XG4gICAgICAgICAgPGZlQ29sb3JNYXRyaXhcbiAgICAgICAgICAgIHR5cGU9XCJtYXRyaXhcIlxuICAgICAgICAgICAgdmFsdWVzPVwiMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMC4yNCAwXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxmZUJsZW5kXG4gICAgICAgICAgICBtb2RlPVwibm9ybWFsXCJcbiAgICAgICAgICAgIGluMj1cIkJhY2tncm91bmRJbWFnZUZpeFwiXG4gICAgICAgICAgICByZXN1bHQ9XCJlZmZlY3QxX2Ryb3BTaGFkb3dcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGZlQmxlbmRcbiAgICAgICAgICAgIG1vZGU9XCJub3JtYWxcIlxuICAgICAgICAgICAgaW49XCJTb3VyY2VHcmFwaGljXCJcbiAgICAgICAgICAgIGluMj1cImVmZmVjdDFfZHJvcFNoYWRvd1wiXG4gICAgICAgICAgICByZXN1bHQ9XCJzaGFwZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9maWx0ZXI+XG4gICAgICA8L2RlZnM+XG4gICAgPC9zdmc+IGA7XG5cbiAgICBiYWRnZS5hcHBlbmRDaGlsZChiYWRnZVNWRyk7XG5cbiAgICB0aGlzLmFtcFN0b3J5Xy5lbGVtZW50LmFwcGVuZENoaWxkKHJvb3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBwcm9ncmVzcyBiYXIgaWYgYXV0byBhZHZhbmNlIGV4cCBpcyBvbi5cbiAgICogVE9ETygjMzM5NjkpIG1vdmUgdG8gY2hvc2VuIFVJIGFuZCBkZWxldGUgdGhlIG90aGVycy5cbiAgICovXG4gIG1heWJlQ3JlYXRlUHJvZ3Jlc3NCYXJfKCkge1xuICAgIGNvbnN0IGF1dG9BZHZhbmNlRXhwQnJhbmNoID0gZ2V0RXhwZXJpbWVudEJyYW5jaChcbiAgICAgIHRoaXMud2luLFxuICAgICAgU3RvcnlBZEF1dG9BZHZhbmNlLklEXG4gICAgKTtcbiAgICBjb25zdCBzdG9yeU5leHRVcFBhcmFtID0gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMuZWxlbWVudCkuZ2V0UGFyYW0oXG4gICAgICAnc3RvcnlOZXh0VXAnXG4gICAgKTtcbiAgICBpZiAoc3RvcnlOZXh0VXBQYXJhbSAmJiBWaWV3ZXJTZXRUaW1lVG9CcmFuY2hbc3RvcnlOZXh0VXBQYXJhbV0pIHtcbiAgICAgIC8vIEFjdHVhbCBwcm9ncmVzcyBiYXIgY3JlYXRpb24gaGFuZGxlZCBpbiBwcm9ncmVzcy1iYXIuanMuXG4gICAgICBmb3JjZUV4cGVyaW1lbnRCcmFuY2goXG4gICAgICAgIHRoaXMud2luLFxuICAgICAgICBTdG9yeUFkU2VnbWVudEV4cC5JRCxcbiAgICAgICAgVmlld2VyU2V0VGltZVRvQnJhbmNoW3N0b3J5TmV4dFVwUGFyYW1dXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBhdXRvQWR2YW5jZUV4cEJyYW5jaCAmJlxuICAgICAgYXV0b0FkdmFuY2VFeHBCcmFuY2ggIT09IFN0b3J5QWRBdXRvQWR2YW5jZS5DT05UUk9MXG4gICAgKSB7XG4gICAgICB0aGlzLmNyZWF0ZVByb2dyZXNzQmFyXyhBZHZhbmNlRXhwVG9UaW1lW2F1dG9BZHZhbmNlRXhwQnJhbmNoXSk7XG4gICAgfSBlbHNlIGlmIChzdG9yeU5leHRVcFBhcmFtKSB7XG4gICAgICB0aGlzLmNyZWF0ZVByb2dyZXNzQmFyXyhzdG9yeU5leHRVcFBhcmFtKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIHByb2dyZXNzIGJhciB0aGF0IHdpbGwgYmUgc2hvd24gd2hlbiBhZCBpcyBhZHZhbmNpbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aW1lXG4gICAqL1xuICBjcmVhdGVQcm9ncmVzc0Jhcl8odGltZSkge1xuICAgIGNvbnN0IHByb2dyZXNzQmFyID0gdGhpcy5kb2NfLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHByb2dyZXNzQmFyLmNsYXNzTmFtZSA9ICdpLWFtcGh0bWwtc3RvcnktYWQtcHJvZ3Jlc3MtYmFyJztcbiAgICBzZXRTdHlsZShwcm9ncmVzc0JhciwgJ2FuaW1hdGlvbkR1cmF0aW9uJywgdGltZSk7XG5cbiAgICB0aGlzLnByb2dyZXNzQmFyQmFja2dyb3VuZF8gPSB0aGlzLmRvY18uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5wcm9ncmVzc0JhckJhY2tncm91bmRfLmNsYXNzTmFtZSA9XG4gICAgICAnaS1hbXBodG1sLXN0b3J5LWFkLXByb2dyZXNzLWJhY2tncm91bmQnO1xuXG4gICAgY29uc3QgaG9zdCA9IHRoaXMuZG9jXy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBob3N0LmNsYXNzTmFtZSA9ICdpLWFtcGh0bWwtc3RvcnktYWQtcHJvZ3Jlc3MtYmFyLWhvc3QnO1xuXG4gICAgdGhpcy5wcm9ncmVzc0JhckJhY2tncm91bmRfLmFwcGVuZENoaWxkKHByb2dyZXNzQmFyKTtcbiAgICBjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlKGhvc3QsIHRoaXMucHJvZ3Jlc3NCYXJCYWNrZ3JvdW5kXywgcHJvZ2Vzc0JhckNTUyk7XG4gICAgdGhpcy5hbXBTdG9yeV8uZWxlbWVudC5hcHBlbmRDaGlsZChob3N0KTtcblxuICAgIC8vIFRPRE8oIzMzOTY5KSBtb3ZlIHRoaXMgdG8gaW5pdCBsaXN0ZW5lcnMgd2hlbiBubyBsb25nZXIgY29uZGl0aW9uYWwuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShTdGF0ZVByb3BlcnR5LlBBVVNFRF9TVEFURSwgKGlzUGF1c2VkKSA9PiB7XG4gICAgICB0aGlzLm9uUGF1c2VTdGF0ZVVwZGF0ZV8oaXNQYXVzZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHZpZGVvIGlzIHBhdXNlZCBhbmQgYWQgaXMgc2hvd2luZyBwYXVzZSB0aGUgcHJvZ3Jlc3MgYmFyLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUGF1c2VkXG4gICAqL1xuICBvblBhdXNlU3RhdGVVcGRhdGVfKGlzUGF1c2VkKSB7XG4gICAgY29uc3QgYWRTaG93aW5nID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LkFEX1NUQVRFKTtcbiAgICBpZiAoIWFkU2hvd2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRvZ2dsZUF0dHJpYnV0ZSh0aGlzLnByb2dyZXNzQmFyQmFja2dyb3VuZF8sIEF0dHJpYnV0ZXMuUEFVU0VELCBpc1BhdXNlZCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIG5ldyBwYWdlIGNvbnRhaW5pbmcgYWQgYW5kIHN0YXJ0IHByZWxvYWRpbmcuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplUGFnZXNfKCkge1xuICAgIGNvbnN0IHBhZ2VzID0gdGhpcy5wbGFjZW1lbnRBbGdvcml0aG1fLmluaXRpYWxpemVQYWdlcygpO1xuICAgIHRoaXMubWF5YmVGb3JjZUFkUGxhY2VtZW50XyhkZXZBc3NlcnQocGFnZXNbMF0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXZlbG9wbWVudCBtb2RlIGZvcmNlcyBuYXZpZ2F0aW9uIHRvIGFkIHBhZ2UgZm9yIGJldHRlciBkZXYteC5cbiAgICogQHBhcmFtIHtTdG9yeUFkUGFnZX0gYWRQYWdlXG4gICAqL1xuICBtYXliZUZvcmNlQWRQbGFjZW1lbnRfKGFkUGFnZSkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RldmVsb3BtZW50JykgJiZcbiAgICAgIHRoaXMuY29uZmlnX1sndHlwZSddID09PSAnZmFrZSdcbiAgICApIHtcbiAgICAgIHRoaXMuZm9yY2VQbGFjZUFkQWZ0ZXJQYWdlXyhhZFBhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNwb25kIHRvIHBhZ2UgbmF2aWdhdGlvbiBldmVudC4gVGhpcyBtZXRob2QgaXMgbm90IGNhbGxlZCBmb3IgdGhlIGZpcnN0XG4gICAqIHBhZ2UgdGhhdCBpcyBzaG93biBvbiBsb2FkLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcGFnZUluZGV4IERvZXMgbm90IHVwZGF0ZSB3aGVuIGFkIGlzIHNob3dpbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlSWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZUFjdGl2ZVBhZ2VDaGFuZ2VfKHBhZ2VJbmRleCwgcGFnZUlkKSB7XG4gICAgaWYgKHRoaXMuYWRQYWdlTWFuYWdlcl8ubnVtYmVyT2ZBZHNDcmVhdGVkKCkgPT09IDApIHtcbiAgICAgIC8vIFRoaXMgaXMgcHJvdGVjdGlvbiBhZ2FpbnN0IHVzIHJ1bm5pbmcgb3VyIHBsYWNlbWVudCBhbGdvcml0aG0gaW4gYVxuICAgICAgLy8gc3Rvcnkgd2hlcmUgbm8gYWRzIGhhdmUgYmVlbiBjcmVhdGVkLiBNb3N0IGxpa2VseSBiZWNhdXNlIElOSV9MT0FEIG9uXG4gICAgICAvLyB0aGUgc3RvcnkgaGFzIG5vdCBmaXJlZCB5ZXQgYnV0IHdlIHN0aWxsIGFyZSByZWNlaXZpbmcgcGFnZSBjaGFuZ2VzLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucGxhY2VtZW50QWxnb3JpdGhtXy5vblBhZ2VDaGFuZ2UocGFnZUlkKTtcblxuICAgIGlmICh0aGlzLnZpc2libGVBZFBhZ2VfKSB7XG4gICAgICB0aGlzLnRyYW5zaXRpb25Gcm9tQWRTaG93aW5nXygpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFkUGFnZU1hbmFnZXJfLmhhc0lkKHBhZ2VJZCkpIHtcbiAgICAgIHRoaXMudHJhbnNpdGlvblRvQWRTaG93aW5nXyhwYWdlSW5kZXgsIHBhZ2VJZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHN3aXRjaGluZyBhd2F5IGZyb20gYW4gYWQuXG4gICAqL1xuICB0cmFuc2l0aW9uRnJvbUFkU2hvd2luZ18oKSB7XG4gICAgLy8gV2UgYXJlIHRyYW5zaXRpb25pbmcgYXdheSBmcm9tIGFuIGFkXG4gICAgY29uc3QgYWRQYWdlSWQgPSB0aGlzLnZpc2libGVBZFBhZ2VfLmdldElkKCk7XG4gICAgY29uc3QgYWRJbmRleCA9IHRoaXMuYWRQYWdlTWFuYWdlcl8uZ2V0SW5kZXhCeUlkKGFkUGFnZUlkKTtcbiAgICB0aGlzLnJlbW92ZVZpc2libGVBdHRyaWJ1dGVfKCk7XG4gICAgLy8gRmlyZSB0aGUgZXhpdCBldmVudC5cbiAgICB0aGlzLmFuYWx5dGljc0V2ZW50XyhBbmFseXRpY3NFdmVudHMuQURfRVhJVEVELCB7XG4gICAgICBbQW5hbHl0aWNzVmFycy5BRF9FWElURURdOiBEYXRlLm5vdygpLFxuICAgICAgW0FuYWx5dGljc1ZhcnMuQURfSU5ERVhdOiBhZEluZGV4LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdlIGFyZSBzd2l0Y2hpbmcgdG8gYW4gYWQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwYWdlSW5kZXhcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFkUGFnZUlkXG4gICAqL1xuICB0cmFuc2l0aW9uVG9BZFNob3dpbmdfKHBhZ2VJbmRleCwgYWRQYWdlSWQpIHtcbiAgICBjb25zdCBhZFBhZ2UgPSB0aGlzLmFkUGFnZU1hbmFnZXJfLmdldEFkUGFnZUJ5SWQoYWRQYWdlSWQpO1xuICAgIGNvbnN0IGFkSW5kZXggPSB0aGlzLmFkUGFnZU1hbmFnZXJfLmdldEluZGV4QnlJZChhZFBhZ2VJZCk7XG5cbiAgICBpZiAoIWFkUGFnZS5oYXNCZWVuVmlld2VkKCkpIHtcbiAgICAgIHRoaXMucGxhY2VtZW50QWxnb3JpdGhtXy5vbk5ld0FkVmlldyhwYWdlSW5kZXgpO1xuICAgIH1cblxuICAgIC8vIFRlbGwgdGhlIGlmcmFtZSB0aGF0IGl0IGlzIHZpc2libGUuXG4gICAgdGhpcy5zZXRWaXNpYmxlQXR0cmlidXRlXyhhZFBhZ2UpO1xuXG4gICAgLy8gRmlyZSB0aGUgdmlldyBldmVudCBvbiB0aGUgY29ycmVzcG9uZGluZyBBZC5cbiAgICB0aGlzLmFuYWx5dGljc0V2ZW50XyhBbmFseXRpY3NFdmVudHMuQURfVklFV0VELCB7XG4gICAgICBbQW5hbHl0aWNzVmFycy5BRF9WSUVXRURdOiBEYXRlLm5vdygpLFxuICAgICAgW0FuYWx5dGljc1ZhcnMuQURfSU5ERVhdOiBhZEluZGV4LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBgYW1wLXN0b3J5LXZpc2libGVgIGF0dHJpYnV0ZSBvbiB0aGUgZmllIGJvZHkgc28gdGhhdCBlbWJlZGRlZCBhZHNcbiAgICogY2FuIGtub3cgd2hlbiB0aGV5IGFyZSB2aXNpYmxlIGFuZCBkbyB0aGluZ3MgbGlrZSB0cmlnZ2VyIGFuaW1hdGlvbnMuXG4gICAqIEBwYXJhbSB7U3RvcnlBZFBhZ2V9IGFkUGFnZVxuICAgKi9cbiAgc2V0VmlzaWJsZUF0dHJpYnV0ZV8oYWRQYWdlKSB7XG4gICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgIGFkUGFnZS50b2dnbGVWaXNpYmlsaXR5KCk7XG4gICAgICB0aGlzLnZpc2libGVBZFBhZ2VfID0gYWRQYWdlO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqICBSZW1vdmVzIGBhbXAtc3RvcnktdmlzaWJsZWAgYXR0cmlidXRlIGZyb20gdGhlIGZpZSBib2R5LlxuICAgKi9cbiAgcmVtb3ZlVmlzaWJsZUF0dHJpYnV0ZV8oKSB7XG4gICAgdGhpcy5tdXRhdGVFbGVtZW50KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnZpc2libGVBZFBhZ2VfKSB7XG4gICAgICAgIHRoaXMudmlzaWJsZUFkUGFnZV8udG9nZ2xlVmlzaWJpbGl0eSgpO1xuICAgICAgICB0aGlzLnZpc2libGVBZFBhZ2VfID0gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYW4gYW5hbHl0aWNzIGV2ZW50IGFuZCB0cmlnZ2VyIGl0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIG51bWJlcj59IHZhcnMgQSBtYXAgb2YgdmFycyBhbmQgdGhlaXIgdmFsdWVzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYW5hbHl0aWNzRXZlbnRfKGV2ZW50VHlwZSwgdmFycykge1xuICAgIHRoaXMuYW5hbHl0aWNzXy50aGVuKChhbmFseXRpY3MpID0+XG4gICAgICBhbmFseXRpY3MuZmlyZUV2ZW50KHRoaXMuZWxlbWVudCwgdmFyc1snYWRJbmRleCddLCBldmVudFR5cGUsIHZhcnMpXG4gICAgKTtcbiAgfVxufVxuXG5BTVAuZXh0ZW5zaW9uKCdhbXAtc3RvcnktYXV0by1hZHMnLCAnMC4xJywgKEFNUCkgPT4ge1xuICBBTVAucmVnaXN0ZXJFbGVtZW50KCdhbXAtc3RvcnktYXV0by1hZHMnLCBBbXBTdG9yeUF1dG9BZHMsIENTUyArIHNoYXJlZENTUyk7XG4gIEFNUC5yZWdpc3RlclNlcnZpY2VGb3JEb2MoU1RPUllfQURfQU5BTFlUSUNTLCBTdG9yeUFkQW5hbHl0aWNzKTtcbn0pO1xuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/amp-story-auto-ads.js