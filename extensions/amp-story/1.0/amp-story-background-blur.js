/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {setImportantStyles} from '#core/dom/style';
import {user} from '../../../src/log';

/** @const {number} */
const CANVAS_SIZE = 3;

/** @const {number} */
const DURATION_MS = 200;

export class backgroundBlur {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private @const {!Element} */
    this.canvas_ = null;

    /**  @private {!number} */
    this.currentRAF_ = null;
  }

  /**
   * Setup canvas and attach it to the document.
   */
  attach() {
    this.canvas_ = this.win_.document.createElement('canvas');
    this.canvas_.width = this.canvas_.height = CANVAS_SIZE;
    setImportantStyles(this.canvas_, {
      width: '100%',
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
    });
    this.element_.appendChild(this.canvas_);
  }

  /**
   * Remove canvas from the document.
   */
  detach() {
    this.element_.removeChild(this.canvas_);
  }

  /**
   * Update the background to the specified page's background.
   * @param {!Element} pageElement
   */
  update(pageElement) {
    const fillElement = this.getBiggestImage_(pageElement);
    if (!fillElement) {
      user().info('No image found for background blur.');
    }
    this.animate_(fillElement);
  }

  /**
   * Animated background transition.
   * @private
   * @param {?Element} fillElement
   */
  animate_(fillElement) {
    const context = this.canvas_.getContext('2d');
    let startTime;
    const nextFrame = (currTime) => {
      if (!startTime) {
        startTime = currTime;
      }
      const elapsed = currTime - startTime;
      if (elapsed < DURATION_MS) {
        const easing = 1 - Math.pow(1 - elapsed / DURATION_MS, 2);
        context.globalAlpha = easing;
        context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        if (fillElement) {
          context.drawImage(fillElement, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        }
        this.currentRAF_ = requestAnimationFrame(nextFrame);
      }
    };
    // Cancels the previous animation loop before starting a new one.
    cancelAnimationFrame(this.currentRAF_);
    this.currentRAF_ = requestAnimationFrame(nextFrame);
  }

  /**
   * Get active page's largest image element.
   * @private
   * @param {!Element} pageElement
   * @return {?Element} An img element or null.
   */
  getBiggestImage_(pageElement) {
    const getSize = (el) => el && el.offsetWidth * el.offsetHeight;
    return Array.from(
      pageElement.querySelectorAll('amp-story-grid-layer img')
    ).sort((firstEl, secondEl) => getSize(secondEl) - getSize(firstEl))[0];
  }
}
