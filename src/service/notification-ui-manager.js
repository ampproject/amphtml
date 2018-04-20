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

export const NOTIFICATION_UI_MANAGER = 'notificationUIManager';

export class NotificationUiManager {
  constructor() {
    /** @private {number} */
    this.queueSize_ = 0;

    /** @private {!Promise} */
    this.queuePromise_ = Promise.resolve();

    /** @private {function()} */
    this.queueEmptyHandler_ = () => {}; // Make this an observable if requested

    /** @private {function()} */
    this.queueNotEmptyHandler_ = () => {};
  }

  /**
   * Register handler to be called when UI queue becomes empty
   * @param {function()} handler
   */
  onQueueEmpty(handler) {
    this.queueEmptyHandler_ = handler;
    if (this.queueSize_ == 0) {
      handler();
    }
  }

  /**
   * Register handler to be called when UI queue becomes not empty
   * @param {function()} handler
   */
  onQueueNotEmpty(handler) {
    this.queueNotEmptyHandler_ = handler;
    if (this.queueSize_ > 0) {
      handler();
    }
  }

  /**
   * Register to display UI. Notification will be blocked until previous one has
   * been dismissed.
   * @param {function():!Promise} show
   * @return {!Promise}
   */
  registerUI(show) {
    if (this.queueSize_ == 0) {
      this.queueNotEmptyHandler_();
    }
    this.queueSize_++;
    const promise = this.queuePromise_.then(() => {
      return show().then(() => {
        this.queueSize_--;
        if (this.queueSize_ == 0) {
          this.queueEmptyHandler_();
        }
      });
    });
    this.queuePromise_ = promise;
    return promise;
  }
}
