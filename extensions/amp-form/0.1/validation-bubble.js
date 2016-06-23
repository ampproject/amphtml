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

const EDGE = '-99999px';

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
    win.document.body.appendChild(this.bubbleElement_);
  }

  /**
   * Hides the bubble off screen.
   */
  hide() {
    this.vsync_.mutate(() => {
      setStyles(this.bubbleElement_, {
        top: EDGE,
        left: EDGE,
      });
    });
  }

  /**
   * Shows the bubble targeted to an element with the passed message.
   * @param {!HTMLElement} targetElement
   * @param {string} message
   */
  show(targetElement, message) {
    this.bubbleElement_.textContent = message;

    let targetRect;
    let bubbleRect;
    this.vsync_.run({
      measure: () => {
        targetRect = this.viewport_.getLayoutRect(targetElement);
        bubbleRect = this.viewport_.getLayoutRect(this.bubbleElement_);
      },
      mutate: () => {
        setStyles(this.bubbleElement_, {
          top: `${this.computeTop_(bubbleRect, targetRect)}px`,
          left: `${this.computeLeft_(bubbleRect, targetRect)}px`,
        });
      },
    });
  }

  /**
   * Computes the left position of the bubble.
   * @param {!../../../src/layout-rect.LayoutRectDef} bubbleRect
   * @param {!../../../src/layout-rect.LayoutRectDef} targetRect
   * @return {number}
   * @private
   */
  computeLeft_(bubbleRect, targetRect) {
    return (targetRect.left -
        // Center the bubble relative to the target element.
        (bubbleRect.width - targetRect.width) / 2);
  }

  /**
   * Computes the left position of the bubble.
   * @param {!../../../src/layout-rect.LayoutRectDef} bubbleRect
   * @param {!../../../src/layout-rect.LayoutRectDef} targetRect
   * @return {number}
   * @private
   */
  computeTop_(bubbleRect, targetRect) {
    return (targetRect.top -
        // Move the bubble the height of the bubble box.
        bubbleRect.height -
        // Account for the bubble caret and some margin from the input field.
        10);
  }
}
