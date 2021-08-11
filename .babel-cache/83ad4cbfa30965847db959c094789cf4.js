var _template = ["<div class=\"i-amphtml-story-share-menu i-amphtml-story-system-reset\" aria-hidden=true role=alert><div class=i-amphtml-story-share-menu-container><button class=i-amphtml-story-share-menu-close-button aria-label=close role=button>&times;</button></div></div>"],_template2 = ["<amp-social-share type=system></amp-social-share>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import {
ANALYTICS_TAG_NAME,
StoryAnalyticsEvent,
getAnalyticsService } from "./story-analytics";

import {
Action,
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

import { CSS } from "../../../build/amp-story-share-menu-1.0.css";
import { Keys } from "../../../src/core/constants/key-codes";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { ShareWidget } from "./amp-story-share";
import { closest } from "../../../src/core/dom/query";
import { createShadowRootWithStyle } from "./utils";
import { dev, devAssert } from "../../../src/log";
import { getAmpdoc } from "../../../src/service-helpers";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor } from "../../../src/core/dom/static-template";
import { setStyles } from "../../../src/core/dom/style";

/** @const {string} Class to toggle the share menu. */
export var VISIBLE_CLASS = 'i-amphtml-story-share-menu-visible';

/**
 * Quick share template, used as a fallback if native sharing is not supported.
 * @param {!Element} element
 * @return {!Element}
 */
var getTemplate = function getTemplate(element) {
  return htmlFor(element)(_template);







};

/**
 * System amp-social-share button template.
 * @param {!Element} element
 * @return {!Element}
 */
var getAmpSocialSystemShareTemplate = function getAmpSocialSystemShareTemplate(element) {
  return htmlFor(element)(_template2);
};

/**
 * Share menu UI.
 */
export var ShareMenu = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl Element where to append the component
   */
  function ShareMenu(win, storyEl) {_classCallCheck(this, ShareMenu);
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?Element} */
    this.closeButton_ = null;

    /** @private {?Element} */
    this.innerContainerEl_ = null;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {boolean} */
    this.isSystemShareSupported_ = false;

    /** @private @const {!ShareWidget} */
    this.shareWidget_ = ShareWidget.create(this.win_, storyEl);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, storyEl);

    /** @private @const {!Element} */
    this.parentEl_ = storyEl;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);
  }

  /**
   * Builds and appends the component in the story. Could build either the
   * amp-social-share button to display the native system sharing, or a fallback
   * UI.
   */_createClass(ShareMenu, [{ key: "build", value:
    function build() {
      if (this.isBuilt()) {
        return;
      }

      this.isBuilt_ = true;

      this.isSystemShareSupported_ = this.shareWidget_.isSystemShareSupported(
      getAmpdoc(this.parentEl_));


      this.isSystemShareSupported_ ?
      this.buildForSystemSharing_() :
      this.buildForFallbackSharing_();
    }

    /**
     * Whether the element has been built.
     * @return {boolean}
     */ }, { key: "isBuilt", value:
    function isBuilt() {
      return this.isBuilt_;
    }

    /**
     * Builds a hidden amp-social-share button that triggers the native system
     * sharing UI.
     * @private
     */ }, { key: "buildForSystemSharing_", value:
    function buildForSystemSharing_() {var _this = this;
      this.shareWidget_.loadRequiredExtensions(getAmpdoc(this.parentEl_));
      this.element_ = getAmpSocialSystemShareTemplate(this.parentEl_);

      this.initializeListeners_();

      this.vsync_.mutate(function () {
        setStyles( /** @type {!Element} */(_this.element_), {
          'visibility': 'hidden',
          'pointer-events': 'none',
          'z-index': -1 });

        _this.parentEl_.appendChild(_this.element_);
      });
    }

    /**
     * Builds and appends the fallback UI.
     * @private
     */ }, { key: "buildForFallbackSharing_", value:
    function buildForFallbackSharing_() {var _this2 = this;
      var root = this.win_.document.createElement('div');
      root.classList.add('i-amphtml-story-share-menu-host');

      this.element_ = getTemplate(this.parentEl_);
      createShadowRootWithStyle(root, this.element_, CSS);

      this.closeButton_ = /** @type {!Element} */(
      this.element_.querySelector('.i-amphtml-story-share-menu-close-button'));

      var localizationService = getLocalizationService(
      devAssert(this.parentEl_));

      if (localizationService) {
        var localizedCloseString = localizationService.getLocalizedString(
        LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL);

        this.closeButton_.setAttribute('aria-label', localizedCloseString);
      }

      this.initializeListeners_();

      this.vsync_.run({
        measure: function measure() {
          _this2.innerContainerEl_ = _this2.element_. /*OK*/querySelector(
          '.i-amphtml-story-share-menu-container');

        },
        mutate: function mutate() {
          _this2.parentEl_.appendChild(root);
          // Preloads and renders the share widget content.
          var shareWidget = _this2.shareWidget_.build(getAmpdoc(_this2.parentEl_));
          _this2.innerContainerEl_.appendChild(shareWidget);
        } });

    }

    /**
     * @private
     */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this3 = this;
      this.storeService_.subscribe(
      StateProperty.UI_STATE,
      function (uiState) {
        _this3.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(StateProperty.SHARE_MENU_STATE, function (isOpen) {
        _this3.onShareMenuStateUpdate_(isOpen);
      });

      // Don't listen to click events if the system share is supported, since the
      // native layer handles all the UI interactions.
      if (!this.isSystemShareSupported_) {
        this.element_.addEventListener('click', function (event) {return (
            _this3.onShareMenuClick_(event));});


        this.win_.addEventListener('keyup', function (event) {
          if (event.key == Keys.ESCAPE) {
            event.preventDefault();
            _this3.close_();
          }
        });
      }
    }

    /**
     * Reacts to menu state updates and decides whether to show either the native
     * system sharing, or the fallback UI.
     * @param {boolean} isOpen
     * @private
     */ }, { key: "onShareMenuStateUpdate_", value:
    function onShareMenuStateUpdate_(isOpen) {var _this4 = this;
      if (this.isSystemShareSupported_ && isOpen) {
        // Dispatches a click event on the amp-social-share button to trigger the
        // native system sharing UI. This has to be done upon user interaction.
        this.element_.dispatchEvent(new Event('click'));

        // There is no way to know when the user dismisses the native system share
        // menu, so we pretend it is closed on the story end, and let the native
        // end handle the UI interactions.
        this.close_();
      }

      if (!this.isSystemShareSupported_) {
        this.vsync_.mutate(function () {
          _this4.element_.classList.toggle(VISIBLE_CLASS, isOpen);
          _this4.element_.setAttribute('aria-hidden', !isOpen);
        });
      }
      this.element_[ANALYTICS_TAG_NAME] = 'amp-story-share-menu';
      this.analyticsService_.triggerEvent(
      isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
      this.element_);

    }

    /**
     * Handles click events and maybe closes the menu for the fallback UI.
     * @param  {!Event} event
     */ }, { key: "onShareMenuClick_", value:
    function onShareMenuClick_(event) {var _this5 = this;
      var el = /** @type {!Element} */(event.target);

      if (el === this.closeButton_) {
        this.close_();
      }

      // Closes the menu if click happened outside of the menu main container.
      if (!closest(el, function (el) {return el === _this5.innerContainerEl_;}, this.element_)) {
        this.close_();
      }
    }

    /**
     * Reacts to UI state updates and triggers the right UI.
     * @param {!UIType} uiState
     * @private
     */ }, { key: "onUIStateUpdate_", value:
    function onUIStateUpdate_(uiState) {var _this6 = this;
      this.vsync_.mutate(function () {
        uiState !== UIType.MOBILE ?
        _this6.element_.setAttribute('desktop', '') :
        _this6.element_.removeAttribute('desktop');
      });
    }

    /**
     * Closes the share menu.
     * @private
     */ }, { key: "close_", value:
    function close_() {
      this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
    } }]);return ShareMenu;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-share-menu.js