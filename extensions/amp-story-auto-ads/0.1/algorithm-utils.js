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

import {CountPagesAlgorithm} from './algorithm-count-pages';
import {PredeterminedPositionAlgorithm} from './algorithm-predetermined';
import {StoryAdPlacements} from '../../../src/experiments/story-ad-placements';
import {getExperimentBranch} from '../../../src/experiments';

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
    placementsExpBranch === StoryAdPlacements.PREDETERMINED_EIGHT ||
    placementsExpBranch === StoryAdPlacements.PREDETERMINED_TWELVE
  ) {
    return new PredeterminedPositionAlgorithm(
      storeService,
      pageManager,
      placementsExpBranch
    );
  }
  return new CountPagesAlgorithm(storeService, pageManager);
}
