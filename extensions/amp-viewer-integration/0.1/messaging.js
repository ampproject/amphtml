/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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


import {listen} from '../../../src/event-helper';
import {dev} from '../../../src/log';

const TAG = 'amp-viewer-messaging';
const SENTINEL = '__AMPHTML__';

/**
 * @enum {string}
 * @private
 */
const MessageType_ = {
  REQUEST: 'q',
  RESPONSE: 's',
};

/**
 * @fileoverview This is used in amp-viewer-integration.js for the
 * communication protocol between AMP and the viewer. In the comments, I will
 * refer to the communication as a conversation between me and Bob. The
 * messaging protocol should support both sides, but at this point I'm the
 * ampdoc and Bob is the viewer.
 */
export class Messaging {

  /**
   * Conversation (messaging protocol) between me and Bob.
   * @param {!Window} source
   * @param {!Window} target
   * @param {string} targetOrigin
   */
  constructor(source, target, targetOrigin) {
    /**  @private {!number} */
    this.requestIdCounter_ = 0;
    /**  @private {!Object<string, {resolve: function(*), reject: function(!Error)}>} */
    this.waitingForResponse_ = {};
    /** @const @private {!Window} */
    this.target_ = target;
    /** @const @private {string} */
    this.targetOrigin_ = targetOrigin;
    /**  @private {function(string, *, boolean):(!Promise<*>|undefined)} */
    this.requestProcessor_ = null;

    dev().assert(this.targetOrigin_, 'Target origin must be specified!');

    listen(source, 'message', this.handleMessage_.bind(this));
  }

  /**
   * Bob sent me a message. I need to decide if it's a new request or
   * a response to a previous 'conversation' we were having.
   * @param {?Event} event
   * @private
   */
  handleMessage_(event) {
    if (!event || event.source != this.target_ ||
      event.origin != this.targetOrigin_) {
      return;
    }
    const message = event.data;
    if (message.app != SENTINEL) {
      return;
    }
    if (message.type == MessageType_.REQUEST) {
      this.handleRequest_(message);
    } else if (message.type == MessageType_.RESPONSE) {
      this.handleResponse_(message);
    }
  }

  /**
   * I'm sending Bob a new outgoing request.
   * @param {string} eventType
   * @param {*} payload
   * @param {boolean} awaitResponse
   * @return {!Promise<*>|undefined}
   */
  sendRequest(eventType, payload, awaitResponse) {
    dev().info(TAG, 'messaging.js -> sendRequest, eventType: ', eventType);
    const requestId = ++this.requestIdCounter_;
    let promise = undefined;
    if (awaitResponse) {
      promise = new Promise((resolve, reject) => {
        this.waitingForResponse_[requestId] = {resolve, reject};
      });
    }
    const message = {
      app: SENTINEL,
      requestid: requestId,
      rsvp: awaitResponse,
      name: eventType,
      data: payload,
      type: MessageType_.REQUEST,
    };
    this.sendMessage_(message);
    return promise;
  }

  /**
   * I'm responding to a request that Bob made earlier.
   * @param {number} requestId
   * @param {*} payload
   * @private
   */
  sendResponse_(requestId, payload) {
    dev().info(TAG, 'messaging.js -> sendResponse_');
    const message = {
      app: SENTINEL,
      requestid: requestId,
      data: payload,
      type: MessageType_.RESPONSE,
    };
    this.sendMessage_(message);
  }

  /**
   * @private
   */
  sendMessage_(message) {
    this.target_./*OK*/postMessage(message, this.targetOrigin_);
  }

  /**
   * @param {number} requestId
   * @param {*} reason
   * @private
   */
  sendResponseError_(requestId, reason) {
    const message = {
      app: SENTINEL,
      requestid: requestId,
      error: reason,
      type: MessageType_.RESPONSE,
    };
    this.sendMessage_(message);
  }

  /**
   * I'm handing an incoming request from Bob. I'll either respond normally
   * (ex: "got it Bob!") or with an error (ex: "I didn't get a word of what
   * you said!").
   * @param {*} message
   * @private
   */
  handleRequest_(message) {
    dev().info(TAG, 'messaging.js -> handleRequest_');
    dev().assert(this.requestProcessor_,
      'Cannot handle request because handshake is not yet confirmed!');
    const requestId = message.requestid;
    const promise =
      this.requestProcessor_(message.name, message.data, message.rsvp);
    if (message.rsvp) {
      if (!promise) {
        this.sendResponseError_(requestId, 'no response');
        dev().assert(promise,
          'expected response but none given: ' + message.name);
      }
      promise.then(payload => {
        this.sendResponse_(requestId, payload);
      }, reason => {
        this.sendResponseError_(requestId, reason);
      });
    }
  }

  /**
   * I sent out a request to Bob. He responded. And now I'm handling that
   * response.
   * @param {*} message
   * @private
   */
  handleResponse_(message) {
    dev().info(TAG, 'messaging.js -> handleResponse_');
    const requestId = message.requestid;
    const pending = this.waitingForResponse_[requestId];
    if (pending) {
      delete this.waitingForResponse_[requestId];
      if (message.error) {
        pending.reject(message.error);
      } else {
        pending.resolve(message.data);
      }
    }
  }

  /**
   * @param {function(string, *, boolean):(!Promise<*>|undefined)}
   *    requestProcessor
   */
  setRequestProcessor(requestProcessor) {
    dev().info(TAG, 'setRequestProcessor');
    this.requestProcessor_ = requestProcessor;
  }
}
