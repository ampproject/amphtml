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

import {CarouselEvents} from '../../amp-base-carousel/0.1/carousel-events';
import {InlineGalleryEvents} from './inline-gallery-events';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {htmlFor} from '../../../src/static-template';
import {isLayoutSizeDefined} from '../../../src/layout';
import {matches, scopedQuerySelector} from '../../../src/dom';
import {setStyle} from '../../../src/style';

export class AmpInlineGalleryThumbnails extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.carousel_ = null;

    /** @private {number} */
    this.thumbArWidth_ = 0;

    /** @private {number} */
    this.thumbArHeight_ = 0;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.thumbArWidth_ =
      Number(this.element.getAttribute('aspect-ratio-width')) || 0;
    this.thumbArHeight_ =
      Number(this.element.getAttribute('aspect-ratio-height')) || 0;
    // Stop events from the internal carousel from bubbling up to the
    // gallery, which would cause the pagination indicator to update.
    this.element.addEventListener(CarouselEvents.OFFSET_CHANGE, event => {
      event.stopPropagation();
    });
    this.element.addEventListener(CarouselEvents.INDEX_CHANGE, event => {
      event.stopPropagation();
    });
  }

  /**
   * @param {!Array<!Element>} slides The slides to create thumbnails for.
   */
  setSlides(slides) {
    const thumbnails = slides.map((slide, index) => {
      return this.createThumbnailForElement_(slide, index);
    });

    this.mutateElement(() => {
      this.createCarousel_(thumbnails);
    });
  }

  /**
   * @param {!Element} srcElement
   * @param {number} index
   * @return {!Element}
   */
  createThumbnailForElement_(srcElement, index) {
    // Create a thumbnail container (to handle item padding) and a thumbnail
    // with a resizer, to save the right amount of space based on the aspect
    // ratio.
    const html = htmlFor(this.element);
    const content = html`
      <div class="i-amphtml-inline-gallery-thumbnails-container">
        <div class="i-amphtml-inline-gallery-thumbnails-thumbnail">
          <div class="i-amphtml-inline-gallery-thumbnails-resizer"></div>
        </div>
      </div>
    `;

    // If an thumb width/height aspect ratio specified, used those, otherwise
    // use the aspect ratio of the element we are creating a thumb for and
    // fall back to a square if anything goes wrong.
    const arWidth = this.thumbArWidth_ || srcElement.offsetWidth || 1;
    const arHeight = this.thumbArHeight_ || srcElement.offsetHeight || 1;
    // Use a padding-right (along with `writing-mode: vertical-lr` in the CSS)
    // to make the width match the aspect ratio for the available height. Note
    // that we do not use an `svg` with a `viewBox` as that has problems in
    // Firefox.
    setStyle(
      content.querySelector('.i-amphtml-inline-gallery-thumbnails-resizer'),
      'padding-right',
      100 * (arWidth / arHeight),
      '%'
    );

    content
      .querySelector('.i-amphtml-inline-gallery-thumbnails-thumbnail')
      .appendChild(this.getThumbnailContent_(srcElement));
    content.onclick = () => {
      this.element.dispatchEvent(
        createCustomEvent(
          this.win,
          InlineGalleryEvents.GO_TO_SLIDE,
          dict({
            'index': index,
          }),
          {
            bubbles: true,
          }
        )
      );
      this.carousel_.getImpl().then(impl => {
        impl.goToSlide(index, {smoothScroll: true});
      });
    };
    return content;
  }

  /**
   * @return {!Element} An element to use when there is no image available
   *    for the thumbnail.
   */
  createDefaultThumbnail_() {
    const div = document.createElement('div');
    div.className = 'i-amphtml-inline-gallery-thumbnails-default';
    return div;
  }

  /**
   * Creates a thumbnail element for a given slide. If the slide is an image
   * directly contains an image, then the image is used. Otherwise, a
   * placeholder element is created instead.
   * @param {!Element} slide
   * @return {!Element}
   */
  getThumbnailContent_(slide) {
    const image = matches(slide, 'amp-img, img')
      ? slide
      : scopedQuerySelector(slide, '> amp-img, > img');

    if (!image) {
      return this.createDefaultThumbnail_();
    }

    const thumbImg = document.createElement('amp-img');
    thumbImg.className = 'i-amphtml-inline-gallery-thumbnails-image';
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
    // TODO(sparhami) Simply copying over the sizes for a plain img is not
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

  /**
   * Creates a carousel to hold the thumbnails.
   * TODO(sparhami) This should only create a carousel once and update slides
   * rather than recreating.
   * @param {!Array<!Element>} thumbnails
   */
  createCarousel_(thumbnails) {
    if (this.carousel_) {
      this.element.removeChild(this.carousel_);
    }

    // Note: The carousel is aria-hidden since it just duplicates the
    // information of the original carousel.
    // TODO(sparhami) Make the next/prev arrows move one carousel viewport
    // at a time.
    const html = htmlFor(this.element);
    this.carousel_ = html`
      <amp-base-carousel
        layout="fill"
        loop="true"
        mixed-length="true"
        snap="false"
        snap-align="center"
        controls="(pointer: fine) always, never"
        aria-hidden="true"
      >
      </amp-base-carousel>
    `;
    // We create with loop defaulting to true above, and allow it to be
    // overwriten.
    this.propagateAttributes(['loop'], this.carousel_);

    thumbnails.forEach(t => this.carousel_.appendChild(t));
    this.element.appendChild(this.carousel_);
  }
}
