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
import {addParamToUrl} from '../../../src/url';
import {crc32String} from './crc32';

/** @const {string} */
const DELIMITER = '~';

/** @const {number} */
const TIME_TOLERANCE = 60000; // 60 seconds.

/** @typedef {{
    url: string,
    key: string,
    version: string,
    pairs: (Object<string, string>|undefined)
  }} */
export let LinkerConfigDef;


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
   * @param {!LinkerConfigDef} config
   * @return {string}
   */
  create(config) {
    const {
      key,
      pairs,
      url,
      version,
    } = config;

    return this.resolveMacros_(pairs).then(expandedPairs => {
      const parameter = this.generateParam_(version, expandedPairs);
      return addParamToUrl(url, key, parameter);
    });
  }


  /**
   * Go through key value pairs and resolve any macros that may exist.
   * @param {(Object<string, string>|undefined)} pairs
   * @return {Promise<string>}
   */
  resolveMacros_(pairs) {
    const expandedPairs = {};
    const expansionPromises = [];

    for (const key in pairs) {
      // TODO(ccordry): change this to call new expander once fully launched.
      const promise = this.urlReplacementService_.expandStringAsync(pairs[key]);
      // Add value promises into array so that we can keep track of resolution.
      // Also add to new obj, so that we can still keep track of key-value
      // pairs.
      expansionPromises.push(promise);
      expandedPairs[key] = promise;
    }

    return Promise.all(expansionPromises).then(() => {
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
   * base64(CRC32(fingerprint + timestampRoundedInMin + kv pairs))
   * @param {?Object<string, string>} encodedPairs
   * @return {string}
   */
  getCheckSum_(encodedPairs) {
    const fingerprint = this.getFingerprint_();
    const timestamp = this.getRoundedTimestamp_();
    const goo = crc32String(fingerprint + timestamp + encodedPairs);
    return b64EncodeUnicode(goo);
  }


  /**
   * Generates a semi-unique value for page visitor.
   * User Agent + timezone + language.
   * @return {string}
   */
  getFingerprint_() {
    const date = new Date();
    const timezone = date.getTimezoneOffset();

    return navigator.userAgent + timezone + navigator.language;
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

    let result = DELIMITER;

    keys.forEach(key => {
      const encodedKey = b64EncodeUnicode(key);
      const encodedVal = b64EncodeUnicode(expandedPairs[key]);
      result += encodedKey + DELIMITER + encodedVal;
    });

    return result;
  }


  /**
   * Rounded time used to check if t2 - t1 is within our time tolerance.
   * @return {number}
   */
  getRoundedTimestamp_() {
    return Math.round(Date.now() / TIME_TOLERANCE);
  }
}


/**
 * Escape the given string with UTF-8 then base64 encode it.
 * @param {string} str
 */
function b64EncodeUnicode(str) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
      }));
}
