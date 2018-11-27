/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {rot13Array} from '../../addthis-utils/rot13';

describe('rot13', () => {
  it('should properly rotate alphabetical characters', () => {
    const expected = [
      '',
      'nOn',
      'uryyb',
      'nopqrstuvwxyzabcdefghijklm',
      'NOPQRSTUVWXYZABCDEFGHIJKLM',
    ];
    const result = rot13Array([
      '',
      'aBa',
      'hello',
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ]);
    Object.keys(result).forEach((key, idx) => {
      expect(key).to.equal(expected[idx]);
    });
  });

  it('should not rotate non-alphabetical characters', () => {
    const expected = ['1337', '1337 ns', '!@#$n0 m'];
    const result = rot13Array(['1337', '1337 af', '!@#$a0 z']);
    Object.keys(result).forEach((key, idx) => {
      expect(key).to.equal(expected[idx]);
    });
  });
});
