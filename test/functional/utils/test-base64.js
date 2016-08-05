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
} from '../../../src/utils/base64';
import {stringToBytes} from '../../../src/utils/bytes';


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
