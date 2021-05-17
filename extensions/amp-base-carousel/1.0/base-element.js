/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {BaseCarousel} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';
import {CarouselContextProp} from './carousel-props';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {dict} from '../../../src/core/types/object';

export class BaseElement extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?number} */
    this.slide_ = null;
  }

  /** @override */
  init() {
    const {element} = this;
    this.slide_ = parseInt(element.getAttribute('slide'), 10);
    return dict({
      'defaultSlide': this.slide_ || 0,
      'onSlideChange': (index) => {
        this.triggerEvent(element, 'slideChange', dict({'index': index}));
      },
    });
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
BaseElement['Component'] = BaseCarousel;

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['props'] = {
  'advanceCount': {attr: 'advance-count', type: 'number', media: true},
  'arrowPrevAs': {
    selector: '[slot="prev-arrow"]',
    single: true,
    as: true,
  },
  'arrowNextAs': {
    selector: '[slot="next-arrow"]',
    single: true,
    as: true,
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
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;

/** @override */
BaseElement['useContexts'] = [CarouselContextProp];
