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
      attrs: dict({'class': 'i-amphtml-story-prev-sentinel'}),
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
 * @param {!Document} doc
 * @param {!ButtonState} defaultState
 * @param {string} className
 * @return {{element: !Element, setState: function(!ButtonStateDef):void}}
 */
function createButton(doc, defaultState, className) {
  let state = defaultState;

  const element = renderAsElement(doc, BUTTON);

  element.classList.add(className, defaultState.className);

  element.addEventListener('click', e => {
    if (!state.triggers) {
      return;
    }
    e.preventDefault();
    dispatch(element, dev().assert(state.triggers), /* opt_bubbles */ true);
  });

  return {element, setState: newState => {
    if (newState === state) {
      return;
    }
    element.classList.remove(state.className);
    element.classList.add(newState.className);
    state = newState;
  }};
}


/** Pagination buttons layer. */
export class PaginationButtons {
  /** @param {!Document} doc */
  constructor(doc) {
    /** @private @const */
    this.forwardButton_ =
        createButton(doc, ForwardButtonStates.NEXT_PAGE, 'next-container');

    /** @private @const */
    this.backButton_ =
        createButton(doc, BackButtonStates.HIDDEN, 'prev-container');
  }

  /**
   * @param {!Document} doc
   * @param {!function():Promise<boolean>} hasBookend
   * @return {!PaginationButtons}
   */
  static create(doc, hasBookend) {
    return new PaginationButtons(doc, hasBookend);
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

        this.backButton_.setState(
            pageIndex === 0 ?
              BackButtonStates.HIDDEN :
              BackButtonStates.PREVIOUS_PAGE);

        this.forwardButton_.setState(
            pageIndex === totalPages - 1 ?
              ForwardButtonStates.SHOW_BOOKEND :
              ForwardButtonStates.NEXT_PAGE);
        break;

      case StateChangeType.BOOKEND_ENTER:
        this.backButton_.setState(BackButtonStates.CLOSE_BOOKEND);
        break;

      case StateChangeType.BOOKEND_EXIT:
        this.backButton_.setState(BackButtonStates.PREVIOUS_PAGE);
        this.forwardButton_.setState(ForwardButtonStates.SHOW_BOOKEND);
        break;

      case StateChangeType.END:
        this.forwardButton_.setState(ForwardButtonStates.REPLAY);
        break;
    }
  }
}
