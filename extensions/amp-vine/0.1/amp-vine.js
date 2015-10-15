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


/**
 * @fileoverview Embeds a Vine video
 */

import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';

class AmpVine extends AMP.BaseElement {
	/** @override */
  createdCallback() {
    // the Vine iframe
    this.preconnect.url('https://vine.co');
    // Vine assets loaded in the iframe
    this.preconnect.url('https://v.cdn.vine.co');
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    var vineId = AMP.assert(this.element.getAttribute('data-vineid'),
        'The data-vineid attribute is required for <amp-vine> %s',
        this.element);

    let width = this.element.getAttribute('width');
    let height = this.element.getAttribute('height');

    let iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.src = 'https://vine.co/v/' +
        encodeURIComponent(vineId) + '/embed/simple';
    this.applyFillContent(iframe);

    iframe.width = width;
    iframe.height = height;
    this.element.appendChild(iframe);

    return loadPromise(iframe);
  }

  /** @override */
  documentInactiveCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage('pause', '*');
    }
    // No need to do layout later - user action will be expect to resume
    // the playback.
    return false;
  }
}

AMP.registerElement('amp-vine', AmpVine);
