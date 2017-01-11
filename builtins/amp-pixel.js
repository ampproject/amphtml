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
import {dev, user} from '../src/log';
import {registerElement} from '../src/custom-element';
import {toggle} from '../src/style';
import {urlReplacementsForDoc} from '../src/url-replacements';
import {viewerForDoc} from '../src/viewer';

const TAG = 'amp-pixel';


/**
 * A simple analytics instrument. Fires as an impression signal.
 */
export class AmpPixel extends BaseElement {

  /** @override */
  constructor(element) {
    super(element);

    /** @private {?Promise} */
    this.triggerPromise_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    // "fixed" layout is supported, but in reality it's always width/height = 0.
    return layout == Layout.FIXED;
  }

  /** @override */
  buildCallback() {
    // Element is invisible.
    toggle(this.element, false);
    this.element.setAttribute('aria-hidden', 'true');

    // Trigger, but only when visible.
    const viewer = viewerForDoc(this.getAmpDoc());
    viewer.whenFirstVisible().then(this.trigger_.bind(this));
  }

  /**
   * Triggers the signal.
   * @private
   */
  trigger_() {
    this.triggerPromise_ = Promise.resolve().then(() => {
      const src = this.element.getAttribute('src');
      return urlReplacementsForDoc(this.getAmpDoc())
          .expandAsync(this.assertSource_(src))
          .then(src => {
            const image = new Image();
            image.src = src;
            this.element.appendChild(image);
            dev().info(TAG, 'pixel triggered: ', src);
          });
    });
  }

  /**
   * @param {?string} src
   * @return {string}
   * @private
   */
  assertSource_(src) {
    user().assert(
        /^(https\:\/\/|\/\/)/i.test(src),
        'The <amp-pixel> src attribute must start with ' +
        '"https://" or "//". Invalid value: ' + src);
    return src;
  }
}


/**
 * @param {!Window} win Destination window for the new element.
 */
export function installPixel(win) {
  registerElement(win, TAG, AmpPixel);
}
