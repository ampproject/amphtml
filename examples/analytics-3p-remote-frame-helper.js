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
     * @type {Function<!String>}
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
    /*REVIEW*/window.parent.postMessage(
      serializeMessage('ampAnalyticsResponse', this.sentinel_,
                       {ampAnalyticsResponse: message}, this.rtvVersion_), '*');
  }
};

AmpAnalyticsRemoteFrameManager.rtvVersion_ = '1234'; // TODO

/**
 * @const {AmpAnalyticsRemoteFrameManager}
 */
const remoteFrameMgr_ = new AmpAnalyticsRemoteFrameManager();

window.requestIdleCallback =
  window.requestIdleCallback || (cb => setTimeout(cb, 1));

if (window.onNewAmpAnalyticsInstance) {
  window.onNewAmpAnalyticsInstance(remoteFrameMgr_);
  // Warning: the following code is likely only temporary. Don't check in
  // before getting resolution on that.
  window.addEventListener("message", msg => {
    if (msg && msg.data) {
      const deserialized = deserializeMessage(msg.data);
      if (deserialized && deserialized.ampAnalyticsEvents) {
        remoteFrameMgr_.sentinel_ = deserialized.sentinel; // TODO Temp Code!
        window.requestIdleCallback(() => {
          remoteFrameMgr_.listener_(deserialized.ampAnalyticsEvents);
        });
      }
    }
  });
} else {
  console.error("Vendor page must implement onNewAmpAnalyticsInstance.");
}

const AMP_MESSAGE_PREFIX = 'amp-';

/**
 * Serialize an AMP post message. Output looks like:
 * 'amp-011481323099490{"type":"position","sentinel":"12345","foo":"bar"}'
 * @param {string} type
 * @param {string} sentinel
 * @param {Object=} data
 * @param {?string=} rtvVersion
 * @returns {string}
 */
function serializeMessage(type, sentinel, data = {}, rtvVersion = null) {
  // TODO: consider wrap the data in a "data" field. { type, sentinal, data }
  const message = data;
  message.type = type;
  message.sentinel = sentinel;
  return AMP_MESSAGE_PREFIX + (rtvVersion || '') + JSON.stringify(message);
}

/**
 * Deserialize an AMP post message.
 * Returns null if it's not valid AMP message format.
 *
 * @param {*} message
 * @returns {?JSONType}
 */
function deserializeMessage(message) {
  if (!isAmpMessage(message)) {
    return null;
  }
  const startPos = message.indexOf('{');
  try {
    return /** @type {!JSONType} */ (JSON.parse(message.substr(startPos)));
  } catch (e) {
    return null;
  }
}

/**
 *  Returns true if message looks like it is an AMP postMessage
 *  @param {*} message
 *  @return {!boolean}
 */
function isAmpMessage(message) {
  return (typeof message == 'string' &&
  message.indexOf(AMP_MESSAGE_PREFIX) == 0 &&
  message.indexOf('{') != -1);
}
