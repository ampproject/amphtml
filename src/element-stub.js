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
import {insertAmpExtensionScript} from './insert-extension';

/** @type {!Array} */
export const stubbedElements = [];

/**
* This value tells the ampAdScript is already presented or inserted.
* Set the value to true when querySelector find an amp-ad script
* or when add amp-ad script to head.
* @type {boolean}
*/
//let ampAdScriptInsertedOrPresent = false;

/**
* @visibleForTesting
* Reset the ampAdScriptInsertedOrPresent value for each test.
*/
//export function resetAdScriptInsertedOrPresentForTesting() {
  //ampAdScriptInsertedOrPresent = false;
//}

export class ElementStub extends BaseElement {
  constructor(element) {
    super(element);
    insertAmpExtensionScript(this.getWin(), element, 'amp-ad');
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