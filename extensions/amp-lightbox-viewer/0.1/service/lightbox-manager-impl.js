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

import {isExperimentOn} from '../../../../src/experiments';
import {dev} from '../../../../src/log';
import {elementByTag, iterateCursor} from '../../../../src/dom';
import {toArray} from '../../../../src/types';
import {CommonSignals} from '../../../../src/common-signals';


const ELIGIBLE_TAP_TAGS = {
  'amp-img': true,
  'amp-anim': true,
};

const VIEWER_TAG = 'amp-lightbox-viewer';
const CAROUSEL_TAG = 'amp-carousel';
const SLIDE_SELECTOR = '.amp-carousel-slide';

/** @typedef {{
 *  url: string,
 *  element: !Element
 * }} */
let LightboxThumbnailDataDef;

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
    dev().assert(isExperimentOn(ampdoc.win, 'amp-lightbox-viewer'));

    /** @const @private {!../../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /**
     * Cache for the `maybeInit()` call.
     * @private {?Promise}
     **/
    this.initPromise_ = null;

    /**
     * Ordered lists of lightboxable elements according to group
     * @private {!Object<string, !Array<!Element>>}
     */
    this.lightboxGroups_ = {
      default: [],
    };

    /**
     * Counter tracking number of carousels without ids
     * @private {number}
     */
    this.counter_ = 0;
  }

  /**
   * Initializes the manager only once.
   * @return {!Promise}
   */
  maybeInit() {
    if (this.initPromise_) {
      return this.initPromise_;
    }
    this.initPromise_ = this.scanLightboxables_();
    return this.initPromise_;
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

    if (!ELIGIBLE_TAP_TAGS[element.tagName.toLowerCase()]) {
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
   * Adds element to correct lightbox group, installs tap handler.
   * @param {!Element} element
   * @private
   */
  processLightboxElement_(element) {
    if (element.tagName.toLowerCase() == CAROUSEL_TAG) {
      const lightboxGroupId = element.getAttribute('lightbox') ||
       'carousel' + (element.getAttribute('id') || this.counter_++);
      this.getSlidesFromCarousel_(element).then(slides => {
        slides.forEach(slide => {
          // TODO: review naming conventions for component attributes
          if (!slide.hasAttribute('lightbox-exclude')) {
            slide.setAttribute('lightbox', lightboxGroupId);
            this.processBaseLightboxElement_(slide, lightboxGroupId);
          }
        });
      });
    } else {
      const lightboxGroupId = element.getAttribute('lightbox') || 'default';
      this.processBaseLightboxElement_(element, lightboxGroupId);
    }
  }

  processBaseLightboxElement_(element, lightboxGroupId) {
    if (!this.lightboxGroups_[lightboxGroupId]) {
      this.lightboxGroups_[lightboxGroupId] = [];
    }
    this.lightboxGroups_[lightboxGroupId]
        .push(dev().assertElement(element));
    if (this.meetsHeuristicsForTap_(element)) {
      const viewer = elementByTag(this.ampdoc_.getRootNode(), VIEWER_TAG);
      element.setAttribute('on', `tap:${viewer.id}.activate`);
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
   * The function is simplified for testing now.
   * Get the description for single lightboxed item.
   * @param {!Element} element
   * @return {?string}
   */
  getDescription(element) {
    const aria = element.getAttribute('aria-describedby');
    if (aria) {
      const descriptionElement = element.ownerDocument.getElementById(aria);
      if (descriptionElement) {
        return descriptionElement.textContent;
      }
    }
    const alt = element.getAttribute('alt');
    if (alt) {
      return alt;
    }
    return null;
  }

  /**
   * The function is not implemented yet. Fake for testing.
   * Find or create thumbnails for lightboxed elements.
   * Return a list of thumbnails obj for lightbox gallery view
   * @param {string} lightboxGroupId
   * @return {!Array<!LightboxThumbnailDataDef>}
   */
  getThumbnails(lightboxGroupId) {
    return this.lightboxGroups_[lightboxGroupId]
        .map((element, i) => ({
          url: this.getThumbnailUrl_(dev().assertElement(element), i),
          element,
        }));
  }

  /**
   * Get thumbnail url for single element.
   * @param {!Element} element
   * @param {number=} index fake it for testing only, will delete later
   * @return {string}
   * @private
   */
  getThumbnailUrl_(element, index) {
    if (element.hasAttribute('lightbox-thumbnail-src')) {
      return element.getAttribute('lightbox-thumbnail-src');
    } else if (element.tagName == 'AMP-IMG') {
      return element.getAttribute('src');
    } else {
      // TODO(#12713): implement default thumbnails
      return 'https://placehold.it/128x128?text=' + index;
    }
  }
}
