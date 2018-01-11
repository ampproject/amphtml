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

import {assertHttpsUrl} from '../../../src/url';

/**
 * @const {string}
 */
const BACKGROUND_AUDIO_ELEMENT_CLASS_NAME = 'i-amphtml-story-background-audio';


/**
 * Adds support for the background-audio property on the specified element.
 * @param {!Element} element The element to upgrade with support for background
 *     audio.
 */
export function upgradeBackgroundAudio(element) {
  if (element.hasAttribute('background-audio')) {
    const audioEl = element.ownerDocument.createElement('audio');
    const audioSrc =
        assertHttpsUrl(element.getAttribute('background-audio'), element);
    audioEl.setAttribute('src', audioSrc);
    audioEl.setAttribute('preload', 'auto');
    audioEl.setAttribute('loop', '');
    audioEl.setAttribute('autoplay', '');
    audioEl.setAttribute('muted', '');
    audioEl.classList.add(BACKGROUND_AUDIO_ELEMENT_CLASS_NAME);
    element.appendChild(audioEl);
  }
}
