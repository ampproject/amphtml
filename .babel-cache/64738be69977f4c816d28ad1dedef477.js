function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
export var PriorityQueue = /*#__PURE__*/function () {
  /**
   * Creates an instance of PriorityQueue.
   */
  function PriorityQueue() {
    _classCallCheck(this, PriorityQueue);

    /** @private @const {Array<{item: T, priority: number}>} */
    this.queue_ = [];
  }

  /**
   * Returns the max priority item without dequeueing it.
   * @return {T}
   */
  _createClass(PriorityQueue, [{
    key: "peek",
    value: function peek() {
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
     */

  }, {
    key: "enqueue",
    value: function enqueue(item, priority) {
      if (isNaN(priority)) {
        throw new Error('Priority must not be NaN.');
      }

      var i = this.binarySearch_(priority);
      this.queue_.splice(i, 0, {
        item: item,
        priority: priority
      });
    }
    /**
     * Returns index at which item with `target` priority should be inserted.
     * @param {number} target
     * @return {number}
     * @private
     */

  }, {
    key: "binarySearch_",
    value: function binarySearch_(target) {
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
     */

  }, {
    key: "forEach",
    value: function forEach(callback) {
      var index = this.length;

      while (index--) {
        callback(this.queue_[index].item);
      }
    }
    /**
     * Dequeues the max priority item.
     * Items with the same priority are dequeued in FIFO order.
     * @return {T}
     */

  }, {
    key: "dequeue",
    value: function dequeue() {
      if (!this.length) {
        return null;
      }

      return this.queue_.pop().item;
    }
    /**
     * The number of items in the queue.
     * @return {number}
     */

  }, {
    key: "length",
    get: function get() {
      return this.queue_.length;
    }
  }]);

  return PriorityQueue;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaW9yaXR5LXF1ZXVlLmpzIl0sIm5hbWVzIjpbIlByaW9yaXR5UXVldWUiLCJxdWV1ZV8iLCJsIiwibGVuZ3RoIiwiaXRlbSIsInByaW9yaXR5IiwiaXNOYU4iLCJFcnJvciIsImkiLCJiaW5hcnlTZWFyY2hfIiwic3BsaWNlIiwidGFyZ2V0IiwibG8iLCJoaSIsIk1hdGgiLCJmbG9vciIsImNhbGxiYWNrIiwiaW5kZXgiLCJwb3AiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFBLGFBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSwyQkFBYztBQUFBOztBQUNaO0FBQ0EsU0FBS0MsTUFBTCxHQUFjLEVBQWQ7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQVpBO0FBQUE7QUFBQSxXQWFFLGdCQUFPO0FBQ0wsVUFBTUMsQ0FBQyxHQUFHLEtBQUtDLE1BQWY7O0FBQ0EsVUFBSSxDQUFDRCxDQUFMLEVBQVE7QUFDTixlQUFPLElBQVA7QUFDRDs7QUFDRCxhQUFPLEtBQUtELE1BQUwsQ0FBWUMsQ0FBQyxHQUFHLENBQWhCLEVBQW1CRSxJQUExQjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUF6QkE7QUFBQTtBQUFBLFdBMEJFLGlCQUFRQSxJQUFSLEVBQWNDLFFBQWQsRUFBd0I7QUFDdEIsVUFBSUMsS0FBSyxDQUFDRCxRQUFELENBQVQsRUFBcUI7QUFDbkIsY0FBTSxJQUFJRSxLQUFKLENBQVUsMkJBQVYsQ0FBTjtBQUNEOztBQUNELFVBQU1DLENBQUMsR0FBRyxLQUFLQyxhQUFMLENBQW1CSixRQUFuQixDQUFWO0FBQ0EsV0FBS0osTUFBTCxDQUFZUyxNQUFaLENBQW1CRixDQUFuQixFQUFzQixDQUF0QixFQUF5QjtBQUFDSixRQUFBQSxJQUFJLEVBQUpBLElBQUQ7QUFBT0MsUUFBQUEsUUFBUSxFQUFSQTtBQUFQLE9BQXpCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdkNBO0FBQUE7QUFBQSxXQXdDRSx1QkFBY00sTUFBZCxFQUFzQjtBQUNwQixVQUFJSCxDQUFDLEdBQUcsQ0FBQyxDQUFUO0FBQ0EsVUFBSUksRUFBRSxHQUFHLENBQVQ7QUFDQSxVQUFJQyxFQUFFLEdBQUcsS0FBS1YsTUFBZDs7QUFDQSxhQUFPUyxFQUFFLElBQUlDLEVBQWIsRUFBaUI7QUFDZkwsUUFBQUEsQ0FBQyxHQUFHTSxJQUFJLENBQUNDLEtBQUwsQ0FBVyxDQUFDSCxFQUFFLEdBQUdDLEVBQU4sSUFBWSxDQUF2QixDQUFKOztBQUNBO0FBQ0EsWUFBSUwsQ0FBQyxLQUFLLEtBQUtMLE1BQWYsRUFBdUI7QUFDckI7QUFDRDs7QUFDRDtBQUNBO0FBQ0E7QUFDQSxZQUFJLEtBQUtGLE1BQUwsQ0FBWU8sQ0FBWixFQUFlSCxRQUFmLEdBQTBCTSxNQUE5QixFQUFzQztBQUNwQ0MsVUFBQUEsRUFBRSxHQUFHSixDQUFDLEdBQUcsQ0FBVDtBQUNELFNBRkQsTUFFTyxJQUFJQSxDQUFDLEdBQUcsQ0FBSixJQUFTLEtBQUtQLE1BQUwsQ0FBWU8sQ0FBQyxHQUFHLENBQWhCLEVBQW1CSCxRQUFuQixJQUErQk0sTUFBNUMsRUFBb0Q7QUFDekRFLFVBQUFBLEVBQUUsR0FBR0wsQ0FBQyxHQUFHLENBQVQ7QUFDRCxTQUZNLE1BRUE7QUFDTDtBQUNEO0FBQ0Y7O0FBQ0QsYUFBT0EsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBOztBQWxFQTtBQUFBO0FBQUEsV0FtRUUsaUJBQVFRLFFBQVIsRUFBa0I7QUFDaEIsVUFBSUMsS0FBSyxHQUFHLEtBQUtkLE1BQWpCOztBQUNBLGFBQU9jLEtBQUssRUFBWixFQUFnQjtBQUNkRCxRQUFBQSxRQUFRLENBQUMsS0FBS2YsTUFBTCxDQUFZZ0IsS0FBWixFQUFtQmIsSUFBcEIsQ0FBUjtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTlFQTtBQUFBO0FBQUEsV0ErRUUsbUJBQVU7QUFDUixVQUFJLENBQUMsS0FBS0QsTUFBVixFQUFrQjtBQUNoQixlQUFPLElBQVA7QUFDRDs7QUFDRCxhQUFPLEtBQUtGLE1BQUwsQ0FBWWlCLEdBQVosR0FBa0JkLElBQXpCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF6RkE7QUFBQTtBQUFBLFNBMEZFLGVBQWE7QUFDWCxhQUFPLEtBQUtILE1BQUwsQ0FBWUUsTUFBbkI7QUFDRDtBQTVGSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQSBwcmlvcml0eSBxdWV1ZSBiYWNrZWQgd2l0aCBzb3J0ZWQgYXJyYXkuXG4gKiBAdGVtcGxhdGUgVFxuICovXG5leHBvcnQgY2xhc3MgUHJpb3JpdHlRdWV1ZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFByaW9yaXR5UXVldWUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtBcnJheTx7aXRlbTogVCwgcHJpb3JpdHk6IG51bWJlcn0+fSAqL1xuICAgIHRoaXMucXVldWVfID0gW107XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbWF4IHByaW9yaXR5IGl0ZW0gd2l0aG91dCBkZXF1ZXVlaW5nIGl0LlxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgcGVlaygpIHtcbiAgICBjb25zdCBsID0gdGhpcy5sZW5ndGg7XG4gICAgaWYgKCFsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucXVldWVfW2wgLSAxXS5pdGVtO1xuICB9XG5cbiAgLyoqXG4gICAqIEVucXVldWVzIGFuIGl0ZW0gd2l0aCB0aGUgZ2l2ZW4gcHJpb3JpdHkuXG4gICAqIEBwYXJhbSB7VH0gaXRlbVxuICAgKiBAcGFyYW0ge251bWJlcn0gcHJpb3JpdHlcbiAgICovXG4gIGVucXVldWUoaXRlbSwgcHJpb3JpdHkpIHtcbiAgICBpZiAoaXNOYU4ocHJpb3JpdHkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ByaW9yaXR5IG11c3Qgbm90IGJlIE5hTi4nKTtcbiAgICB9XG4gICAgY29uc3QgaSA9IHRoaXMuYmluYXJ5U2VhcmNoXyhwcmlvcml0eSk7XG4gICAgdGhpcy5xdWV1ZV8uc3BsaWNlKGksIDAsIHtpdGVtLCBwcmlvcml0eX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaW5kZXggYXQgd2hpY2ggaXRlbSB3aXRoIGB0YXJnZXRgIHByaW9yaXR5IHNob3VsZCBiZSBpbnNlcnRlZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRhcmdldFxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBiaW5hcnlTZWFyY2hfKHRhcmdldCkge1xuICAgIGxldCBpID0gLTE7XG4gICAgbGV0IGxvID0gMDtcbiAgICBsZXQgaGkgPSB0aGlzLmxlbmd0aDtcbiAgICB3aGlsZSAobG8gPD0gaGkpIHtcbiAgICAgIGkgPSBNYXRoLmZsb29yKChsbyArIGhpKSAvIDIpO1xuICAgICAgLy8gVGhpcyBtZWFucyBgdGFyZ2V0YCBpcyB0aGUgbmV3IG1heCBwcmlvcml0eSBpbiB0aGUgcXVldWUuXG4gICAgICBpZiAoaSA9PT0gdGhpcy5sZW5ndGgpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICAvLyBTdG9wIHNlYXJjaGluZyBvbmNlIHBbaV0gPj0gdGFyZ2V0IEFORCBwW2ktMV0gPCB0YXJnZXQuXG4gICAgICAvLyBUaGlzIHdheSwgd2UnbGwgcmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgZmlyc3Qgb2NjdXJlbmNlIG9mIGB0YXJnZXRgXG4gICAgICAvLyBwcmlvcml0eSAoaWYgYW55KSwgd2hpY2ggcHJlc2VydmVzIEZJRk8gb3JkZXIgb2Ygc2FtZS1wcmlvcml0eSBpdGVtcy5cbiAgICAgIGlmICh0aGlzLnF1ZXVlX1tpXS5wcmlvcml0eSA8IHRhcmdldCkge1xuICAgICAgICBsbyA9IGkgKyAxO1xuICAgICAgfSBlbHNlIGlmIChpID4gMCAmJiB0aGlzLnF1ZXVlX1tpIC0gMV0ucHJpb3JpdHkgPj0gdGFyZ2V0KSB7XG4gICAgICAgIGhpID0gaSAtIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbihUKX0gY2FsbGJhY2tcbiAgICovXG4gIGZvckVhY2goY2FsbGJhY2spIHtcbiAgICBsZXQgaW5kZXggPSB0aGlzLmxlbmd0aDtcbiAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgY2FsbGJhY2sodGhpcy5xdWV1ZV9baW5kZXhdLml0ZW0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXF1ZXVlcyB0aGUgbWF4IHByaW9yaXR5IGl0ZW0uXG4gICAqIEl0ZW1zIHdpdGggdGhlIHNhbWUgcHJpb3JpdHkgYXJlIGRlcXVldWVkIGluIEZJRk8gb3JkZXIuXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBkZXF1ZXVlKCkge1xuICAgIGlmICghdGhpcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5xdWV1ZV8ucG9wKCkuaXRlbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIGl0ZW1zIGluIHRoZSBxdWV1ZS5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5xdWV1ZV8ubGVuZ3RoO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/data-structures/priority-queue.js