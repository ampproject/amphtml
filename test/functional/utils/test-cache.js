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

import Cache from '../../../src/utils/cache';

describe('Cache', function() {
  let cache;

  beforeEach(() => {
    cache = new Cache(5);
  });

  /**
   * @param {Cache<T>} cache
   * @return {Array<T>}
   */
  function toArray(cache, keys) {
    return keys.map(key => cache.get(key));
  }

  it('should return the correct length of the queue', () => {
    expect(cache.length).to.equal(0);
    cache.put('a', 0);
    cache.put('b', 1);
    expect(cache.length).to.equal(2);
    cache.put('c', 2);
    cache.put('d', 3);
    cache.put('e', 4);
    expect(cache.length).to.equal(5);
    cache.put('f', 5);
    cache.put('g', 6);
    expect(cache.length).to.equal(5);
  });

  it('should support caching arbitrary data types', () => {
    cache.put('a', 'abc');
    cache.put('b', 123);
    cache.put('c', ['x', 'y']);
    cache.put('d', {foo: 'bar'});

    expect(toArray(cache, 'abcd'.split(''))).to.deep.equal(
      ['abc', 123, ['x', 'y'], {foo: 'bar'}]);
  });

  it('should remove least recently used items first', () => {
    'abcde'.split('').forEach(c => cache.put(c, c));

    cache.put('f', 'f');
    expect(cache.get('f')).to.not.be.undefined;
    expect(cache.get('a')).to.be.undefined;

    cache.get('b');
    cache.put('g', 'g');
    expect(cache.get('g')).to.not.be.undefined;
    expect(cache.get('b')).to.not.be.undefined;
    expect(cache.get('c')).to.be.undefined;
  });

  it('should throw error when keys are not strings', () => {
    expect(() => { cache.put({}, 'c'); }).to.throw(Error);
  });
});
