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

import {CSS} from './stream-gallery.jss';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {StreamGallery} from './stream-gallery';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-stream-gallery';

class AmpStreamGallery extends PreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-stream-gallery-bento'),
      'expected amp-stream-gallery-bento experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }
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
  'extraSpace': {attr: 'extra-space', type: 'string'},
  'insetArrowVisibility': {attr: 'inset-arrow-visibility', type: 'string'},
  'loop': {attr: 'loop', type: 'boolean'},
  'minItemWidth': {attr: 'min-item-width', type: 'number'},
  'maxItemWidth': {attr: 'max-item-width', type: 'number'},
  'maxVisibleCount': {attr: 'max-visible-count', type: 'number'},
  'minVisibleCount': {attr: 'min-visible-count', type: 'number'},
  'outsetArrows': {attr: 'outset-arrows', type: 'boolean'},
  'peek': {attr: 'peek', type: 'number'},
  'slideAlign': {attr: 'slide-align', type: 'string'},
  'snap': {attr: 'snap', type: 'boolean'},
};

/** @override */
AmpStreamGallery['shadowCss'] = CSS;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpStreamGallery);
});
