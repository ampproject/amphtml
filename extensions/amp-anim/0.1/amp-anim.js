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

import * as st from '../../../src/style';
import {dev} from '../../../src/log';
import {guaranteeSrcForSrcsetUnsupportedBrowsers} from '../../../src/utils/img';
import {installObjectCropStyles} from '../../../src/style';
import {isLayoutSizeDefined} from '../../../src/layout';

const TAG = 'amp-anim';
const BUILD_ATTRIBUTES = ['alt', 'aria-label', 'aria-describedby',
  'aria-labelledby'];
const LAYOUT_ATTRIBUTES = ['src', 'srcset'];
/** @visibleForTesting */
export const SRC_PLACEHOLDER = 'data:image/gif;base64,' +
'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export class AmpAnim extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.img_ = null;

    /** @private {boolean} */
    this.hasLoaded_ = false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.img_ = new Image();
    this.img_.setAttribute('decoding', 'async');
    this.propagateAttributes(BUILD_ATTRIBUTES, this.img_);
    this.applyFillContent(this.img_, true);
    installObjectCropStyles(this.element, this.img_);

    // Remove role=img otherwise this breaks screen-readers focus and
    // only read "Graphic" when using only 'alt'.
    if (this.element.getAttribute('role') == 'img') {
      this.element.removeAttribute('role');
      this.user().error(
          'AMP-ANIM', 'Setting role=img on amp-anim elements ' +
          'breaks screen readers. Please just set alt or ARIA attributes, ' +
          'they will be correctly propagated for the underlying <img> ' +
          'element.');
    }

    // The image is initially hidden if a placeholder is available.
    st.toggle(dev().assertElement(this.img_),
        !this.getPlaceholder());

    this.element.appendChild(this.img_);
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    const img = dev().assertElement(this.img_);
    this.propagateAttributes(LAYOUT_ATTRIBUTES, img);
    guaranteeSrcForSrcsetUnsupportedBrowsers(img);
    return this.loadPromise(img);
  }

  /** @override */
  firstLayoutCompleted() {
    // Keep the placeholder: amp-anim is using it to start/stop playing.
    this.hasLoaded_ = true;
    this.updateInViewport_();
  }

  /** @override */
  viewportCallback(unusedInViewport) {
    if (!this.hasLoaded_) {
      // do nothing if element has not laid out.
      return;
    }
    this.updateInViewport_();
  }

  /** @override */
  unlayoutCallback() {
    // Release memory held by the image - animations are typically large.
    this.img_.src = SRC_PLACEHOLDER;
    this.img_.srcset = SRC_PLACEHOLDER;
    this.hasLoaded_ = false;
    return true;
  }

  /** @private */
  updateInViewport_() {
    const inViewport = this.isInViewport();
    this.togglePlaceholder(!inViewport);
    st.toggle(dev().assertElement(this.img_), inViewport);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAnim);
});
