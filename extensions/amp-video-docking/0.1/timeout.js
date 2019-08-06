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

/** Timeout that can be postponed, repeated or cancelled. */
export class Timeout {
  /**
   * @param {!Window} win
   * @param {!Function} handler
   */
  constructor(win, handler) {
    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

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
    this.id_ = this.timer_.delay(() => this.handler_.apply(null, args), time);
  }

  /** @public */
  cancel() {
    if (this.id_ !== null) {
      this.timer_.cancel(this.id_);
      this.id_ = null;
    }
  }

  /** @return {boolean} */
  isWaiting() {
    return this.id_ !== null;
  }
}
