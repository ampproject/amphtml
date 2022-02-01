/**
 * A priority queue backed with sorted array.
 * @template T
 */
export class PriorityQueue {
  /**
   * Creates an instance of PriorityQueue.
   */
  constructor() {
    /**
     * @type {Array<{item: T, priority: number}>}
     * @private
     */
    this.queue_ = [];
  }

  /**
   * Returns the max priority item without dequeueing it.
   * @return {?T}
   */
  peek() {
    const l = this.length;
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
    let hi = this.length;
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
   * @param {function(T):*} callback
   */
  forEach(callback) {
    let index = this.length;
    while (index--) {
      callback(this.queue_[index].item);
    }
  }

  /**
   * Dequeues the max priority item.
   * Items with the same priority are dequeued in FIFO order.
   * @return {?T}
   */
  dequeue() {
    const lastItem = this.queue_.pop();
    if (!lastItem) {
      return null;
    }
    return lastItem.item;
  }

  /**
   * The number of items in the queue.
   * @return {number}
   */
  get length() {
    return this.queue_.length;
  }
}
