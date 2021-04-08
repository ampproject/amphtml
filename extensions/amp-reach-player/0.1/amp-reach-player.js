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

import {Services} from '../../../src/services';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setIsMediaComponent} from '../../../src/video-interface';

class AmpReachPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://player-cdn.beachfrontmedia.com',
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    setIsMediaComponent(this.element);
  }

  /** @override */
  layoutCallback() {
    const embedId = this.element.getAttribute('data-embed-id') || 'default';
    const iframe = this.element.ownerDocument.createElement('iframe');

    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src =
      'https://player-cdn.beachfrontmedia.com/playerapi/v1/frame/player/?embed_id=' +
      encodeURIComponent(embedId);
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    const iframe = this.iframe_;
    if (iframe) {
      this.element.removeChild(iframe);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(
        'pause',
        'https://player-cdn.beachfrontmedia.com'
      );
    }
  }
}

AMP.extension('amp-reach-player', '0.1', (AMP) => {
  AMP.registerElement('amp-reach-player', AmpReachPlayer);
});
