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

import {JwtHelper} from '../jwt';
import {pemToBytes} from '../../../../src/utils/pem';
import * as sinon from 'sinon';


describe('JwtHelper', () => {

  const TOKEN_HEADER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const TOKEN_PAYLOAD =
      'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9';
  const TOKEN_SIG = 'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
  const TOKEN = `${TOKEN_HEADER}.${TOKEN_PAYLOAD}.${TOKEN_SIG}`;

  let sandbox;
  let helper;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    helper = new JwtHelper(window);
  });

  afterEach(() => {
    sandbox.restore();
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
        'name': 'John Doe',
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

  describe('decodeAndVerify with subtle', () => {
    /* Token is:
     * - header: {"alg": "RS256", "typ": "JWT"}
     * - payload: {"sub": "1234567890", "name": "John Do", "admin": true}
     */
    const SIG = 'NuE6WH4kIS77Bd6kK8R1mj2aZYpM0mTo-ZnH1UkYeyhTYRNvcIVy' +
        'SFNYH0jQnyREG3CRpsRCYRr9X4Q1Mnzm1Xnx_0saPSV02CTiLjmHX340p9m' +
        'KRCeOHkwytP-da-wXv2KKsEWTHM0RJET3GgHHm7zFCPHF89dmoBXeCz33iFY';
    const TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
        + '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG8iLCJhZG1pbiI6dHJ1ZX0'
        + '.' + SIG;
    const PEM = '-----BEGIN PUBLIC KEY-----\n'
        + 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd\n'
        + 'UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs\n'
        + 'HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D\n'
        + 'o2kQ+X5xK9cipRgEKwIDAQAB\n'
        + '-----END PUBLIC KEY-----';
    const PEM_URL = 'https://pub.com/key.pem';

    let xhrMock;

    beforeEach(() => {
      xhrMock = sandbox.mock(helper.xhr_);
    });

    afterEach(() => {
      xhrMock.verify();
    });

    it('should decode and verify token correctly', () => {
      // Skip on non-subtle browser.
      if (!helper.isVerificationSupported()) {
        return;
      }

      xhrMock.expects('fetchText')
          .withExactArgs(PEM_URL)
          .returns(Promise.resolve(PEM))
          .once();

      return helper.decodeAndVerify(TOKEN, PEM_URL).then(tok => {
        expect(tok['name']).to.equal('John Do');
      });
    });

    it('should fail invalid signature', () => {
      // Skip on non-subtle browser.
      if (!helper.isVerificationSupported()) {
        return;
      }

      const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
          + '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG8iLCJhZG1pbiI6MH0'
          + '.' + SIG;

      xhrMock.expects('fetchText')
          .withExactArgs(PEM_URL)
          .returns(Promise.resolve(PEM))
          .once();

      return helper.decodeAndVerify(token, PEM_URL).then(() => {
        throw new Error('must have failed');
      }, error => {
        // Expected.
        expect(error.message).to.match(/Signature verification failed/);
      });
    });
  });

  describe('decodeAndVerify with mock subtle', () => {
    const SIG = 'NuE6WH4kIS77Bd6kK8R1mj2aZYpM0mTo-ZnH1UkYeyhTYRNvcIVy' +
        'SFNYH0jQnyREG3CRpsRCYRr9X4Q1Mnzm1Xnx_0saPSV02CTiLjmHX340p9m' +
        'KRCeOHkwytP-da-wXv2KKsEWTHM0RJET3GgHHm7zFCPHF89dmoBXeCz33iFY';
    const TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
        + '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG8iLCJhZG1pbiI6dHJ1ZX0'
        + '.' + SIG;
    const PEM_URL = 'https://pub.com/key.pem';
    const PEM = '-----BEGIN PUBLIC KEY-----\n'
        + 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd\n'
        + 'UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs\n'
        + 'HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D\n'
        + 'o2kQ+X5xK9cipRgEKwIDAQAB\n'
        + '-----END PUBLIC KEY-----';

    let windowApi;
    let subtleMock;
    let xhrMock;
    let helper;

    beforeEach(() => {
      const subtle = {
        importKey: () => {},
        verify: () => {},
      };
      subtleMock = sandbox.mock(subtle);

      const xhr = {
        fetchText: () => {},
      };
      xhrMock = sandbox.mock(xhr);

      windowApi = {
        crypto: {subtle},
        services: {
          'xhr': {obj: xhr},
        },
      };
      helper = new JwtHelper(windowApi);
    });

    afterEach(() => {
      xhrMock.verify();
      subtleMock.verify();
    });

    it('should fail invalid token', () => {
      return helper.decodeAndVerify('a.b', PEM_URL).then(() => {
        throw new Error('Must have failed');
      }, error => {
        expect(error.message).to.match(/Invalid token/);
      });
    });

    it('should fail without alg', () => {
      const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiIifQ.e30.X';
      return helper.decodeAndVerify(token, PEM_URL).then(() => {
        throw new Error('Must have failed');
      }, error => {
        expect(error.message).to.match(/Only alg=RS256 is supported/);
      });
    });

    it('should fail with wrong alg', () => {
      // HS256 used instead of RS256.
      const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.X';
      return helper.decodeAndVerify(token, PEM_URL).then(() => {
        throw new Error('Must have failed');
      }, error => {
        expect(error.message).to.match(/Only alg=RS256 is supported/);
      });
    });

    it('should fetch they key and verify', () => {
      xhrMock.expects('fetchText')
          .withExactArgs(PEM_URL)
          .returns(Promise.resolve(PEM))
          .once();
      const key = 'KEY';
      subtleMock.expects('importKey')
        .withExactArgs(
          /* format */ 'spki',
          pemToBytes(PEM),
          {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
          /* extractable */ false,
          /* uses */ ['verify']
        )
        .returns(Promise.resolve(key))
        .once();
      subtleMock.expects('verify')
        .withExactArgs(
          {name: 'RSASSA-PKCS1-v1_5'},
          key,
          /* sig */ sinon.match(() => true),
          /* verifiable */ sinon.match(() => true)
        )
        .returns(Promise.resolve(true))
        .once();
      return helper.decodeAndVerify(TOKEN, PEM_URL).then(tok => {
        expect(tok['name']).to.equal('John Do');
      });
    });
  });
});
