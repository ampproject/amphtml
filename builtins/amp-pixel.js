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
import {dev, user} from '../src/log';
import {registerElement} from '../src/custom-element';
import {timerFor} from '../src/services';
import {urlReplacementsForDoc} from '../src/services';
import {viewerForDoc} from '../src/services';

const TAG = 'amp-pixel';


/**
 * A simple analytics instrument. Fires as an impression signal.
 */
export class AmpPixel extends BaseElement {

  /** @override */
  constructor(element) {
    super(element);

    /** @private {?Promise<!Image>} */
    this.triggerPromise_ = null;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    // No matter what layout is: the pixel is always non-displayed.
    return true;
  }

  /** @override */
  buildCallback() {
    // Element is invisible.
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
    // Delay(1) provides a rudimentary "idle" signal.
    // TODO(dvoytenko): use an improved idle signal when available.
    this.triggerPromise_ = timerFor(this.win).promise(1).then(() => {
      const src = this.element.getAttribute('src');
      if (!src) {
        return;
      }
      return urlReplacementsForDoc(this.element)
          .expandAsync(this.assertSource_(src))
          .then(src => {
            const image = new Image();
            image.src = src;
            dev().info(TAG, 'pixel triggered: ', src);
            return image;
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
    return /** @type {string} */ (src);
  }
}


/**
 * @param {!Window} win Destination window for the new element.
 */
export function installPixel(win) {
  registerElement(win, TAG, AmpPixel);
}
