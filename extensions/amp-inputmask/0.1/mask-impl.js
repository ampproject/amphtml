/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  MASK_SEPARATOR_CHAR,
  MaskChars,
  NamedMasks,
} from './constants';
import {MaskInterface} from './mask-interface';
import {
  factory as inputmaskDependencyFactory,
} from '../../../third_party/inputmask/inputmask.dependencyLib';
import {
  factory as inputmaskFactory,
} from '../../../third_party/inputmask/inputmask';

const NamedMasksToInputmask = {
  [NamedMasks.EMAIL]: 'email',
  [NamedMasks.PHONE]: 'phone',
  [NamedMasks.PHONE_US]: 'phone-us',
  [NamedMasks.DATE_INTL]: 'dd/mm/yyyy',
  [NamedMasks.DATE_US]: 'mm/dd/yyyy',
  [NamedMasks.DATE_ISO]: 'yyyy-mm-dd',
};

const MaskCharsToInputmask = {
  [MaskChars.ALPHANUMERIC_REQUIRED]: '*',
  [MaskChars.ALPHANUMERIC_OPTIONAL]: '[*]',
  [MaskChars.ALPHABETIC_REQUIRED]: 'a',
  [MaskChars.ALPHABETIC_OPTIONAL]: '[a]',
  [MaskChars.ARBITRARY_REQUIRED]: '?',
  [MaskChars.ARBITRARY_OPTIONAL]: '[?]',
  [MaskChars.NUMERIC_REQUIRED]: '9',
  [MaskChars.NUMERIC_OPTIONAL]: '[9]',
  [MaskChars.ESCAPE]: '\\',
};

let InputmaskDependencyLib;
let Inputmask;

/**
 * TODO(cvializ): allow masks to be passed as data
 * @implements {MaskInterface}
 */
export class Mask {
  /**
   * Configure and initialize the Inputmask library.
   * @param {!Element} element
   * @param {string} mask
   */
  constructor(element, mask) {
    const doc = element.ownerDocument;
    const win = element.ownerDocument.defaultView;

    InputmaskDependencyLib = InputmaskDependencyLib ||
        inputmaskDependencyFactory(win, doc);
    Inputmask = Inputmask || inputmaskFactory(
        InputmaskDependencyLib, win, doc, undefined);

    Inputmask.extendDefaults({
      supportsInputType: [
        'text',
        'tel',
        'search',
        // 'password', // use-case?
        // 'email', // doesn't support setSelectionRange. workaround?
      ],
    });

    this.element_ = element;

    const config = {
      placeholder: '\u2000',
      showMaskOnHover: false,
      showMaskOnFocus: false,
      noValuePatching: true,
    };

    if (NamedMasksToInputmask[mask]) {
      config.alias = NamedMasksToInputmask[mask];
    } else {
      config.mask = () => mask
          .split(MASK_SEPARATOR_CHAR)
          .map(m => m.replace(/_/g, ' '))
          .map(m => m
              .split('')
              .map(c => MaskCharsToInputmask[c] || c).join(''));
    }

    this.controller_ = Inputmask(config);
  }

  /** @override */
  mask() {
    this.controller_.mask(this.element_);
  }

  /** @override */
  getValue() {
    return this.element_.value;
  }

  /** @override */
  getUnmaskedValue() {
    const {value} = this.element_;
    return getAlphaNumeric(value);
  }

  /** @override */
  remove() {
    this.controller_.remove();
    this.controller_ = null;
  }
}

// TODO(cvializ): improve for unicode etc.
const NONALPHANUMERIC_REGEXP = /[^A-Za-z0-9]/g;

/**
 * Removes special characters from the provided string.
 * @param {string} value
 */
function getAlphaNumeric(value) {
  return value.replace(NONALPHANUMERIC_REGEXP, '');
}
