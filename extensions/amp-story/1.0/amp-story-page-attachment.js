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

import {Action, getStoreService} from './amp-story-store-service';
import {Layout} from '../../../src/layout';
import {closest} from '../../../src/dom';
import {dev} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
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
      <div class="i-amphtml-story-page-attachment-header">
        <span
            class="i-amphtml-story-page-attachment-close-button" role="button">
        </span>
      </div>
      <div class="i-amphtml-story-page-attachment-container">
        <div class="i-amphtml-story-page-attachment-content"></div>
      </div>
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
    // TODO: maybe render the header in Shadow DOM?
    const templateEl = getTemplateEl(this.element);

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
    this.element.querySelector('.i-amphtml-story-page-attachment-close-button')
        .addEventListener('click', () => this.close_(), true /** useCapture */);

    // Enforced by AMP validation rules.
    const storyPageEl = this.element.parentElement;

    storyPageEl.addEventListener(
        'touchstart', this.onTouchStart_.bind(this), true /** useCapture */);
    storyPageEl.addEventListener(
        'touchmove', this.onTouchMove_.bind(this), true /** useCapture */);
    storyPageEl.addEventListener(
        'touchend', this.onTouchEnd_.bind(this), true /** useCapture */);
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
      this.element.classList.add('i-amphtml-story-page-attachment-dragging');
      setImportantStyles(
          this.element, {transform: translate, transition: 'none'});
    });
  }

  /**
   * Fully opens the attachment from its current position.
   * @public
   */
  open() {
    if (this.state_ === AttachmentState.OPEN) {
      return;
    }

    this.state_ = AttachmentState.OPEN;

    this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);

    this.mutateElement(() => {
      resetStyles(this.element, ['transform', 'transition']);
      this.element.classList.add('i-amphtml-story-page-attachment-open');
      this.element.classList.remove('i-amphtml-story-page-attachment-dragging');
      toggle(dev().assertElement(this.containerEl_), true);
    });
  }

  /**
   * Fully closes the attachment from its current position.
   * @private
   */
  close_() {
    if (this.state_ === AttachmentState.CLOSED) {
      return;
    }

    this.state_ = AttachmentState.CLOSED;

    this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);

    this.mutateElement(() => {
      resetStyles(this.element, ['transform', 'transition']);
      this.element.classList.remove('i-amphtml-story-page-attachment-open');
      this.element.classList.remove('i-amphtml-story-page-attachment-dragging');
      // Note: if you change the duration here, you'll also have to change the
      // animation duration in the CSS.
      setTimeout(
          () => toggle(dev().assertElement(this.containerEl_), false), 250);
    });
  }
}
