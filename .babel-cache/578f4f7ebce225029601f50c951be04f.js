function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { InsertionState } from "./story-ad-page-manager";
import { StateProperty } from "../../amp-story/1.0/amp-story-store-service";
import { hasOwn, map } from "../../../src/core/types/object";

/** @const {number} */
var INTERVAL = 7;

/**
 * Original Story Ads placement algorithm. Tries to place ad every seven pages.
 * Will not place if ad is still loading.
 * @implements {./algorithm-interface.StoryAdPlacementAlgorithm}
 */
export var CountPagesAlgorithm = /*#__PURE__*/function () {
  /** @override */
  function CountPagesAlgorithm(storeService, pageManager) {_classCallCheck(this, CountPagesAlgorithm);
    /** @private {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private {!StoryAdPageManager} */
    this.pageManager_ = pageManager;

    /** @private {!Object<string, boolean>} */
    this.uniquePageIds_ = map();

    /** @private {number} */
    this.newPagesSinceLastAd_ = 1;

    /** @private {boolean} */
    this.pendingAdView_ = false;

    /** @private {boolean} */
    this.tryingToInsert_ = false;
  }

  /** @override */_createClass(CountPagesAlgorithm, [{ key: "isStoryEligible", value:
    function isStoryEligible() {
      var numPages = this.storeService_.get(StateProperty.PAGE_IDS).length;
      return numPages > INTERVAL;
    }

    /** @override */ }, { key: "initializePages", value:
    function initializePages() {
      return [this.pageManager_.createAdPage()];
    }

    /** @override */ }, { key: "onPageChange", value:
    function onPageChange(pageId) {
      if (!hasOwn(this.uniquePageIds_, pageId)) {
        this.uniquePageIds_[pageId] = true;
        this.newPagesSinceLastAd_++;
      }

      if (
      this.pendingAdView_ ||
      this.tryingToInsert_ ||
      !this.readyToPlaceAd_() ||
      !this.pageManager_.hasUnusedAdPage())
      {
        return;
      }

      this.tryingToInsert_ = true;
      this.tryToPlaceAdAfterPage_(pageId);
    }

    /** @override */ }, { key: "onNewAdView", value:
    function onNewAdView(pageIndex) {
      this.pendingAdView_ = false;
      this.newPagesSinceLastAd_ = 0;
      if (this.shouldCreateNextAd_(pageIndex)) {
        this.pageManager_.createAdPage();
      }
    }

    /**
     * Determine if enough pages in the story are left for ad placement to be
     * possible.
     *
     * @param {number} pageIndex
     * @return {boolean}
     */ }, { key: "shouldCreateNextAd_", value:
    function shouldCreateNextAd_(pageIndex) {
      var numPages = this.storeService_.get(StateProperty.PAGE_IDS).length;
      return numPages - pageIndex > INTERVAL;
    }

    /**
     * Determine if user has seen enough pages to show an ad. We want a certain
     * number of pages before the first ad, and then a separate interval
     * thereafter.
     * @return {boolean}
     */ }, { key: "readyToPlaceAd_", value:
    function readyToPlaceAd_() {
      return this.newPagesSinceLastAd_ >= INTERVAL;
    }

    /**
     * Place ad based on user config.
     * @param {string} pageBeforeAdId
     * @private
     */ }, { key: "tryToPlaceAdAfterPage_", value:
    function tryToPlaceAdAfterPage_(pageBeforeAdId) {var _this = this;
      var nextAdPage = this.pageManager_.getUnusedAdPage();

      // Timeout fail, move to next ad on next navigation.
      if (!nextAdPage.isLoaded() && nextAdPage.hasTimedOut()) {
        this.pageManager_.discardCurrentAd();
        return;
      }

      // Keep trying the same ad, so we just exit without changing state.
      if (!nextAdPage.isLoaded()) {
        return;
      }

      this.pageManager_.
      maybeInsertPageAfter(pageBeforeAdId, nextAdPage).
      then(function (insertionState) {
        _this.tryingToInsert_ = false;
        if (insertionState === InsertionState.SUCCESS) {
          // We have an ad inserted that has yet to be viewed.
          _this.pendingAdView_ = true;
        }
      });
    } }]);return CountPagesAlgorithm;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/algorithm-count-pages.js