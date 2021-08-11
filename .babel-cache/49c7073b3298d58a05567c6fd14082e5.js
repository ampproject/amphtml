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

import { StateProperty } from "../../amp-story/1.0/amp-story-store-service";
import { StoryAdPlacements } from "../../../src/experiments/story-ad-placements";

/** @const {number} */
var BEGINNING_OF_STORY_BUFFER = 3;

/** @const {number} */
var END_OF_STORY_BUFFER = 1;

/** @const {number} */
var MAX_ADS_PER_STORY = 4;

/**
 * Calculate the indices of where ads should be placed based
 * on story length and the number of ads we want to show.
 * @param {number} storyLength
 * @param {number} numberOfAds
 * @return {!Array<number>}
 * @visibleForTesting
 */
export function getAdPositions(storyLength, numberOfAds) {
  if (!numberOfAds) {
    return [];
  }
  var firstPosition = Math.ceil(storyLength / (numberOfAds + 1));
  var pagesLeft = storyLength - firstPosition;
  var positions = [firstPosition];
  var interval = Math.ceil(pagesLeft / numberOfAds);
  for (var i = 1; i < numberOfAds; i++) {
    var position = firstPosition + interval * i;
    positions.push(position);
  }
  return positions;
}

/**
 * Get number of ads for this story. 1 ad for every full target interval +
 * a 1/interval chance for an extra ad. Respects maximum ads per story.
 * @param {number} pageCount
 * @param {number} targetInterval
 * @return {number}
 * @visibleForTesting
 */
export function getNumberOfAds(pageCount, targetInterval) {
  var fullSegments = Math.floor(pageCount / targetInterval);
  var addExtraAd =
  Math.random() < (pageCount % targetInterval) / targetInterval;
  var remainderAds = addExtraAd ? 1 : 0;
  return Math.min(fullSegments + remainderAds, MAX_ADS_PER_STORY);
}

/**
 * This algorithm will calculate the number of ads to serve and place them
 * in predermined slots upon initialization.
 * @implements {./algorithm-interface.StoryAdPlacementAlgorithm}
 */
export var PredeterminedPositionAlgorithm = /*#__PURE__*/function () {
  /** @override */
  function PredeterminedPositionAlgorithm(storeService, pageManager, placementsExpBranch) {_classCallCheck(this, PredeterminedPositionAlgorithm);
    /** @private {!StoryAdPageManager} */
    this.pageManager_ = pageManager;

    /** @private {number} */
    this.targetInterval_ = this.getIntervalFromExpId_(placementsExpBranch);

    /** @private {!Array<string>} */
    this.storyPageIds_ = storeService.get(StateProperty.PAGE_IDS);

    /** @private {!Array<number>} */
    this.adPositions_ = [];

    /** @private {number} */
    this.pagesCreated_ = 0;
  }

  /** @override */_createClass(PredeterminedPositionAlgorithm, [{ key: "isStoryEligible", value:
    function isStoryEligible() {
      var storyLength = this.storyPageIds_.length;
      return storyLength > BEGINNING_OF_STORY_BUFFER + END_OF_STORY_BUFFER;
    }

    /** @override */ }, { key: "initializePages", value:
    function initializePages() {
      var storyLength = this.storyPageIds_.length;
      var numberOfAds = getNumberOfAds(storyLength, this.targetInterval_);
      this.adPositions_ = getAdPositions(storyLength, numberOfAds);
      if (numberOfAds) {
        // TODO(ccordry): once 1px impression is launched create all ads at once.
        return [this.createNextPage_()];
      }
      return [];
    }

    /**
     * Create the next ad page to be shown based on predetermined placements.
     */ }, { key: "createNextPage_", value:
    function createNextPage_() {var _this = this;
      var position = this.adPositions_[this.pagesCreated_];
      var adPage = this.pageManager_.createAdPage();
      adPage.registerLoadCallback(function () {
        // TODO(ccordry): we could maybe try again if insertion fails.
        _this.pageManager_.maybeInsertPageAfter(
        _this.storyPageIds_[position - 1],
        adPage);

      });
      this.pagesCreated_++;
      return adPage;
    }

    /**
     * This algo does not care about page navigations as positions are calculated
     * upon initialization.
     * @override
     */ }, { key: "onPageChange", value:
    function onPageChange(unusedPageId) {}

    /** @override */ }, { key: "onNewAdView", value:
    function onNewAdView(unusedPageIndex) {
      if (this.pagesCreated_ < this.adPositions_.length) {
        this.createNextPage_();
      }
    }

    /**
     * Map branches to the interval from experiment branch.
     * @param {string} branchId
     * @return {number}
     */ }, { key: "getIntervalFromExpId_", value:
    function getIntervalFromExpId_(branchId) {
      if (branchId === StoryAdPlacements.PREDETERMINED_EIGHT) {
        return 8;
      } else if (branchId === StoryAdPlacements.PREDETERMINED_TEN) {
        return 10;
      } else if (branchId === StoryAdPlacements.PREDETERMINED_TWELVE) {
        return 12;
      }
    } }]);return PredeterminedPositionAlgorithm;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/algorithm-predetermined.js