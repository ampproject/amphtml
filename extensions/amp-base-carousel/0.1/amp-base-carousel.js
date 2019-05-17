/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {ActionSource} from './action-source';
import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-base-carousel-0.1.css';
import {Carousel} from './carousel.js';
import {
  ResponsiveAttributes,
  getResponsiveAttributeValue,
} from './responsive-attributes';
import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  iterateCursor,
  toggleAttribute,
} from '../../../src/dom';
import {createCustomEvent, getDetail} from '../../../src/event-helper';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {toArray} from '../../../src/types';

/**
 * @param {!Element} el The Element to check.
 * @return {boolean} Whether or not the Element is a sizer Element.
 */
function isSizer(el) {
  return el.tagName == 'I-AMPHTML-SIZER';
}

class AmpCarousel extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.advanceCount_ = 1;

    /** @private {?Carousel} */
    this.carousel_ = null;

    /** @private {!Array<!Element>} */
    this.slides_ = [];

    /** @private {?Element} */
    this.nextArrowSlot_ = null;

    /** @private {?Element} */
    this.prevArrowSlot_ = null;

    /**
     * Whether or not the user has interacted with the carousel using touch in
     * the past at any point.
     * @private {boolean}
     */
    this.hadTouch_ = false;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private @const */
    this.responsiveAttributes_ = new ResponsiveAttributes({
      'advance-count': newValue => {
        this.carousel_.updateAdvanceCount(Number(newValue) || 0);
      },
      'auto-advance': newValue => {
        this.carousel_.updateAutoAdvance(newValue == 'true');
      },
      'auto-advance-count': newValue => {
        this.carousel_.updateAutoAdvanceCount(Number(newValue) || 0);
      },
      'auto-advance-interval': newValue => {
        this.carousel_.updateAutoAdvanceInterval(Number(newValue) || 0);
      },
      'auto-advance-loops': newValue => {
        this.carousel_.updateAutoAdvanceLoops(Number(newValue) || 0);
      },
      'dir': newValue => {
        this.carousel_.updateForwards(newValue != 'rtl');
      },
      'horizontal': newValue => {
        this.carousel_.updateHorizontal(newValue == 'true');
      },
      'loop': newValue => {
        this.carousel_.updateLoop(newValue == 'true');
      },
      'mixed-length': newValue => {
        this.carousel_.updateMixedLength(newValue == 'true');
      },
      'slide': newValue => {
        this.carousel_.goToSlide(Number(newValue));
      },
      'snap': newValue => {
        this.carousel_.updateSnap(newValue == 'true');
      },
      'snap-align': newValue => {
        this.carousel_.updateAlignment(newValue);
      },
      'snap-by': newValue => {
        this.carousel_.updateSnapBy(Number(newValue) || 0);
      },
      'visible-count': newValue => {
        this.carousel_.updateVisibleCount(Number(newValue) || 0);
      },
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.action_ = Services.actionServiceForDoc(this.element);

    const {element, win} = this;
    const children = toArray(element.children);
    let prevArrow;
    let nextArrow;
    // Figure out which slot the children go into.
    children.forEach(c => {
      const slot = c.getAttribute('slot');
      if (slot == 'prev-arrow') {
        prevArrow = c;
      } else if (slot == 'next-arrow') {
        nextArrow = c;
      } else if (!isSizer(c)) {
        this.slides_.push(c);
      }
    });
    // Create the carousel's inner DOM.
    element.appendChild(this.renderContainerDom_());

    const scrollContainer = dev().assertElement(
      this.element.querySelector('.i-amphtml-carousel-scroll')
    );

    this.carousel_ = new Carousel({
      win,
      element,
      scrollContainer,
      initialIndex: this.getInitialIndex_(),
      runMutate: cb => this.mutateElement(cb),
    });

    // Do some manual "slot" distribution
    this.slides_.forEach(slide => {
      slide.classList.add('i-amphtml-carousel-slotted');
      scrollContainer.appendChild(slide);
    });
    this.prevArrowSlot_ = this.element.querySelector(
      '.i-amphtml-carousel-arrow-prev-slot'
    );
    this.nextArrowSlot_ = this.element.querySelector(
      '.i-amphtml-carousel-arrow-next-slot'
    );
    // Slot the arrows, with defaults
    this.prevArrowSlot_.appendChild(prevArrow || this.createPrevArrow_());
    this.nextArrowSlot_.appendChild(nextArrow || this.createNextArrow_());

    // Handle the initial set of attributes
    toArray(this.element.attributes).forEach(attr => {
      this.attributeMutated_(attr.name, attr.value);
    });

    // Setup actions and listeners
    this.setupActions_();
    this.element.addEventListener('indexchange', event => {
      this.onIndexChanged_(event);
    });
    this.prevArrowSlot_.addEventListener('click', () => {
      this.carousel_.prev(ActionSource.GENERIC_HIGH_TRUST);
    });
    this.nextArrowSlot_.addEventListener('click', () => {
      this.carousel_.next(ActionSource.GENERIC_HIGH_TRUST);
    });

    this.carousel_.updateSlides(this.slides_);
    this.updateUi_();
    // Signal for runtime to check children for layout.
    return this.mutateElement(() => {});
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    // TODO(sparhami) #19259 Tracks a more generic way to do this. Remove once
    // we have something better.
    const isScaled = closestAncestorElementBySelector(
      this.element,
      '[i-amphtml-scale-animation]'
    );
    if (isScaled) {
      return Promise.resolve();
    }

    this.carousel_.updateUi();
    return Promise.resolve();
  }

  /** @override */
  pauseCallback() {
    this.carousel_.pauseAutoAdvance();
  }

  /** @override */
  resumeCallback() {
    this.carousel_.resumeAutoAdvance();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    for (const key in mutations) {
      // Stringify since the attribute logic deals with strings and amp-bind
      // may not (e.g. value could be a Number).
      this.attributeMutated_(key, String(mutations[key]));
    }
  }

  /**
   * Moves the Carousel to a given index.
   * @param {number} index
   */
  goToSlide(index) {
    this.carousel_.goToSlide(index, {smoothScroll: false});
  }

  /**
   * Goes to the next slide. This should be called from a user interaction.
   */
  interactionNext() {
    this.carousel_.next(ActionSource.GENERIC_HIGH_TRUST);
  }

  /**
   * Goes to the previous slide. This should be called from a user interaction.
   */
  interactionPrev() {
    this.carousel_.prev(ActionSource.GENERIC_HIGH_TRUST);
  }

  /**
   * @return {!Element}
   * @private
   */
  renderContainerDom_() {
    const html = htmlFor(this.element);
    return html`
      <div class="i-amphtml-carousel-content">
        <div class="i-amphtml-carousel-scroll"></div>
        <div class="i-amphtml-carousel-arrows">
          <div class="i-amphtml-carousel-arrow-prev-slot"></div>
          <div class="i-amphtml-carousel-arrow-next-slot"></div>
        </div>
      </div>
    `;
  }

  /**
   * @return {!Element}
   * @private
   */
  createNextArrow_() {
    const html = htmlFor(this.element);
    return html`
      <button
        class="i-amphtml-carousel-next"
        aria-label="Next item in carousel"
      ></button>
    `;
  }

  /**
   * @return {!Element}
   * @private
   */
  createPrevArrow_() {
    const html = htmlFor(this.element);
    return html`
      <button
        class="i-amphtml-carousel-prev"
        aria-label="Previous item in carousel"
      ></button>
    `;
  }

  /**
   * Gets the ActionSource to use for a given ActionTrust.
   * @param {!ActionTrust} trust
   * @return {!ActionSource}
   */
  getActionSource_(trust) {
    return trust == ActionTrust.HIGH
      ? ActionSource.GENERIC_HIGH_TRUST
      : ActionSource.GENERIC_LOW_TRUST;
  }

  /**
   * @private
   */
  setupActions_() {
    this.registerAction(
      'prev',
      ({trust}) => {
        this.carousel_.prev(this.getActionSource_(trust));
      },
      ActionTrust.LOW
    );
    this.registerAction(
      'next',
      ({trust}) => {
        this.carousel_.next(this.getActionSource_(trust));
      },
      ActionTrust.LOW
    );
    this.registerAction(
      'goToSlide',
      ({args, trust}) => {
        this.carousel_.goToSlide(args['index'] || -1, {
          actionSource: this.getActionSource_(trust),
        });
      },
      ActionTrust.LOW
    );
  }

  /**
   * Updates the UI of the <amp-base-carousel> itself, but not the internal
   * implementation.
   * @private
   */
  updateUi_() {
    const index = this.carousel_.getCurrentIndex();
    const loop = this.carousel_.getLoop();
    // TODO(sparhami) for Shadow DOM, we will need to get the assigned nodes
    // instead.
    iterateCursor(this.prevArrowSlot_.children, child => {
      const disabled = !loop && index == 0;
      toggleAttribute(child, 'disabled', disabled);
    });
    iterateCursor(this.nextArrowSlot_.children, child => {
      const disabled = !loop && index == this.slides_.length - 1;
      toggleAttribute(child, 'disabled', disabled);
    });
    toggleAttribute(
      this.element,
      'i-amphtml-carousel-hide-buttons',
      this.hadTouch_
    );
  }

  /**
   * @return {number} The initial index for the carousel.
   * @private
   */
  getInitialIndex_() {
    const attr = this.element.getAttribute('slide') || '0';
    return Number(getResponsiveAttributeValue(attr));
  }

  /**
   * @param {!ActionSource|undefined} actionSource
   * @return {boolean} Whether or not the action is a high trust action.
   * @private
   */
  isHighTrustActionSource_(actionSource) {
    return (
      actionSource == ActionSource.WHEEL ||
      actionSource == ActionSource.TOUCH ||
      actionSource == ActionSource.GENERIC_HIGH_TRUST
    );
  }

  /**
   * @private
   * @param {!Event} event
   */
  onIndexChanged_(event) {
    const detail = getDetail(event);
    const index = detail['index'];
    const actionSource = detail['actionSource'];
    const data = dict({'index': index});
    const name = 'slideChange';
    const isHighTrust = this.isHighTrustActionSource_(actionSource);
    const trust = isHighTrust ? ActionTrust.HIGH : ActionTrust.LOW;

    const action = createCustomEvent(this.win, `slidescroll.${name}`, data);
    this.action_.trigger(this.element, name, action, trust);
    this.element.dispatchCustomEvent(name, data);
    this.hadTouch_ = this.hadTouch_ || actionSource == ActionSource.TOUCH;
    this.updateUi_();
  }

  /**
   * @param {string} name The name of the attribute.
   * @param {string} newValue The new value of the attribute.
   * @private
   */
  attributeMutated_(name, newValue) {
    this.responsiveAttributes_.updateAttribute(name, newValue);
  }
}

AMP.extension('amp-base-carousel', '0.1', AMP => {
  if (
    !isExperimentOn(AMP.win, 'amp-base-carousel') &&
    !isExperimentOn(AMP.win, 'amp-lightbox-gallery-base-carousel')
  ) {
    return;
  }

  AMP.registerElement('amp-base-carousel', AmpCarousel, CSS);
});
