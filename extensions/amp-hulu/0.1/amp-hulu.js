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

import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {dev, user} from '../../../src/log';

class AmpHulu extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?string} */
    this.eid_ = null;
  }

  /** @override */
  preconnectCallback() {
    this.preconnect.preload(this.getVideoIframeSrc_());
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = document.createElement('iframe');
    const src = this.getVideoIframeSrc_();
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutOnPause() {
    return true;
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
  buildCallback() {
    this.eid_ = user().assert(
        this.element.getAttribute('data-eid'),
        'The data-eid attribute is required for <amp-hulu> %s',
        this.element);
  }

  /** @return {string} */
  getVideoIframeSrc_() {
    dev().assert(this.eid_);
    return `https://secure.hulu.com/dash/mobile_embed.html?eid=${encodeURIComponent(this.eid_ || '')}`;
  }

};

AMP.registerElement('amp-hulu', AmpHulu);
