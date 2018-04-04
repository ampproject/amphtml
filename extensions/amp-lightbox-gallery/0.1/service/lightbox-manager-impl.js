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
import {CommonSignals} from '../../../../src/common-signals';
import {
  LIGHTBOX_THUMBNAIL_AD,
  LIGHTBOX_THUMBNAIL_UNKNOWN,
  LIGHTBOX_THUMBNAIL_VIDEO,
} from './lightbox-placeholders';
import {
  childElement,
  childElementByAttr,
  closestByTag,
  elementByTag,
  iterateCursor,
} from '../../../../src/dom';
import {dev, user} from '../../../../src/log';
import {hasOwn, map} from '../../../../src/utils/object';
import {isExperimentOn} from '../../../../src/experiments';
import {srcsetFromElement, srcsetFromSrc} from '../../../../src/srcset';
import {toArray} from '../../../../src/types';

const LIGHTBOX_ELIGIBLE_TAGS = {
  'AMP-AD': true,
  'AMP-IMG': true,
  'AMP-VIDEO': true,
  'AMP-YOUTUBE': true,
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
const SLIDE_SELECTOR = '.amp-carousel-slide';

/** @typedef {{
 *  srcset: ?../../../../src/srcset.Srcset,
 *  placeholderSrc: string,
 *  element: !Element,
 *  timestampPromise: ?Promise<number>
 * }} */
export let LightboxThumbnailDataDef;

/** @typedef {{
 *  sourceCarousel: !Element,
 *  excludedIndexes: !Array<number>
 * }} */
let LightboxedCarouselMetadataDef;

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

    // Extra safety check, we don't install this service if experiment is off
    dev().assert(isExperimentOn(ampdoc.win, 'amp-lightbox-gallery'));

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

    /**
     * List of lightbox elements that have already been scanned.
     * @private {!Array<!Element>}
     */
    this.seen_ = [];

    /**
     * If the lightbox group is a carousel, this object contains a
     * mapping of the lightbox group id to the carousel element.
     * @private {!Object<string, !LightboxedCarouselMetadataDef>}
     */
    this.lightboxSourceCarousels_ = map();
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
    // Rescan whenever DOM changes happen.
    this.ampdoc_.getRootNode().addEventListener(AmpEvents.DOM_UPDATE, () => {
      this.scanPromise_ = this.scanLightboxables_();
    });
    return this.scanPromise_;
  }

  /**
   * Returns a reference to the source carousel of the lightbox
   * group if one exists.
   * @param {string} lightboxGroupId
   * @return {!LightboxedCarouselMetadataDef|null}
   */
  getCarouselMetadataForLightboxGroup(lightboxGroupId) {
    if (hasOwn(this.lightboxSourceCarousels_, lightboxGroupId)) {
      return this.lightboxSourceCarousels_[lightboxGroupId];
    }
    return null;
  }

  /**
   * Returns true if the lightboxGroupId belongs to an amp carousel
   * @param {string} lightboxGroupId
   * @return {boolean}
   */
  hasCarousel(lightboxGroupId) {
    return hasOwn(this.lightboxSourceCarousels_, lightboxGroupId);
  }

  /**
   * Decides whether an already lightboxable element should automatically get
   * a tap handler to open in the lightbox.
   * @param {!Element} element
   * @return {boolean}
   */
  meetsHeuristicsForTap_(element) {
    dev().assert(element);
    dev().assert(element.hasAttribute('lightbox'));

    if (!ELIGIBLE_TAP_TAGS[element.tagName]) {
      return false;
    }
    if (element.hasAttribute('on')) {
      return false;
    }
    return true;
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
    const lightboxGroupId = carousel.getAttribute('lightbox') ||
    'carousel' + (carousel.getAttribute('id') || this.counter_++);
    if (carousel.getAttribute('type') == 'slides') {
      this.lightboxSourceCarousels_[lightboxGroupId] = map({
        'sourceCarousel': carousel,
        'excludedIndexes': [],
      });
      // TODO (#13011): scroll carousel needs to support goToSlide
      // before we can use it for lightbox, so they currently don't count.
    }
    this.getSlidesFromCarousel_(carousel).then(slides => {
      slides.forEach((slide, index) => {
        const shouldExcludeSlide = slide.hasAttribute('lightbox-exclude')
            || (slide.hasAttribute('lightbox')
                && slide.getAttribute('lightbox') !== lightboxGroupId);
        if (shouldExcludeSlide) {
          this.lightboxSourceCarousels_[lightboxGroupId]
              .excludedIndexes.push(index);
        } else {
          slide.setAttribute('lightbox', lightboxGroupId);
          this.processBaseLightboxElement_(slide, lightboxGroupId);
        }
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
    const element = childElement(figure,
        child => child.tagName !== 'FIGCAPTION');
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
      const unwrappedFigureElement = this.unwrapLightboxedFigure_(element,
          lightboxGroupId);
      if (!unwrappedFigureElement) {
        return;
      } else {
        element = unwrappedFigureElement;
      }
    }

    user().assert(this.baseElementIsSupported_(element),
        `The element ${element.tagName} isn't supported in lightbox yet.`);

    if (!this.lightboxGroups_[lightboxGroupId]) {
      this.lightboxGroups_[lightboxGroupId] = [];
    }

    this.lightboxGroups_[lightboxGroupId]
        .push(dev().assertElement(element));
    if (this.meetsHeuristicsForTap_(element)) {
      const gallery = elementByTag(this.ampdoc_.getRootNode(), GALLERY_TAG);
      element.setAttribute('on', `tap:${gallery.id}.activate`);
    }
  }

  /**
   * @param {!Element} element
   * @return {!Promise<!Array<!Element>>}
   * @private
   */
  getSlidesFromCarousel_(element) {
    return element.signals().whenSignal(CommonSignals.LOAD_END).then(() => {
      return toArray(element./*OK*/querySelectorAll(SLIDE_SELECTOR));
    });
  }

  /**
   * Return a list of lightboxable elements
   * @param {string} lightboxGroupId
   * @return {!Promise<!Array<!Element>>}
   */
  getElementsForLightboxGroup(lightboxGroupId) {
    return this.maybeInit()
        .then(() => dev().assert(this.lightboxGroups_[lightboxGroupId]));
  }

  /**
   * Get the description for single lightboxed item.
   * @param {!Element} element
   * @return {string|null}
   */
  getDescription(element) {
    // If the element in question is the descendant of a figure element
    // try using the figure caption as the lightbox description.
    const figureParent = closestByTag(element, 'figure');
    if (figureParent) {
      const figCaption = elementByTag(figureParent, 'figcaption');
      if (figCaption) {
        return figCaption./*OK*/innerText;
      }
    }
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      const descriptionElement = element.ownerDocument
          .getElementById(ariaDescribedBy);
      if (descriptionElement) {
        return descriptionElement./*OK*/innerText;
      }
    }
    const alt = element.getAttribute('alt');
    if (alt) {
      return alt;
    }
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return ariaLabel;
    }
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const descriptionElement = element.ownerDocument
          .getElementById(ariaLabelledBy);
      if (descriptionElement) {
        return descriptionElement./*OK*/innerText;
      }
    }

    return null;
  }

  getVideoTimestamp_(element) {
    if (VIDEO_TAGS[element.tagName]) {
      return element.getImpl().then(videoPlayer => {
        return videoPlayer.getDuration();
      });
    } else {
      return null;
    }
  }

  /**
   * Find or create thumbnails for lightboxed elements.
   * Return a list of thumbnails obj for lightbox gallery view
   * @param {string} lightboxGroupId
   * @return {!Array<!LightboxThumbnailDataDef>}
   */
  getThumbnails(lightboxGroupId) {
    return this.lightboxGroups_[lightboxGroupId]
        .map(element => ({
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
   * @return {!../../../../src/srcset.Srcset|null}
   * @private
   */
  getThumbnailSrcset_(element) {
    if (element.hasAttribute('lightbox-thumbnail-id')) {
      const thumbnailId = element.getAttribute('lightbox-thumbnail-id');
      const thumbnailImage = element.ownerDocument.getElementById(thumbnailId);
      user().assert(thumbnailImage.tagName == 'AMP-IMG');
      return srcsetFromElement(thumbnailImage);
    } else {
      return this.getUserPlaceholderSrcset_(element);
    }
  }

  /**
   * Get the srcset for the user-specified placeholder for each element
   * @param {!Element} element
   * @return {!../../../../src/srcset.Srcset|null}
   * @private
   */
  getUserPlaceholderSrcset_(element) {
    if (element.tagName == 'AMP-IMG') {
      return srcsetFromElement(element);
    } else if (element.tagName == 'AMP-VIDEO') {
      return this.getThumbnailSrcsetForVideo_(element);
      // TODO: process placeholder logic for other components as added
    } else {
      const placeholder = childElementByAttr(element, 'placeholder');
      if (placeholder) {
        return this.getUserPlaceholderSrcset_(placeholder);
      } else {
        return null;
      }
    }
  }

  /**
   * Given an amp video, returns the thumbnail srcset.
   * @param {!Element} ampVideo
   * @return {!../../../../src/srcset.Srcset|null}
   */
  getThumbnailSrcsetForVideo_(ampVideo) {
    const poster = ampVideo.getAttribute('poster');
    return poster ? srcsetFromSrc(poster) : null;
  }
}
