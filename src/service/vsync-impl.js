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

import {Pass} from '../pass';
import {cancellation} from '../error';
import {getService} from '../service';
import {log} from '../log';
import {timer} from '../timer';
import {installViewerService} from './viewer-impl';


/** @const {time} */
const FRAME_TIME = 16;

/**
 * @typedef {Object<string, *>}
 */
let VsyncStateDef;

/**
 * @typedef {{
 *   measure: (function(!VsyncStateDef)|undefined),
 *   mutate: (function(!VsyncStateDef)|undefined)
 * }}
 */
let VsyncTaskSpecDef;


/**
 * Abstraction over requestAnimationFrame that align DOM read (measure)
 * and write (mutate) tasks in a single frame.
 *
 * NOTE: If the document is invisible due to prerendering (this includes
 * application level prerendering where the doc is rendered in a hidden
 * iframe or webview), then no frame will be scheduled.
 */
export class Vsync {

  /**
   * @param {!Window} win
   * @param {!Viewer} viewer
   */
  constructor(win, viewer) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!Viewer} */
    this.viewer_ = viewer;

    /** @private @const {function(function())}  */
    this.raf_ = this.getRaf_();

    /**
     * Tasks to run in the next frame.
     * @private {!Array<!VsyncTaskSpecDef>}
     */
    this.tasks_ = [];

    /**
     * States for tasks in the next frame in the same order.
     * @private {!Array<!VsyncStateDef>}
     */
    this.states_ = [];

    /**
     * Whether a new animation frame has been scheduled.
     * @private {boolean}
     */
    this.scheduled_ = false;

    /** @const {!Function} */
    this.boundRunScheduledTasks_ = this.runScheduledTasks_.bind(this);

    /** @const {!Pass} */
    this.pass_ = new Pass(this.boundRunScheduledTasks_, FRAME_TIME);

    // When the document changes visibility, vsync has to reschedule the queue
    // processing.
    this.viewer_.onVisibilityChanged(() => {
      if (this.scheduled_) {
        this.forceSchedule_();
      }
    });
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
  run(task, opt_state) {
    this.tasks_.push(task);
    this.states_.push(opt_state || {});
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
  runPromise(task, opt_state) {
    return new Promise(resolve => {
      this.run({
        measure: state => {
          task.measure(state);
        },
        mutate: state => {
          task.mutate(state);
          resolve();
        },
      }, opt_state);
    });
  }

  /**
   * Creates a function that will call {@link run} method.
   * @param {!VsyncTaskSpecDef} task
   * @return {function(!VsyncStateDef=)}
   */
  createTask(task) {
    return opt_state => {
      this.run(task, opt_state);
    };
  }

  /**
   * Runs the mutate operation via vsync.
   * @param {function()} mutator
   */
  mutate(mutator) {
    this.run({mutate: mutator});
  }

  /**
   * Runs `mutate` wrapped in a promise.
   * @param {function()} mutator
   * @return {!Promise}
   */
  mutatePromise(mutator) {
    return new Promise(resolve => {
      this.mutate(() => {
        mutator();
        resolve();
      });
    });
  }

  /**
   * Runs the measure operation via vsync.
   * @param {function()} measurer
   */
  measure(measurer) {
    this.run({measure: measurer});
  }

  /**
   * Runs `measure` wrapped in a promise.
   * @param {function():TYPE} measurer
   * @return {!Promise<TYPE>}
   * @templates TYPE
   */
  measurePromise(measurer) {
    return new Promise(resolve => {
      this.measure(() => {
        resolve(measurer());
      });
    });
  }

  /**
   * Whether the runtime is allowed to animate at this time.
   * @return {boolean}
   */
  canAnimate() {
    return this.viewer_.isVisible();
  }

  /**
   * Runs the animation vsync task. This operation can only run when animations
   * are allowed. Otherwise, this method returns `false` and exits.
   * @param {!VsyncTaskSpecDef} task
   * @param {!VsyncStateDef=} opt_state
   * @return {boolean}
   */
  runAnim(task, opt_state) {
    // Do not request animation frames when the document is not visible.
    if (!this.canAnimate()) {
      log.warn('Vsync',
          'Did not schedule a vsync request, because document was invisible');
      return false;
    }
    this.run(task, opt_state);
    return true;
  }

  /**
   * Creates an animation vsync task. This operation can only run when
   * animations are allowed. Otherwise, this closure returns `false` and exits.
   * @param {!VsyncTaskSpecDef} task
   * @return {function(!VsyncStateDef=):boolean}
   */
  createAnimTask(task) {
    return opt_state => {
      return this.runAnim(task, opt_state);
    };
  }

  /**
   * Runs the series of mutates until the mutator returns a false value.
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
  runAnimMutateSeries(mutator, opt_timeout) {
    if (!this.canAnimate()) {
      return Promise.reject(cancellation());
    }
    return new Promise((resolve, reject) => {
      const startTime = timer.now();
      let prevTime = 0;
      const task = this.createAnimTask({
        mutate: state => {
          const timeSinceStart = timer.now() - startTime;
          const res = mutator(timeSinceStart, timeSinceStart - prevTime, state);
          if (!res) {
            resolve();
          } else if (opt_timeout && timeSinceStart > opt_timeout) {
            reject(new Error('timeout'));
          } else {
            prevTime = timeSinceStart;
            task(state);
          }
        },
      });
      task({});
    });
  }

  /** @private */
  schedule_() {
    if (this.scheduled_) {
      return;
    }
    // Schedule actual animation frame and then run tasks.
    this.scheduled_ = true;
    this.forceSchedule_();
  }

  /** @private */
  forceSchedule_() {
    if (this.canAnimate()) {
      this.raf_(this.boundRunScheduledTasks_);
    } else {
      this.pass_.schedule();
    }
  }

  /**
   * Runs all scheduled tasks. This is typically called in an RAF
   * callback. Tests may call this method to force execution of
   * tasks without waiting.
   * @private
   */
  runScheduledTasks_() {
    this.scheduled_ = false;
    // TODO(malteubl) Avoid array allocation with a double buffer.
    const tasks = this.tasks_;
    const states = this.states_;
    this.tasks_ = [];
    this.states_ = [];
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].measure) {
        tasks[i].measure(states[i]);
      }
    }
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].mutate) {
        tasks[i].mutate(states[i]);
      }
    }
  }

  /**
   * @return {function(function())} requestAnimationFrame or polyfill.
   */
  getRaf_() {
    const raf = this.win.requestAnimationFrame
        || this.win.webkitRequestAnimationFrame;
    if (raf) {
      return raf.bind(this.win);
    }
    let lastTime = 0;
    return fn => {
      const now = new Date().getTime();
      // By default we take 16ms between frames, but if the last frame is say
      // 10ms ago, we only want to wait 6ms.
      const timeToCall = Math.max(0, FRAME_TIME - (now - lastTime));
      lastTime = now + timeToCall;
      this.win.setTimeout(fn, timeToCall);
    };
  }
}


/**
 * @param {!Window} window
 * @return {!Vsync}
 */
export function installVsyncService(window) {
  return getService(window, 'vsync', () => {
    return new Vsync(window, installViewerService(window));
  });
};
