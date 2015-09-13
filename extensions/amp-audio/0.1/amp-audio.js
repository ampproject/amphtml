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

import {assert} from '../../../src/asserts';
import {Layout, getLengthNumeral}  from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';

class AmpAudio extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.FIXED || layout === Layout.CONTAINER ||
      layout === Layout.FILL;
  }


  /**
   * Ensure if we are `container` or `fill` layout, we set our width to 100%
   * so we fill the container but ensure our height matches our attribute.
   * @override
   */
  firstAttachedCallback() {
    var layout = this.getLayout();
    if (layout !== Layout.FIXED) {
      let heightAttr = this.element.getAttribute('height');
      this.element.style.height = getLengthNumeral(heightAttr) + 'px';
      if (layout === Layout.CONTAINER || layout === Layout.FILL) {
        this.element.style.width = '100%';
      }
    }
  }


  /** @override */
  layoutCallback() {
    let audio = document.createElement('audio');
    // Force controls otherwise there is no player UI.
    audio.controls = true;
    this.assertElementSrcIfExists(this.element);
    this.propagateAttributes(
        ['src', 'autoplay', 'muted', 'loop'],
        audio);

    this.applyFillContent(audio);
    this.getRealChildNodes().forEach(child => {
      this.assertElementSrcIfExists(child);
      audio.appendChild(child);
    });
    this.element.appendChild(audio);
    return loadPromise(audio);
  }


  /**
   * Ensures an <audio> or nested <source> is loading a secure or
   * protocol-free path.
   */
  assertElementSrcIfExists(element) {
    if (!(element instanceof Element) || !element.hasAttribute('src')) {
      return;
    }
    let src = element.getAttribute('src');
    assert(
        /^(https\:\/\/|\/\/)/i.test(src),
        'An <amp-audio> audio source must start with ' +
        '"https://" or "//". Invalid value: ' + src);
  }
}

AMP.registerElement('amp-audio', AmpAudio);
