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

import { throttle } from "../core/types/function";

/** @const {number} */
var SCROLL_THROTTLE_MS = 500;

/**
 * Creates an IntersectionObserver or fallback using scroll events.
 * Fires viewportCb when criteria is met and unobserves immediately after.
 */
export var AmpStoryPlayerViewportObserver = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {function():void} viewportCb
   */
  function AmpStoryPlayerViewportObserver(win, element, viewportCb) {_classCallCheck(this, AmpStoryPlayerViewportObserver);
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {function():void} */
    this.cb_ = viewportCb;

    /** @private {?function():void} */
    this.scrollHandler_ = null;

    this.initializeInObOrFallback_();
  }

  /** @private */_createClass(AmpStoryPlayerViewportObserver, [{ key: "initializeInObOrFallback_", value:
    function initializeInObOrFallback_() {
      if (!this.win_.IntersectionObserver || this.win_ !== this.win_.parent) {
        this.createInObFallback_();
        return;
      }

      this.createInOb_();
    }

    /**
     * Creates an IntersectionObserver.
     * @private
     */ }, { key: "createInOb_", value:
    function createInOb_() {var _this = this;
      var inObCallback = function inObCallback(entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          _this.cb_();
          observer.unobserve(_this.element_);
        });
      };

      var observer = new this.win_.IntersectionObserver(inObCallback);

      observer.observe(this.element_);
    }

    /**
     * Fallback for when IntersectionObserver is not supported. Calls
     * layoutPlayer on the element when it is close to the viewport.
     * @private
     */ }, { key: "createInObFallback_", value:
    function createInObFallback_() {
      this.scrollHandler_ = throttle(
      this.win_,
      this.checkIfVisibleFallback_.bind(this),
      SCROLL_THROTTLE_MS);


      this.win_.addEventListener('scroll', this.scrollHandler_);

      this.checkIfVisibleFallback_(this.element_);
    }

    /**
     * Checks if element is close to the viewport and calls the callback when it
     * is.
     * @private
     */ }, { key: "checkIfVisibleFallback_", value:
    function checkIfVisibleFallback_() {
      var elTop = this.element_. /*OK*/getBoundingClientRect().top;
      var winInnerHeight = this.win_. /*OK*/innerHeight;

      if (winInnerHeight > elTop) {
        this.cb_();
        this.win_.removeEventListener('scroll', this.scrollHandler_);
      }
    } }]);return AmpStoryPlayerViewportObserver;}();
// /Users/mszylkowski/src/amphtml/src/amp-story-player/amp-story-player-viewport-observer.js