/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {assertAttributeMutationFormat} from './mutation';

/**
 * Mutation for attribute (style) mutations on unspecified elements.
 *
 * @implements {./mutation.Mutation}
 */
export class AttributeMutationDefaultClass {
  /**
   * @param {!JsonObject} mutationRecord
   * @param {!Array<Element>} elements
   */
  constructor(mutationRecord, elements) {
    this.mutationRecord_ = mutationRecord;
    this.elements_ = elements;
    assertAttributeMutationFormat(this.mutationRecord_);
  }

  /** @override */
  parseAndValidate() {
    const value = this.mutationRecord_['value'];

    // Don't allow the .i-amphtml class
    // Should stay in sync with
    // `validator/validator-main.protoascii`
    if (value.match(/(^|\\W)i-amphtml-/)) {
      return false;
    }

    return true;
  }

  /** @override */
  mutate() {
    this.elements_.forEach((element) => {
      element.setAttribute(
        this.mutationRecord_['attributeName'],
        this.mutationRecord_['value']
      );
    });
  }

  /** @override */
  toString() {
    return JSON.stringify(this.mutationRecord_);
  }
}
