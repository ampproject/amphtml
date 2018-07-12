/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {user} from '../../../src/log';

class AmpMowplayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.mediaid_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }
  
  preconnectCallback(onLayout) {
    // Host that serves player configuration
    this.preconnect.url('https://code.mowplayer.com', onLayout);
    // CDN which hosts mowplayer assets
    this.preconnect.url('https://cdn.mowplayer.com', onLayout);
  }

  /** @override */
  buildCallback() {
    this.mediaid_ = user().assert(
        (this.element.getAttribute('data-media-id')),
        'the data-media-id attributes must exists for <amp-mowplayer> %s',
        this.element);
  }
  
  /** @override */
  layoutCallback() {
		const iframe = this.element.ownerDocument.createElement("iframe");
		const src = "https://cdn.mowplayer.com/player.html?code=" + encodeURIComponent(this.mediaid_);
		iframe.setAttribute("frameborder", "0");
		iframe.setAttribute("allowfullscreen", "true");
		iframe.src = src;
		this.applyFillContent(iframe);
		this.element.appendChild(iframe);
		this.iframe_ = iframe;
		return this.loadPromise(iframe);
	}

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
  
  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true; // Call layoutCallback again.
  }
}
AMP.extension('amp-mowplayer', '0.1', AMP => {
  AMP.registerElement('amp-mowplayer', AmpMowplayer);
});