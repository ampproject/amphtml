function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import { Services } from "../../../src/service";
import { px, setStyle, setStyles } from "../../../src/core/dom/style";

/** @const {number} Fixed button height from design spec. */
var MAX_HEIGHT = 32;

/** @enum {number} From design spec. */
var FontSizes = {
  MIN: 12,
  MAX: 14 };


export var ButtonTextFitter = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function ButtonTextFitter(ampdoc) {var _this = this;_classCallCheck(this, ButtonTextFitter);
    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    /** @private {!Document} */
    this.doc_ = ampdoc.win.document;

    /** @private {!Element} */
    this.measurer_ = this.doc_.createElement('div');

    this.mutator_.mutateElement(this.measurer_, function () {
      _this.doc_.body.appendChild(_this.measurer_);
      setStyles(_this.measurer_, {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        visibility: 'hidden',
        'font-weight': 'bold',
        'letter-spacing': '0.2px' });

    });
  }

  /**
   * @param {!Element} pageElement
   * @param {!Element} container
   * @param {string} content
   * @return {Promise<boolean>}
   */_createClass(ButtonTextFitter, [{ key: "fit", value:
    function fit(pageElement, container, content) {var _this2 = this;
      var success = false;
      return this.mutator_.
      mutateElement(container, function () {
        _this2.measurer_.textContent = content;
        var fontSize = calculateFontSize(
        _this2.measurer_,
        MAX_HEIGHT,
        _this2.getMaxWidth_(pageElement),
        FontSizes.MIN,
        FontSizes.MAX);

        if (fontSize >= FontSizes.MIN) {
          _this2.updateFontSize_(container, fontSize);
          success = true;
        }
      }).
      then(function () {
        return success;
      });
    }

    /**
     * Called on each button creation, in case of window resize.
     * Page width - (2 x 32px of padding on each side) + (2 x 10px padding on button).
     * @param {!Element} pageElement
     * @return {number}
     * @private
     */ }, { key: "getMaxWidth_", value:
    function getMaxWidth_(pageElement) {
      return pageElement. /*OK*/offsetWidth - 84;
    }

    /**
     * @param {!Element} container
     * @param {number} fontSize
     */ }, { key: "updateFontSize_", value:
    function updateFontSize_(container, fontSize) {
      setStyle(container, 'fontSize', px(fontSize));
    } }]);return ButtonTextFitter;}();


/**
 * This used to be binary search, but since range is so small just try the 3
 * values. If range gets larger, reevaluate.
 * @param {Element} measurer
 * @param {number} expectedHeight
 * @param {number} expectedWidth
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 */
function calculateFontSize(
measurer,
expectedHeight,
expectedWidth,
minFontSize,
maxFontSize)
{
  for (var fontSize = maxFontSize; fontSize >= minFontSize; fontSize--) {
    setStyle(measurer, 'fontSize', px(fontSize));
    var height = measurer. /*OK*/offsetHeight;
    var width = measurer. /*OK*/offsetWidth;
    if (height < expectedHeight && width < expectedWidth) {
      return fontSize;
    }
  }
  // Did not fit within design spec.
  return minFontSize - 1;
}
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-button-text-fitter.js