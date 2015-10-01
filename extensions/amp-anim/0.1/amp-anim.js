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

import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {parseSrcset} from '../../../src/srcset';
import * as st from '../../../src/style';

class AmpAnim extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  isReadyToBuild() {
    return this.element.firstChild != null;
  }

  /** @override */
  buildCallback() {
    /** @private @const {?Element} */
    this.placeholder_ = this.getPlaceholder();

    /** @private @const {!Element} */
    this.img_ = new Image();
    this.propagateAttributes(['alt'], this.img_);
    this.applyFillContent(this.img_);
    this.img_.width = getLengthNumeral(this.element.getAttribute('width'));
    this.img_.height = getLengthNumeral(this.element.getAttribute('height'));

    // The image shown/hidden depends on placeholder.
    st.toggle(this.img_, !this.placeholder_);

    this.element.appendChild(this.img_);

    /** @private @const {!Srcset} */
    this.srcset_ = parseSrcset(this.element.getAttribute('srcset') ||
        this.element.getAttribute('src'));

    /** @private {?Promise} */
    this.loadPromise_ = null;
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    return this.updateImageSrc_();
  }

  /** @override */
  viewportCallback(inViewport) {
    if (this.placeholder_) {
      if (!inViewport || !this.loadPromise_) {
        this.updateInViewport_(inViewport);
      } else {
        this.loadPromise_.then(() => this.updateInViewport_(inViewport));
      }
    }
  }

  /** @private */
  updateInViewport_() {
    let inViewport = this.isInViewport();
    this.placeholder_.classList.toggle('-amp-hidden', inViewport);
    st.toggle(this.img_, inViewport);
  }

  /**
   * @return {!Promise}
   * @private
   */
  updateImageSrc_() {
    let src = this.srcset_.select(this.element.offsetWidth,
        this.getDpr()).url;
    if (src == this.img_.getAttribute('src')) {
      return Promise.resolve();
    }
    this.img_.setAttribute('src', src);
    this.loadPromise_ = loadPromise(this.img_);
    return this.loadPromise_;
  }
};

AMP.registerElement('amp-anim', AmpAnim);
