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

/**
 * @fileoverview Embeds the Google Docs viewer
 *
 * Example:
 * <code>
 * <amp-drive-viewer
 *   layout="fixed-height"
 *   src="https://www.example.com/my-document.pdf"
 *   height="1613">
 * </amp-drive-viewer>
 * </code>
 */

import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

const ATTRIBUTES_TO_PROPAGATE = [
  'alt',
  'title',
];

export class AmpDriveViewer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;
  }

  /** @override */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://docs.google.com', opt_onLayout);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    user().assert(this.element.getAttribute('src'),
        'The src attribute is required for <amp-drive-viewer> %s',
        this.element);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    iframe.setAttribute('allow-scripts', '');
    iframe.setAttribute('allow-same-origin', '');
    iframe.setAttribute('frameborder', '0');
    this.propagateAttributes(ATTRIBUTES_TO_PROPAGATE, iframe);

    const src = encodeURIComponent(this.element.getAttribute('src'));
    iframe.src = `https://docs.google.com/gview?url=${src}&embedded=true`;

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
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
}


AMP.extension('amp-drive-viewer', '0.1', AMP => {
  AMP.registerElement('amp-drive-viewer', AmpDriveViewer);
});
