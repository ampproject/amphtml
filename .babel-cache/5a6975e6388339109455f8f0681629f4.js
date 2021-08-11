function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
  function Input(win) {
    _classCallCheck(this, Input);

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
    this.hasTouch_ = 'ontouchstart' in win || win.navigator['maxTouchPoints'] !== undefined && win.navigator['maxTouchPoints'] > 0 || win['DocumentTouch'] !== undefined;
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
      this.boundOnMouseMove_ =
      /** @type {function(!Event)} */
      this.onMouseMove_.bind(this);
      listenOnce(win.document, 'mousemove', this.boundOnMouseMove_);
    }
  }

  /**
   * See https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-css-classes.md#input-mode-classes
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   */
  _createClass(Input, [{
    key: "setupInputModeClasses",
    value: function setupInputModeClasses(ampdoc) {
      var _this = this;

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
     */

  }, {
    key: "isTouchDetected",
    value: function isTouchDetected() {
      return this.hasTouch_;
    }
    /**
     * Registers an event handle in case if the touch is detected.
     * @param {function(boolean)} handler
     * @param {boolean=} opt_fireImmediately
     * @return {!UnlistenDef}
     */

  }, {
    key: "onTouchDetected",
    value: function onTouchDetected(handler, opt_fireImmediately) {
      if (opt_fireImmediately) {
        handler(this.isTouchDetected());
      }

      return this.touchDetectedObservable_.add(handler);
    }
    /**
     * Whether the mouse input has been detected.
     * @return {boolean}
     */

  }, {
    key: "isMouseDetected",
    value: function isMouseDetected() {
      return this.hasMouse_;
    }
    /**
     * Registers an event handle in case if the mouse is detected.
     * @param {function(boolean)} handler
     * @param {boolean=} opt_fireImmediately
     * @return {!UnlistenDef}
     */

  }, {
    key: "onMouseDetected",
    value: function onMouseDetected(handler, opt_fireImmediately) {
      if (opt_fireImmediately) {
        handler(this.isMouseDetected());
      }

      return this.mouseDetectedObservable_.add(handler);
    }
    /**
     * Whether the keyboard input is currently active.
     * @return {boolean}
     */

  }, {
    key: "isKeyboardActive",
    value: function isKeyboardActive() {
      return this.keyboardActive_;
    }
    /**
     * Registers an event handle for changes in the keyboard input.
     * @param {function(boolean)} handler
     * @param {boolean=} opt_fireImmediately
     * @return {!UnlistenDef}
     */

  }, {
    key: "onKeyboardStateChanged",
    value: function onKeyboardStateChanged(handler, opt_fireImmediately) {
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
     */

  }, {
    key: "toggleInputClass_",
    value: function toggleInputClass_(ampdoc, clazz, on) {
      var _this2 = this;

      ampdoc.waitForBodyOpen().then(function (body) {
        var vsync = Services.
        /*OK*/
        vsyncFor(_this2.win);
        vsync.mutate(function () {
          body.classList.toggle(clazz, on);
        });
      });
    }
    /**
     * @param {!Event} e
     * @private
     */

  }, {
    key: "onKeyDown_",
    value: function onKeyDown_(e) {
      if (this.keyboardActive_) {
        return;
      }

      if (e.defaultPrevented) {
        return;
      }

      // Ignore inputs.
      var target = e.target;

      if (target && (target.tagName == 'INPUT' || target.tagName == 'TEXTAREA' || target.tagName == 'SELECT' || target.tagName == 'OPTION' || target.hasAttribute('contenteditable'))) {
        return;
      }

      this.keyboardActive_ = true;
      this.keyboardStateObservable_.fire(true);
      dev().fine(TAG_, 'keyboard activated');
    }
    /** @private */

  }, {
    key: "onMouseDown_",
    value: function onMouseDown_() {
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
     */

  }, {
    key: "onMouseMove_",
    value: function onMouseMove_(e) {
      var _this3 = this;

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
      var listenPromise = listenOncePromise(this.win.document, 'click',
      /* capture */
      undefined, function (unlistener) {
        unlisten = unlistener;
      });
      return Services.timerFor(this.win).timeoutPromise(CLICK_TIMEOUT_, listenPromise).then(this.boundMouseCanceled_, function () {
        if (unlisten) {
          unlisten();
        }

        _this3.boundMouseConfirmed_();
      });
    }
    /** @private */

  }, {
    key: "mouseConfirmed_",
    value: function mouseConfirmed_() {
      this.hasMouse_ = true;
      this.mouseDetectedObservable_.fire(true);
      dev().fine(TAG_, 'mouse detected');
    }
    /** @private */

  }, {
    key: "mouseCanceled_",
    value: function mouseCanceled_() {
      // Repeat, if attempts allow.
      this.mouseConfirmAttemptCount_++;

      if (this.mouseConfirmAttemptCount_ <= MAX_MOUSE_CONFIRM_ATTEMPS_) {
        listenOnce(this.win.document, 'mousemove',
        /** @type {function(!Event)} */
        this.boundOnMouseMove_);
      } else {
        dev().fine(TAG_, 'mouse detection failed');
      }
    }
  }]);

  return Input;
}();

/**
 * @param {!Window} win
 */
export function installInputService(win) {
  registerServiceBuilder(win, 'input', Input);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0LmpzIl0sIm5hbWVzIjpbIk9ic2VydmFibGUiLCJsaXN0ZW5PbmNlIiwibGlzdGVuT25jZVByb21pc2UiLCJkZXYiLCJTZXJ2aWNlcyIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJUQUdfIiwiTUFYX01PVVNFX0NPTkZJUk1fQVRURU1QU18iLCJDTElDS19USU1FT1VUXyIsIklucHV0Iiwid2luIiwiYm91bmRPbktleURvd25fIiwib25LZXlEb3duXyIsImJpbmQiLCJib3VuZE9uTW91c2VEb3duXyIsIm9uTW91c2VEb3duXyIsImJvdW5kT25Nb3VzZU1vdmVfIiwiYm91bmRNb3VzZUNhbmNlbGVkXyIsImJvdW5kTW91c2VDb25maXJtZWRfIiwiaGFzVG91Y2hfIiwibmF2aWdhdG9yIiwidW5kZWZpbmVkIiwiZmluZSIsImtleWJvYXJkQWN0aXZlXyIsImRvY3VtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImhhc01vdXNlXyIsIm1vdXNlQ29uZmlybUF0dGVtcHRDb3VudF8iLCJ0b3VjaERldGVjdGVkT2JzZXJ2YWJsZV8iLCJtb3VzZURldGVjdGVkT2JzZXJ2YWJsZV8iLCJrZXlib2FyZFN0YXRlT2JzZXJ2YWJsZV8iLCJvbk1vdXNlTW92ZV8iLCJhbXBkb2MiLCJvblRvdWNoRGV0ZWN0ZWQiLCJkZXRlY3RlZCIsInRvZ2dsZUlucHV0Q2xhc3NfIiwib25Nb3VzZURldGVjdGVkIiwib25LZXlib2FyZFN0YXRlQ2hhbmdlZCIsImFjdGl2ZSIsImhhbmRsZXIiLCJvcHRfZmlyZUltbWVkaWF0ZWx5IiwiaXNUb3VjaERldGVjdGVkIiwiYWRkIiwiaXNNb3VzZURldGVjdGVkIiwiaXNLZXlib2FyZEFjdGl2ZSIsImNsYXp6Iiwib24iLCJ3YWl0Rm9yQm9keU9wZW4iLCJ0aGVuIiwiYm9keSIsInZzeW5jIiwidnN5bmNGb3IiLCJtdXRhdGUiLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJlIiwiZGVmYXVsdFByZXZlbnRlZCIsInRhcmdldCIsInRhZ05hbWUiLCJoYXNBdHRyaWJ1dGUiLCJmaXJlIiwic291cmNlQ2FwYWJpbGl0aWVzIiwiZmlyZXNUb3VjaEV2ZW50cyIsIm1vdXNlQ2FuY2VsZWRfIiwibW91c2VDb25maXJtZWRfIiwidW5saXN0ZW4iLCJsaXN0ZW5Qcm9taXNlIiwidW5saXN0ZW5lciIsInRpbWVyRm9yIiwidGltZW91dFByb21pc2UiLCJpbnN0YWxsSW5wdXRTZXJ2aWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxVQUFSO0FBQ0EsU0FBUUMsVUFBUixFQUFvQkMsaUJBQXBCO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxzQkFBUjtBQUVBLElBQU1DLElBQUksR0FBRyxPQUFiO0FBRUEsSUFBTUMsMEJBQTBCLEdBQUcsQ0FBbkM7QUFDQSxJQUFNQyxjQUFjLEdBQUcsR0FBdkI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxLQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsaUJBQVlDLEdBQVosRUFBaUI7QUFBQTs7QUFDZjtBQUNBLFNBQUtBLEdBQUwsR0FBV0EsR0FBWDs7QUFFQTtBQUNBLFNBQUtDLGVBQUwsR0FBdUIsS0FBS0MsVUFBTCxDQUFnQkMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBdkI7O0FBRUE7QUFDQSxTQUFLQyxpQkFBTCxHQUF5QixLQUFLQyxZQUFMLENBQWtCRixJQUFsQixDQUF1QixJQUF2QixDQUF6Qjs7QUFFQTtBQUNBLFNBQUtHLGlCQUFMLEdBQXlCLElBQXpCOztBQUVBO0FBQ0EsU0FBS0MsbUJBQUwsR0FBMkIsSUFBM0I7O0FBRUE7QUFDQSxTQUFLQyxvQkFBTCxHQUE0QixJQUE1Qjs7QUFFQTtBQUNBLFNBQUtDLFNBQUwsR0FDRSxrQkFBa0JULEdBQWxCLElBQ0NBLEdBQUcsQ0FBQ1UsU0FBSixDQUFjLGdCQUFkLE1BQW9D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Q0E7QUFDQTtBQUNBLE9BQU8sU0FBU2dFLG1CQUFULENBQTZCNUQsR0FBN0IsRUFBa0M7QUFDdkNMLEVBQUFBLHNCQUFzQixDQUFDSyxHQUFELEVBQU0sT0FBTixFQUFlRCxLQUFmLENBQXRCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICcuL2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL29ic2VydmFibGUnO1xuaW1wb3J0IHtsaXN0ZW5PbmNlLCBsaXN0ZW5PbmNlUHJvbWlzZX0gZnJvbSAnLi9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJ9IGZyb20gJy4vc2VydmljZS1oZWxwZXJzJztcblxuY29uc3QgVEFHXyA9ICdJbnB1dCc7XG5cbmNvbnN0IE1BWF9NT1VTRV9DT05GSVJNX0FUVEVNUFNfID0gMztcbmNvbnN0IENMSUNLX1RJTUVPVVRfID0gMzAwO1xuXG4vKipcbiAqIERldGVjdHMgYW5kIG1haW50YWlucyBkaWZmZXJlbnQgdHlwZXMgb2YgaW5wdXQgc3VjaCBhcyB0b3VjaCwgbW91c2Ugb3JcbiAqIGtleWJvYXJkLlxuICovXG5leHBvcnQgY2xhc3MgSW5wdXQge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbikge1xuICAgIC8qKiBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW4gPSB3aW47XG5cbiAgICAvKiogQHByaXZhdGUgeyFGdW5jdGlvbn0gKi9cbiAgICB0aGlzLmJvdW5kT25LZXlEb3duXyA9IHRoaXMub25LZXlEb3duXy5iaW5kKHRoaXMpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshRnVuY3Rpb259ICovXG4gICAgdGhpcy5ib3VuZE9uTW91c2VEb3duXyA9IHRoaXMub25Nb3VzZURvd25fLmJpbmQodGhpcyk7XG5cbiAgICAvKiogQHByaXZhdGUgez9mdW5jdGlvbighRXZlbnQpfSAqL1xuICAgIHRoaXMuYm91bmRPbk1vdXNlTW92ZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RnVuY3Rpb259ICovXG4gICAgdGhpcy5ib3VuZE1vdXNlQ2FuY2VsZWRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0Z1bmN0aW9ufSAqL1xuICAgIHRoaXMuYm91bmRNb3VzZUNvbmZpcm1lZF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaGFzVG91Y2hfID1cbiAgICAgICdvbnRvdWNoc3RhcnQnIGluIHdpbiB8fFxuICAgICAgKHdpbi5uYXZpZ2F0b3JbJ21heFRvdWNoUG9pbnRzJ10gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICB3aW4ubmF2aWdhdG9yWydtYXhUb3VjaFBvaW50cyddID4gMCkgfHxcbiAgICAgIHdpblsnRG9jdW1lbnRUb3VjaCddICE9PSB1bmRlZmluZWQ7XG4gICAgZGV2KCkuZmluZShUQUdfLCAndG91Y2ggZGV0ZWN0ZWQ6JywgdGhpcy5oYXNUb3VjaF8pO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMua2V5Ym9hcmRBY3RpdmVfID0gZmFsc2U7XG4gICAgdGhpcy53aW4uZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuYm91bmRPbktleURvd25fKTtcbiAgICB0aGlzLndpbi5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLmJvdW5kT25Nb3VzZURvd25fKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmhhc01vdXNlXyA9IHRydWU7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLm1vdXNlQ29uZmlybUF0dGVtcHRDb3VudF8gPSAwO1xuXG4gICAgLyoqIEBwcml2YXRlIHshT2JzZXJ2YWJsZTxib29sZWFuPn0gKi9cbiAgICB0aGlzLnRvdWNoRGV0ZWN0ZWRPYnNlcnZhYmxlXyA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYnNlcnZhYmxlPGJvb2xlYW4+fSAqL1xuICAgIHRoaXMubW91c2VEZXRlY3RlZE9ic2VydmFibGVfID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9ic2VydmFibGU8Ym9vbGVhbj59ICovXG4gICAgdGhpcy5rZXlib2FyZFN0YXRlT2JzZXJ2YWJsZV8gPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG4gICAgLy8gSWYgdG91Y2ggYXZhaWxhYmxlLCB0ZW1wb3JhcmlseSBzZXQgaGFzTW91c2UgdG8gZmFsc2UgYW5kIHdhaXQgZm9yXG4gICAgLy8gbW91c2UgZXZlbnRzLlxuICAgIGlmICh0aGlzLmhhc1RvdWNoXykge1xuICAgICAgdGhpcy5oYXNNb3VzZV8gPSAhdGhpcy5oYXNUb3VjaF87XG4gICAgICB0aGlzLmJvdW5kT25Nb3VzZU1vdmVfID0gLyoqIEB0eXBlIHtmdW5jdGlvbighRXZlbnQpfSAqLyAoXG4gICAgICAgIHRoaXMub25Nb3VzZU1vdmVfLmJpbmQodGhpcylcbiAgICAgICk7XG4gICAgICBsaXN0ZW5PbmNlKHdpbi5kb2N1bWVudCwgJ21vdXNlbW92ZScsIHRoaXMuYm91bmRPbk1vdXNlTW92ZV8pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvYW1waHRtbC9ibG9iL21haW4vZG9jcy9zcGVjL2FtcC1jc3MtY2xhc3Nlcy5tZCNpbnB1dC1tb2RlLWNsYXNzZXNcbiAgICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBzZXR1cElucHV0TW9kZUNsYXNzZXMoYW1wZG9jKSB7XG4gICAgdGhpcy5vblRvdWNoRGV0ZWN0ZWQoKGRldGVjdGVkKSA9PiB7XG4gICAgICB0aGlzLnRvZ2dsZUlucHV0Q2xhc3NfKGFtcGRvYywgJ2FtcC1tb2RlLXRvdWNoJywgZGV0ZWN0ZWQpO1xuICAgIH0sIHRydWUpO1xuICAgIHRoaXMub25Nb3VzZURldGVjdGVkKChkZXRlY3RlZCkgPT4ge1xuICAgICAgdGhpcy50b2dnbGVJbnB1dENsYXNzXyhhbXBkb2MsICdhbXAtbW9kZS1tb3VzZScsIGRldGVjdGVkKTtcbiAgICB9LCB0cnVlKTtcbiAgICB0aGlzLm9uS2V5Ym9hcmRTdGF0ZUNoYW5nZWQoKGFjdGl2ZSkgPT4ge1xuICAgICAgdGhpcy50b2dnbGVJbnB1dENsYXNzXyhhbXBkb2MsICdhbXAtbW9kZS1rZXlib2FyZC1hY3RpdmUnLCBhY3RpdmUpO1xuICAgIH0sIHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHRvdWNoIGlucHV0IGhhcyBiZWVuIGRldGVjdGVkLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNUb3VjaERldGVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmhhc1RvdWNoXztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gZXZlbnQgaGFuZGxlIGluIGNhc2UgaWYgdGhlIHRvdWNoIGlzIGRldGVjdGVkLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKGJvb2xlYW4pfSBoYW5kbGVyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9maXJlSW1tZWRpYXRlbHlcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKi9cbiAgb25Ub3VjaERldGVjdGVkKGhhbmRsZXIsIG9wdF9maXJlSW1tZWRpYXRlbHkpIHtcbiAgICBpZiAob3B0X2ZpcmVJbW1lZGlhdGVseSkge1xuICAgICAgaGFuZGxlcih0aGlzLmlzVG91Y2hEZXRlY3RlZCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG91Y2hEZXRlY3RlZE9ic2VydmFibGVfLmFkZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBtb3VzZSBpbnB1dCBoYXMgYmVlbiBkZXRlY3RlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTW91c2VEZXRlY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNNb3VzZV87XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGV2ZW50IGhhbmRsZSBpbiBjYXNlIGlmIHRoZSBtb3VzZSBpcyBkZXRlY3RlZC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbihib29sZWFuKX0gaGFuZGxlclxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfZmlyZUltbWVkaWF0ZWx5XG4gICAqIEByZXR1cm4geyFVbmxpc3RlbkRlZn1cbiAgICovXG4gIG9uTW91c2VEZXRlY3RlZChoYW5kbGVyLCBvcHRfZmlyZUltbWVkaWF0ZWx5KSB7XG4gICAgaWYgKG9wdF9maXJlSW1tZWRpYXRlbHkpIHtcbiAgICAgIGhhbmRsZXIodGhpcy5pc01vdXNlRGV0ZWN0ZWQoKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1vdXNlRGV0ZWN0ZWRPYnNlcnZhYmxlXy5hZGQoaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUga2V5Ym9hcmQgaW5wdXQgaXMgY3VycmVudGx5IGFjdGl2ZS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzS2V5Ym9hcmRBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMua2V5Ym9hcmRBY3RpdmVfO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBldmVudCBoYW5kbGUgZm9yIGNoYW5nZXMgaW4gdGhlIGtleWJvYXJkIGlucHV0LlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKGJvb2xlYW4pfSBoYW5kbGVyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9maXJlSW1tZWRpYXRlbHlcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKi9cbiAgb25LZXlib2FyZFN0YXRlQ2hhbmdlZChoYW5kbGVyLCBvcHRfZmlyZUltbWVkaWF0ZWx5KSB7XG4gICAgaWYgKG9wdF9maXJlSW1tZWRpYXRlbHkpIHtcbiAgICAgIGhhbmRsZXIodGhpcy5pc0tleWJvYXJkQWN0aXZlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5rZXlib2FyZFN0YXRlT2JzZXJ2YWJsZV8uYWRkKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhenpcbiAgICogQHBhcmFtIHtib29sZWFufSBvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdG9nZ2xlSW5wdXRDbGFzc18oYW1wZG9jLCBjbGF6eiwgb24pIHtcbiAgICBhbXBkb2Mud2FpdEZvckJvZHlPcGVuKCkudGhlbigoYm9keSkgPT4ge1xuICAgICAgY29uc3QgdnN5bmMgPSBTZXJ2aWNlcy4vKk9LKi8gdnN5bmNGb3IodGhpcy53aW4pO1xuICAgICAgdnN5bmMubXV0YXRlKCgpID0+IHtcbiAgICAgICAgYm9keS5jbGFzc0xpc3QudG9nZ2xlKGNsYXp6LCBvbik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFdmVudH0gZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25LZXlEb3duXyhlKSB7XG4gICAgaWYgKHRoaXMua2V5Ym9hcmRBY3RpdmVfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGUuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElnbm9yZSBpbnB1dHMuXG4gICAgY29uc3Qge3RhcmdldH0gPSBlO1xuICAgIGlmIChcbiAgICAgIHRhcmdldCAmJlxuICAgICAgKHRhcmdldC50YWdOYW1lID09ICdJTlBVVCcgfHxcbiAgICAgICAgdGFyZ2V0LnRhZ05hbWUgPT0gJ1RFWFRBUkVBJyB8fFxuICAgICAgICB0YXJnZXQudGFnTmFtZSA9PSAnU0VMRUNUJyB8fFxuICAgICAgICB0YXJnZXQudGFnTmFtZSA9PSAnT1BUSU9OJyB8fFxuICAgICAgICB0YXJnZXQuaGFzQXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnKSlcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmtleWJvYXJkQWN0aXZlXyA9IHRydWU7XG4gICAgdGhpcy5rZXlib2FyZFN0YXRlT2JzZXJ2YWJsZV8uZmlyZSh0cnVlKTtcbiAgICBkZXYoKS5maW5lKFRBR18sICdrZXlib2FyZCBhY3RpdmF0ZWQnKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBvbk1vdXNlRG93bl8oKSB7XG4gICAgaWYgKCF0aGlzLmtleWJvYXJkQWN0aXZlXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmtleWJvYXJkQWN0aXZlXyA9IGZhbHNlO1xuICAgIHRoaXMua2V5Ym9hcmRTdGF0ZU9ic2VydmFibGVfLmZpcmUoZmFsc2UpO1xuICAgIGRldigpLmZpbmUoVEFHXywgJ2tleWJvYXJkIGRlYWN0aXZhdGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRXZlbnR9IGVcbiAgICogQHJldHVybiB7IVByb21pc2V8dW5kZWZpbmVkfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Nb3VzZU1vdmVfKGUpIHtcbiAgICAvLyBUaGUgZXZlbnQgZXhwbGljaXRseSBzdGF0ZXMgdGhhdCBpdCdzIGEgcmVzdWx0IG9mIGEgdG91Y2ggZXZlbnQuXG4gICAgaWYgKGUuc291cmNlQ2FwYWJpbGl0aWVzICYmIGUuc291cmNlQ2FwYWJpbGl0aWVzLmZpcmVzVG91Y2hFdmVudHMpIHtcbiAgICAgIHRoaXMubW91c2VDYW5jZWxlZF8oKTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICghdGhpcy5ib3VuZE1vdXNlQ29uZmlybWVkXykge1xuICAgICAgdGhpcy5ib3VuZE1vdXNlQ29uZmlybWVkXyA9IHRoaXMubW91c2VDb25maXJtZWRfLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLmJvdW5kTW91c2VDYW5jZWxlZF8gPSB0aGlzLm1vdXNlQ2FuY2VsZWRfLmJpbmQodGhpcyk7XG4gICAgfVxuICAgIC8vIElmIFwiY2xpY2tcIiBhcnJpdmVzIHdpdGhpbiBhIHRpbWVvdXQgdGltZSwgdGhpcyBpcyBtb3N0IGxpa2VseSBhXG4gICAgLy8gdG91Y2gvbW91c2UgZW11bGF0aW9uLiBPdGhlcndpc2UsIGlmIHRpbWVvdXQgZXhjZWVkZWQsIHRoaXMgbG9va3NcbiAgICAvLyBsaWtlIGEgbGVnaXRpbWF0ZSBtb3VzZSBldmVudC5cbiAgICBsZXQgdW5saXN0ZW47XG4gICAgY29uc3QgbGlzdGVuUHJvbWlzZSA9IGxpc3Rlbk9uY2VQcm9taXNlKFxuICAgICAgdGhpcy53aW4uZG9jdW1lbnQsXG4gICAgICAnY2xpY2snLFxuICAgICAgLyogY2FwdHVyZSAqLyB1bmRlZmluZWQsXG4gICAgICAodW5saXN0ZW5lcikgPT4ge1xuICAgICAgICB1bmxpc3RlbiA9IHVubGlzdGVuZXI7XG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm4gU2VydmljZXMudGltZXJGb3IodGhpcy53aW4pXG4gICAgICAudGltZW91dFByb21pc2UoQ0xJQ0tfVElNRU9VVF8sIGxpc3RlblByb21pc2UpXG4gICAgICAudGhlbih0aGlzLmJvdW5kTW91c2VDYW5jZWxlZF8sICgpID0+IHtcbiAgICAgICAgaWYgKHVubGlzdGVuKSB7XG4gICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJvdW5kTW91c2VDb25maXJtZWRfKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBtb3VzZUNvbmZpcm1lZF8oKSB7XG4gICAgdGhpcy5oYXNNb3VzZV8gPSB0cnVlO1xuICAgIHRoaXMubW91c2VEZXRlY3RlZE9ic2VydmFibGVfLmZpcmUodHJ1ZSk7XG4gICAgZGV2KCkuZmluZShUQUdfLCAnbW91c2UgZGV0ZWN0ZWQnKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBtb3VzZUNhbmNlbGVkXygpIHtcbiAgICAvLyBSZXBlYXQsIGlmIGF0dGVtcHRzIGFsbG93LlxuICAgIHRoaXMubW91c2VDb25maXJtQXR0ZW1wdENvdW50XysrO1xuICAgIGlmICh0aGlzLm1vdXNlQ29uZmlybUF0dGVtcHRDb3VudF8gPD0gTUFYX01PVVNFX0NPTkZJUk1fQVRURU1QU18pIHtcbiAgICAgIGxpc3Rlbk9uY2UoXG4gICAgICAgIHRoaXMud2luLmRvY3VtZW50LFxuICAgICAgICAnbW91c2Vtb3ZlJyxcbiAgICAgICAgLyoqIEB0eXBlIHtmdW5jdGlvbighRXZlbnQpfSAqLyAodGhpcy5ib3VuZE9uTW91c2VNb3ZlXylcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRldigpLmZpbmUoVEFHXywgJ21vdXNlIGRldGVjdGlvbiBmYWlsZWQnKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbElucHV0U2VydmljZSh3aW4pIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW4sICdpbnB1dCcsIElucHV0KTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/input.js