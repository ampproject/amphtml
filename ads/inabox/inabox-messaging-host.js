/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {PositionObserver} from './position-observer';
import {
  serializeMessage,
  deserializeMessage,
  MessageType,
} from '../../src/3p-frame-messaging';
import {dev} from '../../src/log';

/** @const */
const TAG = 'InaboxMessagingHost';

export class InaboxMessagingHost {

  constructor(win, iframes) {
    this.win_ = win;
    this.iframes_ = iframes;
    this.iframeMap_ = Object.create(null);
    this.registeredIframeSentinels_ = Object.create(null);
    this.positionObserver_ = new PositionObserver(win);
  }

  /**
   * Process a single post message.
   *
   * A valid message has to be formatted as a string starting with "amp-". The
   * rest part should be a stringified JSON object of
   * {type: string, sentinel: string}. The allowed types are listed in the
   * REQUEST_TYPE enum.
   *
   * @param message {!{data: *, source: !Window, origin: string}}
   * @return {boolean} true if message get successfully processed
   */
  processMessage(message) {
    const request = deserializeMessage(message.data);
    if (!request || !request.sentinel) {
      dev().fine(TAG, 'Ignored non-AMP message:', message);
      return false;
    }

    const iframe =
        this.getFrameElement_(message.source, request.sentinel);
    if (!iframe) {
      dev().info(TAG, 'Ignored message from untrusted iframe:', message);
      return false;
    }

    if (request.type == MessageType.SEND_POSITIONS) {
      // To prevent double tracking for the same requester.
      if (this.registeredIframeSentinels_[request.sentinel]) {
        return false;
      }
      this.registeredIframeSentinels_[request.sentinel] = true;
      this.positionObserver_.observe(iframe, data => {
        dev().fine(TAG, `Sent position data to [${request.sentinel}]`, data);
        message.source./*OK*/postMessage(
            serializeMessage(MessageType.POSITION, request.sentinel, data),
            message.origin);
      });
      return true;
    } else {
      dev().warn(TAG, 'Unprocessed AMP message:', message);
      return false;
    }
  }

  /**
   * Returns source window's ancestor iframe who is the direct child of host
   * doc. The sentinel should be unique to the source window, and the result
   * is cached using the sentinel as the key.
   *
   * @param source {!Window}
   * @param sentinel {string}
   * @returns {?HTMLIFrameElement}
   * @private
   */
  getFrameElement_(source, sentinel) {
    if (this.iframeMap_[sentinel]) {
      return this.iframeMap_[sentinel];
    }

    // Walk up on the window tree until find host's direct child window
    while (source.parent !== this.win_ && source !== this.win_.top) {
      source = source.parent;
    }

    // Find the iframe element that hosts the message source window
    for (let i = 0; i < this.iframes_.length; i++) {
      const iframe = this.iframes_[i];
      if (iframe.contentWindow === source) {
        // Cache the found iframe with its sentinel.
        this.iframeMap_[sentinel] = iframe;
        return iframe;
      }
    }
    return null;
  }
}
