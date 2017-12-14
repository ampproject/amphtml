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
import {elementByTag} from '../../../../src/dom';

const ELIGIBLE_TAP_TAGS = {
  'amp-img': true,
  'amp-anim': true,
};

const VIEWER_TAG = 'amp-lightbox-viewer';

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
     * Ordered list of lightboxable elements
     * @private {?Array<!Element>}
     **/
    this.elements_ = null;

    /**
     * Cache for the `maybeInit()` call.
     * @private {?Promise}
     **/
    this.initPromise_ = null;

    /**
     * @private {!Object<string, Array<string>>}
     */
    this.lightboxGroups_ = {
      default: [],
    };
  }

  /**
   * Initializes the manager only once.
   * @return {!Promise}
   * @private
   */
  maybeInit_() {
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
   * @return {!boolean}
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

      const viewer = elementByTag(this.ampdoc_.getRootNode(), VIEWER_TAG).id;

      const matches = this.ampdoc_.getRootNode().querySelectorAll('[lightbox]');
      this.elements_ = [];
      for (let i = 0; i < matches.length; i++) {
        const element = matches[i];
        // TODO: allow lightbox groups
          if (element.tagName == 'AMP-CAROUSEL') {
            // TODO: special case carousel
          } else {
            const lightboxGroupId = element.getAttribute('lightbox');
            if (lightboxGroupId == '' || lightboxGroupId == 'default') {
              this.lightboxGroups_.default.push(element);
            } else {
              if (!this.lightboxGroups_.hasOwnProperty(lightboxGroupId)) {
                this.lightboxGroups_[lightboxGroupId] = [];
              }
              this.lightboxGroups_[lightboxGroupId].push(element);
            }
            if (this.meetsHeuristicsForTap_(element)) {
                element.setAttribute('on', 'tap:' + viewerId + '.activate');
            }
        }
      }
    });
  }

  /**
   * Return a list of lightboxable elements
   * @param {string} lightboxGroupId
   * @return {!Promise<!Array<!Element>>}
   */
  getElementsForLightboxGroup(lightboxGroupId) {
    return this.maybeInit_()
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
   * @return {!Array<{url: string, element: !Element}>}
   */
  getThumbnails() {
    const thumbnailList = [];
    for (let i = 0; i < this.elements_.length; i++) {
      const thumbnail = {
        url: this.getThumbnailUrl_(this.elements_[i], i),
        element: this.elements_[i],
      };
      thumbnailList.push(thumbnail);
    }
    return thumbnailList;
  }

  /**
   * The function is not implemented yet. Fake for testing.
   * Get thumbnail url for single element.
   * @param {!Element} element
   * @param {number=} index fake it for testing only, will delete later
   * @return {string}
   * @private
   */
  getThumbnailUrl_(element, index) {
    if (element.tagName == 'AMP-IMG') {
      return element.getAttribute('src');
    } else {
      return 'https://placehold.it/128x128?text=' + index;
    }
  }
}
