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
import { dict } from "../../../src/core/types/object";
import { registerServiceBuilder } from "../../../src/service-helpers";

/**
 * @typedef {!JsonObject}
 */
export var StoryVariableDef;

/** @enum {string} */
export var AnalyticsVariable = {
  STORY_INTERACTIVE_ID: 'storyInteractiveId',
  STORY_INTERACTIVE_RESPONSE: 'storyInteractiveResponse',
  STORY_INTERACTIVE_TYPE: 'storyInteractiveType',
  STORY_PAGE_ID: 'storyPageId',
  STORY_PAGE_INDEX: 'storyPageIndex',
  STORY_PAGE_COUNT: 'storyPageCount',
  STORY_IS_MUTED: 'storyIsMuted',
  STORY_PROGRESS: 'storyProgress',
  STORY_PREVIOUS_PAGE_ID: 'storyPreviousPageId',
  STORY_ADVANCEMENT_MODE: 'storyAdvancementMode'
};

/**
 * Util function to retrieve the variable service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param {!Window} win
 * @return {!AmpStoryVariableService}
 */
export var getVariableService = function getVariableService(win) {
  var service = Services.storyVariableService(win);

  if (!service) {
    service = new AmpStoryVariableService(win);
    registerServiceBuilder(win, 'story-variable', function () {
      return service;
    });
  }

  return service;
};

/**
 * Variable service for amp-story.
 * Used for URL replacement service. See usage in src/url-replacements-impl.
 */
export var AmpStoryVariableService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @public
   */
  function AmpStoryVariableService(win) {
    var _dict;

    _classCallCheck(this, AmpStoryVariableService);

    /** @private {!StoryVariableDef} */
    this.variables_ = dict((_dict = {}, _dict[AnalyticsVariable.STORY_INTERACTIVE_ID] = null, _dict[AnalyticsVariable.STORY_INTERACTIVE_RESPONSE] = null, _dict[AnalyticsVariable.STORY_INTERACTIVE_TYPE] = null, _dict[AnalyticsVariable.STORY_PAGE_INDEX] = null, _dict[AnalyticsVariable.STORY_PAGE_ID] = null, _dict[AnalyticsVariable.STORY_PAGE_COUNT] = null, _dict[AnalyticsVariable.STORY_PROGRESS] = null, _dict[AnalyticsVariable.STORY_IS_MUTED] = null, _dict[AnalyticsVariable.STORY_PREVIOUS_PAGE_ID] = null, _dict[AnalyticsVariable.STORY_ADVANCEMENT_MODE] = null, _dict));

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);
    this.initializeListeners_();
  }

  /** @private */
  _createClass(AmpStoryVariableService, [{
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this = this;

      this.storeService_.subscribe(StateProperty.PAGE_IDS, function (pageIds) {
        _this.variables_[AnalyticsVariable.STORY_PAGE_COUNT] = pageIds.length;
      });
      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, function (pageId) {
        if (!pageId) {
          return;
        }

        _this.variables_[AnalyticsVariable.STORY_PREVIOUS_PAGE_ID] = _this.variables_[AnalyticsVariable.STORY_PAGE_ID];
        _this.variables_[AnalyticsVariable.STORY_PAGE_ID] = pageId;

        var pageIndex =
        /** @type {number} */
        _this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX);

        _this.variables_[AnalyticsVariable.STORY_PAGE_INDEX] = pageIndex;

        var numberOfPages = _this.storeService_.get(StateProperty.PAGE_IDS).length;

        if (numberOfPages > 0) {
          if (numberOfPages === 1) {
            _this.variables_[AnalyticsVariable.STORY_PROGRESS] = 0;
          } else {
            _this.variables_[AnalyticsVariable.STORY_PROGRESS] = pageIndex / (numberOfPages - 1);
          }
        }
      }, true
      /* callToInitialize */
      );
    }
    /**
     * Updates a variable with a new value
     * @param {string} name
     * @param {*} update
     */

  }, {
    key: "onVariableUpdate",
    value: function onVariableUpdate(name, update) {
      this.variables_[name] = update;
    }
    /**
     * @return {!StoryVariableDef}
     */

  }, {
    key: "get",
    value: function get() {
      // TODO(newmius): You should probably Object.freeze this in development.
      return this.variables_;
    }
  }]);

  return AmpStoryVariableService;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhcmlhYmxlLXNlcnZpY2UuanMiXSwibmFtZXMiOlsiU2VydmljZXMiLCJTdGF0ZVByb3BlcnR5IiwiZ2V0U3RvcmVTZXJ2aWNlIiwiZGljdCIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJTdG9yeVZhcmlhYmxlRGVmIiwiQW5hbHl0aWNzVmFyaWFibGUiLCJTVE9SWV9JTlRFUkFDVElWRV9JRCIsIlNUT1JZX0lOVEVSQUNUSVZFX1JFU1BPTlNFIiwiU1RPUllfSU5URVJBQ1RJVkVfVFlQRSIsIlNUT1JZX1BBR0VfSUQiLCJTVE9SWV9QQUdFX0lOREVYIiwiU1RPUllfUEFHRV9DT1VOVCIsIlNUT1JZX0lTX01VVEVEIiwiU1RPUllfUFJPR1JFU1MiLCJTVE9SWV9QUkVWSU9VU19QQUdFX0lEIiwiU1RPUllfQURWQU5DRU1FTlRfTU9ERSIsImdldFZhcmlhYmxlU2VydmljZSIsIndpbiIsInNlcnZpY2UiLCJzdG9yeVZhcmlhYmxlU2VydmljZSIsIkFtcFN0b3J5VmFyaWFibGVTZXJ2aWNlIiwidmFyaWFibGVzXyIsInN0b3JlU2VydmljZV8iLCJpbml0aWFsaXplTGlzdGVuZXJzXyIsInN1YnNjcmliZSIsIlBBR0VfSURTIiwicGFnZUlkcyIsImxlbmd0aCIsIkNVUlJFTlRfUEFHRV9JRCIsInBhZ2VJZCIsInBhZ2VJbmRleCIsImdldCIsIkNVUlJFTlRfUEFHRV9JTkRFWCIsIm51bWJlck9mUGFnZXMiLCJuYW1lIiwidXBkYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFRQSxRQUFSO0FBQ0EsU0FBUUMsYUFBUixFQUF1QkMsZUFBdkI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsc0JBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxnQkFBSjs7QUFFUDtBQUNBLE9BQU8sSUFBTUMsaUJB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LEdBQW5CLENBQXVCL0IsYUFBYSxDQUFDZ0Msa0JBQXJDLENBREY7O0FBR0EsUUFBQSxLQUFJLENBQUNYLFVBQUwsQ0FBZ0JoQixpQkFBaUIsQ0FBQ0ssZ0JBQWxDLElBQXNEb0IsU0FBdEQ7O0FBRUEsWUFBTUcsYUFBYSxHQUFHLEtBQUksQ0FBQ1gsYUFBTCxDQUFtQlMsR0FBbkIsQ0FDcEIvQixhQUFhLENBQUN5QixRQURNLEVBRXBCRSxNQUZGOztBQUdBLFlBQUlNLGFBQWEsR0FBRyxDQUFwQixFQUF1QjtBQUNyQixjQUFJQSxhQUFhLEtBQUssQ0FBdEIsRUFBeUI7QUFDdkIsWUFBQSxLQUFJLENBQUNaLFVBQUwsQ0FBZ0JoQixpQkFBaUIsQ0FBQ1EsY0FBbEMsSUFBb0QsQ0FBcEQ7QUFDRCxXQUZELE1BRU87QUFDTCxZQUFBLEtBQUksQ0FBQ1EsVUFBTCxDQUFnQmhCLGlCQUFpQixDQUFDUSxjQUFsQyxJQUNFaUIsU0FBUyxJQUFJRyxhQUFhLEdBQUcsQ0FBcEIsQ0FEWDtBQUVEO0FBQ0Y7QUFDRixPQTVCSCxFQTZCRTtBQUFLO0FBN0JQO0FBK0JEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFyRUE7QUFBQTtBQUFBLFdBc0VFLDBCQUFpQkMsSUFBakIsRUFBdUJDLE1BQXZCLEVBQStCO0FBQzdCLFdBQUtkLFVBQUwsQ0FBZ0JhLElBQWhCLElBQXdCQyxNQUF4QjtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQTVFQTtBQUFBO0FBQUEsV0E2RUUsZUFBTTtBQUNKO0FBQ0EsYUFBTyxLQUFLZCxVQUFaO0FBQ0Q7QUFoRkg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtTdGF0ZVByb3BlcnR5LCBnZXRTdG9yZVNlcnZpY2V9IGZyb20gJy4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtyZWdpc3RlclNlcnZpY2VCdWlsZGVyfSBmcm9tICcuLi8uLi8uLi9zcmMvc2VydmljZS1oZWxwZXJzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7IUpzb25PYmplY3R9XG4gKi9cbmV4cG9ydCBsZXQgU3RvcnlWYXJpYWJsZURlZjtcblxuLyoqIEBlbnVtIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgQW5hbHl0aWNzVmFyaWFibGUgPSB7XG4gIFNUT1JZX0lOVEVSQUNUSVZFX0lEOiAnc3RvcnlJbnRlcmFjdGl2ZUlkJyxcbiAgU1RPUllfSU5URVJBQ1RJVkVfUkVTUE9OU0U6ICdzdG9yeUludGVyYWN0aXZlUmVzcG9uc2UnLFxuICBTVE9SWV9JTlRFUkFDVElWRV9UWVBFOiAnc3RvcnlJbnRlcmFjdGl2ZVR5cGUnLFxuICBTVE9SWV9QQUdFX0lEOiAnc3RvcnlQYWdlSWQnLFxuICBTVE9SWV9QQUdFX0lOREVYOiAnc3RvcnlQYWdlSW5kZXgnLFxuICBTVE9SWV9QQUdFX0NPVU5UOiAnc3RvcnlQYWdlQ291bnQnLFxuICBTVE9SWV9JU19NVVRFRDogJ3N0b3J5SXNNdXRlZCcsXG4gIFNUT1JZX1BST0dSRVNTOiAnc3RvcnlQcm9ncmVzcycsXG4gIFNUT1JZX1BSRVZJT1VTX1BBR0VfSUQ6ICdzdG9yeVByZXZpb3VzUGFnZUlkJyxcbiAgU1RPUllfQURWQU5DRU1FTlRfTU9ERTogJ3N0b3J5QWR2YW5jZW1lbnRNb2RlJyxcbn07XG5cbi8qKlxuICogVXRpbCBmdW5jdGlvbiB0byByZXRyaWV2ZSB0aGUgdmFyaWFibGUgc2VydmljZS4gRW5zdXJlcyB3ZSBjYW4gcmV0cmlldmUgdGhlXG4gKiBzZXJ2aWNlIHN5bmNocm9ub3VzbHkgZnJvbSB0aGUgYW1wLXN0b3J5IGNvZGViYXNlIHdpdGhvdXQgcnVubmluZyBpbnRvIHJhY2VcbiAqIGNvbmRpdGlvbnMuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7IUFtcFN0b3J5VmFyaWFibGVTZXJ2aWNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0VmFyaWFibGVTZXJ2aWNlID0gKHdpbikgPT4ge1xuICBsZXQgc2VydmljZSA9IFNlcnZpY2VzLnN0b3J5VmFyaWFibGVTZXJ2aWNlKHdpbik7XG5cbiAgaWYgKCFzZXJ2aWNlKSB7XG4gICAgc2VydmljZSA9IG5ldyBBbXBTdG9yeVZhcmlhYmxlU2VydmljZSh3aW4pO1xuICAgIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXIod2luLCAnc3RvcnktdmFyaWFibGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gc2VydmljZTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBzZXJ2aWNlO1xufTtcblxuLyoqXG4gKiBWYXJpYWJsZSBzZXJ2aWNlIGZvciBhbXAtc3RvcnkuXG4gKiBVc2VkIGZvciBVUkwgcmVwbGFjZW1lbnQgc2VydmljZS4gU2VlIHVzYWdlIGluIHNyYy91cmwtcmVwbGFjZW1lbnRzLWltcGwuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeVZhcmlhYmxlU2VydmljZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcHVibGljXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4pIHtcbiAgICAvKiogQHByaXZhdGUgeyFTdG9yeVZhcmlhYmxlRGVmfSAqL1xuICAgIHRoaXMudmFyaWFibGVzXyA9IGRpY3Qoe1xuICAgICAgW0FuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX0lOVEVSQUNUSVZFX0lEXTogbnVsbCxcbiAgICAgIFtBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9JTlRFUkFDVElWRV9SRVNQT05TRV06IG51bGwsXG4gICAgICBbQW5hbHl0aWNzVmFyaWFibGUuU1RPUllfSU5URVJBQ1RJVkVfVFlQRV06IG51bGwsXG4gICAgICBbQW5hbHl0aWNzVmFyaWFibGUuU1RPUllfUEFHRV9JTkRFWF06IG51bGwsXG4gICAgICBbQW5hbHl0aWNzVmFyaWFibGUuU1RPUllfUEFHRV9JRF06IG51bGwsXG4gICAgICBbQW5hbHl0aWNzVmFyaWFibGUuU1RPUllfUEFHRV9DT1VOVF06IG51bGwsXG4gICAgICBbQW5hbHl0aWNzVmFyaWFibGUuU1RPUllfUFJPR1JFU1NdOiBudWxsLFxuICAgICAgW0FuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX0lTX01VVEVEXTogbnVsbCxcbiAgICAgIFtBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9QUkVWSU9VU19QQUdFX0lEXTogbnVsbCxcbiAgICAgIFtBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9BRFZBTkNFTUVOVF9NT0RFXTogbnVsbCxcbiAgICB9KTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh3aW4pO1xuXG4gICAgdGhpcy5pbml0aWFsaXplTGlzdGVuZXJzXygpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGluaXRpYWxpemVMaXN0ZW5lcnNfKCkge1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoU3RhdGVQcm9wZXJ0eS5QQUdFX0lEUywgKHBhZ2VJZHMpID0+IHtcbiAgICAgIHRoaXMudmFyaWFibGVzX1tBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9QQUdFX0NPVU5UXSA9IHBhZ2VJZHMubGVuZ3RoO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lELFxuICAgICAgKHBhZ2VJZCkgPT4ge1xuICAgICAgICBpZiAoIXBhZ2VJZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmFyaWFibGVzX1tBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9QUkVWSU9VU19QQUdFX0lEXSA9XG4gICAgICAgICAgdGhpcy52YXJpYWJsZXNfW0FuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX1BBR0VfSURdO1xuXG4gICAgICAgIHRoaXMudmFyaWFibGVzX1tBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9QQUdFX0lEXSA9IHBhZ2VJZDtcblxuICAgICAgICBjb25zdCBwYWdlSW5kZXggPSAvKiogQHR5cGUge251bWJlcn0gKi8gKFxuICAgICAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5DVVJSRU5UX1BBR0VfSU5ERVgpXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMudmFyaWFibGVzX1tBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9QQUdFX0lOREVYXSA9IHBhZ2VJbmRleDtcblxuICAgICAgICBjb25zdCBudW1iZXJPZlBhZ2VzID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChcbiAgICAgICAgICBTdGF0ZVByb3BlcnR5LlBBR0VfSURTXG4gICAgICAgICkubGVuZ3RoO1xuICAgICAgICBpZiAobnVtYmVyT2ZQYWdlcyA+IDApIHtcbiAgICAgICAgICBpZiAobnVtYmVyT2ZQYWdlcyA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy52YXJpYWJsZXNfW0FuYWx5dGljc1ZhcmlhYmxlLlNUT1JZX1BST0dSRVNTXSA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmFyaWFibGVzX1tBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9QUk9HUkVTU10gPVxuICAgICAgICAgICAgICBwYWdlSW5kZXggLyAobnVtYmVyT2ZQYWdlcyAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRydWUgLyogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBhIHZhcmlhYmxlIHdpdGggYSBuZXcgdmFsdWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHsqfSB1cGRhdGVcbiAgICovXG4gIG9uVmFyaWFibGVVcGRhdGUobmFtZSwgdXBkYXRlKSB7XG4gICAgdGhpcy52YXJpYWJsZXNfW25hbWVdID0gdXBkYXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFTdG9yeVZhcmlhYmxlRGVmfVxuICAgKi9cbiAgZ2V0KCkge1xuICAgIC8vIFRPRE8obmV3bWl1cyk6IFlvdSBzaG91bGQgcHJvYmFibHkgT2JqZWN0LmZyZWV6ZSB0aGlzIGluIGRldmVsb3BtZW50LlxuICAgIHJldHVybiB0aGlzLnZhcmlhYmxlc187XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/variable-service.js