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

import {Layout} from '../../../src/layout';
import {assertHttpsUrl} from '../../../src/url';
import {dev} from '../../../src/log';

/**
 * Visible for testing only.
 */
export class AmpAudio extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.audio_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
  }


  /** @override */
  layoutCallback() {
    const audio = this.element.ownerDocument.createElement('audio');
    if (!audio.play) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    // Force controls otherwise there is no player UI.
    audio.controls = true;
    if (this.element.getAttribute('src')) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
    }
    this.propagateAttributes(
        ['src', 'autoplay', 'muted', 'loop', 'aria-label',
          'aria-describedby', 'aria-labelledby'],
        audio);

    this.applyFillContent(audio);
    this.getRealChildNodes().forEach(child => {
      if (child.getAttribute && child.getAttribute('src')) {
        assertHttpsUrl(child.getAttribute('src'),
            dev().assertElement(child));
      }
      audio.appendChild(child);
    });
    this.element.appendChild(audio);
    this.audio_ = audio;
    return this.loadPromise(audio);
  }

  /** @override */
  pauseCallback() {
    if (this.audio_) {
      this.audio_.pause();
    }
  }
}

AMP.registerElement('amp-audio', AmpAudio);
