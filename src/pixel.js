/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {WindowInterface} from '../src/window-interface';
import {createElementWithAttributes} from '../src/dom';
import {dict} from '../src/utils/object';
import {user} from '../src/log';

/** @const {string} */
const TAG = 'pixel';

/**
 * @param {!Window} win
 * @param {string} src
 * @param {?string=} referrerPolicy
 * @return {!Element}
 */
export function createPixel(win, src, referrerPolicy) {
  if (referrerPolicy && referrerPolicy !== 'no-referrer') {
    user().error(TAG, 'Unsupported referrerPolicy: %s', referrerPolicy);
  }

  return referrerPolicy === 'no-referrer'
    ? createNoReferrerPixel(win, src)
    : createImagePixel(win, src);
}

/**
 * @param {!Window} win
 * @param {string} src
 * @return {!Element}
 */
function createNoReferrerPixel(win, src) {
  if (isReferrerPolicySupported()) {
    return createImagePixel(win, src, true);
  } else {
    // if "referrerPolicy" is not supported, use iframe wrapper
    // to scrub the referrer.
    const iframe = createElementWithAttributes(
      /** @type {!Document} */ (win.document),
      'iframe',
      dict({
        'src': 'about:blank',
        'style': 'display:none',
      })
    );
    win.document.body.appendChild(iframe);
    createImagePixel(iframe.contentWindow, src);
    return iframe;
  }
}

/**
 * @param {!Window} win
 * @param {string} src
 * @param {boolean=} noReferrer
 * @return {!Image}
 */
function createImagePixel(win, src, noReferrer = false) {
  const Image = WindowInterface.getImage(win);
  const image = new Image();
  if (noReferrer) {
    image.referrerPolicy = 'no-referrer';
  }
  image.src = src;
  return image;
}

/**
 * Check if element attribute "referrerPolicy" is supported by the browser.
 * Safari 11.1 does not support it yet.
 *
 * @return {boolean}
 */
function isReferrerPolicySupported() {
  return 'referrerPolicy' in Image.prototype;
}
