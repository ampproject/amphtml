function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise } from "./core/data-structures/promise";function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { PriorityQueue } from "./core/data-structures/priority-queue";
import { getData } from "./event-helper";
import { dev } from "./log";
import { Services } from "./service";
import {
getServiceForDoc,
registerServiceBuilderForDoc } from "./service-helpers";

import { makeBodyVisibleRecovery } from "./style-installer";

/**
 * @const {string}
 */
var TAG = 'CHUNK';

/**
 * @type {boolean}
 */
var deactivated = /nochunking=1/.test(self.location.hash);
var allowLongTasks = false;

/**
 * @const {!Promise}
 */
var resolved = _resolvedPromise();

/**
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Chunks}
 * @private
 */
function chunkServiceForDoc(elementOrAmpDoc) {
  registerServiceBuilderForDoc(elementOrAmpDoc, 'chunk', Chunks);
  return getServiceForDoc(elementOrAmpDoc, 'chunk');
}

/**
 * Run the given function. For visible documents the function will be
 * called in a micro task (Essentially ASAP). If the document is
 * not visible, tasks will yield to the event loop (to give the browser
 * time to do other things) and may even be further delayed until
 * there is time.
 *
 * @param {!Document|!./service/ampdoc-impl.AmpDoc} doc
 * @param {function(?IdleDeadline)} fn
 * @param {boolean=} opt_makesBodyVisible Pass true if this service makes
 *     the body visible. This is relevant because it may influence the
 *     task scheduling strategy.
 */
export function startupChunk(doc, fn, opt_makesBodyVisible) {
  if (deactivated) {
    resolved.then(fn);
    return;
  }
  var service = chunkServiceForDoc(doc.documentElement || doc);
  service.runForStartup(fn);
  if (opt_makesBodyVisible) {
    service.runForStartup(function () {
      service.bodyIsVisible_ = true;
    });
  }
}

/**
 * Run the given function sometime in the future without blocking UI.
 *
 * Higher priority tasks are executed before lower priority tasks.
 * Tasks with the same priority are executed in FIFO order.
 *
 * Uses `requestIdleCallback` if available and passes the `IdleDeadline`
 * object to the function, which can be used to perform a variable amount
 * of work depending on the remaining amount of idle time.
 *
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {function(?IdleDeadline)} fn
 * @param {ChunkPriority} priority
 */
export function chunk(elementOrAmpDoc, fn, priority) {
  if (deactivated) {
    resolved.then(fn);
    return;
  }
  var service = chunkServiceForDoc(elementOrAmpDoc);
  service.run(fn, priority);
}

/**
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Chunks}
 */
export function chunkInstanceForTesting(elementOrAmpDoc) {
  return chunkServiceForDoc(elementOrAmpDoc);
}

/**
 * Use a standard micro task for every invocation. This should only
 * be called from the AMP bootstrap script if it is known that
 * chunking makes no sense. In particular this is the case when
 * AMP runs in the `amp-shadow` multi document mode.
 */
export function deactivateChunking() {
  deactivated = true;
}

/**
 * Allow continuing macro tasks after a long task (>5ms).
 * In particular this is the case when AMP runs in the `amp-inabox` ads mode.
 */
export function allowLongTasksInChunking() {
  allowLongTasks = true;
}

/**
 * @visibleForTesting
 */
export function activateChunkingForTesting() {
  deactivated = false;
}

/**
 * Runs all currently scheduled chunks.
 * Independent of errors it will unwind the queue. Will afterwards
 * throw the first encountered error.
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 */
export function runChunksForTesting(elementOrAmpDoc) {
  var service = chunkInstanceForTesting(elementOrAmpDoc);
  var errors = [];
  while (true) {
    try {
      if (!service.execute_( /* idleDeadline */null)) {
        break;
      }
    } catch (e) {
      errors.push(e);
    }
  }
  if (errors.length) {
    throw errors[0];
  }
}

/**
 * The priority of a chunk task. Higher priority tasks have higher values.
 * @enum {number}
 */
export var ChunkPriority = {
  HIGH: 20,
  LOW: 10,
  BACKGROUND: 0 };


/** @enum {string} */
var TaskState = {
  NOT_RUN: 'not_run',
  RUN: 'run' };


/**
 * A default chunkable task.
 * @private
 */var
Task = /*#__PURE__*/function () {
  /**
   * @param {function(?IdleDeadline)} fn
   */
  function Task(fn) {_classCallCheck(this, Task);
    /** @public {TaskState} */
    this.state = TaskState.NOT_RUN;

    /** @private @const {!function(?IdleDeadline)} */
    this.fn_ = fn;
  }

  /**
   * Executes the wrapped function.
   * @param {?IdleDeadline} idleDeadline
   * @throws {Error}
   * @protected
   */_createClass(Task, [{ key: "runTask_", value:
    function runTask_(idleDeadline) {
      if (this.state == TaskState.RUN) {
        return;
      }
      this.state = TaskState.RUN;
      try {
        this.fn_(idleDeadline);
      } catch (e) {
        this.onTaskError_(e);
        throw e;
      }
    }

    /**
     * @return {string}
     * @protected
     */ }, { key: "getName_", value:
    function getName_() {
      return this.fn_.displayName || this.fn_.name;
    }

    /**
     * Optional handling when a task run throws an error.
     * @param {Error} unusedError
     * @private
     */ }, { key: "onTaskError_", value:
    function onTaskError_(unusedError) {
      // By default, no-op.
    }

    /**
     * Returns true if this task should be run without delay.
     * @return {boolean}
     * @protected
     */ }, { key: "immediateTriggerCondition_", value:
    function immediateTriggerCondition_() {
      // By default, there are no immediate trigger conditions.
      return false;
    }

    /**
     * Returns true if this task should be scheduled using `requestIdleCallback`.
     * Otherwise, task is scheduled as macro-task on next event loop.
     * @return {boolean}
     * @protected
     */ }, { key: "useRequestIdleCallback_", value:
    function useRequestIdleCallback_() {
      // By default, never use requestIdleCallback.
      return false;
    } }]);return Task;}();


/**
 * A task that's run as part of AMP's startup sequence.
 * @private
 */var
StartupTask = /*#__PURE__*/function (_Task) {_inherits(StartupTask, _Task);var _super = _createSuper(StartupTask);
  /**
   * @param {function(?IdleDeadline)} fn
   * @param {!Window} win
   * @param {!Chunks} chunks
   */
  function StartupTask(fn, win, chunks) {var _this;_classCallCheck(this, StartupTask);
    _this = _super.call(this, fn);

    /** @private @const */
    _this.chunks_ = chunks;return _this;
  }

  /** @override */_createClass(StartupTask, [{ key: "onTaskError_", value:
    function onTaskError_(unusedError) {
      // Startup tasks run early in init. All errors should show the doc.
      makeBodyVisibleRecovery(self.document);
    }

    /** @override */ }, { key: "immediateTriggerCondition_", value:
    function immediateTriggerCondition_() {
      // Run in a micro task when the doc is visible. Otherwise, run after
      // having yielded to the event queue once.
      return this.isVisible_();
    }

    /** @override */ }, { key: "useRequestIdleCallback_", value:
    function useRequestIdleCallback_() {
      // We only start using requestIdleCallback when the core runtime has
      // been initialized. Otherwise we risk starving ourselves
      // before the render-critical work is done.
      return this.chunks_.coreReady_;
    }

    /**
     * @return {boolean}
     * @private
     */ }, { key: "isVisible_", value:
    function isVisible_() {
      return this.chunks_.ampdoc.isVisible();
    } }]);return StartupTask;}(Task);


/**
 * Handles queueing, scheduling and executing tasks.
 */var
Chunks = /*#__PURE__*/function () {
  /**
   * @param {!./service/ampdoc-impl.AmpDoc} ampDoc
   */
  function Chunks(ampDoc) {var _this2 = this;_classCallCheck(this, Chunks);
    /** @protected @const {!./service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampDoc;
    /** @private @const {!Window} */
    this.win_ = ampDoc.win;
    /** @private @const {!PriorityQueue<Task>} */
    this.tasks_ = new PriorityQueue();
    /** @private @const {function(?IdleDeadline)} */
    this.boundExecute_ = this.execute_.bind(this);
    /** @private {number} */
    this.durationOfLastExecution_ = 0;
    /** @private @const {boolean} */
    this.supportsInputPending_ = !!(
    this.win_.navigator.scheduling &&
    this.win_.navigator.scheduling.isInputPending);


    /**
     * Set to true if we scheduled a macro or micro task to execute the next
     * task. If true, we don't schedule another one.
     * Not set to true if we use rIC, because we always want to transition
     * to immeditate invocation from that state.
     * @private {boolean}
     */
    this.scheduledImmediateInvocation_ = false;
    /** @private {boolean} Whether the document can actually be painted. */
    this.bodyIsVisible_ = this.win_.document.documentElement.hasAttribute(
    'i-amphtml-no-boilerplate');


    this.win_.addEventListener('message', function (e) {
      if (getData(e) == 'amp-macro-task') {
        _this2.execute_( /* idleDeadline */null);
      }
    });

    /** @protected {boolean} */
    this.coreReady_ = false;
    Services.viewerPromiseForDoc(ampDoc).then(function () {
      // Once the viewer has been resolved, most of core runtime has been
      // initialized as well.
      _this2.coreReady_ = true;
    });

    ampDoc.onVisibilityChanged(function () {
      if (ampDoc.isVisible()) {
        _this2.schedule_();
      }
    });
  }

  /**
   * Run fn as a "chunk".
   * @param {function(?IdleDeadline)} fn
   * @param {number} priority
   */_createClass(Chunks, [{ key: "run", value:
    function run(fn, priority) {
      var t = new Task(fn);
      this.enqueueTask_(t, priority);
    }

    /**
     * Run a fn that's part of AMP's startup sequence as a "chunk".
     * @param {function(?IdleDeadline)} fn
     */ }, { key: "runForStartup", value:
    function runForStartup(fn) {
      var t = new StartupTask(fn, this.win_, this);
      this.enqueueTask_(t, Number.POSITIVE_INFINITY);
    }

    /**
     * Queues a task to be executed later with given priority.
     * @param {!Task} task
     * @param {number} priority
     * @private
     */ }, { key: "enqueueTask_", value:
    function enqueueTask_(task, priority) {
      this.tasks_.enqueue(task, priority);
      this.schedule_();
    }

    /**
     * Returns the next task that hasn't been run yet.
     * If `opt_dequeue` is true, remove the returned task from the queue.
     * @param {boolean=} opt_dequeue
     * @return {?Task}
     * @private
     */ }, { key: "nextTask_", value:
    function nextTask_(opt_dequeue) {
      var t = this.tasks_.peek();
      // Dequeue tasks until we find one that hasn't been run yet.
      while (t && t.state !== TaskState.NOT_RUN) {
        this.tasks_.dequeue();
        t = this.tasks_.peek();
      }
      // If `opt_dequeue` is true, remove this task from the queue.
      if (t && opt_dequeue) {
        this.tasks_.dequeue();
      }
      return t;
    }

    /**
     * Run a task.
     * Schedule the next round if there are more tasks.
     * @param {?IdleDeadline} idleDeadline
     * @return {boolean} Whether anything was executed.
     * @private
     */ }, { key: "execute_", value:
    function execute_(idleDeadline) {var _this3 = this;
      var t = this.nextTask_( /* opt_dequeue */true);
      if (!t) {
        this.scheduledImmediateInvocation_ = false;
        this.durationOfLastExecution_ = 0;
        return false;
      }
      var before;
      try {
        before = Date.now();
        t.runTask_(idleDeadline);
      } finally {
        // We want to capture the time of the entire task duration including
        // scheduled immediate (from resolved promises) micro tasks.
        // Lacking a better way to do this we just scheduled 10 nested
        // micro tasks.
        resolved.
        then().
        then().
        then().
        then().
        then().
        then().
        then().
        then().
        then(function () {
          _this3.scheduledImmediateInvocation_ = false;
          _this3.durationOfLastExecution_ += Date.now() - before;
          dev().fine(
          TAG,
          t.getName_(),
          'Chunk duration',
          Date.now() - before,
          _this3.durationOfLastExecution_);


          _this3.schedule_();
        });
      }
      return true;
    }

    /**
     * Calls `execute_()` asynchronously.
     * @param {?IdleDeadline} idleDeadline
     * @private
     */ }, { key: "executeAsap_", value:
    function executeAsap_(idleDeadline) {var _this4 = this;
      // If the user-agent supports isInputPending, use it to break to a macro task as necessary.
      // Otherwise If we've spent over 5 millseconds executing the
      // last instruction yield back to the main thread.
      // 5 milliseconds is a magic number.
      if (
      !allowLongTasks &&
      this.bodyIsVisible_ && (
      this.supportsInputPending_ ?
      /** @type {!{scheduling: {isInputPending: Function}}} */(
      this.win_.navigator).
      scheduling.isInputPending() :
      this.durationOfLastExecution_ > 5))
      {
        this.durationOfLastExecution_ = 0;
        this.requestMacroTask_();
        return;
      }
      resolved.then(function () {
        _this4.boundExecute_(idleDeadline);
      });
    }

    /**
     * Schedule running the next queued task.
     * @private
     */ }, { key: "schedule_", value:
    function schedule_() {
      if (this.scheduledImmediateInvocation_) {
        return;
      }
      var nextTask = this.nextTask_();
      if (!nextTask) {
        return;
      }
      if (nextTask.immediateTriggerCondition_()) {
        this.scheduledImmediateInvocation_ = true;
        this.executeAsap_( /* idleDeadline */null);
        return;
      }
      // If requestIdleCallback exists, schedule a task with it, but
      // do not wait longer than two seconds.
      if (nextTask.useRequestIdleCallback_() && this.win_.requestIdleCallback) {
        onIdle(
        this.win_,
        // Wait until we have a budget of at least 15ms.
        // 15ms is a magic number. Budgets are higher when the user
        // is completely idle (around 40), but that occurs too
        // rarely to be usable. 15ms budgets can happen during scrolling
        // but only if the device is doing super, super well, and no
        // real processing is done between frames.
        15 /* minimumTimeRemaining */,
        2000 /* timeout */,
        this.boundExecute_);

        return;
      }
      this.requestMacroTask_();
    }

    /**
     * Requests executing of a macro task. Yields to the event queue
     * before executing the task.
     * Places task on browser message queue which then respectively
     * triggers dequeuing and execution of a chunk.
     */ }, { key: "requestMacroTask_", value:
    function requestMacroTask_() {
      // The message doesn't actually matter.
      this.win_. /*OK*/postMessage('amp-macro-task', '*');
    } }]);return Chunks;}();


/**
 * Delays calling the given function until the browser is notifying us
 * about a certain minimum budget or the timeout is reached.
 * @param {!Window} win
 * @param {number} minimumTimeRemaining Minimum number of millis idle
 *     budget for callback to fire.
 * @param {number} timeout in millis for callback to fire.
 * @param {function(?IdleDeadline)} fn Callback.
 * @visibleForTesting
 */
export function onIdle(win, minimumTimeRemaining, timeout, fn) {
  var startTime = Date.now();
  /**
   * @param {!IdleDeadline} info
   */
  function rIC(info) {
    if (info.timeRemaining() < minimumTimeRemaining) {
      var remainingTimeout = timeout - (Date.now() - startTime);
      if (remainingTimeout <= 0 || info.didTimeout) {
        dev().fine(TAG, 'Timed out', timeout, info.didTimeout);
        fn(info);
      } else {
        dev().fine(
        TAG,
        'Rescheduling with',
        remainingTimeout,
        info.timeRemaining());

        win.requestIdleCallback(rIC, { timeout: remainingTimeout });
      }
    } else {
      dev().fine(TAG, 'Running idle callback with ', minimumTimeRemaining);
      fn(info);
    }
  }
  win.requestIdleCallback(rIC, { timeout: timeout });
}
// /Users/mszylkowski/src/amphtml/src/chunk.js