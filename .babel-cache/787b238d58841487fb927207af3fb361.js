import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { A4AVarNames, START_CTA_ANIMATION_ATTR, createCta, getStoryAdMetadataFromDoc, getStoryAdMetadataFromElement, maybeCreateAttribution, validateCtaMetadata } from "./story-ad-ui";
import { AdvanceExpToTime, StoryAdAutoAdvance } from "../../../src/experiments/story-ad-auto-advance";
import { AnalyticsEvents, AnalyticsVars, STORY_AD_ANALYTICS } from "./story-ad-analytics";
import { BranchToTimeValues, StoryAdSegmentExp } from "../../../src/experiments/story-ad-progress-segment";
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Gestures } from "../../../src/gesture";
import { StateProperty, UIType } from "../../amp-story/1.0/amp-story-store-service";
import { SwipeXRecognizer } from "../../../src/gesture-recognizers";
import { assertConfig } from "../../amp-ad-exit/0.1/config";
import { createElementWithAttributes, isJsonScriptTag, toggleAttribute } from "../../../src/core/dom";
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
var TIMEOUT_LIMIT = 10000;
// 10 seconds

/** @const {string} */
var GLASS_PANE_CLASS = 'i-amphtml-glass-pane';

/** @const {string} */
var DESKTOP_FULLBLEED_CLASS = 'i-amphtml-story-ad-fullbleed';

/** @enum {string} */
var PageAttributes = {
  LOADING: 'i-amphtml-loading',
  IFRAME_BODY_VISIBLE: 'amp-story-visible'
};
export var StoryAdPage = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} config
   * @param {number} index
   * @param {!./story-ad-localization.StoryAdLocalization} localization
   * @param {!./story-ad-button-text-fitter.ButtonTextFitter} buttonFitter
   * @param {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} storeService
   */
  function StoryAdPage(ampdoc, config, index, localization, buttonFitter, storeService) {
    _classCallCheck(this, StoryAdPage);

    /** @private @const {!JsonObject} */
    this.config_ = config;

    /** @private @const {number} */
    this.index_ = index;

    /** @private @const {!./story-ad-localization.StoryAdLocalization} */
    this.localizationService_ = localization;

    /** @private @const {string} */
    this.id_ = "i-amphtml-ad-page-" + this.index_;

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

  /** @return {?Document} ad document within FIE */
  _createClass(StoryAdPage, [{
    key: "getAdDoc",
    value: function getAdDoc() {
      return this.adDoc_;
    }
    /** @return {string} */

  }, {
    key: "getId",
    value: function getId() {
      return this.id_;
    }
    /** @return {boolean} */

  }, {
    key: "hasTimedOut",
    value: function hasTimedOut() {
      return !!this.timeCreated_ && Date.now() - this.timeCreated_ > TIMEOUT_LIMIT;
    }
    /** @return {boolean} */

  }, {
    key: "isLoaded",
    value: function isLoaded() {
      return this.loaded_;
    }
    /** @return {boolean} */

  }, {
    key: "hasBeenViewed",
    value: function hasBeenViewed() {
      return this.viewed_;
    }
    /** @return {?Element} */

  }, {
    key: "getPageElement",
    value: function getPageElement() {
      return this.pageElement_;
    }
    /**
     * Register functions to be executed when ad has loaded.
     * @param {Function} cb
     */

  }, {
    key: "registerLoadCallback",
    value: function registerLoadCallback(cb) {
      this.loadCallbacks_.push(cb);
    }
    /**
     * Adds/removes [amp-story-visible] on FIE body so that animations can
     * respond accordingly.
     */

  }, {
    key: "toggleVisibility",
    value: function toggleVisibility() {
      this.viewed_ = true;
      this.ctaAnchor_ && toggleAttribute(this.ctaAnchor_, START_CTA_ANIMATION_ATTR);

      // TODO(calebcordry): Properly handle visible attribute for custom ads.
      if (this.adDoc_) {
        toggleAttribute(dev().assertElement(this.adDoc_.body), PageAttributes.IFRAME_BODY_VISIBLE);
        // TODO(#24829) Remove alternate body when we have full ad network support.
        var alternateBody = this.adDoc_.querySelector('#x-a4a-former-body');
        alternateBody && toggleAttribute(alternateBody, PageAttributes.IFRAME_BODY_VISIBLE);
      }
    }
    /**
     * Create an `amp-story-page` containing an `amp-ad`.
     * @return {!Element}
     */

  }, {
    key: "build",
    value: function build() {
      var _this$analyticsEvent_;

      this.timeCreated_ = Date.now();
      this.pageElement_ = this.createPageElement_();
      this.adElement_ = this.createAdElement_();
      var glassPane = this.doc_.createElement('div');
      glassPane.classList.add(GLASS_PANE_CLASS);
      var gridLayer = this.doc_.createElement('amp-story-grid-layer');
      gridLayer.setAttribute('template', 'fill');
      var paneGridLayer = gridLayer.cloneNode(
      /* deep */
      false);
      gridLayer.appendChild(this.adElement_);
      paneGridLayer.appendChild(glassPane);
      this.pageElement_.appendChild(gridLayer);
      this.pageElement_.appendChild(paneGridLayer);
      this.listenForAdLoadSignals_();
      this.listenForSwipes_();
      this.analyticsEvent_(AnalyticsEvents.AD_REQUESTED, (_this$analyticsEvent_ = {}, _this$analyticsEvent_[AnalyticsVars.AD_REQUESTED] = Date.now(), _this$analyticsEvent_));
      return this.pageElement_;
    }
    /**
     * Try to create CTA (Click-To-Action) before showing the ad. Will fail if
     * not enough metadata to create the outlink button.
     * @return {Promise<boolean>}
     */

  }, {
    key: "maybeCreateCta",
    value: function maybeCreateCta() {
      var _this = this;

      return _resolvedPromise().then(function () {
        // Inabox story ads control their own CTA creation.
        if (_this.is3pAdFrame_) {
          return true;
        }

        var uiMetadata = map();

        // Template Ads.
        if (!_this.adDoc_) {
          Object.assign(uiMetadata, getStoryAdMetadataFromElement(devAssert(_this.adElement_)));
        } else {
          Object.assign(uiMetadata, getStoryAdMetadataFromDoc(_this.adDoc_), // TODO(ccordry): Depricate when possible.
          _this.readAmpAdExit_());
        }

        if (!validateCtaMetadata(uiMetadata)) {
          return false;
        }

        uiMetadata[A4AVarNames.CTA_TYPE] = localizeCtaText(uiMetadata[A4AVarNames.CTA_TYPE], _this.localizationService_) || uiMetadata[A4AVarNames.CTA_TYPE];

        // Store the cta-type as an accesible var for any further pings.
        _this.analytics_.then(function (analytics) {
          return analytics.setVar(_this.index_, // adIndex
          AnalyticsVars.CTA_TYPE, uiMetadata[A4AVarNames.CTA_TYPE]);
        });

        if (_this.adChoicesIcon_ = maybeCreateAttribution(_this.win_, uiMetadata, devAssert(_this.pageElement_))) {
          _this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
            _this.onUIStateUpdate_(uiState);
          }, true
          /** callToInitialize */
          );
        }

        return _this.createCtaLayer_(uiMetadata);
      });
    }
    /**
     * @return {!Element}
     * @private
     */

  }, {
    key: "createPageElement_",
    value: function createPageElement_() {
      var attributes = dict({
        'ad': '',
        'distance': '2',
        'i-amphtml-loading': '',
        'id': this.id_
      });
      var autoAdvanceExpBranch = getExperimentBranch(this.win_, StoryAdAutoAdvance.ID);
      var segmentExpBranch = getExperimentBranch(this.win_, StoryAdSegmentExp.ID);

      if (segmentExpBranch && segmentExpBranch !== StoryAdSegmentExp.CONTROL) {
        attributes['auto-advance-after'] = BranchToTimeValues[segmentExpBranch];
      } else if (autoAdvanceExpBranch && autoAdvanceExpBranch !== StoryAdAutoAdvance.CONTROL) {
        attributes['auto-advance-after'] = AdvanceExpToTime[autoAdvanceExpBranch];
      }

      var page = createElementWithAttributes(this.doc_, 'amp-story-page', attributes);
      // TODO(ccordry): Allow creative to change default background color.
      setStyle(page, 'background-color', '#212125');
      return page;
    }
    /**
     * @return {!Element}
     * @private
     */

  }, {
    key: "createAdElement_",
    value: function createAdElement_() {
      if (this.config_['type'] === 'fake') {
        this.config_['id'] = "i-amphtml-demo-" + this.index_;
      }

      return createElementWithAttributes(this.doc_, 'amp-ad', this.config_);
    }
    /**
     * Creates listeners to receive signal that ad is ready to be shown
     * for both FIE & inabox case.
     * @private
     */

  }, {
    key: "listenForAdLoadSignals_",
    value: function listenForAdLoadSignals_() {
      var _this2 = this;

      // Friendly frame INI_LOAD.
      this.adElement_.signals() // TODO(ccordry): Investigate using a better signal waiting for video loads.
      .whenSignal(CommonSignals.INI_LOAD).then(function () {
        return _this2.onAdLoaded_();
      });
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
     */

  }, {
    key: "listenForSwipes_",
    value: function listenForSwipes_() {
      var _this3 = this;

      var gestures = Gestures.get(this.pageElement_, true
      /* shouldNotPreventDefault */
      , false
      /* shouldStopPropogation */
      );
      gestures.onGesture(SwipeXRecognizer, function () {
        var _this3$analyticsEvent;

        _this3.analyticsEvent_(AnalyticsEvents.AD_SWIPED, (_this3$analyticsEvent = {}, _this3$analyticsEvent[AnalyticsVars.AD_SWIPED] = Date.now(), _this3$analyticsEvent));

        gestures.cleanup();
      });
    }
    /**
     * Returns the iframe containing the creative if it exists.
     * @return {?HTMLIFrameElement}
     */

  }, {
    key: "getAdFrame_",
    value: function getAdFrame_() {
      if (this.adFrame_) {
        return this.adFrame_;
      }

      return this.adFrame_ =
      /** @type {?HTMLIFrameElement} */
      elementByTag(devAssert(this.pageElement_), 'iframe');
    }
    /**
     * Things that need to happen after the created ad is "loaded".
     * @private
     */

  }, {
    key: "onAdLoaded_",
    value: function onAdLoaded_() {
      var _this$analyticsEvent_2;

      // Ensures the video-manager does not follow the autoplay attribute on
      // amp-video tags, which would play the ad in the background before it is
      // displayed.
      // TODO(ccordry): do we still need this? Its a pain to always stub in tests.
      this.pageElement_.getImpl().then(function (impl) {
        return impl.delegateVideoAutoplay();
      });
      // Remove loading attribute once loaded so that desktop CSS will position
      // offscren with all other pages.
      this.pageElement_.removeAttribute(PageAttributes.LOADING);
      this.analyticsEvent_(AnalyticsEvents.AD_LOADED, (_this$analyticsEvent_2 = {}, _this$analyticsEvent_2[AnalyticsVars.AD_LOADED] = Date.now(), _this$analyticsEvent_2));

      if (this.getAdFrame_() && !this.is3pAdFrame_) {
        this.adDoc_ = getFrameDoc(
        /** @type {!HTMLIFrameElement} */
        this.adFrame_);
      }

      this.loaded_ = true;
      this.loadCallbacks_.forEach(function (cb) {
        return cb();
      });
    }
    /**
     * Create layer to contain outlink button.
     * @param {!./story-ad-ui.StoryAdUIMetadata} uiMetadata
     * @return {Promise<boolean>}
     */

  }, {
    key: "createCtaLayer_",
    value: function createCtaLayer_(uiMetadata) {
      var _this4 = this;

      return createCta(this.doc_, devAssert(this.buttonFitter_), dev().assertElement(this.pageElement_), // Container.
      uiMetadata).then(function (anchor) {
        if (anchor) {
          _this4.ctaAnchor_ = anchor;
          // Click listener so that we can fire `story-ad-click` analytics trigger at
          // the appropriate time.
          anchor.addEventListener('click', function () {
            var _vars;

            var vars = (_vars = {}, _vars[AnalyticsVars.AD_CLICKED] = Date.now(), _vars);

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
     */

  }, {
    key: "readAmpAdExit_",
    value: function readAmpAdExit_() {
      var ampAdExit = elementByTag(dev().assertElement(this.adDoc_.body), 'amp-ad-exit');

      if (ampAdExit) {
        try {
          var _ref;

          var children = ampAdExit.children;
          userAssert(children.length == 1, 'The tag should contain exactly one <script> child.');
          var child = children[0];
          userAssert(isJsonScriptTag(child), 'The amp-ad-exit config should ' + 'be inside a <script> tag with type="application/json"');
          var config = assertConfig(parseJson(child.textContent));
          var target = config['targets'] && Object.keys(config['targets']) && config['targets'][Object.keys(config['targets'])[0]];
          var finalUrl = target && target['finalUrl'];
          return target ? (_ref = {}, _ref[A4AVarNames.CTA_URL] = finalUrl, _ref) : {};
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
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      if (!this.adChoicesIcon_) {
        return;
      }

      this.adChoicesIcon_.classList.toggle(DESKTOP_FULLBLEED_CLASS, uiState === UIType.DESKTOP_FULLBLEED);
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
      var _this5 = this;

      this.analytics_.then(function (analytics) {
        return analytics.fireEvent(_this5.pageElement_, _this5.index_, eventType, vars);
      });
    }
  }]);

  return StoryAdPage;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0b3J5LWFkLXBhZ2UuanMiXSwibmFtZXMiOlsiQTRBVmFyTmFtZXMiLCJTVEFSVF9DVEFfQU5JTUFUSU9OX0FUVFIiLCJjcmVhdGVDdGEiLCJnZXRTdG9yeUFkTWV0YWRhdGFGcm9tRG9jIiwiZ2V0U3RvcnlBZE1ldGFkYXRhRnJvbUVsZW1lbnQiLCJtYXliZUNyZWF0ZUF0dHJpYnV0aW9uIiwidmFsaWRhdGVDdGFNZXRhZGF0YSIsIkFkdmFuY2VFeHBUb1RpbWUiLCJTdG9yeUFkQXV0b0FkdmFuY2UiLCJBbmFseXRpY3NFdmVudHMiLCJBbmFseXRpY3NWYXJzIiwiU1RPUllfQURfQU5BTFlUSUNTIiwiQnJhbmNoVG9UaW1lVmFsdWVzIiwiU3RvcnlBZFNlZ21lbnRFeHAiLCJDb21tb25TaWduYWxzIiwiR2VzdHVyZXMiLCJTdGF0ZVByb3BlcnR5IiwiVUlUeXBlIiwiU3dpcGVYUmVjb2duaXplciIsImFzc2VydENvbmZpZyIsImNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyIsImlzSnNvblNjcmlwdFRhZyIsInRvZ2dsZUF0dHJpYnV0ZSIsImRldiIsImRldkFzc2VydCIsInVzZXJBc3NlcnQiLCJkaWN0IiwibWFwIiwiZWxlbWVudEJ5VGFnIiwiZ2V0RGF0YSIsImxpc3RlbiIsImdldEV4cGVyaW1lbnRCcmFuY2giLCJnZXRGcmFtZURvYyIsImxvY2FsaXplQ3RhVGV4dCIsImdldFNlcnZpY2VQcm9taXNlRm9yRG9jIiwicGFyc2VKc29uIiwic2V0U3R5bGUiLCJUQUciLCJUSU1FT1VUX0xJTUlUIiwiR0xBU1NfUEFORV9DTEFTUyIsIkRFU0tUT1BfRlVMTEJMRUVEX0NMQVNTIiwiUGFnZUF0dHJpYnV0ZXMiLCJMT0FESU5HIiwiSUZSQU1FX0JPRFlfVklTSUJMRSIsIlN0b3J5QWRQYWdlIiwiYW1wZG9jIiwiY29uZmlnIiwiaW5kZXgiLCJsb2NhbGl6YXRpb24iLCJidXR0b25GaXR0ZXIiLCJzdG9yZVNlcnZpY2UiLCJjb25maWdfIiwiaW5kZXhfIiwibG9jYWxpemF0aW9uU2VydmljZV8iLCJpZF8iLCJ3aW5fIiwid2luIiwiZG9jXyIsImRvY3VtZW50IiwiYW5hbHl0aWNzXyIsInRpbWVDcmVhdGVkXyIsInBhZ2VFbGVtZW50XyIsImFkRWxlbWVudF8iLCJhZEZyYW1lXyIsImFkQ2hvaWNlc0ljb25fIiwiY3RhQW5jaG9yXyIsImFkRG9jXyIsImxvYWRlZF8iLCJsb2FkQ2FsbGJhY2tzXyIsImJ1dHRvbkZpdHRlcl8iLCJ2aWV3ZWRfIiwic3RvcmVTZXJ2aWNlXyIsImlzM3BBZEZyYW1lXyIsIkRhdGUiLCJub3ciLCJjYiIsInB1c2giLCJhc3NlcnRFbGVtZW50IiwiYm9keSIsImFsdGVybmF0ZUJvZHkiLCJxdWVyeVNlbGVjdG9yIiwiY3JlYXRlUGFnZUVsZW1lbnRfIiwiY3JlYXRlQWRFbGVtZW50XyIsImdsYXNzUGFuZSIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc0xpc3QiLCJhZGQiLCJncmlkTGF5ZXIiLCJzZXRBdHRyaWJ1dGUiLCJwYW5lR3JpZExheWVyIiwiY2xvbmVOb2RlIiwiYXBwZW5kQ2hpbGQiLCJsaXN0ZW5Gb3JBZExvYWRTaWduYWxzXyIsImxpc3RlbkZvclN3aXBlc18iLCJhbmFseXRpY3NFdmVudF8iLCJBRF9SRVFVRVNURUQiLCJ0aGVuIiwidWlNZXRhZGF0YSIsIk9iamVjdCIsImFzc2lnbiIsInJlYWRBbXBBZEV4aXRfIiwiQ1RBX1RZUEUiLCJhbmFseXRpY3MiLCJzZXRWYXIiLCJzdWJzY3JpYmUiLCJVSV9TVEFURSIsInVpU3RhdGUiLCJvblVJU3RhdGVVcGRhdGVfIiwiY3JlYXRlQ3RhTGF5ZXJfIiwiYXR0cmlidXRlcyIsImF1dG9BZHZhbmNlRXhwQnJhbmNoIiwiSUQiLCJzZWdtZW50RXhwQnJhbmNoIiwiQ09OVFJPTCIsInBhZ2UiLCJzaWduYWxzIiwid2hlblNpZ25hbCIsIklOSV9MT0FEIiwib25BZExvYWRlZF8iLCJyZW1vdmVMaXN0ZW5lciIsImUiLCJnZXRBZEZyYW1lXyIsInNvdXJjZSIsImNvbnRlbnRXaW5kb3ciLCJnZXN0dXJlcyIsImdldCIsIm9uR2VzdHVyZSIsIkFEX1NXSVBFRCIsImNsZWFudXAiLCJnZXRJbXBsIiwiaW1wbCIsImRlbGVnYXRlVmlkZW9BdXRvcGxheSIsInJlbW92ZUF0dHJpYnV0ZSIsIkFEX0xPQURFRCIsImZvckVhY2giLCJhbmNob3IiLCJhZGRFdmVudExpc3RlbmVyIiwidmFycyIsIkFEX0NMSUNLRUQiLCJhbXBBZEV4aXQiLCJjaGlsZHJlbiIsImxlbmd0aCIsImNoaWxkIiwidGV4dENvbnRlbnQiLCJ0YXJnZXQiLCJrZXlzIiwiZmluYWxVcmwiLCJDVEFfVVJMIiwiZXJyb3IiLCJ0b2dnbGUiLCJERVNLVE9QX0ZVTExCTEVFRCIsImV2ZW50VHlwZSIsImZpcmVFdmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUNFQSxXQURGLEVBRUVDLHdCQUZGLEVBR0VDLFNBSEYsRUFJRUMseUJBSkYsRUFLRUMsNkJBTEYsRUFNRUMsc0JBTkYsRUFPRUMsbUJBUEY7QUFTQSxTQUNFQyxnQkFERixFQUVFQyxrQkFGRjtBQUlBLFNBQ0VDLGVBREYsRUFFRUMsYUFGRixFQUdFQyxrQkFIRjtBQUtBLFNBQ0VDLGtCQURGLEVBRUVDLGlCQUZGO0FBSUEsU0FBUUMsYUFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUNFQyxhQURGLEVBRUVDLE1BRkY7QUFJQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLFlBQVI7QUFDQSxTQUNFQywyQkFERixFQUVFQyxlQUZGLEVBR0VDLGVBSEY7QUFLQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWIsRUFBd0JDLFVBQXhCO0FBQ0EsU0FBUUMsSUFBUixFQUFjQyxHQUFkO0FBQ0EsU0FBUUMsWUFBUjtBQUNBLFNBQVFDLE9BQVIsRUFBaUJDLE1BQWpCO0FBQ0EsU0FBUUMsbUJBQVI7QUFDQSxTQUFRQyxXQUFSLEVBQXFC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b0IsTUFBSSxDQUFDM0YsWUFBekIsRUFBdUMsTUFBSSxDQUFDVCxNQUE1QyxFQUFvRG1HLFNBQXBELEVBQStEZCxJQUEvRCxDQURtQjtBQUFBLE9BQXJCO0FBR0Q7QUFyZEg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtcbiAgQTRBVmFyTmFtZXMsXG4gIFNUQVJUX0NUQV9BTklNQVRJT05fQVRUUixcbiAgY3JlYXRlQ3RhLFxuICBnZXRTdG9yeUFkTWV0YWRhdGFGcm9tRG9jLFxuICBnZXRTdG9yeUFkTWV0YWRhdGFGcm9tRWxlbWVudCxcbiAgbWF5YmVDcmVhdGVBdHRyaWJ1dGlvbixcbiAgdmFsaWRhdGVDdGFNZXRhZGF0YSxcbn0gZnJvbSAnLi9zdG9yeS1hZC11aSc7XG5pbXBvcnQge1xuICBBZHZhbmNlRXhwVG9UaW1lLFxuICBTdG9yeUFkQXV0b0FkdmFuY2UsXG59IGZyb20gJyNleHBlcmltZW50cy9zdG9yeS1hZC1hdXRvLWFkdmFuY2UnO1xuaW1wb3J0IHtcbiAgQW5hbHl0aWNzRXZlbnRzLFxuICBBbmFseXRpY3NWYXJzLFxuICBTVE9SWV9BRF9BTkFMWVRJQ1MsXG59IGZyb20gJy4vc3RvcnktYWQtYW5hbHl0aWNzJztcbmltcG9ydCB7XG4gIEJyYW5jaFRvVGltZVZhbHVlcyxcbiAgU3RvcnlBZFNlZ21lbnRFeHAsXG59IGZyb20gJyNleHBlcmltZW50cy9zdG9yeS1hZC1wcm9ncmVzcy1zZWdtZW50JztcbmltcG9ydCB7Q29tbW9uU2lnbmFsc30gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2NvbW1vbi1zaWduYWxzJztcbmltcG9ydCB7R2VzdHVyZXN9IGZyb20gJy4uLy4uLy4uL3NyYy9nZXN0dXJlJztcbmltcG9ydCB7XG4gIFN0YXRlUHJvcGVydHksXG4gIFVJVHlwZSxcbn0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge1N3aXBlWFJlY29nbml6ZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9nZXN0dXJlLXJlY29nbml6ZXJzJztcbmltcG9ydCB7YXNzZXJ0Q29uZmlnfSBmcm9tICcuLi8uLi9hbXAtYWQtZXhpdC8wLjEvY29uZmlnJztcbmltcG9ydCB7XG4gIGNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyxcbiAgaXNKc29uU2NyaXB0VGFnLFxuICB0b2dnbGVBdHRyaWJ1dGUsXG59IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0LCB1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7ZGljdCwgbWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtlbGVtZW50QnlUYWd9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge2dldERhdGEsIGxpc3Rlbn0gZnJvbSAnLi4vLi4vLi4vc3JjL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge2dldEV4cGVyaW1lbnRCcmFuY2h9IGZyb20gJyNleHBlcmltZW50cyc7XG5pbXBvcnQge2dldEZyYW1lRG9jLCBsb2NhbGl6ZUN0YVRleHR9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlUHJvbWlzZUZvckRvY30gZnJvbSAnLi4vLi4vLi4vc3JjL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge3BhcnNlSnNvbn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHtzZXRTdHlsZX0gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1zdG9yeS1hdXRvLWFkczpwYWdlJztcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgVElNRU9VVF9MSU1JVCA9IDEwMDAwOyAvLyAxMCBzZWNvbmRzXG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEdMQVNTX1BBTkVfQ0xBU1MgPSAnaS1hbXBodG1sLWdsYXNzLXBhbmUnO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBERVNLVE9QX0ZVTExCTEVFRF9DTEFTUyA9ICdpLWFtcGh0bWwtc3RvcnktYWQtZnVsbGJsZWVkJztcblxuLyoqIEBlbnVtIHtzdHJpbmd9ICovXG5jb25zdCBQYWdlQXR0cmlidXRlcyA9IHtcbiAgTE9BRElORzogJ2ktYW1waHRtbC1sb2FkaW5nJyxcbiAgSUZSQU1FX0JPRFlfVklTSUJMRTogJ2FtcC1zdG9yeS12aXNpYmxlJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBTdG9yeUFkUGFnZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBjb25maWdcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7IS4vc3RvcnktYWQtbG9jYWxpemF0aW9uLlN0b3J5QWRMb2NhbGl6YXRpb259IGxvY2FsaXphdGlvblxuICAgKiBAcGFyYW0geyEuL3N0b3J5LWFkLWJ1dHRvbi10ZXh0LWZpdHRlci5CdXR0b25UZXh0Rml0dGVyfSBidXR0b25GaXR0ZXJcbiAgICogQHBhcmFtIHshLi4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3Rvcnktc3RvcmUtc2VydmljZS5BbXBTdG9yeVN0b3JlU2VydmljZX0gc3RvcmVTZXJ2aWNlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MsIGNvbmZpZywgaW5kZXgsIGxvY2FsaXphdGlvbiwgYnV0dG9uRml0dGVyLCBzdG9yZVNlcnZpY2UpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshSnNvbk9iamVjdH0gKi9cbiAgICB0aGlzLmNvbmZpZ18gPSBjb25maWc7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtudW1iZXJ9ICovXG4gICAgdGhpcy5pbmRleF8gPSBpbmRleDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL3N0b3J5LWFkLWxvY2FsaXphdGlvbi5TdG9yeUFkTG9jYWxpemF0aW9ufSAqL1xuICAgIHRoaXMubG9jYWxpemF0aW9uU2VydmljZV8gPSBsb2NhbGl6YXRpb247XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG4gICAgdGhpcy5pZF8gPSBgaS1hbXBodG1sLWFkLXBhZ2UtJHt0aGlzLmluZGV4X31gO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSBhbXBkb2Mud2luO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IURvY3VtZW50fSAqL1xuICAgIHRoaXMuZG9jXyA9IHRoaXMud2luXy5kb2N1bWVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFQcm9taXNlfSAqL1xuICAgIHRoaXMuYW5hbHl0aWNzXyA9IGdldFNlcnZpY2VQcm9taXNlRm9yRG9jKGFtcGRvYywgU1RPUllfQURfQU5BTFlUSUNTKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P251bWJlcn0gKi9cbiAgICB0aGlzLnRpbWVDcmVhdGVkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMucGFnZUVsZW1lbnRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5hZEVsZW1lbnRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0hUTUxJRnJhbWVFbGVtZW50fSAqL1xuICAgIHRoaXMuYWRGcmFtZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLmFkQ2hvaWNlc0ljb25fID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5jdGFBbmNob3JfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0RvY3VtZW50fSAqL1xuICAgIHRoaXMuYWREb2NfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmxvYWRlZF8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTxGdW5jdGlvbj59ICovXG4gICAgdGhpcy5sb2FkQ2FsbGJhY2tzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7Li9zdG9yeS1hZC1idXR0b24tdGV4dC1maXR0ZXIuQnV0dG9uVGV4dEZpdHRlcn0gKi9cbiAgICB0aGlzLmJ1dHRvbkZpdHRlcl8gPSBidXR0b25GaXR0ZXI7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy52aWV3ZWRfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3Rvcnktc3RvcmUtc2VydmljZS5BbXBTdG9yeVN0b3JlU2VydmljZX0gKi9cbiAgICB0aGlzLnN0b3JlU2VydmljZV8gPSBzdG9yZVNlcnZpY2U7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pczNwQWRGcmFtZV8gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHs/RG9jdW1lbnR9IGFkIGRvY3VtZW50IHdpdGhpbiBGSUUgKi9cbiAgZ2V0QWREb2MoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWREb2NfO1xuICB9XG5cbiAgLyoqIEByZXR1cm4ge3N0cmluZ30gKi9cbiAgZ2V0SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaWRfO1xuICB9XG5cbiAgLyoqIEByZXR1cm4ge2Jvb2xlYW59ICovXG4gIGhhc1RpbWVkT3V0KCkge1xuICAgIHJldHVybiAoXG4gICAgICAhIXRoaXMudGltZUNyZWF0ZWRfICYmIERhdGUubm93KCkgLSB0aGlzLnRpbWVDcmVhdGVkXyA+IFRJTUVPVVRfTElNSVRcbiAgICApO1xuICB9XG5cbiAgLyoqIEByZXR1cm4ge2Jvb2xlYW59ICovXG4gIGlzTG9hZGVkKCkge1xuICAgIHJldHVybiB0aGlzLmxvYWRlZF87XG4gIH1cblxuICAvKiogQHJldHVybiB7Ym9vbGVhbn0gKi9cbiAgaGFzQmVlblZpZXdlZCgpIHtcbiAgICByZXR1cm4gdGhpcy52aWV3ZWRfO1xuICB9XG5cbiAgLyoqIEByZXR1cm4gez9FbGVtZW50fSAqL1xuICBnZXRQYWdlRWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYWdlRWxlbWVudF87XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgZnVuY3Rpb25zIHRvIGJlIGV4ZWN1dGVkIHdoZW4gYWQgaGFzIGxvYWRlZC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2JcbiAgICovXG4gIHJlZ2lzdGVyTG9hZENhbGxiYWNrKGNiKSB7XG4gICAgdGhpcy5sb2FkQ2FsbGJhY2tzXy5wdXNoKGNiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzL3JlbW92ZXMgW2FtcC1zdG9yeS12aXNpYmxlXSBvbiBGSUUgYm9keSBzbyB0aGF0IGFuaW1hdGlvbnMgY2FuXG4gICAqIHJlc3BvbmQgYWNjb3JkaW5nbHkuXG4gICAqL1xuICB0b2dnbGVWaXNpYmlsaXR5KCkge1xuICAgIHRoaXMudmlld2VkXyA9IHRydWU7XG4gICAgdGhpcy5jdGFBbmNob3JfICYmXG4gICAgICB0b2dnbGVBdHRyaWJ1dGUodGhpcy5jdGFBbmNob3JfLCBTVEFSVF9DVEFfQU5JTUFUSU9OX0FUVFIpO1xuXG4gICAgLy8gVE9ETyhjYWxlYmNvcmRyeSk6IFByb3Blcmx5IGhhbmRsZSB2aXNpYmxlIGF0dHJpYnV0ZSBmb3IgY3VzdG9tIGFkcy5cbiAgICBpZiAodGhpcy5hZERvY18pIHtcbiAgICAgIHRvZ2dsZUF0dHJpYnV0ZShcbiAgICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmFkRG9jXy5ib2R5KSxcbiAgICAgICAgUGFnZUF0dHJpYnV0ZXMuSUZSQU1FX0JPRFlfVklTSUJMRVxuICAgICAgKTtcbiAgICAgIC8vIFRPRE8oIzI0ODI5KSBSZW1vdmUgYWx0ZXJuYXRlIGJvZHkgd2hlbiB3ZSBoYXZlIGZ1bGwgYWQgbmV0d29yayBzdXBwb3J0LlxuICAgICAgY29uc3QgYWx0ZXJuYXRlQm9keSA9IHRoaXMuYWREb2NfLnF1ZXJ5U2VsZWN0b3IoJyN4LWE0YS1mb3JtZXItYm9keScpO1xuICAgICAgYWx0ZXJuYXRlQm9keSAmJlxuICAgICAgICB0b2dnbGVBdHRyaWJ1dGUoYWx0ZXJuYXRlQm9keSwgUGFnZUF0dHJpYnV0ZXMuSUZSQU1FX0JPRFlfVklTSUJMRSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBgYW1wLXN0b3J5LXBhZ2VgIGNvbnRhaW5pbmcgYW4gYGFtcC1hZGAuXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKi9cbiAgYnVpbGQoKSB7XG4gICAgdGhpcy50aW1lQ3JlYXRlZF8gPSBEYXRlLm5vdygpO1xuICAgIHRoaXMucGFnZUVsZW1lbnRfID0gdGhpcy5jcmVhdGVQYWdlRWxlbWVudF8oKTtcbiAgICB0aGlzLmFkRWxlbWVudF8gPSB0aGlzLmNyZWF0ZUFkRWxlbWVudF8oKTtcblxuICAgIGNvbnN0IGdsYXNzUGFuZSA9IHRoaXMuZG9jXy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBnbGFzc1BhbmUuY2xhc3NMaXN0LmFkZChHTEFTU19QQU5FX0NMQVNTKTtcblxuICAgIGNvbnN0IGdyaWRMYXllciA9IHRoaXMuZG9jXy5jcmVhdGVFbGVtZW50KCdhbXAtc3RvcnktZ3JpZC1sYXllcicpO1xuICAgIGdyaWRMYXllci5zZXRBdHRyaWJ1dGUoJ3RlbXBsYXRlJywgJ2ZpbGwnKTtcblxuICAgIGNvbnN0IHBhbmVHcmlkTGF5ZXIgPSBncmlkTGF5ZXIuY2xvbmVOb2RlKC8qIGRlZXAgKi8gZmFsc2UpO1xuXG4gICAgZ3JpZExheWVyLmFwcGVuZENoaWxkKHRoaXMuYWRFbGVtZW50Xyk7XG4gICAgcGFuZUdyaWRMYXllci5hcHBlbmRDaGlsZChnbGFzc1BhbmUpO1xuICAgIHRoaXMucGFnZUVsZW1lbnRfLmFwcGVuZENoaWxkKGdyaWRMYXllcik7XG4gICAgdGhpcy5wYWdlRWxlbWVudF8uYXBwZW5kQ2hpbGQocGFuZUdyaWRMYXllcik7XG5cbiAgICB0aGlzLmxpc3RlbkZvckFkTG9hZFNpZ25hbHNfKCk7XG4gICAgdGhpcy5saXN0ZW5Gb3JTd2lwZXNfKCk7XG5cbiAgICB0aGlzLmFuYWx5dGljc0V2ZW50XyhBbmFseXRpY3NFdmVudHMuQURfUkVRVUVTVEVELCB7XG4gICAgICBbQW5hbHl0aWNzVmFycy5BRF9SRVFVRVNURURdOiBEYXRlLm5vdygpLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMucGFnZUVsZW1lbnRfO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyeSB0byBjcmVhdGUgQ1RBIChDbGljay1Uby1BY3Rpb24pIGJlZm9yZSBzaG93aW5nIHRoZSBhZC4gV2lsbCBmYWlsIGlmXG4gICAqIG5vdCBlbm91Z2ggbWV0YWRhdGEgdG8gY3JlYXRlIHRoZSBvdXRsaW5rIGJ1dHRvbi5cbiAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn1cbiAgICovXG4gIG1heWJlQ3JlYXRlQ3RhKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgIC8vIEluYWJveCBzdG9yeSBhZHMgY29udHJvbCB0aGVpciBvd24gQ1RBIGNyZWF0aW9uLlxuICAgICAgaWYgKHRoaXMuaXMzcEFkRnJhbWVfKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB1aU1ldGFkYXRhID0gbWFwKCk7XG5cbiAgICAgIC8vIFRlbXBsYXRlIEFkcy5cbiAgICAgIGlmICghdGhpcy5hZERvY18pIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB1aU1ldGFkYXRhLFxuICAgICAgICAgIGdldFN0b3J5QWRNZXRhZGF0YUZyb21FbGVtZW50KGRldkFzc2VydCh0aGlzLmFkRWxlbWVudF8pKVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB1aU1ldGFkYXRhLFxuICAgICAgICAgIGdldFN0b3J5QWRNZXRhZGF0YUZyb21Eb2ModGhpcy5hZERvY18pLFxuICAgICAgICAgIC8vIFRPRE8oY2NvcmRyeSk6IERlcHJpY2F0ZSB3aGVuIHBvc3NpYmxlLlxuICAgICAgICAgIHRoaXMucmVhZEFtcEFkRXhpdF8oKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXZhbGlkYXRlQ3RhTWV0YWRhdGEodWlNZXRhZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB1aU1ldGFkYXRhW0E0QVZhck5hbWVzLkNUQV9UWVBFXSA9XG4gICAgICAgIGxvY2FsaXplQ3RhVGV4dChcbiAgICAgICAgICB1aU1ldGFkYXRhW0E0QVZhck5hbWVzLkNUQV9UWVBFXSxcbiAgICAgICAgICB0aGlzLmxvY2FsaXphdGlvblNlcnZpY2VfXG4gICAgICAgICkgfHwgdWlNZXRhZGF0YVtBNEFWYXJOYW1lcy5DVEFfVFlQRV07XG5cbiAgICAgIC8vIFN0b3JlIHRoZSBjdGEtdHlwZSBhcyBhbiBhY2Nlc2libGUgdmFyIGZvciBhbnkgZnVydGhlciBwaW5ncy5cbiAgICAgIHRoaXMuYW5hbHl0aWNzXy50aGVuKChhbmFseXRpY3MpID0+XG4gICAgICAgIGFuYWx5dGljcy5zZXRWYXIoXG4gICAgICAgICAgdGhpcy5pbmRleF8sIC8vIGFkSW5kZXhcbiAgICAgICAgICBBbmFseXRpY3NWYXJzLkNUQV9UWVBFLFxuICAgICAgICAgIHVpTWV0YWRhdGFbQTRBVmFyTmFtZXMuQ1RBX1RZUEVdXG4gICAgICAgIClcbiAgICAgICk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgKHRoaXMuYWRDaG9pY2VzSWNvbl8gPSBtYXliZUNyZWF0ZUF0dHJpYnV0aW9uKFxuICAgICAgICAgIHRoaXMud2luXyxcbiAgICAgICAgICB1aU1ldGFkYXRhLFxuICAgICAgICAgIGRldkFzc2VydCh0aGlzLnBhZ2VFbGVtZW50XylcbiAgICAgICAgKSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgICAgIFN0YXRlUHJvcGVydHkuVUlfU1RBVEUsXG4gICAgICAgICAgKHVpU3RhdGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25VSVN0YXRlVXBkYXRlXyh1aVN0YXRlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ3RhTGF5ZXJfKHVpTWV0YWRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlUGFnZUVsZW1lbnRfKCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBkaWN0KHtcbiAgICAgICdhZCc6ICcnLFxuICAgICAgJ2Rpc3RhbmNlJzogJzInLFxuICAgICAgJ2ktYW1waHRtbC1sb2FkaW5nJzogJycsXG4gICAgICAnaWQnOiB0aGlzLmlkXyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGF1dG9BZHZhbmNlRXhwQnJhbmNoID0gZ2V0RXhwZXJpbWVudEJyYW5jaChcbiAgICAgIHRoaXMud2luXyxcbiAgICAgIFN0b3J5QWRBdXRvQWR2YW5jZS5JRFxuICAgICk7XG4gICAgY29uc3Qgc2VnbWVudEV4cEJyYW5jaCA9IGdldEV4cGVyaW1lbnRCcmFuY2goXG4gICAgICB0aGlzLndpbl8sXG4gICAgICBTdG9yeUFkU2VnbWVudEV4cC5JRFxuICAgICk7XG5cbiAgICBpZiAoc2VnbWVudEV4cEJyYW5jaCAmJiBzZWdtZW50RXhwQnJhbmNoICE9PSBTdG9yeUFkU2VnbWVudEV4cC5DT05UUk9MKSB7XG4gICAgICBhdHRyaWJ1dGVzWydhdXRvLWFkdmFuY2UtYWZ0ZXInXSA9IEJyYW5jaFRvVGltZVZhbHVlc1tzZWdtZW50RXhwQnJhbmNoXTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgYXV0b0FkdmFuY2VFeHBCcmFuY2ggJiZcbiAgICAgIGF1dG9BZHZhbmNlRXhwQnJhbmNoICE9PSBTdG9yeUFkQXV0b0FkdmFuY2UuQ09OVFJPTFxuICAgICkge1xuICAgICAgYXR0cmlidXRlc1snYXV0by1hZHZhbmNlLWFmdGVyJ10gPSBBZHZhbmNlRXhwVG9UaW1lW2F1dG9BZHZhbmNlRXhwQnJhbmNoXTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWdlID0gY3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzKFxuICAgICAgdGhpcy5kb2NfLFxuICAgICAgJ2FtcC1zdG9yeS1wYWdlJyxcbiAgICAgIGF0dHJpYnV0ZXNcbiAgICApO1xuICAgIC8vIFRPRE8oY2NvcmRyeSk6IEFsbG93IGNyZWF0aXZlIHRvIGNoYW5nZSBkZWZhdWx0IGJhY2tncm91bmQgY29sb3IuXG4gICAgc2V0U3R5bGUocGFnZSwgJ2JhY2tncm91bmQtY29sb3InLCAnIzIxMjEyNScpO1xuICAgIHJldHVybiBwYWdlO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlQWRFbGVtZW50XygpIHtcbiAgICBpZiAodGhpcy5jb25maWdfWyd0eXBlJ10gPT09ICdmYWtlJykge1xuICAgICAgdGhpcy5jb25maWdfWydpZCddID0gYGktYW1waHRtbC1kZW1vLSR7dGhpcy5pbmRleF99YDtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyh0aGlzLmRvY18sICdhbXAtYWQnLCB0aGlzLmNvbmZpZ18pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbGlzdGVuZXJzIHRvIHJlY2VpdmUgc2lnbmFsIHRoYXQgYWQgaXMgcmVhZHkgdG8gYmUgc2hvd25cbiAgICogZm9yIGJvdGggRklFICYgaW5hYm94IGNhc2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBsaXN0ZW5Gb3JBZExvYWRTaWduYWxzXygpIHtcbiAgICAvLyBGcmllbmRseSBmcmFtZSBJTklfTE9BRC5cbiAgICB0aGlzLmFkRWxlbWVudF9cbiAgICAgIC5zaWduYWxzKClcbiAgICAgIC8vIFRPRE8oY2NvcmRyeSk6IEludmVzdGlnYXRlIHVzaW5nIGEgYmV0dGVyIHNpZ25hbCB3YWl0aW5nIGZvciB2aWRlbyBsb2Fkcy5cbiAgICAgIC53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuSU5JX0xPQUQpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLm9uQWRMb2FkZWRfKCkpO1xuXG4gICAgLy8gSW5hYm94IGN1c3RvbSBldmVudC5cbiAgICBjb25zdCByZW1vdmVMaXN0ZW5lciA9IGxpc3Rlbih0aGlzLndpbl8sICdtZXNzYWdlJywgKGUpID0+IHtcbiAgICAgIGlmIChnZXREYXRhKGUpICE9PSAnYW1wLXN0b3J5LWFkLWxvYWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmdldEFkRnJhbWVfKCkgJiYgZS5zb3VyY2UgPT09IHRoaXMuYWRGcmFtZV8uY29udGVudFdpbmRvdykge1xuICAgICAgICB0aGlzLmlzM3BBZEZyYW1lXyA9IHRydWU7XG4gICAgICAgIHRoaXMucGFnZUVsZW1lbnRfLnNldEF0dHJpYnV0ZSgneGRvbWFpbi1hZCcsICcnKTtcbiAgICAgICAgdGhpcy5vbkFkTG9hZGVkXygpO1xuICAgICAgICByZW1vdmVMaXN0ZW5lcigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3RlbiBmb3IgYW55IGhvcml6b250YWwgc3dpcGVzLCBhbmQgZmlyZSBhbiBhbmFseXRpY3MgZXZlbnQgaWYgaXQgaGFwcGVucy5cbiAgICovXG4gIGxpc3RlbkZvclN3aXBlc18oKSB7XG4gICAgY29uc3QgZ2VzdHVyZXMgPSBHZXN0dXJlcy5nZXQoXG4gICAgICB0aGlzLnBhZ2VFbGVtZW50XyxcbiAgICAgIHRydWUgLyogc2hvdWxkTm90UHJldmVudERlZmF1bHQgKi8sXG4gICAgICBmYWxzZSAvKiBzaG91bGRTdG9wUHJvcG9nYXRpb24gKi9cbiAgICApO1xuICAgIGdlc3R1cmVzLm9uR2VzdHVyZShTd2lwZVhSZWNvZ25pemVyLCAoKSA9PiB7XG4gICAgICB0aGlzLmFuYWx5dGljc0V2ZW50XyhBbmFseXRpY3NFdmVudHMuQURfU1dJUEVELCB7XG4gICAgICAgIFtBbmFseXRpY3NWYXJzLkFEX1NXSVBFRF06IERhdGUubm93KCksXG4gICAgICB9KTtcbiAgICAgIGdlc3R1cmVzLmNsZWFudXAoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpZnJhbWUgY29udGFpbmluZyB0aGUgY3JlYXRpdmUgaWYgaXQgZXhpc3RzLlxuICAgKiBAcmV0dXJuIHs/SFRNTElGcmFtZUVsZW1lbnR9XG4gICAqL1xuICBnZXRBZEZyYW1lXygpIHtcbiAgICBpZiAodGhpcy5hZEZyYW1lXykge1xuICAgICAgcmV0dXJuIHRoaXMuYWRGcmFtZV87XG4gICAgfVxuICAgIHJldHVybiAodGhpcy5hZEZyYW1lXyA9IC8qKiBAdHlwZSB7P0hUTUxJRnJhbWVFbGVtZW50fSAqLyAoXG4gICAgICBlbGVtZW50QnlUYWcoZGV2QXNzZXJ0KHRoaXMucGFnZUVsZW1lbnRfKSwgJ2lmcmFtZScpXG4gICAgKSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpbmdzIHRoYXQgbmVlZCB0byBoYXBwZW4gYWZ0ZXIgdGhlIGNyZWF0ZWQgYWQgaXMgXCJsb2FkZWRcIi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uQWRMb2FkZWRfKCkge1xuICAgIC8vIEVuc3VyZXMgdGhlIHZpZGVvLW1hbmFnZXIgZG9lcyBub3QgZm9sbG93IHRoZSBhdXRvcGxheSBhdHRyaWJ1dGUgb25cbiAgICAvLyBhbXAtdmlkZW8gdGFncywgd2hpY2ggd291bGQgcGxheSB0aGUgYWQgaW4gdGhlIGJhY2tncm91bmQgYmVmb3JlIGl0IGlzXG4gICAgLy8gZGlzcGxheWVkLlxuICAgIC8vIFRPRE8oY2NvcmRyeSk6IGRvIHdlIHN0aWxsIG5lZWQgdGhpcz8gSXRzIGEgcGFpbiB0byBhbHdheXMgc3R1YiBpbiB0ZXN0cy5cbiAgICB0aGlzLnBhZ2VFbGVtZW50Xy5nZXRJbXBsKCkudGhlbigoaW1wbCkgPT4gaW1wbC5kZWxlZ2F0ZVZpZGVvQXV0b3BsYXkoKSk7XG5cbiAgICAvLyBSZW1vdmUgbG9hZGluZyBhdHRyaWJ1dGUgb25jZSBsb2FkZWQgc28gdGhhdCBkZXNrdG9wIENTUyB3aWxsIHBvc2l0aW9uXG4gICAgLy8gb2Zmc2NyZW4gd2l0aCBhbGwgb3RoZXIgcGFnZXMuXG4gICAgdGhpcy5wYWdlRWxlbWVudF8ucmVtb3ZlQXR0cmlidXRlKFBhZ2VBdHRyaWJ1dGVzLkxPQURJTkcpO1xuXG4gICAgdGhpcy5hbmFseXRpY3NFdmVudF8oQW5hbHl0aWNzRXZlbnRzLkFEX0xPQURFRCwge1xuICAgICAgW0FuYWx5dGljc1ZhcnMuQURfTE9BREVEXTogRGF0ZS5ub3coKSxcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmdldEFkRnJhbWVfKCkgJiYgIXRoaXMuaXMzcEFkRnJhbWVfKSB7XG4gICAgICB0aGlzLmFkRG9jXyA9IGdldEZyYW1lRG9jKFxuICAgICAgICAvKiogQHR5cGUgeyFIVE1MSUZyYW1lRWxlbWVudH0gKi8gKHRoaXMuYWRGcmFtZV8pXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMubG9hZGVkXyA9IHRydWU7XG5cbiAgICB0aGlzLmxvYWRDYWxsYmFja3NfLmZvckVhY2goKGNiKSA9PiBjYigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgbGF5ZXIgdG8gY29udGFpbiBvdXRsaW5rIGJ1dHRvbi5cbiAgICogQHBhcmFtIHshLi9zdG9yeS1hZC11aS5TdG9yeUFkVUlNZXRhZGF0YX0gdWlNZXRhZGF0YVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPGJvb2xlYW4+fVxuICAgKi9cbiAgY3JlYXRlQ3RhTGF5ZXJfKHVpTWV0YWRhdGEpIHtcbiAgICByZXR1cm4gY3JlYXRlQ3RhKFxuICAgICAgdGhpcy5kb2NfLFxuICAgICAgZGV2QXNzZXJ0KHRoaXMuYnV0dG9uRml0dGVyXyksXG4gICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMucGFnZUVsZW1lbnRfKSwgLy8gQ29udGFpbmVyLlxuICAgICAgdWlNZXRhZGF0YVxuICAgICkudGhlbigoYW5jaG9yKSA9PiB7XG4gICAgICBpZiAoYW5jaG9yKSB7XG4gICAgICAgIHRoaXMuY3RhQW5jaG9yXyA9IGFuY2hvcjtcbiAgICAgICAgLy8gQ2xpY2sgbGlzdGVuZXIgc28gdGhhdCB3ZSBjYW4gZmlyZSBgc3RvcnktYWQtY2xpY2tgIGFuYWx5dGljcyB0cmlnZ2VyIGF0XG4gICAgICAgIC8vIHRoZSBhcHByb3ByaWF0ZSB0aW1lLlxuICAgICAgICBhbmNob3IuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgdmFycyA9IHtcbiAgICAgICAgICAgIFtBbmFseXRpY3NWYXJzLkFEX0NMSUNLRURdOiBEYXRlLm5vdygpLFxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5hbmFseXRpY3NFdmVudF8oQW5hbHl0aWNzRXZlbnRzLkFEX0NMSUNLRUQsIHZhcnMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVE9ETygjMjQwODApIFJlbW92ZSB0aGlzIHdoZW4gc3RvcnkgYWRzIGhhdmUgZnVsbCBhZCBuZXR3b3JrIHN1cHBvcnQuXG4gICAqIFRoaXMgaW4gaW50ZW5kZWQgdG8gYmUgYSB0ZW1wb3JhcnkgaGFjayBzbyB3ZSBjYW4gY2FuIHN1cHBvcnRcbiAgICogYWQgc2VydmluZyBwaXBlbGluZXMgdGhhdCBhcmUgcmVsaWFudCBvbiB1c2luZyBhbXAtYWQtZXhpdCBmb3JcbiAgICogb3V0bGlua3MuXG4gICAqIFJlYWRzIGFtcC1hZC1leGl0IGNvbmZpZyBhbmQgdHJpZXMgdG8gZXh0cmFjdCBhIHN1aXRhYmxlIG91dGxpbmsuXG4gICAqIElmIHRoZXJlIGFyZSBtdWx0aXBsZSBleGl0cyBwcmVzZW50LCBiZWhhdmlvciBpcyB1bnByZWRpY3RhYmxlIGR1ZSB0b1xuICAgKiBKU09OIHBhcnNlLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHshT2JqZWN0fVxuICAgKi9cbiAgcmVhZEFtcEFkRXhpdF8oKSB7XG4gICAgY29uc3QgYW1wQWRFeGl0ID0gZWxlbWVudEJ5VGFnKFxuICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmFkRG9jXy5ib2R5KSxcbiAgICAgICdhbXAtYWQtZXhpdCdcbiAgICApO1xuICAgIGlmIChhbXBBZEV4aXQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHtjaGlsZHJlbn0gPSBhbXBBZEV4aXQ7XG4gICAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgICAgY2hpbGRyZW4ubGVuZ3RoID09IDEsXG4gICAgICAgICAgJ1RoZSB0YWcgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgPHNjcmlwdD4gY2hpbGQuJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuWzBdO1xuICAgICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICAgIGlzSnNvblNjcmlwdFRhZyhjaGlsZCksXG4gICAgICAgICAgJ1RoZSBhbXAtYWQtZXhpdCBjb25maWcgc2hvdWxkICcgK1xuICAgICAgICAgICAgJ2JlIGluc2lkZSBhIDxzY3JpcHQ+IHRhZyB3aXRoIHR5cGU9XCJhcHBsaWNhdGlvbi9qc29uXCInXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGFzc2VydENvbmZpZyhwYXJzZUpzb24oY2hpbGQudGV4dENvbnRlbnQpKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID1cbiAgICAgICAgICBjb25maWdbJ3RhcmdldHMnXSAmJlxuICAgICAgICAgIE9iamVjdC5rZXlzKGNvbmZpZ1sndGFyZ2V0cyddKSAmJlxuICAgICAgICAgIGNvbmZpZ1sndGFyZ2V0cyddW09iamVjdC5rZXlzKGNvbmZpZ1sndGFyZ2V0cyddKVswXV07XG4gICAgICAgIGNvbnN0IGZpbmFsVXJsID0gdGFyZ2V0ICYmIHRhcmdldFsnZmluYWxVcmwnXTtcbiAgICAgICAgcmV0dXJuIHRhcmdldCA/IHtbQTRBVmFyTmFtZXMuQ1RBX1VSTF06IGZpbmFsVXJsfSA6IHt9O1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkZXYoKS5lcnJvcihUQUcsIGUpO1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBVSSBzdGF0ZSB1cGRhdGVzIGFuZCBwYXNzZXMgdGhlIGluZm9ybWF0aW9uIGFsb25nIGFzXG4gICAqIGF0dHJpYnV0ZXMgdG8gdGhlIHNoYWRvd2VkIGF0dHJpYnV0aW9uIGljb24uXG4gICAqIEBwYXJhbSB7IVVJVHlwZX0gdWlTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25VSVN0YXRlVXBkYXRlXyh1aVN0YXRlKSB7XG4gICAgaWYgKCF0aGlzLmFkQ2hvaWNlc0ljb25fKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5hZENob2ljZXNJY29uXy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgREVTS1RPUF9GVUxMQkxFRURfQ0xBU1MsXG4gICAgICB1aVN0YXRlID09PSBVSVR5cGUuREVTS1RPUF9GVUxMQkxFRURcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhbiBhbmFseXRpY3MgZXZlbnQgYW5kIHRyaWdnZXIgaXQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgbnVtYmVyPn0gdmFycyBBIG1hcCBvZiB2YXJzIGFuZCB0aGVpciB2YWx1ZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhbmFseXRpY3NFdmVudF8oZXZlbnRUeXBlLCB2YXJzKSB7XG4gICAgdGhpcy5hbmFseXRpY3NfLnRoZW4oKGFuYWx5dGljcykgPT5cbiAgICAgIGFuYWx5dGljcy5maXJlRXZlbnQodGhpcy5wYWdlRWxlbWVudF8sIHRoaXMuaW5kZXhfLCBldmVudFR5cGUsIHZhcnMpXG4gICAgKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-page.js