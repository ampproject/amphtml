/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

goog.require('goog.crypt');
goog.require('goog.crypt.base64');

/**
 * Base64-decode a string to an Array of numbers.
 *
 * In base-64 decoding, groups of four characters are converted into three
 * bytes.  If the encoder did not apply padding, the input length may not
 * be a multiple of 4.
 *
 * In this case, the last group will have fewer than 4 characters, and
 * padding will be inferred.  If the group has one or two characters, it decodes
 * to one byte.  If the group has three characters, it decodes to two bytes.
 *
 * @param {string} input Input to decode. Any whitespace is ignored, and the
 *     input maybe encoded with either supported alphabet (or a mix thereof).
 * @return {!Array<number>} bytes representing the decoded value.
 */
var decodeStringToByteArray = function(input) {
  return goog.crypt.base64.decodeStringToByteArray(input);
}

/**
 * Converts a hex string into an integer array.
 * @param {string} hexString Hex string of 16-bit integers (two characters
 *     per integer).
 * @return {!Array<number>} Array of {0,255} integers for the given string.
 */
var hexToByteArray = function(hexString) {
  return goog.crypt.hexToByteArray(hexString);
}

/**
 * Turns a string into an array of bytes; a "byte" being a JS number in the
 * range 0-255.
 * @param {string} str String value to arrify.
 * @return {!Array<number>} Array of numbers corresponding to the
 *     UCS character codes of each character in str.
 */
var stringToByteArray = function(str) {
  return goog.crypt.stringToByteArray(str);
}

goog.exportSymbol('decodeStringToByteArrayEx', decodeStringToByteArray, window);
goog.exportSymbol('hexToByteArrayEx', hexToByteArray, window);
goog.exportSymbol('stringToByteArrayEx', stringToByteArray, window);
