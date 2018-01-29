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

import {
  base64UrlDecodeToBytes,
  base64DecodeToBytes,
  base64UrlEncodeFromBytes,
  base64EncodeFromBytes,
} from '../../../src/utils/base64';
import {
  stringToBytes,
  utf8Decode,
  utf8Encode,
} from '../../../src/utils/bytes';

describe('base64 <> utf-8 encode/decode', () => {
  const testCases = [
    'SimplyFoo',
    'Unicode௵Z加䅌ਇ☎Èʘغޝ',
    'Symbols/.,+-_()*&^%$#@!`~:="\'',
  ];
  const scenarios = ['NativeTextEncoding', 'PolyfillTextEncoding', 'Mixed'];

  scenarios.forEach(scenario => {
    describe(scenario, () => {
      const oldTextEncoder = window.TextEncoder;
      const oldTextDecoder = window.TextDecoder;
      beforeEach(() => {
        // Forces use of the TextEncoding polyfill
        if (scenario == 'PolyfillTextEncoding') {
          window.TextEncoder = undefined;
          window.TextDecoder = undefined;
        }
        // Tests a mixture where encoding is done by the polyfill but decoding
        // is done by the native TextDecoder
        if (scenario == 'Mixed') {
          window.TextEncoder = undefined;
        }
      });

      afterEach(() => {
        window.TextEncoder = oldTextEncoder;
        window.TextDecoder = oldTextDecoder;
      });

      describe('base64Encode/base64Decode', () => {
        testCases.forEach(testCase => {
          it(testCase, () => {
            const utf8Bytes = utf8Encode(testCase);
            const encoded = base64EncodeFromBytes(utf8Bytes);
            expect(encoded).not.to.equal(testCase);
            const decodedUtf8Bytes = base64DecodeToBytes(encoded);
            const decoded = utf8Decode(decodedUtf8Bytes);
            expect(decoded).to.equal(testCase);
          });
        });
      });

      describe('base64UrlEncode/base64UrlDecode', () => {
        testCases.forEach(testCase => {
          it(testCase, () => {
            const utf8Bytes = utf8Encode(testCase);
            const encoded = base64UrlEncodeFromBytes(utf8Bytes);
            expect(encoded).not.to.equal(testCase);
            expect(encoded).not.to.match(/[+/=]/g);
            const decodedUtf8Bytes = base64UrlDecodeToBytes(encoded);
            const decoded = utf8Decode(decodedUtf8Bytes);
            expect(decoded).to.equal(testCase);
          });
        });
      });
    });
  });
});

describe('base64UrlDecodeToBytes', () => {
  it('should map a sample string appropriately', () => {
    expect(base64UrlDecodeToBytes('AQAB'))
        .to.deep.equal(new Uint8Array([1, 0, 1]));
    expect(base64UrlDecodeToBytes('_-..'))
        .to.deep.equal(new Uint8Array([255]));
  });

  it('should handle padded and unpadded input', () => {
    expect(base64UrlDecodeToBytes('cw')).to.deep.equal(stringToBytes('s'));
    expect(base64UrlDecodeToBytes('cw'))
        .to.deep.equal(base64UrlDecodeToBytes('cw..'));
    expect(base64UrlDecodeToBytes('c3U')).to.deep.equal(stringToBytes('su'));
    expect(base64UrlDecodeToBytes('c3U'))
        .to.deep.equal(base64UrlDecodeToBytes('c3U.'));
    expect(base64UrlDecodeToBytes('c3Vy')).to.deep.equal(stringToBytes('sur'));
  });

  it('should signal an error with bad input characters', () => {
    expect(() => base64UrlDecodeToBytes('@#*#')).to.throw();
  });

  it('should signal an error with bad padding', () => {
    expect(() => base64UrlDecodeToBytes('c3Vy.')).to.throw();
  });
});

describe('base64DecodeToBytes', () => {
  it('should map a sample string appropriately', () => {
    expect(base64DecodeToBytes('AQAB'))
        .to.deep.equal(new Uint8Array([1, 0, 1]));
    expect(base64DecodeToBytes('/+=='))
        .to.deep.equal(new Uint8Array([255]));
  });

  it('should handle padded and unpadded input', () => {
    expect(base64DecodeToBytes('cw')).to.deep.equal(stringToBytes('s'));
    expect(base64DecodeToBytes('cw'))
        .to.deep.equal(base64DecodeToBytes('cw=='));
    expect(base64DecodeToBytes('c3U')).to.deep.equal(stringToBytes('su'));
    expect(base64DecodeToBytes('c3U'))
        .to.deep.equal(base64DecodeToBytes('c3U='));
    expect(base64DecodeToBytes('c3Vy')).to.deep.equal(stringToBytes('sur'));
  });

  it('should signal an error with bad input characters', () => {
    expect(() => base64DecodeToBytes('@#*#')).to.throw();
  });

  it('should signal an error with bad padding', () => {
    expect(() => base64DecodeToBytes('c3Vy=')).to.throw();
  });
});

describe('base64EncodeFromBytes', () => {
  it('should encode a bytes array to base64url string correctly', () => {
    expect(base64UrlEncodeFromBytes(new Uint8Array()))
        .to.equal('');
    expect(base64UrlEncodeFromBytes(stringToBytes('s')))
        .to.equal('cw..');
    expect(base64UrlEncodeFromBytes(stringToBytes('su')))
        .to.equal('c3U.');
    expect(base64UrlEncodeFromBytes(stringToBytes('sur')))
        .to.equal('c3Vy');
    expect(base64UrlEncodeFromBytes(new Uint8Array([255, 239])))
        .to.equal('_-8.');
  });

  it('should encode a bytes array to base64 string correctly', () => {
    expect(base64EncodeFromBytes(new Uint8Array()))
        .to.equal('');
    expect(base64EncodeFromBytes(stringToBytes('s')))
        .to.equal('cw==');
    expect(base64EncodeFromBytes(stringToBytes('su')))
        .to.equal('c3U=');
    expect(base64EncodeFromBytes(stringToBytes('sur')))
        .to.equal('c3Vy');
    expect(base64EncodeFromBytes(new Uint8Array([255, 239])))
        .to.equal('/+8=');
  });
});
