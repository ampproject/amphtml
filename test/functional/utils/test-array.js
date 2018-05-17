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
  filterSplice,
  findIndex,
  fromIterator,
} from '../../../src/utils/array';

describe('filterSplice', function() {
  let array;
  beforeEach(() => {
    array = [1, 2, 3, 4, 5];
  });

  it('should splice elements that filter true', () => {
    filterSplice(array, i => i > 2);
    expect(array).to.deep.equal([3, 4, 5]);
  });

  it('should return filtered elements', () => {
    const filtered = filterSplice(array, i => i > 2);
    expect(filtered).to.deep.equal([1, 2]);
  });

  it('handles no removals', () => {
    const filtered = filterSplice(array, () => true);
    expect(array).to.deep.equal([1, 2, 3, 4, 5]);
    expect(filtered).to.deep.equal([]);
  });

  it('handles consecutive removals', () => {
    const filtered = filterSplice(array, () => false);
    expect(array).to.deep.equal([]);
    expect(filtered).to.deep.equal([1, 2, 3, 4, 5]);
  });
});

describe('findIndex', function() {
  it('should return the index of first matching element', () => {
    const found = findIndex([4, 1, 5, 3, 4, 5], element => element > 4);
    expect(found).to.equal(2);
  });

  it('should return -1 if no matching element', () => {
    const found = findIndex([4, 1, 5, 3, 4, 5], element => element > 5);
    expect(found).to.equal(-1);
  });

  it('should pass index as the 2nd param to the predicate function', () => {
    const found = findIndex([0, 0, 0, 0, 0, 0], (element, i) => {
      return i == 4;
    });
    expect(found).to.equal(4);
  });

  it('should pass the original array as the 3rd param to the predicate', () => {
    findIndex([1, 2, 3], (element, i, array) => {
      expect(array).to.deep.equal([1, 2, 3]);
    });
  });
});

describe('fromIterator', function() {
  it('should return empty array for empty iterator', () => {
    const iterator = {
      next() {
        return {value: undefined, done: true};
      },
    };

    expect(fromIterator(iterator)).to.be.an('array').that.is.empty;
  });

  it('should return non-empty array for non-empty iterator', () => {
    let index = 0;
    const iterator = {
      next() {
        return index < 3 ?
          {value: (index++) * 2, done: false} :
          {value: undefined, done: true};
      },
    };

    expect(fromIterator(iterator)).to.deep.equal([0, 2, 4]);
  });
});
