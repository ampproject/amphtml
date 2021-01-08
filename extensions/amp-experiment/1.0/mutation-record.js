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

import {isObject, toArray} from '../../../src/types';
import {userAssert} from '../../../src/log';

/**
 * Types of possibile mutations
 * from the WorkerDOM MutationRecord.
 * This is the value set to the 'type' key.
 */
export const MUTATION_TYPES = ['attributes', 'characterData', 'childList'];

/**
 * Function to assert the format to ensure
 * that the mutation is a mutation record.
 * @param {!JsonObject} mutationRecord
 * @return {!Object}
 */
export function assertMutationRecordFormat(mutationRecord) {
  // Assert that the mutation is an object
  userAssert(
    isObject(mutationRecord),
    'Mutation %s must be an object.',
    JSON.stringify(mutationRecord)
  );

  // Assert the mutation type
  userAssert(
    mutationRecord['type'] !== undefined &&
      typeof mutationRecord['type'] === 'string',
    'Mutation %s must have a type.',
    JSON.stringify(mutationRecord)
  );

  // Assert the mutation type is one of the following keys
  userAssert(
    MUTATION_TYPES.indexOf(mutationRecord['type']) >= 0,
    'Mutation %s must have a valid type.',
    JSON.stringify(mutationRecord)
  );

  // Assert the mutation target
  userAssert(
    mutationRecord['target'] !== undefined &&
      typeof mutationRecord['target'] === 'string',
    'Mutation %s must have a target.',
    JSON.stringify(mutationRecord)
  );

  return mutationRecord;
}

/**
 * Function to set the target elements from the
 * target selector to the target element key,
 * and assert that we found the element.
 * @param {!Document} document
 * @param {!Object} mutationRecord
 * @return {!Array<Element>}
 */
export function getElementsFromMutationRecordSelector(
  document,
  mutationRecord
) {
  const selector = mutationRecord['target'];
  // Do not support selecting `i-amphtml` elements
  userAssert(
    !selector.match(/(^|\\W)i-amphtml-/),
    'target %s cannot select i-amphtml-',
    selector
  );

  const targetElements = document.querySelectorAll(selector);

  userAssert(
    targetElements.length > 0,
    'No element on the document matches the selector, %s .',
    mutationRecord['target']
  );

  return toArray(targetElements);
}
