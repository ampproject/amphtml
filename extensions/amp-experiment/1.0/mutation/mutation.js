import {userAssert} from '#utils/log';

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
