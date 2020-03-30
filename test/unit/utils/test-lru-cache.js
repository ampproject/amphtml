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

import {LruCache} from '../../../src/utils/lru-cache';

describe('LruCache', () => {
  let cache;

  beforeEach(() => {
    cache = new LruCache(5);
    for (let i = 0; i < 5; i++) {
      cache.put(i, i);
    }
  });

  it('should create a prototype-less object for caching', () => {
    expect(cache.get('constructor')).to.be.undefined;
  });

  it('should cache up to capacity', () => {
    for (let i = 0; i < 5; i++) {
      expect(cache.get(i)).to.equal(i);
    }
  });

  it('should not-evict when putting same key', () => {
    for (let i = 0; i < 5; i++) {
      cache.put(0, i);
    }
    expect(cache.get(0)).to.equal(4);
    for (let i = 1; i < 5; i++) {
      expect(cache.get(i)).to.equal(i);
    }
  });

  it('should never be over cap', () => {
    for (let i = 5; i < 10; i++) {
      cache.put(i, i);
    }
    for (let i = 0; i < 5; i++) {
      expect(cache.get(i)).to.be.undefined;
    }
  });

  it('should evict least recently used', () => {
    expect(cache.get(0)).to.equal(0);
    cache.put(5, 5);
    expect(cache.get(0)).to.equal(0);
    expect(cache.get(5)).to.equal(5);
    expect(cache.get(1)).to.be.undefined;
  });
});
