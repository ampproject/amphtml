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
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-base-carousel';

class AmpBaseCarousel extends PreactBaseElement {
  /** @override */
  init() {
    const {element} = this;
    let advance = () => {};
    this.registerAction('prev', () => advance(-1), ActionTrust.LOW);
    this.registerAction('next', () => advance(1), ActionTrust.LOW);
    return dict({
      'onSlideChange': (index) => {
        fireSlideChangeEvent(this.win, element, index, ActionTrust.HIGH);
        this.mutateProps(dict({'slide': index}));
      },
      'setAdvance': (a) => (advance = a),
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-base-carousel-bento'),
      'expected amp-base-carousel-bento experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }
}

/** @override */
AmpBaseCarousel['Component'] = BaseCarousel;

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
  'loop': {attr: 'loop', type: 'boolean'},
};

/** @override */
AmpBaseCarousel['useJss'] = true;

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
