import {isLayoutSizeDefined} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {matches, scopedQuerySelector} from '#core/dom/query';
import {htmlFor} from '#core/dom/static-template';
import {setStyle} from '#core/dom/style';

import {createCustomEvent} from '#utils/event-helper';

import {InlineGalleryEvents} from './inline-gallery-events';

import {CarouselEvents} from '../../amp-base-carousel/0.1/carousel-events';

/**
 * Renders a carousel of thumbnails for an inline gallery.
 *
 * TODO(sparhami) Look into syncing the state between the main carousel and
 * the thumbnails. One potential solution is to only change the position when
 * the new slide would be outside of the currently visibile thumbnails. More
 * investigation / UX work is needed here.
 * TODO(sparhami) Change amp-base-carousel to move one viewport of items at
 * a time when using `mixed-length="true"`.
 * TODO(sparhami) Look into styling for the active thumbnail and other
 * customizations.
 * TODO(sparhami) Make non-looping thumbnails the default; need to make sure
 * the next arrow works properly for that case.
 */
export class AmpInlineGalleryThumbnails extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.carousel_ = null;

    /** @private {?number} */
    this.thumbAspectRatio_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const aspectRatioWidth =
      Number(this.element.getAttribute('aspect-ratio-width')) || 0;
    const aspectRatioHeight =
      Number(this.element.getAttribute('aspect-ratio-height')) || 0;
    if (aspectRatioWidth && aspectRatioHeight) {
      this.thumbAspectRatio_ = aspectRatioWidth / aspectRatioHeight;
    }

    // The pagination indicator should be controlled by the gallery's main
    // carousel and not the carousel from the thumbnail strip. We stop
    // propagation since the gallery is not interested in slide changes from
    // our carousel.
    this.element.addEventListener(CarouselEvents.OFFSET_CHANGE, (event) => {
      event.stopPropagation();
    });
    this.element.addEventListener(CarouselEvents.INDEX_CHANGE, (event) => {
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

    // If an thumb width/height aspect ratio specified, used that. Otherwise
    // use the aspect ratio of the element we are creating a thumb and
    // fall back to a square if anything goes wrong.
    const srcAspectRatio =
      srcElement./*OK*/ offsetWidth / srcElement./*OK*/ offsetHeight;
    const aspectRatio = this.thumbAspectRatio_ || srcAspectRatio || 1;
    // Use a padding-right (along with `writing-mode: vertical-lr` in the CSS)
    // to make the width match the aspect ratio for the available height. Note
    // that we do not use an `svg` with a `viewBox` as that has problems in
    // Firefox.
    setStyle(
      content.querySelector('.i-amphtml-inline-gallery-thumbnails-resizer'),
      'padding-right',
      100 * aspectRatio,
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
          {
            'index': index,
          },
          {
            bubbles: true,
          }
        )
      );
      this.carousel_.getImpl().then((impl) => {
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

    // Create a new thumbnail image, we do not want to clone since the
    // elemnet may have inline styles, classes or attributes that affect
    // rendering that we do not want.
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
    for (const thumbnail of thumbnails) {
      this.carousel_.appendChild(thumbnail);
    }

    // We create with loop defaulting to false above, and allow it to be
    // overwriten.
    propagateAttributes(['loop'], this.element, this.carousel_);
    this.element.appendChild(this.carousel_);
  }
}
