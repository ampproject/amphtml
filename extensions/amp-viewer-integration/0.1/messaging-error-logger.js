/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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


/**
 * @fileoverview This is used for logs to help debug errors.
 */
export class MessagingErrorLogger {

  /**
   * @param {function(?): undefined} setState
   */
  constructor(setState) {
    this.setState_ = setState;
  }

  /**
   * @param {string} e
   * @param {*} opt_data
   */
  logError(e, opt_data) {
    if (!this.setState_) {
      return;
    }
    let stateStr = 'amp-messaging-error-logger: ' + e;
    if (opt_data) {
      stateStr += ' data: ' + JSON.stringify(opt_data);
    }
    this.setState_(stateStr);
  }
}
