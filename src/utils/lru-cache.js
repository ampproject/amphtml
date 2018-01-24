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

/** @typedef {{
      payload: *,
      access: number,
    }} */
export let Cacheable;

/** @const {string} */
const TAG = 'lru-cache';

export class LRUCache {
  /** @param {number} capacity */
  constructor(capacity) {
    /** @private {number} */
    this.capacity_ = capacity;

    /** @private {!Object<(number|string), !Cacheable>} */
    this.cache_ = {};
  }

  /**
   * @param {number|string} id
   * @return {*} The cached payload.
   */
  get(id) {
    if (this.cache_[id]) {
      this.cache_[id].access = Date.now();
      return this.cache_[id].payload;
    }
    return undefined;
  }

  /**
   * @param {number|string} id
   * @param {*} payload The payload to cache.
   */
  put(id, payload) {
    this.cache_[id] = {payload, access: Date.now()};
    const cacheKeys = /**@type {!Array<number>}*/ (Object.keys(this.cache_));
    if (cacheKeys.length > this.capacity_) {
      dev().warn(TAG, 'Trimming template cache');
      // Evict oldest entry to ensure memory usage is minimized.
      cacheKeys.sort((a, b) => this.cache_[b].access - this.cache_[a].access);
      delete this.cache_[cacheKeys[cacheKeys.length - 1]];
    }
  }
}
