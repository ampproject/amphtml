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


class AmpYoutube extends AMP.BaseElement {

  /** @override */
  createdCallback() {
    this.preconnect.url('https://www.youtube.com');
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    // The video-id is supported only for backward compatibility.
    const videoid = AMP.assert(
        (this.element.getAttribute('data-videoid') ||
        this.element.getAttribute('video-id')),
        'The data-videoid attribute is required for <amp-youtube> %s',
        this.element);
    // See
    // https://developers.google.com/youtube/iframe_api_reference
    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(
        videoid) + '?enablejsapi=1';
    this.applyFillContent(iframe);
    iframe.width = width;
    iframe.height = height;
    this.element.appendChild(iframe);
    /** @private {?Element} */
    this.iframe_ = iframe;
    return loadPromise(iframe);
  }

  /** @override */
  documentInactiveCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify({
        'event': 'command',
        'func': 'pauseVideo',
        'args': ''
      }), '*');
    }
    // No need to do layout later - user action will be expect to resume
    // the playback.
    return false;
  }
};

AMP.registerElement('amp-youtube', AmpYoutube);
