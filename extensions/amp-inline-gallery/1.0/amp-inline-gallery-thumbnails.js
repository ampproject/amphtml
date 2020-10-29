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

import * as Preact from '../../../src/preact';
import {CSS} from '../../amp-base-carousel/1.0/base-carousel.jss';
import {CarouselContextProp} from '../../amp-base-carousel/1.0/carousel-props';
import {Layout} from '../../../src/layout';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Thumbnails} from './thumbnails';
import {
  closestAncestorElementBySelector,
  matches,
  scopedQuerySelector,
} from '../../../src/dom';
import {dev, userAssert} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {toArray} from '../../../src/types';

/** @const {string} */
export const TAG = 'amp-inline-gallery-thumbnails';

/**
 * The selector for the main carousel (i.e. not the one for the thumbnails).
 */
const CAROUSEL_SELECTOR =
  '> amp-base-carousel, :not(amp-inline-gallery-thumbnails) > amp-base-carousel';

const GALLERY_SELECTOR = 'amp-inline-gallery';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
export class AmpInlineGalleryThumbnails extends PreactBaseElement {
  /** @override */
  init() {
    const inlineGallery = dev().assertElement(
      closestAncestorElementBySelector(this.element, GALLERY_SELECTOR)
    );
    const carousel = scopedQuerySelector(inlineGallery, CAROUSEL_SELECTOR);
    const slides = toArray(carousel.children);
    slides.forEach((slide) => {
      this.element.appendChild(createThumbnailForElement(slide));
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-inline-gallery-bento'),
      'expected amp-inline-gallery-bento experiment to be enabled'
    );
    return layout == Layout.FIXED_HEIGHT;
  }
}

/** @override */
AmpInlineGalleryThumbnails['Component'] = Thumbnails;

/** @override */
AmpInlineGalleryThumbnails['props'] = {
  'aspectRatio': {
    attrs: ['aspect-ratio-width', 'aspect-ratio-height'],
    parseAspectRatioAttrs,
  },
  'loop': {attr: 'loop', type: 'boolean'},
};

/** @override */
AmpInlineGalleryThumbnails['children'] = {
  'children': {
    name: 'children',
    selector: '*',
    single: false,
  },
};

/** @override */
AmpInlineGalleryThumbnails['layoutSizeDefined'] = true;

/** @override */
AmpInlineGalleryThumbnails['shadowCss'] = CSS;

/** @override */
AmpInlineGalleryThumbnails['useContexts'] = [CarouselContextProp];

/**
 * @param {!Element} element
 * @return {?number}
 */
function parseAspectRatioAttrs(element) {
  const aspectRatioWidth =
    Number(element.getAttribute('aspect-ratio-width')) || 0;
  const aspectRatioHeight =
    Number(element.getAttribute('aspect-ratio-height')) || 0;
  if (aspectRatioWidth && aspectRatioHeight) {
    return aspectRatioWidth / aspectRatioHeight;
  }
}

/**
 * Creates a thumbnail element for a given slide. If the slide is an image
 * directly contains an image, then the image is used. Otherwise, a
 * placeholder element is created instead.
 * @param {!Element} slide
 * @return {!Element}
 */
function createThumbnailForElement(slide) {
  const image = matches(slide, 'amp-img, img')
    ? slide
    : scopedQuerySelector(slide, '> amp-img, > img');

  if (!image) {
    return slide.cloneNode(/* deep */ true);
  }

  // Create a new thumbnail image, we do not want to clone since the
  // elemnet may have inline styles, classes or attributes that affect
  // rendering that we do not want.
  const thumbImg = document.createElement('amp-img');
  thumbImg.setAttribute('layout', 'fill');

  // Use the attribute since this may be an amp-img.
  const src = image.getAttribute('src');
  if (src) {
    thumbImg.setAttribute('src', src);
  }

  // Use the attribute since this may be an amp-img.
  const srcset = image.getAttribute('srcset');
  if (srcset) {
    thumbImg.setAttribute('srcset', srcset);
  }

  // Use the attribute since this may be an amp-img.
  // TODO: Simply copying over the sizes for a plain img is not
  // ideal, since those will be based on what makes sense for the original
  // carousel. We would ideally modify the length values for sizes based
  // on the ratio of the size of the thumbnail to the original image. For
  // example:
  // `<img srcset="..." sizes="(max-width: 600px) 600px, 1200px">`
  // to something like:
  // `<img srcset="..." sizes="(max-width: 600px) 150px, 300px">`
  const sizes = image.getAttribute('sizes');
  if (sizes) {
    thumbImg.setAttribute('sizes', sizes);
  }

  return thumbImg;
}
