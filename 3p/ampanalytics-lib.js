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
import {AMP_ANALYTICS_3P_MESSAGE_TYPE} from '../src/3p-analytics-common';
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

    // The sentinel is required by iframe-messaging-client, and is used to
    // uniquely identify the frame as part of message routing
    /** @private {string} */
    this.sentinel_ = null;

    /** @private {!Object<string, !AmpAnalytics3pCreativeMessageRouter>} */
    this.creativeMessageRouters_ = {};

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
      dev().warn(TAG_, 'Unable to set sentinel from name attr: ' +
        this.win_.name);
      return;
    }
    this.iframeMessagingClient_.registerCallback(
      AMP_ANALYTICS_3P_MESSAGE_TYPE.MESSAGES,
      messages => {
        // All the messages are for this frame, but may come from different
        // creatives.
        messages[AMP_ANALYTICS_3P_MESSAGE_TYPE.MESSAGES].forEach(msg => {
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
    this.iframeMessagingClient_.sendMessage(AMP_ANALYTICS_3P_MESSAGE_TYPE.READY,
      {});
  }

  /**
   * Sends a message back to the host window
   * @param {string} type The type of message to send.
   * @param {(ampAnalytics3pReadyMessage|ampAnalytics3pResponse)} opt_payload
   * The payload of message to send.
   */
  sendMessage(type, opt_payload) {
    this.iframeMessagingClient_.sendMessage(type, opt_payload);
  }
}

new AmpAnalytics3pMessageRouter(window);

/**
 * Receives messages bound for this cross-domain iframe, from a particular
 * creative
 */
class AmpAnalytics3pCreativeMessageRouter {
  /**
   * @param {!AmpAnalytics3pMessageRouter} parent
   * @param {!string} creativeId
   */
  constructor(parent, creativeId) {
    /** @private {!AmpAnalytics3pMessageRouter} */
    this.parent_ = parent;

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
   * @param {Object<string,*>} message The message that was received
   */
  receiveMessage(message) {
    if (message[AMP_ANALYTICS_3P_MESSAGE_TYPE.NEW]) {
      this.extraData_ = message[AMP_ANALYTICS_3P_MESSAGE_TYPE.NEW];
    } else {
      this.receivedMessagesQueue_.push(message);
    }
  }

  /**
   * If an event listener has been created on the third-party vendor's
   * metrics-collection page, this method passes the queued events to that
   * listener.
   * If there is no event listener on the page yet, event messages will remain
   * in the queue.
   */
  sendQueuedMessagesToListeners() {
    if (this.receivedMessagesQueue_.length == 0 ||
      this.eventListeners_.length == 0) {
      return;
    }
    this.eventListeners_.forEach(listener => {
      listener(this.receivedMessagesQueue_);
    });
    this.receivedMessagesQueue_ = [];
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
   * @param {!Object} message The message to send.
   */
  sendMessageToCreative(message) {
    const envelope = {destination: this.creativeId_};
    envelope[AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE] = message;
    this.parent_.sendMessage(
      AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE, envelope);
  }
}

