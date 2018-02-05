/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {addParamsToUrl} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {isLayoutSizeDefined} from '../../../src/layout';


class AmpIzlesene extends AMP.BaseElement {
  constructor(element) {
    super(element);
    /** @private {?string}  */
    this.videoid_ = null;
    /** @private {?Element} */
    this.iframe_ = null;
    /** @private {?string} */
    this.videoIframeSrc_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url(this.getVideoIframeSrc_());
    // Host that Izlesene uses to serve poster frames needed by player.
    this.preconnect.url('https://i1.imgiz.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.videoid_ = user().assert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-izlesene> %s',
        this.element);
  }

  /** @return {string} */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    dev().assert(this.videoid_);
    let src = 'https://www.izlesene.com/embedplayer/' + encodeURIComponent(this.videoid_ || '') + '/?';

    const params = getDataParamsFromAttributes(this.element);
    if ('autoplay' in params) {
      // Autoplay is managed by video manager, do not pass it.
      delete params['autoplay'];
    }

    src = addParamsToUrl(src, params);
    return this.videoIframeSrc_ = src;
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const src = this.getVideoIframeSrc_();

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage(dict({
        'command': 'pause',
      }), '*');
    }
  }
}


AMP.extension('amp-izlesene', '0.1', AMP => {
  AMP.registerElement('amp-izlesene', AmpIzlesene);
});
