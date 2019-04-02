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

import {isObject} from '../../../src/types';
import {userAssert} from '../../../src/log';

/**
 * Function to find all selectors of the mutation
 * and return a function to apply the identified
 * MutationRecord
 * @param {!JsonObject} mutation
 * @param {!Document} document
 * @returns {!Function}
 */
export function parseMutation(mutation, document) {

  const mutationRecord = assertMutationRecord_(mutation);

  setSelectorToElement_('target', mutationRecord, document);

  // TODO (torch2424): Remove this NOOP after reviews
  // This is done to allow for small PRS
  const noopFunction = () => {};

  if (mutationRecord['type'] === 'attributes') {
    // NOOP for small PRs
    return noopFunction;
  } else if (mutationRecord['type'] === 'characterData') {
    // NOOP for small PRs
    return noopFunction;
  } else if (mutationRecord['type'] === 'childList') {
    // NOOP for small PRs
    return noopFunction;
  }
}

/**
 * Function to validate that the mutation
 * is a mutation record.
 * @param {!JsonObject} mutation
 * @return {!Object}
 */
function assertMutationRecord_(mutation) {

  // Assert that the mutation is an object
  userAssert(
    isObject(mutation),
    `Mutation ${JSON.stringify(mutation)} must be an object.`);

  // Assert the mutation type
  userAssert(
    mutation['type'] !== undefined &&
    typeof mutation['type'] === 'string',
    `Mutation ${JSON.stringify(mutation)} must have a type.`);

  // Assert the mutation type is one of the following keys
  const mutationTypes = [
    'attributes',
    'characterData',
    'childList'
  ];
  userAssert(
    mutationTypes.indexOf(mutation['type']) >= 0,
    `Mutation ${JSON.stringify(mutation)} must have a type.`);

  // Assert the mutation target
  userAssert(
    mutation['target'] !== undefined &&
    typeof mutation['target'] === 'string',
    `Mutation ${JSON.stringify(mutation)} must have a target.`);

  return mutation;
}

/**
 * Function to set the target element from the
 * target selector to the target selector key,
 * and assert that we found the element.
 * @param {!Object} mutationRecord
 * @param {!String} selectorKey
 * @param {!Document} document
 * @param
 */
function setSelectorToElement_(selectorKey, mutationRecord, document) {
  const targetElement = document.querySelector(mutationRecord[selectorKey]);

  userAssert(
    targetElement !== null,
    'No element on the document matches the selector, ' +
    `${mutationRecord[selectorKey]} .`);

  mutationRecord[selectorKey] = targetElement;
}
