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
  areEqualOrdered,
  findIndex,
  fromIterator,
  pushIfNotExist,
  remove,
} from '../../../src/utils/array';

describe('areEqualOrdered', function() {
  it('should return true on empty arrays',
      () => {
        const result = areEqualOrdered([], []);
        expect(result).to.be.true;
      });

  it('should return true on same array with primitive types of same seq',
      () => {
        const result = areEqualOrdered(
            [1, 'string', true, undefined, null],
            [1, 'string', true, undefined, null]
        );
        expect(result).to.be.true;
      });

  it('should return true on same array with objects of same seq',
      () => {
        const o1 = {a: 1};
        const o2 = () => { return 'arrow func'; };
        const o3 = new Function('whatever');
        const o4 = {};
        const o5 = [];
        const result = areEqualOrdered(
            [o1, o2, o3, o4, o5],
            [o1, o2, o3, o4, o5]
        );
        expect(result).to.be.true;
      });

  it('should return false on same array with primitive types of different seq',
      () => {
        const result = areEqualOrdered(
            [null, true, 'string', undefined, 1],
            [1, 'string', true, undefined, null]
        );
        expect(result).to.be.false;
      });

  it('should return false on same array with objects of different seq',
      () => {
        const o1 = {a: 1};
        const o2 = () => { return 'arrow func'; };
        const o3 = new Function('whatever');
        const o4 = {};
        const o5 = [];
        const result = areEqualOrdered(
            [o4, o5, o3, o2, o1],
            [o1, o2, o3, o4, o5]
        );
        expect(result).to.be.false;
      });

  it('should return false on array of different length', () => {
    const result = areEqualOrdered([1, 2, 3], [1, 2, 3, 3]);
    expect(result).to.be.false;
  });
});

describe('remove', function() {
  let array;
  beforeEach(() => {
    array = [1, 2, 3, 4, 5];
  });

  it('should remove elements that return true', () => {
    remove(array, i => i > 2);
    expect(array).to.deep.equal([1, 2]);
  });

  it('handles no removals', () => {
    remove(array, () => false);
    expect(array).to.deep.equal([1, 2, 3, 4, 5]);
  });

  it('handles consecutive removals', () => {
    remove(array, () => true);
    expect(array).to.deep.equal([]);
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

describe('pushIfNotExist', () => {
  it('should push element', () => {
    const array = [1, 2, 3, 4];
    pushIfNotExist(array, 5);
    expect(array).to.deep.equal([1, 2, 3, 4, 5]);
    pushIfNotExist(array, 2.3);
    expect(array).to.deep.equal([1, 2, 3, 4, 5, 2.3]);
  });
  it('should not push element', () => {
    const array = [1, 2, 3, 4];
    pushIfNotExist(array, 1);
    expect(array).to.deep.equal([1, 2, 3, 4]);
  });
});
