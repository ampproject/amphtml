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

import {BaseElement} from './base-element';
import {getMode} from '../src/mode';

/** @type {!Array} */
export const stubbedElements = [];

/**
* This value tells the ampAdScript is already presented or inserted.
* Set the value to true when querySelector find an amp-ad script
* or when add amp-ad script to head.
* @type {boolean}
*/
let ampAdScriptInsertedOrPresent = false;

/**
* For testing purpose only.
*/
export function resetAdScriptInsertedOrPresentForTesting() {
  ampAdScriptInsertedOrPresent = false;
}

export class ElementStub extends BaseElement {
  constructor(element) {
    super(element);
    this.updateAmpAdScriptInfo(element);
    stubbedElements.push(this);
  }

  /**
   * Check script info in HTML head and make update if necessary
   * @param {!Element} element
  */
  updateAmpAdScriptInfo(element) {
    if (isAmpAdScriptRequired(this.getWin(), element)) {
      const ampAdScript = createAmpAdScript(this.getWin());
      this.getWin().document.head.appendChild(ampAdScript);
    }
  }

  /** @override */
  getPriority() {
    throw new Error('Cannot get priority of stubbed element');
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    // Always returns true and will eventually call this method on the actual
    // element.
    return true;
  }
}

/**
 * Calculate script url for amp-ad, export only for testing reasons.
 * @param {string} path Location path of the window.
 * @return {string}
*/
export function calculateAdScriptUrl(path) {
  let scriptSrc;
  if (getMode().localDev) {
    scriptSrc = 'https://cdn.ampproject.org/v0/amp-ad-0.1.js';
    if (path.indexOf('.max') >= 0) {
      scriptSrc = 'http://localhost:8000/dist/v0/amp-ad-0.1.max.js';
    } else if (path.indexOf('.min') >= 0) {
      scriptSrc = 'http://localhost:8000/dist/v0/amp-ad-0.1.js';
    }
  } else {
    const domain = 'https://cdn.ampproject.org/';
    const folderPath = getMode().version == '$internalRuntimeVersion$' ?
        '' : `rtv/${getMode().version}/`;
    scriptSrc = `${domain}${folderPath}v0/amp-ad-0.1.js`;
  }
  return scriptSrc;
}

/**
 * Create the missing amp-ad HTML script element.
 * @param {!Window} win
 * @return {!Object} Script object
 */
function createAmpAdScript(win) {
  const ampAdScript = win.document.createElement('script');
  ampAdScript.async = true;
  ampAdScript.setAttribute('custom-element', 'amp-ad');
  ampAdScript.setAttribute('data-script', 'amp-ad');
  const pathStr = win.location.pathname;
  const scriptSrc = calculateAdScriptUrl(pathStr);
  ampAdScript.src = scriptSrc;
  return ampAdScript;
}

/**
* Determine the need to add amp-ad script to document.
* @param {!Window} win
* @param {!Element} element
* @return {boolean} Whether the action of adding an ampAdScript is required.
*/
function isAmpAdScriptRequired(win, element) {
  if (ampAdScriptInsertedOrPresent) {
    return false;
  }
  const tag = element.tagName;
  if (tag == 'AMP-AD' || tag == 'AMP-EMBED') {
    const ampAdScriptInHead = win.document.head.querySelector(
        '[custom-element="amp-ad"]');
    ampAdScriptInsertedOrPresent = true;
    if (!ampAdScriptInHead) {
      return true;
    }
  }
  return false;
}
