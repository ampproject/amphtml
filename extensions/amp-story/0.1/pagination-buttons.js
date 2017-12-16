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


/** @enum */
const ForwardButtonState = {
  NEXT_PAGE: 0,
  SHOW_BOOKEND: 1,
  REPLAY: 2,
};


/** @enum */
const BackButtonState = {
  HIDDEN: 0,
  PREVIOUS_PAGE: 1,
  CLOSE_BOOKEND: 2,
};


/** @private @const {!./simple-template.ElementDef} */
const BACK_BUTTON = {
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-button-container ' +
        'i-amphtml-story-button-hidden prev-container',
  }),
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
  attrs: dict({
    'class': 'i-amphtml-story-button-container i-amphtml-story-fwd-next ' +
        'next-container',
  }),
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
 * Button that switches styling and the type of event it dispatches based on
 * state.
 * @template T
 */
class StatefulButton {
  /**
   * @param {!Element} element
   * @param {!Object<T, string>} eventMapping
   * @param {!Object<T, string>} classMapping
   */
  constructor(element, eventMapping, classMapping) {
    /** @private {?T} */
    this.state_ = null;

    /** @private @const */
    this.eventMapping_ = eventMapping;

    /** @private @const */
    this.classMapping_ = classMapping;

    /** @const */
    this.element = element;

    /** @private {number} */
    this.lastUpdateId_ = 0;

    this.element.addEventListener('click', e => this.onClick_(e));
  }

  /** @param {T} newState */
  update(newState) {
    this.lastUpdateId_++;

    this.state_ = newState;

    Object.keys(this.classMapping_).forEach(state => {
      this.element.classList.toggle(this.classMapping_[state],
          state == newState);
    });
  }

  /** @param {!Promise<T>} statePromise */
  updateOn(statePromise) {
    const updateId = ++this.lastUpdateId_;

    statePromise.then(state => {
      if (updateId !== this.lastUpdateId_) {
        return;
      }
      this.update(state);
    });
  }

  /**
   * @param {!Event} e
   * @private
   */
  onClick_(e) {
    e.preventDefault();
    dispatch(this.element, this.getEventType_(), /* opt_bubbles */ true);
  }

  /**
   * @return {string}
   * @private
   */
  getEventType_() {
    return dev().assert(this.eventMapping_[this.state_], 'NOOP');
  }
}


/**
 * @param {!Document} doc
 * @return {!StatefulButton<ForwardButtonState>}
 */
function createForwardButton(doc) {
  return new StatefulButton(
      renderAsElement(doc, FORWARD_BUTTON),
      {
        [ForwardButtonState.NEXT_PAGE]: EventType.NEXT_PAGE,
        [ForwardButtonState.SHOW_BOOKEND]: EventType.SHOW_BOOKEND,
        [ForwardButtonState.REPLAY]: EventType.REPLAY,
      },
      {
        [ForwardButtonState.NEXT_PAGE]: 'i-amphtml-story-fwd-next',
        [ForwardButtonState.SHOW_BOOKEND]: 'i-amphtml-story-fwd-more',
        [ForwardButtonState.REPLAY]: 'i-amphtml-story-fwd-replay',
      });
}


/**
 * @param {!Document} doc
 * @return {!StatefulButton<BackButtonState>}
 */
function createBackButton(doc) {
  return new StatefulButton(
      renderAsElement(doc, BACK_BUTTON),
      {
        [BackButtonState.PREVIOUS_PAGE]: EventType.PREVIOUS_PAGE,
        [BackButtonState.CLOSE_BOOKEND]: EventType.CLOSE_BOOKEND,
      },
      {
        [BackButtonState.HIDDEN]: 'i-amphtml-story-button-hidden',
        [BackButtonState.PREVIOUS_PAGE]: 'i-amphtml-story-back-prev',
        [BackButtonState.CLOSE_BOOKEND]: 'i-amphtml-story-back-close-bookend',
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

    /** @private @const {!StatefulButton<ForwardButtonState>} */
    this.forwardButton_ = createForwardButton(doc);

    /** @private @const {!StatefulButton<BackButtonState>} */
    this.backButton_ = createBackButton(doc);
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

    forwardButtonEl.addEventListener('mouseenter', () => {
      element.classList.add('i-amphtml-story-next-hover');
    });

    forwardButtonEl.addEventListener('mouseleave', () => {
      element.classList.remove('i-amphtml-story-next-hover');
    });

    backButtonEl.addEventListener('mouseenter', () => {
      element.classList.add('i-amphtml-story-prev-hover');
    });

    backButtonEl.addEventListener('mouseleave', () => {
      element.classList.remove('i-amphtml-story-prev-hover');
    });

    element.appendChild(forwardButtonEl);
    element.appendChild(backButtonEl);
  }

  /** @param {!./navigation-state.StateChangeEventDef} event */
  onNavigationStateChange(event) {
    switch (event.type) {
      case StateChangeType.ACTIVE_PAGE:
        const {pageIndex, totalPages} = event.value;
        this.onPageActive_(pageIndex, totalPages);
        break;

      case StateChangeType.BOOKEND_ENTER:
        this.onBookendEnter_();
        break;

      case StateChangeType.BOOKEND_EXIT:
        this.onLastPageActive_();
        break;
    }
  }

  /**
   * @param {number} pageIndex
   * @param {number} totalPages
   */
  onPageActive_(pageIndex, totalPages) {
    if (pageIndex === totalPages - 1) {
      this.onLastPageActive_();
      return;
    }
    if (pageIndex === 0) {
      this.backButton_.update(BackButtonState.HIDDEN);
    } else {
      this.backButton_.update(BackButtonState.PREVIOUS_PAGE);
    }
    this.forwardButton_.update(ForwardButtonState.NEXT_PAGE);
  }

  /** @private */
  onBookendEnter_() {
    this.backButton_.update(BackButtonState.CLOSE_BOOKEND);
    this.forwardButton_.update(ForwardButtonState.REPLAY);
  }

  /** @private */
  onLastPageActive_() {
    this.backButton_.update(BackButtonState.PREVIOUS_PAGE);
    this.forwardButton_.updateOn(this.hasBookend_().then(hasBookend =>
      hasBookend ?
        ForwardButtonState.SHOW_BOOKEND :
        ForwardButtonState.REPLAY));
  }
}
