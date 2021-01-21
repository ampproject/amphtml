/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {Pass} from '../pass';
import {Resource, ResourceState} from './resource';
import {VisibilityState} from '../visibility-state';
import {devAssert} from '../log';
import {isConnectedNode} from '../dom';
import {pushIfNotExist, removeItem} from '../utils/array';
import {throttleTail} from '../context/scheduler';

const DEFAULT_LOAD_RANGE = 3;
const DEFAULT_IDLE_RANGE = 10;
const PRIORITY_BASE = 10;
const PRIORITY_PENALTY_TIME = 1000;
const MAX_TASKS_EXEC_IDLE = 2;
const MAX_TASKS_EXEC_ACTIVE = 1000;
const TIMEOUT_THRESHOLD = 16;

/**
 * @typedef {{
 *   resource: !Resource,
 *   force: boolean,
 *   loadRange: number,
 *   idleRange: number,
 *   ranges: !Array<number>,
 *   execTime: time,
 * }}
 */
let TaskDef;

/**
 */
export class LoadScheduler {
  /**
   * @param {!AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!Map<number, !IntersectionObserver>} */
    this.observers_ = new Map();

    /** @private @const {!Map<string, !TaskDef>}  */
    this.tasks_ = new Map();

    /** @private @const {!Array<!TaskDef>} */
    this.queue_ = [];

    /** @private @const {!Array<!TaskDef>} */
    this.executing_ = [];

    /** @private @const {?number} */
    this.firstVisibleTime_ = ampdoc.getFirstVisibleTime();

    /** @const @private {!Pass} */
    this.pass_ = new Pass(
      ampdoc.win,
      () => this.work_(/* idle */ false),
      /* defaultTimeout*/ 1
    );

    const {win} = ampdoc;
    const requestIdle = win.requestIdleCallback
      ? win.requestIdleCallback
      : win.setTimeout;
    /** @private @const {function()} */
    this.scheduleIdle_ = throttleTail(
      () => this.work_(/* idle */ true),
      requestIdle
    );

    this.ampdoc_.onVisibilityChanged(() => this.pass_.schedule());
  }

  /**
   * @param {!Element} element
   * @param {boolean=} force
   */
  schedule(element, force = false) {
    devAssert(element.isLoadableV2());

    const resource = Resource.forElement(element);

    const id = resource.getId();

    // Unschedule to reschedule with the new parameters.
    if (this.tasks_.has(id)) {
      this.unschedule_(resource, /* canceled */ true);
    }

    const loadRange = computeLoadRange(
      element.renderOutsideViewport(),
      DEFAULT_LOAD_RANGE
    );
    const idleRange = computeLoadRange(
      element.idleRenderOutsideViewport(),
      DEFAULT_IDLE_RANGE
    );
    const task = {
      resource,
      force,
      loadRange,
      idleRange,
      ranges: [],
      execTime: 0,
    };
    this.tasks_.set(id, task);

    this.getObserver_(0, /* active */ true).observe(element);
    if (loadRange > 0 && !force) {
      this.getObserver_(loadRange, /* active */ true).observe(element);
    }
    if (idleRange > loadRange && !force) {
      this.getObserver_(idleRange, /* idle */ false).observe(element);
    }
  }

  /**
   * @param {!Element} element
   */
  unschedule(element) {
    devAssert(element.isLoadableV2());
    const resource = Resource.forElementOptional(element);
    if (!resource) {
      return;
    }
    this.unschedule_(resource, /* canceled */ true);
  }

  /**
   * @param {!Resource} resource
   * @param {boolean} canceled
   * @private
   */
  unschedule_(resource, canceled) {
    const id = resource.getId();
    const task = this.tasks_.get(id);
    if (!task) {
      return;
    }

    this.tasks_.delete(id);
    this.dequeueExec_(task, canceled);

    const {force, loadRange, idleRange} = task;
    const {element} = resource;
    this.getObserver_(0, /* active */ true).unobserve(element);
    if (loadRange > 0 && !force) {
      this.getObserver_(loadRange, /* active */ true).unobserve(element);
    }
    if (idleRange > loadRange && !force) {
      this.getObserver_(loadRange, /* active */ true).unobserve(element);
    }
  }

  /**
   * @param {number} range
   * @param {boolean} active
   * @return {!IntersectionObserver}
   */
  getObserver_(range, active) {
    let observer = this.observers_.get(range);
    if (!observer) {
      const {win} = this.ampdoc_;
      const opts = {
        root: win.document,
        rootMargin: `${range * 100}% ${range * 25}%`,
      };
      observer = new win.IntersectionObserver((entries) => {
        const seen = new Set();
        for (let i = entries.length - 1; i >= 0; i--) {
          const entry = entries[i];
          const {target} = entry;
          if (seen.has(target)) {
            continue;
          }
          seen.add(target);
          this.observed_(entry, active, range);
        }
      }, opts);
      this.observers_.set(range, observer);
    }
    return observer;
  }

  /**
   * @param {!IntersectionObserverEntry} entry
   * @param {boolean} active
   * @param {number} range
   * @private
   */
  observed_(entry, active, range) {
    const {target: element, boundingClientRect, intersectionRatio} = entry;

    const resource = Resource.forElementOptional(element);
    if (!resource) {
      return;
    }

    if (!isConnectedNode(element)) {
      this.unschedule_(resource, /* canceled */ true);
      return;
    }

    const id = resource.getId();
    const task = this.tasks_.get(id);
    if (!task) {
      return;
    }

    resource.setLoaderRectV2(boundingClientRect);

    const {ranges} = task;
    if (intersectionRatio > 0) {
      // Insert in a sorted order.
      let insertAt = 0;
      for (
        ;
        insertAt < ranges.length && ranges[insertAt] < range;
        insertAt++
      ) {}
      if (ranges[insertAt] !== range) {
        ranges.splice(insertAt, 0, range);
      }
    } else {
      removeItem(ranges, range);
    }

    if (ranges.length > 0) {
      this.enqueueExec_(task);
    } else {
      this.dequeueExec_(task, /* canceled */ true);
    }
  }

  /**
   * @param {!TaskDef} task
   * @private
   */
  enqueueExec_(task) {
    if (pushIfNotExist(this.queue_, task)) {
      task.resource.layoutScheduled(Date.now());
    }

    if (task.force) {
      this.exec_(task);
    } else {
      this.pass_.schedule();
    }
  }

  /**
   * @param {!TaskDef} task
   * @param {boolean} canceled
   * @private
   */
  dequeueExec_(task, canceled) {
    if (removeItem(this.queue_, task)) {
      if (canceled && task.resource.isLayoutPending()) {
        task.resource.layoutCanceled();
      }
    }
  }

  /**
   * A "pass" callback to process the queued and idle tasks.
   * @param {boolean} idle
   * @private
   */
  work_(idle) {
    const visibilityState = this.ampdoc_.getVisibilityState();
    if (
      visibilityState != VisibilityState.VISIBLE &&
      visibilityState != VisibilityState.PRERENDER
    ) {
      return;
    }

    const timeout = this.processQueue_(idle);

    if (timeout > 0) {
      this.pass_.schedule(timeout);
    } else if (!idle && this.tasks_.size > 0 && this.executing_.length == 0) {
      this.scheduleIdle_();
    }
  }

  /**
   * @param {boolean} idle
   * @return {number}
   * @private
   */
  processQueue_(idle) {
    const maxCount = idle ? MAX_TASKS_EXEC_IDLE : MAX_TASKS_EXEC_ACTIVE;
    let timeout = -1;
    let task = this.peekTask_(idle);
    while (task) {
      timeout = this.calcTaskTimeout_(task);
      if (timeout > TIMEOUT_THRESHOLD) {
        break;
      }

      this.dequeueExec_(task, /* canceled */ false);
      this.exec_(task, idle);

      if (this.executing_.length > maxCount) {
        break;
      }
      task = this.peekTask_(idle);
      timeout = -1;
    }

    return timeout;
  }

  /**
   * @param {boolean} idle
   * @return {?TaskDef}
   * @private
   */
  peekTask_(idle) {
    const isPrerender =
      this.ampdoc_.getVisibilityState() == VisibilityState.PRERENDER;

    let minTask = null;
    let minScore = 0;
    for (let i = 0; i < this.queue_.length; i++) {
      const task = this.queue_[i];
      const {resource, ranges, loadRange} = task;
      const minRange = ranges[0];
      if (minRange > loadRange && !idle) {
        continue;
      }

      if (isPrerender && (minRange > 0 || !resource.prerenderAllowed())) {
        continue;
      }

      const score = resource.getLayoutPriority() * PRIORITY_BASE + minRange;
      if (!minTask || score < minScore) {
        minTask = task;
        minScore = score;
      }
    }
    return minTask;
  }

  /**
   * Calculates the timeout of a task. The timeout depends on two main factors:
   * the priorities of the tasks currently in the execution pool and their age.
   * The timeout is calculated against each task in the execution pool and the
   * maximum value is returned.
   *
   * A task is penalized with higher timeout values when it's lower in priority
   * than the task in the execution pool. However, this penalty is judged
   * against the age of the executing task. If it has been in executing for
   * some time, the penalty is reduced.
   *
   * @param {!TaskDef} task
   * @return {number}
   * @private
   */
  calcTaskTimeout_(task) {
    const now = Date.now();

    if (this.executing_.length == 0) {
      // If we've never been visible, return 0. This follows the previous
      // behavior of not delaying tasks when there's nothing to do.
      if (this.firstVisibleTime_ == null) {
        return 0;
      }

      // Scale off the first visible time, so penalized tasks must wait a
      // second or two to run. After we have been visible for a time, we no
      // longer have to wait.
      const penalty = task.resource.getLayoutPriority() * PRIORITY_PENALTY_TIME;
      return Math.max(penalty - (now - this.firstVisibleTime_), 0);
    }

    let timeout = 0;
    for (let i = 0; i < this.executing_.length; i++) {
      const other = this.executing_[i];
      // Higher priority tasks get the head start. Currently 500ms per a drop
      // in priority (note that priority is 10-based).
      const penalty = Math.max(
        (task.resource.getLayoutPriority() -
          other.resource.getLayoutPriority()) *
          PRIORITY_PENALTY_TIME,
        0
      );
      timeout = Math.max(timeout, penalty - (now - other.execTime));
    }

    return timeout;
  }

  /**
   * @param {!TaskDef} task
   * @return {!Promise}
   * @private
   */
  exec_(task) {
    const {resource} = task;
    this.unschedule_(resource, /* canceled */ false);

    task.execTime = Date.now();
    pushIfNotExist(this.executing_, task);

    if (
      resource.isLayoutPending() &&
      resource.getState() != ResourceState.LAYOUT_SCHEDULED
    ) {
      resource.layoutScheduled(task.execTime);
    }

    return resource.startLayout().then(
      () => this.execComplete_(task),
      (reason) => this.execComplete_(task, reason)
    );
  }

  /**
   * @param {!TaskDef} task
   * @param {*=} opt_failureReason
   * @return {!Promise|undefined}
   * @private
   */
  execComplete_(task, opt_failureReason) {
    removeItem(this.executing_, task);
    this.unschedule_(task.resource, /* canceled */ false);
    this.pass_.schedule();
    if (opt_failureReason) {
      return Promise.reject(opt_failureReason);
    }
  }
}

/**
 * @param {boolean|number} value
 * @param {number} trueValue
 * @return {number}
 */
function computeLoadRange(value, trueValue) {
  if (typeof value == 'boolean') {
    return value ? trueValue - 1 : 0;
  }
  return value - 1;
}
