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
import {srcsetFromElement} from '../../../src/srcset';
import * as st from '../../../src/style';

class AmpAnim extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    /** @private @const {!Element} */
    this.img_ = new Image();
    this.propagateAttributes(['alt'], this.img_);
    this.applyFillContent(this.img_, true);
    this.img_.width = getLengthNumeral(this.element.getAttribute('width'));
    this.img_.height = getLengthNumeral(this.element.getAttribute('height'));

    // The image is initially hidden if a placeholder is available.
    st.toggle(this.img_, !this.getPlaceholder());

    this.element.appendChild(this.img_);

    /** @private @const {!Srcset} */
    this.srcset_ = srcsetFromElement(this.element);

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
  firstLayoutCompleted() {
    // Keep the placeholder: amp-anim is using it to start/stop playing.
  }

  /** @override */
  viewportCallback(inViewport) {
    if (!inViewport || !this.loadPromise_) {
      this.updateInViewport_();
    } else {
      this.loadPromise_.then(() => this.updateInViewport_());
    }
  }

  /** @override */
  unlayoutCallback() {
    // Release memory held by the image - animations are typically large.
    this.img_.src = '';
    return true;
  }

  /** @private */
  updateInViewport_() {
    const inViewport = this.isInViewport();
    this.togglePlaceholder(!inViewport);
    st.toggle(this.img_, inViewport);
  }

  /**
   * @return {!Promise}
   * @private
   */
  updateImageSrc_() {
    if (this.getLayoutWidth() <= 0) {
      return Promise.resolve();
    }
    const src = this.srcset_.select(this.getLayoutWidth(),
        this.getDpr()).url;
    if (src == this.img_.getAttribute('src')) {
      return Promise.resolve();
    }
    this.img_.setAttribute('src', src);
    this.loadPromise_ = loadPromise(this.img_)
        .catch(error => {
          if (!this.img_.getAttribute('src')) {
            return;
          }
          throw error;
        });
    return this.loadPromise_;
  }
};

AMP.registerElement('amp-anim', AmpAnim);
