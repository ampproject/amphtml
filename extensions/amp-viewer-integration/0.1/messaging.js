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


/**
 * @fileoverview This is the communication protocol between AMP and the viewer.
 * It is used in the amp-viewer-integration.js file.
 */
export class Messaging {
  /**
   * Messaging protocol between viewer and viewer client.
   * @param {!Window} target
   * @param {string} targetOrigin
   * @param {function(string, *, boolean):(!Promise<*>|undefined)}
   *    requestProcessor
   */
  constructor(target, targetOrigin, requestProcessor) {
    this.sentinel_ = '__AMP__';
    this.requestSentinel_ = this.sentinel_ + 'REQUEST';
    this.responseSentinel_ = this.sentinel_ + 'RESPONSE';

    this.requestIdCounter_ = 0;
    this.waitingForResponse_ = {};

    /** @const @private {!Window} */
    this.target_ = target;
    /** @const @private {string} */
    this.targetOrigin_ = targetOrigin;
    /** @const @private {function(string, *, boolean):(!Promise<*>|undefined)} */
    this.requestProcessor_ = requestProcessor;

    dev().assert(this.targetOrigin_, 'Target origin must be specified!');

    listen(this.target_, 'message', (this.onMessage_.bind(this)));
  }


  /**
   * @param {Event|null} event
   * @private
   */
  onMessage_(event) {
    if (!event || event.source != this.target_ ||
      event.origin != this.targetOrigin_) {
      return;
    }
    const message = event.data;
    if (message.sentinel == this.requestSentinel_) {
      this.onRequest_(message);
    } else if (message.sentinel == this.responseSentinel_) {
      this.onResponse_(message);
    }
  };


  /**
   * @param {string} eventType
   * @param {*} payload
   * @param {boolean} awaitResponse
   */
  sendRequest(eventType, payload, awaitResponse) {
    //TODO: Remove console.log before merge to prod.
    console.log('here @ messaging.js -> sendRequest');
    const requestId = (++this.requestIdCounter_).toString();
    if (awaitResponse) {
      new Promise(function(resolve, reject) {
        this.waitingForResponse_[requestId] = {resolve, reject};
      }.bind(this));
    }
    this.sendMessage_(this.requestSentinel_, requestId, eventType, payload,
        awaitResponse);
  };


  /**
   * @param {*} message
   * @private
   */
  onRequest_(message) {
    //TODO: Remove console.log before merge to prod.
    console.log('here @ messaging.js -> onRequest_');
    const requestId = message.requestId.toString();
    const promise = this.requestProcessor_(message.type, message.payload,
        message.rsvp);
    if (message.rsvp) {
      if (!promise) {
        this.sendResponseError_(requestId, 'no response');
        throw new Error('expected response but none given: ' + message.type);
      }
      promise.then(function(payload) {
        this.sendResponse_(requestId, payload);
      }.bind(this), function(reason) {
        this.sendResponseError_(requestId, reason);
      }.bind(this));
    }
  };


  /**
   * @param {*} message
   * @private
   */
  onResponse_(message) {
    //TODO: Remove console.log before merge to prod.
    console.log('here @ messaging.js -> onResponse_');
    const requestId = message.requestId;
    const pending = this.waitingForResponse_[requestId];
    if (pending) {
      delete this.waitingForResponse_[requestId];
      if (message.type == 'ERROR') {
        pending.reject(message.payload);
      } else {
        pending.resolve(message.payload);
      }
    }
  };


  /**
   * @param {number} requestId
   * @param {*} payload
   * @private
   */
  sendResponse_(requestId, payload) {
    //TODO: Remove console.log before merge to prod.
    console.log('here @ messaging.js -> sendResponse_');
    this.sendMessage_(
      this.responseSentinel_, requestId.toString(), null, payload, false);
  };


  /**
   * @param {string} sentinel
   * @param {string} requestId
   * @param {string|null} eventType
   * @param {*} payload
   * @param {boolean} awaitResponse
   * @private
   */
  sendMessage_(sentinel, requestId, eventType, payload, awaitResponse) {
    const message = {
      sentinel,
      requestId,
      type: eventType,
      payload,
      rsvp: awaitResponse,
    };
    this.target_./*OK*/postMessage(message, this.targetOrigin_);
  };


  /**
   * @param {number} requestId
   * @param {*} reason
   * @private
   */
  sendResponseError_(requestId, reason) {
    this.sendMessage_(
      this.responseSentinel_, requestId.toString(), 'ERROR', reason, false);
  };
}
