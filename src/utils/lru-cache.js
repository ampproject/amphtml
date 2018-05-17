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

import {dev} from '../log';

/** @const {string} */
const TAG = 'lru-cache';

/**
 * @template T
 */
export class LruCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    /** @private @const {number} */
    this.capacity_ = capacity;

    /** @private {number} */
    this.size_ = 0;

    /**
     * An incrementing counter to define the last access.
     * @private {number}
     */
    this.access_ = 0;

    /** @private {!Object<(number|string), {payload: T, access: number}>} */
    this.cache_ = Object.create(null);
  }

  /**
   * @param {number|string} id
   * @return {T} The cached payload.
   */
  get(id) {
    const cacheable = this.cache_[id];
    if (cacheable) {
      cacheable.access = this.access_++;
      return cacheable.payload;
    }
    return undefined;
  }

  /**
   * @param {number|string} id
   * @param {T} payload The payload to cache.
   */
  put(id, payload) {
    this.cache_[id] = {payload, access: this.access_};
    this.size_++;
    this.evict_();
  }

  evict_() {
    if (this.size_ <= this.capacity_) {
      return;
    }
    this.size_--;

    dev().warn(TAG, 'Trimming LRU cache');
    const cache = this.cache_;
    let oldest = this.access_;
    let oldestKey;
    for (const key in cache) {
      const {access} = cache[key];
      if (access < oldest) {
        oldest = access;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      delete cache[oldestKey];
    }
  }
}
