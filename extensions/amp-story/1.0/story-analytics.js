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
import {StoryAnalyticsEvent} from '../../../src/analytics';
import {getVariableService} from './variable-service';
import {map} from '../../../src/utils/object';
import {registerServiceBuilder} from '../../../src/service';

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

    /** @private {!Object} */
    this.eventsPerPage_ = map();

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    this.initializeListeners_();
  }

  /** @private */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, isActive => {
      this.triggerEvent(
        isActive
          ? StoryAnalyticsEvent.BOOKEND_ENTER
          : StoryAnalyticsEvent.BOOKEND_EXIT
      );
    });

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      pageId => {
        if (!pageId) {
          return;
        }

        this.triggerEvent(StoryAnalyticsEvent.PAGE_VISIBLE);

        const pageIds = this.storeService_.get(StateProperty.PAGE_IDS);
        const pageIndex = this.storeService_.get(
          StateProperty.CURRENT_PAGE_INDEX
        );
        if (pageIndex === pageIds.length - 1) {
          this.triggerEvent(StoryAnalyticsEvent.LAST_PAGE_VISIBLE);
        }
      },
      true /* callToInitialize */
    );
  }

  /**
   * @param {!StoryAnalyticsEvent} eventType
   */
  triggerEvent(eventType) {
    this.element_.dispatchCustomEvent(eventType, this.getDetails_(eventType));
  }

  /**
   * Consolidates count of event types per page and variables of the event.
   * @param {!StoryAnalyticsEvent} eventType
   * @private
   * @return {!Object}
   */
  getDetails_(eventType) {
    const details = {};
    const vars = this.variableService_.get();
    const pageId = vars['storyPageId'];

    this.eventsPerPage_[pageId] = this.eventsPerPage_[pageId] || {};

    this.eventsPerPage_[pageId][eventType] =
      this.eventsPerPage_[pageId][eventType] || 0;

    this.eventsPerPage_[pageId][eventType]++;

    if (this.eventsPerPage_[pageId][eventType] > 1) {
      Object.assign(details, {repeated: true});
    }

    return Object.assign({detailsForPage: details}, vars);
  }
}
