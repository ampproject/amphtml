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


/**
 * This is a very simple messaging protocol between viewer and viewer client.
 * @param {function(string, *):!Promise<*>} requestProcessor
 * @constructor
 */
function ViewerMessaging(target, requestProcessor) {
  this.sentinel_ = '__AMP__';
  this.requestSentinel_ = this.sentinel_ + 'REQUEST';
  this.responseSentinel_ = this.sentinel_ + 'RESPONSE';

  this.requestIdCounter_ = 0;
  this.waitingForResponse_ = {};

  this.target_ = target;
  this.requestProcessor_ = requestProcessor;

  window.addEventListener('message', this.onMessage_.bind(this), false);
};


/**
 * @param {string} eventType
 * @param {*} payload
 * @param {!Promise<*>}
 */
ViewerMessaging.prototype.sendRequest = function(eventType, payload) {
  var requestId = ++this.requestIdCounter_;
  var promise = new Promise(function(resolve, reject) {
    this.waitingForResponse_[requestId] = {resolve: resolve, reject: reject};
  }.bind(this));
  this.sendMessage_(this.requestSentinel_, requestId, eventType, payload);
  return promise;
};


/**
 * @param {!Event} event
 */
ViewerMessaging.prototype.onMessage_ = function(event) {
  // TODO: must check for origin/target.
  var message = event.data;
  if (message.sentinel == this.requestSentinel_) {
    this.onRequest_(message);
  } else if (message.sentinel == this.responseSentinel_) {
    this.onResponse_(message);
  }
};


/**
 * @param {*} message
 */
ViewerMessaging.prototype.onRequest_ = function(message) {
  var requestId = message.requestId;
  var promise = this.requestProcessor_(message.type, message.payload);
  promise.then(function(payload) {
    this.sendResponse_(requestId, payload);
  }.bind(this), function(reason) {
    this.sendResponseError_(requestId, reason);
  }.bind(this));
};


/**
 * @param {*} message
 */
ViewerMessaging.prototype.onResponse_ = function(message) {
  var requestId = message.requestId;
  var pending = this.waitingForResponse_[requestId];
  delete this.waitingForResponse_[requestId];
  if (pending) {
    if (message.type == 'ERROR') {
      pending.reject(message.payload);
    } else {
      pending.resolve(message.payload);
    }
  }
};


/**
 * @param {string} sentinel
 * @param {string} eventType
 * @param {*} payload
 */
ViewerMessaging.prototype.sendMessage_ = function(sentinel, requestId,
      eventType, payload) {
  // TODO: must check for origin/target.
  var message = {
    sentinel: sentinel,
    requestId: requestId,
    type: eventType,
    payload: payload
  };
  this.target_.postMessage(message, '*');
};


/**
 * @param {number} requestId
 * @param {*} payload
 */
ViewerMessaging.prototype.sendResponse_ = function(requestId, payload) {
  this.sendMessage_(this.responseSentinel_, requestId, null, payload);
};


/**
 * @param {number} requestId
 * @param {*} reason
 */
ViewerMessaging.prototype.sendResponseError_ = function(requestId, reason) {
  this.sendMessage_(this.responseSentinel_, requestId, 'ERROR', reason);
};


/**
 * Super crude way to share ViewerMessaging class without any kind of module
 * system or packaging.
 */
if (window['__AMP_VIEWER_MESSAGING_CALLBACK']) {
  window['__AMP_VIEWER_MESSAGING_CALLBACK'](ViewerMessaging);
}
