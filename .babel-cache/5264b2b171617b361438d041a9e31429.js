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
  function TaskQueue() {_classCallCheck(this, TaskQueue);
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
   */_createClass(TaskQueue, [{ key: "getSize", value:
    function getSize() {
      return this.tasks_.length;
    }

    /**
     * Last time a task was enqueued.
     * @return {!time}
     */ }, { key: "getLastEnqueueTime", value:
    function getLastEnqueueTime() {
      return this.lastEnqueueTime_;
    }

    /**
     * Last time a task was dequeued.
     * @return {!time}
     */ }, { key: "getLastDequeueTime", value:
    function getLastDequeueTime() {
      return this.lastDequeueTime_;
    }

    /**
     * Returns the task with the specified ID or null.
     * @param {string} taskId
     * @return {?TaskDef}
     */ }, { key: "getTaskById", value:
    function getTaskById(taskId) {
      return this.taskIdMap_[taskId] || null;
    }

    /**
     * Enqueues the task. If the task is already in the queue, the error is
     * thrown.
     * @param {!TaskDef} task
     */ }, { key: "enqueue", value:
    function enqueue(task) {
      devAssert(!this.taskIdMap_[task.id]);
      this.tasks_.push(task);
      this.taskIdMap_[task.id] = task;
      this.lastEnqueueTime_ = Date.now();
    }

    /**
     * Dequeues the task and returns "true" if dequeueing is successful. Otherwise
     * returns "false", e.g. when this task is not currently enqueued.
     * @param {!TaskDef} task
     * @return {boolean}
     */ }, { key: "dequeue", value:
    function dequeue(task) {
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
     */ }, { key: "peek", value:
    function peek(scorer) {
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
     */ }, { key: "forEach", value:
    function forEach(callback) {
      this.tasks_.forEach(callback);
    }

    /**
     * Removes the task and returns "true" if dequeueing is successful. Otherwise
     * returns "false", e.g. when this task is not currently enqueued.
     * @param {!TaskDef} task
     * @param {number} index of the task to remove.
     * @return {boolean}
     */ }, { key: "removeAtIndex", value:
    function removeAtIndex(task, index) {
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
     */ }, { key: "purge", value:
    function purge(callback) {
      var index = this.tasks_.length;
      while (index--) {
        if (callback(this.tasks_[index])) {
          this.removeAtIndex(this.tasks_[index], index);
        }
      }
    } }]);return TaskQueue;}();
// /Users/mszylkowski/src/amphtml/src/service/task-queue.js