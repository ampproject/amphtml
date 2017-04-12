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

/**
 * @fileoverview This is a Viewer file that communicates with ampdocs. It is
 * used for testing of the ampdoc-viewer messaging protocol for the
 * amp-viewer-integration extension.
 */
export class ViewerForTesting {
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

    /** @type {Element} */
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('id', 'AMP_DOC_' + id);

    const isIos_ = /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
    if (this.viewportType_ == 'natural' && !isIos_) {
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

  /**
   * I'm waiting for the ampdoc to request for us to shake hands.
   * @return {!Promise}
   */
  waitForHandshakeRequest() {
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
    };

    let ampdocUrl = this.ampdocUrl + '#' + serializeQueryString(params);

    if (window.location.hash && window.location.hash.length > 1) {
      ampdocUrl += '&' + window.location.hash.substring(1);
    }
    const parsedUrl = parseUrl(ampdocUrl);
    const url = parsedUrl.href;
    this.iframe.setAttribute('src', url);
    this.frameOrigin_ = parsedUrl.origin;
    this.iframe.style.display = 'none';

    // Listening for messages, hoping that I get a request for a handshake and
    // a notification that a document was loaded.
    window.addEventListener('message', e => {
      this.log('message received', e, e.data);
      const target = this.iframe.contentWindow;
      const targetOrigin = this.frameOrigin_;
      // IMPORTANT: There could be many windows with the same origin!
      // IMPORTANT: Event.source might not be available in all browsers!?
      if (e.origin != targetOrigin ||
          e.source != target ||
          e.data.app != APP) {
        this.log('This message is not for us: ', e);
        return;
      }
      if (e.data.name == 'channelOpen' &&
          this.handshakeReceivedResolve_) {
        // Send handshake confirmation.
        const message = {
          app: APP,
          requestid: event.data.requestid,
          data: {},
          type: 's',
        };
        target./*OK*/postMessage(message, targetOrigin);

        this.log('handshake request received!');
        this.handshakeReceivedResolve_();
        this.handshakeReceivedResolve_ = null;
      }
      if (e.data.name == 'documentLoaded') {
        this.log('documentLoaded!');
        this.documentLoadedResolve_();
      }
    }, false);

    this.containerEl.appendChild(this.iframe);

    return this.handshakeReceivedPromise_;
  }

  /**
   * Letting the ampdoc know that I received the handshake request and all is
   * well.
   */
  confirmHandshake() {
    this.iframe.contentWindow./*OK*/postMessage(
      'amp-handshake-response', this.frameOrigin_);
  }

  /**
   * This is used in test-amp-viewer-integration to test the handshake and make
   * sure the test waits for everything to get executed.
   */
  waitForDocumentLoaded() {
    return this.documentLoadedPromise_;
  }

  /**
   * This is only used for a unit test.
   */
  hasCapability() {
    return false;
  }

  /**
   * This is only used for a unit test.
   */
  setMessageDeliverer() {
  }

  log() {
    const var_args = Array.prototype.slice.call(arguments, 0);
    var_args.unshift('[VIEWER]');
    console/*OK*/.log.apply(console, var_args);
  }
}
