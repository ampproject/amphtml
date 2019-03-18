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


export const ACTIVATION_TIMEOUT = 5000; // 5 seconds.

const ACTIVATION_EVENTS = ['click', 'input', 'dblclick', 'keypress', 'submit'];


/**
 * See https://github.com/dtapuska/useractivation for inspiration.
 * @implements {../../../src/service.Disposable}
 */
export class UserActivationTracker {

  /**
   * @param {!Element} root
   */
  constructor(root) {
    /** @private @const */
    this.root_ = root;
    /** @private @const */
    this.boundActivated_ = this.activated_.bind(this);
    /** @private {number} */
    this.lastActivationTime_ = 0;
    /** @private {boolean} */
    this.inLongTask_ = false;

    ACTIVATION_EVENTS.forEach(type => {
      this.root_.addEventListener(
          type,
          this.boundActivated_,
          /* capture */ true);
    });
  }

  /** @override */
  dispose() {
    ACTIVATION_EVENTS.forEach(type => {
      this.root_.removeEventListener(
          type,
          this.boundActivated_,
          /* capture */ true);
    });
  }

  /**
   * Whether the element has ever been active since this tracker was alive.
   * @return {boolean}
   */
  hasBeenActive() {
    return this.lastActivationTime_ > 0;
  }

  /**
   * Whether the element is currently considered to be active.
   * @return {boolean}
   */
  isActive() {
    return this.lastActivationTime_ > 0
        && Date.now() - this.lastActivationTime_ <= ACTIVATION_TIMEOUT
        || this.inLongTask_;
  }

  /**
   * The time of the last activation.
   * @return {time}
   */
  getLastActivationTime() {
    return this.lastActivationTime_;
  }

  /**
   * @param {!Promise} promise
   */
  expandLongTask(promise) {
    if (!this.isActive()) {
      return;
    }
    this.inLongTask_ = true;
    promise.catch(() => {}).then(() => {
      this.inLongTask_ = false;
      // Add additional "activity window" after a long task is done.
      this.lastActivationTime_ = Date.now();
    });
  }

  /**
   * @return {boolean}
   */
  isInLongTask() {
    return this.inLongTask_;
  }

  /**
   * @param {!Event} event
   * @private
   */
  activated_(event) {
    if (event.isTrusted) {
      this.lastActivationTime_ = Date.now();
    }
  }
}
