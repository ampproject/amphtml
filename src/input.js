/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Observable} from './observable';
import {getService} from './service';
import {log} from './log';
import {listenOnce, listenOncePromise} from './event-helper';
import {timer} from './timer';


let TAG_ = 'Input';

let MAX_MOUSE_CONFIRM_ATTEMPS_ = 3;
let CLICK_TIMEOUT_ = 300;


/**
 * Detects and maintains different types of input such as touch, mouse or
 * keyboard.
 */
export class Input {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private {!Function} */
    this.boundOnKeyDown_ = this.onKeyDown_.bind(this);

    /** @private {!Function} */
    this.boundOnMouseDown_ = this.onMouseDown_.bind(this);

    /** @private {!Function} */
    this.boundOnMouseMove_ = this.onMouseMove_.bind(this);

    /** @private {!Function} */
    this.boundMouseCanceled_ = this.mouseCanceled_.bind(this);

    /** @private {!Function} */
    this.boundMouseConfirmed_ = this.mouseConfirmed_.bind(this);

    /** @private {boolean} */
    this.hasTouch_ = ('ontouchstart' in win ||
        (win.navigator['maxTouchPoints'] !== undefined &&
            win.navigator['maxTouchPoints'] > 0) ||
        win['DocumentTouch'] !== undefined);
    log.fine(TAG_, 'touch detected:', this.hasTouch_);

    /** @private {boolean} */
    this.keyboardActive_ = false;
    this.win.document.addEventListener('keydown', this.boundOnKeyDown_);
    this.win.document.addEventListener('mousedown', this.boundOnMouseDown_);

    /** @private {boolean} */
    this.hasMouse_ = true;

    /** @private {number} */
    this.mouseConfirmAttemptCount_ = 0;

    /** @private {!Observable<boolean>} */
    this.touchDetectedObservable_ = new Observable();

    /** @private {!Observable<boolean>} */
    this.mouseDetectedObservable_ = new Observable();

    /** @private {!Observable<boolean>} */
    this.keyboardStateObservable_ = new Observable();

    // If touch available, temporarily set hasMouse to false and wait for
    // mouse events.
    if (this.hasTouch_) {
      this.hasMouse_ = !this.hasTouch_;
      listenOnce(win.document, 'mousemove', this.boundOnMouseMove_);
    }
  }

  /** @private */
  cleanup_() {
    this.win.document.removeEventListener('keydown', this.boundOnKeyDown_);
    this.win.document.removeEventListener('mousedown', this.boundOnMouseDown_);
  }

  /**
   * Whether the touch input has been detected.
   * @return {boolean}
   */
  isTouchDetected() {
    return this.hasTouch_;
  }

  /**
   * Registers an event handle in case if the touch is detected.
   * @param {function(boolean)} handler
   * @param {boolean=} opt_fireImmediately
   * @return {!Unlisten}
   */
  onTouchDetected(handler, opt_fireImmediately) {
    if (opt_fireImmediately) {
      handler(this.isTouchDetected());
    }
    return this.touchDetectedObservable_.add(handler);
  }

  /**
   * Whether the mouse input has been detected.
   * @return {boolean}
   */
  isMouseDetected() {
    return this.hasMouse_;
  }

  /**
   * Registers an event handle in case if the mouse is detected.
   * @param {function(boolean)} handler
   * @param {boolean=} opt_fireImmediately
   * @return {!Unlisten}
   */
  onMouseDetected(handler, opt_fireImmediately) {
    if (opt_fireImmediately) {
      handler(this.isMouseDetected());
    }
    return this.mouseDetectedObservable_.add(handler);
  }

  /**
   * Whether the keyboard input is currently active.
   * @return {boolean}
   */
  isKeyboardActive() {
    return this.keyboardActive_;
  }

  /**
   * Registers an event handle for changes in the keyboard input.
   * @param {function(boolean)} handler
   * @param {boolean=} opt_fireImmediately
   * @return {!Unlisten}
   */
  onKeyboardStateChanged(handler, opt_fireImmediately) {
    if (opt_fireImmediately) {
      handler(this.isKeyboardActive());
    }
    return this.keyboardStateObservable_.add(handler);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onKeyDown_(e) {
    if (this.keyboardActive_) {
      return;
    }

    if (e.defaultPrevented) {
      return;
    }

    // Ignore inputs.
    let target = e.target;
    if (target && (target.tagName == 'INPUT' ||
          target.tagName == 'TEXTAREA' ||
          target.tagName == 'SELECT' ||
          target.tagName == 'OPTION' ||
          target.hasAttribute('contenteditable'))) {
      return;
    }

    this.keyboardActive_ = true;
    this.keyboardStateObservable_.fire(true);
    log.fine(TAG_, 'keyboard activated');
  }

  /** @private */
  onMouseDown_() {
    if (!this.keyboardActive_) {
      return;
    }
    this.keyboardActive_ = false;
    this.keyboardStateObservable_.fire(false);
    log.fine(TAG_, 'keyboard deactivated');
  }

  /** @private */
  onMouseMove_() {
    // If "click" arrives within a timeout time, this is most likely a
    // touch/mouse emulation. Otherwise, if timeout exceeded, this looks
    // like a legitimate mouse event.
    return listenOncePromise(this.win.document, 'click', false, CLICK_TIMEOUT_)
        .then(this.boundMouseCanceled_, this.boundMouseConfirmed_);
  }

  /** @private */
  mouseConfirmed_() {
    this.hasMouse_ = true;
    this.mouseDetectedObservable_.fire(true);
    log.fine(TAG_, 'mouse detected');
  }

  /** @private */
  mouseCanceled_() {
    // Repeat, if attempts allow.
    this.mouseConfirmAttemptCount_++;
    if (this.mouseConfirmAttemptCount_ <= MAX_MOUSE_CONFIRM_ATTEMPS_) {
      listenOnce(this.win.document, 'mousemove', this.boundOnMouseMove_);
    } else {
      log.fine(TAG_, 'mouse detection failed');
    }
  }
}


/**
 * @param {!Window} window
 * @return {!Input}
 */
export function inputFor(window) {
  return getService(window, 'input', () => {
    return new Input(window);
  });
};
