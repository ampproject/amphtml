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
import {getVariableService} from './variable-service';
import {registerServiceBuilder} from '../../../src/service';
import {triggerAnalyticsEvent} from '../../../src/analytics';

/** @enum {string} */
export const AnalyticsEvent = {
  BOOKEND_ENTER: 'story-bookend-enter',
  BOOKEND_EXIT: 'story-bookend-exit',
  LAST_PAGE_VISIBLE: 'story-last-page-visible',
  PAGE_ATTACHMENT_ENTER: 'story-page-attachment-enter',
  PAGE_ATTACHMENT_EXIT: 'story-page-attachment-exit',
  PAGE_VISIBLE: 'story-page-visible',
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
    /** @protected @const {!Window} */
    this.win_ = win;

    /** @private @const {!Element} */
    this.element_ = element;

    /** @const @private {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(win);
  }

  /**
   * @param {!./navigation-state.StateChangeEventDef} stateChangeEvent
   */
  onNavigationStateChange(stateChangeEvent) {
    switch (stateChangeEvent.type) {
      case StateChangeType.ACTIVE_PAGE:
        this.triggerEvent(AnalyticsEvent.PAGE_VISIBLE);
        break;
      case StateChangeType.BOOKEND_ENTER:
        this.triggerEvent(AnalyticsEvent.BOOKEND_ENTER);
        break;
      case StateChangeType.BOOKEND_EXIT:
        this.triggerEvent(AnalyticsEvent.BOOKEND_EXIT);
        break;
      case StateChangeType.LAST_PAGE:
        this.triggerEvent(AnalyticsEvent.LAST_PAGE_VISIBLE);
        break;
    }
  }

  /**
   * @param {!AnalyticsEvent} eventType
   */
  triggerEvent(eventType) {
    triggerAnalyticsEvent(
      this.element_,
      eventType,
      this.variableService_.get()
    );
  }
}
