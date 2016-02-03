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
import {loadPromise} from '../../../src/event-helper';
import {listen} from '../../../src/iframe-helper';
import {locations} from './locations';
const SRC_DOMAIN = 'api.viafoura.com';
const FRAME_SRC = `https://${SRC_DOMAIN}/amp.php`;

// TODO: extend AMP.iframe somehow?
class AmpViafoura extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    // The Viafoura api
    this.preconnect.url('https://api.viafoura.com', onLayout);
    // Viafoura assets loaded in the iframe
    this.preconnect.url('https://cdn.viafoura.net', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  getDataAttrs() {
    return Array.prototype.slice.call(this.element.attributes)
      .filter(attr => attr.nodeName.match('data-.*'))
      .map(name => [name.nodeName, this.element.getAttribute(name.nodeName)]);
  }

  getPageAttrs() {
    var attributes = locations();
    attributes.push(['url', location.href]);
    return attributes;
  }

  getParams() {
    return this.getDataAttrs()
      .concat(this.getPageAttrs())
      .map(pair => `${pair[0]}=${encodeURIComponent(pair[1])}`)
      .reduce((prev, cur) => prev ? `${prev}&${cur}` : cur);
  }

  /** @override */
  layoutCallback() {

    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');

    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.src = `${FRAME_SRC}?${this.getParams()}`;

    this.applyFillContent(iframe);

    iframe.width = width;
    iframe.height = height;

    this.isResizable_ = this.element.hasAttribute('resizable');
    if (this.isResizable_) {
      iframe.setAttribute('scrolling', 'no');
    }

    this.element.appendChild(iframe);

    /** @private {?Element} */
    this.iframe_ = iframe;

    var currentHeight = 0;
    listen(iframe, 'embed-size', data => {
      if (currentHeight !== data.height) {
        currentHeight = data.height;
        iframe.width = currentHeight;
        this.element.style.height = currentHeight + 'px';
      }
    });

    return loadPromise(iframe);
  }

  /** @override */
  documentInactiveCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow. /*OK*/ postMessage('pause', '*');
    }

    // No need to do layout later - user action will be expect to resume
    // the playback
    return false;
  }
}

AMP.registerElement('amp-viafoura', AmpViafoura);
