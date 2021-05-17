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

import {CSS as CAROUSEL_CSS} from '../../amp-base-carousel/1.0/component.jss';
import {CarouselContextProp} from '../../amp-base-carousel/1.0/carousel-props';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {CSS as THUMBNAIL_CSS} from './thumbnails.jss';
import {Thumbnails} from './thumbnails';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
export const TAG = 'amp-inline-gallery-thumbnails';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
export class AmpInlineGalleryThumbnails extends PreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-inline-gallery'),
      'expected global "bento" or specific "bento-inline-gallery" experiment to be enabled'
    );
    // Any layout is allowed for Bento, but "fixed-height" is the recommend
    // layout for AMP.
    return super.isLayoutSupported(layout);
  }
}

/** @override */
AmpInlineGalleryThumbnails['Component'] = Thumbnails;

/** @override */
AmpInlineGalleryThumbnails['props'] = {
  'aspectRatio': {attr: 'aspect-ratio', type: 'number', media: true},
  'children': {passthroughNonEmpty: true},
  'loop': {attr: 'loop', type: 'boolean', media: true},
};

/** @override */
AmpInlineGalleryThumbnails['layoutSizeDefined'] = true;

/** @override */
AmpInlineGalleryThumbnails['usesShadowDom'] = true;

/** @override */
AmpInlineGalleryThumbnails['shadowCss'] = CAROUSEL_CSS + THUMBNAIL_CSS;

/** @override */
AmpInlineGalleryThumbnails['useContexts'] = [CarouselContextProp];
