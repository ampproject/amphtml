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
import {RE_ALPHA} from '../constants';

const CHAR_Z_LOWER = 122;
const CHAR_Z_UPPER = 90;

/**
 * Rotate a string by 13 characters. Only applies to alphabetical characters.
 * For "good enough" obfuscation.
 *
 * @param {string} input
 * @private
 */
const rot13 = input => {
  return input.replace(RE_ALPHA, match => {
    const code = match.charCodeAt(0);

    // Get the z character code based on whether the character is
    // upper/lowercase.
    const zChar = code <= CHAR_Z_UPPER ? CHAR_Z_UPPER : CHAR_Z_LOWER;

    // Add/subtract 13 to rotate the character so it doesn't exceed the alphabet
    // bounds.
    return String.fromCharCode(zChar >= code + 13 ? code + 13 : code - 13);
  });
};

/**
 * Run rot13 on an array of strings.
 * @param {!Array<string>} input
 * @return {!Object}
 */
export const rot13Array = input => {
  return input.reduce((rot13Map, str) => {
    rot13Map[rot13(str)] = 1;
    return rot13Map;
  }, {});
};
