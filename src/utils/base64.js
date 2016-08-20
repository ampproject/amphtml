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

import {stringToBytes, bytesToString} from './bytes';

/**
 * Character mapping from base64url to base64.
 * @const {!Object<string, string>}
 */
const base64UrlDecodeSubs = {'-': '+', '_': '/', '.': '='};

/**
 * Character mapping from base64 to base64url.
 * @const {!Object<string, string>}
 */
const base64UrlEncodeSubs = {'+': '-', '/': '_', '=': '.'};

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
  return atob(str.replace(/[-_.]/g, ch => base64UrlDecodeSubs[ch]));
}

/**
 * Converts a string which is in base64url encoding into a Uint8Array
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
 * Converts a string which is in base64 encoding into a Uint8Array
 * containing the decoded value.
 * @param {string} str
 * @return {!Uint8Array}
 */
export function base64DecodeToBytes(str) {
  return stringToBytes(base64Decode(str));
}

/**
 * Converts a string into base64url encoded string.
 * base64url is defined in RFC 4648. It is sometimes referred to as "web safe".
 * @param {string} str
 * @return {string}
 */
export function base64UrlEncode(str) {
  return btoa(str).replace(/[+/=]/g, ch => base64UrlEncodeSubs[ch]);
}

/**
 * Converts a bytes array into base64url encoded string.
 * base64url is defined in RFC 4648. It is sometimes referred to as "web safe".
 * @param {!Uint8Array} bytes
 * @return {string}
 */
export function base64UrlEncodeFromBytes(bytes) {
  return base64UrlEncode(bytesToString(bytes));
}

/**
 * Converts a string into base64 encoded string.
 * @param {string} str
 * @return {string}
 */
export function base64Encode(str) {
  return btoa(str);
}

/**
 * Converts a bytes array into base64 encoded string.
 * @param {!Uint8Array} bytes
 * @return {string}
 */
export function base64EncodeFromBytes(bytes) {
  return base64Encode(bytesToString(bytes));
}
