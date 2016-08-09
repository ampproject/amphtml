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

import {dev} from './log';
import {getServicePromise} from './service';
import {timerFor} from './timer';

/**
 * A map of extensions that, if they're included on the page, must be loaded
 * before the page should be shown to users. The key is the extension name,
 * the value is the blocking service.
 * Do not add an extension unless absolutely necessary.
 * @const {!Object<string, string>}
 */
const EXTENSIONS = {
  'amp-accordion': 'amp-accordion',
  'amp-dynamic-css-classes': 'amp-dynamic-css-classes',
  'amp-experiment': 'variant',
};

/**
 * Maximum milliseconds to wait for all extensions to load before erroring.
 * @const
 */
const LOAD_TIMEOUT = 3000;


/**
 * Detects any extensions that are were included on the page that need to
 * delay unhiding the body (to avoid Flash of Unstyled Content), and returns
 * a promise that will resolve when they have loaded or reject after a timeout.
 * @param {!Window} win
 * @return {!Promise|undefined}
 */
export function waitForExtensions(win) {
  const extensions = includedExtensions(win);
  const promises = extensions.map(extension => {
    return timerFor(win).timeoutPromise(
      LOAD_TIMEOUT,
      getServicePromise(win, EXTENSIONS[extension]),
      `Render timeout waiting for ${extension} to load.`
    );
  });
  // Only return a waiting promise if there are promises to wait for.
  return promises.length ?
    Promise.all(promises) :
    undefined;
}

/**
 * Detects which, if any, render-delaying extensions are included on the page.
 * @param {!Window} win
 * @return {!Array<string>}
 * @private
 */
function includedExtensions(win) {
  const doc = win.document;
  dev().assert(doc.body);

  return Object.keys(EXTENSIONS).filter(extension => {
    return doc.querySelector(`[custom-element="${extension}"]`);
  });
}
