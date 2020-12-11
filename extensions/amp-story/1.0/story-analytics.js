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
import {getDataParamsFromAttributes} from '../../../src/dom';
import {getVariableService} from './variable-service';
import {map} from '../../../src/utils/object';
import {registerServiceBuilder} from '../../../src/service';
import {triggerAnalyticsEvent} from '../../../src/analytics';

/** @const {string} */
export const ANALYTICS_TAG_NAME = '__AMP_ANALYTICS_TAG_NAME__';

/** @enum {string} */
export const StoryAnalyticsEvent = {
  BOOKEND_CLICK: 'story-bookend-click',
  BOOKEND_ENTER: 'story-bookend-enter',
  BOOKEND_EXIT: 'story-bookend-exit',
  CLICK_THROUGH: 'story-click-through',
  FOCUS: 'story-focus',
  LAST_PAGE_VISIBLE: 'story-last-page-visible',
  OPEN: 'story-open',
  CLOSE: 'story-close',
  PAGE_ATTACHMENT_ENTER: 'story-page-attachment-enter',
  PAGE_ATTACHMENT_EXIT: 'story-page-attachment-exit',
  PAGE_VISIBLE: 'story-page-visible',
  INTERACTIVE: 'story-interactive',
  STORY_MUTED: 'story-audio-muted',
  STORY_UNMUTED: 'story-audio-unmuted',
};

/**
 * @enum {string}
 * Note: auto advance advancements should always be prefixed with "autoAdvance".
 */
export const AdvancementMode = {
  GO_TO_PAGE: 'goToPageAction',
  AUTO_ADVANCE_TIME: 'autoAdvanceTime',
  AUTO_ADVANCE_MEDIA: 'autoAdvanceMedia',
  MANUAL_ADVANCE: 'manualAdvance',
  ADVANCE_TO_ADS: 'manualAdvanceFromAd',
  VIEWER_SELECT_PAGE: 'viewerSelectPage',
};

/** @typedef {!Object<string, !PageEventCountDef>} */
let EventsPerPageDef;

/** @typedef {!Object<string, number>} */
let PageEventCountDef;

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
    registerServiceBuilder(win, 'story-analytics', function () {
      return service;
    });
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

    /** @private {EventsPerPageDef} */
    this.pageEventsMap_ = map();

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    this.initializeListeners_();
  }

  /** @private */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, (isActive) => {
      this.triggerEvent(
        isActive
          ? StoryAnalyticsEvent.BOOKEND_ENTER
          : StoryAnalyticsEvent.BOOKEND_EXIT
      );
    });

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      (pageId) => {
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
   * @param {Element=} element
   */
  triggerEvent(eventType, element = null) {
    this.incrementPageEventCount_(eventType);

    triggerAnalyticsEvent(
      this.element_,
      eventType,
      this.updateDetails(eventType, element)
    );
  }

  /**
   * Updates event details.
   * @param {!StoryAnalyticsEvent} eventType
   * @param {Element=} element
   * @visibleForTesting
   * @return {!JsonObject}}
   */
  updateDetails(eventType, element = null) {
    const details = {};
    const vars = this.variableService_.get();
    const pageId = vars['storyPageId'];

    if (this.pageEventsMap_[pageId][eventType] > 1) {
      details.repeated = true;
    }

    if (element) {
      details.tagName =
        element[ANALYTICS_TAG_NAME] || element.tagName.toLowerCase();
      Object.assign(
        vars,
        getDataParamsFromAttributes(
          element,
          /* computeParamNameFunc */ undefined,
          /^vars(.+)/
        )
      );
    }

    return /** @type {!JsonObject} */ ({eventDetails: details, ...vars});
  }

  /**
   * Keeps count of number of events emitted by page for an event type.
   * @param {!StoryAnalyticsEvent} eventType
   * @private
   */
  incrementPageEventCount_(eventType) {
    const vars = this.variableService_.get();
    const pageId = vars['storyPageId'];

    this.pageEventsMap_[pageId] = this.pageEventsMap_[pageId] || {};
    this.pageEventsMap_[pageId][eventType] =
      this.pageEventsMap_[pageId][eventType] || 0;
    this.pageEventsMap_[pageId][eventType]++;
  }
}
