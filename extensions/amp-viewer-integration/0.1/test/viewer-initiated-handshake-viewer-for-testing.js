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
      cap: 'foo,a2a,handshakepoll',
    };

    let ampdocUrl = this.ampdocUrl + '#' + serializeQueryString(params);

    if (window.location.hash && window.location.hash.length > 1) {
      ampdocUrl += '&' + window.location.hash.substring(1);
    }
    const parsedUrl = parseUrl(ampdocUrl);
    const url = parsedUrl.href;
    this.iframe.setAttribute('src', url);
    this.frameOrigin_ = parsedUrl.origin;

    this.pollingIntervalIds_[this.intervalCtr] =
        setInterval(this.pollAMPDoc_.bind(this, this.intervalCtr) , 1000);

    this.intervalCtr++;

    this.containerEl.appendChild(this.iframe);

    return this.handshakeReceivedPromise_;
  }

  pollAMPDoc_(intervalCtr) {
    this.log('pollAMPDoc_');
    if (!this.iframe) {
      return;
    }
    const listener = function(e) {
      if (this.isChannelOpen_(e)) {
        //stop polling
        window.clearInterval(this.pollingIntervalIds_[intervalCtr]);
        window.removeEventListener('message', listener, false);
        this.completeHandshake_(e.data.requestid);
      }
    };
    window.addEventListener('message', listener.bind(this));

    const message = {
      app: APP,
      name: 'handshake-poll',
    };
    this.iframe.contentWindow./*OK*/postMessage(message, this.frameOrigin_);
  }

  isChannelOpen_(e) {
    return e.type == 'message' && e.data.app == APP &&
      e.data.name == 'channelOpen';
  }

  completeHandshake_(requestId) {
    this.log('Viewer ' + this.id + ' messaging established!');
    const message = {
      app: APP,
      requestid: requestId,
      type: MessageType.RESPONSE,
    };

    this.log('############## viewer posting1 Message', message);

    this.iframe.contentWindow./*OK*/postMessage(message, this.frameOrigin_);

    this.sendRequest_('visibilitychange', {
      state: this.visibilityState_,
      prerenderSize: this.prerenderSize,
    });

    this.handshakeResponseResolve_();
  }

  sendRequest_(eventType, payload) {
    const requestId = ++this.requestIdCounter_;
    const message = {
      app: APP,
      requestid: requestId,
      rsvp: true,
      name: eventType,
      data: payload,
      type: MessageType.REQUEST,
    };
    this.iframe.contentWindow./*OK*/postMessage(message, this.frameOrigin_);
  }

  processRequest_(eventData) {
    const data = eventData;
    switch (data.name) {
      case 'documentLoaded':
      case 'requestFullOverlay':
      case 'cancelFullOverlay':
      case 'pushHistory':
      case 'popHistory':
      case 'broadcast':
      case 'setFlushParams':
      case 'prerenderComplete':
      case 'documentHeight':
      case 'tick':
      case 'sendCsi':
      case 'scroll':
      case 'a2aNavigate':
      case 'unloaded':
      case 'visibilitychange':
        return;
      default:
        return Promise.reject('request not supported: ' + data.name);
    }
  }

  log() {
    const var_args = Array.prototype.slice.call(arguments, 0);
    console/*OK*/.log.apply(console, var_args);
  }
}
