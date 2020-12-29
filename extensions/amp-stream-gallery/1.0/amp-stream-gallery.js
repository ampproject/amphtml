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
import {CSS as CAROUSEL_CSS} from '../../amp-base-carousel/1.0/base-carousel.jss';
import {CSS as GALLERY_CSS} from './stream-gallery.jss';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {StreamGallery} from './stream-gallery';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-stream-gallery';

class AmpStreamGallery extends PreactBaseElement {
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

    return dict({
      'onSlideChange': (index) => {
        fireSlideChangeEvent(this.win, element, index, ActionTrust.HIGH);
      },
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento-stream-gallery'),
      'expected global "bento" or specific "bento-stream-gallery" experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }
}

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
    `amp-stream-gallery.${name}`,
    dict({'index': index})
  );
  Services.actionServiceForDoc(el).trigger(el, name, slideChangeEvent, trust);
}

/** @override */
AmpStreamGallery['Component'] = StreamGallery;

/** @override */
AmpStreamGallery['layoutSizeDefined'] = true;

/** @override */
AmpStreamGallery['children'] = {
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
AmpStreamGallery['props'] = {
  'controls': {attr: 'controls', type: 'string', media: true},
  'extraSpace': {attr: 'extra-space', type: 'string', media: true},
  'loop': {attr: 'loop', type: 'boolean', media: true},
  'minItemWidth': {attr: 'min-item-width', type: 'number', media: true},
  'maxItemWidth': {attr: 'max-item-width', type: 'number', media: true},
  'maxVisibleCount': {attr: 'max-visible-count', type: 'number', media: true},
  'minVisibleCount': {attr: 'min-visible-count', type: 'number', media: true},
  'outsetArrows': {attr: 'outset-arrows', type: 'boolean', media: true},
  'peek': {attr: 'peek', type: 'number', media: true},
  'slideAlign': {attr: 'slide-align', type: 'string', media: true},
  'snap': {attr: 'snap', type: 'boolean', media: true},
};

/** @override */
AmpStreamGallery['shadowCss'] = GALLERY_CSS + CAROUSEL_CSS;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpStreamGallery);
});
