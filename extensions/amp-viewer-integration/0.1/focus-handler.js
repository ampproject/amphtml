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

import {dict} from '../../../src/utils/object';
import {listen} from '../../../src/event-helper';

/**
 * Forward focus events' related data from the AMP doc to the
 * viewer.
 */
export class FocusHandler {
  /**
   * @param {!Window} win
   * @param {!./messaging/messaging.Messaging} messaging
   */
  constructor(win, messaging) {
    /** @const {!Window} */
    this.win = win;
    /** @const @private {!./messaging/messaging.Messaging} */
    this.messaging_ = messaging;

    this.listenForFocusEvents_();
  }

  /**
   * @private
   */
  listenForFocusEvents_() {
    const doc = this.win.document;
    listen(doc, 'focusin', this.forwardEventToViewer_.bind(this), {
      capture: false,
    });
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
      dict({'focusTargetRect': e.target./*OK*/ getBoundingClientRect()}),
      /* awaitResponse */ false
    );
  }
}
