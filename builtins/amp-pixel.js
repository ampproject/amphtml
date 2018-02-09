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
import {assertHttpsUrl} from '../src/url';
import {createElementWithAttributes} from '../src/dom';
import {dev, user} from '../src/log';
import {dict} from '../src/utils/object';
import {registerElement} from '../src/service/custom-element-registry';
import {scopedQuerySelector} from '../src/dom';
import {toWin} from '../src/types';

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
      user().assert(this.referrerPolicy_ == 'no-referrer',
          `${TAG}: invalid "referrerpolicy" value "${this.referrerPolicy_}".`
          + ' Only "no-referrer" is supported');
    }
    if (this.element.hasAttribute('i-amphtml-ssr') &&
        scopedQuerySelector(this.element, 'img')) {
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
    this.triggerPromise_ = Services.timerFor(this.win).promise(1).then(() => {
      const src = this.element.getAttribute('src');
      if (!src) {
        return;
      }
      return Services.urlReplacementsForDoc(this.element)
          .expandUrlAsync(assertHttpsUrl(src, this.element))
          .then(src => {
            const pixel = this.referrerPolicy_
              ? createNoReferrerPixel(this.element, src)
              : createImagePixel(this.win, src);
            dev().info(TAG, 'pixel triggered: ', src);
            return pixel;
          });
    });
  }
}

/**
 * @param {!Element} parentElement
 * @param {string} src
 * @returns {!Element}
 */
function createNoReferrerPixel(parentElement, src) {
  if (isReferrerPolicySupported()) {
    return createImagePixel(toWin(parentElement.ownerDocument.defaultView), src,
        true);
  } else {
    // if "referrerPolicy" is not supported, use iframe wrapper
    // to scrub the referrer.
    const iframe = createElementWithAttributes(
        /** @type {!Document} */ (parentElement.ownerDocument), 'iframe', dict({
          'src': 'about:blank',
        }));
    parentElement.appendChild(iframe);
    createImagePixel(iframe.contentWindow, src);
    return iframe;
  }
}

/**
 * @param {!Window} win
 * @param {string} src
 * @param {boolean=} noReferrer
 * @returns {!Image}
 */
function createImagePixel(win, src, noReferrer) {
  const image = new win.Image();
  if (noReferrer) {
    image.referrerPolicy = 'no-referrer';
  }
  image.src = src;
  return image;
}

/**
 * Check if element attribute "referrerPolicy" is supported by the browser.
 * At this moment (4/14/2017), Safari does not support it yet.
 *
 * @returns {boolean}
 */
export function isReferrerPolicySupported() {
  return 'referrerPolicy' in Image.prototype;
}

/**
 * @param {!Window} win Destination window for the new element.
 */
export function installPixel(win) {
  registerElement(win, TAG, AmpPixel);
}
