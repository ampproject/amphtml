function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

import { Services } from "../../service";
import { registerElement } from "../../service/custom-element-registry";

import { BaseElement } from "../../base-element";
import { dev, userAssert } from "../../log";
import { createPixel } from "../../pixel";

var TAG = 'amp-pixel';

/**
 * A simple analytics instrument. Fires as an impression signal.
 */
export var AmpPixel = /*#__PURE__*/function (_BaseElement) {_inherits(AmpPixel, _BaseElement);var _super = _createSuper(AmpPixel);
  /** @override */
  function AmpPixel(element) {var _this;_classCallCheck(this, AmpPixel);
    _this = _super.call(this, element);

    /** @private {?Promise<!Image>} */
    _this.triggerPromise_ = null;return _this;
  }

  /** @override */_createClass(AmpPixel, [{ key: "isLayoutSupported", value:
    function isLayoutSupported(unusedLayout) {
      // No matter what layout is: the pixel is always non-displayed.
      return true;
    }

    /** @override */ }, { key: "buildCallback", value:
    function buildCallback() {
      // Element is invisible.
      this.element.setAttribute('aria-hidden', 'true');

      /** @private {?string} */
      this.referrerPolicy_ = this.element.getAttribute('referrerpolicy');
      if (this.referrerPolicy_) {
        // Safari doesn't support referrerPolicy yet. We're using an
        // iframe based trick to remove referrer, which apparently can
        // only do "no-referrer".
        userAssert(
        this.referrerPolicy_ == 'no-referrer',
        "".concat(TAG, ": invalid \"referrerpolicy\" value \"").concat(this.referrerPolicy_, "\".") +
        ' Only "no-referrer" is supported');

      }
      if (
      this.element.hasAttribute('i-amphtml-ssr') &&
      this.element.querySelector('img'))
      {
        dev().info(TAG, 'inabox img already present');
        return;
      }
      // Trigger, but only when visible.
      this.getAmpDoc().whenFirstVisible().then(this.trigger_.bind(this));
    }

    /**
     * Triggers the signal.
     * @return {*} TODO(#23582): Specify return type
     * @private
     */ }, { key: "trigger_", value:
    function trigger_() {var _this2 = this;
      if (this.triggerPromise_) {
        // TODO(dvoytenko, #8780): monitor, confirm if there's a bug and remove.
        dev().error(TAG, 'duplicate pixel');
        return this.triggerPromise_;
      }
      // Delay(1) provides a rudimentary "idle" signal.
      // TODO(dvoytenko): use an improved idle signal when available.
      this.triggerPromise_ = Services.timerFor(this.win).
      promise(1).
      then(function () {
        var src = _this2.element.getAttribute('src');
        if (!src) {
          return;
        }
        return Services.urlReplacementsForDoc(_this2.element).
        expandUrlAsync(_this2.assertSource_(src)).
        then(function (src) {
          if (!_this2.win) {
            return;
          }
          var pixel = createPixel(_this2.win, src, _this2.referrerPolicy_);
          dev().info(TAG, 'pixel triggered: ', src);
          return pixel;
        });
      });
    }

    /**
     * @param {?string} src
     * @return {string}
     * @private
     */ }, { key: "assertSource_", value:
    function assertSource_(src) {
      userAssert(
      /^(https\:\/\/|\/\/)/i.test(src),
      'The <amp-pixel> src attribute must start with ' +
      '"https://" or "//". Invalid value: ' +
      src);

      return (/** @type {string} */(src));
    } }]);return AmpPixel;}(BaseElement);


/**
 * @param {!Window} win Destination window for the new element.
 */
export function installPixel(win) {
  registerElement(win, TAG, AmpPixel);
}
// /Users/mszylkowski/src/amphtml/src/builtins/amp-pixel/amp-pixel.js