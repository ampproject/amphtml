function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { MessageType } from "../../../src/3p-frame-messaging";
import { SubscriptionApi } from "../../../src/iframe-helper";
import { dev, devAssert } from "../../../src/log";

/** @private @const {string} */
var TAG_ = 'amp-analytics/iframe-transport-message-queue';

/** @private @const {number} */
var MAX_QUEUE_SIZE_ = 100;

/**
 * @visibleForTesting
 */
export var IframeTransportMessageQueue = /*#__PURE__*/function () {
  /**
   * Constructor
   * @param {!Window} win The window element
   * @param {!HTMLIFrameElement} frame The cross-domain iframe to send
   * messages to
   */
  function IframeTransportMessageQueue(win, frame) {var _this = this;_classCallCheck(this, IframeTransportMessageQueue);
    /** @private {!HTMLIFrameElement} */
    this.frame_ = frame;

    /** @private {boolean} */
    this.isReady_ = false;

    /**
     * @private
     * {!Array<!../../../src/3p-frame-messaging.IframeTransportEvent>}
     */
    this.pendingEvents_ = [];

    /** @private {!../../../src/iframe-helper.SubscriptionApi} */
    this.postMessageApi_ = new SubscriptionApi(
    this.frame_,
    MessageType.SEND_IFRAME_TRANSPORT_EVENTS,
    true,
    function () {
      _this.setIsReady();
    });

  }

  /**
   * Returns whether the queue has been marked as ready yet
   * @return {boolean}
   * @visibleForTesting
   */_createClass(IframeTransportMessageQueue, [{ key: "isReady", value:
    function isReady() {
      return this.isReady_;
    }

    /**
     * Indicate that a cross-domain frame is ready to receive messages, and
     * send all messages that were previously queued for it.
     * @visibleForTesting
     */ }, { key: "setIsReady", value:
    function setIsReady() {
      this.isReady_ = true;
      this.flushQueue_();
    }

    /**
     * Returns how many creativeId -> message(s) mappings there are
     * @return {number}
     * @visibleForTesting
     */ }, { key: "queueSize", value:
    function queueSize() {
      return this.pendingEvents_.length;
    }

    /**
     * Enqueues an event to be sent to a cross-domain iframe.
     * @param {!../../../src/3p-frame-messaging.IframeTransportEvent} event
     * Identifies the event and which Transport instance (essentially which
     * creative) is sending it.
     */ }, { key: "enqueue", value:
    function enqueue(event) {
      devAssert(
      event && event.creativeId && event.message);


      this.pendingEvents_.push(event);
      if (this.queueSize() >= MAX_QUEUE_SIZE_) {
        dev().warn(
        TAG_,
        'Exceeded maximum size of queue for: ' + event.creativeId);

        this.pendingEvents_.shift();
      }
      this.flushQueue_();
    }

    /**
     * Send queued data (if there is any) to a cross-domain iframe
     * @private
     */ }, { key: "flushQueue_", value:
    function flushQueue_() {
      if (this.isReady() && this.queueSize()) {
        this.postMessageApi_.send(
        MessageType.IFRAME_TRANSPORT_EVENTS,
        /** @type {!JsonObject} */(
        { events: this.pendingEvents_ }));

        this.pendingEvents_ = [];
      }
    } }]);return IframeTransportMessageQueue;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/iframe-transport-message-queue.js