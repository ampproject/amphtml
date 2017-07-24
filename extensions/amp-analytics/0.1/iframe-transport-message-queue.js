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
import {
  IFRAME_TRANSPORT_EVENTS_TYPE,
} from '../../../src/iframe-transport-common';
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
     * {!Array<!../../../src/iframe-transport-common.IframeTransportEvent>}
     */
    this.pendingEvents_ = [];

    /** @private {string} */
    this.messageType_ = IFRAME_TRANSPORT_EVENTS_TYPE;

    /** @private {!../../../src/iframe-helper.SubscriptionApi} */
    this.postMessageApi_ = new SubscriptionApi(this.frame_,
        this.messageType_,
        true,
        () => {
          this.setIsReady();
        });
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
    return this.pendingEvents_.length;
  }

  /**
   * Enqueues an event to be sent to a cross-domain iframe.
   * @param {!../../../src/iframe-transport-common.IframeTransportEvent} event
   * Identifies the event and which Transport instance (essentially which
   * creative) is sending it.
   */
  enqueue(event) {
    dev().assert(TAG_, event && event.transportId && event.message,
        'Attempted to enqueue malformed message for: ' +
        event.transportId);
    this.pendingEvents_.push(event);
    if (this.queueSize() >= MAX_QUEUE_SIZE_) {
      dev().warn(TAG_, 'Exceeded maximum size of queue for: ' +
          event.transportId);
      this.pendingEvents_.shift();
    }
    this.flushQueue_();
  }

  /**
   * Send queued data (if there is any) to a cross-domain iframe
   * @private
   */
  flushQueue_() {
    if (this.isReady() && this.queueSize()) {
      this.postMessageApi_.send(IFRAME_TRANSPORT_EVENTS_TYPE,
          /** @type {!JsonObject} */
          ({events: this.pendingEvents_}));
      this.pendingEvents_ = [];
    }
  }
}

