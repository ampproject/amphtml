/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

import {JwtHelper} from '../../../src/utils/jwt';


describe('JwtHelper', () => {

  // Generated from https://jwt.io/#debugger
  // Name deliberately changed from "John Doe" to "John ௵Z加䅌ਇ☎Èʘغޝ" to test
  // correct unicode handling on our part.
  const TOKEN_HEADER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const TOKEN_PAYLOAD =
      'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4g4K-1' +
      'WuWKoOSFjOCoh-KYjsOIypjYut6dIiwiYWRtaW4iOnRydWV9';
  const TOKEN_SIG = 'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
  const TOKEN = `${TOKEN_HEADER}.${TOKEN_PAYLOAD}.${TOKEN_SIG}`;

  let helper;

  beforeEach(() => {
    helper = new JwtHelper();
  });

  describe('decode', () => {

    it('should decode fully', () => {
      const tok = helper.decodeInternal_(TOKEN);
      expect(tok.header).to.deep.equal({
        'alg': 'HS256',
        'typ': 'JWT',
      });
      expect(tok.payload).to.deep.equal({
        'sub': '1234567890',
        'name': 'John ௵Z加䅌ਇ☎Èʘغޝ',
        'admin': true,
      });
      expect(tok.verifiable).to.equal(
          TOKEN.substring(0, TOKEN.lastIndexOf('.')));
      expect(tok.sig).to.equal(
          TOKEN.substring(TOKEN.lastIndexOf('.') + 1));
    });

    it('should fail on invalid format', () => {
      expect(() => {
        helper.decodeInternal_('ABC');
      }).to.throw(/Invalid token/);
    });

    it('should fail on invalid JSON in header', () => {
      expect(() => {
        helper.decodeInternal_(
            `${TOKEN_HEADER.substring(1)}.${TOKEN_PAYLOAD}.${TOKEN_SIG}`);
      }).to.throw(/Invalid token/);
    });

    it('should fail on invalid JSON in payload', () => {
      expect(() => {
        helper.decodeInternal_(
            `${TOKEN_HEADER}.${TOKEN_PAYLOAD.substring(1)}.${TOKEN_SIG}`);
      }).to.throw(/Invalid token/);
    });

    it('should decode web safe and non-web-safe base64', () => {
      const body = `${TOKEN_HEADER}.${TOKEN_PAYLOAD}`;
      const token = helper.decodeInternal_(`${body}.eyJhbGci+/`);
      const tokenWebSafe = helper.decodeInternal_(`${body}.eyJhbGci-_`);
      expect(token.sig).to.not.equal(tokenWebSafe);
    });
  });
});
