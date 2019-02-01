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

import {AmpViewerIntegrationVariableService} from './variable-service';
import {FocusHandler} from './focus-handler';
import {
  HighlightHandler,
  HighlightInfoDef,
  getHighlightParam,
} from './highlight-handler';
import {KeyboardHandler} from './keyboard-handler';
import {
  Messaging,
  WindowPortEmulator,
  parseMessage,
} from './messaging/messaging';
import {Services} from '../../../src/services';
import {TouchHandler} from './touch-handler';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  getAmpdoc,
  registerServiceBuilder,
} from '../../../src/service';
import {getData, listen, listenOnce} from '../../../src/event-helper';
import {getSourceUrl} from '../../../src/url';
import {isIframed} from '../../../src/dom';

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

    /**
     * @private {?HighlightHandler}
     */
    this.highlightHandler_ = null;

    /** @const @private {!AmpViewerIntegrationVariableService} */
    this.variableService_ = new AmpViewerIntegrationVariableService(
        getAmpdoc(this.win.document));
    registerServiceBuilder(this.win, 'viewer-integration-variable',
        () => this.variableService_.get());
  }

  /**
   * Initiate the handshake. If handshake confirmed, start listening for
   * messages. The service is disabled if the viewerorigin parameter is
   * absent.
   * @return {!Promise<undefined>}
   */
  init() {
    dev().fine(TAG, 'handshake init()');
    const ampdoc = getAmpdoc(this.win.document);
    const viewer = Services.viewerForDoc(ampdoc);
    this.isWebView_ = viewer.getParam('webview') == '1';
    this.isHandShakePoll_ = viewer.hasCapability('handshakepoll');
    const messagingToken = viewer.getParam('messagingToken');
    const origin = viewer.getParam('origin') || '';

    if (!this.isWebView_ && !origin) {
      return Promise.resolve();
    }

    if (this.isWebView_ || this.isHandShakePoll_) {
      const source = isIframed(this.win) ? this.win.parent : null;
      return this.webviewPreHandshakePromise_(source, origin)
          .then(receivedPort => {
            return this.openChannelAndStart_(viewer, ampdoc, origin,
                new Messaging(
                    this.win, receivedPort, this.isWebView_, messagingToken));
          });
    }
    /** @type {?HighlightInfoDef} */
    const highlightInfo = getHighlightParam(ampdoc);
    if (highlightInfo) {
      this.highlightHandler_ = new HighlightHandler(ampdoc, highlightInfo);
    }

    const port = new WindowPortEmulator(
        this.win, origin, this.win.parent/* target */);
    return this.openChannelAndStart_(
        viewer, ampdoc, origin,
        new Messaging(this.win, port, this.isWebView_, messagingToken));
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
        dev().fine(TAG, 'AMPDOC got a pre-handshake message:', e.type,
            getData(e));
        const data = parseMessage(getData(e));
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
    return messaging.sendRequest(RequestNames.CHANNEL_OPEN, dict({
      'url': ampdocUrl,
      'sourceUrl': srcUrl,
    }),
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
          type, /** @type {!JsonObject} */ (payload), awaitResponse);
    });

    viewer.setMessageDeliverer(messaging.sendRequest.bind(messaging), origin);

    listenOnce(
        this.win, 'unload', this.handleUnload_.bind(this, messaging));

    if (viewer.hasCapability('swipe')) {
      this.initTouchHandler_(messaging);
    }
    if (viewer.hasCapability('keyboard')) {
      this.initKeyboardHandler_(messaging);
    }
    if (viewer.hasCapability('focus-rect')) {
      this.initFocusHandler_(messaging);
    }
    if (this.highlightHandler_ != null) {
      this.highlightHandler_.setupMessaging(messaging);
    }
  }

  /**
   * Notifies the viewer when this document is unloaded.
   * @param {!Messaging} messaging
   * @return {Promise<*>|undefined}
   * @private
   */
  handleUnload_(messaging) {
    return messaging.sendRequest(RequestNames.UNLOADED, dict(), true);
  }

  /**
   * @param {!Messaging} messaging
   * @private
   */
  initFocusHandler_(messaging) {
    new FocusHandler(this.win, messaging);
  }

  /**
   * @param {!Messaging} messaging
   * @private
   */
  initTouchHandler_(messaging) {
    new TouchHandler(this.win, messaging);
  }

  /**
   * @param {!Messaging} messaging
   * @private
   */
  initKeyboardHandler_(messaging) {
    new KeyboardHandler(this.win, messaging);
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  new AmpViewerIntegration(AMP.win).init();
});
