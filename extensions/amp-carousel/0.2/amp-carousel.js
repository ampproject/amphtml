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

import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-carousel-0.2.css';
import {Carousel} from './carousel.js';
import {ResponsiveAttributes} from './responsive-attributes';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getDetail} from '../../../src/event-helper';
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
      'horizontal': newValue => {
        this.carousel_.updateHorizontal(newValue == 'true');
      },
      'initial-index': newValue => {
        this.carousel_.updateInitialIndex(Number(newValue) || 0);
      },
      'loop': newValue => {
        this.carousel_.updateLoop(newValue == 'true');
      },
      'mixed-length': newValue => {
        this.carousel_.updateMixedLength(newValue == 'true');
      },
      'side-slide-count': newValue => {
        this.carousel_.updateSideSlideCount(Number(newValue) || 0);
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
    const {element, win} = this;
    // Grab the slides up front so we can place them later.
    this.slides_ = toArray(element.children).filter(c => !isSizer(c));
    // Create the carousel's inner DOM.
    element.appendChild(this.renderContainerDom_());

    const scrollContainer = dev().assertElement(
        this.element.querySelector('.i-amphtml-carousel-scroll'));

    this.carousel_ = new Carousel({
      win,
      element,
      scrollContainer,
      runMutate: cb => this.mutateElement(cb),
    });

    // Handle the initial set of attributes
    toArray(this.element.attributes).forEach(attr => {
      this.attributeMutated_(attr.name, attr.value);
    });

    this.setupActions_();
    this.element.addEventListener('indexchange', event => {
      this.onIndexChanged_(event);
    });

    // Do some manual "slot" distribution
    this.slides_.forEach(slide => {
      slide.classList.add('i-amphtml-carousel-slotted');
      scrollContainer.appendChild(slide);
    });

    this.carousel_.updateSlides(this.slides_);
    // Signal for runtime to check children for layout.
    return this.mutateElement(() => {});
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    this.carousel_.updateUi();
    return Promise.resolve();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    for (const key in mutations) {
      this.attributeMutated_(key, mutations[key]);
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
   * @private
   */
  renderContainerDom_() {
    const html = htmlFor(this.element);
    return html`
      <div class="i-amphtml-carousel-scroll"></div>
    `;
  }

  /**
   * @private
   */
  setupActions_() {
    this.registerAction('prev', () => this.carousel_.prev(), ActionTrust.LOW);
    this.registerAction('next', () => this.carousel_.next(), ActionTrust.LOW);
    this.registerAction('goToSlide', ({args}) => {
      this.carousel_.goToSlide(args['index'] || -1);
    }, ActionTrust.LOW);
  }

  /**
   * @private
   * @param {!Event} event
   */
  onIndexChanged_(event) {
    const detail = getDetail(event);
    const data = dict({'index': detail['index']});
    const name = 'slideChange';
    // TODO(sparhami) trigger an action, but not from autoadvance.
    this.element.dispatchCustomEvent(name, data);
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

AMP.extension('amp-carousel', '0.2', AMP => {
  if (!isExperimentOn(AMP.win, 'amp-carousel-v2')) {
    return;
  }

  AMP.registerElement('amp-carousel', AmpCarousel, CSS);
});
