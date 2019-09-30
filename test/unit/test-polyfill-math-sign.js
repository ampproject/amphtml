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

import {sign} from '../../src/polyfills/math-sign';

describe('Math.sign', () => {
  it('returns 1 for positive x', () => {
    expect(sign(1)).to.equal(1);
    expect(sign(10)).to.equal(1);
    expect(sign(100)).to.equal(1);
    expect(sign(Infinity)).to.equal(1);
  });

  it('returns -1 for negative x', () => {
    expect(sign(-1)).to.equal(-1);
    expect(sign(-10)).to.equal(-1);
    expect(sign(-100)).to.equal(-1);
    expect(sign(-Infinity)).to.equal(-1);
  });

  it('returns 0 for 0', () => {
    expect(sign(0)).to.deep.equal(0);
  });

  it('returns -0 for -0', () => {
    expect(sign(-0)).to.deep.equal(-0);
  });

  it('returns NaN for NaN', () => {
    expect(sign(NaN)).to.deep.equal(NaN);
  });

  it('returns NaN for non-numbers', () => {
    expect(sign({})).to.deep.equal(NaN);
    expect(sign(function() {})).to.deep.equal(NaN);
    expect(sign('test1')).to.deep.equal(NaN);
    expect(sign('1test')).to.deep.equal(NaN);
  });
});
