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

import {whenDocumentReady} from '../../../../src/document-ready';
import {isExperimentOn} from '../../../../src/experiments';
import {autoDiscoverLightboxables} from './lightbox-manager-discovery';
import {dev} from '../../../../src/log';
import {timerFor} from '../../../../src/services';


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

    // TODO(aghassemi): Find a better time to initialize, maybe after the first
    // layoutPass is done for all elements?
    // NOTE(aghassemi): Since all methods are async, initialize can run at
    // any time, if a method call comes in before this timer initializes, we
    // are still fine since manager will be initialized at that point and method
    // call will go through.
    timerFor(ampdoc.win).delay(() => {
      this.maybeInit_();
    }, 500);
  }

  /**
   * Returns the next lightboxable element after `curElement` or `null` if there
   * is no next element.
   * @param {!Element} curElement Current element.
   * @return {!Promise<?Element>} Next element or null
   */
  getNext(curElement) {
    return this.maybeInit_().then(() => {
      const curIndex = this.elements_.indexOf(curElement);
      dev().assert(curIndex != -1);
      if (curIndex == this.elements_.length - 1) {
        return null;
      }
      return this.elements_[curIndex + 1];
    });
  }

  /**
   * Returns the previous lightboxable element before `curElement` or `null` if
   * there is no previous element.
   * @param {!Element} curElement Current element.
   * @return {!Promise<?Element>} Previous element or null
   */
  getPrevious(curElement) {
    return this.maybeInit_().then(() => {
      const curIndex = this.elements_.indexOf(curElement);
      dev().assert(curIndex != -1);
      if (curIndex == 0) {
        return null;
      }
      return this.elements_[curIndex - 1];
    });
  }

  /**
   * Returns whether there is a next lightboxable element after `curElement`
   * @param {!Element} curElement Current element.
   * @return {!Promise<!boolean>}
   */
  hasNext(curElement) {
    return this.getNext(curElement).then(next => {
      return !!next;
    });
  }

  /**
   * Returns whether there is previous lightboxable element before `curElement`
   * @param {!Element} curElement Current element.
   * @return {!Promise<!boolean>}
   */
  hasPrevious(curElement) {
    return this.getPrevious(curElement).then(prev => {
      return !!prev;
    });
  }

  /**
   * Initializes the manager only once.
   * @return {!Promise}
   */
  maybeInit_() {
    if (this.initPromise_) {
      return this.initPromise_;
    }
    if (isExperimentOn(this.ampdoc_.win, 'amp-lightbox-viewer-auto')) {
      this.initPromise_ = autoDiscoverLightboxables(this.ampdoc_).then(() => {
        return this.scanLightboxables_();
      });
    } else {
      this.initPromise_ = this.scanLightboxables_();
    }

    return this.initPromise_;
  }

  /**
   * Scans the document for lightboxable elements and updates `this.elements_`
   * accordingly.
   * @private
   * @return {!Promise}
   */
  scanLightboxables_() {
    return whenDocumentReady(this.ampdoc_).then(() => {
      const matches = this.ampdoc_.getRootNode().querySelectorAll('[lightbox]');
      this.elements_ = [];
      for (let i = 0; i < matches.length; i++) {
        const element = matches[i];
        if (element.getAttribute('lightbox').toLowerCase() != 'none') {
          this.elements_.push(element);
        }
      }
    });
  }

  /**
   * Return a list of lightboxable elements
   * @return {!Promise<?Array<!Element>>}
   */
  getElements() {
    return this.maybeInit_().then(() => {
      if (!this.elements_) {
        this.scanLightboxables_().then(() => {
          return this.elements_;
        });
      } else {
        return this.elements_;
      }
    });
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
   * @return {!Array<{string,Element}>}
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
   * @param {Number=} index fake it for testing only, will delete later
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
