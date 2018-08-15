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

import {crc32} from './crc32';

/** @const {string} */
const DELIMITER = '~';

/**
 * Creates a new query string parameter to be used for cross-domain ID syncing.
 * &<paramName>=<version>~<checksum>~<key1>~<value1>~<key2>~<value2>...
 */
export class Linker {
  /**
   * Creates the linker param from the given config, and returns the url with
   * the given param attached.
   * @param {string} version
   * @param {Object<string,string>} pairs
   * @return {string}
   */
  create(version, pairs) {
    if (!pairs || !Object.keys(pairs).length) {
      return '';
    }

    return this.generateParam_(version, pairs);
  }


  /**
   * Generate the completed querystring.
   * <paramName>=<version>~<checksum>~<key1>~<value1>~<key2>~<value2>...
   * @param {string} version
   * @param {Object<string, string>} pairs
   * @return {string}
   */
  generateParam_(version, pairs) {
    const encodedPairs = this.encodePairs_(pairs);
    const checksum = this.getCheckSum_(encodedPairs);
    return version + DELIMITER + checksum + encodedPairs;
  }


  /**
   * Create a unique checksum hashing the fingerprint and a few other values.
   * base36(CRC32(fingerprint + timestampRoundedInMin + kv pairs))
   * @param {Object<string, string>} encodedPairs
   * @return {string}
   */
  getCheckSum_(encodedPairs) {
    const fingerprint = this.getFingerprint_();
    const timestamp = this.getMinSinceEpoch_();
    const crc = crc32([fingerprint, timestamp, encodedPairs].join(DELIMITER));
    // Encoded to base36 for less bytes.
    return crc.toString(36);
  }


  /**
   * Generates a semi-unique value for page visitor.
   * User Agent + ~ + timezone + ~ + language.
   * @return {string}
   */
  getFingerprint_() {
    const date = new Date();
    const timezone = date.getTimezoneOffset();

    const language = navigator.userLanguage || navigator.language;
    return navigator.userAgent + DELIMITER + timezone + DELIMITER + language;
  }


  /**
   * Encode all values & join them together. Do not encode keys.
   * @param {Object<string, string>} pairs
   * @return {string}
   */
  encodePairs_(pairs) {
    const keys = Object.keys(pairs);
    let result = '';

    keys.forEach(key => {
      result += DELIMITER + encodeURIComponent(key) + DELIMITER +
          encodeURIComponent(pairs[key]);
    });

    return result;
  }


  /**
   * Rounded time used to check if t2 - t1 is within our time tolerance.
   * @return {number}
   */
  getMinSinceEpoch_() {
    // Timestamp in minutes, floored.
    return Math.floor(Date.now() / 60000);
  }
}
