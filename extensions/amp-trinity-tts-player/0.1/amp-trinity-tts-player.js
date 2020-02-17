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
import {getData} from '../../../src/event-helper';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

const TAG = 'amp-trinity-tts-player';
const URL = 'https://trinitymedia.ai';
const CDN_URL = 'https://vd.trinitymedia.ai';

export class AmpTrinityTTSPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.campaignId_ = '';

    this.isExperimentOn_ = isExperimentOn(this.win, 'amp-trinity-tts-player');
  }

  /** @override */
  buildCallback() {
    userAssert(this.isExperimentOn_, `Experiment ${TAG} is not turned on.`);

    this.campaignId_ = userAssert(
      this.element.getAttribute('campaignId'),
      'campaignId attribute must be specified for <%s>',
      TAG
    );
  }

  /** @override */
  layoutCallback() {
    userAssert(this.isExperimentOn_, `Experiment ${TAG} is not turned on.`);

    return new Promise(resolve => {
      this.element.setAttribute('layout', 'fixed-height');

      const iframe = this.getWin().document.createElement('iframe');
      iframe.setAttribute('hidden', true);

      window.addEventListener('message', event => {
        if (getData(event)['type'] === 'trinity-player-rendered') {
          resolve();
          iframe.removeAttribute('hidden');
        }
      });

      iframe.addEventListener('load', () => {
        iframe.contentWindow./*OK*/ postMessage(
          /** @type {JsonObject} */ ({
            type: 'init',
            data: {
              text: this.getWin().document.body.innerHTML,
              campaignId: this.campaignId_,
              pageURL: this.getWin().location.href,
            },
          }),
          '*'
        );
      });

      const src = `${URL}/player/trinity-amp`;

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
    placeholder.setAttribute('src', `${CDN_URL}/images/loader.svg`);
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
