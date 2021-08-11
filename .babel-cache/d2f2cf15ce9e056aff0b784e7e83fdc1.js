function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  STORY_ADVANCEMENT_MODE: 'storyAdvancementMode' };


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
  function AmpStoryVariableService(win) {var _dict;_classCallCheck(this, AmpStoryVariableService);
    /** @private {!StoryVariableDef} */
    this.variables_ = dict((_dict = {}, _defineProperty(_dict,
    AnalyticsVariable.STORY_INTERACTIVE_ID, null), _defineProperty(_dict,
    AnalyticsVariable.STORY_INTERACTIVE_RESPONSE, null), _defineProperty(_dict,
    AnalyticsVariable.STORY_INTERACTIVE_TYPE, null), _defineProperty(_dict,
    AnalyticsVariable.STORY_PAGE_INDEX, null), _defineProperty(_dict,
    AnalyticsVariable.STORY_PAGE_ID, null), _defineProperty(_dict,
    AnalyticsVariable.STORY_PAGE_COUNT, null), _defineProperty(_dict,
    AnalyticsVariable.STORY_PROGRESS, null), _defineProperty(_dict,
    AnalyticsVariable.STORY_IS_MUTED, null), _defineProperty(_dict,
    AnalyticsVariable.STORY_PREVIOUS_PAGE_ID, null), _defineProperty(_dict,
    AnalyticsVariable.STORY_ADVANCEMENT_MODE, null), _dict));


    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    this.initializeListeners_();
  }

  /** @private */_createClass(AmpStoryVariableService, [{ key: "initializeListeners_", value:
    function initializeListeners_() {var _this = this;
      this.storeService_.subscribe(StateProperty.PAGE_IDS, function (pageIds) {
        _this.variables_[AnalyticsVariable.STORY_PAGE_COUNT] = pageIds.length;
      });

      this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      function (pageId) {
        if (!pageId) {
          return;
        }

        _this.variables_[AnalyticsVariable.STORY_PREVIOUS_PAGE_ID] =
        _this.variables_[AnalyticsVariable.STORY_PAGE_ID];

        _this.variables_[AnalyticsVariable.STORY_PAGE_ID] = pageId;

        var pageIndex = /** @type {number} */(
        _this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX));

        _this.variables_[AnalyticsVariable.STORY_PAGE_INDEX] = pageIndex;

        var numberOfPages = _this.storeService_.get(
        StateProperty.PAGE_IDS).
        length;
        if (numberOfPages > 0) {
          if (numberOfPages === 1) {
            _this.variables_[AnalyticsVariable.STORY_PROGRESS] = 0;
          } else {
            _this.variables_[AnalyticsVariable.STORY_PROGRESS] =
            pageIndex / (numberOfPages - 1);
          }
        }
      },
      true /* callToInitialize */);

    }

    /**
     * Updates a variable with a new value
     * @param {string} name
     * @param {*} update
     */ }, { key: "onVariableUpdate", value:
    function onVariableUpdate(name, update) {
      this.variables_[name] = update;
    }

    /**
     * @return {!StoryVariableDef}
     */ }, { key: "get", value:
    function get() {
      // TODO(newmius): You should probably Object.freeze this in development.
      return this.variables_;
    } }]);return AmpStoryVariableService;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/variable-service.js