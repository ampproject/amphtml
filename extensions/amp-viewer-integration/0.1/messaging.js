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


import {listen} from '../../../src/event-helper';
import {dev} from '../../../src/log';

const TAG = 'amp-viewer-messaging';
const APP = '__AMPHTML__';

/**
 * @enum {string}
 */
const MessageType = {
  REQUEST: 'q',
  RESPONSE: 's',
};

/**
 * @typedef {{
 *   app: string,
 *   type: string,
 *   requestid: number,
 *   name: string,
 *   data: *,
 *   rsvp: (boolean|undefined),
 *   error: (string|undefined),
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
    /** @private {!Window} */
    this.source_ = source;
    /** @private {!number} */
    this.requestIdCounter_ = 0;
    /** @private {!Object<number, {resolve: function(*), reject: function(!Error)}>} */
    this.waitingForResponse_ = {};
    /** @const @private {!Window} */
    this.target_ = target;
    /** @const @private {string} */
    this.targetOrigin_ = targetOrigin;
    /**  @private {?function(string, *, boolean):(!Promise<*>|undefined)} */
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
      dev().fine(TAG +
        ': handleMessage_, This message is not for us: ', event);
      return;
    }
    /** @type {Message} */
    const message = event.data;
    if (message.app != APP) {
      dev().fine(
        TAG + ': handleMessage_, wrong APP: ', event);
      return;
    }
    if (message.type == MessageType.REQUEST) {
      this.handleRequest_(message);
    } else if (message.type == MessageType.RESPONSE) {
      this.handleResponse_(message);
    }
  }

  /**
   * I'm sending Bob a new outgoing request.
   * @param {string} messageName
   * @param {*} messageData
   * @param {boolean} awaitResponse
   * @return {!Promise<*>|undefined}
   */
  sendRequest(messageName, messageData, awaitResponse) {
    dev().fine(TAG, 'sendRequest, event name: ', messageName);
    const requestId = ++this.requestIdCounter_;
    let promise = undefined;
    if (awaitResponse) {
      promise = new Promise((resolve, reject) => {
        this.waitingForResponse_[requestId] = {resolve, reject};
      });
    }
    this.sendMessage_({
      app: APP,
      requestid: requestId,
      type: MessageType.REQUEST,
      name: messageName,
      data: messageData,
      rsvp: awaitResponse,
    });
    return promise;
  }

  /**
   * I'm responding to a request that Bob made earlier.
   * @param {number} requestId
   * @param {string} messageName
   * @param {*} messageData
   * @private
   */
  sendResponse_(requestId, messageName, messageData) {
    dev().fine(TAG, 'sendResponse_');
    this.sendMessage_({
      app: APP,
      requestid: requestId,
      type: MessageType.RESPONSE,
      name: messageName,
      data: messageData,
    });
  }

  /**
   * @param {number} requestId
   * @param {string} messageName
   * @param {*} reason !Error most of time, string sometimes, * rarely.
   * @private
   */
  sendResponseError_(requestId, messageName, reason) {
    const errString = this.errorToString_(reason);
    this.logError_(
      TAG + ': sendResponseError_, Message name: ' + messageName, errString);
    this.sendMessage_({
      app: APP,
      requestid: requestId,
      type: MessageType.RESPONSE,
      name: messageName,
      data: null,
      error: errString,
    });
  }

  /**
   * @param {Message} message
   * @private
   */
  sendMessage_(message) {
    this.target_./*OK*/postMessage(message, this.targetOrigin_);
  }

  /**
   * I'm handing an incoming request from Bob. I'll either respond normally
   * (ex: "got it Bob!") or with an error (ex: "I didn't get a word of what
   * you said!").
   * @param {Message} message
   * @private
   */
  handleRequest_(message) {
    dev().fine(TAG, 'handleRequest_', message);
    if (!this.requestProcessor_) {
      throw new Error(
        'Cannot handle request because handshake is not yet confirmed!');
    }
    const requestId = message.requestid;
    if (message.rsvp) {
      const promise =
        this.requestProcessor_(message.name, message.data, message.rsvp);
      if (!promise) {
        this.sendResponseError_(
          requestId, message.name, new Error('no response'));
        dev().assert(promise,
          'expected response but none given: ' + message.name);
      }
      promise.then(data => {
        this.sendResponse_(requestId, message.name, data);
      }, reason => {
        this.sendResponseError_(requestId, message.name, reason);
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
    dev().fine(TAG, 'handleResponse_');
    const requestId = message.requestid;
    const pending = this.waitingForResponse_[requestId];
    if (pending) {
      delete this.waitingForResponse_[requestId];
      if (message.error) {
        this.logError_(TAG + ': handleResponse_ error: ', message.error);
        pending.reject(new Error(message.error));
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
    this.requestProcessor_ = requestProcessor;
  }

  /**
   * @param {string} state
   * @param {!Error|string} opt_data
   * @private
   */
  logError_(state, opt_data) {
    let stateStr = 'amp-messaging-error-logger: ' + state;
    const dataStr = ' data: ' + this.errorToString_(opt_data);
    stateStr += dataStr;
    this.source_['viewerState'] = stateStr;
  };

  /**
   * @param {*} err !Error most of time, string sometimes, * rarely.
   * @return {string}
   * @private
   */
  errorToString_(err) {
    return err ?
      (err.message ? err.message : String(err)) :
      'unknown error';
  }
}
