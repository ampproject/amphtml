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


import {listen} from '../../../src/event-helper';
import {dev} from '../../../src/log';

/**
 * @fileoverview 
 */
export class TouchHandler {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
    /** @private {boolean} */
    this.isMouseDown_ = false;
    this.listenForTouchEvents();
  }

  listenForTouchEvents() {
    const handleTouchEvent = this.handleTouchEvent_.bind(this);
    listen(this.win, 'touchstart', handleTouchEvent);
    listen(this.win, 'touchend', handleTouchEvent);
    listen(this.win, 'touchmove', handleTouchEvent);
    listen(this.win, 'touchleave', handleTouchEvent); //finger moves outside listening area
    listen(this.win, 'touchenter', handleTouchEvent);
    listen(this.win, 'touchcancel', handleTouchEvent);

    const handleMouseEvent = this.handleMouseEvent_.bind(this);
    listen(this.win, 'mousedown', handleMouseEvent);
    listen(this.win, 'mouseup', handleMouseEvent);
    listen(this.win, 'dragstart', handleMouseEvent);
    listen(this.win, 'dragend', handleMouseEvent);
    listen(this.win, 'mousemove', handleMouseEvent);
    listen(this.win, 'mouseleave', handleMouseEvent); //finger moves outside listening area
    listen(this.win, 'mouseenter', handleMouseEvent);
  }

  /**
   * Only send mouse events if mouse is down. Yes? No?
   * @param {!Event} event
   * @private
   */
  handleMouseEvent_(event) {
    switch (event.type) {
      case 'mousedown':
      case 'dragstart':
        this.isMouseDown_ = true;
        break;
      case 'mouseup':
      case 'dragend':
        this.isMouseDown_ = false;
        break;
      default:
        if (this.isMouseDown_) {
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
  }

}
