import {InsertionState} from './story-ad-page-manager';

import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';

/**
 * Original Story Ads placement algorithm. Tries to place ad every seven pages.
 * Will not place if ad is still loading.
 * @implements {./algorithm-interface.StoryAdPlacementAlgorithm}
 */
export class FinalPageAlgorithm {
  /** @override */
  constructor(storeService, pageManager) {
    /** @private {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private {!StoryAdPageManager} */
    this.pageManager_ = pageManager;

    /** @private {boolean} */
    this.pendingAdView_ = false;

    /** @private {boolean} */
    this.tryingToInsert_ = false;
  }

  /** @override */
  isStoryEligible() {
    return true;
  }

  /** @override */
  initializePages() {
    return [this.pageManager_.createAdPage()];
  }

  /** @override */
  onPageChange(pageId) {
    const pageIds = this.storeService_.get(StateProperty.PAGE_IDS);
    const isLastPage =
      pageIds.findIndex((x) => x === pageId) === pageIds.length - 1;

    if (
      !isLastPage ||
      this.pendingAdView_ ||
      this.tryingToInsert_ ||
      !this.pageManager_.hasUnusedAdPage()
    ) {
      return;
    }

    this.tryingToInsert_ = true;
    this.tryToPlaceAdAfterPage_(pageId);
  }

  /** @override */
  onNewAdView() {
    this.pendingAdView_ = false;
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

    console.log('insert');

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
