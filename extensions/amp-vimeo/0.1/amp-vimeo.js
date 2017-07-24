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
import {user} from '../../../src/log';
import {dict} from '../../../src/utils/object';

class AmpVimeo extends AMP.BaseElement {

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
    this.preconnect.url('https://player.vimeo.com', onLayout);
    // Host that Vimeo uses to serve poster frames needed by player.
    this.preconnect.url('https://i.vimeocdn.com', onLayout);
    // Host that Vimeo uses to serve JS, CSS and other assets needed.
    this.preconnect.url('https://f.vimeocdn.com', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const videoid = user().assert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-vimeo> %s',
        this.element);
    // See
    // https://developer.vimeo.com/player/embedding
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = 'https://player.vimeo.com/video/' + encodeURIComponent(
        videoid);
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      // See
      // https://developer.vimeo.com/player/js-api
      this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify(dict({
        'method': 'pause',
        'value': '',
      })), '*');
    }
  }
};

AMP.registerElement('amp-vimeo', AmpVimeo);
