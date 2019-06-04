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
  getStoreService,
} from './amp-story-store-service';
import {AdvancementMode} from './story-analytics';
import {EventType, dispatch} from './events';
import {devAssert} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {renderAsElement} from './simple-template';

/** @struct @typedef {{className: string, triggers: (string|undefined)}} */
let ButtonStateDef;

/** @const {!Object<string, !ButtonStateDef>} */
const BackButtonStates = {
  CLOSE_BOOKEND: {
    className: 'i-amphtml-story-back-close-bookend',
    action: Action.TOGGLE_BOOKEND,
    data: false,
  },
  HIDDEN: {className: 'i-amphtml-story-button-hidden'},
  PREVIOUS_PAGE: {
    className: 'i-amphtml-story-back-prev',
    triggers: EventType.PREVIOUS_PAGE,
  },
};

/** @const {!Object<string, !ButtonStateDef>} */
const ForwardButtonStates = {
  HIDDEN: {className: 'i-amphtml-story-button-hidden'},
  NEXT_PAGE: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
  },
  REPLAY: {
    className: 'i-amphtml-story-fwd-replay',
    triggers: EventType.REPLAY,
  },
  SHOW_BOOKEND: {
    className: 'i-amphtml-story-fwd-more',
    action: Action.TOGGLE_BOOKEND,
    data: true,
  },
};

/** @private @const {!./simple-template.ElementDef} */
const BUTTON = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-button-container'}),
  children: [
    {
      tag: 'button',
      attrs: dict({'class': 'i-amphtml-story-button-move'}),
    },
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-page-sentinel'}),
    },
  ],
};

/**
 * @param {!Element} hoverEl
 * @param {!Element} targetEl
 * @param {string} className
 */
function setClassOnHover(hoverEl, targetEl, className) {
  hoverEl.addEventListener('mouseenter', () => {
    targetEl.classList.add(className);
  });
  hoverEl.addEventListener('mouseleave', () => {
    targetEl.classList.remove(className);
  });
}

/**
 * Desktop navigation buttons.
 */
class PaginationButton {
  /**
   * @param {!Document} doc
   * @param {!ButtonStateDef} initialState
   * @param {!./amp-story-store-service.AmpStoryStoreService} storeService
   * @param {!Window} win
   */
  constructor(doc, initialState, storeService, win) {
    /** @private {!ButtonStateDef} */
    this.state_ = initialState;

    /** @public @const {!Element} */
    this.element = renderAsElement(doc, BUTTON);

    this.element.classList.add(initialState.className);

    this.element.addEventListener('click', e => this.onClick_(e));

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private @const {!Window} */
    this.win_ = win;
  }

  /** @param {!ButtonStateDef} state */
  updateState(state) {
    if (state === this.state_) {
      return;
    }
    this.element.classList.remove(this.state_.className);
    this.element.classList.add(state.className);
    this.state_ = state;
  }

  /**
   * @return {!ButtonStateDef}
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
   * @param {!Window} win
   * @param {function():Promise<boolean>} hasBookend
   */
  constructor(win, hasBookend) {
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

    /** @private {?ButtonStateDef} */
    this.backButtonStateToRestore_ = null;

    /** @private {?ButtonStateDef} */
    this.forwardButtonStateToRestore_ = null;

    /** @private {function():Promise<boolean>} */
    this.hasBookend_ = hasBookend;

    this.initializeListeners_();
  }

  /**
   * @param {!Window} win
   * @param {function():Promise<boolean>} hasBookend
   * @return {!PaginationButtons}
   */
  static create(win, hasBookend) {
    return new PaginationButtons(win, hasBookend);
  }

  /** @param {!Element} element */
  attach(element) {
    setClassOnHover(
      this.forwardButton_.element,
      element,
      'i-amphtml-story-next-hover'
    );

    setClassOnHover(
      this.backButton_.element,
      element,
      'i-amphtml-story-prev-hover'
    );

    element.appendChild(this.forwardButton_.element);
    element.appendChild(this.backButton_.element);
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, isActive => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      pageIndex => {
        this.onCurrentPageIndexUpdate_(pageIndex);
      }
    );

    this.storeService_.subscribe(
      StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
      isVisible => {
        this.onSystemUiIsVisibleStateUpdate_(isVisible);
      }
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
      this.hasBookend_().then(hasBookend => {
        if (!hasBookend) {
          this.forwardButton_.updateState(ForwardButtonStates.REPLAY);
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
        /** @type {!ButtonStateDef} */ (devAssert(
          this.backButtonStateToRestore_
        ))
      );
      this.forwardButton_.updateState(
        /** @type {!ButtonStateDef} */ (devAssert(
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
}
