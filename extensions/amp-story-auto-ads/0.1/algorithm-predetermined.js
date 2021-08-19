import {StoryAdPlacements} from '#experiments/story-ad-placements';

import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';

/** @const {number} */
const BEGINNING_OF_STORY_BUFFER = 3;

/** @const {number} */
const END_OF_STORY_BUFFER = 1;

/** @const {number} */
const MAX_ADS_PER_STORY = 4;

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
  const firstPosition = Math.ceil(storyLength / (numberOfAds + 1));
  const pagesLeft = storyLength - firstPosition;
  const positions = [firstPosition];
  const interval = Math.ceil(pagesLeft / numberOfAds);
  for (let i = 1; i < numberOfAds; i++) {
    const position = firstPosition + interval * i;
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
  const fullSegments = Math.floor(pageCount / targetInterval);
  const addExtraAd =
    Math.random() < (pageCount % targetInterval) / targetInterval;
  const remainderAds = addExtraAd ? 1 : 0;
  return Math.min(fullSegments + remainderAds, MAX_ADS_PER_STORY);
}

/**
 * This algorithm will calculate the number of ads to serve and place them
 * in predermined slots upon initialization.
 * @implements {./algorithm-interface.StoryAdPlacementAlgorithm}
 */
export class PredeterminedPositionAlgorithm {
  /** @override */
  constructor(storeService, pageManager, placementsExpBranch) {
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

  /** @override */
  isStoryEligible() {
    const storyLength = this.storyPageIds_.length;
    return storyLength > BEGINNING_OF_STORY_BUFFER + END_OF_STORY_BUFFER;
  }

  /** @override */
  initializePages() {
    const storyLength = this.storyPageIds_.length;
    const numberOfAds = getNumberOfAds(storyLength, this.targetInterval_);
    this.adPositions_ = getAdPositions(storyLength, numberOfAds);
    if (numberOfAds) {
      // TODO(ccordry): once 1px impression is launched create all ads at once.
      return [this.createNextPage_()];
    }
    return [];
  }

  /**
   * Create the next ad page to be shown based on predetermined placements.
   */
  createNextPage_() {
    const position = this.adPositions_[this.pagesCreated_];
    const adPage = this.pageManager_.createAdPage();
    adPage.registerLoadCallback(() => {
      // TODO(ccordry): we could maybe try again if insertion fails.
      this.pageManager_.maybeInsertPageAfter(
        this.storyPageIds_[position - 1],
        adPage
      );
    });
    this.pagesCreated_++;
    return adPage;
  }

  /**
   * This algo does not care about page navigations as positions are calculated
   * upon initialization.
   * @override
   */
  onPageChange(unusedPageId) {}

  /** @override */
  onNewAdView(unusedPageIndex) {
    if (this.pagesCreated_ < this.adPositions_.length) {
      this.createNextPage_();
    }
  }

  /**
   * Map branches to the interval from experiment branch.
   * @param {string} branchId
   * @return {number}
   */
  getIntervalFromExpId_(branchId) {
    if (branchId === StoryAdPlacements.PREDETERMINED_EIGHT) {
      return 8;
    } else if (branchId === StoryAdPlacements.PREDETERMINED_TEN) {
      return 10;
    } else if (branchId === StoryAdPlacements.PREDETERMINED_TWELVE) {
      return 12;
    }
  }
}
