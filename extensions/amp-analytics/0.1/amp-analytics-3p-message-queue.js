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
import {AMP_ANALYTICS_3P_MESSAGE_TYPE} from '../../../src/3p-analytics-common';
import {throttle} from '../../../src/utils/rate-limit';

/** @private @const {string} */
const TAG_ = 'amp-analytics.CrossDomainIframeMessageQueue';

/** @private @const {number} */
const MESSAGE_THROTTLE_TIME_ = 100;

/** @private @const {number} */
const MAX_QUEUE_SIZE_ = 100;

/**
 * @visibleForTesting
 * @abstract
 */
class AbstractAmpAnalytics3pMessageQueue {
  /**
   * Constructor
   * @param {!Window} win The window element
   * @param {!../../../3p/iframe-messaging-client.IframeMessagingClient}
   *   iframeMessagingClient Facilitates cross-frame communication
   * @param {!string} messageType The type that will be used to
   * contain the queued data (see 3p-analytics-common)
   */
  constructor(win, iframeMessagingClient, messageType) {
    /** @type {boolean} */
    this.isReady_ = false;

    /** @type {!Window} */
    this.win_ = win;

    /** @type {!../../../3p/iframe-messaging-client.IframeMessagingClient} */
    this.iframeMessagingClient_ = iframeMessagingClient;

    /** @type {string} */
    this.messageType_ = messageType;

    /** @type {!Object<string,!string|!Array<string>>} */
    this.store_ = {};

    this.throttledFlushQueue_ = throttle(this.win_, () => {
      this.flushQueue_();
    }, MESSAGE_THROTTLE_TIME_);

  }

  /**
   * Indicate that a cross-domain frame is ready to receive messages, and
   * send all messages that were previously queued for it.
   * associated data
   */
  setIsReady() {
    this.isReady_ = true;
    this.throttledFlushQueue_();
  }

  /**
   * Send queued data (if there is any) to a cross-domain iframe
   * @private
   */
  flushQueue_() {
    if (this.isReady_ && Object.keys(this.store_).length > 0) {
      this.iframeMessagingClient_./*OK*/sendMessage(this.messageType_,
        this.buildMessage_());
      this.store_ = {};
    }
  }

  /**
   * @return {../../../src/3p-analytics-common.AmpAnalytics3pNewCreative|
   *          ../../../src/3p-analytics-common.AmpAnalytics3pEvent}
   * @abstract
   */
  buildMessage_() {
  }
}

export class AmpAnalytics3pNewCreativeMessageQueue extends
  AbstractAmpAnalytics3pMessageQueue {

  /**
   * Constructor
   * @param {!Window} win The window element
   * @param {!../../../3p/iframe-messaging-client.IframeMessagingClient}
   *   iframeMessagingClient Facilitates cross-frame communication
   */
  constructor(win, iframeMessagingClient) {
    super(win, iframeMessagingClient, AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE);
  }

  /**
   * Enqueues a message (event or extra data) to be sent to a cross-domain
   * iframe.
   * @param {!string} senderId Identifies which creative is sending the message
   * @param {string=} opt_data The data to be enqueued and then sent to the
   * iframe
   */
  enqueue(senderId, opt_data) {
    if (this.store_.hasOwnProperty(senderId)) {
      dev().warn(TAG_, 'Replacing existing extra data for: ' + senderId);
    }
    this.store_[senderId] = opt_data || '';

    this.throttledFlushQueue_();
  }

  /**
   * Builds a message object containing the queued data
   * @return {../../../src/3p-analytics-common.AmpAnalytics3pNewCreative}
   * @override
   */
  buildMessage_() {
    const message = {};
    message.type = this.messageType_;
    message.data = this.store_;
    const typedMessage =
      /** @type {../../../src/3p-analytics-common.AmpAnalytics3pNewCreative} */
      (message);
    return typedMessage;
  }
}

export class AmpAnalytics3pEventMessageQueue extends
  AbstractAmpAnalytics3pMessageQueue {

  /**
   * Constructor
   * @param {!Window} win The window element
   * @param {!../../../3p/iframe-messaging-client.IframeMessagingClient}
   *   iframeMessagingClient Facilitates cross-frame communication
   */
  constructor(win, iframeMessagingClient) {
    super(win, iframeMessagingClient, AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT);
  }

  /**
   * Enqueues a message (event or extra data) to be sent to a cross-domain
   * iframe.
   * @param {!string} senderId Identifies which creative is sending the message
   * @param {!string} data The data to be enqueued and then sent to the iframe
   */
  enqueue(senderId, data) {
    if (!this.store_.hasOwnProperty(senderId)) {
      this.store_[senderId] = [];
    }
    if (this.store_[senderId].length >= MAX_QUEUE_SIZE_) {
      dev().warn(TAG_, 'Exceeded maximum size of queue for: ' + senderId);
      this.store_[senderId].shift();
    }
    this.store_[senderId].push(data);

    this.throttledFlushQueue_();
  }

  /**
   * Builds a message object containing the queued data
   * @return {../../../src/3p-analytics-common.AmpAnalytics3pEvent}
   * @override
   */
  buildMessage_() {
    const message = {};
    message.type = this.messageType_;
    message.data = this.store_;
    const typedMessage =
      /** @type {../../../src/3p-analytics-common.AmpAnalytics3pEvent} */
      (message);
    return typedMessage;
  }
}

