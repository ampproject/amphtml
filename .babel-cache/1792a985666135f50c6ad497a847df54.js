var _templateObject;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

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
import { Action, StateProperty, UIType, getStoreService } from "./amp-story-store-service";
import { AdvancementMode } from "./story-analytics";
import { EventType, dispatch } from "./events";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { dev, devAssert } from "../../../src/log";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor } from "../../../src/core/dom/static-template";

/** @struct @typedef {{className: string, triggers: (string|undefined)}} */
var ButtonState_1_0_Def;
// eslint-disable-line google-camelcase/google-camelcase

/** @const {!Object<string, !ButtonState_1_0_Def>} */
var BackButtonStates = {
  HIDDEN: {
    className: 'i-amphtml-story-button-hidden'
  },
  PREVIOUS_PAGE: {
    className: 'i-amphtml-story-back-prev',
    triggers: EventType.PREVIOUS_PAGE,
    label: LocalizedStringId.AMP_STORY_PREVIOUS_PAGE
  }
};

/** @const {!Object<string, !ButtonState_1_0_Def>} */
var ForwardButtonStates = {
  HIDDEN: {
    className: 'i-amphtml-story-button-hidden'
  },
  NEXT_PAGE: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
    label: LocalizedStringId.AMP_STORY_NEXT_PAGE
  },
  NEXT_STORY: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
    label: LocalizedStringId.AMP_STORY_NEXT_STORY
  },
  REPLAY: {
    className: 'i-amphtml-story-fwd-replay',
    triggers: EventType.REPLAY,
    label: LocalizedStringId.AMP_STORY_REPLAY
  }
};

/**
 * @param {!Element} element
 * @return {!Element}
 */
var buildPaginationButton = function buildPaginationButton(element) {
  return htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-story-button-container\">\n        <button class=\"i-amphtml-story-button-move\"></button>\n      </div>"])));
};

/**
 * @param {!Element} hoverEl
 * @param {!Element} targetEl
 * @param {string} className
 * @return {?Array<function(!Event)>}
 */
function setClassOnHover(hoverEl, targetEl, className) {
  var enterListener = function enterListener() {
    return targetEl.classList.add(className);
  };

  var exitListener = function exitListener() {
    return targetEl.classList.remove(className);
  };

  hoverEl.addEventListener('mouseenter', enterListener);
  hoverEl.addEventListener('mouseleave', exitListener);
  return [enterListener, exitListener];
}

/**
 * Desktop navigation buttons.
 */
var PaginationButton = /*#__PURE__*/function () {
  /**
   * @param {!Document} doc
   * @param {!ButtonState_1_0_Def} initialState
   * @param {!./amp-story-store-service.AmpStoryStoreService} storeService
   * @param {!Window} win
   */
  function PaginationButton(doc, initialState, storeService, win) {
    var _this = this;

    _classCallCheck(this, PaginationButton);

    /** @private {!ButtonState_1_0_Def} */
    this.state_ = initialState;

    /** @public @const {!Element} */
    this.element = buildPaginationButton(doc);

    /** @private @const {!Element} */
    this.buttonElement_ = dev().assertElement(this.element.querySelector('button'));

    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = getLocalizationService(doc);
    this.element.classList.add(initialState.className);
    initialState.label && this.buttonElement_.setAttribute('aria-label', this.localizationService_.getLocalizedString(initialState.label));
    this.element.addEventListener('click', function (e) {
      return _this.onClick_(e);
    });

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private @const {!Window} */
    this.win_ = win;
  }

  /** @param {!ButtonState_1_0_Def} state */
  _createClass(PaginationButton, [{
    key: "updateState",
    value: function updateState(state) {
      if (state === this.state_) {
        return;
      }

      this.element.classList.remove(this.state_.className);
      this.element.classList.add(state.className);
      state.label ? this.buttonElement_.setAttribute('aria-label', this.localizationService_.getLocalizedString(state.label)) : this.buttonElement_.removeAttribute('aria-label');
      this.state_ = state;
    }
    /**
     * @return {!ButtonState_1_0_Def}
     */

  }, {
    key: "getState",
    value: function getState() {
      return this.state_;
    }
    /**
     * @param {!Event} e
     * @private
     */

  }, {
    key: "onClick_",
    value: function onClick_(e) {
      e.preventDefault();
      this.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.MANUAL_ADVANCE);

      if (this.state_.triggers) {
        dispatch(this.win_, this.element, devAssert(this.state_.triggers),
        /* payload */
        undefined, {
          bubbles: true
        });
        return;
      }

      if (this.state_.action) {
        this.storeService_.dispatch(this.state_.action, this.state_.data);
        return;
      }
    }
  }]);

  return PaginationButton;
}();

/** Pagination buttons layer. */
export var PaginationButtons = /*#__PURE__*/function () {
  /**
   * @param {!./amp-story.AmpStory} ampStory
   */
  function PaginationButtons(ampStory) {
    _classCallCheck(this, PaginationButtons);

    /** @private @const {!./amp-story.AmpStory} */
    this.ampStory_ = ampStory;
    var win = this.ampStory_.win;
    var doc = win.document;
    this.storeService_ = getStoreService(win);

    /** @private @const {!PaginationButton} */
    this.forwardButton_ = new PaginationButton(doc, ForwardButtonStates.NEXT_PAGE, this.storeService_, win);

    /** @private @const {!PaginationButton} */
    this.backButton_ = new PaginationButton(doc, BackButtonStates.HIDDEN, this.storeService_, win);
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

  /** @private */
  _createClass(PaginationButtons, [{
    key: "addHoverListeners_",
    value: function addHoverListeners_() {
      if (this.hoverListeners_) {
        return;
      }

      var forwardButtonListeners = setClassOnHover(this.forwardButton_.element, this.ampStory_.element, 'i-amphtml-story-next-hover');
      var backButtonListeners = setClassOnHover(this.backButton_.element, this.ampStory_.element, 'i-amphtml-story-prev-hover');
      this.hoverListeners_ = forwardButtonListeners.concat(backButtonListeners);
    }
    /** @private */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this2 = this;

      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_INDEX, function (pageIndex) {
        _this2.onCurrentPageIndexUpdate_(pageIndex);
      });
      this.storeService_.subscribe(StateProperty.PAGE_IDS, function () {
        var currentPageIndex = Number(_this2.storeService_.get(StateProperty.CURRENT_PAGE_INDEX));

        _this2.onCurrentPageIndexUpdate_(currentPageIndex);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE, function (isVisible) {
        _this2.onSystemUiIsVisibleStateUpdate_(isVisible);
      });
      this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
        _this2.onUIStateUpdate_(uiState);
      }, true
      /** callToInitialize */
      );
    }
    /**
     * @param {number} pageIndex
     * @private
     */

  }, {
    key: "onCurrentPageIndexUpdate_",
    value: function onCurrentPageIndexUpdate_(pageIndex) {
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
     */

  }, {
    key: "onSystemUiIsVisibleStateUpdate_",
    value: function onSystemUiIsVisibleStateUpdate_(isVisible) {
      if (isVisible) {
        this.backButton_.updateState(
        /** @type {!ButtonState_1_0_Def} */
        devAssert(this.backButtonStateToRestore_));
        this.forwardButton_.updateState(
        /** @type {!ButtonState_1_0_Def} */
        devAssert(this.forwardButtonStateToRestore_));
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
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      if (uiState === UIType.DESKTOP_PANELS || uiState === UIType.DESKTOP_FULLBLEED) {
        this.addHoverListeners_();
      }
    }
  }]);

  return PaginationButtons;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2luYXRpb24tYnV0dG9ucy5qcyJdLCJuYW1lcyI6WyJBY3Rpb24iLCJTdGF0ZVByb3BlcnR5IiwiVUlUeXBlIiwiZ2V0U3RvcmVTZXJ2aWNlIiwiQWR2YW5jZW1lbnRNb2RlIiwiRXZlbnRUeXBlIiwiZGlzcGF0Y2giLCJMb2NhbGl6ZWRTdHJpbmdJZCIsIlNlcnZpY2VzIiwiZGV2IiwiZGV2QXNzZXJ0IiwiZ2V0TG9jYWxpemF0aW9uU2VydmljZSIsImh0bWxGb3IiLCJCdXR0b25TdGF0ZV8xXzBfRGVmIiwiQmFja0J1dHRvblN0YXRlcyIsIkhJRERFTiIsImNsYXNzTmFtZSIsIlBSRVZJT1VTX1BBR0UiLCJ0cmlnZ2VycyIsImxhYmVsIiwiQU1QX1NUT1JZX1BSRVZJT1VTX1BBR0UiLCJGb3J3YXJkQnV0dG9uU3RhdGVzIiwiTkVYVF9QQUdFIiwiQU1QX1NUT1JZX05FWFRfUEFHRSIsIk5FWFRfU1RPUlkiLCJBTVBfU1RPUllfTkVYVF9TVE9SWSIsIlJFUExBWSIsIkFNUF9TVE9SWV9SRVBMQVkiLCJidWlsZFBhZ2luYXRpb25CdXR0b24iLCJlbGVtZW50Iiwic2V0Q2xhc3NPbkhvdmVyIiwiaG92ZXJFbCIsInRhcmdldEVsIiwiZW50ZXJMaXN0ZW5lciIsImNsYXNzTGlzdCIsImFkZCIsImV4aXRMaXN0ZW5lciIsInJlbW92ZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJQYWdpbmF0aW9uQnV0dG9uIiwiZG9jIiwiaW5pdGlhbFN0YXRlIiwic3RvcmVTZXJ2aWNlIiwid2luIiwic3RhdGVfIiwiYnV0dG9uRWxlbWVudF8iLCJhc3NlcnRFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImxvY2FsaXphdGlvblNlcnZpY2VfIiwic2V0QXR0cmlidXRlIiwiZ2V0TG9jYWxpemVkU3RyaW5nIiwiZSIsIm9uQ2xpY2tfIiwic3RvcmVTZXJ2aWNlXyIsIndpbl8iLCJzdGF0ZSIsInJlbW92ZUF0dHJpYnV0ZSIsInByZXZlbnREZWZhdWx0IiwiU0VUX0FEVkFOQ0VNRU5UX01PREUiLCJNQU5VQUxfQURWQU5DRSIsInVuZGVmaW5lZCIsImJ1YmJsZXMiLCJhY3Rpb24iLCJkYXRhIiwiUGFnaW5hdGlvbkJ1dHRvbnMiLCJhbXBTdG9yeSIsImFtcFN0b3J5XyIsImRvY3VtZW50IiwiZm9yd2FyZEJ1dHRvbl8iLCJiYWNrQnV0dG9uXyIsImJhY2tCdXR0b25TdGF0ZVRvUmVzdG9yZV8iLCJmb3J3YXJkQnV0dG9uU3RhdGVUb1Jlc3RvcmVfIiwiaG92ZXJMaXN0ZW5lcnNfIiwiaW5pdGlhbGl6ZUxpc3RlbmVyc18iLCJhcHBlbmRDaGlsZCIsImZvcndhcmRCdXR0b25MaXN0ZW5lcnMiLCJiYWNrQnV0dG9uTGlzdGVuZXJzIiwiY29uY2F0Iiwic3Vic2NyaWJlIiwiQ1VSUkVOVF9QQUdFX0lOREVYIiwicGFnZUluZGV4Iiwib25DdXJyZW50UGFnZUluZGV4VXBkYXRlXyIsIlBBR0VfSURTIiwiY3VycmVudFBhZ2VJbmRleCIsIk51bWJlciIsImdldCIsIlNZU1RFTV9VSV9JU19WSVNJQkxFX1NUQVRFIiwiaXNWaXNpYmxlIiwib25TeXN0ZW1VaUlzVmlzaWJsZVN0YXRlVXBkYXRlXyIsIlVJX1NUQVRFIiwidWlTdGF0ZSIsIm9uVUlTdGF0ZVVwZGF0ZV8iLCJ0b3RhbFBhZ2VzIiwibGVuZ3RoIiwidXBkYXRlU3RhdGUiLCJ2aWV3ZXIiLCJ2aWV3ZXJGb3JEb2MiLCJoYXNDYXBhYmlsaXR5IiwiZ2V0U3RhdGUiLCJERVNLVE9QX1BBTkVMUyIsIkRFU0tUT1BfRlVMTEJMRUVEIiwiYWRkSG92ZXJMaXN0ZW5lcnNfIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FDRUEsTUFERixFQUVFQyxhQUZGLEVBR0VDLE1BSEYsRUFJRUMsZUFKRjtBQU1BLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxTQUFSLEVBQW1CQyxRQUFuQjtBQUNBLFNBQVFD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Y0FBTCxDQUFvQjhCLFFBQXBCLEVBQXBDO0FBQ0EsYUFBSzlCLGNBQUwsQ0FBb0IwQixXQUFwQixDQUFnQ3pFLG1CQUFtQixDQUFDTixNQUFwRDtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQWpLQTtBQUFBO0FBQUEsV0FrS0UsMEJBQWlCMkUsT0FBakIsRUFBMEI7QUFDeEIsVUFDRUEsT0FBTyxLQUFLeEYsTUFBTSxDQUFDaUcsY0FBbkIsSUFDQVQsT0FBTyxLQUFLeEYsTUFBTSxDQUFDa0csaUJBRnJCLEVBR0U7QUFDQSxhQUFLQyxrQkFBTDtBQUNEO0FBQ0Y7QUF6S0g7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBTdGF0ZVByb3BlcnR5LFxuICBVSVR5cGUsXG4gIGdldFN0b3JlU2VydmljZSxcbn0gZnJvbSAnLi9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge0FkdmFuY2VtZW50TW9kZX0gZnJvbSAnLi9zdG9yeS1hbmFseXRpY3MnO1xuaW1wb3J0IHtFdmVudFR5cGUsIGRpc3BhdGNofSBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQge0xvY2FsaXplZFN0cmluZ0lkfSBmcm9tICcjc2VydmljZS9sb2NhbGl6YXRpb24vc3RyaW5ncyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcblxuaW1wb3J0IHtnZXRMb2NhbGl6YXRpb25TZXJ2aWNlfSBmcm9tICcuL2FtcC1zdG9yeS1sb2NhbGl6YXRpb24tc2VydmljZSc7XG5pbXBvcnQge2h0bWxGb3J9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuXG4vKiogQHN0cnVjdCBAdHlwZWRlZiB7e2NsYXNzTmFtZTogc3RyaW5nLCB0cmlnZ2VyczogKHN0cmluZ3x1bmRlZmluZWQpfX0gKi9cbmxldCBCdXR0b25TdGF0ZV8xXzBfRGVmOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGdvb2dsZS1jYW1lbGNhc2UvZ29vZ2xlLWNhbWVsY2FzZVxuXG4vKiogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgIUJ1dHRvblN0YXRlXzFfMF9EZWY+fSAqL1xuY29uc3QgQmFja0J1dHRvblN0YXRlcyA9IHtcbiAgSElEREVOOiB7Y2xhc3NOYW1lOiAnaS1hbXBodG1sLXN0b3J5LWJ1dHRvbi1oaWRkZW4nfSxcbiAgUFJFVklPVVNfUEFHRToge1xuICAgIGNsYXNzTmFtZTogJ2ktYW1waHRtbC1zdG9yeS1iYWNrLXByZXYnLFxuICAgIHRyaWdnZXJzOiBFdmVudFR5cGUuUFJFVklPVVNfUEFHRSxcbiAgICBsYWJlbDogTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX1BSRVZJT1VTX1BBR0UsXG4gIH0sXG59O1xuXG4vKiogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgIUJ1dHRvblN0YXRlXzFfMF9EZWY+fSAqL1xuY29uc3QgRm9yd2FyZEJ1dHRvblN0YXRlcyA9IHtcbiAgSElEREVOOiB7Y2xhc3NOYW1lOiAnaS1hbXBodG1sLXN0b3J5LWJ1dHRvbi1oaWRkZW4nfSxcbiAgTkVYVF9QQUdFOiB7XG4gICAgY2xhc3NOYW1lOiAnaS1hbXBodG1sLXN0b3J5LWZ3ZC1uZXh0JyxcbiAgICB0cmlnZ2VyczogRXZlbnRUeXBlLk5FWFRfUEFHRSxcbiAgICBsYWJlbDogTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX05FWFRfUEFHRSxcbiAgfSxcbiAgTkVYVF9TVE9SWToge1xuICAgIGNsYXNzTmFtZTogJ2ktYW1waHRtbC1zdG9yeS1md2QtbmV4dCcsXG4gICAgdHJpZ2dlcnM6IEV2ZW50VHlwZS5ORVhUX1BBR0UsXG4gICAgbGFiZWw6IExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9ORVhUX1NUT1JZLFxuICB9LFxuICBSRVBMQVk6IHtcbiAgICBjbGFzc05hbWU6ICdpLWFtcGh0bWwtc3RvcnktZndkLXJlcGxheScsXG4gICAgdHJpZ2dlcnM6IEV2ZW50VHlwZS5SRVBMQVksXG4gICAgbGFiZWw6IExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9SRVBMQVksXG4gIH0sXG59O1xuXG4vKipcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBidWlsZFBhZ2luYXRpb25CdXR0b24gPSAoZWxlbWVudCkgPT5cbiAgaHRtbEZvcihlbGVtZW50KWBcbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktYnV0dG9uLWNvbnRhaW5lclwiPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWJ1dHRvbi1tb3ZlXCI+PC9idXR0b24+XG4gICAgICA8L2Rpdj5gO1xuXG4vKipcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGhvdmVyRWxcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldEVsXG4gKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lXG4gKiBAcmV0dXJuIHs/QXJyYXk8ZnVuY3Rpb24oIUV2ZW50KT59XG4gKi9cbmZ1bmN0aW9uIHNldENsYXNzT25Ib3Zlcihob3ZlckVsLCB0YXJnZXRFbCwgY2xhc3NOYW1lKSB7XG4gIGNvbnN0IGVudGVyTGlzdGVuZXIgPSAoKSA9PiB0YXJnZXRFbC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gIGNvbnN0IGV4aXRMaXN0ZW5lciA9ICgpID0+IHRhcmdldEVsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgaG92ZXJFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgZW50ZXJMaXN0ZW5lcik7XG4gIGhvdmVyRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGV4aXRMaXN0ZW5lcik7XG4gIHJldHVybiBbZW50ZXJMaXN0ZW5lciwgZXhpdExpc3RlbmVyXTtcbn1cblxuLyoqXG4gKiBEZXNrdG9wIG5hdmlnYXRpb24gYnV0dG9ucy5cbiAqL1xuY2xhc3MgUGFnaW5hdGlvbkJ1dHRvbiB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gICAqIEBwYXJhbSB7IUJ1dHRvblN0YXRlXzFfMF9EZWZ9IGluaXRpYWxTdGF0ZVxuICAgKiBAcGFyYW0geyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSBzdG9yZVNlcnZpY2VcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRvYywgaW5pdGlhbFN0YXRlLCBzdG9yZVNlcnZpY2UsIHdpbikge1xuICAgIC8qKiBAcHJpdmF0ZSB7IUJ1dHRvblN0YXRlXzFfMF9EZWZ9ICovXG4gICAgdGhpcy5zdGF0ZV8gPSBpbml0aWFsU3RhdGU7XG5cbiAgICAvKiogQHB1YmxpYyBAY29uc3QgeyFFbGVtZW50fSAqL1xuICAgIHRoaXMuZWxlbWVudCA9IGJ1aWxkUGFnaW5hdGlvbkJ1dHRvbihkb2MpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5idXR0b25FbGVtZW50XyA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uJylcbiAgICApO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2xvY2FsaXphdGlvbi5Mb2NhbGl6YXRpb25TZXJ2aWNlfSAqL1xuICAgIHRoaXMubG9jYWxpemF0aW9uU2VydmljZV8gPSBnZXRMb2NhbGl6YXRpb25TZXJ2aWNlKGRvYyk7XG5cbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChpbml0aWFsU3RhdGUuY2xhc3NOYW1lKTtcbiAgICBpbml0aWFsU3RhdGUubGFiZWwgJiZcbiAgICAgIHRoaXMuYnV0dG9uRWxlbWVudF8uc2V0QXR0cmlidXRlKFxuICAgICAgICAnYXJpYS1sYWJlbCcsXG4gICAgICAgIHRoaXMubG9jYWxpemF0aW9uU2VydmljZV8uZ2V0TG9jYWxpemVkU3RyaW5nKGluaXRpYWxTdGF0ZS5sYWJlbClcbiAgICAgICk7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHRoaXMub25DbGlja18oZSkpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gc3RvcmVTZXJ2aWNlO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG4gIH1cblxuICAvKiogQHBhcmFtIHshQnV0dG9uU3RhdGVfMV8wX0RlZn0gc3RhdGUgKi9cbiAgdXBkYXRlU3RhdGUoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUgPT09IHRoaXMuc3RhdGVfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuc3RhdGVfLmNsYXNzTmFtZSk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoc3RhdGUuY2xhc3NOYW1lKTtcbiAgICBzdGF0ZS5sYWJlbFxuICAgICAgPyB0aGlzLmJ1dHRvbkVsZW1lbnRfLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAnYXJpYS1sYWJlbCcsXG4gICAgICAgICAgdGhpcy5sb2NhbGl6YXRpb25TZXJ2aWNlXy5nZXRMb2NhbGl6ZWRTdHJpbmcoc3RhdGUubGFiZWwpXG4gICAgICAgIClcbiAgICAgIDogdGhpcy5idXR0b25FbGVtZW50Xy5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKTtcblxuICAgIHRoaXMuc3RhdGVfID0gc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUJ1dHRvblN0YXRlXzFfMF9EZWZ9XG4gICAqL1xuICBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZV87XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRXZlbnR9IGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uQ2xpY2tfKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goXG4gICAgICBBY3Rpb24uU0VUX0FEVkFOQ0VNRU5UX01PREUsXG4gICAgICBBZHZhbmNlbWVudE1vZGUuTUFOVUFMX0FEVkFOQ0VcbiAgICApO1xuXG4gICAgaWYgKHRoaXMuc3RhdGVfLnRyaWdnZXJzKSB7XG4gICAgICBkaXNwYXRjaChcbiAgICAgICAgdGhpcy53aW5fLFxuICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgIGRldkFzc2VydCh0aGlzLnN0YXRlXy50cmlnZ2VycyksXG4gICAgICAgIC8qIHBheWxvYWQgKi8gdW5kZWZpbmVkLFxuICAgICAgICB7YnViYmxlczogdHJ1ZX1cbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnN0YXRlXy5hY3Rpb24pIHtcbiAgICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaCh0aGlzLnN0YXRlXy5hY3Rpb24sIHRoaXMuc3RhdGVfLmRhdGEpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxufVxuXG4vKiogUGFnaW5hdGlvbiBidXR0b25zIGxheWVyLiAqL1xuZXhwb3J0IGNsYXNzIFBhZ2luYXRpb25CdXR0b25zIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW1wLXN0b3J5LkFtcFN0b3J5fSBhbXBTdG9yeVxuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wU3RvcnkpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi9hbXAtc3RvcnkuQW1wU3Rvcnl9ICovXG4gICAgdGhpcy5hbXBTdG9yeV8gPSBhbXBTdG9yeTtcblxuICAgIGNvbnN0IHt3aW59ID0gdGhpcy5hbXBTdG9yeV87XG4gICAgY29uc3QgZG9jID0gd2luLmRvY3VtZW50O1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh3aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVBhZ2luYXRpb25CdXR0b259ICovXG4gICAgdGhpcy5mb3J3YXJkQnV0dG9uXyA9IG5ldyBQYWdpbmF0aW9uQnV0dG9uKFxuICAgICAgZG9jLFxuICAgICAgRm9yd2FyZEJ1dHRvblN0YXRlcy5ORVhUX1BBR0UsXG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8sXG4gICAgICB3aW5cbiAgICApO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVBhZ2luYXRpb25CdXR0b259ICovXG4gICAgdGhpcy5iYWNrQnV0dG9uXyA9IG5ldyBQYWdpbmF0aW9uQnV0dG9uKFxuICAgICAgZG9jLFxuICAgICAgQmFja0J1dHRvblN0YXRlcy5ISURERU4sXG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8sXG4gICAgICB3aW5cbiAgICApO1xuXG4gICAgdGhpcy5mb3J3YXJkQnV0dG9uXy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ25leHQtY29udGFpbmVyJyk7XG4gICAgdGhpcy5iYWNrQnV0dG9uXy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3ByZXYtY29udGFpbmVyJyk7XG5cbiAgICAvKiogQHByaXZhdGUgez9CdXR0b25TdGF0ZV8xXzBfRGVmfSAqL1xuICAgIHRoaXMuYmFja0J1dHRvblN0YXRlVG9SZXN0b3JlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9CdXR0b25TdGF0ZV8xXzBfRGVmfSAqL1xuICAgIHRoaXMuZm9yd2FyZEJ1dHRvblN0YXRlVG9SZXN0b3JlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9BcnJheTxmdW5jdGlvbighRXZlbnQpPn0gKi9cbiAgICB0aGlzLmhvdmVyTGlzdGVuZXJzXyA9IG51bGw7XG5cbiAgICB0aGlzLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG5cbiAgICB0aGlzLmFtcFN0b3J5Xy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZm9yd2FyZEJ1dHRvbl8uZWxlbWVudCk7XG4gICAgdGhpcy5hbXBTdG9yeV8uZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmJhY2tCdXR0b25fLmVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGFkZEhvdmVyTGlzdGVuZXJzXygpIHtcbiAgICBpZiAodGhpcy5ob3Zlckxpc3RlbmVyc18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmb3J3YXJkQnV0dG9uTGlzdGVuZXJzID0gc2V0Q2xhc3NPbkhvdmVyKFxuICAgICAgdGhpcy5mb3J3YXJkQnV0dG9uXy5lbGVtZW50LFxuICAgICAgdGhpcy5hbXBTdG9yeV8uZWxlbWVudCxcbiAgICAgICdpLWFtcGh0bWwtc3RvcnktbmV4dC1ob3ZlcidcbiAgICApO1xuXG4gICAgY29uc3QgYmFja0J1dHRvbkxpc3RlbmVycyA9IHNldENsYXNzT25Ib3ZlcihcbiAgICAgIHRoaXMuYmFja0J1dHRvbl8uZWxlbWVudCxcbiAgICAgIHRoaXMuYW1wU3RvcnlfLmVsZW1lbnQsXG4gICAgICAnaS1hbXBodG1sLXN0b3J5LXByZXYtaG92ZXInXG4gICAgKTtcblxuICAgIHRoaXMuaG92ZXJMaXN0ZW5lcnNfID0gZm9yd2FyZEJ1dHRvbkxpc3RlbmVycy5jb25jYXQoYmFja0J1dHRvbkxpc3RlbmVycyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgaW5pdGlhbGl6ZUxpc3RlbmVyc18oKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lOREVYLFxuICAgICAgKHBhZ2VJbmRleCkgPT4ge1xuICAgICAgICB0aGlzLm9uQ3VycmVudFBhZ2VJbmRleFVwZGF0ZV8ocGFnZUluZGV4KTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuUEFHRV9JRFMsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlSW5kZXggPSBOdW1iZXIoXG4gICAgICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JTkRFWClcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5vbkN1cnJlbnRQYWdlSW5kZXhVcGRhdGVfKGN1cnJlbnRQYWdlSW5kZXgpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuU1lTVEVNX1VJX0lTX1ZJU0lCTEVfU1RBVEUsXG4gICAgICAoaXNWaXNpYmxlKSA9PiB7XG4gICAgICAgIHRoaXMub25TeXN0ZW1VaUlzVmlzaWJsZVN0YXRlVXBkYXRlXyhpc1Zpc2libGUpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5VSV9TVEFURSxcbiAgICAgICh1aVN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMub25VSVN0YXRlVXBkYXRlXyh1aVN0YXRlKTtcbiAgICAgIH0sXG4gICAgICB0cnVlIC8qKiBjYWxsVG9Jbml0aWFsaXplICovXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcGFnZUluZGV4XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkN1cnJlbnRQYWdlSW5kZXhVcGRhdGVfKHBhZ2VJbmRleCkge1xuICAgIGNvbnN0IHRvdGFsUGFnZXMgPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuUEFHRV9JRFMpLmxlbmd0aDtcblxuICAgIGlmIChwYWdlSW5kZXggPT09IDApIHtcbiAgICAgIHRoaXMuYmFja0J1dHRvbl8udXBkYXRlU3RhdGUoQmFja0J1dHRvblN0YXRlcy5ISURERU4pO1xuICAgIH1cblxuICAgIGlmIChwYWdlSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLmJhY2tCdXR0b25fLnVwZGF0ZVN0YXRlKEJhY2tCdXR0b25TdGF0ZXMuUFJFVklPVVNfUEFHRSk7XG4gICAgfVxuXG4gICAgaWYgKHBhZ2VJbmRleCA8IHRvdGFsUGFnZXMgLSAxKSB7XG4gICAgICB0aGlzLmZvcndhcmRCdXR0b25fLnVwZGF0ZVN0YXRlKEZvcndhcmRCdXR0b25TdGF0ZXMuTkVYVF9QQUdFKTtcbiAgICB9XG5cbiAgICBpZiAocGFnZUluZGV4ID09PSB0b3RhbFBhZ2VzIC0gMSkge1xuICAgICAgY29uc3Qgdmlld2VyID0gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMuYW1wU3RvcnlfLmVsZW1lbnQpO1xuICAgICAgaWYgKHZpZXdlci5oYXNDYXBhYmlsaXR5KCdzd2lwZScpKSB7XG4gICAgICAgIHRoaXMuZm9yd2FyZEJ1dHRvbl8udXBkYXRlU3RhdGUoRm9yd2FyZEJ1dHRvblN0YXRlcy5ORVhUX1NUT1JZKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZm9yd2FyZEJ1dHRvbl8udXBkYXRlU3RhdGUoRm9yd2FyZEJ1dHRvblN0YXRlcy5SRVBMQVkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gc3lzdGVtIFVJIHZpc2liaWxpdHkgc3RhdGUgdXBkYXRlcy5cbiAgICogQHBhcmFtIHtib29sZWFufSBpc1Zpc2libGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uU3lzdGVtVWlJc1Zpc2libGVTdGF0ZVVwZGF0ZV8oaXNWaXNpYmxlKSB7XG4gICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgdGhpcy5iYWNrQnV0dG9uXy51cGRhdGVTdGF0ZShcbiAgICAgICAgLyoqIEB0eXBlIHshQnV0dG9uU3RhdGVfMV8wX0RlZn0gKi8gKFxuICAgICAgICAgIGRldkFzc2VydCh0aGlzLmJhY2tCdXR0b25TdGF0ZVRvUmVzdG9yZV8pXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICB0aGlzLmZvcndhcmRCdXR0b25fLnVwZGF0ZVN0YXRlKFxuICAgICAgICAvKiogQHR5cGUgeyFCdXR0b25TdGF0ZV8xXzBfRGVmfSAqLyAoXG4gICAgICAgICAgZGV2QXNzZXJ0KHRoaXMuZm9yd2FyZEJ1dHRvblN0YXRlVG9SZXN0b3JlXylcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYWNrQnV0dG9uU3RhdGVUb1Jlc3RvcmVfID0gdGhpcy5iYWNrQnV0dG9uXy5nZXRTdGF0ZSgpO1xuICAgICAgdGhpcy5iYWNrQnV0dG9uXy51cGRhdGVTdGF0ZShCYWNrQnV0dG9uU3RhdGVzLkhJRERFTik7XG4gICAgICB0aGlzLmZvcndhcmRCdXR0b25TdGF0ZVRvUmVzdG9yZV8gPSB0aGlzLmZvcndhcmRCdXR0b25fLmdldFN0YXRlKCk7XG4gICAgICB0aGlzLmZvcndhcmRCdXR0b25fLnVwZGF0ZVN0YXRlKEZvcndhcmRCdXR0b25TdGF0ZXMuSElEREVOKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIFVJIHN0YXRlIHVwZGF0ZXMuXG4gICAqIEBwYXJhbSB7IVVJVHlwZX0gdWlTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25VSVN0YXRlVXBkYXRlXyh1aVN0YXRlKSB7XG4gICAgaWYgKFxuICAgICAgdWlTdGF0ZSA9PT0gVUlUeXBlLkRFU0tUT1BfUEFORUxTIHx8XG4gICAgICB1aVN0YXRlID09PSBVSVR5cGUuREVTS1RPUF9GVUxMQkxFRURcbiAgICApIHtcbiAgICAgIHRoaXMuYWRkSG92ZXJMaXN0ZW5lcnNfKCk7XG4gICAgfVxuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/pagination-buttons.js