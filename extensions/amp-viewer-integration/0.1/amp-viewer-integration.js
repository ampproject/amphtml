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
import {dev} from '../../../src/log';

const TAG = 'amp-viewer-integration';

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
  }

  /**
   * Initiate the handshake. If handshake confirmed, start listening for
   * messages.
   * @return {!Promise}
   */
  init() {
    dev().info(TAG, 'handshake init()');
    const viewer = viewerForDoc(this.win.document);
    return this.getHandshakePromise_(viewer)
      .then(viewerOrigin => {
        dev().info(TAG, 'listening for messages');
        const messaging =
          new Messaging(this.win, this.win.parent, viewerOrigin,
            (type, payload, awaitResponse) => {
              return viewer.receiveMessage(
                type, /** @type {!JSONType} */ (payload), awaitResponse);
            });
        viewer.setMessageDeliverer(messaging.sendRequest.bind(messaging),
          viewerOrigin);
      });
  }

  /**
   * Send a handshake request, and listen for a handshake response to
   * confirm the handshake.
   * @param {!../../../src/service/viewer-impl.Viewer} viewer
   * @return {?Promise}
   * @private
   */
  getHandshakePromise_(viewer) {
    const win = this.win;
    return new Promise(resolve => {
      const unconfirmedViewerOrigin = viewer.getParam('viewerorigin');
      if (!unconfirmedViewerOrigin) {
        dev().info(TAG, 'Viewer origin not specified.');
        return null;
      }

      const unlisten = listen(win, 'message', event => {
        if (event.origin == unconfirmedViewerOrigin &&
            event.data == 'amp-handshake-response' &&
            event.source == win.parent) {
          dev().info(TAG, 'received handshake confirmation');
          // TODO: Viewer may immediately start sending messages after issuing
          // handshake response, but we will miss these messages in the time
          // between unlisten and the next listen later.
          unlisten();
          resolve(event.origin);
        }
      });

      // Confirmed origin will come in the response.
      win.parent./*OK*/postMessage('amp-handshake-request',
          unconfirmedViewerOrigin);
    });
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  new AmpViewerIntegration(AMP.win).init();
});
