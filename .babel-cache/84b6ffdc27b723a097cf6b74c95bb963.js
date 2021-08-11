function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
var TAG = 'amp-viewer-messaging';
var CHANNEL_OPEN_MSG = 'channelOpen';
var HANDSHAKE_POLL_MSG = 'handshake-poll';
var APP = '__AMPHTML__';

/**
 * @enum {string}
 */
var MessageType = {
  REQUEST: 'q',
  RESPONSE: 's'
};

/**
 * @typedef {function(string, *, boolean):(!Promise<*>|undefined)}
 */
var RequestHandler;
// eslint-disable-line no-unused-vars

/**
 * @param {*} message
 * @return {?AmpViewerMessage}
 */
export function parseMessage(message) {
  if (typeof message != 'string') {
    return (
      /** @type {AmpViewerMessage} */
      message
    );
  }

  if (message.charAt(0) != '{') {
    return null;
  }

  try {
    return (
      /** @type {?AmpViewerMessage} */
      JSON.parse(
      /** @type {string} */
      message)
    );
  } catch (e) {
    return null;
  }
}

/**
 * @fileoverview This class is a de-facto implementation of MessagePort
 * from Channel Messaging API:
 * https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API
 */
export var WindowPortEmulator = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {string} origin
   * @param {!Window} target
   */
  function WindowPortEmulator(win, origin, target) {
    _classCallCheck(this, WindowPortEmulator);

    /** @const @private {!Window} */
    this.win_ = win;

    /** @const @private {string} */
    this.origin_ = origin;

    /** @const @private {!Window} */
    this.target_ = target;
  }

  /**
   * @param {string} eventType
   * @param {function(!Event):*} handler
   */
  _createClass(WindowPortEmulator, [{
    key: "addEventListener",
    value: function addEventListener(eventType, handler) {
      var _this = this;

      this.win_.addEventListener('message', function (event) {
        if (event.origin == _this.origin_ && event.source == _this.target_) {
          handler(event);
        }
      });
    }
    /**
     * @param {JsonObject} data
     */

  }, {
    key: "postMessage",
    value: function postMessage(data) {
      // Opaque (null) origin can only receive messages sent to "*"
      var targetOrigin = this.origin_ === 'null' ? '*' : this.origin_;
      this.target_.
      /*OK*/
      postMessage(data, targetOrigin);
    }
    /**
     * Starts the sending of messages queued on the port.
     */

  }, {
    key: "start",
    value: function start() {}
  }]);

  return WindowPortEmulator;
}();

/**
 * @fileoverview This is used in amp-viewer-integration.js for the
 * communication protocol between AMP and the viewer. In the comments, I will
 * refer to the communication as a conversation between me and Bob. The
 * messaging protocol should support both sides, but at this point I'm the
 * ampdoc and Bob is the viewer.
 */
export var Messaging = /*#__PURE__*/function () {
  /**
   * Conversation (messaging protocol) between me and Bob.
   * @param {?Window} win
   * @param {!MessagePort|!WindowPortEmulator} port
   * @param {boolean=} opt_isWebview
   * @param {?string=} opt_token
   * @param {boolean=} opt_verifyToken
   */
  function Messaging(win, port, opt_isWebview, opt_token, opt_verifyToken) {
    _classCallCheck(this, Messaging);

    /** @const @private {?Window} */
    this.win_ = win;

    /** @const @private {!MessagePort|!WindowPortEmulator} */
    this.port_ = port;

    /** @const @private {boolean} */
    this.isWebview_ = !!opt_isWebview;

    /**
     * A token that the viewer may include as an init parameter to enhance
     * security for communication to opaque origin (a.k.a. null origin) AMP
     * documents.
     *
     * For an AMP document embedded inside a sandbox iframe, the origin of the
     * document would be "null", which defeats the purpose of an origin check.
     * An attacker could simply create a sandboxed, malicious iframe (therefore
     * having null origin), walk on the DOM frame tree to find a reference to
     * the viewer iframe (this is not constrained by the same origin policy),
     * and then send postMessage() calls to the viewer frame and pass the
     * viewer's origin checks, if any.
     *
     * The viewer could also check the source of the message to be a legitimate
     * AMP iframe window, but the attacker could bypass that by navigating the
     * legitimate AMP iframe window away to a malicious document. Recent
     * browsers have banned this kind of attack, but it's tricky to rely on it.
     *
     * To prevent the above attack in a null origin AMP document, the viewer
     * should include this token in an init parameter, either in the `src` or
     * `name` attribute of the iframe, and then verify that this token is
     * included in all the messages sent from AMP to the viewer. The attacker
     * would not be able to steal this token under the same origin policy,
     * because the token is inside the viewer document at a different origin
     * and the attacker can't access it.
     * @const @private {?string}
     */
    this.token_ = opt_token || null;

    /**
     * If true, the token above is verified on incoming messages instead of
     * being attached to outgoing messages.
     * @const @private {boolean}
     */
    this.verifyToken_ = !!opt_verifyToken;

    /** @private {number} */
    this.requestIdCounter_ = 0;

    /** @private {!Object<number, {resolve: function(*), reject: function(!Error)}>} */
    this.waitingForResponse_ = {};

    /**
     * A map from message names to request handlers.
     * @private {!Object<string, !RequestHandler>}
     */
    this.messageHandlers_ = {};

    /** @private {?RequestHandler} */
    this.defaultHandler_ = null;
    this.port_.addEventListener('message', this.handleMessage_.bind(this));
    this.port_.start();
  }

  /**
   * Registers a method that will handle requests sent to the specified
   * message name.
   * @param {string} messageName The name of the message to handle.
   * @param {!RequestHandler} requestHandler
   */
  _createClass(Messaging, [{
    key: "registerHandler",
    value: function registerHandler(messageName, requestHandler) {
      this.messageHandlers_[messageName] = requestHandler;
    }
    /**
     * Unregisters the handler for the specified message name.
     * @param {string} messageName The name of the message to unregister.
     */

  }, {
    key: "unregisterHandler",
    value: function unregisterHandler(messageName) {
      delete this.messageHandlers_[messageName];
    }
    /**
     * @param {?RequestHandler} requestHandler
     */

  }, {
    key: "setDefaultHandler",
    value: function setDefaultHandler(requestHandler) {
      this.defaultHandler_ = requestHandler;
    }
    /**
     * Bob sent me a message. I need to decide if it's a new request or
     * a response to a previous 'conversation' we were having.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "handleMessage_",
    value: function handleMessage_(event) {
      var message = parseMessage(event.data);

      if (!message || message.app !== APP) {
        return;
      }

      if (this.token_ && this.verifyToken_ && message.messagingToken !== this.token_) {
        // We received a message with an invalid token - dismiss it.
        this.logError_(TAG + ': handleMessage_ error: ', 'invalid token');
        return;
      }

      if (message.type === MessageType.REQUEST) {
        this.handleRequest_(message);
      } else if (message.type === MessageType.RESPONSE) {
        this.handleResponse_(message);
      }
    }
    /**
     * I'm sending Bob a new outgoing request.
     * @param {string} messageName
     * @param {?JsonObject|string|undefined} messageData
     * @param {boolean} awaitResponse
     * @return {!Promise<*>|undefined}
     */

  }, {
    key: "sendRequest",
    value: function sendRequest(messageName, messageData, awaitResponse) {
      var _this2 = this;

      var requestId = ++this.requestIdCounter_;
      var promise = undefined;

      if (awaitResponse) {
        promise = new Promise(function (resolve, reject) {
          _this2.waitingForResponse_[requestId] = {
            resolve: resolve,
            reject: reject
          };
        });
      }

      this.sendMessage_(
      /** @type {!AmpViewerMessage} */
      {
        app: APP,
        requestid: requestId,
        type: MessageType.REQUEST,
        name: messageName,
        data: messageData,
        rsvp: awaitResponse
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

  }, {
    key: "sendResponse_",
    value: function sendResponse_(requestId, messageName, messageData) {
      this.sendMessage_(
      /** @type {!AmpViewerMessage} */
      {
        app: APP,
        requestid: requestId,
        type: MessageType.RESPONSE,
        name: messageName,
        data: messageData
      });
    }
    /**
     * @param {number} requestId
     * @param {string} messageName
     * @param {*} reason !Error most of time, string sometimes, * rarely.
     * @private
     */

  }, {
    key: "sendResponseError_",
    value: function sendResponseError_(requestId, messageName, reason) {
      var errString = this.errorToString_(reason);
      this.logError_(TAG + ': sendResponseError_, message name: ' + messageName, errString);
      this.sendMessage_(
      /** @type {!AmpViewerMessage} */
      {
        app: APP,
        requestid: requestId,
        type: MessageType.RESPONSE,
        name: messageName,
        data: null,
        error: errString
      });
    }
    /**
     * @param {!AmpViewerMessage} message
     * @private
     */

  }, {
    key: "sendMessage_",
    value: function sendMessage_(message) {
      var
      /** Object<string, *> */
      finalMessage = Object.assign(message, {});

      if (this.token_ && !this.verifyToken_) {
        finalMessage.messagingToken = this.token_;
      }

      this.port_.
      /*OK*/
      postMessage(this.isWebview_ ? JSON.stringify(
      /** @type {!JsonObject} */
      finalMessage) : finalMessage);
    }
    /**
     * I'm handling an incoming request from Bob. I'll either respond normally
     * (ex: "got it Bob!") or with an error (ex: "I didn't get a word of what
     * you said!").
     * @param {!AmpViewerMessage} message
     * @private
     */

  }, {
    key: "handleRequest_",
    value: function handleRequest_(message) {
      var _this3 = this;

      var handler = this.messageHandlers_[message.name];

      if (!handler) {
        handler = this.defaultHandler_;
      }

      if (!handler) {
        var error = new Error('Cannot handle request because no default handler is set!');
        error.args = message.name;
        throw error;
      }

      var promise = handler(message.name, message.data, !!message.rsvp);

      if (message.rsvp) {
        var requestId = message.requestid;

        if (!promise) {
          this.sendResponseError_(requestId, message.name, new Error('no response'));
          throw new Error('expected response but none given: ' + message.name);
        }

        promise.then(function (data) {
          _this3.sendResponse_(requestId, message.name, data);
        }, function (reason) {
          _this3.sendResponseError_(requestId, message.name, reason);
        });
      }
    }
    /**
     * I sent out a request to Bob. He responded. And now I'm handling that
     * response.
     * @param {!AmpViewerMessage} message
     * @private
     */

  }, {
    key: "handleResponse_",
    value: function handleResponse_(message) {
      var requestId = message.requestid;
      var pending = this.waitingForResponse_[requestId];

      if (pending) {
        delete this.waitingForResponse_[requestId];

        if (message.error) {
          this.logError_(TAG + ': handleResponse_ error: ', message.error);
          pending.reject(new Error("Request " + message.name + " failed: " + message.error));
        } else {
          pending.resolve(message.data);
        }
      }
    }
    /**
     * @param {string} state
     * @param {!Error|string=} opt_data
     * @private
     */

  }, {
    key: "logError_",
    value: function logError_(state, opt_data) {
      if (!this.win_) {
        return;
      }

      var stateStr = 'amp-messaging-error-logger: ' + state;
      var dataStr = ' data: ' + this.errorToString_(opt_data);
      stateStr += dataStr;
      this.win_['viewerState'] = stateStr;
    }
    /**
     * @param {*} err !Error most of time, string sometimes, * rarely.
     * @return {string}
     * @private
     */

  }, {
    key: "errorToString_",
    value: function errorToString_(err) {
      return err ? err.message ? err.message : String(err) : 'unknown error';
    }
  }], [{
    key: "initiateHandshakeWithDocument",
    value:
    /**
     * Performs a handshake and initializes messaging.
     *
     * Requires the `handshakepoll` viewer capability and the `origin` viewer parameter to be specified.
     * @param {!Window} target - window containing AMP document to perform handshake with
     * @param {?string=} opt_token - message token to verify on incoming messages (must be provided as viewer parameter)
     * @return {!Promise<!Messaging>}
     */
    function initiateHandshakeWithDocument(target, opt_token) {
      return new Promise(function (resolve) {
        var intervalRef = setInterval(function () {
          var channel = new MessageChannel();
          var pollMessage =
          /** @type {JsonObject} */
          {
            app: APP,
            name: HANDSHAKE_POLL_MSG
          };
          target.
          /*OK*/
          postMessage(pollMessage, '*', [channel.port2]);
          var port = channel.port1;

          var listener = function listener(event) {
            var message = parseMessage(event.data);

            if (!message) {
              return;
            }

            if (message.app === APP && message.name === CHANNEL_OPEN_MSG) {
              clearInterval(intervalRef);
              port.removeEventListener('message', listener);
              var messaging = new Messaging(null, port,
              /* opt_isWebview */
              false, opt_token,
              /* opt_verifyToken */
              true);
              messaging.sendResponse_(message.requestid, CHANNEL_OPEN_MSG, null);
              resolve(messaging);
            }
          };

          port.addEventListener('message', listener);
          port.start();
        }, 1000);
      });
    }
    /**
     * Waits for handshake from iframe and initializes messaging.
     *
     * Requires the `origin` viewer parameter to be specified.
     * @param {!Window} source - the source window containing the viewer
     * @param {!Window} target - window containing AMP document to perform handshake with (usually contentWindow of iframe)
     * @param {string} origin - origin of target window (use "null" if opaque)
     * @param {?string=} opt_token - message token to verify on incoming messages (must be provided as viewer parameter)
     * @param {?RegExp=} opt_cdnProxyRegex
     * @return {!Promise<!Messaging>}
     */

  }, {
    key: "waitForHandshakeFromDocument",
    value: function waitForHandshakeFromDocument(source, target, origin, opt_token, opt_cdnProxyRegex) {
      return new Promise(function (resolve) {
        var listener = function listener(event) {
          var message = parseMessage(event.data);

          if (!message) {
            return;
          }

          if ((event.origin == origin || opt_cdnProxyRegex && opt_cdnProxyRegex.test(event.origin)) && (!event.source || event.source == target) && message.app === APP && message.name === CHANNEL_OPEN_MSG) {
            source.removeEventListener('message', listener);
            var port = new WindowPortEmulator(source, event.origin, target);
            var messaging = new Messaging(null, port,
            /* opt_isWebview */
            false, opt_token,
            /* opt_verifyToken */
            true);
            messaging.sendResponse_(message.requestid, CHANNEL_OPEN_MSG, null);
            resolve(messaging);
          }
        };

        source.addEventListener('message', listener);
      });
    }
  }]);

  return Messaging;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lc3NhZ2luZy5qcyJdLCJuYW1lcyI6WyJUQUciLCJDSEFOTkVMX09QRU5fTVNHIiwiSEFORFNIQUtFX1BPTExfTVNHIiwiQVBQIiwiTWVzc2FnZVR5cGUiLCJSRVFVRVNUIiwiUkVTUE9OU0UiLCJSZXF1ZXN0SGFuZGxlciIsInBhcnNlTWVzc2FnZSIsIm1lc3NhZ2UiLCJjaGFyQXQiLCJKU09OIiwicGFyc2UiLCJlIiwiV2luZG93UG9ydEVtdWxhdG9yIiwid2luIiwib3JpZ2luIiwidGFyZ2V0Iiwid2luXyIsIm9yaWdpbl8iLCJ0YXJnZXRfIiwiZXZlbnRUeXBlIiwiaGFuZGxlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInNvdXJjZSIsImRhdGEiLCJ0YXJnZXRPcmlnaW4iLCJwb3N0TWVzc2FnZSIsIk1lc3NhZ2luZyIsInBvcnQiLCJvcHRfaXNXZWJ2aWV3Iiwib3B0X3Rva2VuIiwib3B0X3ZlcmlmeVRva2VuIiwicG9ydF8iLCJpc1dlYnZpZXdfIiwidG9rZW5fIiwidmVyaWZ5VG9rZW5fIiwicmVxdWVzdElkQ291bnRlcl8iLCJ3YWl0aW5nRm9yUmVzcG9uc2VfIiwibWVzc2FnZUhhbmRsZXJzXyIsImRlZmF1bHRIYW5kbGVyXyIsImhhbmRsZU1lc3NhZ2VfIiwiYmluZCIsInN0YXJ0IiwibWVzc2FnZU5hbWUiLCJyZXF1ZXN0SGFuZGxlciIsImFwcCIsIm1lc3NhZ2luZ1Rva2VuIiwibG9nRXJyb3JfIiwidHlwZSIsImhhbmRsZVJlcXVlc3RfIiwiaGFuZGxlUmVzcG9uc2VfIiwibWVzc2FnZURhdGEiLCJhd2FpdFJlc3BvbnNlIiwicmVxdWVzdElkIiwicHJvbWlzZSIsInVuZGVmaW5lZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic2VuZE1lc3NhZ2VfIiwicmVxdWVzdGlkIiwibmFtZSIsInJzdnAiLCJyZWFzb24iLCJlcnJTdHJpbmciLCJlcnJvclRvU3RyaW5nXyIsImVycm9yIiwiZmluYWxNZXNzYWdlIiwiT2JqZWN0IiwiYXNzaWduIiwic3RyaW5naWZ5IiwiRXJyb3IiLCJhcmdzIiwic2VuZFJlc3BvbnNlRXJyb3JfIiwidGhlbiIsInNlbmRSZXNwb25zZV8iLCJwZW5kaW5nIiwic3RhdGUiLCJvcHRfZGF0YSIsInN0YXRlU3RyIiwiZGF0YVN0ciIsImVyciIsIlN0cmluZyIsImludGVydmFsUmVmIiwic2V0SW50ZXJ2YWwiLCJjaGFubmVsIiwiTWVzc2FnZUNoYW5uZWwiLCJwb2xsTWVzc2FnZSIsInBvcnQyIiwicG9ydDEiLCJsaXN0ZW5lciIsImNsZWFySW50ZXJ2YWwiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwibWVzc2FnaW5nIiwib3B0X2NkblByb3h5UmVnZXgiLCJ0ZXN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFNQSxHQUFHLEdBQUcsc0JBQVo7QUFDQSxJQUFNQyxnQkFBZ0IsR0FBRyxhQUF6QjtBQUNBLElBQU1DLGtCQUFrQixHQUFHLGdCQUEzQjtBQUNBLElBQU1DLEdBQUcsR0FBRyxhQUFaOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLFdBQVcsR0FBRztBQUNsQkMsRUFBQUEsT0FBTyxFQUFFLEdBRFM7QUFFbEJDLEVBQUFBLFFBQVEsRUFBRTtBQUZRLENBQXBCOztBQUtBO0FBQ0E7QUFDQTtBQUNBLElBQUlDLGNBQUo7QUFBb0I7O0FBRXBCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxZQUFULENBQXNCQyxPQUF0QixFQUErQjtBQUNwQyxNQUFJLE9BQU9BLE9BQVAsSUFBa0IsUUFBdEIsRUFBZ0M7QUFDOUI7QUFBTztBQUFpQ0EsTUFBQUE7QUFBeEM7QUFDRDs7QUFDRCxNQUFJQSxPQUFPLENBQUNDLE1BQVIsQ0FBZSxDQUFmLEtBQXFCLEdBQXpCLEVBQThCO0FBQzVCLFdBQU8sSUFBUDtBQUNEOztBQUVELE1BQUk7QUFDRjtBQUFP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QUNzQyxHQUFSLEtBQWdCNUMsR0FIaEIsSUFJQU0sT0FBTyxDQUFDc0QsSUFBUixLQUFpQjlELGdCQUxuQixFQU1FO0FBQ0F3QixZQUFBQSxNQUFNLENBQUNxRSxtQkFBUCxDQUEyQixTQUEzQixFQUFzQ0YsUUFBdEM7QUFDQSxnQkFBTTlELElBQUksR0FBRyxJQUFJaEIsa0JBQUosQ0FBdUJXLE1BQXZCLEVBQStCRCxLQUFLLENBQUNSLE1BQXJDLEVBQTZDQyxNQUE3QyxDQUFiO0FBQ0EsZ0JBQU04RSxTQUFTLEdBQUcsSUFBSWxFLFNBQUosQ0FDaEIsSUFEZ0IsRUFFaEJDLElBRmdCO0FBR2hCO0FBQW9CLGlCQUhKLEVBSWhCRSxTQUpnQjtBQUtoQjtBQUFzQixnQkFMTixDQUFsQjtBQU9BK0QsWUFBQUEsU0FBUyxDQUFDbEIsYUFBVixDQUF3QnBFLE9BQU8sQ0FBQ3FELFNBQWhDLEVBQTJDN0QsZ0JBQTNDLEVBQTZELElBQTdEO0FBQ0EwRCxZQUFBQSxPQUFPLENBQUNvQyxTQUFELENBQVA7QUFDRDtBQUNGLFNBeEJEOztBQXlCQXRFLFFBQUFBLE1BQU0sQ0FBQ0YsZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUNxRSxRQUFuQztBQUNELE9BM0JNLENBQVA7QUE0QkQ7QUEzRkg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5jb25zdCBUQUcgPSAnYW1wLXZpZXdlci1tZXNzYWdpbmcnO1xuY29uc3QgQ0hBTk5FTF9PUEVOX01TRyA9ICdjaGFubmVsT3Blbic7XG5jb25zdCBIQU5EU0hBS0VfUE9MTF9NU0cgPSAnaGFuZHNoYWtlLXBvbGwnO1xuY29uc3QgQVBQID0gJ19fQU1QSFRNTF9fJztcblxuLyoqXG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5jb25zdCBNZXNzYWdlVHlwZSA9IHtcbiAgUkVRVUVTVDogJ3EnLFxuICBSRVNQT05TRTogJ3MnLFxufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7ZnVuY3Rpb24oc3RyaW5nLCAqLCBib29sZWFuKTooIVByb21pc2U8Kj58dW5kZWZpbmVkKX1cbiAqL1xubGV0IFJlcXVlc3RIYW5kbGVyOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5cbi8qKlxuICogQHBhcmFtIHsqfSBtZXNzYWdlXG4gKiBAcmV0dXJuIHs/QW1wVmlld2VyTWVzc2FnZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTWVzc2FnZShtZXNzYWdlKSB7XG4gIGlmICh0eXBlb2YgbWVzc2FnZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiAvKiogQHR5cGUge0FtcFZpZXdlck1lc3NhZ2V9ICovIChtZXNzYWdlKTtcbiAgfVxuICBpZiAobWVzc2FnZS5jaGFyQXQoMCkgIT0gJ3snKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiAvKiogQHR5cGUgez9BbXBWaWV3ZXJNZXNzYWdlfSAqLyAoSlNPTi5wYXJzZShcbiAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAobWVzc2FnZSlcbiAgICApKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGNsYXNzIGlzIGEgZGUtZmFjdG8gaW1wbGVtZW50YXRpb24gb2YgTWVzc2FnZVBvcnRcbiAqIGZyb20gQ2hhbm5lbCBNZXNzYWdpbmcgQVBJOlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NoYW5uZWxfTWVzc2FnaW5nX0FQSVxuICovXG5leHBvcnQgY2xhc3MgV2luZG93UG9ydEVtdWxhdG9yIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5cbiAgICogQHBhcmFtIHshV2luZG93fSB0YXJnZXRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgb3JpZ2luLCB0YXJnZXQpIHtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHtzdHJpbmd9ICovXG4gICAgdGhpcy5vcmlnaW5fID0gb3JpZ2luO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFXaW5kb3d9ICovXG4gICAgdGhpcy50YXJnZXRfID0gdGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICogQHBhcmFtIHtmdW5jdGlvbighRXZlbnQpOip9IGhhbmRsZXJcbiAgICovXG4gIGFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyKSB7XG4gICAgdGhpcy53aW5fLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5vcmlnaW4gPT0gdGhpcy5vcmlnaW5fICYmIGV2ZW50LnNvdXJjZSA9PSB0aGlzLnRhcmdldF8pIHtcbiAgICAgICAgaGFuZGxlcihldmVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtKc29uT2JqZWN0fSBkYXRhXG4gICAqL1xuICBwb3N0TWVzc2FnZShkYXRhKSB7XG4gICAgLy8gT3BhcXVlIChudWxsKSBvcmlnaW4gY2FuIG9ubHkgcmVjZWl2ZSBtZXNzYWdlcyBzZW50IHRvIFwiKlwiXG4gICAgY29uc3QgdGFyZ2V0T3JpZ2luID0gdGhpcy5vcmlnaW5fID09PSAnbnVsbCcgPyAnKicgOiB0aGlzLm9yaWdpbl87XG5cbiAgICB0aGlzLnRhcmdldF8uLypPSyovIHBvc3RNZXNzYWdlKGRhdGEsIHRhcmdldE9yaWdpbik7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBzZW5kaW5nIG9mIG1lc3NhZ2VzIHF1ZXVlZCBvbiB0aGUgcG9ydC5cbiAgICovXG4gIHN0YXJ0KCkge31cbn1cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgaXMgdXNlZCBpbiBhbXAtdmlld2VyLWludGVncmF0aW9uLmpzIGZvciB0aGVcbiAqIGNvbW11bmljYXRpb24gcHJvdG9jb2wgYmV0d2VlbiBBTVAgYW5kIHRoZSB2aWV3ZXIuIEluIHRoZSBjb21tZW50cywgSSB3aWxsXG4gKiByZWZlciB0byB0aGUgY29tbXVuaWNhdGlvbiBhcyBhIGNvbnZlcnNhdGlvbiBiZXR3ZWVuIG1lIGFuZCBCb2IuIFRoZVxuICogbWVzc2FnaW5nIHByb3RvY29sIHNob3VsZCBzdXBwb3J0IGJvdGggc2lkZXMsIGJ1dCBhdCB0aGlzIHBvaW50IEknbSB0aGVcbiAqIGFtcGRvYyBhbmQgQm9iIGlzIHRoZSB2aWV3ZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZXNzYWdpbmcge1xuICAvKipcbiAgICogUGVyZm9ybXMgYSBoYW5kc2hha2UgYW5kIGluaXRpYWxpemVzIG1lc3NhZ2luZy5cbiAgICpcbiAgICogUmVxdWlyZXMgdGhlIGBoYW5kc2hha2Vwb2xsYCB2aWV3ZXIgY2FwYWJpbGl0eSBhbmQgdGhlIGBvcmlnaW5gIHZpZXdlciBwYXJhbWV0ZXIgdG8gYmUgc3BlY2lmaWVkLlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHRhcmdldCAtIHdpbmRvdyBjb250YWluaW5nIEFNUCBkb2N1bWVudCB0byBwZXJmb3JtIGhhbmRzaGFrZSB3aXRoXG4gICAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF90b2tlbiAtIG1lc3NhZ2UgdG9rZW4gdG8gdmVyaWZ5IG9uIGluY29taW5nIG1lc3NhZ2VzIChtdXN0IGJlIHByb3ZpZGVkIGFzIHZpZXdlciBwYXJhbWV0ZXIpXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFNZXNzYWdpbmc+fVxuICAgKi9cbiAgc3RhdGljIGluaXRpYXRlSGFuZHNoYWtlV2l0aERvY3VtZW50KHRhcmdldCwgb3B0X3Rva2VuKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBpbnRlcnZhbFJlZiA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgY29uc3QgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgICBjb25zdCBwb2xsTWVzc2FnZSA9IC8qKiBAdHlwZSB7SnNvbk9iamVjdH0gKi8gKHtcbiAgICAgICAgICBhcHA6IEFQUCxcbiAgICAgICAgICBuYW1lOiBIQU5EU0hBS0VfUE9MTF9NU0csXG4gICAgICAgIH0pO1xuICAgICAgICB0YXJnZXQuLypPSyovIHBvc3RNZXNzYWdlKHBvbGxNZXNzYWdlLCAnKicsIFtjaGFubmVsLnBvcnQyXSk7XG5cbiAgICAgICAgY29uc3QgcG9ydCA9IGNoYW5uZWwucG9ydDE7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHBhcnNlTWVzc2FnZShldmVudC5kYXRhKTtcbiAgICAgICAgICBpZiAoIW1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1lc3NhZ2UuYXBwID09PSBBUFAgJiYgbWVzc2FnZS5uYW1lID09PSBDSEFOTkVMX09QRU5fTVNHKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsUmVmKTtcbiAgICAgICAgICAgIHBvcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyKTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2luZyA9IG5ldyBNZXNzYWdpbmcoXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgIHBvcnQsXG4gICAgICAgICAgICAgIC8qIG9wdF9pc1dlYnZpZXcgKi8gZmFsc2UsXG4gICAgICAgICAgICAgIG9wdF90b2tlbixcbiAgICAgICAgICAgICAgLyogb3B0X3ZlcmlmeVRva2VuICovIHRydWVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBtZXNzYWdpbmcuc2VuZFJlc3BvbnNlXyhtZXNzYWdlLnJlcXVlc3RpZCwgQ0hBTk5FTF9PUEVOX01TRywgbnVsbCk7XG4gICAgICAgICAgICByZXNvbHZlKG1lc3NhZ2luZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0ZW5lcik7XG4gICAgICAgIHBvcnQuc3RhcnQoKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciBoYW5kc2hha2UgZnJvbSBpZnJhbWUgYW5kIGluaXRpYWxpemVzIG1lc3NhZ2luZy5cbiAgICpcbiAgICogUmVxdWlyZXMgdGhlIGBvcmlnaW5gIHZpZXdlciBwYXJhbWV0ZXIgdG8gYmUgc3BlY2lmaWVkLlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHNvdXJjZSAtIHRoZSBzb3VyY2Ugd2luZG93IGNvbnRhaW5pbmcgdGhlIHZpZXdlclxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHRhcmdldCAtIHdpbmRvdyBjb250YWluaW5nIEFNUCBkb2N1bWVudCB0byBwZXJmb3JtIGhhbmRzaGFrZSB3aXRoICh1c3VhbGx5IGNvbnRlbnRXaW5kb3cgb2YgaWZyYW1lKVxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gb3JpZ2luIG9mIHRhcmdldCB3aW5kb3cgKHVzZSBcIm51bGxcIiBpZiBvcGFxdWUpXG4gICAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF90b2tlbiAtIG1lc3NhZ2UgdG9rZW4gdG8gdmVyaWZ5IG9uIGluY29taW5nIG1lc3NhZ2VzIChtdXN0IGJlIHByb3ZpZGVkIGFzIHZpZXdlciBwYXJhbWV0ZXIpXG4gICAqIEBwYXJhbSB7P1JlZ0V4cD19IG9wdF9jZG5Qcm94eVJlZ2V4XG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFNZXNzYWdpbmc+fVxuICAgKi9cbiAgc3RhdGljIHdhaXRGb3JIYW5kc2hha2VGcm9tRG9jdW1lbnQoXG4gICAgc291cmNlLFxuICAgIHRhcmdldCxcbiAgICBvcmlnaW4sXG4gICAgb3B0X3Rva2VuLFxuICAgIG9wdF9jZG5Qcm94eVJlZ2V4XG4gICkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IHBhcnNlTWVzc2FnZShldmVudC5kYXRhKTtcbiAgICAgICAgaWYgKCFtZXNzYWdlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICAoZXZlbnQub3JpZ2luID09IG9yaWdpbiB8fFxuICAgICAgICAgICAgKG9wdF9jZG5Qcm94eVJlZ2V4ICYmIG9wdF9jZG5Qcm94eVJlZ2V4LnRlc3QoZXZlbnQub3JpZ2luKSkpICYmXG4gICAgICAgICAgKCFldmVudC5zb3VyY2UgfHwgZXZlbnQuc291cmNlID09IHRhcmdldCkgJiZcbiAgICAgICAgICBtZXNzYWdlLmFwcCA9PT0gQVBQICYmXG4gICAgICAgICAgbWVzc2FnZS5uYW1lID09PSBDSEFOTkVMX09QRU5fTVNHXG4gICAgICAgICkge1xuICAgICAgICAgIHNvdXJjZS5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXIpO1xuICAgICAgICAgIGNvbnN0IHBvcnQgPSBuZXcgV2luZG93UG9ydEVtdWxhdG9yKHNvdXJjZSwgZXZlbnQub3JpZ2luLCB0YXJnZXQpO1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2luZyA9IG5ldyBNZXNzYWdpbmcoXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgcG9ydCxcbiAgICAgICAgICAgIC8qIG9wdF9pc1dlYnZpZXcgKi8gZmFsc2UsXG4gICAgICAgICAgICBvcHRfdG9rZW4sXG4gICAgICAgICAgICAvKiBvcHRfdmVyaWZ5VG9rZW4gKi8gdHJ1ZVxuICAgICAgICAgICk7XG4gICAgICAgICAgbWVzc2FnaW5nLnNlbmRSZXNwb25zZV8obWVzc2FnZS5yZXF1ZXN0aWQsIENIQU5ORUxfT1BFTl9NU0csIG51bGwpO1xuICAgICAgICAgIHJlc29sdmUobWVzc2FnaW5nKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNvdXJjZS5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnNhdGlvbiAobWVzc2FnaW5nIHByb3RvY29sKSBiZXR3ZWVuIG1lIGFuZCBCb2IuXG4gICAqIEBwYXJhbSB7P1dpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IU1lc3NhZ2VQb3J0fCFXaW5kb3dQb3J0RW11bGF0b3J9IHBvcnRcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X2lzV2Vidmlld1xuICAgKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfdG9rZW5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X3ZlcmlmeVRva2VuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIHBvcnQsIG9wdF9pc1dlYnZpZXcsIG9wdF90b2tlbiwgb3B0X3ZlcmlmeVRva2VuKSB7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7P1dpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IU1lc3NhZ2VQb3J0fCFXaW5kb3dQb3J0RW11bGF0b3J9ICovXG4gICAgdGhpcy5wb3J0XyA9IHBvcnQ7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzV2Vidmlld18gPSAhIW9wdF9pc1dlYnZpZXc7XG5cbiAgICAvKipcbiAgICAgKiBBIHRva2VuIHRoYXQgdGhlIHZpZXdlciBtYXkgaW5jbHVkZSBhcyBhbiBpbml0IHBhcmFtZXRlciB0byBlbmhhbmNlXG4gICAgICogc2VjdXJpdHkgZm9yIGNvbW11bmljYXRpb24gdG8gb3BhcXVlIG9yaWdpbiAoYS5rLmEuIG51bGwgb3JpZ2luKSBBTVBcbiAgICAgKiBkb2N1bWVudHMuXG4gICAgICpcbiAgICAgKiBGb3IgYW4gQU1QIGRvY3VtZW50IGVtYmVkZGVkIGluc2lkZSBhIHNhbmRib3ggaWZyYW1lLCB0aGUgb3JpZ2luIG9mIHRoZVxuICAgICAqIGRvY3VtZW50IHdvdWxkIGJlIFwibnVsbFwiLCB3aGljaCBkZWZlYXRzIHRoZSBwdXJwb3NlIG9mIGFuIG9yaWdpbiBjaGVjay5cbiAgICAgKiBBbiBhdHRhY2tlciBjb3VsZCBzaW1wbHkgY3JlYXRlIGEgc2FuZGJveGVkLCBtYWxpY2lvdXMgaWZyYW1lICh0aGVyZWZvcmVcbiAgICAgKiBoYXZpbmcgbnVsbCBvcmlnaW4pLCB3YWxrIG9uIHRoZSBET00gZnJhbWUgdHJlZSB0byBmaW5kIGEgcmVmZXJlbmNlIHRvXG4gICAgICogdGhlIHZpZXdlciBpZnJhbWUgKHRoaXMgaXMgbm90IGNvbnN0cmFpbmVkIGJ5IHRoZSBzYW1lIG9yaWdpbiBwb2xpY3kpLFxuICAgICAqIGFuZCB0aGVuIHNlbmQgcG9zdE1lc3NhZ2UoKSBjYWxscyB0byB0aGUgdmlld2VyIGZyYW1lIGFuZCBwYXNzIHRoZVxuICAgICAqIHZpZXdlcidzIG9yaWdpbiBjaGVja3MsIGlmIGFueS5cbiAgICAgKlxuICAgICAqIFRoZSB2aWV3ZXIgY291bGQgYWxzbyBjaGVjayB0aGUgc291cmNlIG9mIHRoZSBtZXNzYWdlIHRvIGJlIGEgbGVnaXRpbWF0ZVxuICAgICAqIEFNUCBpZnJhbWUgd2luZG93LCBidXQgdGhlIGF0dGFja2VyIGNvdWxkIGJ5cGFzcyB0aGF0IGJ5IG5hdmlnYXRpbmcgdGhlXG4gICAgICogbGVnaXRpbWF0ZSBBTVAgaWZyYW1lIHdpbmRvdyBhd2F5IHRvIGEgbWFsaWNpb3VzIGRvY3VtZW50LiBSZWNlbnRcbiAgICAgKiBicm93c2VycyBoYXZlIGJhbm5lZCB0aGlzIGtpbmQgb2YgYXR0YWNrLCBidXQgaXQncyB0cmlja3kgdG8gcmVseSBvbiBpdC5cbiAgICAgKlxuICAgICAqIFRvIHByZXZlbnQgdGhlIGFib3ZlIGF0dGFjayBpbiBhIG51bGwgb3JpZ2luIEFNUCBkb2N1bWVudCwgdGhlIHZpZXdlclxuICAgICAqIHNob3VsZCBpbmNsdWRlIHRoaXMgdG9rZW4gaW4gYW4gaW5pdCBwYXJhbWV0ZXIsIGVpdGhlciBpbiB0aGUgYHNyY2Agb3JcbiAgICAgKiBgbmFtZWAgYXR0cmlidXRlIG9mIHRoZSBpZnJhbWUsIGFuZCB0aGVuIHZlcmlmeSB0aGF0IHRoaXMgdG9rZW4gaXNcbiAgICAgKiBpbmNsdWRlZCBpbiBhbGwgdGhlIG1lc3NhZ2VzIHNlbnQgZnJvbSBBTVAgdG8gdGhlIHZpZXdlci4gVGhlIGF0dGFja2VyXG4gICAgICogd291bGQgbm90IGJlIGFibGUgdG8gc3RlYWwgdGhpcyB0b2tlbiB1bmRlciB0aGUgc2FtZSBvcmlnaW4gcG9saWN5LFxuICAgICAqIGJlY2F1c2UgdGhlIHRva2VuIGlzIGluc2lkZSB0aGUgdmlld2VyIGRvY3VtZW50IGF0IGEgZGlmZmVyZW50IG9yaWdpblxuICAgICAqIGFuZCB0aGUgYXR0YWNrZXIgY2FuJ3QgYWNjZXNzIGl0LlxuICAgICAqIEBjb25zdCBAcHJpdmF0ZSB7P3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnRva2VuXyA9IG9wdF90b2tlbiB8fCBudWxsO1xuXG4gICAgLyoqXG4gICAgICogSWYgdHJ1ZSwgdGhlIHRva2VuIGFib3ZlIGlzIHZlcmlmaWVkIG9uIGluY29taW5nIG1lc3NhZ2VzIGluc3RlYWQgb2ZcbiAgICAgKiBiZWluZyBhdHRhY2hlZCB0byBvdXRnb2luZyBtZXNzYWdlcy5cbiAgICAgKiBAY29uc3QgQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy52ZXJpZnlUb2tlbl8gPSAhIW9wdF92ZXJpZnlUb2tlbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMucmVxdWVzdElkQ291bnRlcl8gPSAwO1xuICAgIC8qKiBAcHJpdmF0ZSB7IU9iamVjdDxudW1iZXIsIHtyZXNvbHZlOiBmdW5jdGlvbigqKSwgcmVqZWN0OiBmdW5jdGlvbighRXJyb3IpfT59ICovXG4gICAgdGhpcy53YWl0aW5nRm9yUmVzcG9uc2VfID0ge307XG4gICAgLyoqXG4gICAgICogQSBtYXAgZnJvbSBtZXNzYWdlIG5hbWVzIHRvIHJlcXVlc3QgaGFuZGxlcnMuXG4gICAgICogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCAhUmVxdWVzdEhhbmRsZXI+fVxuICAgICAqL1xuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzXyA9IHt9O1xuXG4gICAgLyoqIEBwcml2YXRlIHs/UmVxdWVzdEhhbmRsZXJ9ICovXG4gICAgdGhpcy5kZWZhdWx0SGFuZGxlcl8gPSBudWxsO1xuXG4gICAgdGhpcy5wb3J0Xy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5oYW5kbGVNZXNzYWdlXy5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBvcnRfLnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgbWV0aG9kIHRoYXQgd2lsbCBoYW5kbGUgcmVxdWVzdHMgc2VudCB0byB0aGUgc3BlY2lmaWVkXG4gICAqIG1lc3NhZ2UgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VOYW1lIFRoZSBuYW1lIG9mIHRoZSBtZXNzYWdlIHRvIGhhbmRsZS5cbiAgICogQHBhcmFtIHshUmVxdWVzdEhhbmRsZXJ9IHJlcXVlc3RIYW5kbGVyXG4gICAqL1xuICByZWdpc3RlckhhbmRsZXIobWVzc2FnZU5hbWUsIHJlcXVlc3RIYW5kbGVyKSB7XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlcnNfW21lc3NhZ2VOYW1lXSA9IHJlcXVlc3RIYW5kbGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXJzIHRoZSBoYW5kbGVyIGZvciB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VOYW1lIFRoZSBuYW1lIG9mIHRoZSBtZXNzYWdlIHRvIHVucmVnaXN0ZXIuXG4gICAqL1xuICB1bnJlZ2lzdGVySGFuZGxlcihtZXNzYWdlTmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1lc3NhZ2VIYW5kbGVyc19bbWVzc2FnZU5hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7P1JlcXVlc3RIYW5kbGVyfSByZXF1ZXN0SGFuZGxlclxuICAgKi9cbiAgc2V0RGVmYXVsdEhhbmRsZXIocmVxdWVzdEhhbmRsZXIpIHtcbiAgICB0aGlzLmRlZmF1bHRIYW5kbGVyXyA9IHJlcXVlc3RIYW5kbGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIEJvYiBzZW50IG1lIGEgbWVzc2FnZS4gSSBuZWVkIHRvIGRlY2lkZSBpZiBpdCdzIGEgbmV3IHJlcXVlc3Qgb3JcbiAgICogYSByZXNwb25zZSB0byBhIHByZXZpb3VzICdjb252ZXJzYXRpb24nIHdlIHdlcmUgaGF2aW5nLlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZU1lc3NhZ2VfKGV2ZW50KSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IHBhcnNlTWVzc2FnZShldmVudC5kYXRhKTtcbiAgICBpZiAoIW1lc3NhZ2UgfHwgbWVzc2FnZS5hcHAgIT09IEFQUCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICB0aGlzLnRva2VuXyAmJlxuICAgICAgdGhpcy52ZXJpZnlUb2tlbl8gJiZcbiAgICAgIG1lc3NhZ2UubWVzc2FnaW5nVG9rZW4gIT09IHRoaXMudG9rZW5fXG4gICAgKSB7XG4gICAgICAvLyBXZSByZWNlaXZlZCBhIG1lc3NhZ2Ugd2l0aCBhbiBpbnZhbGlkIHRva2VuIC0gZGlzbWlzcyBpdC5cbiAgICAgIHRoaXMubG9nRXJyb3JfKFRBRyArICc6IGhhbmRsZU1lc3NhZ2VfIGVycm9yOiAnLCAnaW52YWxpZCB0b2tlbicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAobWVzc2FnZS50eXBlID09PSBNZXNzYWdlVHlwZS5SRVFVRVNUKSB7XG4gICAgICB0aGlzLmhhbmRsZVJlcXVlc3RfKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSBpZiAobWVzc2FnZS50eXBlID09PSBNZXNzYWdlVHlwZS5SRVNQT05TRSkge1xuICAgICAgdGhpcy5oYW5kbGVSZXNwb25zZV8obWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEknbSBzZW5kaW5nIEJvYiBhIG5ldyBvdXRnb2luZyByZXF1ZXN0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZU5hbWVcbiAgICogQHBhcmFtIHs/SnNvbk9iamVjdHxzdHJpbmd8dW5kZWZpbmVkfSBtZXNzYWdlRGF0YVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGF3YWl0UmVzcG9uc2VcbiAgICogQHJldHVybiB7IVByb21pc2U8Kj58dW5kZWZpbmVkfVxuICAgKi9cbiAgc2VuZFJlcXVlc3QobWVzc2FnZU5hbWUsIG1lc3NhZ2VEYXRhLCBhd2FpdFJlc3BvbnNlKSB7XG4gICAgY29uc3QgcmVxdWVzdElkID0gKyt0aGlzLnJlcXVlc3RJZENvdW50ZXJfO1xuICAgIGxldCBwcm9taXNlID0gdW5kZWZpbmVkO1xuICAgIGlmIChhd2FpdFJlc3BvbnNlKSB7XG4gICAgICBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICB0aGlzLndhaXRpbmdGb3JSZXNwb25zZV9bcmVxdWVzdElkXSA9IHtyZXNvbHZlLCByZWplY3R9O1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuc2VuZE1lc3NhZ2VfKFxuICAgICAgLyoqIEB0eXBlIHshQW1wVmlld2VyTWVzc2FnZX0gKi8gKHtcbiAgICAgICAgYXBwOiBBUFAsXG4gICAgICAgIHJlcXVlc3RpZDogcmVxdWVzdElkLFxuICAgICAgICB0eXBlOiBNZXNzYWdlVHlwZS5SRVFVRVNULFxuICAgICAgICBuYW1lOiBtZXNzYWdlTmFtZSxcbiAgICAgICAgZGF0YTogbWVzc2FnZURhdGEsXG4gICAgICAgIHJzdnA6IGF3YWl0UmVzcG9uc2UsXG4gICAgICB9KVxuICAgICk7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogSSdtIHJlc3BvbmRpbmcgdG8gYSByZXF1ZXN0IHRoYXQgQm9iIG1hZGUgZWFybGllci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlcXVlc3RJZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZU5hbWVcbiAgICogQHBhcmFtIHsqfSBtZXNzYWdlRGF0YVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2VuZFJlc3BvbnNlXyhyZXF1ZXN0SWQsIG1lc3NhZ2VOYW1lLCBtZXNzYWdlRGF0YSkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2VfKFxuICAgICAgLyoqIEB0eXBlIHshQW1wVmlld2VyTWVzc2FnZX0gKi8gKHtcbiAgICAgICAgYXBwOiBBUFAsXG4gICAgICAgIHJlcXVlc3RpZDogcmVxdWVzdElkLFxuICAgICAgICB0eXBlOiBNZXNzYWdlVHlwZS5SRVNQT05TRSxcbiAgICAgICAgbmFtZTogbWVzc2FnZU5hbWUsXG4gICAgICAgIGRhdGE6IG1lc3NhZ2VEYXRhLFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZXF1ZXN0SWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VOYW1lXG4gICAqIEBwYXJhbSB7Kn0gcmVhc29uICFFcnJvciBtb3N0IG9mIHRpbWUsIHN0cmluZyBzb21ldGltZXMsICogcmFyZWx5LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2VuZFJlc3BvbnNlRXJyb3JfKHJlcXVlc3RJZCwgbWVzc2FnZU5hbWUsIHJlYXNvbikge1xuICAgIGNvbnN0IGVyclN0cmluZyA9IHRoaXMuZXJyb3JUb1N0cmluZ18ocmVhc29uKTtcbiAgICB0aGlzLmxvZ0Vycm9yXyhcbiAgICAgIFRBRyArICc6IHNlbmRSZXNwb25zZUVycm9yXywgbWVzc2FnZSBuYW1lOiAnICsgbWVzc2FnZU5hbWUsXG4gICAgICBlcnJTdHJpbmdcbiAgICApO1xuICAgIHRoaXMuc2VuZE1lc3NhZ2VfKFxuICAgICAgLyoqIEB0eXBlIHshQW1wVmlld2VyTWVzc2FnZX0gKi8gKHtcbiAgICAgICAgYXBwOiBBUFAsXG4gICAgICAgIHJlcXVlc3RpZDogcmVxdWVzdElkLFxuICAgICAgICB0eXBlOiBNZXNzYWdlVHlwZS5SRVNQT05TRSxcbiAgICAgICAgbmFtZTogbWVzc2FnZU5hbWUsXG4gICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgIGVycm9yOiBlcnJTdHJpbmcsXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshQW1wVmlld2VyTWVzc2FnZX0gbWVzc2FnZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2VuZE1lc3NhZ2VfKG1lc3NhZ2UpIHtcbiAgICBjb25zdCAvKiogT2JqZWN0PHN0cmluZywgKj4gKi8gZmluYWxNZXNzYWdlID0gT2JqZWN0LmFzc2lnbihtZXNzYWdlLCB7fSk7XG4gICAgaWYgKHRoaXMudG9rZW5fICYmICF0aGlzLnZlcmlmeVRva2VuXykge1xuICAgICAgZmluYWxNZXNzYWdlLm1lc3NhZ2luZ1Rva2VuID0gdGhpcy50b2tlbl87XG4gICAgfVxuICAgIHRoaXMucG9ydF8uLypPSyovIHBvc3RNZXNzYWdlKFxuICAgICAgdGhpcy5pc1dlYnZpZXdfXG4gICAgICAgID8gSlNPTi5zdHJpbmdpZnkoLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKGZpbmFsTWVzc2FnZSkpXG4gICAgICAgIDogZmluYWxNZXNzYWdlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJJ20gaGFuZGxpbmcgYW4gaW5jb21pbmcgcmVxdWVzdCBmcm9tIEJvYi4gSSdsbCBlaXRoZXIgcmVzcG9uZCBub3JtYWxseVxuICAgKiAoZXg6IFwiZ290IGl0IEJvYiFcIikgb3Igd2l0aCBhbiBlcnJvciAoZXg6IFwiSSBkaWRuJ3QgZ2V0IGEgd29yZCBvZiB3aGF0XG4gICAqIHlvdSBzYWlkIVwiKS5cbiAgICogQHBhcmFtIHshQW1wVmlld2VyTWVzc2FnZX0gbWVzc2FnZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaGFuZGxlUmVxdWVzdF8obWVzc2FnZSkge1xuICAgIGxldCBoYW5kbGVyID0gdGhpcy5tZXNzYWdlSGFuZGxlcnNfW21lc3NhZ2UubmFtZV07XG4gICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyID0gdGhpcy5kZWZhdWx0SGFuZGxlcl87XG4gICAgfVxuICAgIGlmICghaGFuZGxlcikge1xuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICdDYW5ub3QgaGFuZGxlIHJlcXVlc3QgYmVjYXVzZSBubyBkZWZhdWx0IGhhbmRsZXIgaXMgc2V0ISdcbiAgICAgICk7XG4gICAgICBlcnJvci5hcmdzID0gbWVzc2FnZS5uYW1lO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IGhhbmRsZXIobWVzc2FnZS5uYW1lLCBtZXNzYWdlLmRhdGEsICEhbWVzc2FnZS5yc3ZwKTtcbiAgICBpZiAobWVzc2FnZS5yc3ZwKSB7XG4gICAgICBjb25zdCByZXF1ZXN0SWQgPSBtZXNzYWdlLnJlcXVlc3RpZDtcbiAgICAgIGlmICghcHJvbWlzZSkge1xuICAgICAgICB0aGlzLnNlbmRSZXNwb25zZUVycm9yXyhcbiAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgbWVzc2FnZS5uYW1lLFxuICAgICAgICAgIG5ldyBFcnJvcignbm8gcmVzcG9uc2UnKVxuICAgICAgICApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHJlc3BvbnNlIGJ1dCBub25lIGdpdmVuOiAnICsgbWVzc2FnZS5uYW1lKTtcbiAgICAgIH1cbiAgICAgIHByb21pc2UudGhlbihcbiAgICAgICAgKGRhdGEpID0+IHtcbiAgICAgICAgICB0aGlzLnNlbmRSZXNwb25zZV8ocmVxdWVzdElkLCBtZXNzYWdlLm5hbWUsIGRhdGEpO1xuICAgICAgICB9LFxuICAgICAgICAocmVhc29uKSA9PiB7XG4gICAgICAgICAgdGhpcy5zZW5kUmVzcG9uc2VFcnJvcl8ocmVxdWVzdElkLCBtZXNzYWdlLm5hbWUsIHJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEkgc2VudCBvdXQgYSByZXF1ZXN0IHRvIEJvYi4gSGUgcmVzcG9uZGVkLiBBbmQgbm93IEknbSBoYW5kbGluZyB0aGF0XG4gICAqIHJlc3BvbnNlLlxuICAgKiBAcGFyYW0geyFBbXBWaWV3ZXJNZXNzYWdlfSBtZXNzYWdlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVSZXNwb25zZV8obWVzc2FnZSkge1xuICAgIGNvbnN0IHJlcXVlc3RJZCA9IG1lc3NhZ2UucmVxdWVzdGlkO1xuICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLndhaXRpbmdGb3JSZXNwb25zZV9bcmVxdWVzdElkXTtcbiAgICBpZiAocGVuZGluZykge1xuICAgICAgZGVsZXRlIHRoaXMud2FpdGluZ0ZvclJlc3BvbnNlX1tyZXF1ZXN0SWRdO1xuICAgICAgaWYgKG1lc3NhZ2UuZXJyb3IpIHtcbiAgICAgICAgdGhpcy5sb2dFcnJvcl8oVEFHICsgJzogaGFuZGxlUmVzcG9uc2VfIGVycm9yOiAnLCBtZXNzYWdlLmVycm9yKTtcbiAgICAgICAgcGVuZGluZy5yZWplY3QoXG4gICAgICAgICAgbmV3IEVycm9yKGBSZXF1ZXN0ICR7bWVzc2FnZS5uYW1lfSBmYWlsZWQ6ICR7bWVzc2FnZS5lcnJvcn1gKVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVuZGluZy5yZXNvbHZlKG1lc3NhZ2UuZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVxuICAgKiBAcGFyYW0geyFFcnJvcnxzdHJpbmc9fSBvcHRfZGF0YVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbG9nRXJyb3JfKHN0YXRlLCBvcHRfZGF0YSkge1xuICAgIGlmICghdGhpcy53aW5fKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBzdGF0ZVN0ciA9ICdhbXAtbWVzc2FnaW5nLWVycm9yLWxvZ2dlcjogJyArIHN0YXRlO1xuICAgIGNvbnN0IGRhdGFTdHIgPSAnIGRhdGE6ICcgKyB0aGlzLmVycm9yVG9TdHJpbmdfKG9wdF9kYXRhKTtcbiAgICBzdGF0ZVN0ciArPSBkYXRhU3RyO1xuICAgIHRoaXMud2luX1sndmlld2VyU3RhdGUnXSA9IHN0YXRlU3RyO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gZXJyICFFcnJvciBtb3N0IG9mIHRpbWUsIHN0cmluZyBzb21ldGltZXMsICogcmFyZWx5LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlcnJvclRvU3RyaW5nXyhlcnIpIHtcbiAgICByZXR1cm4gZXJyID8gKGVyci5tZXNzYWdlID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSkgOiAndW5rbm93biBlcnJvcic7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/node_modules/@ampproject/viewer-messaging/messaging.js