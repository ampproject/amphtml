import {isObject} from '#core/types';
import {toArray} from '#core/types/array';

import {userAssert} from '#utils/log';

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
