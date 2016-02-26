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
 * <amp-soundcloud
 *   height=166
 *   data-trackid="243169232"
 *   data-color="ff5500"
 *   layout="fixed-height">
 * </amp-soundcloud>
 */

import {Layout} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';


class AmpSoundcloud extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://api.soundcloud.com/', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /**@override*/
  layoutCallback() {
    const height = this.element.getAttribute('height');
    const color = this.element.getAttribute('data-color');
    const visual = this.element.getAttribute('data-visual');
    const url = 'https://api.soundcloud.com/tracks/';
    const trackid = AMP.assert(
        (this.element.getAttribute('data-trackid')),
        'The data-trackid attribute is required for <amp-soundcloud> %s',
        this.element);

    const iframe = document.createElement('iframe');

    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = 'https://w.soundcloud.com/player/?' +
      'url=' + encodeURIComponent(url + trackid);

    if (visual === 'true') {
      iframe.src += '&visual=true';
    } else if (color) {
      iframe.src += '&color=' + encodeURIComponent(color);
    }

    this.applyFillContent(iframe);
    iframe.height = height;
    this.element.appendChild(iframe);

    /** @private {?Element} */
    this.iframe_ = iframe;

    return loadPromise(iframe);
  }

  /** @override */
  documentInactiveCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage(
        JSON.stringify({method: 'pause'}),
        'https://w.soundcloud.com');
    }

    return true;
  }
};

AMP.registerElement('amp-soundcloud', AmpSoundcloud);
