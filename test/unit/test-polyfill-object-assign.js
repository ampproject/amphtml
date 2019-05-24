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

import {assign} from '../../src/polyfills/object-assign';

describe('Object.assign', () => {
  it('should throw an error if target is null or undefined', () => {
    expect(() => assign(null, {a: 1})).to.throw(
      /Cannot convert undefined or null to object/
    );
    expect(() => assign(undefined, {a: 1})).to.throw(
      /Cannot convert undefined or null to object/
    );
  });

  it('should ignore null or undefined sources', () => {
    expect(assign({}, null, undefined)).to.deep.equal({});
    expect(assign({a: 1}, null, undefined)).to.deep.equal({a: 1});
  });

  it('should copy and override keys from source to target', () => {
    expect(assign({a: 1}, {a: 2, b: 3})).to.deep.equal({a: 2, b: 3});
    expect(assign({a: 1}, {b: 3})).to.deep.equal({a: 1, b: 3});
    expect(assign({a: 1}, {b: 3}, {a: 2}, {a: 4})).to.deep.equal({a: 4, b: 3});

    const target = {a: 1, d: 3};
    const source = {a: 2, c: 5};
    assign(target, source);
    expect(target).to.deep.equal({a: 2, c: 5, d: 3});
    expect(source).to.deep.equal({a: 2, c: 5});
  });
});
