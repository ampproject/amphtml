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

import {calculateExtensionScriptUrl} from './service/extension-location';
import {getMode} from './mode';

/**
 * Promise for whether a bundle with given ID and it's dependencies
 * (previous bundles invoked together) have been loaded.
 * !Object<string, !Promise>
 */
const loadState = Object.create(null);

/**
 * Script load the intermediate bundles needed for an extension.
 * Relies on runtime.js for the execution of the script. Returns a promise
 * for runtime.js to use for delaying execution of an extension until
 * these dependencies have been fulfilled.
 * @param {!Window} win
 * @param {!Array<string>} bundles Array of bundle ids to be loaded. Returned
 *     promise resolves when all of these have been loaded.
 * @param {!Promise=} opt_parentPromise Only for use in internal recursion.
 * @return {!Promise}
 */
export function loadIntermediateBundles(win, bundles, opt_parentPromise) {
  const bundleId = bundles.shift();
  if (!loadState[bundleId]) {
    const loadedScript = new Promise(resolve => {
      const scriptUrl = calculateExtensionScriptUrl(win.location, bundleId,
          undefined, getMode().localDev);
      const s = win.document.createElement('script');
      s.src = scriptUrl;
      win.document.head.appendChild(s);
      s.setAttribute('data-script', bundleId);
      s.setAttribute('i-amphtml-inserted', 'intermediate');
      s.onload = resolve;
    });
    let loadedAll = loadedScript;
    if (opt_parentPromise) {
      loadedAll = opt_parentPromise.then(() => {
        return loadedScript;
      });
    }
    loadState[bundleId] = loadedAll;
  }
  if (bundles.length > 0) {
    return loadIntermediateBundles(win, bundles, loadState[bundleId]);
  }
  return loadState[bundleId];
}
