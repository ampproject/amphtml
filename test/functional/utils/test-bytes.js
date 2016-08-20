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
  getRandomBytesArray,
} from '../../../src/utils/bytes';

describe('stringToBytes', function() {
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

  it('should generate random bytes array', () => {
    Math.random = () => 0.1111111111111111;
    expect(getRandomBytesArray(1)).to.deep.equal(new Uint8Array([28]));
    expect(getRandomBytesArray(2)).to.deep.equal(new Uint8Array([28, 113]));
    expect(getRandomBytesArray(3)).to.deep
        .equal(new Uint8Array([28, 113, 199]));
    expect(getRandomBytesArray(4)).to.deep
        .equal(new Uint8Array([28, 113, 199, 28]));
    expect(getRandomBytesArray(5)).to.deep
        .equal(new Uint8Array([28, 113, 199, 28, 113]));
    expect(getRandomBytesArray(6)).to.deep
        .equal(new Uint8Array([28, 113, 199, 28, 113, 199]));
  });
});
