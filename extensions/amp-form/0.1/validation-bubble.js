/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {removeChildren} from '../../../src/dom';
import {setStyles} from '../../../src/style';

/** @type {string} */
const OBJ_PROP = '__BUBBLE_OBJ';

export class ValidationBubble {

  /**
   * Creates a bubble component to display messages in.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} id
   */
  constructor(ampdoc, id) {
    /** @private @const {string} */
    this.id_ = id;

    /** @private @const {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    /** @private {?Element} */
    this.currentTargetElement_ = null;

    /** @private {string} */
    this.currentMessage_ = '';

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private @const {!Element} */
    this.bubbleElement_ = ampdoc.win.document.createElement('div');

    this.bubbleElement_.classList.add('i-amphtml-validation-bubble');
    this.bubbleElement_[OBJ_PROP] = this;
    ampdoc.getBody().appendChild(this.bubbleElement_);
  }

  /**
   * @return {boolean}
   */
  isActiveOn(element) {
    return this.isVisible_ && element == this.currentTargetElement_;
  }

  /**
   * Hides the bubble off screen.
   */
  hide() {
    if (!this.isVisible_) {
      return;
    }

    this.isVisible_ = false;
    this.currentTargetElement_ = null;
    this.currentMessage_ = '';

    this.vsync_.run({
      measure: undefined,
      mutate: hideBubble,
    }, {
      bubbleElement: this.bubbleElement_,
    });
  }

  /**
   * Shows the bubble targeted to an element with the passed message.
   * @param {!Element} targetElement
   * @param {string} message
   */
  show(targetElement, message) {
    if (this.isActiveOn(targetElement) && message == this.currentMessage_) {
      return;
    }

    this.isVisible_ = true;
    this.currentTargetElement_ = targetElement;
    this.currentMessage_ = message;
    const state = {
      message,
      targetElement,
      bubbleElement: this.bubbleElement_,
      viewport: this.viewport_,
      id: this.id_,
    };
    this.vsync_.run({
      measure: measureTargetElement,
      mutate: showBubbleElement,
    }, state);
  }
}


/**
 * Hides the bubble element passed through state object.
 * @param {!Object} state
 * @private
 */
function hideBubble(state) {
  state.bubbleElement.removeAttribute('aria-alert');
  state.bubbleElement.removeAttribute('role');
  removeChildren(state.bubbleElement);
  setStyles(state.bubbleElement, {
    display: 'none',
  });
}


/**
 * Measures the layout for the target element passed through state object.
 * @param {!Object} state
 * @private
 */
function measureTargetElement(state) {
  state.targetRect = state.viewport.getLayoutRect(state.targetElement);
}


/**
 * Updates text content, positions and displays the bubble.
 * @param {!Object} state
 * @private
 */
function showBubbleElement(state) {
  removeChildren(state.bubbleElement);
  const messageDiv = state.bubbleElement.ownerDocument.createElement('div');
  messageDiv.id = `bubble-message-${state.id}`;
  messageDiv.textContent = state.message;
  state.bubbleElement.setAttribute('aria-labeledby', messageDiv.id);
  state.bubbleElement.setAttribute('role', 'alert');
  state.bubbleElement.setAttribute('aria-live', 'assertive');
  state.bubbleElement.appendChild(messageDiv);
  setStyles(state.bubbleElement, {
    display: 'block',
    top: `${state.targetRect.top - 10}px`,
    left: `${state.targetRect.left + state.targetRect.width / 2}px`,
  });
}
