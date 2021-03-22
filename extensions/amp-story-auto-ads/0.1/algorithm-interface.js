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
