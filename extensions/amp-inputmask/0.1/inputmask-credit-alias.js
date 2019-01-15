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

/**
 * Installs an alias used to mask credit cards and enable digit chunking.
 * https://github.com/RobinHerbots/Inputmask/issues/525
 * @param {!Object} Inputmask
 */
export function factory(Inputmask) {
  // TODO(cvializ): Improve card chunking support
  // https://baymard.com/checkout-usability/credit-card-patterns
  Inputmask.extendDefinitions({
    // TODO(cvializ): escape these definitions or make them local to the alias.
    // matches 37 and 34, amex prefixes
    '♤': {
      'validator': function(chrs, buffer) {
        const val = buffer.buffer.join('') + chrs;
        const valExp2 = /3(4|7)/;
        const regextest = valExp2.test(val);
        return regextest;
      },
      'cardinality': 2,
    },
    // matches two-digit number except 34 and 37
    '♢': {
      'validator': function(chrs, buffer) {
        const val = buffer.buffer.join('') + chrs;
        const valExp2 = new RegExp('\\d\\d');
        const regextest = valExp2.test(val);
        return regextest && val != '34' && val != '37';
      },
      'cardinality': 2,
    },
  });

  Inputmask.extendAliases({
    'credit': {
      mask: ['♢99 9999 9999 9999', '♤99 999999 99999'],
    },
  });
}
