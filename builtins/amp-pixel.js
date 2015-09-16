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
import {Layout} from '../src/layout';
import {assert} from '../src/asserts';
import {documentInfoFor} from '../src/document-info';
import {registerElement} from '../src/custom-element';


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
    buildCallback() {
      // Remove user defined size. Pixels should always be the default size.
      this.element.style.width = '';
      this.element.style.height = '';
      // Consider the element invisible.
      this.element.setAttribute('aria-hidden', 'true');
    }

    /** @override */
    layoutCallback() {
      var src = this.element.getAttribute('src');
      src = this.assertSource(src);
      src = src.replace(/\$(RANDOM|CANONICAL_URL)+/g, function(match, name) {
        var val = name;
        switch (name) {
          case 'RANDOM':
            val = Math.random();
            break;
          case 'CANONICAL_URL':
            val = documentInfoFor(win).canonicalUrl
        }
        return encodeURIComponent(val);
      });
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
