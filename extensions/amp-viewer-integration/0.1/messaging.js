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


import {MessagingErrorLogger} from './messaging-error-logger.js';
import {listen} from '../../../src/event-helper';
import {dev} from '../../../src/log';

const TAG = 'amp-viewer-messaging';
const APP = '__AMPHTML__';

/**
 * @enum {string}
 * @private
 */
const MessageType_ = {
  REQUEST: 'q',
  RESPONSE: 's',
};

/**
 * @typedef {{
 *   app: !string,
 *   type: !string,
 *   requestid: !number,
 *   name: !string,
 *   data: *,
 *   rsvp: ?boolean,
 *   error: *
 * }}
 */
export let Message;

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
    /**  @private {!Object<number, {resolve: function(*), reject: function(!Error)}>} */
    this.waitingForResponse_ = {};
    /** @const @private {!Window} */
    this.target_ = target;
    /** @const @private {string} */
    this.targetOrigin_ = targetOrigin;
    /**  @private {?function(string, *, boolean):(!Promise<*>|undefined)} */
    this.requestProcessor_ = null;
    /** @private {?MessagingErrorLogger} */
    this.errorLogger_ = null;

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
      this.logError_(TAG +
        ': handleMessage_ failed. This message is not for us: ', event);
      return;
    }
    /** @type {Message} */
    const message = event.data;
    if (message.app != APP) {
      this.logError_(
        TAG + ': handleMessage_ failed, wrong APP: ', event);
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
   * @param {*} data
   * @param {boolean} awaitResponse
   * @return {!Promise<*>|undefined}
   */
  sendRequest(eventType, data, awaitResponse) {
    dev().info(TAG, 'sendRequest, eventType: ', eventType);
    const requestId = ++this.requestIdCounter_;
    let promise = undefined;
    if (awaitResponse) {
      promise = new Promise((resolve, reject) => {
        this.waitingForResponse_[requestId] = {resolve, reject};
      });
    }
    this.sendMessage_(requestId, MessageType_.REQUEST, eventType, data,
      awaitResponse, null);
    return promise;
  }

  /**
   * I'm responding to a request that Bob made earlier.
   * @param {number} requestId
   * @param {string} name
   * @param {*} data
   * @private
   */
  sendResponse_(requestId, name, data) {
    dev().info(TAG, 'sendResponse_');
    this.sendMessage_(
      requestId, MessageType_.RESPONSE, name, data, null, null);
  }

  /**
   * @param {number} mId
   * @param {string} mType
   * @param {string} mName
   * @param {*} mData
   * @param {?boolean} mRsvp
   * @param {*} mErr
   * @private
   */
  sendMessage_(mId, mType, mName, mData, mRsvp, mErr) {
    /** @type {Message} */
    const message = {
      app: APP,
      requestid: mId,
      type: mType,
      name: mName,
      data: mData,
      rsvp: mRsvp,
      error: mErr,
    };
    this.target_./*OK*/postMessage(message, this.targetOrigin_);
  }

  /**
   * @param {number} requestId
   * @param {string} name
   * @param {*} reason
   * @private
   */
  sendResponseError_(requestId, name, reason) {
    this.logError_(
      TAG + ': sendResponseError_, Message name: ' + name, reason);
    this.sendMessage_(
      requestId, MessageType_.RESPONSE, name, null, null, reason);
  }

  /**
   * I'm handing an incoming request from Bob. I'll either respond normally
   * (ex: "got it Bob!") or with an error (ex: "I didn't get a word of what
   * you said!").
   * @param {Message} message
   * @private
   */
  handleRequest_(message) {
    dev().info(TAG, 'handleRequest_', message);
    dev().assert(this.requestProcessor_,
      'Cannot handle request because handshake is not yet confirmed!');
    const requestId = message.requestid;
    const msg = dev().assertString(message.name);
    if (message.rsvp) {
      const promise =
        this.requestProcessor_(msg, message.data, message.rsvp);
      if (!promise) {
        this.sendResponseError_(requestId, msg, 'no response');
        dev().assert(promise,
          'expected response but none given: ' + message.name);
      }
      promise.then(data => {
        this.sendResponse_(requestId, msg, data);
      }, reason => {
        this.sendResponseError_(requestId, msg, reason);
      });
    }
  }

  /**
   * I sent out a request to Bob. He responded. And now I'm handling that
   * response.
   * @param {Message} message
   * @private
   */
  handleResponse_(message) {
    dev().info(TAG, 'handleResponse_');
    const requestId = message.requestid;
    const pending = this.waitingForResponse_[requestId];
    if (pending) {
      delete this.waitingForResponse_[requestId];
      if (message.error) {
        this.logError_(TAG + ': handleResponse_ error: ', message.error);
        pending.reject(/** @type {!Error} */ (message.error));
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

  /**
   * @param {MessagingErrorLogger} errorLogger
   */
  setErrorLogger(errorLogger) {
    this.errorLogger_ = errorLogger;
  }

  /**
   * @param {string} msg
   * @param {?Object} opt_data
   */
  logError_(msg, opt_data) {
    if (this.errorLogger_) {
      this.errorLogger_.logError(msg, opt_data);
    }
  }
}
