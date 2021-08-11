function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { Deferred } from "../core/data-structures/promise";
import {
addDocumentVisibilityChangeListener,
isDocumentHidden,
removeDocumentVisibilityChangeListener } from "../core/document-visibility";

import { rethrowAsync } from "../core/error";

import { Services } from "./";

import { installTimerService } from "./timer-impl";

import { cancellation } from "../error-reporting";
import { dev, devAssert } from "../log";
import { Pass } from "../pass";
import { getService, registerServiceBuilder } from "../service-helpers";

/** @const {time} */
var FRAME_TIME = 16;

/**
 * @typedef {!Object<string, *>}
 */
var VsyncStateDef;

/**
 * @typedef {{
 *   measure: (function(!VsyncStateDef):undefined|undefined),
 *   mutate: (function(!VsyncStateDef):undefined|undefined)
 * }}
 */
var VsyncTaskSpecDef;

/**
 * Abstraction over requestAnimationFrame (rAF) that batches DOM read (measure)
 * and write (mutate) tasks in a single frame, to eliminate layout thrashing.
 *
 * NOTE: If the document is invisible due to prerendering (this includes
 * application-level prerendering where the doc is rendered in a hidden
 * iframe or webview), then no frame will be scheduled.
 * @package Visible for type.
 * @implements {../service.Disposable}
 */
export var Vsync = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Vsync(win) {_classCallCheck(this, Vsync);
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!./ampdoc-impl.AmpDocService} */
    this.ampdocService_ = Services.ampdocServiceFor(this.win);

    /** @private @const {function(function())}  */
    this.raf_ = this.getRaf_();

    /**
     * Tasks to run in the next frame.
     * @private {!Array<!VsyncTaskSpecDef>}
     */
    this.tasks_ = [];

    /**
     * Double buffer for tasks.
     * @private {!Array<!VsyncTaskSpecDef>}
     */
    this.nextTasks_ = [];

    /**
     * States for tasks in the next frame in the same order.
     * @private {!Array<!VsyncStateDef>}
     */
    this.states_ = [];

    /**
     * Double buffer for states.
     * @private {!Array<!VsyncStateDef>}
     */
    this.nextStates_ = [];

    /**
     * Whether a new animation frame has been scheduled.
     * @private {boolean}
     */
    this.scheduled_ = false;

    /** @private {?Promise} */
    this.nextFramePromise_ = null;

    /** @protected {?function()} */
    this.nextFrameResolver_ = null;

    /** @const {!Function} */
    this.boundRunScheduledTasks_ = this.runScheduledTasks_.bind(this);

    /**
     * If the doc is invisible we use this instead of rAF because rAF
     * does not run in that scenario.
     * However, we only do this for non-animation tasks as running
     * animations doesn't make sense when not visible.
     * @const {!Pass}
     */
    this.invisiblePass_ = new Pass(
    this.win,
    this.boundRunScheduledTasks_,
    FRAME_TIME);


    /**
     * Similar to this.invisiblePass_, but backing up a real rAF call. If we
     * somehow failed to know that we are throttled we use a timer (which
     * may also be throttled but at least runs eventually) to make sure
     * we continue to get work done.
     * @const {!Pass}
     */
    this.backupPass_ = new Pass(
    this.win,
    this.boundRunScheduledTasks_,
    // We cancel this when rAF fires and really only want it to fire
    // if rAF doesn't work at all.
    FRAME_TIME * 2.5);


    // When the document changes visibility, vsync has to reschedule the queue
    // processing.
    /** @private {function()} */
    this.boundOnVisibilityChanged_ = this.onVisibilityChanged_.bind(this);
    if (this.ampdocService_.isSingleDoc()) {
      // In a single-doc mode, the visibility of the doc == global visibility.
      // Thus, it's more efficient to only listen to it once.
      this.ampdocService_.
      getSingleDoc().
      onVisibilityChanged(this.boundOnVisibilityChanged_);
    } else {
      // In multi-doc mode, we track separately the global visibility and
      // per-doc visibility when necessary.
      addDocumentVisibilityChangeListener(
      this.win.document,
      this.boundOnVisibilityChanged_);

    }
  }

  /** @override */_createClass(Vsync, [{ key: "dispose", value:
    function dispose() {
      removeDocumentVisibilityChangeListener(
      this.win.document,
      this.boundOnVisibilityChanged_);

    }

    /** @private */ }, { key: "onVisibilityChanged_", value:
    function onVisibilityChanged_() {
      if (this.scheduled_) {
        this.forceSchedule_();
      }
    }

    /**
     * Runs vsync task: measure followed by mutate.
     *
     * If state is not provided, the value passed to the measure and mutate
     * will be undefined.
     *
     * @param {!VsyncTaskSpecDef} task
     * @param {!VsyncStateDef=} opt_state
     */ }, { key: "run", value:
    function run(task, opt_state) {
      this.tasks_.push(task);
      this.states_.push(opt_state || undefined);
      this.schedule_();
    }

    /**
     * Runs vsync task: measure followed by mutate. Returns the promise that
     * will be resolved as soon as the task has been completed.
     *
     * If state is not provided, the value passed to the measure and mutate
     * will be undefined.
     *
     * @param {!VsyncTaskSpecDef} task
     * @param {!VsyncStateDef=} opt_state
     * @return {!Promise}
     */ }, { key: "runPromise", value:
    function runPromise(task, opt_state) {
      this.run(task, opt_state);
      if (this.nextFramePromise_) {
        return this.nextFramePromise_;
      }
      var deferred = new Deferred();
      this.nextFrameResolver_ = deferred.resolve;
      return (this.nextFramePromise_ = deferred.promise);
    }

    /**
     * Creates a function that will call {@link run} method.
     * @param {!VsyncTaskSpecDef} task
     * @return {function(!VsyncStateDef=)}
     */ }, { key: "createTask", value:
    function createTask(task) {var _this = this;
      return (/** @type {function(!VsyncStateDef=)} */(
        function (opt_state) {
          _this.run(task, opt_state);
        }));

    }

    /**
     * Runs the mutate operation via vsync.
     * @param {function():undefined} mutator
     */ }, { key: "mutate", value:
    function mutate(mutator) {
      this.run({
        measure: undefined, // For uniform hidden class.
        mutate: mutator });

    }

    /**
     * Runs `mutate` wrapped in a promise.
     * @param {function():undefined} mutator
     * @return {!Promise}
     */ }, { key: "mutatePromise", value:
    function mutatePromise(mutator) {
      return this.runPromise({
        measure: undefined,
        mutate: mutator });

    }

    /**
     * Runs the measure operation via vsync.
     * @param {function():undefined} measurer
     */ }, { key: "measure", value:
    function measure(measurer) {
      this.run({
        measure: measurer,
        mutate: undefined // For uniform hidden class.
      });
    }

    /**
     * Runs `measure` wrapped in a promise.
     * @param {function():TYPE} measurer
     * @return {!Promise<TYPE>}
     * @template TYPE
     */ }, { key: "measurePromise", value:
    function measurePromise(measurer) {var _this2 = this;
      return new Promise(function (resolve) {
        _this2.measure(function () {
          resolve(measurer());
        });
      });
    }

    /**
     * Whether the runtime is allowed to animate at this time.
     * @param {!Node} contextNode
     * @return {boolean}
     */ }, { key: "canAnimate", value:
    function canAnimate(contextNode) {
      return this.canAnimate_(devAssert(contextNode));
    }

    /**
     * @param {!Node=} opt_contextNode
     * @return {boolean}
     * @private
     */ }, { key: "canAnimate_", value:
    function canAnimate_(opt_contextNode) {
      // Window level: animations allowed only when global window is visible.
      if (isDocumentHidden(this.win.document)) {
        return false;
      }

      // Single doc: animations allowed when single doc is visible.
      if (this.ampdocService_.isSingleDoc()) {
        return this.ampdocService_.getSingleDoc().isVisible();
      }

      // Multi-doc: animations depend on the state of the relevant doc.
      if (opt_contextNode) {
        var ampdoc = this.ampdocService_.getAmpDocIfAvailable(opt_contextNode);
        return !ampdoc || ampdoc.isVisible();
      }

      return true;
    }

    /**
     * Runs the animation vsync task. This operation can only run when animations
     * are allowed. Otherwise, this method returns `false` and exits.
     * @param {!Node} contextNode
     * @param {!VsyncTaskSpecDef} task
     * @param {!VsyncStateDef=} opt_state
     * @return {boolean}
     */ }, { key: "runAnim", value:
    function runAnim(contextNode, task, opt_state) {
      // Do not request animation frames when the document is not visible.
      if (!this.canAnimate_(contextNode)) {
        dev().warn(
        'VSYNC',
        'Did not schedule a vsync request, because document was invisible');

        return false;
      }
      this.run(task, opt_state);
      return true;
    }

    /**
     * Creates an animation vsync task. This operation can only run when
     * animations are allowed. Otherwise, this closure returns `false` and exits.
     * @param {!Node} contextNode
     * @param {!VsyncTaskSpecDef} task
     * @return {function(!VsyncStateDef=):boolean}
     */ }, { key: "createAnimTask", value:
    function createAnimTask(contextNode, task) {var _this3 = this;
      return (/** @type {function(!VsyncStateDef=):boolean} */(
        function (opt_state) {
          return _this3.runAnim(contextNode, task, opt_state);
        }));

    }

    /**
     * Runs the series of mutates until the mutator returns a false value.
     * @param {!Node} contextNode
     * @param {function(time, time, !VsyncStateDef):boolean} mutator The
     *   mutator callback. Only expected to do DOM writes, not reads. If the
     *   returned value is true, the vsync task will be repeated, otherwise it
     *   will be completed. The arguments are: timeSinceStart:time,
     *   timeSincePrev:time and state:VsyncStateDef.
     * @param {number=} opt_timeout Optional timeout that will force the series
     *   to complete and reject the promise.
     * @return {!Promise} Returns the promise that will either resolve on when
     *   the vsync series are completed or reject in case of failure, such as
     *   timeout.
     */ }, { key: "runAnimMutateSeries", value:
    function runAnimMutateSeries(contextNode, mutator, opt_timeout) {var _this4 = this;
      if (!this.canAnimate_(contextNode)) {
        return Promise.reject(cancellation());
      }
      return new Promise(function (resolve, reject) {
        var startTime = Date.now();
        var prevTime = 0;
        var task = _this4.createAnimTask(contextNode, {
          mutate: function mutate(state) {
            var timeSinceStart = Date.now() - startTime;
            var res = mutator(timeSinceStart, timeSinceStart - prevTime, state);
            if (!res) {
              resolve();
            } else if (opt_timeout && timeSinceStart > opt_timeout) {
              reject(new Error('timeout'));
            } else {
              prevTime = timeSinceStart;
              task(state);
            }
          } });

        task({});
      });
    }

    /** @private */ }, { key: "schedule_", value:
    function schedule_() {
      if (this.scheduled_) {
        return;
      }
      // Schedule actual animation frame and then run tasks.
      this.scheduled_ = true;
      this.forceSchedule_();
    }

    /** @private */ }, { key: "forceSchedule_", value:
    function forceSchedule_() {
      if (this.canAnimate_()) {
        this.raf_(this.boundRunScheduledTasks_);
        this.backupPass_.schedule();
      } else {
        this.invisiblePass_.schedule();
      }
    }

    /**
     * Runs all scheduled tasks. This is typically called in an RAF
     * callback. Tests may call this method to force execution of
     * tasks without waiting.
     * @private
     */ }, { key: "runScheduledTasks_", value:
    function runScheduledTasks_() {
      this.backupPass_.cancel();
      this.scheduled_ = false;

      var resolver = this.nextFrameResolver_,states = this.states_,tasks = this.tasks_;
      this.nextFrameResolver_ = null;
      this.nextFramePromise_ = null;
      // Double buffering
      this.tasks_ = this.nextTasks_;
      this.states_ = this.nextStates_;
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].measure) {
          if (!callTask_(tasks[i].measure, states[i])) {
            // Ensure that the mutate is not executed when measure fails.
            tasks[i].mutate = undefined;
          }
        }
      }
      for (var _i = 0; _i < tasks.length; _i++) {
        if (tasks[_i].mutate) {
          callTask_(tasks[_i].mutate, states[_i]);
        }
      }
      // Swap last arrays into double buffer.
      this.nextTasks_ = tasks;
      this.nextStates_ = states;
      this.nextTasks_.length = 0;
      this.nextStates_.length = 0;
      if (resolver) {
        resolver();
      }
    }

    /**
     * @return {function(function())} requestAnimationFrame or polyfill.
     */ }, { key: "getRaf_", value:
    function getRaf_() {var _this5 = this;
      var raf =
      this.win.requestAnimationFrame || this.win.webkitRequestAnimationFrame;
      if (raf) {
        return raf.bind(this.win);
      }
      var lastTime = 0;
      return function (fn) {
        var now = Date.now();
        // By default we take 16ms between frames, but if the last frame is say
        // 10ms ago, we only want to wait 6ms.
        var timeToCall = Math.max(0, FRAME_TIME - (now - lastTime));
        lastTime = now + timeToCall;
        _this5.win.setTimeout(fn, timeToCall);
      };
    } }]);return Vsync;}();


/**
 * For optimization reasons to stop try/catch from blocking optimization.
 * @param {function(!VsyncStateDef):undefined|undefined} callback
 * @param {!VsyncStateDef} state
 * @return {boolean}
 */
function callTask_(callback, state) {
  devAssert(callback);
  try {
    var ret = callback(state);
    if (ret !== undefined) {
      dev().error(
      'VSYNC',
      'callback returned a value but vsync cannot propogate it: %s',
      callback.toString());

    }
  } catch (e) {
    rethrowAsync(e);
    return false;
  }
  return true;
}

/**
 * @param {!Window} window
 * @return {!Vsync}
 */
export function vsyncForTesting(window) {
  installVsyncService(window);
  return getService(window, 'vsync');
}

/**
 * @param {!Window} window
 */
export function installVsyncService(window) {
  installTimerService(window);
  registerServiceBuilder(window, 'vsync', Vsync);
}
// /Users/mszylkowski/src/amphtml/src/service/vsync-impl.js