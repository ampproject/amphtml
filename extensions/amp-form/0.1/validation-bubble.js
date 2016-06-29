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

import {vsyncFor} from '../../../src/vsync';
import {viewportFor} from '../../../src/viewport';
import {setStyles} from '../../../src/style';

/** @type {string} */
const OBJ_PROP = '__BUBBLE_OBJ';

export class ValidationBubble {

  /**
   * Creates a bubble component to display messages in.
   * @param {!Window} win
   */
  constructor(win) {

    /** @private @const {!Viewport} */
    this.viewport_ = viewportFor(win);

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(win);

    /** @private @const {!HTMLDivElement} */
    this.bubbleElement_ = win.document.createElement('div');
    this.bubbleElement_.classList.add('-amp-validation-bubble');
    this.bubbleElement_[OBJ_PROP] = this;
    win.document.body.appendChild(this.bubbleElement_);
  }

  /**
   * Hides the bubble off screen.
   */
  hide() {
    // TODO(#3776): Use .mutate method when it supports passing state.
    this.vsync_.run({
      measure: undefined,
      mutate: hideBubble,
    }, {
      bubbleElement: this.bubbleElement_,
    });
  }

  /**
   * Shows the bubble targeted to an element with the passed message.
   * @param {!HTMLElement} targetElement
   * @param {string} message
   */
  show(targetElement, message) {
    const state = {
      message,
      targetElement,
      bubbleElement: this.bubbleElement_,
      viewport: this.viewport_,
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
  state.bubbleElement.textContent = state.message;
  setStyles(state.bubbleElement, {
    display: 'block',
    top: `${state.targetRect.top - 10}px`,
    left: `${state.targetRect.left + state.targetRect.width / 2}px`,
  });
}
