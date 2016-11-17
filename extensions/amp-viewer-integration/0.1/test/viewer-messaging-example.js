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


export class Viewer {
  constructor(container, id, url, visible) {
    this.id = id;
    this.url = url;
    this.alreadyLoaded_ = false;
    this.stackIndex_ = 0;
    this.viewportType_ = 'natural';
    this.visibilityState_ = visible ? 'visible' : 'hidden';
    this.prerenderSize_ = 1;
    this.csi_ = 1;

    this.isIos_ = /iPhone|iPad|iPod/i.test(window.navigator.userAgent);

    this.viewer = document.querySelector('viewer');
    this.container = container;
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('id', 'AMP_DOC_' + this.id);

    if (this.viewportType_ == 'natural' && !this.isIos_) {
      this.iframe.setAttribute('scrolling', 'yes');
    } else {
      this.iframe.setAttribute('scrolling', 'no');
    }

    /** @private @const {!Promise} */
    this.handshakeReceivedPromise_ = new Promise(resolve => {
      /** @private {?function()} */
      this.handshakeReceivedResolve_ = resolve;
    });

    /** @private @const {!Promise} */
    this.documentLoadedPromise_ = new Promise(resolve => {
      /** @private {?function()} */
      this.documentLoadedResolve_ = resolve;
    });
  }

  waitForHandshakeRequest() {
    const params = {
      history: 1,
      viewportType: this.viewportType_,
      width: this.container./*OK*/offsetWidth,
      height: this.container./*OK*/offsetHeight,
      visibilityState: this.visibilityState_,
      prerenderSize: this.prerenderSize_,
      viewerorigin: this.parseUrl_(window.location.href).origin,
      csi: this.csi_,
      cap: 'foo,a2a',
    };

    let inputUrl = this.url + '#' + this.paramsStr_(params);
    if (window.location.hash && window.location.hash.length > 1) {
      inputUrl += '&' + window.location.hash.substring(1);
    }
    const parsedUrl = this.parseUrl_(inputUrl);
    const url = parsedUrl.href;
    this.iframe.setAttribute('src', url);
    this.frameOrigin_ = parsedUrl.origin;
    this.iframe.style.display = 'none';

    window.addEventListener('message', e => {
      console.log('message received', e, e.data);
      // IMPORTANT: There could be many windows with the same origin!
      // IMPORTANT: Event.source might not be available in all browsers!?
      if (e.origin != this.frameOrigin_ ||
          e.source != this.iframe.contentWindow) {
        console.log('This message is not for us: ', e);
        return;
      }
      if (e.data == 'amp-handshake-request' &&
          this.handshakeReceivedResolve_) {
        // SEND CONFIRMATION!?
        console.log('handshake request received!');
        this.handshakeReceivedResolve_();
        this.handshakeReceivedResolve_ = null;
      }
      if (e.data.type == 'documentLoaded') {
        console.log('documentLoaded!');
        this.documentLoadedResolve_();
      }
    }, false);

    this.container.appendChild(this.iframe);

    return this.handshakeReceivedPromise_;
  }

  confirmHandshake() {
    this.iframe.contentWindow.postMessage(
      'amp-handshake-response', this.frameOrigin_);
  }

  waitForDocumentLoaded() {
    return this.documentLoadedPromise_;
  }

  sendRequest_(type, data, awaitResponse) {
    console.log('here @ Viewer.prototype.sendRequest_');
    if (!this.messaging_) {
      return;
    }
    return this.messaging_.sendRequest(type, data, awaitResponse);
  }

  parseUrl_(urlString) {
    const a = document.createElement('a');
    a.href = urlString;
    return {
      href: a.href,
      protocol: a.protocol,
      host: a.host,
      hostname: a.hostname,
      port: a.port == '0' ? '' : a.port,
      pathname: a.pathname,
      search: a.search,
      hash: a.hash,
      origin: a.protocol + '//' + a.host,
    };
  }

  documentReady_() {
    this.log('AMP document ready');
    return Promise.resolve();
  }

  log() {
    const var_args = Array.prototype.slice.call(arguments, 0);
    var_args.unshift('[VIEWER]');
    console/*OK*/.log.apply(console, var_args);
  }

  paramsStr_(params) {
    console.log('params: ',params);
    let s = '';
    for (const k in params) {
      const v = params[k];
      if (v === null || v === undefined) {
        continue;
      }
      if (s.length > 0) {
        s += '&';
      }
      s += encodeURIComponent(k) + '=' + encodeURIComponent(v);
    }
    console.log('s: ',s);
    return s;
  }
}
