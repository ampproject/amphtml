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

import {includes} from '../../src/polyfills/array';

describe('Array.includes', () => {

  const arrayWithPrimitives = [false, 17, 'hello world'];
  it('finds primitives when they are present', () => {
    expect(includes.call(arrayWithPrimitives, 17)).to.be.true;
    expect(includes.call(arrayWithPrimitives, 28)).to.be.false;
    expect(includes.call(arrayWithPrimitives, false)).to.be.true;
    expect(includes.call(arrayWithPrimitives, true)).to.be.false;
    expect(includes.call(arrayWithPrimitives, 'hello world')).to.be.true;
    expect(includes.call(arrayWithPrimitives, 'google')).to.be.false;
  });

  const point = {x: 47, y: 8472};
  const arrayWithObject = [point];
  it('finds objects when they are present', () => {
    expect(includes.call(arrayWithObject, point)).to.be.true;
    // Same properties, different objects
    expect(includes.call(arrayWithObject, {x: 47, y: 8472})).to.be.false;
  });

  const arrayWithNaN = [NaN];
  it('finds NaN when NaN is present', () => {
    expect(includes.call(arrayWithNaN, NaN)).to.be.true;
  });

  const arrayWithNull = [null];
  const arrayWithUndefined = [undefined];
  it('should only find null when null is desired', () => {
    expect(includes.call(arrayWithNull, null)).to.be.true;
    expect(includes.call(arrayWithUndefined, null)).to.be.false;
  });

  it('should only find undefined when undefined is desired', () => {
    expect(includes.call(arrayWithUndefined, undefined)).to.be.true;
    expect(includes.call(arrayWithNull, undefined)).to.be.false;
  });

  const arrayWithZero = [0];
  const arrayWithNegativeZero = [-0];
  it('should treat 0 and -0 as equal', () => {
    expect(includes.call(arrayWithZero, 0)).to.be.true;
    expect(includes.call(arrayWithZero, -0)).to.be.true;
    expect(includes.call(arrayWithNegativeZero, 0)).to.be.true;
    expect(includes.call(arrayWithNegativeZero, -0)).to.be.true;
  });

  const arrayWithNumbers = [0, 1, 2, 3, 4, 5];
  it('should respect the fromIndex argument', () => {
    expect(includes.call(arrayWithNumbers, 2, 0)).to.be.true;
    expect(includes.call(arrayWithNumbers, 2, 1)).to.be.true;
    expect(includes.call(arrayWithNumbers, 2, 2)).to.be.true;
    expect(includes.call(arrayWithNumbers, 2, 3)).to.be.false;
    expect(includes.call(arrayWithNumbers, 2, 4)).to.be.false;
    expect(includes.call(arrayWithNumbers, 2, 5)).to.be.false;
    expect(includes.call(arrayWithNumbers, 2, 6)).to.be.false;

    expect(includes.call(arrayWithNumbers, 2, -1)).to.be.false;
    expect(includes.call(arrayWithNumbers, 2, -2)).to.be.false;
    expect(includes.call(arrayWithNumbers, 2, -3)).to.be.false;
    expect(includes.call(arrayWithNumbers, 2, -4)).to.be.true;
    expect(includes.call(arrayWithNumbers, 2, -5)).to.be.true;
    expect(includes.call(arrayWithNumbers, 2, -6)).to.be.true;
    expect(includes.call(arrayWithNumbers, 2, -6)).to.be.true;
  });

});
