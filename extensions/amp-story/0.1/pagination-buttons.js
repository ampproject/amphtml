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


/** @typedef {{class: string, triggers: (string|undefined)}} */
let ButtonStateDef;


/** @const {!Object<string, !ButtonStateDef>} */
const BackButtonStates = {
  HIDDEN: {className: 'i-amphtml-story-button-hidden'},
  PREVIOUS_PAGE: {
    className: 'i-amphtml-story-back-prev',
    triggers: EventType.PREVIOUS_PAGE,
  },
  CLOSE_BOOKEND: {
    className: 'i-amphtml-story-back-prev',
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
 * Button that mutliplexes class name and the event it dispatches based on
 * state.
 */
class StatefulButton {
  /**
   * @param {!Element} element
   * @param {!ButtonStateDef} defaultState
   * @param {!Object<string, !ButtonStateDef>} allStates
   */
  constructor(element, defaultState, allStates) {
    /** @const */
    this.element = element;

    /** @private @const */
    this.allStates_ = allStates;

    /** @private {!ButtonStateDef} */
    this.state_ = defaultState;

    /** @private {number} */
    this.lastUpdateId_ = 0;

    this.setState(defaultState);
    this.element.addEventListener('click', e => this.onClick_(e));
  }

  /** @param {!Promise<!ButtonStateDef>|!ButtonStateDef} stateOrPromise */
  setState(stateOrPromise) {
    const updateId = ++this.lastUpdateId_;

    Promise.resolve(stateOrPromise).then(state => {
      if (updateId !== this.lastUpdateId_) {
        return;
      }

      const stateClassName =
          dev().assert((/** @type {!ButtonStateDef} */ (state)).className);

      this.state_ = state;

      const allClassNames =
          Object.values(this.allStates_).map(s => s.className);

      allClassNames.forEach(className =>
        this.element.classList.toggle(className, className == stateClassName));
    });
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
  /**
   * @param {!Document} doc
   * @param {!function():Promise<boolean>} hasBookend
   */
  constructor(doc, hasBookend) {
    /** @private @const {!function():Promise<boolean>} */
    this.hasBookend_ = hasBookend;

    /** @private @const {!StatefulButton} */
    this.forwardButton_ = new StatefulButton(
        renderAsElement(doc, FORWARD_BUTTON),
        ForwardButtonStates.NEXT_PAGE,
        ForwardButtonStates);

    /** @private @const {!StatefulButton} */
    this.backButton_ = new StatefulButton(
        renderAsElement(doc, BACK_BUTTON),
        BackButtonStates.HIDDEN,
        BackButtonStates);
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
    const backButtonEl = this.backButton_.element;
    const forwardButtonEl = this.forwardButton_.element;

    setClassOnHover(forwardButtonEl, element, 'i-amphtml-story-next-hover');
    setClassOnHover(backButtonEl, element, 'i-amphtml-story-prev-hover');

    element.appendChild(forwardButtonEl);
    element.appendChild(backButtonEl);
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
        this.backButton_.setState(pageIndex === 0 ?
            BackButtonStates.HIDDEN :
            BackButtonStates.PREVIOUS_PAGE);
        this.forwardButton_.setState(ForwardButtonStates.NEXT_PAGE);
        break;

      case StateChangeType.BOOKEND_ENTER:
        this.backButton_.setState(BackButtonStates.CLOSE_BOOKEND);
        this.forwardButton_.setState(ForwardButtonStates.REPLAY);
        break;

      case StateChangeType.BOOKEND_EXIT:
        this.onLastPageActive_();
        break;
    }
  }

  /** @private */
  onLastPageActive_() {
    this.backButton_.setState(BackButtonStates.PREVIOUS_PAGE);
    this.forwardButton_.setState(this.hasBookend_().then(hasBookend =>
      hasBookend ?
        ForwardButtonStates.SHOW_BOOKEND :
        ForwardButtonStates.REPLAY));
  }
}
