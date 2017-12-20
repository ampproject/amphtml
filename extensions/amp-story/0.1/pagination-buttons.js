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
import {dict} from './../../../src/utils/object';
import {dev} from '../../../src/log';
import {renderAsElement} from './simple-template';
import {EventType, dispatch} from './events';
import {StateChangeType} from './navigation-state';
import {AsyncValue} from './utils';


/** @typedef {{className: string, triggers: (string|undefined)}} */
let ButtonStateDef;


/** @const {!Object<string, !ButtonStateDef>} */
const BackButtonStates = {
  HIDDEN: {className: 'i-amphtml-story-button-hidden'},
  PREVIOUS_PAGE: {
    className: 'i-amphtml-story-back-prev',
    triggers: EventType.PREVIOUS_PAGE,
  },
  CLOSE_BOOKEND: {
    className: 'i-amphtml-story-back-close-bookend',
    triggers: EventType.CLOSE_BOOKEND,
  },
};


/** @const {!Object<string, !ButtonStateDef>} */
const ForwardButtonStates = {
  NEXT_PAGE: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
  },
  SHOW_BOOKEND: {
    className: 'i-amphtml-story-fwd-more',
    triggers: EventType.SHOW_BOOKEND,
  },
  REPLAY: {
    className: 'i-amphtml-story-fwd-replay',
    triggers: EventType.REPLAY,
  },
};


/** @private @const {!./simple-template.ElementDef} */
const BACK_BUTTON = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-button-container prev-container'}),
  children: [
    {
      tag: 'button',
      attrs: dict({'class': 'i-amphtml-story-button-move'}),
    },
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-prev-sentinel'}),
    },
  ],
};


/** @private @const {!./simple-template.ElementDef} */
const FORWARD_BUTTON = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-button-container next-container'}),
  children: [
    {
      tag: 'button',
      attrs: dict({'class': 'i-amphtml-story-button-move'}),
    },
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-next-sentinel'}),
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
 * @param {!Element} buttonEl
 * @param {!Event} e
 * @param {!AsyncValue<!ButtonStateDef>} buttonState
 */
function maybeDispatchOnClick(buttonEl, buttonState) {
  buttonEl.addEventListener('click', e => {
    const eventType = buttonState.get().triggers;
    if (!eventType) {
      return;
    }
    e.preventDefault();
    dispatch(buttonEl, dev().assert(eventType), /* opt_bubbles */ true);
  });
}


/** Pagination buttons layer. */
export class PaginationButtons {
  /**
   * @param {!Document} doc
   * @param {!function():Promise<boolean>} hasBookend
   */
  constructor(doc, hasBookend) {
    /** @private @const {!function():Promise<boolean>} */
    this.hasBookend_ = hasBookend;

    /** @private @const */
    this.forwardButton_ = renderAsElement(doc, FORWARD_BUTTON);

    /** @private @const */
    this.backButton_ = renderAsElement(doc, BACK_BUTTON);

    /** @private @const {!AsyncValue<!ButtonStateDef>} */
    this.forwardButtonState_ = AsyncValue.create(ForwardButtonStates.NEXT_PAGE,
        (state, newState) =>
          this.onButtonStateChange_(this.forwardButton_, state, newState));

    /** @private @const {!AsyncValue<!ButtonStateDef>} */
    this.backButtonState_ = AsyncValue.create(BackButtonStates.HIDDEN,
        (state, newState) =>
          this.onButtonStateChange_(this.backButton_, state, newState));
  }

  /**
   * @param {!Document} doc
   * @param {!function():Promise<boolean>} hasBookend
   * @return {!PaginationButtons}
   */
  static create(doc, hasBookend) {
    return new PaginationButtons(doc, hasBookend);
  }

  /**
   * @param {!Element} el
   * @param {!ButtonStateDef} state
   * @param {!ButtonStateDef} newState
   */
  onButtonStateChange_(el, state, newState) {
    el.classList.remove(state.className)
    el.classList.add(newState.className);
  }

  /**
   * @param {!Element} el
   * @param {!Event} e
   * @param {!AsyncValue<!ButtonStateDef>} state
   */
  maybeDispatchOnClick_(el, state) {
    el.addEventListener('click', e => {
      const eventType = state.get().triggers;
      if (!eventType) {
        return;
      }
      e.preventDefault();
      dispatch(el, dev().assert(eventType), /* opt_bubbles */ true);
    });
  }

  /** @param {!Element} element */
  attach(element) {
    setClassOnHover(this.forwardButton_, element, 'i-amphtml-story-next-hover');
    setClassOnHover(this.backButton_, element, 'i-amphtml-story-prev-hover');

    maybeDispatchOnClick(this.forwardButton_, this.forwardButtonState_);
    maybeDispatchOnClick(this.backButton_, this.backButtonState_);

    this.forwardButton_.classList.add(this.forwardButtonState_.get().className);
    this.backButton_.classList.add(this.backButtonState_.get().className);

    element.appendChild(this.forwardButton_);
    element.appendChild(this.backButton_);
  }

  /** @param {!./navigation-state.StateChangeEventDef} event */
  onNavigationStateChange(event) {
    switch (event.type) {
      case StateChangeType.ACTIVE_PAGE:
        const {pageIndex, totalPages} = event.value;
        if (pageIndex === totalPages - 1) {
          this.onLastPageActive_();
          return;
        }
        this.backButtonState_.set(
            pageIndex === 0 ?
              BackButtonStates.HIDDEN :
              BackButtonStates.PREVIOUS_PAGE);
        this.forwardButtonState_.set(ForwardButtonStates.NEXT_PAGE);
        break;

      case StateChangeType.BOOKEND_ENTER:
        this.backButtonState_.set(BackButtonStates.CLOSE_BOOKEND);
        this.forwardButtonState_.set(ForwardButtonStates.REPLAY);
        break;

      case StateChangeType.BOOKEND_EXIT:
        this.onLastPageActive_();
        break;
    }
  }

  /** @private */
  onLastPageActive_() {
    this.backButtonState_.set(BackButtonStates.PREVIOUS_PAGE);
    this.forwardButtonState_.set(this.hasBookend_().then(hasBookend =>
      hasBookend ?
        ForwardButtonStates.SHOW_BOOKEND :
        ForwardButtonStates.REPLAY));
  }
}
