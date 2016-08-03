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
import {loadPromise} from '../../../src/event-helper';
import {user} from '../../../src/log';

class AmpO2Player extends AMP.BaseElement {

  /** @override */
  preconnectCallback() {
    this.preconnect.url(this.domain_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const pid = this.element.getAttribute('data-pid');
    const bcid = this.element.getAttribute('data-bcid');
    const bid = this.element.getAttribute('data-bid');
    const vid = this.element.getAttribute('data-vid');
    const macros = this.element.getAttribute('data-macros');
    const env = this.element.getAttribute('data-env');
    user().assert(
        (pid && bcid) || vid,
        'Either data-pid and data-bcid or data-vid attribute is required ' +
        'for <amp-o2-player> %s',
        this.element);
    /** @private {string} */
    this.domain_ = 'https://delivery.' +
      (env != 'stage' ? '' : 'dev.') + 'vidible.tv';
    let src = `${this.domain_}/htmlembed/`;
    const queryParams = [];
    if (pid && bcid) {
      src += 'pid=' + encodeURIComponent(pid) + '/'
        + encodeURIComponent(bcid) + '.html';
      if (bid) {
        queryParams.push('bid=' + encodeURIComponent(bid));
      }
      if (vid) {
        queryParams.push('vid=' + encodeURIComponent(vid));
      }
    } else if (vid) {
      src += encodeURIComponent(vid) + '.html';
    }
    if (macros) {
      queryParams.push(macros);
    }
    if (queryParams.length > 0) {
      src += '?' + queryParams.join('&');
    }
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    iframe.width = width;
    iframe.height = height;
    this.element.appendChild(iframe);
    /** @private {?Element} */
    this.iframe_ = iframe;
    return loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify({
        'method': 'pause',
        'value': this.domain_,
      }), '*');
    }
  }
}

AMP.registerElement('amp-o2-player', AmpO2Player);
