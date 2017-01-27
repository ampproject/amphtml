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

/**
 * A priority queue backed with sorted array.
 * @template T
 */
export default class PriorityQueue {
  constructor() {
    /** @private @const {Array<{item: T, priority: number}>} */
    this.queue_ = [];
  }

  /**
   * Returns the max priority item without dequeueing it.
   * @return {T}
   */
  peek() {
    const l = this.queue_.length;
    if (!l) {
      return null;
    }
    return this.queue_[l - 1].item;
  }

  /**
   * Enqueues an item with the given priority.
   * @param {T} item
   * @param {number} priority
   */
  enqueue(item, priority) {
    if (isNaN(priority)) {
      throw new Error('Priority must not be NaN.');
    }
    const i = this.binarySearch_(priority);
    this.queue_.splice(i, 0, {item, priority});
  }

  /**
   * Returns index at which item with `target` priority should be inserted.
   * @param {number} target
   * @return {number}
   * @private
   */
  binarySearch_(target) {
    let i = -1;
    let lo = 0;
    let hi = this.queue_.length;
    while (lo <= hi) {
      i = Math.floor((lo + hi) / 2);
      // This means `target` is the new max priority in the queue.
      if (i === this.queue_.length) {
        break;
      }
      // Stop searching once p[i] >= target AND p[i-1] < target.
      // This way, we'll return the index of the first occurence of `target`
      // priority (if any), which preserves FIFO order of same-priority items.
      if (this.queue_[i].priority < target) {
        lo = i + 1;
      } else if (i > 0 && this.queue_[i - 1].priority >= target) {
        hi = i - 1;
      } else {
        break;
      }
    }
    return i;
  }

  /**
   * Dequeues the max priority item.
   * Items with the same priority are dequeued in FIFO order.
   * @return {T}
   */
  dequeue() {
    if (!this.queue_.length) {
      return null;
    }
    return this.queue_.pop().item;
  }

  /**
   * The number of items in the queue.
   * @return {number}
   */
  get length() {
    return this.queue_.length;
  }
}
