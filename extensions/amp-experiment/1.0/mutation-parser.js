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
  getAllowedAttributeMutation,
} from './attribute-allow-list/attribute-allow-list';
import {isObject} from '../../../src/types';
import {user, userAssert} from '../../../src/log';

const TAG = 'amp-experiment mutation-parser';

/**
 * Types of possibile mutations
 * from the WorkerDOM MutationRecord.
 * This is the value set to the 'type' key.
 */
const MUTATION_TYPES = ['attributes', 'characterData', 'childList'];

/**
 * Function to find all selectors of the mutation
 * and return a function to apply the identified
 * MutationRecord
 * @param {!JsonObject} mutation
 * @param {!Document} document
 * @return {!Function}
 */
export function parseMutation(mutation, document) {
  const mutationRecord = assertMutationRecord(mutation);

  const stringifiedMutation = JSON.stringify(mutation);

  setSelectorToElement('target', mutationRecord, document);

  if (mutationRecord['type'] === 'attributes') {
    assertAttributeMutation(mutationRecord, stringifiedMutation);

    return getAllowedAttributeMutation(
        mutationRecord,
        stringifiedMutation
    );

  } else if (mutationRecord['type'] === 'characterData') {
    assertCharacterDataMutation(mutationRecord, stringifiedMutation);

    return () => {
      mutationRecord['targetElement'].textContent = mutationRecord['value'];
    };
  } else {
    // childList type of mutation

    user().error(
      TAG,
      'childList mutations not supported in the current experiment state.'
    );

    // TODO (torch2424): Remove this NOOP after reviews
    // This is done to allow for small(er) PRS
    return () => {};
  }
}

/**
 * Function to validate that the mutation
 * is a mutation record.
 * @param {!JsonObject} mutation
 * @return {!Object}
 */
function assertMutationRecord(mutation) {
  // Assert that the mutation is an object
  userAssert(
    isObject(mutation),
    'Mutation %s must be an object.',
    JSON.stringify(mutation)
  );

  // Assert the mutation type
  userAssert(
    mutation['type'] !== undefined && typeof mutation['type'] === 'string',
    'Mutation %s must have a type.',
    JSON.stringify(mutation)
  );

  // Assert the mutation type is one of the following keys
  userAssert(
      MUTATION_TYPES.indexOf(mutation['type']) >= 0,
      'Mutation %s must have a valid type.',
      JSON.stringify(mutation)
  );

  // Assert the mutation target
  userAssert(
    mutation['target'] !== undefined && typeof mutation['target'] === 'string',
    'Mutation %s must have a target.',
    JSON.stringify(mutation)
  );

  return mutation;
}

/**
 * Function to set the target element from the
 * target selector to the target selector key,
 * and assert that we found the element.
 * @param {string} selectorKey
 * @param {!Object} mutationRecord
 * @param {!Document} document
 */
function setSelectorToElement(selectorKey, mutationRecord, document) {
  const targetElement = document.querySelector(mutationRecord[selectorKey]);

  userAssert(
    targetElement !== null,
    'No element on the document matches the selector, %s .',
    mutationRecord[selectorKey]
  );

  mutationRecord[selectorKey + 'Element'] = targetElement;
}

/**
 * Function to assert allowing setting the textContent
 * of a node.
 * @param {!Object} mutationRecord
 * @param {string} stringifiedMutation
 */
function assertAttributeMutation(mutationRecord, stringifiedMutation) {
  // Assert the mutation value
  userAssert(
    mutationRecord['value'] !== undefined &&
      typeof mutationRecord['value'] === 'string',
    'Mutation %s must have a value.',
    stringifiedMutation
  );

  // Assert mutation attributeName
  userAssert(
    mutationRecord['attributeName'] !== undefined &&
      typeof mutationRecord['attributeName'] === 'string',
    'Mutation %s must have a attributeName.',
    stringifiedMutation
  );
}

/**
 * Function to assert allowing setting the textContent
 * of a node.
 * @param {!Object} mutationRecord
 * @param {string} stringifiedMutation
 */
function assertCharacterDataMutation(mutationRecord, stringifiedMutation) {
  // Assert the mutation value
  userAssert(
    mutationRecord['value'] !== undefined &&
      typeof mutationRecord['value'] === 'string',
    'Mutation %s must have a value.',
    stringifiedMutation
  );
}
