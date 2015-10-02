/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {randomUUID} from '../../src/uuid';


describe('UUID', () => {
  it('should generate randomUUID with right pattern', () => {
    let uuid = randomUUID();
    expect(uuid.indexOf('-', 0)).to.equal(8);
    expect(uuid.indexOf('-', 9)).to.equal(13);
    expect(uuid.indexOf('-', 14)).to.equal(18);
    expect(uuid.indexOf('-', 19)).to.equal(23);
  });

  it('should generate randomUUID with version 4', () => {
    expect(randomUUID().substring(14, 15)).to.equal('4');
  });

  it('should generate randomUUID with IETF variant', () => {
    // 0         1         2         3
    // 012345678901234567890123456789012345
    // aaaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa
    let v = randomUUID().substring(19, 20);
    let n = parseInt(v, 16);
    expect(n & 0x8).to.not.equal(0, '|0x8');
    expect((n - 0x8) & ~0x3).to.equal(0, '&0x3');
  });
});
