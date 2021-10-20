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
