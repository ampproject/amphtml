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

import {assertAttributeMutationFormat} from './mutation';
import {assertDoesNotContainDisplay, setStyles} from '../../../../src/style';
import {dev, user} from '../../../../src/log';
import {dict, hasOwn} from '../../../../src/utils/object';
import {isAmpElement} from '../../../../src/dom';

/** @const {RegExp} */
const NON_SPACE_REGEX = /\S/;

/** @const {RegExp} */
const ALL_VALUE_REGEX = /.*/;

/** @const {Object<string, RegExp>} */
const SUPPORTED_STYLE_VALUE = {
  'color': ALL_VALUE_REGEX,
  'background-color': ALL_VALUE_REGEX,
  'visibility': /^hidden$/,
  'display': /^none$/,
  'position': /^(static|relative|absolute|initial|inherit)$/,
  'font-size': ALL_VALUE_REGEX,
  'background-image': ALL_VALUE_REGEX,
  'border-width': ALL_VALUE_REGEX,
  'border-style': ALL_VALUE_REGEX,
  'border-color': ALL_VALUE_REGEX,
};

/** @const {Object<string, RegExp>} */
const SUPPORTE_NON_AMP_STYLE_VALUE = {
  'width': ALL_VALUE_REGEX,
  'height': ALL_VALUE_REGEX,
};

/** @const {string} */
const TAG = 'amp-experiment/style';

/**
 * Mutation for attribute (style) mutations on unspecified elements.
 *
 * @implements {./mutation.Mutation}
 */
export class AttributeMutationDefaultStyle {
  /**
   * @param {!JsonObject} mutationRecord
   * @param {!Array<!Element>} elements
   */
  constructor(mutationRecord, elements) {
    /** @private {!JsonObject} */
    this.mutationRecord_ = mutationRecord;

    /** @private {!Array<Element>} */
    this.elements_ = elements;

    /** @private {!JsonObject} */
    this.styles_ = dict({});

    /** @private {boolean} */
    this.hasAmpElement_ = false;

    assertAttributeMutationFormat(this.mutationRecord_);
  }

  /** @override */
  parseAndValidate() {
    const value = this.mutationRecord_['value'];
    // First check for !important and <;
    if (value.match(/(!\s*important|<)/)) {
      return false;
    }

    // Look for AMP Elements. Different validation rules apply
    for (let i = 0; i < this.elements_.length; i++) {
      if (isAmpElement(dev().assertElement(this.elements_[i]))) {
        this.hasAmpElement_ = true;
        break;
      }
    }

    // Then seperate the style values to pairs in the format "name : value;"
    // Already guareentee that ['value'] is defined
    const pairs = value.split(';');
    for (let i = 0; i < pairs.length; i++) {
      if (!NON_SPACE_REGEX.test(pairs[i])) {
        // Note: treat empty string as valid;
        continue;
      }
      // In format of key:value
      const pair = pairs[i].split(':');
      if (pair.length != 2) {
        // more than one ":" or no ":"
        // invalid format
        return false;
      }

      const key = pair[0].trim();
      const value = pair[1].trim();
      if (!this.validateStylePair_(key, value)) {
        user().error(
          TAG,
          'Unsupported style mutation property: %s, value: %s',
          key,
          value
        );
        return false;
      }
      this.styles_[key] = value;
    }

    return true;
  }

  /** @override */
  mutate() {
    this.elements_.forEach((element) => {
      setStyles(
        dev().assertElement(element),
        assertDoesNotContainDisplay(this.styles_)
      );
    });
  }

  /**
   * Validate the style key value pair is valid
   * @param {string} key
   * @param {string} value
   * @return {boolean}
   */
  validateStylePair_(key, value) {
    if (!this.hasAmpElement_ && hasOwn(SUPPORTE_NON_AMP_STYLE_VALUE, key)) {
      if (value.match(SUPPORTE_NON_AMP_STYLE_VALUE[key])) {
        return true;
      }
    }

    if (!hasOwn(SUPPORTED_STYLE_VALUE, key)) {
      return false;
    }
    if (value.match(SUPPORTED_STYLE_VALUE[key])) {
      return true;
    }
    return false;
  }

  /** @override */
  toString() {
    return JSON.stringify(this.mutationRecord_);
  }
}
