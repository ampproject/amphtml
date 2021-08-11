function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/** Polyfill for the public AbortController. */var
AbortController = /*#__PURE__*/function () {
  /** Constructor. */
  function AbortController() {_classCallCheck(this, AbortController);
    /** @const {!AbortSignal} */
    this.signal_ = new AbortSignal();
  }

  /** Triggers an abort signal. */_createClass(AbortController, [{ key: "abort", value:
    function abort() {
      if (this.signal_.isAborted_) {
        // Already aborted.
        return;
      }
      this.signal_.isAborted_ = true;
      if (this.signal_.onabort_) {
        var event = /** @type {!Event} */({
          'type': 'abort',
          'bubbles': false,
          'cancelable': false,
          'target': this.signal_,
          'currentTarget': this.signal_ });

        this.signal_.onabort_(event);
      }
    }

    /** @return {!AbortSignal} */ }, { key: "signal", get:
    function get() {
      return this.signal_;
    } }]);return AbortController;}();


/** Polyfill for the public AbortSignal. */var
AbortSignal = /*#__PURE__*/function () {
  /** */
  function AbortSignal() {_classCallCheck(this, AbortSignal);
    /** @private {boolean} */
    this.isAborted_ = false;
    /** @private {?function(!Event)} */
    this.onabort_ = null;
  }

  /** @return {boolean} */_createClass(AbortSignal, [{ key: "aborted", get:
    function get() {
      return this.isAborted_;
    }

    /** @return {?function(!Event)} */ }, { key: "onabort", get:
    function get() {
      return this.onabort_;
    }

    /** @param {?function(!Event)} value */, set:
    function set(value) {
      this.onabort_ = value;
    } }]);return AbortSignal;}();


/**
 * Sets the AbortController and AbortSignal polyfills if not defined.
 * @param {!Window} win
 */
export function install(win) {
  if (win.AbortController) {
    return;
  }
  Object.defineProperty(win, 'AbortController', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: AbortController });

  Object.defineProperty(win, 'AbortSignal', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: AbortSignal });

}
// /Users/mszylkowski/src/amphtml/src/polyfills/abort-controller.js