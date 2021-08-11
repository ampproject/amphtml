function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { AnalyticsEvents, AnalyticsVars, STORY_AD_ANALYTICS } from "./story-ad-analytics";
import { ButtonTextFitter } from "./story-ad-button-text-fitter";
import { StateProperty, getStoreService } from "../../amp-story/1.0/amp-story-store-service";
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
  SUCCESS: 2
};
export var NEXT_PAGE_NO_AD_ATTR = 'next-page-no-ad';

/**
 * Manages creation and retrieval of story ad pages.
 */
export var StoryAdPageManager = /*#__PURE__*/function () {
  /**
   * @param {!../../amp-story/1.0/amp-story.AmpStory} ampStory
   * @param {!JsonObject} config
   */
  function StoryAdPageManager(ampStory, config) {
    _classCallCheck(this, StoryAdPageManager);

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
   */
  _createClass(StoryAdPageManager, [{
    key: "hasUnusedAdPage",
    value: function hasUnusedAdPage() {
      return this.adsConsumed_ < this.createdPageIds_.length;
    }
    /**
     * Gets the next ad page that has not yet been inserted or discarded.
     * @return {!StoryAdPage}
     */

  }, {
    key: "getUnusedAdPage",
    value: function getUnusedAdPage() {
      var pageId = this.createdPageIds_[this.adsConsumed_];
      devAssert(pageId, TAG + " all created ads consumed.");
      return this.pages_[pageId];
    }
    /**
     * Called when ad has failed or been placed and we should move to next ad.
     */

  }, {
    key: "discardCurrentAd",
    value: function discardCurrentAd() {
      var _this$analyticsEvent_;

      this.analyticsEvent_(AnalyticsEvents.AD_DISCARDED, (_this$analyticsEvent_ = {}, _this$analyticsEvent_[AnalyticsVars.AD_INDEX] = this.adsConsumed_, _this$analyticsEvent_[AnalyticsVars.AD_DISCARDED] = Date.now(), _this$analyticsEvent_));
      this.adsConsumed_++;
    }
    /**
     * Number of ads created by this manager.
     * @return {number}
     */

  }, {
    key: "numberOfAdsCreated",
    value: function numberOfAdsCreated() {
      return this.createdPageIds_.length;
    }
    /**
     * Creates a StoryAdPage, appends the element to DOM, and adds it to
     * parent story pages Array.
     * @return {!StoryAdPage}
     */

  }, {
    key: "createAdPage",
    value: function createAdPage() {
      var _this = this;

      var index = this.createdPageIds_.length + 1;
      var page = new StoryAdPage(this.ampdoc_, this.config_, index, this.localizationService_, devAssert(this.buttonFitter_), devAssert(this.storeService_));
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
     */

  }, {
    key: "hasId",
    value: function hasId(pageId) {
      return !!this.pages_[pageId];
    }
    /**
     * @param {string} pageId
     * @return {StoryAdPage}
     */

  }, {
    key: "getAdPageById",
    value: function getAdPageById(pageId) {
      return this.pages_[pageId];
    }
    /**
     * @param {string} pageId
     * @return {number}
     */

  }, {
    key: "getIndexById",
    value: function getIndexById(pageId) {
      return findIndex(this.createdPageIds_, function (id) {
        return id === pageId;
      }) + 1;
    }
    /**
     * Can fail if slot is protected by next-page-no-ad, if there are not enough
     * pages left in the story for insertion, or the page before or after is an ad.
     * @param {string} pageBeforeAdId
     * @param {!StoryAdPage} nextAdPage
     * @return {!Promise<!InsertionState>}
     */

  }, {
    key: "maybeInsertPageAfter",
    value: function maybeInsertPageAfter(pageBeforeAdId, nextAdPage) {
      var _this2 = this;

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
      if (this.nextPageNoAd_(pageBeforeAd) || pageBeforeAd.isAd() || pageAfterAd.isAd()) {
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
     */

  }, {
    key: "insertIntoParentStory_",
    value: function insertIntoParentStory_(nextAdPage, pageBeforeAdId) {
      var nextAdPageId = nextAdPage.getId();
      this.ampStory_.insertPage(pageBeforeAdId, nextAdPageId);
      // If we are inserted we now have a `position` macro available for any
      // analytics events moving forward.
      var adIndex = this.getIndexById(nextAdPageId);
      var pageNumber = this.ampStory_.getPageIndexById(pageBeforeAdId);
      this.analytics_.then(function (analytics) {
        return analytics.setVar(adIndex, AnalyticsVars.POSITION, pageNumber + 1);
      });
      this.currentAdInserted_();
      return InsertionState.SUCCESS;
    }
    /**
     *
     */

  }, {
    key: "currentAdInserted_",
    value: function currentAdInserted_() {
      var _this$analyticsEvent_2;

      this.analyticsEvent_(AnalyticsEvents.AD_INSERTED, (_this$analyticsEvent_2 = {}, _this$analyticsEvent_2[AnalyticsVars.AD_INDEX] = this.adsConsumed_, _this$analyticsEvent_2[AnalyticsVars.AD_INSERTED] = Date.now(), _this$analyticsEvent_2));
      this.adsConsumed_++;
    }
    /**
     * @private
     * @return {boolean}
     */

  }, {
    key: "isDesktopView_",
    value: function isDesktopView_() {
      return !!this.storeService_.get(StateProperty.DESKTOP_STATE);
    }
    /**
     * Users may put an 'next-page-no-ad' attribute on their pages to prevent ads
     * from showing as the next page.
     * @param {?../../amp-story/1.0/amp-story-page.AmpStoryPage} page
     * @return {boolean}
     * @private
     */

  }, {
    key: "nextPageNoAd_",
    value: function nextPageNoAd_(page) {
      return page.element.hasAttribute(NEXT_PAGE_NO_AD_ATTR);
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
      var _this3 = this;

      this.analytics_.then(function (analytics) {
        return analytics.fireEvent(_this3.ampStory_.element, vars['adIndex'], eventType, vars);
      });
    }
  }]);

  return StoryAdPageManager;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0b3J5LWFkLXBhZ2UtbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJBbmFseXRpY3NFdmVudHMiLCJBbmFseXRpY3NWYXJzIiwiU1RPUllfQURfQU5BTFlUSUNTIiwiQnV0dG9uVGV4dEZpdHRlciIsIlN0YXRlUHJvcGVydHkiLCJnZXRTdG9yZVNlcnZpY2UiLCJTdG9yeUFkTG9jYWxpemF0aW9uIiwiU3RvcnlBZFBhZ2UiLCJkZXZBc3NlcnQiLCJmaW5kSW5kZXgiLCJnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyIsIlRBRyIsIkluc2VydGlvblN0YXRlIiwiREVMQVlFRCIsIkZBSUxVUkUiLCJTVUNDRVNTIiwiTkVYVF9QQUdFX05PX0FEX0FUVFIiLCJTdG9yeUFkUGFnZU1hbmFnZXIiLCJhbXBTdG9yeSIsImNvbmZpZyIsImFtcFN0b3J5XyIsImNvbmZpZ18iLCJhbXBkb2NfIiwiZ2V0QW1wRG9jIiwiYW5hbHl0aWNzXyIsImxvY2FsaXphdGlvblNlcnZpY2VfIiwiZWxlbWVudCIsImJ1dHRvbkZpdHRlcl8iLCJwYWdlc18iLCJzdG9yZVNlcnZpY2VfIiwid2luIiwiYWRzQ29uc3VtZWRfIiwiY3JlYXRlZFBhZ2VJZHNfIiwibGVuZ3RoIiwicGFnZUlkIiwiYW5hbHl0aWNzRXZlbnRfIiwiQURfRElTQ0FSREVEIiwiQURfSU5ERVgiLCJEYXRlIiwibm93IiwiaW5kZXgiLCJwYWdlIiwicGFnZUVsZW1lbnQiLCJidWlsZCIsImdldElkIiwicHVzaCIsImFwcGVuZENoaWxkIiwiZ2V0SW1wbCIsInRoZW4iLCJpbXBsIiwiYWRkUGFnZSIsImlkIiwicGFnZUJlZm9yZUFkSWQiLCJuZXh0QWRQYWdlIiwicGFnZUJlZm9yZUFkIiwiZ2V0UGFnZUJ5SWQiLCJwYWdlQWZ0ZXJBZCIsImdldE5leHRQYWdlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpc0Rlc2t0b3BWaWV3XyIsIm5leHRQYWdlTm9BZF8iLCJpc0FkIiwibWF5YmVDcmVhdGVDdGEiLCJjdGFDcmVhdGVkIiwiZGlzY2FyZEN1cnJlbnRBZCIsImluc2VydEludG9QYXJlbnRTdG9yeV8iLCJuZXh0QWRQYWdlSWQiLCJpbnNlcnRQYWdlIiwiYWRJbmRleCIsImdldEluZGV4QnlJZCIsInBhZ2VOdW1iZXIiLCJnZXRQYWdlSW5kZXhCeUlkIiwiYW5hbHl0aWNzIiwic2V0VmFyIiwiUE9TSVRJT04iLCJjdXJyZW50QWRJbnNlcnRlZF8iLCJBRF9JTlNFUlRFRCIsImdldCIsIkRFU0tUT1BfU1RBVEUiLCJoYXNBdHRyaWJ1dGUiLCJldmVudFR5cGUiLCJ2YXJzIiwiZmlyZUV2ZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSxlQURGLEVBRUVDLGFBRkYsRUFHRUMsa0JBSEY7QUFLQSxTQUFRQyxnQkFBUjtBQUNBLFNBQ0VDLGFBREYsRUFFRUMsZUFGRjtBQUlBLFNBQVFDLG1CQUFSO0FBQ0EsU0FBUUMsV0FBUjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxTQUFSO0FBQ0EsU0FBUUMsdUJBQVI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsaUNBQVo7O0FBRUE7QUFDQSxPQUFPLElBQU1DLGNBQWMsR0FBRztBQUM1QkMsRUFBQUEsT0FBTyxFQUFFLENBRG1CO0FBRTVCQyxFQUFBQSxPQUFPLEVBQUUsQ0FGbUI7QUFHNUJDLEVBQUFBLE9BQU8sRUFBRTtBQUhtQixDQUF2QjtBQU1QLE9BQU8sSUFBTUMsb0JBQW9CLEdBQUcsaUJBQTdCOztBQUVQO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLGtCQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDRSw4QkFBWUMsUUFBWixFQUFzQkMsTUFBdEIsRUFBOEI7QUFBQTs7QUFDNUI7QUFDQSxTQUFLQyxTQUFMLEdBQWlCRixRQUFqQjs7QUFFQTtBQUNBLFNBQUtHLE9BQUwsR0FBZUYsTUFBZjs7QUFFQTtBQUNBLFNBQUtHLE9BQUws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QUVEO0FBQ0Y7QUFDQTs7QUFyTUE7QUFBQTtBQUFBLFdBc01FLDhCQUFxQjtBQUFBOztBQUNuQixXQUFLb0IsZUFBTCxDQUFxQm5DLGVBQWUsQ0FBQzZFLFdBQXJDLHVEQUNHNUUsYUFBYSxDQUFDb0MsUUFEakIsSUFDNEIsS0FBS04sWUFEakMseUJBRUc5QixhQUFhLENBQUM0RSxXQUZqQixJQUUrQnZDLElBQUksQ0FBQ0MsR0FBTCxFQUYvQjtBQUlBLFdBQUtSLFlBQUw7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQWpOQTtBQUFBO0FBQUEsV0FrTkUsMEJBQWlCO0FBQ2YsYUFBTyxDQUFDLENBQUMsS0FBS0YsYUFBTCxDQUFtQmlELEdBQW5CLENBQXVCMUUsYUFBYSxDQUFDMkUsYUFBckMsQ0FBVDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBNU5BO0FBQUE7QUFBQSxXQTZORSx1QkFBY3RDLElBQWQsRUFBb0I7QUFDbEIsYUFBT0EsSUFBSSxDQUFDZixPQUFMLENBQWFzRCxZQUFiLENBQTBCaEUsb0JBQTFCLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF0T0E7QUFBQTtBQUFBLFdBdU9FLHlCQUFnQmlFLFNBQWhCLEVBQTJCQyxJQUEzQixFQUFpQztBQUFBOztBQUMvQixXQUFLMUQsVUFBTCxDQUFnQndCLElBQWhCLENBQXFCLFVBQUN5QixTQUFEO0FBQUEsZUFDbkJBLFNBQVMsQ0FBQ1UsU0FBVixDQUNFLE1BQUksQ0FBQy9ELFNBQUwsQ0FBZU0sT0FEakIsRUFFRXdELElBQUksQ0FBQyxTQUFELENBRk4sRUFHRUQsU0FIRixFQUlFQyxJQUpGLENBRG1CO0FBQUEsT0FBckI7QUFRRDtBQWhQSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFuYWx5dGljc0V2ZW50cyxcbiAgQW5hbHl0aWNzVmFycyxcbiAgU1RPUllfQURfQU5BTFlUSUNTLFxufSBmcm9tICcuL3N0b3J5LWFkLWFuYWx5dGljcyc7XG5pbXBvcnQge0J1dHRvblRleHRGaXR0ZXJ9IGZyb20gJy4vc3RvcnktYWQtYnV0dG9uLXRleHQtZml0dGVyJztcbmltcG9ydCB7XG4gIFN0YXRlUHJvcGVydHksXG4gIGdldFN0b3JlU2VydmljZSxcbn0gZnJvbSAnLi4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge1N0b3J5QWRMb2NhbGl6YXRpb259IGZyb20gJy4vc3RvcnktYWQtbG9jYWxpemF0aW9uJztcbmltcG9ydCB7U3RvcnlBZFBhZ2V9IGZyb20gJy4vc3RvcnktYWQtcGFnZSc7XG5pbXBvcnQge2RldkFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2ZpbmRJbmRleH0gZnJvbSAnI2NvcmUvdHlwZXMvYXJyYXknO1xuaW1wb3J0IHtnZXRTZXJ2aWNlUHJvbWlzZUZvckRvY30gZnJvbSAnLi4vLi4vLi4vc3JjL3NlcnZpY2UtaGVscGVycyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdhbXAtc3RvcnktYXV0by1hZHM6cGFnZS1tYW5hZ2VyJztcblxuLyoqIEBlbnVtIHtudW1iZXJ9ICovXG5leHBvcnQgY29uc3QgSW5zZXJ0aW9uU3RhdGUgPSB7XG4gIERFTEFZRUQ6IDAsXG4gIEZBSUxVUkU6IDEsXG4gIFNVQ0NFU1M6IDIsXG59O1xuXG5leHBvcnQgY29uc3QgTkVYVF9QQUdFX05PX0FEX0FUVFIgPSAnbmV4dC1wYWdlLW5vLWFkJztcblxuLyoqXG4gKiBNYW5hZ2VzIGNyZWF0aW9uIGFuZCByZXRyaWV2YWwgb2Ygc3RvcnkgYWQgcGFnZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdG9yeUFkUGFnZU1hbmFnZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3RvcnkuQW1wU3Rvcnl9IGFtcFN0b3J5XG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZ1xuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wU3RvcnksIGNvbmZpZykge1xuICAgIC8qKiBAcHJpdmF0ZSB7IS4uLy4uL2FtcC1zdG9yeS8xLjAvYW1wLXN0b3J5LkFtcFN0b3J5fSAqL1xuICAgIHRoaXMuYW1wU3RvcnlfID0gYW1wU3Rvcnk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFKc29uT2JqZWN0fSAqL1xuICAgIHRoaXMuY29uZmlnXyA9IGNvbmZpZztcblxuICAgIC8qKiogQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvYyAqL1xuICAgIHRoaXMuYW1wZG9jXyA9IGFtcFN0b3J5LmdldEFtcERvYygpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshUHJvbWlzZTwhU3RvcnlBZEFuYWx5dGljcz59ICovXG4gICAgdGhpcy5hbmFseXRpY3NfID0gZ2V0U2VydmljZVByb21pc2VGb3JEb2ModGhpcy5hbXBkb2NfLCBTVE9SWV9BRF9BTkFMWVRJQ1MpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi9zdG9yeS1hZC1sb2NhbGl6YXRpb24uU3RvcnlBZExvY2FsaXphdGlvbn0gKi9cbiAgICB0aGlzLmxvY2FsaXphdGlvblNlcnZpY2VfID0gbmV3IFN0b3J5QWRMb2NhbGl6YXRpb24odGhpcy5hbXBTdG9yeV8uZWxlbWVudCk7XG5cbiAgICAvKiogQHByaXZhdGUgeyEuL3N0b3J5LWFkLWJ1dHRvbi10ZXh0LWZpdHRlci5CdXR0b25UZXh0Rml0dGVyfSAqL1xuICAgIHRoaXMuYnV0dG9uRml0dGVyXyA9IG5ldyBCdXR0b25UZXh0Rml0dGVyKHRoaXMuYW1wZG9jXyk7XG5cbiAgICAvKiogQHByaXZhdGUge09iamVjdDxzdHJpbmcsIFN0b3J5QWRQYWdlPn0gKi9cbiAgICB0aGlzLnBhZ2VzXyA9IHt9O1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3Rvcnktc3RvcmUtc2VydmljZS5BbXBTdG9yeVN0b3JlU2VydmljZX0gKiovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKHRoaXMuYW1wZG9jXy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5hZHNDb25zdW1lZF8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHtBcnJheTxzdHJpbmc+fSAqL1xuICAgIHRoaXMuY3JlYXRlZFBhZ2VJZHNfID0gW107XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgd2UgaGF2ZSBhbnkgcGFnZXMgbGVmdCB0aGF0IGhhdmUgbm90IGJlZW4gaW5zZXJ0ZWQgb3IgZGlzY2FyZGVkLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaGFzVW51c2VkQWRQYWdlKCkge1xuICAgIHJldHVybiB0aGlzLmFkc0NvbnN1bWVkXyA8IHRoaXMuY3JlYXRlZFBhZ2VJZHNfLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBuZXh0IGFkIHBhZ2UgdGhhdCBoYXMgbm90IHlldCBiZWVuIGluc2VydGVkIG9yIGRpc2NhcmRlZC5cbiAgICogQHJldHVybiB7IVN0b3J5QWRQYWdlfVxuICAgKi9cbiAgZ2V0VW51c2VkQWRQYWdlKCkge1xuICAgIGNvbnN0IHBhZ2VJZCA9IHRoaXMuY3JlYXRlZFBhZ2VJZHNfW3RoaXMuYWRzQ29uc3VtZWRfXTtcbiAgICBkZXZBc3NlcnQocGFnZUlkLCBgJHtUQUd9IGFsbCBjcmVhdGVkIGFkcyBjb25zdW1lZC5gKTtcbiAgICByZXR1cm4gdGhpcy5wYWdlc19bcGFnZUlkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhZCBoYXMgZmFpbGVkIG9yIGJlZW4gcGxhY2VkIGFuZCB3ZSBzaG91bGQgbW92ZSB0byBuZXh0IGFkLlxuICAgKi9cbiAgZGlzY2FyZEN1cnJlbnRBZCgpIHtcbiAgICB0aGlzLmFuYWx5dGljc0V2ZW50XyhBbmFseXRpY3NFdmVudHMuQURfRElTQ0FSREVELCB7XG4gICAgICBbQW5hbHl0aWNzVmFycy5BRF9JTkRFWF06IHRoaXMuYWRzQ29uc3VtZWRfLFxuICAgICAgW0FuYWx5dGljc1ZhcnMuQURfRElTQ0FSREVEXTogRGF0ZS5ub3coKSxcbiAgICB9KTtcbiAgICB0aGlzLmFkc0NvbnN1bWVkXysrO1xuICB9XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiBhZHMgY3JlYXRlZCBieSB0aGlzIG1hbmFnZXIuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIG51bWJlck9mQWRzQ3JlYXRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVkUGFnZUlkc18ubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBTdG9yeUFkUGFnZSwgYXBwZW5kcyB0aGUgZWxlbWVudCB0byBET00sIGFuZCBhZGRzIGl0IHRvXG4gICAqIHBhcmVudCBzdG9yeSBwYWdlcyBBcnJheS5cbiAgICogQHJldHVybiB7IVN0b3J5QWRQYWdlfVxuICAgKi9cbiAgY3JlYXRlQWRQYWdlKCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jcmVhdGVkUGFnZUlkc18ubGVuZ3RoICsgMTtcbiAgICBjb25zdCBwYWdlID0gbmV3IFN0b3J5QWRQYWdlKFxuICAgICAgdGhpcy5hbXBkb2NfLFxuICAgICAgdGhpcy5jb25maWdfLFxuICAgICAgaW5kZXgsXG4gICAgICB0aGlzLmxvY2FsaXphdGlvblNlcnZpY2VfLFxuICAgICAgZGV2QXNzZXJ0KHRoaXMuYnV0dG9uRml0dGVyXyksXG4gICAgICBkZXZBc3NlcnQodGhpcy5zdG9yZVNlcnZpY2VfKVxuICAgICk7XG5cbiAgICBjb25zdCBwYWdlRWxlbWVudCA9IHBhZ2UuYnVpbGQoKTtcbiAgICBjb25zdCBwYWdlSWQgPSBwYWdlLmdldElkKCk7XG4gICAgdGhpcy5wYWdlc19bcGFnZUlkXSA9IHBhZ2U7XG4gICAgdGhpcy5jcmVhdGVkUGFnZUlkc18ucHVzaChwYWdlSWQpO1xuXG4gICAgdGhpcy5hbXBTdG9yeV8uZWxlbWVudC5hcHBlbmRDaGlsZChwYWdlRWxlbWVudCk7XG4gICAgcGFnZUVsZW1lbnQuZ2V0SW1wbCgpLnRoZW4oKGltcGwpID0+IHtcbiAgICAgIHRoaXMuYW1wU3RvcnlfLmFkZFBhZ2UoaW1wbCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcGFnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZUlkXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBoYXNJZChwYWdlSWQpIHtcbiAgICByZXR1cm4gISF0aGlzLnBhZ2VzX1twYWdlSWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlSWRcbiAgICogQHJldHVybiB7U3RvcnlBZFBhZ2V9XG4gICAqL1xuICBnZXRBZFBhZ2VCeUlkKHBhZ2VJZCkge1xuICAgIHJldHVybiB0aGlzLnBhZ2VzX1twYWdlSWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlSWRcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0SW5kZXhCeUlkKHBhZ2VJZCkge1xuICAgIHJldHVybiBmaW5kSW5kZXgodGhpcy5jcmVhdGVkUGFnZUlkc18sIChpZCkgPT4gaWQgPT09IHBhZ2VJZCkgKyAxO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbiBmYWlsIGlmIHNsb3QgaXMgcHJvdGVjdGVkIGJ5IG5leHQtcGFnZS1uby1hZCwgaWYgdGhlcmUgYXJlIG5vdCBlbm91Z2hcbiAgICogcGFnZXMgbGVmdCBpbiB0aGUgc3RvcnkgZm9yIGluc2VydGlvbiwgb3IgdGhlIHBhZ2UgYmVmb3JlIG9yIGFmdGVyIGlzIGFuIGFkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZUJlZm9yZUFkSWRcbiAgICogQHBhcmFtIHshU3RvcnlBZFBhZ2V9IG5leHRBZFBhZ2VcbiAgICogQHJldHVybiB7IVByb21pc2U8IUluc2VydGlvblN0YXRlPn1cbiAgICovXG4gIG1heWJlSW5zZXJ0UGFnZUFmdGVyKHBhZ2VCZWZvcmVBZElkLCBuZXh0QWRQYWdlKSB7XG4gICAgbGV0IHBhZ2VCZWZvcmVBZCA9IHRoaXMuYW1wU3RvcnlfLmdldFBhZ2VCeUlkKHBhZ2VCZWZvcmVBZElkKTtcbiAgICBsZXQgcGFnZUFmdGVyQWQgPSB0aGlzLmFtcFN0b3J5Xy5nZXROZXh0UGFnZShwYWdlQmVmb3JlQWQpO1xuICAgIGlmICghcGFnZUFmdGVyQWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoSW5zZXJ0aW9uU3RhdGUuREVMQVlFRCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNEZXNrdG9wVmlld18oKSkge1xuICAgICAgLy8gSWYgd2UgYXJlIGluIGRlc2t0b3AgdmlldyB0aGUgYWQgbXVzdCBiZSBpbnNlcnRlZCAyIHBhZ2VzIGF3YXkgYmVjYXVzZVxuICAgICAgLy8gdGhlIG5leHQgcGFnZSB3aWxsIGFscmVhZHkgYmUgaW4gdmlld1xuICAgICAgcGFnZUJlZm9yZUFkSWQgPSBwYWdlQWZ0ZXJBZC5lbGVtZW50LmlkO1xuICAgICAgcGFnZUJlZm9yZUFkID0gcGFnZUFmdGVyQWQ7XG4gICAgICBwYWdlQWZ0ZXJBZCA9IHRoaXMuYW1wU3RvcnlfLmdldE5leHRQYWdlKHBhZ2VBZnRlckFkKTtcbiAgICB9XG5cbiAgICBpZiAoIXBhZ2VBZnRlckFkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKEluc2VydGlvblN0YXRlLkRFTEFZRUQpO1xuICAgIH1cblxuICAgIC8vIFdlIHdpbGwgbm90IGluc2VydCBhbiBhZCBpbiBhbnkgc2xvdCBjb250YWluaW5nIGBuZXh0LXBhZ2Utbm8tYWRgIG5vclxuICAgIC8vIHR3byBhZHMgaW4gYSByb3cuXG4gICAgaWYgKFxuICAgICAgdGhpcy5uZXh0UGFnZU5vQWRfKHBhZ2VCZWZvcmVBZCkgfHxcbiAgICAgIHBhZ2VCZWZvcmVBZC5pc0FkKCkgfHxcbiAgICAgIHBhZ2VBZnRlckFkLmlzQWQoKVxuICAgICkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShJbnNlcnRpb25TdGF0ZS5ERUxBWUVEKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dEFkUGFnZS5tYXliZUNyZWF0ZUN0YSgpLnRoZW4oKGN0YUNyZWF0ZWQpID0+IHtcbiAgICAgIGlmICghY3RhQ3JlYXRlZCkge1xuICAgICAgICB0aGlzLmRpc2NhcmRDdXJyZW50QWQoKTtcbiAgICAgICAgcmV0dXJuIEluc2VydGlvblN0YXRlLkZBSUxVUkU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5pbnNlcnRJbnRvUGFyZW50U3RvcnlfKG5leHRBZFBhZ2UsIHBhZ2VCZWZvcmVBZElkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0geyFTdG9yeUFkUGFnZX0gbmV4dEFkUGFnZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZUJlZm9yZUFkSWRcbiAgICogQHJldHVybiB7SW5zZXJ0aW9uU3RhdGV9XG4gICAqL1xuICBpbnNlcnRJbnRvUGFyZW50U3RvcnlfKG5leHRBZFBhZ2UsIHBhZ2VCZWZvcmVBZElkKSB7XG4gICAgY29uc3QgbmV4dEFkUGFnZUlkID0gbmV4dEFkUGFnZS5nZXRJZCgpO1xuICAgIHRoaXMuYW1wU3RvcnlfLmluc2VydFBhZ2UocGFnZUJlZm9yZUFkSWQsIG5leHRBZFBhZ2VJZCk7XG5cbiAgICAvLyBJZiB3ZSBhcmUgaW5zZXJ0ZWQgd2Ugbm93IGhhdmUgYSBgcG9zaXRpb25gIG1hY3JvIGF2YWlsYWJsZSBmb3IgYW55XG4gICAgLy8gYW5hbHl0aWNzIGV2ZW50cyBtb3ZpbmcgZm9yd2FyZC5cbiAgICBjb25zdCBhZEluZGV4ID0gdGhpcy5nZXRJbmRleEJ5SWQobmV4dEFkUGFnZUlkKTtcbiAgICBjb25zdCBwYWdlTnVtYmVyID0gdGhpcy5hbXBTdG9yeV8uZ2V0UGFnZUluZGV4QnlJZChwYWdlQmVmb3JlQWRJZCk7XG5cbiAgICB0aGlzLmFuYWx5dGljc18udGhlbigoYW5hbHl0aWNzKSA9PlxuICAgICAgYW5hbHl0aWNzLnNldFZhcihhZEluZGV4LCBBbmFseXRpY3NWYXJzLlBPU0lUSU9OLCBwYWdlTnVtYmVyICsgMSlcbiAgICApO1xuXG4gICAgdGhpcy5jdXJyZW50QWRJbnNlcnRlZF8oKTtcbiAgICByZXR1cm4gSW5zZXJ0aW9uU3RhdGUuU1VDQ0VTUztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY3VycmVudEFkSW5zZXJ0ZWRfKCkge1xuICAgIHRoaXMuYW5hbHl0aWNzRXZlbnRfKEFuYWx5dGljc0V2ZW50cy5BRF9JTlNFUlRFRCwge1xuICAgICAgW0FuYWx5dGljc1ZhcnMuQURfSU5ERVhdOiB0aGlzLmFkc0NvbnN1bWVkXyxcbiAgICAgIFtBbmFseXRpY3NWYXJzLkFEX0lOU0VSVEVEXTogRGF0ZS5ub3coKSxcbiAgICB9KTtcbiAgICB0aGlzLmFkc0NvbnN1bWVkXysrO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0Rlc2t0b3BWaWV3XygpIHtcbiAgICByZXR1cm4gISF0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuREVTS1RPUF9TVEFURSk7XG4gIH1cblxuICAvKipcbiAgICogVXNlcnMgbWF5IHB1dCBhbiAnbmV4dC1wYWdlLW5vLWFkJyBhdHRyaWJ1dGUgb24gdGhlaXIgcGFnZXMgdG8gcHJldmVudCBhZHNcbiAgICogZnJvbSBzaG93aW5nIGFzIHRoZSBuZXh0IHBhZ2UuXG4gICAqIEBwYXJhbSB7Py4uLy4uL2FtcC1zdG9yeS8xLjAvYW1wLXN0b3J5LXBhZ2UuQW1wU3RvcnlQYWdlfSBwYWdlXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBuZXh0UGFnZU5vQWRfKHBhZ2UpIHtcbiAgICByZXR1cm4gcGFnZS5lbGVtZW50Lmhhc0F0dHJpYnV0ZShORVhUX1BBR0VfTk9fQURfQVRUUik7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGFuIGFuYWx5dGljcyBldmVudCBhbmQgdHJpZ2dlciBpdC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBudW1iZXI+fSB2YXJzIEEgbWFwIG9mIHZhcnMgYW5kIHRoZWlyIHZhbHVlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFuYWx5dGljc0V2ZW50XyhldmVudFR5cGUsIHZhcnMpIHtcbiAgICB0aGlzLmFuYWx5dGljc18udGhlbigoYW5hbHl0aWNzKSA9PlxuICAgICAgYW5hbHl0aWNzLmZpcmVFdmVudChcbiAgICAgICAgdGhpcy5hbXBTdG9yeV8uZWxlbWVudCxcbiAgICAgICAgdmFyc1snYWRJbmRleCddLFxuICAgICAgICBldmVudFR5cGUsXG4gICAgICAgIHZhcnNcbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-page-manager.js