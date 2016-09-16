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
import {urlReplacementsFor} from '../src/url-replacements';
import {registerElement} from '../src/custom-element';
import {toggle} from '../src/style';
import {user} from '../src/log';

/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installPixel(win) {
  class AmpPixel extends BaseElement {

    /** @override */
    getPriority() {
      // Loads after other content.
      return 1;
    }

    /** @override */
    isLayoutSupported(layout) {
      return layout == Layout.FIXED;
    }

    /** @override */
    buildCallback() {
      // Consider the element invisible.
      this.element.setAttribute('aria-hidden', 'true');
    }

    /** @override */
    layoutCallback() {
      // Now that we are rendered, stop rendering the element to reduce
      // resource consumption.
      toggle(this.element, false);
      const src = this.element.getAttribute('src');
      return urlReplacementsFor(this.win).expand(this.assertSource(src))
          .then(src => {
            const image = new Image();
            image.src = src;
            this.element.appendChild(image);
          });
    }

    assertSource(src) {
      user().assert(
          /^(https\:\/\/|\/\/)/i.test(src),
          'The <amp-pixel> src attribute must start with ' +
          '"https://" or "//". Invalid value: ' + src);
      return src;
    }
  };

  registerElement(win, 'amp-pixel', AmpPixel);
}
