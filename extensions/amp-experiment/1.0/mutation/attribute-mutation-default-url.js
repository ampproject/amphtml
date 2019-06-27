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

import {
  assertAttributeMutationFormat
} from './mutation';

/**
 * Mutation for attribute (url) mutations, for both
 * the 'href' and 'src' attributes,
 * on unspecifed elements.
 *
 * @implements {./mutation.Mutation}
 */
export class AttributeMutationDefaultUrl {

  /**
   * @param {!Object} mutationRecord
   * @param {!Array<Element>} elements
   */
  constructor(mutationRecord, elements) {
    this.mutationRecord = mutationRecord;
    this.elements = elements;
    assertAttributeMutationFormat(mutationRecord);
  }

  /** @override */
  validate() {
    assertHttpsUrl(
      this.mutationRecord['value'],
      this.mutationRecord['target'],
      'attributes mutation'
    );
    return true;
  }

  /** @override */
  mutate() {
    this.elements.forEach(element => {
      element.setAttribute(
        this.mutationRecord['attributeName'],
        this.mutationRecord['value']
      );
    });
  }
}

