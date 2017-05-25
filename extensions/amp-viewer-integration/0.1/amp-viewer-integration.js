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

import {Messaging, WindowPortEmulator, parseMessage} from 'messaging';
import {TouchHandler} from './touch-handler';
import {getAmpDoc} from '../../../src/ampdoc';
import {isIframed} from '../../../src/dom';
import {listen, listenOnce} from '../../../src/event-helper';
import {dev} from '../../../src/log';
import {getSourceUrl} from '../../../src/url';
import {viewerForDoc} from '../../../src/services';

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

    /** @private {boolean} */
    this.isWebView_ = false;

    /** @private {boolean} */
    this.isHandShakePoll_ = false;
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
    this.isWebView_ = viewer.getParam('webview') == '1';
    this.isHandShakePoll_ = viewer.hasCapability('handshakepoll');
    const origin = viewer.getParam('origin') || '';

    if (!this.isWebView_ && !origin) {
      return Promise.resolve();
    }

    const ampdoc = getAmpDoc(this.win.document);

    if (this.isWebView_ || this.isHandShakePoll_) {
      const source = isIframed(this.win) ? this.win.parent : null;
      return this.webviewPreHandshakePromise_(source, origin)
          .then(receivedPort => {
            return this.openChannelAndStart_(viewer, ampdoc, origin,
              new Messaging(this.win, receivedPort, this.isWebView_));
          });
    }

    const port = new WindowPortEmulator(
      this.win, origin, this.win.parent/* target */);
    return this.openChannelAndStart_(
      viewer, ampdoc, origin, new Messaging(this.win, port, this.isWebView_));
  }

  /**
   * @param {?Window} source
   * @param {string} origin
   * @return {!Promise}
   * @private
   */
  webviewPreHandshakePromise_(source, origin) {
    return new Promise(resolve => {
      const unlisten = listen(this.win, 'message', e => {
        dev().fine(TAG, 'AMPDOC got a pre-handshake message:', e.type, e.data);
        const data = parseMessage(e.data);
        if (!data) {
          return;
        }
        // Viewer says: "I'm ready for you"
        if (
            e.origin === origin &&
            e.source === source &&
            data.app == APP &&
            data.name == 'handshake-poll') {
          if (this.isWebView_ && (!e.ports || !e.ports.length)) {
            throw new Error(
              'Did not receive communication port from the Viewer!');
          }
          const port = e.ports && e.ports.length > 0 ? e.ports[0] :
            new WindowPortEmulator(this.win, origin, this.win.parent);
          resolve(port);
          unlisten();
        }
      });
    });
  }

  /**
   * @param {!../../../src/service/viewer-impl.Viewer} viewer
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} origin
   * @param {!Messaging} messaging
   * @return {!Promise<undefined>}
   * @private
   */
  openChannelAndStart_(viewer, ampdoc, origin, messaging) {
    dev().fine(TAG, 'Send a handshake request');
    const ampdocUrl = ampdoc.getUrl();
    const srcUrl = getSourceUrl(ampdocUrl);
    return messaging.sendRequest(RequestNames.CHANNEL_OPEN, {
      url: ampdocUrl,
      sourceUrl: srcUrl,
    },
    true /* awaitResponse */)
      .then(() => {
        dev().fine(TAG, 'Channel has been opened!');
        this.setup_(messaging, viewer, origin);
      });
  }

  /**
   * @param {!Messaging} messaging
   * @param {!../../../src/service/viewer-impl.Viewer} viewer
   * @param {string} origin
   * @return {Promise<*>|undefined}
   * @private
   */
  setup_(messaging, viewer, origin) {
    messaging.setDefaultHandler((type, payload, awaitResponse) => {
      return viewer.receiveMessage(
        type, /** @type {!JSONType} */ (payload), awaitResponse);
    });

    viewer.setMessageDeliverer(messaging.sendRequest.bind(messaging), origin);

    listenOnce(
      this.win, 'unload', this.handleUnload_.bind(this, messaging));

    if (viewer.hasCapability('swipe')) {
      this.initTouchHandler_(messaging);
    }
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

  /**
   * @param {!Messaging} messaging
   * @private
   */
  initTouchHandler_(messaging) {
    new TouchHandler(this.win, messaging);
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  new AmpViewerIntegration(AMP.win).init();
});
