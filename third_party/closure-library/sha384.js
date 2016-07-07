/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

goog.require('goog.crypt.Sha384');
goog.require('goog.crypt.base64');

/**
 * @param {!Uint8Array|string} input The value to hash.
 * @return {!Array.<number>} Web safe base64 of the digest of the input string.
 */
var digest = function(input) {
  var sha384 = new goog.crypt.Sha384();
  sha384.update(input);
  return sha384.digest();
}

/**
 * @param {!Uint8Array} input The value to hash.
 * @return {string} Web safe base64 of the digest of the input string.
 */
var base64 = function(input) {
  return goog.crypt.base64.encodeByteArray(input, /* websafe */ true);
}

goog.exportSymbol('ampBase64', base64, window);
goog.exportSymbol('ampSha384Digest', digest, window);
