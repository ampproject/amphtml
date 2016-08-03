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

import {tryParseJson} from '../../../src/json';
import {xhrFor} from '../../../src/xhr';


/**
 * @typedef {{
 *   header: !JSONObject,
 *   payload: !JSONObject,
 *   verifiable: string,
 *   sig: string,
 * }}
 */
let JwtTokenInternalDef;


/**
 * Maps web-safe base64 characters to the actual base64 chars for decoding.
 * @const {!Object<string, string>}
 */
const WEB_SAFE_CHAR_MAP = {'-': '+', '_': '/', '.': '='};


/**
 * Provides helper methods to decode and verify JWT tokens.
 */
export class JwtHelper {

  /**
   * @param {!Window} win
   */
  constructor(win) {

    /** @const {!Window} */
    this.win = win;

    /**
     * Might be `null` if the platform does not support Crypto Subtle.
     * @const @private {?SubtleCrypto}
     */
    this.subtle_ = win.crypto &&
        (win.crypto.subtle || win.crypto.webkitSubtle) || null;

    /** @const @private {!Xhr} */
    this.xhr_ = xhrFor(win);
  }

  /**
   * Decodes JWT token and returns its payload.
   * @param {string} encodedToken
   * @return {!JSONObject}
   */
  decode(encodedToken) {
    return this.decodeInternal_(encodedToken).payload;
  }

  /**
   * Whether the signature-verification supported on this platform.
   * @return {boolean}
   */
  isVerificationSupported() {
    return !!this.subtle_;
  }

  /**
   * Decodes HWT token and verifies its signature.
   * @param {string} encodedToken
   * @param {string} keyUrl
   * @return {!Promise<!JSONObject>}
   */
  decodeAndVerify(encodedToken, keyUrl) {
    if (!this.subtle_) {
      throw new Error('Crypto is not supported on this platform');
    }
    const decodedPromise = new Promise(
        resolve => resolve(this.decodeInternal_(encodedToken)));
    return decodedPromise.then(decoded => {
      const alg = decoded.header['alg'];
      if (!alg || alg != 'RS256') {
        // TODO(dvoytenko@): Support other RS* algos.
        throw new Error('Only alg=RS256 is supported');
      }
      return this.loadKey_(keyUrl).then(key => {
        const sig = convertStringToArrayBuffer(
            decodeBase64WebSafe(decoded.sig));
        return this.subtle_.verify(
          /* options */ {name: 'RSASSA-PKCS1-v1_5'},
          key,
          sig,
          convertStringToArrayBuffer(decoded.verifiable)
        );
      }).then(isValid => {
        if (isValid) {
          return decoded.payload;
        }
        throw new Error('Signature verification failed');
      });
    });
  }

  /**
   * @param {string} encodedToken
   * @return {!JwtTokenInternalDef}
   * @private
   */
  decodeInternal_(encodedToken) {
    // See https://jwt.io/introduction/
    function invalidToken() {
      throw new Error(`Invalid token: "${encodedToken}"`);
    }

    // Encoded token has three parts: header.payload.sig
    // Note! The padding is not allowed by JWT spec:
    // http://self-issued.info/docs/draft-goland-json-web-token-00.html#rfc.section.5
    const parts = encodedToken.split('.');
    if (parts.length != 3) {
      invalidToken();
    }
    return {
      header: tryParseJson(decodeBase64WebSafe(parts[0]), invalidToken),
      payload: tryParseJson(decodeBase64WebSafe(parts[1]), invalidToken),
      verifiable: `${parts[0]}.${parts[1]}`,
      sig: parts[2],
    };
  }

  /**
   * @param {string} keyUrl
   * @return {!Promise<!CryptoKey>}
   */
  loadKey_(keyUrl) {
    return this.xhr_.fetchText(keyUrl).then(pem => {
      return this.subtle_.importKey(
        /* format */ 'spki',
        pemToBinary(pem),
        /* algo options */ {
          name: 'RSASSA-PKCS1-v1_5',
          hash: {name: 'SHA-256'},
        },
        /* extractable */ false,
        /* uses */ ['verify']);
    });
  }
}


/**
 * @param {string} s
 * @return {string}
 */
function decodeBase64WebSafe(s) {
  // TODO(dvoytenko, #4281): refactor to a common place across AMP.
  return atob(s.replace(/[-_.]/g, unmapWebSafeChar));
}


/**
 * @param {string} c
 * @return {string}
 */
function unmapWebSafeChar(c) {
  return WEB_SAFE_CHAR_MAP[c];
}


/**
 * Convers a text in PEM format into a binary array buffer.
 * @param {string} pem
 * @return {!ArrayBuffer}
 * @visibleForTesting
 */
export function pemToBinary(pem) {
  // TODO(dvoytenko, #4281): Extract with other binary encoding utils (base 64)
  // into a separate module.
  pem = pem.trim();

  // Remove pem prefix, e.g. "----BEING PUBLIC KEY----".
  pem = pem.replace(/^\-+BEGIN[^-]*\-+/, '');

  // Remove pem suffix, e.g. "----END PUBLIC KEY----".
  pem = pem.replace(/\-+END[^-]*\-+$/, '');

  // Remove line breaks.
  pem = pem.replace(/[\r\n]/g, '').trim();

  return convertStringToArrayBuffer(atob(pem));
}


/**
 * Convers a string to an array buffer.
 * @param {string} s
 * @return {!ArrayBuffer}
 */
function convertStringToArrayBuffer(s) {
  // TODO(dvoytenko, #4281): Extract with other binary encoding utils (base 64)
  // into a separate module.
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    bytes[i] = s.charCodeAt(i);
  }
  return bytes;
}
