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

import { utf8Encode } from "../../../src/core/types/string/bytes";

/**
 * Standard key for CRC32
 * https://en.wikipedia.org/wiki/Cyclic_redundancy_check#Polynomial_representations_of_cyclic_redundancy_checks
 * @const {number}
 */
var CRC32_KEY = 0xedb88320;

/** @private {?Array<number>} */
var crcTable = null;

/**
 * Returns CRC32 checksum for provided string.
 * @param {string} str
 * @return {number}
 */
export function crc32(str) {
  if (!crcTable) {
    crcTable = makeCrcTable();
  }

  var bytes = utf8Encode(str);

  // Shrink to 32 bits.
  var crc = -1 >>> 0;
  for (var i = 0; i < bytes.length; i++) {
    var lookupIndex = (crc ^ bytes[i]) & 0xff;
    crc = (crc >>> 8) ^ crcTable[lookupIndex];
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Generates CRC lookup table.
 * @return {!Array<number>}
 */
function makeCrcTable() {
  var crcTable = new Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) {
      if (c & 1) {
        c = (c >>> 1) ^ CRC32_KEY;
      } else {
        c = c >>> 1;
      }
    }
    crcTable[i] = c;
  }
  return crcTable;
}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/crc32.js