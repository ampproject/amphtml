function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { Deferred } from "../core/data-structures/promise";
import { addDocumentVisibilityChangeListener, isDocumentHidden, removeDocumentVisibilityChangeListener } from "../core/document-visibility";
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
  function Vsync(win) {
    _classCallCheck(this, Vsync);

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
    this.invisiblePass_ = new Pass(this.win, this.boundRunScheduledTasks_, FRAME_TIME);

    /**
     * Similar to this.invisiblePass_, but backing up a real rAF call. If we
     * somehow failed to know that we are throttled we use a timer (which
     * may also be throttled but at least runs eventually) to make sure
     * we continue to get work done.
     * @const {!Pass}
     */
    this.backupPass_ = new Pass(this.win, this.boundRunScheduledTasks_, // We cancel this when rAF fires and really only want it to fire
    // if rAF doesn't work at all.
    FRAME_TIME * 2.5);
    // When the document changes visibility, vsync has to reschedule the queue
    // processing.

    /** @private {function()} */
    this.boundOnVisibilityChanged_ = this.onVisibilityChanged_.bind(this);

    if (this.ampdocService_.isSingleDoc()) {
      // In a single-doc mode, the visibility of the doc == global visibility.
      // Thus, it's more efficient to only listen to it once.
      this.ampdocService_.getSingleDoc().onVisibilityChanged(this.boundOnVisibilityChanged_);
    } else {
      // In multi-doc mode, we track separately the global visibility and
      // per-doc visibility when necessary.
      addDocumentVisibilityChangeListener(this.win.document, this.boundOnVisibilityChanged_);
    }
  }

  /** @override */
  _createClass(Vsync, [{
    key: "dispose",
    value: function dispose() {
      removeDocumentVisibilityChangeListener(this.win.document, this.boundOnVisibilityChanged_);
    }
    /** @private */

  }, {
    key: "onVisibilityChanged_",
    value: function onVisibilityChanged_() {
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
     */

  }, {
    key: "run",
    value: function run(task, opt_state) {
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
     */

  }, {
    key: "runPromise",
    value: function runPromise(task, opt_state) {
      this.run(task, opt_state);

      if (this.nextFramePromise_) {
        return this.nextFramePromise_;
      }

      var deferred = new Deferred();
      this.nextFrameResolver_ = deferred.resolve;
      return this.nextFramePromise_ = deferred.promise;
    }
    /**
     * Creates a function that will call {@link run} method.
     * @param {!VsyncTaskSpecDef} task
     * @return {function(!VsyncStateDef=)}
     */

  }, {
    key: "createTask",
    value: function createTask(task) {
      var _this = this;

      return (
        /** @type {function(!VsyncStateDef=)} */
        function (opt_state) {
          _this.run(task, opt_state);
        }
      );
    }
    /**
     * Runs the mutate operation via vsync.
     * @param {function():undefined} mutator
     */

  }, {
    key: "mutate",
    value: function mutate(mutator) {
      this.run({
        measure: undefined,
        // For uniform hidden class.
        mutate: mutator
      });
    }
    /**
     * Runs `mutate` wrapped in a promise.
     * @param {function():undefined} mutator
     * @return {!Promise}
     */

  }, {
    key: "mutatePromise",
    value: function mutatePromise(mutator) {
      return this.runPromise({
        measure: undefined,
        mutate: mutator
      });
    }
    /**
     * Runs the measure operation via vsync.
     * @param {function():undefined} measurer
     */

  }, {
    key: "measure",
    value: function measure(measurer) {
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
     */

  }, {
    key: "measurePromise",
    value: function measurePromise(measurer) {
      var _this2 = this;

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
     */

  }, {
    key: "canAnimate",
    value: function canAnimate(contextNode) {
      return this.canAnimate_(devAssert(contextNode));
    }
    /**
     * @param {!Node=} opt_contextNode
     * @return {boolean}
     * @private
     */

  }, {
    key: "canAnimate_",
    value: function canAnimate_(opt_contextNode) {
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
     */

  }, {
    key: "runAnim",
    value: function runAnim(contextNode, task, opt_state) {
      // Do not request animation frames when the document is not visible.
      if (!this.canAnimate_(contextNode)) {
        dev().warn('VSYNC', 'Did not schedule a vsync request, because document was invisible');
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
     */

  }, {
    key: "createAnimTask",
    value: function createAnimTask(contextNode, task) {
      var _this3 = this;

      return (
        /** @type {function(!VsyncStateDef=):boolean} */
        function (opt_state) {
          return _this3.runAnim(contextNode, task, opt_state);
        }
      );
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
     */

  }, {
    key: "runAnimMutateSeries",
    value: function runAnimMutateSeries(contextNode, mutator, opt_timeout) {
      var _this4 = this;

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
          }
        });

        task({});
      });
    }
    /** @private */

  }, {
    key: "schedule_",
    value: function schedule_() {
      if (this.scheduled_) {
        return;
      }

      // Schedule actual animation frame and then run tasks.
      this.scheduled_ = true;
      this.forceSchedule_();
    }
    /** @private */

  }, {
    key: "forceSchedule_",
    value: function forceSchedule_() {
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
     */

  }, {
    key: "runScheduledTasks_",
    value: function runScheduledTasks_() {
      this.backupPass_.cancel();
      this.scheduled_ = false;
      var resolver = this.nextFrameResolver_,
          states = this.states_,
          tasks = this.tasks_;
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
     */

  }, {
    key: "getRaf_",
    value: function getRaf_() {
      var _this5 = this;

      var raf = this.win.requestAnimationFrame || this.win.webkitRequestAnimationFrame;

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
    }
  }]);

  return Vsync;
}();

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
      dev().error('VSYNC', 'callback returned a value but vsync cannot propogate it: %s', callback.toString());
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZzeW5jLWltcGwuanMiXSwibmFtZXMiOlsiRGVmZXJyZWQiLCJhZGREb2N1bWVudFZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lciIsImlzRG9jdW1lbnRIaWRkZW4iLCJyZW1vdmVEb2N1bWVudFZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lciIsInJldGhyb3dBc3luYyIsIlNlcnZpY2VzIiwiaW5zdGFsbFRpbWVyU2VydmljZSIsImNhbmNlbGxhdGlvbiIsImRldiIsImRldkFzc2VydCIsIlBhc3MiLCJnZXRTZXJ2aWNlIiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlciIsIkZSQU1FX1RJTUUiLCJWc3luY1N0YXRlRGVmIiwiVnN5bmNUYXNrU3BlY0RlZiIsIlZzeW5jIiwid2luIiwiYW1wZG9jU2VydmljZV8iLCJhbXBkb2NTZXJ2aWNlRm9yIiwicmFmXyIsImdldFJhZl8iLCJ0YXNrc18iLCJuZXh0VGFza3NfIiwic3RhdGVzXyIsIm5leHRTdGF0ZXNfIiwic2NoZWR1bGVkXyIsIm5leHRGcmFtZVByb21pc2VfIiwibmV4dEZyYW1lUmVzb2x2ZXJfIiwiYm91bmRSdW5TY2hlZHVsZWRUYXNrc18iLCJydW5TY2hlZHVsZWRUYXNrc18iLCJiaW5kIiwiaW52aXNpYmxlUGFzc18iLCJiYWNrdXBQYXNzXyIsImJvdW5kT25WaXNpYmlsaXR5Q2hhbmdlZF8iLCJvblZpc2liaWxpdHlDaGFuZ2VkXyIsImlzU2luZ2xlRG9jIiwiZ2V0U2luZ2xlRG9jIiwib25WaXNpYmlsaXR5Q2hhbmdlZCIsImRvY3VtZW50IiwiZm9yY2VTY2hlZHVsZV8iLCJ0YXNrIiwib3B0X3N0YXRlIiwicHVzaCIsInVuZGVmaW5lZCIsInNjaGVkdWxlXyIsInJ1biIsImRlZmVycmVkIiwicmVzb2x2ZSIsInByb21pc2UiLCJtdXRhdG9yIiwibWVhc3VyZSIsIm11dGF0ZSIsInJ1blByb21pc2UiLCJtZWFzdXJlciIsIlByb21pc2UiLCJjb250ZXh0Tm9kZSIsImNhbkFuaW1hdGVfIiwib3B0X2NvbnRleHROb2RlIiwiaXNWaXNpYmxlIiwiYW1wZG9jIiwiZ2V0QW1wRG9jSWZBdmFpbGFibGUiLCJ3YXJuIiwicnVuQW5pbSIsIm9wdF90aW1lb3V0IiwicmVqZWN0Iiwic3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsInByZXZUaW1lIiwiY3JlYXRlQW5pbVRhc2siLCJzdGF0ZSIsInRpbWVTaW5jZVN0YXJ0IiwicmVzIiwiRXJyb3IiLCJzY2hlZHVsZSIsImNhbmNlbCIsInJlc29sdmVyIiwic3RhdGVzIiwidGFza3MiLCJpIiwibGVuZ3RoIiwiY2FsbFRhc2tfIiwicmFmIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwid2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibGFzdFRpbWUiLCJmbiIsInRpbWVUb0NhbGwiLCJNYXRoIiwibWF4Iiwic2V0VGltZW91dCIsImNhbGxiYWNrIiwicmV0IiwiZXJyb3IiLCJ0b1N0cmluZyIsImUiLCJ2c3luY0ZvclRlc3RpbmciLCJ3aW5kb3ciLCJpbnN0YWxsVnN5bmNTZXJ2aWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSO0FBQ0EsU0FDRUMsbUNBREYsRUFFRUMsZ0JBRkYsRUFHRUMsc0NBSEY7QUFLQSxTQUFRQyxZQUFSO0FBRUEsU0FBUUMsUUFBUjtBQUVBLFNBQVFDLG1CQUFSO0FBRUEsU0FBUUMsWUFBUjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxVQUFSLEVBQW9CQyxzQkFBcEI7O0FBRUE7QUFDQSxJQUFNQyxVQUFVLEdBQUcsRUFBbkI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsYUFBSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxnQkFBSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUM0RixDQUFELENBQVo7QUFDQSxXQUFPLEtBQVA7QUFDRDs7QUFDRCxTQUFPLElBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsZUFBVCxDQUF5QkMsTUFBekIsRUFBaUM7QUFDdENDLEVBQUFBLG1CQUFtQixDQUFDRCxNQUFELENBQW5CO0FBQ0EsU0FBT3ZGLFVBQVUsQ0FBQ3VGLE1BQUQsRUFBUyxPQUFULENBQWpCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxtQkFBVCxDQUE2QkQsTUFBN0IsRUFBcUM7QUFDMUM1RixFQUFBQSxtQkFBbUIsQ0FBQzRGLE1BQUQsQ0FBbkI7QUFDQXRGLEVBQUFBLHNCQUFzQixDQUFDc0YsTUFBRCxFQUFTLE9BQVQsRUFBa0JsRixLQUFsQixDQUF0QjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7RGVmZXJyZWR9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7XG4gIGFkZERvY3VtZW50VmlzaWJpbGl0eUNoYW5nZUxpc3RlbmVyLFxuICBpc0RvY3VtZW50SGlkZGVuLFxuICByZW1vdmVEb2N1bWVudFZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lcixcbn0gZnJvbSAnI2NvcmUvZG9jdW1lbnQtdmlzaWJpbGl0eSc7XG5pbXBvcnQge3JldGhyb3dBc3luY30gZnJvbSAnI2NvcmUvZXJyb3InO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7aW5zdGFsbFRpbWVyU2VydmljZX0gZnJvbSAnLi90aW1lci1pbXBsJztcblxuaW1wb3J0IHtjYW5jZWxsYXRpb259IGZyb20gJy4uL2Vycm9yLXJlcG9ydGluZyc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuLi9sb2cnO1xuaW1wb3J0IHtQYXNzfSBmcm9tICcuLi9wYXNzJztcbmltcG9ydCB7Z2V0U2VydmljZSwgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcn0gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcblxuLyoqIEBjb25zdCB7dGltZX0gKi9cbmNvbnN0IEZSQU1FX1RJTUUgPSAxNjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7IU9iamVjdDxzdHJpbmcsICo+fVxuICovXG5sZXQgVnN5bmNTdGF0ZURlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBtZWFzdXJlOiAoZnVuY3Rpb24oIVZzeW5jU3RhdGVEZWYpOnVuZGVmaW5lZHx1bmRlZmluZWQpLFxuICogICBtdXRhdGU6IChmdW5jdGlvbighVnN5bmNTdGF0ZURlZik6dW5kZWZpbmVkfHVuZGVmaW5lZClcbiAqIH19XG4gKi9cbmxldCBWc3luY1Rhc2tTcGVjRGVmO1xuXG4vKipcbiAqIEFic3RyYWN0aW9uIG92ZXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIChyQUYpIHRoYXQgYmF0Y2hlcyBET00gcmVhZCAobWVhc3VyZSlcbiAqIGFuZCB3cml0ZSAobXV0YXRlKSB0YXNrcyBpbiBhIHNpbmdsZSBmcmFtZSwgdG8gZWxpbWluYXRlIGxheW91dCB0aHJhc2hpbmcuXG4gKlxuICogTk9URTogSWYgdGhlIGRvY3VtZW50IGlzIGludmlzaWJsZSBkdWUgdG8gcHJlcmVuZGVyaW5nICh0aGlzIGluY2x1ZGVzXG4gKiBhcHBsaWNhdGlvbi1sZXZlbCBwcmVyZW5kZXJpbmcgd2hlcmUgdGhlIGRvYyBpcyByZW5kZXJlZCBpbiBhIGhpZGRlblxuICogaWZyYW1lIG9yIHdlYnZpZXcpLCB0aGVuIG5vIGZyYW1lIHdpbGwgYmUgc2NoZWR1bGVkLlxuICogQHBhY2thZ2UgVmlzaWJsZSBmb3IgdHlwZS5cbiAqIEBpbXBsZW1lbnRzIHsuLi9zZXJ2aWNlLkRpc3Bvc2FibGV9XG4gKi9cbmV4cG9ydCBjbGFzcyBWc3luYyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbiA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcGRvYy1pbXBsLkFtcERvY1NlcnZpY2V9ICovXG4gICAgdGhpcy5hbXBkb2NTZXJ2aWNlXyA9IFNlcnZpY2VzLmFtcGRvY1NlcnZpY2VGb3IodGhpcy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7ZnVuY3Rpb24oZnVuY3Rpb24oKSl9ICAqL1xuICAgIHRoaXMucmFmXyA9IHRoaXMuZ2V0UmFmXygpO1xuXG4gICAgLyoqXG4gICAgICogVGFza3MgdG8gcnVuIGluIHRoZSBuZXh0IGZyYW1lLlxuICAgICAqIEBwcml2YXRlIHshQXJyYXk8IVZzeW5jVGFza1NwZWNEZWY+fVxuICAgICAqL1xuICAgIHRoaXMudGFza3NfID0gW107XG5cbiAgICAvKipcbiAgICAgKiBEb3VibGUgYnVmZmVyIGZvciB0YXNrcy5cbiAgICAgKiBAcHJpdmF0ZSB7IUFycmF5PCFWc3luY1Rhc2tTcGVjRGVmPn1cbiAgICAgKi9cbiAgICB0aGlzLm5leHRUYXNrc18gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFN0YXRlcyBmb3IgdGFza3MgaW4gdGhlIG5leHQgZnJhbWUgaW4gdGhlIHNhbWUgb3JkZXIuXG4gICAgICogQHByaXZhdGUgeyFBcnJheTwhVnN5bmNTdGF0ZURlZj59XG4gICAgICovXG4gICAgdGhpcy5zdGF0ZXNfID0gW107XG5cbiAgICAvKipcbiAgICAgKiBEb3VibGUgYnVmZmVyIGZvciBzdGF0ZXMuXG4gICAgICogQHByaXZhdGUgeyFBcnJheTwhVnN5bmNTdGF0ZURlZj59XG4gICAgICovXG4gICAgdGhpcy5uZXh0U3RhdGVzXyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBhIG5ldyBhbmltYXRpb24gZnJhbWUgaGFzIGJlZW4gc2NoZWR1bGVkLlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuc2NoZWR1bGVkXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/UHJvbWlzZX0gKi9cbiAgICB0aGlzLm5leHRGcmFtZVByb21pc2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJvdGVjdGVkIHs/ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLm5leHRGcmFtZVJlc29sdmVyXyA9IG51bGw7XG5cbiAgICAvKiogQGNvbnN0IHshRnVuY3Rpb259ICovXG4gICAgdGhpcy5ib3VuZFJ1blNjaGVkdWxlZFRhc2tzXyA9IHRoaXMucnVuU2NoZWR1bGVkVGFza3NfLmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGUgZG9jIGlzIGludmlzaWJsZSB3ZSB1c2UgdGhpcyBpbnN0ZWFkIG9mIHJBRiBiZWNhdXNlIHJBRlxuICAgICAqIGRvZXMgbm90IHJ1biBpbiB0aGF0IHNjZW5hcmlvLlxuICAgICAqIEhvd2V2ZXIsIHdlIG9ubHkgZG8gdGhpcyBmb3Igbm9uLWFuaW1hdGlvbiB0YXNrcyBhcyBydW5uaW5nXG4gICAgICogYW5pbWF0aW9ucyBkb2Vzbid0IG1ha2Ugc2Vuc2Ugd2hlbiBub3QgdmlzaWJsZS5cbiAgICAgKiBAY29uc3QgeyFQYXNzfVxuICAgICAqL1xuICAgIHRoaXMuaW52aXNpYmxlUGFzc18gPSBuZXcgUGFzcyhcbiAgICAgIHRoaXMud2luLFxuICAgICAgdGhpcy5ib3VuZFJ1blNjaGVkdWxlZFRhc2tzXyxcbiAgICAgIEZSQU1FX1RJTUVcbiAgICApO1xuXG4gICAgLyoqXG4gICAgICogU2ltaWxhciB0byB0aGlzLmludmlzaWJsZVBhc3NfLCBidXQgYmFja2luZyB1cCBhIHJlYWwgckFGIGNhbGwuIElmIHdlXG4gICAgICogc29tZWhvdyBmYWlsZWQgdG8ga25vdyB0aGF0IHdlIGFyZSB0aHJvdHRsZWQgd2UgdXNlIGEgdGltZXIgKHdoaWNoXG4gICAgICogbWF5IGFsc28gYmUgdGhyb3R0bGVkIGJ1dCBhdCBsZWFzdCBydW5zIGV2ZW50dWFsbHkpIHRvIG1ha2Ugc3VyZVxuICAgICAqIHdlIGNvbnRpbnVlIHRvIGdldCB3b3JrIGRvbmUuXG4gICAgICogQGNvbnN0IHshUGFzc31cbiAgICAgKi9cbiAgICB0aGlzLmJhY2t1cFBhc3NfID0gbmV3IFBhc3MoXG4gICAgICB0aGlzLndpbixcbiAgICAgIHRoaXMuYm91bmRSdW5TY2hlZHVsZWRUYXNrc18sXG4gICAgICAvLyBXZSBjYW5jZWwgdGhpcyB3aGVuIHJBRiBmaXJlcyBhbmQgcmVhbGx5IG9ubHkgd2FudCBpdCB0byBmaXJlXG4gICAgICAvLyBpZiByQUYgZG9lc24ndCB3b3JrIGF0IGFsbC5cbiAgICAgIEZSQU1FX1RJTUUgKiAyLjVcbiAgICApO1xuXG4gICAgLy8gV2hlbiB0aGUgZG9jdW1lbnQgY2hhbmdlcyB2aXNpYmlsaXR5LCB2c3luYyBoYXMgdG8gcmVzY2hlZHVsZSB0aGUgcXVldWVcbiAgICAvLyBwcm9jZXNzaW5nLlxuICAgIC8qKiBAcHJpdmF0ZSB7ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLmJvdW5kT25WaXNpYmlsaXR5Q2hhbmdlZF8gPSB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZWRfLmJpbmQodGhpcyk7XG4gICAgaWYgKHRoaXMuYW1wZG9jU2VydmljZV8uaXNTaW5nbGVEb2MoKSkge1xuICAgICAgLy8gSW4gYSBzaW5nbGUtZG9jIG1vZGUsIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBkb2MgPT0gZ2xvYmFsIHZpc2liaWxpdHkuXG4gICAgICAvLyBUaHVzLCBpdCdzIG1vcmUgZWZmaWNpZW50IHRvIG9ubHkgbGlzdGVuIHRvIGl0IG9uY2UuXG4gICAgICB0aGlzLmFtcGRvY1NlcnZpY2VfXG4gICAgICAgIC5nZXRTaW5nbGVEb2MoKVxuICAgICAgICAub25WaXNpYmlsaXR5Q2hhbmdlZCh0aGlzLmJvdW5kT25WaXNpYmlsaXR5Q2hhbmdlZF8pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbiBtdWx0aS1kb2MgbW9kZSwgd2UgdHJhY2sgc2VwYXJhdGVseSB0aGUgZ2xvYmFsIHZpc2liaWxpdHkgYW5kXG4gICAgICAvLyBwZXItZG9jIHZpc2liaWxpdHkgd2hlbiBuZWNlc3NhcnkuXG4gICAgICBhZGREb2N1bWVudFZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lcihcbiAgICAgICAgdGhpcy53aW4uZG9jdW1lbnQsXG4gICAgICAgIHRoaXMuYm91bmRPblZpc2liaWxpdHlDaGFuZ2VkX1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgcmVtb3ZlRG9jdW1lbnRWaXNpYmlsaXR5Q2hhbmdlTGlzdGVuZXIoXG4gICAgICB0aGlzLndpbi5kb2N1bWVudCxcbiAgICAgIHRoaXMuYm91bmRPblZpc2liaWxpdHlDaGFuZ2VkX1xuICAgICk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgb25WaXNpYmlsaXR5Q2hhbmdlZF8oKSB7XG4gICAgaWYgKHRoaXMuc2NoZWR1bGVkXykge1xuICAgICAgdGhpcy5mb3JjZVNjaGVkdWxlXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIHZzeW5jIHRhc2s6IG1lYXN1cmUgZm9sbG93ZWQgYnkgbXV0YXRlLlxuICAgKlxuICAgKiBJZiBzdGF0ZSBpcyBub3QgcHJvdmlkZWQsIHRoZSB2YWx1ZSBwYXNzZWQgdG8gdGhlIG1lYXN1cmUgYW5kIG11dGF0ZVxuICAgKiB3aWxsIGJlIHVuZGVmaW5lZC5cbiAgICpcbiAgICogQHBhcmFtIHshVnN5bmNUYXNrU3BlY0RlZn0gdGFza1xuICAgKiBAcGFyYW0geyFWc3luY1N0YXRlRGVmPX0gb3B0X3N0YXRlXG4gICAqL1xuICBydW4odGFzaywgb3B0X3N0YXRlKSB7XG4gICAgdGhpcy50YXNrc18ucHVzaCh0YXNrKTtcbiAgICB0aGlzLnN0YXRlc18ucHVzaChvcHRfc3RhdGUgfHwgdW5kZWZpbmVkKTtcbiAgICB0aGlzLnNjaGVkdWxlXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgdnN5bmMgdGFzazogbWVhc3VyZSBmb2xsb3dlZCBieSBtdXRhdGUuIFJldHVybnMgdGhlIHByb21pc2UgdGhhdFxuICAgKiB3aWxsIGJlIHJlc29sdmVkIGFzIHNvb24gYXMgdGhlIHRhc2sgaGFzIGJlZW4gY29tcGxldGVkLlxuICAgKlxuICAgKiBJZiBzdGF0ZSBpcyBub3QgcHJvdmlkZWQsIHRoZSB2YWx1ZSBwYXNzZWQgdG8gdGhlIG1lYXN1cmUgYW5kIG11dGF0ZVxuICAgKiB3aWxsIGJlIHVuZGVmaW5lZC5cbiAgICpcbiAgICogQHBhcmFtIHshVnN5bmNUYXNrU3BlY0RlZn0gdGFza1xuICAgKiBAcGFyYW0geyFWc3luY1N0YXRlRGVmPX0gb3B0X3N0YXRlXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgcnVuUHJvbWlzZSh0YXNrLCBvcHRfc3RhdGUpIHtcbiAgICB0aGlzLnJ1bih0YXNrLCBvcHRfc3RhdGUpO1xuICAgIGlmICh0aGlzLm5leHRGcmFtZVByb21pc2VfKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0RnJhbWVQcm9taXNlXztcbiAgICB9XG4gICAgY29uc3QgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcbiAgICB0aGlzLm5leHRGcmFtZVJlc29sdmVyXyA9IGRlZmVycmVkLnJlc29sdmU7XG4gICAgcmV0dXJuICh0aGlzLm5leHRGcmFtZVByb21pc2VfID0gZGVmZXJyZWQucHJvbWlzZSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBjYWxsIHtAbGluayBydW59IG1ldGhvZC5cbiAgICogQHBhcmFtIHshVnN5bmNUYXNrU3BlY0RlZn0gdGFza1xuICAgKiBAcmV0dXJuIHtmdW5jdGlvbighVnN5bmNTdGF0ZURlZj0pfVxuICAgKi9cbiAgY3JlYXRlVGFzayh0YXNrKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7ZnVuY3Rpb24oIVZzeW5jU3RhdGVEZWY9KX0gKi8gKFxuICAgICAgKG9wdF9zdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLnJ1bih0YXNrLCBvcHRfc3RhdGUpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUnVucyB0aGUgbXV0YXRlIG9wZXJhdGlvbiB2aWEgdnN5bmMuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTp1bmRlZmluZWR9IG11dGF0b3JcbiAgICovXG4gIG11dGF0ZShtdXRhdG9yKSB7XG4gICAgdGhpcy5ydW4oe1xuICAgICAgbWVhc3VyZTogdW5kZWZpbmVkLCAvLyBGb3IgdW5pZm9ybSBoaWRkZW4gY2xhc3MuXG4gICAgICBtdXRhdGU6IG11dGF0b3IsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUnVucyBgbXV0YXRlYCB3cmFwcGVkIGluIGEgcHJvbWlzZS5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOnVuZGVmaW5lZH0gbXV0YXRvclxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIG11dGF0ZVByb21pc2UobXV0YXRvcikge1xuICAgIHJldHVybiB0aGlzLnJ1blByb21pc2Uoe1xuICAgICAgbWVhc3VyZTogdW5kZWZpbmVkLFxuICAgICAgbXV0YXRlOiBtdXRhdG9yLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIG1lYXN1cmUgb3BlcmF0aW9uIHZpYSB2c3luYy5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOnVuZGVmaW5lZH0gbWVhc3VyZXJcbiAgICovXG4gIG1lYXN1cmUobWVhc3VyZXIpIHtcbiAgICB0aGlzLnJ1bih7XG4gICAgICBtZWFzdXJlOiBtZWFzdXJlcixcbiAgICAgIG11dGF0ZTogdW5kZWZpbmVkLCAvLyBGb3IgdW5pZm9ybSBoaWRkZW4gY2xhc3MuXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUnVucyBgbWVhc3VyZWAgd3JhcHBlZCBpbiBhIHByb21pc2UuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTpUWVBFfSBtZWFzdXJlclxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxUWVBFPn1cbiAgICogQHRlbXBsYXRlIFRZUEVcbiAgICovXG4gIG1lYXN1cmVQcm9taXNlKG1lYXN1cmVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLm1lYXN1cmUoKCkgPT4ge1xuICAgICAgICByZXNvbHZlKG1lYXN1cmVyKCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgcnVudGltZSBpcyBhbGxvd2VkIHRvIGFuaW1hdGUgYXQgdGhpcyB0aW1lLlxuICAgKiBAcGFyYW0geyFOb2RlfSBjb250ZXh0Tm9kZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgY2FuQW5pbWF0ZShjb250ZXh0Tm9kZSkge1xuICAgIHJldHVybiB0aGlzLmNhbkFuaW1hdGVfKGRldkFzc2VydChjb250ZXh0Tm9kZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IU5vZGU9fSBvcHRfY29udGV4dE5vZGVcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNhbkFuaW1hdGVfKG9wdF9jb250ZXh0Tm9kZSkge1xuICAgIC8vIFdpbmRvdyBsZXZlbDogYW5pbWF0aW9ucyBhbGxvd2VkIG9ubHkgd2hlbiBnbG9iYWwgd2luZG93IGlzIHZpc2libGUuXG4gICAgaWYgKGlzRG9jdW1lbnRIaWRkZW4odGhpcy53aW4uZG9jdW1lbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gU2luZ2xlIGRvYzogYW5pbWF0aW9ucyBhbGxvd2VkIHdoZW4gc2luZ2xlIGRvYyBpcyB2aXNpYmxlLlxuICAgIGlmICh0aGlzLmFtcGRvY1NlcnZpY2VfLmlzU2luZ2xlRG9jKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFtcGRvY1NlcnZpY2VfLmdldFNpbmdsZURvYygpLmlzVmlzaWJsZSgpO1xuICAgIH1cblxuICAgIC8vIE11bHRpLWRvYzogYW5pbWF0aW9ucyBkZXBlbmQgb24gdGhlIHN0YXRlIG9mIHRoZSByZWxldmFudCBkb2MuXG4gICAgaWYgKG9wdF9jb250ZXh0Tm9kZSkge1xuICAgICAgY29uc3QgYW1wZG9jID0gdGhpcy5hbXBkb2NTZXJ2aWNlXy5nZXRBbXBEb2NJZkF2YWlsYWJsZShvcHRfY29udGV4dE5vZGUpO1xuICAgICAgcmV0dXJuICFhbXBkb2MgfHwgYW1wZG9jLmlzVmlzaWJsZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIGFuaW1hdGlvbiB2c3luYyB0YXNrLiBUaGlzIG9wZXJhdGlvbiBjYW4gb25seSBydW4gd2hlbiBhbmltYXRpb25zXG4gICAqIGFyZSBhbGxvd2VkLiBPdGhlcndpc2UsIHRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYCBhbmQgZXhpdHMuXG4gICAqIEBwYXJhbSB7IU5vZGV9IGNvbnRleHROb2RlXG4gICAqIEBwYXJhbSB7IVZzeW5jVGFza1NwZWNEZWZ9IHRhc2tcbiAgICogQHBhcmFtIHshVnN5bmNTdGF0ZURlZj19IG9wdF9zdGF0ZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgcnVuQW5pbShjb250ZXh0Tm9kZSwgdGFzaywgb3B0X3N0YXRlKSB7XG4gICAgLy8gRG8gbm90IHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lcyB3aGVuIHRoZSBkb2N1bWVudCBpcyBub3QgdmlzaWJsZS5cbiAgICBpZiAoIXRoaXMuY2FuQW5pbWF0ZV8oY29udGV4dE5vZGUpKSB7XG4gICAgICBkZXYoKS53YXJuKFxuICAgICAgICAnVlNZTkMnLFxuICAgICAgICAnRGlkIG5vdCBzY2hlZHVsZSBhIHZzeW5jIHJlcXVlc3QsIGJlY2F1c2UgZG9jdW1lbnQgd2FzIGludmlzaWJsZSdcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMucnVuKHRhc2ssIG9wdF9zdGF0ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhbmltYXRpb24gdnN5bmMgdGFzay4gVGhpcyBvcGVyYXRpb24gY2FuIG9ubHkgcnVuIHdoZW5cbiAgICogYW5pbWF0aW9ucyBhcmUgYWxsb3dlZC4gT3RoZXJ3aXNlLCB0aGlzIGNsb3N1cmUgcmV0dXJucyBgZmFsc2VgIGFuZCBleGl0cy5cbiAgICogQHBhcmFtIHshTm9kZX0gY29udGV4dE5vZGVcbiAgICogQHBhcmFtIHshVnN5bmNUYXNrU3BlY0RlZn0gdGFza1xuICAgKiBAcmV0dXJuIHtmdW5jdGlvbighVnN5bmNTdGF0ZURlZj0pOmJvb2xlYW59XG4gICAqL1xuICBjcmVhdGVBbmltVGFzayhjb250ZXh0Tm9kZSwgdGFzaykge1xuICAgIHJldHVybiAvKiogQHR5cGUge2Z1bmN0aW9uKCFWc3luY1N0YXRlRGVmPSk6Ym9vbGVhbn0gKi8gKFxuICAgICAgKG9wdF9zdGF0ZSkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5ydW5BbmltKGNvbnRleHROb2RlLCB0YXNrLCBvcHRfc3RhdGUpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUnVucyB0aGUgc2VyaWVzIG9mIG11dGF0ZXMgdW50aWwgdGhlIG11dGF0b3IgcmV0dXJucyBhIGZhbHNlIHZhbHVlLlxuICAgKiBAcGFyYW0geyFOb2RlfSBjb250ZXh0Tm9kZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHRpbWUsIHRpbWUsICFWc3luY1N0YXRlRGVmKTpib29sZWFufSBtdXRhdG9yIFRoZVxuICAgKiAgIG11dGF0b3IgY2FsbGJhY2suIE9ubHkgZXhwZWN0ZWQgdG8gZG8gRE9NIHdyaXRlcywgbm90IHJlYWRzLiBJZiB0aGVcbiAgICogICByZXR1cm5lZCB2YWx1ZSBpcyB0cnVlLCB0aGUgdnN5bmMgdGFzayB3aWxsIGJlIHJlcGVhdGVkLCBvdGhlcndpc2UgaXRcbiAgICogICB3aWxsIGJlIGNvbXBsZXRlZC4gVGhlIGFyZ3VtZW50cyBhcmU6IHRpbWVTaW5jZVN0YXJ0OnRpbWUsXG4gICAqICAgdGltZVNpbmNlUHJldjp0aW1lIGFuZCBzdGF0ZTpWc3luY1N0YXRlRGVmLlxuICAgKiBAcGFyYW0ge251bWJlcj19IG9wdF90aW1lb3V0IE9wdGlvbmFsIHRpbWVvdXQgdGhhdCB3aWxsIGZvcmNlIHRoZSBzZXJpZXNcbiAgICogICB0byBjb21wbGV0ZSBhbmQgcmVqZWN0IHRoZSBwcm9taXNlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0IHdpbGwgZWl0aGVyIHJlc29sdmUgb24gd2hlblxuICAgKiAgIHRoZSB2c3luYyBzZXJpZXMgYXJlIGNvbXBsZXRlZCBvciByZWplY3QgaW4gY2FzZSBvZiBmYWlsdXJlLCBzdWNoIGFzXG4gICAqICAgdGltZW91dC5cbiAgICovXG4gIHJ1bkFuaW1NdXRhdGVTZXJpZXMoY29udGV4dE5vZGUsIG11dGF0b3IsIG9wdF90aW1lb3V0KSB7XG4gICAgaWYgKCF0aGlzLmNhbkFuaW1hdGVfKGNvbnRleHROb2RlKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGNhbmNlbGxhdGlvbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgICBsZXQgcHJldlRpbWUgPSAwO1xuICAgICAgY29uc3QgdGFzayA9IHRoaXMuY3JlYXRlQW5pbVRhc2soY29udGV4dE5vZGUsIHtcbiAgICAgICAgbXV0YXRlOiAoc3RhdGUpID0+IHtcbiAgICAgICAgICBjb25zdCB0aW1lU2luY2VTdGFydCA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgY29uc3QgcmVzID0gbXV0YXRvcih0aW1lU2luY2VTdGFydCwgdGltZVNpbmNlU3RhcnQgLSBwcmV2VGltZSwgc3RhdGUpO1xuICAgICAgICAgIGlmICghcmVzKSB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChvcHRfdGltZW91dCAmJiB0aW1lU2luY2VTdGFydCA+IG9wdF90aW1lb3V0KSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCd0aW1lb3V0JykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmV2VGltZSA9IHRpbWVTaW5jZVN0YXJ0O1xuICAgICAgICAgICAgdGFzayhzdGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICB0YXNrKHt9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzY2hlZHVsZV8oKSB7XG4gICAgaWYgKHRoaXMuc2NoZWR1bGVkXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBTY2hlZHVsZSBhY3R1YWwgYW5pbWF0aW9uIGZyYW1lIGFuZCB0aGVuIHJ1biB0YXNrcy5cbiAgICB0aGlzLnNjaGVkdWxlZF8gPSB0cnVlO1xuICAgIHRoaXMuZm9yY2VTY2hlZHVsZV8oKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBmb3JjZVNjaGVkdWxlXygpIHtcbiAgICBpZiAodGhpcy5jYW5BbmltYXRlXygpKSB7XG4gICAgICB0aGlzLnJhZl8odGhpcy5ib3VuZFJ1blNjaGVkdWxlZFRhc2tzXyk7XG4gICAgICB0aGlzLmJhY2t1cFBhc3NfLnNjaGVkdWxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW52aXNpYmxlUGFzc18uc2NoZWR1bGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUnVucyBhbGwgc2NoZWR1bGVkIHRhc2tzLiBUaGlzIGlzIHR5cGljYWxseSBjYWxsZWQgaW4gYW4gUkFGXG4gICAqIGNhbGxiYWNrLiBUZXN0cyBtYXkgY2FsbCB0aGlzIG1ldGhvZCB0byBmb3JjZSBleGVjdXRpb24gb2ZcbiAgICogdGFza3Mgd2l0aG91dCB3YWl0aW5nLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcnVuU2NoZWR1bGVkVGFza3NfKCkge1xuICAgIHRoaXMuYmFja3VwUGFzc18uY2FuY2VsKCk7XG4gICAgdGhpcy5zY2hlZHVsZWRfID0gZmFsc2U7XG5cbiAgICBjb25zdCB7bmV4dEZyYW1lUmVzb2x2ZXJfOiByZXNvbHZlciwgc3RhdGVzXzogc3RhdGVzLCB0YXNrc186IHRhc2tzfSA9IHRoaXM7XG4gICAgdGhpcy5uZXh0RnJhbWVSZXNvbHZlcl8gPSBudWxsO1xuICAgIHRoaXMubmV4dEZyYW1lUHJvbWlzZV8gPSBudWxsO1xuICAgIC8vIERvdWJsZSBidWZmZXJpbmdcbiAgICB0aGlzLnRhc2tzXyA9IHRoaXMubmV4dFRhc2tzXztcbiAgICB0aGlzLnN0YXRlc18gPSB0aGlzLm5leHRTdGF0ZXNfO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0YXNrc1tpXS5tZWFzdXJlKSB7XG4gICAgICAgIGlmICghY2FsbFRhc2tfKHRhc2tzW2ldLm1lYXN1cmUsIHN0YXRlc1tpXSkpIHtcbiAgICAgICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgbXV0YXRlIGlzIG5vdCBleGVjdXRlZCB3aGVuIG1lYXN1cmUgZmFpbHMuXG4gICAgICAgICAgdGFza3NbaV0ubXV0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0YXNrc1tpXS5tdXRhdGUpIHtcbiAgICAgICAgY2FsbFRhc2tfKHRhc2tzW2ldLm11dGF0ZSwgc3RhdGVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gU3dhcCBsYXN0IGFycmF5cyBpbnRvIGRvdWJsZSBidWZmZXIuXG4gICAgdGhpcy5uZXh0VGFza3NfID0gdGFza3M7XG4gICAgdGhpcy5uZXh0U3RhdGVzXyA9IHN0YXRlcztcbiAgICB0aGlzLm5leHRUYXNrc18ubGVuZ3RoID0gMDtcbiAgICB0aGlzLm5leHRTdGF0ZXNfLmxlbmd0aCA9IDA7XG4gICAgaWYgKHJlc29sdmVyKSB7XG4gICAgICByZXNvbHZlcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtmdW5jdGlvbihmdW5jdGlvbigpKX0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIG9yIHBvbHlmaWxsLlxuICAgKi9cbiAgZ2V0UmFmXygpIHtcbiAgICBjb25zdCByYWYgPVxuICAgICAgdGhpcy53aW4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHRoaXMud2luLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICBpZiAocmFmKSB7XG4gICAgICByZXR1cm4gcmFmLmJpbmQodGhpcy53aW4pO1xuICAgIH1cbiAgICBsZXQgbGFzdFRpbWUgPSAwO1xuICAgIHJldHVybiAoZm4pID0+IHtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAvLyBCeSBkZWZhdWx0IHdlIHRha2UgMTZtcyBiZXR3ZWVuIGZyYW1lcywgYnV0IGlmIHRoZSBsYXN0IGZyYW1lIGlzIHNheVxuICAgICAgLy8gMTBtcyBhZ28sIHdlIG9ubHkgd2FudCB0byB3YWl0IDZtcy5cbiAgICAgIGNvbnN0IHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCBGUkFNRV9USU1FIC0gKG5vdyAtIGxhc3RUaW1lKSk7XG4gICAgICBsYXN0VGltZSA9IG5vdyArIHRpbWVUb0NhbGw7XG4gICAgICB0aGlzLndpbi5zZXRUaW1lb3V0KGZuLCB0aW1lVG9DYWxsKTtcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogRm9yIG9wdGltaXphdGlvbiByZWFzb25zIHRvIHN0b3AgdHJ5L2NhdGNoIGZyb20gYmxvY2tpbmcgb3B0aW1pemF0aW9uLlxuICogQHBhcmFtIHtmdW5jdGlvbighVnN5bmNTdGF0ZURlZik6dW5kZWZpbmVkfHVuZGVmaW5lZH0gY2FsbGJhY2tcbiAqIEBwYXJhbSB7IVZzeW5jU3RhdGVEZWZ9IHN0YXRlXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBjYWxsVGFza18oY2FsbGJhY2ssIHN0YXRlKSB7XG4gIGRldkFzc2VydChjYWxsYmFjayk7XG4gIHRyeSB7XG4gICAgY29uc3QgcmV0ID0gY2FsbGJhY2soc3RhdGUpO1xuICAgIGlmIChyZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZGV2KCkuZXJyb3IoXG4gICAgICAgICdWU1lOQycsXG4gICAgICAgICdjYWxsYmFjayByZXR1cm5lZCBhIHZhbHVlIGJ1dCB2c3luYyBjYW5ub3QgcHJvcG9nYXRlIGl0OiAlcycsXG4gICAgICAgIGNhbGxiYWNrLnRvU3RyaW5nKClcbiAgICAgICk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0aHJvd0FzeW5jKGUpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpbmRvd1xuICogQHJldHVybiB7IVZzeW5jfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdnN5bmNGb3JUZXN0aW5nKHdpbmRvdykge1xuICBpbnN0YWxsVnN5bmNTZXJ2aWNlKHdpbmRvdyk7XG4gIHJldHVybiBnZXRTZXJ2aWNlKHdpbmRvdywgJ3ZzeW5jJyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5kb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxWc3luY1NlcnZpY2Uod2luZG93KSB7XG4gIGluc3RhbGxUaW1lclNlcnZpY2Uod2luZG93KTtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW5kb3csICd2c3luYycsIFZzeW5jKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/vsync-impl.js