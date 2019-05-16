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
import {userAssert} from '../../../src/log';

class AmpVine extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {?Element} */
    this.iframe_ = null;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // the Vine iframe
    this.preconnect.url('https://vine.co', onLayout);
    // Vine assets loaded in the iframe
    this.preconnect.url('https://v.cdn.vine.co', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const vineid = userAssert(
      this.element.getAttribute('data-vineid'),
      'The data-vineid attribute is required for <amp-vine> %s',
      this.element
    );

    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.src =
      'https://vine.co/v/' + encodeURIComponent(vineid) + '/embed/simple';

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);

    this.iframe_ = iframe;

    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage('pause', '*');
    }
  }
}

AMP.extension('amp-vine', '0.1', AMP => {
  AMP.registerElement('amp-vine', AmpVine);
});
