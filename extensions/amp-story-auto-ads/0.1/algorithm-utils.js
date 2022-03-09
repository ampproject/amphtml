import {getExperimentBranch} from '#experiments';
import {StoryAdPlacements} from '#experiments/story-ad-placements';

import {FinalPageAlgorithm} from './algorithm-final-page';
import {PredeterminedPositionAlgorithm} from './algorithm-predetermined';

/**
 * Choose placement algorithm implementation.
 * @param {!Window} win
 * @param {!StoryStoreService} storeService
 * @param {!StoryAdPageManager} pageManager
 * @return {!StoryAdPlacementAlgorithm}
 */
export function getPlacementAlgo(win, storeService, pageManager) {
  const placementsExpBranch = getExperimentBranch(win, StoryAdPlacements.ID);
  if (
    placementsExpBranch &&
    placementsExpBranch !== StoryAdPlacements.CONTROL
  ) {
    return new PredeterminedPositionAlgorithm(
      storeService,
      pageManager,
      placementsExpBranch
    );
  }
  return new FinalPageAlgorithm(storeService, pageManager);
}
