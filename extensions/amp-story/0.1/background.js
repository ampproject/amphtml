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

import {setStyle, resetStyles} from '../../../src/style';

const BACKGROUND_CLASS = 'i-amphtml-story-background';

const BACKGROUND_CONTAINER_CLASS = 'i-amphtml-story-background-container';

const BACKGROUND_OVERLAY_CLASS = 'i-amphtml-story-background-overlay';

/**
 * TODO(cvializ): Investigate pre-rendering blurred backgrounds to canvas to
 * possibly improve performance?
 */
export class AmpStoryBackground {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    this.element = element;

    this.bgMap_ = {};

    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.classList.add(BACKGROUND_CONTAINER_CLASS);
    this.containerOverlay_ = this.element.ownerDocument.createElement('div');
    this.containerOverlay_.classList.add(BACKGROUND_OVERLAY_CLASS);

    this.hidden_ = this.createBackground_();
    this.active_ = this.createBackground_();
    this.container_.appendChild(this.hidden_);
    this.container_.appendChild(this.active_);
    this.container_.appendChild(this.containerOverlay_);
  }

  /**
   * @return {!Element}
   */
  createBackground_() {
    const bg = this.element.ownerDocument.createElement('div');
    bg.classList.add(BACKGROUND_CLASS);
    return bg;
  }

  /**
   * Attach the backgrounds to the document.
   */
  attach() {
    this.element.insertBefore(this.container_, this.element.firstChild);
  }

  /**
   * Update the background with new background image URL.
   * @param {?string} newUrl
   */
  setBackground(newUrl) {
    if (!newUrl) {
      return;
    }

    setStyle(this.hidden_, 'background-image', `url(${newUrl})`);
    this.rotateActiveBackground_();
  }

  /**
   * Removes background image from page background.
   */
  removeBackground() {
    resetStyles(this.hidden_, ['background-image']);
    this.rotateActiveBackground_();
  }

  /**
   * Rotates the classes on page background to bring the new bacground in foreground.
   * @private
   */
  rotateActiveBackground_() {
    const newHidden = this.active_;
    this.active_ = this.hidden_;
    this.hidden_ = newHidden;
    this.active_.classList.add('active');
    this.hidden_.classList.remove('active');
  }
}
