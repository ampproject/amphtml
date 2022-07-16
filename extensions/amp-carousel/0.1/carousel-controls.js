import {Keys_Enum} from '#core/constants/key-codes';
import {toggleAttribute} from '#core/dom';
import {getWin} from '#core/window';

import {Services} from '#service';

import {ClassNames, setButtonState} from './build-dom';

/**
 * @type {(dir:-1|1, animate: boolean, opt_autoplay?:boolean) => void}
 */
let GoFunctionDef;

export class CarouselControls {
  /**
   * @param {{
   *  element: !AmpElement,
   *  go: !GoFunctionDef,
   *  prevButton: !HTMLDivElement,
   *  nextButton: !HTMLDivElement,
   * }} param0
   */
  constructor({element, go, nextButton, prevButton}) {
    /** @private @type {AmpElement} */
    this.element_ = element;

    /** @private @type {GoFunctionDef} */
    this.go_ = go;

    /** @private @type {Window} */
    this.win_ = getWin(element);

    /** @private {HTMLDivElement} */
    this.prevButton_ = prevButton;

    /** @private {HTMLDivElement} */
    this.nextButton_ = nextButton;

    /** @private {boolean} */
    this.showControls_ = false;

    this.setupBehaviors_();
  }

  /**
   * Runs side effects to initialize controls.
   * Meant to be called during carousel's buildCallback().
   */
  setupBehaviors_() {
    this.setupButtonInteraction(this.prevButton_, () => this.handlePrev());
    this.setupButtonInteraction(this.nextButton_, () => this.handleNext());

    if (this.element_.hasAttribute('controls')) {
      this.showControls_ = true;
      return;
    }

    const input = Services.inputFor(this.win_);
    input.onMouseDetected((mouseDetected) => {
      if (mouseDetected) {
        this.showControls_ = true;
        toggleAttribute(
          this.element_,
          ClassNames.CONTROL_HIDE_ATTRIBUTE,
          !this.showControls_
        );
        this.element_.classList.add(ClassNames.HAS_CONTROL);
      }
    }, true);
  }

  /**
   * @param {HTMLDivElement} button
   * @param {*} onInteraction
   */
  setupButtonInteraction(button, onInteraction) {
    button.addEventListener('click', onInteraction);
    button.addEventListener('keydown', (event) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key == Keys_Enum.ENTER || event.key == Keys_Enum.SPACE) {
        event.preventDefault();
        onInteraction();
      }
    });
  }

  /**
   * Sets the previous and next button visual states.
   * @param {{prev: boolean, next: boolean}} param0
   */
  setControlsState({next, prev}) {
    setButtonState(this.prevButton_, prev);
    setButtonState(this.nextButton_, next);
  }

  /**
   * Shows the controls and then fades them away.
   */
  hintControls() {
    if (this.showControls_) {
      return;
    }

    Services.vsyncFor(this.win_).mutate(() => {
      const className = 'i-amphtml-carousel-button-start-hint';
      const hideAttribute = 'i-amphtml-carousel-hide-buttons';
      this.element_.classList.add(className);
      Services.timerFor(this.win_).delay(() => {
        const mutator = Services.mutatorForDoc(this.element_);
        mutator.measureMutateElement(this.element_, /* measurer*/ null, () => {
          this.element_.classList.remove(className);
          toggleAttribute(this.element_, hideAttribute, !this.showControls_);
        });
      }, 4000);
    });
  }

  /**
   * Updates the titles for the next/previous buttons.
   * Uses given params if provided, otherwise uses sensible defaults.
   *
   * @param {string} prevTitle
   * @param {string} nextTitle
   */
  updateButtonTitles(prevTitle, nextTitle) {
    this.prevButton_.title = prevTitle;
    this.nextButton_.title = nextTitle;
  }

  /**
   * Called on user interaction to proceed to the previous position.
   */
  handlePrev() {
    const isEnabled = !this.prevButton_.classList.contains('amp-disabled');
    if (isEnabled) {
      this.go_(/* dir */ -1, /* animate */ true, /* autoplay */ false);
    }
  }

  /**
   * Called on user interaction to proceed to the next position.
   */
  handleNext() {
    const isEnabled = !this.nextButton_.classList.contains('amp-disabled');
    if (isEnabled) {
      this.go_(/* dir */ 1, /* animate */ true, /* autoplay */ false);
    }
  }
}
