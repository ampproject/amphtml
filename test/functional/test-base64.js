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

import {base64UrlDecodeToBytes} from '../../src/base64';

describe('base64UrlDecodeToBytes', function() {
  it('should map a sample string appropriately', () => {
    const ab = base64UrlDecodeToBytes('AQAB');
    expect(ab.length).to.equal(3);
    expect(ab[0]).to.equal(1);
    expect(ab[1]).to.equal(0);
    expect(ab[2]).to.equal(1);
  });
});
