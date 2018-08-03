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


import {Services} from '../../../src/services';
import {base64UrlEncodeFromString} from '../../../src/utils/base64';
import {crc32} from './crc32';

/** @const {string} */
const DELIMITER = '~';

/**
 * Creates a new query string parameter to be used for cross-domain ID syncing.
 * &<paramName>=<version>~<checksum>~<key1>~<value1>~<key2>~<value2>...
 */
export class Linker {
  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} doc */
  constructor(doc) {
    this.urlReplacementService_ = Services.urlReplacementsForDoc(doc);
  }


  /**
   * Creates the linker param from the given config, and returns the url with
   * the given param attached.
   * @param {string} version
   * @param {Object<string,string>} pairs
   * @return {Promise<string>}
   */
  create(version, pairs) {
    return this.resolveMacros_(pairs).then(expandedPairs => {
      return this.generateParam_(version, expandedPairs);
    });
  }


  /**
   * Go through key value pairs and resolve any macros that may exist.
   * @param {Object<string,string>} pairs
   * @return {Promise<Object<string, string>>}
   */
  resolveMacros_(pairs) {
    const keys = Object.keys(pairs);
    const expansionPromises = [];

    keys.forEach(key => {
      // TODO(ccordry): change this to call new expander once fully launched.
      const promise = this.urlReplacementService_.expandStringAsync(pairs[key]);
      expansionPromises.push(promise);
    });

    return Promise.all(expansionPromises)
        .then(expandedVals => {
          // Now that we have the resolved values, reassociate them back with
          // their keys.
          const expandedPairs = {};
          keys.forEach((key, i) => {
            expandedPairs[key] = expandedVals[i];
          });
          return expandedPairs;
        });
  }


  /**
   * Generate the completed querystring.
   * <paramName>=<version>~<checksum>~<key1>~<value1>~<key2>~<value2>...
   * @param {string} version
   * @param {?Object<string, string>} expandedPairs
   * @return {string}
   */
  generateParam_(version, expandedPairs) {
    const encodedPairs = this.encodePairs_(expandedPairs);
    const checksum = this.getCheckSum_(encodedPairs);
    return version + DELIMITER + checksum + encodedPairs;
  }


  /**
   * Create a unique checksum hashing the fingerprint and a few other values.
   * base36(CRC32(fingerprint + timestampRoundedInMin + kv pairs))
   * @param {?Object<string, string>} encodedPairs
   * @return {string}
   */
  getCheckSum_(encodedPairs) {
    const fingerprint = this.getFingerprint_();
    const timestamp = this.getRoundedTimestamp_();
    const crc = crc32(fingerprint + timestamp + encodedPairs);
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
   * After macros have resolved, encode their values and join them together.
   * @param {?Object<string, string>} expandedPairs
   * @return {string}
   */
  encodePairs_(expandedPairs) {
    const keys = Object.keys(expandedPairs);
    if (!keys.length) {
      return '';
    }

    let result = '';

    keys.forEach(key => {
      const encodedVal = base64UrlEncodeFromString(expandedPairs[key]);
      result += DELIMITER + key + DELIMITER + encodedVal;
    });

    return result;
  }


  /**
   * Rounded time used to check if t2 - t1 is within our time tolerance.
   * @return {number}
   */
  getRoundedTimestamp_() {
    // Timestamp in minutes, floored.
    return Math.floor(Date.now() / 60000);
  }
}
