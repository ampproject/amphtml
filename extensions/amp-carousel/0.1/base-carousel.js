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
import {timer} from '../../../src/timer';

export class BaseCarousel extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    /** @private {!Element} */
    this.prevButton_;

    /** @private {!Element} */
    this.nextButton_;

    this.buildCarousel();
    this.buildButtons();
    this.setupGestures();
    this.setControlsState();

    /** @const @private {boolean} */
    this.showControls_ = this.element.hasAttribute('controls');

    if (this.showControls_) {
      this.element.classList.add('-amp-carousel-has-controls');
    }
  }

  buildButtons() {
    this.prevButton_ = document.createElement('div');
    this.prevButton_.classList.add('amp-carousel-button');
    this.prevButton_.classList.add('amp-carousel-button-prev');
    this.prevButton_.setAttribute('role', 'button');
    // TODO(erwinm): Does label need i18n support in the future? or provide
    // a way to be overridden.
    this.prevButton_.setAttribute('aria-label', 'previous');
    this.prevButton_.onclick = () => {
      this.interactionPrev();
    };
    this.element.appendChild(this.prevButton_);

    this.nextButton_ = document.createElement('div');
    this.nextButton_.classList.add('amp-carousel-button');
    this.nextButton_.classList.add('amp-carousel-button-next');
    this.nextButton_.setAttribute('role', 'button');
    this.nextButton_.setAttribute('aria-label', 'next');
    this.nextButton_.onclick = () => {
      this.interactionNext();
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

  /**
   * Subclasses should override this method to build the UI for the carousel.
   */
  buildCarousel() {
    // Subclasses may override.
  }

  /**
   * Subclasses should override this method to configure gestures for carousel.
   */
  setupGestures() {
    // Subclasses may override.
  }

  /**
   * Calls `goCallback` and any additional work needed to proceed to next
   * desired direction.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   */
  go(dir, animate) {
    this.goCallback(dir, animate);
  }

  /**
   * Proceeds to the next slide in the desired direction.
   * @param {number} unusedDir -1 or 1
   * @param {boolean} unusedAnimate
   */
  goCallback(unusedDir, unusedAnimate) {
    // Subclasses may override.
  }

  /**
   * Sets the previous and next button visual states.
   */
  setControlsState() {
    this.prevButton_.classList.toggle('amp-disabled', !this.hasPrev());
    this.prevButton_.setAttribute('aria-disabled', !this.hasPrev());
    this.nextButton_.classList.toggle('amp-disabled', !this.hasNext());
    this.nextButton_.setAttribute('aria-disabled', !this.hasNext());
  }

  /**
   * Shows the controls and then fades them away.
   */
  hintControls() {
    if (this.showControls_ || !this.isInViewport()) {
      return;
    }
    this.getVsync().mutate(() => {
      const className = '-amp-carousel-button-start-hint';
      this.element.classList.add(className);
      timer.delay(() => {
        this.deferMutate(() => this.element.classList.remove(className));
      }, 1000);
    });
  }

  /**
   * @return {boolean}
   * @override
   */
  isReadyToBuild() {
    // TODO(dvoytenko, #1014): Review and try a more immediate approach.
    // Wait until DOMReady.
    return false;
  }

  /** @override */
  documentInactiveCallback() {
    return true;
  }

  /**
   * @return {boolean}
   */
  hasPrev() {
    // Subclasses may override.
  }

  /**
   * @return {boolean}
   */
  hasNext() {
    // Subclasses may override.
  }

  /**
   * Called on user interaction to proceed to the next item/position.
   */
  interactionNext() {
    if (!this.nextButton_.classList.contains('amp-disabled')) {
      this.go(1, true);
    }
  }

  /**
   * Called on user interaction to proceed to the previous item/position.
   */
  interactionPrev() {
    if (!this.prevButton_.classList.contains('amp-disabled')) {
      this.go(-1, true);
    }
  }
}
