var _template = ["<div class=\"i-amphtml-story-no-rotation-overlay i-amphtml-story-system-reset\"><div class=i-amphtml-overlay-container><div class=i-amphtml-story-overlay-icon></div><div class=i-amphtml-story-overlay-text></div></div></div>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import { CSS } from "../../../build/amp-story-viewport-warning-layer-1.0.css";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import {
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

import { createShadowRootWithStyle } from "./utils";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor } from "../../../src/core/dom/static-template";
import { listen } from "../../../src/event-helper";
import { throttle } from "../../../src/core/types/function";

/**
 * CSS class indicating the format is landscape.
 * @const {string}
 */
var LANDSCAPE_OVERLAY_CLASS = 'i-amphtml-story-landscape';

/** @const {number} */
var RESIZE_THROTTLE_MS = 300;

/**
 * Viewport warning layer template.
 * @param {!Element} element
 * @return {!Element}
 */
var getTemplate = function getTemplate(element) {
  return htmlFor(element)(_template);








};

/**
 * Viewport warning layer UI.
 */
export var ViewportWarningLayer = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement Element where to append the component
   * @param {number} desktopWidthThreshold Threshold in px.
   * @param {number} desktopHeightThreshold Threshold in px.
   */
  function ViewportWarningLayer(
  win,
  storyElement,
  desktopWidthThreshold,
  desktopHeightThreshold)
  {_classCallCheck(this, ViewportWarningLayer);
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {number} */
    this.desktopHeightThreshold_ = desktopHeightThreshold;

    /** @private {number} */
    this.desktopWidthThreshold_ = desktopWidthThreshold;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @private {?Element} */
    this.overlayEl_ = null;

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win_);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @private {?Function} */
    this.unlistenResizeEvents_ = null;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    this.initializeListeners_();
  }

  /**
   * Builds and appends the component in the story.
   */_createClass(ViewportWarningLayer, [{ key: "build", value:
    function build() {var _this = this;
      if (this.isBuilt()) {
        return;
      }

      this.overlayEl_ = this.getViewportWarningOverlayTemplate_();
      this.localizationService_ = getLocalizationService(this.storyElement_);

      this.isBuilt_ = true;
      var root = this.win_.document.createElement('div');

      createShadowRootWithStyle(root, this.overlayEl_, CSS);

      // Initializes the UI state now that the component is built.
      this.onUIStateUpdate_(
      /** @type {!UIType} */(
      this.storeService_.get(StateProperty.UI_STATE)));


      this.vsync_.mutate(function () {
        _this.storyElement_.insertBefore(root, _this.storyElement_.firstChild);
      });
    }

    /**
     * Whether the element has been built.
     * @return {boolean}
     */ }, { key: "isBuilt", value:
    function isBuilt() {
      return this.isBuilt_;
    }

    /**
     * @private
     */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this2 = this;
      this.storeService_.subscribe(
      StateProperty.UI_STATE,
      function (uiState) {
        _this2.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.VIEWPORT_WARNING_STATE,
      function (viewportWarningState) {
        _this2.onViewportWarningStateUpdate_(viewportWarningState);
      },
      true /** callToInitialize */);

    }

    /**
     * Reacts to the viewport warning state update, only on mobile.
     * @param {boolean} viewportWarningState
     * @private
     */ }, { key: "onViewportWarningStateUpdate_", value:
    function onViewportWarningStateUpdate_(viewportWarningState) {var _this3 = this;
      var isMobile =
      this.storeService_.get(StateProperty.UI_STATE) === UIType.MOBILE;

      // Adds the landscape class if we are mobile landscape.
      var shouldShowLandscapeOverlay = isMobile && viewportWarningState;

      // Don't build the layer until we need to display it.
      if (!shouldShowLandscapeOverlay && !this.isBuilt()) {
        return;
      }

      this.build();

      // Listen to resize events to update the UI message.
      if (viewportWarningState) {
        var resizeThrottle = throttle(
        this.win_,
        function () {return _this3.onResize_();},
        RESIZE_THROTTLE_MS);

        this.unlistenResizeEvents_ = listen(this.win_, 'resize', resizeThrottle);
      } else if (this.unlistenResizeEvents_) {
        this.unlistenResizeEvents_();
        this.unlistenResizeEvents_ = null;
      }

      this.updateTextContent_();

      this.vsync_.mutate(function () {
        _this3.overlayEl_.classList.toggle(
        LANDSCAPE_OVERLAY_CLASS,
        shouldShowLandscapeOverlay);

      });
    }

    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @private
     */ }, { key: "onUIStateUpdate_", value:
    function onUIStateUpdate_(uiState) {var _this4 = this;
      if (!this.isBuilt()) {
        return;
      }

      this.vsync_.mutate(function () {
        uiState === UIType.DESKTOP_PANELS ?
        _this4.overlayEl_.setAttribute('desktop', '') :
        _this4.overlayEl_.removeAttribute('desktop');
      });
    }

    /**
     * @private
     */ }, { key: "onResize_", value:
    function onResize_() {
      this.updateTextContent_();
    }

    /**
     * Returns the overlay corresponding to the device currently used.
     * @return {!Element} template
     * @private
     */ }, { key: "getViewportWarningOverlayTemplate_", value:
    function getViewportWarningOverlayTemplate_() {
      var template = getTemplate(this.storyElement_);
      var iconEl = template.querySelector('.i-amphtml-story-overlay-icon');

      if (this.platform_.isIos() || this.platform_.isAndroid()) {
        iconEl.classList.add('i-amphtml-rotate-icon');
        return template;
      }

      iconEl.classList.add('i-amphtml-desktop-size-icon');
      return template;
    }

    /**
     * Updates the UI message displayed to the user.
     * @private
     */ }, { key: "updateTextContent_", value:
    function updateTextContent_() {var _this5 = this;
      var textEl = this.overlayEl_.querySelector(
      '.i-amphtml-story-overlay-text');

      var textContent;

      this.vsync_.run({
        measure: function measure() {
          textContent = _this5.getTextContent_();
        },
        mutate: function mutate() {
          if (!textContent) {
            return;
          }

          textEl.textContent = textContent;
        } });

    }

    /**
     * Gets the localized message to display, depending on the viewport size. Has
     * to run during a measure phase.
     * @return {?string}
     * @private
     */ }, { key: "getTextContent_", value:
    function getTextContent_() {
      if (this.platform_.isIos() || this.platform_.isAndroid()) {
        return this.localizationService_.getLocalizedString(
        LocalizedStringId.AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT);

      }

      var viewportHeight = this.win_. /*OK*/innerHeight;
      var viewportWidth = this.win_. /*OK*/innerWidth;

      if (
      viewportHeight < this.desktopHeightThreshold_ &&
      viewportWidth < this.desktopWidthThreshold_)
      {
        return this.localizationService_.getLocalizedString(
        LocalizedStringId.AMP_STORY_WARNING_DESKTOP_SIZE_TEXT);

      }

      if (viewportWidth < this.desktopWidthThreshold_) {
        return this.localizationService_.getLocalizedString(
        LocalizedStringId.AMP_STORY_WARNING_DESKTOP_WIDTH_SIZE_TEXT);

      }

      if (viewportHeight < this.desktopHeightThreshold_) {
        return this.localizationService_.getLocalizedString(
        LocalizedStringId.AMP_STORY_WARNING_DESKTOP_HEIGHT_SIZE_TEXT);

      }

      return null;
    } }]);return ViewportWarningLayer;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-viewport-warning-layer.js