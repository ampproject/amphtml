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


/** @type {!Array} */
export const stubbedElements = [];

/**
 * Maps lower case tag names to the non-stubbed implementation classes.
 * @type {!Object<string, !Function>}
 */
export const directUpgrade = {};

export class ElementStub extends BaseElement {
  constructor(element) {
    super(element);
    // If the implementation is already available, immediately upgrade the
    // element.
    const implementation = directUpgrade[element.tagName.toLowerCase()]
    if (implementation) {
      element.upgrade(implementation);
    } else {
      stubbedElements.push(this);
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
