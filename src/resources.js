/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Pass} from './pass';
import {assert} from './asserts';
import {expandLayoutRect, layoutRectLtwh, layoutRectsOverlap} from
    './layout-rect';
import {log} from './log';
import {retriablePromise} from './retriable-promise';
import {timer} from './timer';
import {viewport} from './viewport';

let TAG_ = 'Resources';
let RESOURCE_PROP_ = '__AMP__RESOURCE';
let LAYOUT_TASK_ID_ = 'L';
let LAYOUT_TASK_OFFSET_ = 0;
let PRELOAD_TASK_ID_ = 'P';
let PRELOAD_TASK_OFFSET_ = 2;
let PRIORITY_BASE_ = 10;
let POST_TASK_PASS_DELAY_ = 1000;


/**
 * @param {string} tagName
 * @return {number}
 */
export function getElementPriority(tagName) {
  tagName = tagName.toLowerCase();
  if (tagName == 'amp-ad') {
    return 2;
  }
  if (tagName == 'amp-pixel') {
    return 1;
  }
  return 0;
}


export class Resources {
  constructor(window) {
    /** @const {!Window} */
    this.win = window;

    /** @private @const {number} */
    this.maxDpr_ = this.win.devicePixelRatio || 1;

    /** @private {number} */
    this.resourceIdCounter_ = 0;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private {boolean} */
    this.relayoutAll_ = false;

    /** @private {boolean} */
    this.forceBuild_ = false;

    /** @private {boolean} */
    this.documentReady_ = false;

    /** @private {number} */
    this.lastVelocity_ = 0;

    /** @const {!Pass} */
    this.pass_ = new Pass(() => this.doPass_());

    /** @const {!TaskQueue_} */
    this.exec_ = new TaskQueue_();

    /** @const {!TaskQueue_} */
    this.queue_ = new TaskQueue_();

    viewport.onChanged((event) => {
      this.lastVelocity_ = event.velocity;
      this.relayoutAll_ = this.relayoutAll_ || event.relayoutAll;
      this.schedulePass();
    });

    // Ensure that we attempt to rebuild things when DOM is ready.
    if (this.win.document.readyState != 'loading') {
      this.documentReady_ = true;
      this.forceBuild_ = true;
    } else {
      let readyListener = () => {
        if (this.win.document.readyState != 'loading') {
          this.documentReady_ = true;
          this.forceBuild_ = true;
          this.relayoutAll_ = true;
          this.schedulePass();
          this.win.document.removeEventListener('readystatechange',
              readyListener);
        }
      };
      this.win.document.addEventListener('readystatechange', readyListener);
    }

    this.relayoutAll_ = true;
    this.schedulePass();
  }

  /**
   * Returns the maximum DPR available on this device.
   * @return {number}
   */
  getMaxDpr() {
    return this.maxDpr_;
  }

  /**
   * Returns the most optimal DPR currently recommended.
   * @return {number}
   */
  getDpr() {
    // TODO(dvoytenko): return optimal DPR.
    return this.maxDpr_;
  }

  /**
   * @param {!AmpElement} element
   * @return {?Resource}
   */
  getResourceForElement(element) {
    return assert(/** @type {!Resource} */ (element[RESOURCE_PROP_]));
  }

  /**
   * @param {!AmpElement} element
   */
  add(element) {
    let resource = new Resource((++this.resourceIdCounter_), element);
    if (!element.id) {
      element.id = 'AMP_' + resource.getId();
    }
    element[RESOURCE_PROP_] = resource;
    this.resources_.push(resource);

    // Try to immediately build element, it may already be ready.
    resource.build(this.forceBuild_);

    this.schedulePass();

    log.fine(TAG_, 'element added:', resource.debugid);
  }

  /**
   * @param {!AmpElement} element
   */
  remove(element) {
    let resource = this.getResourceForElement(element);
    let index = resource ? this.resources_.indexOf(resource) : -1;
    if (index != -1) {
      this.resources_.splice(index, 1);
    }
    log.fine(TAG_, 'element removed:', resource.debugid);
  }

  /**
   * @param {!AmpElement} element
   */
  upgraded(element) {
    let resource = this.getResourceForElement(element);
    resource.build(this.forceBuild_);
    log.fine(TAG_, 'element upgraded:', resource.debugid);
  }

  /**
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  scheduleLayout(parentElement, subElements) {
    this.scheduleLayoutOrPreloadForSubresources_(
        this.getResourceForElement(parentElement),
        /* layout */ true,
        elements_(subElements));
  }

  /**
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  schedulePreload(parentElement, subElements) {
    this.scheduleLayoutOrPreloadForSubresources_(
        this.getResourceForElement(parentElement),
        /* layout */ false,
        elements_(subElements));
  }

  /**
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   * @param {boolean} inLocalViewport
   */
  updateInViewport(parentElement, subElements, inLocalViewport) {
    this.updateInViewportForSubresources_(
        this.getResourceForElement(parentElement),
        elements_(subElements),
        inLocalViewport);
  }

  /**
   * @param {number=} opt_delay
   */
  schedulePass(opt_delay) {
    this.pass_.schedule(opt_delay);
  }

  /**
   * @private
   */
  doPass_() {
    let viewportSize = viewport.getSize();
    log.fine(TAG_, 'PASS: forceBuild=', this.forceBuild_,
        ', relayoutAll=', this.relayoutAll_,
        ', viewportSize=', viewportSize.width, viewportSize.height);

    // If viewport size is 0, the manager will wait for the resize event.
    if (viewportSize.height > 0 && viewportSize.width > 0) {
      this.discoverWork_();
      let delay = this.work_();
      log.fine(TAG_, 'next pass:', delay);
      this.schedulePass(delay);
    }
  }

  /** @private */
  discoverWork_() {

    // TODO(dvoytenko): vsync separation may be needed for different phases

    let now = timer.now();

    // Ensure all resources layout phase complete; when relayoutAll is requested
    // force re-layout.
    let relayoutAll = this.relayoutAll_;
    this.relayoutAll_ = false;

    // Phase 1: Build and relayout as needed. All mutations happen here.
    let relayoutCount = 0;
    for (let i = 0; i < this.resources_.length; i++) {
      let r = this.resources_[i];
      if (r.getState() == ResourceState_.NOT_BUILT) {
        r.build(this.forceBuild_);
      }
      if (r.getState() == ResourceState_.NOT_LAID_OUT || relayoutAll) {
        r.applyMediaQuery();
        relayoutCount++;
      }
    }

    // Phase 2: Remeasure if there were any relayouts. Unfortunately, currently
    // there's no way to optimize this. All reads happen here.
    if (relayoutCount > 0 || relayoutAll) {
      for (let i = 0; i < this.resources_.length; i++) {
        let r = this.resources_[i];
        if (r.getState() != ResourceState_.NOT_BUILT) {
          if (r.getState() == ResourceState_.NOT_LAID_OUT || relayoutAll) {
            r.measure();
          }
        }
      }
    }

    var viewportRect = viewport.getRect();
    // Load viewport = viewport + 3x up/down.
    var loadRect = expandLayoutRect(viewportRect, 0.25, 2);
    // Visible viewport = viewport + 25% up/down.
    var visibleRect = expandLayoutRect(viewportRect, 0.25, 0.25);

    // Phase 3: Schedule elements for layout within a reasonable distance from
    // current viewport.
    for (let i = 0; i < this.resources_.length; i++) {
      let r = this.resources_[i];
      if (r.getState() != ResourceState_.READY_FOR_LAYOUT) {
        continue;
      }
      if (r.isDisplayed() && r.overlaps(loadRect)) {
        this.scheduleLayoutOrPreload_(r, /* layout */ true);
      }
    }

    // Phase 4: Trigger "viewport enter/exit" events.
    for (let i = 0; i < this.resources_.length; i++) {
      let r = this.resources_[i];
      var shouldBeInViewport = (r.isDisplayed() && r.overlaps(visibleRect));
      if (r.isInViewport() != shouldBeInViewport) {
        r.setInViewport(shouldBeInViewport);
      }
    }

    // Phase 5: Idle layout: layout more if we are otherwise not doing much.
    // TODO(dvoytenko): document/estimate IDLE timeouts and other constants
    if (this.exec_.getSize() == 0 &&
          this.queue_.getSize() == 0 &&
          now > this.exec_.getLastDequeueTime() + 5000) {
      let idleScheduledCount = 0;
      for (let i = 0; i < this.resources_.length; i++) {
        let r = this.resources_[i];
        if (r.getState() == ResourceState_.READY_FOR_LAYOUT &&
                r.isDisplayed()) {
          log.fine(TAG_, 'idle layout:', r.debugid);
          this.scheduleLayoutOrPreload_(r, /* layout */ false);
          idleScheduledCount++;
          if (idleScheduledCount >= 4) {
            break;
          }
        }
      }
    }
  }

  /**
   * @return {!time}
   * @private
   */
  work_() {
    let now = timer.now();

    let scorer = this.calcTaskScore_.bind(this, viewport.getRect(),
        Math.sign(this.lastVelocity_));

    let timeout = -1;
    let task = this.queue_.peek(scorer);
    if (task) {
      do {
        timeout = this.calcTaskTimeout_(task);
        log.fine(TAG_, 'peek from queue:', task.id,
            'sched at', task.scheduleTime,
            'score', scorer(task),
            'timeout', timeout);
        if (timeout > 16) {
          break;
        }

        this.queue_.dequeue(task);

        // Do not override a task in execution. This task will have to wait
        // until the current one finished the execution.
        let executing = this.exec_.getTaskById(task.id);
        if (!executing) {
          task.promise = task.callback();
          task.startTime = now;
          log.fine(TAG_, 'exec:', task.id, 'at', task.startTime);
          this.exec_.enqueue(task);
          task.promise.then(this.taskComplete_.bind(this, task, true),
              this.taskComplete_.bind(this, task, false));
        } else {
          // Reschedule post execution.
          executing.promise.then(this.reschedule_.bind(this, task),
              this.reschedule_.bind(this, task));
        }

        task = this.queue_.peek(scorer);
        timeout = -1;
      } while (task);
    }

    log.fine(TAG_, 'queue size:', this.queue_.getSize());
    log.fine(TAG_, 'exec size:', this.exec_.getSize());

    if (timeout >= 0) {
      // Work pass.
      return timeout;
    }

    // Idle pass.
    var nextPassDelay = (now - this.exec_.getLastDequeueTime()) * 2;
    nextPassDelay = Math.max(Math.min(30000, nextPassDelay), 5000);
    return nextPassDelay;
  }

  /**
   * @param {!Task_} task
   * @private
   */
  reschedule_(task) {
    if (!this.queue_.getTaskById(task.id)) {
      this.queue_.enqueue(task);
    }
  }

  /**
   * @param {!LayoutRect} viewportRect
   * @param {number} dir
   * @param {!Task_} task
   * @private
   */
  calcTaskScore_(viewportRect, dir, task) {
    let box = task.resource.getLayoutBox();
    let posPriority = Math.floor((box.top - viewportRect.top) /
        viewportRect.height);
    if (posPriority != 0 && Math.sign(posPriority) != dir) {
      posPriority *= 2;
    }
    posPriority = Math.abs(posPriority);
    return task.priority * PRIORITY_BASE_ + posPriority;
  }

  /**
   * @param {!Task_} task
   * @private
   */
  calcTaskTimeout_(task) {
    if (this.exec_.getSize() == 0) {
      if (task.resource.debugid == 'amp-ad#24') {
        console.log('--- amp-ad timeout = 0 b/c exec is empty');
      }
      // XXX: should it be 0 or find a way to delay more?
      return 0;
    }

    let timeout = 0;
    this.exec_.forEach((other) => {
      // Higher priority tasks get the head start. Currently 500ms per a drop
      // in priority (note that priority is 10-based).
      let penalty = Math.max((task.priority - other.priority) /
          PRIORITY_BASE_ * 500, 0);
      if (task.resource.debugid == 'amp-ad#24') {
        console.log('--- amp-ad timeout = 0 b/c penalty = ' + penalty +
            ', exec[0]=', other);
      }

    });

    return Math.max(timer.now() - firstExec.startTime - penalty, 0);
  }

  /**
   * @param {!Task_} task
   * @param {boolean} success
   * @param {*=} opt_reason
   * @return {!Promise|undefined}
   * @private
   */
  taskComplete_(task, success, opt_reason) {
    this.exec_.dequeue(task);
    this.schedulePass(POST_TASK_PASS_DELAY_);
    if (!success) {
      log.error(TAG_, 'task failed:',
          task.id, task.resource.debugid, opt_reason);
      return Promise.reject(opt_reason);
    }
  }

  /**
   * @param {!Resource} resource
   * @param {boolean} layout
   * @param {number=} opt_parentPriority
   * @private
   */
  scheduleLayoutOrPreload_(resource, layout, opt_parentPriority) {
    assert(resource.getState() != ResourceState_.NOT_BUILT &&
        resource.isDisplayed(),
        'Not ready for layout: %s (%s)',
        resource.debugid, resource.getState());
    if (layout) {
      this.schedule_(resource,
          LAYOUT_TASK_ID_, LAYOUT_TASK_OFFSET_,
          opt_parentPriority || 0,
          resource.startLayout.bind(resource));
    } else {
      this.schedule_(resource,
          PRELOAD_TASK_ID_, PRELOAD_TASK_OFFSET_,
          opt_parentPriority || 0,
          resource.startLayout.bind(resource));
    }
  }

  /**
   * @param {!Resource} parentResource
   * @param {boolean} layout
   * @param {!Array<!Element>} subElements
   * @private
   */
  scheduleLayoutOrPreloadForSubresources_(parentResource, layout, subElements) {
    let resources = [];
    this.discoverResourcesForArray_(parentResource, subElements, (resource) => {
      if (resource.getState() != ResourceState_.NOT_BUILT) {
        resources.push(resource);
      }
    });
    if (resources.length > 0) {
      resources.forEach((resource) => {
        resource.measure();
        if (resource.getState() == ResourceState_.READY_FOR_LAYOUT &&
                resource.isDisplayed()) {
          this.scheduleLayoutOrPreload_(resource, layout,
              parentResource.getPriority());
        }
      });
    }
  }

  /**
   * @param {!Resource} resource
   * @param {string} localId
   * @param {number} priorityOffset
   * @param {number} parentPriority
   * @param {function():!Promise} callback
   * @private
   */
  schedule_(resource, localId, priorityOffset, parentPriority, callback) {
    let taskId = resource.debugid + '#' + localId;

    let task = {
      id: taskId,
      resource: resource,
      priority: Math.max(resource.getPriority(), parentPriority) +
          priorityOffset,
      callback: callback,
      scheduleTime: timer.now()
    };
    log.fine(TAG_, 'schedule:', task.id, 'at', task.scheduleTime);

    // Only schedule a new task if there's no one enqueued yet or if this task
    // has a higher priority.
    let queued = this.queue_.getTaskById(taskId);
    if (!queued || task.priority < queued.priority) {
      if (queued) {
        this.queue_.dequeue(queued);
      }
      this.queue_.enqueue(task);
      this.schedulePass(this.calcTaskTimeout_(task));
    }
    task.resource.layoutScheduled();
  }

  /**
   * @param {!Resource} parentResource
   * @param {!Array<!Element>} subElements
   * @param {boolean} inLocalViewport
   * @private
   */
  updateInViewportForSubresources_(parentResource, subElements,
      inLocalViewport) {
    let inViewport = parentResource.isInViewport() && inLocalViewport;
    this.discoverResourcesForArray_(parentResource, subElements, (resource) => {
      resource.setInViewport(inViewport);
    });
  }

  /**
   * @param {!Resource} parentResource
   * @param {!Array<!Element>} elements
   * @param {function(!Resource)} callback
   */
  discoverResourcesForArray_(parentResource, elements, callback) {
    elements.forEach((element) => {
      assert(parentResource.element.contains(element));
      this.discoverResourcesForElement_(element, callback);
    });
  }

  /**
   * @param {!Element} element
   * @param {function(!Resource)} callback
   */
  discoverResourcesForElement_(element, callback) {
    // Breadth-first search.
    if (element.classList.contains('-amp-element')) {
      callback(this.getResourceForElement(element));
    } else {
      let ampElements = element.getElementsByClassName('-amp-element');
      let seen = [];
      for (let i = 0; i < ampElements.length; i++) {
        let ampElement = ampElements[i];
        let covered = false;
        for (let j = 0; j < seen.length; j++) {
          if (seen[j].contains(ampElement)) {
            covered = true;
            break;
          }
        }
        if (!covered) {
          seen.push(ampElement);
          callback(this.getResourceForElement(ampElement));
        }
      }
    }
  }
}


/**
 * A Resource binding for an AmpElement.
 *
 * Visible for testing only!
 */
export class Resource {

  /**
   * @param {number} id
   * @param {!AmpElement} element
   */
  constructor(id, element) {
    /** @private {number} */
    this.id_ = id;

    /* @const {!AmpElement} */
    this.element = element;

    /* @const {string} */
    this.debugid = element.tagName.toLowerCase() + '#' + id;

    /** @const {number} */
    this.priority_ = getElementPriority(element.tagName);

    /* @const {!ResourceState_} */
    this.state_ = element.isBuilt() ? ResourceState_.NOT_LAID_OUT :
        ResourceState_.NOT_BUILT;

    /** @type {?LayoutRect} */
    this.layoutBox_ = layoutRectLtwh(-10000, -10000, 0, 0);

    /** @private {boolean} */
    this.isInViewport_ = false;
  }

  /**
   * @return {number}
   */
  getId() {
    return this.id_;
  }

  /**
   * @return {number}
   */
  getPriority() {
    return this.priority_;
  }

  /**
   * @return {!ResourceState_}
   */
  getState() {
    return this.state_;
  }

  /**
   * @param {boolean} force
   * @return {boolean}
   */
  build(force) {
    if (!this.element.isUpgraded()) {
      // Build on unupgraded element is never allowed.
      return false;
    }
    if (!this.element.build(force)) {
      return false;
    }
    this.state_ = ResourceState_.NOT_LAID_OUT;
    return true;
  }

  /**
   * If the resource has a media attribute, evaluates the value as a media
   * query and based on the result adds or removes the class
   * `-amp-hidden-by-media-query`. The class adds display:none to the element
   * which in turn prevents any of the resource loading to happen for the
   * element.
   * @private
   */
  applyMediaQuery() {
    var mediaQuery = this.element.getAttribute('media');
    if (!mediaQuery) {
      return;
    }
    if (this.element.ownerDocument.defaultView
        .matchMedia(mediaQuery).matches) {
      log.fine(TAG_, 'media match:', this.debugid)
      this.element.classList.remove('-amp-hidden-by-media-query')
    } else {
      log.fine(TAG_, 'media no match:', this.debugid)
      this.element.classList.add('-amp-hidden-by-media-query');
    }
  }

  /** */
  measure() {
    assert(this.element.isUpgraded(), 'Must be upgraded to measure: %s',
        this.debugid);
    if (this.state_ == ResourceState_.NOT_BUILT) {
      // Can't measure unbuilt element.
      return;
    }
    let box = viewport.getLayoutRect(this.element);
    if (this.state_ == ResourceState_.NOT_LAID_OUT ||
          this.layoutBox_.top != box.top ||
          this.layoutBox_.left != box.left ||
          this.layoutBox_.width != box.width ||
          this.layoutBox_.height != box.height) {
      this.layoutBox_ = box;
      this.state_ = ResourceState_.READY_FOR_LAYOUT;
    }
  }

  /**
   * Notice! Calling this method before measure() was called may cause relayout.
   * @return {!LayoutRect}
   */
  getLayoutBox() {
    return this.layoutBox_;
  }

  /**
   * @return {boolean}
   */
  isDisplayed() {
    return this.layoutBox_.height > 0 && this.layoutBox_.width > 0;
  }

  /**
   * @param {!LayoutRect} rect
   * @return {boolean}
   */
  overlaps(rect) {
    return layoutRectsOverlap(this.layoutBox_, rect);
  }

  /** */
  layoutScheduled() {
    this.state_ = ResourceState_.LAYOUT_SCHEDULED;
  }

  /**
   * @return {!Promise}
   */
  startLayout() {
    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }
    if (this.state_ == ResourceState_.LAYOUT_COMPLETE) {
      return Promise.resolve();
    }
    if (this.state_ == ResourceState_.LAYOUT_FAILED) {
      return Promise.reject('already failed');
    }

    assert(this.state_ != ResourceState_.NOT_BUILT && this.isDisplayed(),
        'Not ready to start layout: %s (%s)', this.debugid, this.state_);

    // Double check that the element has not disappeared since scheduling
    this.measure();
    if (this.state_ != ResourceState_.READY_FOR_LAYOUT) {
      log.fine(TAG_, 'layout canceled due to element loosing display:',
          this.debugid, this.state_);
      return Promise.resolve();
    }

    log.fine(TAG_, 'start layout:', this.debugid);

    let promise = retriablePromise(() => {
      return this.element.layoutCallback();
    }, /* maxAttempts */ 2, /* delay */ 5000, /* backoffFactor */ 1.5);
    this.layoutPromise_ = promise.then(() => this.layoutComplete_(true),
        (reason) => this.layoutComplete_(false, reason));
    return this.layoutPromise_;
  }

  /**
   * @param {boolean} success
   * @param {*=} opt_reason
   * @return {!Promise|undefined}
   */
  layoutComplete_(success, opt_reason) {
    this.layoutPromise_ = null;
    this.state_ = success ? ResourceState_.LAYOUT_COMPLETE :
        ResourceState_.LAYOUT_FAILED;
    if (success) {
      log.fine(TAG_, 'layout complete:', this.debugid);
    } else {
      log.fine(TAG_, 'loading failed:', this.debugid, opt_reason);
      return Promise.reject(opt_reason);
    }
  }

  /**
   * @return {boolean}
   */
  isInViewport() {
    return this.isInViewport_;
  }

  /**
   * @param {boolean} inViewport
   */
  setInViewport(inViewport) {
    if (inViewport == this.isInViewport_) {
      return;
    }
    if (this.state_ == ResourceState_.NOT_BUILT) {
      // Can't send any events to unbuilt element.
      return;
    }
    log.fine(TAG_, 'inViewport:', this.debugid, inViewport);
    this.isInViewport_ = inViewport;
    this.element.viewportCallback(inViewport);
  }
}


/**
 * A scheduling queue for Resources.
 *
 * Visible only for testing!
 *
 * @private
 */
export class TaskQueue_ {

  constructor() {
    /** @private @const {!Array<!Task_>} */
    this.tasks_ = [];

    /** @private @const {!Object<string, !Task_>} */
    this.taskIdMap_ = {};

    /** @private {!time} */
    this.lastEnqueueTime_ = 0;

    /** @private {!time} */
    this.lastDequeueTime_ = 0;
  }

  /**
   * @return {number}
   */
  getSize() {
    return this.tasks_.length;
  }

  /**
   * @return {!time}
   */
  getLastEnqueueTime() {
    return this.lastEnqueueTime_;
  }

  /**
   * @return {!time}
   */
  getLastDequeueTime() {
    return this.lastDequeueTime_;
  }

  /**
   * @param {string} taskId
   * @return {!Task_}
   */
  getTaskById(taskId) {
    return this.taskIdMap_[taskId];
  }

  /**
   * Enqueues the task. If the task is already in the queue, the error is
   * thrown.
   * @param {!Task_} task
   */
  enqueue(task) {
    assert(!this.taskIdMap_[task.id], 'task already enqueued: %s for %s',
        task.id, task.resource.debugid);
    this.tasks_.push(task);
    this.taskIdMap_[task.id] = task;
    this.lastEnqueueTime_ = timer.now();
  }

  /**
   * Dequeues the task and returns "true" if dequeueing is successful. Otherwise
   * returns "false", e.g. when this task is not currently enqueued.
   * @param {!Task_} task
   * @return {boolean}
   */
  dequeue(task) {
    let existing = this.taskIdMap_[task.id];
    if (!existing) {
      return false;
    }
    this.tasks_.splice(this.tasks_.indexOf(existing), 1);
    delete this.taskIdMap_[task.id];
    this.lastDequeueTime_ = timer.now();
    return true;
  }

  /**
   * Returns the task with the minimal score based on the provided scroing
   * callback.
   * @param {function(!Task_):number} scorer
   * @return {?Task_}
   */
  peek(scorer) {
    let minScore = 1e6;
    let minTask = null;
    for (let i = 0; i < this.tasks_.length; i++) {
      let task = this.tasks_[i];
      let score = scorer(task);
      if (score < minScore) {
        minScore = score;
        minTask = task;
      }
    }
    return minTask;
  }

  /**
   * Iterates over all tasks in queue in the insertion order.
   * @param {function(!Task_)} callback
   */
  forEach(callback) {
    this.tasks_.forEach(callback);
  }
}


/**
 * @param {!Element|!Array<!Element>} elements
 * @return {!Array<!Element>}
 */
function elements_(elements) {
  if (elements.length !== undefined) {
    return elements;
  }
  return [elements];
}


/**
 * @enum {number}
 * @private
 */
var ResourceState_ = {
  NOT_BUILT: 0,
  NOT_LAID_OUT: 1,
  READY_FOR_LAYOUT: 2,
  LAYOUT_SCHEDULED: 3,
  LAYOUT_COMPLETE: 4,
  LAYOUT_FAILED: 5
};


/**
 * @typedef {{
 *   id: string,
 *   resource: !Resource,
 *   priority: number,
 *   callback: function(),
 *   scheduleTime: time,
 *   startTime: time,
 *   promise: (!Promise|undefined)
 * }}
 * @private
 */
var Task_;


export const resources = new Resources(window);
