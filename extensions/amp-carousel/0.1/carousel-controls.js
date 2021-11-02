import {Keys} from '#core/constants/key-codes';
import {Services} from '#service';
import {toggleAttribute} from '#core/dom';
import {getWin} from '#core/window';
import {ClassNames} from './build-dom';

/**
 * @type {(dir:-1|1, animate: boolean, opt_autoplay?:boolean) => void}
 */
let GoFunctionDef;

export class CarouselControls {
  /**
   * @param {{
   *  element: !AmpElement,
   *  go: !GoFunctionDef,
   *  hasPrev: () => boolean,
   *  hasNext: () => boolean,
   *  prevButton: !HTMLDivElement,
   *  nextButton: !HTMLDivElement,
   * }} param0
   */
  constructor({element, go, hasNext, hasPrev, nextButton, prevButton}) {
    /** @private @type {!AmpElement} */
    this.element_ = element;

    /** @private @type {!GoFunctionDef} */
    this.go_ = go;

    /** @private @type {!Window} */
    this.win_ = getWin(element);

    /** @private {!HTMLDivElement} */
    this.prevButton_ = prevButton;

    /** @private {!HTMLDivElement} */
    this.nextButton_ = nextButton;

    /** @private {boolean} */
    this.showControls_ = false;

    /** @private {() => boolean} */
    this.hasNext_ = hasNext;

    /** @private {() => boolean} */
    this.hasPrev_ = hasPrev;

    this.initialize_();
  }

  /**
   * Runs side effects to initialize controls.
   * Meant to be called during carousel's buildCallback().
   */
  initialize_() {
    this.setControlsState();
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
   * @param {!HTMLDivElement} button
   * @param {*} onInteraction
   */
  setupButtonInteraction(button, onInteraction) {
    button.onkeydown = (event) => {
      if (event.key == Keys.ENTER || event.key == Keys.SPACE) {
        if (!event.defaultPrevented) {
          event.preventDefault();
          onInteraction();
        }
      }
    };
    button.onclick = onInteraction;
  }

  /**
   * Sets the previous and next button visual states.
   */
  setControlsState() {
    this.prevButton_.classList.toggle('amp-disabled', !this.hasPrev_());
    this.prevButton_.setAttribute('aria-disabled', String(!this.hasPrev_()));
    this.nextButton_.classList.toggle('amp-disabled', !this.hasNext_());
    this.nextButton_.setAttribute('aria-disabled', String(!this.hasNext_()));
    this.prevButton_.tabIndex = this.hasPrev_() ? 0 : -1;
    this.nextButton_.tabIndex = this.hasNext_() ? 0 : -1;
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
