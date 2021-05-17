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
export class AmpStoryBackground {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    /** @private @const {!Element} */
    this.element_ = element;

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const */
    this.container_ = this.element_.ownerDocument.createElement('div');
    this.container_.classList.add('i-amphtml-story-background-container');

    /** @private {!Element} */
    this.canvas_ = this.createCanvas_();
    this.canvas_.width = 10;
    this.canvas_.height = 10;
    this.ctx_ = this.canvas_.getContext('2d');
    this.container_.appendChild(this.canvas_);
  }

  /**
   * @return {!Element}
   */
  createCanvas_() {
    const canvas = this.element_.ownerDocument.createElement('canvas');
    canvas.classList.add('i-amphtml-story-background-canvas');
    return canvas;
  }

  /**
   * Attach the backgrounds to the document.
   */
  attach() {
    this.element_.insertBefore(this.container_, this.element_.firstChild);
  }

  /**
   * Update the background with new background image URL.
   * @param {string} color
   * @param {?string} url
   * @param {boolean=} initial
   */
  setBackground(color, element, initial = false) {
    if (color) {
      this.ctx_.fillStyle = color;
      this.ctx_.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
    }
    if (!element) return;
    this.ctx_.drawImage(element, 0, 0, this.canvas_.width, this.canvas_.height);
  }
}
