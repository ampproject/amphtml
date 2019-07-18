/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';
import {StateProperty, getStoreService} from './amp-story-store-service';
import {dict} from '../../../src/utils/object';
import {registerServiceBuilder} from '../../../src/service';

/**
 * @typedef {!JsonObject}
 */
export let StoryVariableDef;

/** @enum {string} */
export const Variable = {
  STORY_PAGE_ID: 'storyPageId',
  STORY_PAGE_INDEX: 'storyPageIndex',
  STORY_PAGE_COUNT: 'storyPageCount',
  STORY_IS_MUTED: 'storyIsMuted',
  STORY_PROGRESS: 'storyProgress',
  STORY_PREVIOUS_PAGE_ID: 'storyPreviousPageId',
  STORY_ADVANCEMENT_MODE: 'storyAdvancementMode',
};

/**
 * Util function to retrieve the variable service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param {!Window} win
 * @return {!AmpStoryVariableService}
 */
export const getVariableService = win => {
  let service = Services.storyVariableService(win);

  if (!service) {
    service = new AmpStoryVariableService(win);
    registerServiceBuilder(win, 'story-variable', () => service);
  }

  return service;
};

/**
 * Variable service for amp-story.
 * Used for URL replacement service. See usage in src/url-replacements-impl.
 */
export class AmpStoryVariableService {
  /**
   * @param {!Window} win
   * @public
   */
  constructor(win) {
    /** @private {!StoryVariableDef} */
    this.variables_ = dict({
      [Variable.STORY_PAGE_INDEX]: null,
      [Variable.STORY_PAGE_ID]: null,
      [Variable.STORY_PAGE_COUNT]: null,
      [Variable.STORY_PROGRESS]: null,
      [Variable.STORY_IS_MUTED]: null,
      [Variable.STORY_PREVIOUS_PAGE_ID]: null,
      [Variable.STORY_ADVANCEMENT_MODE]: null,
    });

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    this.initializeListeners_();
  }

  /** @private */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.PAGE_IDS, pageIds => {
      this.variables_[Variable.STORY_PAGE_COUNT] = pageIds.length;
    });

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      pageId => {
        if (!pageId) {
          return;
        }

        this.variables_[Variable.STORY_PREVIOUS_PAGE_ID] = this.variables_[
          Variable.STORY_PAGE_ID
        ];

        this.variables_[Variable.STORY_PAGE_ID] = pageId;

        const pageIndex = /** @type {number} */ (this.storeService_.get(
          StateProperty.CURRENT_PAGE_INDEX
        ));
        this.variables_[Variable.STORY_PAGE_INDEX] = pageIndex;

        const numberOfPages = this.storeService_.get(StateProperty.PAGE_IDS)
          .length;
        if (numberOfPages > 0) {
          this.variables_[Variable.STORY_PROGRESS] = pageIndex / numberOfPages;
        }
      },
      true /* callToInitialize */
    );
  }

  /**
   * @param {boolean} isMuted
   */
  onMutedStateChange(isMuted) {
    this.variables_[Variable.STORY_IS_MUTED] = isMuted;
  }

  /**
   * @param {string} advancementMode
   */
  onAdvancementModeStateChange(advancementMode) {
    this.variables_[Variable.STORY_ADVANCEMENT_MODE] = advancementMode;
  }

  /**
   * @return {!StoryVariableDef}
   */
  get() {
    // TODO(newmius): You should probably Object.freeze this in development.
    return this.variables_;
  }
}
