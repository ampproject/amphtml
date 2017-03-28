/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {APP, Messaging, MessageType, WindowPortEmulator} from '../messaging';
import {dev} from '../../../../src/log';


const CHANNEL_OPEN_MSG = 'channelOpen';

/**
 * @fileoverview This is an example of how the viewer host can be implemented
 * for communication with the AMP docs.
 */
export class AmpViewerHost {

  /**
   * @param {!Window} win
   * @param {!HTMLIFrameElement} ampIframe
   * @param {string} viewerOrigin
   * @param {boolean} startPolling
   */
  constructor(win, ampIframe, viewerOrigin, startPolling, opt_id) {
    /** @const {!Window} */
    this.win = win;
    /** @const {!HTMLIFrameElement} */
    this.ampIframe_ = ampIframe;

    /** @const {string} */
    this.id = opt_id;

    this.waitForHandshake_(viewerOrigin, startPolling);
  }

  /**
   * @param {string} viewerOrigin
   * @param {boolean} startPolling
   */
  waitForHandshake_(viewerOrigin, startPolling) {
    console.log('Viewer.awaitHandshake_');
    const viewerId = this.id;
    const target = this.ampIframe_.contentWindow;
    const listener = function(event) {
      if (event.origin == viewerOrigin &&
              this.isChannelOpen_(event.data) &&
              (!event.source || event.source == target)
              ) {
        console.log('Viewer ' + viewerId + ' messaging established with ',
            viewerOrigin);
        window.removeEventListener('message', listener, false);

        const message = {
          app: APP,
          requestid: event.data.requestid,
          data: {},
          type: MessageType.RESPONSE,
        };
        target./*OK*/postMessage(message, viewerOrigin);

        const port = new WindowPortEmulator(this.win, viewerOrigin);
        this.messaging_ = new Messaging(this.win, port);
        this.messaging_.setDefaultHandler(this.handleMessage_.bind(this));

        this.sendRequest_('visibilitychange', {
          state: this.visibilityState_,
          prerenderSize: this.prerenderSize,
        }, true);
      }
    }.bind(this);
    window.addEventListener('message', listener, false);
  }

  isChannelOpen_(eventData) {
    debugger;
    return eventData.app == APP && eventData.name == CHANNEL_OPEN_MSG;
  };

  sendRequest_(type, data, awaitResponse) {
    console.log('Viewer.sendRequest_');
    if (!this.messaging_) {
      return;
    }
    return this.messaging_.sendRequest(type, data, awaitResponse);
  };

  handleMessage_(type, data, awaitResponse) {
    console.log('Viewer.handleMessage_', type, data, awaitResponse);
    if (!this.messaging_) {
      return;
    }
    return this.messaging_.sendRequest(type, data, awaitResponse);
  };
}

self.AmpViewerHost = AmpViewerHost;
