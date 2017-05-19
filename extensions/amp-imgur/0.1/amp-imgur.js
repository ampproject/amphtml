/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

 /**
  * @fileoverview Embeds a imgur
  * Example:
  * <code>
  * <amp-imgur
  *   layout="reponsive"
  *   width="540"
  *   height="663"
  *   data-id="f462IUj">
  * </amp-imgur>
  * </code>
  */

import {user} from '../../../src/log';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';

export class AmpImgur extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string} */
    this.imgurId_ = '';
  }

  /** @override */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('http://imgur.com/', opt_onLayout);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  buildCallback() {
    this.imgurId_ = user().assert(
      this.element.getAttribute('data-imgurid'),
      'The data-imgurid attribute is required for <amp-imgur> %s',
      this.element);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.win.document.createElement('iframe');
    this.iframe_ = iframe;

    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');

    iframe.src = 'http://imgur.com/' +
      encodeURIComponent(this.imgurId_) + '/embed/'

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

}

AMP.registerElement('amp-imgur', AmpImgur);
