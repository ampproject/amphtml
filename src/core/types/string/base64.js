import {bytesToString, stringToBytes, utf8Decode, utf8Encode} from './bytes';

/**
 * Character mapping from base64url to base64.
 * @type {{[key: string]: string}}
 * @const
 */
const base64UrlDecodeSubs = {'-': '+', '_': '/', '.': '='};

/**
 * Character mapping from base64 to base64url.
 * @type {{[key: string]: string}}
 * @const
 */
const base64UrlEncodeSubs = {'+': '-', '/': '_', '=': '.'};

/**
 * Converts a string which is in base64url encoding into a Uint8Array
 * containing the decoded value.
 * @param {string} str
 * @return {Uint8Array}
 */
export function base64UrlDecodeToBytes(str) {
  const encoded = atob(str.replace(/[-_.]/g, (ch) => base64UrlDecodeSubs[ch]));
  return stringToBytes(encoded);
}

/**
 * Converts a string which is in base64 encoding into a Uint8Array
 * containing the decoded value.
 * @param {string} str
 * @return {Uint8Array}
 */
export function base64DecodeToBytes(str) {
  return stringToBytes(atob(str));
}

/**
 * Converts a bytes array into base64url encoded string.
 * base64url is defined in RFC 4648. It is sometimes referred to as "web safe".
 * @param {Uint8Array} bytes
 * @return {string}
 */
export function base64UrlEncodeFromBytes(bytes) {
  const str = bytesToString(bytes);
  return btoa(str).replace(/[+/=]/g, (ch) => base64UrlEncodeSubs[ch]);
}

/**
 * Converts a string into base64url encoded string.
 * base64url is defined in RFC 4648. It is sometimes referred to as "web safe".
 * @param {string} str
 * @return {string}
 */
export function base64UrlEncodeFromString(str) {
  const bytes = utf8Encode(str);
  return base64UrlEncodeFromBytes(bytes);
}

/**
 * Decode a base64url encoded string by `base64UrlEncodeFromString`
 * @param {string} str
 * @return {string}
 */
export function base64UrlDecodeFromString(str) {
  const bytes = base64UrlDecodeToBytes(str);
  return utf8Decode(bytes);
}

/**
 * Converts a bytes array into base64 encoded string.
 * @param {Uint8Array} bytes
 * @return {string}
 */
export function base64EncodeFromBytes(bytes) {
  return btoa(bytesToString(bytes));
}
