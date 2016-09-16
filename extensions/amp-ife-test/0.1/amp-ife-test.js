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

import {ampdocFor} from '../../../src/ampdoc';
import {installFriendlyIframeEmbed} from '../../../src/friendly-iframe-embed';
import {isLayoutSizeDefined} from '../../../src/layout';

/** @const */
const TAG = 'amp-ife-test';

// DO NOT SUBMIT: This class is to simply demonstrate how a friendly iframe
// is created.
class AmpIfeTest extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const template = this.element.querySelector('template') ||
        this.element.querySelector('script')
    /** @const @private {string} */
    this.htmlContent_ = template./*OK*/innerHTML;

    /** @const @private {!Element} */
    this.container_ = this.element.ownerDocument.createElement('div');
    this.applyFillContent(this.container_);
    this.element.appendChild(this.container_);

    /** @private  {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;
    this.applyFillContent(iframe);

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allowtransparency', '');
    iframe.setAttribute('scrolling', 'no');

    const embedPromise = installFriendlyIframeEmbed(iframe, this.container_, {
      url: 'https://acme.org/embed&1',
      html: this.htmlContent_,
      extensionIds: ['amp-image-lightbox'],
      fonts: ['https://fonts.googleapis.com/css?family=Roboto'],
    });
    return embedPromise.then(embed => {
      this.embed_ = embed;

      // Run some tests.
      const ampdocService = ampdocFor(this.win);
      const ampdoc = ampdocService.getAmpDoc(this.element);

      const img = iframe.contentWindow.document.querySelector('amp-img');
      const ampdoc2 = ampdocService.getAmpDoc(img);
      console./*OK*/error('AMPDOC2: ', ampdoc2, ampdoc2 == ampdoc);

      const layoutRect = this.getViewport().getLayoutRect(img);
      console./*OK*/error('layoutRect: ', layoutRect.top, layoutRect);

      setTimeout(() => {
        console./*OK*/error('REMOVE IFRAME');
        this.container_.removeChild(iframe);
        this.embed_.destroy();
      }, 5000);
    });
  }
}

AMP.registerElement(TAG, AmpIfeTest);
