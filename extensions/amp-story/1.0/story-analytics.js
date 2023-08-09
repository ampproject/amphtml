import {getDataParamsFromAttributes} from '#core/dom';
import {map} from '#core/types/object';

import {Services} from '#service';

import {triggerAnalyticsEvent} from '#utils/analytics';

import {StateProperty, getStoreService} from './amp-story-store-service';
import {getVariableService} from './variable-service';

import {getAmpdoc, registerServiceBuilder} from '../../../src/service-helpers';

/** @const {string} */
export const ANALYTICS_TAG_NAME = '__AMP_ANALYTICS_TAG_NAME__';

/** @enum {string} */
export const StoryAnalyticsEvent = {
  CLICK_THROUGH: 'story-click-through',
  FOCUS: 'story-focus',
  LAST_PAGE_VISIBLE: 'story-last-page-visible',
  OPEN: 'story-open',
  CLOSE: 'story-close',
  PAGE_ATTACHMENT_ENTER: 'story-page-attachment-enter',
  PAGE_ATTACHMENT_EXIT: 'story-page-attachment-exit',
  PAGE_VISIBLE: 'story-page-visible',
  INTERACTIVE: 'story-interactive',
  STORY_CONTENT_LOADED: 'story-content-loaded',
  STORY_MUTED: 'story-audio-muted',
  STORY_UNMUTED: 'story-audio-unmuted',
  SHOPPING_BUY_NOW_CLICK: 'story-shopping-buy-now-click',
  SHOPPING_PLP_VIEW: 'story-shopping-plp-view',
  SHOPPING_PDP_VIEW: 'story-shopping-pdp-view',
  SHOPPING_TAG_CLICK: 'story-shopping-tag-click',
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

/** @typedef {!{[key: string]: !PageEventCountDef}} */
let EventsPerPageDef;

/** @typedef {!{[key: string]: number}} */
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
    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      (pageId) => {
        const isAd = this.storeService_.get(StateProperty.AD_STATE);
        if (!pageId || isAd) {
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

    getAmpdoc(this.element_)
      .whenNextVisible()
      .then(() =>
        triggerAnalyticsEvent(
          this.element_,
          eventType,
          this.updateDetails(eventType, element)
        )
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
