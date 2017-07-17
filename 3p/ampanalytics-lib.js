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

import './polyfills';
import {tryParseJson} from '../src/json';
import {dev, initLogConstructor, setReportError} from '../src/log';
import {AMP_ANALYTICS_3P_MESSAGE_TYPE} from '../src/3p-analytics-common';

initLogConstructor();
// TODO(alanorozco): Refactor src/error.reportError so it does not contain big
// transitive dependencies and can be included here.
setReportError(() => {});

/** @private @const {string} */
const TAG_ = 'ampanalytics-lib';

/**
 * Receives messages bound for this cross-domain iframe, from all creatives
 */
export class AmpAnalytics3pMessageRouter {

  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @const {string} */
    this.sentinel_ = dev().assertString(
        tryParseJson(this.win_.name).sentinel,
        'Invalid/missing sentinel on iframe name attribute' + this.win_.name);
    if (!this.sentinel_) {
      return;
    }

    /**
     * Multiple creatives on a page may wish to use the same type of
     * amp-analytics tag. This object provides a mapping between the
     * IDs which identify which amp-analytics tag a message is to/from,
     * with each ID's corresponding AmpAnalytics3pCreativeMessageRouter,
     * which is an object that handles messages to/from a particular creative.
     * @private {!Object<string, !AmpAnalytics3pCreativeMessageRouter>}
     */
    this.creativeMessageRouters_ = {};

    this.win_.addEventListener('message', event => {
      const messageContainer = this.extractMessage(event);
      if (this.sentinel_ != messageContainer.sentinel) {
        return;
      }
      dev().assert(messageContainer.type,
          'Received message with missing type in ' + this.win_.location.href);
      dev().assert(messageContainer.data,
          'Received empty message in ' + this.win_.location.href);
      dev().assert(messageContainer.type == AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT,
          'Received unrecognized message type ' + messageContainer.type +
          ' in ' + this.win_.location.href);
      this.processEventsMessage(
          /* @type {!../src/3p-analytics-common.AmpAnalytics3pEvent} */
          (messageContainer.data));
    }, false);

    this.subscribeTo(AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT);
  }

  /**
   * Sends a message to the parent frame, requesting to subscribe to a
   * particular message type
   * @param messageType The type of message to subscribe to
   */
  subscribeTo(messageType) {
    this.win_.parent./*OK*/postMessage({
      sentinel: this.sentinel_,
      type: messageType,
    }, '*');
  }

  /**
   * Handle receipt of a message indicating that creative(s) have sent
   * event(s) to this frame
   * @param {!../src/3p-analytics-common.AmpAnalytics3pEvent} message
   */
  processEventsMessage(message) {
    let entries;
    dev().assert((entries = Object.entries(message)).length,
        'Received empty events message in ' + this.win_.location.href);
    dev().assert(this.win_.onNewAmpAnalyticsInstance,
        'Must implement onNewAmpAnalyticsInstance in ' +
        this.win_.location.href);
    entries.forEach(entry => {
      const transportId = entry[0];
      const events = entry[1];
      try {
        dev().assert(events && events.length,
            'Received empty events list for ' + transportId);
        if (!this.creativeMessageRouters_[transportId]) {
          this.creativeMessageRouters_[transportId] =
              new AmpAnalytics3pCreativeMessageRouter(
                  this.win_, this.sentinel_, transportId);
          this.win_.onNewAmpAnalyticsInstance(
              this.creativeMessageRouters_[transportId]);
        }
        this.creativeMessageRouters_[transportId]
            .sendMessagesToListener(events);
      } catch (e) {
        dev().error(TAG_, 'Failed to pass message to event listener: ' +
          e.message);
      }
    });
  }

  /**
   * Test method to ensure sentinel set correctly
   * @returns {string}
   * @VisibleForTesting
   */
  getSentinel() {
    return this.sentinel_;
  }

  /**
   * Gets the mapping of creative senderId to
   * AmpAnalytics3pCreativeMessageRouter
   * @returns {!Object.<string, !AmpAnalytics3pCreativeMessageRouter>}
   * @VisibleForTesting
   */
  getCreativeMethodRouters() {
    return this.creativeMessageRouters_;
  }

  /**
   * Gets rid of the mapping to AmpAnalytics3pMessageRouter
   * @VisibleForTesting
   */
  reset() {
    this.creativeMessageRouters_ = {};
  }

  /**
   * Takes the raw postMessage event, and extracts from it the actual data
   * payload
   * @param event
   * @returns {!JsonObject}
   */
  extractMessage(event) {
    dev().assert(event && event.data, 'Received empty events message in ' +
        this.win_.name);
    let startIndex;
    dev().assert((startIndex = event.data.indexOf('-') + 1) > 0,
        'Received truncated events message in ' + this.win_.name);
    return tryParseJson(event.data.substr(startIndex));
  }
}

if (!window.AMP_TEST) {
  try {
    new AmpAnalytics3pMessageRouter(window);
  } catch (e) {
    dev().error(TAG_, 'Failed to construct AmpAnalytics3pMessageRouter: ' +
      e.message);
  }
}

/**
 * Receives messages bound for this cross-domain iframe, from a particular
 * creative. Also sends response messages from the iframe meant for this
 * particular creative.
 */
export class AmpAnalytics3pCreativeMessageRouter {
  /**
   * @param {!Window} win The enclosing window object
   * @param {!string} sentinel The communication sentinel of this iframe
   * @param {!string} transportId The ID of the creative to route messages
   * to/from
   */
  constructor(win, sentinel, transportId) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!string} */
    this.sentinel_ = sentinel;

    /** @private {!string} */
    this.transportId_ = transportId;

    /** @private {?function(!Array<!AmpAnalytics3pEvent>)} */
    this.eventListener_ = null;
  }

  /**
   * Registers a callback function to be called when AMP Analytics events occur.
   * There may only be one listener. If another function has previously been
   * registered as a listener, it will no longer receive events.
   * @param {!function(!Array<AmpAnalytics3pEvent>)} listener A function
   * that takes an array of event strings, and does something with them.
   */
  registerAmpAnalytics3pEventsListener(listener) {
    if (this.eventListener_) {
      dev().warn(TAG_, 'Replacing existing eventListener for ' +
        this.transportId_);
    }
    this.eventListener_ = listener;
  }

  /**
   * Receives message(s) from a creative for the cross-domain iframe
   * and passes them to that iframe's listener, if a listener has been
   * registered
   * @param {!Array<AmpAnalytics3pEvent>} messages The message that was received
   */
  sendMessagesToListener(messages) {
    if (!messages.length) {
      dev().warn(TAG_, 'Attempted to send zero messages in ' +
          this.transportId_ + '. Ignoring.');
      return;
    }
    if (!this.eventListener_) {
      dev().warn(TAG_, 'Attempted to send messages when no listener' +
        ' configured in ' + this.transportId_ + '. Be sure to' +
        ' first call registerAmpAnalytics3pEventsListener()');
    }
    try {
      this.eventListener_(messages);
    } catch (e) {
      dev().error(TAG_, 'Caught exception executing listener for ' +
        this.transportId_ + ': ' + e.message);
    }
  }

  /**
   * Sends a message from the third-party vendor's metrics-collection page back
   * to the creative.
   * @param {!../src/3p-analytics-common.AmpAnalytics3pResponse} response The
   * response to send.
   */
  sendMessageToCreative(response) {
    const responseMessage = {
      sentinel: this.sentinel_,
      transport: this.transportId_,
      type: AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE,
      data: response,
    };
    this.win_.parent./*OK*/postMessage(
        /** @type {!JsonObject} */ (responseMessage), '*');
  }

  /**
   * @returns {!string}
   * @VisibleForTesting
   */
  getTransportId() {
    return this.transportId_;
  }
}

