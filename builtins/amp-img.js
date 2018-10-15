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
import {dev} from '../src/log';
import {guaranteeSrcForSrcsetUnsupportedBrowsers} from '../src/utils/img';
import {isExperimentOn} from '../src/experiments';
import {isLayoutSizeDefined} from '../src/layout';
import {listen} from '../src/event-helper';
import {registerElement} from '../src/service/custom-element-registry';
import {setImportantStyles} from '../src/style';

/**
 * Attributes to propagate to internal image when changed externally.
 * @type {!Array<string>}
 */
const ATTRIBUTES_TO_PROPAGATE = ['alt', 'title', 'referrerpolicy', 'aria-label',
  'aria-describedby', 'aria-labelledby','srcset', 'src', 'sizes'];

export class AmpImg extends BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.allowImgLoadFallback_ = true;

    /** @private {boolean} */
    this.prerenderAllowed_ = true;

    /** @private {?Element} */
    this.img_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenLoad_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenError_ = null;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (this.img_) {
      const attrs = ATTRIBUTES_TO_PROPAGATE.filter(
          value => mutations[value] !== undefined);
      this.propagateAttributes(
          attrs, this.img_, /* opt_removeMissingAttrs */ true);
      guaranteeSrcForSrcsetUnsupportedBrowsers(this.img_);
    }
  }

  /** @override */
  preconnectCallback(onLayout) {
    // NOTE(@wassgha): since parseSrcset is computationally expensive and can
    // not be inside the `buildCallback`, we went with preconnecting to the
    // `src` url if it exists or the first srcset url.
    const src = this.element.getAttribute('src');
    if (src) {
      this.preconnect.url(src, onLayout);
    } else {
      const srcset = this.element.getAttribute('srcset');
      if (!srcset) {
        return;
      }
      // We try to find the first url in the srcset
      const srcseturl = /\S+/.exec(srcset);
      // Connect to the first url if it exists
      if (srcseturl) {
        this.preconnect.url(srcseturl[0], onLayout);
      }
    }
  }

  /** @override */
  firstAttachedCallback() {
    if (this.element.hasAttribute('noprerender')) {
      this.prerenderAllowed_ = false;
    }
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
    // If this amp-img IS the fallback then don't allow it to have its own
    // fallback to stop from nested fallback abuse.
    this.allowImgLoadFallback_ = !this.element.hasAttribute('fallback');

    // For inabox SSR, image will have been written directly to DOM so no need
    // to recreate.  Calling appendChild again will have no effect.
    if (this.element.hasAttribute('i-amphtml-ssr')) {
      this.img_ = this.element.querySelector('img');
    }
    this.img_ = this.img_ || new Image();
    this.img_.setAttribute('decoding', 'async');
    if (this.element.id) {
      this.img_.setAttribute('amp-img-id', this.element.id);
    }

    // Remove role=img otherwise this breaks screen-readers focus and
    // only read "Graphic" when using only 'alt'.
    if (this.element.getAttribute('role') == 'img') {
      this.element.removeAttribute('role');
      this.user().error(
          'AMP-IMG', 'Setting role=img on amp-img elements breaks ' +
        'screen readers please just set alt or ARIA attributes, they will ' +
        'be correctly propagated for the underlying <img> element.');
    }

    this.propagateAttributes(ATTRIBUTES_TO_PROPAGATE, this.img_);
    guaranteeSrcForSrcsetUnsupportedBrowsers(this.img_);
    this.applyFillContent(this.img_, true);
    this.element.appendChild(this.img_);
  }

  /** @override */
  prerenderAllowed() {
    return this.prerenderAllowed_;
  }

  /** @override */
  reconstructWhenReparented() {
    return false;
  }

  /** @override */
  layoutCallback() {
    this.initialize_();
    const img = dev().assertElement(this.img_);
    this.unlistenLoad_ = listen(img, 'load', () => this.hideFallbackImg_());
    this.unlistenError_ = listen(img, 'error', () => this.onImgLoadingError_());
    if (this.getLayoutWidth() <= 0) {
      return Promise.resolve();
    }
    return this.loadPromise(img);
  }

  /** @override */
  unlayoutCallback() {
    if (this.unlistenError_) {
      this.unlistenError_();
      this.unlistenError_ = null;
    }
    if (this.unlistenLoad_) {
      this.unlistenLoad_();
      this.unlistenLoad_ = null;
    }
    return true;
  }

  /** @override **/
  firstLayoutCompleted() {
    const placeholder = this.getPlaceholder();
    if (placeholder &&
      placeholder.classList.contains('i-amphtml-blurry-placeholder') &&
      isExperimentOn(this.win, 'blurry-placeholder')) {
      setImportantStyles(placeholder, {'opacity': 0});
    } else {
      this.togglePlaceholder(false);
    }
  }

  /**
   * @private
   */
  hideFallbackImg_() {
    if (!this.allowImgLoadFallback_
      && this.img_.classList.contains('i-amphtml-ghost')) {
      this.getVsync().mutate(() => {
        this.img_.classList.remove('i-amphtml-ghost');
        this.toggleFallback(false);
      });
    }
  }

  /**
   * If the image fails to load, show a fallback or placeholder instead.
   * @private
   */
  onImgLoadingError_() {
    if (this.allowImgLoadFallback_) {
      this.getVsync().mutate(() => {
        this.img_.classList.add('i-amphtml-ghost');
        this.toggleFallback(true);
        // Hide placeholders, as browsers that don't support webp
        // Would show the placeholder underneath a transparent fallback
        this.togglePlaceholder(false);
      });
      this.allowImgLoadFallback_ = false;
    }
  }
}

/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 */
export function installImg(win) {
  registerElement(win, 'amp-img', AmpImg);
}
