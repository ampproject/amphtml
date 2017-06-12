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
import {dev, user} from '../src/log';
import {initLogConstructor, setReportError} from '../src/log';
import {IframeMessagingClient} from './iframe-messaging-client';
import {AMP_ANALYTICS_3P_MESSAGE_TYPE} from '../src/3p-analytics-common';
initLogConstructor();
// TODO(alanorozco): Refactor src/error.reportError so it does not contain big
// transitive dependencies and can be included here.
setReportError(() => {});

/** @private @const {string} */
const TAG_ = 'ampanalytics-lib';

/** @private @const {number} */
const MAX_QUEUE_SIZE_ = 100;

/**
 * Receives messages bound for this cross-domain iframe, from all creatives
 */
class AmpAnalytics3pMessageRouter {

  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    let frameNameData = null;
    try {
      frameNameData = JSON.parse(this.win_.name);
      if (!frameNameData.sentinel) {
        throw new Error('JSON parsed, but did not include sentinel.');
      }
      // The sentinel is required by iframe-messaging-client, and is used to
      // uniquely identify the frame as part of message routing
      /** @const {string} */
    } catch (e) {
      dev().warn(TAG_, 'Unable to set sentinel from name attr: ' +
        this.win_.name + ': ' + e.message);
      return;
    }
    this.sentinel_ = frameNameData && frameNameData.sentinel;

    /**
     * Multiple creatives on a page may wish to use the same type of
     * amp-analytics tag. This object provides a mapping between the
     * IDs which identify which amp-analytics tag a message is to/from,
     * with each ID's corresponding AmpAnalytics3pCreativeMessageRouter,
     * which is an object that handles messages to/from a particular creative.
     * @private {!Object<string, !AmpAnalytics3pCreativeMessageRouter>}
     */
    this.creativeMessageRouters_ = {};

    /**
     * Handles communication between frames
     * @private {!IframeMessagingClient}
     */
    this.iframeMessagingClient_ = new IframeMessagingClient(win);
    this.iframeMessagingClient_.setSentinel(this.sentinel_);
    this.iframeMessagingClient_.registerCallback(
      AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVES,
      messageContainer => {
        dev().assert(messageContainer[AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVES],
          'Received empty events envelope');
        // Iterate through the array of "new creative" messages, and for each
        // one, create an AmpAnalytics3pCreativeMessageRouter.
        Object.entries(
          messageContainer[AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVES]).forEach(
          entry => {
            const creativeId = entry[0];
            const messages = entry[1];
            dev().assert(!this.creativeMessageRouters_.hasOwnProperty(
              creativeId) && messages.length == 1,
              'Duplicate new creative message for ' + creativeId);
            this.creativeMessageRouters_[creativeId] =
              this.creativeMessageRouters_[creativeId] ||
              new AmpAnalytics3pCreativeMessageRouter(this,
                creativeId,
                messages[0]);
          });
      });
    this.iframeMessagingClient_.registerCallback(
      AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENTS,
      messageContainer => {
        Object.entries(
          messageContainer[AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENTS]).forEach(
            entry => {
              const creativeId = entry[0];
              const messages = entry[1];
              dev().assert(messages.length > 0,
                'Received empty events list');
              dev().assert(this.creativeMessageRouters_[creativeId],
                'Received event message prior to new creative message.' +
                ' Discarding.');
              this.creativeMessageRouters_[creativeId]
                .receiveEventMessages(messages);
            });
        this.flushQueues_();
      });
    this.iframeMessagingClient_.sendMessage(
      AMP_ANALYTICS_3P_MESSAGE_TYPE.READY);
  }

  /**
   * Gets a handle to the window (or testing object that mocks window)
   * @returns {!Window}
   */
  getWindow() {
    return this.win_;
  }

  /**
   * Getter to expose iframeMessagingClient to instances of
   * AmpAnalytics3pCreativeMessageRouter
   * @returns {!IframeMessagingClient}
   */
  getMessagingClient() {
    return this.iframeMessagingClient_;
  }

  /**
   * Instructs each AmpAnalytics3pCreativeMessageRouter instances to send its
   * queued messages to its listener (if it has a listener yet).
   * @private
   */
  flushQueues_() {
    Object.entries(this.creativeMessageRouters_).forEach(
      entry => {
        entry[1].sendQueuedMessagesToListener();
      });
  }
}

new AmpAnalytics3pMessageRouter(window);

/**
 * Receives messages bound for this cross-domain iframe, from a particular
 * creative. Also sends repsonse messages from the iframe meant for this
 * particular creative.
 */
class AmpAnalytics3pCreativeMessageRouter {
  /**
   * @param {!AmpAnalytics3pMessageRouter} parent
   * @param {!string} creativeId
   * @param {string=} opt_extraData
   */
  constructor(parent, creativeId, opt_extraData) {
    /** @private {!AmpAnalytics3pMessageRouter} */
    this.parent_ = parent;

    /** @private {!IframeMessagingClient} */
    this.iframeMessagingClient_ = parent.getMessagingClient();

    /**
     * @private {!string}
     */
    this.creativeId_ = creativeId;

    /**
     * @private {?string}
     */
    this.extraData_ = opt_extraData;

    /**
     * private {!Array<!AmpAnalytics3pEvent>}
     */
    this.receivedMessagesQueue_ = [];

    /**
     * private {?function(!Array<!AmpAnalytics3pEvent>)=}
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
   * @param {!function(!Array<AmpAnalytics3pEvent>)} listener A function
   * that takes an array of event strings, and does something with them.
   */
  registerAmpAnalytics3pEventsListener(listener) {
    if (this.eventListener_) {
      user().warn(TAG_, 'Replacing existing eventListener for ' +
        this.creativeId_);
    }
    this.eventListener_ = listener;
  }

  /**
   * Receives a message from a creative for the cross-domain iframe
   * @param {!Array<AmpAnalytics3pEvent>} messages The message that was received
   */
  receiveEventMessages(messages) {
    if (this.receivedMessagesQueue_.length >= MAX_QUEUE_SIZE_) {
      dev().warn(TAG_, 'Queue has exceeded maximum size');
      this.receivedMessagesQueue_ = this.receivedMessagesQueue_.splice(
        0,MAX_QUEUE_SIZE_ - messages.length);
    }
    this.receivedMessagesQueue_ = this.receivedMessagesQueue_.concat(messages);
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
    try {
      this.eventListener_(this.receivedMessagesQueue_);
    } catch (e) {
      dev().error(TAG_, 'Caught exception executing listener for ' +
        this.creativeId_ + ': ' + e.message);
    }
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
   * @param {!Object} response The response to send.
   */
  sendMessageToCreative(response) {
    this.iframeMessagingClient_.sendMessage(
      AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE,
      this.buildAmpAnalytics3pResponse_(response));
  }

  /**
   * Builds an instance of AmpAnalytics3pResponse
   * @param {!Object} response The response from the iframe, which can be
   * any object
   * @returns {AmpAnalytics3pResponse}
   */
  buildAmpAnalytics3pResponse_(response) {
    const messageObject = {destination: this.creativeId_};
    messageObject[AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE] = response;
    const typedMessageObject =
      /** @type {AmpAnalytics3pResponse} */ (messageObject);
    return typedMessageObject;
  }
}

