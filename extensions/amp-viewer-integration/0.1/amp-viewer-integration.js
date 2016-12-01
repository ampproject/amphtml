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

import {Messaging} from './messaging.js';
import {listen} from '../../../src/event-helper';
import {viewerForDoc} from '../../../src/viewer';
import {dev,user} from '../../../src/log';


/**
 * @fileoverview This is the communication protocol between AMP and the viewer.
 * This should be included in an AMP html file to communicate with the viewer.
 */
export class AmpViewerIntegration {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const @private {!Window} win */
    this.win_ = win;
  }

  /**
   * Initiate the handshake. If handshake confirmed, start listening for
   * messages.
   * @return {!Promise|undefined}
   */
  init() {
    const isIframed = window.parent && window.parent != window;
    if (!isIframed) {
      return;
    }
    dev().info('AVI', 'amp-viewer-integration.js => handshake init()');
    const viewer = viewerForDoc(this.win_.document);
    return this.getHandshakePromise_(viewer)
      .then(viewerOrigin => {
        dev().info('AVI',
          'amp-viewer-integration.js => listening for messages');
        const messaging_ =
          new Messaging(this.win_, this.win_.parent, viewerOrigin,
            (type, payload, awaitResponse) => {
              return viewer.receiveMessage(
                type, /** @type {!JSONType} */ (payload), awaitResponse);
            });
        viewer.setMessageDeliverer((type, payload, awaitResponse) => {
          return messaging_.sendRequest(type, payload, awaitResponse);
        }, viewerOrigin);
      });
  }

  /**
   * Send a handshake request, and listen for a handshake response to
   * confirm the handshake.
   * @param {!../../../src/service/viewer-impl.Viewer} viewer
   * @return {!Promise}
   * @private
   */
  getHandshakePromise_(viewer) {
    const win = this.win_;

    return new Promise(resolve => {
      const unconfirmedViewerOrigin = viewer.getParam('viewerorigin');
      user().assert(unconfirmedViewerOrigin,
              'Expected viewer origin must be specified!');

      const unlisten = listen(win, 'message', listener);
      function listener(event) {
        if (event.origin == unconfirmedViewerOrigin &&
            event.data == 'amp-handshake-response' &&
            event.source == win.parent) {
          dev().info('AVI', 'amp-viewer-integration.js => received handshake ' +
            'confirmation');
          unlisten();
          resolve(event.origin);
        }
      };

      // Confirmed origin will come in the response.
      win.parent./*OK*/postMessage('amp-handshake-request',
          unconfirmedViewerOrigin);
    });
  }
}

AMP.extension('amp-viewer-integration', '0.1', function() {
  new AmpViewerIntegration(AMP.win).init();
});
