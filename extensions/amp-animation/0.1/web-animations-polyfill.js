/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';

const POLYFILLED = '__AMP_WA';
const polyfillPromise_ = (function () {
  let res, rej;

  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  promise.resolve = res;
  promise.reject = rej;

  return promise;
})();

/**
 * Force Web Animations polyfill on Safari.
 * Native Web Animations on WebKit do not respect easing for individual
 * keyframes and break overall timing. See https://go.amp.dev/issue/27762 and
 * https://bugs.webkit.org/show_bug.cgi?id=210526
 * @param {!Window} win
 */
function forceOnSafari(win) {
  if (Services.platformFor(win).isSafari()) {
    // Using string access syntax to bypass typecheck.
    win.Element.prototype['animate'] = null;
  }
}

/**
 * @param {!Window} win
 * @return {Promise<void>}
 */
export function installWebAnimationsIfNecessary(win) {
  if (!win[POLYFILLED]) {
    forceOnSafari(win);
    win[POLYFILLED] = true;

    Services.extensionsFor(win)
      .preloadExtension('amp-animation-polyfill')
      .then(() => polyfillPromise_.resolve());
  }

  return polyfillPromise_;
}
