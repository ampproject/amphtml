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
import {waitForMacroTasks} from './macro-task';

const TAG = 'temp-cache';

/**
 * Temporary cache that flushes after a number of macro-tasks.
 * @template T
 */
export class TempCache {

  /**
   * @param {!Window} win
   * @param {number=} flushAfterMacroTasks Flushes after one by default.
   */
  constructor(win, flushAfterMacroTasks = 1) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {number} */
    this.flushAfterMacroTasks_ = flushAfterMacroTasks;

    /** @private @const {function()} */
    this.flush_ = () => {
      dev().info(TAG, `flush [${this.time_()}]`);
      this.cache_ = null;
    };

    /** @private {?Object<(number|string), T>} */
    this.cache_ = null;
  }

  /**
   * @return {boolean}
   * @private
   */
  time_() {
    return (new this.win_.Date()).getTime();
  }

  /**
   * @param {number|string} key
   * @return {boolean}
   */
  has(key) {
    return this.cache_ && this.cache_[key] !== undefined;
  }

  /**
   * @param {number|string} key
   * @return {T|undefined}
   */
  get(key) {
    if (!this.has(key)) {
      return undefined;
    }
    dev().info(TAG, `hit [${this.time_()}]`);
    return this.cache_[key];
  }

  /**
   * @param {number|string} key
   * @param {T} payload
   * @return {T} Returns payload back
   */
  put(key, payload) {
    return (this.maybeInitialize_()[key] = payload);
  }

  /**
   * @return {!Object<(number|string), T>}
   * @private
   */
  maybeInitialize_() {
    const cache = this.cache_;
    if (cache) {
      return cache;
    }
    waitForMacroTasks(this.win_, this.flush_, this.flushAfterMacroTasks_);
    return (this.cache_ = Object.create(null));
  }
}
