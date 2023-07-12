import {Layout_Enum} from '#core/dom/layout';
import {scopedQuerySelector, scopedQuerySelectorAll} from '#core/dom/query';
import {toArray} from '#core/types/array';

import {getDetail} from '#utils/event-helper';

import {AmpInlineGalleryCaptions} from './amp-inline-gallery-captions';
import {AmpInlineGalleryPagination} from './amp-inline-gallery-pagination';
import {AmpInlineGallerySlide} from './amp-inline-gallery-slide';
import {AmpInlineGalleryThumbnails} from './amp-inline-gallery-thumbnails';
import {InlineGalleryEvents} from './inline-gallery-events';

import {CSS as AmpInlineGalleryCSS} from '../../../build/amp-inline-gallery-0.1.css';
import {CSS as AmpInlineGalleryCaptionsCSS} from '../../../build/amp-inline-gallery-captions-0.1.css';
import {CSS as AmpInlineGalleryPaginationCSS} from '../../../build/amp-inline-gallery-pagination-0.1.css';
import {CSS as AmpInlineGallerySlideCSS} from '../../../build/amp-inline-gallery-slide-0.1.css';
import {CSS as AmpInlineGalleryThumbnailsCSS} from '../../../build/amp-inline-gallery-thumbnails-0.1.css';
import {CarouselEvents} from '../../amp-base-carousel/0.1/carousel-events';

/**
 * The selector of children to update the progress on as the gallery's carousel
 * changes position.
 */
const CHILDREN_FOR_PROGRESS_SELECTOR =
  'amp-inline-gallery-pagination, amp-inline-gallery-captions';

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
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

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
        toArray(scopedQuerySelectorAll(this.element, THUMBNAILS_SELECTORS)).map(
          (el) => el.getImpl()
        )
      ),
    ]).then((data) => {
      const carouselImpl = data[0];
      const thumbnailsImpls = data[1];
      const slides = carouselImpl.getSlides();

      toArray(thumbnailsImpls).forEach((impl) => impl.setSlides(slides));
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.CONTAINER;
  }

  /**
   * @param {number} total
   * @param {number} index
   * @param {number} offset
   * @param {!Array<!Element>} slides
   * @private
   */
  updateProgress_(total, index, offset, slides) {
    scopedQuerySelectorAll(
      this.element,
      CHILDREN_FOR_PROGRESS_SELECTOR
    ).forEach((el) => {
      el.getImpl().then((pagination) => {
        pagination.updateProgress(total, index, offset, slides);
      });
    });
  }

  /**
   * @param {!Event} event
   * @private
   */
  onIndexChange_(event) {
    const detail = getDetail(event);
    const total = detail['total'];
    const index = detail['index'];
    const slides = detail['slides'];

    this.updateProgress_(total, index, 0, slides);
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
    const slides = detail['slides'];

    this.updateProgress_(total, index, offset, slides);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onGoToSlide_(event) {
    const detail = getDetail(event);
    const index = detail['index'];

    scopedQuerySelectorAll(this.element, CAROUSEL_SELECTOR).forEach((el) => {
      el.getImpl().then((carousel) => {
        carousel.goToSlide(index, {smoothScroll: true});
      });
    });
  }
}

AMP.extension('amp-inline-gallery', '0.1', (AMP) => {
  AMP.registerElement(
    'amp-inline-gallery-captions',
    AmpInlineGalleryCaptions,
    AmpInlineGalleryCaptionsCSS
  );
  AMP.registerElement(
    'amp-inline-gallery-pagination',
    AmpInlineGalleryPagination,
    AmpInlineGalleryPaginationCSS
  );
  AMP.registerElement(
    'amp-inline-gallery-slide',
    AmpInlineGallerySlide,
    AmpInlineGallerySlideCSS
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
