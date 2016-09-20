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
  stringToBytes,
  bytesToString,
  getCryptoRandomBytesArray,
} from '../../../src/utils/bytes';

describe('stringToBytes', function() {
  let fakeWin;

  beforeEach(() => {
    fakeWin = {
      crypto: {
        getRandomValues: array => {
          for (let i = 0; i < array.length; i++) {
            array[i] = i + 1;
          }
        },
      },
    };
  });

  it('should map a sample string appropriately', () => {
    const bytes = stringToBytes('abÿ');
    expect(bytes.length).to.equal(3);
    expect(bytes[0]).to.equal(97);
    expect(bytes[1]).to.equal(98);
    expect(bytes[2]).to.equal(255);
  });

  it('should signal an error with a character >255', () => {
    expect(() => {
      return stringToBytes('ab☺');
    }).to.throw();
  });

  it('should convert bytes array to string', () => {
    const str = bytesToString(new Uint8Array([102, 111, 111]));
    expect(str).to.equal('foo');
  });

  it('should generate random bytes array when win.crypto is availble', () => {
    expect(getCryptoRandomBytesArray(fakeWin, 1)).to.deep
      .equal(new Uint8Array([1]));
    expect(getCryptoRandomBytesArray(fakeWin, 2)).to.deep
      .equal(new Uint8Array([1, 2]));
    expect(getCryptoRandomBytesArray(fakeWin, 3)).to.deep
      .equal(new Uint8Array([1, 2, 3]));
  });

  it('should return null when trying to generate random bytes array if ' +
      'win.crypto is not availble', () => {
    fakeWin.crypto = undefined;
    expect(getCryptoRandomBytesArray(fakeWin, 1)).to.be.null;
  });
});
