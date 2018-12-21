/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {listen} from '../../../src/event-helper';

/**
 * On browser window resize, forward viewport height changes to viewer.
 */
export class WindowResizeHandler {

  /**
   * @param {!Window} win
   * @param {!./messaging/messaging.Messaging} messaging
   */
  constructor(win, messaging) {
    /** @const {!Window} */
    this.win = win;
    /** @const @private {!./messaging/messaging.Messaging} */
    this.messaging_ = messaging;

    /** @private @const {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.win.document.documentElement);

    this.listenForWindowResizeEvents_();
  }

  /**
   * @private
   */
  listenForWindowResizeEvents_() {
    listen(this.win, 'resize', this.forwardEventToViewer_.bind(this),
        {capture: false});
  }

  /**
   * @param {!Event} e
   * @private
   */
  forwardEventToViewer_(e) {
    if (e.defaultPrevented) {
      return;
    }

    this.messaging_.sendRequest(
        e.type,
        dict({'documentHeight': this.viewport_.getContentHeight()}),
        /* awaitResponse */ false
    );
  }
}
