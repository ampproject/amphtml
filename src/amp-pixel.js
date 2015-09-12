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
import {Layout} from './layout';
import {registerElement} from './custom-element';
import {assert} from './asserts';


/**
 * @param {!Window} win Destination window for the new element.
 */
export function installPixel(win) {
  class AmpPixel extends BaseElement {
    /** @override */
    isLayoutSupported(layout) {
      return layout == Layout.FIXED;
    }

    /** @override */
    createdCallback() {
      if (!this.element.hasAttribute('height')) {
        this.element.setAttribute('height', '1');
      }
      if (!this.element.hasAttribute('width')) {
        this.element.setAttribute('width', '1');
      }
    }

    /** @override */
    buildCallback() {
      // Remove user defined size. Pixels should always be the default size.
      this.element.style.width = '';
      this.element.style.height = '';
    }

    /** @override */
    layoutCallback() {
      var src = this.element.getAttribute('src');
      src = this.assertSource(src);
      src = src.replace(/\$RANDOM/, encodeURIComponent(Math.random()));
      var image = new Image();
      image.src = src;
      image.width = 1;
      image.height = 1;
      this.element.appendChild(image);
      return Promise.resolve();
    }

    assertSource(src) {
      assert(
          /^(https\:\/\/|\/\/)/i.test(src),
          'The <amp-pixel> src attribute must start with ' +
          '"https://" or "//". Invalid value: ' + src);
      return src;
    }
  }

  registerElement(win, 'amp-pixel', AmpPixel);
}
