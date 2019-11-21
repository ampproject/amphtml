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
import {StateChangeType} from './navigation-state';
import {dict} from '../../../src/utils/object';

/**
 * @typedef {!JsonObject}
 */
export let StoryVariableDef;

/** @enum {string} */
const Variable = {
  STORY_PAGE_ID: 'storyPageId',
  STORY_PAGE_INDEX: 'storyPageIndex',
  STORY_PAGE_COUNT: 'storyPageCount',
  STORY_IS_MUTED: 'storyIsMuted',
  STORY_PROGRESS: 'storyProgress',
};

/**
 * Variable service for amp-story.
 * Used for URL replacement service. See usage in src/url-replacements-impl.
 */
export class AmpStoryVariableService {
  /**
   * @public
   */
  constructor() {
    /** @private {!StoryVariableDef} */
    this.variables_ = dict({
      [Variable.STORY_PAGE_INDEX]: null,
      [Variable.STORY_PAGE_ID]: null,
      [Variable.STORY_PAGE_COUNT]: null,
      [Variable.STORY_PROGRESS]: null,
      [Variable.STORY_IS_MUTED]: null,
    });
  }

  /**
   * @param {!./navigation-state.StateChangeEventDef} stateChangeEvent
   */
  onNavigationStateChange(stateChangeEvent) {
    switch (stateChangeEvent.type) {
      case StateChangeType.ACTIVE_PAGE:
        const {
          pageIndex,
          pageId,
          storyProgress,
          totalPages,
        } = stateChangeEvent.value;
        this.variables_[Variable.STORY_PAGE_INDEX] = pageIndex;
        this.variables_[Variable.STORY_PAGE_ID] = pageId;
        this.variables_[Variable.STORY_PROGRESS] = storyProgress;
        this.variables_[Variable.STORY_PAGE_COUNT] = totalPages;
        break;
    }
  }

  /**
   * @param {boolean} isMuted
   */
  onMutedStateChange(isMuted) {
    this.variables_[Variable.STORY_IS_MUTED] = isMuted;
  }

  /**
   * @return {!StoryVariableDef}
   */
  get() {
    // TODO(newmius): You should probably Object.freeze this in development.
    return this.variables_;
  }
}
