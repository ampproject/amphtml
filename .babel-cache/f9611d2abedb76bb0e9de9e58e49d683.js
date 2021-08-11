function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
AnalyticsEvents,
AnalyticsVars,
STORY_AD_ANALYTICS } from "./story-ad-analytics";

import { ButtonTextFitter } from "./story-ad-button-text-fitter";
import {
StateProperty,
getStoreService } from "../../amp-story/1.0/amp-story-store-service";

import { StoryAdLocalization } from "./story-ad-localization";
import { StoryAdPage } from "./story-ad-page";
import { devAssert } from "../../../src/log";
import { findIndex } from "../../../src/core/types/array";
import { getServicePromiseForDoc } from "../../../src/service-helpers";

/** @const {string} */
var TAG = 'amp-story-auto-ads:page-manager';

/** @enum {number} */
export var InsertionState = {
  DELAYED: 0,
  FAILURE: 1,
  SUCCESS: 2 };


export var NEXT_PAGE_NO_AD_ATTR = 'next-page-no-ad';

/**
 * Manages creation and retrieval of story ad pages.
 */
export var StoryAdPageManager = /*#__PURE__*/function () {
  /**
   * @param {!../../amp-story/1.0/amp-story.AmpStory} ampStory
   * @param {!JsonObject} config
   */
  function StoryAdPageManager(ampStory, config) {_classCallCheck(this, StoryAdPageManager);
    /** @private {!../../amp-story/1.0/amp-story.AmpStory} */
    this.ampStory_ = ampStory;

    /** @private {!JsonObject} */
    this.config_ = config;

    /*** @private {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
    this.ampdoc_ = ampStory.getAmpDoc();

    /** @private {!Promise<!StoryAdAnalytics>} */
    this.analytics_ = getServicePromiseForDoc(this.ampdoc_, STORY_AD_ANALYTICS);

    /** @private {!./story-ad-localization.StoryAdLocalization} */
    this.localizationService_ = new StoryAdLocalization(this.ampStory_.element);

    /** @private {!./story-ad-button-text-fitter.ButtonTextFitter} */
    this.buttonFitter_ = new ButtonTextFitter(this.ampdoc_);

    /** @private {Object<string, StoryAdPage>} */
    this.pages_ = {};

    /** @private {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} **/
    this.storeService_ = getStoreService(this.ampdoc_.win);

    /** @private {number} */
    this.adsConsumed_ = 0;

    /** @private {Array<string>} */
    this.createdPageIds_ = [];
  }

  /**
   * Check if we have any pages left that have not been inserted or discarded.
   * @return {boolean}
   */_createClass(StoryAdPageManager, [{ key: "hasUnusedAdPage", value:
    function hasUnusedAdPage() {
      return this.adsConsumed_ < this.createdPageIds_.length;
    }

    /**
     * Gets the next ad page that has not yet been inserted or discarded.
     * @return {!StoryAdPage}
     */ }, { key: "getUnusedAdPage", value:
    function getUnusedAdPage() {
      var pageId = this.createdPageIds_[this.adsConsumed_];
      devAssert(pageId);
      return this.pages_[pageId];
    }

    /**
     * Called when ad has failed or been placed and we should move to next ad.
     */ }, { key: "discardCurrentAd", value:
    function discardCurrentAd() {var _this$analyticsEvent_;
      this.analyticsEvent_(AnalyticsEvents.AD_DISCARDED, (_this$analyticsEvent_ = {}, _defineProperty(_this$analyticsEvent_,
      AnalyticsVars.AD_INDEX, this.adsConsumed_), _defineProperty(_this$analyticsEvent_,
      AnalyticsVars.AD_DISCARDED, Date.now()), _this$analyticsEvent_));

      this.adsConsumed_++;
    }

    /**
     * Number of ads created by this manager.
     * @return {number}
     */ }, { key: "numberOfAdsCreated", value:
    function numberOfAdsCreated() {
      return this.createdPageIds_.length;
    }

    /**
     * Creates a StoryAdPage, appends the element to DOM, and adds it to
     * parent story pages Array.
     * @return {!StoryAdPage}
     */ }, { key: "createAdPage", value:
    function createAdPage() {var _this = this;
      var index = this.createdPageIds_.length + 1;
      var page = new StoryAdPage(
      this.ampdoc_,
      this.config_,
      index,
      this.localizationService_,
      devAssert(this.buttonFitter_),
      devAssert(this.storeService_));


      var pageElement = page.build();
      var pageId = page.getId();
      this.pages_[pageId] = page;
      this.createdPageIds_.push(pageId);

      this.ampStory_.element.appendChild(pageElement);
      pageElement.getImpl().then(function (impl) {
        _this.ampStory_.addPage(impl);
      });

      return page;
    }

    /**
     * @param {string} pageId
     * @return {boolean}
     */ }, { key: "hasId", value:
    function hasId(pageId) {
      return !!this.pages_[pageId];
    }

    /**
     * @param {string} pageId
     * @return {StoryAdPage}
     */ }, { key: "getAdPageById", value:
    function getAdPageById(pageId) {
      return this.pages_[pageId];
    }

    /**
     * @param {string} pageId
     * @return {number}
     */ }, { key: "getIndexById", value:
    function getIndexById(pageId) {
      return findIndex(this.createdPageIds_, function (id) {return id === pageId;}) + 1;
    }

    /**
     * Can fail if slot is protected by next-page-no-ad, if there are not enough
     * pages left in the story for insertion, or the page before or after is an ad.
     * @param {string} pageBeforeAdId
     * @param {!StoryAdPage} nextAdPage
     * @return {!Promise<!InsertionState>}
     */ }, { key: "maybeInsertPageAfter", value:
    function maybeInsertPageAfter(pageBeforeAdId, nextAdPage) {var _this2 = this;
      var pageBeforeAd = this.ampStory_.getPageById(pageBeforeAdId);
      var pageAfterAd = this.ampStory_.getNextPage(pageBeforeAd);
      if (!pageAfterAd) {
        return Promise.resolve(InsertionState.DELAYED);
      }

      if (this.isDesktopView_()) {
        // If we are in desktop view the ad must be inserted 2 pages away because
        // the next page will already be in view
        pageBeforeAdId = pageAfterAd.element.id;
        pageBeforeAd = pageAfterAd;
        pageAfterAd = this.ampStory_.getNextPage(pageAfterAd);
      }

      if (!pageAfterAd) {
        return Promise.resolve(InsertionState.DELAYED);
      }

      // We will not insert an ad in any slot containing `next-page-no-ad` nor
      // two ads in a row.
      if (
      this.nextPageNoAd_(pageBeforeAd) ||
      pageBeforeAd.isAd() ||
      pageAfterAd.isAd())
      {
        return Promise.resolve(InsertionState.DELAYED);
      }

      return nextAdPage.maybeCreateCta().then(function (ctaCreated) {
        if (!ctaCreated) {
          _this2.discardCurrentAd();
          return InsertionState.FAILURE;
        }
        return _this2.insertIntoParentStory_(nextAdPage, pageBeforeAdId);
      });
    }

    /**
     *
     * @param {!StoryAdPage} nextAdPage
     * @param {string} pageBeforeAdId
     * @return {InsertionState}
     */ }, { key: "insertIntoParentStory_", value:
    function insertIntoParentStory_(nextAdPage, pageBeforeAdId) {
      var nextAdPageId = nextAdPage.getId();
      this.ampStory_.insertPage(pageBeforeAdId, nextAdPageId);

      // If we are inserted we now have a `position` macro available for any
      // analytics events moving forward.
      var adIndex = this.getIndexById(nextAdPageId);
      var pageNumber = this.ampStory_.getPageIndexById(pageBeforeAdId);

      this.analytics_.then(function (analytics) {return (
          analytics.setVar(adIndex, AnalyticsVars.POSITION, pageNumber + 1));});


      this.currentAdInserted_();
      return InsertionState.SUCCESS;
    }

    /**
     *
     */ }, { key: "currentAdInserted_", value:
    function currentAdInserted_() {var _this$analyticsEvent_2;
      this.analyticsEvent_(AnalyticsEvents.AD_INSERTED, (_this$analyticsEvent_2 = {}, _defineProperty(_this$analyticsEvent_2,
      AnalyticsVars.AD_INDEX, this.adsConsumed_), _defineProperty(_this$analyticsEvent_2,
      AnalyticsVars.AD_INSERTED, Date.now()), _this$analyticsEvent_2));

      this.adsConsumed_++;
    }

    /**
     * @private
     * @return {boolean}
     */ }, { key: "isDesktopView_", value:
    function isDesktopView_() {
      return !!this.storeService_.get(StateProperty.DESKTOP_STATE);
    }

    /**
     * Users may put an 'next-page-no-ad' attribute on their pages to prevent ads
     * from showing as the next page.
     * @param {?../../amp-story/1.0/amp-story-page.AmpStoryPage} page
     * @return {boolean}
     * @private
     */ }, { key: "nextPageNoAd_", value:
    function nextPageNoAd_(page) {
      return page.element.hasAttribute(NEXT_PAGE_NO_AD_ATTR);
    }

    /**
     * Construct an analytics event and trigger it.
     * @param {string} eventType
     * @param {!Object<string, number>} vars A map of vars and their values.
     * @private
     */ }, { key: "analyticsEvent_", value:
    function analyticsEvent_(eventType, vars) {var _this3 = this;
      this.analytics_.then(function (analytics) {return (
          analytics.fireEvent(
          _this3.ampStory_.element,
          vars['adIndex'],
          eventType,
          vars));});


    } }]);return StoryAdPageManager;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-page-manager.js