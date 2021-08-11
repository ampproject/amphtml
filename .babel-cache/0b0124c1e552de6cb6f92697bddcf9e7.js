function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
  STORY_UNMUTED: 'story-audio-unmuted'
};

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
  VIEWER_SELECT_PAGE: 'viewerSelectPage'
};

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
  function StoryAnalyticsService(win, element) {
    _classCallCheck(this, StoryAnalyticsService);

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
  _createClass(StoryAnalyticsService, [{
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this = this;

      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, function (pageId) {
        var isAd = _this.storeService_.get(StateProperty.AD_STATE);

        if (!pageId || isAd) {
          return;
        }

        _this.triggerEvent(StoryAnalyticsEvent.PAGE_VISIBLE);

        var pageIds = _this.storeService_.get(StateProperty.PAGE_IDS);

        var pageIndex = _this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX);

        if (pageIndex === pageIds.length - 1) {
          _this.triggerEvent(StoryAnalyticsEvent.LAST_PAGE_VISIBLE);
        }
      }, true
      /* callToInitialize */
      );
    }
    /**
     * @param {!StoryAnalyticsEvent} eventType
     * @param {Element=} element
     */

  }, {
    key: "triggerEvent",
    value: function triggerEvent(eventType, element) {
      if (element === void 0) {
        element = null;
      }

      this.incrementPageEventCount_(eventType);
      triggerAnalyticsEvent(this.element_, eventType, this.updateDetails(eventType, element));
    }
    /**
     * Updates event details.
     * @param {!StoryAnalyticsEvent} eventType
     * @param {Element=} element
     * @visibleForTesting
     * @return {!JsonObject}}
     */

  }, {
    key: "updateDetails",
    value: function updateDetails(eventType, element) {
      if (element === void 0) {
        element = null;
      }

      var details = {};
      var vars = this.variableService_.get();
      var pageId = vars['storyPageId'];

      if (this.pageEventsMap_[pageId][eventType] > 1) {
        details.repeated = true;
      }

      if (element) {
        details.tagName = element[ANALYTICS_TAG_NAME] || element.tagName.toLowerCase();
        Object.assign(vars, getDataParamsFromAttributes(element,
        /* computeParamNameFunc */
        undefined, /^vars(.+)/));
      }

      return (
        /** @type {!JsonObject} */
        _extends({
          eventDetails: details
        }, vars)
      );
    }
    /**
     * Keeps count of number of events emitted by page for an event type.
     * @param {!StoryAnalyticsEvent} eventType
     * @private
     */

  }, {
    key: "incrementPageEventCount_",
    value: function incrementPageEventCount_(eventType) {
      var vars = this.variableService_.get();
      var pageId = vars['storyPageId'];
      this.pageEventsMap_[pageId] = this.pageEventsMap_[pageId] || {};
      this.pageEventsMap_[pageId][eventType] = this.pageEventsMap_[pageId][eventType] || 0;
      this.pageEventsMap_[pageId][eventType]++;
    }
  }]);

  return StoryAnalyticsService;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0b3J5LWFuYWx5dGljcy5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsIlN0YXRlUHJvcGVydHkiLCJnZXRTdG9yZVNlcnZpY2UiLCJnZXREYXRhUGFyYW1zRnJvbUF0dHJpYnV0ZXMiLCJnZXRWYXJpYWJsZVNlcnZpY2UiLCJtYXAiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyIiwidHJpZ2dlckFuYWx5dGljc0V2ZW50IiwiQU5BTFlUSUNTX1RBR19OQU1FIiwiU3RvcnlBbmFseXRpY3NFdmVudCIsIkNMSUNLX1RIUk9VR0giLCJGT0NVUyIsIkxBU1RfUEFHRV9WSVNJQkxFIiwiT1BFTiIsIkNMT1NFIiwiUEFHRV9BVFRBQ0hNRU5UX0VOVEVSIiwiUEFHRV9BVFRBQ0hNRU5UX0VYSVQiLCJQQUdFX1ZJU0lCTEUiLCJJTlRFUkFDVElWRSIsIlNUT1JZX0NPTlRFTlRfTE9BREVEIiwiU1RPUllfTVVURUQiLCJTVE9SWV9VTk1VVEVEIiwiQWR2YW5jZW1lbnRNb2RlIiwiR09fVE9fUEFHRSIsIkFVVE9fQURWQU5DRV9USU1FIiwiQVVUT19BRFZBTkNFX01FRElBIiwiTUFOVUFMX0FEVkFOQ0UiLCJBRFZBTkNFX1RPX0FEUyIsIlZJRVdFUl9TRUxFQ1RfUEFHRSIsIkV2ZW50c1BlclBhZ2VEZWYiLCJQYWdlRXZlbnRDb3VudERlZiIsImdldEFuYWx5dGljc1NlcnZpY2UiLCJ3aW4iLCJlbCIsInNlcnZpY2UiLCJzdG9yeUFuYWx5dGljc1NlcnZpY2UiLCJTdG9yeUFuYWx5dGljc1NlcnZpY2UiLCJlbGVtZW50Iiwid2luXyIsImVsZW1lbnRfIiwidmFyaWFibGVTZXJ2aWNlXyIsInBhZ2VFdmVudHNNYXBfIiwic3RvcmVTZXJ2aWNlXyIsImluaXRpYWxpemVMaXN0ZW5lcnNfIiwic3Vic2NyaWJlIiwiQ1VSUkVOVF9QQUdFX0lEIiwicGFnZUlkIiwiaXNBZCIsImdldCIsIkFEX1NUQVRFIiwidHJpZ2dlckV2ZW50IiwicGFnZUlkcyIsIlBBR0VfSURTIiwicGFnZUluZGV4IiwiQ1VSUkVOVF9QQUdFX0lOREVYIiwibGVuZ3RoIiwiZXZlbnRUeXBlIiwiaW5jcmVtZW50UGFnZUV2ZW50Q291bnRfIiwidXBkYXRlRGV0YWlscyIsImRldGFpbHMiLCJ2YXJzIiwicmVwZWF0ZWQiLCJ0YWdOYW1lIiwidG9Mb3dlckNhc2UiLCJPYmplY3QiLCJhc3NpZ24iLCJ1bmRlZmluZWQiLCJldmVudERldGFpbHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLGFBQVIsRUFBdUJDLGVBQXZCO0FBQ0EsU0FBUUMsMkJBQVI7QUFDQSxTQUFRQyxrQkFBUjtBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxzQkFBUjtBQUNBLFNBQVFDLHFCQUFSOztBQUVBO0FBQ0EsT0FBTyxJQUFNQyxrQkFBa0IsR0FBRyw0QkFBM0I7O0FBRVA7QUFDQSxPQUFPLElBQU1DLG1CQUFtQixHQUFHO0FBQ2pDQyxFQUFBQSxhQUFhLEVBQUUscUJBRGtCO0FBRWpDQyxFQUFBQSxLQUFLLEVBQUUsYUFGMEI7QUFHakNDLEVBQUFBLGlCQUFpQixFQUFFLHlCQUhjO0FBSWpDQyxFQUFBQSxJQUFJLEVBQUUsWUFKMkI7QUFLakNDLEVBQUFBLEtBQUssRUFBRSxhQUwwQjtBQU1qQ0MsRUFBQUEscUJBQXFCLEVBQUUsNkJBTlU7QUFPakNDLEVBQUFBLG9CQUFvQixFQUFFLDRCQVBXO0FBUWpDQyxFQUFBQSxZQUFZLEVBQUUsb0JBUm1CO0FBU2pDQyxFQUFBQSxXQUFXLEVBQUUsbUJBVG9CO0FBVWpDQyxFQUFBQSxvQkFBb0IsRUFBRSxzQkFWVztBQVdqQ0MsRUFBQUEsV0FBVyxFQUFFLG1CQVhvQjtBQVlqQ0MsRUFBQUEsYUFBYSxFQUFFO0FBWmtCLENBQTVCOztBQWVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxlQUFlLEdB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O0FBRUEsV0FBS25CLGNBQUwsQ0FBb0JLLE1BQXBCLElBQThCLEtBQUtMLGNBQUwsQ0FBb0JLLE1BQXBCLEtBQStCLEVBQTdEO0FBQ0EsV0FBS0wsY0FBTCxDQUFvQkssTUFBcEIsRUFBNEJVLFNBQTVCLElBQ0UsS0FBS2YsY0FBTCxDQUFvQkssTUFBcEIsRUFBNEJVLFNBQTVCLEtBQTBDLENBRDVDO0FBRUEsV0FBS2YsY0FBTCxDQUFvQkssTUFBcEIsRUFBNEJVLFNBQTVCO0FBQ0Q7QUEzR0g7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtTdGF0ZVByb3BlcnR5LCBnZXRTdG9yZVNlcnZpY2V9IGZyb20gJy4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtnZXREYXRhUGFyYW1zRnJvbUF0dHJpYnV0ZXN9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2dldFZhcmlhYmxlU2VydmljZX0gZnJvbSAnLi92YXJpYWJsZS1zZXJ2aWNlJztcbmltcG9ydCB7bWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtyZWdpc3RlclNlcnZpY2VCdWlsZGVyfSBmcm9tICcuLi8uLi8uLi9zcmMvc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7dHJpZ2dlckFuYWx5dGljc0V2ZW50fSBmcm9tICcuLi8uLi8uLi9zcmMvYW5hbHl0aWNzJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IEFOQUxZVElDU19UQUdfTkFNRSA9ICdfX0FNUF9BTkFMWVRJQ1NfVEFHX05BTUVfXyc7XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IFN0b3J5QW5hbHl0aWNzRXZlbnQgPSB7XG4gIENMSUNLX1RIUk9VR0g6ICdzdG9yeS1jbGljay10aHJvdWdoJyxcbiAgRk9DVVM6ICdzdG9yeS1mb2N1cycsXG4gIExBU1RfUEFHRV9WSVNJQkxFOiAnc3RvcnktbGFzdC1wYWdlLXZpc2libGUnLFxuICBPUEVOOiAnc3Rvcnktb3BlbicsXG4gIENMT1NFOiAnc3RvcnktY2xvc2UnLFxuICBQQUdFX0FUVEFDSE1FTlRfRU5URVI6ICdzdG9yeS1wYWdlLWF0dGFjaG1lbnQtZW50ZXInLFxuICBQQUdFX0FUVEFDSE1FTlRfRVhJVDogJ3N0b3J5LXBhZ2UtYXR0YWNobWVudC1leGl0JyxcbiAgUEFHRV9WSVNJQkxFOiAnc3RvcnktcGFnZS12aXNpYmxlJyxcbiAgSU5URVJBQ1RJVkU6ICdzdG9yeS1pbnRlcmFjdGl2ZScsXG4gIFNUT1JZX0NPTlRFTlRfTE9BREVEOiAnc3RvcnktY29udGVudC1sb2FkZWQnLFxuICBTVE9SWV9NVVRFRDogJ3N0b3J5LWF1ZGlvLW11dGVkJyxcbiAgU1RPUllfVU5NVVRFRDogJ3N0b3J5LWF1ZGlvLXVubXV0ZWQnLFxufTtcblxuLyoqXG4gKiBAZW51bSB7c3RyaW5nfVxuICogTm90ZTogYXV0byBhZHZhbmNlIGFkdmFuY2VtZW50cyBzaG91bGQgYWx3YXlzIGJlIHByZWZpeGVkIHdpdGggXCJhdXRvQWR2YW5jZVwiLlxuICovXG5leHBvcnQgY29uc3QgQWR2YW5jZW1lbnRNb2RlID0ge1xuICBHT19UT19QQUdFOiAnZ29Ub1BhZ2VBY3Rpb24nLFxuICBBVVRPX0FEVkFOQ0VfVElNRTogJ2F1dG9BZHZhbmNlVGltZScsXG4gIEFVVE9fQURWQU5DRV9NRURJQTogJ2F1dG9BZHZhbmNlTWVkaWEnLFxuICBNQU5VQUxfQURWQU5DRTogJ21hbnVhbEFkdmFuY2UnLFxuICBBRFZBTkNFX1RPX0FEUzogJ21hbnVhbEFkdmFuY2VGcm9tQWQnLFxuICBWSUVXRVJfU0VMRUNUX1BBR0U6ICd2aWV3ZXJTZWxlY3RQYWdlJyxcbn07XG5cbi8qKiBAdHlwZWRlZiB7IU9iamVjdDxzdHJpbmcsICFQYWdlRXZlbnRDb3VudERlZj59ICovXG5sZXQgRXZlbnRzUGVyUGFnZURlZjtcblxuLyoqIEB0eXBlZGVmIHshT2JqZWN0PHN0cmluZywgbnVtYmVyPn0gKi9cbmxldCBQYWdlRXZlbnRDb3VudERlZjtcblxuLyoqXG4gKiBVdGlsIGZ1bmN0aW9uIHRvIHJldHJpZXZlIHRoZSBhbmFseXRpY3Mgc2VydmljZS4gRW5zdXJlcyB3ZSBjYW4gcmV0cmlldmUgdGhlXG4gKiBzZXJ2aWNlIHN5bmNocm9ub3VzbHkgZnJvbSB0aGUgYW1wLXN0b3J5IGNvZGViYXNlIHdpdGhvdXQgcnVubmluZyBpbnRvIHJhY2VcbiAqIGNvbmRpdGlvbnMuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAqIEByZXR1cm4geyFTdG9yeUFuYWx5dGljc1NlcnZpY2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBbmFseXRpY3NTZXJ2aWNlID0gKHdpbiwgZWwpID0+IHtcbiAgbGV0IHNlcnZpY2UgPSBTZXJ2aWNlcy5zdG9yeUFuYWx5dGljc1NlcnZpY2Uod2luKTtcblxuICBpZiAoIXNlcnZpY2UpIHtcbiAgICBzZXJ2aWNlID0gbmV3IFN0b3J5QW5hbHl0aWNzU2VydmljZSh3aW4sIGVsKTtcbiAgICByZWdpc3RlclNlcnZpY2VCdWlsZGVyKHdpbiwgJ3N0b3J5LWFuYWx5dGljcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBzZXJ2aWNlO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHNlcnZpY2U7XG59O1xuXG4vKipcbiAqIEludGVybWVkaWF0ZSBoYW5kbGVyIGZvciBhbXAtc3Rvcnkgc3BlY2lmaWMgYW5hbHl0aWNzLlxuICovXG5leHBvcnQgY2xhc3MgU3RvcnlBbmFseXRpY3NTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgZWxlbWVudCkge1xuICAgIC8qKiBAcHJvdGVjdGVkIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuL3ZhcmlhYmxlLXNlcnZpY2UuQW1wU3RvcnlWYXJpYWJsZVNlcnZpY2V9ICovXG4gICAgdGhpcy52YXJpYWJsZVNlcnZpY2VfID0gZ2V0VmFyaWFibGVTZXJ2aWNlKHdpbik7XG5cbiAgICAvKiogQHByaXZhdGUge0V2ZW50c1BlclBhZ2VEZWZ9ICovXG4gICAgdGhpcy5wYWdlRXZlbnRzTWFwXyA9IG1hcCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKHdpbik7XG5cbiAgICB0aGlzLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgaW5pdGlhbGl6ZUxpc3RlbmVyc18oKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lELFxuICAgICAgKHBhZ2VJZCkgPT4ge1xuICAgICAgICBjb25zdCBpc0FkID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LkFEX1NUQVRFKTtcbiAgICAgICAgaWYgKCFwYWdlSWQgfHwgaXNBZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KFN0b3J5QW5hbHl0aWNzRXZlbnQuUEFHRV9WSVNJQkxFKTtcblxuICAgICAgICBjb25zdCBwYWdlSWRzID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LlBBR0VfSURTKTtcbiAgICAgICAgY29uc3QgcGFnZUluZGV4ID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChcbiAgICAgICAgICBTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JTkRFWFxuICAgICAgICApO1xuICAgICAgICBpZiAocGFnZUluZGV4ID09PSBwYWdlSWRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChTdG9yeUFuYWx5dGljc0V2ZW50LkxBU1RfUEFHRV9WSVNJQkxFKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRydWUgLyogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshU3RvcnlBbmFseXRpY3NFdmVudH0gZXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7RWxlbWVudD19IGVsZW1lbnRcbiAgICovXG4gIHRyaWdnZXJFdmVudChldmVudFR5cGUsIGVsZW1lbnQgPSBudWxsKSB7XG4gICAgdGhpcy5pbmNyZW1lbnRQYWdlRXZlbnRDb3VudF8oZXZlbnRUeXBlKTtcblxuICAgIHRyaWdnZXJBbmFseXRpY3NFdmVudChcbiAgICAgIHRoaXMuZWxlbWVudF8sXG4gICAgICBldmVudFR5cGUsXG4gICAgICB0aGlzLnVwZGF0ZURldGFpbHMoZXZlbnRUeXBlLCBlbGVtZW50KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBldmVudCBkZXRhaWxzLlxuICAgKiBAcGFyYW0geyFTdG9yeUFuYWx5dGljc0V2ZW50fSBldmVudFR5cGVcbiAgICogQHBhcmFtIHtFbGVtZW50PX0gZWxlbWVudFxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICogQHJldHVybiB7IUpzb25PYmplY3R9fVxuICAgKi9cbiAgdXBkYXRlRGV0YWlscyhldmVudFR5cGUsIGVsZW1lbnQgPSBudWxsKSB7XG4gICAgY29uc3QgZGV0YWlscyA9IHt9O1xuICAgIGNvbnN0IHZhcnMgPSB0aGlzLnZhcmlhYmxlU2VydmljZV8uZ2V0KCk7XG4gICAgY29uc3QgcGFnZUlkID0gdmFyc1snc3RvcnlQYWdlSWQnXTtcblxuICAgIGlmICh0aGlzLnBhZ2VFdmVudHNNYXBfW3BhZ2VJZF1bZXZlbnRUeXBlXSA+IDEpIHtcbiAgICAgIGRldGFpbHMucmVwZWF0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBkZXRhaWxzLnRhZ05hbWUgPVxuICAgICAgICBlbGVtZW50W0FOQUxZVElDU19UQUdfTkFNRV0gfHwgZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICB2YXJzLFxuICAgICAgICBnZXREYXRhUGFyYW1zRnJvbUF0dHJpYnV0ZXMoXG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICAvKiBjb21wdXRlUGFyYW1OYW1lRnVuYyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgL152YXJzKC4rKS9cbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHtldmVudERldGFpbHM6IGRldGFpbHMsIC4uLnZhcnN9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBLZWVwcyBjb3VudCBvZiBudW1iZXIgb2YgZXZlbnRzIGVtaXR0ZWQgYnkgcGFnZSBmb3IgYW4gZXZlbnQgdHlwZS5cbiAgICogQHBhcmFtIHshU3RvcnlBbmFseXRpY3NFdmVudH0gZXZlbnRUeXBlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbmNyZW1lbnRQYWdlRXZlbnRDb3VudF8oZXZlbnRUeXBlKSB7XG4gICAgY29uc3QgdmFycyA9IHRoaXMudmFyaWFibGVTZXJ2aWNlXy5nZXQoKTtcbiAgICBjb25zdCBwYWdlSWQgPSB2YXJzWydzdG9yeVBhZ2VJZCddO1xuXG4gICAgdGhpcy5wYWdlRXZlbnRzTWFwX1twYWdlSWRdID0gdGhpcy5wYWdlRXZlbnRzTWFwX1twYWdlSWRdIHx8IHt9O1xuICAgIHRoaXMucGFnZUV2ZW50c01hcF9bcGFnZUlkXVtldmVudFR5cGVdID1cbiAgICAgIHRoaXMucGFnZUV2ZW50c01hcF9bcGFnZUlkXVtldmVudFR5cGVdIHx8IDA7XG4gICAgdGhpcy5wYWdlRXZlbnRzTWFwX1twYWdlSWRdW2V2ZW50VHlwZV0rKztcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/story-analytics.js