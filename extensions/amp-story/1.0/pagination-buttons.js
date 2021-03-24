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
import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {AdvancementMode} from './story-analytics';
import {CommonSignals} from '../../../src/common-signals';
import {EventType, dispatch} from './events';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {dev, devAssert} from '../../../src/log';

import {getLocalizationService} from './amp-story-localization-service';
import {htmlFor} from '../../../src/static-template';

/** @struct @typedef {{className: string, triggers: (string|undefined)}} */
let ButtonState_1_0_Def; // eslint-disable-line google-camelcase/google-camelcase

/** @const {!Object<string, !ButtonState_1_0_Def>} */
const BackButtonStates = {
  CLOSE_BOOKEND: {
    className: 'i-amphtml-story-back-close-bookend',
    action: Action.TOGGLE_BOOKEND,
    data: false,
    label: LocalizedStringId.AMP_STORY_CLOSE_BOOKEND,
  },
  HIDDEN: {className: 'i-amphtml-story-button-hidden'},
  PREVIOUS_PAGE: {
    className: 'i-amphtml-story-back-prev',
    triggers: EventType.PREVIOUS_PAGE,
    label: LocalizedStringId.AMP_STORY_PREVIOUS_PAGE,
  },
};

/** @const {!Object<string, !ButtonState_1_0_Def>} */
const ForwardButtonStates = {
  HIDDEN: {className: 'i-amphtml-story-button-hidden'},
  NEXT_PAGE: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
    label: LocalizedStringId.AMP_STORY_NEXT_PAGE,
  },
  NEXT_STORY: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
    label: LocalizedStringId.AMP_STORY_NEXT_STORY,
  },
  REPLAY: {
    className: 'i-amphtml-story-fwd-replay',
    triggers: EventType.REPLAY,
    label: LocalizedStringId.AMP_STORY_REPLAY,
  },
  SHOW_BOOKEND: {
    className: 'i-amphtml-story-fwd-more',
    action: Action.TOGGLE_BOOKEND,
    data: true,
    label: LocalizedStringId.AMP_STORY_SHOW_BOOKEND,
  },
};

/**
 * @param {!Element} element
 * @return {!Element}
 */
const buildPaginationButton = (element) =>
  htmlFor(element)`
      <div class="i-amphtml-story-button-container">
        <button class="i-amphtml-story-button-move"></button>
      </div>`;

/**
 * @param {!Element} hoverEl
 * @param {!Element} targetEl
 * @param {string} className
 * @return {?Array<function(!Event)>}
 */
function setClassOnHover(hoverEl, targetEl, className) {
  const enterListener = () => targetEl.classList.add(className);
  const exitListener = () => targetEl.classList.remove(className);
  hoverEl.addEventListener('mouseenter', enterListener);
  hoverEl.addEventListener('mouseleave', exitListener);
  return [enterListener, exitListener];
}

/**
 * Desktop navigation buttons.
 */
class PaginationButton {
  /**
   * @param {!Document} doc
   * @param {!ButtonState_1_0_Def} initialState
   * @param {!./amp-story-store-service.AmpStoryStoreService} storeService
   * @param {!Window} win
   */
  constructor(doc, initialState, storeService, win) {
    /** @private {!ButtonState_1_0_Def} */
    this.state_ = initialState;

    /** @public @const {!Element} */
    this.element = buildPaginationButton(doc);

    /** @private @const {!Element} */
    this.buttonElement_ = dev().assertElement(
      this.element.querySelector('button')
    );

    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = getLocalizationService(doc);

    this.element.classList.add(initialState.className);
    initialState.label &&
      this.buttonElement_.setAttribute(
        'aria-label',
        this.localizationService_.getLocalizedString(initialState.label)
      );
    this.element.addEventListener('click', (e) => this.onClick_(e));

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private @const {!Window} */
    this.win_ = win;
  }

  /** @param {!ButtonState_1_0_Def} state */
  updateState(state) {
    if (state === this.state_) {
      return;
    }
    this.element.classList.remove(this.state_.className);
    this.element.classList.add(state.className);
    state.label
      ? this.buttonElement_.setAttribute(
          'aria-label',
          this.localizationService_.getLocalizedString(state.label)
        )
      : this.buttonElement_.removeAttribute('aria-label');

    this.state_ = state;
  }

  /**
   * @return {!ButtonState_1_0_Def}
   */
  getState() {
    return this.state_;
  }

  /**
   * @param {!Event} e
   * @private
   */
  onClick_(e) {
    e.preventDefault();

    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );

    if (this.state_.triggers) {
      dispatch(
        this.win_,
        this.element,
        devAssert(this.state_.triggers),
        /* payload */ undefined,
        {bubbles: true}
      );
      return;
    }
    if (this.state_.action) {
      this.storeService_.dispatch(this.state_.action, this.state_.data);
      return;
    }
  }
}

/** Pagination buttons layer. */
export class PaginationButtons {
  /**
   * @param {!./amp-story.AmpStory} ampStory
   */
  constructor(ampStory) {
    /** @private @const {!./amp-story.AmpStory} */
    this.ampStory_ = ampStory;

    const {win} = this.ampStory_;
    const doc = win.document;
    this.storeService_ = getStoreService(win);

    /** @private @const {!PaginationButton} */
    this.forwardButton_ = new PaginationButton(
      doc,
      ForwardButtonStates.NEXT_PAGE,
      this.storeService_,
      win
    );

    /** @private @const {!PaginationButton} */
    this.backButton_ = new PaginationButton(
      doc,
      BackButtonStates.HIDDEN,
      this.storeService_,
      win
    );

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
  addHoverListeners_() {
    if (this.hoverListeners_) {
      return;
    }

    const forwardButtonListeners = setClassOnHover(
      this.forwardButton_.element,
      this.ampStory_.element,
      'i-amphtml-story-next-hover'
    );

    const backButtonListeners = setClassOnHover(
      this.backButton_.element,
      this.ampStory_.element,
      'i-amphtml-story-prev-hover'
    );

    this.hoverListeners_ = forwardButtonListeners.concat(backButtonListeners);
  }

  /** @private */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, (isActive) => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      (pageIndex) => {
        this.onCurrentPageIndexUpdate_(pageIndex);
      }
    );

    this.storeService_.subscribe(
      StateProperty.PAGE_IDS,
      () => {
        // Since onCurrentPageIndexUpdate_ uses this.hasBookend, and the bookend
        // isn't initialized until after the story is laid out, we wait for the
        // story to be laid out before calling this function.
        this.ampStory_.element
          .signals()
          .whenSignal(CommonSignals.LOAD_END)
          .then(() => {
            const currentPageIndex = Number(
              this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX)
            );
            this.onCurrentPageIndexUpdate_(currentPageIndex);
          });
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
      (isVisible) => {
        this.onSystemUiIsVisibleStateUpdate_(isVisible);
      }
    );

    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );
  }

  /**
   * @param {boolean} isActive
   * @private
   */
  onBookendStateUpdate_(isActive) {
    if (isActive) {
      this.backButton_.updateState(BackButtonStates.CLOSE_BOOKEND);
      this.forwardButton_.updateState(ForwardButtonStates.REPLAY);
    } else {
      this.backButton_.updateState(BackButtonStates.PREVIOUS_PAGE);
      this.forwardButton_.updateState(ForwardButtonStates.SHOW_BOOKEND);
    }
  }

  /**
   * @param {number} pageIndex
   * @private
   */
  onCurrentPageIndexUpdate_(pageIndex) {
    const totalPages = this.storeService_.get(StateProperty.PAGE_IDS).length;
    const bookendActive = this.storeService_.get(StateProperty.BOOKEND_STATE);

    if (pageIndex === 0) {
      this.backButton_.updateState(BackButtonStates.HIDDEN);
    }

    if (pageIndex > 0 && !bookendActive) {
      this.backButton_.updateState(BackButtonStates.PREVIOUS_PAGE);
    }

    if (pageIndex < totalPages - 1) {
      this.forwardButton_.updateState(ForwardButtonStates.NEXT_PAGE);
    }

    if (pageIndex === totalPages - 1 && !bookendActive) {
      this.forwardButton_.updateState(ForwardButtonStates.SHOW_BOOKEND);
    }

    if (pageIndex === totalPages - 1) {
      this.ampStory_.hasBookend().then((hasBookend) => {
        const viewer = Services.viewerForDoc(this.ampStory_.element);
        if (!hasBookend) {
          if (viewer.hasCapability('swipe')) {
            this.forwardButton_.updateState(ForwardButtonStates.NEXT_STORY);
          } else {
            this.forwardButton_.updateState(ForwardButtonStates.REPLAY);
          }
        }
      });
    }
  }

  /**
   * Reacts to system UI visibility state updates.
   * @param {boolean} isVisible
   * @private
   */
  onSystemUiIsVisibleStateUpdate_(isVisible) {
    if (isVisible) {
      this.backButton_.updateState(
        /** @type {!ButtonState_1_0_Def} */ (devAssert(
          this.backButtonStateToRestore_
        ))
      );
      this.forwardButton_.updateState(
        /** @type {!ButtonState_1_0_Def} */ (devAssert(
          this.forwardButtonStateToRestore_
        ))
      );
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
  onUIStateUpdate_(uiState) {
    if (
      uiState === UIType.DESKTOP_PANELS ||
      uiState === UIType.DESKTOP_FULLBLEED
    ) {
      this.addHoverListeners_();
    }
  }
}
