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

import {Messaging, WindowPortEmulator} from './messaging.js';
import {viewerForDoc} from '../../../src/viewer';
import {listen, listenOnce} from '../../../src/event-helper';
import {dev} from '../../../src/log';

const TAG = 'amp-viewer-integration';
const APP = '__AMPHTML__';

/**
 * @enum {string}
 */
const RequestNames = {
  CHANNEL_OPEN: 'channelOpen',
  UNLOADED: 'unloaded',
};

/**
 * @fileoverview This is the communication protocol between AMP and the viewer.
 * This should be included in an AMP html file to communicate with the viewer.
 */
export class AmpViewerIntegration {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} win */
    this.win = win;

    /** @private {?string|undefined} */
    this.unconfirmedViewerOrigin_ = null;

    /** @private {boolean} */
    this.isWebView_;
  }

  /**
   * Initiate the handshake. If handshake confirmed, start listening for
   * messages. The service is disabled if the viewerorigin parameter is
   * absent.
   * @return {!Promise<undefined>}
   */
  init() {
    dev().fine(TAG, 'handshake init()');
    const viewer = viewerForDoc(this.win.document);
    this.isWebView_ = viewer.getParam('webview') == 1;
    this.isWebView_ = true; //delete this before submitting
    this.unconfirmedViewerOrigin_ = viewer.getParam('origin');

    const win = this.win;
    const unconfirmedViewerOrigin = this.unconfirmedViewerOrigin_;
    if (!this.isWebView_) {
      const port = new WindowPortEmulator();
      port.addEventListener = function(eventType, handler) {
        listen(win, 'message', e => {
          if (e.origin == unconfirmedViewerOrigin &&
              e.source == win.parent && e.data.app == APP) {
            handler(e);
          }
        });
      };
      port.postMessage = function(data) {
        win.parent./*OK*/postMessage(data, unconfirmedViewerOrigin);
      };
      return this.openChannelAndStart_(viewer, port);
    }

    // port/webview case
    return this.webviewPreHandshakePromise_().then(receivedPort => {
      const port = new WindowPortEmulator();
      port.addEventListener = function(eventType, handler) {
        receivedPort.onmessage = handler;
      };
      port.postMessage = function(data) {
        receivedPort./*OK*/postMessage(data);
      };
      return this.openChannelAndStart_(viewer, port);
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  webviewPreHandshakePromise_() {
    return new Promise(resolve => {
      this.win.addEventListener('message', e => {
        console.log('+++++++ampdoc got a message:', e.type, e.data);
        // Viewer says: "I'm ready for you"
        if (
          // e.origin === '' && !e.source && //commenting out for now but need to uncomment before submit
            e.data.app == APP &&
            e.data.name == 'handshake-poll' &&
            e.ports && e.ports.length == 1) {
          resolve(e.ports[0]);
        }
      });
    });
  }

  /**
   * @param {!../../../src/service/viewer-impl.Viewer} viewer
   * @param {!WindowPortEmulator} pipe
   * @return {!Promise<undefined>}
   * @private
   */
  openChannelAndStart_(viewer, pipe) {
    const messaging = new Messaging(pipe, this.win);
    dev().fine(TAG, 'Send a handshake request');
    return messaging.sendRequest(RequestNames.CHANNEL_OPEN, {}, true)
        .then(() => {
          console.log('@@@@@@@@@@@ channel opened! @@@@@@@@@@@@@');
          dev().fine(TAG, 'Channel has been opened!');
          this.setup_(messaging, viewer);
        });
  }

  /**
   * @param {!Messaging} messaging
   * @param {!../../../src/service/viewer-impl.Viewer} viewer
   * @return {Promise<*>|undefined}
   * @private
   */
  setup_(messaging, viewer) {
    messaging.setRequestProcessor((type, payload, awaitResponse) => {
      return viewer.receiveMessage(
        type, /** @type {!JSONType} */ (payload), awaitResponse);
    });

    viewer.setMessageDeliverer(messaging.sendRequest.bind(messaging),
      dev().assertString(this.unconfirmedViewerOrigin_));

    listenOnce(
      this.win, 'unload', this.handleUnload_.bind(this, messaging));
  }

  /**
   * Notifies the viewer when this document is unloaded.
   * @param {!Messaging} messaging
   * @return {Promise<*>|undefined}
   * @private
   */
  handleUnload_(messaging) {
    return messaging.sendRequest(RequestNames.UNLOADED, {}, true);
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  new AmpViewerIntegration(AMP.win).init();
});
