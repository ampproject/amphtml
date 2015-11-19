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

import {getService} from './service';
import {log} from './log';
import {timer} from './timer';
import {viewerFor} from './viewer';


/**
 * @typedef {{
 *   measure: (function(Object<string,*>)|undefined),
 *   mutate: (function(Object<string,*>)|undefined)
 * }}
 */
class VsyncTaskSpec {}


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
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {function(function())}  */
    this.raf_ = this.getRaf_();

    /**
     * Tasks to run in the next frame.
     * @private {!Array<!VsyncTaskSpec>}
     */
    this.tasks_ = [];

    /**
     * States for tasks in the next frame in the same order.
     * @private {!Array<!Object>}
     */
    this.states_ = [];

    /**
     * Whether a new animation frame has been scheduled.
     * @private {boolean}
     */
    this.scheduled_ = false;
  }

  /**
   * @param {!VsyncTaskSpec} task
   * @param {!Object<string, *>|undefined} opt_state
   */
  run(task, opt_state) {
    // Do not request animation frames when the document is not visible.
    if (!viewerFor(this.win).isVisible()) {
      log.fine('VSYNC', 'Did not schedule a vsync request, ' +
          'because document was invisible.');
      return;
    }
    const state = opt_state || {};
    this.tasks_.push(task);
    this.states_.push(state);

    if (this.scheduled_) {
      return;
    }
    this.scheduled_ = true;

    // Schedule actual animation frame and then run tasks.
    this.raf_(() => {
      this.runScheduledTasks();
    });
  }

  /**
   * Runs all scheduled tasks. This is typically called in an RAF
   * callback. Tests may call this method to force execution of
   * tasks without waiting.
   * @visibleForTesting
   */
  runScheduledTasks() {
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
   * Runs the mutate operation via vsync.
   * @param {function()} mutator
   */
  mutate(mutator) {
    this.run({mutate: mutator});
  }

  /**
   * Runs the measure operation via vsync.
   * @param {function()} measurer
   */
  measure(measurer) {
    this.run({measure: measurer});
  }

  /**
   * @param {!VsyncTaskSpec} task
   * @return {function((!Object<string, *>|undefined))}
   */
  createTask(task) {
    return opt_state => {
      this.run(task, opt_state);
    };
  }

  /**
   * Runs the series of mutates until the mutator returns a false value.
   * @param {function(time, time, !Object<string,*>):boolean} mutator The
   *   mutator callback. Only expected to do DOM writes, not reads. If the
   *   returned value is true, the vsync task will be repeated, otherwise it
   *   will be completed. The arguments are: timeSinceStart:time,
   *   timeSincePrev:time and state:Object<string, *>.
   * @param {number=} opt_timeout Optional timeout that will force the series
   *   to complete and reject the promise.
   * @return {!Promise} Returns the promise that will either resolve on when
   *   the vsync series are completed or reject in case of failure, such as
   *   timeout.
   */
  runMutateSeries(mutator, opt_timeout) {
    return new Promise((resolve, reject) => {
      const startTime = timer.now();
      let prevTime = 0;
      const task = this.createTask({
        mutate: state => {
          const timeSinceStart = timer.now() - startTime;
          const res = mutator(timeSinceStart, timeSinceStart - prevTime, state);
          if (!res) {
            resolve();
          } else if (opt_timeout && timeSinceStart > opt_timeout) {
            reject('timeout');
          } else {
            prevTime = timeSinceStart;
            task(state);
          }
        }
      });
      task({});
    });
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
      const timeToCall = Math.max(0, 16 - (now - lastTime));
      lastTime = now + timeToCall;
      this.win.setTimeout(fn, timeToCall);
    };
  }
}


/**
 * @param {!Window} window
 * @return {!Vsync}
 */
export function vsyncFor(window) {
  return getService(window, 'vsync', () => {
    return new Vsync(window);
  });
};
