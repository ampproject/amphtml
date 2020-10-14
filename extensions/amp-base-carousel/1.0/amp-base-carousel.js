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

import {ActionTrust} from '../../../src/action-constants';
import {BaseCarousel} from './base-carousel';
import {CSS} from './base-carousel.jss';
import {CarouselContextProp} from './carousel-props';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-base-carousel';

/**
 * The boolean attribute value as resolved by string equality with "true" or "false".
 * If the attribute is not present, default as given.
 *
 * @param {!Element} element
 * @param {string} attr
 * @param {boolean} defaultValue
 * @return {boolean}
 */
function parseStrBoolAttr(element, attr, defaultValue) {
  return element.hasAttribute(attr)
    ? element.getAttribute(attr) !== 'false'
    : defaultValue;
}

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
class AmpBaseCarousel extends PreactBaseElement {
  /** @override */
  init() {
    const {element} = this;
    this.registerApiAction('prev', (api) => api.advance(-1), ActionTrust.LOW);
    this.registerApiAction('next', (api) => api.advance(1), ActionTrust.LOW);
    this.registerApiAction(
      'goToSlide',
      (api, invocation) => {
        const {args} = invocation;
        api.goToSlide(args['index'] || -1);
      },
      ActionTrust.LOW
    );
    return dict({
      'onSlideChange': (index) => {
        fireSlideChangeEvent(this.win, element, index, ActionTrust.HIGH);
      },
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-base-carousel-bento'),
      'expected amp-base-carousel-bento experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/** @override */
AmpBaseCarousel['Component'] = BaseCarousel;

/** @override */
AmpBaseCarousel['layoutSizeDefined'] = true;

/** @override */
AmpBaseCarousel['children'] = {
  'arrowPrev': {
    name: 'arrowPrev',
    selector: '[slot="prev-arrow"]',
    single: true,
  },
  'arrowNext': {
    name: 'arrowNext',
    selector: '[slot="next-arrow"]',
    single: true,
  },
  'children': {
    name: 'children',
    selector: '*', // This should be last as catch-all.
    single: false,
  },
};

/** @override */
AmpBaseCarousel['props'] = {
  'controls': {attr: 'controls', type: 'string'},
  'loop': {attr: 'loop', type: 'boolean'},
  'mixedLength': {attr: 'mixed-length', type: 'boolean'},
  'snap': {
    attrs: ['snap'],
    parseAttrs: (element) => parseStrBoolAttr(element, 'snap', true),
  },
};

/** @override */
AmpBaseCarousel['shadowCss'] = CSS;

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
  const name = 'slideChange';
  const slideChangeEvent = createCustomEvent(
    win,
    `amp-base-carousel.${name}`,
    dict({'index': index})
  );
  Services.actionServiceForDoc(el).trigger(el, name, slideChangeEvent, trust);
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpBaseCarousel);
});
