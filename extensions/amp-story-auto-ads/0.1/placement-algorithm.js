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

import {InsertionState} from './story-ad-page-manager';
import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';
import {hasOwn} from '../../../src/utils/object';

/** @enum {number} */
const AdState = {
  PENDING: 0,
  PLACING: 1,
  INSERTED: 2,
  FAILED: 3,
};

/**
 * Choose placement algorithm implementation.
 * @param {!StoryStoreService} storeService
 * @param pageManager
 * @return {!StoryAdPlacementAlgorithm}
 */
export function getPlacementAlgo(storeService, pageManager) {
  // TODO(ccordry): Update to use experiment branching.
  return new EverySevenAlgorithm(storeService, pageManager);
}

// WIP do abstraction.
// class StoryAdPlacementAlgorithm {
//   constructor() {}
// }

/**
 * Original Story Ads placement algorithm. Tries to place ad every seven pages.
 * Will not place if ad is still loading.
 */
class EverySevenAlgorithm {
  /**
   * @param isDesktop
   * @param storeService
   * @param pageManager
   */
  constructor(storeService, pageManager) {
    this.pageManager_ = pageManager;
    this.interval_ = 7;
    this.uniquePageIds_ = new Map();
    this.storeService_ = storeService;
    // TODO
    this.isDesktop_ = this.storeService_.get(StateProperty.DESKTOP_STATE);
    // this.numOrganicPages = storeService.get(nuPages)
    this.newPagesSinceLastAd_ = 0;
  }

  /**
   *
   * @return {boolean}
   */
  isStoryEligible() {
    const numPages = this.storeService_.get(StateProperty.PAGE_IDS).length;
    return numPages > this.interval_;
  }

  /**
   *
   */
  initializePages() {
    return [this.pageManager_.createAdPage()];
  }

  /**
   * @param pageId
   */
  onPageChange(pageId) {
    if (!hasOwn(this.uniquePageIds_, pageId)) {
      this.uniquePageIds_[pageId] = true;
      this.newPagesSinceLastAd_++;
    }

    if (
      this.pendingAdView_ ||
      this.tryingToPlace_ ||
      !this.placementAlgorithm_.readyToPlaceAd() ||
      !this.adPageManager_.hasUnusedPage()
    ) {
      return;
    }

    this.tryingToPlace_ = true;
    this.tryToPlaceAdAfterPage_(pageId);
  }

  /**
   */
  onNewAdView() {
    this.newPagesSinceLastAd_ = 0;
  }

  /**
   * Determine if enough pages in the story are left for ad placement to be
   * possible.
   *
   * @param {number} pageIndex
   * @return {boolean}
   */
  shouldCreateNextAd(pageIndex) {
    const numPages = this.storeService_.get(StateProperty.PAGE_IDS).length;
    return numPages - pageIndex > this.interval_;
  }

  /**
   * Determine if user has seen enough pages to show an ad. We want a certain
   * number of pages before the first ad, and then a separate interval
   * thereafter.
   * @return {boolean}
   */
  readyToPlaceAd() {
    console.log(this.newPagesSinceLastAd_ >= this.interval_);
    return this.newPagesSinceLastAd_ >= this.interval_;
  }

  /**
   * Place ad based on user config.
   * @param {string} pageBeforeAdId
   * @private
   */
  tryToPlaceAdAfterPage_(pageBeforeAdId) {
    const nextAdPage = this.adPageManager_.getUnusedAdPage();

    // Timeout fail, move to next ad on next navigation.
    if (!nextAdPage.isLoaded() && nextAdPage.hasTimedOut()) {
      this.moveToNextAd_();
      return;
    }

    // Keep trying the same ad, so we just exit without changing state.
    if (!nextAdPage.isLoaded()) {
      return;
    }

    // WIPP moving placement logic around out of asaa.
    // need to figure out analytics
    this.pageManager_
      .insertAdPageAfter(pageBeforeAdId, nextAdPage)
      .then((insertionState) => {
        if (insertionState === InsertionState.DELAYED) {
          return;
        }

        this.adPageManager_.moveToNextAd();

        if (insertionState === InsertionState.INSERTED) {
          this.analyticsEventWithCurrentAd_(AnalyticsEvents.AD_INSERTED, {
            [AnalyticsVars.AD_INSERTED]: Date.now(),
          });
          // We have an ad inserted that has yet to be viewed.
          this.pendingAdView_ = true;
        }

        if (insertionState === InsertionState.FAILED) {
          this.analyticsEventWithCurrentAd_(AnalyticsEvents.AD_DISCARDED, {
            [AnalyticsVars.AD_DISCARDED]: Date.now(),
          });
          this.startNextAd();
        }
      });
  }

  startNextAd() {}
}
