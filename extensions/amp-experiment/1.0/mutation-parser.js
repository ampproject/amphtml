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

import {getAllowedAttributeMutationEntry} from './attribute-allow-list/attribute-allow-list';
import {isObject, toArray} from '../../../src/types';

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
 * and return an object with the parsed mutation record
 * @param {!JsonObject} mutation
 * @param {!Document} document
 * @return {!Object}
 */
export function parseMutation(mutation, document) {
  const mutationRecord = assertMutationRecordFormat(mutation);

  const stringifiedMutation = JSON.stringify(mutation);

  setSelectorToElements(mutationRecord, document);

  mutationRecord.mutations = [];

  if (mutationRecord['type'] === 'attributes') {
    assertAttributeMutationFormat(mutationRecord, stringifiedMutation);

    mutationRecord.targetElements.forEach(element => {
      // Get the AttribeMutationEntry
      // From the Attribute allow list
      const allowedAttributeMutationEntry = getAllowedAttributeMutationEntry(
        mutationRecord,
        element,
        stringifiedMutation
      );

      // Assert the attribute mutation passes it's check
      // that is allowed and validated.
      userAssert(
        allowedAttributeMutationEntry.validate(mutationRecord, element),
        'Mutation %s has an an unsupported value for element %s.',
        stringifiedMutation,
        element
      );

      mutationRecord.mutations.push(() => {
        allowedAttributeMutationEntry.mutate(mutationRecord, element);
      });
    });
  } else if (mutationRecord['type'] === 'characterData') {
    // TODO (torch2424) #21705: When we implement the mutation record
    // interface, have our validate() noop.
    assertCharacterDataMutationFormat(mutationRecord, stringifiedMutation);

    mutationRecord.targetElements.forEach(element => {
      mutationRecord.mutations.push(() => {
        element.textContent = mutationRecord['value'];
      });
    });
  } else {
    // childList type of mutation

    user().error(
      TAG,
      'childList mutations not supported in the current experiment state.'
    );

    // TODO (torch2424): Remove this NOOP after reviews
    // This is done to allow for small(er) PRS
    mutationRecord.mutate = () => {};
  }

  return mutationRecord;
}

/**
 * Function to assert the format to ensure
 * that the mutation is a mutation record.
 * @param {!JsonObject} mutation
 * @return {!Object}
 */
function assertMutationRecordFormat(mutation) {
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

 * Function to assert the format for attribute
 * mutations.
 * @param {!Object} mutationRecord
 * @param {string} stringifiedMutation
 */
function assertAttributeMutationFormat(mutationRecord, stringifiedMutation) {
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
 * Function to assert the format for textContent
 * mutations.
 * @param {!Object} mutationRecord
 * @param {string} stringifiedMutation
 */
function assertCharacterDataMutationFormat(
  mutationRecord,
  stringifiedMutation
) {
  // Assert the mutation value
  userAssert(
    mutationRecord['value'] !== undefined &&
      typeof mutationRecord['value'] === 'string',
    'Mutation %s must have a value.',
    stringifiedMutation
  );
}

/**
 * Function to set the target element from the
 * target selector to the target selector key,
 * and assert that we found the element.
 * @param {!Object} mutationRecord
 * @param {!Document} document
 */
function setSelectorToElements(mutationRecord, document) {
  const targetElements = toArray(
    document.querySelectorAll(mutationRecord['target'])
  );

  userAssert(
    targetElements.length > 0,
    'No element on the document matches the selector, %s .',
    mutationRecord['target']
  );

  mutationRecord.targetElements = targetElements;
}
