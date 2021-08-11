function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import { dict } from "../../../src/core/types/object";
import { getUniqueId } from "./utils";
import { triggerAnalyticsEvent } from "../../../src/analytics";

/** @const {string} */
export var STORY_AD_ANALYTICS = 'story-ad-analytics';

/** @enum {string} */
export var AnalyticsEvents = {
  AD_REQUESTED: 'story-ad-request',
  AD_LOADED: 'story-ad-load',
  AD_INSERTED: 'story-ad-insert',
  AD_VIEWED: 'story-ad-view',
  AD_SWIPED: 'story-ad-swipe',
  AD_CLICKED: 'story-ad-click',
  AD_EXITED: 'story-ad-exit',
  AD_DISCARDED: 'story-ad-discard' };


/** @enum {string} */
export var AnalyticsVars = {
  // Timestamp when ad is requested.
  AD_REQUESTED: 'requestTime',
  // Timestamp when ad emits `INI_LOAD` signal.
  AD_LOADED: 'loadTime',
  // Timestamp when ad is inserted into story as page after next.
  AD_INSERTED: 'insertTime',
  // Timestamp when page becomes active page.
  AD_VIEWED: 'viewTime',
  // Timestamp when ad page detects swipe event.
  AD_SWIPED: 'swipeTime',
  // Timestamp when ad is clicked.
  AD_CLICKED: 'clickTime',
  // Timestamp when ad page moves from active => inactive.
  AD_EXITED: 'exitTime',
  // Timestamp when ad is discared due to bad metadata etc.
  AD_DISCARDED: 'discardTime',
  // Index of the ad generating the trigger.
  AD_INDEX: 'adIndex',
  // Id that should be unique for every ad.
  AD_UNIQUE_ID: 'adUniqueId',
  // Position in the parent story. Number of page before ad + 1. Does not count
  // previously inserted ad pages.
  POSITION: 'position',
  // Given cta-type of inserted ad.
  CTA_TYPE: 'ctaType' };


export var StoryAdAnalytics = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function StoryAdAnalytics(ampdoc) {_classCallCheck(this, StoryAdAnalytics);
    /** @const @private {!Window} */
    this.win_ = ampdoc.win;
    /** @const @private {!Object<number, JsonObject>} */
    this.data_ = {};
  }

  /**
   * Construct an analytics event and trigger it.
   * @param {!Element} element amp-story-page element containing ad.
   * @param {number} adIndex
   * @param {string} eventType
   * @param {!Object<string, number>} vars A map of vars and their values.
   */_createClass(StoryAdAnalytics, [{ key: "fireEvent", value:
    function fireEvent(element, adIndex, eventType, vars) {
      this.ensurePageTrackingInitialized_(adIndex);
      Object.assign( /** @type {!Object} */(this.data_[adIndex]), vars);
      triggerAnalyticsEvent(
      element,
      eventType,
      /** @type {!JsonObject} */(this.data_[adIndex]));

    }

    /**`
     * Adds a variable for a specific ad that can be used in all subsequent triggers.
     * @param {number} adIndex
     * @param {string} varName
     * @param {*} value
     */ }, { key: "setVar", value:
    function setVar(adIndex, varName, value) {
      this.ensurePageTrackingInitialized_(adIndex);
      this.data_[adIndex][varName] = value;
    }

    /**
     * Creates a tracking object for each page if non-existant.
     * @param {number} adIndex
     */ }, { key: "ensurePageTrackingInitialized_", value:
    function ensurePageTrackingInitialized_(adIndex) {
      if (!this.data_[adIndex]) {var _dict;
        this.data_[adIndex] = dict((_dict = {}, _defineProperty(_dict,
        AnalyticsVars.AD_INDEX, adIndex), _defineProperty(_dict,
        AnalyticsVars.AD_UNIQUE_ID, getUniqueId(this.win_)), _dict));

      }
    } }]);return StoryAdAnalytics;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-analytics.js