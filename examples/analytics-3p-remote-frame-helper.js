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
     * @type {function<!string>}
     * @private
     */
    this.listener_ = null;

    /**
     * @type {Function<!String>}
     * @private
     */
    this.extraDataListener_ = null;

    /**
     * Holds a mapping between sender ID and extra data
     * @type {Map}
     * @private
     */
    this.senderIdToExtraData_ = {}; // TODO: Replace with map from AMP
  }

  /**
   * Registers a callback function to be called when AMP Analytics events occur
   * @param {!Function} listener A function that takes an array of event
   * strings, and does something with them.
   * @param {?Function} extraDataListener A function to receive any extra
   * setup data sent by the creative
   */
  registerAmpAnalyticsEventListener(listener, extraDataListener) {
    this.listener_ = listener;
    this.extraDataListener_ = extraDataListener;
  }

  /**
   * Receives a message from the creative. Handles deserialization (which
   * filters out messages not actually meant for us) and passes it to the
   * listener that was supplied to registerAmpAnalyticsEventListener above.
   * @param {!string} message The message that was received.
   */
  receiveMessageFromCreative(message) {
    if (!message || !message.data) {
      return;
    }
    const deserialized = deserializeMessage(message.data);
    if (deserialized) {
      this.setSentinel_(deserialized.sentinel);
      if (deserialized.ampAnalyticsExtraData) {
        this.senderIdToExtraData_[deserialized.senderId] =
          deserialized.ampAnalyticsExtraData;
        if (!this.extraDataListener_) {
          return;
        }
        requestIdleCallback(() => {
          this.extraDataListener_(deserialized.senderId,
            deserialized.ampAnalyticsExtraData);
        });
      } else if (deserialized.ampAnalyticsEvents) {
        if (!this.listener_) {
          return;
        }
        requestIdleCallback(() => {
          this.listener_(deserialized.ampAnalyticsEvents);
        });
      }
    }
  }

  /**
   * Sets the sentinel value, which is used to identify which creative the
   * event messages come from
   * @param {!string} sentinel The sentinel value
   */
  setSentinel_(sentinel) {
    if (this.sentinel_ && sentinel != this.sentinel_) {
      dev().warn('Attempting to set sentinel to ' + sentinel +
        ' when it was already set to ' + this.sentinel_);
    }
    this.sentinel_ = sentinel;
  }

  /**
   * Gets any optional extra data that should be made available to the
   * cross-domain frame, in the context of a particular creative.
   * @param {number} senderId The ID of the creative that sent the extra data
   * @returns {string=}
   */
  getExtraData(senderId) {
    return this.senderIdToExtraData_[senderId];
  }

  /**
   * Sends a message from the third-party vendor's metrics-collection page back
   * to the creative.
   * @param {!string} message The message to send.
   */
  sendMessageToCreative(message) {
    /*REVIEW*/window.parent.postMessage(
        serializeMessage('ampAnalytics3pResponse', this.sentinel_,
            {ampAnalytics3pResponse: message}), '*');
  }
};

// Simple requestIdleCallback polyfill
// TODO: Combine this with the onReady() change
requestIdleCallback =
  window.requestIdleCallback || (cb => setTimeout(cb, 1));

/**
 * @private @const {!AmpAnalyticsRemoteFrameManager}
 */
const remoteFrameMgr_ = new AmpAnalyticsRemoteFrameManager();

if (window.onNewAmpAnalyticsInstance) {
  window.addEventListener('message', message => {
    remoteFrameMgr_.receiveMessageFromCreative(message);
  });
  window.onNewAmpAnalyticsInstance(remoteFrameMgr_);
} else {
  dev().error('Vendor page must implement onNewAmpAnalyticsInstance.');
}

// TODO: Consider getting rid of everything below here, and importing from
// AMP sources instead.

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

// TODO: Temp to enable testing until we import AMP stuff
function dev() {
  return console;
}