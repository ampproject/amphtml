import {AmpEvents_Enum} from '#core/constants/amp-events';
import {CommonSignals_Enum} from '#core/constants/common-signals';
import {
  childElement,
  childElementByAttr,
  closestAncestorElementBySelector,
  elementByTag,
} from '#core/dom/query';
import {srcsetFromElement, srcsetFromSrc} from '#core/dom/srcset';
import {toArray} from '#core/types/array';
import {map} from '#core/types/object';

import {Services} from '#service';

import {dev, devAssert, userAssert} from '#utils/log';

import {
  LIGHTBOX_THUMBNAIL_AD,
  LIGHTBOX_THUMBNAIL_UNKNOWN,
  LIGHTBOX_THUMBNAIL_VIDEO,
} from './lightbox-placeholders';

import {
  AutoLightboxEvents_Enum,
  isActionableByTap,
} from '../../../../src/auto-lightbox';

const LIGHTBOX_ELIGIBLE_TAGS = new Set(['AMP-IMG', 'IMG']);

// eslint-disable-next-line local/no-export-side-effect
export const ELIGIBLE_TAP_TAGS = new Set(['AMP-IMG', 'IMG']);

// eslint-disable-next-line local/no-export-side-effect
export const VIDEO_TAGS = new Set(['AMP-YOUTUBE', 'AMP-VIDEO']);

const GALLERY_TAG = 'amp-lightbox-gallery';
const CAROUSEL_TAGS = new Set(['AMP-CAROUSEL', 'AMP-BASE-CAROUSEL']);
const FIGURE_TAG = 'FIGURE';
const SLIDE_SELECTOR = '.amp-carousel-slide, .i-amphtml-carousel-slotted';

/**
 * @param {!Element} slide
 * @return {!Element}
 */
function getBaseElementForSlide(slide) {
  const tagName = slide.tagName.toUpperCase();
  if (tagName == 'AMP-IMG' || tagName == 'FIGURE') {
    return slide;
  }
  const figure = slide.querySelector('figure');
  if (figure) {
    return figure;
  }
  const allImages = slide.querySelectorAll('amp-img');
  userAssert(
    allImages.length == 1,
    'Found more than one images or none in slide!'
  );
  return dev().assertElement(allImages[0]);
}

/** @typedef {{
 *  srcset: ?../../../../src/srcset.Srcset,
 *  placeholderSrc: string,
 *  element: !Element,
 *  timestampPromise: !Promise<number>
 * }} */
export let LightboxThumbnailDataDef;

/**
 * LightboxManager is a document-scoped service responsible for:
 *  -Finding elements marked to be lightboxable (via `lightbox` attribute)
 *  -Keeping an ordered list of lightboxable elements
 *  -Providing functionality to get next/previous lightboxable element given
 *   the current element.
 *  -Discovering elements that can be auto-lightboxed and add the
 *   `lightbox` attribute and possibly an on-tap handler to them
 */
export class LightboxManager {
  /**
   * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!../../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /**
     * Cache for the `maybeInit()` call.
     * @private {?Promise}
     **/
    this.scanPromise_ = null;

    /**
     * Ordered lists of lightboxable elements according to group
     * @private {!{[key: string]: !Array<!Element>}}
     */
    this.lightboxGroups_ = map({
      default: [],
    });

    /**
     * Counter tracking number of carousels without ids
     * @private {number}
     */
    this.counter_ = 0;

    // TODO(alanorozco): Improve performance of visited lookup by setting
    // mapped unique ids.
    /**
     * List of lightbox elements that have already been scanned.
     * @private {!Set<!Element>}
     */
    this.seen_ = new Set();
  }

  /**
   * Initializes the manager only once.
   * @return {!Promise}
   */
  maybeInit() {
    if (this.scanPromise_) {
      return this.scanPromise_;
    }

    this.scanPromise_ = this.scanLightboxables_();

    const root = this.ampdoc_.getRootNode();

    // Rescan whenever DOM changes happen.
    root.addEventListener(AmpEvents_Enum.DOM_UPDATE, () => {
      this.scanPromise_ = this.scanLightboxables_();
    });

    // Process elements where the `lightbox` attr is dynamically set.
    root.addEventListener(AutoLightboxEvents_Enum.NEWLY_SET, (e) => {
      const {target} = e;
      this.processLightboxElement_(dev().assertElement(target));
    });

    return this.scanPromise_;
  }

  /**
   * Scans the document for lightboxable elements and updates `this.elements_`
   * accordingly.
   * @private
   * @return {!Promise}
   */
  scanLightboxables_() {
    return this.ampdoc_.whenReady().then(() => {
      const matches = this.ampdoc_
        .getRootNode()
        .querySelectorAll('[lightbox],[data-lightbox]');
      const processLightboxElement = this.processLightboxElement_.bind(this);
      matches.forEach(processLightboxElement);
    });
  }

  /**
   * Checks to see if a root element is supported.
   * @param {Element} element
   * @return {boolean}
   * @private
   */
  baseElementIsSupported_(element) {
    return LIGHTBOX_ELIGIBLE_TAGS.has(element.tagName);
  }

  /**
   * Process an amp-carousel element for lightbox, assigns a lightbox
   * group id, installs the lightbox attribute and tap handlers to open
   * the lightbox on the eligible slide elements.
   * @param {!Element} carousel
   */
  processLightboxCarousel_(carousel) {
    const lightboxGroupId =
      carousel.getAttribute('lightbox') ||
      `carousel${carousel.getAttribute('id') || this.counter_++}`;

    this.getSlidesFromCarousel_(carousel).then((slides) => {
      slides.forEach((slide) => {
        const shouldExcludeSlide =
          slide.hasAttribute('lightbox-exclude') ||
          (slide.hasAttribute('lightbox') &&
            slide.getAttribute('lightbox') !== lightboxGroupId);
        if (shouldExcludeSlide) {
          return;
        }
        const baseElement = getBaseElementForSlide(slide);
        if (this.seen_.has(baseElement)) {
          return;
        }
        baseElement.setAttribute('lightbox', lightboxGroupId);
        this.seen_.add(baseElement);
        this.processBaseLightboxElement_(baseElement, lightboxGroupId);
      });
    });
  }
  /**
   * Adds element to correct lightbox group, installs tap handler.
   * @param {!Element} element
   * @private
   */
  processLightboxElement_(element) {
    if (this.seen_.has(element)) {
      return;
    }
    this.seen_.add(element);
    if (CAROUSEL_TAGS.has(element.tagName)) {
      this.processLightboxCarousel_(element);
    } else {
      const lightboxGroupId = element.getAttribute('lightbox') || 'default';
      this.processBaseLightboxElement_(element, lightboxGroupId);
    }
  }

  /**
   * Unwraps a figure element and lightboxes the
   * @param {!Element} figure
   * @param {string} lightboxGroupId
   * @return {?Element}
   * @private
   */
  unwrapLightboxedFigure_(figure, lightboxGroupId) {
    // Assume that the lightbox target is whichever element inside the figure
    // that is not the figcaption.
    const element = childElement(
      figure,
      (child) => child.tagName !== 'FIGCAPTION'
    );
    const isGallerySlide = element.classList.contains(
      'i-amphtml-inline-gallery-slide-content-slot'
    );
    // Special handling for gallery slides, needed since they require a
    // wrapping div inside of the figure for the content.
    const unwrappedElement = isGallerySlide
      ? isGallerySlide.firstChild
      : element;

    if (unwrappedElement) {
      unwrappedElement.setAttribute('lightbox', lightboxGroupId);
    }
    return unwrappedElement;
  }

  /**
   * Assigns each lightboxed element to a lightbox group and adds
   * the on tap activate attribute.
   * @param {!Element} element
   * @param {string} lightboxGroupId
   */
  processBaseLightboxElement_(element, lightboxGroupId) {
    if (element.tagName == FIGURE_TAG) {
      const unwrappedFigureElement = this.unwrapLightboxedFigure_(
        element,
        lightboxGroupId
      );
      if (!unwrappedFigureElement) {
        return;
      }
      element = unwrappedFigureElement;
    }

    userAssert(
      this.baseElementIsSupported_(element),
      "The element %s isn't supported in lightbox yet.",
      element.tagName
    );

    if (!this.lightboxGroups_[lightboxGroupId]) {
      this.lightboxGroups_[lightboxGroupId] = [];
    }

    this.lightboxGroups_[lightboxGroupId].push(dev().assertElement(element));
    if (isActionableByTap(element)) {
      return;
    }
    const gallery = elementByTag(this.ampdoc_.getRootNode(), GALLERY_TAG);
    const actions = Services.actionServiceForDoc(element);
    actions.setActions(element, `tap:${gallery.id}.activate`);
  }

  /**
   * @param {!Element} element
   * @return {!Promise<!Array<!Element>>}
   * @private
   */
  getSlidesFromCarousel_(element) {
    return element
      .signals()
      .whenSignal(CommonSignals_Enum.LOAD_END)
      .then(() => {
        return toArray(element./*OK*/ querySelectorAll(SLIDE_SELECTOR));
      });
  }

  /**
   * Return a list of lightboxable elements
   * @param {string} lightboxGroupId
   * @return {!Promise<!Array<!Element>>}
   */
  getElementsForLightboxGroup(lightboxGroupId) {
    return this.maybeInit().then(() =>
      devAssert(this.lightboxGroups_[lightboxGroupId])
    );
  }

  /**
   * Get the description for single lightboxed item.
   * @param {!Element} element
   * @return {string}
   */
  getDescription(element) {
    // If the element in question is the descendant of a figure element
    // try using the figure caption as the lightbox description.
    const figureParent = closestAncestorElementBySelector(element, 'figure');
    if (figureParent) {
      const figCaption = elementByTag(figureParent, 'figcaption');
      if (figCaption) {
        return figCaption./*OK*/ innerText;
      }
    }
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      const descriptionElement = this.ampdoc_.getElementById(ariaDescribedBy);
      if (descriptionElement) {
        return descriptionElement./*OK*/ innerText;
      }
    }
    return '';
  }

  /**
   * Gets the duration of a supported video element
   * @param {!Element} element
   * @return {!Promise<number>}
   * @private
   */
  getVideoTimestamp_(element) {
    return VIDEO_TAGS[element.tagName]
      ? element.getImpl().then((videoPlayer) => videoPlayer.getDuration())
      : Promise.resolve();
  }

  /**
   * Find or create thumbnails for lightboxed elements.
   * Return a list of thumbnails obj for lightbox gallery view
   * @param {string} lightboxGroupId
   * @return {!Array<!LightboxThumbnailDataDef>}
   */
  getThumbnails(lightboxGroupId) {
    return this.lightboxGroups_[lightboxGroupId].map((element) => ({
      srcset: this.getThumbnailSrcset_(dev().assertElement(element)),
      placeholderSrc: this.getPlaceholderForElementType_(element),
      element,
      timestampPromise: this.getVideoTimestamp_(element),
    }));
  }

  /**
   * Returns the default placeholder based on element type
   * @param {!Element} element
   * @return {string}
   * @private
   */
  getPlaceholderForElementType_(element) {
    // TODO(#12713): add placeholder icons for each component type
    const type = element.tagName;
    switch (type) {
      case 'AMP-AD':
        return LIGHTBOX_THUMBNAIL_AD;
      // TODO(alanorozco): This can be replaced by a check of video service
      // registration signal, were this list to grow larger.
      case 'AMP-VIDEO':
      case 'AMP-YOUTUBE':
        return LIGHTBOX_THUMBNAIL_VIDEO;
      default:
        return LIGHTBOX_THUMBNAIL_UNKNOWN;
    }
  }

  /**
   * Get thumbnail srcset for single element.
   * @param {!Element} element
   * @return {?../../../../src/srcset.Srcset}
   * @private
   */
  getThumbnailSrcset_(element) {
    if (element.hasAttribute('lightbox-thumbnail-id')) {
      const thumbnailId = element.getAttribute('lightbox-thumbnail-id');
      const thumbnailImage = this.ampdoc_.getElementById(thumbnailId);
      if (LIGHTBOX_ELIGIBLE_TAGS.has(thumbnailImage?.tagName)) {
        return srcsetFromElement(thumbnailImage);
      }
    }
    return this.getUserPlaceholderSrcset_(element);
  }

  /**
   * Get the srcset for the user-specified placeholder for each element
   * @param {!Element} element
   * @return {?../../../../src/srcset.Srcset}
   * @private
   */
  getUserPlaceholderSrcset_(element) {
    if (LIGHTBOX_ELIGIBLE_TAGS.has(element.tagName)) {
      return srcsetFromElement(element);
    }
    if (element.tagName == 'AMP-VIDEO') {
      return this.getThumbnailSrcsetForVideo_(element);
      // TODO: process placeholder logic for other components as added
    }
    const placeholder = childElementByAttr(element, 'placeholder');
    if (placeholder) {
      return this.getUserPlaceholderSrcset_(placeholder);
    }
    return null;
  }

  /**
   * Given an amp video, returns the thumbnail srcset.
   * @param {!Element} ampVideo
   * @return {?../../../../src/srcset.Srcset}
   */
  getThumbnailSrcsetForVideo_(ampVideo) {
    const poster = ampVideo.getAttribute('poster');
    return poster ? srcsetFromSrc(poster) : null;
  }
}
