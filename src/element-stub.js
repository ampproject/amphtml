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
import {getMode} from '../src/mode'


/** @type {!Array} */
export const stubbedElements = [];

let ampAdScriptInserted = false;

export class ElementStub extends BaseElement {
  constructor(element) {
    super(element);
    if(addScript(element, this.getWin())) {
      var ampAdScript = this.getWin().document.createElement('script');
      ampAdScript.async = true;
      ampAdScript.setAttribute('custom-element', 'amp-ad');
      ampAdScript.setAttribute('data-script', 'amp-ad');
      ampAdScript.src = calculateScript(this.getWin());
      this.getWin().document.head.appendChild(ampAdScript);   
    }
    stubbedElements.push(this);
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

function calculateScript(win) {
  debugger;
  let scriptSrc;
  if(getMode().localDev) {
    const pathStr = win.location.pathname.toString();
    if (pathStr.search('max') >= 0) {
      scriptSrc = "http://localhost:8000/dist/v0/amp-ad-0.1.max.js";
      return scriptSrc;
    } else if (pathStr.search('min') >= 0) {
      scriptSrc = "http://localhost:8000/dist/v0/amp-ad-0.1.min.js";
      return scriptSrc;
    }
  } 
  domain = 'https://cdn.ampproject.org/';
  const folderPath = getMode().version == "$internalRuntimeVersion$" ?
    '' : `rtv/${getMode().version}/`;
  scriptSrc = `${domain}${folderPath}v0/amp-ad-0.1.js`; 
  return scriptSrc;
}

function addScript(element, win) {
  let isSrc = win.document.head.querySelector('[custom-element="amp-ad"]');
  debugger;
  let tag = element.tagName.toLowerCase();
  if(!ampAdScriptInserted) {
    if(tag == "amp-ad" || tag == "amp-embed") {
      ampAdScriptInserted = true;
      return true;
    }
  }
  return false;
}
