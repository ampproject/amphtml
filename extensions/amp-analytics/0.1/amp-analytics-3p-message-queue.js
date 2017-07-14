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
import {SubscriptionApi} from '../../../src/iframe-helper';

/** @private @const {string} */
const TAG_ = 'amp-analytics.CrossDomainIframeMessageQueue';

/** @private @const {number} */
const MAX_QUEUE_SIZE_ = 100;

/**
 * @visibleForTesting
 */
export class AmpAnalytics3pMessageQueue {
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

    /** @private {!Object<string,!Array<string>>} */
    this.creativeToPendingMessages_ = {};

    /** @private {!Object<string,string>} */
    this.creativeToExtraData_ = {};

    /** @private {!Object<string,!string>} */
    this.creativeToPendingExtraData_ = {};

    /** @private {string} */
    this.messageType_ = this.frame_.getAttribute('data-amp-3p-sentinel') +
        AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT;

    /** @private {!../../../src/iframe-helper.SubscriptionApi} */
    this.postMessageApi_ = new SubscriptionApi(this.frame_,
        this.messageType_,
        true,
        () => {
          this.isReady_ = true;
          this.flushQueue_();
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
   * Returns how many creativeId -> message(s) mappings there are
   * @return {number}
   * @VisibleForTesting
   */
  queueSize() {
    return Object.keys(this.creativeToPendingMessages_).length;
  }

  /**
   * Sets extra config data to be sent to a cross-domain iframe.
   * @param {!string} creativeId Identifies which creative is sending the message
   * @param {!string} extraData The event to be enqueued and then sent to the
   * iframe
   */
  setExtraData(creativeId, extraData) {
    this.creativeToExtraData_[creativeId] = extraData;
    this.flushQueue_();
  }

  /**
   * Enqueues an AmpAnalytics3pEvent message to be sent to a cross-domain
   * iframe.
   * @param {!string} creativeId Identifies which creative is sending the message
   * @param {!string} event The event to be enqueued and then sent to the iframe
   */
  enqueue(creativeId, event) {
    this.creativeToPendingMessages_[creativeId] =
      this.creativeToPendingMessages_[creativeId] || [];
    if (this.queueSize() >= MAX_QUEUE_SIZE_) {
      dev().warn(TAG_, 'Exceeded maximum size of queue for: ' + creativeId);
      this.creativeToPendingMessages_[creativeId].shift();
    }
    this.creativeToPendingMessages_[creativeId].push(event);
    this.flushQueue_();
  }

  /**
   * Send queued data (if there is any) to a cross-domain iframe
   * @private
   */
  flushQueue_() {
    if (this.isReady()) {
      if (Object.keys(this.creativeToExtraData_).length) {
        this.postMessageApi_.send(AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE,
            /** @type {!JsonObject} */
            ({data: this.creativeToExtraData_}));
        this.creativeToExtraData_ = {};
      }
      if (this.queueSize()) {
        this.postMessageApi_.send(AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT,
            /** @type {!JsonObject} */
            ({data: this.creativeToPendingMessages_}));
        this.creativeToPendingMessages_ = {};
      }
    }
  }

  /**
   * Test method to see which messages (if any) are associated with a given
   * creativeId
   * @param {!string} creativeId Identifies which creative is sending the message
   * @return {Array<string>}
   * @VisibleForTesting
   */
  messagesFor(creativeId) {
    return /** @type {Array<string>} */ (
      this.creativeToPendingMessages_[creativeId]);
  }
}

