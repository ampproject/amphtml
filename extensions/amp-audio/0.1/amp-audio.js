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

import {Layout, getLengthNumeral}  from '../../../src/layout';
import {assertHttpsUrl} from '../../../src/url';
import {loadPromise} from '../../../src/event-helper';

class AmpAudio extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.FIXED;
  }


  /** @override */
  layoutCallback() {
    if (this.didLayout) {
      return;
    }
    this.didLayout = true;
    let audio = document.createElement('audio');
    // Force controls otherwise there is no player UI.
    audio.controls = true;
    if (this.element.getAttribute('src')) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
    }
    this.propagateAttributes(
        ['src', 'autoplay', 'muted', 'loop'],
        audio);

    this.applyFillContent(audio);
    this.getRealChildNodes().forEach(child => {
      if (child.getAttribute && child.getAttribute('src')) {
        assertHttpsUrl(child.getAttribute('src'), child);
      }
      audio.appendChild(child);
    });
    this.element.appendChild(audio);
    return loadPromise(audio);
  }

}

AMP.registerElement('amp-audio', AmpAudio);
