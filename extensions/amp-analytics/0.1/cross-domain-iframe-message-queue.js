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

import {dev} from '../../../src/log';
import {timerFor} from '../../../src/services';
import {
  AMP_ANALYTICS_3P_MESSAGE_TYPE,
} from '../../../src/3p-analytics-common';

/** @private @const {string} */
const TAG_ = 'amp-analytics.CrossDomainIframeMessageQueue';

/** @private @const {number} */
const MESSAGE_THROTTLE_TIME_ = 100;

/** @private @const {number} */
const MAX_QUEUE_SIZE_ = 100;

/**
 * @visibleForTesting
 */
export class CrossDomainIframeMessageQueue {
  /**
   * Constructor
   * @param {!../../../3p/iframe-messaging-client.IframeMessagingClient}
   *   iframeMessagingClient Facilitates
   * cross-frame communication
   * @param {!string} envelopeType The type of envelope that will be used to
   * contain the queued messages (see 3p-analytics-common)
   */
  constructor(iframeMessagingClient, envelopeType) {
    /** @type {Array<(
    *            ../../../src/3p-analytics-common.ampAnalytics3pEvent|
    *            ../../../src/3p-analytics-common.ampAnalytics3pNewCreative
    *          )>} */
    this.queue_ = [];

    /** @type {?number} */
    this.timerId_ = null;

    /** @type {boolean} */
    this.isReady_ = false;

    /** @type {!../../../3p/iframe-messaging-client.IframeMessagingClient} */
    this.iframeMessagingClient_ = iframeMessagingClient;

    /** @type {string} */
    this.envelopeType_ = envelopeType;
  }

  /**
   * Destructor
   */
  destroy() {
    CrossDomainIframeMessageQueue.timer_.cancel(this.timerId_);
    this.timerId_ = null;
  }

  /**
   * Indicate that a cross-domain frame is ready to receive messages, and
   * send all messages that were previously queued for it.
   * associated data
   */
  setIsReady() {
    this.isReady_ = true;
    this.sendQueuedMessages_();
  }

  /**
   * Builds an event message to be passed to the cross-domain iframe(s)
   * @param {!string} senderId
   * @param {!string} message The data to send
   * @return {../../../src/3p-analytics-common.ampAnalytics3pEvent}
   */
  static buildEventMessage(senderId, message) {
    const messageObject = {
      senderId,
      type: AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT,
    };
    messageObject[AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT] = message;
    const typedMessageObject =
      /** @type {../../../src/3p-analytics-common.ampAnalytics3pEvent} */
      (messageObject);
    return typedMessageObject;
  }

  /**
   * Builds a message indicating that a new creative is now using the
   * cross-domain iframe. The message may include some extra config data.
   * @param {!string} senderId
   * @param {string=} opt_extraData The data to send to the frame
   * @returns {../../../src/3p-analytics-common.ampAnalytics3pNewCreative}
   */
  static buildNewCreativeMessage(senderId, opt_extraData) {
    const messageObject = {
      senderId,
      type: AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE,
    };
    // Still send the message to indicate there is a new creative
    opt_extraData = opt_extraData || '';
    messageObject[AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE] = opt_extraData;
    const typedMessageObject =
      /** @type {../../../src/3p-analytics-common.ampAnalytics3pNewCreative} */
      (messageObject);
    return typedMessageObject;
  }

  /**
   * Enqueues a message (event or extra data) to be sent to a cross-domain
   * iframe.
   * @param {!(
   *           ../../../src/3p-analytics-common.ampAnalytics3pEvent|
   *           ../../../src/3p-analytics-common.ampAnalytics3pNewCreative)
   *        } messageObject
   * The data to be enqueued and then sent to the iframe
   */
  enqueue(messageObject) {
    if (this.queue_.length > MAX_QUEUE_SIZE_) {
      dev().warn(TAG_, 'Queue has exceeded maximum size');
      this.queue_.shift();
    }
    this.queue_.push(messageObject);
    if (this.timerId_) {
      return; // Timer is already about to fire, no need to set a new one
    }
    this.timerId_ = CrossDomainIframeMessageQueue.timer_.delay(() => {
      if (this.isReady_) {
        this.sendQueuedMessages_();
      }
      this.timerId_ = null;
    }, MESSAGE_THROTTLE_TIME_);
  }

  /**
   * Send an array of messages to a cross-domain iframe
   * @private
   */
  sendQueuedMessages_() {
    if (!this.queue_ || !this.queue_.length) {
      return;
    }
    const envelope = {};
    envelope[this.envelopeType_] = this.queue_;
    this.iframeMessagingClient_.sendMessage(this.envelopeType_, envelope);
    this.queue_ = [];
  }
}

/** @private @const {!Object} */
CrossDomainIframeMessageQueue.timer_ = timerFor(AMP.win);

