import {Keys} from '#core/constants/key-codes';
import {Services} from '#service';
import {isAmp4Email} from '#core/document/format';
import {toggleAttribute} from '#core/dom';
import {getWin} from '#core/window';

const _CONTROL_HIDE_ATTRIBUTE = 'i-amphtml-carousel-hide-buttons';
const _HAS_CONTROL_CLASS = 'i-amphtml-carousel-has-controls';

/**
 * @type {(dir:-1|1, animate: boolean, opt_autoplay?:boolean) => void}
 */
let GoFunctionDef;

export class CarouselControls {
  /**
   * @param {{
   *  element: !AmpElement,
   *  go: !GoFunctionDef,
   *  ariaRole: 'button' | 'presentation',
   *  hasPrev: () => boolean,
   *  hasNext: () => boolean,
   * }} param0
   */
  constructor({ariaRole, element, go, hasNext, hasPrev}) {
    /** @type {!AmpElement} */
    this.element = element;

    /** @type {!GoFunctionDef} */
    this.go = go;

    /** @type {'button' | 'presentation'} */
    this.ariaRole = ariaRole;

    /** @type {!Window} */
    this.win = getWin(element);

    /** @private {?HTMLDivElement} */
    this.prevButton_ = null;

    /** @private {?HTMLDivElement} */
    this.nextButton_ = null;

    /** @private {boolean} */
    this.showControls_ = false;

    /** @private {() => boolean} */
    this.hasNext_ = hasNext;

    /** @private {() => boolean} */
    this.hasPrev_ = hasPrev;
  }

  /**
   * Initialize controls, meant to be called during buildCallback
   * after services have initialized.
   */
  initialize() {
    const input = Services.inputFor(this.win);
    const doc = /** @type {!Document} */ (this.element.ownerDocument);

    if (isAmp4Email(doc) || this.element.hasAttribute('controls')) {
      this.showControls_ = true;
      this.element.classList.add(_HAS_CONTROL_CLASS);
    } else {
      input.onMouseDetected((mouseDetected) => {
        if (mouseDetected) {
          this.showControls_ = true;
          toggleAttribute(
            this.element,
            _CONTROL_HIDE_ATTRIBUTE,
            !this.showControls_
          );
          this.element.classList.add(_HAS_CONTROL_CLASS);
        }
      }, true);
    }
    this.buildButtons();
    this.setControlsState();
  }

  /**
   * Builds a carousel button for next/prev.
   * @param {string} className
   * @param {function():void} onInteraction
   * @return {?HTMLDivElement}
   */
  buildButton(className, onInteraction) {
    const button = this.element.ownerDocument.createElement('div');
    button.tabIndex = 0;
    button.classList.add('amp-carousel-button');
    button.classList.add(className);
    button.setAttribute('role', this.ariaRole);
    button.onkeydown = (event) => {
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
    this.updateButtonTitles();
    this.element.appendChild(this.nextButton_);
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

    const ampdoc = Services.ampdocServiceFor(this.win).getAmpDoc(this.element);
    const mutator = Services.mutatorForDoc(ampdoc);
    Services.vsyncFor(this.win).mutate(() => {
      const className = 'i-amphtml-carousel-button-start-hint';
      const hideAttribute = 'i-amphtml-carousel-hide-buttons';
      this.element.classList.add(className);
      Services.timerFor(this.win).delay(() => {
        mutator.measureMutateElement(this.element, /* measurer*/ null, () => {
          this.element.classList.remove(className);
          toggleAttribute(this.element, hideAttribute, !this.showControls_);
        });
      }, 4000);
    });
  }

  /**
   * Updates the titles for the next/previous buttons.
   * Uses given params if provided, otherwise uses sensible defaults.
   *
   * @param {string=} prevTitle
   * @param {string=} nextTitle
   */
  updateButtonTitles(prevTitle, nextTitle) {
    this.prevButton_.title = prevTitle ?? this.getPrevButtonTitle();
    this.nextButton_.title = nextTitle ?? this.getNextButtonTitle();
  }

  /**
   * @return {string} The default title to use for the next button.
   */
  getNextButtonTitle() {
    return (
      this.element.getAttribute('data-next-button-aria-label') ||
      'Next item in carousel'
    );
  }

  /**
   * @return {string} The default title to use for the pevious button.
   */
  getPrevButtonTitle() {
    return (
      this.element.getAttribute('data-prev-button-aria-label') ||
      'Previous item in carousel'
    );
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
