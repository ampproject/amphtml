import {getDetail} from '#utils/event-helper';

import {CarouselEvents} from './carousel-events';

/**
 * @typedef {{
 *   stop: function(),
 * }}
 */
let StoppableDef;

/**
 * Accessibility for the carousel. This behaves either as a list or by
 * exposing a single item at a time using `aria-hidden`.
 */
export class CarouselAccessibility {
  /**
   * @param {{
   *   win: !Window,
   *   element: !Element,
   *   scrollContainer: !Element,
   *   runMutate: function(function()),
   *   stoppable: !StoppableDef,
   * }} config
   */
  constructor(config) {
    const {element, runMutate, scrollContainer, stoppable, win} = config;
    /** @protected @const */
    this.win_ = win;

    /** @private @const */
    this.scrollContainer_ = scrollContainer;

    /** @private @const */
    this.runMutate_ = runMutate;

    /** @private {!Array<!Element>} */
    this.slides_ = [];

    /** @private {number} */
    this.visibleCount_ = 1;

    /** @private {boolean} */
    this.mixedLength_ = false;

    /** @private {boolean} */
    this.updating_ = false;

    /** @private {number} */
    this.index_ = 0;

    element.addEventListener(
      'focus',
      () => {
        stoppable.stop();
      },
      true
    );
    element.addEventListener(CarouselEvents.INDEX_CHANGE, (event) => {
      this.onIndexChanged_(event);
    });
  }

  /**
   * Updates whether or not the carousel is using mixed lengths. When using
   * mixed lengths, the carousel is treated as a list.
   * @param {boolean} mixedLength
   */
  updateMixedLength(mixedLength) {
    this.mixedLength_ = mixedLength;
  }

  /**
   * Updates the UI in response to configuration changes.
   */
  updateUi() {
    if (this.updating_) {
      return;
    }

    this.updating_ = true;
    this.runMutate_(() => {
      this.updating_ = false;

      this.updateConfiguration_();
      this.updateAriaHidden_();
    });
  }

  /**
   * Updates the slides, setting aria properties.
   * @param {!Array<!Element>} slides
   */
  updateSlides(slides) {
    this.slides_ = slides;
    this.updateUi();
  }

  /**
   * Updates the visible count. When not in mixed length mode, this causes the
   * carousel to be treated as a list when it is set to a value of two or
   * greater.
   * @param {number} visibleCount
   */
  updateVisibleCount(visibleCount) {
    this.visibleCount_ = visibleCount;
    this.updateUi();
  }

  /**
   * @return {boolean} True if we should treat the carousel as a list, false if
   *    we should expose a single slide at a time.
   */
  treatAsList_() {
    return this.mixedLength_ || this.visibleCount_ >= 2;
  }

  /**
   * Updates the configuration, setting attributes correctly depending on
   * whether the carousel is a list or we are exposing a single item at a time.
   */
  updateConfiguration_() {
    if (this.treatAsList_()) {
      this.scrollContainer_.removeAttribute('aria-live');
      this.scrollContainer_.setAttribute('role', 'list');
      this.slides_.forEach((slide) => {
        slide.setAttribute('role', 'listitem');
      });
    } else {
      this.scrollContainer_.setAttribute('aria-live', 'polite');
      this.scrollContainer_.removeAttribute('role');
      this.slides_.forEach((slide) => {
        slide.removeAttribute('role');
      });
    }
  }

  /**
   * Updates `aria-hidden` for the slides. When in list mode, this will be
   * `false` for all the slides. When not in list mode, the current slide will
   * have `aria-hidden="false"`, with the rest having `aria-hidden="true"`.
   */
  updateAriaHidden_() {
    this.slides_.forEach((slide, i) => {
      const hide = !this.treatAsList_() && i !== this.index_;
      slide.setAttribute('aria-hidden', hide);
    });
  }

  /**
   * @param {!Event} event
   * @private
   */
  onIndexChanged_(event) {
    const detail = getDetail(event);
    const index = detail['index'];

    this.index_ = index;
    this.runMutate_(() => {
      this.updateAriaHidden_();
    });
  }
}
