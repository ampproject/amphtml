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
import {base64UrlEncodeFromString} from '../../../src/utils/base64';
import {crc32} from './crc32';
import {user} from '../../../src/log';

/** @const {string} */
const DELIMITER = '*';
const KEY_VALIDATOR = /^[a-zA-Z0-9\-_.]+$/;
const TAG = 'amp-analytics/linker';


/**
 * Creates the linker string, in the format of
 * <version>*<checksum>*<serializedIds>
 *
 * where
 *   checksum: base36(CRC32(<fingerprint>*<minuteSinceEpoch>*<serializedIds>))
 *   serializedIds: <id1>*<idValue1>*<id2>*<idValue2>...
 *                  values are base64 encoded
 *   fingerprint: <userAgent>*<timezoneOffset>*<userLanguage>
 *
 * @param {string} version
 * @param {!Object} ids
 * @return {string}
 */
export function createLinker(version, ids) {
  const serializedIds = serialize(ids);
  if (serializedIds === '') {
    return '';
  }
  const checksum = getCheckSum(serializedIds);
  return [version, checksum, serializedIds].join(DELIMITER);
}


/**
 * Create a unique checksum hashing the fingerprint and a few other values.
 * @param {string} serializedIds
 * @return {string}
 */
function getCheckSum(serializedIds) {
  const fingerprint = getFingerprint();
  const timestamp = getMinSinceEpoch();
  const crc = crc32([fingerprint, timestamp, serializedIds].join(DELIMITER));
  // Encoded to base36 for less bytes.
  return crc.toString(36);
}


/**
 * Generates a semi-unique value for page visitor.
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
 * @param {!Object} pairs
 * @return {string}
 */
function serialize(pairs) {
  if (!pairs) {
    return '';
  }
  return Object.keys(pairs)
      .filter(key => {
        const valid = KEY_VALIDATOR.test(key);
        if (!valid) {
          user().error(TAG, 'Invalid linker key: ' + key);
        }
        return valid;
      })
      .map(key => key + DELIMITER + encode(pairs[key]))
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
  return base64UrlEncodeFromString(String(value));
}
