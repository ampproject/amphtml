/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/**
 * An LRU Cache
 * @template T
 */
export default class Cache {
  /**
   * Construct a new Cache with the given size
   * @param size {number=}
   */
  constructor(size) {
    /** @private @const {number} */
    this.size_ = size || 5;

    /** @private @const {Array<string>} */
    this.queue_ = [];

    /** @private @const {Object<string, T>} */
    this.map_ = {};
  }

  /**
   * Add data to the cache.
   * If the cache is full, remove the least-recently-used entry.
   * If the item exists in the cache, move it to the most-recently-used end.
   *
   * @param key {string}
   * @param value {T}
   */
  put(key, value) {
    if (typeof key !== 'string') {
      throw new Error('Cache keys must be strings');
    }

    const index = this.queue_.indexOf(key);
    if (index > -1) {
      this.queue_.splice(index, 1);
    } else if (this.queue_.length === this.size_) {
      const removed = this.queue_.shift();
      delete this.map_[removed];
    }
    this.queue_.push(key);
    this.map_[key] = value;
  }

  /**
   * Update the priority of the requested item and then return it.
   * If the item does not exist, return undefined.
   *
   * @param key {string}
   * @returns {T}
   */
  get(key) {
    const index = this.queue_.indexOf(key);
    if (index > -1) {
      this.queue_.splice(index, 1);
      this.queue_.push(key);
    }
    return this.map_[key];
  }

  get length() {
    return this.queue_.length;
  }
}
