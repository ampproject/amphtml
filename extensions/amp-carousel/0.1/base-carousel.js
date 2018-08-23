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
import {KeyCodes} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {setStyles} from '../../../src/style';
import {isExperimentOn} from '../../../src/experiments';

const LEGACY_PREV_ARROW_STYLE = {
  backgroundImage: 'url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" viewBox="0 0 18 18"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z"/></svg>\')',
  backgroundSize: '18px 18px',
};

const LEGACY_NEXT_ARROW_STYLE = {
  backgroundImage: 'url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" viewBox="0 0 18 18"><path d="M9 3L7.94 4.06l4.19 4.19H3v1.5h9.13l-4.19 4.19L9 15l6-6z"/></svg>\')',
  backgroundSize: '18px 18px',
};

const NEW_PREV_ARROW_STYLE = {
  backgroundColor: 'transparent',
  backgroundImage: 'url(\'data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="arrow_left_03" fill="#ffffff"><path d="M11.7604076,9.75 L11.7604076,15.25 C11.7604076,15.8022847 11.3126924,16.25 10.7604076,16.25 C10.2081229,16.25 9.76040764,15.8022847 9.76040764,15.25 L9.76040764,8.75 C9.76040764,8.19771525 10.2081229,7.75 10.7604076,7.75 L17.2604076,7.75 C17.8126924,7.75 18.2604076,8.19771525 18.2604076,8.75 C18.2604076,9.30228475 17.8126924,9.75 17.2604076,9.75 L11.7604076,9.75 Z" id="Combined-Shape" transform="translate(14.010408, 12.000000) rotate(-45.000000) translate(-14.010408, -12.000000) "></path></g></g></svg>\')',
  filter: 'drop-shadow(0px 1px 2px #4a4a4a)',
};

const NEW_NEXT_ARROW_STYLE = {

  backgroundColor: 'transparent',
  backgroundImage: 'url(\'data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="arrow_right_03" fill="#ffffff"><path d="M7.75,9.75 L7.75,15.25 C7.75,15.8022847 7.30228475,16.25 6.75,16.25 C6.19771525,16.25 5.75,15.8022847 5.75,15.25 L5.75,8.75 C5.75,8.19771525 6.19771525,7.75 6.75,7.75 L13.25,7.75 C13.8022847,7.75 14.25,8.19771525 14.25,8.75 C14.25,9.30228475 13.8022847,9.75 13.25,9.75 L7.75,9.75 Z" id="Combined-Shape" transform="translate(10.000000, 12.000000) rotate(-225.000000) translate(-10.000000, -12.000000) "></path></g></g></svg>\')',
  filter: 'drop-shadow(0px 1px 2px #4a4a4a)',
};

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
    this.showControls_ = input.isMouseDetected() ||
        this.element.hasAttribute('controls');

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
   * @param {string} ariaName
   * @param {JSON} newStyles
   * @param {JSON} legacyStyles
   */
  buildButton(className, onInteraction, ariaName, newStyles, legacyStyles) {
    const button = this.element.ownerDocument.createElement('div');
    button.tabIndex = 0;
    button.classList.add('amp-carousel-button');
    button.classList.add(className);
    let overridenStyle = false;
    for (let i = 0; i < this.win.document.styleSheets.length; i++) {
      const sheet = this.win.document.styleSheets[i];
      console.log(sheet);
      if (sheet.ownerNode instanceof HTMLStyleElement) {
        for (let j = 0; j < sheet.cssRules.length; j++) {
          if (sheet.cssRules[j].selectorText === `.${className}`) {
            console.log(sheet.cssRules[j].selectorText);
            overridenStyle = true;
          }
        }
      }
    }
    button.setAttribute('role', 'button');
    if (!overridenStyle) {
      setStyles(button, isExperimentOn(this.win, 'amp-carousel-new-arrows') ? newStyles : legacyStyles);
    }

    button.onkeydown = event => {
      if (event.keyCode == KeyCodes.ENTER || event.keyCode == KeyCodes.SPACE) {
        if (!event.defaultPrevented) {
          event.preventDefault();
          onInteraction();
        }
      }
    };
    button.onclick = onInteraction;
    if (this.element.hasAttribute(`data-${ariaName}-button-aria-label`)) {
      button.setAttribute('aria-label',
          this.element.getAttribute(`data-${ariaName}-button-aria-label`));
    } else {
      const upperCaseName = ariaName[0].toUpperCase() + ariaName.slice(1);
      button.setAttribute('aria-label',
          `${upperCaseName} item in carousel`);
    }

    return button;
  }

  /**
   * Builds the next and previous buttons.
   */
  buildButtons() {
    this.prevButton_ = this.buildButton('amp-carousel-button-prev', () => {
      this.interactionPrev();
    }, 'previous', NEW_PREV_ARROW_STYLE, LEGACY_PREV_ARROW_STYLE);
    this.element.appendChild(this.prevButton_);

    this.nextButton_ = this.buildButton('amp-carousel-button-next', () => {
      this.interactionNext();
    }, 'next', NEW_NEXT_ARROW_STYLE, LEGACY_NEXT_ARROW_STYLE);
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
              'i-amphtml-screen-reader', !this.showControls_);
          this.nextButton_.classList.toggle(
              'i-amphtml-screen-reader', !this.showControls_);
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
    return this.element.getAttribute('data-next-button-aria-label')
        || 'Next item in carousel';
  }

  /**
   * @return {string} The title to use for the pevious button.
   * @protected
   */
  getPrevButtonTitle() {
    return this.element.getAttribute('data-prev-button-aria-label')
        || 'Previous item in carousel';
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
