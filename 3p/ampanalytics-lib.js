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
import {IframeMessagingClient} from './iframe-messaging-client';
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
class AmpAnalytics3pMessageRouter {
  /** @param {!Window} win */
  constructor(win) {

    /** @private {!Window} */
    this.win_ = win;

    try {
      const frameNameData = JSON.parse(this.win_.name);
      if (!frameNameData.sentinel) {
        const ex = {message: 'JSON parsed, but did not include sentinel.'};
        throw ex;
      }
      // The sentinel is required by iframe-messaging-client, and is used to
      // uniquely identify the frame as part of message routing
      /** @const {string} */
      this.sentinel_ = frameNameData.sentinel;
    } catch (e) {
      dev().warn(TAG_, 'Unable to set sentinel from name attr: ' +
        this.win_.name + ': ' + e.message);
      return;
    }

    /** @private {!Object<string, !AmpAnalytics3pCreativeMessageRouter>} */
    this.creativeMessageRouters_ = {};

    /**
     * Handles communication between frames
     * @private {!IframeMessagingClient}
     */
    this.iframeMessagingClient_ = new IframeMessagingClient(win);
    this.iframeMessagingClient_.setSentinel(this.sentinel_);
    this.iframeMessagingClient_.registerCallback(
      AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVES,
      envelope => {
        dev().assert(envelope[AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVES],
          'Received empty events envelope');
        // Iterate through the array of "new creative" events, and for each
        // one, create an AmpAnalytics3pCreativeMessageRouter.
        envelope[AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVES].forEach(creative => {
          this.creativeMessageRouters_[creative.senderId] =
            this.creativeMessageRouters_[creative.senderId] ||
            new AmpAnalytics3pCreativeMessageRouter(this, this.sentinel_,
              creative.senderId);
          this.creativeMessageRouters_[creative.senderId]
            .receiveNewCreativeMessage(creative);
        });
      });
    this.iframeMessagingClient_.registerCallback(
      AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENTS,
      envelope => {
        dev().assert(envelope[AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENTS],
          'Received empty events envelope');
        // Iterate through the array of events, dispatching each to the
        // listener for the appropriate creative
        envelope[AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENTS].forEach(event => {
          dev().assert(this.creativeMessageRouters_[event.senderId],
            'Received event message prior to new creative message.' +
            ' Discarding.');
          this.creativeMessageRouters_[event.senderId]
            .receiveEventMessage(event);
        });
        this.flushQueues_();
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

  /**
   * Instructs each AmpAnalytics3pCreativeMessageRouter instances to send its
   * queued messages to its listener (if if has a listener yet).
   * @private
   */
  flushQueues_() {
    Object.entries(this.creativeMessageRouters_).forEach(
      entry => {
        try {
          const creativeMessageRouter = entry[1];
          creativeMessageRouter.sendQueuedMessagesToListener();
        } catch (e) {
          dev().error(TAG_, 'Caught exception executing listener for ' +
            entry[0] + ': ' + e.message);
        }
      });
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
     * private {!Array<ampAnalytics3pEvent>}
     */
    this.receivedMessagesQueue_ = [];

    /**
     * private {function(Array<ampAnalytics3pEvent>)=}
     */
    this.eventListener_ = null;

    if (this.parent_.getWindow().onNewAmpAnalyticsInstance) {
      this.parent_.getWindow().onNewAmpAnalyticsInstance(this);
    } else {
      dev().error(TAG_, 'Vendor page must implement onNewAmpAnalyticsInstance' +
        ' prior to loading library script.');
    }
  }

  /**
   * Registers a callback function to be called when AMP Analytics events occur.
   * There may only be one listener. If another function has previously been
   * registered as a listener, it will no longer receive events.
   * @param {!function(!Array<ampAnalytics3pEvent>)} listener A function
   * that takes an array of event strings, and does something with them.
   */
  registerAmpAnalytics3pEventsListener(listener) {
    this.eventListener_ = listener;
  }

  /**
   * Receives a message from a creative for the cross-domain iframe
   * @param {ampAnalytics3pNewCreative} message The message that was received
   */
  receiveNewCreativeMessage(message) {
    this.extraData_ = message[AMP_ANALYTICS_3P_MESSAGE_TYPE.NEW];
  }

  /**
   * Receives a message from a creative for the cross-domain iframe
   * @param {ampAnalytics3pEvent} message The message that was received
   */
  receiveEventMessage(message) {
    this.receivedMessagesQueue_.push(message);
  }

  /**
   * If an event listener has been created on the third-party vendor's
   * metrics-collection page, this method passes the queued events to that
   * listener.
   * If there is no event listener on the page yet, event messages will remain
   * in the queue.
   */
  sendQueuedMessagesToListener() {
    if (!this.receivedMessagesQueue_ || !this.eventListener_) {
      return;
    }
    this.eventListener_(this.receivedMessagesQueue_);
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
   * @param {!ampAnalytics3pResponse} message The message to send.
   */
  sendMessageToCreative(message) {
    const envelope = {destination: this.creativeId_};
    envelope[AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE] = message;
    this.parent_.sendMessage(
      AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE, envelope);
  }
}

