function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
export var PriorityQueue = /*#__PURE__*/function () {
  /**
   * Creates an instance of PriorityQueue.
   */
  function PriorityQueue() {_classCallCheck(this, PriorityQueue);
    /** @private @const {Array<{item: T, priority: number}>} */
    this.queue_ = [];
  }

  /**
   * Returns the max priority item without dequeueing it.
   * @return {T}
   */_createClass(PriorityQueue, [{ key: "peek", value:
    function peek() {
      var l = this.length;
      if (!l) {
        return null;
      }
      return this.queue_[l - 1].item;
    }

    /**
     * Enqueues an item with the given priority.
     * @param {T} item
     * @param {number} priority
     */ }, { key: "enqueue", value:
    function enqueue(item, priority) {
      if (isNaN(priority)) {
        throw new Error('Priority must not be NaN.');
      }
      var i = this.binarySearch_(priority);
      this.queue_.splice(i, 0, { item: item, priority: priority });
    }

    /**
     * Returns index at which item with `target` priority should be inserted.
     * @param {number} target
     * @return {number}
     * @private
     */ }, { key: "binarySearch_", value:
    function binarySearch_(target) {
      var i = -1;
      var lo = 0;
      var hi = this.length;
      while (lo <= hi) {
        i = Math.floor((lo + hi) / 2);
        // This means `target` is the new max priority in the queue.
        if (i === this.length) {
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
     * @param {function(T)} callback
     */ }, { key: "forEach", value:
    function forEach(callback) {
      var index = this.length;
      while (index--) {
        callback(this.queue_[index].item);
      }
    }

    /**
     * Dequeues the max priority item.
     * Items with the same priority are dequeued in FIFO order.
     * @return {T}
     */ }, { key: "dequeue", value:
    function dequeue() {
      if (!this.length) {
        return null;
      }
      return this.queue_.pop().item;
    }

    /**
     * The number of items in the queue.
     * @return {number}
     */ }, { key: "length", get:
    function get() {
      return this.queue_.length;
    } }]);return PriorityQueue;}();
// /Users/mszylkowski/src/amphtml/src/core/data-structures/priority-queue.js