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
import {hasOwn, map} from '../../../src/utils/object';

/** @const {number} */
const INTERVAL = 7;

/**
 * Original Story Ads placement algorithm. Tries to place ad every seven pages.
 * Will not place if ad is still loading.
 * @implements {./algorithm-interface.StoryAdPlacementAlgorithm}
 */
export class CountPagesAlgorithm {
  /** @override */
  constructor(storeService, pageManager) {
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

  /** @override */
  isStoryEligible() {
    const numPages = this.storeService_.get(StateProperty.PAGE_IDS).length;
    return numPages > INTERVAL;
  }

  /** @override */
  initializePages() {
    return [this.pageManager_.createAdPage()];
  }

  /** @override */
  onPageChange(pageId) {
    if (!hasOwn(this.uniquePageIds_, pageId)) {
      this.uniquePageIds_[pageId] = true;
      this.newPagesSinceLastAd_++;
    }

    if (
      this.pendingAdView_ ||
      this.tryingToInsert_ ||
      !this.readyToPlaceAd_() ||
      !this.pageManager_.hasUnusedAdPage()
    ) {
      return;
    }

    this.tryingToInsert_ = true;
    this.tryToPlaceAdAfterPage_(pageId);
  }

  /** @override */
  onNewAdView(pageIndex) {
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
   */
  shouldCreateNextAd_(pageIndex) {
    const numPages = this.storeService_.get(StateProperty.PAGE_IDS).length;
    return numPages - pageIndex > INTERVAL;
  }

  /**
   * Determine if user has seen enough pages to show an ad. We want a certain
   * number of pages before the first ad, and then a separate interval
   * thereafter.
   * @return {boolean}
   */
  readyToPlaceAd_() {
    return this.newPagesSinceLastAd_ >= INTERVAL;
  }

  /**
   * Place ad based on user config.
   * @param {string} pageBeforeAdId
   * @private
   */
  tryToPlaceAdAfterPage_(pageBeforeAdId) {
    const nextAdPage = this.pageManager_.getUnusedAdPage();

    // Timeout fail, move to next ad on next navigation.
    if (!nextAdPage.isLoaded() && nextAdPage.hasTimedOut()) {
      this.pageManager_.discardCurrentAd();
      return;
    }

    // Keep trying the same ad, so we just exit without changing state.
    if (!nextAdPage.isLoaded()) {
      return;
    }

    this.pageManager_
      .maybeInsertPageAfter(pageBeforeAdId, nextAdPage)
      .then((insertionState) => {
        this.tryingToInsert_ = false;
        if (insertionState === InsertionState.SUCCESS) {
          // We have an ad inserted that has yet to be viewed.
          this.pendingAdView_ = true;
        }
      });
  }
}
