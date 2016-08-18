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

import {whenDocumentReady} from '../document-ready';
import {applyLayout} from '../service';
import {fromClassForDoc} from '../service';
import {dev} from '../log';
import {autoDiscoverLightboxables} from './lightbox-manager-discovery';
import {timerFor} from '../timer';

/**
 * LighboxManager is a document-scoped service responsible for:
 *  -Finding elements marked to be lightboxable (via lightbox attribute)
 *  -Keeping an ordered list of lightboxable elements
 *  -Providing functionality to get next/previous lightboxable element given
 *   the current element.
 */
class LighboxManager {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @const @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /**
     * Ordered list of lightboxable elements.
     * @private {!Array<!Element>}
     **/
    this.elements_ = null;

    /**
     * @private {Promise}
     **/
    this.initPromise_ = null;

    this.autoLightboxExperimentIsOn_ = true;

    // TODO(aghassemi): Find a better time to initialize, maybe after the first
    // layoutPass is done for all elements?
    // NOTE(aghassemi): Since all methods are async, initialize can run at
    // any time, if a method call comes in before this timer initializes, we
    // are still fine and manager will be initialized at that point and method
    // call will still go through.
    timerFor(ampdoc.win).delay(() => {
      this.maybeInit_();
    }, 500);
  }

  /**
   * Returns the next lightboxable element after `curElem` or `null`
   * if there is no next element.
   * @param {!Element} curElem Current element.
   * @return {!Promise<Element>} Next element or null
   */
  getNext(curElem) {
    return this.maybeInit_().then(() => {
      const curIndex = this.elements_.indexOf(curElem);
      dev().assert(curIndex != -1);
      if (curIndex == this.elements_.length - 1) {
        return null;
      }
      return this.elements_[curIndex + 1];
    });
  }

  /**
   * Returns the previous lightboxable element before `curElem` or `null`
   * if there is no previous element.
   * @param {!Element} curElem Current element.
   * @return {!Promise<Element>} Previous element or null
   */
  getPrevious(curElem) {
    return this.maybeInit_().then(() => {
      const curIndex = this.elements_.indexOf(curElem);
      dev().assert(curIndex != -1);
      if (curIndex == 0) {
        return null;
      }
      return this.elements_[curIndex - 1];
    });

  }

  /**
   * Returns whether there is a next lightboxable element after `curElem`
   * @param {!Element} curElem Current element.
   * @return {!Promise<boolean>}
   */
  hasNext(curElem) {
    return this.getNext(curElem).then(next => {
      return !!next;
    });
  }

  /**
   * Returns whether there is previous lightboxable element before `curElem`
   * @param {!Element} curElem Current element.
   * @return {!Promise<boolean>}
   */
  hasPrevious(curElem) {
    return this.getPrevious(curElem).then(prev => {
      return !!prev;
    });
  }

  maybeInit_() {
    if (this.initPromise_) {
      return this.initPromise_;
    }
    if (this.autoLightboxExperimentIsOn_) {
      this.initPromise_ = autoDiscoverLightboxables(this.ampdoc_).then(() => {
        return this.scanLightboxables_();
      });
    } else {
      this.initPromise_ = this.scanLightboxables_();
    }

    return this.initPromise_;
  }

  /**
   * Scans the document for lightboxable elements and updates `this.element_`
   * accordingly.
   * @param {boolean} skipCache Whether cache should be skipped to perform a
   * full new scan.
   * @private
   * @return {!Promise}
   */
  scanLightboxables_(skipCache) {
    this.scanPromiseCache_ = whenDocumentReady(this.ampdoc_).then(() => {
      const matches = this.ampdoc_.getRootNode().querySelectorAll('[lightbox]');
      this.elements_ = [];
      for (let i = 0; i < matches.length; i++) {
        const elem = matches[i];
        if (elem.getAttribute('lightbox').toLowerCase() != 'none') {
          this.elements_.push(elem);
        }
      }
    });

    return this.scanPromiseCache_;
  }
}

export function installLightboxManagerForDoc(ampdoc) {
  return fromClassForDoc(ampdoc, 'lightboxManager', LighboxManager);
};
