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

import {values} from '../../src/polyfills/object-values';

describe('Object.values', () => {
  it('should disallow null and undefined', () => {
    expect(() => values(null)).to.throw();
    expect(() => values(undefined)).to.throw();
  });

  it('should allow primitives', () => {
    expect(values(1)).to.deep.equal([]);
    expect(values('A')).to.deep.equal(['A']);
    expect(values(true)).to.deep.equal([]);
    expect(values(false)).to.deep.equal([]);
  });

  it('should return values of objects', () => {
    expect(values({a: 1, b: 2, c: 1})).to.deep.equal([1, 2, 1]);
  });
});
