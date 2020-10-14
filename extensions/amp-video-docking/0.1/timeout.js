/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';

/**
 * @typedef {{
 *   setTimeout: function(function(), time):number,
 *   clearTimeout: function(number),
 * }}
 */
let TimerDef;

/**
 * @param {!Window} win
 * @return {!TimerDef}
 */
const usingTimerService = (win) => ({
  setTimeout: (handler, time) => Services.timerFor(win).delay(handler, time),
  clearTimeout: (id) => Services.timerFor(win).cancel(id),
});

/** Timeout that can be postponed, repeated or cancelled. */
export class Timeout {
  /**
   * @param {!Window} win
   * @param {!Function} handler
   * @param {!TimerDef=} timer
   */
  constructor(win, handler, timer) {
    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = timer || usingTimerService(win);

    /** @private @const {!Function} */
    this.handler_ = handler;

    /** @private {?number|?string} */
    this.id_ = null;
  }

  /**
   * @param {number} time
   * @param {...*} args
   */
  trigger(time, ...args) {
    this.cancel();
    this.id_ = this.timer_.setTimeout(
      () => this.handler_.apply(null, args),
      time
    );
  }

  /** @public */
  cancel() {
    if (this.id_ !== null) {
      this.timer_.clearTimeout(this.id_);
      this.id_ = null;
    }
  }

  /** @return {boolean} */
  isWaiting() {
    return this.id_ !== null;
  }
}
