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

import {BaseElement} from '../src/base-element';
import {getLengthNumeral, isLayoutSizeDefined} from '../src/layout';
import {loadPromise} from '../src/event-helper';
import {registerElement} from '../src/custom-element';


/**
 * @param {!Window} win Destination window for the new element.
 */
export function installVideo(win) {
  class AmpVideo extends BaseElement {

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    layoutCallback() {
      var width = this.element.getAttribute('width');
      var height = this.element.getAttribute('height');
      var video = document.createElement('video');
      this.propagateAttributes(
          ['src', 'controls', 'autoplay', 'muted', 'loop'],
          video);
      video.width = getLengthNumeral(width);
      video.height = getLengthNumeral(height);
      this.applyFillContent(video);
      this.element.appendChild(video);
      return loadPromise(video);
    }
  }

  registerElement(win, 'amp-video', AmpVideo);
}
