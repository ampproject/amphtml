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
import {timerFor} from '../../../src/timer';

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

    /** @private {?Element} */
    this.nextA11yBtn_ = null;

    /** @private {?Element} */
    this.prevA11yBtn_ = null;

    /** @private {boolean} */
    this.showControls_ = false;
  }

  /** @override */
  buildCallback() {
    this.showControls_ = this.element.hasAttribute('controls');
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
   * @param {boolean} unusedInViewport.
   * @protected
   */
  onViewportCallback(unusedInViewport) {}


  buildButtons() {
    this.prevButton_ = this.element.ownerDocument.createElement('div');
    this.prevButton_.classList.add('amp-carousel-button');
    this.prevButton_.classList.add('amp-carousel-button-prev');
    this.prevButton_.setAttribute('role', 'presentation');
    this.prevButton_.onclick = () => {
      this.interactionPrev();
    };
    this.element.appendChild(this.prevButton_);

    this.nextButton_ = this.element.ownerDocument.createElement('div');
    this.nextButton_.classList.add('amp-carousel-button');
    this.nextButton_.classList.add('amp-carousel-button-next');
    this.nextButton_.setAttribute('role', 'presentation');
    this.nextButton_.setAttribute('aria-label', 'Next item in carousel');
    this.nextButton_.onclick = () => {
      this.interactionNext();
    };
    this.element.appendChild(this.nextButton_);


    this.prevA11yBtn_ = this.element.ownerDocument.createElement('button');
    this.prevA11yBtn_.classList.add(
        '-amp-screen-reader', '-amp-carousel-a11-prev');
    // TODO(erwinm): Does label need i18n support in the future? or provide
    // a way to be overridden.
    this.prevA11yBtn_.setAttribute('aria-label', 'Previous item in carousel');
    this.element.appendChild(this.prevA11yBtn_);
    this.prevA11yBtn_.addEventListener(
        'click', this.interactionPrev.bind(this));


    this.nextA11yBtn_ = this.element.ownerDocument.createElement('button');
    this.nextA11yBtn_.classList.add(
        '-amp-screen-reader', '-amp-carousel-a11-next');
    // TODO(erwinm): Does label need i18n support in the future? or provide
    // a way to be overridden.
    this.nextA11yBtn_.setAttribute('aria-label', 'Next item in carousel');
    this.element.appendChild(this.nextA11yBtn_);
    this.nextA11yBtn_.addEventListener(
        'click', this.interactionNext.bind(this));

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
    this.prevA11yBtn_.classList.toggle('amp-disabled', !this.hasPrev());
    this.prevA11yBtn_.setAttribute('aria-disabled', !this.hasPrev());
    this.nextButton_.classList.toggle('amp-disabled', !this.hasNext());
    this.prevA11yBtn_.classList.toggle('amp-disabled', !this.hasNext());
    this.nextA11yBtn_.setAttribute('aria-disabled', !this.hasNext());
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
      timerFor(this.win).delay(() => {
        this.deferMutate(() => this.element.classList.remove(className));
      }, 4000);
    });
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
