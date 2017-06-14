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
import {user} from '../../../src/log';

class AmpGfycat extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * @private {?Element}
     */
    this.iframe_ = null;
  }

 /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    // Gfycat iframe
    this.preconnect.url('https://gfycat.com', opt_onLayout);

    // Iframe video and poster urls
    this.preconnect.url('https://giant.gfycat.com', opt_onLayout);
    this.preconnect.url('https://thumbs.gfycat.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const gfyid = user().assert(
        this.element.getAttribute('data-gfyid'),
        'The data-gfyid attribute is required for <amp-gfycat> %s',
        this.element);
    const noautoplay = this.element.hasAttribute('noautoplay');

    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');

    let src = 'https://gfycat.com/ifr/' + encodeURIComponent(gfyid);
    if (noautoplay) {
      src += '?autoplay=0';
    }

    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage('pause', '*');
    }
  }
}

AMP.registerElement('amp-gfycat', AmpGfycat);
