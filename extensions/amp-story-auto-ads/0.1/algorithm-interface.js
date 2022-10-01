/**
 * Interface for all story ad placement algorithms.
 * @interface
 */
export class StoryAdPlacementAlgorithm {
  /**
   * @param {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} unusedStoreService
   * @param {!StoryAdPageManager} unusedPageManager
   */
  constructor(unusedStoreService, unusedPageManager) {
    throw new Error('Not implemented.');
  }

  /**
   * Called when amp-story-auto-ads initializes. Used as early exit for stories where
   * the algo knows ahead of time no ads will be placed, e.g. short stories.
   * @return {boolean}
   */
  isStoryEligible() {
    throw new Error('Not implemented.');
  }

  /**
   * Will be called when amp-story-auto-ads initializes. Do work around building
   * and preloading pages that should happen before any navigation events. Returned
   * array may be used to force ad to show in development mode.
   * @return {!Array<!StoryAdPage>}
   */
  initializePages() {
    throw new Error('Not implemented.');
  }

  /**
   * Called whenever we receive a page navigation event from the parent story.
   * @param {string} unusedPageId
   */
  onPageChange(unusedPageId) {
    throw new Error('Not implemented.');
  }

  /**
   * @param {number} unusedPageIndex
   */
  onNewAdView(unusedPageIndex) {
    throw new Error('Not implemented.');
  }
}
