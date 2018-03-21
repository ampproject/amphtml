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

export class NotificationUIManager {

  constructor() {
    this.queueSize_ = 0;

    this.queuePromise_ = Promise.resolve();

    this.queueEmptyHandler_ = () => {}; // Make this an observable if requested

    this.queueNotEmptyHandler_ = () => {};
  }

  onQueueEmpty(handler) {
    this.queueEmptyHandler_ = handler;
  }

  onQueueNotEmpty(handler) {
    this.queueNotEmptyHandler_ = handler;
  }

  /**
   * Register to display UI. Notification will be blocked until previous one has
   * been dismissed.
   * @param {function():!Promise} show
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
