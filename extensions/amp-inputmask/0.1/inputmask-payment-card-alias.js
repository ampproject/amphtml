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

import {dict} from '../../../src/utils/object';

/**
 * Installs an alias used to mask credit cards and enable digit chunking.
 * https://github.com/RobinHerbots/Inputmask/issues/525
 * @param {!Object} Inputmask
 */
export function factory(Inputmask) {
  // TODO(cvializ): Improve card chunking support
  // https://baymard.com/checkout-usability/credit-card-patterns
  Inputmask.extendAliases(
    dict({
      'payment-card': {
        'postValidation': buffer => /[\s\d]+/.test(buffer.join('')),
        /** @param {!JsonObject} opts */
        'mask': function(opts) {
          opts['definitions'] = dict({
            'x': {
              'validator': function(chrs, buffer) {
                const val = buffer.buffer.join('') + chrs;
                const valExp2 = new RegExp('\\d\\d');
                const regextest = valExp2.test(val);
                return regextest && val != '34' && val != '37';
              },
              'cardinality': 2,
            },
            'y': {
              'validator': function(chrs, buffer) {
                const val = buffer.buffer.join('') + chrs;
                const valExp2 = /3(4|7)/;
                const regextest = valExp2.test(val);
                return regextest;
              },
              'cardinality': 2,
            },
          });
          return [
            'y99 999999 99999',
            'x99 9999 9999 9999',
            '9999 999999 99999',
            '9999 9999 9999 9999',
          ];
        },
      },
    })
  );
}
