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

/**
 * @fileoverview Common animations utility functions used in the amp-fx
 * presets.
 */

import {startsWith} from '../../../../src/string';
import {user} from '../../../../src/log';

/**
 * Converts the data-fade-ineasing input into the corresponding `cubic-bezier()`
 * notation.
 * @param {string} keyword to be converted.
 * @return {string} cubic-bezier() notation.
 */
export function convertEasingKeyword(keyword) {
  switch (keyword) {
    case 'linear':
      return 'cubic-bezier(0.00, 0.00, 1.00, 1.00)';
    case 'ease-in-out':
      return 'cubic-bezier(0.80, 0.00, 0.20, 1.00)';
    case 'ease-in':
      return 'cubic-bezier(0.80, 0.00, 0.60, 1.00)';
    case 'ease-out':
      return 'cubic-bezier(0.40, 0.00, 0.40, 1.00)';
    default:
      user().assert(startsWith(keyword, 'cubic-bezier'),
          'All custom bezier curves should be specified by following the ' +
            '`cubic-bezier()` function notation.');
      return keyword;
  }
}
