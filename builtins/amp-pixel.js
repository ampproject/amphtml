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
import {Services} from '../src/services';
import {createPixel} from '../src/pixel';
import {dev, userAssert} from '../src/log';
import {registerElement} from '../src/service/custom-element-registry';

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

    /** @private {?string} */
    this.referrerPolicy_ = this.element.getAttribute('referrerpolicy');
    if (this.referrerPolicy_) {
      // Safari doesn't support referrerPolicy yet. We're using an
      // iframe based trick to remove referrer, which apparently can
      // only do "no-referrer".
      userAssert(
        this.referrerPolicy_ == 'no-referrer',
        `${TAG}: invalid "referrerpolicy" value "${this.referrerPolicy_}".` +
          ' Only "no-referrer" is supported'
      );
    }
    if (
      this.element.hasAttribute('i-amphtml-ssr') &&
      this.element.querySelector('img')
    ) {
      dev().info(TAG, 'inabox img already present');
      return;
    }
    // Trigger, but only when visible.
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    viewer.whenFirstVisible().then(this.trigger_.bind(this));
  }

  /**
   * Triggers the signal.
   * @private
   */
  trigger_() {
    if (this.triggerPromise_) {
      // TODO(dvoytenko, #8780): monitor, confirm if there's a bug and remove.
      dev().error(TAG, 'duplicate pixel');
      return this.triggerPromise_;
    }
    // Delay(1) provides a rudimentary "idle" signal.
    // TODO(dvoytenko): use an improved idle signal when available.
    this.triggerPromise_ = Services.timerFor(this.win)
      .promise(1)
      .then(() => {
        const src = this.element.getAttribute('src');
        if (!src) {
          return;
        }
        return Services.urlReplacementsForDoc(this.element)
          .expandUrlAsync(this.assertSource_(src))
          .then(src => {
            const pixel = createPixel(this.win, src, this.referrerPolicy_);
            dev().info(TAG, 'pixel triggered: ', src);
            return pixel;
          });
      });
  }

  /**
   * @param {?string} src
   * @return {string}
   * @private
   */
  assertSource_(src) {
    userAssert(
      /^(https\:\/\/|\/\/)/i.test(src),
      'The <amp-pixel> src attribute must start with ' +
        '"https://" or "//". Invalid value: ' +
        src
    );
    return /** @type {string} */ (src);
  }
}

/**
 * @param {!Window} win Destination window for the new element.
 */
export function installPixel(win) {
  registerElement(win, TAG, AmpPixel);
}
