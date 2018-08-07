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

import {crc32} from '../crc32';

const testVectors = [
  {
    input: '',
    output: 0,
  },
  {
    input: 'The quick brown fox jumps over the lazy dog',
    output: 1095738169,
  },
  {
    input: 'The quick brown fox jumps over the lazy dog.',
    output: 1368401385,
  },
  {
    input: 'hello',
    output: 907060870,
  },
  {
    input: 'world',
    output: 980881731,
  },
  {
    input: 'helloworld',
    output: 4192936109,
  },
  {
    input: '12345',
    output: 3421846044,
  },
  {
    input: '漢字',
    output: 2573319087,
  },
  {
    input: '    spaces',
    output: 1946449684,
  },
  {
    input: '-_~c@@l~_-',
    output: 4153342273,
  },
];

describe('CRC32 Implementation', () => {
  testVectors.forEach((test, i) => {
    it(`test #${i}: "${test.input}"`, () => {
      expect(crc32(test.input)).to.equal(test.output);
    });
  });
});
