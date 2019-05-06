/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {CSS} from '../../../build/amp-story-page-attachment-header-1.0.css';
import {
  HistoryState,
  createShadowRootWithStyle,
  setHistoryState,
} from './utils';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {closest} from '../../../src/dom';
import {dev} from '../../../src/log';
import {getState} from '../../../src/history';
import {htmlFor} from '../../../src/static-template';
import {listen} from '../../../src/event-helper';
import {resetStyles, setImportantStyles, toggle} from '../../../src/style';

/** @const {number} */
const TOGGLE_THRESHOLD_PX = 50;

/**
 * @enum {number}
 */
const AttachmentState = {
  CLOSED: 0,
  DRAGGING_TO_CLOSE: 1,
  DRAGGING_TO_OPEN: 2,
  OPEN: 3,
};

/**
 * Drawer's template.
 * @param {!Element} element
 * @return {!Element}
 */
const getTemplateEl = element => {
  return htmlFor(element)`
    <div class="i-amphtml-story-page-attachment">
      <div class="i-amphtml-story-page-attachment-container">
        <div class="i-amphtml-story-page-attachment-content"></div>
      </div>
    </div>`;
};

/**
 * Drawer's header template.
 * @param {!Element} element
 * @return {!Element}
 */
const getHeaderEl = element => {
  return htmlFor(element)`
    <div class="i-amphtml-story-page-attachment-header">
      <span
          class="i-amphtml-story-page-attachment-close-button" role="button">
      </span>
      <span class="i-amphtml-story-page-attachment-title"></span>
    </div>`;
};

/**
 * AMP Story page attachment.
 */
export class AmpStoryPageAttachment extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.containerEl_ = null;

    /** @private {?Element} */
    this.contentEl_ = null;

    /** @private {?Element} */
    this.headerEl_ = null;

    /** @type {!../../../src/service/history-impl.History} */
    this.historyService_ = Services.historyForDoc(this.element);

    /** @private {!AttachmentState} */
    this.state_ = AttachmentState.CLOSED;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @private {boolean} */
    this.ignoreCurrentSwipeYGesture_ = false;

    /** @private {!Object} */
    this.touchEventState_ = {
      startX: 0,
      startY: 0,
      lastY: 0,
      swipingUp: null,
      isSwipeY: null,
    };

    /** @private {!Array<function()>} */
    this.touchEventUnlisteners_ = [];
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }

  /** @override */
  prerenderAllowed() {
    return false;
  }

  /** @override */
  buildCallback() {
    const templateEl = getTemplateEl(this.element);
    const headerShadowRootEl = this.win.document.createElement('div');
    this.headerEl_ = getHeaderEl(this.element);

    if (this.element.hasAttribute('data-title')) {
      this.headerEl_
          .querySelector('.i-amphtml-story-page-attachment-title')
          .textContent = this.element.getAttribute('data-title');
    }

    createShadowRootWithStyle(headerShadowRootEl, this.headerEl_, CSS);
    templateEl.insertBefore(headerShadowRootEl, templateEl.firstChild);

    this.containerEl_ = dev().assertElement(
        templateEl.querySelector('.i-amphtml-story-page-attachment-container'));
    this.contentEl_ = dev().assertElement(this.containerEl_
        .querySelector('.i-amphtml-story-page-attachment-content'));

    while (this.element.firstChild) {
      this.contentEl_.appendChild(this.element.firstChild);
    }

    this.element.appendChild(templateEl);

    // Ensures the content of the attachment won't be rendered/loaded until we
    // actually need it.
    toggle(this.containerEl_, false);
    toggle(this.element, true);

    this.initializeListeners_();
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.headerEl_
        .querySelector('.i-amphtml-story-page-attachment-close-button')
        .addEventListener('click', () => this.close_(), true /** useCapture */);

    // Always open links in a new tab.
    this.contentEl_.addEventListener('click', event => {
      const {target} = event;
      if (target.tagName.toLowerCase() === 'a') {
        target.setAttribute('target', '_blank');
      }
    }, true /** useCapture */);

    // Closes the attachment on opacity background clicks.
    this.element.addEventListener('click', event => {
      if (event.target.tagName.toLowerCase() === 'amp-story-page-attachment') {
        this.close_();
      }
    }, true /** useCapture */);

    this.storeService_.subscribe(StateProperty.UI_STATE, uiState => {
      this.onUIStateUpdate_(uiState);
    }, true /** callToInitialize */);
  }

  /**
   * Reacts to UI state updates.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    uiState === UIType.MOBILE ?
      this.startListeningForTouchEvents_() :
      this.stopListeningForTouchEvents_();
  }

  /**
   * @private
   */
  startListeningForTouchEvents_() {
    // Enforced by AMP validation rules.
    const storyPageEl = dev().assertElement(this.element.parentElement);

    this.touchEventUnlisteners_.push(
        listen(storyPageEl, 'touchstart', this.onTouchStart_.bind(this),
            {capture: true}));
    this.touchEventUnlisteners_.push(
        listen(storyPageEl, 'touchmove', this.onTouchMove_.bind(this),
            {capture: true}));
    this.touchEventUnlisteners_.push(
        listen(storyPageEl, 'touchend', this.onTouchEnd_.bind(this),
            {capture: true}));
  }

  /**
   * @private
   */
  stopListeningForTouchEvents_() {
    this.touchEventUnlisteners_.forEach(fn => fn());
    this.touchEventUnlisteners_ = [];
  }

  /**
   * Helper to retrieve the touch coordinates from a TouchEvent.
   * @param {!Event} event
   * @return {?{x: number, y: number}}
   * @private
   */
  getClientTouchCoordinates_(event) {
    const {touches} = event;
    if (!touches || touches.length < 1) {
      return null;
    }

    const {clientX: x, clientY: y} = touches[0];
    return {x, y};
  }

  /**
   * Handles touchstart events to detect swipeY interactions.
   * @param {!Event} event
   * @private
   */
  onTouchStart_(event) {
    const coordinates = this.getClientTouchCoordinates_(event);
    if (!coordinates) {
      return;
    }

    this.touchEventState_.startX = coordinates.x;
    this.touchEventState_.startY = coordinates.y;
  }

  /**
   * Handles touchmove events to detect swipeY interactions.
   * @param {!Event} event
   * @private
   */
  onTouchMove_(event) {
    if (this.touchEventState_.isSwipeY === false) {
      return;
    }

    event.stopPropagation();

    const coordinates = this.getClientTouchCoordinates_(event);
    if (!coordinates) {
      return;
    }

    const {x, y} = coordinates;

    if (this.touchEventState_.isSwipeY === null) {
      this.touchEventState_.isSwipeY =
          Math.abs(this.touchEventState_.startY - y) >
              Math.abs(this.touchEventState_.startX - x);
      if (!this.touchEventState_.isSwipeY) {
        return;
      }
    }

    this.touchEventState_.swipingUp = y < this.touchEventState_.lastY;
    this.touchEventState_.lastY = y;

    this.onSwipeY_({
      event,
      data: {
        swipingUp: this.touchEventState_.swipingUp,
        deltaY: y - this.touchEventState_.startY,
        last: false,
      },
    });
  }

  /**
   * Handles touchend events to detect swipeY interactions.
   * @param {!Event} event
   * @private
   */
  onTouchEnd_(event) {
    if (this.touchEventState_.isSwipeY === true) {
      this.onSwipeY_({
        event,
        data: {
          swipingUp: this.touchEventState_.swipingUp,
          deltaY: this.touchEventState_.lastY - this.touchEventState_.startY,
          last: true,
        },
      });
    }

    this.touchEventState_.startX = 0;
    this.touchEventState_.startY = 0;
    this.touchEventState_.lastY = 0;
    this.touchEventState_.swipingUp = null;
    this.touchEventState_.isSwipeY = null;
  }

  /**
   * Handles swipeY events, detected by the touch events listeners.
   * @param {{event: !Event, data: !Object}} gesture
   * @private
   */
  onSwipeY_(gesture) {
    const {data} = gesture;

    if (this.ignoreCurrentSwipeYGesture_ === true) {
      this.ignoreCurrentSwipeYGesture_ = !data.last;
      return;
    }

    const {deltaY, swipingUp} = data;

    // If the attachment is open, figure out if the user is trying to scroll the
    // content, or actually close the attachment.
    if (this.state_ === AttachmentState.OPEN) {
      const isContentSwipe = this.isAttachmentContentDescendant_(
          dev().assertElement(gesture.event.target));

      // If user is swiping up, exit so the event bubbles up and maybe scrolls
      // the attachment content.
      // If user is swiping down and scrollTop is above zero, exit and let the
      // user scroll the content.
      // If user is swiping down and scrollTop is zero, don't exit and start
      // dragging/closing the attachment.
      if ((isContentSwipe && deltaY < 0) ||
          (isContentSwipe && deltaY > 0 &&
              this.containerEl_./*OK*/scrollTop > 0)) {
        this.ignoreCurrentSwipeYGesture_ = true;
        return;
      }
    }

    gesture.event.preventDefault();

    if (data.last === true) {
      if (this.state_ === AttachmentState.DRAGGING_TO_CLOSE) {
        (!swipingUp && deltaY > TOGGLE_THRESHOLD_PX) ?
          this.close_() :
          this.open();
      }

      if (this.state_ === AttachmentState.DRAGGING_TO_OPEN) {
        (swipingUp && -deltaY > TOGGLE_THRESHOLD_PX) ?
          this.open() :
          this.close_();
      }
      return;
    }

    this.drag_(deltaY);
  }

  /**
   * Whether the element is a descendant of attachment-content.
   * @param {!Element} element
   * @return {boolean}
   * @private
   */
  isAttachmentContentDescendant_(element) {
    return !!closest(element, el => {
      return el.classList.contains('i-amphtml-story-page-attachment-content');
    }, /* opt_stopAt */ this.element);
  }

  /**
   * Drags the attachment on the screen upon user interaction.
   * @param {number} deltaY
   * @private
   */
  drag_(deltaY) {
    let translate;

    switch (this.state_) {
      case AttachmentState.CLOSED:
      case AttachmentState.DRAGGING_TO_OPEN:
        if (deltaY > 0) {
          return;
        }
        this.state_ = AttachmentState.DRAGGING_TO_OPEN;
        translate = `translate3d(0, calc(100% + ${deltaY}px), 0)`;
        break;
      case AttachmentState.OPEN:
      case AttachmentState.DRAGGING_TO_CLOSE:
        if (deltaY < 0) {
          return;
        }
        this.state_ = AttachmentState.DRAGGING_TO_CLOSE;
        translate = `translate3d(0, ${deltaY}px, 0)`;
        break;
    }

    this.mutateElement(() => {
      setImportantStyles(
          this.element, {transform: translate, transition: 'none'});
    });
  }

  /**
   * Fully opens the attachment from its current position.
   * @param {boolean=} shouldAnimate
   */
  open(shouldAnimate = true) {
    if (this.state_ === AttachmentState.OPEN) {
      return;
    }

    this.state_ = AttachmentState.OPEN;

    this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

    this.mutateElement(() => {
      resetStyles(this.element, ['transform', 'transition']);

      if (!shouldAnimate) {
        // Resets the 'transition' property, and removes this override in the
        // next frame, after the element is positioned.
        setImportantStyles(this.element, {transition: 'initial'});
        this.mutateElement(() => resetStyles(this.element, ['transition']));
      }

      this.element.classList.add('i-amphtml-story-page-attachment-open');
      toggle(dev().assertElement(this.containerEl_), true);
    });

    const currentHistoryState = /** @type {!Object} */
        (getState(this.win.history));
    const historyState = Object.assign({}, currentHistoryState, {
      [HistoryState.ATTACHMENT_PAGE_ID]:
          this.storeService_.get(StateProperty.CURRENT_PAGE_ID),
    });

    this.historyService_.push(() => this.closeInternal_(), historyState);
  }

  /**
   * Ensures the history state we added when opening the attachment is popped,
   * and closes the attachment either directly, or through the onPop callback.
   * @private
   */
  close_() {
    switch (this.state_) {
      // If the attachment was open, pop the history entry that was added, which
      // will close the attachment through the onPop callback.
      case AttachmentState.OPEN:
      case AttachmentState.DRAGGING_TO_CLOSE:
        this.historyService_.goBack();
        break;
      // If the attachment was not open, no history entry was added, so we can
      // close the attachment directly.
      case AttachmentState.DRAGGING_TO_OPEN:
        this.closeInternal_();
        break;
    }
  }

  /**
   * Fully closes the attachment from its current position.
   * @private
   */
  closeInternal_() {
    if (this.state_ === AttachmentState.CLOSED) {
      return;
    }

    this.state_ = AttachmentState.CLOSED;

    this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, false);

    this.mutateElement(() => {
      resetStyles(this.element, ['transform', 'transition']);
      this.element.classList.remove('i-amphtml-story-page-attachment-open');
      // Note: if you change the duration here, you'll also have to change the
      // animation duration in the CSS.
      setTimeout(
          () => toggle(dev().assertElement(this.containerEl_), false), 250);
    });

    setHistoryState(this.win, HistoryState.ATTACHMENT_PAGE_ID, null);
  }
}
