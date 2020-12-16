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

import {CSS} from './pagination.jss';
import {CarouselContextProp} from '../../amp-base-carousel/1.0/carousel-props';
import {Layout} from '../../../src/layout';
import {Pagination} from './pagination';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
export const TAG = 'amp-inline-gallery-pagination';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
export class AmpInlineGalleryPagination extends PreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-inline-gallery'),
      'expected global "bento" or specific "bento-inline-gallery" experiment to be enabled'
    );
    return layout == Layout.FIXED_HEIGHT;
  }
}

/** @override */
AmpInlineGalleryPagination['Component'] = Pagination;

/** @override */
AmpInlineGalleryPagination['props'] = {
  'inset': {attr: 'inset', type: 'boolean', media: true},
};

/** @override */
AmpInlineGalleryPagination['children'] = {};

/** @override */
AmpInlineGalleryPagination['layoutSizeDefined'] = true;

/** @override */
AmpInlineGalleryPagination['shadowCss'] = CSS;

/** @override */
AmpInlineGalleryPagination['useContexts'] = [CarouselContextProp];
