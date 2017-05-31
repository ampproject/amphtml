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


/**
 * The list of touch event properites to copy.
 * @const {!Array<string>}
 */
const EVENT_PROPERTIES = [
  'altKey', 'charCode', 'ctrlKey', 'detail', 'eventPhase', 'keyCode',
  'layerX', 'layerY', 'metaKey', 'pageX', 'pageY', 'returnValue',
  'shiftKey', 'timeStamp', 'type', 'which',
];

/**
 * The list of touch properties to copy.
 * @const {!Array<string>}
 */
const TOUCH_PROPERTIES = [
  'clientX', 'clientY', 'force', 'identifier', 'pageX', 'pageY', 'radiusX',
  'radiusY', 'screenX', 'screenY',
];

/**
 * @const {string} Request name to enable/disable scrolling.
 */
const SCROLL_LOCK = 'scrollLock';

/**
 * @fileoverview Forward touch events from the AMP doc to the viewer.
 */
export class TouchHandler {

  /**
   * @param {!Window} win
   * @param {!./messaging/messaging.Messaging} messaging
   */
  constructor(win, messaging) {
    /** @const {!Window} */
    this.win = win;
    /** @const @private {!./messaging/messaging.Messaging} */
    this.messaging_ = messaging;
    /**
     * When true, prevent default to prevent scrolling.
     * @private {boolean}
     */
    this.scrollLocked_ = false;


    messaging.registerHandler(SCROLL_LOCK, this.scrollLockHandler_.bind(this));

    this.listenForTouchEvents();
  }

  listenForTouchEvents() {
    const handleEvent = this.handleEvent_.bind(this);
    const doc = this.win.document;

    listen(doc, 'touchstart', handleEvent);
    listen(doc, 'touchend', handleEvent);
    listen(doc, 'touchmove', handleEvent);
  }

  /**
   * @param {!Event} e
   * @private
   */
  handleEvent_(e) {
    switch (e.type) {
      case 'touchstart':
      case 'touchend':
      case 'touchmove':
        this.forwardEvent_(e);
        break;
      default:
        return;
    }
  }

  /**
   * @param {!Event} e
   * @private
   */
  forwardEvent_(e) {
    if (e && e.type) {
      const msg = this.copyTouchEvent_(e);
      this.messaging_.sendRequest(e.type, msg, false);
    }
    // TODO: switch to passive events and pan-touch action.
    if (this.scrollLocked_) {
      e.preventDefault();
    }
  }


  /**
   * Makes a partial copy of the event.
   * @param {!Event} e The event object to be copied.
   * @return {!Object}
   * @private
   */
  copyTouchEvent_(e) {
    const copiedEvent =
        this.copyProperties_(e, EVENT_PROPERTIES);
    if (e.touches) {
      copiedEvent.touches = this.copyTouches_(e.touches);
    }
    if (e.changedTouches) {
      copiedEvent.changedTouches = this.copyTouches_(e.changedTouches);
    }
    return copiedEvent;
  }


  /**
   * Copies an array of touches.
   * @param {!Array<!Object>} touchList
   * @return {!Array<!Object>}
   * @private
   */
  copyTouches_(touchList) {
    const copiedTouches = [];
    for (let i = 0; i < touchList.length; i++) {
      copiedTouches.push(this.copyProperties_(touchList[i], TOUCH_PROPERTIES));
    }
    return copiedTouches;
  }

 /**
   * Copies specified properties of o to a new object.
   * @param {!Object} o The source object.
   * @param {!Array<string>} properties The properties to copy.
   * @return {!Object} The copy of o.
   * @private
   */
  copyProperties_(o, properties) {
    const copy = {};
    for (let i = 0; i < properties.length; i++) {
      const p = properties[i];
      if (o[p] !== undefined) {
        copy[p] = o[p];
      }
    }
    return copy;
  }

  /**
   * Handles scrollLock requests from the viewer to change the scrollLock state.
   * @param {string} type Unused.
   * @param {*} payload True to disable event forwarding / lock scrolling.
   * @param {boolean} awaitResponse
   * @return {!Promise<?>|undefined}
   * @private
   */
  scrollLockHandler_(type, payload, awaitResponse) {
    this.scrollLocked_ = !!payload;
    return awaitResponse ? Promise.resolve({}) : undefined;
  }
}
