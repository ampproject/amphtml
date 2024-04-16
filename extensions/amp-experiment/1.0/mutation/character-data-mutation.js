import {assertCharacterDataMutationFormat} from './mutation';

/**
 * Mutation for characterData (textContent) mutations
 *
 * @implements {./mutation.Mutation}
 */
export class CharacterDataMutation {
  /**
   * @param {!JsonObject} mutationRecord
   * @param {!Array<Element>} elements
   */
  constructor(mutationRecord, elements) {
    this.mutationRecord_ = mutationRecord;
    this.elements_ = elements;
    assertCharacterDataMutationFormat(this.mutationRecord_);
  }

  /** @override */
  parseAndValidate() {
    return true;
  }

  /** @override */
  mutate() {
    this.elements_.forEach((element) => {
      element.textContent = this.mutationRecord_['value'];
    });
  }

  /** @override */
  toString() {
    return JSON.stringify(this.mutationRecord_);
  }
}
