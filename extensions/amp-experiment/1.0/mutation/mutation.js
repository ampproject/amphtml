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

import {userAssert} from '../../../../src/log';

/**
 * Interface for amp-experiment mutations.
 * Mutation should be implemented
 * by all amp-experiment mutation types.
 *
 * @interface
 */
export class Mutation {
  /**
   * Called to parse and validate the value of a mutation
   * @return {boolean}
   */
  parseAndValidate() {}

  /**
   * Called to apply the changes to the selected
   * element(s)
   */
  mutate() {}

  /**
   * Called to return a string representation of
   * the mutation for logging purposes.
   *
   * @return {string}
   */
  toString() {
    return '';
  }
}

/**

 * Function to assert the format for attribute
 * mutations.
 * @param {!JsonObject} mutationRecord
 */
export function assertAttributeMutationFormat(mutationRecord) {
  const stringifiedMutation = JSON.stringify(mutationRecord);

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
 * @param {!JsonObject} mutationRecord
 */
export function assertCharacterDataMutationFormat(mutationRecord) {
  const stringifiedMutation = JSON.stringify(mutationRecord);

  // Assert the mutation value
  userAssert(
    mutationRecord['value'] !== undefined &&
      typeof mutationRecord['value'] === 'string',
    'Mutation %s must have a value.',
    stringifiedMutation
  );
}
