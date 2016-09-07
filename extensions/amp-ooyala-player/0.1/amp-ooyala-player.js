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

class AmpOoyalaPlayer extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://player.ooyala.com', onLayout);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    const embedCode = user().assert(
        encodeURIComponent(this.element.getAttribute('data-embedcode')),
        'The data-embedcode attribute is required for <amp-ooyala-player> %s',
        this.element);
    const pCode = user().assert(
        this.element.getAttribute('data-pcode'),
        'The data-pcode attribute is required for <amp-ooyala-player> %s',
        this.element);
    const playerId = user().assert(
        this.element.getAttribute('data-playerid'),
        'The data-playerid attribute is required for <amp-ooyala-player> %s',
        this.element);

    let src = 'https://player.ooyala.com/iframe.html?platform=html5-priority';
    const playerVersion = this.element.getAttribute('data-playerversion') || '';
    if (playerVersion.toLowerCase() == 'v4') {
      src = 'https://player.ooyala.com/static/v4/stable/latest/skin-plugin/amp_iframe.html?pcode='
        + encodeURIComponent(pCode);
      const configUrl = this.element.getAttribute('data-config');
      if (configUrl) {
        src += '&options[skin.config]=' + encodeURIComponent(configUrl);
      }
    }

    src += '&ec=' + encodeURIComponent(embedCode) +
      '&pbid=' + encodeURIComponent(playerId);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('sandbox',
      'allow-scripts allow-popups allow-same-origin');
    iframe.src = src;
    this.applyFillContent(iframe);

    this.element.appendChild(iframe);
    return loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  unlayoutOnPause() {
      return true;
  }
};

AMP.registerElement('amp-ooyala-player', AmpOoyalaPlayer);
