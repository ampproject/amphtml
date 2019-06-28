/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {AmpEvents} from '../../../../src/amp-events';
import {
  AutoLightboxEvents,
  isActionableByTap,
} from '../../../../src/auto-lightbox';
import {CommonSignals} from '../../../../src/common-signals';
import {
  LIGHTBOX_THUMBNAIL_AD,
  LIGHTBOX_THUMBNAIL_UNKNOWN,
  LIGHTBOX_THUMBNAIL_VIDEO,
} from './lightbox-placeholders';
import {Services} from '../../../../src/services';
import {
  childElement,
  childElementByAttr,
  closestAncestorElementBySelector,
  elementByTag,
  iterateCursor,
} from '../../../../src/dom';
import {dev, devAssert, userAssert} from '../../../../src/log';
import {map} from '../../../../src/utils/object';
import {srcsetFromElement, srcsetFromSrc} from '../../../../src/srcset';
import {toArray} from '../../../../src/types';

const LIGHTBOX_ELIGIBLE_TAGS = {
  'AMP-IMG': true,
};

export const ELIGIBLE_TAP_TAGS = {
  'AMP-IMG': true,
};

export const VIDEO_TAGS = {
  'AMP-YOUTUBE': true,
  'AMP-VIDEO': true,
};

const GALLERY_TAG = 'amp-lightbox-gallery';
const CAROUSEL_TAG = 'AMP-CAROUSEL';
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
     * @private {!Object<string, !Array<!Element>>}
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
     * @private {!Array<!Element>}
     */
    this.seen_ = [];
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
    root.addEventListener(AmpEvents.DOM_UPDATE, () => {
      this.scanPromise_ = this.scanLightboxables_();
    });

    // Process elements where the `lightbox` attr is dynamically set.
    root.addEventListener(AutoLightboxEvents.NEWLY_SET, ({target}) => {
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
      const matches = this.ampdoc_.getRootNode().querySelectorAll('[lightbox]');
      const processLightboxElement = this.processLightboxElement_.bind(this);
      iterateCursor(matches, processLightboxElement);
    });
  }

  /**
   * Checks to see if a root element is supported.
   * @param {Element} element
   * @return {boolean}
   * @private
   */
  baseElementIsSupported_(element) {
    return LIGHTBOX_ELIGIBLE_TAGS[element.tagName];
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

    this.getSlidesFromCarousel_(carousel).then(slides => {
      slides.forEach(slide => {
        const shouldExcludeSlide =
          slide.hasAttribute('lightbox-exclude') ||
          (slide.hasAttribute('lightbox') &&
            slide.getAttribute('lightbox') !== lightboxGroupId);
        if (shouldExcludeSlide) {
          return;
        }
        const baseElement = getBaseElementForSlide(slide);
        if (this.seen_.includes(baseElement)) {
          return;
        }
        baseElement.setAttribute('lightbox', lightboxGroupId);
        this.seen_.push(baseElement);
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
    if (this.seen_.includes(element)) {
      return;
    }
    this.seen_.push(element);
    if (element.tagName == CAROUSEL_TAG) {
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
      child => child.tagName !== 'FIGCAPTION'
    );
    if (element) {
      element.setAttribute('lightbox', lightboxGroupId);
    }
    return element;
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
      .whenSignal(CommonSignals.LOAD_END)
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
      ? element.getImpl().then(videoPlayer => videoPlayer.getDuration())
      : Promise.resolve();
  }

  /**
   * Find or create thumbnails for lightboxed elements.
   * Return a list of thumbnails obj for lightbox gallery view
   * @param {string} lightboxGroupId
   * @return {!Array<!LightboxThumbnailDataDef>}
   */
  getThumbnails(lightboxGroupId) {
    return this.lightboxGroups_[lightboxGroupId].map(element => ({
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
      if (thumbnailImage && thumbnailImage.tagName == 'AMP-IMG') {
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
    if (element.tagName == 'AMP-IMG') {
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
