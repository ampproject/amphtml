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

import {CommonSignals} from '#core/constants/common-signals';
import {scopedQuerySelectorAll} from '#core/dom/query';
import {setImportantStyles} from '#core/dom/style';
import {user} from '../../../src/log';
import {whenUpgradedToCustomElement} from '../../../src/amp-element-helpers';

/** @const {number} */
const CANVAS_SIZE = 3;

/** @const {number} */
const DURATION_MS = 200;

/** @const {string} */
const CLASS_NAME = 'BACKGROUND-BLUR';

export class BackgroundBlur {
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

    /**  @private {?number} */
    this.currentRAF_ = null;

    /**  @private {?boolean} */
    this.firstLoad = true;
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
   * Remove canvas from the document and cancel the RAF.
   */
  detach() {
    this.element_.removeChild(this.canvas_);
    cancelAnimationFrame(this.currentRAF_);
  }

  /**
   * Update the background to the specified page's background.
   * @param {!Element} pageElement
   */
  update(pageElement) {
    const ampImgEl = this.getBiggestImage_(pageElement);
    if (!ampImgEl) {
      user().info(CLASS_NAME, 'No image found for background blur.');
      this.animate_();
      return;
    }

    // Ensures img element exists and is loaded.
    whenUpgradedToCustomElement(ampImgEl)
      .then(() => ampImgEl.signals().whenSignal(CommonSignals.LOAD_END))
      .then(
        () => {
          this.animate_(ampImgEl.querySelector('img'));
        },
        () => {
          user().error(CLASS_NAME, 'Failed to load the amp-img.');
        }
      );
  }

  /**
   * Animated background transition.
   * @private
   * @param {?Element} fillElement
   */
  animate_(fillElement) {
    const context = this.canvas_.getContext('2d');

    const draw = (easing) => {
      context.globalAlpha = easing;
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      if (fillElement) {
        context.drawImage(fillElement, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
    };

    // Do not animate on first load.
    if (this.firstLoad) {
      draw(1 /** easing **/);
      this.firstLoad = false;
      return;
    }

    // Animation loop for fade.
    let startTime;
    const nextFrame = (currTime) => {
      if (!startTime) {
        startTime = currTime;
      }
      const elapsed = currTime - startTime;
      if (elapsed < DURATION_MS) {
        const easing = 1 - Math.pow(1 - elapsed / DURATION_MS, 2);
        draw(easing);
        this.currentRAF_ = requestAnimationFrame(nextFrame);
      }
    };
    // Cancels the previous animation loop before starting a new one.
    cancelAnimationFrame(this.currentRAF_);
    this.currentRAF_ = requestAnimationFrame(nextFrame);
  }

  /**
   * Get active page's biggest amp-img element.
   * @private
   * @param {!Element} pageElement
   * @return {?Element} An amp-img element or null.
   */
  getBiggestImage_(pageElement) {
    const getSize = (el) => {
      if (!el) {
        return false;
      }
      const layoutBox = el.getLayoutBox();
      return layoutBox.width * layoutBox.height;
    };
    return Array.from(
      scopedQuerySelectorAll(pageElement, 'amp-story-grid-layer amp-img')
    ).sort((firstEl, secondEl) => getSize(secondEl) - getSize(firstEl))[0];
  }
}
