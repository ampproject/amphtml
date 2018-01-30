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

import {dev} from '../log';


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
export let TaskDef;

/**
 * @typedef {Object<string, *>}
 */
let PeekStateDef;



/**
 * A scheduling queue for Resources.
 *
 * @package
 */
export class TaskQueue {

  constructor() {
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
  getSize() {
    return this.tasks_.length;
  }

  /**
   * Last time a task was enqueued.
   * @return {!time}
   */
  getLastEnqueueTime() {
    return this.lastEnqueueTime_;
  }

  /**
   * Last time a task was dequeued.
   * @return {!time}
   */
  getLastDequeueTime() {
    return this.lastDequeueTime_;
  }

  /**
   * Returns the task with the specified ID or null.
   * @param {string} taskId
   * @return {?TaskDef}
   */
  getTaskById(taskId) {
    return this.taskIdMap_[taskId] || null;
  }

  /**
   * Enqueues the task. If the task is already in the queue, the error is
   * thrown.
   * @param {!TaskDef} task
   */
  enqueue(task) {
    dev().assert(
        !this.taskIdMap_[task.id], 'Task already enqueued: %s', task.id);
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
  dequeue(task) {
    const existing = this.taskIdMap_[task.id];
    const dequeued = this.removeAtIndex(task, this.tasks_.indexOf(existing));
    if (!dequeued) {
      return false;
    }
    this.lastDequeueTime_ = Date.now();
    return true;
  }

  /**
   * Returns the task with the minimal score based on the provided scoring
   * callback.
   * @param {function(!TaskDef, !PeekStateDef):number} scorer
   * @param {!PeekStateDef} state
   * @return {?TaskDef}
   */
  peek(scorer, state) {
    let minScore = 1e6;
    let minTask = null;
    for (let i = 0; i < this.tasks_.length; i++) {
      const task = this.tasks_[i];
      const score = scorer(task, state);
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
  forEach(callback) {
    this.tasks_.forEach(callback);
  }

  /**
   * Removes the task and returns "true" if dequeueing is successful. Otherwise
   * returns "false", e.g. when this task is not currently enqueued.
   * @param {!TaskDef} task
   * @param {number} index of the task to remove.
   * @return {boolean}
   */
  removeAtIndex(task, index) {
    const existing = this.taskIdMap_[task.id];
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
  purge(callback) {
    let index = this.tasks_.length;
    while (index--) {
      if (callback(this.tasks_[index])) {
        this.removeAtIndex(this.tasks_[index], index);
      }
    }
  }
}
