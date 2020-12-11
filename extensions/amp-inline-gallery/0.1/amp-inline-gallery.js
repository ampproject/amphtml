/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {CSS as AmpInlineGalleryCSS} from '../../../build/amp-inline-gallery-0.1.css';
import {AmpInlineGalleryPagination} from './amp-inline-gallery-pagination';
import {CSS as AmpInlineGalleryPaginationCSS} from '../../../build/amp-inline-gallery-pagination-0.1.css';
import {AmpInlineGalleryThumbnails} from './amp-inline-gallery-thumbnails';
import {CSS as AmpInlineGalleryThumbnailsCSS} from '../../../build/amp-inline-gallery-thumbnails-0.1.css';
import {CarouselEvents} from '../../amp-base-carousel/0.1/carousel-events';
import {InlineGalleryEvents} from './inline-gallery-events';
import {Layout} from '../../../src/layout';
import {getDetail} from '../../../src/event-helper';
import {
  iterateCursor,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {toArray} from '../../../src/types';

/**
 * The selector of children to update the progress on as the gallery's carousel
 * changes position.
 */
const CHILDREN_FOR_PROGRESS_SELECTOR = 'amp-inline-gallery-pagination';

/**
 * The selector for the element to contain the thumbnails.
 */
const THUMBNAILS_SELECTORS = 'amp-inline-gallery-thumbnails';

/**
 * The selector for the main carousel (i.e. not the one for the thumbnails).
 */
const CAROUSEL_SELECTOR =
  '> amp-base-carousel, :not(amp-inline-gallery-thumbnails) > amp-base-carousel';

class AmpInlineGallery extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    this.element.addEventListener(CarouselEvents.OFFSET_CHANGE, (event) => {
      this.onOffsetChange_(event);
    });
    this.element.addEventListener(CarouselEvents.INDEX_CHANGE, (event) => {
      this.onIndexChange_(event);
    });
    this.element.addEventListener(InlineGalleryEvents.GO_TO_SLIDE, (event) => {
      this.onGoToSlide_(event);
    });

    // Update the slides to all the `amp-inline-gallery-thumbnails` elements,
    // if any.
    // TODO(sparhami) This should respond to changes in slides on the
    // `amp-base-carousel`.
    Promise.all([
      scopedQuerySelector(this.element, CAROUSEL_SELECTOR).getImpl(),
      Promise.all(
        toArray(
          scopedQuerySelectorAll(this.element, THUMBNAILS_SELECTORS)
        ).map((el) => el.getImpl())
      ),
    ]).then((data) => {
      const carouselImpl = data[0];
      const thumbnailsImpls = data[1];
      const slides = carouselImpl.getSlides();

      toArray(thumbnailsImpls).forEach((impl) => impl.setSlides(slides));
    });
  }

  /** @override */
  prerenderAllowed() {
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  /**
   * @param {number} total
   * @param {number} index
   * @param {number} offset
   * @private
   */
  updateProgress_(total, index, offset) {
    iterateCursor(
      scopedQuerySelectorAll(this.element, CHILDREN_FOR_PROGRESS_SELECTOR),
      (el) => {
        el.getImpl().then((pagination) => {
          pagination.updateProgress(total, index, offset);
        });
      }
    );
  }

  /**
   * @param {!Event} event
   * @private
   */
  onIndexChange_(event) {
    const detail = getDetail(event);
    const total = detail['total'];
    const index = detail['index'];

    this.updateProgress_(total, index, 0);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onOffsetChange_(event) {
    const detail = getDetail(event);
    const total = detail['total'];
    const index = detail['index'];
    const offset = detail['offset'];

    this.updateProgress_(total, index, offset);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onGoToSlide_(event) {
    const detail = getDetail(event);
    const index = detail['index'];

    iterateCursor(
      scopedQuerySelectorAll(this.element, CAROUSEL_SELECTOR),
      (el) => {
        el.getImpl().then((carousel) => {
          carousel.goToSlide(index, {smoothScroll: true});
        });
      }
    );
  }
}

AMP.extension('amp-inline-gallery', '0.1', (AMP) => {
  AMP.registerElement(
    'amp-inline-gallery-pagination',
    AmpInlineGalleryPagination,
    AmpInlineGalleryPaginationCSS
  );
  AMP.registerElement(
    'amp-inline-gallery-thumbnails',
    AmpInlineGalleryThumbnails,
    AmpInlineGalleryThumbnailsCSS
  );
  AMP.registerElement(
    'amp-inline-gallery',
    AmpInlineGallery,
    AmpInlineGalleryCSS
  );
});
