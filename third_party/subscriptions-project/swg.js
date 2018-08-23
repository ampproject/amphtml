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
/** Version: 0.1.22.24 */
const ActivityMode = {
  IFRAME: 'iframe',
  POPUP: 'popup',
  REDIRECT: 'redirect',
};
const ActivityResultCode = {
  OK: 'ok',
  CANCELED: 'canceled',
  FAILED: 'failed',
};
class ActivityResult {
  constructor(code, data, mode, origin, originVerified, secureChannel) {
    this.code = code;
    this.data = code == ActivityResultCode.OK ? data : null;
    this.mode = mode;
    this.origin = origin;
    this.originVerified = originVerified;
    this.secureChannel = secureChannel;
    this.ok = code == ActivityResultCode.OK;
    this.error = code == ActivityResultCode.FAILED ?
        new Error(String(data) || '') :
        null;
  }
}
let ActivityRequest;
let ActivityOpenOptions;
class ActivityPort {
  getMode() {}
  acceptResult() {}
}
const ABORT_ERR_NAME = 'AbortError';
const ABORT_ERR_CODE = 20;
let aResolver;
function parseUrl(urlString) {
  if (!aResolver) {
    aResolver =                                   (document.createElement('a'));
  }
  aResolver.href = urlString;
  return                                   (aResolver);
}
function getOrigin(loc) {
  if (loc.origin) {
    return loc.origin;
  }
  const protocol = loc.protocol;
  let host = loc.host;
  if (protocol == 'https:' && host.indexOf(':443') == host.length - 4) {
    host = host.replace(':443', '');
  } else if (protocol == 'http:' && host.indexOf(':80') == host.length - 3) {
    host = host.replace(':80', '');
  }
  return protocol + '//' + host;
}
function getOriginFromUrl(urlString) {
  return getOrigin(parseUrl(urlString));
}
function removeFragment(urlString) {
  const index = urlString.indexOf('#');
  if (index == -1) {
    return urlString;
  }
  return urlString.substring(0, index);
}
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
function getQueryParam(queryString, param) {
  return parseQueryString(queryString)[param];
}
function addFragmentParam(url, param, value) {
  return url +
      (url.indexOf('#') == -1 ? '#' : '&') +
      encodeURIComponent(param) + '=' + encodeURIComponent(value);
}
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
function createAbortError(win, opt_message) {
  const message = 'AbortError' + (opt_message ? ': ' + opt_message : '');
  let error = null;
  if (typeof win['DOMException'] == 'function') {
    const constr =                                                           (
        win['DOMException']);
    try {
      error = new constr(message, ABORT_ERR_NAME);
    } catch (e) {
    }
  }
  if (!error) {
    const constr =                                                   (
        Error);
    error = new constr(message);
    error.name = ABORT_ERR_NAME;
    error.code = ABORT_ERR_CODE;
  }
  return error;
}
function resolveResult(win, result, resolver) {
  if (result.ok) {
    resolver(result);
  } else {
    const error = result.error || createAbortError(win);
    error.activityResult = result;
    resolver(Promise.reject(error));
  }
}
function isIeBrowser(win) {
  const nav = win.navigator;
  return /Trident|MSIE|IEMobile/i.test(nav && nav.userAgent);
}
function isEdgeBrowser(win) {
  const nav = win.navigator;
  return /Edge/i.test(nav && nav.userAgent);
}
const SENTINEL = '__ACTIVITIES__';
class Messenger {
  constructor(win, targetOrCallback, targetOrigin) {
    this.win_ = win;
    this.targetOrCallback_ = targetOrCallback;
    this.targetOrigin_ = targetOrigin;
    this.target_ = null;
    this.acceptsChannel_ = false;
    this.port_ = null;
    this.onCommand_ = null;
    this.onCustomMessage_ = null;
    this.channels_ = null;
    this.boundHandleEvent_ = this.handleEvent_.bind(this);
  }
  connect(onCommand) {
    if (this.onCommand_) {
      throw new Error('already connected');
    }
    this.onCommand_ = onCommand;
    this.win_.addEventListener('message', this.boundHandleEvent_);
  }
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
  isConnected() {
    return this.targetOrigin_ != null;
  }
  getTarget() {
    const target = this.getOptionalTarget_();
    if (!target) {
      throw new Error('not connected');
    }
    return target;
  }
  getOptionalTarget_() {
    if (this.onCommand_ && !this.target_) {
      if (typeof this.targetOrCallback_ == 'function') {
        this.target_ = this.targetOrCallback_();
      } else {
        this.target_ =                        (this.targetOrCallback_);
      }
    }
    return this.target_;
  }
  getTargetOrigin() {
    if (this.targetOrigin_ == null) {
      throw new Error('not connected');
    }
    return this.targetOrigin_;
  }
  sendConnectCommand() {
    const acceptsChannel = isIeBrowser(this.win_) || isEdgeBrowser(this.win_);
    this.sendCommand('connect', {'acceptsChannel': acceptsChannel});
  }
  sendStartCommand(args) {
    let channel = null;
    if (this.acceptsChannel_ && typeof this.win_.MessageChannel == 'function') {
      channel = new this.win_.MessageChannel();
    }
    if (channel) {
      this.sendCommand('start', args, [channel.port2]);
      this.switchToChannel_(channel.port1);
    } else {
      this.sendCommand('start', args);
    }
  }
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
      const targetOrigin =
          cmd == 'connect' ?
          (this.targetOrigin_ != null ? this.targetOrigin_ : '*') :
          this.getTargetOrigin();
      target.postMessage(data, targetOrigin, opt_transfer || undefined);
    }
  }
  customMessage(payload) {
    this.sendCommand('msg', payload);
  }
  onCustomMessage(callback) {
    this.onCustomMessage_ = callback;
  }
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
      this.sendCommand('cnset', {'name': name}, [channelObj.port2]);
      channelObj.port2 = null;
    }
    return channelObj.promise;
  }
  askChannel(opt_name) {
    const name = opt_name || '';
    const channelObj = this.getChannelObj_(name);
    if (!channelObj.port1) {
      this.sendCommand('cnget', {'name': name});
    }
    return channelObj.promise;
  }
  receiveChannel_(name, port) {
    const channelObj = this.getChannelObj_(name);
    channelObj.port1 = port;
    channelObj.resolver(port);
  }
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
  }
  handleEvent_(event) {
    const data = event.data;
    if (!data || data['sentinel'] != SENTINEL) {
      return;
    }
    const cmd = data['cmd'];
    if (this.port_ && cmd != 'connect' && cmd != 'start') {
      return;
    }
    const origin =                       (event.origin);
    const payload = data['payload'] || null;
    if (this.targetOrigin_ == null && cmd == 'start') {
      this.targetOrigin_ = origin;
    }
    if (this.targetOrigin_ == null && event.source) {
      if (this.getOptionalTarget_() == event.source) {
        this.targetOrigin_ = origin;
      }
    }
    if (origin != this.targetOrigin_) {
      return;
    }
    this.handleCommand_(cmd, payload, event);
  }
  handleCommand_(cmd, payload, event) {
    if (cmd == 'connect') {
      if (this.port_) {
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
      this.receiveChannel_(name,                             (port));
    } else {
      this.onCommand_(cmd, payload);
    }
  }
}
function closePort(port) {
  try {
    port.close();
  } catch (e) {
  }
}
class ActivityIframePort {
  constructor(iframe, url, opt_args) {
    this.iframe_ = iframe;
    this.url_ = url;
    this.args_ = opt_args || null;
    this.win_ =                        (this.iframe_.ownerDocument.defaultView);
    this.targetOrigin_ = getOriginFromUrl(url);
    this.connected_ = false;
    this.connectedResolver_ = null;
    this.connectedPromise_ = new Promise(resolve => {
      this.connectedResolver_ = resolve;
    });
    this.readyResolver_ = null;
    this.readyPromise_ = new Promise(resolve => {
      this.readyResolver_ = resolve;
    });
    this.resultResolver_ = null;
    this.resultPromise_ = new Promise(resolve => {
      this.resultResolver_ = resolve;
    });
    this.onResizeRequest_ = null;
    this.requestedHeight_ = null;
    this.messenger_ = new Messenger(
        this.win_,
        () => this.iframe_.contentWindow,
        this.targetOrigin_);
  }
  getMode() {
    return ActivityMode.IFRAME;
  }
  connect() {
    if (!this.win_.document.documentElement.contains(this.iframe_)) {
      throw new Error('iframe must be in DOM');
    }
    this.messenger_.connect(this.handleCommand_.bind(this));
    this.iframe_.src = this.url_;
    return this.connectedPromise_;
  }
  disconnect() {
    this.connected_ = false;
    this.messenger_.disconnect();
  }
  acceptResult() {
    return this.resultPromise_;
  }
  message(payload) {
    this.messenger_.customMessage(payload);
  }
  onMessage(callback) {
    this.messenger_.onCustomMessage(callback);
  }
  messageChannel(opt_name) {
    return this.messenger_.askChannel(opt_name);
  }
  whenReady() {
    return this.readyPromise_;
  }
  onResizeRequest(callback) {
    this.onResizeRequest_ = callback;
    Promise.resolve().then(() => {
      if (this.requestedHeight_ != null) {
        callback(this.requestedHeight_);
      }
    });
  }
  resized() {
    if (!this.connected_) {
      return;
    }
    const height = this.iframe_.offsetHeight;
    this.messenger_.sendCommand('resized', {'height': height});
  }
  handleCommand_(cmd, payload) {
    if (cmd == 'connect') {
      this.connected_ = true;
      this.messenger_.sendStartCommand(this.args_);
      this.connectedResolver_();
    } else if (cmd == 'result') {
      if (this.resultResolver_) {
        const code =                                    (payload['code']);
        const data =
            code == ActivityResultCode.FAILED ?
            new Error(payload['data'] || '') :
            payload['data'];
        const result = new ActivityResult(
            code,
            data,
            ActivityMode.IFRAME,
            this.messenger_.getTargetOrigin(),
                                 true,
                                true);
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
      this.requestedHeight_ =                       (payload['height']);
      if (this.onResizeRequest_) {
        this.onResizeRequest_(this.requestedHeight_);
      }
    }
  }
}
class ActivityWindowPort {
  constructor(win, requestId, url, target, opt_args, opt_options) {
    const isValidTarget =
        target &&
        (target == '_blank' || target == '_top' || target[0] != '_');
    if (!isValidTarget) {
      throw new Error('The only allowed targets are "_blank", "_top"' +
          ' and name targets');
    }
    this.win_ = win;
    this.requestId_ = requestId;
    this.url_ = url;
    this.openTarget_ = target;
    this.args_ = opt_args || null;
    this.options_ = opt_options || null;
    this.resultResolver_ = null;
    this.resultPromise_ = new Promise(resolve => {
      this.resultResolver_ = resolve;
    });
    this.targetWin_ = null;
    this.heartbeatInterval_ = null;
    this.messenger_ = null;
  }
  getMode() {
    return this.openTarget_ == '_top' ?
        ActivityMode.REDIRECT :
        ActivityMode.POPUP;
  }
  open() {
    return this.openInternal_();
  }
  getTargetWin() {
    return this.targetWin_;
  }
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
      try {
        this.targetWin_.close();
      } catch (e) {
      }
      this.targetWin_ = null;
    }
    this.resultResolver_ = null;
  }
  acceptResult() {
    return this.resultPromise_;
  }
  openInternal_() {
    const featuresStr = this.buildFeatures_();
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
    let targetWin;
    let openTarget = this.openTarget_;
    if (openTarget != '_top') {
      if (isIeBrowser(this.win_)) {
        openTarget = '_top';
      }
    }
    try {
      targetWin = this.win_.open(url, openTarget, featuresStr);
    } catch (e) {
    }
    if (!targetWin && openTarget != '_top') {
      openTarget = '_top';
      try {
        targetWin = this.win_.open(url, openTarget);
      } catch (e) {
      }
    }
    if (targetWin) {
      this.targetWin_ = targetWin;
      if (openTarget != '_top') {
        this.setupPopup_();
      }
    } else {
      this.disconnectWithError_(new Error('failed to open window'));
    }
    return this.resultPromise_.catch(() => {
    });
  }
  buildFeatures_() {
    const screen = this.win_.screen;
    const availWidth = screen.availWidth || screen.width;
    const availHeight = screen.availHeight || screen.height;
    const isTop = this.isTopWindow_();
    const isEdge = isEdgeBrowser(this.win_);
    const controlsWidth =
        isTop && this.win_.outerWidth > this.win_.innerWidth ?
        Math.min(100, this.win_.outerWidth - this.win_.innerWidth) :
        (isEdge ? 100 : 0);
    const controlsHeight =
        isTop && this.win_.outerHeight > this.win_.innerHeight ?
        Math.min(100, this.win_.outerHeight - this.win_.innerHeight) :
        (isEdge ? 100 : 0);
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
  isTopWindow_() {
    return this.win_ == this.win_.top;
  }
  setupPopup_() {
    this.heartbeatInterval_ = this.win_.setInterval(() => {
      this.check_(                  true);
    }, 500);
    this.messenger_ = new Messenger(
        this.win_,
                               (this.targetWin_),
                           null);
    this.messenger_.connect(this.handleCommand_.bind(this));
  }
  check_(opt_delayCancel) {
    if (!this.targetWin_ || this.targetWin_.closed) {
      if (this.heartbeatInterval_) {
        this.win_.clearInterval(this.heartbeatInterval_);
        this.heartbeatInterval_ = null;
      }
      this.win_.setTimeout(() => {
        try {
          this.result_(ActivityResultCode.CANCELED,            null);
        } catch (e) {
          this.disconnectWithError_(e);
        }
      }, opt_delayCancel ? 3000 : 0);
    }
  }
  disconnectWithError_(reason) {
    if (this.resultResolver_) {
      this.resultResolver_(Promise.reject(reason));
    }
    this.disconnect();
  }
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
                               isConnected,
                              isConnected);
      resolveResult(this.win_, result, this.resultResolver_);
      this.resultResolver_ = null;
    }
    if (this.messenger_) {
      this.messenger_.sendCommand('close');
    }
    this.disconnect();
  }
  handleCommand_(cmd, payload) {
    if (cmd == 'connect') {
      this.messenger_.sendStartCommand(this.args_);
    } else if (cmd == 'result') {
      const code =                                    (payload['code']);
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
function discoverRedirectPort(win, fragment, requestId) {
  const paramName = '__WA_RES__';
  const fragmentParam = getQueryParam(fragment, paramName);
  if (!fragmentParam) {
    return null;
  }
  const response =                        (JSON.parse(
      decodeURIComponent(fragmentParam)));
  if (!response || response['requestId'] != requestId) {
    return null;
  }
  const cleanFragment = removeQueryParam(win.location.hash, paramName) || '';
  if (cleanFragment != win.location.hash) {
    if (win.history && win.history.replaceState) {
      try {
        win.history.replaceState(win.history.state, '', cleanFragment);
      } catch (e) {
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
class ActivityWindowRedirectPort {
  constructor(win, code, data, targetOrigin, targetOriginVerified) {
    this.win_ = win;
    this.code_ = code;
    this.data_ = data;
    this.targetOrigin_ = targetOrigin;
    this.targetOriginVerified_ = targetOriginVerified;
  }
  getMode() {
    return ActivityMode.REDIRECT;
  }
  acceptResult() {
    const result = new ActivityResult(
        this.code_,
        this.data_,
        ActivityMode.REDIRECT,
        this.targetOrigin_,
        this.targetOriginVerified_,
                            false);
    return new Promise(resolve => {
      resolveResult(this.win_, result, resolve);
    });
  }
}
class ActivityPorts {
  constructor(win) {
    this.version = '1.13';
    this.win_ = win;
    this.fragment_ = win.location.hash;
    this.requestHandlers_ = {};
    this.resultBuffer_ = {};
  }
  openIframe(iframe, url, opt_args) {
    const port = new ActivityIframePort(iframe, url, opt_args);
    return port.connect().then(() => port);
  }
  open(requestId, url, target, opt_args, opt_options) {
    const port = new ActivityWindowPort(
        this.win_, requestId, url, target, opt_args, opt_options);
    port.open().then(() => {
      this.consumeResultAll_(requestId, port);
    });
    return {targetWin: port.getTargetWin()};
  }
  onResult(requestId, callback) {
    let handlers = this.requestHandlers_[requestId];
    if (!handlers) {
      handlers = [];
      this.requestHandlers_[requestId] = handlers;
    }
    handlers.push(callback);
    const availableResult = this.discoverResult_(requestId);
    if (availableResult) {
      this.consumeResult_(availableResult, callback);
    }
  }
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
  consumeResult_(port, callback) {
    Promise.resolve().then(() => {
      callback(port);
    });
  }
  consumeResultAll_(requestId, port) {
    const handlers = this.requestHandlers_[requestId];
    if (handlers) {
      handlers.forEach(handler => {
        this.consumeResult_(port, handler);
      });
    }
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
function pushIfNonEmpty(array, val) {
  if (val != '') {
    array.push(val);
  }
}
function toString(val) {
  if (val && val.nodeType == 1) {
    return val.tagName.toLowerCase() + (val.id ? '#' + val.id : '');
  }
  return                       (val);
}

function map(opt_initial) {
  const obj = Object.create(null);
  if (opt_initial) {
    Object.assign(obj, opt_initial);
  }
  return obj;
}

function startsWith(string, prefix) {
  if (prefix.length > string.length) {
    return false;
  }
  return string.lastIndexOf(prefix, 0) == 0;
}

let propertyNameCache;
const vendorPrefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'ms', 'O', 'o'];
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
  'flex': 'none',
  'flex-flow': 'row nowrap',
  'float': 'none',
  'flood-color': 'rgb(0, 0, 0)',
  'flood-opacity': '1',
  'font': 'none',
  'font-size': 'medium',
  'font-family': '',
  'height': 'auto',
  'hyphens': 'manual',
  'image-rendering': 'auto',
  'inline-size': '',
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
  'object-fit': 'fill',
  'offset-distance': 'none',
  'offset-path': 'none',
  'offset-rotate': 'auto 0deg',
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
  'tab-size': '8',
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
function camelCaseToTitleCase(camelCase) {
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}
function getVendorJsPropertyName_(style, titleCase) {
  for (let i = 0; i < vendorPrefixes.length; i++) {
    const propertyName = vendorPrefixes[i] + titleCase;
    if (style[propertyName] !== undefined) {
      return propertyName;
    }
  }
  return '';
}
function getVendorJsPropertyName(style, camelCase, opt_bypassCache) {
  if (startsWith(camelCase, '--')) {
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
function setImportantStyles(element, styles) {
  for (const k in styles) {
    element.style.setProperty(
        getVendorJsPropertyName(styles, k), styles[k].toString(), 'important');
  }
}
function setStyle(element, property, value, opt_units, opt_bypassCache) {
  const propertyName = getVendorJsPropertyName(element.style, property,
      opt_bypassCache);
  if (propertyName) {
    element.style[propertyName] =
                              (opt_units ? value + opt_units : value);
  }
}
function setStyles(element, styles) {
  for (const k in styles) {
    setStyle(element, k, styles[k]);
  }
}
function resetStyles(element, properties) {
  const styleObj = {};
  properties.forEach(prop => {
    styleObj[prop] = null;
  });
  setStyles(element, styleObj);
}
function resetAllStyles(element) {
  setImportantStyles(element, defaultStyles);
}

const styleType = 'text/css';
function addAttributesToElement(element, attributes) {
  for (const attr in attributes) {
    if (attr == 'style') {
      setStyles(element,
           (attributes[attr]));
    } else {
      element.setAttribute(attr,
                                               (attributes[attr]));
    }
  }
  return element;
}
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
function removeChildren(parent) {
  parent.textContent = '';
}
function injectStyleSheet(doc, styleText) {
  const styleElement = createElement(doc, 'style', {
    'type': styleType,
  });
  styleElement.textContent = styleText;
  doc.head.appendChild(styleElement);
  return styleElement;
}

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
  return map['en'];
}

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
class ButtonApi {
  constructor(doc) {
    this.doc_ = doc;
  }
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
    head.appendChild(createElement(this.doc_.getWin().document, 'link', {
      'rel': 'stylesheet',
      'type': 'text/css',
      'href': url,
    }));
  }
  create(optionsOrCallback, opt_callback) {
    const button = createElement(this.doc_.getWin().document, 'button', {});
    return this.attach(button, optionsOrCallback, opt_callback);
  }
  attach(button, optionsOrCallback, opt_callback) {
    const options =
        typeof optionsOrCallback != 'function' ?
        optionsOrCallback : null;
    const callback =                           (
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

const CSS = ".swg-dialog,.swg-toast{box-sizing:border-box;background-color:#fff!important}.swg-toast{position:fixed!important;bottom:0!important;max-height:46px!important;z-index:2147483647!important;border:none!important}@media (max-height:640px), (max-width:640px){.swg-dialog,.swg-toast{width:480px!important;left:-240px!important;margin-left:50vw!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}@media (min-width:640px) and (min-height:640px){.swg-dialog{width:630px!important;left:-315px!important;margin-left:50vw!important;background-color:transparent!important;border:none!important}.swg-toast{left:0!important}}@media (max-width:480px){.swg-dialog,.swg-toast{width:100%!important;left:0!important;right:0!important;margin-left:0!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}\n/*# sourceURL=/./src/components/dialog.css*/";

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
class Callbacks {
  constructor() {
    this.callbacks_ = {};
    this.resultBuffer_ = {};
  }
  setOnEntitlementsResponse(callback) {
    this.setCallback_(CallbackId.ENTITLEMENTS, callback);
  }
  triggerEntitlementsResponse(promise) {
    return this.trigger_(
        CallbackId.ENTITLEMENTS,
        promise.then(res => res.clone()));
  }
  hasEntitlementsResponsePending() {
    return !!this.resultBuffer_[CallbackId.ENTITLEMENTS];
  }
  setOnLoginRequest(callback) {
    this.setCallback_(CallbackId.LOGIN_REQUEST, callback);
  }
  triggerLoginRequest(request) {
    return this.trigger_(CallbackId.LOGIN_REQUEST, request);
  }
  setOnLinkProgress(callback) {
    this.setCallback_(CallbackId.LINK_PROGRESS, callback);
  }
  triggerLinkProgress() {
    return this.trigger_(CallbackId.LINK_PROGRESS, true);
  }
  resetLinkProgress() {
    this.resetCallback_(CallbackId.LINK_PROGRESS);
  }
  setOnLinkComplete(callback) {
    this.setCallback_(CallbackId.LINK_COMPLETE, callback);
  }
  triggerLinkComplete() {
    return this.trigger_(CallbackId.LINK_COMPLETE, true);
  }
  hasLinkCompletePending() {
    return !!this.resultBuffer_[CallbackId.LINK_COMPLETE];
  }
  setOnSubscribeRequest(callback) {
    this.setCallback_(CallbackId.SUBSCRIBE_REQUEST, callback);
  }
  triggerSubscribeRequest() {
    return this.trigger_(CallbackId.SUBSCRIBE_REQUEST, true);
  }
  hasSubscribeRequestCallback() {
    return !!this.callbacks_[CallbackId.SUBSCRIBE_REQUEST];
  }
  setOnSubscribeResponse(callback) {
    this.setCallback_(CallbackId.SUBSCRIBE_RESPONSE, callback);
  }
  triggerSubscribeResponse(responsePromise) {
    return this.trigger_(
        CallbackId.SUBSCRIBE_RESPONSE,
        responsePromise.then(res => res.clone()));
  }
  hasSubscribeResponsePending() {
    return !!this.resultBuffer_[CallbackId.SUBSCRIBE_RESPONSE];
  }
  setOnFlowStarted(callback) {
    this.setCallback_(CallbackId.FLOW_STARTED, callback);
  }
  triggerFlowStarted(flow, opt_data) {
    return this.trigger_(CallbackId.FLOW_STARTED, {
      flow,
      data: opt_data || {},
    });
  }
  setOnFlowCanceled(callback) {
    this.setCallback_(CallbackId.FLOW_CANCELED, callback);
  }
  triggerFlowCanceled(flow, opt_data) {
    return this.trigger_(CallbackId.FLOW_CANCELED, {
      flow,
      data: opt_data || {},
    });
  }
  setCallback_(id, callback) {
    this.callbacks_[id] = callback;
    if (id in this.resultBuffer_) {
      this.executeCallback_(id, callback, this.resultBuffer_[id]);
    }
  }
  trigger_(id, data) {
    this.resultBuffer_[id] = data;
    const callback = this.callbacks_[id];
    if (callback) {
      this.executeCallback_(id, callback, data);
    }
    return !!callback;
  }
  resetCallback_(id) {
    if (id in this.resultBuffer_) {
      delete this.resultBuffer_[id];
    }
  }
  executeCallback_(id, callback, data) {
    Promise.resolve().then(() => {
      callback(data);
      this.resetCallback_(id);
    });
  }
}

class View {
  constructor() {}
  getElement() {}
  init(unusedDialog) {}
  resized() {
  }
  whenComplete() {}
  shouldFadeBody() {}
}

function isCancelError(error) {
  if (!error || typeof error != 'object') {
    return false;
  }
  return (error['name'] === 'AbortError');
}

const iframeAttributes = {
  'frameborder': '0',
  'scrolling': 'no',
};
class ActivityIframeView extends View {
  constructor(
      win,
      activityPorts,
      src,
      args,
      shouldFadeBody = false) {
    super();
    this.win_ = win;
    this.doc_ = this.win_.document;
    this.iframe_ =
                                          (
            createElement(this.doc_, 'iframe', iframeAttributes));
    this.activityPorts_ = activityPorts;
    this.src_ = src;
    this.args_ = args || {};
    this.shouldFadeBody_ = shouldFadeBody;
    this.port_ = null;
    this.portResolver_ = null;
    this.portPromise_ = new Promise(resolve => {
      this.portResolver_ = resolve;
    });
  }
  getElement() {
    return this.iframe_;
  }
  init(dialog) {
    return this.activityPorts_.openIframe(this.iframe_, this.src_, this.args_)
        .then(port => this.onOpenIframeResponse_(port, dialog));
  }
  shouldFadeBody() {
    return this.shouldFadeBody_;
  }
  onOpenIframeResponse_(port, dialog) {
    this.port_ = port;
    this.portResolver_(port);
    this.port_.onResizeRequest(height => {
      dialog.resizeView(this, height);
    });
    return this.port_.whenReady();
  }
  port() {
    return this.portPromise_;
  }
  message(data) {
    this.port().then(port => {
      port.message(data);
    });
  }
  onMessage(callback) {
    this.port().then(port => {
      port.onMessage(callback);
    });
  }
  acceptResult() {
    return this.port().then(port => port.acceptResult());
  }
  whenComplete() {
    return this.acceptResult();
  }
  onCancel(callback) {
    this.acceptResult().catch(reason => {
      if (isCancelError(reason)) {
        callback();
      }
      throw reason;
    });
  }
  resized() {
    if (this.port_) {
      this.port_.resized();
    }
  }
}

class Entitlements {
  constructor(service, raw, entitlements, currentProduct, ackHandler) {
    this.service = service;
    this.raw = raw;
    this.entitlements = entitlements;
    this.product_ = currentProduct;
    this.ackHandler_ = ackHandler;
  }
  clone() {
    return new Entitlements(
        this.service,
        this.raw,
        this.entitlements.map(ent => ent.clone()),
        this.product_,
        this.ackHandler_);
  }
  json() {
    return {
      'service': this.service,
      'entitlements': this.entitlements.map(item => item.json()),
    };
  }
  enablesThis(opt_source) {
    return this.enables(this.product_, opt_source);
  }
  enablesAny(opt_source) {
    for (let i = 0; i < this.entitlements.length; i++) {
      if (this.entitlements[i].products.length > 0 &&
          (!opt_source || opt_source == this.entitlements[i].source)) {
        return true;
      }
    }
    return false;
  }
  enables(product, opt_source) {
    if (!product) {
      return false;
    }
    return !!this.getEntitlementFor(product, opt_source);
  }
  getEntitlementForThis(opt_source) {
    return this.getEntitlementFor(this.product_, opt_source);
  }
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
  ack() {
    this.ackHandler_(this);
  }
}
class Entitlement {
  constructor(source, products, subscriptionToken) {
    this.source = source;
    this.products = products;
    this.subscriptionToken = subscriptionToken;
  }
  clone() {
    return new Entitlement(
        this.source,
        this.products.slice(0),
        this.subscriptionToken);
  }
  json() {
    return {
      'source': this.source,
      'products': this.products,
      'subscriptionToken': this.subscriptionToken,
    };
  }
  enables(product) {
    if (!product) {
      return false;
    }
    return this.products.includes(product);
  }
  static parseFromJson(json) {
    if (!json) {
      json = {};
    }
    const source = json['source'] || '';
    const products = json['products'] || [];
    const subscriptionToken = json['subscriptionToken'];
    return new Entitlement(source, products, subscriptionToken);
  }
  static parseListFromJson(json) {
    const jsonList = Array.isArray(json) ?
                                      (json) : [json];
    return jsonList.map(json => Entitlement.parseFromJson(json));
  }
}

class UserData {
  constructor(idToken, data) {
    this.idToken = idToken;
    this.data = data;
    this.id = data['sub'];
    this.email = data['email'];
    this.emailVerified = data['email_verified'];
    this.name = data['name'];
    this.givenName = data['given_name'];
    this.familyName = data['family_name'];
    this.pictureUrl = data['picture'];
  }
  clone() {
    return new UserData(this.idToken, this.data);
  }
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

class SubscribeResponse {
  constructor(raw, purchaseData, userData, completeHandler) {
    this.raw = raw;
    this.purchaseData = purchaseData;
    this.userData = userData;
    this.completeHandler_ = completeHandler;
  }
  clone() {
    return new SubscribeResponse(
        this.raw,
        this.purchaseData,
        this.userData,
        this.completeHandler_);
  }
  json() {
    return {
      'purchaseData': this.purchaseData.json(),
      'userData': this.userData ? this.userData.json() : null,
    };
  }
  complete() {
    return this.completeHandler_();
  }
}
class PurchaseData {
  constructor(raw, signature) {
    this.raw = raw;
    this.signature = signature;
  }
  clone() {
    return new PurchaseData(this.raw, this.signature);
  }
  json() {
    return {
      'data': this.raw,
      'signature': this.signature,
    };
  }
}

class DeferredAccountCreationResponse {
  constructor(entitlements, userData, purchaseData, completeHandler) {
    this.entitlements = entitlements;
    this.userData = userData;
    this.purchaseData = purchaseData;
    this.completeHandler_ = completeHandler;
  }
  clone() {
    return new DeferredAccountCreationResponse(
        this.entitlements,
        this.userData,
        this.purchaseData,
        this.completeHandler_);
  }
  json() {
    return {
      'entitlements': this.entitlements.json(),
      'userData': this.userData.json(),
      'purchaseData': this.purchaseData.json(),
    };
  }
  complete() {
    return this.completeHandler_();
  }
}

const base64UrlDecodeSubs = {'-': '+', '_': '/', '.': '='};
function stringToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    assert(charCode <= 255, 'Characters must be in range [0,255]');
    bytes[i] = charCode;
  }
  return bytes;
}
function bytesToString(bytes) {
  const array = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = String.fromCharCode(bytes[i]);
  }
  return array.join('');
}
function utf8DecodeSync(bytes) {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  const asciiString = bytesToString(new Uint8Array(bytes.buffer || bytes));
  return decodeURIComponent(escape(asciiString));
}
function utf8EncodeSync(string) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder('utf-8').encode(string);
  }
  return stringToBytes(unescape(encodeURIComponent(string)));
}
function base64UrlDecodeToBytes(str) {
  const encoded = atob(str.replace(/[-_.]/g, ch => base64UrlDecodeSubs[ch]));
  return stringToBytes(encoded);
}

function parseJson(json) {
  return                           (JSON.parse(                      (json)));
}
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

class JwtHelper {
  constructor() {
  }
  decode(encodedToken) {
    return this.decodeInternal_(encodedToken).payload;
  }
  decodeInternal_(encodedToken) {
    function invalidToken() {
      throw new Error(`Invalid token: "${encodedToken}"`);
    }
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
const WindowOpenMode = {
  AUTO: 'auto',
  REDIRECT: 'redirect',
};
function defaultConfig() {
  return {
    windowOpenMode: WindowOpenMode.AUTO,
  };
}

let a;
let cache;
function parseUrl$1(url, opt_nocache) {
  if (!a) {
    a =                                   (self.document.createElement('a'));
    cache = self.UrlCache || (self.UrlCache = Object.create(null));
  }
  const fromCache = cache[url];
  if (fromCache) {
    return fromCache;
  }
  const info = parseUrlWithA(a, url);
  return cache[url] = info;
}
function parseUrlWithA(a, url) {
  a.href = url;
  if (!a.protocol) {
    a.href = a.href;
  }
  const info = {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: '',
  };
  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname;
  }
  if ((info.protocol == 'http:' && info.port == 80) ||
      (info.protocol == 'https:' && info.port == 443)) {
    info.port = '';
    info.host = info.hostname;
  }
  if (a.origin && a.origin != 'null') {
    info.origin = a.origin;
  } else if (info.protocol == 'data:' || !info.host) {
    info.origin = info.href;
  } else {
    info.origin = info.protocol + '//' + info.host;
  }
  return info;
}
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

const allowedMethods_ = ['GET', 'POST'];
const allowedFetchTypes_ = {
  document: 1,
  text: 2,
};
class Xhr {
  constructor(win) {
    this.win = win;
  }
  fetch_(input, init) {
    assert(typeof input == 'string', 'Only URL supported: %s', input);
    const creds = init.credentials;
    assert(
        creds === undefined || creds == 'include' || creds == 'omit',
        'Only credentials=include|omit support: %s', creds);
    if (init.responseType == 'document') {
      return fetchPolyfill(input, init);
    }
    return (this.win.fetch || fetchPolyfill).apply(null, arguments);
  }
  fetch(input, opt_init) {
    const init = setupInit(opt_init);
    return this.fetch_(input, init).then(response => response, reason => {
      const targetOrigin = parseUrl$1(input).origin;
      throw new Error('XHR Failed fetching' +
          ` (${targetOrigin}/...):`, reason && reason.message);
    }).then(response => assertSuccess(response));
  }
}
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
function setupInit(opt_init, opt_accept) {
  const init = opt_init ||                             ({});
  init.method = normalizeMethod_(init.method);
  init.headers = init.headers || {};
  if (opt_accept) {
    init.headers['Accept'] = opt_accept;
  }
  return init;
}
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
      if (xhr.readyState <                       2) {
        return;
      }
      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(new Error(`Unknown HTTP status ${xhr.status}`));
        return;
      }
      if (xhr.readyState ==                4) {
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
function createXhrRequest(method, url) {
  const xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
  } else {
    throw new Error('CORS is not supported');
  }
  return xhr;
}
function isRetriable(status) {
  return status == 415 || (status >= 500 && status < 600);
}
function assertSuccess(response) {
  return new Promise(resolve => {
    if (response.ok) {
      return resolve(response);
    }
    const {status} = response;
    const err = new Error(`HTTP error ${status}`);
    err.retriable = isRetriable(status);
    err.response = response;
    throw err;
  });
}
class FetchResponse {
  constructor(xhr) {
    this.xhr_ = xhr;
    this.status = this.xhr_.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new FetchResponseHeaders(xhr);
    this.bodyUsed = false;
    this.body = null;
  }
  clone() {
    assert(!this.bodyUsed, 'Body already used');
    return new FetchResponse(this.xhr_);
  }
  drainText_() {
    assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    return Promise.resolve(this.xhr_.responseText);
  }
  text() {
    return this.drainText_();
  }
  json() {
    return                                      (
        this.drainText_().then(parseJson));
  }
  document_() {
    assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    assert(this.xhr_.responseXML,
        'responseXML should exist. Make sure to return ' +
        'Content-Type: text/html header.');
    return                                    (
        Promise.resolve(assert(this.xhr_.responseXML)));
  }
  arrayBuffer() {
    return                                       (
        this.drainText_().then(utf8EncodeSync));
  }
}
class FetchResponseHeaders {
  constructor(xhr) {
    this.xhr_ = xhr;
  }
  get(name) {
    return this.xhr_.getResponseHeader(name);
  }
  has(name) {
    return this.xhr_.getResponseHeader(name) != null;
  }
}

const CACHE_KEYS = {
  'nocache': 1,
  'hr1': 3600000,
  'hr12': 43200000,
};
function feOrigin() {
  return parseUrl$1('https://news.google.com').origin;
}
function serviceUrl(url) {
  return 'https://news.google.com/swg/_/api/v1' + url;
}
function feUrl(url, prefix = '') {
  return feCached('https://news.google.com' + prefix + '/swg/_/ui/v1' + url);
}
function feCached(url) {
  return addQueryParam(url, '_', cacheParam('hr1'));
}
function feArgs(args) {
  return Object.assign(args, {
    '_client': 'SwG 0.1.22.24',
  });
}
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

const PAY_REQUEST_ID = 'swg-pay';
const PAY_ORIGIN = {
  'PRODUCTION': 'https://pay.google.com',
  'SANDBOX': 'https://pay.sandbox.google.com',
};
function payOrigin() {
  return PAY_ORIGIN['PRODUCTION'];
}
function payUrl() {
  return feCached(PAY_ORIGIN['PRODUCTION'] + '/gp/p/ui/pay');
}
function payDecryptUrl() {
  return PAY_ORIGIN['PRODUCTION'] + '/gp/p/apis/buyflow/process';
}
class PayStartFlow {
  static preconnect(pre) {
    pre.prefetch(payUrl());
    pre.prefetch(
        'https://payments.google.com/payments/v4/js/integrator.js?ss=md');
    pre.prefetch('https://clients2.google.com/gr/gr_full_2.0.6.js');
    pre.preconnect('https://www.gstatic.com/');
    pre.preconnect('https://fonts.googleapis.com/');
    pre.preconnect('https://www.google.com/');
  }
  constructor(deps, sku) {
    this.deps_ = deps;
    this.activityPorts_ = deps.activities();
    this.pageConfig_ = deps.pageConfig();
    this.dialogManager_ = deps.dialogManager();
    this.sku_ = sku;
  }
  start() {
    this.deps_.callbacks().triggerFlowStarted(SubscriptionFlows.SUBSCRIBE, {
      'sku': this.sku_,
    });
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
class PayCompleteFlow {
  static configurePending(deps) {
    deps.activities().onResult(PAY_REQUEST_ID, port => {
      deps.dialogManager().popupClosed();
      deps.entitlementsManager().blockNextNotification();
      const flow = new PayCompleteFlow(deps);
      const promise = validatePayResponse(
          deps.win(), port, flow.complete.bind(flow));
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
  constructor(deps) {
    this.win_ = deps.win();
    this.deps_ = deps;
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
    this.activityIframeView_ = null;
    this.response_ = null;
    this.readyPromise_ = null;
  }
  start(response) {
    this.deps_.entitlementsManager().reset(true);
    this.response_ = response;
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/payconfirmiframe'),
        feArgs({
          'publicationId': this.deps_.pageConfig().getPublicationId(),
          'loginHint': response.userData && response.userData.email,
        }),
                             true);
    this.activityIframeView_.onMessage(data => {
      if (data['entitlements']) {
        this.deps_.entitlementsManager().pushNextEntitlements(
                                  (data['entitlements']));
        return;
      }
    });
    this.activityIframeView_.acceptResult().then(() => {
      this.dialogManager_.completeView(this.activityIframeView_);
    });
    this.readyPromise_ = this.dialogManager_.openView(this.activityIframeView_);
    return this.readyPromise_;
  }
  complete() {
    this.deps_.entitlementsManager().unblockNextNotification();
    this.readyPromise_.then(() => {
      this.activityIframeView_.message({'complete': true});
    });
    return this.activityIframeView_.acceptResult().catch(() => {
    }).then(() => {
      this.deps_.entitlementsManager().setToastShown(true);
    });
  }
}
function validatePayResponse(win, port, completeHandler) {
  return port.acceptResult().then(result => {
    if (result.origin != payOrigin()) {
      throw new Error('channel mismatch');
    }
    const data =                        (result.data);
    if (data['redirectEncryptedCallbackData']) {
      const xhr = new Xhr(win);
      const url = payDecryptUrl();
      const init =                                           ({
        method: 'post',
        headers: {'Accept': 'text/plain, application/json'},
        credentials: 'include',
        body: data['redirectEncryptedCallbackData'],
        mode: 'cors',
      });
      return xhr.fetch(url, init).then(response => response.json());
    }
    if (result.originVerified && result.secureChannel) {
      return data;
    }
    throw new Error('channel mismatch');
  }).then(data => parseSubscriptionResponse(data, completeHandler));
}
function parseSubscriptionResponse(data, completeHandler) {
  let swgData = null;
  let raw = null;
  if (data) {
    if (typeof data == 'string') {
      raw =                       (data);
    } else {
      const json =                        (data);
      if ('swgCallbackData' in json) {
        swgData =                        (json['swgCallbackData']);
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
  raw = JSON.stringify(                           (swgData));
  return new SubscribeResponse(
      raw,
      parsePurchaseData(swgData),
      parseUserData(swgData),
      completeHandler);
}
function parsePurchaseData(swgData) {
  const raw = swgData['purchaseData'];
  const signature = swgData['purchaseDataSignature'];
  return new PurchaseData(raw, signature);
}
function parseUserData(swgData) {
  const idToken = swgData['idToken'];
  if (!idToken) {
    return null;
  }
  const jwt =                        (new JwtHelper().decode(idToken));
  return new UserData(idToken, jwt);
}

class DeferredAccountFlow {
  constructor(deps, options) {
    this.deps_ = deps;
    this.win_ = deps.win();
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
    this.activityIframeView_ = null;
    this.openPromise_ = null;
    const defaultOptions = {
      entitlements: null,
      consent: true,
    };
    this.options_ = Object.assign(defaultOptions, options || {});
  }
  start() {
    const entitlements = this.options_.entitlements;
    if (!entitlements || !entitlements.getEntitlementForSource('google')) {
      throw new Error('No entitlements with "google" source');
    }
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
                             true);
    this.openPromise_ = this.dialogManager_.openView(this.activityIframeView_);
    return this.activityIframeView_.acceptResult().then(result => {
      return this.handleConsentResponse_(                       (result.data));
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
  handleConsentResponse_(data) {
    this.deps_.entitlementsManager().blockNextNotification();
    const entitlementsJwt = data['entitlements'];
    const idToken = data['idToken'];
    const entitlements = this.deps_.entitlementsManager()
        .parseEntitlements({'signedEntitlements': entitlementsJwt});
    const userData = new UserData(
        idToken,
                               (new JwtHelper().decode(idToken)));
    const purchaseData = new PurchaseData(
        data['purchaseData'],
        data['purchaseDataSignature']);
    const creatingFlow = new PayCompleteFlow(this.deps_);
    const completeHandler = creatingFlow.complete.bind(creatingFlow);
    const response = new DeferredAccountCreationResponse(
        entitlements,
        userData,
        purchaseData,
        completeHandler);
    creatingFlow.start(new SubscribeResponse(
        '',
        purchaseData,
        userData,
        () => Promise.resolve()
    ));
    return response;
  }
}

const CSS$1 = "body{padding:0;margin:0}swg-container,swg-loading,swg-loading-animate,swg-loading-image{display:block}swg-loading-container{width:100%!important;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;-webkit-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important;min-height:148px!important;height:100%!important;bottom:0!important;margin-top:5px!important;z-index:2147483647!important}@media (min-height:630px), (min-width:630px){swg-loading-container{width:560px!important;margin-left:35px!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;background-color:#fff!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}swg-loading{z-index:2147483647!important;width:36px;height:36px;overflow:hidden;-webkit-animation:mspin-rotate 1568.63ms infinite linear;animation:mspin-rotate 1568.63ms infinite linear}swg-loading-animate{-webkit-animation:mspin-revrot 5332ms infinite steps(4);animation:mspin-revrot 5332ms infinite steps(4)}swg-loading-image{background-image:url('data:image/svg+xml;charset=utf-8;base64,DQo8c3ZnIHZlcnNpb249IjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMTY2NCIgaGVpZ2h0PSIzNiIgdmlld0JveD0iMCAwIDExNjY0IDM2Ij48ZGVmcz48cGF0aCBpZD0iYSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWRhc2hhcnJheT0iNTguOSIgZD0iTTE4IDUuNUExMi41IDEyLjUgMCAxIDEgNS41IDE4IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz48ZyBpZD0iYiI+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE3Ni42NiIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzYuNTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzYuMzIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDcyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzUuODUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwOCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTc1LjE0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE3NC4xMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTgwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzIuNzgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIxNikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTcxLjAxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE2OC43OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjg4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNjYuMDIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMyNCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTYyLjczIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNjApIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE1OS4wMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzk2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNTUuMDQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQzMikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTUxLjA1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0NjgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE0Ny4yMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTA0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNDMuNzEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU0MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTQwLjU0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1NzYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEzNy43MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjEyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMzUuMjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDY0OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTMyLjk4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2ODQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEzMS4wMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzIwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjkuMjYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDc1NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTI3LjcxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEyNi4zMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODI4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjUuMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODY0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjQuMDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDkwMCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTIzLjA0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MzYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEyMi4xOSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOTcyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjEuNDMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMDgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEyMC43NyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA0NCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTIwLjE5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDgwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTkuNjkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExMTYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExOS4yNiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTE1MikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE4Ljg5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMTg4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTguNTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyMjQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExOC4zMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTI2MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE4LjEzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjk2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTcuOTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzMzIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExNy44OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM2OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE3LjgyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDA0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTcuOCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTQ0MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE3LjcyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDc2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTcuNDYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1MTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTU0OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE2LjI5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNTg0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTUuMjkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2MjApIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExMy45NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTY1NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTEyLjE5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNjkyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMDkuOTciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3MjgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEwNy4yMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTc2NCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTAzLjk2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODAwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMDAuMjciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4MzYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9Ijk2LjMyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODcyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI5Mi4zNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTkwOCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iODguNTYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE5NDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9Ijg1LjA3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxOTgwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI4MS45MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAxNikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNzkuMTEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwNTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9Ijc2LjYxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDg4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI3NC40IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTI0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI3Mi40NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjE2MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNzAuNzEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIxOTYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjY5LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMjMyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2Ny43OSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjI2OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjYuNTciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIzMDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjY1LjQ5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMzQwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2NC41MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM3NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjMuNjgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI0MTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYyLjkzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDQ4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2Mi4yNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjQ4NCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjEuNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUyMCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjEuMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjU1NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjAuNzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1OTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYwLjQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MjgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYwLjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2NjQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5Ljg1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNzAwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI1OS42NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjczNikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjc3MikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjgwOCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuMzQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI4NDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjMyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODgwKSIvPjwvZz48ZyBpZD0iYyI+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjcwLjcxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTk2KSIgb3BhY2l0eT0iLjA1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjY5LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMjMyKSIgb3BhY2l0eT0iLjEiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjcuNzkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIyNjgpIiBvcGFjaXR5PSIuMTUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjYuNTciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIzMDQpIiBvcGFjaXR5PSIuMiIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2NS40OSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM0MCkiIG9wYWNpdHk9Ii4yNSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2NC41MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM3NikiIG9wYWNpdHk9Ii4zIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYzLjY4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDEyKSIgb3BhY2l0eT0iLjM1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYyLjkzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDQ4KSIgb3BhY2l0eT0iLjQiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjIuMjciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI0ODQpIiBvcGFjaXR5PSIuNDUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjEuNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUyMCkiIG9wYWNpdHk9Ii41Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYxLjIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1NTYpIiBvcGFjaXR5PSIuNTUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjAuNzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1OTIpIiBvcGFjaXR5PSIuNiIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2MC40IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNjI4KSIgb3BhY2l0eT0iLjY1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYwLjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2NjQpIiBvcGFjaXR5PSIuNyIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI1OS44NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjcwMCkiIG9wYWNpdHk9Ii43NSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI1OS42NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjczNikiIG9wYWNpdHk9Ii44Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI3NzIpIiBvcGFjaXR5PSIuODUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjgwOCkiIG9wYWNpdHk9Ii45Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjM0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODQ0KSIgb3BhY2l0eT0iLjk1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjMyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODgwKSIvPjwvZz48L2RlZnM+PHVzZSB4bGluazpocmVmPSIjYiIgc3Ryb2tlPSIjNDI4NWY0Ii8+PHVzZSB4bGluazpocmVmPSIjYyIgc3Ryb2tlPSIjZGI0NDM3Ii8+PHVzZSB4bGluazpocmVmPSIjYiIgc3Ryb2tlPSIjZGI0NDM3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyOTE2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2MiIHN0cm9rZT0iI2Y0YjQwMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjkxNikiLz48dXNlIHhsaW5rOmhyZWY9IiNiIiBzdHJva2U9IiNmNGI0MDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU4MzIpIi8+PHVzZSB4bGluazpocmVmPSIjYyIgc3Ryb2tlPSIjMGY5ZDU4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1ODMyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2IiIHN0cm9rZT0iIzBmOWQ1OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODc0OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNjIiBzdHJva2U9IiM0Mjg1ZjQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDg3NDgpIi8+PC9zdmc+');background-size:100%;width:11664px;height:36px;-webkit-animation:swg-loading-film 5332ms infinite steps(324);animation:swg-loading-film 5332ms infinite steps(324)}@-webkit-keyframes swg-loading-film{0%{-webkit-transform:translateX(0);transform:translateX(0)}to{-webkit-transform:translateX(-11664px);transform:translateX(-11664px)}}@keyframes swg-loading-film{0%{-webkit-transform:translateX(0);transform:translateX(0)}to{-webkit-transform:translateX(-11664px);transform:translateX(-11664px)}}@-webkit-keyframes mspin-rotate{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes mspin-rotate{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes mspin-revrot{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(-360deg);transform:rotate(-360deg)}}@keyframes mspin-revrot{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(-360deg);transform:rotate(-360deg)}}\n/*# sourceURL=/./src/ui/ui.css*/";

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

class Graypane {
  constructor(doc, zIndex) {
    this.doc_ = doc;
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
  getElement() {
    return this.fadeBackground_;
  }
  isAttached() {
    return !!this.fadeBackground_.parentNode;
  }
  attach() {
    this.doc_.getBody().appendChild(this.fadeBackground_);
  }
  destroy() {
    this.doc_.getBody().removeChild(this.fadeBackground_);
  }
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

class LoadingView {
  constructor(doc) {
    this.doc_ = doc;
    this.loadingContainer_ =
        createElement(this.doc_, 'swg-loading-container', {});
    this.loading_ = createElement(this.doc_, 'swg-loading', {});
    this.loadingContainer_.appendChild(this.loading_);
    this.loadingContainer_.style.setProperty('display', 'none', 'important');
    this.buildLoadingIndicator_();
  }
  getElement() {
    return this.loadingContainer_;
  }
  show() {
    this.loadingContainer_.style.removeProperty('display');
  }
  hide() {
    this.loadingContainer_.style.setProperty('display', 'none', 'important');
  }
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

const friendlyIframeAttributes = {
  'frameborder': 0,
  'scrolling': 'no',
  'src': 'about:blank',
};
class FriendlyIframe {
  constructor(doc, attrs = {}) {
    const mergedAttrs = Object.assign({}, friendlyIframeAttributes, attrs);
    this.iframe_ =
                                          (
            createElement(doc, 'iframe', mergedAttrs));
    resetAllStyles(this.iframe_);
    this.ready_ = new Promise(resolve => {
      this.iframe_.onload = resolve;
    });
  }
  whenReady() {
    return this.ready_;
  }
  getElement() {
    return this.iframe_;
  }
  getDocument() {
    const doc = this.getElement().contentDocument ||
        (this.getElement().contentWindow &&
        this.getElement().contentWindow.document);
    if (!doc) {
      throw new Error('not loaded');
    }
    return doc;
  }
  getBody() {
    return                         (this.getDocument().body);
  }
  isConnected() {
    if (!this.getElement().ownerDocument) {
      return false;
    }
    return this.getElement().ownerDocument.contains(this.iframe_);
  }
}

const Z_INDEX = 2147483647;
const rootElementImportantStyles = {
  'min-height': '50px',
  'border': 'none',
  'display': 'block',
  'position': 'fixed',
  'z-index': Z_INDEX,
  'box-sizing': 'border-box',
};
const resetViewStyles = {
  'position': 'absolute',
  'top': '0',
  'left': '0',
  'right': '0',
  'bottom': '0',
  'opacity': 0,
  'height': 0,
  'max-height': '100%',
  'max-width': '100%',
  'min-height': '100%',
  'min-width': '100%',
  'width': 0,
};
const PositionAt = {
  BOTTOM: 'BOTTOM',
  TOP: 'TOP',
  FLOAT: 'FLOAT',
  FULL: 'FULL',
};
class Dialog {
  constructor(doc, importantStyles = {}, styles = {}) {
    this.doc_ = doc;
    this.iframe_ = new FriendlyIframe(
        doc.getWin().document, {'class': 'swg-dialog'});
    this.graypane_ = new Graypane(doc, Z_INDEX - 1);
    const modifiedImportantStyles =
        Object.assign({}, rootElementImportantStyles, importantStyles);
    setImportantStyles(
        this.iframe_.getElement(), modifiedImportantStyles);
    setStyles(this.iframe_.getElement(), styles);
    this.loadingView_ = null;
    this.container_ = null;
    this.view_ = null;
    this.animating_ = null;
    this.hidden_ = false;
  }
  open(hidden = false) {
    const iframe = this.iframe_;
    if (iframe.isConnected()) {
      throw new Error('already opened');
    }
    this.doc_.getBody().appendChild(iframe.getElement());
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
  buildIframe_() {
    const iframe = this.iframe_;
    const iframeBody = iframe.getBody();
    const iframeDoc =                              (this.iframe_.getDocument());
    injectStyleSheet(iframeDoc, CSS$1);
    this.loadingView_ = new LoadingView(iframeDoc);
    iframeBody.appendChild(this.loadingView_.getElement());
    this.container_ = createElement(iframeDoc, 'swg-container', {});
    iframeBody.appendChild(this.container_);
    this.setPosition_();
  }
  close(animated = true) {
    let animating;
    if (animated) {
      animating = this.animate_(() => {
        this.graypane_.hide(              true);
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
  getContainer() {
    if (!this.container_) {
      throw new Error('not opened yet');
    }
    return this.container_;
  }
  getIframe() {
    return this.iframe_;
  }
  getElement() {
    return this.iframe_.getElement();
  }
  setLoading(isLoading) {
    if (isLoading) {
      this.loadingView_.show();
    } else {
      this.loadingView_.hide();
    }
  }
  getCurrentView() {
    return this.view_;
  }
  openView(view) {
    if (this.view_) {
      removeChildren(this.getContainer());
    }
    this.view_ = view;
    setImportantStyles(view.getElement(), resetViewStyles);
    this.setLoading(true);
    this.getContainer().appendChild(view.getElement());
    if (view.shouldFadeBody() && !this.hidden_) {
      this.graypane_.show(              true);
    }
    return view.init(this).then(() => {
      setImportantStyles(view.getElement(), {
        'opacity': 1,
      });
      if (this.hidden_) {
        if (view.shouldFadeBody()) {
          this.graypane_.show(               true);
        }
        this.show_();
      }
      this.setLoading(false);
    });
  }
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
  resizeView(view, height, animated = true) {
    if (this.view_ != view) {
      return null;
    }
    const newHeight = this.getMaxAllowedHeight_(height);
    let animating;
    if (animated) {
      const oldHeight = this.getElement().offsetHeight;
      if (newHeight >= oldHeight) {
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
  animate_(callback) {
    const wait = this.animating_ || Promise.resolve();
    return this.animating_ = wait.then(() => {
      return callback();
    }, () => {
    }).then(() => {
      this.animating_ = null;
    });
  }
  getMaxAllowedHeight_(height) {
    return Math.min(height, this.doc_.getWin().      innerHeight * 0.9);
  }
  getHeight_() {
    return this.getElement().offsetHeight;
  }
  setPosition_() {
    setImportantStyles(this.getElement(), this.getPositionStyle_());
  }
  updatePaddingToHtml_(newHeight) {
    if (this.inferPosition_() == PositionAt.BOTTOM) {
      const bottomPadding = newHeight + 20;
      const htmlElement = this.doc_.getRootElement();
      setImportantStyles(htmlElement, {
        'padding-bottom': `${bottomPadding}px`,
      });
    }
  }
  removePaddingToHtml_() {
    this.doc_.getRootElement().style.removeProperty('padding-bottom');
  }
  inferPosition_() {
    return PositionAt.BOTTOM;
  }
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

const POPUP_Z_INDEX = 2147483647;
class DialogManager {
  constructor(doc) {
    this.doc_ = doc;
    this.dialog_ = null;
    this.openPromise_ = null;
    this.popupGraypane_ = new Graypane(doc, POPUP_Z_INDEX);
    this.popupWin_ = null;
    this.popupGraypane_.getElement().addEventListener('click', () => {
      if (this.popupWin_) {
        try {
          this.popupWin_.focus();
        } catch (e) {
        }
      }
    });
  }
  openDialog(hidden = false) {
    if (!this.openPromise_) {
      this.dialog_ = new Dialog(this.doc_);
      this.openPromise_ = this.dialog_.open(hidden);
    }
    return this.openPromise_;
  }
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
  completeView(view) {
    setTimeout(() => {
      if (this.dialog_ && this.dialog_.getCurrentView() == view) {
        this.close_();
      }
    }, 100);
  }
  completeAll() {
    if (this.dialog_) {
      this.close_();
    }
    if (this.popupGraypane_.isAttached()) {
      this.popupGraypane_.destroy();
    }
  }
  close_() {
    this.dialog_.close();
    this.dialog_ = null;
    this.openPromise_ = null;
  }
  popupOpened(targetWin) {
    this.popupWin_ = targetWin || null;
    if (!this.popupGraypane_.isAttached()) {
      this.popupGraypane_.attach();
    }
    this.popupGraypane_.show();
  }
  popupClosed() {
    this.popupWin_ = null;
    try {
      this.popupGraypane_.hide();
    } catch (e) {
    }
  }
}

function getReadyState(doc) {
  return                       (doc['readyState']);
}
function isDocumentReady(doc) {
  const readyState = getReadyState(doc);
  return readyState != 'loading' && readyState != 'uninitialized';
}
function onDocumentReady(doc, callback) {
  onDocumentState(doc, isDocumentReady, callback);
}
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
function whenDocumentReady(doc) {
  return new Promise(resolve => {
    onDocumentReady(doc, resolve);
  });
}

class GlobalDoc {
  constructor(winOrDoc) {
    const isWin = !!winOrDoc.document;
    this.win_ = isWin ?
                               (winOrDoc) :
                               (
            (                         (winOrDoc)).defaultView);
    this.doc_ = isWin ?
                               (winOrDoc).document :
                                 (winOrDoc);
  }
  getWin() {
    return this.win_;
  }
  getRootNode() {
    return this.doc_;
  }
  getRootElement() {
    return this.doc_.documentElement;
  }
  getHead() {
    return                         (this.doc_.head);
  }
  getBody() {
    return this.doc_.body;
  }
  isReady() {
    return isDocumentReady(this.doc_);
  }
  whenReady() {
    return whenDocumentReady(this.doc_);
  }
}
function resolveDoc(input) {
  if ((                         (input)).nodeType ===                9) {
    return new GlobalDoc(                         (input));
  }
  if ((                       (input)).document) {
    return new GlobalDoc(                       (input));
  }
  return                     (input);
}

const toastImportantStyles = {
  'height': 0,
};
const iframeAttributes$1 = {
  'frameborder': '0',
  'scrolling': 'no',
  'class': 'swg-toast',
};
class Toast {
  constructor(deps, src, args) {
    this.doc_ = deps.doc();
    this.activityPorts_ = deps.activities();
    this.src_ = src;
    this.args_ = args;
    this.animating_ = null;
    this.iframe_ =
                                          (
            createElement(
                this.doc_.getWin().document,
                'iframe',
                iframeAttributes$1));
    setImportantStyles(this.iframe_, toastImportantStyles);
    this.ready_ = new Promise(resolve => {
      this.iframe_.onload = resolve;
    });
  }
  getElement() {
    return this.iframe_;
  }
  open() {
    this.doc_.getBody().appendChild(this.iframe_);
    return this.buildToast_();
  }
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
          this.doc_.getWin().setTimeout(() => {
            this.close();
          }, (toastDurationSeconds + 1) * 1000);
        });
  }
  animate_(callback) {
    const wait = this.animating_ || Promise.resolve();
    return this.animating_ = wait.then(() => {
      return callback();
    }, () => {
    }).then(() => {
      this.animating_ = null;
    });
  }
  close() {
    return this.animate_(() => {
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

const SERVICE_ID = 'subscribe.google.com';
const TOAST_STORAGE_KEY = 'toast';
const ENTS_STORAGE_KEY = 'ents';
class EntitlementsManager {
  constructor(win, config, fetcher, deps) {
    this.win_ = win;
    this.config_ = config;
    this.publicationId_ = this.config_.getPublicationId();
    this.fetcher_ = fetcher;
    this.deps_ = deps;
    this.jwtHelper_ = new JwtHelper();
    this.responsePromise_ = null;
    this.positiveRetries_ = 0;
    this.blockNextNotification_ = false;
    this.storage_ = deps.storage();
  }
  reset(opt_expectPositive) {
    this.responsePromise_ = null;
    this.positiveRetries_ = Math.max(
        this.positiveRetries_, opt_expectPositive ? 3 : 0);
    if (opt_expectPositive) {
      this.storage_.remove(ENTS_STORAGE_KEY);
    }
  }
  getEntitlements() {
    if (!this.responsePromise_) {
      this.responsePromise_ = this.getEntitlementsFlow_();
    }
    return this.responsePromise_;
  }
  pushNextEntitlements(raw) {
    const entitlements = this.getValidJwtEntitlements_(
        raw,                         true);
    if (entitlements && entitlements.enablesThis()) {
      this.storage_.set(ENTS_STORAGE_KEY, raw);
      return true;
    }
    return false;
  }
  getEntitlementsFlow_() {
    return this.fetchEntitlementsWithCaching_().then(entitlements => {
      this.onEntitlementsFetched_(entitlements);
      return entitlements;
    });
  }
  fetchEntitlementsWithCaching_() {
    return this.storage_.get(ENTS_STORAGE_KEY).then(raw => {
      if (raw) {
        const cached = this.getValidJwtEntitlements_(
            raw,                         true);
        if (cached && cached.enablesThis()) {
          this.positiveRetries_ = 0;
          return cached;
        }
      }
      return this.fetchEntitlements_().then(ents => {
        if (ents && ents.enablesThis() && ents.raw) {
          this.storage_.set(ENTS_STORAGE_KEY, ents.raw);
        }
        return ents;
      });
    });
  }
  fetchEntitlements_() {
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
  setToastShown(value) {
    this.storage_.set(TOAST_STORAGE_KEY, value ? '1' : '0');
  }
  blockNextNotification() {
    this.blockNextNotification_ = true;
  }
  unblockNextNotification() {
    this.blockNextNotification_ = false;
  }
  parseEntitlements(json) {
    const signedData = json['signedEntitlements'];
    if (signedData) {
      const entitlements = this.getValidJwtEntitlements_(
          signedData,                         false);
      if (entitlements) {
        return entitlements;
      }
    } else {
      const plainEntitlements = json['entitlements'];
      if (plainEntitlements) {
        return this.createEntitlements_('', plainEntitlements);
      }
    }
    return this.createEntitlements_('', []);
  }
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
      this.win_.setTimeout(() => {throw e;});
    }
    return null;
  }
  createEntitlements_(raw, json) {
    return new Entitlements(
        SERVICE_ID,
        raw,
        Entitlement.parseListFromJson(json),
        this.config_.getProductId(),
        this.ack_.bind(this));
  }
  onEntitlementsFetched_(entitlements) {
    const blockNotification = this.blockNextNotification_;
    this.blockNextNotification_ = false;
    if (blockNotification) {
      return;
    }
    this.deps_.callbacks().triggerEntitlementsResponse(
        Promise.resolve(entitlements));
    this.maybeShowToast_(entitlements);
  }
  maybeShowToast_(entitlements) {
    const entitlement = entitlements.getEntitlementForThis();
    if (!entitlement) {
      return Promise.resolve();
    }
    return this.storage_.get(TOAST_STORAGE_KEY).then(value => {
      if (value == '1') {
        return;
      }
      if (entitlement) {
        this.showToast_(entitlement);
      }
    });
  }
  showToast_(entitlement) {
    const source = entitlement.source || 'google';
    return new Toast(this.deps_, feUrl('/toastiframe'), feArgs({
      'publicationId': this.publicationId_,
      'source': source,
    })).open();
  }
  ack_(entitlements) {
    if (entitlements.getEntitlementForThis()) {
      this.setToastShown(true);
    }
  }
  fetch_() {
    const url = serviceUrl(
        '/publication/' +
        encodeURIComponent(this.publicationId_) +
        '/entitlements');
    return this.fetcher_.fetchCredentialedJson(url)
        .then(json => this.parseEntitlements(json));
  }
}

class Fetcher {
  fetchCredentialedJson(unusedUrl) {}
}
class XhrFetcher {
  constructor(win) {
    this.xhr_ = new Xhr(win);
  }
  fetchCredentialedJson(url) {
    const init =                                           ({
      method: 'GET',
      headers: {'Accept': 'text/plain, application/json'},
      credentials: 'include',
    });
    return this.xhr_.fetch(url, init).then(response => response.json());
  }
}

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

const LINK_REQUEST_ID = 'swg-link';
class LinkbackFlow {
  constructor(deps) {
    this.deps_ = deps;
    this.activityPorts_ = deps.activities();
    this.pageConfig_ = deps.pageConfig();
    this.dialogManager_ = deps.dialogManager();
  }
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
class LinkCompleteFlow {
  static configurePending(deps) {
    function handler(port) {
      deps.entitlementsManager().blockNextNotification();
      deps.callbacks().triggerLinkProgress();
      deps.dialogManager().popupClosed();
      const promise = acceptPortResultData(
          port,
          feOrigin(),
                                      false,
                                     false);
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
  constructor(deps, response) {
    this.win_ = deps.win();
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
    this.entitlementsManager_ = deps.entitlementsManager();
    this.callbacks_ = deps.callbacks();
    const index = response && response['index'] || '0';
    this.activityIframeView_ =
        new ActivityIframeView(
            this.win_,
            this.activityPorts_,
            feUrl('/linkconfirmiframe', '/u/' + index),
            feArgs({
              'productId': deps.pageConfig().getProductId(),
              'publicationId': deps.pageConfig().getPublicationId(),
            }),
                                 true);
    this.completeResolver_ = null;
    this.completePromise_ = new Promise(resolve => {
      this.completeResolver_ = resolve;
    });
  }
  start() {
    const promise = this.activityIframeView_.port().then(port => {
      return acceptPortResultData(
          port,
          feOrigin(),
                                      true,
                                     true);
    });
    promise.then(response => {
      this.complete_(response);
    }).catch(reason => {
      setTimeout(() => {
        throw reason;
      });
    }).then(() => {
      this.dialogManager_.completeView(this.activityIframeView_);
    });
    return this.dialogManager_.openView(this.activityIframeView_);
  }
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
  whenComplete() {
    return this.completePromise_;
  }
}
class LinkSaveFlow {
  constructor(deps, callback) {
    this.win_ = deps.win();
    this.deps_ = deps;
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
    this.callback_ = callback;
    this.requestPromise_ = null;
    this.activityIframeView_ = null;
  }
  getRequestPromise() {
    return this.requestPromise_;
  }
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
                             false
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
          this.dialogManager_.completeView(this.activityIframeView_);
          throw reason;
        });
      }
    });
    return this.dialogManager_.openView(this.activityIframeView_,
                     true).then(() => {
          return this.activityIframeView_.port().then(port => {
            return acceptPortResultData(
                port,
                feOrigin(),
                                            true,
                                           true);
          }).then(result => {
            return result['linked'];
          }).catch(() => {
            return false;
          }).then(result => {
            this.dialogManager_.completeView(this.activityIframeView_);
            return result;
          });
        });
  }
}

class LoginPromptApi {
  constructor(deps) {
    this.deps_ = deps;
    this.win_ = deps.win();
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
    this.openViewPromise_ = null;
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/loginiframe'),
        feArgs({
          publicationId: deps.pageConfig().getPublicationId(),
          productId: deps.pageConfig().getProductId(),
          userConsent: true,
        }),
                             true
    );
  }
  start() {
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_LOGIN_PROMPT);
    this.openViewPromise_ = this.dialogManager_.openView(
        this.activityIframeView_);
    return this.activityIframeView_.acceptResult().then(() => {
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

class LoginNotificationApi {
  constructor(deps) {
    this.deps_ = deps;
    this.win_ = deps.win();
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
    this.openViewPromise_ = null;
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/loginiframe'),
        feArgs({
          publicationId: deps.pageConfig().getPublicationId(),
          productId: deps.pageConfig().getProductId(),
          userConsent: false,
        }),
                             true
    );
  }
  start() {
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_LOGIN_NOTIFICATION);
    this.openViewPromise_ = this.dialogManager_.openView(
        this.activityIframeView_);
    return this.activityIframeView_.acceptResult().then(() => {
      this.dialogManager_.completeView(this.activityIframeView_);
    }, reason => {
      this.dialogManager_.completeView(this.activityIframeView_);
      throw reason;
    });
  }
}

class WaitForSubscriptionLookupApi {
  constructor(deps, accountPromise) {
    this.deps_ = deps;
    this.win_ = deps.win();
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
    this.openViewPromise_ = null;
    this.accountPromise_ = accountPromise || null;
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/waitforsubscriptionlookupiframe'),
        feArgs({
          publicationId: deps.pageConfig().getPublicationId(),
          productId: deps.pageConfig().getProductId(),
        }),
                             true
    );
  }
  start() {
    this.openViewPromise_ = this.dialogManager_.openView(
        this.activityIframeView_);
    return this.accountPromise_.then(account => {
      this.dialogManager_.completeView(this.activityIframeView_);
      return account;
    }, reason => {
      this.dialogManager_.completeView(this.activityIframeView_);
      throw reason;
    });
  }
}

class OffersApi {
  constructor(config, fetcher) {
    this.config_ = config;
    this.fetcher_ = fetcher;
  }
  getOffers(opt_productId) {
    const productId = opt_productId || this.config_.getProductId();
    if (!productId) {
      throw new Error('getOffers requires productId in config or arguments');
    }
    return this.fetch_(productId);
  }
  fetch_(productId) {
    const url = serviceUrl(
        '/publication/' +
        encodeURIComponent(this.config_.getPublicationId()) +
        '/offers' +
        '?label=' + encodeURIComponent(productId));
    return this.fetcher_.fetchCredentialedJson(url).then(json => {
      return json['offers'] || [];
    });
  }
}

const OFFERS_VIEW_CLOSABLE = true;
class OffersFlow {
  constructor(deps, options) {
    this.deps_ = deps;
    this.win_ = deps.win();
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
    let isClosable = options && options.isClosable;
    if (isClosable == undefined) {
      isClosable = false;
    }
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
                             true);
  }
  start() {
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_OFFERS);
    this.activityIframeView_.onCancel(() => {
      this.deps_.callbacks().triggerFlowCanceled(
          SubscriptionFlows.SHOW_OFFERS);
    });
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
                                  (result['sku']))
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
class SubscribeOptionFlow {
  constructor(deps, options) {
    this.deps_ = deps;
    this.options_ = options;
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
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
                             false);
  }
  start() {
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
class AbbrvOfferFlow {
  constructor(deps, options = {}) {
    this.deps_ = deps;
    this.options_ = options;
    this.win_ = deps.win();
    this.activityPorts_ = deps.activities();
    this.dialogManager_ = deps.dialogManager();
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
                             false);
  }
  start() {
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_ABBRV_OFFER);
    this.activityIframeView_.onCancel(() => {
      this.deps_.callbacks().triggerFlowCanceled(
          SubscriptionFlows.SHOW_ABBRV_OFFER);
    });
    this.activityIframeView_.onMessage(data => {
      if (data['alreadySubscribed']) {
        this.deps_.callbacks().triggerLoginRequest({
          linkRequested: !!data['linkRequested'],
        });
        return;
      }
    });
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
        this.dialogManager_.completeView(this.activityIframeView_);
        return;
      }
    });
    return this.dialogManager_.openView(this.activityIframeView_);
  }
}

class Preconnect {
  constructor(doc) {
    this.doc_ = doc;
  }
  preconnect(url) {
    this.pre_(url, 'preconnect');
  }
  dnsPrefetch(url) {
    this.pre_(url, 'dns-prefetch');
  }
  prefetch(url) {
    this.pre_(url, 'preconnect prefetch');
  }
  preload(url, as) {
    this.pre_(url, 'preconnect preload', as);
  }
  pre_(url, rel, opt_as) {
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

const PREFIX = 'subscribe.google.com';
class Storage {
  constructor(win) {
    this.win_ = win;
    this.values_ = {};
  }
  get(key) {
    if (!this.values_[key]) {
      this.values_[key] = new Promise(resolve => {
        if (this.win_.sessionStorage) {
          try {
            resolve(this.win_.sessionStorage.getItem(storageKey(key)));
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    }
    return this.values_[key];
  }
  set(key, value) {
    this.values_[key] = Promise.resolve(value);
    return new Promise(resolve => {
      if (this.win_.sessionStorage) {
        try {
          this.win_.sessionStorage.setItem(storageKey(key), value);
        } catch (e) {
        }
      }
      resolve();
    });
  }
  remove(key) {
    delete this.values_[key];
    return new Promise(resolve => {
      if (this.win_.sessionStorage) {
        try {
          this.win_.sessionStorage.removeItem(storageKey(key));
        } catch (e) {
        }
      }
      resolve();
    });
  }
}
function storageKey(key) {
  return PREFIX + ':' + key;
}

class ConfiguredRuntime {
  constructor(winOrDoc, pageConfig, opt_integr) {
    this.doc_ = resolveDoc(winOrDoc);
    this.win_ = this.doc_.getWin();
    this.config_ = defaultConfig();
    this.pageConfig_ = pageConfig;
    this.documentParsed_ = this.doc_.whenReady();
    this.fetcher_ = opt_integr && opt_integr.fetcher ||
        new XhrFetcher(this.win_);
    this.storage_ = new Storage(this.win_);
    this.dialogManager_ = new DialogManager(this.doc_);
    this.activityPorts_ = new activityPorts_1(this.win_);
    this.callbacks_ = new Callbacks();
    this.entitlementsManager_ = new EntitlementsManager(
        this.win_, this.pageConfig_, this.fetcher_, this);
    this.offersApi_ = new OffersApi(this.pageConfig_, this.fetcher_);
    this.buttonApi_ = new ButtonApi(this.doc_);
    const preconnect = new Preconnect(this.win_.document);
    LinkCompleteFlow.configurePending(this);
    PayCompleteFlow.configurePending(this);
    PayStartFlow.preconnect(preconnect);
    injectStyleSheet(this.win_.document, CSS);
  }
  doc() {
    return this.doc_;
  }
  win() {
    return this.win_;
  }
  pageConfig() {
    return this.pageConfig_;
  }
  activities() {
    return this.activityPorts_;
  }
  dialogManager() {
    return this.dialogManager_;
  }
  entitlementsManager() {
    return this.entitlementsManager_;
  }
  callbacks() {
    return this.callbacks_;
  }
  storage() {
    return this.storage_;
  }
  init() {
  }
  configure(config) {
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
    Object.assign(this.config_, config);
  }
  config() {
    return this.config_;
  }
  reset() {
    this.entitlementsManager_.reset();
    this.dialogManager_.completeAll();
  }
  start() {
    if (!this.pageConfig_.getProductId() || !this.pageConfig_.isLocked()) {
      return Promise.resolve();
    }
    this.getEntitlements();
  }
  getEntitlements() {
    return this.entitlementsManager_.getEntitlements()
        .then(entitlements => entitlements.clone());
  }
  setOnEntitlementsResponse(callback) {
    this.callbacks_.setOnEntitlementsResponse(callback);
  }
  getOffers(opt_options) {
    return this.offersApi_.getOffers(opt_options && opt_options.productId);
  }
  showOffers(opt_options) {
    return this.documentParsed_.then(() => {
      const flow = new OffersFlow(this, opt_options);
      return flow.start();
    });
  }
  showSubscribeOption(opt_options) {
    return this.documentParsed_.then(() => {
      const flow = new SubscribeOptionFlow(this, opt_options);
      return flow.start();
    });
  }
  showAbbrvOffer(opt_options) {
    return this.documentParsed_.then(() => {
      const flow = new AbbrvOfferFlow(this, opt_options);
      return flow.start();
    });
  }
  waitForSubscriptionLookup(accountPromise) {
    return this.documentParsed_.then(() => {
      const wait = new WaitForSubscriptionLookupApi(this, accountPromise);
      return wait.start();
    });
  }
  setOnLoginRequest(callback) {
    this.callbacks_.setOnLoginRequest(callback);
  }
  setOnLinkComplete(callback) {
    this.callbacks_.setOnLinkComplete(callback);
  }
  linkAccount() {
    return this.documentParsed_.then(() => {
      return new LinkbackFlow(this).start();
    });
  }
  saveSubscription(saveSubscriptionRequestCallback) {
    return this.documentParsed_.then(() => {
      return new LinkSaveFlow(this, saveSubscriptionRequestCallback).start();
    });
  }
  showLoginPrompt() {
    return this.documentParsed_.then(() => {
      return new LoginPromptApi(this).start();
    });
  }
  showLoginNotification() {
    return this.documentParsed_.then(() => {
      return new LoginNotificationApi(this).start();
    });
  }
  setOnNativeSubscribeRequest(callback) {
    this.callbacks_.setOnSubscribeRequest(callback);
  }
  setOnSubscribeResponse(callback) {
    this.callbacks_.setOnSubscribeResponse(callback);
  }
  subscribe(sku) {
    return this.documentParsed_.then(() => {
      return new PayStartFlow(this, sku).start();
    });
  }
  completeDeferredAccountCreation(opt_options) {
    return this.documentParsed_.then(() => {
      return new DeferredAccountFlow(this, opt_options || null).start();
    });
  }
  setOnFlowStarted(callback) {
    this.callbacks_.setOnFlowStarted(callback);
  }
  setOnFlowCanceled(callback) {
    this.callbacks_.setOnFlowCanceled(callback);
  }
  createButton(optionsOrCallback, opt_callback) {
    return this.buttonApi_.create(optionsOrCallback, opt_callback);
  }
  attachButton(button, optionsOrCallback, opt_callback) {
    this.buttonApi_.attach(button, optionsOrCallback, opt_callback);
  }
}

export {
  ConfiguredRuntime,
  Entitlements,
  Entitlement,
  Fetcher,
  SubscribeResponse,
};
