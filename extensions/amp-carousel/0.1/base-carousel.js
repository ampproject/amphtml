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
import {Keys} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';

/**
 * @abstract
 */
export class BaseCarousel extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.prevButton_ = null;

    /** @private {?Element} */
    this.nextButton_ = null;

    /** @private {boolean} */
    this.showControls_ = false;
  }

  /** @override */
  buildCallback() {
    const input = Services.inputFor(this.win);
    this.showControls_ =
      input.isMouseDetected() || this.element.hasAttribute('controls');

    if (this.showControls_) {
      this.element.classList.add('i-amphtml-carousel-has-controls');
    }
    this.buildCarousel();
    this.buildButtons();
    this.setupGestures();
    this.setControlsState();
  }

  /** @override */
  viewportCallback(inViewport) {
    this.onViewportCallback(inViewport);
    if (inViewport) {
      this.hintControls();
    }
  }

  /**
   * Handles element specific viewport based events.
   * @param {boolean} unusedInViewport
   * @protected
   */
  onViewportCallback(unusedInViewport) {}

  /**
   * Builds a carousel button for next/prev.
   * @param {string} className
   * @param {function()} onInteraction
   */
  buildButton(className, onInteraction) {
    const button = this.element.ownerDocument.createElement('div');
    button.tabIndex = 0;
    button.classList.add('amp-carousel-button');
    button.classList.add(className);
    button.setAttribute('role', 'button');
    button.onkeydown = event => {
      if (event.key == Keys.ENTER || event.key == Keys.SPACE) {
        if (!event.defaultPrevented) {
          event.preventDefault();
          onInteraction();
        }
      }
    };
    button.onclick = onInteraction;

    return button;
  }

  /**
   * Builds the next and previous buttons.
   */
  buildButtons() {
    this.prevButton_ = this.buildButton('amp-carousel-button-prev', () => {
      this.interactionPrev();
    });
    this.element.appendChild(this.prevButton_);

    this.nextButton_ = this.buildButton('amp-carousel-button-next', () => {
      this.interactionNext();
    });
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
   * @abstract
   */
  buildCarousel() {
    // Subclasses may override.
  }

  /**
   * Subclasses may override this method to configure gestures for carousel.
   */
  setupGestures() {
    // Subclasses may override.
  }

  /**
   * Calls `goCallback` and any additional work needed to proceed to next
   * desired direction.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   * @param {boolean=} opt_autoplay
   */
  go(dir, animate, opt_autoplay = false) {
    this.goCallback(dir, animate, opt_autoplay);
  }

  /**
   * Proceeds to the next slide in the desired direction.
   * @param {number} unusedDir -1 or 1
   * @param {boolean} unusedAnimate
   * @param {boolean=} opt_autoplay
   */
  goCallback(unusedDir, unusedAnimate, opt_autoplay) {
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
      const className = 'i-amphtml-carousel-button-start-hint';
      this.element.classList.add(className);
      Services.timerFor(this.win).delay(() => {
        this.mutateElement(() => {
          this.element.classList.remove(className);
          this.prevButton_.classList.toggle(
            'i-amphtml-screen-reader',
            !this.showControls_
          );
          this.nextButton_.classList.toggle(
            'i-amphtml-screen-reader',
            !this.showControls_
          );
        });
      }, 4000);
    });
  }

  /**
   * Updates the titles for the next/previous buttons. This should be called
   * by subclasses if they want to update the button labels. The
   * `getNextButtonTitle` and `getPrevButtonTitle` should be overwritten to
   * provide the title values.
   * @protected
   */
  updateButtonTitles() {
    this.nextButton_.title = this.getNextButtonTitle();
    this.prevButton_.title = this.getPrevButtonTitle();
  }

  /**
   * @return {string} The title to use for the next button.
   * @protected
   */
  getNextButtonTitle() {
    return (
      this.element.getAttribute('data-next-button-aria-label') ||
      'Next item in carousel'
    );
  }

  /**
   * @return {string} The title to use for the pevious button.
   * @protected
   */
  getPrevButtonTitle() {
    return (
      this.element.getAttribute('data-prev-button-aria-label') ||
      'Previous item in carousel'
    );
  }

  /** @override */
  unlayoutCallback() {
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
      this.go(/* dir */ 1, /* animate */ true, /* autoplay */ false);
    }
  }

  /**
   * Called on user interaction to proceed to the previous item/position.
   */
  interactionPrev() {
    if (!this.prevButton_.classList.contains('amp-disabled')) {
      this.go(/* dir */ -1, /* animate */ true, /* autoplay */ false);
    }
  }
}
