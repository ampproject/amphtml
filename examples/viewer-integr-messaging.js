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
 * @enum {string}
 */
var MessageType = {
  REQUEST: 'q',
  RESPONSE: 's',
};

var APP = '__AMPHTML__';

/**
 * @fileoverview This class is a de-facto implementation of MessagePort
 * from Channel Messaging API:
 * https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API
 */
class WindowPortEmulator {
  constructor(messageHandlers, id, port) {
    this.messageHandlers_ = messageHandlers;
    this.id_ = id;
    this.port_ = port;
  }
  addEventListener(messageType, messageHandler) {
    console.log('messageHandler', messageHandler);
    this.messageHandlers_[this.id_] = messageHandler;
  }
  postMessage(data) {
    console.log('############## viewer posting Message', data);
    this.port_./*OK*/postMessage(data);
  }
  start() {}
}

/**
 * This is a very simple messaging protocol between viewer and viewer client.
 * @param {!Window} target
 * @param {string} targetOrigin
 * @param {function(string, *, boolean):(!Promise<*>|undefined)}
 *    requestProcessor
 * @param {string=} opt_targetId
 * @param {WindowPortEmulator} opt_port
 * @param {boolean} opt_isWebview
 * @constructor
 */
function ViewerMessaging(target, targetOrigin, requestProcessor, opt_targetId, opt_port, opt_isWebview) {
  this.requestIdCounter_ = 0;
  this.waitingForResponse_ = {};

  /** @private {!Widnow} */
  this.target_ = target;
  /** @private {string|undefined} */
  this.targetId_ = opt_targetId;
  /** @private {string} */
  this.targetOrigin_ = targetOrigin;
  /** @private {function(string, *, boolean):(!Promise<*>|undefined)} */
  this.requestProcessor_ = requestProcessor;
  /** @private {WindowPortEmulator} */
  this.port_ = opt_port;
  /** @private {boolean} */
  this.isWebview_ = !!opt_isWebview;

  if (this.targetOrigin_ == null) {
    throw new Error('Target origin must be specified');
  }

  if (this.port_) {
    this.port_.addEventListener('message', this.onMessage_.bind(this));
    this.port_.start();
  } else {
    window.addEventListener('message', this.onMessage_.bind(this), false);
  }
}


/**
 * @param {string} eventType
 * @param {*} payload
 * @param {boolean} awaitResponse
 * @return {!Promise<*>|undefined}
 */
ViewerMessaging.prototype.sendRequest = function(eventType, payload,
    awaitResponse) {
  var requestId = ++this.requestIdCounter_;
  if (awaitResponse) {
    var promise = new Promise(function(resolve, reject) {
      this.waitingForResponse_[requestId] = {resolve, reject};
    }.bind(this));
    var message = {
      app: APP,
      requestid: requestId,
      rsvp: true,
      name: eventType,
      data: payload,
      type: MessageType.REQUEST,
    };
    this.sendMessage_(message);
    return promise;
  }
  var message = {
    app: APP,
    requestid: requestId,
    name: eventType,
    data: payload,
    type: MessageType.REQUEST,
  };
  this.sendMessage_(message);
  return undefined;
};


/**
 * @param {!Event} event
 * @private
 */
ViewerMessaging.prototype.onMessage_ = function(event) {
  var message = this.isWebview_ ? JSON.parse(event.data) : event.data;
  if (!message || message.app != APP) {
    return;
  }
  if (message.type == MessageType.REQUEST) {
    this.onRequest_(message);
  }
  if (message.type == MessageType.RESPONSE) {
    this.onResponse_(message);
  }
};


/**
 * @param {*} message
 * @private
 */
ViewerMessaging.prototype.onRequest_ = function(message) {
  var requestId = message.requestid;
  var promise = this.requestProcessor_(message.name, message.data,
      message.rsvp);
  if (message.rsvp) {
    if (!promise) {
      this.sendResponseError_(requestId, 'no response');
      throw new Error('expected response but none given: ' + message.name);
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
ViewerMessaging.prototype.onResponse_ = function(message) {
  var requestId = message.requestid;
  var pending = this.waitingForResponse_[requestId];
  if (pending) {
    delete this.waitingForResponse_[requestId];
    if (message.error) {
      pending.reject(message.error);
    } else {
      pending.resolve(message.data);
    }
  }
};


/**
 * @param {*} message
 * @private
 */
ViewerMessaging.prototype.sendMessage_ = function(message) {
  if (this.isWebview_) {
    message = JSON.stringify(message);
  }
  if (this.targetOrigin_) {
    this.target_./*OK*/postMessage(message, this.targetOrigin_);
  } else {
    this.port_./*OK*/postMessage(message);
  }
};


/**
 * @param {number} requestId
 * @param {*} payload
 * @private
 */
ViewerMessaging.prototype.sendResponse_ = function(requestId, payload) {
  var message = {
    app: APP,
    requestid: requestId,
    data: payload,
    type: MessageType.RESPONSE,
  };
  this.sendMessage_(message);
};


/**
 * @param {number} requestId
 * @param {*} reason
 * @private
 */
ViewerMessaging.prototype.sendResponseError_ = function(requestId, reason) {
  var message = {
    app: APP,
    requestid: requestId,
    error: reason,
    type: MessageType.RESPONSE,
  };
  this.sendMessage_(message);
};


/**
 * Super crude way to share ViewerMessaging class without any kind of module
 * system or packaging.
 */
if (window['__AMP_VIEWER_MESSAGING_CALLBACK']) {
  window['__AMP_VIEWER_MESSAGING_CALLBACK'](ViewerMessaging);
}
