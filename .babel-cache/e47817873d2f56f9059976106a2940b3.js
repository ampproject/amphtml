import { resolvedPromise as _resolvedPromise } from "./core/data-structures/promise";

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { PriorityQueue } from "./core/data-structures/priority-queue";
import { getData } from "./event-helper";
import { dev } from "./log";
import { Services } from "./service";
import { getServiceForDoc, registerServiceBuilderForDoc } from "./service-helpers";
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
      if (!service.execute_(
      /* idleDeadline */
      null)) {
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
  BACKGROUND: 0
};

/** @enum {string} */
var TaskState = {
  NOT_RUN: 'not_run',
  RUN: 'run'
};

/**
 * A default chunkable task.
 * @private
 */
var Task = /*#__PURE__*/function () {
  /**
   * @param {function(?IdleDeadline)} fn
   */
  function Task(fn) {
    _classCallCheck(this, Task);

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
   */
  _createClass(Task, [{
    key: "runTask_",
    value: function runTask_(idleDeadline) {
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
     */

  }, {
    key: "getName_",
    value: function getName_() {
      return this.fn_.displayName || this.fn_.name;
    }
    /**
     * Optional handling when a task run throws an error.
     * @param {Error} unusedError
     * @private
     */

  }, {
    key: "onTaskError_",
    value: function onTaskError_(unusedError) {// By default, no-op.
    }
    /**
     * Returns true if this task should be run without delay.
     * @return {boolean}
     * @protected
     */

  }, {
    key: "immediateTriggerCondition_",
    value: function immediateTriggerCondition_() {
      // By default, there are no immediate trigger conditions.
      return false;
    }
    /**
     * Returns true if this task should be scheduled using `requestIdleCallback`.
     * Otherwise, task is scheduled as macro-task on next event loop.
     * @return {boolean}
     * @protected
     */

  }, {
    key: "useRequestIdleCallback_",
    value: function useRequestIdleCallback_() {
      // By default, never use requestIdleCallback.
      return false;
    }
  }]);

  return Task;
}();

/**
 * A task that's run as part of AMP's startup sequence.
 * @private
 */
var StartupTask = /*#__PURE__*/function (_Task) {
  _inherits(StartupTask, _Task);

  var _super = _createSuper(StartupTask);

  /**
   * @param {function(?IdleDeadline)} fn
   * @param {!Window} win
   * @param {!Chunks} chunks
   */
  function StartupTask(fn, win, chunks) {
    var _this;

    _classCallCheck(this, StartupTask);

    _this = _super.call(this, fn);

    /** @private @const */
    _this.chunks_ = chunks;
    return _this;
  }

  /** @override */
  _createClass(StartupTask, [{
    key: "onTaskError_",
    value: function onTaskError_(unusedError) {
      // Startup tasks run early in init. All errors should show the doc.
      makeBodyVisibleRecovery(self.document);
    }
    /** @override */

  }, {
    key: "immediateTriggerCondition_",
    value: function immediateTriggerCondition_() {
      // Run in a micro task when the doc is visible. Otherwise, run after
      // having yielded to the event queue once.
      return this.isVisible_();
    }
    /** @override */

  }, {
    key: "useRequestIdleCallback_",
    value: function useRequestIdleCallback_() {
      // We only start using requestIdleCallback when the core runtime has
      // been initialized. Otherwise we risk starving ourselves
      // before the render-critical work is done.
      return this.chunks_.coreReady_;
    }
    /**
     * @return {boolean}
     * @private
     */

  }, {
    key: "isVisible_",
    value: function isVisible_() {
      return this.chunks_.ampdoc.isVisible();
    }
  }]);

  return StartupTask;
}(Task);

/**
 * Handles queueing, scheduling and executing tasks.
 */
var Chunks = /*#__PURE__*/function () {
  /**
   * @param {!./service/ampdoc-impl.AmpDoc} ampDoc
   */
  function Chunks(ampDoc) {
    var _this2 = this;

    _classCallCheck(this, Chunks);

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
    this.supportsInputPending_ = !!(this.win_.navigator.scheduling && this.win_.navigator.scheduling.isInputPending);

    /**
     * Set to true if we scheduled a macro or micro task to execute the next
     * task. If true, we don't schedule another one.
     * Not set to true if we use rIC, because we always want to transition
     * to immeditate invocation from that state.
     * @private {boolean}
     */
    this.scheduledImmediateInvocation_ = false;

    /** @private {boolean} Whether the document can actually be painted. */
    this.bodyIsVisible_ = this.win_.document.documentElement.hasAttribute('i-amphtml-no-boilerplate');
    this.win_.addEventListener('message', function (e) {
      if (getData(e) == 'amp-macro-task') {
        _this2.execute_(
        /* idleDeadline */
        null);
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
   */
  _createClass(Chunks, [{
    key: "run",
    value: function run(fn, priority) {
      var t = new Task(fn);
      this.enqueueTask_(t, priority);
    }
    /**
     * Run a fn that's part of AMP's startup sequence as a "chunk".
     * @param {function(?IdleDeadline)} fn
     */

  }, {
    key: "runForStartup",
    value: function runForStartup(fn) {
      var t = new StartupTask(fn, this.win_, this);
      this.enqueueTask_(t, Number.POSITIVE_INFINITY);
    }
    /**
     * Queues a task to be executed later with given priority.
     * @param {!Task} task
     * @param {number} priority
     * @private
     */

  }, {
    key: "enqueueTask_",
    value: function enqueueTask_(task, priority) {
      this.tasks_.enqueue(task, priority);
      this.schedule_();
    }
    /**
     * Returns the next task that hasn't been run yet.
     * If `opt_dequeue` is true, remove the returned task from the queue.
     * @param {boolean=} opt_dequeue
     * @return {?Task}
     * @private
     */

  }, {
    key: "nextTask_",
    value: function nextTask_(opt_dequeue) {
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
     */

  }, {
    key: "execute_",
    value: function execute_(idleDeadline) {
      var _this3 = this;

      var t = this.nextTask_(
      /* opt_dequeue */
      true);

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
        resolved.then().then().then().then().then().then().then().then().then(function () {
          _this3.scheduledImmediateInvocation_ = false;
          _this3.durationOfLastExecution_ += Date.now() - before;
          dev().fine(TAG, t.getName_(), 'Chunk duration', Date.now() - before, _this3.durationOfLastExecution_);

          _this3.schedule_();
        });
      }

      return true;
    }
    /**
     * Calls `execute_()` asynchronously.
     * @param {?IdleDeadline} idleDeadline
     * @private
     */

  }, {
    key: "executeAsap_",
    value: function executeAsap_(idleDeadline) {
      var _this4 = this;

      // If the user-agent supports isInputPending, use it to break to a macro task as necessary.
      // Otherwise If we've spent over 5 millseconds executing the
      // last instruction yield back to the main thread.
      // 5 milliseconds is a magic number.
      if (!allowLongTasks && this.bodyIsVisible_ && (this.supportsInputPending_ ?
      /** @type {!{scheduling: {isInputPending: Function}}} */
      this.win_.navigator.scheduling.isInputPending() : this.durationOfLastExecution_ > 5)) {
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
     */

  }, {
    key: "schedule_",
    value: function schedule_() {
      if (this.scheduledImmediateInvocation_) {
        return;
      }

      var nextTask = this.nextTask_();

      if (!nextTask) {
        return;
      }

      if (nextTask.immediateTriggerCondition_()) {
        this.scheduledImmediateInvocation_ = true;
        this.executeAsap_(
        /* idleDeadline */
        null);
        return;
      }

      // If requestIdleCallback exists, schedule a task with it, but
      // do not wait longer than two seconds.
      if (nextTask.useRequestIdleCallback_() && this.win_.requestIdleCallback) {
        onIdle(this.win_, // Wait until we have a budget of at least 15ms.
        // 15ms is a magic number. Budgets are higher when the user
        // is completely idle (around 40), but that occurs too
        // rarely to be usable. 15ms budgets can happen during scrolling
        // but only if the device is doing super, super well, and no
        // real processing is done between frames.
        15
        /* minimumTimeRemaining */
        , 2000
        /* timeout */
        , this.boundExecute_);
        return;
      }

      this.requestMacroTask_();
    }
    /**
     * Requests executing of a macro task. Yields to the event queue
     * before executing the task.
     * Places task on browser message queue which then respectively
     * triggers dequeuing and execution of a chunk.
     */

  }, {
    key: "requestMacroTask_",
    value: function requestMacroTask_() {
      // The message doesn't actually matter.
      this.win_.
      /*OK*/
      postMessage('amp-macro-task', '*');
    }
  }]);

  return Chunks;
}();

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
        dev().fine(TAG, 'Rescheduling with', remainingTimeout, info.timeRemaining());
        win.requestIdleCallback(rIC, {
          timeout: remainingTimeout
        });
      }
    } else {
      dev().fine(TAG, 'Running idle callback with ', minimumTimeRemaining);
      fn(info);
    }
  }

  win.requestIdleCallback(rIC, {
    timeout: timeout
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNodW5rLmpzIl0sIm5hbWVzIjpbIlByaW9yaXR5UXVldWUiLCJnZXREYXRhIiwiZGV2IiwiU2VydmljZXMiLCJnZXRTZXJ2aWNlRm9yRG9jIiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyIsIm1ha2VCb2R5VmlzaWJsZVJlY292ZXJ5IiwiVEFHIiwiZGVhY3RpdmF0ZWQiLCJ0ZXN0Iiwic2VsZiIsImxvY2F0aW9uIiwiaGFzaCIsImFsbG93TG9uZ1Rhc2tzIiwicmVzb2x2ZWQiLCJjaHVua1NlcnZpY2VGb3JEb2MiLCJlbGVtZW50T3JBbXBEb2MiLCJDaHVua3MiLCJzdGFydHVwQ2h1bmsiLCJkb2MiLCJmbiIsIm9wdF9tYWtlc0JvZHlWaXNpYmxlIiwidGhlbiIsInNlcnZpY2UiLCJkb2N1bWVudEVsZW1lbnQiLCJydW5Gb3JTdGFydHVwIiwiYm9keUlzVmlzaWJsZV8iLCJjaHVuayIsInByaW9yaXR5IiwicnVuIiwiY2h1bmtJbnN0YW5jZUZvclRlc3RpbmciLCJkZWFjdGl2YXRlQ2h1bmtpbmciLCJhbGxvd0xvbmdUYXNrc0luQ2h1bmtpbmciLCJhY3RpdmF0ZUNodW5raW5nRm9yVGVzdGluZyIsInJ1bkNodW5rc0ZvclRlc3RpbmciLCJlcnJvcnMiLCJleGVjdXRlXyIsImUiLCJwdXNoIiwibGVuZ3RoIiwiQ2h1bmtQcmlvcml0eSIsIkhJR0giLCJMT1ciLCJCQUNLR1JPVU5EIiwiVGFza1N0YXRlIiwiTk9UX1JVTiIsIlJVTiIsIlRhc2siLCJzdGF0ZSIsImZuXyIsImlkbGVEZWFkbGluZSIsIm9uVGFza0Vycm9yXyIsImRpc3BsYXlOYW1lIiwibmFtZSIsInVudXNlZEVycm9yIiwiU3RhcnR1cFRhc2siLCJ3aW4iLCJjaHVua3MiLCJjaHVua3NfIiwiZG9jdW1lbnQiLCJpc1Zpc2libGVfIiwiY29yZVJlYWR5XyIsImFtcGRvYyIsImlzVmlzaWJsZSIsImFtcERvYyIsIndpbl8iLCJ0YXNrc18iLCJib3VuZEV4ZWN1dGVfIiwiYmluZCIsImR1cmF0aW9uT2ZMYXN0RXhlY3V0aW9uXyIsInN1cHBvcnRzSW5wdXRQZW5kaW5nXyIsIm5hdmlnYXRvciIsInNjaGVkdWxpbmciLCJpc0lucHV0UGVuZGluZyIsInNjaGVkdWxlZEltbWVkaWF0ZUludm9jYXRpb25fIiwiaGFzQXR0cmlidXRlIiwiYWRkRXZlbnRMaXN0ZW5lciIsInZpZXdlclByb21pc2VGb3JEb2MiLCJvblZpc2liaWxpdHlDaGFuZ2VkIiwic2NoZWR1bGVfIiwidCIsImVucXVldWVUYXNrXyIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwidGFzayIsImVucXVldWUiLCJvcHRfZGVxdWV1ZSIsInBlZWsiLCJkZXF1ZXVlIiwibmV4dFRhc2tfIiwiYmVmb3JlIiwiRGF0ZSIsIm5vdyIsInJ1blRhc2tfIiwiZmluZSIsImdldE5hbWVfIiwicmVxdWVzdE1hY3JvVGFza18iLCJuZXh0VGFzayIsImltbWVkaWF0ZVRyaWdnZXJDb25kaXRpb25fIiwiZXhlY3V0ZUFzYXBfIiwidXNlUmVxdWVzdElkbGVDYWxsYmFja18iLCJyZXF1ZXN0SWRsZUNhbGxiYWNrIiwib25JZGxlIiwicG9zdE1lc3NhZ2UiLCJtaW5pbXVtVGltZVJlbWFpbmluZyIsInRpbWVvdXQiLCJzdGFydFRpbWUiLCJySUMiLCJpbmZvIiwidGltZVJlbWFpbmluZyIsInJlbWFpbmluZ1RpbWVvdXQiLCJkaWRUaW1lb3V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsYUFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQ0VDLGdCQURGLEVBRUVDLDRCQUZGO0FBSUEsU0FBUUMsdUJBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsR0FBRyxHQUFHLE9BQVo7O0FBRUE7QUFDQTtB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IEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1ByaW9yaXR5UXVldWV9IGZyb20gJy4vY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJpb3JpdHktcXVldWUnO1xuaW1wb3J0IHtnZXREYXRhfSBmcm9tICcuL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi9sb2cnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnLi9zZXJ2aWNlJztcbmltcG9ydCB7XG4gIGdldFNlcnZpY2VGb3JEb2MsXG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MsXG59IGZyb20gJy4vc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7bWFrZUJvZHlWaXNpYmxlUmVjb3Zlcnl9IGZyb20gJy4vc3R5bGUtaW5zdGFsbGVyJztcblxuLyoqXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuY29uc3QgVEFHID0gJ0NIVU5LJztcblxuLyoqXG4gKiBAdHlwZSB7Ym9vbGVhbn1cbiAqL1xubGV0IGRlYWN0aXZhdGVkID0gL25vY2h1bmtpbmc9MS8udGVzdChzZWxmLmxvY2F0aW9uLmhhc2gpO1xubGV0IGFsbG93TG9uZ1Rhc2tzID0gZmFsc2U7XG5cbi8qKlxuICogQGNvbnN0IHshUHJvbWlzZX1cbiAqL1xuY29uc3QgcmVzb2x2ZWQgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAqIEByZXR1cm4geyFDaHVua3N9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjaHVua1NlcnZpY2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCAnY2h1bmsnLCBDaHVua3MpO1xuICByZXR1cm4gZ2V0U2VydmljZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsICdjaHVuaycpO1xufVxuXG4vKipcbiAqIFJ1biB0aGUgZ2l2ZW4gZnVuY3Rpb24uIEZvciB2aXNpYmxlIGRvY3VtZW50cyB0aGUgZnVuY3Rpb24gd2lsbCBiZVxuICogY2FsbGVkIGluIGEgbWljcm8gdGFzayAoRXNzZW50aWFsbHkgQVNBUCkuIElmIHRoZSBkb2N1bWVudCBpc1xuICogbm90IHZpc2libGUsIHRhc2tzIHdpbGwgeWllbGQgdG8gdGhlIGV2ZW50IGxvb3AgKHRvIGdpdmUgdGhlIGJyb3dzZXJcbiAqIHRpbWUgdG8gZG8gb3RoZXIgdGhpbmdzKSBhbmQgbWF5IGV2ZW4gYmUgZnVydGhlciBkZWxheWVkIHVudGlsXG4gKiB0aGVyZSBpcyB0aW1lLlxuICpcbiAqIEBwYXJhbSB7IURvY3VtZW50fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBkb2NcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oP0lkbGVEZWFkbGluZSl9IGZuXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfbWFrZXNCb2R5VmlzaWJsZSBQYXNzIHRydWUgaWYgdGhpcyBzZXJ2aWNlIG1ha2VzXG4gKiAgICAgdGhlIGJvZHkgdmlzaWJsZS4gVGhpcyBpcyByZWxldmFudCBiZWNhdXNlIGl0IG1heSBpbmZsdWVuY2UgdGhlXG4gKiAgICAgdGFzayBzY2hlZHVsaW5nIHN0cmF0ZWd5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnR1cENodW5rKGRvYywgZm4sIG9wdF9tYWtlc0JvZHlWaXNpYmxlKSB7XG4gIGlmIChkZWFjdGl2YXRlZCkge1xuICAgIHJlc29sdmVkLnRoZW4oZm4pO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBzZXJ2aWNlID0gY2h1bmtTZXJ2aWNlRm9yRG9jKGRvYy5kb2N1bWVudEVsZW1lbnQgfHwgZG9jKTtcbiAgc2VydmljZS5ydW5Gb3JTdGFydHVwKGZuKTtcbiAgaWYgKG9wdF9tYWtlc0JvZHlWaXNpYmxlKSB7XG4gICAgc2VydmljZS5ydW5Gb3JTdGFydHVwKCgpID0+IHtcbiAgICAgIHNlcnZpY2UuYm9keUlzVmlzaWJsZV8gPSB0cnVlO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogUnVuIHRoZSBnaXZlbiBmdW5jdGlvbiBzb21ldGltZSBpbiB0aGUgZnV0dXJlIHdpdGhvdXQgYmxvY2tpbmcgVUkuXG4gKlxuICogSGlnaGVyIHByaW9yaXR5IHRhc2tzIGFyZSBleGVjdXRlZCBiZWZvcmUgbG93ZXIgcHJpb3JpdHkgdGFza3MuXG4gKiBUYXNrcyB3aXRoIHRoZSBzYW1lIHByaW9yaXR5IGFyZSBleGVjdXRlZCBpbiBGSUZPIG9yZGVyLlxuICpcbiAqIFVzZXMgYHJlcXVlc3RJZGxlQ2FsbGJhY2tgIGlmIGF2YWlsYWJsZSBhbmQgcGFzc2VzIHRoZSBgSWRsZURlYWRsaW5lYFxuICogb2JqZWN0IHRvIHRoZSBmdW5jdGlvbiwgd2hpY2ggY2FuIGJlIHVzZWQgdG8gcGVyZm9ybSBhIHZhcmlhYmxlIGFtb3VudFxuICogb2Ygd29yayBkZXBlbmRpbmcgb24gdGhlIHJlbWFpbmluZyBhbW91bnQgb2YgaWRsZSB0aW1lLlxuICpcbiAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICogQHBhcmFtIHtmdW5jdGlvbig/SWRsZURlYWRsaW5lKX0gZm5cbiAqIEBwYXJhbSB7Q2h1bmtQcmlvcml0eX0gcHJpb3JpdHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNodW5rKGVsZW1lbnRPckFtcERvYywgZm4sIHByaW9yaXR5KSB7XG4gIGlmIChkZWFjdGl2YXRlZCkge1xuICAgIHJlc29sdmVkLnRoZW4oZm4pO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBzZXJ2aWNlID0gY2h1bmtTZXJ2aWNlRm9yRG9jKGVsZW1lbnRPckFtcERvYyk7XG4gIHNlcnZpY2UucnVuKGZuLCBwcmlvcml0eSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshRWxlbWVudHwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gKiBAcmV0dXJuIHshQ2h1bmtzfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2h1bmtJbnN0YW5jZUZvclRlc3RpbmcoZWxlbWVudE9yQW1wRG9jKSB7XG4gIHJldHVybiBjaHVua1NlcnZpY2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jKTtcbn1cblxuLyoqXG4gKiBVc2UgYSBzdGFuZGFyZCBtaWNybyB0YXNrIGZvciBldmVyeSBpbnZvY2F0aW9uLiBUaGlzIHNob3VsZCBvbmx5XG4gKiBiZSBjYWxsZWQgZnJvbSB0aGUgQU1QIGJvb3RzdHJhcCBzY3JpcHQgaWYgaXQgaXMga25vd24gdGhhdFxuICogY2h1bmtpbmcgbWFrZXMgbm8gc2Vuc2UuIEluIHBhcnRpY3VsYXIgdGhpcyBpcyB0aGUgY2FzZSB3aGVuXG4gKiBBTVAgcnVucyBpbiB0aGUgYGFtcC1zaGFkb3dgIG11bHRpIGRvY3VtZW50IG1vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlQ2h1bmtpbmcoKSB7XG4gIGRlYWN0aXZhdGVkID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBbGxvdyBjb250aW51aW5nIG1hY3JvIHRhc2tzIGFmdGVyIGEgbG9uZyB0YXNrICg+NW1zKS5cbiAqIEluIHBhcnRpY3VsYXIgdGhpcyBpcyB0aGUgY2FzZSB3aGVuIEFNUCBydW5zIGluIHRoZSBgYW1wLWluYWJveGAgYWRzIG1vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGxvd0xvbmdUYXNrc0luQ2h1bmtpbmcoKSB7XG4gIGFsbG93TG9uZ1Rhc2tzID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlQ2h1bmtpbmdGb3JUZXN0aW5nKCkge1xuICBkZWFjdGl2YXRlZCA9IGZhbHNlO1xufVxuXG4vKipcbiAqIFJ1bnMgYWxsIGN1cnJlbnRseSBzY2hlZHVsZWQgY2h1bmtzLlxuICogSW5kZXBlbmRlbnQgb2YgZXJyb3JzIGl0IHdpbGwgdW53aW5kIHRoZSBxdWV1ZS4gV2lsbCBhZnRlcndhcmRzXG4gKiB0aHJvdyB0aGUgZmlyc3QgZW5jb3VudGVyZWQgZXJyb3IuXG4gKiBAcGFyYW0geyFFbGVtZW50fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkNodW5rc0ZvclRlc3RpbmcoZWxlbWVudE9yQW1wRG9jKSB7XG4gIGNvbnN0IHNlcnZpY2UgPSBjaHVua0luc3RhbmNlRm9yVGVzdGluZyhlbGVtZW50T3JBbXBEb2MpO1xuICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFzZXJ2aWNlLmV4ZWN1dGVfKC8qIGlkbGVEZWFkbGluZSAqLyBudWxsKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnJvcnMucHVzaChlKTtcbiAgICB9XG4gIH1cbiAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICB0aHJvdyBlcnJvcnNbMF07XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgcHJpb3JpdHkgb2YgYSBjaHVuayB0YXNrLiBIaWdoZXIgcHJpb3JpdHkgdGFza3MgaGF2ZSBoaWdoZXIgdmFsdWVzLlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IENodW5rUHJpb3JpdHkgPSB7XG4gIEhJR0g6IDIwLFxuICBMT1c6IDEwLFxuICBCQUNLR1JPVU5EOiAwLFxufTtcblxuLyoqIEBlbnVtIHtzdHJpbmd9ICovXG5jb25zdCBUYXNrU3RhdGUgPSB7XG4gIE5PVF9SVU46ICdub3RfcnVuJyxcbiAgUlVOOiAncnVuJyxcbn07XG5cbi8qKlxuICogQSBkZWZhdWx0IGNodW5rYWJsZSB0YXNrLlxuICogQHByaXZhdGVcbiAqL1xuY2xhc3MgVGFzayB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKD9JZGxlRGVhZGxpbmUpfSBmblxuICAgKi9cbiAgY29uc3RydWN0b3IoZm4pIHtcbiAgICAvKiogQHB1YmxpYyB7VGFza1N0YXRlfSAqL1xuICAgIHRoaXMuc3RhdGUgPSBUYXNrU3RhdGUuTk9UX1JVTjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFmdW5jdGlvbig/SWRsZURlYWRsaW5lKX0gKi9cbiAgICB0aGlzLmZuXyA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHRoZSB3cmFwcGVkIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0gez9JZGxlRGVhZGxpbmV9IGlkbGVEZWFkbGluZVxuICAgKiBAdGhyb3dzIHtFcnJvcn1cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgcnVuVGFza18oaWRsZURlYWRsaW5lKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUgPT0gVGFza1N0YXRlLlJVTikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnN0YXRlID0gVGFza1N0YXRlLlJVTjtcbiAgICB0cnkge1xuICAgICAgdGhpcy5mbl8oaWRsZURlYWRsaW5lKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLm9uVGFza0Vycm9yXyhlKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgZ2V0TmFtZV8oKSB7XG4gICAgcmV0dXJuIHRoaXMuZm5fLmRpc3BsYXlOYW1lIHx8IHRoaXMuZm5fLm5hbWU7XG4gIH1cblxuICAvKipcbiAgICogT3B0aW9uYWwgaGFuZGxpbmcgd2hlbiBhIHRhc2sgcnVuIHRocm93cyBhbiBlcnJvci5cbiAgICogQHBhcmFtIHtFcnJvcn0gdW51c2VkRXJyb3JcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVGFza0Vycm9yXyh1bnVzZWRFcnJvcikge1xuICAgIC8vIEJ5IGRlZmF1bHQsIG5vLW9wLlxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHRhc2sgc2hvdWxkIGJlIHJ1biB3aXRob3V0IGRlbGF5LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBpbW1lZGlhdGVUcmlnZ2VyQ29uZGl0aW9uXygpIHtcbiAgICAvLyBCeSBkZWZhdWx0LCB0aGVyZSBhcmUgbm8gaW1tZWRpYXRlIHRyaWdnZXIgY29uZGl0aW9ucy5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgdGFzayBzaG91bGQgYmUgc2NoZWR1bGVkIHVzaW5nIGByZXF1ZXN0SWRsZUNhbGxiYWNrYC5cbiAgICogT3RoZXJ3aXNlLCB0YXNrIGlzIHNjaGVkdWxlZCBhcyBtYWNyby10YXNrIG9uIG5leHQgZXZlbnQgbG9vcC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgdXNlUmVxdWVzdElkbGVDYWxsYmFja18oKSB7XG4gICAgLy8gQnkgZGVmYXVsdCwgbmV2ZXIgdXNlIHJlcXVlc3RJZGxlQ2FsbGJhY2suXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQSB0YXNrIHRoYXQncyBydW4gYXMgcGFydCBvZiBBTVAncyBzdGFydHVwIHNlcXVlbmNlLlxuICogQHByaXZhdGVcbiAqL1xuY2xhc3MgU3RhcnR1cFRhc2sgZXh0ZW5kcyBUYXNrIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oP0lkbGVEZWFkbGluZSl9IGZuXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUNodW5rc30gY2h1bmtzXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihmbiwgd2luLCBjaHVua3MpIHtcbiAgICBzdXBlcihmbik7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5jaHVua3NfID0gY2h1bmtzO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvblRhc2tFcnJvcl8odW51c2VkRXJyb3IpIHtcbiAgICAvLyBTdGFydHVwIHRhc2tzIHJ1biBlYXJseSBpbiBpbml0LiBBbGwgZXJyb3JzIHNob3VsZCBzaG93IHRoZSBkb2MuXG4gICAgbWFrZUJvZHlWaXNpYmxlUmVjb3Zlcnkoc2VsZi5kb2N1bWVudCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGltbWVkaWF0ZVRyaWdnZXJDb25kaXRpb25fKCkge1xuICAgIC8vIFJ1biBpbiBhIG1pY3JvIHRhc2sgd2hlbiB0aGUgZG9jIGlzIHZpc2libGUuIE90aGVyd2lzZSwgcnVuIGFmdGVyXG4gICAgLy8gaGF2aW5nIHlpZWxkZWQgdG8gdGhlIGV2ZW50IHF1ZXVlIG9uY2UuXG4gICAgcmV0dXJuIHRoaXMuaXNWaXNpYmxlXygpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB1c2VSZXF1ZXN0SWRsZUNhbGxiYWNrXygpIHtcbiAgICAvLyBXZSBvbmx5IHN0YXJ0IHVzaW5nIHJlcXVlc3RJZGxlQ2FsbGJhY2sgd2hlbiB0aGUgY29yZSBydW50aW1lIGhhc1xuICAgIC8vIGJlZW4gaW5pdGlhbGl6ZWQuIE90aGVyd2lzZSB3ZSByaXNrIHN0YXJ2aW5nIG91cnNlbHZlc1xuICAgIC8vIGJlZm9yZSB0aGUgcmVuZGVyLWNyaXRpY2FsIHdvcmsgaXMgZG9uZS5cbiAgICByZXR1cm4gdGhpcy5jaHVua3NfLmNvcmVSZWFkeV87XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzVmlzaWJsZV8oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2h1bmtzXy5hbXBkb2MuaXNWaXNpYmxlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGVzIHF1ZXVlaW5nLCBzY2hlZHVsaW5nIGFuZCBleGVjdXRpbmcgdGFza3MuXG4gKi9cbmNsYXNzIENodW5rcyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBEb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcERvYykge1xuICAgIC8qKiBAcHJvdGVjdGVkIEBjb25zdCB7IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2MgPSBhbXBEb2M7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSBhbXBEb2Mud2luO1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFQcmlvcml0eVF1ZXVlPFRhc2s+fSAqL1xuICAgIHRoaXMudGFza3NfID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtmdW5jdGlvbig/SWRsZURlYWRsaW5lKX0gKi9cbiAgICB0aGlzLmJvdW5kRXhlY3V0ZV8gPSB0aGlzLmV4ZWN1dGVfLmJpbmQodGhpcyk7XG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5kdXJhdGlvbk9mTGFzdEV4ZWN1dGlvbl8gPSAwO1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Jvb2xlYW59ICovXG4gICAgdGhpcy5zdXBwb3J0c0lucHV0UGVuZGluZ18gPSAhIShcbiAgICAgIHRoaXMud2luXy5uYXZpZ2F0b3Iuc2NoZWR1bGluZyAmJlxuICAgICAgdGhpcy53aW5fLm5hdmlnYXRvci5zY2hlZHVsaW5nLmlzSW5wdXRQZW5kaW5nXG4gICAgKTtcblxuICAgIC8qKlxuICAgICAqIFNldCB0byB0cnVlIGlmIHdlIHNjaGVkdWxlZCBhIG1hY3JvIG9yIG1pY3JvIHRhc2sgdG8gZXhlY3V0ZSB0aGUgbmV4dFxuICAgICAqIHRhc2suIElmIHRydWUsIHdlIGRvbid0IHNjaGVkdWxlIGFub3RoZXIgb25lLlxuICAgICAqIE5vdCBzZXQgdG8gdHJ1ZSBpZiB3ZSB1c2UgcklDLCBiZWNhdXNlIHdlIGFsd2F5cyB3YW50IHRvIHRyYW5zaXRpb25cbiAgICAgKiB0byBpbW1lZGl0YXRlIGludm9jYXRpb24gZnJvbSB0aGF0IHN0YXRlLlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuc2NoZWR1bGVkSW1tZWRpYXRlSW52b2NhdGlvbl8gPSBmYWxzZTtcbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59IFdoZXRoZXIgdGhlIGRvY3VtZW50IGNhbiBhY3R1YWxseSBiZSBwYWludGVkLiAqL1xuICAgIHRoaXMuYm9keUlzVmlzaWJsZV8gPSB0aGlzLndpbl8uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lmhhc0F0dHJpYnV0ZShcbiAgICAgICdpLWFtcGh0bWwtbm8tYm9pbGVycGxhdGUnXG4gICAgKTtcblxuICAgIHRoaXMud2luXy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGUpID0+IHtcbiAgICAgIGlmIChnZXREYXRhKGUpID09ICdhbXAtbWFjcm8tdGFzaycpIHtcbiAgICAgICAgdGhpcy5leGVjdXRlXygvKiBpZGxlRGVhZGxpbmUgKi8gbnVsbCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKiogQHByb3RlY3RlZCB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmNvcmVSZWFkeV8gPSBmYWxzZTtcbiAgICBTZXJ2aWNlcy52aWV3ZXJQcm9taXNlRm9yRG9jKGFtcERvYykudGhlbigoKSA9PiB7XG4gICAgICAvLyBPbmNlIHRoZSB2aWV3ZXIgaGFzIGJlZW4gcmVzb2x2ZWQsIG1vc3Qgb2YgY29yZSBydW50aW1lIGhhcyBiZWVuXG4gICAgICAvLyBpbml0aWFsaXplZCBhcyB3ZWxsLlxuICAgICAgdGhpcy5jb3JlUmVhZHlfID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIGFtcERvYy5vblZpc2liaWxpdHlDaGFuZ2VkKCgpID0+IHtcbiAgICAgIGlmIChhbXBEb2MuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZV8oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gZm4gYXMgYSBcImNodW5rXCIuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oP0lkbGVEZWFkbGluZSl9IGZuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcmlvcml0eVxuICAgKi9cbiAgcnVuKGZuLCBwcmlvcml0eSkge1xuICAgIGNvbnN0IHQgPSBuZXcgVGFzayhmbik7XG4gICAgdGhpcy5lbnF1ZXVlVGFza18odCwgcHJpb3JpdHkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhIGZuIHRoYXQncyBwYXJ0IG9mIEFNUCdzIHN0YXJ0dXAgc2VxdWVuY2UgYXMgYSBcImNodW5rXCIuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oP0lkbGVEZWFkbGluZSl9IGZuXG4gICAqL1xuICBydW5Gb3JTdGFydHVwKGZuKSB7XG4gICAgY29uc3QgdCA9IG5ldyBTdGFydHVwVGFzayhmbiwgdGhpcy53aW5fLCB0aGlzKTtcbiAgICB0aGlzLmVucXVldWVUYXNrXyh0LCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXVlcyBhIHRhc2sgdG8gYmUgZXhlY3V0ZWQgbGF0ZXIgd2l0aCBnaXZlbiBwcmlvcml0eS5cbiAgICogQHBhcmFtIHshVGFza30gdGFza1xuICAgKiBAcGFyYW0ge251bWJlcn0gcHJpb3JpdHlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVucXVldWVUYXNrXyh0YXNrLCBwcmlvcml0eSkge1xuICAgIHRoaXMudGFza3NfLmVucXVldWUodGFzaywgcHJpb3JpdHkpO1xuICAgIHRoaXMuc2NoZWR1bGVfKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmV4dCB0YXNrIHRoYXQgaGFzbid0IGJlZW4gcnVuIHlldC5cbiAgICogSWYgYG9wdF9kZXF1ZXVlYCBpcyB0cnVlLCByZW1vdmUgdGhlIHJldHVybmVkIHRhc2sgZnJvbSB0aGUgcXVldWUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9kZXF1ZXVlXG4gICAqIEByZXR1cm4gez9UYXNrfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbmV4dFRhc2tfKG9wdF9kZXF1ZXVlKSB7XG4gICAgbGV0IHQgPSB0aGlzLnRhc2tzXy5wZWVrKCk7XG4gICAgLy8gRGVxdWV1ZSB0YXNrcyB1bnRpbCB3ZSBmaW5kIG9uZSB0aGF0IGhhc24ndCBiZWVuIHJ1biB5ZXQuXG4gICAgd2hpbGUgKHQgJiYgdC5zdGF0ZSAhPT0gVGFza1N0YXRlLk5PVF9SVU4pIHtcbiAgICAgIHRoaXMudGFza3NfLmRlcXVldWUoKTtcbiAgICAgIHQgPSB0aGlzLnRhc2tzXy5wZWVrKCk7XG4gICAgfVxuICAgIC8vIElmIGBvcHRfZGVxdWV1ZWAgaXMgdHJ1ZSwgcmVtb3ZlIHRoaXMgdGFzayBmcm9tIHRoZSBxdWV1ZS5cbiAgICBpZiAodCAmJiBvcHRfZGVxdWV1ZSkge1xuICAgICAgdGhpcy50YXNrc18uZGVxdWV1ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYSB0YXNrLlxuICAgKiBTY2hlZHVsZSB0aGUgbmV4dCByb3VuZCBpZiB0aGVyZSBhcmUgbW9yZSB0YXNrcy5cbiAgICogQHBhcmFtIHs/SWRsZURlYWRsaW5lfSBpZGxlRGVhZGxpbmVcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBhbnl0aGluZyB3YXMgZXhlY3V0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBleGVjdXRlXyhpZGxlRGVhZGxpbmUpIHtcbiAgICBjb25zdCB0ID0gdGhpcy5uZXh0VGFza18oLyogb3B0X2RlcXVldWUgKi8gdHJ1ZSk7XG4gICAgaWYgKCF0KSB7XG4gICAgICB0aGlzLnNjaGVkdWxlZEltbWVkaWF0ZUludm9jYXRpb25fID0gZmFsc2U7XG4gICAgICB0aGlzLmR1cmF0aW9uT2ZMYXN0RXhlY3V0aW9uXyA9IDA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxldCBiZWZvcmU7XG4gICAgdHJ5IHtcbiAgICAgIGJlZm9yZSA9IERhdGUubm93KCk7XG4gICAgICB0LnJ1blRhc2tfKGlkbGVEZWFkbGluZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIFdlIHdhbnQgdG8gY2FwdHVyZSB0aGUgdGltZSBvZiB0aGUgZW50aXJlIHRhc2sgZHVyYXRpb24gaW5jbHVkaW5nXG4gICAgICAvLyBzY2hlZHVsZWQgaW1tZWRpYXRlIChmcm9tIHJlc29sdmVkIHByb21pc2VzKSBtaWNybyB0YXNrcy5cbiAgICAgIC8vIExhY2tpbmcgYSBiZXR0ZXIgd2F5IHRvIGRvIHRoaXMgd2UganVzdCBzY2hlZHVsZWQgMTAgbmVzdGVkXG4gICAgICAvLyBtaWNybyB0YXNrcy5cbiAgICAgIHJlc29sdmVkXG4gICAgICAgIC50aGVuKClcbiAgICAgICAgLnRoZW4oKVxuICAgICAgICAudGhlbigpXG4gICAgICAgIC50aGVuKClcbiAgICAgICAgLnRoZW4oKVxuICAgICAgICAudGhlbigpXG4gICAgICAgIC50aGVuKClcbiAgICAgICAgLnRoZW4oKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zY2hlZHVsZWRJbW1lZGlhdGVJbnZvY2F0aW9uXyA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuZHVyYXRpb25PZkxhc3RFeGVjdXRpb25fICs9IERhdGUubm93KCkgLSBiZWZvcmU7XG4gICAgICAgICAgZGV2KCkuZmluZShcbiAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgIHQuZ2V0TmFtZV8oKSxcbiAgICAgICAgICAgICdDaHVuayBkdXJhdGlvbicsXG4gICAgICAgICAgICBEYXRlLm5vdygpIC0gYmVmb3JlLFxuICAgICAgICAgICAgdGhpcy5kdXJhdGlvbk9mTGFzdEV4ZWN1dGlvbl9cbiAgICAgICAgICApO1xuXG4gICAgICAgICAgdGhpcy5zY2hlZHVsZV8oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGBleGVjdXRlXygpYCBhc3luY2hyb25vdXNseS5cbiAgICogQHBhcmFtIHs/SWRsZURlYWRsaW5lfSBpZGxlRGVhZGxpbmVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGV4ZWN1dGVBc2FwXyhpZGxlRGVhZGxpbmUpIHtcbiAgICAvLyBJZiB0aGUgdXNlci1hZ2VudCBzdXBwb3J0cyBpc0lucHV0UGVuZGluZywgdXNlIGl0IHRvIGJyZWFrIHRvIGEgbWFjcm8gdGFzayBhcyBuZWNlc3NhcnkuXG4gICAgLy8gT3RoZXJ3aXNlIElmIHdlJ3ZlIHNwZW50IG92ZXIgNSBtaWxsc2Vjb25kcyBleGVjdXRpbmcgdGhlXG4gICAgLy8gbGFzdCBpbnN0cnVjdGlvbiB5aWVsZCBiYWNrIHRvIHRoZSBtYWluIHRocmVhZC5cbiAgICAvLyA1IG1pbGxpc2Vjb25kcyBpcyBhIG1hZ2ljIG51bWJlci5cbiAgICBpZiAoXG4gICAgICAhYWxsb3dMb25nVGFza3MgJiZcbiAgICAgIHRoaXMuYm9keUlzVmlzaWJsZV8gJiZcbiAgICAgICh0aGlzLnN1cHBvcnRzSW5wdXRQZW5kaW5nX1xuICAgICAgICA/IC8qKiBAdHlwZSB7IXtzY2hlZHVsaW5nOiB7aXNJbnB1dFBlbmRpbmc6IEZ1bmN0aW9ufX19ICovIChcbiAgICAgICAgICAgIHRoaXMud2luXy5uYXZpZ2F0b3JcbiAgICAgICAgICApLnNjaGVkdWxpbmcuaXNJbnB1dFBlbmRpbmcoKVxuICAgICAgICA6IHRoaXMuZHVyYXRpb25PZkxhc3RFeGVjdXRpb25fID4gNSlcbiAgICApIHtcbiAgICAgIHRoaXMuZHVyYXRpb25PZkxhc3RFeGVjdXRpb25fID0gMDtcbiAgICAgIHRoaXMucmVxdWVzdE1hY3JvVGFza18oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzb2x2ZWQudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmJvdW5kRXhlY3V0ZV8oaWRsZURlYWRsaW5lKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZSBydW5uaW5nIHRoZSBuZXh0IHF1ZXVlZCB0YXNrLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2NoZWR1bGVfKCkge1xuICAgIGlmICh0aGlzLnNjaGVkdWxlZEltbWVkaWF0ZUludm9jYXRpb25fKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5leHRUYXNrID0gdGhpcy5uZXh0VGFza18oKTtcbiAgICBpZiAoIW5leHRUYXNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChuZXh0VGFzay5pbW1lZGlhdGVUcmlnZ2VyQ29uZGl0aW9uXygpKSB7XG4gICAgICB0aGlzLnNjaGVkdWxlZEltbWVkaWF0ZUludm9jYXRpb25fID0gdHJ1ZTtcbiAgICAgIHRoaXMuZXhlY3V0ZUFzYXBfKC8qIGlkbGVEZWFkbGluZSAqLyBudWxsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gSWYgcmVxdWVzdElkbGVDYWxsYmFjayBleGlzdHMsIHNjaGVkdWxlIGEgdGFzayB3aXRoIGl0LCBidXRcbiAgICAvLyBkbyBub3Qgd2FpdCBsb25nZXIgdGhhbiB0d28gc2Vjb25kcy5cbiAgICBpZiAobmV4dFRhc2sudXNlUmVxdWVzdElkbGVDYWxsYmFja18oKSAmJiB0aGlzLndpbl8ucmVxdWVzdElkbGVDYWxsYmFjaykge1xuICAgICAgb25JZGxlKFxuICAgICAgICB0aGlzLndpbl8sXG4gICAgICAgIC8vIFdhaXQgdW50aWwgd2UgaGF2ZSBhIGJ1ZGdldCBvZiBhdCBsZWFzdCAxNW1zLlxuICAgICAgICAvLyAxNW1zIGlzIGEgbWFnaWMgbnVtYmVyLiBCdWRnZXRzIGFyZSBoaWdoZXIgd2hlbiB0aGUgdXNlclxuICAgICAgICAvLyBpcyBjb21wbGV0ZWx5IGlkbGUgKGFyb3VuZCA0MCksIGJ1dCB0aGF0IG9jY3VycyB0b29cbiAgICAgICAgLy8gcmFyZWx5IHRvIGJlIHVzYWJsZS4gMTVtcyBidWRnZXRzIGNhbiBoYXBwZW4gZHVyaW5nIHNjcm9sbGluZ1xuICAgICAgICAvLyBidXQgb25seSBpZiB0aGUgZGV2aWNlIGlzIGRvaW5nIHN1cGVyLCBzdXBlciB3ZWxsLCBhbmQgbm9cbiAgICAgICAgLy8gcmVhbCBwcm9jZXNzaW5nIGlzIGRvbmUgYmV0d2VlbiBmcmFtZXMuXG4gICAgICAgIDE1IC8qIG1pbmltdW1UaW1lUmVtYWluaW5nICovLFxuICAgICAgICAyMDAwIC8qIHRpbWVvdXQgKi8sXG4gICAgICAgIHRoaXMuYm91bmRFeGVjdXRlX1xuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZXF1ZXN0TWFjcm9UYXNrXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3RzIGV4ZWN1dGluZyBvZiBhIG1hY3JvIHRhc2suIFlpZWxkcyB0byB0aGUgZXZlbnQgcXVldWVcbiAgICogYmVmb3JlIGV4ZWN1dGluZyB0aGUgdGFzay5cbiAgICogUGxhY2VzIHRhc2sgb24gYnJvd3NlciBtZXNzYWdlIHF1ZXVlIHdoaWNoIHRoZW4gcmVzcGVjdGl2ZWx5XG4gICAqIHRyaWdnZXJzIGRlcXVldWluZyBhbmQgZXhlY3V0aW9uIG9mIGEgY2h1bmsuXG4gICAqL1xuICByZXF1ZXN0TWFjcm9UYXNrXygpIHtcbiAgICAvLyBUaGUgbWVzc2FnZSBkb2Vzbid0IGFjdHVhbGx5IG1hdHRlci5cbiAgICB0aGlzLndpbl8uLypPSyovIHBvc3RNZXNzYWdlKCdhbXAtbWFjcm8tdGFzaycsICcqJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWxheXMgY2FsbGluZyB0aGUgZ2l2ZW4gZnVuY3Rpb24gdW50aWwgdGhlIGJyb3dzZXIgaXMgbm90aWZ5aW5nIHVzXG4gKiBhYm91dCBhIGNlcnRhaW4gbWluaW11bSBidWRnZXQgb3IgdGhlIHRpbWVvdXQgaXMgcmVhY2hlZC5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge251bWJlcn0gbWluaW11bVRpbWVSZW1haW5pbmcgTWluaW11bSBudW1iZXIgb2YgbWlsbGlzIGlkbGVcbiAqICAgICBidWRnZXQgZm9yIGNhbGxiYWNrIHRvIGZpcmUuXG4gKiBAcGFyYW0ge251bWJlcn0gdGltZW91dCBpbiBtaWxsaXMgZm9yIGNhbGxiYWNrIHRvIGZpcmUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKD9JZGxlRGVhZGxpbmUpfSBmbiBDYWxsYmFjay5cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gb25JZGxlKHdpbiwgbWluaW11bVRpbWVSZW1haW5pbmcsIHRpbWVvdXQsIGZuKSB7XG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFJZGxlRGVhZGxpbmV9IGluZm9cbiAgICovXG4gIGZ1bmN0aW9uIHJJQyhpbmZvKSB7XG4gICAgaWYgKGluZm8udGltZVJlbWFpbmluZygpIDwgbWluaW11bVRpbWVSZW1haW5pbmcpIHtcbiAgICAgIGNvbnN0IHJlbWFpbmluZ1RpbWVvdXQgPSB0aW1lb3V0IC0gKERhdGUubm93KCkgLSBzdGFydFRpbWUpO1xuICAgICAgaWYgKHJlbWFpbmluZ1RpbWVvdXQgPD0gMCB8fCBpbmZvLmRpZFRpbWVvdXQpIHtcbiAgICAgICAgZGV2KCkuZmluZShUQUcsICdUaW1lZCBvdXQnLCB0aW1lb3V0LCBpbmZvLmRpZFRpbWVvdXQpO1xuICAgICAgICBmbihpbmZvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRldigpLmZpbmUoXG4gICAgICAgICAgVEFHLFxuICAgICAgICAgICdSZXNjaGVkdWxpbmcgd2l0aCcsXG4gICAgICAgICAgcmVtYWluaW5nVGltZW91dCxcbiAgICAgICAgICBpbmZvLnRpbWVSZW1haW5pbmcoKVxuICAgICAgICApO1xuICAgICAgICB3aW4ucmVxdWVzdElkbGVDYWxsYmFjayhySUMsIHt0aW1lb3V0OiByZW1haW5pbmdUaW1lb3V0fSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRldigpLmZpbmUoVEFHLCAnUnVubmluZyBpZGxlIGNhbGxiYWNrIHdpdGggJywgbWluaW11bVRpbWVSZW1haW5pbmcpO1xuICAgICAgZm4oaW5mbyk7XG4gICAgfVxuICB9XG4gIHdpbi5yZXF1ZXN0SWRsZUNhbGxiYWNrKHJJQywge3RpbWVvdXR9KTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/chunk.js