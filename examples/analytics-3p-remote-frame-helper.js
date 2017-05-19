/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
 * This provides the "glue" between the AMP Analytics tag and the third-party
 * vendor's metrics-collection page.
 *
 * The vendor's page must implement onNewAmpAnalyticsInstance().
 */
class AmpAnalyticsRemoteFrameManager {
  constructor() {
    /**
     * @type {Function}
     * @private
     */
    this.listener_ = null;
  }

  /**
   * Registers a callback function to be called when AMP Analytics events occur
   * @param {!Function} listener A function that takes an array of event
   * strings, and does something with them.
   */
  registerAmpAnalyticsEventListener(listener) {
    this.listener_ = listener;
  }

  /**
   * Sends a message from the third-party vendor's metrics-collection page back
   * to the creative.
   * @param {!String} message The message to send.
   */
  sendMessageToCreative(message) {
    // DO NOT MERGE THIS
    // Warning: the following code is likely only temporary. Don't check
    // in before getting resolution on that.
    /*REVIEW*/window.parent.postMessage({ampAnalyticsResponse: message}, '*');
  }
};

/**
 * @const {AmpAnalyticsRemoteFrameManager}
 */
const remoteFrameMgr_ = new AmpAnalyticsRemoteFrameManager();

window.requestIdleCallback = window.requestIdleCallback || function(cb) {
  return setTimeout(cb, 1);
};

if (window.onNewAmpAnalyticsInstance) {
  window.onNewAmpAnalyticsInstance(remoteFrameMgr_);
  // Warning: the following code is likely only temporary. Don't check in
  // before getting resolution on that.
  window.addEventListener("message", (msg) => {
    if (msg.data.ampAnalyticsEvents) {
      window.requestIdleCallback(() => {
        remoteFrameMgr_.listener_(msg.data.ampAnalyticsEvents);
      });
    }
  });
} else {
  console.error("Vendor page must implement onNewAmpAnalyticsInstance.");
}
