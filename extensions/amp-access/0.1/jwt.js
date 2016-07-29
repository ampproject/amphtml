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
 * @typedef {
 *   header: !JSONObject,
 *   payload: !JSONObject,
 *   verifiable: string,
 *   sig: string,
 * }
 */
let JwtTokenInternalDef;


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
    const invalidTok = invalidToken.bind(null, encodedToken);

    // Encoded token has three parts: header.payload.sig
    const parts = encodedToken.split('.');
    if (parts.length != 3) {
      invalidTok();
    }
    return {
      header: tryParseJson(atob(parts[0]), invalidTok),
      payload: tryParseJson(atob(parts[1]), invalidTok),
      verifiable: `${parts[0]}.${parts[1]}`,
      sig: atob(parts[2]),
    };
  }
}


/**
 * @param {string} encodedToken
 * @throws {Error}
 */
function invalidToken(encodedToken) {
  throw new Error(`Invalid token: "${encodedToken}"`);
}
