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

import {BaseCarousel} from './base-carousel';
import {CSS} from '../../../build/amp-base-carousel-1.0.css';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-base-carousel';

class AmpBaseCarousel extends PreactBaseElement {
  /** @override */
  init() {
    // TODO: This lays out all children on initialization
    // for illustrative purposes since amp-base-carousel
    // historically uses Owners System to manage its children's
    // resources. We eventually want to replace this with usage
    // of `ChildLayoutManager` for more fine-grained resource
    // control of the carousel's children AMP elements.
    const owners = Services.ownersForDoc(this.element);
    const children = this.getRealChildren();
    children.forEach((child) => owners.setOwner(child, this.element));
    return dict({
      'onUpdate': () => {
        owners.scheduleLayout(this.element, children);
      },
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
  'children': {
    name: 'children',
    selector: ':not([slot="prev-arrow"]):not([slot="next-arrow"])',
    single: false,
  },
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
};

/** @override */
AmpBaseCarousel['props'] = {
  'loop': {attr: 'loop', type: 'boolean'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpBaseCarousel, CSS);
});
