import {devAssert} from '#utils/log';

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
 * A scheduling queue for Resources.
 *
 * @package
 */
export class TaskQueue {
  /**
   * Creates an instance of TaskQueue.
   */
  constructor() {
    /** @private @const {!Array<!TaskDef>} */
    this.tasks_ = [];

    /** @private @const {!{[key: string]: !TaskDef}} */
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
   * @param {function(!TaskDef):number} scorer
   * @return {?TaskDef}
   */
  peek(scorer) {
    let minScore = 1e6;
    let minTask = null;
    for (let i = 0; i < this.tasks_.length; i++) {
      const task = this.tasks_[i];
      const score = scorer(task);
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
