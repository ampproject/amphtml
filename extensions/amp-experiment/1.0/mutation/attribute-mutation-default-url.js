import {map} from '#core/types/object';

import {user} from '#utils/log';

import {assertAttributeMutationFormat} from './mutation';

import {assertHttpsUrl} from '../../../../src/url';

const TAG = 'amp-experiment attribute-mutation-default-url';

const SUPPORTED_TAG_NAMES = ['AMP-IMG', 'AMP-IFRAME', 'A'];

/**
 * Mutation for attribute (url) mutations, for both
 * the 'href' and 'src' attributes,
 * on unspecifed elements.
 *
 * @implements {./mutation.Mutation}
 */
export class AttributeMutationDefaultUrl {
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
    for (let i = 0; i < this.elements_.length; i++) {
      const element = this.elements_[i];
      if (SUPPORTED_TAG_NAMES.indexOf(element.tagName) < 0) {
        return false;
      }
    }

    try {
      assertHttpsUrl(
        this.mutationRecord_['value'],
        this.mutationRecord_['target'],
        'attributes mutation'
      );
    } catch (e) {
      user().error(TAG, e.message);
      return false;
    }
    return true;
  }

  /** @override */
  mutate() {
    this.elements_.forEach((element) => {
      // name can be href or src
      const name = this.mutationRecord_['attributeName'];
      const value = this.mutationRecord_['value'];
      element.setAttribute(name, value);

      // Ask AMP element to handle mutations
      if (typeof element.mutatedAttributesCallback === 'function') {
        const mutations = map();
        mutations[name] = value;
        element.mutatedAttributesCallback(mutations);
      }
    });
  }

  /** @override */
  toString() {
    return JSON.stringify(this.mutationRecord_);
  }
}
