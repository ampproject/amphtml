import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {
A4AVarNames,
START_CTA_ANIMATION_ATTR,
createCta,
getStoryAdMetadataFromDoc,
getStoryAdMetadataFromElement,
maybeCreateAttribution,
validateCtaMetadata } from "./story-ad-ui";

import {
AdvanceExpToTime,
StoryAdAutoAdvance } from "../../../src/experiments/story-ad-auto-advance";

import {
AnalyticsEvents,
AnalyticsVars,
STORY_AD_ANALYTICS } from "./story-ad-analytics";

import {
BranchToTimeValues,
StoryAdSegmentExp } from "../../../src/experiments/story-ad-progress-segment";

import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Gestures } from "../../../src/gesture";
import {
StateProperty,
UIType } from "../../amp-story/1.0/amp-story-store-service";

import { SwipeXRecognizer } from "../../../src/gesture-recognizers";
import { assertConfig } from "../../amp-ad-exit/0.1/config";
import {
createElementWithAttributes,
isJsonScriptTag,
toggleAttribute } from "../../../src/core/dom";

import { dev, devAssert, userAssert } from "../../../src/log";
import { dict, map } from "../../../src/core/types/object";
import { elementByTag } from "../../../src/core/dom/query";
import { getData, listen } from "../../../src/event-helper";
import { getExperimentBranch } from "../../../src/experiments";
import { getFrameDoc, localizeCtaText } from "./utils";
import { getServicePromiseForDoc } from "../../../src/service-helpers";
import { parseJson } from "../../../src/core/types/object/json";
import { setStyle } from "../../../src/core/dom/style";

/** @const {string} */
var TAG = 'amp-story-auto-ads:page';

/** @const {number} */
var TIMEOUT_LIMIT = 10000; // 10 seconds

/** @const {string} */
var GLASS_PANE_CLASS = 'i-amphtml-glass-pane';

/** @const {string} */
var DESKTOP_FULLBLEED_CLASS = 'i-amphtml-story-ad-fullbleed';

/** @enum {string} */
var PageAttributes = {
  LOADING: 'i-amphtml-loading',
  IFRAME_BODY_VISIBLE: 'amp-story-visible' };


export var StoryAdPage = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} config
   * @param {number} index
   * @param {!./story-ad-localization.StoryAdLocalization} localization
   * @param {!./story-ad-button-text-fitter.ButtonTextFitter} buttonFitter
   * @param {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} storeService
   */
  function StoryAdPage(ampdoc, config, index, localization, buttonFitter, storeService) {_classCallCheck(this, StoryAdPage);
    /** @private @const {!JsonObject} */
    this.config_ = config;

    /** @private @const {number} */
    this.index_ = index;

    /** @private @const {!./story-ad-localization.StoryAdLocalization} */
    this.localizationService_ = localization;

    /** @private @const {string} */
    this.id_ = "i-amphtml-ad-page-".concat(this.index_);

    /** @private @const {!Window} */
    this.win_ = ampdoc.win;

    /** @private @const {!Document} */
    this.doc_ = this.win_.document;

    /** @private @const {!Promise} */
    this.analytics_ = getServicePromiseForDoc(ampdoc, STORY_AD_ANALYTICS);

    /** @private {?number} */
    this.timeCreated_ = null;

    /** @private {?Element} */
    this.pageElement_ = null;

    /** @private {?Element} */
    this.adElement_ = null;

    /** @private {?HTMLIFrameElement} */
    this.adFrame_ = null;

    /** @private {?Element} */
    this.adChoicesIcon_ = null;

    /** @private {?Element} */
    this.ctaAnchor_ = null;

    /** @private {?Document} */
    this.adDoc_ = null;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private @const {!Array<Function>} */
    this.loadCallbacks_ = [];

    /** @private @const {./story-ad-button-text-fitter.ButtonTextFitter} */
    this.buttonFitter_ = buttonFitter;

    /** @private {boolean} */
    this.viewed_ = false;

    /** @private @const {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private {boolean} */
    this.is3pAdFrame_ = false;
  }

  /** @return {?Document} ad document within FIE */_createClass(StoryAdPage, [{ key: "getAdDoc", value:
    function getAdDoc() {
      return this.adDoc_;
    }

    /** @return {string} */ }, { key: "getId", value:
    function getId() {
      return this.id_;
    }

    /** @return {boolean} */ }, { key: "hasTimedOut", value:
    function hasTimedOut() {
      return (
      !!this.timeCreated_ && Date.now() - this.timeCreated_ > TIMEOUT_LIMIT);

    }

    /** @return {boolean} */ }, { key: "isLoaded", value:
    function isLoaded() {
      return this.loaded_;
    }

    /** @return {boolean} */ }, { key: "hasBeenViewed", value:
    function hasBeenViewed() {
      return this.viewed_;
    }

    /** @return {?Element} */ }, { key: "getPageElement", value:
    function getPageElement() {
      return this.pageElement_;
    }

    /**
     * Register functions to be executed when ad has loaded.
     * @param {Function} cb
     */ }, { key: "registerLoadCallback", value:
    function registerLoadCallback(cb) {
      this.loadCallbacks_.push(cb);
    }

    /**
     * Adds/removes [amp-story-visible] on FIE body so that animations can
     * respond accordingly.
     */ }, { key: "toggleVisibility", value:
    function toggleVisibility() {
      this.viewed_ = true;
      this.ctaAnchor_ &&
      toggleAttribute(this.ctaAnchor_, START_CTA_ANIMATION_ATTR);

      // TODO(calebcordry): Properly handle visible attribute for custom ads.
      if (this.adDoc_) {
        toggleAttribute( /** @type {!Element} */(
        this.adDoc_.body),
        PageAttributes.IFRAME_BODY_VISIBLE);

        // TODO(#24829) Remove alternate body when we have full ad network support.
        var alternateBody = this.adDoc_.querySelector('#x-a4a-former-body');
        alternateBody &&
        toggleAttribute(alternateBody, PageAttributes.IFRAME_BODY_VISIBLE);
      }
    }

    /**
     * Create an `amp-story-page` containing an `amp-ad`.
     * @return {!Element}
     */ }, { key: "build", value:
    function build() {
      this.timeCreated_ = Date.now();
      this.pageElement_ = this.createPageElement_();
      this.adElement_ = this.createAdElement_();

      var glassPane = this.doc_.createElement('div');
      glassPane.classList.add(GLASS_PANE_CLASS);

      var gridLayer = this.doc_.createElement('amp-story-grid-layer');
      gridLayer.setAttribute('template', 'fill');

      var paneGridLayer = gridLayer.cloneNode( /* deep */false);

      gridLayer.appendChild(this.adElement_);
      paneGridLayer.appendChild(glassPane);
      this.pageElement_.appendChild(gridLayer);
      this.pageElement_.appendChild(paneGridLayer);

      this.listenForAdLoadSignals_();
      this.listenForSwipes_();

      this.analyticsEvent_(AnalyticsEvents.AD_REQUESTED, _defineProperty({},
      AnalyticsVars.AD_REQUESTED, Date.now()));


      return this.pageElement_;
    }

    /**
     * Try to create CTA (Click-To-Action) before showing the ad. Will fail if
     * not enough metadata to create the outlink button.
     * @return {Promise<boolean>}
     */ }, { key: "maybeCreateCta", value:
    function maybeCreateCta() {var _this = this;
      return _resolvedPromise().then(function () {
        // Inabox story ads control their own CTA creation.
        if (_this.is3pAdFrame_) {
          return true;
        }

        var uiMetadata = map();

        // Template Ads.
        if (!_this.adDoc_) {
          Object.assign(
          uiMetadata,
          getStoryAdMetadataFromElement(devAssert(_this.adElement_)));

        } else {
          Object.assign(
          uiMetadata,
          getStoryAdMetadataFromDoc(_this.adDoc_),
          // TODO(ccordry): Depricate when possible.
          _this.readAmpAdExit_());

        }

        if (!validateCtaMetadata(uiMetadata)) {
          return false;
        }

        uiMetadata[A4AVarNames.CTA_TYPE] =
        localizeCtaText(
        uiMetadata[A4AVarNames.CTA_TYPE],
        _this.localizationService_) ||
        uiMetadata[A4AVarNames.CTA_TYPE];

        // Store the cta-type as an accesible var for any further pings.
        _this.analytics_.then(function (analytics) {return (
            analytics.setVar(
            _this.index_, // adIndex
            AnalyticsVars.CTA_TYPE,
            uiMetadata[A4AVarNames.CTA_TYPE]));});



        if ((
        _this.adChoicesIcon_ = maybeCreateAttribution(
        _this.win_,
        uiMetadata,
        devAssert(_this.pageElement_))))

        {
          _this.storeService_.subscribe(
          StateProperty.UI_STATE,
          function (uiState) {
            _this.onUIStateUpdate_(uiState);
          },
          true /** callToInitialize */);

        }

        return _this.createCtaLayer_(uiMetadata);
      });
    }

    /**
     * @return {!Element}
     * @private
     */ }, { key: "createPageElement_", value:
    function createPageElement_() {
      var attributes = dict({
        'ad': '',
        'distance': '2',
        'i-amphtml-loading': '',
        'id': this.id_ });


      var autoAdvanceExpBranch = getExperimentBranch(
      this.win_,
      StoryAdAutoAdvance.ID);

      var segmentExpBranch = getExperimentBranch(
      this.win_,
      StoryAdSegmentExp.ID);


      if (segmentExpBranch && segmentExpBranch !== StoryAdSegmentExp.CONTROL) {
        attributes['auto-advance-after'] = BranchToTimeValues[segmentExpBranch];
      } else if (
      autoAdvanceExpBranch &&
      autoAdvanceExpBranch !== StoryAdAutoAdvance.CONTROL)
      {
        attributes['auto-advance-after'] = AdvanceExpToTime[autoAdvanceExpBranch];
      }

      var page = createElementWithAttributes(
      this.doc_,
      'amp-story-page',
      attributes);

      // TODO(ccordry): Allow creative to change default background color.
      setStyle(page, 'background-color', '#212125');
      return page;
    }

    /**
     * @return {!Element}
     * @private
     */ }, { key: "createAdElement_", value:
    function createAdElement_() {
      if (this.config_['type'] === 'fake') {
        this.config_['id'] = "i-amphtml-demo-".concat(this.index_);
      }
      return createElementWithAttributes(this.doc_, 'amp-ad', this.config_);
    }

    /**
     * Creates listeners to receive signal that ad is ready to be shown
     * for both FIE & inabox case.
     * @private
     */ }, { key: "listenForAdLoadSignals_", value:
    function listenForAdLoadSignals_() {var _this2 = this;
      // Friendly frame INI_LOAD.
      this.adElement_.
      signals()
      // TODO(ccordry): Investigate using a better signal waiting for video loads.
      .whenSignal(CommonSignals.INI_LOAD).
      then(function () {return _this2.onAdLoaded_();});

      // Inabox custom event.
      var removeListener = listen(this.win_, 'message', function (e) {
        if (getData(e) !== 'amp-story-ad-load') {
          return;
        }
        if (_this2.getAdFrame_() && e.source === _this2.adFrame_.contentWindow) {
          _this2.is3pAdFrame_ = true;
          _this2.pageElement_.setAttribute('xdomain-ad', '');
          _this2.onAdLoaded_();
          removeListener();
        }
      });
    }

    /**
     * Listen for any horizontal swipes, and fire an analytics event if it happens.
     */ }, { key: "listenForSwipes_", value:
    function listenForSwipes_() {var _this3 = this;
      var gestures = Gestures.get(
      this.pageElement_,
      true /* shouldNotPreventDefault */,
      false /* shouldStopPropogation */);

      gestures.onGesture(SwipeXRecognizer, function () {
        _this3.analyticsEvent_(AnalyticsEvents.AD_SWIPED, _defineProperty({},
        AnalyticsVars.AD_SWIPED, Date.now()));

        gestures.cleanup();
      });
    }

    /**
     * Returns the iframe containing the creative if it exists.
     * @return {?HTMLIFrameElement}
     */ }, { key: "getAdFrame_", value:
    function getAdFrame_() {
      if (this.adFrame_) {
        return this.adFrame_;
      }
      return (this.adFrame_ = /** @type {?HTMLIFrameElement} */(
      elementByTag(devAssert(this.pageElement_), 'iframe')));

    }

    /**
     * Things that need to happen after the created ad is "loaded".
     * @private
     */ }, { key: "onAdLoaded_", value:
    function onAdLoaded_() {
      // Ensures the video-manager does not follow the autoplay attribute on
      // amp-video tags, which would play the ad in the background before it is
      // displayed.
      // TODO(ccordry): do we still need this? Its a pain to always stub in tests.
      this.pageElement_.getImpl().then(function (impl) {return impl.delegateVideoAutoplay();});

      // Remove loading attribute once loaded so that desktop CSS will position
      // offscren with all other pages.
      this.pageElement_.removeAttribute(PageAttributes.LOADING);

      this.analyticsEvent_(AnalyticsEvents.AD_LOADED, _defineProperty({},
      AnalyticsVars.AD_LOADED, Date.now()));


      if (this.getAdFrame_() && !this.is3pAdFrame_) {
        this.adDoc_ = getFrameDoc(
        /** @type {!HTMLIFrameElement} */(this.adFrame_));

      }

      this.loaded_ = true;

      this.loadCallbacks_.forEach(function (cb) {return cb();});
    }

    /**
     * Create layer to contain outlink button.
     * @param {!./story-ad-ui.StoryAdUIMetadata} uiMetadata
     * @return {Promise<boolean>}
     */ }, { key: "createCtaLayer_", value:
    function createCtaLayer_(uiMetadata) {var _this4 = this;
      return createCta(
      this.doc_,
      devAssert(this.buttonFitter_), /** @type {!Element} */(
      this.pageElement_), // Container.
      uiMetadata).
      then(function (anchor) {
        if (anchor) {
          _this4.ctaAnchor_ = anchor;
          // Click listener so that we can fire `story-ad-click` analytics trigger at
          // the appropriate time.
          anchor.addEventListener('click', function () {
            var vars = _defineProperty({},
            AnalyticsVars.AD_CLICKED, Date.now());

            _this4.analyticsEvent_(AnalyticsEvents.AD_CLICKED, vars);
          });
          return true;
        }
        return false;
      });
    }

    /**
     * TODO(#24080) Remove this when story ads have full ad network support.
     * This in intended to be a temporary hack so we can can support
     * ad serving pipelines that are reliant on using amp-ad-exit for
     * outlinks.
     * Reads amp-ad-exit config and tries to extract a suitable outlink.
     * If there are multiple exits present, behavior is unpredictable due to
     * JSON parse.
     * @private
     * @return {!Object}
     */ }, { key: "readAmpAdExit_", value:
    function readAmpAdExit_() {
      var ampAdExit = elementByTag( /** @type {!Element} */(
      this.adDoc_.body),
      'amp-ad-exit');

      if (ampAdExit) {
        try {
          var children = ampAdExit.children;
          userAssert(
          children.length == 1,
          'The tag should contain exactly one <script> child.');

          var child = children[0];
          userAssert(
          isJsonScriptTag(child),
          'The amp-ad-exit config should ' +
          'be inside a <script> tag with type="application/json"');

          var config = assertConfig(parseJson(child.textContent));
          var target =
          config['targets'] &&
          Object.keys(config['targets']) &&
          config['targets'][Object.keys(config['targets'])[0]];
          var finalUrl = target && target['finalUrl'];
          return target ? _defineProperty({}, A4AVarNames.CTA_URL, finalUrl) : {};
        } catch (e) {
          dev().error(TAG, e);
          return {};
        }
      }
    }

    /**
     * Reacts to UI state updates and passes the information along as
     * attributes to the shadowed attribution icon.
     * @param {!UIType} uiState
     * @private
     */ }, { key: "onUIStateUpdate_", value:
    function onUIStateUpdate_(uiState) {
      if (!this.adChoicesIcon_) {
        return;
      }

      this.adChoicesIcon_.classList.toggle(
      DESKTOP_FULLBLEED_CLASS,
      uiState === UIType.DESKTOP_FULLBLEED);

    }

    /**
     * Construct an analytics event and trigger it.
     * @param {string} eventType
     * @param {!Object<string, number>} vars A map of vars and their values.
     * @private
     */ }, { key: "analyticsEvent_", value:
    function analyticsEvent_(eventType, vars) {var _this5 = this;
      this.analytics_.then(function (analytics) {return (
          analytics.fireEvent(_this5.pageElement_, _this5.index_, eventType, vars));});

    } }]);return StoryAdPage;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-page.js