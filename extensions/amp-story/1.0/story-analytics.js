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
import {StateChangeType} from './navigation-state';
import {dev} from '../../../src/log';
import {registerServiceBuilder} from '../../../src/service';
import {triggerAnalyticsEvent} from '../../../src/analytics';

/** @enum {string} */
export const StoryEventType = {
  PAGE_VISIBLE: 'story-page-visible',
  BOOKEND_ENTER: 'story-bookend-enter',
  BOOKEND_EXIT: 'story-bookend-exit',
  STORY_MUTED: 'story-audio-muted',
  STORY_UNMUTED: 'story-audio-unmuted',
};

/** @enum {string} */
export const AdvancementMode = {
  GO_TO_PAGE: 'goToPageAction',
  AUTO_ADVANCE_TIME: 'autoAdvanceTime',
  AUTO_ADVANCE_MEDIA: 'autoAdvanceMedia',
  MANUAL_ADVANCE: 'manualAdvance',
  ADVANCE_TO_ADS: 'manualAdvanceFromAd',
};

/**
 * Util function to retrieve the analytics service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param {!Window} win
 * @param {!Element} el
 * @return {!StoryAnalyticsService}
 */
export const getAnalyticsService = (win, el) => {
  let service = Services.storyAnalyticsService(win);

  if (!service) {
    service = new StoryAnalyticsService(win, el);
    registerServiceBuilder(win, 'story-analytics', () => service);
  }

  return service;
};

/**
 * Intermediate handler for amp-story specific analytics.
 */
export class StoryAnalyticsService {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Element} */
    this.element_ = element;
  }

  /**
   * @param {!./navigation-state.StateChangeEventDef} stateChangeEvent
   */
  onNavigationStateChange(stateChangeEvent) {
    switch (stateChangeEvent.type) {
      case StateChangeType.ACTIVE_PAGE:
        this.triggerEvent_(StoryEventType.PAGE_VISIBLE);
        break;
      case StateChangeType.BOOKEND_ENTER:
        this.triggerEvent_(StoryEventType.BOOKEND_ENTER);
        break;
      case StateChangeType.BOOKEND_EXIT:
        this.triggerEvent_(StoryEventType.BOOKEND_EXIT);
        break;
    }
  }

  /**
   * @param {boolean} isMuted
   */
  onMutedStateChange(isMuted) {
    const event = isMuted
      ? StoryEventType.STORY_MUTED
      : StoryEventType.STORY_UNMUTED;
    this.triggerEvent_(event);
  }

  /**
   * @param {!StoryEventType} eventType
   * @private
   */
  triggerEvent_(eventType) {
    const variablesPromise = Services.storyVariableServiceForOrNull(this.win_);
    variablesPromise.then(
      variables => {
        triggerAnalyticsEvent(
          this.element_,
          eventType,
          /** @type {!JsonObject} */ (variables)
        );
      },
      reason => {
        dev().error('AMP-STORY', 'Could not get analytics variables', reason);
      }
    );
  }
}
