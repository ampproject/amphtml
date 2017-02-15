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


import {Messaging} from './messaging';
import {listen} from '../../../src/event-helper';

/**
 * @fileoverview Forward touch events from the AMP doc to the viewer.
 */
export class TouchHandler {

  /**
   * @param {!Window} win
   * @param {!WindowPortEmulator} port
   * @param {!Messaging} messaging
   */
  constructor(win, messaging) {
    /** @const {!Window} */
    this.win = win;
    /** @private {!Messaging} */
    this.messaging_ = messaging;
    /**
     * Do not forward touch events when false.
     * @private {boolean}
     */
    this.tracking_ = false;

    this.listenForTouchEvents();
  }

  listenForTouchEvents() {
    const handleEvent = this.handleEvent_.bind(this);

    listen(this.win, 'touchstart', handleEvent);
    listen(this.win, 'touchend', handleEvent);
    listen(this.win, 'touchmove', handleEvent);

    listen(this.win, 'mousedown', handleEvent);
    listen(this.win, 'mouseup', handleEvent);
    listen(this.win, 'dragstart', handleEvent);
    listen(this.win, 'dragend', handleEvent);
    listen(this.win, 'mousemove', handleEvent);
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleEvent_(event) {
    switch (event.type) {
      case 'dragstart':
      case 'mousedown':
      case 'touchstart':
        this.tracking_ = true;
        this.handleTouchEvent_(event);
        break;
      case 'dragend':
      case 'mouseup':
      case 'touchend':
        this.handleTouchEvent_(event);
        this.tracking_ = false;
        break;
      default:
        if (this.tracking_) {
          this.handleTouchEvent_(event);
        }
    }
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleTouchEvent_(event) {
    console.log('handleTouchEvent!', event);
    if (event && event.type) {
      this.messaging_.sendRequest(event.type, event, false);
    }
  }
}
