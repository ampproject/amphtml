/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Layout} from '../../../src/layout';
import { dict } from "../../../src/utils/object"
import { addParamsToUrl } from "../../../src/url"
import { userAssert } from "../../../src/log"
import { removeElement } from "../../../src/dom"

export class AmpFlowplayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.id_ = null;

    /** @private {string} */
    this.pid_ = null;

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    this.id_ = userAssert(
      element.getAttribute('data-id'),
      'The data-id attribute is required for <amp-jwplayer> %s',
      element
    );

    this.pid_ = element.getAttribute('data-pid');
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');

    const queryParams = dict({
      'id': encodeURIComponent(this.id_) || undefined,
      'pid': encodeURIComponent(this.pid_) || undefined
    });

    const baseUrl = "https://ljsp.lwcdn.com/api/video/embed.jsp?";
    const src = addParamsToUrl(baseUrl, queryParams);

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);
    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      // The /players page can respond to "play" and "pause" commands from the
      // iframe's parent
      this.iframe_.contentWindow./*OK*/ postMessage(
        'pause',
        'https://content.jwplatform.com'
      );
    }
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

AMP.extension('amp-flowplayer', '0.1', AMP => {
  AMP.registerElement('amp-flowplayer', AmpFlowplayer);
});
