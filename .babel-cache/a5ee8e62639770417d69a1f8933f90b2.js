function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { Observable } from "./core/data-structures/observable";
import { listenOnce, listenOncePromise } from "./event-helper";
import { dev } from "./log";
import { Services } from "./service";
import { registerServiceBuilder } from "./service-helpers";

var TAG_ = 'Input';

var MAX_MOUSE_CONFIRM_ATTEMPS_ = 3;
var CLICK_TIMEOUT_ = 300;

/**
 * Detects and maintains different types of input such as touch, mouse or
 * keyboard.
 */
export var Input = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Input(win) {_classCallCheck(this, Input);
    /** @const {!Window} */
    this.win = win;

    /** @private {!Function} */
    this.boundOnKeyDown_ = this.onKeyDown_.bind(this);

    /** @private {!Function} */
    this.boundOnMouseDown_ = this.onMouseDown_.bind(this);

    /** @private {?function(!Event)} */
    this.boundOnMouseMove_ = null;

    /** @private {?Function} */
    this.boundMouseCanceled_ = null;

    /** @private {?Function} */
    this.boundMouseConfirmed_ = null;

    /** @private {boolean} */
    this.hasTouch_ =
    'ontouchstart' in win || (
    win.navigator['maxTouchPoints'] !== undefined &&
    win.navigator['maxTouchPoints'] > 0) ||
    win['DocumentTouch'] !== undefined;
    dev().fine(TAG_, 'touch detected:', this.hasTouch_);

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
      this.boundOnMouseMove_ = /** @type {function(!Event)} */(
      this.onMouseMove_.bind(this));

      listenOnce(win.document, 'mousemove', this.boundOnMouseMove_);
    }
  }

  /**
   * See https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-css-classes.md#input-mode-classes
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   */_createClass(Input, [{ key: "setupInputModeClasses", value:
    function setupInputModeClasses(ampdoc) {var _this = this;
      this.onTouchDetected(function (detected) {
        _this.toggleInputClass_(ampdoc, 'amp-mode-touch', detected);
      }, true);
      this.onMouseDetected(function (detected) {
        _this.toggleInputClass_(ampdoc, 'amp-mode-mouse', detected);
      }, true);
      this.onKeyboardStateChanged(function (active) {
        _this.toggleInputClass_(ampdoc, 'amp-mode-keyboard-active', active);
      }, true);
    }

    /**
     * Whether the touch input has been detected.
     * @return {boolean}
     */ }, { key: "isTouchDetected", value:
    function isTouchDetected() {
      return this.hasTouch_;
    }

    /**
     * Registers an event handle in case if the touch is detected.
     * @param {function(boolean)} handler
     * @param {boolean=} opt_fireImmediately
     * @return {!UnlistenDef}
     */ }, { key: "onTouchDetected", value:
    function onTouchDetected(handler, opt_fireImmediately) {
      if (opt_fireImmediately) {
        handler(this.isTouchDetected());
      }
      return this.touchDetectedObservable_.add(handler);
    }

    /**
     * Whether the mouse input has been detected.
     * @return {boolean}
     */ }, { key: "isMouseDetected", value:
    function isMouseDetected() {
      return this.hasMouse_;
    }

    /**
     * Registers an event handle in case if the mouse is detected.
     * @param {function(boolean)} handler
     * @param {boolean=} opt_fireImmediately
     * @return {!UnlistenDef}
     */ }, { key: "onMouseDetected", value:
    function onMouseDetected(handler, opt_fireImmediately) {
      if (opt_fireImmediately) {
        handler(this.isMouseDetected());
      }
      return this.mouseDetectedObservable_.add(handler);
    }

    /**
     * Whether the keyboard input is currently active.
     * @return {boolean}
     */ }, { key: "isKeyboardActive", value:
    function isKeyboardActive() {
      return this.keyboardActive_;
    }

    /**
     * Registers an event handle for changes in the keyboard input.
     * @param {function(boolean)} handler
     * @param {boolean=} opt_fireImmediately
     * @return {!UnlistenDef}
     */ }, { key: "onKeyboardStateChanged", value:
    function onKeyboardStateChanged(handler, opt_fireImmediately) {
      if (opt_fireImmediately) {
        handler(this.isKeyboardActive());
      }
      return this.keyboardStateObservable_.add(handler);
    }

    /**
     * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
     * @param {string} clazz
     * @param {boolean} on
     * @private
     */ }, { key: "toggleInputClass_", value:
    function toggleInputClass_(ampdoc, clazz, on) {var _this2 = this;
      ampdoc.waitForBodyOpen().then(function (body) {
        var vsync = Services. /*OK*/vsyncFor(_this2.win);
        vsync.mutate(function () {
          body.classList.toggle(clazz, on);
        });
      });
    }

    /**
     * @param {!Event} e
     * @private
     */ }, { key: "onKeyDown_", value:
    function onKeyDown_(e) {
      if (this.keyboardActive_) {
        return;
      }

      if (e.defaultPrevented) {
        return;
      }

      // Ignore inputs.
      var target = e.target;
      if (
      target && (
      target.tagName == 'INPUT' ||
      target.tagName == 'TEXTAREA' ||
      target.tagName == 'SELECT' ||
      target.tagName == 'OPTION' ||
      target.hasAttribute('contenteditable')))
      {
        return;
      }

      this.keyboardActive_ = true;
      this.keyboardStateObservable_.fire(true);
      dev().fine(TAG_, 'keyboard activated');
    }

    /** @private */ }, { key: "onMouseDown_", value:
    function onMouseDown_() {
      if (!this.keyboardActive_) {
        return;
      }
      this.keyboardActive_ = false;
      this.keyboardStateObservable_.fire(false);
      dev().fine(TAG_, 'keyboard deactivated');
    }

    /**
     * @param {!Event} e
     * @return {!Promise|undefined}
     * @private
     */ }, { key: "onMouseMove_", value:
    function onMouseMove_(e) {var _this3 = this;
      // The event explicitly states that it's a result of a touch event.
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) {
        this.mouseCanceled_();
        return undefined;
      }
      if (!this.boundMouseConfirmed_) {
        this.boundMouseConfirmed_ = this.mouseConfirmed_.bind(this);
        this.boundMouseCanceled_ = this.mouseCanceled_.bind(this);
      }
      // If "click" arrives within a timeout time, this is most likely a
      // touch/mouse emulation. Otherwise, if timeout exceeded, this looks
      // like a legitimate mouse event.
      var unlisten;
      var listenPromise = listenOncePromise(
      this.win.document,
      'click',
      /* capture */undefined,
      function (unlistener) {
        unlisten = unlistener;
      });

      return Services.timerFor(this.win).
      timeoutPromise(CLICK_TIMEOUT_, listenPromise).
      then(this.boundMouseCanceled_, function () {
        if (unlisten) {
          unlisten();
        }
        _this3.boundMouseConfirmed_();
      });
    }

    /** @private */ }, { key: "mouseConfirmed_", value:
    function mouseConfirmed_() {
      this.hasMouse_ = true;
      this.mouseDetectedObservable_.fire(true);
      dev().fine(TAG_, 'mouse detected');
    }

    /** @private */ }, { key: "mouseCanceled_", value:
    function mouseCanceled_() {
      // Repeat, if attempts allow.
      this.mouseConfirmAttemptCount_++;
      if (this.mouseConfirmAttemptCount_ <= MAX_MOUSE_CONFIRM_ATTEMPS_) {
        listenOnce(
        this.win.document,
        'mousemove',
        /** @type {function(!Event)} */(this.boundOnMouseMove_));

      } else {
        dev().fine(TAG_, 'mouse detection failed');
      }
    } }]);return Input;}();


/**
 * @param {!Window} win
 */
export function installInputService(win) {
  registerServiceBuilder(win, 'input', Input);
}
// /Users/mszylkowski/src/amphtml/src/input.js