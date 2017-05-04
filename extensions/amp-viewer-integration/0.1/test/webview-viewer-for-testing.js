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

import {parseUrl, serializeQueryString} from '../../../../src/url';
import {Messaging} from '../messaging';

const APP = '__AMPHTML__';
const MessageType = {
  REQUEST: 'q',
  RESPONSE: 's',
};

/**
 * @fileoverview This is a Viewer file that communicates with ampdocs. It is
 * used for testing of the ampdoc-viewer messaging protocol for the
 * amp-viewer-integration extension.
 */
export class WebviewViewerForTesting {
  /**
   * @param {Element} containerEl
   * @param {string} id
   * @param {string} ampdocUrl
   * @param {boolean} visible
   */
  constructor(containerEl, id, ampdocUrl, visible) {
    /** @type {string} */
    this.ampdocUrl = ampdocUrl;

    /** @private {boolean} */
    this.alreadyLoaded_ = false;

    /** @private {string} */
    this.viewportType_ = 'natural';

    /** @private {string} */
    this.visibilityState_ = visible ? 'visible' : 'hidden';

    /** @type {Element} */
    this.containerEl = containerEl;

    /** @type {Window} */
    this.win = window;

    this.messageHandlers_ = [];

    /** @type {Element} */
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('id', 'AMP_DOC_' + id);

    const isIos_ = /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
    if (this.viewportType_ == 'natural' && !isIos_) {
      this.iframe.setAttribute('scrolling', 'yes');
    } else {
      this.iframe.setAttribute('scrolling', 'no');
    }

    this.pollingIntervalIds_ = [];
    this.intervalCtr = 0;

    /** @private @const {!Promise} */
    this.handshakeReceivedPromise_ = new Promise(resolve => {
      /** @private {?function()} */
      this.handshakeResponseResolve_ = resolve;
    });

    /** @private @const {!Promise} */
    this.documentLoadedPromise_ = new Promise(resolve => {
      /** @private {?function()} */
      this.documentLoadedResolve_ = resolve;
    });
  }

  /**
   * I'm waiting for the ampdoc to respond to my offer to shake hands.
   * @return {!Promise}
   */
  waitForHandshakeResponse() {
    const params = {
      history: 1,
      viewportType: this.viewportType_,
      width: this.containerEl./*OK*/offsetWidth,
      height: this.containerEl./*OK*/offsetHeight,
      visibilityState: this.visibilityState_,
      prerenderSize: 1,
      origin: parseUrl(window.location.href).origin,
      csi: 1,
      cap: 'foo,a2a',
      webview: 1,
    };

    let ampdocUrl = this.ampdocUrl + '#' + serializeQueryString(params);

    if (window.location.hash && window.location.hash.length > 1) {
      ampdocUrl += '&' + window.location.hash.substring(1);
    }
    const parsedUrl = parseUrl(ampdocUrl);
    const url = parsedUrl.href;
    this.iframe.setAttribute('src', url);

    this.pollingIntervalIds_[this.intervalCtr] =
        setInterval(this.pollAMPDoc_.bind(this, this.intervalCtr) , 1000);
    this.intervalCtr++;

    this.containerEl.appendChild(this.iframe);

    return this.handshakeReceivedPromise_;
  }

  pollAMPDoc_(intervalCtr) {
    this.log('pollAMPDoc_');
    if (this.iframe) {
      const channel = new MessageChannel();
      const message = {
        app: APP,
        name: 'handshake-poll',
      };
      this.iframe.contentWindow./*OK*/postMessage(
          JSON.stringify(message), '*', [channel.port2]);
      channel.port1.onmessage = function(e) {
        if (this.isChannelOpen_(e)) {
          window.clearInterval(this.pollingIntervalIds_[intervalCtr]);
          const data = JSON.parse(e.data);
          this.completeHandshake_(channel, data.requestid);
        } else {
          this.handleMessage_(e);
        }
      }.bind(this);
    }
  }

  isChannelOpen_(e) {
    const data = JSON.parse(e.data);
    return e.type == 'message' && data.app == APP &&
      data.name == 'channelOpen';
  };


  completeHandshake_(channel, requestId) {
    this.log('Viewer ' + this.id + ' messaging established!');
    const message = {
      app: APP,
      requestid: requestId,
      type: MessageType.RESPONSE,
    };
    this.log('############## viewer posting1 Message', message);
    channel.port1./*OK*/postMessage(JSON.stringify(message));

    class WindowPortEmulator {
      constructor(messageHandlers, id, log) {
        this.messageHandlers_ = messageHandlers;
        this.id_ = id;
        this.log_ = log;
      }
      addEventListener(messageType, messageHandler) {
        this.log_('messageHandler', messageHandler);
        this.messageHandlers_[this.id_] = messageHandler;
      }
      postMessage(data) {
        this.log_('############## viewer posting2 Message', data);
        channel.port1./*OK*/postMessage(JSON.stringify(data));
      }
      start() {}
    }
    this.messaging_ = new Messaging(this.win,
      new WindowPortEmulator(this.messageHandlers_, this.id, this.log));

    this.messaging_.setDefaultHandler((type, payload, awaitResponse) => {
      console/*OK*/.log(
        'viewer receiving message: ', type, payload, awaitResponse);
      return Promise.resolve();
    });

    this.sendRequest_('visibilitychange', {
      state: this.visibilityState_,
      prerenderSize: this.prerenderSize,
    }, true);

    this.handshakeResponseResolve_();
  };

  sendRequest_(type, data, awaitResponse) {
    this.log('Viewer.prototype.sendRequest_');
    if (!this.messaging_) {
      return;
    }
    return this.messaging_.sendRequest(type, data, awaitResponse);
  };

  handleMessage_(e) {
    if (this.messageHandlers_[this.id]) {
      this.messageHandlers_[this.id](e);
    }

    this.log('************** viewer got a message,', e.data);
    this.processRequest_(e.data);
  };

  /**
   * This is used in test-amp-viewer-integration to test the handshake and make
   * sure the test waits for everything to get executed.
   */
  waitForDocumentLoaded() {
    return this.documentLoadedPromise_;
  }

  processRequest_(eventData) {
    const data = JSON.parse(eventData);
    switch (data.name) {
      case 'documentLoaded':
        this.log('documentLoaded!');
        this.documentLoadedResolve_();
      case 'requestFullOverlay':
      case 'cancelFullOverlay':
      case 'pushHistory':
      case 'popHistory':
      case 'broadcast':
      case 'setFlushParams':
      case 'prerenderComplete':
      case 'tick':
      case 'sendCsi':
      case 'scroll':
      case 'a2a':
      case 'unloaded':
      case 'visibilitychange':
        return;
      default:
        return Promise.reject('request not supported: ' + data.name);
    }
  };

  log() {
    const var_args = Array.prototype.slice.call(arguments, 0);
    console/*OK*/.log.apply(console, var_args);
  }
}
