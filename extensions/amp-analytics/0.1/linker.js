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

import {WindowInterface} from '../../../src/window-interface';
import {crc32} from './crc32';

/** @const {string} */
const DELIMITER = '~';

/**
 * Creates the linker param from the given config, and returns the url with
 * the given param attached.
 * @param {string} version
 * @param {Object<string,string>} pairs
 * @return {string}
 */
export function createLinker(version, pairs) {
  if (!pairs || !Object.keys(pairs).length) {
    return '';
  }

  return generateParam(version, pairs);
}


/**
 * Generate the completed querystring.
 * <paramName>=<version>~<checksum>~<key1>~<value1>~<key2>~<value2>...
 * @param {string} version
 * @param {Object<string, string>} pairs
 * @return {string}
 */
function generateParam(version, pairs) {
  const encodedPairs = encodePairs(pairs);
  const checksum = getCheckSum(encodedPairs);
  return [version, checksum, encodedPairs].join(DELIMITER);
}


/**
 * Create a unique checksum hashing the fingerprint and a few other values.
 * base36(CRC32(fingerprint + timestampRoundedInMin + kv pairs))
 * @param {Object<string, string>} encodedPairs
 * @return {string}
 */
function getCheckSum(encodedPairs) {
  const fingerprint = getFingerprint();
  const timestamp = getMinSinceEpoch();
  const crc = crc32([fingerprint, timestamp, encodedPairs].join(DELIMITER));
  // Encoded to base36 for less bytes.
  return crc.toString(36);
}


/**
 * Generates a semi-unique value for page visitor.
 * User Agent + ~ + timezone + ~ + language.
 * @return {string}
 */
function getFingerprint() {
  const date = new Date();
  const timezone = date.getTimezoneOffset();

  const language = WindowInterface.getUserLanguage(window);
  return [WindowInterface.getUserAgent(window), timezone, language]
      .join(DELIMITER);
}


/**
 * Encode all values & join them together
 * @param {Object<string, string>} pairs
 * @return {string}
 */
function encodePairs(pairs) {
  const keys = Object.keys(pairs);

  return keys
      .map(key => encode(key) + DELIMITER + encode(pairs[key]))
      .join(DELIMITER);
}


/**
 * Rounded time used to check if t2 - t1 is within our time tolerance.
 * @return {number}
 */
function getMinSinceEpoch() {
  // Timestamp in minutes, floored.
  return Math.floor(Date.now() / 60000);
}


/**
 * Function that encodesURIComponent but also tilde, since we are using it as
 * our delimiter.
 * @param {string} value
 */
function encode(value) {
  return encodeURIComponent(String(value)).replace(/~/g, '%7E');
}
