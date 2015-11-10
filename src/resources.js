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

import {FocusHistory} from './focus-history';
import {Pass} from './pass';
import {assert} from './asserts';
import {expandLayoutRect, layoutRectLtwh, layoutRectsOverlap} from
    './layout-rect';
import {inputFor} from './input';
import {log} from './log';
import {documentStateFor} from './document-state';
import {getService} from './service';
import {makeBodyVisible} from './styles';
import {reportError} from './error';
import {timer} from './timer';
import {viewerFor} from './viewer';
import {viewportFor} from './viewport';
import {vsyncFor} from './vsync';

const TAG_ = 'Resources';
const RESOURCE_PROP_ = '__AMP__RESOURCE';
const OWNER_PROP_ = '__AMP__OWNER';
const LAYOUT_TASK_ID_ = 'L';
const LAYOUT_TASK_OFFSET_ = 0;
const PRELOAD_TASK_ID_ = 'P';
const PRELOAD_TASK_OFFSET_ = 2;
const PRIORITY_BASE_ = 10;
const PRIORITY_PENALTY_TIME_ = 1000;
const POST_TASK_PASS_DELAY_ = 1000;
const MUTATE_DEFER_DELAY_ = 500;
const FOCUS_HISTORY_TIMEOUT_ = 1000 * 60;  // 1min


/**
 * Returns the element-based priority. A value from 0 to 10.
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

    /** @const {!Viewer} */
    this.viewer_ = viewerFor(window);

    /** @private {boolean} */
    this.isRuntimeOn_ = this.viewer_.isRuntimeOn();

    /** @private @const {number} */
    this.maxDpr_ = this.win.devicePixelRatio || 1;

    /** @private {number} */
    this.resourceIdCounter_ = 0;

    /** @private @const {!Array<!Resource>} */
    this.resources_ = [];

    /** @private {boolean} */
    this.visible_ = this.viewer_.isVisible();

    /** @private {number} */
    this.prerenderSize_ = this.viewer_.getPrerenderSize();

    /** @private {boolean} */
    this.documentReady_ = false;

    /**
     * We want to do some work in the first pass after
     * the document is ready.
     * @private {boolean}
     */
    this.firstPassAfterDocumentReady_ = true;

    /** @private {boolean} */
    this.relayoutAll_ = false;

    /** @private {number} */
    this.relayoutTop_ = -1;

    /** @private {boolean} */
    this.forceBuild_ = false;

    /** @private {time} */
    this.lastScrollTime_ = 0;

    /** @private {number} */
    this.lastVelocity_ = 0;

    /** @const {!Pass} */
    this.pass_ = new Pass(() => this.doPass_());

    /** @const {!TaskQueue_} */
    this.exec_ = new TaskQueue_();

    /** @const {!TaskQueue_} */
    this.queue_ = new TaskQueue_();

    /**
     * @private {!Array<{resource: !Resource, newHeight: number,
     *     force: boolean, fallback:?function(number)}>}
     */
    this.changeHeightRequests_ = [];

    /** @private {!Array<!Function>} */
    this.deferredMutates_ = [];

    /** @private {number} */
    this.scrollHeight_ = 0;

    /** @private @const {!Viewport} */
    this.viewport_ = viewportFor(this.win);

    /** @private @const {!Vsync} */
    this.vsync_ = vsyncFor(this.win);

    /** @private @const {!DocumentState} */
    this.docState_ = documentStateFor(this.win);

    /** @private @const {!FocusHistory} */
    this.activeHistory_ = new FocusHistory(this.win, FOCUS_HISTORY_TIMEOUT_);

    /** @private {boolean} */
    this.vsyncScheduled_ = false;

    // When viewport is resized, we have to re-measure all elements.
    this.viewport_.onChanged(event => {
      this.lastScrollTime_ = timer.now();
      this.lastVelocity_ = event.velocity;
      this.relayoutAll_ = this.relayoutAll_ || event.relayoutAll;
      this.schedulePass();
    });
    this.viewport_.onScroll(() => {
      this.lastScrollTime_ = timer.now();
    });

    // Ensure that we attempt to rebuild things when DOM is ready.
    this.docState_.onReady(() => {
      this.documentReady_ = true;
      this.forceBuild_ = true;
      this.relayoutAll_ = true;
      this.schedulePass();
      this.monitorInput_();
    });

    // When document becomes visible, e.g. from "prerender" mode, do a
    // simple pass.
    this.viewer_.onVisibilityChanged(() => {
      this.schedulePass();
    });

    this.viewer_.onRuntimeState(state => {
      log.fine(TAG_, 'Runtime state:', state);
      this.isRuntimeOn_ = state;
      this.schedulePass(1);
    });

    this.relayoutAll_ = true;
    this.schedulePass();
  }

  /**
   * Returns a list of resources.
   * @return {!Array<!Resource>}
   * @export
   */
  get() {
    return this.resources_.slice(0);
  }

  /** @private */
  monitorInput_() {
    const input = inputFor(this.win);
    input.onTouchDetected(detected => {
      this.toggleInputClass_('amp-mode-touch', detected);
    }, true);
    input.onMouseDetected(detected => {
      this.toggleInputClass_('amp-mode-mouse', detected);
    }, true);
    input.onKeyboardStateChanged(active => {
      this.toggleInputClass_('amp-mode-keyboard-active', active);
    }, true);
  }

  /**
   * @param {string} clazz
   * @param {boolean} on
   * @private
   */
  toggleInputClass_(clazz, on) {
    this.vsync_.mutate(() => {
      this.win.document.body.classList.toggle(clazz, on);
    });
  }

  /** @private */
  updateScrollHeight_() {
    if (!this.win.document.body) {
      return;
    }
    const scrollHeight = this.win.document.body./*OK*/scrollHeight;
    if (scrollHeight != this./*OK*/scrollHeight_) {
      this./*OK*/scrollHeight_ = scrollHeight;
      this.viewer_.postDocumentResized(this.viewport_.getSize().width,
          scrollHeight);
    }
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
   * Returns the {@link Resource} instance corresponding to the specified AMP
   * Element. If no Resource is found, the exception is thrown.
   * @param {!AmpElement} element
   * @return {?Resource}
   * @package
   */
  getResourceForElement(element) {
    return assert(/** @type {!Resource} */ (element[RESOURCE_PROP_]),
        'Missing resource prop on %s', element);
  }

  /**
   * Signals that an element has been added to the DOM. Resources manager
   * will start tracking it from this point on.
   * @param {!AmpElement} element
   * @package
   */
  add(element) {
    const resource = new Resource((++this.resourceIdCounter_), element, this);
    if (!element.id) {
      element.id = 'AMP_' + resource.getId();
    }
    element[RESOURCE_PROP_] = resource;
    this.resources_.push(resource);

    if (this.isRuntimeOn_) {
      // Try to immediately build element, it may already be ready.
      resource.build(this.forceBuild_);
      this.schedulePass();
    }

    log.fine(TAG_, 'element added:', resource.debugid);
  }

  /**
   * Signals that an element has been removed to the DOM. Resources manager
   * will stop tracking it from this point on.
   * @param {!AmpElement} element
   * @package
   */
  remove(element) {
    const resource = this.getResourceForElement(element);
    const index = resource ? this.resources_.indexOf(resource) : -1;
    if (index != -1) {
      this.resources_.splice(index, 1);
    }
    log.fine(TAG_, 'element removed:', resource.debugid);
  }

  /**
   * Signals that an element has been upgraded to the DOM. Resources manager
   * will perform build and enable layout/viewport signals for this element.
   * @param {!AmpElement} element
   * @package
   */
  upgraded(element) {
    const resource = this.getResourceForElement(element);
    if (this.isRuntimeOn_) {
      resource.build(this.forceBuild_);
      this.schedulePass();
    } else if (resource.onUpgraded_) {
      resource.onUpgraded_();
    }
    log.fine(TAG_, 'element upgraded:', resource.debugid);
  }

  /**
   * Assigns an owner for the specified element. This means that the resources
   * within this element will be managed by the owner and not Resources manager.
   * @param {!Element} element
   * @param {!AmpElement} owner
   * @package
   */
  setOwner(element, owner) {
    assert(owner.contains(element), 'Owner must contain the element');
    element[OWNER_PROP_] = owner;
  }

  /**
   * Schedules layout for the specified sub-elements that are children of the
   * parent element. The parent element may choose to send this signal either
   * because it's an owner (see {@link setOwner}) or because it wants the
   * layouts to be done sooner. In either case, both parent's and children's
   * priority is observed when scheduling this work.
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
   * Schedules preload for the specified sub-elements that are children of the
   * parent element. The parent element may choose to send this signal either
   * because it's an owner (see {@link setOwner}) or because it wants the
   * preloads to be done sooner. In either case, both parent's and children's
   * priority is observed when scheduling this work.
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
   * A parent resource, especially in when it's an owner (see {@link setOwner}),
   * may request the Resources manager to update children's inViewport state.
   * A child's inViewport state is a logical AND between inLocalViewport
   * specified here and parent's own inViewport state.
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
   * Requests the runtime to change the element's height.
   * @param {!Element} element
   * @param {number} newHeight
   */
  changeHeight(element, newHeight) {
    this.scheduleChangeHeight_(this.getResourceForElement(element), newHeight,
        /* force */ true, /* fallback */ null);
  }

  /**
   * Requests the runtime to update the height of this element to the specified
   * value. The runtime will schedule this request and attempt to process it
   * as soon as possible. However, unlike in {@link changeHeight}, the runtime
   * may refuse to make a change in which case it will call the provided
   * fallback with the height value. The fallback is expected to provide the
   * reader with the user action to update the height manually.
   * @param {!Element} element
   * @param {number} newHeight
   * @param {function(number)} fallback
   * @protected
   */
  requestChangeHeight(element, newHeight, fallback) {
    this.scheduleChangeHeight_(this.getResourceForElement(element), newHeight,
        /* force */ false, /* fallback */ fallback);
  }

  /**
   * Requests mutate callback to executed at the earliest possibility.
   * @param {!Element} element
   * @param {!Function} callback
   */
  deferMutate(element, callback) {
    this.scheduleDeferredMutate_(this.getResourceForElement(element), callback);
    this.schedulePassVsync();
  }

  /**
   * Schedules the work pass at the latest with the specified delay.
   * @param {number=} opt_delay
   */
  schedulePass(opt_delay) {
    this.pass_.schedule(opt_delay);
  }

  /**
   * Schedules the work pass at the latest with the specified delay.
   */
  schedulePassVsync() {
    if (this.vsyncScheduled_) {
      return;
    }
    this.vsyncScheduled_ = true;
    if (!this.docState_.isHidden()) {
      this.vsync_.mutate(() => this.doPass_());
    } else {
      this.schedulePass(16);
    }
  }

  /**
   * @private
   */
  doPass_() {
    if (!this.isRuntimeOn_) {
      log.fine(TAG_, 'runtime is off');
      return;
    }

    const prevVisible = this.visible_;
    this.visible_ = this.viewer_.isVisible();
    this.prerenderSize_ = this.viewer_.getPrerenderSize();

    if (this.documentReady_ && this.firstPassAfterDocumentReady_) {
      this.firstPassAfterDocumentReady_ = false;
      this.viewer_.postDocumentReady(this.viewport_.getSize().width,
        this.win.document.body./*OK*/scrollHeight);
      this.updateScrollHeight_();
    }

    const viewportSize = this.viewport_.getSize();
    const now = timer.now();
    log.fine(TAG_, 'PASS: at ' + now +
        ', visible=', this.visible_,
        ', forceBuild=', this.forceBuild_,
        ', relayoutAll=', this.relayoutAll_,
        ', relayoutTop=', this.relayoutTop_,
        ', viewportSize=', viewportSize.width, viewportSize.height,
        ', prerenderSize=', this.prerenderSize_);
    this.pass_.cancel();
    this.vsyncScheduled_ = false;

    // If document becomes invisible, bring everything into inactive state.
    if (prevVisible && !this.visible_) {
      log.fine(TAG_, 'document become inactive');
      this.documentBecameInactive_();
      return;
    }

    // If viewport size is 0, the manager will wait for the resize event.
    if (viewportSize.height > 0 && viewportSize.width > 0) {
      if (this.hasMutateWork_()) {
        this.mutateWork_();
      }
      this.discoverWork_();
      let delay = this.work_();
      if (this.hasMutateWork_()) {
        // Overflow mutate work.
        delay = Math.min(delay, MUTATE_DEFER_DELAY_);
      }
      if (this.visible_) {
        log.fine(TAG_, 'next pass:', delay);
        this.schedulePass(delay);
        this.updateScrollHeight_();
      } else {
        log.fine(TAG_, 'document is not visible: no scheduling');
      }
    }
  }

  /**
   * Returns `true` when there's mutate work currently batched.
   * @return {boolean}
   * @private
   */
  hasMutateWork_() {
    return (this.deferredMutates_.length > 0 ||
        this.changeHeightRequests_.length > 0);
  }

  /**
   * Performs pre-discovery mutates.
   * @private
   */
  mutateWork_() {
    // Read all necessary data before mutates.
    const now = timer.now();
    const viewportRect = this.viewport_.getRect();
    const isScrollingStopped = (Math.abs(this.lastVelocity_) < 1e-2 &&
        now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ ||
        now - this.lastScrollTime_ > MUTATE_DEFER_DELAY_ * 2);
    const offset = 10;

    if (this.deferredMutates_.length > 0) {
      log.fine(TAG_, 'deferred mutates:', this.deferredMutates_.length);
      const deferredMutates = this.deferredMutates_;
      this.deferredMutates_ = [];
      for (let i = 0; i < deferredMutates.length; i++) {
        deferredMutates[i]();
      }
    }

    if (this.changeHeightRequests_.length > 0) {
      log.fine(TAG_, 'change height requests:',
          this.changeHeightRequests_.length);
      const changeHeightRequests = this.changeHeightRequests_;
      this.changeHeightRequests_ = [];

      // Find minimum top position and run all mutates.
      let minTop = -1;
      for (let i = 0; i < changeHeightRequests.length; i++) {
        const request = changeHeightRequests[i];
        const resource = request.resource;
        const box = request.resource.getLayoutBox();
        if (box.height == request.newHeight) {
          // Nothing to do.
          continue;
        }

        // Check resize rules. It will either resize element immediately, or
        // wait until scrolling stops or will call the fallback.
        let resize = false;
        if (request.force || !this.visible_) {
          // 1. An immediate execution requested or the document is hidden.
          resize = true;
        } else if (this.activeHistory_.hasDescendantsOf(resource.element)) {
          // 2. Active elements are immediately resized. The assumption is that
          // the resize is triggered by the user action or soon after.
          resize = true;
        } else if (box.bottom >= viewportRect.bottom - offset) {
          // 3. Elements under viewport are resized immediately.
          resize = true;
        } else if (box.bottom <= viewportRect.top + offset) {
          // 4. Elements above the viewport can only be resized when scrolling
          // has stopped, otherwise defer util next cycle.
          if (isScrollingStopped) {
            resize = true;
          } else {
            // Defer till next cycle.
            this.changeHeightRequests_.push(request);
          }
        } else if (request.newHeight < box.height) {
          // 5. The new height is smaller than the current one.
          // TODO(dvoytenko): Enable immediate resize in this case after
          // potential abuse scenarios are considered.
          resize = false;
        } else {
          // 6. Element is in viewport don't resize and try fallback instead.
          if (request.fallback) {
            request.fallback(request.newHeight);
          }
        }

        if (resize) {
          if (box.top >= 0) {
            minTop = minTop == -1 ? box.top : Math.min(minTop, box.top);
          }
          request.resource.changeHeight(request.newHeight);
        }
      }

      if (minTop != -1) {
        this.relayoutTop_ = minTop;
      }

      // TODO(dvoytenko): consider scroll adjustments when resizing is done
      // above the current scrolling position.
    }
  }

  /**
   * Discovers work that needs to be done since the last pass. If viewport
   * has changed, it will try to build new elements, measure changed elements,
   * and schedule layouts and preloads within a reasonable distance of the
   * current viewport. Finally, this process also updates inViewport state
   * of changed elements.
   *
   * Layouts and preloads are not executed immediately, but instead scheduled
   * in the queue with different priorities.
   *
   * @private
   */
  discoverWork_() {

    // TODO(dvoytenko): vsync separation may be needed for different phases

    const now = timer.now();

    // Ensure all resources layout phase complete; when relayoutAll is requested
    // force re-layout.
    const relayoutAll = this.relayoutAll_;
    this.relayoutAll_ = false;
    const relayoutTop = this.relayoutTop_;
    this.relayoutTop_ = -1;

    // Phase 1: Build and relayout as needed. All mutations happen here.
    let relayoutCount = 0;
    for (let i = 0; i < this.resources_.length; i++) {
      const r = this.resources_[i];
      if (r.getState() == ResourceState_.NOT_BUILT) {
        r.build(this.forceBuild_);
      }
      if (r.getState() == ResourceState_.NOT_LAID_OUT || relayoutAll) {
        r.applySizesAndMediaQuery();
        relayoutCount++;
      }
    }

    // Phase 2: Remeasure if there were any relayouts. Unfortunately, currently
    // there's no way to optimize this. All reads happen here.
    if (relayoutCount > 0 || relayoutAll || relayoutTop != -1) {
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        if (r.getState() == ResourceState_.NOT_BUILT || r.hasOwner()) {
          continue;
        }
        if (relayoutAll ||
                r.getState() == ResourceState_.NOT_LAID_OUT ||
                relayoutTop != -1 && r.getLayoutBox().bottom >= relayoutTop) {
          r.measure();
        }
      }
    }

    const viewportRect = this.viewport_.getRect();
    // Load viewport = viewport + 3x up/down when document is visible or
    // depending on prerenderSize in pre-render mode.
    let loadRect;
    if (this.visible_) {
      loadRect = expandLayoutRect(viewportRect, 0.25, 2);
    } else if (this.prerenderSize_ > 0) {
      loadRect = expandLayoutRect(viewportRect, 0.25,
          this.prerenderSize_ - 1 + 0.25);
    } else {
      loadRect = null;
    }

    // Visible viewport = viewport + 25% up/down.
    const visibleRect = expandLayoutRect(viewportRect, 0.25, 0.25);

    // Phase 3: Schedule elements for layout within a reasonable distance from
    // current viewport.
    if (loadRect) {
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        if (r.getState() != ResourceState_.READY_FOR_LAYOUT || r.hasOwner()) {
          continue;
        }
        if (r.isDisplayed() && r.overlaps(loadRect)) {
          this.scheduleLayoutOrPreload_(r, /* layout */ true);
        }
      }
    }

    // Phase 4: Trigger "viewport enter/exit" events.
    for (let i = 0; i < this.resources_.length; i++) {
      const r = this.resources_[i];
      if (r.hasOwner()) {
        continue;
      }
      // Note that when the document is not visible, neither are any of its
      // elements to reduce CPU cycles.
      const shouldBeInViewport = (this.visible_ && r.isDisplayed() &&
          r.overlaps(visibleRect));
      if (r.isInViewport() != shouldBeInViewport) {
        r.setInViewport(shouldBeInViewport);
      }
    }

    // Phase 5: Idle layout: layout more if we are otherwise not doing much.
    // TODO(dvoytenko): document/estimate IDLE timeouts and other constants
    if (this.visible_ &&
          this.exec_.getSize() == 0 &&
          this.queue_.getSize() == 0 &&
          now > this.exec_.getLastDequeueTime() + 5000) {
      let idleScheduledCount = 0;
      for (let i = 0; i < this.resources_.length; i++) {
        const r = this.resources_[i];
        if (r.getState() == ResourceState_.READY_FOR_LAYOUT &&
                !r.hasOwner() && r.isDisplayed()) {
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
   * Brings all resources into inactive state. First it sets "in viewport"
   * state to false and then it calls documentInactive callback.
   * @private
   */
  documentBecameInactive_() {
    for (let i = 0; i < this.resources_.length; i++) {
      const r = this.resources_[i];
      r.documentBecameInactive();
    }
  }

  /**
   * Dequeues layout and preload tasks from the queue and initiates their
   * execution.
   *
   * There are two main drivers to dequeueing: a task's score and timeout. The
   * score is built based on the resource's priority and viewport location
   * (see {@link calcTaskScore_}). Timeout depends on the priority and age
   * of tasks currently in the execution pool (see {@link calcTaskTimeout_}).
   *
   * @return {!time}
   * @private
   */
  work_() {
    const now = timer.now();

    const scorer = this.calcTaskScore_.bind(this, this.viewport_.getRect(),
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
        const executing = this.exec_.getTaskById(task.id);
        if (!executing) {
          // Ensure that task can prerender
          task.promise = task.callback(this.visible_);
          task.startTime = now;
          log.fine(TAG_, 'exec:', task.id, 'at', task.startTime);
          this.exec_.enqueue(task);
          task.promise.then(this.taskComplete_.bind(this, task, true),
              this.taskComplete_.bind(this, task, false))
              .catch(reportError);
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
    let nextPassDelay = (now - this.exec_.getLastDequeueTime()) * 2;
    nextPassDelay = Math.max(Math.min(30000, nextPassDelay), 5000);
    return nextPassDelay;
  }

  /**
   * Calculates the task's score. A task with the lowest score will be dequeued
   * from the queue the first.
   *
   * There are three components of the score: element's priority, operation or
   * offset priority and viewport priority.
   *
   * Element's priority is constant of the element's name. E.g. amp-img has a
   * priority of 0, while amp-ad has a priority of 2.
   *
   * The operation (offset) priority is the priority of the task. A layout is
   * a high-priority task while preload is a lower-priority task.
   *
   * Viewport priority is a function of the distance of the element from the
   * currently visible viewports. The elements in the visible viewport get
   * higher priority and further away from the viewport get lower priority.
   * This priority also depends on whether or not the user is scrolling towards
   * this element or away from it.
   *
   * @param {!LayoutRect} viewportRect
   * @param {number} dir
   * @param {!Task_} task
   * @private
   */
  calcTaskScore_(viewportRect, dir, task) {
    const box = task.resource.getLayoutBox();
    let posPriority = Math.floor((box.top - viewportRect.top) /
        viewportRect.height);
    if (posPriority != 0 && Math.sign(posPriority) != (dir || 1)) {
      posPriority *= 2;
    }
    posPriority = Math.abs(posPriority);
    return task.priority * PRIORITY_BASE_ + posPriority;
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
   * @param {!Task_} task
   * @private
   */
  calcTaskTimeout_(task) {
    if (this.exec_.getSize() == 0) {
      return 0;
    }

    const now = timer.now();
    let timeout = 0;
    this.exec_.forEach(other => {
      // Higher priority tasks get the head start. Currently 500ms per a drop
      // in priority (note that priority is 10-based).
      const penalty = Math.max((task.priority - other.priority) *
          PRIORITY_PENALTY_TIME_, 0);
      // TODO(dvoytenko): Consider running total and not maximum.
      timeout = Math.max(timeout, penalty - (now - other.startTime));
    });

    return timeout;
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
   * Schedules change of the element's height.
   * @param {!Resource} resource
   * @param {number} newHeight
   * @param {boolean} force
   * @param {?function(number)} fallback
   * @private
   */
  scheduleChangeHeight_(resource, newHeight, force, fallback) {
    if (resource.getLayoutBox().height == newHeight) {
      // Nothing to do.
      return;
    }

    let request = null;
    for (let i = 0; i < this.changeHeightRequests_.length; i++) {
      if (this.changeHeightRequests_[i].resource == resource) {
        request = this.changeHeightRequests_[i];
        break;
      }
    }
    if (request) {
      request.newHeight = newHeight;
      request.force = force || request.force;
      request.fallback = fallback || request.fallback;
    } else {
      this.changeHeightRequests_.push({
        resource: resource,
        newHeight: newHeight,
        force: force,
        fallback: fallback
      });
    }
    this.schedulePassVsync();
  }

  /**
   * Schedules deferred mutate.
   * @param {!Resource} resource
   * @param {!Function} callback
   * @private
   */
  scheduleDeferredMutate_(resource, callback) {
    this.deferredMutates_.push(callback);
  }

  /**
   * Schedules layout or preload for the specified resource.
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
    // Don't schedule elements that can't prerender, they won't be allowed
    // to execute anyway.
    if (!this.visible_ && !resource.prerenderAllowed()) {
      return;
    }
    if (!resource.isInViewport() && !resource.renderOutsideViewport()) {
      return;
    }
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
   * Schedules layout or preload for the sub-resources of the specified
   * resource.
   * @param {!Resource} parentResource
   * @param {boolean} layout
   * @param {!Array<!Element>} subElements
   * @private
   */
  scheduleLayoutOrPreloadForSubresources_(parentResource, layout, subElements) {
    const resources = [];
    this.discoverResourcesForArray_(parentResource, subElements, resource => {
      if (resource.getState() != ResourceState_.NOT_BUILT) {
        resources.push(resource);
      }
    });
    if (resources.length > 0) {
      resources.forEach(resource => {
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
   * Schedules a task.
   * @param {!Resource} resource
   * @param {string} localId
   * @param {number} priorityOffset
   * @param {number} parentPriority
   * @param {function():!Promise} callback
   * @private
   */
  schedule_(resource, localId, priorityOffset, parentPriority, callback) {
    const taskId = resource.debugid + '#' + localId;

    const task = {
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
    const queued = this.queue_.getTaskById(taskId);
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
   * Updates inViewport state for the specified sub-resources of a resource.
   * @param {!Resource} parentResource
   * @param {!Array<!Element>} subElements
   * @param {boolean} inLocalViewport
   * @private
   */
  updateInViewportForSubresources_(parentResource, subElements,
      inLocalViewport) {
    const inViewport = parentResource.isInViewport() && inLocalViewport;
    this.discoverResourcesForArray_(parentResource, subElements, resource => {
      resource.setInViewport(inViewport);
    });
  }

  /**
   * Finds resources within the parent resource's shallow subtree.
   * @param {!Resource} parentResource
   * @param {!Array<!Element>} elements
   * @param {function(!Resource)} callback
   */
  discoverResourcesForArray_(parentResource, elements, callback) {
    elements.forEach(element => {
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
      const ampElements = element.getElementsByClassName('-amp-element');
      const seen = [];
      for (let i = 0; i < ampElements.length; i++) {
        const ampElement = ampElements[i];
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
   * @param {!Resources} resources
   */
  constructor(id, element, resources) {
    /** @private {number} */
    this.id_ = id;

    /** @export @const {!AmpElement} */
    this.element = element;

    /** @export @const {string} */
    this.debugid = element.tagName.toLowerCase() + '#' + id;

    /** @private {!Resources} */
    this.resources_ = resources;

    /** @private {boolean} */
    this.blacklisted_ = false;

    /** @const {!AmpElement|undefined|null} */
    this.owner_ = undefined;

    /** @const {number} */
    this.priority_ = getElementPriority(element.tagName);

    /** @private {!ResourceState_} */
    this.state_ = element.isBuilt() ? ResourceState_.NOT_LAID_OUT :
        ResourceState_.NOT_BUILT;

    /** @private {number} */
    this.layoutCount_ = 0;

    /** @private {!LayoutRect} */
    this.layoutBox_ = layoutRectLtwh(-10000, -10000, 0, 0);

    /** @private {boolean} */
    this.isInViewport_ = false;

    /**
     * Only used in the "runtime off" case when the monitoring code needs to
     * known when the element is upgraded.
     * @private {!Function|undefined}
     */
    this.onUpgraded_;
  }

  /**
   * Returns resource's ID.
   * @return {number}
   */
  getId() {
    return this.id_;
  }

  /**
   * Returns an owner element or null.
   * @return {?AmpElement}
   */
  getOwner() {
    if (this.owner_ === undefined) {
      const n = this.element;
      for (let n = this.element; n; n = n.parentElement) {
        if (n[OWNER_PROP_]) {
          this.owner_ = n[OWNER_PROP_];
          break;
        }
      }
      if (this.owner_ === undefined) {
        this.owner_ = null;
      }
    }
    return this.owner_;
  }

  /**
   * Whether the resource has an owner.
   * @return {boolean}
   */
  hasOwner() {
    return !!this.getOwner();
  }

  /**
   * Returns the resource's element priority.
   * @return {number}
   */
  getPriority() {
    return this.priority_;
  }

  /**
   * Returns the resource's state. See {@link ResourceState_} for details.
   * @return {!ResourceState_}
   */
  getState() {
    return this.state_;
  }

  /**
   * Requests the resource's element to be built. See {@link AmpElement.build}
   * for details.
   * @param {boolean} force
   * @return {boolean}
   */
  build(force) {
    if (this.blacklisted_ || !this.element.isUpgraded()) {
      return false;
    }
    let built;
    try {
      built = this.element.build(force);
    } catch (e) {
      log.error(TAG_, 'failed to build:', this.debugid, e);
      built = false;
      this.blacklisted_ = true;
    }
    if (!built) {
      return false;
    }
    this.state_ = ResourceState_.NOT_LAID_OUT;
    return true;
  }

  /**
   * Optionally hides or shows the element depending on the media query.
   */
  applySizesAndMediaQuery() {
    this.element.applySizesAndMediaQuery();
  }

  /**
   * Instructs the element to change its size and transitions to the state
   * awaiting the measure and possibly layout.
   * @param {number} newHeight
   */
  changeHeight(newHeight) {
    this.element.changeHeight(newHeight);
    // Schedule for re-layout.
    if (this.state_ != ResourceState_.NOT_BUILT) {
      this.state_ = ResourceState_.NOT_LAID_OUT;
    }
  }

  /**
   * Measures the resource's boundaries. Only allowed for upgraded elements.
   */
  measure() {
    assert(this.element.isUpgraded(), 'Must be upgraded to measure: %s',
        this.debugid);
    if (this.state_ == ResourceState_.NOT_BUILT) {
      // Can't measure unbuilt element.
      return;
    }
    const box = this.resources_.viewport_.getLayoutRect(this.element);
    // Note that "left" doesn't affect readiness for the layout.
    if (this.state_ == ResourceState_.NOT_LAID_OUT ||
          this.layoutBox_.top != box.top ||
          this.layoutBox_.width != box.width ||
          this.layoutBox_.height != box.height) {
      if (this.state_ == ResourceState_.NOT_LAID_OUT ||
              this.element.isRelayoutNeeded()) {
        this.state_ = ResourceState_.READY_FOR_LAYOUT;
      }
    }
    this.layoutBox_ = box;
    this.element.updateLayoutBox(box);
  }

  /**
   * Returns a previously measured layout box.
   * @return {!LayoutRect}
   */
  getLayoutBox() {
    return this.layoutBox_;
  }

  /**
   * Whether the resource is displayed, i.e. if it has non-zero width and
   * height.
   * @return {boolean}
   */
  isDisplayed() {
    return this.layoutBox_.height > 0 && this.layoutBox_.width > 0;
  }

  /**
   * Whether the element's layout box overlaps with the specified rect.
   * @param {!LayoutRect} rect
   * @return {boolean}
   */
  overlaps(rect) {
    return layoutRectsOverlap(this.layoutBox_, rect);
  }

  /**
   * Whether this element can be pre-rendered.
   * @return {boolean}
   */
  prerenderAllowed() {
    return this.element.prerenderAllowed();
  }

  /**
   * Whether this is allowed to render when not in viewport.
   * @return {boolean}
   */
  renderOutsideViewport() {
    return this.element.renderOutsideViewport();
  }

  /**
   * Sets the resource's state to LAYOUT_SCHEDULED.
   */
  layoutScheduled() {
    this.state_ = ResourceState_.LAYOUT_SCHEDULED;
  }

  /**
   * Starts the layout of the resource. Returns the promise that will yield
   * once layout is complete. Only allowed to be called on a upgraded, built
   * and displayed element.
   * @param {boolean} isDocumentVisible
   * @return {!Promise}
   */
  startLayout(isDocumentVisible) {
    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }
    if (this.state_ == ResourceState_.LAYOUT_COMPLETE) {
      return Promise.resolve();
    }
    if (this.state_ == ResourceState_.LAYOUT_FAILED) {
      return Promise.reject('already failed');
    }

    assert(this.state_ != ResourceState_.NOT_BUILT,
        'Not ready to start layout: %s (%s)', this.debugid, this.state_);

    if (!isDocumentVisible && !this.prerenderAllowed()) {
      log.fine(TAG_, 'layout canceled due to non pre-renderable element:',
          this.debugid, this.state_);
      this.state_ = ResourceState_.READY_FOR_LAYOUT;
      return Promise.resolve();
    }

    if (!this.renderOutsideViewport() && !this.isInViewport()) {
      log.fine(TAG_, 'layout canceled due to element not being in viewport:',
          this.debugid, this.state_);
      this.state_ = ResourceState_.READY_FOR_LAYOUT;
      return Promise.resolve();
    }

    // Double check that the element has not disappeared since scheduling
    this.measure();
    if (!this.isDisplayed()) {
      log.fine(TAG_, 'layout canceled due to element loosing display:',
          this.debugid, this.state_);
      return Promise.resolve();
    }

    // Not-wanted re-layouts are ignored.
    if (this.layoutCount_ > 0 && !this.element.isRelayoutNeeded()) {
      log.fine(TAG_, 'layout canceled since it wasn\'t requested:',
          this.debugid, this.state_);
      this.state_ = ResourceState_.LAYOUT_COMPLETE;
      return Promise.resolve();
    }

    log.fine(TAG_, 'start layout:', this.debugid, 'count:', this.layoutCount_);
    this.layoutCount_++;
    this.state_ = ResourceState_.LAYOUT_SCHEDULED;

    let promise;
    try {
      promise = this.element.layoutCallback();
    } catch (e) {
      return Promise.reject(e);
    }
    this.layoutPromise_ = promise.then(() => this.layoutComplete_(true),
        reason => this.layoutComplete_(false, reason));
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
   * Whether the resource is currently visible in the viewport.
   * @return {boolean}
   */
  isInViewport() {
    return this.isInViewport_;
  }

  /**
   * Updates the inViewport state of the element.
   * @param {boolean} inViewport
   */
  setInViewport(inViewport) {
    if (inViewport == this.isInViewport_) {
      return;
    }
    log.fine(TAG_, 'inViewport:', this.debugid, inViewport);
    this.isInViewport_ = inViewport;
    this.element.viewportCallback(inViewport);
  }

  /**
   * Calls element's documentInactiveCallback callback and resets state for
   * relayout in case document becomes active again.
   */
  documentBecameInactive() {
    if (this.state_ == ResourceState_.NOT_BUILT) {
      return;
    }
    if (this.isInViewport()) {
      this.setInViewport(false);
    }
    if (this.element.documentInactiveCallback()) {
      this.state_ = ResourceState_.NOT_LAID_OUT;
    }
  }

  /**
   * Only allowed in dev mode when runtime is turned off. Performs all steps
   * necessary to render an element.
   * @return {!Promise}
   * @export
   */
  forceAll() {
    assert(!this.resources_.isRuntimeOn_);
    let p = Promise.resolve();
    if (this.state_ == ResourceState_.NOT_BUILT) {
      if (!this.element.isUpgraded()) {
        p = p.then(() => {
          return new Promise(resolve => {
            this.onUpgraded_ = resolve;
          });
        });
      }
      p = p.then(() => {
        this.onUpgraded_ = undefined;
        this.build(true);
      });
    }
    return p.then(() => {
      this.applySizesAndMediaQuery();
      this.measure();
      if (this.layoutPromise_) {
        return this.layoutPromise_;
      }
      if (this.state_ == ResourceState_.LAYOUT_COMPLETE ||
              this.state_ == ResourceState_.LAYOUT_FAILED ||
              this.layoutCount_ > 0) {
        return Promise.resolve();
      }
      if (!this.isDisplayed()) {
        return Promise.resolve();
      }
      this.layoutCount_++;
      try {
        return this.element.layoutCallback();
      } catch (e) {
        return Promise.reject(e);
      }
    });
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
   * @return {?Task_}
   */
  getTaskById(taskId) {
    return this.taskIdMap_[taskId] || null;
  }

  /**
   * Enqueues the task. If the task is already in the queue, the error is
   * thrown.
   * @param {!Task_} task
   */
  enqueue(task) {
    assert(!this.taskIdMap_[task.id], 'Task already enqueued: %s', task.id);
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
    const existing = this.taskIdMap_[task.id];
    if (!existing) {
      return false;
    }
    this.tasks_.splice(this.tasks_.indexOf(existing), 1);
    delete this.taskIdMap_[task.id];
    this.lastDequeueTime_ = timer.now();
    return true;
  }

  /**
   * Returns the task with the minimal score based on the provided scoring
   * callback.
   * @param {function(!Task_):number} scorer
   * @return {?Task_}
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
 * Resource state.
 *
 * Visible for testing only!
 *
 * @enum {number}
 * @private
 */
export const ResourceState_ = {
  /**
   * The resource has not been built yet. Measures, layouts, preloads or
   * viewport signals are not allowed.
   */
  NOT_BUILT: 0,

  /**
   * The resource has been built, but not measured yet and not yet ready
   * for layout.
   */
  NOT_LAID_OUT: 1,

  /**
   * The resource has been built and measured and ready for layout.
   */
  READY_FOR_LAYOUT: 2,

  /**
   * The resource is currently scheduled for layout.
   */
  LAYOUT_SCHEDULED: 3,

  /**
   * The resource has been laid out.
   */
  LAYOUT_COMPLETE: 4,

  /**
   * The latest resource's layout failed.
   */
  LAYOUT_FAILED: 5
};


/**
 * The internal structure for the task.
 * @typedef {{
 *   id: string,
 *   resource: !Resource,
 *   priority: number,
 *   callback: function(boolean),
 *   scheduleTime: time,
 *   startTime: time,
 *   promise: (!Promise|undefined)
 * }}
 * @private
 */
let Task_;

/**
 * @param {!Window} window
 * @return {!Resources}
 */
export function resourcesFor(window) {
  return getService(window, 'resources', () => {
    return new Resources(window);
  });
};
