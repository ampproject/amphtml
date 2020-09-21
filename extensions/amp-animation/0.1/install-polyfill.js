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
import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';

/** @type {!WeakMap<!../../../src/service/ampdoc-impl.AmpDoc, !Promise>} */
const polyfillPromiseMap = new WeakMap();

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {Promise<void>}
 */
export function installWebAnimationsIfNecessary(ampdoc) {
  if (polyfillPromiseMap.has(ampdoc)) {
    return polyfillPromiseMap.get(ampdoc);
  }

  const {promise, resolve} = new Deferred();
  polyfillPromiseMap.set(ampdoc, promise);

  const {win} = ampdoc;
  const platform = Services.platformFor(win);
  if (platform.isSafari() && platform.getMajorVersion() < 14) {
    /*
      Force Web Animations polyfill on Safari versions before 14.
      Native Web Animations on WebKit did not respect easing for individual
      keyframes and break overall timing. See https://go.amp.dev/issue/27762 and
      https://bugs.webkit.org/show_bug.cgi?id=210526
      */
    // Using string access syntax to bypass typecheck.
    win.Element.prototype['animate'] = null;
  }

  if (win.Element.prototype['animate']) {
    // Native Support exists, there is no reason to load the polyfill.
    resolve();
    return promise;
  }

  resolve(
    Services.extensionsFor(win).installExtensionForDoc(
      ampdoc,
      'amp-animation-polyfill'
    )
  );

  return promise;
}
