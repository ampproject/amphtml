import {JwtHelper, pemToBytes} from '../jwt';

describes.sandboxed('JwtHelper', {}, (env) => {
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
    helper = new JwtHelper(window);
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
        TOKEN.substring(0, TOKEN.lastIndexOf('.'))
      );
      expect(tok.sig).to.equal(TOKEN.substring(TOKEN.lastIndexOf('.') + 1));
    });

    it('should fail on invalid format', () => {
      expect(() => {
        helper.decodeInternal_('ABC');
      }).to.throw(/Invalid token/);
    });

    it('should fail on invalid JSON in header', () => {
      expect(() => {
        helper.decodeInternal_(
          `${TOKEN_HEADER.substring(1)}.${TOKEN_PAYLOAD}.${TOKEN_SIG}`
        );
      }).to.throw(/Invalid token/);
    });

    it('should fail on invalid JSON in payload', () => {
      expect(() => {
        helper.decodeInternal_(
          `${TOKEN_HEADER}.${TOKEN_PAYLOAD.substring(1)}.${TOKEN_SIG}`
        );
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
    const SIG =
      'NuE6WH4kIS77Bd6kK8R1mj2aZYpM0mTo-ZnH1UkYeyhTYRNvcIVy' +
      'SFNYH0jQnyREG3CRpsRCYRr9X4Q1Mnzm1Xnx_0saPSV02CTiLjmHX340p9m' +
      'KRCeOHkwytP-da-wXv2KKsEWTHM0RJET3GgHHm7zFCPHF89dmoBXeCz33iFY';
    const TOKEN =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' +
      '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG8iLCJhZG1pbiI6dHJ1ZX0' +
      '.' +
      SIG;
    const PEM =
      '-----BEGIN PUBLIC KEY-----\n' +
      'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd\n' +
      'UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs\n' +
      'HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D\n' +
      'o2kQ+X5xK9cipRgEKwIDAQAB\n' +
      '-----END PUBLIC KEY-----';

    it.configure().run('should decode and verify token correctly', () => {
      // Skip on non-subtle browser.
      if (!helper.isVerificationSupported()) {
        return;
      }
      return helper.decodeAndVerify(TOKEN, Promise.resolve(PEM)).then((tok) => {
        expect(tok['name']).to.equal('John Do');
      });
    });

    it.configure().run('should fail invalid signature', () => {
      // Skip on non-subtle browser.
      if (!helper.isVerificationSupported()) {
        return;
      }

      const token =
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' +
        '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG8iLCJhZG1pbiI6MH0' +
        '.' +
        SIG;

      return helper.decodeAndVerify(token, Promise.resolve(PEM)).then(
        () => {
          throw new Error('must have failed');
        },
        (error) => {
          // Expected.
          expect(error.message).to.match(/Signature verification failed/);
        }
      );
    });
  });

  describe('decodeAndVerify with mock subtle', () => {
    const SIG =
      'NuE6WH4kIS77Bd6kK8R1mj2aZYpM0mTo-ZnH1UkYeyhTYRNvcIVy' +
      'SFNYH0jQnyREG3CRpsRCYRr9X4Q1Mnzm1Xnx_0saPSV02CTiLjmHX340p9m' +
      'KRCeOHkwytP-da-wXv2KKsEWTHM0RJET3GgHHm7zFCPHF89dmoBXeCz33iFY';
    const TOKEN =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' +
      '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG8iLCJhZG1pbiI6dHJ1ZX0' +
      '.' +
      SIG;
    const PEM =
      '-----BEGIN PUBLIC KEY-----\n' +
      'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd\n' +
      'UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs\n' +
      'HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D\n' +
      'o2kQ+X5xK9cipRgEKwIDAQAB\n' +
      '-----END PUBLIC KEY-----';

    let windowApi;
    let subtleMock;
    let helper;

    beforeEach(() => {
      const subtle = {
        importKey: () => {},
        verify: () => {},
      };
      subtleMock = env.sandbox.mock(subtle);

      windowApi = {
        crypto: {subtle},
      };
      helper = new JwtHelper(windowApi);
    });

    afterEach(() => {
      subtleMock.verify();
    });

    it('should fail invalid token', () => {
      return helper.decodeAndVerify('a.b', Promise.resolve(PEM)).then(
        () => {
          throw new Error('Must have failed');
        },
        (error) => {
          expect(error.message).to.match(/Invalid token/);
        }
      );
    });

    it('should fail without alg', () => {
      const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiIifQ.e30.X';
      return helper.decodeAndVerify(token, Promise.resolve(PEM)).then(
        () => {
          throw new Error('Must have failed');
        },
        (error) => {
          expect(error.message).to.match(/Only alg=RS256 is supported/);
        }
      );
    });

    it('should fail with wrong alg', () => {
      // HS256 used instead of RS256.
      const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.X';
      return helper.decodeAndVerify(token, Promise.resolve(PEM)).then(
        () => {
          throw new Error('Must have failed');
        },
        (error) => {
          expect(error.message).to.match(/Only alg=RS256 is supported/);
        }
      );
    });

    it('should fetch they key and verify', () => {
      const key = 'KEY';
      subtleMock
        .expects('importKey')
        .withExactArgs(
          /* format */ 'spki',
          pemToBytes(PEM),
          {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
          /* extractable */ false,
          /* uses */ ['verify']
        )
        .returns(Promise.resolve(key))
        .once();
      subtleMock
        .expects('verify')
        .withExactArgs(
          {name: 'RSASSA-PKCS1-v1_5'},
          key,
          /* sig */ env.sandbox.match(() => true),
          /* verifiable */ env.sandbox.match(() => true)
        )
        .returns(Promise.resolve(true))
        .once();
      return helper.decodeAndVerify(TOKEN, Promise.resolve(PEM)).then((tok) => {
        expect(tok['name']).to.equal('John Do');
      });
    });
  });
});

describes.sandboxed.configure().run('pemToBytes', {}, () => {
  const PLAIN_TEXT =
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd' +
    'UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs' +
    'HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D' +
    'o2kQ+X5xK9cipRgEKwIDAQAB';
  const PEM =
    '-----BEGIN PUBLIC KEY-----\n' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd\n' +
    'UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs\n' +
    'HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D\n' +
    'o2kQ+X5xK9cipRgEKwIDAQAB\n' +
    '-----END PUBLIC KEY-----';

  it('should convert a valid key', () => {
    const binary = pemToBytes(PEM);
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });

  it('should convert without headers, footers, line breaks', () => {
    const binary = pemToBytes(PLAIN_TEXT);
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });

  it('should convert without line breaks', () => {
    const binary = pemToBytes(
      '-----BEGIN PUBLIC KEY-----' + PLAIN_TEXT + '-----END PUBLIC KEY-----'
    );
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });

  it('should convert without header', () => {
    const binary = pemToBytes(PLAIN_TEXT + '-----END PUBLIC KEY-----');
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });

  it('should convert without footer', () => {
    const binary = pemToBytes('-----BEGIN PUBLIC KEY-----' + PLAIN_TEXT);
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });
});
