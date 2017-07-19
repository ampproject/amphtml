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
import {MessageType} from '../../../src/3p-frame-messaging';
import {SubscriptionApi} from '../../../src/iframe-helper';

/** @private @const {string} */
const TAG_ = 'amp-analytics.IframeTransportMessageQueue';

/** @private @const {number} */
const MAX_QUEUE_SIZE_ = 100;

/**
 * @visibleForTesting
 */
export class IframeTransportMessageQueue {
  /**
   * Constructor
   * @param {!Window} win The window element
   * @param {!HTMLIFrameElement} frame The cross-domain iframe to send
   * messages to
   */
  constructor(win, frame) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!HTMLIFrameElement} */
    this.frame_ = frame;

    /** @private {boolean} */
    this.isReady_ = false;

    /**
     * @private
     * {!Array<!../../../src/3p-frame-messaging.IframeTransportEvent>}
     */
    this.transportIdToPendingMessages_ = {};

    /** @private {!../../../src/iframe-helper.SubscriptionApi} */
    this.postMessageApi_ = new SubscriptionApi(this.frame_,
        MessageType.SEND_IFRAME_TRANSPORT_EVENTS,
        true,
        () => {
          this.setIsReady();
        },
        true);
  }

  /**
   * Returns whether the queue has been marked as ready yet
   * @return {boolean}
   * @VisibleForTesting
   */
  isReady() {
    return this.isReady_;
  }

  /**
   * Indicate that a cross-domain frame is ready to receive messages, and
   * send all messages that were previously queued for it.
   * @VisibleForTesting
   */
  setIsReady() {
    this.isReady_ = true;
    this.flushQueue_();
  }

  /**
   * Returns how many transportId -> message(s) mappings there are
   * @return {number}
   * @VisibleForTesting
   */
  queueSize() {
    return Object.keys(this.transportIdToPendingMessages_).length;
  }

  /**
   * Enqueues an event to be sent to a cross-domain iframe.
   * @param {!../../../src/3p-frame-messaging.IframeTransportEvent} event
   * Identifies the event and which Transport instance (essentially which
   * creative) is sending it.
   */
  enqueue(transportId, event) {
    this.transportIdToPendingMessages_[transportId] =
        this.messagesFor(transportId) || [];
    if (this.queueSize() >= MAX_QUEUE_SIZE_) {
      dev().warn(TAG_, 'Exceeded maximum size of queue for: ' + transportId);
      this.messagesFor(transportId).shift();
    }
    this.messagesFor(transportId).push(event);
    this.flushQueue_();
  }

  /**
   * Send queued data (if there is any) to a cross-domain iframe
   * @private
   */
  flushQueue_() {
    if (this.isReady() && this.queueSize()) {
      this.postMessageApi_.send(MessageType.IFRAME_TRANSPORT_EVENTS,
          /** @type {!JsonObject} */
          ({data: this.transportIdToPendingMessages_}));
      this.transportIdToPendingMessages_ = {};
    }
  }

  /**
   * Test method to see which messages (if any) are associated with a given
   * transportId
   * @param {!string} transportId Identifies which creative is sending the
   * message
   * @return {Array<string>}
   * @VisibleForTesting
   */
  messagesFor(transportId) {
    return /** @type {Array<string>} */ (
      this.transportIdToPendingMessages_[transportId]);
  }
}

