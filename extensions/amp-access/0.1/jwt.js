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
      sig: decodeBase64WebSafe(parts[2]),
    };
  }
}


/**
 * @param {string} s
 * @return {string}
 */
function decodeBase64WebSafe(s) {
  // TODO(dvoytenko): refactor to a common place across AMP.
  return atob(s.replace(/[-_.]/g, unmapWebSafeChar));
}


/**
 * @param {string} c
 * @return {string}
 */
function unmapWebSafeChar(c) {
  return WEB_SAFE_CHAR_MAP[c];
}
