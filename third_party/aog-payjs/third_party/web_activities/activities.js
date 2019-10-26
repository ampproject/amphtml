/**
 * @fileoverview Import from Web Activities project
 * (https://github.com/google/web-activities).
 */

/**
 * @license
 * Copyright 2017 The Web Activities Authors. All Rights Reserved.
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
 /** Version: 1.12 */


/**
 * @enum {string}
 */
export const ActivityMode = {
  IFRAME: 'iframe',
  POPUP: 'popup',
  REDIRECT: 'redirect',
};


/**
 * The result code used for `ActivityResult`.
 * @enum {string}
 */
export const ActivityResultCode = {
  OK: 'ok',
  CANCELED: 'canceled',
  FAILED: 'failed',
};


/**
 * The result of an activity. The activity implementation returns this object
 * for a successful result, a cancelation or a failure.
 * @struct
 */
export class ActivityResult {
  /**
   * @param {!ActivityResultCode} code
   * @param {*} data
   * @param {!ActivityMode} mode
   * @param {string} origin
   * @param {boolean} originVerified
   * @param {boolean} secureChannel
   */
  constructor(code, data, mode, origin, originVerified, secureChannel) {
    /** @const {!ActivityResultCode} */
    this.code = code;
    /** @const {*} */
    this.data = code == ActivityResultCode.OK ? data : null;
    /** @const {!ActivityMode} */
    this.mode = mode;
    /** @const {string} */
    this.origin = origin;
    /** @const {boolean} */
    this.originVerified = originVerified;
    /** @const {boolean} */
    this.secureChannel = secureChannel;
    /** @const {boolean} */
    this.ok = code == ActivityResultCode.OK;
    /** @const {?Error} */
    this.error = code == ActivityResultCode.FAILED ?
        new Error(String(data) || '') :
        null;
  }
}


/**
 * The activity request that different types of hosts can be started with.
 * @typedef {{
 *   requestId: string,
 *   returnUrl: string,
 *   args: ?Object,
 *   origin: (string|undefined),
 *   originVerified: (boolean|undefined),
 * }}
 */
export let ActivityRequest;


/**
 * Activity implementation. The host provides interfaces, callbacks and
 * signals for the activity's implementation to communicate with the client
 * and return the results.
 *
 * @interface
 */
export class ActivityHost {

  /**
   * Returns the mode of the activity: iframe, popup or redirect.
   * @return {!ActivityMode}
   */
  getMode() {}

  /**
   * The request string that the host was started with. This value can be
   * passed around while the target host is navigated.
   *
   * Not always available; in particular, this value is not available for
   * iframe hosts.
   *
   * See `ActivityRequest` for more info.
   *
   * @return {?string}
   */
  getRequestString() {}

  /**
   * The client's origin. The connection to the client must first succeed
   * before the origin can be known with certainty.
   * @return {string}
   */
  getTargetOrigin() {}

  /**
   * Whether the client's origin has been verified. This depends on the type of
   * the client connection. When window messaging is used (for iframes and
   * popups), the origin can be verified. In case of redirects, where state is
   * passed in the URL, the verification is not fully possible.
   * @return {boolean}
   */
  isTargetOriginVerified() {}

  /**
   * Whether the client/host communication is done via a secure channel such
   * as messaging, or an open and easily exploitable channel, such redirect URL.
   * Iframes and popups use a secure channel, and the redirect mode does not.
   * @return {boolean}
   */
  isSecureChannel() {}

  /**
   * Signals to the host to accept the connection. Before the connection is
   * accepted, no other calls can be made, such as `ready()`, `result()`, etc.
   *
   * Since the result of the activity could be sensitive, the host API requires
   * you to verify the connection. The host can use the client's origin,
   * verified flag, whether the channel is secure, activity arguments, and other
   * properties to confirm whether the connection should be accepted.
   *
   * The client origin is verifiable in popup and iframe modes, but may not
   * be verifiable in the redirect mode. The channel is secure for iframes and
   * popups and not secure for redirects.
   */
  accept() {}

  /**
   * The arguments the activity was started with. The connection to the client
   * must first succeed before the origin can be known with certainty.
   * @return {?Object}
   */
  getArgs() {}

  /**
   * Signals to the opener that the host is ready to be interacted with.
   */
  ready() {}

  /**
   * Whether the supplemental messaging suppored for this host mode. Only iframe
   * hosts can currently send and receive messages.
   * @return {boolean}
   */
  isMessagingSupported() {}

  /**
   * Sends a message to the client. Notice that only iframe hosts can send and
   * receive messages.
   * @param {!Object} payload
   */
  message(payload) {}

  /**
   * Registers a callback to receive messages from the client. Notice that only
   * iframe hosts can send and receive messages.
   * @param {function(!Object)} callback
   */
  onMessage(callback) {}

  /**
   * Creates a new supplemental communication channel or returns an existing
   * one. Notice that only iframe hosts can send and receive messages.
   * @param {string=} opt_name
   * @return {!Promise<!MessagePort>}
   */
  messageChannel(opt_name) {}

  /**
   * Signals to the activity client the result of the activity.
   * @param {*} data
   */
  result(data) {}

  /**
   * Signals to the activity client that the activity has been canceled by the
   * user.
   */
  cancel() {}

  /**
   * Signals to the activity client that the activity has unrecoverably failed.
   * @param {!Error|string} reason
   */
  failed(reason) {}

  /**
   * Set the size container. This element will be used to measure the
   * size needed by the iframe. Not required for non-iframe hosts. The
   * needed height is calculated as `sizeContainer.scrollHeight`.
   * @param {!Element} element
   */
  setSizeContainer(element) {}

  /**
   * Signals to the activity client that the activity's size needs might have
   * changed. Not required for non-iframe hosts.
   */
  resized() {}

  /**
   * The callback the activity implementation can implement to react to changes
   * in size. Normally, this callback is called in reaction to the `resized()`
   * method.
   * @param {function(number, number, boolean)} callback
   */
  onResizeComplete(callback) {}

  /**
   * Disconnect the activity implementation and cleanup listeners.
   */
  disconnect() {}
}



/** @type {?HTMLAnchorElement} */
let aResolver;


/**
 * @param {string} urlString
 * @return {!HTMLAnchorElement}
 */
function parseUrl(urlString) {
  if (!aResolver) {
    aResolver = /** @type {!HTMLAnchorElement} */ (document.createElement('a'));
  }
  aResolver.href = urlString;
  return /** @type {!HTMLAnchorElement} */ (aResolver);
}


/**
 * @param {!Location|!URL|!HTMLAnchorElement} loc
 * @return {string}
 */
function getOrigin(loc) {
  return loc.origin || loc.protocol + '//' + loc.host;
}


/**
 * @param {string} urlString
 * @return {string}
 */
function getOriginFromUrl(urlString) {
  return getOrigin(parseUrl(urlString));
}


/**
 * @param {!Window} win
 * @return {string}
 */
function getWindowOrigin(win) {
  return (win.origin || getOrigin(win.location));
}


/**
 * Parses and builds Object of URL query string.
 * @param {string} query The URL query string.
 * @return {!Object<string, string>}
 */
function parseQueryString(query) {
  if (!query) {
    return {};
  }
  return (/^[?#]/.test(query) ? query.slice(1) : query)
      .split('&')
      .reduce((params, param) => {
        const item = param.split('=');
        const key = decodeURIComponent(item[0] || '');
        const value = decodeURIComponent(item[1] || '');
        if (key) {
          params[key] = value;
        }
        return params;
      }, {});
}


/**
 * @param {string} queryString  A query string in the form of "a=b&c=d". Could
 *   be optionally prefixed with "?" or "#".
 * @param {string} param The param to get from the query string.
 * @return {?string}
 */
function getQueryParam(queryString, param) {
  return parseQueryString(queryString)[param];
}


/**
 * @param {?string} requestString
 * @param {boolean=} trusted
 * @return {?ActivityRequest}
 */
function parseRequest(requestString, trusted = false) {
  if (!requestString) {
    return null;
  }
  const parsed = /** @type {!Object} */ (JSON.parse(requestString));
  const request = {
    requestId: /** @type {string} */ (parsed['requestId']),
    returnUrl: /** @type {string} */ (parsed['returnUrl']),
    args: /** @type {?Object} */ (parsed['args'] || null),
  };
  if (trusted) {
    request.origin = /** @type {string|undefined} */ (
        parsed['origin'] || undefined);
    request.originVerified = /** @type {boolean|undefined} */ (
        parsed['originVerified'] || undefined);
  }
  return request;
}


/**
 * @param {!ActivityRequest} request
 * @return {string}
 */
function serializeRequest(request) {
  const map = {
    'requestId': request.requestId,
    'returnUrl': request.returnUrl,
    'args': request.args,
  };
  if (request.origin !== undefined) {
    map['origin'] = request.origin;
  }
  if (request.originVerified !== undefined) {
    map['originVerified'] = request.originVerified;
  }
  return JSON.stringify(map);
}


/**
 * @param {!Window} win
 * @return {boolean}
 */
function isIeBrowser(win) {
  // MSIE and Trident are typical user agents for IE browsers.
  const nav = win.navigator;
  return /Trident|MSIE|IEMobile/i.test(nav && nav.userAgent);
}


/**
 * @param {!Window} win
 * @return {boolean}
 */
function isEdgeBrowser(win) {
  const nav = win.navigator;
  return /Edge/i.test(nav && nav.userAgent);
}



const SENTINEL = '__ACTIVITIES__';

/**
 * @typedef {{
 *   promise: !Promise<!MessagePort>,
 *   resolver: ?function((!MessagePort|!Promise<!MessagePort>)),
 *   port1: ?MessagePort,
 *   port2: ?MessagePort,
 * }}
 */
let ChannelHolder;


/**
 * The messenger helper for activity's port and host.
 */
class Messenger {

  /**
   * @param {!Window} win
   * @param {!Window|function():?Window} targetOrCallback
   * @param {?string} targetOrigin
   */
  constructor(win, targetOrCallback, targetOrigin) {
    /** @private @const {!Window} */
    this.win_ = win;
    /** @private @const {!Window|function():?Window} */
    this.targetOrCallback_ = targetOrCallback;

    /**
     * May start as unknown (`null`) until received in the first message.
     * @private {?string}
     */
    this.targetOrigin_ = targetOrigin;

    /** @private {?Window} */
    this.target_ = null;

    /** @private {boolean} */
    this.acceptsChannel_ = false;

    /** @private {?MessagePort} */
    this.port_ = null;

    /** @private {?function(string, ?Object)} */
    this.onCommand_ = null;

    /** @private {?function(!Object)} */
    this.onCustomMessage_ = null;

    /**
     * @private {?Object<string, !ChannelHolder>}
     */
    this.channels_ = null;

    /** @private @const */
    this.boundHandleEvent_ = this.handleEvent_.bind(this);
  }

  /**
   * Connect the port to the host or vice versa.
   * @param {function(string, ?Object)} onCommand
   */
  connect(onCommand) {
    if (this.onCommand_) {
      throw new Error('already connected');
    }
    this.onCommand_ = onCommand;
    this.win_.addEventListener('message', this.boundHandleEvent_);
  }

  /**
   * Disconnect messenger.
   */
  disconnect() {
    if (this.onCommand_) {
      this.onCommand_ = null;
      if (this.port_) {
        closePort(this.port_);
        this.port_ = null;
      }
      this.win_.removeEventListener('message', this.boundHandleEvent_);
      if (this.channels_) {
        for (const k in this.channels_) {
          const channelObj = this.channels_[k];
          if (channelObj.port1) {
            closePort(channelObj.port1);
          }
          if (channelObj.port2) {
            closePort(channelObj.port2);
          }
        }
        this.channels_ = null;
      }
    }
  }

  /**
   * Returns whether the messenger has been connected already.
   * @return {boolean}
   */
  isConnected() {
    return this.targetOrigin_ != null;
  }

  /**
   * Returns the messaging target. Only available when connection has been
   * establihsed.
   * @return {!Window}
   */
  getTarget() {
    const target = this.getOptionalTarget_();
    if (!target) {
      throw new Error('not connected');
    }
    return target;
  }

  /**
   * @return {?Window}
   * @private
   */
  getOptionalTarget_() {
    if (this.onCommand_ && !this.target_) {
      if (typeof this.targetOrCallback_ == 'function') {
        this.target_ = this.targetOrCallback_();
      } else {
        this.target_ = /** @type {!Window} */ (this.targetOrCallback_);
      }
    }
    return this.target_;
  }

  /**
   * Returns the messaging origin. Only available when connection has been
   * establihsed.
   * @return {string}
   */
  getTargetOrigin() {
    if (this.targetOrigin_ == null) {
      throw new Error('not connected');
    }
    return this.targetOrigin_;
  }

  /**
   * The host sends this message to the client to indicate that it's ready to
   * start communicating. The client is expected to respond back with the
   * "start" command. See `sendStartCommand` method.
   */
  sendConnectCommand() {
    // TODO(dvoytenko): MessageChannel is critically necessary for IE/Edge,
    // since window messaging doesn't always work. It's also preferred as an API
    // for other browsers: it's newer, cleaner and arguably more secure.
    // Unfortunately, browsers currently do not propagate user gestures via
    // MessageChannel, only via window messaging. This should be re-enabled
    // once browsers fix user gesture propagation.
    // See:
    // Safari: https://bugs.webkit.org/show_bug.cgi?id=186593
    // Chrome: https://bugs.chromium.org/p/chromium/issues/detail?id=851493
    // Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1469422
    const acceptsChannel = isIeBrowser(this.win_) || isEdgeBrowser(this.win_);
    this.sendCommand('connect', {'acceptsChannel': acceptsChannel});
  }

  /**
   * The client sends this message to the host upon receiving the "connect"
   * message to start the main communication channel. As a payload, the message
   * will contain the provided start arguments.
   * @param {?Object} args
   */
  sendStartCommand(args) {
    let channel = null;
    if (this.acceptsChannel_ && typeof this.win_.MessageChannel == 'function') {
      channel = new this.win_.MessageChannel();
    }
    if (channel) {
      this.sendCommand('start', args, [channel.port2]);
      // It's critical to switch to port messaging only after "start" has been
      // sent. Otherwise, it won't be delivered.
      this.switchToChannel_(channel.port1);
    } else {
      this.sendCommand('start', args);
    }
  }

  /**
   * Sends the specified command from the port to the host or vice versa.
   * @param {string} cmd
   * @param {?Object=} opt_payload
   * @param {?Array=} opt_transfer
   */
  sendCommand(cmd, opt_payload, opt_transfer) {
    const data = {
      'sentinel': SENTINEL,
      'cmd': cmd,
      'payload': opt_payload || null,
    };
    if (this.port_) {
      this.port_.postMessage(data, opt_transfer || undefined);
    } else {
      const target = this.getTarget();
      // Only "connect" command is allowed to use `targetOrigin == '*'`
      const targetOrigin =
          cmd == 'connect' ?
          (this.targetOrigin_ != null ? this.targetOrigin_ : '*') :
          this.getTargetOrigin();
      target.postMessage(data, targetOrigin, opt_transfer || undefined);
    }
  }

  /**
   * Sends a message to the client.
   * @param {!Object} payload
   */
  customMessage(payload) {
    this.sendCommand('msg', payload);
  }

  /**
   * Registers a callback to receive messages from the client.
   * @param {function(!Object)} callback
   */
  onCustomMessage(callback) {
    this.onCustomMessage_ = callback;
  }

  /**
   * @param {string=} opt_name
   * @return {!Promise<!MessagePort>}
   */
  startChannel(opt_name) {
    const name = opt_name || '';
    const channelObj = this.getChannelObj_(name);
    if (!channelObj.port1) {
      const channel = new this.win_.MessageChannel();
      channelObj.port1 = channel.port1;
      channelObj.port2 = channel.port2;
      channelObj.resolver(channelObj.port1);
    }
    if (channelObj.port2) {
      // Not yet sent.
      this.sendCommand('cnset', {'name': name}, [channelObj.port2]);
      channelObj.port2 = null;
    }
    return channelObj.promise;
  }

  /**
   * @param {string=} opt_name
   * @return {!Promise<!MessagePort>}
   */
  askChannel(opt_name) {
    const name = opt_name || '';
    const channelObj = this.getChannelObj_(name);
    if (!channelObj.port1) {
      this.sendCommand('cnget', {'name': name});
    }
    return channelObj.promise;
  }

  /**
   * @param {string} name
   * @param {!MessagePort} port
   * @private
   */
  receiveChannel_(name, port) {
    const channelObj = this.getChannelObj_(name);
    channelObj.port1 = port;
    channelObj.resolver(port);
  }

  /**
   * @param {string} name
   * @return {!ChannelHolder}
   */
  getChannelObj_(name) {
    if (!this.channels_) {
      this.channels_ = {};
    }
    let channelObj = this.channels_[name];
    if (!channelObj) {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      channelObj = {
        port1: null,
        port2: null,
        resolver,
        promise,
      };
      this.channels_[name] = channelObj;
    }
    return channelObj;
  }

  /**
   * @param {!MessagePort} port
   * @private
   */
  switchToChannel_(port) {
    if (this.port_) {
      closePort(this.port_);
    }
    this.port_ = port;
    this.port_.onmessage = event => {
      const data = event.data;
      const cmd = data && data['cmd'];
      const payload = data && data['payload'] || null;
      if (cmd) {
        this.handleCommand_(cmd, payload, event);
      }
    };
    // Even though all messaging will switch to ports, the window-based message
    // listener will be preserved just in case the host is refreshed and needs
    // another connection.
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleEvent_(event) {
    const data = event.data;
    if (!data || data['sentinel'] != SENTINEL) {
      return;
    }
    const cmd = data['cmd'];
    if (this.port_ && cmd != 'connect' && cmd != 'start') {
      // Messaging channel has already taken over. However, the "connect" and
      // "start" commands are allowed to proceed in case re-connection is
      // requested.
      return;
    }
    const origin = /** @type {string} */ (event.origin);
    const payload = data['payload'] || null;
    if (this.targetOrigin_ == null && cmd == 'start') {
      this.targetOrigin_ = origin;
    }
    if (this.targetOrigin_ == null && event.source) {
      if (this.getOptionalTarget_() == event.source) {
        this.targetOrigin_ = origin;
      }
    }
    // Notice that event.source may differ from the target because of
    // friendly-iframe intermediaries.
    if (origin != this.targetOrigin_) {
      return;
    }
    this.handleCommand_(cmd, payload, event);
  }

  /**
   * @param {string} cmd
   * @param {?Object} payload
   * @param {!Event} event
   * @private
   */
  handleCommand_(cmd, payload, event) {
    if (cmd == 'connect') {
      if (this.port_) {
        // In case the port has already been open - close it to reopen it
        // again later.
        closePort(this.port_);
        this.port_ = null;
      }
      this.acceptsChannel_ = payload && payload['acceptsChannel'] || false;
      this.onCommand_(cmd, payload);
    } else if (cmd == 'start') {
      const port = event.ports && event.ports[0];
      if (port) {
        this.switchToChannel_(port);
      }
      this.onCommand_(cmd, payload);
    } else if (cmd == 'msg') {
      if (this.onCustomMessage_ != null && payload != null) {
        this.onCustomMessage_(payload);
      }
    } else if (cmd == 'cnget') {
      const name = payload['name'];
      this.startChannel(name);
    } else if (cmd == 'cnset') {
      const name = payload['name'];
      const port = event.ports[0];
      this.receiveChannel_(name, /** @type {!MessagePort} */ (port));
    } else {
      this.onCommand_(cmd, payload);
    }
  }
}


/**
 * @param {!MessagePort} port
 */
function closePort(port) {
  try {
    port.close();
  } catch (e) {
    // Ignore.
  }
}




/**
 * The `ActivityHost` implementation for the iframe activity. Unlike other
 * types of activities, this implementation can realistically request and
 * receive new size.
 *
 * @implements {ActivityHost}
 */
export class ActivityIframeHost {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!Window} */
    this.target_ = win.parent;

    /** @private @const {!Messenger} */
    this.messenger_ = new Messenger(
        this.win_,
        this.target_,
        /* targetOrigin */ null);

    /** @private {?Object} */
    this.args_ = null;

    /** @private {boolean} */
    this.connected_ = false;

    /** @private {?function(!ActivityHost)} */
    this.connectedResolver_ = null;

    /** @private @const {!Promise<!ActivityHost>} */
    this.connectedPromise_ = new Promise(resolve => {
      this.connectedResolver_ = resolve;
    });

    /** @private {boolean} */
    this.accepted_ = false;

    /** @private {?function(number, number, boolean)} */
    this.onResizeComplete_ = null;

    /** @private {?Element} */
    this.sizeContainer_ = null;

    /** @private {number} */
    this.lastMeasuredWidth_ = 0;

    /** @private {number} */
    this.lastRequestedHeight_ = 0;

    /** @private @const {function()} */
    this.boundResizeEvent_ = this.resizeEvent_.bind(this);
  }

  /**
   * Connects the activity to the client.
   * @return {!Promise<!ActivityHost>}
   */
  connect() {
    this.connected_ = false;
    this.accepted_ = false;
    this.messenger_.connect(this.handleCommand_.bind(this));
    this.messenger_.sendConnectCommand();
    return this.connectedPromise_;
  }

  /** @override */
  disconnect() {
    this.connected_ = false;
    this.accepted_ = false;
    this.messenger_.disconnect();
    this.win_.removeEventListener('resize', this.boundResizeEvent_);
  }

  /** @override */
  getRequestString() {
    this.ensureConnected_();
    // Not available for iframes.
    return null;
  }

  /** @override */
  getMode() {
    return ActivityMode.IFRAME;
  }

  /** @override */
  getTargetOrigin() {
    this.ensureConnected_();
    return this.messenger_.getTargetOrigin();
  }

  /** @override */
  isTargetOriginVerified() {
    this.ensureConnected_();
    // The origin is always verified via messaging.
    return true;
  }

  /** @override */
  isSecureChannel() {
    return true;
  }

  /** @override */
  accept() {
    this.ensureConnected_();
    this.accepted_ = true;
  }

  /** @override */
  getArgs() {
    this.ensureConnected_();
    return this.args_;
  }

  /**
   * Signals to the opener that the iframe is ready to be interacted with.
   * At this point, the host will start tracking iframe's size.
   * @override
   */
  ready() {
    this.ensureAccepted_();
    this.messenger_.sendCommand('ready');
    this.resized_();
    this.win_.addEventListener('resize', this.boundResizeEvent_);
  }

  /** @override */
  setSizeContainer(element) {
    this.sizeContainer_ = element;
  }

  /** @override */
  onResizeComplete(callback) {
    this.onResizeComplete_ = callback;
  }

  /** @override */
  resized() {
    setTimeout(() => this.resized_(), 50);
  }

  /** @override */
  isMessagingSupported() {
    return true;
  }

  /** @override */
  message(payload) {
    this.ensureAccepted_();
    this.messenger_.customMessage(payload);
  }

  /** @override */
  onMessage(callback) {
    this.ensureAccepted_();
    this.messenger_.onCustomMessage(callback);
  }

  /** @override */
  messageChannel(opt_name) {
    this.ensureAccepted_();
    return this.messenger_.startChannel(opt_name);
  }

  /** @override */
  result(data) {
    this.sendResult_(ActivityResultCode.OK, data);
  }

  /** @override */
  cancel() {
    this.sendResult_(ActivityResultCode.CANCELED, /* data */ null);
  }

  /** @override */
  failed(reason) {
    this.sendResult_(ActivityResultCode.FAILED, String(reason));
  }

  /** @private */
  ensureConnected_() {
    if (!this.connected_) {
      throw new Error('not connected');
    }
  }

  /** @private */
  ensureAccepted_() {
    if (!this.accepted_) {
      throw new Error('not accepted');
    }
  }

  /**
   * @param {!ActivityResultCode} code
   * @param {*} data
   * @private
   */
  sendResult_(code, data) {
    // Only require "accept" for successful return.
    if (code == ActivityResultCode.OK) {
      this.ensureAccepted_();
    } else {
      this.ensureConnected_();
    }
    this.messenger_.sendCommand('result', {
      'code': code,
      'data': data,
    });
    // Do not disconnect, wait for "close" message to ack the result receipt.
  }

  /**
   * @param {string} cmd
   * @param {?Object} payload
   * @private
   */
  handleCommand_(cmd, payload) {
    if (cmd == 'start') {
      // Response to "connect" command.
      this.args_ = payload;
      this.connected_ = true;
      this.connectedResolver_(this);
      this.connectedResolver_ = null;
    } else if (cmd == 'close') {
      this.disconnect();
    } else if (cmd == 'resized') {
      const allowedHeight = payload['height'];
      if (this.onResizeComplete_) {
        this.onResizeComplete_(
            allowedHeight,
            this.lastRequestedHeight_,
            allowedHeight < this.lastRequestedHeight_);
      }
    }
  }

  /** @private */
  resized_() {
    if (this.sizeContainer_) {
      const requestedHeight = this.sizeContainer_.scrollHeight;
      if (requestedHeight != this.lastRequestedHeight_) {
        this.lastRequestedHeight_ = requestedHeight;
        this.messenger_.sendCommand('resize', {
          'height': this.lastRequestedHeight_,
        });
      }
    }
  }

  /** @private */
  resizeEvent_() {
    const width = this.win_./*OK*/innerWidth;
    if (this.lastMeasuredWidth_ != width) {
      this.lastMeasuredWidth_ = width;
      this.resized();
    }
  }
}




/**
 * The `ActivityHost` implementation for the standalone window activity
 * executed as a popup. The communication is done via a secure messaging
 * channel with a client. However, if messaging channel cannot be established,
 * this type of host delegates to the redirect host.
 *
 * @implements {ActivityHost}
 */
export class ActivityWindowPopupHost {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    if (!win.opener || win.opener == win) {
      throw new Error('No window.opener');
    }

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!Window} */
    this.target_ = win.opener;

    /** @private @const {!Messenger} */
    this.messenger_ = new Messenger(
        this.win_,
        this.target_,
        /* targetOrigin */ null);

    /** @private {?Object} */
    this.args_ = null;

    /** @private {boolean} */
    this.connected_ = false;

    /** @private {?function(!ActivityHost)} */
    this.connectedResolver_ = null;

    /** @private @const {!Promise<!ActivityHost>} */
    this.connectedPromise_ = new Promise(resolve => {
      this.connectedResolver_ = resolve;
    });

    /** @private {boolean} */
    this.accepted_ = false;

    /** @private {?function(number, number, boolean)} */
    this.onResizeComplete_ = null;

    /** @private {?Element} */
    this.sizeContainer_ = null;

    /** @private @const {!ActivityWindowRedirectHost} */
    this.redirectHost_ = new ActivityWindowRedirectHost(this.win_);

    /** @private @const {!Function} */
    this.boundUnload_ = this.unload_.bind(this);
  }

  /**
   * Connects the activity to the client.
   * @param {(?ActivityRequest|?string)=} opt_request
   * @return {!Promise<!ActivityHost>}
   */
  connect(opt_request) {
    this.connected_ = false;
    this.accepted_ = false;
    return this.redirectHost_.connect(opt_request).then(() => {
      this.messenger_.connect(this.handleCommand_.bind(this));
      this.messenger_.sendConnectCommand();
      // Give the popup channel ~5 seconds to connect and if it can't,
      // assume that the client is offloaded and proceed with redirect.
      setTimeout(() => {
        if (this.connectedResolver_) {
          this.connectedResolver_(this.redirectHost_);
          this.connectedResolver_ = null;
        }
      }, 5000);
      return this.connectedPromise_;
    });
  }

  /** @override */
  disconnect() {
    this.connected_ = false;
    this.accepted_ = false;
    this.messenger_.disconnect();
    this.win_.removeEventListener('unload', this.boundUnload_);

    // Try to close the window. A similar attempt will be made by the client
    // port.
    try {
      this.win_.close();
    } catch (e) {
      // Ignore.
    }
    // TODO(dvoytenko): consider an optional "failed to close" callback. Wait
    // for ~5s and check `this.win_.closed`.
  }

  /** @override */
  getRequestString() {
    this.ensureConnected_();
    return this.redirectHost_.getRequestString();
  }

  /** @override */
  getMode() {
    return ActivityMode.POPUP;
  }

  /** @override */
  getTargetOrigin() {
    this.ensureConnected_();
    return this.messenger_.getTargetOrigin();
  }

  /** @override */
  isTargetOriginVerified() {
    this.ensureConnected_();
    // The origin is always verified via messaging.
    return true;
  }

  /** @override */
  isSecureChannel() {
    return true;
  }

  /** @override */
  accept() {
    this.ensureConnected_();
    this.accepted_ = true;
  }

  /** @override */
  getArgs() {
    this.ensureConnected_();
    return this.args_;
  }

  /** @override */
  ready() {
    this.ensureAccepted_();
    this.messenger_.sendCommand('ready');
  }

  /** @override */
  setSizeContainer(element) {
    this.sizeContainer_ = element;
  }

  /** @override */
  onResizeComplete(callback) {
    this.onResizeComplete_ = callback;
  }

  /** @override */
  resized() {
    setTimeout(() => this.resized_(), 50);
  }

  /** @override */
  isMessagingSupported() {
    return false;
  }

  /** @override */
  message() {
    this.ensureAccepted_();
    // Not supported for compatibility with redirect mode.
  }

  /** @override */
  onMessage() {
    this.ensureAccepted_();
    // Not supported for compatibility with redirect mode.
  }

  /** @override */
  messageChannel(opt_name) {
    this.ensureAccepted_();
    throw new Error('not supported');
  }

  /** @override */
  result(data) {
    this.sendResult_(ActivityResultCode.OK, data);
  }

  /** @override */
  cancel() {
    this.sendResult_(ActivityResultCode.CANCELED, /* data */ null);
  }

  /** @override */
  failed(reason) {
    this.sendResult_(ActivityResultCode.FAILED, String(reason));
  }

  /** @private */
  ensureConnected_() {
    if (!this.connected_) {
      throw new Error('not connected');
    }
  }

  /** @private */
  ensureAccepted_() {
    if (!this.accepted_) {
      throw new Error('not accepted');
    }
  }

  /**
   * @param {!ActivityResultCode} code
   * @param {*} data
   * @private
   */
  sendResult_(code, data) {
    // Only require "accept" for successful return.
    if (code == ActivityResultCode.OK) {
      this.ensureAccepted_();
    } else {
      this.ensureConnected_();
    }
    this.messenger_.sendCommand('result', {
      'code': code,
      'data': data,
    });
    // Do not disconnect, wait for "close" message to ack the result receipt.
    this.win_.removeEventListener('unload', this.boundUnload_);
    // TODO(dvoytenko): Consider taking an action if result acknowledgement
    // does not arrive in some time (3-5s). For instance, we can redirect
    // back or ask the host implementer to take an action.
  }

  /**
   * @param {string} cmd
   * @param {?Object} payload
   * @private
   */
  handleCommand_(cmd, payload) {
    if (cmd == 'start') {
      // Response to "connect" command.
      this.args_ = payload;
      this.connected_ = true;
      this.connectedResolver_(this);
      this.win_.addEventListener('unload', this.boundUnload_);
    } else if (cmd == 'close') {
      this.disconnect();
    }
  }

  /** @private */
  resized_() {
    if (this.sizeContainer_) {
      const requestedHeight = this.sizeContainer_.scrollHeight;
      const allowedHeight = this.win_./*OK*/innerHeight;
      if (this.onResizeComplete_) {
        this.onResizeComplete_(
            allowedHeight,
            requestedHeight,
            allowedHeight < requestedHeight);
      }
    }
  }

  /** @private */
  unload_() {
    this.messenger_.sendCommand('check', {});
  }
}


/**
 * The `ActivityHost` implementation for the standalone window activity
 * executed via redirect. The channel is not secure since the parameters
 * and the results are passed around in the redirect URL and thus can be
 * exploited or consumed by a 3rd-party.
 *
 * @implements {ActivityHost}
 */
export class ActivityWindowRedirectHost {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?string} */
    this.requestId_ = null;

    /** @private {?string} */
    this.returnUrl_ = null;

    /** @private {?string} */
    this.targetOrigin_ = null;

    /** @private {boolean} */
    this.targetOriginVerified_ = false;

    /** @private {?Object} */
    this.args_ = null;

    /** @private {boolean} */
    this.connected_ = false;

    /** @private {boolean} */
    this.accepted_ = false;

    /** @private {?function(number, number, boolean)} */
    this.onResizeComplete_ = null;

    /** @private {?Element} */
    this.sizeContainer_ = null;
  }

  /**
   * Connects the activity to the client.
   *
   * Notice, if `opt_request` parameter is specified, the host explicitly
   * trusts all fields encoded in this request.
   *
   * @param {(?ActivityRequest|?string)=} opt_request
   * @return {!Promise}
   */
  connect(opt_request) {
    return Promise.resolve().then(() => {
      this.connected_ = false;
      this.accepted_ = false;
      let request;
      if (opt_request && typeof opt_request == 'object') {
        request = opt_request;
      } else {
        let requestTrusted = false;
        let requestString;
        if (opt_request && typeof opt_request == 'string') {
          // When request is passed as an argument, it's parsed as "trusted".
          requestTrusted = true;
          requestString = opt_request;
        } else {
          const fragmentRequestParam =
              getQueryParam(this.win_.location.hash, '__WA__');
          if (fragmentRequestParam) {
            requestString = decodeURIComponent(fragmentRequestParam);
          }
        }
        if (requestString) {
          request = parseRequest(requestString, requestTrusted);
        }
      }
      if (!request || !request.requestId || !request.returnUrl) {
        throw new Error('Request must have requestId and returnUrl');
      }
      this.requestId_ = request.requestId;
      this.args_ = request.args;
      this.returnUrl_ = request.returnUrl;
      if (request.origin) {
        // Trusted request: trust origin and verified flag explicitly.
        this.targetOrigin_ = request.origin;
        this.targetOriginVerified_ = request.originVerified || false;
      } else {
        // Otherwise, infer the origin/verified from other parameters.
        this.targetOrigin_ = getOriginFromUrl(request.returnUrl);
        // Use referrer to conditionally verify the origin. Notice, that
        // the channel security will remain "not secure".
        const referrerOrigin = (this.win_.document.referrer &&
            getOriginFromUrl(this.win_.document.referrer));
        this.targetOriginVerified_ = (referrerOrigin == this.targetOrigin_);
      }
      this.connected_ = true;
      return this;
    });
  }

  /** @override */
  disconnect() {
    this.connected_ = false;
    this.accepted_ = false;
  }

  /** @override */
  getRequestString() {
    this.ensureConnected_();
    return serializeRequest({
      requestId: /** @type {string} */ (this.requestId_),
      returnUrl: /** @type {string} */ (this.returnUrl_),
      args: this.args_,
      origin: /** @type {string} */ (this.targetOrigin_),
      originVerified: this.targetOriginVerified_,
    });
  }

  /** @override */
  getMode() {
    return ActivityMode.REDIRECT;
  }

  /** @override */
  getTargetOrigin() {
    this.ensureConnected_();
    return /** @type {string} */ (this.targetOrigin_);
  }

  /** @override */
  isTargetOriginVerified() {
    this.ensureConnected_();
    return this.targetOriginVerified_;
  }

  /** @override */
  isSecureChannel() {
    return false;
  }

  /** @override */
  accept() {
    this.ensureConnected_();
    this.accepted_ = true;
  }

  /** @override */
  getArgs() {
    this.ensureConnected_();
    return this.args_;
  }

  /** @override */
  ready() {
    this.ensureAccepted_();
  }

  /** @override */
  setSizeContainer(element) {
    this.sizeContainer_ = element;
  }

  /** @override */
  onResizeComplete(callback) {
    this.onResizeComplete_ = callback;
  }

  /** @override */
  resized() {
    setTimeout(() => this.resized_(), 50);
  }

  /** @override */
  isMessagingSupported() {
    return false;
  }

  /** @override */
  message() {
    this.ensureAccepted_();
    // Not supported. Infeasible.
  }

  /** @override */
  onMessage() {
    this.ensureAccepted_();
    // Not supported. Infeasible.
  }

  /** @override */
  messageChannel(opt_name) {
    this.ensureAccepted_();
    throw new Error('not supported');
  }

  /** @override */
  result(data) {
    this.sendResult_(ActivityResultCode.OK, data);
  }

  /** @override */
  cancel() {
    this.sendResult_(ActivityResultCode.CANCELED, /* data */ null);
  }

  /** @override */
  failed(reason) {
    this.sendResult_(ActivityResultCode.FAILED, String(reason));
  }

  /** @private */
  ensureConnected_() {
    if (!this.connected_) {
      throw new Error('not connected');
    }
  }

  /** @private */
  ensureAccepted_() {
    if (!this.accepted_) {
      throw new Error('not accepted');
    }
  }

  /**
   * @param {!ActivityResultCode} code
   * @param {*} data
   * @private
   */
  sendResult_(code, data) {
    // Only require "accept" for successful return.
    if (code == ActivityResultCode.OK) {
      this.ensureAccepted_();
    } else {
      this.ensureConnected_();
    }
    const response = {
      'requestId': this.requestId_,
      'origin': getWindowOrigin(this.win_),
      'code': code,
      'data': data,
    };
    const returnUrl =
        this.returnUrl_ +
        (this.returnUrl_.indexOf('#') == -1 ? '#' : '&') +
        '__WA_RES__=' + encodeURIComponent(JSON.stringify(response));
    this.redirect_(returnUrl);
  }

  /**
   * @param {string} returnUrl
   * @private
   */
  redirect_(returnUrl) {
    if (this.win_.location.replace) {
      this.win_.location.replace(returnUrl);
    } else {
      this.win_.location.assign(returnUrl);
    }
  }

  /** @private */
  resized_() {
    if (this.sizeContainer_) {
      const requestedHeight = this.sizeContainer_.scrollHeight;
      const allowedHeight = this.win_./*OK*/innerHeight;
      if (this.onResizeComplete_) {
        this.onResizeComplete_(
            allowedHeight,
            requestedHeight,
            allowedHeight < requestedHeight);
      }
    }
  }
}




/**
 * The page-level activities manager for hosts. This class is intended to be
 * used as a singleton. It can be used to connect an activity host of any type:
 * an iframe, a popup, or a redirect.
 */
export class ActivityHosts {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {string} */
    this.version = '1.12';

    /** @private @const {!Window} */
    this.win_ = win;
  }

  /**
   * Start activity implementation handler (host).
   * @param {(?ActivityRequest|?string)=} opt_request
   * @return {!Promise<!ActivityHost>}
   */
  connectHost(opt_request) {
    let host;
    if (this.win_.top != this.win_) {
      // Iframe host.
      host = new ActivityIframeHost(this.win_);
    } else if (this.win_.opener && this.win_.opener != this.win_ &&
          !this.win_.opener.closed) {
      // Window host: popup.
      host = new ActivityWindowPopupHost(this.win_);
    } else {
      // Window host: redirect.
      host = new ActivityWindowRedirectHost(this.win_);
    }
    return host.connect(opt_request);
  }
}

