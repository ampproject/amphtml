/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {Layout} from '../../../src/layout';
import {userAssert} from '../../../src/log';

const TAG = 'amp-trinity-tts-player';
const URL = 'https://dev-sas.site';

export class AmpTrinityTTSPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.campaignId_ = '';

    /** @private {string} */
    this.selector_ = '';
  }

  /** @override */
  buildCallback() {
    this.campaignId_ = userAssert(
      this.element.getAttribute('campaignId'),
      'campaignId attribute must be specified for <%s>',
      TAG
    );

    this.selector_ = userAssert(
      this.element.getAttribute('selector'),
      'selector attribute must be specified for <%s>',
      TAG
    );
  }

  /** @override */
  layoutCallback() {
    return new Promise(resolve => {
      this.element.setAttribute('layout', 'fixed-height');

      const nodes = this.getWin().document.querySelectorAll(this.selector_);

      const resultReadingText = Array.from(nodes).map(node => node.outerHTML);

      const iframe = this.getWin().document.createElement('iframe');
      iframe.setAttribute('hidden', true);

      window.addEventListener('message', event => {
        if (event.data.type === 'trinity-player-rendered') {
          resolve();
          iframe.removeAttribute('hidden');
        }
      });

      iframe.addEventListener('load', () => {
        iframe.contentWindow.postMessage(
          {
            type: 'init',
            data: {
              text: resultReadingText,
              campaignId: this.campaignId_,
            },
          },
          '*'
        );
      });

      const src = `${URL}/player/tts-amp-iframe`;

      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.src = src;

      this.applyFillContent(iframe);
      this.element.appendChild(iframe);
    });
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.getWin().document.createElement('amp-img');
    // this.propagateAttributes(['aria-label'], placeholder);
    placeholder.setAttribute('src', `${URL}/player/img/loader.svg`);
    placeholder.setAttribute('height', '75');
    placeholder.setAttribute('layout', 'fixed-height');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('alt', 'Loading player');

    return placeholder;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.FIXED_HEIGHT;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpTrinityTTSPlayer);
});
