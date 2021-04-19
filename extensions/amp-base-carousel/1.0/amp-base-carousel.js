/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {ActionTrust} from '../../../src/core/constants/action-constants';
import {BaseCarousel} from './base-carousel';
import {CSS as COMPONENT_CSS} from './base-carousel.jss';
import {CSS} from '../../../build/amp-base-carousel-1.0.css';
import {CarouselContextProp} from './carousel-props';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/core/types/object';
import {dispatchCustomEvent} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-base-carousel';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
class AmpBaseCarousel extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?number} */
    this.slide_ = null;
  }

  /** @override */
  init() {
    const {element} = this;
    this.registerApiAction('prev', (api) => api.prev(), ActionTrust.LOW);
    this.registerApiAction('next', (api) => api.next(), ActionTrust.LOW);
    this.registerApiAction(
      'goToSlide',
      (api, invocation) => {
        const {args} = invocation;
        api.goToSlide(args['index'] || -1);
      },
      ActionTrust.LOW
    );

    this.slide_ = parseInt(element.getAttribute('slide'), 10);
    return dict({
      'defaultSlide': this.slide_ || 0,
      'onSlideChange': (index) => {
        fireSlideChangeEvent(this.win, element, index, ActionTrust.HIGH);
      },
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-carousel'),
      'expected global "bento" or specific "bento-carousel" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  mutationObserverCallback() {
    const slide = parseInt(this.element.getAttribute('slide'), 10);
    if (slide === this.slide_) {
      return;
    }
    this.slide_ = slide;
    if (!isNaN(slide)) {
      this.api().goToSlide(slide);
    }
  }
}

/** @override */
AmpBaseCarousel['Component'] = BaseCarousel;

/** @override */
AmpBaseCarousel['layoutSizeDefined'] = true;

/** @override */
AmpBaseCarousel['props'] = {
  'advanceCount': {attr: 'advance-count', type: 'number', media: true},
  'arrowPrev': {
    selector: '[slot="prev-arrow"]',
    single: true,
  },
  'arrowNext': {
    selector: '[slot="next-arrow"]',
    single: true,
  },
  'autoAdvance': {attr: 'auto-advance', type: 'boolean', media: true},
  'autoAdvanceCount': {attr: 'auto-advance-count', type: 'number', media: true},
  'autoAdvanceInterval': {
    attr: 'auto-advance-interval',
    type: 'number',
    media: true,
  },
  'autoAdvanceLoops': {attr: 'auto-advance-loops', type: 'number', media: true},
  'controls': {attr: 'controls', type: 'string', media: true},
  'orientation': {
    attr: 'orientation',
    type: 'string',
    media: true,
    default: 'horizontal',
  },
  'loop': {attr: 'loop', type: 'boolean', media: true},
  'mixedLength': {attr: 'mixed-length', type: 'boolean', media: true},
  'outsetArrows': {attr: 'outset-arrows', type: 'boolean', media: true},
  'snap': {attr: 'snap', type: 'boolean', media: true, default: true},
  'snapBy': {attr: 'snap-by', type: 'number', media: true},
  'snapAlign': {attr: 'snap-align', type: 'string', media: true},
  'visibleCount': {attr: 'visible-count', type: 'number', media: true},
  'children': {
    props: {
      'thumbnailSrc': {attr: 'data-thumbnail-src'},
    },
    selector: '*', // This should be last as catch-all.
    single: false,
  },
};

/** @override */
AmpBaseCarousel['usesShadowDom'] = true;

/** @override */
AmpBaseCarousel['shadowCss'] = COMPONENT_CSS;

/** @override */
AmpBaseCarousel['useContexts'] = [CarouselContextProp];

/**
 * Triggers a 'slideChange' event with one data param:
 * 'index' - index of the current slide.
 * @param {!Window} win
 * @param {!Element} el The element that was selected or deslected.
 * @param {number} index
 * @param {!ActionTrust} trust
 * @private
 */
function fireSlideChangeEvent(win, el, index, trust) {
  const eventName = 'slideChange';
  const data = dict({'index': index});
  const slideChangeEvent = createCustomEvent(
    win,
    `amp-base-carousel.${eventName}`,
    data
  );
  Services.actionServiceForDoc(el).trigger(
    el,
    eventName,
    slideChangeEvent,
    trust
  );
  dispatchCustomEvent(el, eventName, data);
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpBaseCarousel, CSS);
});
