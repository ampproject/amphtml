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
import {isLayoutSizeDefined} from '../src/layout';
import {registerElement} from '../src/custom-element';
import {srcsetFromElement} from '../src/srcset';
import {user} from '../src/log';

/**
 * Attributes to propagate to internal image when changed externally.
 * @type {!Array<string>}
 */
const ATTRIBUTES_TO_PROPAGATE = ['alt', 'title', 'referrerpolicy', 'aria-label',
  'aria-describedby', 'aria-labelledby'];

export class AmpImg extends BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.allowImgLoadFallback_ = true;

    /** @private {boolean} */
    this.isPrerenderAllowed_ = true;

    /** @private {?Element} */
    this.img_ = null;

    /** @private {?../src/srcset.Srcset} */
    this.srcset_ = null;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (mutations['src'] !== undefined || mutations['srcset'] !== undefined) {
      this.srcset_ = srcsetFromElement(this.element);
      // This element may not have been laid out yet.
      if (this.img_) {
        this.updateImageSrc_();
      }
    }

    if (this.img_) {
      const attrs = ATTRIBUTES_TO_PROPAGATE.filter(
          value => mutations[value] !== undefined);
      this.propagateAttributes(
          attrs, this.img_, /* opt_removeMissingAttrs */ true);
    }
  }

  /** @override */
  preconnectCallback(onLayout) {
    // NOTE(@wassgha): since parseSrcset is computationally expensive and can
    // not be inside the `buildCallback`, we went with preconnecting to the
    // `src` url if it exists.
    const src = this.element.getAttribute('src');
    if (src) {
      this.preconnect.url(src, onLayout);
    }
  }

  /** @override */
  buildCallback() {
    this.isPrerenderAllowed_ = !this.element.hasAttribute('noprerender');
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
    if (!this.srcset_) {
      this.srcset_ = srcsetFromElement(this.element);
    }
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

    // Remove role=img otherwise this breaks screen-readers focus and
    // only read "Graphic" when using only 'alt'.
    if (this.element.getAttribute('role') == 'img') {
      this.element.removeAttribute('role');
      user().error('AMP-IMG', 'Setting role=img on amp-img elements breaks ' +
        'screen readers please just set alt or ARIA attributes, they will ' +
        'be correctly propagated for the underlying <img> element.');
    }

    this.propagateAttributes(ATTRIBUTES_TO_PROPAGATE, this.img_);
    this.applyFillContent(this.img_, true);

    this.element.appendChild(this.img_);
  }

  /** @override */
  prerenderAllowed() {
    return this.isPrerenderAllowed_;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  reconstructWhenReparented() {
    return false;
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

    return this.loadPromise(this.img_).then(() => {
      // Clean up the fallback if the src has changed.
      if (!this.allowImgLoadFallback_ &&
          this.img_.classList.contains('i-amphtml-ghost')) {
        this.getVsync().mutate(() => {
          this.img_.classList.remove('i-amphtml-ghost');
          this.toggleFallback(false);
        });
      }
    });
  }

  onImgLoadingError_() {
    this.getVsync().mutate(() => {
      this.img_.classList.add('i-amphtml-ghost');
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
