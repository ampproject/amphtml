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

import {isLayoutSizeDefined} from '../../../src/layout';
import {srcsetFromElement} from '../../../src/srcset';
import {user} from '../../../src/log';
import * as st from '../../../src/style';

export class AmpAnim extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!Element} */
    this.img_ = new Image();

    /** @private {?../../../src/srcset.Srcset} */
    this.srcset_ = null;

    /** @private {?Promise} */
    this.loadPromise_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.propagateAttributes(['alt', 'aria-label',
      'aria-describedby', 'aria-labelledby'], this.img_);
    this.applyFillContent(this.img_, true);

    // Remove role=img otherwise this breaks screen-readers focus and
    // only read "Graphic" when using only 'alt'.
    if (this.element.getAttribute('role') == 'img') {
      this.element.removeAttribute('role');
      user().error('AMP-ANIM', 'Setting role=img on amp-anim elements ' +
          'breaks screen readers. Please just set alt or ARIA attributes, ' +
          'they will be correctly propagated for the underlying <img> ' +
          'element.');
    }

    // The image is initially hidden if a placeholder is available.
    st.toggle(this.img_, !this.getPlaceholder());

    this.element.appendChild(this.img_);

    this.srcset_ = srcsetFromElement(this.element);
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
    this.loadPromise_ = this.loadPromise(this.img_)
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
