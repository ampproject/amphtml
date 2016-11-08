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
import {listen, unlisten} from '../../../src/event-helper';
import {viewerPromiseForDoc} from '../../../src/viewer';


class AmpViewerIntegration {

  /**
   * @param {!Window} win
   * @constructor
   */
  constructor(win) {
    /** @const @private {!Window} win */
    this.win_ = win;
    /** @const @private {string} */
    this.handshakeRequest_ = 'amp-handshake-request';
    /** @const @private {string} */
    this.handshakeResponse_ = 'amp-handshake-response';
    /** @const @private {string} */
    this.eventTypeMessage_ = 'message';
  }

  init() {
    let viewer;
    this.getViewer()
    .then(viewerParam => {
      viewer = viewerParam;
      return this.getHandshakePromise(viewer);
    })
    .then(viewerOrigin => {
      const messaging = new Messaging(this.win_.parent, viewerOrigin,
          function(type, payload, awaitResponse) {
            return viewer.receiveMessage(type, payload, awaitResponse);
          }, this.win_.location.href);
      viewer.setMessageDeliverer(function(type, payload, awaitResponse) {
        return messaging.sendRequest(type, payload, awaitResponse);
      }, viewerOrigin);
    });
  }

  /**
   * @return {!Promise<!./service/viewer-impl.Viewer>}
   */
  getViewer() {
    return viewerPromiseForDoc(this.win_.document);
  }

  /**
   * @param {!./service/viewer-impl.Viewer} viewer
   */
  getHandshakePromise(viewer) {
    const win = this.win_;

    return new Promise(function(resolve) {
      const unconfirmedViewerOrigin = viewer.getParam('viewerorigin');
      if (!unconfirmedViewerOrigin) {
        throw new Error('Expected viewer origin must be specified!');
      }

      const listener = function(event) {
        if (event.origin == unconfirmedViewerOrigin &&
                event.data == 'amp-handshake-response' &&
                (!event.source || event.source == win.parent)) {
          unlisten(win, 'message', listener);
          resolve(event.origin);
        }
      };

      listen(win, 'message', listener);

      win.parent./*OK*/postMessage('amp-handshake-request',
          unconfirmedViewerOrigin);
    });
  }
}

new AmpViewerIntegration(AMP.win).init();
