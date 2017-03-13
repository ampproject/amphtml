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
  constructor(win, ampIframe, viewerOrigin, startPolling) {
    /** @const {!Window} win */
    this.win = win;
    /** @const {!HTMLIFrameElement} */
    this.ampIframe_ = ampIframe;

    this.waitForHandshake_(viewerOrigin, startPolling);
  }

  /**
   * @param {string} viewerOrigin
   * @param {boolean} startPolling
   * @return {!Promise}
   */
  waitForHandshake_(viewerOrigin, startPolling) {
    // const messaging = new Messaging(null, null, '');
    console.log('Viewer.prototype.awaitHandshake_');
    const targetId = this.ampIframe_.id;
    const target = this.ampIframe_.contentWindow;
    const targetOrigin = this.frameOrigin_;
    const listener = function(event) {
      if (event.origin == targetOrigin &&
              this.isChannelOpen_(event.data) &&
              (!event.source || event.source == target)) {
        console.log('event: ',event);
        console.log('Viewer ' + this.id + ' messaging established with ',
            targetOrigin);
        window.removeEventListener('message', listener, false);

        const message = {
          app: APP,
          requestid: event.data.requestid,
          data: {},
          type: MessageType.RESPONSE,
        };
        target./*OK*/postMessage(message, targetOrigin);

        const port = new WindowPortEmulator(
          this.win, dev().assertString(viewerOrigin));
        this.messaging_ = new Messaging(this.win, port);

        this.sendRequest_('visibilitychange', {
          state: this.visibilityState_,
          prerenderSize: this.prerenderSize,
        }, true);
      }
    }.bind(this);
    window.addEventListener('message', listener, false);

    return new Promise().resolve(startPolling);
  }

  isChannelOpen_(eventData) {
    return eventData.app == APP && eventData.name == 'channelOpen';
  };
}

self.AmpViewerHost = AmpViewerHost;
