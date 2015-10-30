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

import {timer} from './timer';


/**
 * TODO(dvoytenko): remove this struct and just supply measure/mutate directly
 * in calls.
 * @typedef {{
 *   measure: (function(Object<string,*>)|undefined),
 *   mutate: (function(Object<string,*>))
 * }}
 */
class VsyncTaskSpec {}


/**
 * TODO(dvoytenko): lots and lots of work to make it actually work right:
 * queue, scheduling, measures/mutates separation, etc.
 *
 * TODO(dvoytenko): split into clear APIs for measure+mutate vs only mutate
 * since that will be the main use case.
 */
export class Vsync {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
    // TODO(dvoytenko): polyfill requestAnimationFrame?
  }

  /**
   * @param {!VsyncTaskSpec} task
   * @param {!Object<string, *>|undefined} opt_state
   */
  run(task, opt_state) {
    const state = opt_state || {};
    this.win.requestAnimationFrame(() => {
      if (task.measure) {
        task.measure(state);
      }
      task.mutate(state);
    });
  }

  /**
   * Runs the mutate operation via vsync.
   * @param {function()} mutator
   */
  mutate(mutator) {
    this.run({mutate: mutator});
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
}


export const vsync = new Vsync(window);
