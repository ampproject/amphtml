/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {dev} from '../log';

const TAG = 'temp-cache';

/** @template T */
export class TempCache {

  /**
   * @param {!Window} win
   * @param {number=} flushAfterMs Flushes after 500ms by default.
   */
  constructor(win, flushAfterMs = 500) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {number} */
    this.flushAfterMs_ = flushAfterMs;

    /** @private @const {function()} */
    this.flush_ = () => {
      dev().info(TAG, `flush [${Date.now()}]`);
      this.flushTimerId_ = null;
      this.cache_ = Object.create(null);
    };

    /** @private {!Object<(number|string), T>} */
    this.cache_ = Object.create(null);

    /** @private {?number} */
    this.flushTimerId_ = null;
  }

  /**
   * @param {number|string} key
   * @return {boolean}
   */
  has(key) {
    return !!this.cache_[key];
  }

  /**
   * @param {number|string} key
   * @return {T|undefined}
   */
  get(key) {
    if (this.has(key)) {
      dev().info(TAG, `hit [${Date.now()}]`);
    }
    return this.cache_[key];
  }

  /**
   * @param {number|string} key
   * @param {T} payload
   * @return {T} Returns payload back
   */
  put(key, payload) {
    this.maybeSetFlushTimeout_();
    return (this.cache_[key] = payload);
  }

  /** @private */
  maybeSetFlushTimeout_() {
    if (this.flushTimerId_ !== null) {
      return;
    }
    this.flushTimerId_ = this.win_.setTimeout(this.flush_, this.flushAfterMs_);
  }
}
