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

/** @const {string} */
export const TAG = 'amp-story-auto-ads:page-manager';

/** @enum {number} */
export const InsertionState = {
  DELAYED: 0,
  FAILURE: 1,
  SUCCESS: 2,
};

export const NEXT_PAGE_NO_AD_ATTR = 'next-page-no-ad';

/**
 * Manages creation and retrieval of story ad pages.
 */
export class StoryAdPageManager {
  /**
   * @param {!../../amp-story/1.0/amp-story.AmpStory} unusedAmpStory
   * @param {!JsonObject} unusedconfig
   */
  constructor(unusedAmpStory, unusedconfig) {}

  /**
   * Check if we have any pages left that have not been inserted or discarded.
   * @return {boolean}
   */
  hasUnusedAdPage() {}

  /**
   * Gets the next ad page that has not yet been inserted or discarded.
   * @return {!StoryAdPage}
   */
  getUnusedAdPage() {}

  /**
   * Called when ad has failed or been placed and we should move to next ad.
   */
  discardCurrentAd() {}

  /**
   * Number of ads created by this manager.
   * @return {number}
   */
  numberOfAdsCreated() {}

  /**
   * Creates a StoryAdPage, appends the element to DOM, and adds it to
   * parent story pages Array.
   * @return {!StoryAdPage}
   */
  createAdPage() {}

  /**
   * @param {string} unusedPageId
   * @return {boolean}
   */
  hasId(unusedPageId) {}

  /**
   * @param {string} unusedPageId
   * @return {StoryAdPage}
   */
  getAdPageById(unusedPageId) {}

  /**
   * @param {string} unusedPageId
   * @return {number}
   */
  getIndexById(unusedPageId) {}

  /**
   * Can fail if slot is protected by next-page-no-ad, if there are not enough
   * pages left in the story for insertion, or the page before or after is an ad.
   * @param {string} unusedPageBeforeAdId
   * @param {!StoryAdPage} unusedNextAdPage
   * @return {!Promise<!InsertionState>}
   */
  maybeInsertPageAfter(unusedPageBeforeAdId, unusedNextAdPage) {}
}
