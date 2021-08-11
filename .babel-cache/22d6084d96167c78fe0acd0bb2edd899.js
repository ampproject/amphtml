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
import { devAssert } from "../log";

/**
 * The internal structure for the task.
 * @typedef {{
 *   id: string,
 *   resource: !./resource.Resource,
 *   priority: number,
 *   forceOutsideViewport: boolean,
 *   callback: function(),
 *   scheduleTime: time,
 *   startTime: time,
 *   promise: (?Promise|undefined)
 * }}
 */
export var TaskDef;

/**
 * A scheduling queue for Resources.
 *
 * @package
 */
export var TaskQueue = /*#__PURE__*/function () {
  /**
   * Creates an instance of TaskQueue.
   */
  function TaskQueue() {
    _classCallCheck(this, TaskQueue);

    /** @private @const {!Array<!TaskDef>} */
    this.tasks_ = [];

    /** @private @const {!Object<string, !TaskDef>} */
    this.taskIdMap_ = {};

    /** @private {!time} */
    this.lastEnqueueTime_ = 0;

    /** @private {!time} */
    this.lastDequeueTime_ = 0;
  }

  /**
   * Size of the queue.
   * @return {number}
   */
  _createClass(TaskQueue, [{
    key: "getSize",
    value: function getSize() {
      return this.tasks_.length;
    }
    /**
     * Last time a task was enqueued.
     * @return {!time}
     */

  }, {
    key: "getLastEnqueueTime",
    value: function getLastEnqueueTime() {
      return this.lastEnqueueTime_;
    }
    /**
     * Last time a task was dequeued.
     * @return {!time}
     */

  }, {
    key: "getLastDequeueTime",
    value: function getLastDequeueTime() {
      return this.lastDequeueTime_;
    }
    /**
     * Returns the task with the specified ID or null.
     * @param {string} taskId
     * @return {?TaskDef}
     */

  }, {
    key: "getTaskById",
    value: function getTaskById(taskId) {
      return this.taskIdMap_[taskId] || null;
    }
    /**
     * Enqueues the task. If the task is already in the queue, the error is
     * thrown.
     * @param {!TaskDef} task
     */

  }, {
    key: "enqueue",
    value: function enqueue(task) {
      devAssert(!this.taskIdMap_[task.id], 'Task already enqueued: %s', task.id);
      this.tasks_.push(task);
      this.taskIdMap_[task.id] = task;
      this.lastEnqueueTime_ = Date.now();
    }
    /**
     * Dequeues the task and returns "true" if dequeueing is successful. Otherwise
     * returns "false", e.g. when this task is not currently enqueued.
     * @param {!TaskDef} task
     * @return {boolean}
     */

  }, {
    key: "dequeue",
    value: function dequeue(task) {
      var existing = this.taskIdMap_[task.id];
      var dequeued = this.removeAtIndex(task, this.tasks_.indexOf(existing));

      if (!dequeued) {
        return false;
      }

      this.lastDequeueTime_ = Date.now();
      return true;
    }
    /**
     * Returns the task with the minimal score based on the provided scoring
     * callback.
     * @param {function(!TaskDef):number} scorer
     * @return {?TaskDef}
     */

  }, {
    key: "peek",
    value: function peek(scorer) {
      var minScore = 1e6;
      var minTask = null;

      for (var i = 0; i < this.tasks_.length; i++) {
        var task = this.tasks_[i];
        var score = scorer(task);

        if (score < minScore) {
          minScore = score;
          minTask = task;
        }
      }

      return minTask;
    }
    /**
     * Iterates over all tasks in queue in the insertion order.
     * @param {function(!TaskDef)} callback
     */

  }, {
    key: "forEach",
    value: function forEach(callback) {
      this.tasks_.forEach(callback);
    }
    /**
     * Removes the task and returns "true" if dequeueing is successful. Otherwise
     * returns "false", e.g. when this task is not currently enqueued.
     * @param {!TaskDef} task
     * @param {number} index of the task to remove.
     * @return {boolean}
     */

  }, {
    key: "removeAtIndex",
    value: function removeAtIndex(task, index) {
      var existing = this.taskIdMap_[task.id];

      if (!existing || this.tasks_[index] != existing) {
        return false;
      }

      this.tasks_.splice(index, 1);
      delete this.taskIdMap_[task.id];
      return true;
    }
    /**
     * Removes tasks in queue that pass the callback test.
     * @param {function(!TaskDef):boolean} callback Return true to remove the task.
     */

  }, {
    key: "purge",
    value: function purge(callback) {
      var index = this.tasks_.length;

      while (index--) {
        if (callback(this.tasks_[index])) {
          this.removeAtIndex(this.tasks_[index], index);
        }
      }
    }
  }]);

  return TaskQueue;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhc2stcXVldWUuanMiXSwibmFtZXMiOlsiZGV2QXNzZXJ0IiwiVGFza0RlZiIsIlRhc2tRdWV1ZSIsInRhc2tzXyIsInRhc2tJZE1hcF8iLCJsYXN0RW5xdWV1ZVRpbWVfIiwibGFzdERlcXVldWVUaW1lXyIsImxlbmd0aCIsInRhc2tJZCIsInRhc2siLCJpZCIsInB1c2giLCJEYXRlIiwibm93IiwiZXhpc3RpbmciLCJkZXF1ZXVlZCIsInJlbW92ZUF0SW5kZXgiLCJpbmRleE9mIiwic2NvcmVyIiwibWluU2NvcmUiLCJtaW5UYXNrIiwiaSIsInNjb3JlIiwiY2FsbGJhY2siLCJmb3JFYWNoIiwiaW5kZXgiLCJzcGxpY2UiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLE9BQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLFNBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSx1QkFBYztBQUFBOztBQUNaO0FBQ0EsU0FBS0MsTUFBTCxHQUFjLEVBQWQ7O0FBRUE7QUFDQSxTQUFLQyxVQUFMLEdBQWtCLEVBQWxCOztBQUVBO0FBQ0EsU0FBS0MsZ0JBQUwsR0FBd0IsQ0FBeEI7O0FBRUE7QUFDQSxTQUFLQyxnQkFBTCxHQUF3QixDQUF4QjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBckJBO0FBQUE7QUFBQSxXQXNCRSxtQkFBVTtBQUNSLGFBQU8sS0FBS0gsTUFBTCxDQUFZSSxNQUFuQjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBN0JBO0FBQUE7QUFBQSxXQThCRSw4QkFBcUI7QUFDbkIsYUFBTyxLQUFLRixnQkFBWjtBQUNEO0FB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QUFBQSxXQWdJRSxlQUFNYSxRQUFOLEVBQWdCO0FBQ2QsVUFBSUUsS0FBSyxHQUFHLEtBQUt0QixNQUFMLENBQVlJLE1BQXhCOztBQUNBLGFBQU9rQixLQUFLLEVBQVosRUFBZ0I7QUFDZCxZQUFJRixRQUFRLENBQUMsS0FBS3BCLE1BQUwsQ0FBWXNCLEtBQVosQ0FBRCxDQUFaLEVBQWtDO0FBQ2hDLGVBQUtULGFBQUwsQ0FBbUIsS0FBS2IsTUFBTCxDQUFZc0IsS0FBWixDQUFuQixFQUF1Q0EsS0FBdkM7QUFDRDtBQUNGO0FBQ0Y7QUF2SUg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2RldkFzc2VydH0gZnJvbSAnLi4vbG9nJztcblxuLyoqXG4gKiBUaGUgaW50ZXJuYWwgc3RydWN0dXJlIGZvciB0aGUgdGFzay5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGlkOiBzdHJpbmcsXG4gKiAgIHJlc291cmNlOiAhLi9yZXNvdXJjZS5SZXNvdXJjZSxcbiAqICAgcHJpb3JpdHk6IG51bWJlcixcbiAqICAgZm9yY2VPdXRzaWRlVmlld3BvcnQ6IGJvb2xlYW4sXG4gKiAgIGNhbGxiYWNrOiBmdW5jdGlvbigpLFxuICogICBzY2hlZHVsZVRpbWU6IHRpbWUsXG4gKiAgIHN0YXJ0VGltZTogdGltZSxcbiAqICAgcHJvbWlzZTogKD9Qcm9taXNlfHVuZGVmaW5lZClcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgVGFza0RlZjtcblxuLyoqXG4gKiBBIHNjaGVkdWxpbmcgcXVldWUgZm9yIFJlc291cmNlcy5cbiAqXG4gKiBAcGFja2FnZVxuICovXG5leHBvcnQgY2xhc3MgVGFza1F1ZXVlIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgVGFza1F1ZXVlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUFycmF5PCFUYXNrRGVmPn0gKi9cbiAgICB0aGlzLnRhc2tzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsICFUYXNrRGVmPn0gKi9cbiAgICB0aGlzLnRhc2tJZE1hcF8gPSB7fTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IXRpbWV9ICovXG4gICAgdGhpcy5sYXN0RW5xdWV1ZVRpbWVfID0gMDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IXRpbWV9ICovXG4gICAgdGhpcy5sYXN0RGVxdWV1ZVRpbWVfID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaXplIG9mIHRoZSBxdWV1ZS5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0U2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy50YXNrc18ubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIExhc3QgdGltZSBhIHRhc2sgd2FzIGVucXVldWVkLlxuICAgKiBAcmV0dXJuIHshdGltZX1cbiAgICovXG4gIGdldExhc3RFbnF1ZXVlVGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0RW5xdWV1ZVRpbWVfO1xuICB9XG5cbiAgLyoqXG4gICAqIExhc3QgdGltZSBhIHRhc2sgd2FzIGRlcXVldWVkLlxuICAgKiBAcmV0dXJuIHshdGltZX1cbiAgICovXG4gIGdldExhc3REZXF1ZXVlVGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0RGVxdWV1ZVRpbWVfO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRhc2sgd2l0aCB0aGUgc3BlY2lmaWVkIElEIG9yIG51bGwuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXNrSWRcbiAgICogQHJldHVybiB7P1Rhc2tEZWZ9XG4gICAqL1xuICBnZXRUYXNrQnlJZCh0YXNrSWQpIHtcbiAgICByZXR1cm4gdGhpcy50YXNrSWRNYXBfW3Rhc2tJZF0gfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnF1ZXVlcyB0aGUgdGFzay4gSWYgdGhlIHRhc2sgaXMgYWxyZWFkeSBpbiB0aGUgcXVldWUsIHRoZSBlcnJvciBpc1xuICAgKiB0aHJvd24uXG4gICAqIEBwYXJhbSB7IVRhc2tEZWZ9IHRhc2tcbiAgICovXG4gIGVucXVldWUodGFzaykge1xuICAgIGRldkFzc2VydCghdGhpcy50YXNrSWRNYXBfW3Rhc2suaWRdLCAnVGFzayBhbHJlYWR5IGVucXVldWVkOiAlcycsIHRhc2suaWQpO1xuICAgIHRoaXMudGFza3NfLnB1c2godGFzayk7XG4gICAgdGhpcy50YXNrSWRNYXBfW3Rhc2suaWRdID0gdGFzaztcbiAgICB0aGlzLmxhc3RFbnF1ZXVlVGltZV8gPSBEYXRlLm5vdygpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlcXVldWVzIHRoZSB0YXNrIGFuZCByZXR1cm5zIFwidHJ1ZVwiIGlmIGRlcXVldWVpbmcgaXMgc3VjY2Vzc2Z1bC4gT3RoZXJ3aXNlXG4gICAqIHJldHVybnMgXCJmYWxzZVwiLCBlLmcuIHdoZW4gdGhpcyB0YXNrIGlzIG5vdCBjdXJyZW50bHkgZW5xdWV1ZWQuXG4gICAqIEBwYXJhbSB7IVRhc2tEZWZ9IHRhc2tcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGRlcXVldWUodGFzaykge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy50YXNrSWRNYXBfW3Rhc2suaWRdO1xuICAgIGNvbnN0IGRlcXVldWVkID0gdGhpcy5yZW1vdmVBdEluZGV4KHRhc2ssIHRoaXMudGFza3NfLmluZGV4T2YoZXhpc3RpbmcpKTtcbiAgICBpZiAoIWRlcXVldWVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMubGFzdERlcXVldWVUaW1lXyA9IERhdGUubm93KCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdGFzayB3aXRoIHRoZSBtaW5pbWFsIHNjb3JlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBzY29yaW5nXG4gICAqIGNhbGxiYWNrLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFUYXNrRGVmKTpudW1iZXJ9IHNjb3JlclxuICAgKiBAcmV0dXJuIHs/VGFza0RlZn1cbiAgICovXG4gIHBlZWsoc2NvcmVyKSB7XG4gICAgbGV0IG1pblNjb3JlID0gMWU2O1xuICAgIGxldCBtaW5UYXNrID0gbnVsbDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGFza3NfLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB0YXNrID0gdGhpcy50YXNrc19baV07XG4gICAgICBjb25zdCBzY29yZSA9IHNjb3Jlcih0YXNrKTtcbiAgICAgIGlmIChzY29yZSA8IG1pblNjb3JlKSB7XG4gICAgICAgIG1pblNjb3JlID0gc2NvcmU7XG4gICAgICAgIG1pblRhc2sgPSB0YXNrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWluVGFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyBvdmVyIGFsbCB0YXNrcyBpbiBxdWV1ZSBpbiB0aGUgaW5zZXJ0aW9uIG9yZGVyLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFUYXNrRGVmKX0gY2FsbGJhY2tcbiAgICovXG4gIGZvckVhY2goY2FsbGJhY2spIHtcbiAgICB0aGlzLnRhc2tzXy5mb3JFYWNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB0YXNrIGFuZCByZXR1cm5zIFwidHJ1ZVwiIGlmIGRlcXVldWVpbmcgaXMgc3VjY2Vzc2Z1bC4gT3RoZXJ3aXNlXG4gICAqIHJldHVybnMgXCJmYWxzZVwiLCBlLmcuIHdoZW4gdGhpcyB0YXNrIGlzIG5vdCBjdXJyZW50bHkgZW5xdWV1ZWQuXG4gICAqIEBwYXJhbSB7IVRhc2tEZWZ9IHRhc2tcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IG9mIHRoZSB0YXNrIHRvIHJlbW92ZS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHJlbW92ZUF0SW5kZXgodGFzaywgaW5kZXgpIHtcbiAgICBjb25zdCBleGlzdGluZyA9IHRoaXMudGFza0lkTWFwX1t0YXNrLmlkXTtcbiAgICBpZiAoIWV4aXN0aW5nIHx8IHRoaXMudGFza3NfW2luZGV4XSAhPSBleGlzdGluZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLnRhc2tzXy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGRlbGV0ZSB0aGlzLnRhc2tJZE1hcF9bdGFzay5pZF07XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0YXNrcyBpbiBxdWV1ZSB0aGF0IHBhc3MgdGhlIGNhbGxiYWNrIHRlc3QuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVRhc2tEZWYpOmJvb2xlYW59IGNhbGxiYWNrIFJldHVybiB0cnVlIHRvIHJlbW92ZSB0aGUgdGFzay5cbiAgICovXG4gIHB1cmdlKGNhbGxiYWNrKSB7XG4gICAgbGV0IGluZGV4ID0gdGhpcy50YXNrc18ubGVuZ3RoO1xuICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICBpZiAoY2FsbGJhY2sodGhpcy50YXNrc19baW5kZXhdKSkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0SW5kZXgodGhpcy50YXNrc19baW5kZXhdLCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/task-queue.js