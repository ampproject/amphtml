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

import {BaseElement} from './base-element';
import {Layout, getLengthNumeral, isLayoutSizeDefined} from './layout';
import {registerElement} from './custom-element';

/**
 * @typedef {{
 *   width: number,
 *   height: number
 * }}
 */
let Dimensions;

/** @type {?Dimensions} */
let audioDefaultDimensions_ = null;

/**
 * Determines the default dimensions for an audio player which varies across
 * browser implementations.
 * @return {Dimensions}
 */
function getBrowserAudioDefaultDimensions() {
  if (!audioDefaultDimensions_) {
    let temp = document.createElement('audio');
    temp.controls = true;
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    document.body.appendChild(temp);
    audioDefaultDimensions_ = {
      width: temp.offsetWidth,
      height: temp.offsetHeight
    };
    document.body.removeChild(temp);
  }
  return audioDefaultDimensions_;
}


/**
 * @param {!Window} win Destination window for the new element.
 */
export function installAudio(win) {
  class AmpAudio extends BaseElement {

    /** @override */
    isLayoutSupported(layout) {
      return layout === Layout.FIXED;
    }

    /**
     * Ensures that a width and height is set to the browser's default audio
     * player's inherent dimensions if not specified.
     * @override
     */
    createdCallback() {
      let heightAttr = this.element.getAttribute('height');
      let widthAttr = this.element.getAttribute('width');
      if (!heightAttr || !widthAttr) {
        let dimensions = getBrowserAudioDefaultDimensions();
        if (!heightAttr) {
          this.element.setAttribute('height', dimensions.height);
        }
        if (!widthAttr) {
          this.element.setAttribute('width', dimensions.width);
        }
      }
    }

    /** @override */
    layoutCallback() {
      let audio = document.createElement('audio');
      // Force controls otherwise there is no player UI.
      audio.controls = true;
      this.propagateAttributes(
          ['src', 'autoplay', 'muted', 'loop'],
          audio);
      this.applyFillContent(audio);
      this.getRealChildNodes().forEach(child => audio.appendChild(child));
      this.element.appendChild(audio);
      return audio;
    }
  }

  registerElement(win, 'amp-audio', AmpAudio);
}
