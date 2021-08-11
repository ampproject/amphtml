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

import { WindowInterface } from "../../../src/core/window/interface";
import {
base64UrlDecodeFromString,
base64UrlEncodeFromString } from "../../../src/core/types/string/base64";

import { crc32 } from "./crc32";
import { user } from "../../../src/log";

/** @const {string} */
var DELIMITER = '*';
var KEY_VALIDATOR = /^[a-zA-Z0-9\-_.]+$/;
var CHECKSUM_OFFSET_MAX_MIN = 1;
var VALID_VERSION = 1;
var TAG = 'amp-analytics/linker';

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
  var serializedIds = serialize(ids);
  if (serializedIds === '') {
    return '';
  }
  var checksum = getCheckSum(serializedIds);
  return [version, checksum, serializedIds].join(DELIMITER);
}

/**
 * Return the key value pairs
 * @param {string} value
 * @return {?Object<string, string>}
 */
export function parseLinker(value) {
  var linkerObj = parseLinkerParamValue(value);
  if (!linkerObj) {
    return null;
  }
  var checksum = linkerObj.checksum,serializedIds = linkerObj.serializedIds;
  if (!isCheckSumValid(serializedIds, checksum)) {
    user().error(TAG, 'LINKER_PARAM value checksum not valid');
    return null;
  }
  return deserialize(serializedIds);
}

/**
 * Parse the linker param value to version checksum and serializedParams
 * @param {string} value
 * @return {?Object}
 */
function parseLinkerParamValue(value) {
  var parts = value.split(DELIMITER);
  var isEven = parts.length % 2 == 0;

  if (parts.length < 4 || !isEven) {
    // Format <version>*<checksum>*<key1>*<value1>
    // Note: linker makes sure there's at least one pair of non empty key value
    // Make sure there is at least three delimiters.
    user().error(TAG, "Invalid linker_param value ".concat(value));
    return null;
  }

  var version = Number(parts.shift());
  if (version !== VALID_VERSION) {
    user().error(TAG, "Invalid version number ".concat(version));
    return null;
  }

  var checksum = parts.shift();
  var serializedIds = parts.join(DELIMITER);
  return {
    checksum: checksum,
    serializedIds: serializedIds };

}

/**
 * Check if the checksum is valid with time offset tolerance.
 * @param {string} serializedIds
 * @param {string} checksum
 * @return {boolean}
 */
function isCheckSumValid(serializedIds, checksum) {
  for (var i = 0; i <= CHECKSUM_OFFSET_MAX_MIN; i++) {
    var calculateCheckSum = getCheckSum(serializedIds, i);
    if (calculateCheckSum == checksum) {
      return true;
    }
  }
  return false;
}

/**
 * Create a unique checksum hashing the fingerprint and a few other values.
 * @param {string} serializedIds
 * @param {number=} opt_offsetMin
 * @return {string}
 */
function getCheckSum(serializedIds, opt_offsetMin) {
  var fingerprint = getFingerprint();
  var offset = opt_offsetMin || 0;
  var timestamp = getMinSinceEpoch() - offset;
  var crc = crc32([fingerprint, timestamp, serializedIds].join(DELIMITER));
  // Encoded to base36 for less bytes.
  return crc.toString(36);
}

/**
 * Generates a semi-unique value for page visitor.
 * @return {string}
 */
function getFingerprint() {
  var date = new Date();
  var timezone = date.getTimezoneOffset();

  var language = WindowInterface.getUserLanguage(window);
  return [WindowInterface.getUserAgent(window), timezone, language].join(
  DELIMITER);

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
  return Object.keys(pairs).
  filter(function (key) {
    var valid = KEY_VALIDATOR.test(key);
    if (!valid) {
      user().error(TAG, 'Invalid linker key: ' + key);
    }
    return valid;
  }).
  map(function (key) {return key + DELIMITER + encode(pairs[key]);}).
  join(DELIMITER);
}

/**
 * Deserialize the serializedIds and return keyValue pairs.
 * @param {string} serializedIds
 * @return {!Object<string, string>}
 */
function deserialize(serializedIds) {
  var keyValuePairs = {};
  var params = serializedIds.split(DELIMITER);
  for (var i = 0; i < params.length; i += 2) {
    var key = params[i];
    var valid = KEY_VALIDATOR.test(key);
    if (!valid) {
      user().error(TAG, "Invalid linker key ".concat(key, ", value ignored"));
      continue;
    }
    var value = decode(params[i + 1]);
    keyValuePairs[key] = value;
  }
  return keyValuePairs;
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
 * @return {*} TODO(#23582): Specify return type
 */
function encode(value) {
  return base64UrlEncodeFromString(String(value));
}

/**
 * @param {string} value
 * @return {string}
 */
function decode(value) {
  return base64UrlDecodeFromString(String(value));
}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/linker.js