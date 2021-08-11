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
import { isElement } from "./core/types";
import { dev } from "./log";
import { Services } from "./service";

/**
 * FocusHistory keeps track of recent focused elements. This history can be
 * purged using `purgeBefore` method.
 */
export var FocusHistory = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {number} purgeTimeout
   */
  function FocusHistory(win, purgeTimeout) {var _this = this;_classCallCheck(this, FocusHistory);
    /** @const {!Window} */
    this.win = win;

    /** @private @const {number} */
    this.purgeTimeout_ = purgeTimeout;

    /** @private @const {!Array<!{el: !Element, time: time}>} */
    this.history_ = [];

    /** @private @const {!Observable<!Element>} */
    this.observeFocus_ = new Observable();

    /**
     * @private
     * @param {!Event} e
     */
    this.captureFocus_ = function (e) {
      // Hack (#15079) due to Firefox firing focus events on the entire page
      if (isElement(e.target)) {
        _this.pushFocus_( /** @type {!Element} */(e.target));
      }
    };

    /**
     * @private
     * @param {*} unusedE
     */
    this.captureBlur_ = function (unusedE) {
      // IFrame elements do not receive `focus` event. An alternative way is
      // implemented here. We wait for a blur to arrive on the main window
      // and after a short time check which element is active.
      Services.timerFor(win).delay(function () {
        if (_this.win.document.activeElement) {
          _this.pushFocus_(_this.win.document.activeElement);
        }
      }, 500);
    };
    this.win.document.addEventListener('focus', this.captureFocus_, true);
    this.win.addEventListener('blur', this.captureBlur_);
  }

  /** @visibleForTesting */_createClass(FocusHistory, [{ key: "cleanup_", value:
    function cleanup_() {
      this.win.document.removeEventListener('focus', this.captureFocus_, true);
      this.win.removeEventListener('blur', this.captureBlur_);
    }

    /**
     * Add a listener for focus events.
     * @param {function(!Element)} handler
     * @return {!UnlistenDef}
     */ }, { key: "onFocus", value:
    function onFocus(handler) {
      return this.observeFocus_.add(handler);
    }

    /**
     * @param {!Element} element
     * @private
     */ }, { key: "pushFocus_", value:
    function pushFocus_(element) {
      var now = Date.now();
      if (
      this.history_.length == 0 ||
      this.history_[this.history_.length - 1].el != element)
      {
        this.history_.push({ el: element, time: now });
      } else {
        this.history_[this.history_.length - 1].time = now;
      }
      this.purgeBefore(now - this.purgeTimeout_);
      this.observeFocus_.fire(element);
    }

    /**
     * Returns the element that was focused last.
     * @return {?Element}
     */ }, { key: "getLast", value:
    function getLast() {
      if (this.history_.length == 0) {
        return null;
      }
      return this.history_[this.history_.length - 1].el;
    }

    /**
     * Removes elements from the history older than the specified time.
     * @param {time} time
     */ }, { key: "purgeBefore", value:
    function purgeBefore(time) {
      var index = this.history_.length - 1;
      for (var i = 0; i < this.history_.length; i++) {
        if (this.history_[i].time >= time) {
          index = i - 1;
          break;
        }
      }
      if (index != -1) {
        this.history_.splice(0, index + 1);
      }
    }

    /**
     * Returns `true` if the specified element contains any of the elements in
     * the history.
     * @param {!Element} element
     * @return {boolean}
     */ }, { key: "hasDescendantsOf", value:
    function hasDescendantsOf(element) {
      if (this.win.document.activeElement) {
        this.pushFocus_(this.win.document.activeElement);
      }
      for (var i = 0; i < this.history_.length; i++) {
        if (element.contains(this.history_[i].el)) {
          return true;
        }
      }
      return false;
    } }]);return FocusHistory;}();
// /Users/mszylkowski/src/amphtml/src/focus-history.js