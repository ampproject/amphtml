const TAG = 'amp-viewer-messaging';
const CHANNEL_OPEN_MSG = 'channelOpen';
const HANDSHAKE_POLL_MSG = 'handshake-poll';
const APP = '__AMPHTML__';

/**
 * @enum {string}
 */
const MessageType_Enum = {
  REQUEST: 'q',
  RESPONSE: 's',
};

/**
 * @typedef {function(string, *, boolean):(!Promise<*>|undefined)}
 */
let RequestHandler; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * @param {*} message
 * @return {?AmpViewerMessage}
 */
export function parseMessage(message) {
  if (typeof message != 'string') {
    return /** @type {AmpViewerMessage} */ (message);
  }
  if (message.charAt(0) != '{') {
    return null;
  }

  try {
    return /** @type {?AmpViewerMessage} */ (
      JSON.parse(/** @type {string} */ (message))
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
export class WindowPortEmulator {
  /**
   * @param {!Window} win
   * @param {string} origin
   * @param {!Window} target
   */
  constructor(win, origin, target) {
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
  addEventListener(eventType, handler) {
    this.win_.addEventListener('message', (event) => {
      if (event.origin == this.origin_ && event.source == this.target_) {
        handler(event);
      }
    });
  }

  /**
   * @param {JsonObject} data
   */
  postMessage(data) {
    // Opaque (null) origin can only receive messages sent to "*"
    const targetOrigin = this.origin_ === 'null' ? '*' : this.origin_;

    this.target_./*OK*/ postMessage(data, targetOrigin);
  }

  /**
   * Starts the sending of messages queued on the port.
   */
  start() {}
}

/**
 * @fileoverview This is used in amp-viewer-integration.js for the
 * communication protocol between AMP and the viewer. In the comments, I will
 * refer to the communication as a conversation between me and Bob. The
 * messaging protocol should support both sides, but at this point I'm the
 * ampdoc and Bob is the viewer.
 */
export class Messaging {
  /**
   * Performs a handshake and initializes messaging.
   *
   * Requires the `handshakepoll` viewer capability and the `origin` viewer parameter to be specified.
   * @param {!Window} target - window containing AMP document to perform handshake with
   * @param {?string=} opt_token - message token to verify on incoming messages (must be provided as viewer parameter)
   * @return {!Promise<!Messaging>}
   */
  static initiateHandshakeWithDocument(target, opt_token) {
    return new Promise((resolve) => {
      const intervalRef = setInterval(() => {
        const channel = new MessageChannel();
        const pollMessage = /** @type {JsonObject} */ ({
          app: APP,
          name: HANDSHAKE_POLL_MSG,
        });
        target./*OK*/ postMessage(pollMessage, '*', [channel.port2]);

        const port = channel.port1;
        const listener = (event) => {
          const message = parseMessage(event.data);
          if (!message) {
            return;
          }
          if (message.app === APP && message.name === CHANNEL_OPEN_MSG) {
            clearInterval(intervalRef);
            port.removeEventListener('message', listener);
            const messaging = new Messaging(
              null,
              port,
              /* opt_isWebview */ false,
              opt_token,
              /* opt_verifyToken */ true
            );
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
  static waitForHandshakeFromDocument(
    source,
    target,
    origin,
    opt_token,
    opt_cdnProxyRegex
  ) {
    return new Promise((resolve) => {
      const listener = (event) => {
        const message = parseMessage(event.data);
        if (!message) {
          return;
        }
        if (
          (event.origin == origin ||
            (opt_cdnProxyRegex && opt_cdnProxyRegex.test(event.origin))) &&
          (!event.source || event.source == target) &&
          message.app === APP &&
          message.name === CHANNEL_OPEN_MSG
        ) {
          source.removeEventListener('message', listener);
          const port = new WindowPortEmulator(source, event.origin, target);
          const messaging = new Messaging(
            null,
            port,
            /* opt_isWebview */ false,
            opt_token,
            /* opt_verifyToken */ true
          );
          messaging.sendResponse_(message.requestid, CHANNEL_OPEN_MSG, null);
          resolve(messaging);
        }
      };
      source.addEventListener('message', listener);
    });
  }

  /**
   * Conversation (messaging protocol) between me and Bob.
   * @param {?Window} win
   * @param {!MessagePort|!WindowPortEmulator} port
   * @param {boolean=} opt_isWebview
   * @param {?string=} opt_token
   * @param {boolean=} opt_verifyToken
   */
  constructor(win, port, opt_isWebview, opt_token, opt_verifyToken) {
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
    /** @private {!{[key: number]: {resolve: function(*), reject: function(!Error)}}} */
    this.waitingForResponse_ = {};
    /**
     * A map from message names to request handlers.
     * @private {!{[key: string]: !RequestHandler}}
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
  registerHandler(messageName, requestHandler) {
    this.messageHandlers_[messageName] = requestHandler;
  }

  /**
   * Unregisters the handler for the specified message name.
   * @param {string} messageName The name of the message to unregister.
   */
  unregisterHandler(messageName) {
    delete this.messageHandlers_[messageName];
  }

  /**
   * @param {?RequestHandler} requestHandler
   */
  setDefaultHandler(requestHandler) {
    this.defaultHandler_ = requestHandler;
  }

  /**
   * Bob sent me a message. I need to decide if it's a new request or
   * a response to a previous 'conversation' we were having.
   * @param {!Event} event
   * @private
   */
  handleMessage_(event) {
    const message = parseMessage(event.data);
    if (!message || message.app !== APP) {
      return;
    }
    if (
      this.token_ &&
      this.verifyToken_ &&
      message.messagingToken !== this.token_
    ) {
      // We received a message with an invalid token - dismiss it.
      this.logError_(TAG + ': handleMessage_ error: ', 'invalid token');
      return;
    }
    if (message.type === MessageType_Enum.REQUEST) {
      this.handleRequest_(message);
    } else if (message.type === MessageType_Enum.RESPONSE) {
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
  sendRequest(messageName, messageData, awaitResponse) {
    const requestId = ++this.requestIdCounter_;
    let promise = undefined;
    if (awaitResponse) {
      promise = new Promise((resolve, reject) => {
        this.waitingForResponse_[requestId] = {resolve, reject};
      });
    }
    this.sendMessage_(
      /** @type {!AmpViewerMessage} */ ({
        app: APP,
        requestid: requestId,
        type: MessageType_Enum.REQUEST,
        name: messageName,
        data: messageData,
        rsvp: awaitResponse,
      })
    );
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
    this.sendMessage_(
      /** @type {!AmpViewerMessage} */ ({
        app: APP,
        requestid: requestId,
        type: MessageType_Enum.RESPONSE,
        name: messageName,
        data: messageData,
      })
    );
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
      TAG + ': sendResponseError_, message name: ' + messageName,
      errString
    );
    this.sendMessage_(
      /** @type {!AmpViewerMessage} */ ({
        app: APP,
        requestid: requestId,
        type: MessageType_Enum.RESPONSE,
        name: messageName,
        data: null,
        error: errString,
      })
    );
  }

  /**
   * @param {!AmpViewerMessage} message
   * @private
   */
  sendMessage_(message) {
    const /** {[key: string]: *} */ finalMessage = Object.assign(message, {});
    if (this.token_ && !this.verifyToken_) {
      finalMessage.messagingToken = this.token_;
    }
    this.port_./*OK*/ postMessage(
      this.isWebview_
        ? JSON.stringify(/** @type {!JsonObject} */ (finalMessage))
        : finalMessage
    );
  }

  /**
   * I'm handling an incoming request from Bob. I'll either respond normally
   * (ex: "got it Bob!") or with an error (ex: "I didn't get a word of what
   * you said!").
   * @param {!AmpViewerMessage} message
   * @private
   */
  handleRequest_(message) {
    let handler = this.messageHandlers_[message.name];
    if (!handler) {
      handler = this.defaultHandler_;
    }
    if (!handler) {
      const error = new Error(
        'Cannot handle request because no default handler is set!'
      );
      error.args = message.name;
      throw error;
    }

    const promise = handler(message.name, message.data, !!message.rsvp);
    if (message.rsvp) {
      const requestId = message.requestid;
      if (!promise) {
        this.sendResponseError_(
          requestId,
          message.name,
          new Error('no response')
        );
        throw new Error('expected response but none given: ' + message.name);
      }
      promise.then(
        (data) => {
          this.sendResponse_(requestId, message.name, data);
        },
        (reason) => {
          this.sendResponseError_(requestId, message.name, reason);
        }
      );
    }
  }

  /**
   * I sent out a request to Bob. He responded. And now I'm handling that
   * response.
   * @param {!AmpViewerMessage} message
   * @private
   */
  handleResponse_(message) {
    const requestId = message.requestid;
    const pending = this.waitingForResponse_[requestId];
    if (pending) {
      delete this.waitingForResponse_[requestId];
      if (message.error) {
        this.logError_(TAG + ': handleResponse_ error: ', message.error);
        pending.reject(
          new Error(`Request ${message.name} failed: ${message.error}`)
        );
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
  logError_(state, opt_data) {
    if (!this.win_) {
      return;
    }
    let stateStr = 'amp-messaging-error-logger: ' + state;
    const dataStr = ' data: ' + this.errorToString_(opt_data);
    stateStr += dataStr;
    this.win_['viewerState'] = stateStr;
  }

  /**
   * @param {*} err !Error most of time, string sometimes, * rarely.
   * @return {string}
   * @private
   */
  errorToString_(err) {
    return err ? (err.message ? err.message : String(err)) : 'unknown error';
  }
}
