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
import {viewerForDoc} from '../../../src/viewer';
import {listenOnce} from '../../../src/event-helper';
import {dev} from '../../../src/log';

const TAG = 'amp-viewer-integration';

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
  }

  /**
   * Initiate the handshake. If handshake confirmed, start listening for
   * messages. The service is disabled if the viewerorigin parameter is
   * absent.
   * @return {?Promise}
   */
  init() {
    dev().fine(TAG, 'handshake init()');
    const viewer = viewerForDoc(this.win.document);
    this.unconfirmedViewerOrigin_ = viewer.getParam('origin');
    if (!this.unconfirmedViewerOrigin_) {
      dev().fine(TAG, 'Viewer origin not specified.');
      return null;
    }

    dev().fine(TAG, 'listening for messages', this.unconfirmedViewerOrigin_);
    const messaging = new Messaging(
      this.win, this.win.parent, this.unconfirmedViewerOrigin_);

    dev().fine(TAG, 'Send a handshake request');
    return this.openChannel(messaging)
        .then(() => {
          dev().fine(TAG, 'Channel has been opened!');

          messaging.setRequestProcessor((type, payload, awaitResponse) => {
            return viewer.receiveMessage(
              type, /** @type {!JSONType} */ (payload), awaitResponse);
          });

          viewer.setMessageDeliverer(messaging.sendRequest.bind(messaging),
            dev().assertString(this.unconfirmedViewerOrigin_));

          listenOnce(
            this.win, 'unload', this.handleUnload_.bind(this, messaging));
        });
  }

  /**
   * Opens the channel to initiate the handshake.
   * @param {!Messaging} messaging
   * @return {Promise<*>|undefined}
   */
  openChannel(messaging) {
    return messaging.sendRequest(RequestNames.CHANNEL_OPEN, {}, true);
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
