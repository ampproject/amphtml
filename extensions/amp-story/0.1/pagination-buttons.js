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
import {EventType, dispatch} from './events';
import {StateChangeType} from './navigation-state';
import {dev} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {renderAsElement} from './simple-template';


/** @struct @typedef {{className: string, triggers: (string|undefined)}} */
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


class PaginationButton {
  /**
   * @param {!Document} doc
   * @param {!ButtonStateDef} initialState
   */
  constructor(doc, initialState) {
    /** @private {!ButtonStateDef} */
    this.state_ = initialState;

    /** @public @const {!Element} */
    this.element = renderAsElement(doc, BUTTON);

    this.element.classList.add(initialState.className);

    this.element.addEventListener('click', e => this.onClick_(e));
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
   * @param {!Event} e
   * @private
   */
  onClick_(e) {
    if (!this.state_.triggers) {
      return;
    }
    e.preventDefault();
    dispatch(this.element, dev().assert(this.state_.triggers),
        /* opt_bubbles */ true);
  }
}


/** Pagination buttons layer. */
export class PaginationButtons {
  /** @param {!Document} doc */
  constructor(doc) {
    /** @private @const {!PaginationButton} */
    this.forwardButton_ =
        new PaginationButton(doc, ForwardButtonStates.NEXT_PAGE);

    /** @private @const {!PaginationButton} */
    this.backButton_ = new PaginationButton(doc, BackButtonStates.HIDDEN);

    this.forwardButton_.element.classList.add('next-container');
    this.backButton_.element.classList.add('prev-container');
  }

  /**
   * @param {!Document} doc
   * @return {!PaginationButtons}
   */
  static create(doc) {
    return new PaginationButtons(doc);
  }

  /** @param {!Element} element */
  attach(element) {
    setClassOnHover(
        this.forwardButton_.element, element, 'i-amphtml-story-next-hover');

    setClassOnHover(
        this.backButton_.element, element, 'i-amphtml-story-prev-hover');

    element.appendChild(this.forwardButton_.element);
    element.appendChild(this.backButton_.element);
  }

  /** @param {!./navigation-state.StateChangeEventDef} event */
  onNavigationStateChange(event) {
    switch (event.type) {
      case StateChangeType.ACTIVE_PAGE:
        const {pageIndex, totalPages} = event.value;

        this.backButton_.updateState(
            pageIndex === 0 ?
              BackButtonStates.HIDDEN :
              BackButtonStates.PREVIOUS_PAGE);

        this.forwardButton_.updateState(
            pageIndex === totalPages - 1 ?
              ForwardButtonStates.SHOW_BOOKEND :
              ForwardButtonStates.NEXT_PAGE);
        break;

      case StateChangeType.BOOKEND_ENTER:
        this.backButton_.updateState(BackButtonStates.CLOSE_BOOKEND);
        break;

      case StateChangeType.BOOKEND_EXIT:
        this.backButton_.updateState(BackButtonStates.PREVIOUS_PAGE);
        this.forwardButton_.updateState(ForwardButtonStates.SHOW_BOOKEND);
        break;

      case StateChangeType.END:
        this.forwardButton_.updateState(ForwardButtonStates.REPLAY);
        break;
    }
  }
}
