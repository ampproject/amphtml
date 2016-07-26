/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {BaseElement} from '../src/base-element';
import {getLengthNumeral, isLayoutSizeDefined} from '../src/layout';
import {loadPromise} from '../src/event-helper';
import {registerElement} from '../src/custom-element';
import {srcsetFromElement} from '../src/srcset';


export class AmpImg extends BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private @const {function(!Element, number=): !Promise<!Element>} */
    this.loadPromise_ = loadPromise;

    /** @private {boolean} */
    this.allowImgLoadFallback_ = true;

    /** @private {?Element} */
    this.img_ = null;

    /** @private {?../src/srcset.Srcset} */
    this.srcset_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Create the actual image element and set up instance variables.
   * Called lazily in the first `#layoutCallback`.
   */
  initialize_() {
    if (this.img_) {
      return;
    }
    /** @private {boolean} */
    this.allowImgLoadFallback_ = true;
    // If this amp-img IS the fallback then don't allow it to have its own
    // fallback to stop from nested fallback abuse.
    if (this.element.hasAttribute('fallback')) {
      this.allowImgLoadFallback_ = false;
    }

    this.img_ = new Image();
    if (this.element.id) {
      this.img_.setAttribute('amp-img-id', this.element.id);
    }
    this.propagateAttributes(['alt', 'referrerpolicy'], this.img_);
    this.applyFillContent(this.img_, true);

    this.img_.width = getLengthNumeral(this.element.getAttribute('width'));
    this.img_.height = getLengthNumeral(this.element.getAttribute('height'));

    this.element.appendChild(this.img_);

    this.srcset_ = srcsetFromElement(this.element);
  }

  /** @override */
  prerenderAllowed() {
    return true;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    this.initialize_();
    let promise = this.updateImageSrc_();

    // We only allow to fallback on error on the initial layoutCallback
    // or else this would be pretty expensive.
    if (this.allowImgLoadFallback_) {
      promise = promise.catch(e => {
        this.onImgLoadingError_();
        throw e;
      });
      this.allowImgLoadFallback_ = false;
    }
    return promise;
  }

  /**
   * @return {!Promise}
   * @private
   */
  updateImageSrc_() {
    if (this.getLayoutWidth() <= 0) {
      return Promise.resolve();
    }
    const src = this.srcset_.select(this.getLayoutWidth(), this.getDpr()).url;
    if (src == this.img_.getAttribute('src')) {
      return Promise.resolve();
    }

    this.img_.setAttribute('src', src);

    return this.loadPromise_(this.img_).then(() => {
      // Clean up the fallback if the src has changed.
      if (!this.allowImgLoadFallback_ &&
          this.img_.classList.contains('-amp-ghost')) {
        this.getVsync().mutate(() => {
          this.img_.classList.remove('-amp-ghost');
          this.toggleFallback(false);
        });
      }
    });
  }

  onImgLoadingError_() {
    this.getVsync().mutate(() => {
      this.img_.classList.add('-amp-ghost');
      this.toggleFallback(true);
    });
  }
};

/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installImg(win) {
  registerElement(win, 'amp-img', AmpImg);
}
