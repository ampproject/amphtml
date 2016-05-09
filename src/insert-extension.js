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

import {getMode} from './mode';

export let ampExtensionScriptInsertedOrPresent = [];

/**
* @visibleForTesting
* Reset the ampExtensionScriptInsertedOrPresent value for each test.
*/
export function resetExtensionScriptInsertedOrPresentForTesting(extension) {
  console.log('inside resetExtensionScriptInsertedOrPresentForTesting');
  console.log(extension);
  console.log(ampExtensionScriptInsertedOrPresent['amp-ad']);
  ampExtensionScriptInsertedOrPresent[extension] = false;
  console.log(ampExtensionScriptInsertedOrPresent['amp-ad']);
}

/**
 * Check script info in HTML head and make update if necessary
 * @param {!Element} element
 * @param {string} extension
 */
export function insertAmpExtensionScript(win, element, extension) {
  if (extension == 'amp-embed') {
    extension = 'amp-ad';
  }
  ampExtensionScriptInsertedOrPresent[extension] = false;
  if (isAmpExtensionScriptRequired(win, element, extension)) {
    const ampExtensionScript = createAmpExtensionScript(win, extension);
    win.document.head.appendChild(ampExtensionScript);
  }
};

/**
 * Create the missing amp extension HTML script element.
 * @param {!Window} win
 * @param {string} extension
 * @return {!Object} Script object
 */
function createAmpExtensionScript(win, extension) {
  const ampExtensionScript = win.document.createElement('script');
  ampExtensionScript.async = true;
  ampExtensionScript.setAttribute('custom-element', extension);
  ampExtensionScript.setAttribute('data-script', extension);
  const pathStr = win.location.pathname;
  const scriptSrc = calculateExtensionScriptUrl(pathStr, extension);
  ampExtensionScript.src = scriptSrc;
  return ampExtensionScript;
};

/**
* Determine the need to add amp extension script to document.
* @param {!Window} win
* @param {!Element} element
* @param {string} extension
* @return {boolean} Whether the action of adding an ampExtensionScript is required.
*/
function isAmpExtensionScriptRequired(win, element, extension) {
  if (ampExtensionScriptInsertedOrPresent[extension]) {
    return false;
  }
  const tag = element.tagName.toLowerCase();
  if (tag == extension || (tag=='amp-embed' && extension=='amp-ad')) {
    const ampExtensionScriptInHead = win.document.head.querySelector(
        '[custom-element="'+ extension + '"]');
    ampExtensionScriptInsertedOrPresent[extension] = true;
    if (!ampExtensionScriptInHead) {
      return true;
    }
  }
  return false;
};

/**
 * Calculate script url for amp-ad, export only for testing reasons.
 * @param {string} path Location path of the window.
 * @param {string} extension
 * @return {string}
*/
export function calculateExtensionScriptUrl(path, extension) {
  let scriptSrc;
  if (getMode().localDev) {
    scriptSrc = 'https://cdn.ampproject.org/v0/' + extension + '-0.1.js';
    if (path.indexOf('.max') >= 0) {
      scriptSrc = 'http://localhost:8000/dist/v0/' + extension + '-0.1.max.js';
    } else if (path.indexOf('.min') >= 0) {
      scriptSrc = 'http://localhost:8000/dist/v0/' + extension + '-0.1.js';
    }
  } else {
    const domain = 'https://cdn.ampproject.org/';
    const folderPath = getMode().version == '$internalRuntimeVersion$' ?
        '' : `rtv/${getMode().version}/`;
    scriptSrc = `${domain}${folderPath}v0/` + extension + '-0.1.js';
  }
  return scriptSrc;
};
