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

import '../../../../third_party/babel/custom-babel-helpers';
import {initLogConstructor} from '../../../../src/log';
import {APP, Messaging, MessageType, WindowPortEmulator} from '../messaging';
import {listen} from '../../../../src/event-helper';

initLogConstructor();
const CHANNEL_OPEN_MSG = 'channelOpen';

/**
 * @fileoverview This is an example of how the viewer host can be implemented
 * for communication with the AMP docs.
 */
export class AmpViewerHost {

  /**
   * @param {!Window} win
   * @param {!HTMLIFrameElement} ampIframe
   * @param {string} frameOrigin
   * @param {function(string, *, boolean):(!Promise<*>|undefined)} messageHandler
   * @param {string=} opt_logsId For dev logs so you know what ampdoc you're
   * looking at.
   */
  constructor(win, ampIframe, frameOrigin, messageHandler, opt_logsId) {
    /** @const {!Window} */
    this.win = win;
    /** @private {!HTMLIFrameElement} */
    this.ampIframe_ = ampIframe;
    /** @private {function(string, *, boolean):(!Promise<*>|undefined)} */
    this.messageHandler_ = messageHandler;
    /** @const {string} */
    this.logsId = opt_logsId;

    this.waitForHandshake_(frameOrigin);
  }

  /**
   * @param {string} targetOrigin
   * @private
   */
  waitForHandshake_(targetOrigin) {
    this.log('awaitHandshake_');
    const target = this.ampIframe_.contentWindow;
    const listener = function(event) {
      if (event.origin == targetOrigin &&
              this.isChannelOpen_(event.data) &&
              (!event.source || event.source == target)) {
        this.log(' messaging established with ', targetOrigin);
        unlisten();
        const message = {
          app: APP,
          requestid: event.data.requestid,
          data: {},
          type: MessageType.RESPONSE,
        };
        target./*OK*/postMessage(message, targetOrigin);

        const port = new WindowPortEmulator(this.win, targetOrigin, target);
        this.messaging_ = new Messaging(this.win, port);
        this.messaging_.setDefaultHandler(this.messageHandler_);
        this.sendRequest('visibilitychange', {
          state: this.visibilityState_,
          prerenderSize: this.prerenderSize,
        }, true);
      }
    }.bind(this);
    const unlisten = listen(this.win, 'message', listener);
  }

  /**
   * @param {*} eventData
   * @return {boolean}
   * @private
   */
  isChannelOpen_(eventData) {
    return eventData.app == APP && eventData.name == CHANNEL_OPEN_MSG;
  };

  /**
   * @param {string} type
   * @param {*} data
   * @param {boolean} awaitResponse
   * @return {!Promise<*>|undefined}
   */
  sendRequest(type, data, awaitResponse) {
    this.log('sendRequest');
    if (!this.messaging_) {
      return;
    }
    return this.messaging_.sendRequest(type, data, awaitResponse);
  };

  log() {
    const var_args = Array.prototype.slice.call(arguments, 0);
    var_args.unshift('[ViewerHost ' + this.logsId + ']');
    console/*OK*/.log.apply(console, var_args);
  }
}

self.AmpViewerHost = AmpViewerHost;
