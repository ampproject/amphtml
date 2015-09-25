/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

export class BaseCarousel extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    this.buildCarousel();
  }

  addButtons() {
    this.prevButton_ = document.createElement('button');
    this.prevButton_.textContent = '\u276E';
    this.prevButton_.classList.add('-amp-carousel-button');
    this.prevButton_.classList.add('-amp-carousel-button-prev');
    this.prevButton_.onclick = () => {
      this.go(-1, true);
    };
    this.element.appendChild(this.prevButton_);

    this.nextButton_ = document.createElement('button');
    this.nextButton_.textContent = '\u276F';
    this.nextButton_.classList.add('-amp-carousel-button');
    this.nextButton_.classList.add('-amp-carousel-button-next');
    this.nextButton_.onclick = () => {
      this.go(1, true);
    };
    this.element.appendChild(this.nextButton_);
  }

  /** @override */
  prerenderAllowed() {
    return true;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  buildCarousel() {
    // Subclasses may override.
  }

  /**
   * Override in subclass to provide a way to switch to an image through its
   * index placement.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   * @override
   */
  go() {
    // Subclasses may override.
  }

  /**
   * @return {boolean}
   * @override
   */
  isReadyToBuild() {
    return this.getRealChildren().length > 0;
  }
}
