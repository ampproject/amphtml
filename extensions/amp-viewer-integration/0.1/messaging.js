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


export class Messaging {
    /**
     * Messaging protocol between viewer and viewer client.
     * @param {!Window} target
     * @param {string} targetOrigin
     * @param {function(string, *, boolean):(!Promise<*>|undefined)}
     *    requestProcessor
     * @param {string=} opt_targetId
     * @constructor
     */
    constructor(target, targetOrigin, requestProcessor, opt_targetId) {
      this.sentinel_ = '__AMP__';
      this.requestSentinel_ = this.sentinel_ + 'REQUEST';
      this.responseSentinel_ = this.sentinel_ + 'RESPONSE';

      this.requestIdCounter_ = 0;
      this.waitingForResponse_ = {};

      /** @const @private {!Window} */
      this.target_ = target;
      /** @const @private {string|undefined} */
      this.targetId_ = opt_targetId;
      /** @const @private {string} */
      this.targetOrigin_ = targetOrigin;
      /** @const @private {function(string, *, boolean):(!Promise<*>|undefined)} */
      this.requestProcessor_ = requestProcessor;

      if (!this.targetOrigin_) {
        throw new Error('Target origin must be specified');
      }

      listen(this.target_, 'message', this.onMessage_.bind(this));
    }
}


/**
 * @param {!Event} event
 * @private
 */
Messaging.prototype.onMessage_ = function(event) {
  if (event.source != this.target_ || event.origin != this.targetOrigin_) {
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
 * @param {*} message
 * @private
 */
Messaging.prototype.onRequest_ = function(message) {
  //TODO: Remove console.log before merge to prod.
  console.log('here @ messaging.js -> onRequest_');
  const requestId = message.requestId;
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
Messaging.prototype.onResponse_ = function(message) {
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
 * @param {string} eventType
 * @param {*} payload
 * @param {boolean} awaitResponse
 * @return {!Promise<*>|undefined}
 */
Messaging.prototype.sendRequest = function(eventType, payload,
    awaitResponse) {
  //TODO: Remove console.log before merge to prod.
  console.log('here @ messaging.js -> sendRequest');
  const requestId = ++this.requestIdCounter_;
  if (awaitResponse) {
    const promise = new Promise(function(resolve, reject) {
      this.waitingForResponse_[requestId] = {resolve, reject};
    }.bind(this));
    this.sendMessage_(this.requestSentinel_, requestId, eventType, payload,
        true);
    return promise;
  }
  this.sendMessage_(this.requestSentinel_, requestId, eventType, payload,
      false);
  return undefined;
};


/**
 * @param {number} requestId
 * @param {*} payload
 * @private
 */
Messaging.prototype.sendResponse_ = function(requestId, payload) {
  //TODO: Remove console.log before merge to prod.
  console.log('here @ messaging.js -> sendResponse_');
  this.sendMessage_(this.responseSentinel_, requestId, null, payload, false);
};


/**
 * @param {string} sentinel
 * @param {string} requestId
 * @param {string} eventType
 * @param {*} payload
 * @param {boolean} awaitResponse
 * @private
 */
Messaging.prototype.sendMessage_ = function(sentinel, requestId,
      eventType, payload, awaitResponse) {
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
Messaging.prototype.sendResponseError_ = function(requestId, reason) {
  this.sendMessage_(this.responseSentinel_, requestId, 'ERROR', reason, false);
};
