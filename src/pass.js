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
 * Pass class helps to manage single-pass process. A pass is scheduled using
 * delay method. Only one pass can be pending at a time. If no pass is pending
 * the process is considered to be "idle".
 */
export class Pass {

  /**
   * Creates a new Pass instance.
   * @param {function()} handler Handler to be executed when pass is triggered.
   * @param {number=} opt_defaultDelay Default delay to be used when schedule
   *   is called without one.
   */
  constructor(handler, opt_defaultDelay) {
    /** @private @const {function()} */
    this.handler_ = handler;

    /** @private @const {number|string} */
    this.defaultDelay_ = opt_defaultDelay || 0;

    /** @private {number|string} */
    this.scheduled_ = -1;

    /** @private {number} */
    this.nextTime_ = 0;

    /** @private {boolean} */
    this.running_ = false;

    /** @private @const */
    this.boundPass_ = () => this.pass_();

    /**
     * Last time we started a pass execution.
     * @private {number}
     */
    this.lastPassTime_ = -1;
  }

  /**
   * Whether or not a pass is currently pending.
   * @return {boolean}
   */
  isPending() {
    return this.scheduled_ != -1;
  }

  /**
   * Tries to schedule a new pass optionally with specified delay. If the new
   * requested pass is requested before the pending pass, the pending pass is
   * canceled. If the new pass is requested after the pending pass, the newly
   * requested pass is ignored.
   *
   * Returns {@code true} if the pass has been scheduled and {@code false} if
   * ignored.
   *
   * @param {number=} opt_delay Delay to schedule the pass. If not specified
   *   the default delay is used, falling back to 0.
   * @return {boolean}
   */
  schedule(opt_delay) {
    let delay = opt_delay || this.defaultDelay_;
    const now = timer.now();
    if (this.running_ && delay < 10 || now - this.lastPassTime_ < 10) {
      // If we get called recursively or less than 10ms passed since
      // last execution, wait at least 10ms for the next execution.
      delay = 10;
    }

    const nextTime = now + delay;
    // Schedule anew if nothing is scheduled currently or if the new time is
    // sooner then previously requested.
    if (!this.isPending() || nextTime - this.nextTime_ < -10) {
      this.cancel();
      this.nextTime_ = nextTime;
      this.scheduled_ = timer.delay(this.boundPass_, delay);

      return true;
    }

    return false;
  }

  pass_() {
    this.scheduled_ = -1;
    this.nextTime_ = 0;
    this.running_ = true;
    this.lastPassTime_ = timer.now();
    this.handler_();
    this.running_ = false;
  }

  /**
   * Cancels the pending pass if any.
   */
  cancel() {
    if (this.isPending()) {
      timer.cancel(this.scheduled_);
      this.scheduled_ = -1;
    }
  }
}
