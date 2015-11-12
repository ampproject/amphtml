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
import {timer} from './timer';


/**
 * Maximum number of tick events we allow to accumulate in the performance
 * instance's queue before we start dropping those events and can no longer
 * be forwarded to the actual `tick` function when it is set.
 * @const {number}
 */
const QUEUE_LIMIT_ = 50;

/**
 * @typedef {{
 *   label: string,
 *   opt_from: (string|null|undefined),
 *   opt_value: (number|undefined)
 * }}
 */
class TickEvent {}


/**
 * Performance holds the mechanism to call `tick` to stamp out important
 * events in the lifecycle of the AMP runtime. It can hold a small amount
 * of tick events to forward to the external `tick` function when it is set.
 */
export class Performance {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @const @private {funtion(string,?string=,number=)|undefined} */
    this.tick_;

    /** @const @private {funtion()|undefined} */
    this.flush_;

    /** @const @private {!Array<TickEvent>} */
    this.events_ = [];
  }


  /**
   * Forwards tick events to the tick function set or queues it up to be
   * flushed at a later time.
   *
   * @param {string} label The variable name as it will be reported.
   * @param {?string=} opt_from The label of a previous tick to use as a
   *    relative start for this tick.
   * @param {number=} opt_value The time to record the tick at. Optional, if
   *    not provided, use the current time.
   * @export
   */
  tick(label, opt_from, opt_value) {
    if (this.tick_) {
      this.tick_(label, opt_from, opt_value);
    } else {
      this.queueTick_(label, opt_from, opt_value);
    }
  }


  /**
   * Calls the flush callback function set through setTickFunction.
   * @export
   */
  flush() {
    if (this.flush_) {
      this.flush_();
    }
  }


  /**
   * Queues the events to be flushed when tick function is set.
   *
   * @param {string} label The variable name as it will be reported.
   * @param {?string=} opt_from The label of a previous tick to use as a
   *    relative start for this tick.
   * @param {number=} opt_value The time to record the tick at. Optional, if
   *    not provided, use the current time.
   * @private
   */
  queueTick_(label, opt_from, opt_value) {
    if (opt_value == undefined) {
      opt_value = timer.now();
    }

    // Start dropping the head of the queue if we've reached the limit
    // so that we don't take up too much memory in the runtime.
    if (this.events_.length >= QUEUE_LIMIT_) {
      this.events_.shift();
    }

    this.events_.push({
      label: label,
      opt_from: opt_from,
      opt_value: opt_value
    });
  }


  /** @private */
  flushQueuedTicks_() {
    if (!this.tick_) {
      return;
    }

    this.events_.forEach(tickEvent => {
      this.tick_(tickEvent.label, tickEvent.opt_from, tickEvent.opt_value);
    });
    this.events_.length = 0;
  }


  /**
   * Sets the `tick` function.
   *
   * @param {funtion(string,?string=,number=)} tick function that the tick
   *   events get forwarded to. Function can take in a `label` as the first
   *   argument and an optional `opt_from` label to use
   *   as a relative start for this tick. A third argument `opt_value` can
   *   also be provided to indicate when to record the tick at.
   * @param {function()=} opt_flush callback function that is called
   *   when we are ready for the ticks to be forwarded to an endpoint.
   * @export
   */
  setTickFunction(tick, opt_flush) {
    this.tick_ = tick;
    this.flush_ = opt_flush;
    this.flushQueuedTicks_();
  }
}


/**
 * @param {!Window} window
 * @return {!Performance}
 * @export
 */
export function performanceFor(window) {
  return getService(window, 'performance', () => {
    return new Performance(window);
  });
};
