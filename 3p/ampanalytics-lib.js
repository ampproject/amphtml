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
import {dev} from '../src/log';
import {initLogConstructor, setReportError} from '../src/log';
import {reportError} from '../src/error';
import {IframeMessagingClient} from './iframe-messaging-client';
import {MessageTypes} from '../src/3p-analytics-common';
initLogConstructor();
setReportError(reportError);

/** @private @const {string} */
const TAG_ = 'ampanalytics-lib';

/**
 * Receives messages bound for this cross-domain iframe, from all creatives
 */
class AmpAnalytics3pMessageRouter {
  /** @param {!Window} win */
  constructor(win) {

    /** @private {!Window} */
    this.win_ = win;

    /** @private {string} */
    this.sentinel_ = null;

    /** @private {Object<string, AmpAnalytics3pCreativeMessageRouter>} */
    this.creativeMessageRouters_ = [];

    /**
     * Simple requestIdleCallback polyfill
     * @type {!function(!function(), number)}
     */
    this.requestIdleCallback =
      this.win_.requestIdleCallback.bind(this.win_) ||
      (cb => setTimeout(cb, 1));

    /**
     * Handles communication between frames
     * @private {!IframeMessagingClient}
     */
    this.iframeMessagingClient_ = new IframeMessagingClient(win);
    try {
      const frameNameData = JSON.parse(this.win_.name);
      if (frameNameData.sentinel) {
        this.sentinel_ = frameNameData.sentinel;
        this.iframeMessagingClient_.setSentinel(this.sentinel_);
      }
    } catch (e) {
      dev().warn(TAG_, 'Unable to set sentinel');
      return;
    }
    this.iframeMessagingClient_.registerCallback(
      MessageTypes.ampAnalytics3pMessages,
      messages => {
        // All the messages are for this frame, but may come from different
        // creatives.
        messages[MessageTypes.ampAnalytics3pMessages].forEach(msg => {
          if (!this.creativeMessageRouters_[msg.senderId]) {
            this.creativeMessageRouters_[msg.senderId] =
              new AmpAnalytics3pCreativeMessageRouter(this, this.sentinel_,
                msg.senderId);
          }
          this.creativeMessageRouters_[msg.senderId].receiveMessage(msg);
        });
        Object.entries(this.creativeMessageRouters_).forEach(
          entry => {
            const creativeMessageRouter = entry[1];
            creativeMessageRouter.sendQueuedMessagesToListeners();
          });
      });
    this.sendReadyMessageToCreative_();
  }

  /**
   * Gets a handle to the window (or testing object that mocks window)
   * @returns {!Window}
   */
  getWindow() {
    return this.win_;
  }

  /**
   * Sends a message from the third-party vendor's metrics-collection page back
   * to the creative.
   * @private
   */
  sendReadyMessageToCreative_() {
    this.iframeMessagingClient_.sendMessage(MessageTypes.ampAnalytics3pReady,
      {senderId: this.sentinel_});
  }

  /**
   * Sends a message back to the host window
   * @param {string} type The type of message to send.
   * @param {Object=} opt_payload The payload of message to send.
   */
  sendMessage(type, opt_payload) {
    this.iframeMessagingClient_.sendMessage(type, opt_payload);
  }
}

/**
 * @private @const {!AmpAnalytics3pMessageRouter}
 */
new AmpAnalytics3pMessageRouter(window);

/**
 * Receives messages bound for this cross-domain iframe, from a particular
 * creative
 */
class AmpAnalytics3pCreativeMessageRouter {
  /**
   * @param {!AmpAnalytics3pMessageRouter} parent
   * @param {!string} sentinel
   * @param {!string} creativeId
   */
  constructor(parent, sentinel, creativeId) {
    /** @private {!Window} */
    this.parent_ = parent;

    /**
     * @private {string}
     */
    this.sentinel_ = sentinel;

    /**
     * @private {string}
     */
    this.creativeId_ = creativeId;

    /**
     * @private {string}
     */
    this.extraData_ = null;

    /**
     * @private {!Array<Object<string,*>>}
     */
    this.receivedMessagesQueue_ = [];

    /**
     * @private {!Array<!function(Array)>}
     */
    this.eventListeners_ = [];

    if (this.parent_.getWindow().onNewAmpAnalyticsInstance) {
      this.parent_.getWindow().onNewAmpAnalyticsInstance(this);
    } else {
      dev().error(TAG_, 'Vendor page must implement onNewAmpAnalyticsInstance' +
        ' prior to loading library script.');
    }
  }

  /**
   * Registers a callback function to be called when AMP Analytics events occur
   * @param {!function(!Array)} listener A function that takes an array of event
   * strings, and does something with them.
   */
  registerAmpAnalytics3pEventsListener(listener) {
    this.eventListeners_.push(listener);
  }

  /**
   * Receives a message from a creative for the cross-domain iframe
   * @param Object<string,*> message The message that was received
   */
  receiveMessage(message) {
    if (message[MessageTypes.ampAnalytics3pNewCreative]) {
      this.extraData_ = message[MessageTypes.ampAnalytics3pNewCreative];
    } else {
      this.receivedMessagesQueue_.push(message);
    }
  }

  /**
   * Sends enqueued messages to the third-party vendor's metrics-collection page
   * If there are no event listeners on the page, event messages will remain
   * in the queue. But if there is at least one event listener, messages will be
   * sent to those listener(s) and the queue will be emptied. This means
   * that the first event listener will receive messages that predate its
   * creation, but if there are additional event listeners, they may not.
   */
  sendQueuedMessagesToListeners() {
    if (this.receivedMessagesQueue_.length == 0 ||
      this.eventListeners_.length == 0) {
      return;
    }
    this.eventListeners_.forEach(listener => {
      this.dispatch_(this.receivedMessagesQueue_, listener);
    });
    this.receivedMessagesQueue_ = [];
  }

  /**
   * Sends an array of messages to a single listener, using
   * requestIdleCallback()
   * @param {!Array<Object<string,*>>} dataToSend The array of messages
   * @param {!function(!Array)} listener The listener
   * @private
   */
  dispatch_(dataToSend, listener) {
    this.parent_.requestIdleCallback(() => {
      try {
        listener(dataToSend);
      } catch (e) {
        dev().warn(TAG_, 'Caught exception dispatching messages: ' + e.message);
      }
    });
  }

  /**
   * Gets any optional extra data that should be made available to the
   * cross-domain frame, in the context of a particular creative.
   * @returns {?string}
   */
  getExtraData() {
    return this.extraData_;
  }

  /**
   * Sends a message from the third-party vendor's metrics-collection page back
   * to the creative.
   * @param {!string} message The message to send.
   */
  sendMessageToCreative(message) {
    const envelope = {senderId: this.sentinel_, destination: this.creativeId_};
    envelope[MessageTypes.ampAnalytics3pResponse] = message;
    this.parent_.sendMessage(
      MessageTypes.ampAnalytics3pResponse, envelope);
  }
}

