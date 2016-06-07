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

/**
 * Keep a list of extension elements whose scripts are included in HTML head.
 * Note the list may not be complete, an extension name will only be added
 * when `insertAmpExtensionScript()` is called.
 */
let ampExtensionScriptInsertedOrPresent = Object.create(null);

/**
 * Reset the ampExtensionScriptInsertedOrPresent value for each test.
 * @visibleForTesting
 */
export function resetExtensionScriptInsertedOrPresentForTesting() {
  ampExtensionScriptInsertedOrPresent = Object.create(null);
}

/**
 * Check script info in HTML head and make update if necessary
 * @param {!Window} win
 * @param {string} extension
 * @param {boolean} opt_ignoreElementExistenceCheck if true, will not check and
 *    require that extension element exist in document
 */
export function insertAmpExtensionScript(
    win, extension, opt_ignoreElementExistenceCheck) {
  if (extension == 'amp-embed') {
    extension = 'amp-ad';
  }
  if (!opt_ignoreElementExistenceCheck) {
    let element = win.document.querySelector(extension);
    if (!element && extension == 'amp-ad') {
      element = win.document.querySelector('amp-embed');
    }
    if (!element) {
      return;
    }
  }
  if (isAmpExtensionScriptRequired(win, extension)) {
    const ampExtensionScript = createAmpExtensionScript(win, extension);
    win.document.head.appendChild(ampExtensionScript);
  }
};

/**
 * Create the missing amp extension HTML script element.
 * @param {!Window} win
 * @param {string} extension
 * @return {!HTMLScriptElement} Script object
 */
function createAmpExtensionScript(win, extension) {
  const ampExtensionScript = win.document.createElement('script');
  ampExtensionScript.async = true;
  ampExtensionScript.setAttribute('custom-element', extension);
  ampExtensionScript.setAttribute('data-script', extension);
  const pathStr = win.location.pathname;
  const useCompiledJs = win.AMP_TEST && window.ampTestRuntimeConfig &&
      window.ampTestRuntimeConfig.useCompiledJs;
  const scriptSrc = calculateExtensionScriptUrl(pathStr, extension,
      win.AMP_TEST, useCompiledJs);
  ampExtensionScript.src = scriptSrc;
  return ampExtensionScript;
};

/**
 * Determine the need to add amp extension script to document.
 * @param {!Window} win
 * @param {string} extension
 * @return {boolean} Whether the action of adding an ampExtensionScript is required.
 */
function isAmpExtensionScriptRequired(win, extension) {
  if (ampExtensionScriptInsertedOrPresent[extension]) {
    return false;
  }
  const ampExtensionScriptInHead = win.document.head.querySelector(
      `[custom-element="${extension}"]`);
  ampExtensionScriptInsertedOrPresent[extension] = true;
  return !ampExtensionScriptInHead;
};

/**
 * Calculate script url for amp-ad.
 * @visibleForTesting
 * @param {string} path Location path of the window
 * @param {string} extension
 * @param {boolean=} isTest
 * @param {boolean=} isUsingCompiledJs
 * @return {string}
 */
export function calculateExtensionScriptUrl(path, extension, isTest,
  isUsingCompiledJs) {
  if (getMode().localDev) {
    if (isTest) {
      if (isUsingCompiledJs) {
        return `/base/dist/v0/${extension}-0.1.js`;
      }
      return `/base/dist/v0/${extension}-0.1.max.js`;
    }
    if (path.indexOf('.max') >= 0) {
      return `http://localhost:8000/dist/v0/${extension}-0.1.max.js`;
    }
    if (path.indexOf('.min') >= 0) {
      return `http://localhost:8000/dist/v0/${extension}-0.1.js`;
    }
    return `https://cdn.ampproject.org/v0/${extension}-0.1.js`;
  }
  const domain = 'https://cdn.ampproject.org/';
  const folderPath = getMode().version == '$internalRuntimeVersion$' ?
      '' : `rtv/${getMode().version}/`;
  return `${domain}${folderPath}v0/${extension}-0.1.js`;
};
