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

/**
 * @fileoverview Embeds a Soundcloud clip
 *
 * Example:
 * <code>
 * <amp-sona
 *   height=166
 *   data-trackid="243169232"
 *   data-color="ff5500"
 *   layout="fixed-height">
 * </amp-sona>
 */

import {isLayoutSizeDefined} from '../../../src/layout';

class AmpSona extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    // Get attributes, assertions of values, assign instance variables.
    // Build lightweight DOM and append to this.element.
  }

  /**@override*/
  layoutCallback() {
    // Actually load your resource or render more expensive resources.
    const height = this.element.getAttribute('height');
    const width = this.element.getAttribute('width');
    const clientId = this.element.getAttribute('data-client-id');
    const resource = this.element.getAttribute('data-resource');
    const variant = this.element.getAttribute('data-variant');
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('width', width);
    iframe.setAttribute('height', height);
    iframe.src = `https://amp.sonaserve.com/${clientId}/${resource}/${variant}`;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);

    return this.loadPromise(iframe);
  }
}

AMP.extension('amp-sona', '0.1', (AMP) => {
  AMP.registerElement('amp-sona', AmpSona);
});
