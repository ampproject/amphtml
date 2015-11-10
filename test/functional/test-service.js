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

import {getService} from '../../src/service';

describe('service`', () => {

  let count = 1;
  function inc() {
    return count++;
  }

  it('should make per window singletons', () => {
    const a1 = getService(window, 'a', inc);
    const a2 = getService(window, 'a', inc);
    expect(a1).to.equal(a2);
    expect(a1).to.equal(1);
    const b1 = getService(window, 'b', inc);
    const b2 = getService(window, 'b', inc);
    expect(b1).to.equal(b2);
    expect(b1).to.not.equal(a1);
  });
});
