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

import {Messaging} from '../messaging/messaging';

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
   * @param {boolean=} opt_isWebview Should viewer initiate handshake w/ polling
   * @param {boolean=} opt_isHandshakePoll
   * looking at.
   */
  constructor(
    win,
    ampIframe,
    frameOrigin,
    messageHandler,
    opt_logsId,
    opt_isWebview,
    opt_isHandshakePoll
  ) {
    /** @const {!Window} */
    this.win = win;
    /** @private {!HTMLIFrameElement} */
    this.ampIframe_ = ampIframe;
    /** @private {function(string, *, boolean):(!Promise<*>|undefined)} */
    this.messageHandler_ = messageHandler;
    /** @const {boolean} */
    this.isWebview_ = !!opt_isWebview;
    /** @const {string} */
    this.logsId = opt_logsId;

    const target = this.ampIframe_.contentWindow;
    if (this.isWebview_ || opt_isHandshakePoll) {
      Messaging.initiateHandshakeWithDocument(target).then((messaging) => {
        this.messaging_ = messaging;
        this.completeHandshake_();
      });
    } else {
      Messaging.waitForHandshakeFromDocument(
        this.win,
        target,
        frameOrigin
      ).then((messaging) => {
        this.messaging_ = messaging;
        this.completeHandshake_();
      });
    }
  }

  /**
   * @private
   */
  completeHandshake_() {
    this.messaging_.setDefaultHandler(this.messageHandler_);

    this.sendRequest(
      'visibilitychange',
      {
        state: this.visibilityState_,
        prerenderSize: this.prerenderSize,
      },
      true
    );
  }

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
  }

  /**
   * Logs viewer arguments.
   *
   */
  log() {
    const var_args = Array.prototype.slice.call(arguments, 0);
    var_args.unshift('[ViewerHost ' + this.logsId + ']');
    console /*OK*/.log
      .apply(console, var_args);
  }
}

self.AmpViewerHost = AmpViewerHost;
