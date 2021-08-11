function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
import { Services } from "../../../src/service";
import { StateProperty, getStoreService } from "./amp-story-store-service";
import { getDataParamsFromAttributes } from "../../../src/core/dom";
import { getVariableService } from "./variable-service";
import { map } from "../../../src/core/types/object";
import { registerServiceBuilder } from "../../../src/service-helpers";
import { triggerAnalyticsEvent } from "../../../src/analytics";

/** @const {string} */
export var ANALYTICS_TAG_NAME = '__AMP_ANALYTICS_TAG_NAME__';

/** @enum {string} */
export var StoryAnalyticsEvent = {
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
  STORY_UNMUTED: 'story-audio-unmuted' };


/**
 * @enum {string}
 * Note: auto advance advancements should always be prefixed with "autoAdvance".
 */
export var AdvancementMode = {
  GO_TO_PAGE: 'goToPageAction',
  AUTO_ADVANCE_TIME: 'autoAdvanceTime',
  AUTO_ADVANCE_MEDIA: 'autoAdvanceMedia',
  MANUAL_ADVANCE: 'manualAdvance',
  ADVANCE_TO_ADS: 'manualAdvanceFromAd',
  VIEWER_SELECT_PAGE: 'viewerSelectPage' };


/** @typedef {!Object<string, !PageEventCountDef>} */
var EventsPerPageDef;

/** @typedef {!Object<string, number>} */
var PageEventCountDef;

/**
 * Util function to retrieve the analytics service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param {!Window} win
 * @param {!Element} el
 * @return {!StoryAnalyticsService}
 */
export var getAnalyticsService = function getAnalyticsService(win, el) {
  var service = Services.storyAnalyticsService(win);

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
export var StoryAnalyticsService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  function StoryAnalyticsService(win, element) {_classCallCheck(this, StoryAnalyticsService);
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

  /** @private */_createClass(StoryAnalyticsService, [{ key: "initializeListeners_", value:
    function initializeListeners_() {var _this = this;
      this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      function (pageId) {
        var isAd = _this.storeService_.get(StateProperty.AD_STATE);
        if (!pageId || isAd) {
          return;
        }

        _this.triggerEvent(StoryAnalyticsEvent.PAGE_VISIBLE);

        var pageIds = _this.storeService_.get(StateProperty.PAGE_IDS);
        var pageIndex = _this.storeService_.get(
        StateProperty.CURRENT_PAGE_INDEX);

        if (pageIndex === pageIds.length - 1) {
          _this.triggerEvent(StoryAnalyticsEvent.LAST_PAGE_VISIBLE);
        }
      },
      true /* callToInitialize */);

    }

    /**
     * @param {!StoryAnalyticsEvent} eventType
     * @param {Element=} element
     */ }, { key: "triggerEvent", value:
    function triggerEvent(eventType) {var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      this.incrementPageEventCount_(eventType);

      triggerAnalyticsEvent(
      this.element_,
      eventType,
      this.updateDetails(eventType, element));

    }

    /**
     * Updates event details.
     * @param {!StoryAnalyticsEvent} eventType
     * @param {Element=} element
     * @visibleForTesting
     * @return {!JsonObject}}
     */ }, { key: "updateDetails", value:
    function updateDetails(eventType) {var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var details = {};
      var vars = this.variableService_.get();
      var pageId = vars['storyPageId'];

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
        /* computeParamNameFunc */undefined,
        /^vars(.+)/));


      }

      return (/** @type {!JsonObject} */_objectSpread({ eventDetails: details }, vars));
    }

    /**
     * Keeps count of number of events emitted by page for an event type.
     * @param {!StoryAnalyticsEvent} eventType
     * @private
     */ }, { key: "incrementPageEventCount_", value:
    function incrementPageEventCount_(eventType) {
      var vars = this.variableService_.get();
      var pageId = vars['storyPageId'];

      this.pageEventsMap_[pageId] = this.pageEventsMap_[pageId] || {};
      this.pageEventsMap_[pageId][eventType] =
      this.pageEventsMap_[pageId][eventType] || 0;
      this.pageEventsMap_[pageId][eventType]++;
    } }]);return StoryAnalyticsService;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/story-analytics.js