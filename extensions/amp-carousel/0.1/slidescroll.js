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

export class AmpSlideScroll extends BaseCarousel {
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
  }
  /** @override */
  buildCarousel() {
    this.element.classList.add('-amp-slidescroll');

    /** @private {!Array<!Element>} */
    this.slides_ = this.getRealChildren();

    this.slides_.forEach(slide => {
      this.setAsOwner(slide);
      slide.classList.add('-amp-slide-item');
    });
  }

  /** @override */
  layoutCallback() {
    return Promise.resolve();
  }

  /** @override */
  viewportCallback(inViewport) {
    if (inViewport) {
      this.hintControls();
    }
  }

  /** @override */
  setupGestures() {
  }

  /** @override */
  hasPrev() {
  }

  /** @override */
  hasNext() {
  }
}
