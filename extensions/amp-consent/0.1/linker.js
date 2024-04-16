import {
  base64UrlDecodeFromString,
  base64UrlEncodeFromString,
} from '#core/types/string/base64';
import {WindowInterface} from '#core/window/interface';

import {user} from '#utils/log';

import {crc32} from './crc32';

/** @const {string} */
const DELIMITER = '*';
const KEY_VALIDATOR = /^[a-zA-Z0-9\-_.]+$/;
const CHECKSUM_OFFSET_MAX_MIN = 1;
const VALID_VERSION = 1;
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
 * Return the key value pairs
 * @param {string} value
 * @return {?{[key: string]: string}}
 */
export function parseLinker(value) {
  const linkerObj = parseLinkerParamValue(value);
  if (!linkerObj) {
    return null;
  }
  const {checksum, serializedIds} = linkerObj;
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
  const parts = value.split(DELIMITER);
  const isEven = parts.length % 2 == 0;

  if (parts.length < 4 || !isEven) {
    // Format <version>*<checksum>*<key1>*<value1>
    // Note: linker makes sure there's at least one pair of non empty key value
    // Make sure there is at least three delimiters.
    user().error(TAG, `Invalid linker_param value ${value}`);
    return null;
  }

  const version = Number(parts.shift());
  if (version !== VALID_VERSION) {
    user().error(TAG, `Invalid version number ${version}`);
    return null;
  }

  const checksum = parts.shift();
  const serializedIds = parts.join(DELIMITER);
  return {
    checksum,
    serializedIds,
  };
}

/**
 * Check if the checksum is valid with time offset tolerance.
 * @param {string} serializedIds
 * @param {string} checksum
 * @return {boolean}
 */
function isCheckSumValid(serializedIds, checksum) {
  for (let i = 0; i <= CHECKSUM_OFFSET_MAX_MIN; i++) {
    const calculateCheckSum = getCheckSum(serializedIds, i);
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
  const fingerprint = getFingerprint();
  const offset = opt_offsetMin || 0;
  const timestamp = getMinSinceEpoch() - offset;
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
  return [WindowInterface.getUserAgent(window), timezone, language].join(
    DELIMITER
  );
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
    .filter((key) => {
      const valid = KEY_VALIDATOR.test(key);
      if (!valid) {
        user().error(TAG, 'Invalid linker key: ' + key);
      }
      return valid;
    })
    .map((key) => key + DELIMITER + encode(pairs[key]))
    .join(DELIMITER);
}

/**
 * Deserialize the serializedIds and return keyValue pairs.
 * @param {string} serializedIds
 * @return {!{[key: string]: string}}
 */
function deserialize(serializedIds) {
  const keyValuePairs = {};
  const params = serializedIds.split(DELIMITER);
  for (let i = 0; i < params.length; i += 2) {
    const key = params[i];
    const valid = KEY_VALIDATOR.test(key);
    if (!valid) {
      user().error(TAG, `Invalid linker key ${key}, value ignored`);
      continue;
    }
    const value = decode(params[i + 1]);
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
