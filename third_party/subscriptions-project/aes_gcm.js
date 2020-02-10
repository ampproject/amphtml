/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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

/**
 * Subtle-based AES-GCM decryption supported on all browser types.
 * Decrypts the input text using AES-GCM with the input key.
 * @param {string} key
 * @param {string} text
 * @return {!Promise}
 */
export function decryptAesGcm(key, text) {
  const keybytes = base64Decode(key);
  const isIE = !!self.msCrypto;
  const subtle = isIE ? self.msCrypto.subtle : self.crypto.subtle;
  return wrapCryptoOp(subtle.importKey('raw', keybytes.buffer,
    'AES-GCM',
    true, ['decrypt'])).
    then((formattedkey) => {
      text = text.replace(/\s+/g, '');
      const contbuff = base64Decode(text).buffer;
      const iv = contbuff.slice(0, 12);
      const bytesToDecrypt = contbuff.slice(12);
      return wrapCryptoOp(subtle
        .decrypt(
          {
            name: 'AES-GCM',
            iv: iv,
            // IE requires "tag" of length 16.
            tag: isIE ? bytesToDecrypt.slice(bytesToDecrypt.byteLength - 16) : undefined,
            // Edge requires "tagLength".
            tagLength: 128 // block size (16): 1-128
          },
          formattedkey,
          // IE requires "tag" to be removed from the bytes.
          isIE ? bytesToDecrypt.slice(0, bytesToDecrypt.byteLength - 16) : bytesToDecrypt
        ))
        .then((buffer) => {
          // 5. Decryption gives us raw bytes and we need to turn them into text.
          return utf8Decode(new Uint8Array(buffer));
        });
    });
}

/** 
 * Converts IE11 CryptoOperation type to a Promise.
 * @param {Object} op
 * @return {!Promise}
 */
function wrapCryptoOp(op) {
  if (typeof op.then == 'function') {
    return op;
  }
  return new Promise((resolve, reject) => {
    op.oncomplete = (e) => {
      resolve(op.result);
    };
    op.onerror = reject;
  });
}

/**
 * Interpret a byte array as a UTF-8 string.
 * @param {!BufferSource} bytes
 * @return {string}
 */
function utf8Decode(bytes) {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  const bytesBuffer = new Uint8Array(bytes.buffer || bytes);
  const array = new Array(bytesBuffer.length);
  for (let i = 0; i < bytesBuffer.length; i++) {
    array[i] = String.fromCharCode(bytesBuffer[i]);
  }
  const asciiString = array.join('');
  return decodeURIComponent(escape(asciiString));
}

/**
 * Converts a base64 string into a Uint8Array with the corresponding bytes.
 * @param {string} str
 * @return {!Uint8Array}
 */
function base64Decode(str) {
  const bytes = atob(str);
  const len = bytes.length;
  const array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    array[i] = bytes.charCodeAt(i);
  }
  return array;
}
