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


import {dev} from '../log';


/**
 * Converts a string which holds 8-bit code points, such as the result of atob,
 * into an ArrayBuffer with the corresponding bytes.
 * @param {string} str
 * @return {!Uint8Array}
 */
export function stringToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    dev().assert(charCode <= 255, 'Characters must be in range [0,255]');
    bytes[i] = charCode;
  }
  return bytes;
};


/**
 * Character mapping from base64url to base64.
 * @const {!Object<string, string>}
 */
const base64UrlSubs = {'-': '+', '_': '/', '.': '='};

/**
 * Converts a string which is in base64url encoding into the decoded string.
 * base64url is defined in RFC 4648. It is sometimes referred to as "web safe".
 * Note that atob seems to accept input either with or without padding, so this
 * routine will also.
 * Note that the way this is currently implemented, it will also accept regular
 * base64 input. But that is not part of the contract, so do not count on it
 * being true in the future.
 * @param {string} str
 * @return {string}
 */
export function base64UrlDecode(str) {
  return atob(str.replace(/[-_.]/g, ch => base64UrlSubs[ch]));
}

/**
 * Converts a string which is in base64url encoding into an ArrayBuffer
 * containing the decoded value.
 * @param {string} str
 * @return {!Uint8Array}
 */
export function base64UrlDecodeToBytes(str) {
  return stringToBytes(base64UrlDecode(str));
}

/**
 * Converts a string which is in base64 encoding into the decoded string.
 * base64 is defined in RFC 4648.
 * Note that atob seems to accept input either with or without padding, so this
 * routine will also.
 * @param {string} str
 * @return {string}
 */
export function base64Decode(str) {
  return atob(str);
}

/**
 * Converts a string which is in base64url encoding into an ArrayBuffer
 * containing the decoded value.
 * @param {string} str
 * @return {!Uint8Array}
 */
export function base64DecodeToBytes(str) {
  return stringToBytes(base64Decode(str));
}


/**
 * Converts a text in PEM format into a binary array buffer.
 * @param {string} pem
 * @return {!Uint8Array}
 * @visibleForTesting
 */
export function pemToBytes(pem) {
  pem = pem.trim();

  // Remove pem prefix, e.g. "----BEGIN PUBLIC KEY----".
  pem = pem.replace(/^\-+BEGIN[^-]*\-+/, '');

  // Remove pem suffix, e.g. "----END PUBLIC KEY----".
  pem = pem.replace(/\-+END[^-]*\-+$/, '');

  // Remove line breaks.
  pem = pem.replace(/[\r\n]/g, '').trim();

  return base64DecodeToBytes(pem);
}
