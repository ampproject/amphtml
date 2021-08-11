var _template = ["<div class=i-amphtml-story-button-container><button class=i-amphtml-story-button-move></button></div>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
import {
Action,
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

import { AdvancementMode } from "./story-analytics";
import { EventType, dispatch } from "./events";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { dev, devAssert } from "../../../src/log";

import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor } from "../../../src/core/dom/static-template";

/** @struct @typedef {{className: string, triggers: (string|undefined)}} */
var ButtonState_1_0_Def; // eslint-disable-line google-camelcase/google-camelcase

/** @const {!Object<string, !ButtonState_1_0_Def>} */
var BackButtonStates = {
  HIDDEN: { className: 'i-amphtml-story-button-hidden' },
  PREVIOUS_PAGE: {
    className: 'i-amphtml-story-back-prev',
    triggers: EventType.PREVIOUS_PAGE,
    label: LocalizedStringId.AMP_STORY_PREVIOUS_PAGE } };



/** @const {!Object<string, !ButtonState_1_0_Def>} */
var ForwardButtonStates = {
  HIDDEN: { className: 'i-amphtml-story-button-hidden' },
  NEXT_PAGE: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
    label: LocalizedStringId.AMP_STORY_NEXT_PAGE },

  NEXT_STORY: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
    label: LocalizedStringId.AMP_STORY_NEXT_STORY },

  REPLAY: {
    className: 'i-amphtml-story-fwd-replay',
    triggers: EventType.REPLAY,
    label: LocalizedStringId.AMP_STORY_REPLAY } };



/**
 * @param {!Element} element
 * @return {!Element}
 */
var buildPaginationButton = function buildPaginationButton(element) {return (
    htmlFor(element)(_template));};




/**
 * @param {!Element} hoverEl
 * @param {!Element} targetEl
 * @param {string} className
 * @return {?Array<function(!Event)>}
 */
function setClassOnHover(hoverEl, targetEl, className) {
  var enterListener = function enterListener() {return targetEl.classList.add(className);};
  var exitListener = function exitListener() {return targetEl.classList.remove(className);};
  hoverEl.addEventListener('mouseenter', enterListener);
  hoverEl.addEventListener('mouseleave', exitListener);
  return [enterListener, exitListener];
}

/**
 * Desktop navigation buttons.
 */var
PaginationButton = /*#__PURE__*/function () {
  /**
   * @param {!Document} doc
   * @param {!ButtonState_1_0_Def} initialState
   * @param {!./amp-story-store-service.AmpStoryStoreService} storeService
   * @param {!Window} win
   */
  function PaginationButton(doc, initialState, storeService, win) {var _this = this;_classCallCheck(this, PaginationButton);
    /** @private {!ButtonState_1_0_Def} */
    this.state_ = initialState;

    /** @public @const {!Element} */
    this.element = buildPaginationButton(doc);

    /** @private @const {!Element} */
    this.buttonElement_ = /** @type {!Element} */(
    this.element.querySelector('button'));


    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = getLocalizationService(doc);

    this.element.classList.add(initialState.className);
    initialState.label &&
    this.buttonElement_.setAttribute(
    'aria-label',
    this.localizationService_.getLocalizedString(initialState.label));

    this.element.addEventListener('click', function (e) {return _this.onClick_(e);});

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private @const {!Window} */
    this.win_ = win;
  }

  /** @param {!ButtonState_1_0_Def} state */_createClass(PaginationButton, [{ key: "updateState", value:
    function updateState(state) {
      if (state === this.state_) {
        return;
      }
      this.element.classList.remove(this.state_.className);
      this.element.classList.add(state.className);
      state.label ?
      this.buttonElement_.setAttribute(
      'aria-label',
      this.localizationService_.getLocalizedString(state.label)) :

      this.buttonElement_.removeAttribute('aria-label');

      this.state_ = state;
    }

    /**
     * @return {!ButtonState_1_0_Def}
     */ }, { key: "getState", value:
    function getState() {
      return this.state_;
    }

    /**
     * @param {!Event} e
     * @private
     */ }, { key: "onClick_", value:
    function onClick_(e) {
      e.preventDefault();

      this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE);


      if (this.state_.triggers) {
        dispatch(
        this.win_,
        this.element,
        devAssert(this.state_.triggers),
        /* payload */undefined,
        { bubbles: true });

        return;
      }
      if (this.state_.action) {
        this.storeService_.dispatch(this.state_.action, this.state_.data);
        return;
      }
    } }]);return PaginationButton;}();


/** Pagination buttons layer. */
export var PaginationButtons = /*#__PURE__*/function () {
  /**
   * @param {!./amp-story.AmpStory} ampStory
   */
  function PaginationButtons(ampStory) {_classCallCheck(this, PaginationButtons);
    /** @private @const {!./amp-story.AmpStory} */
    this.ampStory_ = ampStory;

    var win = this.ampStory_.win;
    var doc = win.document;
    this.storeService_ = getStoreService(win);

    /** @private @const {!PaginationButton} */
    this.forwardButton_ = new PaginationButton(
    doc,
    ForwardButtonStates.NEXT_PAGE,
    this.storeService_,
    win);


    /** @private @const {!PaginationButton} */
    this.backButton_ = new PaginationButton(
    doc,
    BackButtonStates.HIDDEN,
    this.storeService_,
    win);


    this.forwardButton_.element.classList.add('next-container');
    this.backButton_.element.classList.add('prev-container');

    /** @private {?ButtonState_1_0_Def} */
    this.backButtonStateToRestore_ = null;

    /** @private {?ButtonState_1_0_Def} */
    this.forwardButtonStateToRestore_ = null;

    /** @private {?Array<function(!Event)>} */
    this.hoverListeners_ = null;

    this.initializeListeners_();

    this.ampStory_.element.appendChild(this.forwardButton_.element);
    this.ampStory_.element.appendChild(this.backButton_.element);
  }

  /** @private */_createClass(PaginationButtons, [{ key: "addHoverListeners_", value:
    function addHoverListeners_() {
      if (this.hoverListeners_) {
        return;
      }

      var forwardButtonListeners = setClassOnHover(
      this.forwardButton_.element,
      this.ampStory_.element,
      'i-amphtml-story-next-hover');


      var backButtonListeners = setClassOnHover(
      this.backButton_.element,
      this.ampStory_.element,
      'i-amphtml-story-prev-hover');


      this.hoverListeners_ = forwardButtonListeners.concat(backButtonListeners);
    }

    /** @private */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this2 = this;
      this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      function (pageIndex) {
        _this2.onCurrentPageIndexUpdate_(pageIndex);
      });


      this.storeService_.subscribe(
      StateProperty.PAGE_IDS,
      function () {
        var currentPageIndex = Number(
        _this2.storeService_.get(StateProperty.CURRENT_PAGE_INDEX));

        _this2.onCurrentPageIndexUpdate_(currentPageIndex);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
      function (isVisible) {
        _this2.onSystemUiIsVisibleStateUpdate_(isVisible);
      });


      this.storeService_.subscribe(
      StateProperty.UI_STATE,
      function (uiState) {
        _this2.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */);

    }

    /**
     * @param {number} pageIndex
     * @private
     */ }, { key: "onCurrentPageIndexUpdate_", value:
    function onCurrentPageIndexUpdate_(pageIndex) {
      var totalPages = this.storeService_.get(StateProperty.PAGE_IDS).length;

      if (pageIndex === 0) {
        this.backButton_.updateState(BackButtonStates.HIDDEN);
      }

      if (pageIndex > 0) {
        this.backButton_.updateState(BackButtonStates.PREVIOUS_PAGE);
      }

      if (pageIndex < totalPages - 1) {
        this.forwardButton_.updateState(ForwardButtonStates.NEXT_PAGE);
      }

      if (pageIndex === totalPages - 1) {
        var viewer = Services.viewerForDoc(this.ampStory_.element);
        if (viewer.hasCapability('swipe')) {
          this.forwardButton_.updateState(ForwardButtonStates.NEXT_STORY);
        } else {
          this.forwardButton_.updateState(ForwardButtonStates.REPLAY);
        }
      }
    }

    /**
     * Reacts to system UI visibility state updates.
     * @param {boolean} isVisible
     * @private
     */ }, { key: "onSystemUiIsVisibleStateUpdate_", value:
    function onSystemUiIsVisibleStateUpdate_(isVisible) {
      if (isVisible) {
        this.backButton_.updateState(
        /** @type {!ButtonState_1_0_Def} */(
        devAssert(this.backButtonStateToRestore_)));


        this.forwardButton_.updateState(
        /** @type {!ButtonState_1_0_Def} */(
        devAssert(this.forwardButtonStateToRestore_)));


      } else {
        this.backButtonStateToRestore_ = this.backButton_.getState();
        this.backButton_.updateState(BackButtonStates.HIDDEN);
        this.forwardButtonStateToRestore_ = this.forwardButton_.getState();
        this.forwardButton_.updateState(ForwardButtonStates.HIDDEN);
      }
    }

    /**
     * Reacts to UI state updates.
     * @param {!UIType} uiState
     * @private
     */ }, { key: "onUIStateUpdate_", value:
    function onUIStateUpdate_(uiState) {
      if (
      uiState === UIType.DESKTOP_PANELS ||
      uiState === UIType.DESKTOP_FULLBLEED)
      {
        this.addHoverListeners_();
      }
    } }]);return PaginationButtons;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/pagination-buttons.js