/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
/** Version: 0.1.22.27 */
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

/*eslint no-unused-vars: 0*/


/**
 * @enum {string}
 */
const ActivityMode = {
  IFRAME: 'iframe',
  POPUP: 'popup',
  REDIRECT: 'redirect',
};


/**
 * The result code used for `ActivityResult`.
 * @enum {string}
 */
const ActivityResultCode = {
  OK: 'ok',
  CANCELED: 'canceled',
  FAILED: 'failed',
};


/**
 * The result of an activity. The activity implementation returns this object
 * for a successful result, a cancelation or a failure.
 * @struct
 */
class ActivityResult {
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
let ActivityRequest;


/**
 * The activity "open" options used for popups and redirects.
 *
 * - returnUrl: override the return URL. By default, the current URL will be
 *   used.
 * - skipRequestInUrl: removes the activity request from the URL, in case
 *   redirect is used. By default, the activity request is appended to the
 *   activity URL. This option can be used if the activity request is passed
 *   to the activity by some alternative means.
 *
 * @typedef {{
 *   returnUrl: (string|undefined),
 *   skipRequestInUrl: (boolean|undefined),
 *   width: (number|undefined),
 *   height: (number|undefined),
 * }}
 */
let ActivityOpenOptions;


/**
 * Activity client-side binding. The port provides limited ways to communicate
 * with the activity and receive signals and results from it. Not every type
 * of activity exposes a port.
 *
 * @interface
 */
class ActivityPort {

  /**
   * Returns the mode of the activity: iframe, popup or redirect.
   * @return {!ActivityMode}
   */
  getMode() {}

  /**
   * Accepts the result when ready. The client should verify the activity's
   * mode, origin, verification and secure channel flags before deciding
   * whether or not to trust the result.
   *
   * Returns the promise that yields when the activity has been completed and
   * either a result, a cancelation or a failure has been returned.
   *
   * @return {!Promise<!ActivityResult>}
   */
  acceptResult() {}
}



/** DOMException.ABORT_ERR name */
const ABORT_ERR_NAME = 'AbortError';

/** DOMException.ABORT_ERR = 20 */
const ABORT_ERR_CODE = 20;

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
  if (loc.origin) {
    return loc.origin;
  }
  // Make sure that the origin is normalized. Specifically on IE, host sometimes
  // includes the default port, which is not per standard.
  const protocol = loc.protocol;
  let host = loc.host;
  if (protocol == 'https:' && host.indexOf(':443') == host.length - 4) {
    host = host.replace(':443', '');
  } else if (protocol == 'http:' && host.indexOf(':80') == host.length - 3) {
    host = host.replace(':80', '');
  }
  return protocol + '//' + host;
}


/**
 * @param {string} urlString
 * @return {string}
 */
function getOriginFromUrl(urlString) {
  return getOrigin(parseUrl(urlString));
}


/**
 * @param {string} urlString
 * @return {string}
 */
function removeFragment(urlString) {
  const index = urlString.indexOf('#');
  if (index == -1) {
    return urlString;
  }
  return urlString.substring(0, index);
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
 * Add a query-like parameter to the fragment string.
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @return {string}
 */
function addFragmentParam(url, param, value) {
  return url +
      (url.indexOf('#') == -1 ? '#' : '&') +
      encodeURIComponent(param) + '=' + encodeURIComponent(value);
}


/**
 * @param {string} queryString  A query string in the form of "a=b&c=d". Could
 *   be optionally prefixed with "?" or "#".
 * @param {string} param The param to remove from the query string.
 * @return {?string}
 */
function removeQueryParam(queryString, param) {
  if (!queryString) {
    return queryString;
  }
  const search = encodeURIComponent(param) + '=';
  let index = -1;
  do {
    index = queryString.indexOf(search, index);
    if (index != -1) {
      const prev = index > 0 ? queryString.substring(index - 1, index) : '';
      if (prev == '' || prev == '?' || prev == '#' || prev == '&') {
        let end = queryString.indexOf('&', index + 1);
        if (end == -1) {
          end = queryString.length;
        }
        queryString =
            queryString.substring(0, index) +
            queryString.substring(end + 1);
      } else {
        index++;
      }
    }
  } while (index != -1 && index < queryString.length);
  return queryString;
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
 * Creates or emulates a DOMException of AbortError type.
 * See https://heycam.github.io/webidl/#aborterror.
 * @param {!Window} win
 * @param {string=} opt_message
 * @return {!DOMException}
 */
function createAbortError(win, opt_message) {
  const message = 'AbortError' + (opt_message ? ': ' + opt_message : '');
  let error = null;
  if (typeof win['DOMException'] == 'function') {
    // TODO(dvoytenko): remove typecast once externs are fixed.
    const constr = /** @type {function(new:DOMException, string, string)} */ (
        win['DOMException']);
    try {
      error = new constr(message, ABORT_ERR_NAME);
    } catch (e) {
      // Ignore. In particular, `new DOMException()` fails in Edge.
    }
  }
  if (!error) {
    // TODO(dvoytenko): remove typecast once externs are fixed.
    const constr = /** @type {function(new:DOMException, string)} */ (
        Error);
    error = new constr(message);
    error.name = ABORT_ERR_NAME;
    error.code = ABORT_ERR_CODE;
  }
  return error;
}


/**
 * Resolves the activity result as a promise:
 *  - `OK` result is yielded as the promise's payload;
 *  - `CANCEL` result is rejected with the `AbortError`;
 *  - `FAILED` result is rejected with the embedded error.
 *
 * @param {!Window} win
 * @param {!ActivityResult} result
 * @param {function((!ActivityResult|!Promise))} resolver
 */
function resolveResult(win, result, resolver) {
  if (result.ok) {
    resolver(result);
  } else {
    const error = result.error || createAbortError(win);
    error.activityResult = result;
    resolver(Promise.reject(error));
  }
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
   * @param {!MessageEvent} event
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
   * @param {!MessageEvent} event
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
 * The `ActivityPort` implementation for the iframe case. Unlike other types
 * of activities, iframe-based activities are always connected and can react
 * to size requests.
 *
 * @implements {ActivityPort}
 */
class ActivityIframePort {

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {string} url
   * @param {?Object=} opt_args
   */
  constructor(iframe, url, opt_args) {
    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ = iframe;
    /** @private @const {string} */
    this.url_ = url;
    /** @private @const {?Object} */
    this.args_ = opt_args || null;

    /** @private @const {!Window} */
    this.win_ = /** @type {!Window} */ (this.iframe_.ownerDocument.defaultView);

    /** @private @const {string} */
    this.targetOrigin_ = getOriginFromUrl(url);

    /** @private {boolean} */
    this.connected_ = false;

    /** @private {?function()} */
    this.connectedResolver_ = null;

    /** @private @const {!Promise} */
    this.connectedPromise_ = new Promise(resolve => {
      this.connectedResolver_ = resolve;
    });

    /** @private {?function()} */
    this.readyResolver_ = null;

    /** @private @const {!Promise} */
    this.readyPromise_ = new Promise(resolve => {
      this.readyResolver_ = resolve;
    });

    /** @private {?function((!ActivityResult|!Promise))} */
    this.resultResolver_ = null;

    /** @private @const {!Promise<!ActivityResult>} */
    this.resultPromise_ = new Promise(resolve => {
      this.resultResolver_ = resolve;
    });

    /** @private {?function(number)} */
    this.onResizeRequest_ = null;

    /** @private {?number} */
    this.requestedHeight_ = null;

    /** @private @const {!Messenger} */
    this.messenger_ = new Messenger(
        this.win_,
        () => this.iframe_.contentWindow,
        this.targetOrigin_);
  }

  /** @override */
  getMode() {
    return ActivityMode.IFRAME;
  }

  /**
   * Waits until the activity port is connected to the host.
   * @return {!Promise}
   */
  connect() {
    if (!this.win_.document.documentElement.contains(this.iframe_)) {
      throw new Error('iframe must be in DOM');
    }
    this.messenger_.connect(this.handleCommand_.bind(this));
    this.iframe_.src = this.url_;
    return this.connectedPromise_;
  }

  /**
   * Disconnect the activity binding and cleanup listeners.
   */
  disconnect() {
    this.connected_ = false;
    this.messenger_.disconnect();
  }

  /** @override */
  acceptResult() {
    return this.resultPromise_;
  }

  /**
   * Sends a message to the host.
   * @param {!Object} payload
   */
  message(payload) {
    this.messenger_.customMessage(payload);
  }

  /**
   * Registers a callback to receive messages from the host.
   * @param {function(!Object)} callback
   */
  onMessage(callback) {
    this.messenger_.onCustomMessage(callback);
  }

  /**
   * Creates a new communication channel or returns an existing one.
   * @param {string=} opt_name
   * @return {!Promise<!MessagePort>}
   */
  messageChannel(opt_name) {
    return this.messenger_.askChannel(opt_name);
  }

  /**
   * Returns a promise that yields when the iframe is ready to be interacted
   * with.
   * @return {!Promise}
   */
  whenReady() {
    return this.readyPromise_;
  }

  /**
   * Register a callback to handle resize requests. Once successfully resized,
   * ensure to call `resized()` method.
   * @param {function(number)} callback
   */
  onResizeRequest(callback) {
    this.onResizeRequest_ = callback;
    Promise.resolve().then(() => {
      if (this.requestedHeight_ != null) {
        callback(this.requestedHeight_);
      }
    });
  }

  /**
   * Signals back to the activity implementation that the client has updated
   * the activity's size.
   */
  resized() {
    if (!this.connected_) {
      return;
    }
    const height = this.iframe_.offsetHeight;
    this.messenger_.sendCommand('resized', {'height': height});
  }

  /**
   * @param {string} cmd
   * @param {?Object} payload
   * @private
   */
  handleCommand_(cmd, payload) {
    if (cmd == 'connect') {
      // First ever message. Indicates that the receiver is listening.
      this.connected_ = true;
      this.messenger_.sendStartCommand(this.args_);
      this.connectedResolver_();
    } else if (cmd == 'result') {
      // The last message. Indicates that the result has been received.
      if (this.resultResolver_) {
        const code = /** @type {!ActivityResultCode} */ (payload['code']);
        const data =
            code == ActivityResultCode.FAILED ?
            new Error(payload['data'] || '') :
            payload['data'];
        const result = new ActivityResult(
            code,
            data,
            ActivityMode.IFRAME,
            this.messenger_.getTargetOrigin(),
            /* originVerified */ true,
            /* secureChannel */ true);
        resolveResult(this.win_, result, this.resultResolver_);
        this.resultResolver_ = null;
        this.messenger_.sendCommand('close');
        this.disconnect();
      }
    } else if (cmd == 'ready') {
      if (this.readyResolver_) {
        this.readyResolver_();
        this.readyResolver_ = null;
      }
    } else if (cmd == 'resize') {
      this.requestedHeight_ = /** @type {number} */ (payload['height']);
      if (this.onResizeRequest_) {
        this.onResizeRequest_(this.requestedHeight_);
      }
    }
  }
}




/**
 * The `ActivityPort` implementation for the standalone window activity
 * client executed as a popup.
 *
 * @implements {ActivityPort}
 */
class ActivityWindowPort {

  /**
   * @param {!Window} win
   * @param {string} requestId
   * @param {string} url
   * @param {string} target
   * @param {?Object=} opt_args
   * @param {?ActivityOpenOptions=} opt_options
   */
  constructor(win, requestId, url, target, opt_args, opt_options) {
    const isValidTarget =
        target &&
        (target == '_blank' || target == '_top' || target[0] != '_');
    if (!isValidTarget) {
      throw new Error('The only allowed targets are "_blank", "_top"' +
          ' and name targets');
    }

    /** @private @const {!Window} */
    this.win_ = win;
    /** @private @const {string} */
    this.requestId_ = requestId;
    /** @private @const {string} */
    this.url_ = url;
    /** @private @const {string} */
    this.openTarget_ = target;
    /** @private @const {?Object} */
    this.args_ = opt_args || null;
    /** @private @const {?ActivityOpenOptions} */
    this.options_ = opt_options || null;

    /** @private {?function((!ActivityResult|!Promise))} */
    this.resultResolver_ = null;

    /** @private @const {!Promise<!ActivityResult>} */
    this.resultPromise_ = new Promise(resolve => {
      this.resultResolver_ = resolve;
    });

    /** @private {?Window} */
    this.targetWin_ = null;

    /** @private {?number} */
    this.heartbeatInterval_ = null;

    /** @private {?Messenger} */
    this.messenger_ = null;
  }

  /** @override */
  getMode() {
    return this.openTarget_ == '_top' ?
        ActivityMode.REDIRECT :
        ActivityMode.POPUP;
  }

  /**
   * Opens the activity in a window, either as a popup or via redirect.
   *
   * Returns the promise that will yield when the window returns or closed.
   * Notice, that this promise may never complete if "redirect" mode was used.
   *
   * @return {!Promise}
   */
  open() {
    return this.openInternal_();
  }

  /**
   * @return {?Window}
   */
  getTargetWin() {
    return this.targetWin_;
  }

  /**
   * Disconnect the activity binding and cleanup listeners.
   */
  disconnect() {
    if (this.heartbeatInterval_) {
      this.win_.clearInterval(this.heartbeatInterval_);
      this.heartbeatInterval_ = null;
    }
    if (this.messenger_) {
      this.messenger_.disconnect();
      this.messenger_ = null;
    }
    if (this.targetWin_) {
      // Try to close the popup window. The host will also try to do the same.
      try {
        this.targetWin_.close();
      } catch (e) {
        // Ignore.
      }
      this.targetWin_ = null;
    }
    this.resultResolver_ = null;
  }

  /** @override */
  acceptResult() {
    return this.resultPromise_;
  }

  /**
   * This method wraps around window's open method. It first tries to execute
   * `open` call with the provided target and if it fails, it retries the call
   * with the `_top` target. This is necessary given that in some embedding
   * scenarios, such as iOS' WKWebView, navigation to `_blank` and other targets
   * is blocked by default.
   * @return {!Promise}
   * @private
   */
  openInternal_() {
    const featuresStr = this.buildFeatures_();

    // Protectively, the URL will contain the request payload, unless explicitly
    // directed not to via `skipRequestInUrl` option.
    let url = this.url_;
    if (!(this.options_ && this.options_.skipRequestInUrl)) {
      const returnUrl =
          this.options_ && this.options_.returnUrl ||
          removeFragment(this.win_.location.href);
      const requestString = serializeRequest({
        requestId: this.requestId_,
        returnUrl,
        args: this.args_,
      });
      url = addFragmentParam(url, '__WA__', requestString);
    }

    // Open the window.
    let targetWin;
    let openTarget = this.openTarget_;
    // IE does not support CORS popups - the popup has to fallback to redirect
    // mode.
    if (openTarget != '_top') {
      if (isIeBrowser(this.win_)) {
        openTarget = '_top';
      }
    }
    // Try first with the specified target. If we're inside the WKWebView or
    // a similar environments, this method is expected to fail by default for
    // all targets except `_top`.
    try {
      targetWin = this.win_.open(url, openTarget, featuresStr);
    } catch (e) {
      // Ignore.
    }
    // Then try with `_top` target.
    if (!targetWin && openTarget != '_top') {
      openTarget = '_top';
      try {
        targetWin = this.win_.open(url, openTarget);
      } catch (e) {
        // Ignore.
      }
    }

    // Setup the target window.
    if (targetWin) {
      this.targetWin_ = targetWin;
      if (openTarget != '_top') {
        this.setupPopup_();
      }
    } else {
      this.disconnectWithError_(new Error('failed to open window'));
    }

    // Return result promise, even though it may never complete.
    return this.resultPromise_.catch(() => {
      // Ignore. Call to the `acceptResult()` should fail if needed.
    });
  }

  /**
   * @return {string}
   * @private
   */
  buildFeatures_() {
    // The max width and heights are calculated as following:
    // MaxSize = AvailSize - ControlsSize
    // ControlsSize = OuterSize - InnerSize
    const screen = this.win_.screen;
    const availWidth = screen.availWidth || screen.width;
    const availHeight = screen.availHeight || screen.height;
    const isTop = this.isTopWindow_();
    const isEdge = isEdgeBrowser(this.win_);
    // Limit controls to 100px width and height. Notice that it's only
    // possible to calculate controls size in the top window, not in iframes.
    // Notice that the Edge behavior is somewhat unique. If we can't find the
    // right width/height, it will launch in the full-screen. Other browsers
    // deal with such cases more gracefully.
    const controlsWidth =
        isTop && this.win_.outerWidth > this.win_.innerWidth ?
        Math.min(100, this.win_.outerWidth - this.win_.innerWidth) :
        (isEdge ? 100 : 0);
    const controlsHeight =
        isTop && this.win_.outerHeight > this.win_.innerHeight ?
        Math.min(100, this.win_.outerHeight - this.win_.innerHeight) :
        (isEdge ? 100 : 0);
    // With all the adjustments, at least 50% of the available width/height
    // should be made available to a popup.
    const maxWidth = Math.max(availWidth - controlsWidth, availWidth * 0.5);
    const maxHeight = Math.max(availHeight - controlsHeight, availHeight * 0.5);
    let w = Math.floor(Math.min(600, maxWidth * 0.9));
    let h = Math.floor(Math.min(600, maxHeight * 0.9));
    if (this.options_) {
      if (this.options_.width) {
        w = Math.min(this.options_.width, maxWidth);
      }
      if (this.options_.height) {
        h = Math.min(this.options_.height, maxHeight);
      }
    }
    const x = Math.floor((screen.width - w) / 2);
    const y = Math.floor((screen.height - h) / 2);
    const features = {
      'height': h,
      'width': w,
      'resizable': 'yes',
      'scrollbars': 'yes',
    };
    // Do not set left/top in Edge: it fails.
    if (!isEdge) {
      features['left'] = x;
      features['top'] = y;
    }
    let featuresStr = '';
    for (const f in features) {
      if (featuresStr) {
        featuresStr += ',';
      }
      featuresStr += `${f}=${features[f]}`;
    }
    return featuresStr;
  }

  /**
   * This method only exists to make iframe/top emulation possible in tests.
   * Otherwise `window.top` cannot be overridden.
   * @return {boolean}
   * @private
   */
  isTopWindow_() {
    return this.win_ == this.win_.top;
  }

  /** @private */
  setupPopup_() {
    // Keep alive to catch the window closing, which would indicate
    // "cancel" signal.
    this.heartbeatInterval_ = this.win_.setInterval(() => {
      this.check_(/* delayCancel */ true);
    }, 500);

    // Start up messaging. The messaging is explicitly allowed to proceed
    // without origin check b/c all arguments have already been passed in
    // the URL and special handling is enforced when result is delivered.
    this.messenger_ = new Messenger(
        this.win_,
        /** @type {!Window} */ (this.targetWin_),
        /* targetOrigin */ null);
    this.messenger_.connect(this.handleCommand_.bind(this));
  }

  /**
   * @param {boolean=} opt_delayCancel
   * @private
   */
  check_(opt_delayCancel) {
    if (!this.targetWin_ || this.targetWin_.closed) {
      if (this.heartbeatInterval_) {
        this.win_.clearInterval(this.heartbeatInterval_);
        this.heartbeatInterval_ = null;
      }
      // Give a chance for the result to arrive, but otherwise consider the
      // responce to be empty.
      this.win_.setTimeout(() => {
        try {
          this.result_(ActivityResultCode.CANCELED, /* data */ null);
        } catch (e) {
          this.disconnectWithError_(e);
        }
      }, opt_delayCancel ? 3000 : 0);
    }
  }

  /**
   * @param {!Error} reason
   * @private
   */
  disconnectWithError_(reason) {
    if (this.resultResolver_) {
      this.resultResolver_(Promise.reject(reason));
    }
    this.disconnect();
  }

  /**
   * @param {!ActivityResultCode} code
   * @param {*} data
   * @private
   */
  result_(code, data) {
    if (this.resultResolver_) {
      const isConnected = this.messenger_.isConnected();
      const result = new ActivityResult(
          code,
          data,
          ActivityMode.POPUP,
          isConnected ?
              this.messenger_.getTargetOrigin() :
              getOriginFromUrl(this.url_),
          /* originVerified */ isConnected,
          /* secureChannel */ isConnected);
      resolveResult(this.win_, result, this.resultResolver_);
      this.resultResolver_ = null;
    }
    if (this.messenger_) {
      this.messenger_.sendCommand('close');
    }
    this.disconnect();
  }

  /**
   * @param {string} cmd
   * @param {?Object} payload
   * @private
   */
  handleCommand_(cmd, payload) {
    if (cmd == 'connect') {
      // First ever message. Indicates that the receiver is listening.
      this.messenger_.sendStartCommand(this.args_);
    } else if (cmd == 'result') {
      // The last message. Indicates that the result has been received.
      const code = /** @type {!ActivityResultCode} */ (payload['code']);
      const data =
          code == ActivityResultCode.FAILED ?
          new Error(payload['data'] || '') :
          payload['data'];
      this.result_(code, data);
    } else if (cmd == 'check') {
      this.win_.setTimeout(() => this.check_(), 200);
    }
  }
}


/**
 * @param {!Window} win
 * @param {string} fragment
 * @param {string} requestId
 * @return {?ActivityPort}
 */
function discoverRedirectPort(win, fragment, requestId) {
  // Try to find the result in the fragment.
  const paramName = '__WA_RES__';
  const fragmentParam = getQueryParam(fragment, paramName);
  if (!fragmentParam) {
    return null;
  }
  const response = /** @type {?Object} */ (JSON.parse(
      decodeURIComponent(fragmentParam)));
  if (!response || response['requestId'] != requestId) {
    return null;
  }

  // Remove the found param from the fragment.
  const cleanFragment = removeQueryParam(win.location.hash, paramName) || '';
  if (cleanFragment != win.location.hash) {
    if (win.history && win.history.replaceState) {
      try {
        win.history.replaceState(win.history.state, '', cleanFragment);
      } catch (e) {
        // Ignore.
      }
    }
  }

  const code = response['code'];
  const data = response['data'];
  const origin = response['origin'];
  const referrerOrigin = win.document.referrer &&
      getOriginFromUrl(win.document.referrer);
  const originVerified = origin == referrerOrigin;
  return new ActivityWindowRedirectPort(
      win,
      code,
      data,
      origin,
      originVerified);
}


/**
 * The `ActivityPort` implementation for the standalone window activity
 * client executed as a popup.
 *
 * @implements {ActivityPort}
 */
class ActivityWindowRedirectPort {

  /**
   * @param {!Window} win
   * @param {!ActivityResultCode} code
   * @param {*} data
   * @param {string} targetOrigin
   * @param {boolean} targetOriginVerified
   */
  constructor(win, code, data, targetOrigin, targetOriginVerified) {
    /** @private @const {!Window} */
    this.win_ = win;
    /** @private @const {!ActivityResultCode} */
    this.code_ = code;
    /** @private @const {*} */
    this.data_ = data;
    /** @private {string} */
    this.targetOrigin_ = targetOrigin;
    /** @private {boolean} */
    this.targetOriginVerified_ = targetOriginVerified;
  }

  /** @override */
  getMode() {
    return ActivityMode.REDIRECT;
  }

  /** @override */
  acceptResult() {
    const result = new ActivityResult(
        this.code_,
        this.data_,
        ActivityMode.REDIRECT,
        this.targetOrigin_,
        this.targetOriginVerified_,
        /* secureChannel */ false);
    return new Promise(resolve => {
      resolveResult(this.win_, result, resolve);
    });
  }
}




/**
 * The page-level activities manager ports. This class is intended to be used
 * as a singleton. It can start activities of all modes: iframe, popup, and
 * redirect.
 */
class ActivityPorts {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {string} */
    this.version = '1.13';

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {string} */
    this.fragment_ = win.location.hash;

    /**
     * @private @const {!Object<string, !Array<function(!ActivityPort)>>}
     */
    this.requestHandlers_ = {};

    /**
     * The result buffer is indexed by `requestId`.
     * @private @const {!Object<string, !ActivityPort>}
     */
    this.resultBuffer_ = {};
  }

  /**
   * Start an activity within the specified iframe.
   * @param {!HTMLIFrameElement} iframe
   * @param {string} url
   * @param {?Object=} opt_args
   * @return {!Promise<!ActivityIframePort>}
   */
  openIframe(iframe, url, opt_args) {
    const port = new ActivityIframePort(iframe, url, opt_args);
    return port.connect().then(() => port);
  }

  /**
   * Start an activity in a separate window. The result will be delivered
   * to the `onResult` callback.
   *
   * The activity can be opened in two modes: "popup" and "redirect". This
   * depends on the `target` value, but also on the browser/environment.
   *
   * The allowed `target` values are `_blank`, `_top` and name targets. The
   * `_self`, `_parent` and similar targets are not allowed.
   *
   * The `_top` target indicates that the activity should be opened as a
   * "redirect", while other targets indicate that the activity should be
   * opened as a popup. The activity client will try to honor the requested
   * target. However, it's not always possible. Some environments do not
   * allow popups and they either force redirect or fail the window open
   * request. In this case, the activity will try to fallback to the "redirect"
   * mode.
   *
   * @param {string} requestId
   * @param {string} url
   * @param {string} target
   * @param {?Object=} opt_args
   * @param {?ActivityOpenOptions=} opt_options
   * @return {{targetWin: ?Window}}
   */
  open(requestId, url, target, opt_args, opt_options) {
    const port = new ActivityWindowPort(
        this.win_, requestId, url, target, opt_args, opt_options);
    port.open().then(() => {
      // Await result if possible. Notice that when falling back to "redirect",
      // the result will never arrive through this port.
      this.consumeResultAll_(requestId, port);
    });
    return {targetWin: port.getTargetWin()};
  }

  /**
   * Registers the callback for the result of the activity opened with the
   * specified `requestId` (see the `open()` method). The callback is a
   * function that takes a single `ActivityPort` argument. The client
   * can use this object to verify the port using it's origin, verified and
   * secure channel flags. Then the client can call
   * `ActivityPort.acceptResult()` method to accept the result.
   *
   * The activity result is handled via a separate callback because of a
   * possible redirect. So use of direct callbacks and/or promises is not
   * possible in that case.
   *
   * A typical implementation would look like:
   * ```
   * ports.onResult('request1', function(port) {
   *   port.acceptResult().then(function(result) {
   *     // Only verified origins are allowed.
   *     if (result.origin == expectedOrigin &&
   *         result.originVerified &&
   *         result.secureChannel) {
   *       handleResultForRequest1(result);
   *     }
   *   });
   * })
   *
   * ports.open('request1', request1Url, '_blank');
   * ```
   *
   * @param {string} requestId
   * @param {function(!ActivityPort)} callback
   */
  onResult(requestId, callback) {
    let handlers = this.requestHandlers_[requestId];
    if (!handlers) {
      handlers = [];
      this.requestHandlers_[requestId] = handlers;
    }
    handlers.push(callback);

    // Consume available result.
    const availableResult = this.discoverResult_(requestId);
    if (availableResult) {
      this.consumeResult_(availableResult, callback);
    }
  }

  /**
   * @param {string} requestId
   * @return {?ActivityPort}
   * @private
   */
  discoverResult_(requestId) {
    let port = this.resultBuffer_[requestId];
    if (!port && this.fragment_) {
      port = discoverRedirectPort(
          this.win_, this.fragment_, requestId);
      if (port) {
        this.resultBuffer_[requestId] = port;
      }
    }
    return port;
  }

  /**
   * @param {!ActivityPort} port
   * @param {function(!ActivityPort)} callback
   * @private
   */
  consumeResult_(port, callback) {
    Promise.resolve().then(() => {
      callback(port);
    });
  }

  /**
   * @param {string} requestId
   * @param {!ActivityPort} port
   * @private
   */
  consumeResultAll_(requestId, port) {
    // Find and execute handlers.
    const handlers = this.requestHandlers_[requestId];
    if (handlers) {
      handlers.forEach(handler => {
        this.consumeResult_(port, handler);
      });
    }
    // Buffer the result for callbacks that may arrive in the future.
    this.resultBuffer_[requestId] = port;
  }
}



var activityPorts = {
  ActivityPorts,
  ActivityIframePort,
  ActivityMode,
  ActivityOpenOptions,
  ActivityPort,
  ActivityRequest,
  ActivityResult,
  ActivityResultCode,
  ActivityWindowPort,
};
var activityPorts_1 = activityPorts.ActivityPorts;

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {string=} opt_message The assertion message
 * @param {...*} var_args Arguments substituted into %s in the message.
 * @return {T} The value of shouldBeTrueish.
 * @template T
 */
function assert(shouldBeTrueish, opt_message, var_args) {
  let firstElement;
  if (!shouldBeTrueish) {
    const message = opt_message || 'Assertion failed';
    const splitMessage = message.split('%s');
    const first = splitMessage.shift();
    let formatted = first;
    const messageArray = [];
    pushIfNonEmpty(messageArray, first);
    for (let i = 2; i < arguments.length; i++) {
      const val = arguments[i];
      if (val && val.tagName) {
        firstElement = val;
      }
      const nextConstant = splitMessage.shift();
      messageArray.push(val);
      pushIfNonEmpty(messageArray, nextConstant.trim());
      formatted += toString(val) + nextConstant;
    }
    const e = new Error(formatted);
    e.fromAssert = true;
    e.associatedElement = firstElement;
    e.messageArray = messageArray;
    throw e;
  }
  return shouldBeTrueish;
}

/**
 * @param {!Array} array
 * @param {*} val
 */
function pushIfNonEmpty(array, val) {
  if (val != '') {
    array.push(val);
  }
}

function toString(val) {
// Do check equivalent to `val instanceof Element` without cross-window bug
  if (val && val.nodeType == 1) {
    return val.tagName.toLowerCase() + (val.id ? '#' + val.id : '');
  }
  return /** @type {string} */ (val);
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Returns a map-like object.
 * If opt_initial is provided, copies its own properties into the
 * newly created object.
 * @param {Object=} opt_initial This should typically be an object literal.
 * @return {!Object}
 * @template T
 */
function map(opt_initial) {
  const obj = Object.create(null);
  if (opt_initial) {
    Object.assign(obj, opt_initial);
  }
  return obj;
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Polyfill for String.prototype.startsWith.
 * @param {string} string
 * @param {string} prefix
 * @return {boolean}
 */
function startsWith(string, prefix) {
  if (prefix.length > string.length) {
    return false;
  }
  return string.lastIndexOf(prefix, 0) == 0;
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

/** @type {Object<string, string>} */
let propertyNameCache;

/** @const {!Array<string>} */
const vendorPrefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'ms', 'O', 'o'];

/**
 * Default styles to be set for top level friendly iframe.
 * Some attributes are not included such as height, left, margin-left; since
 * these attributes are updated by @media queries and having these values
 * defined here as !important does not work on IE/edge browsers.
 * @const {!Object<string, string|number>}
 */
const defaultStyles = {
  'align-content': 'normal',
  'animation': 'none',
  'align-items': 'normal',
  'align-self': 'auto',
  'alignment-baseline': 'auto',
  'backface-visibility': 'hidden',
  'background-clip': 'border-box',
  'background-image': 'none',
  'baseline-shift': '0',
  'block-size': 'auto',
  'border': 'none',
  'border-collapse': 'separate',
  'bottom': '0',
  'box-sizing': 'border-box',
  'break-after': 'auto',
  'break-before': 'auto',
  'break-inside': 'auto',
  'buffered-rendering': 'auto',
  'caption-side': 'top',
  'caret-color': 'rgb(51, 51, 51)',
  'clear': 'none',
  'color': 'rgb(51, 51, 51)',
  'color-rendering': 'auto',
  'column-count': 'auto',
  'column-fill': 'balance',
  'column-gap': 'normal',
  'column-rule-color': 'rgb(51, 51, 51)',
  'column-rule-style': 'none',
  'column-rule-width': '0',
  'column-span': 'none',
  'column-width': 'auto',
  'contain': 'none',
  'counter-increment': 'none',
  'counter-reset': 'none',
  'cursor': 'auto',
  'direction': 'inherit',
  'display': 'block',
  'empty-cells': 'show',
  'filter': 'none',
  'flex': 'none',  // flex-grow, flex-shrink, and flex-basis.
  'flex-flow': 'row nowrap',  // flex-direction, flex-wrap.
  'float': 'none',
  'flood-color': 'rgb(0, 0, 0)',
  'flood-opacity': '1',
  'font': 'none',
  'font-size': 'medium',
  'font-family': '',
  'height': 'auto',
  'hyphens': 'manual',
  'image-rendering': 'auto',
  'inline-size': '',  // Setting to 'auto' will not allow override.
  'isolation': 'auto',
  'justify-content': 'normal',
  'justify-items': 'normal',
  'justify-self': 'auto',
  'letter-spacing': 'normal',
  'lighting-color': 'rgb(255, 255, 255)',
  'line-break': 'auto',
  'line-height': 'normal',
  'mask': 'none',
  'max-block-size': 'none',
  'max-height': 'none',
  'max-inline-size': 'none',
  'max-width': 'none',
  'min-block-size': 'none',
  'min-height': '0',
  'min-inline-size': '0',
  'min-width': '0',
  'mix-blend-mode': 'normal',
  'object-fit': 'fill',  // Important for Safari browser.
  'offset-distance': 'none',  // Chrome only (Experimental).
  'offset-path': 'none',  // Chrome only (Experimental).
  'offset-rotate': 'auto 0deg',  // Chrome only (Experimental).
  'opacity': '1',
  'order': '0',
  'orphans': '2',
  'outline': 'none',
  'overflow-anchor': 'auto',
  'overflow-wrap': 'normal',
  'overflow': 'visible',
  'padding': '0',
  'page': '',
  'perspective': 'none',
  'pointer-events': 'auto',
  'position': 'static',
  'quotes': '',
  'resize': 'none',
  'right': '0',
  'scroll-behavior': 'auto',
  'tab-size': '8',  // Only Chrome, Safari (Experimental).
  'table-layout': 'auto',
  'text-align': 'start',
  'text-align-last': 'auto',
  'text-anchor': 'start',
  'text-combine-upright': 'none',
  'text-decoration': 'none',
  'text-indent': '0',
  'text-orientation': 'mixed',
  'text-overflow': 'clip',
  'text-rendering': 'auto',
  'text-shadow': 'none',
  'text-size-adjust': 'auto',
  'text-transform': 'none',
  'text-underline-position': 'auto',
  'top': 'auto',
  'touch-action': 'auto',
  'transform': 'none',
  'transition': 'none 0s ease 0s',
  'unicode-bidi': 'normal',
  'user-select': 'auto',
  'vector-effect': 'none',
  'vertical-align': 'baseline',
  'visibility': 'visible',
  'white-space': 'normal',
  'widows': '2',
  'word-break': 'normal',
  'word-spacing': '0',
  'word-wrap': 'normal',
  'writing-mode': 'horizontal-tb',
  'zoom': '1',
  'z-index': 'auto',
};

/**
 * @export
 * @param {string} camelCase camel cased string
 * @return {string} title cased string
 */
function camelCaseToTitleCase(camelCase) {
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Checks the style if a prefixed version of a property exists and returns
 * it or returns an empty string.
 * @private
 * @param {!Object} style
 * @param {string} titleCase the title case version of a css property name
 * @return {string} the prefixed property name or null.
 */
function getVendorJsPropertyName_(style, titleCase) {
  for (let i = 0; i < vendorPrefixes.length; i++) {
    const propertyName = vendorPrefixes[i] + titleCase;
    if (style[propertyName] !== undefined) {
      return propertyName;
    }
  }
  return '';
}


/**
 * Returns the possibly prefixed JavaScript property name of a style property
 * (ex. WebkitTransitionDuration) given a camelCase'd version of the property
 * (ex. transitionDuration).
 * @export
 * @param {!Object} style
 * @param {string} camelCase the camel cased version of a css property name
 * @param {boolean=} opt_bypassCache bypass the memoized cache of property
 *   mapping
 * @return {string}
 */
function getVendorJsPropertyName(style, camelCase, opt_bypassCache) {
  if (startsWith(camelCase, '--')) {
    // CSS vars are returned as is.
    return camelCase;
  }
  if (!propertyNameCache) {
    propertyNameCache = map();
  }
  let propertyName = propertyNameCache[camelCase];
  if (!propertyName || opt_bypassCache) {
    propertyName = camelCase;
    if (style[camelCase] === undefined) {
      const titleCase = camelCaseToTitleCase(camelCase);
      const prefixedPropertyName = getVendorJsPropertyName_(style, titleCase);

      if (style[prefixedPropertyName] !== undefined) {
        propertyName = prefixedPropertyName;
      }
    }
    if (!opt_bypassCache) {
      propertyNameCache[camelCase] = propertyName;
    }
  }
  return propertyName;
}


/**
 * Sets the CSS styles of the specified element with !important. The styles
 * are specified as a map from CSS property names to their values.
 * @param {!Element} element
 * @param {!Object<string, string|number>} styles
 */
function setImportantStyles(element, styles) {
  for (const k in styles) {
    element.style.setProperty(
        getVendorJsPropertyName(styles, k), styles[k].toString(), 'important');
  }
}


/**
 * Sets the CSS style of the specified element with optional units, e.g. "px".
 * @param {Element} element
 * @param {string} property
 * @param {?string|number|boolean} value
 * @param {string=} opt_units
 * @param {boolean=} opt_bypassCache
 */
function setStyle(element, property, value, opt_units, opt_bypassCache) {
  const propertyName = getVendorJsPropertyName(element.style, property,
      opt_bypassCache);
  if (propertyName) {
    element.style[propertyName] =
        /** @type {string} */ (opt_units ? value + opt_units : value);
  }
}


/**
 * Sets the CSS styles of the specified element. The styles
 * a specified as a map from CSS property names to their values.
 * @param {!Element} element
 * @param {!Object<string, ?string|number|boolean>} styles
 */
function setStyles(element, styles) {
  for (const k in styles) {
    setStyle(element, k, styles[k]);
  }
}


/**
 * Resets styles that were set dynamically (i.e. inline)
 * @param {!Element} element
 * @param {!Array<string>} properties
 */
function resetStyles(element, properties) {
  const styleObj = {};
  properties.forEach(prop => {
    styleObj[prop] = null;
  });
  setStyles(element, styleObj);
}


/**
 * Resets all the styles of an element to a given value. Defaults to null.
 * The valid values are 'inherit', 'initial', 'unset' or null.
 * @param {!Element} element
 */
function resetAllStyles(element) {
  setImportantStyles(element, defaultStyles);
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

/** @const {string} */
const styleType = 'text/css';


/**
 * Add attributes to an element.
 * @param {!Element} element
 * @param {!Object<string, string|number|boolean|!Object<string, string|number|boolean>>} attributes
 * @return {!Element} updated element.
 */
function addAttributesToElement(element, attributes) {
  for (const attr in attributes) {
    if (attr == 'style') {
      setStyles(element,
           /** @type !Object<string, string|boolean|number> */
           (attributes[attr]));
    } else {
      element.setAttribute(attr,
          /** @type {string|boolean|number} */ (attributes[attr]));
    }

  }
  return element;
}


/**
 * Create a new element on document with specified tagName and attributes.
 * @param {!Document} doc
 * @param {string} tagName
 * @param {!Object<string, string>} attributes
 * @param {?(string|!Node|!ArrayLike<!Node>|!Array<!Node>)=} opt_content
 * @return {!Element} created element.
 */
function createElement(doc, tagName, attributes, opt_content) {
  const element = doc.createElement(tagName);
  addAttributesToElement(element, attributes);
  if (opt_content != null) {
    if (typeof opt_content == 'string') {
      element.textContent = opt_content;
    } else if (opt_content.nodeType) {
      element.appendChild(opt_content);
    } else if ('length' in opt_content) {
      for (let i = 0; i < opt_content.length; i++) {
        element.appendChild(opt_content[i]);
      }
    } else {
      assert(false, 'Unsupported content: %s', opt_content);
    }
  }
  return element;
}


/**
 * Removes the element.
 * @param {!Element} element
 */
function removeElement(element) {
  if (element.parentElement) {
    element.parentElement.removeChild(element);
  }
}


/**
 * Removes all children from the parent element.
 * @param {!Element} parent
 */
function removeChildren(parent) {
  parent.textContent = '';
}


/**
 * Injects the provided styles in the HEAD section of the document.
 * @param {!Document} doc The document object.
 * @param {string} styleText The style string.
 * @return {!Element}
 */
function injectStyleSheet(doc, styleText) {
  const styleElement = createElement(doc, 'style', {
    'type': styleType,
  });
  styleElement.textContent = styleText;
  doc.head.appendChild(styleElement);
  return styleElement;
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * @param {!Object<string, string>} map
 * @param {?string|?Element} langOrElement
 * @return {?string}
 */
function msg(map, langOrElement) {
  const lang =
      !langOrElement ? '' :
      typeof langOrElement == 'string' ? langOrElement :
      langOrElement.lang ||
      langOrElement.ownerDocument &&
          langOrElement.ownerDocument.documentElement.lang;
  let search = (lang && lang.toLowerCase() || 'en').replace(/_/g, '-');
  while (search) {
    if (search in map) {
      return map[search];
    }
    const dash = search.lastIndexOf('-');
    search = dash != -1 ? search.substring(0, dash) : '';
  }
  // "en" is always default.
  return map['en'];
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

/** @type {!Object<string, string>} */
const TITLE_LANG_MAP = {
  'en': 'Subscribe with Google',
  'ar': 'الاشتراك عبر Google',
  'de': 'Abonnieren mit Google',
  'es': 'Suscríbete con Google',
  'es-latam': 'Suscribirse con Google',
  'es-latn': 'Suscribirse con Google',
  'fr': 'S\'abonner avec Google',
  'hi': 'Google की सदस्यता लें',
  'id': 'Berlangganan dengan Google',
  'it': 'Abbonati con Google',
  'jp': 'Google で購読',
  'ko': 'Google 을(를) 통해 구독',
  'ms': 'Langgan dengan Google',
  'nl': 'Abonneren met Google',
  'no': 'Abonner med Google',
  'pl': 'Subskrybuj z Google',
  'pt': 'Subscrever com o Google',
  'pt-br': 'Faça sua assinatura com Google',
  'ru': 'Подпишитесь через Google',
  'se': 'Prenumerera med Google',
  'th': 'สมัครรับข้อมูลด้วย Google',
  'tr': 'Google ile abone olun',
  'uk': 'Підписатися через Google',
  'zh-tw': '透過 Google 訂閱',
};


/**
 * The button stylesheet can be found in the `/assets/swg-button.css`.
 * It's produced by the `assets:swg-button` gulp task and deployed to
 * `https://news.google.com/swg/js/v1/swg-button.css`.
 */
class ButtonApi {

  /**
   * @param {!../model/doc.Doc} doc
   */
  constructor(doc) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;
  }

  /**
   */
  init() {
    const head = this.doc_.getHead();
    if (!head) {
      return;
    }

    const url = 'https://news.google.com/swg/js/v1/swg-button.css';
    const existing = head.querySelector(`link[href="${url}"]`);
    if (existing) {
      return;
    }

    // <link rel="stylesheet" href="..." type="text/css">
    head.appendChild(createElement(this.doc_.getWin().document, 'link', {
      'rel': 'stylesheet',
      'type': 'text/css',
      'href': url,
    }));
  }

  /**
   * @param {!Object|function()} optionsOrCallback
   * @param {function()=} opt_callback
   * @return {!Element}
   */
  create(optionsOrCallback, opt_callback) {
    const button = createElement(this.doc_.getWin().document, 'button', {});
    return this.attach(button, optionsOrCallback, opt_callback);
  }

  /**
   * @param {!Element} button
   * @param {!Object|function()} optionsOrCallback
   * @param {function()=} opt_callback
   * @return {!Element}
   */
  attach(button, optionsOrCallback, opt_callback) {
    const options =
        typeof optionsOrCallback != 'function' ?
        optionsOrCallback : null;
    const callback = /** @type {function()} */ (
        (typeof optionsOrCallback == 'function' ? optionsOrCallback : null) ||
            opt_callback);
    let theme = options && options['theme'];
    if (theme !== 'light' && theme !== 'dark') {
      theme = 'light';
    }
    button.classList.add(`swg-button-${theme}`);
    button.setAttribute('role', 'button');
    if (options && options['lang']) {
      button.setAttribute('lang', options['lang']);
    }
    button.setAttribute('title', msg(TITLE_LANG_MAP, button) || '');
    button.addEventListener('click', callback);
    return button;
  }
}

const CSS = ".swg-dialog,.swg-toast{box-sizing:border-box;background-color:#fff!important}.swg-toast{position:fixed!important;bottom:0!important;max-height:46px!important;z-index:2147483647!important;border:none!important}@media (max-height:640px), (max-width:640px){.swg-dialog,.swg-toast{width:480px!important;left:-240px!important;margin-left:50vw!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}@media (min-width:640px) and (min-height:640px){.swg-dialog{width:630px!important;left:-315px!important;margin-left:50vw!important;background-color:transparent!important;border:none!important}.swg-toast{left:0!important}}@media (max-width:480px){.swg-dialog,.swg-toast{width:100%!important;left:0!important;right:0!important;margin-left:0!important}}\n/*# sourceURL=/./src/components/dialog.css*/";

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


/** @enum {number} */
const CallbackId = {
  ENTITLEMENTS: 1,
  SUBSCRIBE_REQUEST: 2,
  SUBSCRIBE_RESPONSE: 3,
  LOGIN_REQUEST: 4,
  LINK_PROGRESS: 5,
  LINK_COMPLETE: 6,
  FLOW_STARTED: 7,
  FLOW_CANCELED: 8,
};


/**
 */
class Callbacks {

  /**
   */
  constructor() {
    /** @private @const {!Object<CallbackId, function(*)>} */
    this.callbacks_ = {};
    /** @private @const {!Object<CallbackId, *>} */
    this.resultBuffer_ = {};
  }

  /**
   * @param {function(!Promise<!../api/entitlements.Entitlements>)} callback
   */
  setOnEntitlementsResponse(callback) {
    this.setCallback_(CallbackId.ENTITLEMENTS, callback);
  }

  /**
   * @param {!Promise<!../api/entitlements.Entitlements>} promise
   */
  triggerEntitlementsResponse(promise) {
    return this.trigger_(
        CallbackId.ENTITLEMENTS,
        promise.then(res => res.clone()));
  }

  /**
   * @return {boolean}
   */
  hasEntitlementsResponsePending() {
    return !!this.resultBuffer_[CallbackId.ENTITLEMENTS];
  }

  /**
   * @param {function(!../api/subscriptions.LoginRequest)} callback
   */
  setOnLoginRequest(callback) {
    this.setCallback_(CallbackId.LOGIN_REQUEST, callback);
  }

  /**
   * @param {!../api/subscriptions.LoginRequest} request
   * @return {boolean} Whether the callback has been found.
   */
  triggerLoginRequest(request) {
    return this.trigger_(CallbackId.LOGIN_REQUEST, request);
  }

  /**
   * @param {function()} callback
   */
  setOnLinkProgress(callback) {
    this.setCallback_(CallbackId.LINK_PROGRESS, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerLinkProgress() {
    return this.trigger_(CallbackId.LINK_PROGRESS, true);
  }

  /**
   */
  resetLinkProgress() {
    this.resetCallback_(CallbackId.LINK_PROGRESS);
  }

  /**
   * @param {function()} callback
   */
  setOnLinkComplete(callback) {
    this.setCallback_(CallbackId.LINK_COMPLETE, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerLinkComplete() {
    return this.trigger_(CallbackId.LINK_COMPLETE, true);
  }

  /**
   * @return {boolean}
   */
  hasLinkCompletePending() {
    return !!this.resultBuffer_[CallbackId.LINK_COMPLETE];
  }

  /**
   * @param {function()} callback
   */
  setOnSubscribeRequest(callback) {
    this.setCallback_(CallbackId.SUBSCRIBE_REQUEST, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerSubscribeRequest() {
    return this.trigger_(CallbackId.SUBSCRIBE_REQUEST, true);
  }

  /**
   * @return {boolean}
   */
  hasSubscribeRequestCallback() {
    return !!this.callbacks_[CallbackId.SUBSCRIBE_REQUEST];
  }

  /**
   * @param {function(!Promise<!../api/subscribe-response.SubscribeResponse>)} callback
   */
  setOnSubscribeResponse(callback) {
    this.setCallback_(CallbackId.SUBSCRIBE_RESPONSE, callback);
  }

  /**
   * @param {!Promise<!../api/subscribe-response.SubscribeResponse>} responsePromise
   * @return {boolean} Whether the callback has been found.
   */
  triggerSubscribeResponse(responsePromise) {
    return this.trigger_(
        CallbackId.SUBSCRIBE_RESPONSE,
        responsePromise.then(res => res.clone()));
  }

  /**
   * @return {boolean}
   */
  hasSubscribeResponsePending() {
    return !!this.resultBuffer_[CallbackId.SUBSCRIBE_RESPONSE];
  }

  /**
   * @param {function({flow: string, data: !Object})} callback
   */
  setOnFlowStarted(callback) {
    this.setCallback_(CallbackId.FLOW_STARTED, callback);
  }

  /**
   * @param {string} flow
   * @param {!Object=} opt_data
   * @return {boolean} Whether the callback has been found.
   */
  triggerFlowStarted(flow, opt_data) {
    return this.trigger_(CallbackId.FLOW_STARTED, {
      flow,
      data: opt_data || {},
    });
  }

  /**
   * @param {function({flow: string, data: !Object})} callback
   */
  setOnFlowCanceled(callback) {
    this.setCallback_(CallbackId.FLOW_CANCELED, callback);
  }

  /**
   * @param {string} flow
   * @param {!Object=} opt_data
   * @return {boolean} Whether the callback has been found.
   */
  triggerFlowCanceled(flow, opt_data) {
    return this.trigger_(CallbackId.FLOW_CANCELED, {
      flow,
      data: opt_data || {},
    });
  }

  /**
   * @param {!CallbackId} id
   * @param {function(?)} callback
   * @private
   */
  setCallback_(id, callback) {
    this.callbacks_[id] = callback;
    // If result already exist, execute the callback right away.
    if (id in this.resultBuffer_) {
      this.executeCallback_(id, callback, this.resultBuffer_[id]);
    }
  }

  /**
   * @param {!CallbackId} id
   * @param {*} data
   * @return {boolean}
   * @private
   */
  trigger_(id, data) {
    this.resultBuffer_[id] = data;
    const callback = this.callbacks_[id];
    if (callback) {
      this.executeCallback_(id, callback, data);
    }
    return !!callback;
  }

  /**
   * @param {!CallbackId} id
   * @private
   */
  resetCallback_(id) {
    if (id in this.resultBuffer_) {
      delete this.resultBuffer_[id];
    }
  }

  /**
   * @param {!CallbackId} id
   * @param {function(*)} callback
   * @param {*} data
   * @private
   */
  executeCallback_(id, callback, data) {
    // Always execute callbacks in a microtask.
    Promise.resolve().then(() => {
      callback(data);
      this.resetCallback_(id);
    });
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * abstract View Class. Used to render the content within the Dialog. The
 * extended class has actual content.
 * @abstract
 */
class View {

  /**
   * Empty constructor.
   */
  constructor() {}

  /**
   * Gets the iframe element.
   * @return {!Element}
   * @abstract
   */
  getElement() {}

  /**
   * @param {!./dialog.Dialog} unusedDialog
   * @return {!Promise}
   * @abstract
   */
  init(unusedDialog) {}

  /**
   * Resizes the content.
   */
  resized() {
    // Do nothing by default. Override if needed.
  }

  /**
   * Accept the result.
   * @return {!Promise}
   * @abstract
   */
  whenComplete() {}

  /**
   * @return {boolean}
   * @abstract
   */
  shouldFadeBody() {}

  /**
   * @return {boolean}
   * @abstract
   */
  hasLoadingIndicator() {}
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * @param {*} error
 * @return {boolean}
 */
function isCancelError(error) {
  if (!error || typeof error != 'object') {
    return false;
  }
  return (error['name'] === 'AbortError');
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

/** @const {!Object<string, string>} */
const iframeAttributes = {
  'frameborder': '0',
  'scrolling': 'no',
};


/**
 * Class to build and render Activity iframe view.
 */
class ActivityIframeView extends View {

  /**
   * @param {!Window} win
   * @param {!web-activities/activity-ports.ActivityPorts} activityPorts
   * @param {string} src
   * @param {!Object<string, ?>=} args
   * @param {boolean=} shouldFadeBody
   * @param {boolean=} hasLoadingIndicator
   */
  constructor(
      win,
      activityPorts,
      src,
      args,
      shouldFadeBody = false,
      hasLoadingIndicator = false) {
    super();

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Document} */
    this.doc_ = this.win_.document;

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ =
        /** @type {!HTMLIFrameElement} */ (
            createElement(this.doc_, 'iframe', iframeAttributes));

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = activityPorts;

    /** @private @const {string} */
    this.src_ = src;

    /** @private @const {!Object<string, ?>} */
    this.args_ = args || {};

    /** @private @const {boolean} */
    this.shouldFadeBody_ = shouldFadeBody;

    /** @private @const {boolean} */
    this.hasLoadingIndicator_ = hasLoadingIndicator;

    /** @private {?web-activities/activity-ports.ActivityIframePort} */
    this.port_ = null;

    /**
     * @private
     * {?function<!web-activities/activity-ports.ActivityIframePort|!Promise>}
     */
    this.portResolver_ = null;

    /**
     * @private @const
     * {!Promise<!web-activities/activity-ports.ActivityIframePort>}
     */
    this.portPromise_ = new Promise(resolve => {
      this.portResolver_ = resolve;
    });
  }

  /** @override */
  getElement() {
    return this.iframe_;
  }

  /** @override */
  init(dialog) {
    return this.activityPorts_.openIframe(this.iframe_, this.src_, this.args_)
        .then(port => this.onOpenIframeResponse_(port, dialog));
  }

  /**
   * Returns if document should fade for this view.
   * @return {boolean}
   */
  shouldFadeBody() {
    return this.shouldFadeBody_;
  }

  /**
   * Returns if the view shows loading indicator.
   * @return {boolean}
   */
  hasLoadingIndicator() {
    return this.hasLoadingIndicator_;
  }

  /**
   * @param {!web-activities/activity-ports.ActivityIframePort} port
   * @param {!../components/dialog.Dialog} dialog
   * @return {!Promise}
   */
  onOpenIframeResponse_(port, dialog) {
    this.port_ = port;
    this.portResolver_(port);

    this.port_.onResizeRequest(height => {
      dialog.resizeView(this, height);
    });

    return this.port_.whenReady();
  }

  /**
   * @return {!Promise<!web-activities/activity-ports.ActivityIframePort>}
   */
  port() {
    return this.portPromise_;
  }

  /**
   * @param {!Object} data
   */
  message(data) {
    this.port().then(port => {
      port.message(data);
    });
  }

  /**
   * Handles the message received by the port.
   * @param {function(!Object<string, string|boolean>)} callback
   */
  onMessage(callback) {
    this.port().then(port => {
      port.onMessage(callback);
    });
  }

  /**
   * Accepts results from the caller.
   * @return {!Promise<!web-activities/activity-ports.ActivityResult>}
   */
  acceptResult() {
    return this.port().then(port => port.acceptResult());
  }

  /**
   * Completes the flow.
   * @return {!Promise}
   */
  whenComplete() {
    return this.acceptResult();
  }

  /**
   * @param {function()} callback
   */
  onCancel(callback) {
    this.acceptResult().catch(reason => {
      if (isCancelError(reason)) {
        callback();
      }
      throw reason;
    });
  }

  /** @override */
  resized() {
    if (this.port_) {
      this.port_.resized();
    }
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * The holder of the entitlements for a service.
 */
class Entitlements {

  /**
   * @param {string} service
   * @param {string} raw
   * @param {!Array<!Entitlement>} entitlements
   * @param {?string} currentProduct
   * @param {function(!Entitlements)} ackHandler
   */
  constructor(service, raw, entitlements, currentProduct, ackHandler) {
    /** @const {string} */
    this.service = service;
    /** @const {string} */
    this.raw = raw;
    /** @const {!Array<!Entitlement>} */
    this.entitlements = entitlements;

    /** @private @const {?string} */
    this.product_ = currentProduct;
    /** @private @const {function(!Entitlements)} */
    this.ackHandler_ = ackHandler;
  }

  /**
   * @return {!Entitlements}
   */
  clone() {
    return new Entitlements(
        this.service,
        this.raw,
        this.entitlements.map(ent => ent.clone()),
        this.product_,
        this.ackHandler_);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'service': this.service,
      'entitlements': this.entitlements.map(item => item.json()),
    };
  }

  /**
   * @param {string=} opt_source
   * @return {boolean}
   */
  enablesThis(opt_source) {
    return this.enables(this.product_, opt_source);
  }

  /**
   * @param {string=} opt_source
   * @return {boolean}
   */
  enablesAny(opt_source) {
    for (let i = 0; i < this.entitlements.length; i++) {
      if (this.entitlements[i].products.length > 0 &&
          (!opt_source || opt_source == this.entitlements[i].source)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Whether these entitlements enable the specified product, optionally also
   * restricting the source.
   * @param {?string} product
   * @param {string=} opt_source
   * @return {boolean}
   */
  enables(product, opt_source) {
    if (!product) {
      return false;
    }
    return !!this.getEntitlementFor(product, opt_source);
  }

  /**
   * Returns the first matching entitlement for the current product,
   * optionally also matching the specified source.
   * @param {string=} opt_source
   * @return {?Entitlement}
   */
  getEntitlementForThis(opt_source) {
    return this.getEntitlementFor(this.product_, opt_source);
  }

  /**
   * Returns the first matching entitlement for the specified product,
   * optionally also matching the specified source.
   * @param {?string} product
   * @param {string=} opt_source
   * @return {?Entitlement}
   */
  getEntitlementFor(product, opt_source) {
    if (product && this.entitlements.length > 0) {
      for (let i = 0; i < this.entitlements.length; i++) {
        if (this.entitlements[i].enables(product) &&
            (!opt_source || opt_source == this.entitlements[i].source)) {
          return this.entitlements[i];
        }
      }
    }
    return null;
  }

  /**
   * Returns the first matching entitlement for the specified source w/o
   * matching any specific products.
   * @param {string} source
   * @return {?Entitlement}
   */
  getEntitlementForSource(source) {
    if (this.entitlements.length > 0) {
      for (let i = 0; i < this.entitlements.length; i++) {
        if (this.entitlements[i].subscriptionToken &&
            (source == this.entitlements[i].source)) {
          return this.entitlements[i];
        }
      }
    }
    return null;
  }

  /**
   * A 3p site should call this method to acknowledge that it "saw" and
   * "understood" entitlements.
   */
  ack() {
    this.ackHandler_(this);
  }
}


/**
 * The single entitlement object.
 */
class Entitlement {

  /**
   * @param {string} source
   * @param {!Array<string>} products
   * @param {string} subscriptionToken
   */
  constructor(source, products, subscriptionToken) {
    /** @const {string} */
    this.source = source;
    /** @const {!Array<string>} */
    this.products = products;
    /** @const {string} */
    this.subscriptionToken = subscriptionToken;
  }

  /**
   * @return {!Entitlement}
   */
  clone() {
    return new Entitlement(
        this.source,
        this.products.slice(0),
        this.subscriptionToken);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'source': this.source,
      'products': this.products,
      'subscriptionToken': this.subscriptionToken,
    };
  }

  /**
   * @param {?string} product
   * @return {boolean}
   */
  enables(product) {
    if (!product) {
      return false;
    }
    return this.products.includes(product);
  }

  /**
   * @param {?Object} json
   * @return {!Entitlement}
   */
  static parseFromJson(json) {
    if (!json) {
      json = {};
    }
    const source = json['source'] || '';
    const products = json['products'] || [];
    const subscriptionToken = json['subscriptionToken'];
    return new Entitlement(source, products, subscriptionToken);
  }

  /**
   * The JSON is expected in one of the forms:
   * - Single entitlement: `{products: [], ...}`.
   * - A list of entitlements: `[{products: [], ...}, {...}]`.
   * @param {!Object|!Array<!Object>} json
   * @return {!Array<!Entitlement>}
   */
  static parseListFromJson(json) {
    const jsonList = Array.isArray(json) ?
        /** @type {!Array<Object>} */ (json) : [json];
    return jsonList.map(json => Entitlement.parseFromJson(json));
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 */
class UserData {

  /**
   * @param {string} idToken
   * @param {!Object} data
   */
  constructor(idToken, data) {
    /** @const {string} */
    this.idToken = idToken;
    /** @const {!Object} */
    this.data = data;

    /** @const {string} */
    this.id = data['sub'];
    /** @const {string} */
    this.email = data['email'];
    /** @const {boolean} */
    this.emailVerified = data['email_verified'];
    /** @const {string} */
    this.name = data['name'];
    /** @const {string} */
    this.givenName = data['given_name'];
    /** @const {string} */
    this.familyName = data['family_name'];
    /** @const {string} */
    this.pictureUrl = data['picture'];
  }

  /**
   * @return {!UserData}
   */
  clone() {
    return new UserData(this.idToken, this.data);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'id': this.id,
      'email': this.email,
      'emailVerified': this.emailVerified,
      'name': this.name,
      'givenName': this.givenName,
      'familyName': this.familyName,
      'pictureUrl': this.pictureUrl,
    };
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 */
class SubscribeResponse {

  /**
   * @param {string} raw
   * @param {!PurchaseData} purchaseData
   * @param {?UserData} userData
   * @param {?Entitlements} entitlements
   * @param {function():!Promise} completeHandler
   */
  constructor(raw, purchaseData, userData, entitlements, completeHandler) {
    /** @const {string} */
    this.raw = raw;
    /** @const {!PurchaseData} */
    this.purchaseData = purchaseData;
    /** @const {?UserData} */
    this.userData = userData;
    /** @const {?Entitlements} */
    this.entitlements = entitlements;
    /** @private @const {function():!Promise} */
    this.completeHandler_ = completeHandler;
  }

  /**
   * @return {!SubscribeResponse}
   */
  clone() {
    return new SubscribeResponse(
        this.raw,
        this.purchaseData,
        this.userData,
        this.entitlements,
        this.completeHandler_);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'purchaseData': this.purchaseData.json(),
      'userData': this.userData ? this.userData.json() : null,
      'entitlements': this.entitlements ? this.entitlements.json() : null,
    };
  }

  /**
   * Allows the receiving site to complete/acknowledge that it registered
   * the subscription purchase. The typical action would be to create an
   * account (or match an existing one) and associated the purchase with
   * that account.
   *
   * SwG will display progress indicator until this method is called and
   * upon receiving this call will show the confirmation to the user.
   * The promise returned by this method will yield once the user closes
   * the confirmation.
   *
   * @return {!Promise}
   */
  complete() {
    return this.completeHandler_();
  }
}


/**
 */
class PurchaseData {

  /**
   * @param {string} raw
   * @param {string} signature
   */
  constructor(raw, signature) {
    /** @const {string} */
    this.raw = raw;
    /** @const {string} */
    this.signature = signature;
  }

  /**
   * @return {!PurchaseData}
   */
  clone() {
    return new PurchaseData(this.raw, this.signature);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'data': this.raw,
      'signature': this.signature,
    };
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 */
class DeferredAccountCreationResponse {

  /**
   * @param {!Entitlements} entitlements
   * @param {!UserData} userData
   * @param {!PurchaseData} purchaseData
   * @param {function():!Promise} completeHandler
   */
  constructor(entitlements, userData, purchaseData, completeHandler) {
    /** @const {!Entitlements} */
    this.entitlements = entitlements;
    /** @const {!UserData} */
    this.userData = userData;
    /** @const {!PurchaseData} */
    this.purchaseData = purchaseData;
    /** @private @const {function():!Promise} */
    this.completeHandler_ = completeHandler;
  }

  /**
   * @return {!DeferredAccountCreationResponse}
   */
  clone() {
    return new DeferredAccountCreationResponse(
        this.entitlements,
        this.userData,
        this.purchaseData,
        this.completeHandler_);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'entitlements': this.entitlements.json(),
      'userData': this.userData.json(),
      'purchaseData': this.purchaseData.json(),
    };
  }

  /**
   * Allows the receiving site to complete/acknowledge that it registered
   * the subscription info. The typical action would be to create an
   * account (or match an existing one) and associated the subscription with
   * that account.
   *
   * SwG will display progress indicator until this method is called and
   * upon receiving this call will show the confirmation to the user.
   * The promise returned by this method will yield once the user closes
   * the confirmation.
   *
   * @return {!Promise}
   */
  complete() {
    return this.completeHandler_();
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Character mapping from base64url to base64.
 * @const {!Object<string, string>}
 */
const base64UrlDecodeSubs = {'-': '+', '_': '/', '.': '='};


/**
 * Converts a string which holds 8-bit code points, such as the result of atob,
 * into a Uint8Array with the corresponding bytes.
 * If you have a string of characters, you probably want to be using utf8Encode.
 * @param {string} str
 * @return {!Uint8Array}
 */
function stringToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    assert(charCode <= 255, 'Characters must be in range [0,255]');
    bytes[i] = charCode;
  }
  return bytes;
}


/**
 * Converts a 8-bit bytes array into a string
 * @param {!Uint8Array} bytes
 * @return {string}
 */
function bytesToString(bytes) {
  // Intentionally avoids String.fromCharCode.apply so we don't suffer a
  // stack overflow. #10495, https://jsperf.com/bytesToString-2
  const array = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = String.fromCharCode(bytes[i]);
  }
  return array.join('');
}


/**
 * Interpret a byte array as a UTF-8 string.
 * @param {!BufferSource} bytes
 * @return {string}
 */
function utf8DecodeSync(bytes) {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  const asciiString = bytesToString(new Uint8Array(bytes.buffer || bytes));
  return decodeURIComponent(escape(asciiString));
}


/**
 * Turn a string into UTF-8 bytes.
 * @param {string} string
 * @return {!Uint8Array}
 */
function utf8EncodeSync(string) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder('utf-8').encode(string);
  }
  return stringToBytes(unescape(encodeURIComponent(string)));
}


/**
 * Converts a string which is in base64url encoding into a Uint8Array
 * containing the decoded value.
 * @param {string} str
 * @return {!Uint8Array}
 */
function base64UrlDecodeToBytes(str) {
  const encoded = atob(str.replace(/[-_.]/g, ch => base64UrlDecodeSubs[ch]));
  return stringToBytes(encoded);
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Simple wrapper around JSON.parse that casts the return value
 * to JsonObject.
 * Create a new wrapper if an array return value is desired.
 * @param {*} json JSON string to parse
 * @return {?JsonObject|undefined} May be extend to parse arrays.
 */
function parseJson(json) {
  return /** @type {?JsonObject} */(JSON.parse(/** @type {string} */ (json)));
}

/**
 * Parses the given `json` string without throwing an exception if not valid.
 * Returns `undefined` if parsing fails.
 * Returns the `Object` corresponding to the JSON string when parsing succeeds.
 * @param {*} json JSON string to parse
 * @param {function(!Error)=} opt_onFailed Optional function that will be called
 *     with the error if parsing fails.
 * @return {?JsonObject|undefined} May be extend to parse arrays.
 */
function tryParseJson(json, opt_onFailed) {
  try {
    return parseJson(json);
  } catch (e) {
    if (opt_onFailed) {
      opt_onFailed(e);
    }
    return undefined;
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Provides helper methods to decode and verify JWT tokens.
 */
class JwtHelper {
  constructor() {
  }

  /**
   * Decodes JWT token and returns its payload.
   * @param {string} encodedToken
   * @return {?JsonObject|undefined}
   */
  decode(encodedToken) {
    return this.decodeInternal_(encodedToken).payload;
  }

  /**
   * @param {string} encodedToken
   * @return {!JwtTokenInternalDef}
   * @private
   */
  decodeInternal_(encodedToken) {
    // See https://jwt.io/introduction/
    /**
     * Throws error about invalid token.
     */
    function invalidToken() {
      throw new Error(`Invalid token: "${encodedToken}"`);
    }

    // Encoded token has three parts: header.payload.sig
    // Note! The padding is not allowed by JWT spec:
    // http://self-issued.info/docs/draft-goland-json-web-token-00.html#rfc.section.5
    const parts = encodedToken.split('.');
    if (parts.length != 3) {
      invalidToken();
    }
    const headerUtf8Bytes = base64UrlDecodeToBytes(parts[0]);
    const payloadUtf8Bytes = base64UrlDecodeToBytes(parts[1]);
    return {
      header: tryParseJson(utf8DecodeSync(headerUtf8Bytes), invalidToken),
      payload: tryParseJson(utf8DecodeSync(payloadUtf8Bytes), invalidToken),
      verifiable: `${parts[0]}.${parts[1]}`,
      sig: parts[2],
    };
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


/** @enum {string} */
const SubscriptionFlows = {
  SHOW_OFFERS: 'showOffers',
  SHOW_SUBSCRIBE_OPTION: 'showSubscribeOption',
  SHOW_ABBRV_OFFER: 'showAbbrvOffer',
  SUBSCRIBE: 'subscribe',
  COMPLETE_DEFERRED_ACCOUNT_CREATION: 'completeDeferredAccountCreation',
  LINK_ACCOUNT: 'linkAccount',
  SHOW_LOGIN_PROMPT: 'showLoginPrompt',
  SHOW_LOGIN_NOTIFICATION: 'showLoginNotification',
};


/**
 * @enum {string}
 */
const WindowOpenMode = {
  AUTO: 'auto',
  REDIRECT: 'redirect',
};


/**
 * @return {!Config}
 */
function defaultConfig() {
  return {
    windowOpenMode: WindowOpenMode.AUTO,
  };
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */
let a;


/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {Object<string, !LocationDef>}
 */
let cache;

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {string} url
 * @param {boolean=} opt_nocache
 * @return {!LocationDef}
 */
function parseUrl$1(url, opt_nocache) {
  if (!a) {
    a = /** @type {!HTMLAnchorElement} */ (self.document.createElement('a'));
    cache = self.UrlCache || (self.UrlCache = Object.create(null));
  }

  const fromCache = cache[url];
  if (fromCache) {
    return fromCache;
  }

  const info = parseUrlWithA(a, url);

  return cache[url] = info;
}

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * @param {!HTMLAnchorElement} a
 * @param {string} url
 * @return {!LocationDef}
 */
function parseUrlWithA(a, url) {
  a.href = url;

  // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick.
  if (!a.protocol) {
    a.href = a.href;
  }

  /** @type {!LocationDef} */
  const info = {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: '', // Set below.
  };

  // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.
  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname;
  }

  // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.
  if ((info.protocol == 'http:' && info.port == 80) ||
      (info.protocol == 'https:' && info.port == 443)) {
    info.port = '';
    info.host = info.hostname;
  }

  // For data URI a.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.
  if (a.origin && a.origin != 'null') {
    info.origin = a.origin;
  } else if (info.protocol == 'data:' || !info.host) {
    info.origin = info.href;
  } else {
    info.origin = info.protocol + '//' + info.host;
  }
  return info;
}


/**
 * Adds a parameter to a query string.
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @return {string}
 */
function addQueryParam(url, param, value) {
  const queryIndex = url.indexOf('?');
  const fragmentIndex = url.indexOf('#');
  let fragment = '';
  if (fragmentIndex != -1) {
    fragment = url.substring(fragmentIndex);
    url = url.substring(0, fragmentIndex);
  }
  if (queryIndex == -1) {
    url += '?';
  } else if (queryIndex < url.length - 1) {
    url += '&';
  }
  url += encodeURIComponent(param) + '=' + encodeURIComponent(value);
  return url + fragment;
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

/** @private @enum {number} Allowed fetch responses. */
const allowedFetchTypes_ = {
  document: 1,
  text: 2,
};


/**
 * A class that polyfills Fetch API.
 */
class Xhr {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   *
   * @param {string} input
   * @param {!FetchInitDef} init
   * @return {!Promise<!FetchResponse>|!Promise<!Response>}
   * @private
   */
  fetch_(input, init) {
    // TODO(avimehta): Should the requests go through when page is not visible?
    assert(typeof input == 'string', 'Only URL supported: %s', input);
    // In particular, Firefox does not tolerate `null` values for
    // `credentials`.
    const creds = init.credentials;
    assert(
        creds === undefined || creds == 'include' || creds == 'omit',
        'Only credentials=include|omit support: %s', creds);
    // Fallback to xhr polyfill since `fetch` api does not support
    // responseType = 'document'. We do this so we don't have to do any parsing
    // and document construction on the UI thread which would be expensive.
    if (init.responseType == 'document') {
      return fetchPolyfill(input, init);
    }
    return (this.win.fetch || fetchPolyfill).apply(null, arguments);
  }

  /**
   * @param {string} input URL
   * @param {?FetchInitDef} opt_init Fetch options object.
   * @return {!Promise<!FetchResponse>}
   */
  fetch(input, opt_init) {
    // TODO (avimehta): Figure out if CORS needs be handled the way AMP does it.
    const init = setupInit(opt_init);
    return this.fetch_(input, init).then(response => response, reason => {
      const targetOrigin = parseUrl$1(input).origin;
      throw new Error('XHR Failed fetching' +
          ` (${targetOrigin}/...):`, reason && reason.message);
    }).then(response => assertSuccess(response));
  }
}

/**
 * Normalized method name by uppercasing.
 * @param {string|undefined} method
 * @return {string}
 * @private
 */
function normalizeMethod_(method) {
  if (method === undefined) {
    return 'GET';
  }
  method = method.toUpperCase();

  assert(
      allowedMethods_.includes(method),
      'Only one of %s is currently allowed. Got %s',
      allowedMethods_.join(', '),
      method
  );

  return method;
}

/**
 * Sets up and normalizes the FetchInitDef
 *
 * @param {?FetchInitDef=} opt_init Fetch options object.
 * @param {string=} opt_accept The HTTP Accept header value.
 * @return {!FetchInitDef}
 */
function setupInit(opt_init, opt_accept) {
  const init = opt_init || /** @type {FetchInitDef} */ ({});
  init.method = normalizeMethod_(init.method);
  init.headers = init.headers || {};
  if (opt_accept) {
    init.headers['Accept'] = opt_accept;
  }
  return init;
}


/**
 * A minimal polyfill of Fetch API. It only polyfills what we currently use.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 *
 * Notice that the "fetch" method itself is not exported as that would require
 * us to immediately support a much wide API.
 *
 * @param {string} input
 * @param {!FetchInitDef} init
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
function fetchPolyfill(input, init) {
  return new Promise(function(resolve, reject) {
    const xhr = createXhrRequest(init.method || 'GET', input);

    if (init.credentials == 'include') {
      xhr.withCredentials = true;
    }

    if (init.responseType in allowedFetchTypes_) {
      xhr.responseType = init.responseType;
    }

    if (init.headers) {
      Object.keys(init.headers).forEach(function(header) {
        xhr.setRequestHeader(header, init.headers[header]);
      });
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
        return;
      }
      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(new Error(`Unknown HTTP status ${xhr.status}`));
        return;
      }

      // TODO(dvoytenko): This is currently simplified: we will wait for the
      // whole document loading to complete. This is fine for the use cases
      // we have now, but may need to be reimplemented later.
      if (xhr.readyState == /* COMPLETE */ 4) {
        resolve(new FetchResponse(xhr));
      }
    };
    xhr.onerror = () => {
      reject(new Error('Network failure'));
    };
    xhr.onabort = () => {
      reject(new Error('Request aborted'));
    };

    if (init.method == 'POST') {
      xhr.send(init.body);
    } else {
      xhr.send();
    }
  });
}

/**
 * @param {string} method
 * @param {string} url
 * @return {!XMLHttpRequest}
 * @private
 */
function createXhrRequest(method, url) {
  const xhr = new XMLHttpRequest();
  // TODO(avimehta): IE 8/9 don't support XHR (with CORS). Use XDR instead
  // if we plan to support those browsers.
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
  } else {
    throw new Error('CORS is not supported');
  }
  return xhr;
}

/**
 * If 415 or in the 5xx range.
 * @param {number} status
 */
function isRetriable(status) {
  return status == 415 || (status >= 500 && status < 600);
}


/**
 * Returns the response if successful or otherwise throws an error.
 * @param {!FetchResponse} response
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
function assertSuccess(response) {
  return new Promise(resolve => {
    if (response.ok) {
      return resolve(response);
    }

    const {status} = response;
    const err = new Error(`HTTP error ${status}`);
    err.retriable = isRetriable(status);
    // TODO(@jridgewell, #9448): Callers who need the response should
    // skip processing.
    err.response = response;
    throw err;
  });
}


/**
 * Response object in the Fetch API.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 */
class FetchResponse {
  /**
   * @param {!XMLHttpRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest} */
    this.xhr_ = xhr;

    /** @const {number} */
    this.status = this.xhr_.status;

    /** @const {boolean} */
    this.ok = this.status >= 200 && this.status < 300;

    /** @const {!FetchResponseHeaders} */
    this.headers = new FetchResponseHeaders(xhr);

    /** @type {boolean} */
    this.bodyUsed = false;

    /** @type {?ReadableStream} */
    this.body = null;
  }

  /**
   * Create a copy of the response and return it.
   * @return {!FetchResponse}
   */
  clone() {
    assert(!this.bodyUsed, 'Body already used');
    return new FetchResponse(this.xhr_);
  }

  /**
   * Drains the response and returns the text.
   * @return {!Promise<string>}
   * @private
   */
  drainText_() {
    assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    return Promise.resolve(this.xhr_.responseText);
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * text.
   * @return {!Promise<string>}
   */
  text() {
    return this.drainText_();
  }

  /**
   * Drains the response and returns the JSON object.
   * @return {!Promise<!JsonObject>}
   */
  json() {
    return /** @type {!Promise<!JsonObject>} */ (
        this.drainText_().then(parseJson));
  }

  /**
   * Reads the xhr responseXML.
   * @return {!Promise<!Document>}
   * @private
   */
  document_() {
    assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    assert(this.xhr_.responseXML,
        'responseXML should exist. Make sure to return ' +
        'Content-Type: text/html header.');
    return /** @type {!Promise<!Document>} */ (
        Promise.resolve(assert(this.xhr_.responseXML)));
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * ArrayBuffer.
   * @return {!Promise<!ArrayBuffer>}
   */
  arrayBuffer() {
    return /** @type {!Promise<!ArrayBuffer>} */ (
        this.drainText_().then(utf8EncodeSync));
  }
}


/**
 * Provides access to the response headers as defined in the Fetch API.
 * @private Visible for testing.
 */
class FetchResponseHeaders {
  /**
   * @param {!XMLHttpRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest} */
    this.xhr_ = xhr;
  }

  /**
   * @param {string} name
   * @return {string}
   */
  get(name) {
    return this.xhr_.getResponseHeader(name);
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  has(name) {
    return this.xhr_.getResponseHeader(name) != null;
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Have to put these in the map to avoid compiler optimization. Due to
 * optimization issues, this map only allows property-style keys. E.g. "hr1",
 * as opposed to "1hr".
 * @type {!Object<string, number>}
 * @package Visible for testing only.
 */
const CACHE_KEYS = {
  'nocache': 1,
  'hr1': 3600000,  // 1hr = 1000 * 60 * 60
  'hr12': 43200000,  // 12hr = 1000 * 60 * 60 * 12
};


/**
 * @return {string}
 */
function feOrigin() {
  return parseUrl$1('https://news.google.com').origin;
}


/**
 * @param {string} url Relative URL, e.g. "/service1".
 * @return {string} The complete URL.
 */
function serviceUrl(url) {
  return 'https://news.google.com/swg/_/api/v1' + url;
}


/**
 * @param {string} url Relative URL, e.g. "/offersiframe".
 * @param {string=} prefix
 * @return {string} The complete URL.
 */
function feUrl(url, prefix = '') {
  return feCached('https://news.google.com' + prefix + '/swg/_/ui/v1' + url);
}


/**
 * @param {string} url FE URL.
 * @return {string} The complete URL including cache params.
 */
function feCached(url) {
  return addQueryParam(url, '_', cacheParam('hr1'));
}


/**
 * @param {!Object<string, ?>} args
 * @return {!Object<string, ?>}
 */
function feArgs(args) {
  return Object.assign(args, {
    '_client': 'SwG 0.1.22.27',
  });
}


/**
 * @param {string} cacheKey
 * @return {string}
 * @package Visible for testing only.
 */
function cacheParam(cacheKey) {
  let period = CACHE_KEYS[cacheKey];
  if (period == null) {
    period = 1;
  }
  if (period === 0) {
    return '_';
  }
  const now = Date.now();
  return String(period <= 1 ? now : Math.floor(now / period));
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

const PAY_REQUEST_ID = 'swg-pay';

/**
 * @const {!Object<string, string>}
 * @package Visible for testing only.
 */
const PAY_ORIGIN = {
  'PRODUCTION': 'https://pay.google.com',
  'SANDBOX': 'https://pay.sandbox.google.com',
};


/** @return {string} */
function payOrigin() {
  return PAY_ORIGIN['PRODUCTION'];
}

/** @return {string} */
function payUrl() {
  return feCached(PAY_ORIGIN['PRODUCTION'] + '/gp/p/ui/pay');
}

/** @return {string} */
function payDecryptUrl() {
  return PAY_ORIGIN['PRODUCTION'] + '/gp/p/apis/buyflow/process';
}


/**
 * The flow to initiate payment process.
 */
class PayStartFlow {

  /**
   * @param {!../utils/preconnect.Preconnect} pre
   */
  static preconnect(pre) {
    pre.prefetch(payUrl());
    pre.prefetch(
        'https://payments.google.com/payments/v4/js/integrator.js?ss=md');
    pre.prefetch('https://clients2.google.com/gr/gr_full_2.0.6.js');
    pre.preconnect('https://www.gstatic.com/');
    pre.preconnect('https://fonts.googleapis.com/');
    pre.preconnect('https://www.google.com/');
  }

  /**
   * @param {!./deps.DepsDef} deps
   * @param {string} sku
   */
  constructor(deps, sku) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = deps.pageConfig();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {string} */
    this.sku_ = sku;
  }

  /**
   * Starts the payments flow.
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(SubscriptionFlows.SUBSCRIBE, {
      'sku': this.sku_,
    });

    // TODO(dvoytenko): switch to gpay async client.
    const forceRedirect =
        this.deps_.config().windowOpenMode == WindowOpenMode.REDIRECT;
    const opener = this.activityPorts_.open(
        PAY_REQUEST_ID,
        payUrl(),
        forceRedirect ? '_top' : '_blank',
        feArgs({
          'apiVersion': 1,
          'allowedPaymentMethods': ['CARD'],
          'environment': 'PRODUCTION',
          'playEnvironment': 'PROD',
          'swg': {
            'publicationId': this.pageConfig_.getPublicationId(),
            'skuId': this.sku_,
          },
        }), {});
    this.dialogManager_.popupOpened(opener && opener.targetWin);
    return Promise.resolve();
  }
}


/**
 * The flow for successful payments completion.
 */
class PayCompleteFlow {

  /**
   * @param {!./deps.DepsDef} deps
   */
  static configurePending(deps) {
    deps.activities().onResult(PAY_REQUEST_ID, port => {
      deps.dialogManager().popupClosed();
      deps.entitlementsManager().blockNextNotification();
      const flow = new PayCompleteFlow(deps);
      const promise = validatePayResponse(deps, port, flow.complete.bind(flow));
      deps.callbacks().triggerSubscribeResponse(promise);
      return promise.then(response => {
        flow.start(response);
      }, reason => {
        if (isCancelError(reason)) {
          deps.callbacks().triggerFlowCanceled(SubscriptionFlows.SUBSCRIBE);
        }
        throw reason;
      });
    });
  }

  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?ActivityIframeView} */
    this.activityIframeView_ = null;

    /** @private {?SubscribeResponse} */
    this.response_ = null;

    /** @private {?Promise} */
    this.readyPromise_ = null;
  }

  /**
   * Starts the payments completion flow.
   * @param {!SubscribeResponse} response
   * @return {!Promise}
   */
  start(response) {
    this.deps_.entitlementsManager().reset(true);
    this.response_ = response;
    const args = {
      'publicationId': this.deps_.pageConfig().getPublicationId(),
    };
    // TODO(dvoytenko, #400): cleanup once entitlements is launched everywhere.
    if (response.userData && response.entitlements) {
      args['idToken'] = response.userData.idToken;
      this.deps_.entitlementsManager().pushNextEntitlements(
          response.entitlements.raw);
    } else {
      args['loginHint'] = response.userData && response.userData.email;
    }
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/payconfirmiframe'),
        feArgs(args),
        /* shouldFadeBody */ true);
    this.activityIframeView_.onMessage(data => {
      if (data['entitlements']) {
        this.deps_.entitlementsManager().pushNextEntitlements(
            /** @type {string} */ (data['entitlements']));
        return;
      }
    });
    this.activityIframeView_.acceptResult().then(() => {
      // The flow is complete.
      this.dialogManager_.completeView(this.activityIframeView_);
    });
    this.readyPromise_ = this.dialogManager_.openView(this.activityIframeView_);
    return this.readyPromise_;
  }

  /**
   * @return {!Promise}
   */
  complete() {
    this.deps_.entitlementsManager().unblockNextNotification();
    this.readyPromise_.then(() => {
      this.activityIframeView_.message({'complete': true});
    });
    return this.activityIframeView_.acceptResult().catch(() => {
      // Ignore errors.
    }).then(() => {
      this.deps_.entitlementsManager().setToastShown(true);
    });
  }
}


/**
 * @param {!./deps.DepsDef} deps
 * @param {!web-activities/activity-ports.ActivityPort} port
 * @param {function():!Promise} completeHandler
 * @return {!Promise<!SubscribeResponse>}
 */
function validatePayResponse(deps, port, completeHandler) {
  // Do not require security immediately: it will be checked below.
  return port.acceptResult().then(result => {
    if (result.origin != payOrigin()) {
      throw new Error('channel mismatch');
    }
    const data = /** @type {!Object} */ (result.data);
    if (data['redirectEncryptedCallbackData']) {
      // Data is supplied as an encrypted blob.
      const xhr = new Xhr(deps.win());
      const url = payDecryptUrl();
      const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
        method: 'post',
        headers: {'Accept': 'text/plain, application/json'},
        credentials: 'include',
        body: data['redirectEncryptedCallbackData'],
        mode: 'cors',
      });
      return xhr.fetch(url, init).then(response => response.json());
    }
    // Data is supplied directly: must be a verified and secure channel.
    if (result.originVerified && result.secureChannel) {
      return data;
    }
    throw new Error('channel mismatch');
  }).then(data => parseSubscriptionResponse(deps, data, completeHandler));
}


/**
 * @param {!./deps.DepsDef} deps
 * @param {*} data
 * @param {function():!Promise} completeHandler
 * @return {!SubscribeResponse}
 */
function parseSubscriptionResponse(deps, data, completeHandler) {
  let swgData = null;
  let raw = null;
  if (data) {
    if (typeof data == 'string') {
      raw = /** @type {string} */ (data);
    } else {
      // Assume it's a json object in the format:
      // `{integratorClientCallbackData: "..."}` or `{swgCallbackData: "..."}`.
      const json = /** @type {!Object} */ (data);
      if ('swgCallbackData' in json) {
        swgData = /** @type {!Object} */ (json['swgCallbackData']);
      } else if ('integratorClientCallbackData' in json) {
        raw = json['integratorClientCallbackData'];
      }
    }
  }
  if (raw && !swgData) {
    raw = atob(raw);
    if (raw) {
      const parsed = parseJson(raw);
      swgData = parsed['swgCallbackData'];
    }
  }
  if (!swgData) {
    throw new Error('unexpected payment response');
  }
  raw = JSON.stringify(/** @type {!JsonObject} */ (swgData));
  return new SubscribeResponse(
      raw,
      parsePurchaseData(swgData),
      parseUserData(swgData),
      parseEntitlements(deps, swgData),
      completeHandler);
}


/**
 * @param {!Object} swgData
 * @return {!PurchaseData}
 */
function parsePurchaseData(swgData) {
  const raw = swgData['purchaseData'];
  const signature = swgData['purchaseDataSignature'];
  return new PurchaseData(raw, signature);
}


/**
 * @param {!Object} swgData
 * @return {?UserData}
 * @package Visible for testing.
 */
function parseUserData(swgData) {
  const idToken = swgData['idToken'];
  if (!idToken) {
    return null;
  }
  const jwt = /** @type {!Object} */ (new JwtHelper().decode(idToken));
  return new UserData(idToken, jwt);
}


/**
 * @param {!./deps.DepsDef} deps
 * @param {!Object} swgData
 * @return {?../api/entitlements.Entitlements}
 * @package Visible for testing.
 */
function parseEntitlements(deps, swgData) {
  if (swgData['signedEntitlements']) {
    return deps.entitlementsManager().parseEntitlements(swgData);
  }
  return null;
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * The flow to initiate deferred account process.
 * See `Subscriptions.completeDeferredAccountCreation` API.
 */
class DeferredAccountFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {?../api/deferred-account-creation.DeferredAccountCreationRequest} options
   */
  constructor(deps, options) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?ActivityIframeView} */
    this.activityIframeView_ = null;

    /** @private {?Promise} */
    this.openPromise_ = null;

    /** @type {!../api/deferred-account-creation.DeferredAccountCreationRequest} */
    const defaultOptions = {
      entitlements: null,
      consent: true,
    };
    /** @private @const {!../api/deferred-account-creation.DeferredAccountCreationRequest} */
    this.options_ = Object.assign(defaultOptions, options || {});
  }

  /**
   * Starts the deferred account flow.
   * @return {!Promise<!DeferredAccountCreationResponse>}
   */
  start() {
    const entitlements = this.options_.entitlements;

    // For now, entitlements are required to be present and have the Google
    // token. This is strictly not required for the implementation. But it's
    // preferrable API-wise at this time.
    if (!entitlements || !entitlements.getEntitlementForSource('google')) {
      throw new Error('No entitlements with "google" source');
    }

    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.COMPLETE_DEFERRED_ACCOUNT_CREATION);

    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/recoveriframe'),
        feArgs({
          'publicationId': this.deps_.pageConfig().getPublicationId(),
          'productId': this.deps_.pageConfig().getProductId(),
          'entitlements': entitlements && entitlements.raw || null,
          'consent': this.options_.consent,
        }),
        /* shouldFadeBody */ true);

    this.openPromise_ = this.dialogManager_.openView(this.activityIframeView_);
    return this.activityIframeView_.acceptResult().then(result => {
      // The consent part is complete.
      return this.handleConsentResponse_(/** @type {!Object} */ (result.data));
    }, reason => {
      if (isCancelError(reason)) {
        this.deps_.callbacks().triggerFlowCanceled(
            SubscriptionFlows.COMPLETE_DEFERRED_ACCOUNT_CREATION);
      } else {
        this.dialogManager_.completeView(this.activityIframeView_);
      }
      throw reason;
    });
  }

  /**
   * @param {!Object} data
   * @return {!DeferredAccountCreationResponse}
   * @private
   */
  handleConsentResponse_(data) {
    this.deps_.entitlementsManager().blockNextNotification();

    // Parse the response.
    const entitlementsJwt = data['entitlements'];
    const idToken = data['idToken'];
    const entitlements = this.deps_.entitlementsManager()
        .parseEntitlements({'signedEntitlements': entitlementsJwt});
    const userData = new UserData(
        idToken,
        /** @type {!Object} */ (new JwtHelper().decode(idToken)));
    const purchaseData = new PurchaseData(
        data['purchaseData'],
        data['purchaseDataSignature']);

    // For now, we'll use the `PayCompleteFlow` as a "creating account" flow.
    // But this can be eventually implemented by the same iframe.
    const creatingFlow = new PayCompleteFlow(this.deps_);
    const completeHandler = creatingFlow.complete.bind(creatingFlow);

    const response = new DeferredAccountCreationResponse(
        entitlements,
        userData,
        purchaseData,
        completeHandler);

    // Start the "sync" flow.
    creatingFlow.start(new SubscribeResponse(
        '',  // raw field doesn't matter in this case
        purchaseData,
        userData,
        entitlements,
        () => Promise.resolve()  // completeHandler doesn't matter in this case
    ));
    return response;
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

const CSS$1 = "body{padding:0;margin:0}swg-container,swg-loading,swg-loading-animate,swg-loading-image{display:block}swg-loading-container{width:100%!important;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;-webkit-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important;min-height:148px!important;height:100%!important;bottom:0!important;margin-top:5px!important;z-index:2147483647!important}@media (min-height:630px), (min-width:630px){swg-loading-container{width:560px!important;margin-left:35px!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;background-color:#fff!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}swg-loading{z-index:2147483647!important;width:36px;height:36px;overflow:hidden;-webkit-animation:mspin-rotate 1568.63ms infinite linear;animation:mspin-rotate 1568.63ms infinite linear}swg-loading-animate{-webkit-animation:mspin-revrot 5332ms infinite steps(4);animation:mspin-revrot 5332ms infinite steps(4)}swg-loading-image{background-image:url('data:image/svg+xml;charset=utf-8;base64,DQo8c3ZnIHZlcnNpb249IjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMTY2NCIgaGVpZ2h0PSIzNiIgdmlld0JveD0iMCAwIDExNjY0IDM2Ij48ZGVmcz48cGF0aCBpZD0iYSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWRhc2hhcnJheT0iNTguOSIgZD0iTTE4IDUuNUExMi41IDEyLjUgMCAxIDEgNS41IDE4IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz48ZyBpZD0iYiI+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE3Ni42NiIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzYuNTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzYuMzIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDcyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzUuODUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwOCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTc1LjE0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE3NC4xMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTgwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzIuNzgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIxNikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTcxLjAxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE2OC43OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjg4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNjYuMDIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMyNCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTYyLjczIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNjApIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE1OS4wMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzk2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNTUuMDQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQzMikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTUxLjA1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0NjgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE0Ny4yMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTA0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNDMuNzEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU0MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTQwLjU0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1NzYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEzNy43MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjEyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMzUuMjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDY0OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTMyLjk4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2ODQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEzMS4wMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzIwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjkuMjYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDc1NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTI3LjcxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEyNi4zMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODI4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjUuMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODY0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjQuMDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDkwMCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTIzLjA0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MzYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEyMi4xOSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOTcyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjEuNDMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMDgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEyMC43NyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA0NCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTIwLjE5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDgwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTkuNjkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExMTYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExOS4yNiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTE1MikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE4Ljg5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMTg4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTguNTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyMjQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExOC4zMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTI2MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE4LjEzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjk2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTcuOTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzMzIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExNy44OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM2OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE3LjgyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDA0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTcuOCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTQ0MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE3LjcyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDc2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTcuNDYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1MTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTU0OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE2LjI5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNTg0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTUuMjkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2MjApIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExMy45NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTY1NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTEyLjE5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNjkyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMDkuOTciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3MjgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEwNy4yMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTc2NCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTAzLjk2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODAwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMDAuMjciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4MzYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9Ijk2LjMyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODcyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI5Mi4zNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTkwOCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iODguNTYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE5NDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9Ijg1LjA3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxOTgwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI4MS45MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAxNikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNzkuMTEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwNTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9Ijc2LjYxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDg4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI3NC40IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTI0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI3Mi40NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjE2MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNzAuNzEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIxOTYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjY5LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMjMyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2Ny43OSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjI2OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjYuNTciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIzMDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjY1LjQ5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMzQwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2NC41MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM3NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjMuNjgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI0MTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYyLjkzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDQ4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2Mi4yNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjQ4NCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjEuNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUyMCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjEuMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjU1NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjAuNzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1OTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYwLjQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MjgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYwLjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2NjQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5Ljg1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNzAwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI1OS42NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjczNikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjc3MikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjgwOCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuMzQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI4NDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjMyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODgwKSIvPjwvZz48ZyBpZD0iYyI+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjcwLjcxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTk2KSIgb3BhY2l0eT0iLjA1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjY5LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMjMyKSIgb3BhY2l0eT0iLjEiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjcuNzkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIyNjgpIiBvcGFjaXR5PSIuMTUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjYuNTciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIzMDQpIiBvcGFjaXR5PSIuMiIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2NS40OSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM0MCkiIG9wYWNpdHk9Ii4yNSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2NC41MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM3NikiIG9wYWNpdHk9Ii4zIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYzLjY4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDEyKSIgb3BhY2l0eT0iLjM1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYyLjkzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDQ4KSIgb3BhY2l0eT0iLjQiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjIuMjciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI0ODQpIiBvcGFjaXR5PSIuNDUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjEuNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUyMCkiIG9wYWNpdHk9Ii41Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYxLjIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1NTYpIiBvcGFjaXR5PSIuNTUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjAuNzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1OTIpIiBvcGFjaXR5PSIuNiIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2MC40IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNjI4KSIgb3BhY2l0eT0iLjY1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYwLjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2NjQpIiBvcGFjaXR5PSIuNyIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI1OS44NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjcwMCkiIG9wYWNpdHk9Ii43NSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI1OS42NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjczNikiIG9wYWNpdHk9Ii44Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI3NzIpIiBvcGFjaXR5PSIuODUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjgwOCkiIG9wYWNpdHk9Ii45Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjM0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODQ0KSIgb3BhY2l0eT0iLjk1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjMyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODgwKSIvPjwvZz48L2RlZnM+PHVzZSB4bGluazpocmVmPSIjYiIgc3Ryb2tlPSIjNDI4NWY0Ii8+PHVzZSB4bGluazpocmVmPSIjYyIgc3Ryb2tlPSIjZGI0NDM3Ii8+PHVzZSB4bGluazpocmVmPSIjYiIgc3Ryb2tlPSIjZGI0NDM3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyOTE2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2MiIHN0cm9rZT0iI2Y0YjQwMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjkxNikiLz48dXNlIHhsaW5rOmhyZWY9IiNiIiBzdHJva2U9IiNmNGI0MDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU4MzIpIi8+PHVzZSB4bGluazpocmVmPSIjYyIgc3Ryb2tlPSIjMGY5ZDU4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1ODMyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2IiIHN0cm9rZT0iIzBmOWQ1OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODc0OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNjIiBzdHJva2U9IiM0Mjg1ZjQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDg3NDgpIi8+PC9zdmc+');background-size:100%;width:11664px;height:36px;-webkit-animation:swg-loading-film 5332ms infinite steps(324);animation:swg-loading-film 5332ms infinite steps(324)}@-webkit-keyframes swg-loading-film{0%{-webkit-transform:translateX(0);transform:translateX(0)}to{-webkit-transform:translateX(-11664px);transform:translateX(-11664px)}}@keyframes swg-loading-film{0%{-webkit-transform:translateX(0);transform:translateX(0)}to{-webkit-transform:translateX(-11664px);transform:translateX(-11664px)}}@-webkit-keyframes mspin-rotate{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes mspin-rotate{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes mspin-revrot{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(-360deg);transform:rotate(-360deg)}}@keyframes mspin-revrot{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(-360deg);transform:rotate(-360deg)}}\n/*# sourceURL=/./src/ui/ui.css*/";

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Returns a promise which is resolved after the given duration of animation
 * @param {!Element} el - Element to be observed.
 * @param {!Object<string, string|number>} props - properties to be animated.
 * @param {number} durationMillis - duration of animation.
 * @param {string} curve - transition function for the animation.
 * @return {!Promise} Promise which resolves once the animation is done playing.
 */
function transition(el, props, durationMillis, curve) {
  const win = el.ownerDocument.defaultView;
  const previousTransitionValue = el.style.transition || '';
  return new Promise(resolve => {
    win.setTimeout(() => {
      win.setTimeout(resolve, durationMillis);
      const tr = `${durationMillis}ms ${curve}`;
      setImportantStyles(el, Object.assign({
        'transition': `transform ${tr}, opacity ${tr}`,
      }, props));
    });
  }).then(() => {
    setImportantStyles(el, {
      'transition': previousTransitionValue,
    });
  });
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


class Graypane {

  /**
   * @param {!../model/doc.Doc} doc
   * @param {number} zIndex
   */
  constructor(doc, zIndex) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private @const {!Element} */
    this.fadeBackground_ = this.doc_.getWin().document.createElement(
        'swg-popup-background');
    setImportantStyles(this.fadeBackground_, {
      'z-index': zIndex,
      'display': 'none',
      'position': 'fixed',
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0,
      'background-color': 'rgba(32, 33, 36, .6)',
    });
  }

  /**
   * @return {!Element}
   */
  getElement() {
    return this.fadeBackground_;
  }

  /**
   * @return {boolean}
   */
  isAttached() {
    return !!this.fadeBackground_.parentNode;
  }

  /**
   * Attaches the graypane to the document.
   */
  attach() {
    this.doc_.getBody().appendChild(this.fadeBackground_);
  }

  /**
   * Detaches the graypane to the document.
   */
  destroy() {
    this.doc_.getBody().removeChild(this.fadeBackground_);
  }

  /**
   * Shows the graypane.
   * @param {boolean=} animated
   * @return {!Promise|undefined}
   */
  show(animated = true) {
    setImportantStyles(this.fadeBackground_, {
      'display': 'block',
      'opacity': animated ? 0 : 1,
    });
    if (animated) {
      return transition(this.fadeBackground_, {
        'opacity': 1,
      }, 300, 'ease-out');
    }
  }

  /**
   * Hides the graypane.
   * @param {boolean=} animated
   * @return {!Promise|undefined}
   */
  hide(animated = true) {
    if (animated) {
      return transition(this.fadeBackground_, {
        'opacity': 0,
      }, 300, 'ease-out').then(() => {
        setImportantStyles(this.fadeBackground_, {'display': 'none'});
      });
    }
    setImportantStyles(this.fadeBackground_, {'display': 'none'});
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Loading indicator class. Builds the loading indicator view to be injected in
 * parent element <iframe class="swg-dialog"> element. Provides methods to
 * show/hide loading indicator.
 */
class LoadingView {

  /**
   * @param {!Document} doc
   */
  constructor(doc) {

    /** @private @const {!Document} */
    this.doc_ = doc;

    /** @private @const {!Element} */
    this.loadingContainer_ =
        createElement(this.doc_, 'swg-loading-container', {});

    /** @private @const {!Element} */
    this.loading_ = createElement(this.doc_, 'swg-loading', {});
    this.loadingContainer_.appendChild(this.loading_);

    this.loadingContainer_.style.setProperty('display', 'none', 'important');

    // Build the animated loading indicator.
    this.buildLoadingIndicator_();
  }

  /**
   * Gets the populated loading container.
   * @return {!Element}
   */
  getElement() {
    return this.loadingContainer_;
  }

  /**
   * Shows the loading indicator within the container element.
   */
  show() {
    this.loadingContainer_.style.removeProperty('display');
  }

  /**
   * Hides the loading indicator within the container element.
   */
  hide() {
    this.loadingContainer_.style.setProperty('display', 'none', 'important');
  }

  /**
   * Populates the loading indivicator. The populated element
   * can be added in any view, when required.
   * @private
   */
  buildLoadingIndicator_() {
    const loadingContainer = this.loading_;

    const loadingIndicatorTopContainer =
        createElement(this.doc_, 'swg-loading-animate', {});
    loadingContainer.appendChild(loadingIndicatorTopContainer);

    const loadingIndicatorChildContainer =
        createElement(this.doc_, 'swg-loading-image', {});
    loadingIndicatorTopContainer.appendChild(loadingIndicatorChildContainer);
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

/** @const {!Object<string|number>} */
const friendlyIframeAttributes = {
  'frameborder': 0,
  'scrolling': 'no',
  'src': 'about:blank',
};

/**
 * The class for building friendly iframe.
 */
class FriendlyIframe {

  /**
   * @param {!Document} doc
   * @param {!Object<string, string|number>=} attrs
   */
  constructor(doc, attrs = {}) {

    const mergedAttrs = Object.assign({}, friendlyIframeAttributes, attrs);

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ =
        /** @type {!HTMLIFrameElement} */ (
            createElement(doc, 'iframe', mergedAttrs));

    // Ensure that the new iframe does not inherit any CSS styles.
    resetAllStyles(this.iframe_);

    /** @private @const {!Promise} */
    this.ready_ = new Promise(resolve => {
      this.iframe_.onload = resolve;
    });
  }

  /**
   * When promise is resolved.
   * @return {!Promise}
   */
  whenReady() {
    return this.ready_;
  }

  /**
   * Gets the iframe element.
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_;
  }

  /**
   * Gets the document object of the iframe element.
   * @return {!Document}
   */
  getDocument() {
    const doc = this.getElement().contentDocument ||
        (this.getElement().contentWindow &&
        this.getElement().contentWindow.document);

    if (!doc) {
      throw new Error('not loaded');
    }
    return doc;
  }

  /**
   * Gets the body of the iframe.
   * @return {!Element}
   */
  getBody() {
    return /** @type {!Element} */ (this.getDocument().body);
  }

  /**
   * Whether the iframe is connected.
   * @return {boolean}
   */
  isConnected() {
    if (!this.getElement().ownerDocument) {
      return false;
    }
    return this.getElement().ownerDocument.contains(this.iframe_);
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

const Z_INDEX = 2147483647;

/**
 * Default iframe important styles.
 * Note: The iframe responsiveness media query style is injected in the
 * publisher's page since style attribute can not include media query.
 * @const {!Object<string, string|number>}
 */
const rootElementImportantStyles = {
  'min-height': '50px',
  'border': 'none',
  'display': 'block',
  'position': 'fixed',
  'z-index': Z_INDEX,
  'box-sizing': 'border-box',
};

/**
 * Reset view styles.
 * @const {!Object<string, string|number>}
 */
const resetViewStyles = {
  'position': 'absolute',
  'top': '0',
  'left': '0',
  'right': '0',
  'bottom': '0',
  'opacity': 0,
  /* These lines are a work around to this issue in iOS:     */
  /* https://bugs.webkit.org/show_bug.cgi?id=155198          */
  'height': 0,
  'max-height': '100%',
  'max-width': '100%',
  'min-height': '100%',
  'min-width': '100%',
  'width': 0,
};

/**
 * Position of the dialog.
 * @const @enum {string}
 */
const PositionAt = {
  BOTTOM: 'BOTTOM',
  TOP: 'TOP',
  FLOAT: 'FLOAT',
  FULL: 'FULL',
};


/**
 * The class for the top level dialog.
 * @final
 */
class Dialog {

  /**
   * Create a dialog for the provided doc.
   * @param {!../model/doc.Doc} doc
   * @param {!Object<string, string|number>=} importantStyles
   * @param {!Object<string, string|number>=} styles
   */
  constructor(doc, importantStyles = {}, styles = {}) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private @const {!FriendlyIframe} */
    this.iframe_ = new FriendlyIframe(
        doc.getWin().document, {'class': 'swg-dialog'});

    /** @private @const {!Graypane} */
    this.graypane_ = new Graypane(doc, Z_INDEX - 1);

    const modifiedImportantStyles =
        Object.assign({}, rootElementImportantStyles, importantStyles);
    setImportantStyles(
        this.iframe_.getElement(), modifiedImportantStyles);

    setStyles(this.iframe_.getElement(), styles);

    /** @private {LoadingView} */
    this.loadingView_ = null;

    /** @private {?Element} */
    this.container_ = null;  // Depends on constructed document inside iframe.

    /** @private {?./view.View} */
    this.view_ = null;

    /** @private {?Promise} */
    this.animating_ = null;

    /** @private {boolean} */
    this.hidden_ = false;

    /** @private {?./view.View} */
    this.previousProgressView_ = null;
  }

  /**
   * Opens the dialog and builds the iframe container.
   * @param {boolean=} hidden
   * @return {!Promise<!Dialog>}
   */
  open(hidden = false) {
    const iframe = this.iframe_;
    if (iframe.isConnected()) {
      throw new Error('already opened');
    }

    // Attach.
    this.doc_.getBody().appendChild(iframe.getElement());  // Fires onload.
    this.graypane_.attach();

    if (hidden) {
      setImportantStyles(iframe.getElement(), {
        'visibility': 'hidden',
        'opacity': 0,
      });
      this.hidden_ = hidden;
    } else {
      this.show_();
    }

    return iframe.whenReady().then(() => {
      this.buildIframe_();
      return this;
    });
  }

  /**
   * Build the iframe with the styling after iframe is loaded.
   * @private
   */
  buildIframe_() {
    const iframe = this.iframe_;
    const iframeBody = iframe.getBody();
    const iframeDoc = /** @type {!HTMLDocument} */ (this.iframe_.getDocument());

    // Inject Google fonts in <HEAD> section of the iframe.
    injectStyleSheet(iframeDoc, CSS$1);

    // Add Loading indicator.
    this.loadingView_ = new LoadingView(iframeDoc);
    iframeBody.appendChild(this.loadingView_.getElement());

    // Container for all dynamic content, including 3P iframe.
    this.container_ = createElement(iframeDoc, 'swg-container', {});
    iframeBody.appendChild(this.container_);
    this.setPosition_();
  }

  /**
   * Closes the dialog.
   * @param {boolean=} animated
   * @return {!Promise}
   */
  close(animated = true) {
    let animating;
    if (animated) {
      animating = this.animate_(() => {
        this.graypane_.hide(/* animate */ true);
        return transition(this.getElement(), {
          'transform': 'translateY(100%)',
        }, 300, 'ease-out');
      });
    } else {
      animating = Promise.resolve();
    }
    return animating.then(() => {
      this.doc_.getBody().removeChild(this.iframe_.getElement());
      this.removePaddingToHtml_();
      this.graypane_.destroy();
    });
  }

  /**
   * Gets the container within the dialog.
   * @return {!Element}
   */
  getContainer() {
    if (!this.container_) {
      throw new Error('not opened yet');
    }
    return this.container_;
  }

  /**
   * Gets the attached iframe instance.
   * @return {!FriendlyIframe}
   */
  getIframe() {
    return this.iframe_;
  }

  /**
   * Gets the Iframe element.
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_.getElement();
  }

  /**
   * Transitions to the next view.
   * @private
   */
  entryTransitionToNextView_() {
    if (this.view_ && this.view_.hasLoadingIndicator()) {
      // Temporarily cache the old view.
      this.previousProgressView_ = this.view_;
    } else {
      // Since loading indicator will be shown, remove contents of old view.
      removeChildren(this.getContainer());
      // When loading indicator was not displayed in the previous view,
      // loading indicator must be displayed while transitioning to new view.
      this.loadingView_.show();
    }
  }

   /**
   * Transition out of an old view.
   * @private
   */
  exitTransitionFromOldView_() {
    // If previous view is still around, remove it.
    if (this.previousProgressView_) {
      removeElement(this.previousProgressView_.getElement());
      this.previousProgressView_ = null;
    } else {
      this.loadingView_.hide();
    }
  }

  /** @return {?./view.View} */
  getCurrentView() {
    return this.view_;
  }

  /**
   * Opens the given view and removes existing view from the DOM if any.
   * @param {!./view.View} view
   * @return {!Promise}
   */
  openView(view) {
    setImportantStyles(view.getElement(), resetViewStyles);
    this.entryTransitionToNextView_();

    this.view_ = view;
    this.getContainer().appendChild(view.getElement());

    // If the current view should fade the parent document.
    if (view.shouldFadeBody() && !this.hidden_) {
      this.graypane_.show(/* animate */ true);
    }

    return view.init(this).then(() => {
      setImportantStyles(view.getElement(), {
        'opacity': 1,
      });
      if (this.hidden_) {
        if (view.shouldFadeBody()) {
          this.graypane_.show(/* animated */ true);
        }
        this.show_();
      }
      this.exitTransitionFromOldView_();
    });
  }

  /**
   * Show the iframe.
   * @private
   */
  show_() {
    this.animate_(() => {
      setImportantStyles(this.getElement(), {
        'transform': 'translateY(100%)',
        'opactiy': 1,
        'visibility': 'visible',
      });
      return transition(this.getElement(), {
        'transform': 'translateY(0)',
        'opacity': 1,
        'visibility': 'visible',
      }, 300, 'ease-out');
    });
    this.hidden_ = false;
  }

  /**
   * Resizes the dialog container.
   * @param {!./view.View} view
   * @param {number} height
   * @param {boolean=} animated
   * @return {?Promise}
   */
  resizeView(view, height, animated = true) {
    if (this.view_ != view) {
      return null;
    }
    const newHeight = this.getMaxAllowedHeight_(height);

    let animating;
    if (animated) {
      const oldHeight = this.getElement().offsetHeight;
      if (newHeight >= oldHeight) {
        // Expand.
        animating = this.animate_(() => {
          setImportantStyles(this.getElement(), {
            'height': `${newHeight}px`,
            'transform': `translateY(${newHeight - oldHeight}px)`,
          });
          return transition(this.getElement(), {
            'transform': 'translateY(0)',
          }, 300, 'ease-out');
        });
      } else {
        // Collapse.
        animating = this.animate_(() => {
          return transition(this.getElement(), {
            'transform': `translateY(${oldHeight - newHeight}px)`,
          }, 300, 'ease-out').then(() => {
            setImportantStyles(this.getElement(), {
              'height': `${newHeight}px`,
              'transform': 'translateY(0)',
            });
          });
        });
      }
    } else {
      setImportantStyles(this.getElement(), {
        'height': `${newHeight}px`,
      });
      animating = Promise.resolve();
    }
    return animating.then(() => {
      this.updatePaddingToHtml_(height);
      view.resized();
    });
  }

  /**
   * @param {function():!Promise} callback
   * @return {!Promise}
   * @private
   */
  animate_(callback) {
    const wait = this.animating_ || Promise.resolve();
    return this.animating_ = wait.then(() => {
      return callback();
    }, () => {
      // Ignore errors to make sure animations don't get stuck.
    }).then(() => {
      this.animating_ = null;
    });
  }

  /**
   * Returns maximum allowed height for current viewport.
   * @param {number} height
   * @return {number}
   * @private
   */
  getMaxAllowedHeight_(height) {
    return Math.min(height, this.doc_.getWin()./*OK*/innerHeight * 0.9);
  }

  /**
   * Gets the element's height.
   * @return {number}
   * @private
   */
  getHeight_() {
    return this.getElement().offsetHeight;
  }

  /**
   * Sets the position of the dialog. Currently 'BOTTOM' is set by default.
   */
  setPosition_() {
    setImportantStyles(this.getElement(), this.getPositionStyle_());
  }

  /**
   * Add the padding to the containing page so as to not hide the content
   * behind the popup, if rendered at the bottom.
   * @param {number} newHeight
   * @private
   */
  updatePaddingToHtml_(newHeight) {
    if (this.inferPosition_() == PositionAt.BOTTOM) {
      const bottomPadding = newHeight + 20;  // Add some extra padding.
      const htmlElement = this.doc_.getRootElement();
      setImportantStyles(htmlElement, {
        'padding-bottom': `${bottomPadding}px`,
      });
    }
  }

  /**
   * Removes previouly added bottom padding from the document.
   * @private
   */
  removePaddingToHtml_() {
    this.doc_.getRootElement().style.removeProperty('padding-bottom');
  }


  /**
   * Calculates the position of the dialog. Currently dialog is positioned at
   * the bottom only. This could change in future to adjust the dialog position
   * based on the screen size.
   * @return {string}
   * @private
   */
  inferPosition_() {
    return PositionAt.BOTTOM;
  }

  /**
   * Returns the styles required to postion the dialog.
   * @return {!Object<string, string|number>}
   * @private
   */
  getPositionStyle_() {
    const dialogPosition = this.inferPosition_();
    switch (dialogPosition) {
      case PositionAt.BOTTOM:
        return {'bottom': 0};
      case PositionAt.TOP:
        return {'top': 0};
      case PositionAt.FLOAT:
        return {
          'position': 'fixed',
          'top': '50%',
          'left': '50%',
          'transform': 'translate(-50%, -50%)',
        };
      case PositionAt.FULL:
        return {
          'position': 'fixed',
          'height': '100%',
          'top': 0,
          'bottom': 0,
        };
      default:
        return {'bottom': 0};
    }
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

const POPUP_Z_INDEX = 2147483647;


/**
 * The class for the top level dialog.
 * @final
 */
class DialogManager {

  /**
   * @param {!../model/doc.Doc} doc
   */
  constructor(doc) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private {?Dialog} */
    this.dialog_ = null;

    /** @private {?Promise<!Dialog>} */
    this.openPromise_ = null;

    /** @private @const {!Graypane} */
    this.popupGraypane_ = new Graypane(doc, POPUP_Z_INDEX);

    /** @private {?Window} */
    this.popupWin_ = null;

    this.popupGraypane_.getElement().addEventListener('click', () => {
      if (this.popupWin_) {
        try {
          this.popupWin_.focus();
        } catch (e) {
          // Ignore error.
        }
      }
    });
  }

  /**
   * @param {boolean=} hidden
   * @return {!Promise<!Dialog>}
   */
  openDialog(hidden = false) {
    if (!this.openPromise_) {
      this.dialog_ = new Dialog(this.doc_);
      this.openPromise_ = this.dialog_.open(hidden);
    }
    return this.openPromise_;
  }

  /**
   * @param {!./view.View} view
   * @param {boolean=} hidden
   * @return {!Promise}
   */
  openView(view, hidden = false) {
    view.whenComplete().catch(reason => {
      if (isCancelError(reason)) {
        this.completeView(view);
      }
      throw (reason);
    });
    return this.openDialog(hidden).then(dialog => {
      return dialog.openView(view);
    });
  }

  /**
   * @param {?./view.View} view
   */
  completeView(view) {
    // Give a small amount of time for another view to take over the dialog.
    setTimeout(() => {
      if (this.dialog_ && this.dialog_.getCurrentView() == view) {
        this.close_();
      }
    }, 100);
  }

  /**
   */
  completeAll() {
    if (this.dialog_) {
      this.close_();
    }
    if (this.popupGraypane_.isAttached()) {
      this.popupGraypane_.destroy();
    }
  }

  /** @private */
  close_() {
    this.dialog_.close();
    this.dialog_ = null;
    this.openPromise_ = null;
  }

  /**
   * @param {?Window|undefined} targetWin
   */
  popupOpened(targetWin) {
    this.popupWin_ = targetWin || null;
    if (!this.popupGraypane_.isAttached()) {
      this.popupGraypane_.attach();
    }
    this.popupGraypane_.show();
  }

  /**
   */
  popupClosed() {
    this.popupWin_ = null;
    try {
      this.popupGraypane_.hide();
    } catch (e) {
      // Ignore.
    }
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * @param {!Document} doc
 * @return {string}
 */
function getReadyState(doc) {
  return /** @type {string} */ (doc['readyState']);
}


/**
 * Whether the document is ready.
 * @param {!Document} doc
 * @return {boolean}
 */
function isDocumentReady(doc) {
  const readyState = getReadyState(doc);
  return readyState != 'loading' && readyState != 'uninitialized';
}

/**
 * Calls the callback when document is ready.
 * @param {!Document} doc
 * @param {function(!Document)} callback
 */
function onDocumentReady(doc, callback) {
  onDocumentState(doc, isDocumentReady, callback);
}

/**
 * Calls the callback when document's state satisfies the stateFn.
 * @param {!Document} doc
 * @param {function(!Document):boolean} stateFn
 * @param {function(!Document)} callback
 */
function onDocumentState(doc, stateFn, callback) {
  let ready = stateFn(doc);
  if (ready) {
    callback(doc);
  } else {
    const readyListener = () => {
      if (stateFn(doc)) {
        if (!ready) {
          ready = true;
          callback(doc);
        }
        doc.removeEventListener('readystatechange', readyListener);
      }
    };
    doc.addEventListener('readystatechange', readyListener);
  }
}

/**
 * Returns a promise that is resolved when document is ready.
 * @param {!Document} doc
 * @return {!Promise<!Document>}
 */
function whenDocumentReady(doc) {
  return new Promise(resolve => {
    onDocumentReady(doc, resolve);
  });
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


/** @implements {Doc} */
class GlobalDoc {

  /**
   * @param {!Window|!Document} winOrDoc
   */
  constructor(winOrDoc) {
    const isWin = !!winOrDoc.document;
    /** @private @const {!Window} */
    this.win_ = isWin ?
        /** @type {!Window} */ (winOrDoc) :
        /** @type {!Window} */ (
            (/** @type {!Document} */ (winOrDoc)).defaultView);
    /** @private @const {!Document} */
    this.doc_ = isWin ?
        /** @type {!Window} */ (winOrDoc).document :
        /** @type {!Document} */ (winOrDoc);
  }

  /** @override */
  getWin() {
    return this.win_;
  }

  /** @override */
  getRootNode() {
    return this.doc_;
  }

  /** @override */
  getRootElement() {
    return this.doc_.documentElement;
  }

  /** @override */
  getHead() {
    // `document.head` always has a chance to be parsed, at least partially.
    return /** @type {!Element} */ (this.doc_.head);
  }

  /** @override */
  getBody() {
    return this.doc_.body;
  }

  /** @override */
  isReady() {
    return isDocumentReady(this.doc_);
  }

  /** @override */
  whenReady() {
    return whenDocumentReady(this.doc_);
  }
}


/**
 * @param {!Document|!Window|!Doc} input
 * @return {!Doc}
 */
function resolveDoc(input) {
  // Is it a `Document`
  if ((/** @type {!Document} */ (input)).nodeType === /* DOCUMENT */ 9) {
    return new GlobalDoc(/** @type {!Document} */ (input));
  }
  // Is it a `Window`?
  if ((/** @type {!Window} */ (input)).document) {
    return new GlobalDoc(/** @type {!Window} */ (input));
  }
  return /** @type {!Doc} */ (input);
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

/** @const {!Object<string, string|number>} */
const toastImportantStyles = {
  'height': 0,
};

/** @const {!Object<string, string>} */
const iframeAttributes$1 = {
  'frameborder': '0',
  'scrolling': 'no',
  'class': 'swg-toast',
};

/**
 * The class Notification toast.
 */
class Toast {

  /**
   * @param {!../runtime/deps.DepsDef} deps
   * @param {string} src
   * @param {!Object<string, ?>} args
   */
  constructor(deps, src, args) {

    /** @private @const {!../model/doc.Doc} */
    this.doc_ = deps.doc();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {string} */
    this.src_ = src;

    /** @private @const {!Object<string, ?>} */
    this.args_ = args;

    /** @private {?Promise} */
    this.animating_ = null;

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ =
        /** @type {!HTMLIFrameElement} */ (
            createElement(
                this.doc_.getWin().document,
                'iframe',
                iframeAttributes$1));

    setImportantStyles(this.iframe_, toastImportantStyles);

    /** @private @const {!Promise} */
    this.ready_ = new Promise(resolve => {
      this.iframe_.onload = resolve;
    });
  }

  /**
   * Returns the iframe element.
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_;
  }

  /**
   * Opens the notification toast.
   * @return {!Promise}
   */
  open() {
    this.doc_.getBody().appendChild(this.iframe_);  // Fires onload.
    return this.buildToast_();
  }

  /**
   * Builds the content of the iframe. On load, animates the toast.
   */
  buildToast_() {
    const toastDurationSeconds = 7;
    return this.activityPorts_.openIframe(
        this.iframe_, this.src_, this.args_).then(port => {
          return port.whenReady();
        }).then(() => {
          resetStyles(this.iframe_, ['height']);

          this.animate_(() => {
            setImportantStyles(this.iframe_, {
              'transform': 'translateY(100%)',
              'opactiy': 1,
              'visibility': 'visible',
            });
            return transition(this.iframe_, {
              'transform': 'translateY(0)',
              'opacity': 1,
              'visibility': 'visible',
            }, 400, 'ease-out');
          });

          // Close the Toast after the specified duration.
          this.doc_.getWin().setTimeout(() => {
            this.close();
          }, (toastDurationSeconds + 1) * 1000);
        });
  }

  /**
   * @param {function():!Promise} callback
   * @return {!Promise}
   * @private
   */
  animate_(callback) {
    const wait = this.animating_ || Promise.resolve();
    return this.animating_ = wait.then(() => {
      return callback();
    }, () => {
      // Ignore errors to make sure animations don't get stuck.
    }).then(() => {
      this.animating_ = null;
    });
  }

  /**
   * Closes the toast.
   * @return {!Promise}
   */
  close() {
    return this.animate_(() => {
      // Remove the toast from the DOM after animation is complete.
      this.doc_.getWin().setTimeout(() => {
        this.doc_.getBody().removeChild(this.iframe_);
        return Promise.resolve();
      }, 500);

      return transition(this.iframe_, {
        'transform': 'translateY(100%)',
        'opacity': 1,
        'visibility': 'visible',
      }, 400, 'ease-out');
    });
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

const SERVICE_ID = 'subscribe.google.com';
const TOAST_STORAGE_KEY = 'toast';
const ENTS_STORAGE_KEY = 'ents';


/**
 */
class EntitlementsManager {

  /**
   * @param {!Window} win
   * @param {!../model/page-config.PageConfig} config
   * @param {!./fetcher.Fetcher} fetcher
   * @param {!./deps.DepsDef} deps
   */
  constructor(win, config, fetcher, deps) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../model/page-config.PageConfig} */
    this.config_ = config;

    /** @private @const {string} */
    this.publicationId_ = this.config_.getPublicationId();

    /** @private @const {!./fetcher.Fetcher} */
    this.fetcher_ = fetcher;

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper();

    /** @private {?Promise<!Entitlements>} */
    this.responsePromise_ = null;

    /** @private {number} */
    this.positiveRetries_ = 0;

    /** @private {boolean} */
    this.blockNextNotification_ = false;

    /** @private @const {!./storage.Storage} */
    this.storage_ = deps.storage();
  }

  /**
   * @param {boolean=} opt_expectPositive
   */
  reset(opt_expectPositive) {
    this.responsePromise_ = null;
    this.positiveRetries_ = Math.max(
        this.positiveRetries_, opt_expectPositive ? 3 : 0);
    if (opt_expectPositive) {
      this.storage_.remove(ENTS_STORAGE_KEY);
    }
  }

  /**
   * @return {!Promise<!Entitlements>}
   */
  getEntitlements() {
    if (!this.responsePromise_) {
      this.responsePromise_ = this.getEntitlementsFlow_();
    }
    return this.responsePromise_;
  }

  /**
   * @param {string} raw
   * @return {boolean}
   */
  pushNextEntitlements(raw) {
    const entitlements = this.getValidJwtEntitlements_(
        raw, /* requireNonExpired */ true);
    if (entitlements && entitlements.enablesThis()) {
      this.storage_.set(ENTS_STORAGE_KEY, raw);
      return true;
    }
    return false;
  }

  /**
   * @return {!Promise<!Entitlements>}
   * @private
   */
  getEntitlementsFlow_() {
    return this.fetchEntitlementsWithCaching_().then(entitlements => {
      this.onEntitlementsFetched_(entitlements);
      return entitlements;
    });
  }

  /**
   * @return {!Promise<!Entitlements>}
   * @private
   */
  fetchEntitlementsWithCaching_() {
    return this.storage_.get(ENTS_STORAGE_KEY).then(raw => {
      // Try cache first.
      if (raw) {
        const cached = this.getValidJwtEntitlements_(
            raw, /* requireNonExpired */ true);
        if (cached && cached.enablesThis()) {
          // Already have a positive response.
          this.positiveRetries_ = 0;
          return cached;
        }
      }
      // If cache didn't match, perform fetch.
      return this.fetchEntitlements_().then(ents => {
        // If entitlements match the product, store them in cache.
        if (ents && ents.enablesThis() && ents.raw) {
          this.storage_.set(ENTS_STORAGE_KEY, ents.raw);
        }
        return ents;
      });
    });
  }

  /**
   * @return {!Promise<!Entitlements>}
   * @private
   */
  fetchEntitlements_() {
    // TODO(dvoytenko): Replace retries with consistent fetch.
    let positiveRetries = this.positiveRetries_;
    this.positiveRetries_ = 0;
    const attempt = () => {
      positiveRetries--;
      return this.fetch_().then(entitlements => {
        if (entitlements.enablesThis() || positiveRetries <= 0) {
          return entitlements;
        }
        return new Promise(resolve => {
          this.win_.setTimeout(() => {
            resolve(attempt());
          }, 550);
        });
      });
    };
    return attempt();
  }

  /**
   * @param {boolean} value
   */
  setToastShown(value) {
    this.storage_.set(TOAST_STORAGE_KEY, value ? '1' : '0');
  }

  /**
   */
  blockNextNotification() {
    this.blockNextNotification_ = true;
  }

  /**
   */
  unblockNextNotification() {
    this.blockNextNotification_ = false;
  }

  /**
   * The JSON must either contain a "signedEntitlements" with JWT, or
   * "entitlements" field with plain JSON object.
   * @param {!Object} json
   * @return {!Entitlements}
   */
  parseEntitlements(json) {
    const signedData = json['signedEntitlements'];
    if (signedData) {
      const entitlements = this.getValidJwtEntitlements_(
          signedData, /* requireNonExpired */ false);
      if (entitlements) {
        return entitlements;
      }
    } else {
      const plainEntitlements = json['entitlements'];
      if (plainEntitlements) {
        return this.createEntitlements_('', plainEntitlements);
      }
    }
    // Empty response.
    return this.createEntitlements_('', []);
  }

  /**
   * @param {string} raw
   * @param {boolean} requireNonExpired
   * @return {?Entitlements}
   * @private
   */
  getValidJwtEntitlements_(raw, requireNonExpired) {
    try {
      const jwt = this.jwtHelper_.decode(raw);
      if (requireNonExpired) {
        const now = Date.now();
        const exp = jwt['exp'];
        if (parseFloat(exp) * 1000 < now) {
          return null;
        }
      }
      const entitlementsClaim = jwt['entitlements'];
      return entitlementsClaim &&
          this.createEntitlements_(raw, entitlementsClaim) || null;
    } catch (e) {
      // Ignore the error.
      this.win_.setTimeout(() => {throw e;});
    }
    return null;
  }

  /**
   * @param {string} raw
   * @param {!Object|!Array<!Object>} json
   * @return {!Entitlements}
   * @private
   */
  createEntitlements_(raw, json) {
    return new Entitlements(
        SERVICE_ID,
        raw,
        Entitlement.parseListFromJson(json),
        this.config_.getProductId(),
        this.ack_.bind(this));
  }

  /**
   * @param {!Entitlements} entitlements
   * @private
   */
  onEntitlementsFetched_(entitlements) {
    // Skip any notifications and toast if other flows are ongoing.
    // TODO(dvoytenko): what's the right action when pay flow was canceled?
    const blockNotification = this.blockNextNotification_;
    this.blockNextNotification_ = false;
    if (blockNotification) {
      return;
    }

    // Notify on the received entitlements.
    this.deps_.callbacks().triggerEntitlementsResponse(
        Promise.resolve(entitlements));

    // Show a toast if needed.
    this.maybeShowToast_(entitlements);
  }

  /**
   * @param {!Entitlements} entitlements
   * @return {!Promise}
   * @private
   */
  maybeShowToast_(entitlements) {
    const entitlement = entitlements.getEntitlementForThis();
    if (!entitlement) {
      return Promise.resolve();
    }
    // Check if storage bit is set. It's only set by the `Entitlements.ack`
    // method.
    return this.storage_.get(TOAST_STORAGE_KEY).then(value => {
      if (value == '1') {
        // Already shown;
        return;
      }
      if (entitlement) {
        this.showToast_(entitlement);
      }
    });
  }

  /**
   * @param {!Entitlement} entitlement
   * @private
   */
  showToast_(entitlement) {
    const source = entitlement.source || 'google';
    return new Toast(this.deps_, feUrl('/toastiframe'), feArgs({
      'publicationId': this.publicationId_,
      'source': source,
    })).open();
  }

  /**
   * @param {!Entitlements} entitlements
   * @private
   */
  ack_(entitlements) {
    if (entitlements.getEntitlementForThis()) {
      this.setToastShown(true);
    }
  }

  /**
   * @return {!Promise<!Entitlements>}
   * @private
   */
  fetch_() {
    const url = serviceUrl(
        '/publication/' +
        encodeURIComponent(this.publicationId_) +
        '/entitlements');
    return this.fetcher_.fetchCredentialedJson(url)
        .then(json => this.parseEntitlements(json));
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * @interface
 */
class Fetcher {

  /**
   * @param {string} unusedUrl
   * @return {!Promise<!Object>}
   */
  fetchCredentialedJson(unusedUrl) {}
}


/**
 * @implements {Fetcher}
 */
class XhrFetcher {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Xhr} */
    this.xhr_ = new Xhr(win);
  }

  /** @override */
  fetchCredentialedJson(url) {
    const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
      method: 'GET',
      headers: {'Accept': 'text/plain, application/json'},
      credentials: 'include',
    });
    return this.xhr_.fetch(url, init).then(response => response.json());
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * @param {!web-activities/activity-ports.ActivityPort} port
 * @param {string} requireOrigin
 * @param {boolean} requireOriginVerified
 * @param {boolean} requireSecureChannel
 * @return {!Promise<!Object>}
 */
function acceptPortResultData(
    port,
    requireOrigin,
    requireOriginVerified,
    requireSecureChannel) {
  return port.acceptResult().then(result => {
    if (result.origin != requireOrigin ||
        requireOriginVerified && !result.originVerified ||
        requireSecureChannel && !result.secureChannel) {
      throw new Error('channel mismatch');
    }
    return result.data;
  });
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

const LINK_REQUEST_ID = 'swg-link';


/**
 * The flow to initiate linkback flow.
 */
class LinkbackFlow {

  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = deps.pageConfig();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();
  }

  /**
   * Starts the Link account flow.
   * @return {!Promise}
   */
  start() {
    this.deps_.callbacks().triggerFlowStarted(SubscriptionFlows.LINK_ACCOUNT);
    const forceRedirect =
        this.deps_.config().windowOpenMode == WindowOpenMode.REDIRECT;
    const opener = this.activityPorts_.open(
        LINK_REQUEST_ID,
        feUrl('/linkbackstart'),
        forceRedirect ? '_top' : '_blank',
        feArgs({
          'publicationId': this.pageConfig_.getPublicationId(),
        }), {});
    this.dialogManager_.popupOpened(opener && opener.targetWin);
    return Promise.resolve();
  }
}


/**
 * The class for Link accounts flow.
 */
class LinkCompleteFlow {

  /**
   * @param {!./deps.DepsDef} deps
   */
  static configurePending(deps) {
    /**
     * Handler function.
     * @param {!web-activities/activity-ports.ActivityPort} port
     */
    function handler(port) {
      deps.entitlementsManager().blockNextNotification();
      deps.callbacks().triggerLinkProgress();
      deps.dialogManager().popupClosed();
      const promise = acceptPortResultData(
          port,
          feOrigin(),
          /* requireOriginVerified */ false,
          /* requireSecureChannel */ false);
      return promise.then(response => {
        const flow = new LinkCompleteFlow(deps, response);
        flow.start();
      }, reason => {
        if (isCancelError(reason)) {
          deps.callbacks().triggerFlowCanceled(SubscriptionFlows.LINK_ACCOUNT);
        }
      });
    }    deps.activities().onResult(LINK_REQUEST_ID, handler);
  }

  /**
   * @param {!./deps.DepsDef} deps
   * @param {?Object} response
   */
  constructor(deps, response) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!./entitlements-manager.EntitlementsManager} */
    this.entitlementsManager_ = deps.entitlementsManager();

    /** @private @const {!./callbacks.Callbacks} */
    this.callbacks_ = deps.callbacks();

    const index = response && response['index'] || '0';
    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ =
        new ActivityIframeView(
            this.win_,
            this.activityPorts_,
            feUrl('/linkconfirmiframe', '/u/' + index),
            feArgs({
              'productId': deps.pageConfig().getProductId(),
              'publicationId': deps.pageConfig().getPublicationId(),
            }),
            /* shouldFadeBody */ true);

    /** @private {?function()} */
    this.completeResolver_ = null;

    /** @private @const {!Promise} */
    this.completePromise_ = new Promise(resolve => {
      this.completeResolver_ = resolve;
    });
  }

  /**
   * Starts the Link account flow.
   * @return {!Promise}
   */
  start() {
    const promise = this.activityIframeView_.port().then(port => {
      return acceptPortResultData(
          port,
          feOrigin(),
          /* requireOriginVerified */ true,
          /* requireSecureChannel */ true);
    });
    promise.then(response => {
      this.complete_(response);
    }).catch(reason => {
      // Rethrow async.
      setTimeout(() => {
        throw reason;
      });
    }).then(() => {
      // The flow is complete.
      this.dialogManager_.completeView(this.activityIframeView_);
    });
    return this.dialogManager_.openView(this.activityIframeView_);
  }

  /**
   * @param {?Object} response
   * @private
   */
  complete_(response) {
    this.callbacks_.triggerLinkComplete();
    this.callbacks_.resetLinkProgress();
    this.entitlementsManager_.setToastShown(true);
    this.entitlementsManager_.unblockNextNotification();
    this.entitlementsManager_.reset(response && response['success'] || false);
    if (response && response['entitlements']) {
      this.entitlementsManager_.pushNextEntitlements(response['entitlements']);
    }
    this.completeResolver_();
  }

  /** @return {!Promise} */
  whenComplete() {
    return this.completePromise_;
  }
}

/**
 * The flow to save subscription information.
 */
class LinkSaveFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.SaveSubscriptionRequestCallback} callback
   */
  constructor(deps, callback) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {!../api/subscriptions.SaveSubscriptionRequestCallback} */
    this.callback_ = callback;

    /** @private {?Promise<!../api/subscriptions.SaveSubscriptionRequest>} */
    this.requestPromise_ = null;

    /** @private {?ActivityIframeView} */
    this.activityIframeView_ = null;
  }

  /**
   * @return {?Promise<!../api/subscriptions.SaveSubscriptionRequest>}
   * @package Visible for testing.
   */
  getRequestPromise() {
    return this.requestPromise_;
  }
  /**
   * Starts the save subscription
   * @return {!Promise}
   */
  start() {
    const iframeArgs = {
      'publicationId': this.deps_.pageConfig().getPublicationId(),
      'isClosable': true,
    };

    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/linksaveiframe'),
        feArgs(iframeArgs),
        /* shouldFadeBody */ false
    );
    this.activityIframeView_.onMessage(data => {
      if (data['getLinkingInfo']) {
        this.requestPromise_ = new Promise(resolve => {
          resolve(this.callback_());
        }).then(request => {
          let saveRequest;
          if (request && request.token) {
            if (request.authCode) {
              throw new Error('Both authCode and token are available');
            } else {
              saveRequest = {'token': request.token};
            }
          } else if (request && request.authCode) {
            saveRequest = {'authCode': request.authCode};
          } else {
            throw new Error('Neither token or authCode is available');
          }
          this.activityIframeView_.message(saveRequest);
        }).catch(reason => {
          // The flow is complete.
          this.dialogManager_.completeView(this.activityIframeView_);
          throw reason;
        });
      }
    });
    /** {!Promise<boolean>} */
    return this.dialogManager_.openView(this.activityIframeView_,
        /* hidden */ true).then(() => {
          return this.activityIframeView_.port().then(port => {
            return acceptPortResultData(
                port,
                feOrigin(),
                /* requireOriginVerified */ true,
                /* requireSecureChannel */ true);
          }).then(result => {
            return result['linked'];
          }).catch(() => {
            return false;
          }).then(result => {
            // The flow is complete.
            this.dialogManager_.completeView(this.activityIframeView_);
            return result;
          });
        });
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


class LoginPromptApi {
  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?Promise} */
    this.openViewPromise_ = null;

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/loginiframe'),
        feArgs({
          publicationId: deps.pageConfig().getPublicationId(),
          productId: deps.pageConfig().getProductId(),
          // First ask the user if they want us to log them in.
          userConsent: true,
          // TODO(chenshay): Pass entitlements value here.
        }),
        /* shouldFadeBody */ true
    );
  }

  /**
   * Prompts the user to login.
   * @return {!Promise}
   */
  start() {
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_LOGIN_PROMPT);

    this.openViewPromise_ = this.dialogManager_.openView(
        this.activityIframeView_);

    return this.activityIframeView_.acceptResult().then(() => {
      // The consent part is complete.
      this.dialogManager_.completeView(this.activityIframeView_);
    }, reason => {
      if (isCancelError(reason)) {
        this.deps_.callbacks().triggerFlowCanceled(
            SubscriptionFlows.SHOW_LOGIN_PROMPT);
      } else {
        this.dialogManager_.completeView(this.activityIframeView_);
      }
      throw reason;
    });
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


class LoginNotificationApi {
  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?Promise} */
    this.openViewPromise_ = null;

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/loginiframe'),
        feArgs({
          publicationId: deps.pageConfig().getPublicationId(),
          productId: deps.pageConfig().getProductId(),
          // No need to ask the user. Just tell them you're logging them in.
          userConsent: false,
          // TODO(chenshay): Pass entitlements value here.
        }),
        /* shouldFadeBody */ true
    );
  }

  /**
   * Continues the Login flow (after waiting).
   * @return {!Promise}
   */
  start() {
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_LOGIN_NOTIFICATION);

    this.openViewPromise_ = this.dialogManager_.openView(
        this.activityIframeView_);

    return this.activityIframeView_.acceptResult().then(() => {
      // The consent part is complete.
      this.dialogManager_.completeView(this.activityIframeView_);
    }, reason => {
      this.dialogManager_.completeView(this.activityIframeView_);
      throw reason;
    });
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


class WaitForSubscriptionLookupApi {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {?Promise} accountPromise
   */
  constructor(deps, accountPromise) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?Promise} */
    this.openViewPromise_ = null;

    /** @private {?Promise} */
    this.accountPromise_ = accountPromise || null;

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/waitforsubscriptionlookupiframe'),
        feArgs({
          publicationId: deps.pageConfig().getPublicationId(),
          productId: deps.pageConfig().getProductId(),
        }),
        /* shouldFadeBody */ true,
        /* hasLoadingIndicator */ true
    );
  }

  /**
   * Starts the Login Flow.
   * @return {!Promise}
   */
  start() {
    this.openViewPromise_ = this.dialogManager_.openView(
        this.activityIframeView_);

    return this.accountPromise_.then(account => {
      // Account was found.
      this.dialogManager_.completeView(this.activityIframeView_);
      return account;
    }, reason => {
      this.dialogManager_.completeView(this.activityIframeView_);
      throw reason;
    });
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


class OffersApi {

  /**
   * @param {!../model/page-config.PageConfig} config
   * @param {!./fetcher.Fetcher} fetcher
   */
  constructor(config, fetcher) {
    /** @private @const {!../model/page-config.PageConfig} */
    this.config_ = config;

    /** @private @const {!./fetcher.Fetcher} */
    this.fetcher_ = fetcher;
  }

  /**
   * @param {string=} opt_productId
   * @return {!Promise<!Array<!../api/offer.Offer>>}
   */
  getOffers(opt_productId) {
    const productId = opt_productId || this.config_.getProductId();
    if (!productId) {
      throw new Error('getOffers requires productId in config or arguments');
    }
    return this.fetch_(productId);
  }

  /**
   * @param {string} productId
   * @return {!Promise<!Array<!../api/offer.Offer>>}
   * @private
   */
  fetch_(productId) {
    const url = serviceUrl(
        '/publication/' +
        encodeURIComponent(this.config_.getPublicationId()) +
        '/offers' +
        '?label=' + encodeURIComponent(productId));
    // TODO(dvoytenko): switch to a non-credentialed request after launch.
    return this.fetcher_.fetchCredentialedJson(url).then(json => {
      return json['offers'] || [];
    });
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Offers view is closable when request was originated from 'AbbrvOfferFlow'
 * or from 'SubscribeOptionFlow'.
 */
const OFFERS_VIEW_CLOSABLE = true;

/**
 * The class for Offers flow.
 */
class OffersFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest|undefined} options
   */
  constructor(deps, options) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    let isClosable = options && options.isClosable;
    if (isClosable == undefined) {
      isClosable = false;  // Default is to hide Close button.
    }

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/offersiframe'),
        feArgs({
          'productId': deps.pageConfig().getProductId(),
          'publicationId': deps.pageConfig().getPublicationId(),
          'showNative': deps.callbacks().hasSubscribeRequestCallback(),
          'list': options && options.list || 'default',
          'skus': options && options.skus || null,
          'isClosable': isClosable,
        }),
        /* shouldFadeBody */ true);
  }

  /**
   * Starts the offers flow or alreadySubscribed flow.
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_OFFERS);
    this.activityIframeView_.onCancel(() => {
      this.deps_.callbacks().triggerFlowCanceled(
          SubscriptionFlows.SHOW_OFFERS);
    });

    // If result is due to OfferSelection, redirect to payments.
    this.activityIframeView_.onMessage(result => {
      if (result['alreadySubscribed']) {
        this.deps_.callbacks().triggerLoginRequest({
          linkRequested: !!result['linkRequested'],
        });
        return;
      }
      if (result['sku']) {
        new PayStartFlow(
            this.deps_,
            /** @type {string} */ (result['sku']))
            .start();
        return;
      }
      if (result['native']) {
        this.deps_.callbacks().triggerSubscribeRequest();
        return;
      }
    });

    return this.dialogManager_.openView(this.activityIframeView_);
  }
}


/**
 * The class for subscribe option flow.
 */
class SubscribeOptionFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest|undefined} options
   */
  constructor(deps, options) {

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../api/subscriptions.OffersRequest|undefined} */
    this.options_ = options;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        deps.win(),
        this.activityPorts_,
        feUrl('/optionsiframe'),
        feArgs({
          'publicationId': deps.pageConfig().getPublicationId(),
          'productId': deps.pageConfig().getProductId(),
          'list': options && options.list || 'default',
          'skus': options && options.skus || null,
          'isClosable': true,
        }),
        /* shouldFadeBody */ false);
  }

  /**
   * Starts the offers flow or alreadySubscribed flow.
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_SUBSCRIBE_OPTION);
    this.activityIframeView_.onCancel(() => {
      this.deps_.callbacks().triggerFlowCanceled(
          SubscriptionFlows.SHOW_SUBSCRIBE_OPTION);
    });

    this.activityIframeView_.onMessage(data => {
      this.maybeOpenOffersFlow_(data);
    });
    this.activityIframeView_.acceptResult().then(result => {
      this.maybeOpenOffersFlow_(result.data);
    }, reason => {
      this.dialogManager_.completeView(this.activityIframeView_);
      throw reason;
    });
    return this.dialogManager_.openView(this.activityIframeView_);
  }

  /**
   * @param {*} data
   * @private
   */
  maybeOpenOffersFlow_(data) {
    if (data && data['subscribe']) {
      const options = this.options_ || {};
      if (options.isClosable == undefined) {
        options.isClosable = OFFERS_VIEW_CLOSABLE;
      }
      new OffersFlow(this.deps_, options).start();
    }
  }
}


/**
 * The class for Abbreviated Offer flow.
 *
 */
class AbbrvOfferFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest=} options
   */
  constructor(deps, options = {}) {

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../api/subscriptions.OffersRequest|undefined} */
    this.options_ = options;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/abbrvofferiframe'),
        feArgs({
          'publicationId': deps.pageConfig().getPublicationId(),
          'productId': deps.pageConfig().getProductId(),
          'showNative': deps.callbacks().hasSubscribeRequestCallback(),
          'list': options && options.list || 'default',
          'skus': options && options.skus || null,
          'isClosable': true,
        }),
        /* shouldFadeBody */ false);
  }

  /**
   * Starts the offers flow
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_ABBRV_OFFER);
    this.activityIframeView_.onCancel(() => {
      this.deps_.callbacks().triggerFlowCanceled(
          SubscriptionFlows.SHOW_ABBRV_OFFER);
    });

    // If the user is already subscribed, trigger login flow
    this.activityIframeView_.onMessage(data => {
      if (data['alreadySubscribed']) {
        this.deps_.callbacks().triggerLoginRequest({
          linkRequested: !!data['linkRequested'],
        });
        return;
      }
    });
    // If result is due to requesting offers, redirect to offers flow
    this.activityIframeView_.acceptResult().then(result => {
      if (result.data['viewOffers']) {
        const options = this.options_ || {};
        if (options.isClosable == undefined) {
          options.isClosable = OFFERS_VIEW_CLOSABLE;
        }
        new OffersFlow(this.deps_, options).start();
        return;
      }
      if (result.data['native']) {
        this.deps_.callbacks().triggerSubscribeRequest();
        // The flow is complete.
        this.dialogManager_.completeView(this.activityIframeView_);
        return;
      }
    });

    return this.dialogManager_.openView(this.activityIframeView_);
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


class Preconnect {

  /**
   * @param {!Document} doc
   */
  constructor(doc) {
    /** @private @const {!Document} */
    this.doc_ = doc;
  }

  /**
   * @param {string} url
   */
  preconnect(url) {
    this.pre_(url, 'preconnect');
  }

  /**
   * @param {string} url
   */
  dnsPrefetch(url) {
    this.pre_(url, 'dns-prefetch');
  }

  /**
   * @param {string} url
   */
  prefetch(url) {
    this.pre_(url, 'preconnect prefetch');
  }

  /**
   * @param {string} url
   * @param {string} as
   */
  preload(url, as) {
    this.pre_(url, 'preconnect preload', as);
  }

  /**
   * @param {string} url
   * @param {string} rel
   * @param {?string=} opt_as
   * @private
   */
  pre_(url, rel, opt_as) {
    // <link rel="prefetch" href="..." as="">
    const linkEl = createElement(this.doc_, 'link', {
      'rel': rel,
      'href': url,
    });
    if (opt_as) {
      linkEl.setAttribute('as', opt_as);
    }
    this.doc_.head.appendChild(linkEl);
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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

const PREFIX = 'subscribe.google.com';


class Storage {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Object<string, !Promise<?string>>} */
    this.values_ = {};
  }

  /**
   * @param {string} key
   * @return {!Promise<?string>}
   */
  get(key) {
    if (!this.values_[key]) {
      this.values_[key] = new Promise(resolve => {
        if (this.win_.sessionStorage) {
          try {
            resolve(this.win_.sessionStorage.getItem(storageKey(key)));
          } catch (e) {
            // Ignore error.
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    }
    return this.values_[key];
  }

  /**
   * @param {string} key
   * @param {string} value
   * @return {!Promise}
   */
  set(key, value) {
    this.values_[key] = Promise.resolve(value);
    return new Promise(resolve => {
      if (this.win_.sessionStorage) {
        try {
          this.win_.sessionStorage.setItem(storageKey(key), value);
        } catch (e) {
          // Ignore error.
        }
      }
      resolve();
    });
  }

  /**
   * @param {string} key
   * @return {!Promise}
   */
  remove(key) {
    delete this.values_[key];
    return new Promise(resolve => {
      if (this.win_.sessionStorage) {
        try {
          this.win_.sessionStorage.removeItem(storageKey(key));
        } catch (e) {
          // Ignore error.
        }
      }
      resolve();
    });
  }
}


/**
 * @param {string} key
 * @return {string}
 */
function storageKey(key) {
  return PREFIX + ':' + key;
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 * @implements {DepsDef}
 * @implements {Subscriptions}
 */
class ConfiguredRuntime {

  /**
   * @param {!Window|!Document|!Doc} winOrDoc
   * @param {!../model/page-config.PageConfig} pageConfig
   * @param {{
   *     fetcher: (!Fetcher|undefined),
   *   }=} opt_integr
   */
  constructor(winOrDoc, pageConfig, opt_integr) {
    /** @private @const {!Doc} */
    this.doc_ = resolveDoc(winOrDoc);

    /** @private @const {!Window} */
    this.win_ = this.doc_.getWin();

    /** @private @const {!../api/subscriptions.Config} */
    this.config_ = defaultConfig();

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = pageConfig;

    /** @private @const {!Promise} */
    this.documentParsed_ = this.doc_.whenReady();

    /** @private @const {!Fetcher} */
    this.fetcher_ = opt_integr && opt_integr.fetcher ||
        new XhrFetcher(this.win_);

    /** @private @const {!Storage} */
    this.storage_ = new Storage(this.win_);

    /** @private @const {!DialogManager} */
    this.dialogManager_ = new DialogManager(this.doc_);

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = new activityPorts_1(this.win_);

    /** @private @const {!Callbacks} */
    this.callbacks_ = new Callbacks();

    /** @private @const {!EntitlementsManager} */
    this.entitlementsManager_ = new EntitlementsManager(
        this.win_, this.pageConfig_, this.fetcher_, this);

    /** @private @const {!OffersApi} */
    this.offersApi_ = new OffersApi(this.pageConfig_, this.fetcher_);

    /** @private @const {!ButtonApi} */
    this.buttonApi_ = new ButtonApi(this.doc_);

    const preconnect = new Preconnect(this.win_.document);

    LinkCompleteFlow.configurePending(this);
    PayCompleteFlow.configurePending(this);
    PayStartFlow.preconnect(preconnect);

    injectStyleSheet(this.win_.document, CSS);
  }

  /** @override */
  doc() {
    return this.doc_;
  }

  /** @override */
  win() {
    return this.win_;
  }

  /** @override */
  pageConfig() {
    return this.pageConfig_;
  }

  /** @override */
  activities() {
    return this.activityPorts_;
  }

  /** @override */
  dialogManager() {
    return this.dialogManager_;
  }

  /** @override */
  entitlementsManager() {
    return this.entitlementsManager_;
  }

  /** @override */
  callbacks() {
    return this.callbacks_;
  }

  /** @override */
  storage() {
    return this.storage_;
  }

  /** @override */
  init() {
    // Implemented by the `Runtime` class.
  }

  /** @override */
  configure(config) {
    // Validate first.
    let error = null;
    for (const k in config) {
      const v = config[k];
      if (k == 'windowOpenMode') {
        if (v != WindowOpenMode.AUTO &&
            v != WindowOpenMode.REDIRECT) {
          error = 'Unknown windowOpenMode: ' + v;
        }
      } else {
        error = 'Unknown config property: ' + k;
      }
    }
    if (error) {
      throw new Error(error);
    }
    // Assign.
    Object.assign(this.config_, config);
  }

  /** @override */
  config() {
    return this.config_;
  }

  /** @override */
  reset() {
    this.entitlementsManager_.reset();
    this.dialogManager_.completeAll();
  }

  /** @override */
  start() {
    // No need to run entitlements without a product or for an unlocked page.
    if (!this.pageConfig_.getProductId() || !this.pageConfig_.isLocked()) {
      return Promise.resolve();
    }
    this.getEntitlements();
  }

  /** @override */
  getEntitlements() {
    return this.entitlementsManager_.getEntitlements()
        .then(entitlements => entitlements.clone());
  }

  /** @override */
  setOnEntitlementsResponse(callback) {
    this.callbacks_.setOnEntitlementsResponse(callback);
  }

  /** @override */
  getOffers(opt_options) {
    return this.offersApi_.getOffers(opt_options && opt_options.productId);
  }

  /** @override */
  showOffers(opt_options) {
    return this.documentParsed_.then(() => {
      const flow = new OffersFlow(this, opt_options);
      return flow.start();
    });
  }

  /** @override */
  showSubscribeOption(opt_options) {
    return this.documentParsed_.then(() => {
      const flow = new SubscribeOptionFlow(this, opt_options);
      return flow.start();
    });
  }

  /** @override */
  showAbbrvOffer(opt_options) {
    return this.documentParsed_.then(() => {
      const flow = new AbbrvOfferFlow(this, opt_options);
      return flow.start();
    });
  }

  /** @override */
  waitForSubscriptionLookup(accountPromise) {
    return this.documentParsed_.then(() => {
      const wait = new WaitForSubscriptionLookupApi(this, accountPromise);
      return wait.start();
    });
  }

  /** @override */
  setOnLoginRequest(callback) {
    this.callbacks_.setOnLoginRequest(callback);
  }

  /** @override */
  setOnLinkComplete(callback) {
    this.callbacks_.setOnLinkComplete(callback);
  }

  /** @override */
  linkAccount() {
    return this.documentParsed_.then(() => {
      return new LinkbackFlow(this).start();
    });
  }

  /** @override */
  saveSubscription(saveSubscriptionRequestCallback) {
    return this.documentParsed_.then(() => {
      return new LinkSaveFlow(this, saveSubscriptionRequestCallback).start();
    });
  }

  /** @override */
  showLoginPrompt() {
    return this.documentParsed_.then(() => {
      return new LoginPromptApi(this).start();
    });
  }

  /** @override */
  showLoginNotification() {
    return this.documentParsed_.then(() => {
      return new LoginNotificationApi(this).start();
    });
  }

  /** @override */
  setOnNativeSubscribeRequest(callback) {
    this.callbacks_.setOnSubscribeRequest(callback);
  }

  /** @override */
  setOnSubscribeResponse(callback) {
    this.callbacks_.setOnSubscribeResponse(callback);
  }

  /** @override */
  subscribe(sku) {
    return this.documentParsed_.then(() => {
      return new PayStartFlow(this, sku).start();
    });
  }

  /** @override */
  completeDeferredAccountCreation(opt_options) {
    return this.documentParsed_.then(() => {
      return new DeferredAccountFlow(this, opt_options || null).start();
    });
  }

  /** @override */
  setOnFlowStarted(callback) {
    this.callbacks_.setOnFlowStarted(callback);
  }

  /** @override */
  setOnFlowCanceled(callback) {
    this.callbacks_.setOnFlowCanceled(callback);
  }

  /** @override */
  createButton(optionsOrCallback, opt_callback) {
    // This is a minor duplication to allow this code to be sync.
    return this.buttonApi_.create(optionsOrCallback, opt_callback);
  }

  /** @override */
  attachButton(button, optionsOrCallback, opt_callback) {
    // This is a minor duplication to allow this code to be sync.
    this.buttonApi_.attach(button, optionsOrCallback, opt_callback);
  }
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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


export {
  ConfiguredRuntime,
  Entitlements,
  Entitlement,
  Fetcher,
  SubscribeResponse,
};
