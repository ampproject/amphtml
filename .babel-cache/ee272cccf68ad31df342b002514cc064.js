function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
  MAX: 14
};
export var ButtonTextFitter = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function ButtonTextFitter(ampdoc) {
    var _this = this;

    _classCallCheck(this, ButtonTextFitter);

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
        'letter-spacing': '0.2px'
      });
    });
  }

  /**
   * @param {!Element} pageElement
   * @param {!Element} container
   * @param {string} content
   * @return {Promise<boolean>}
   */
  _createClass(ButtonTextFitter, [{
    key: "fit",
    value: function fit(pageElement, container, content) {
      var _this2 = this;

      var success = false;
      return this.mutator_.mutateElement(container, function () {
        _this2.measurer_.textContent = content;
        var fontSize = calculateFontSize(_this2.measurer_, MAX_HEIGHT, _this2.getMaxWidth_(pageElement), FontSizes.MIN, FontSizes.MAX);

        if (fontSize >= FontSizes.MIN) {
          _this2.updateFontSize_(container, fontSize);

          success = true;
        }
      }).then(function () {
        return success;
      });
    }
    /**
     * Called on each button creation, in case of window resize.
     * Page width - (2 x 32px of padding on each side) + (2 x 10px padding on button).
     * @param {!Element} pageElement
     * @return {number}
     * @private
     */

  }, {
    key: "getMaxWidth_",
    value: function getMaxWidth_(pageElement) {
      return pageElement.
      /*OK*/
      offsetWidth - 84;
    }
    /**
     * @param {!Element} container
     * @param {number} fontSize
     */

  }, {
    key: "updateFontSize_",
    value: function updateFontSize_(container, fontSize) {
      setStyle(container, 'fontSize', px(fontSize));
    }
  }]);

  return ButtonTextFitter;
}();

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
function calculateFontSize(measurer, expectedHeight, expectedWidth, minFontSize, maxFontSize) {
  for (var fontSize = maxFontSize; fontSize >= minFontSize; fontSize--) {
    setStyle(measurer, 'fontSize', px(fontSize));
    var height = measurer.
    /*OK*/
    offsetHeight;
    var width = measurer.
    /*OK*/
    offsetWidth;

    if (height < expectedHeight && width < expectedWidth) {
      return fontSize;
    }
  }

  // Did not fit within design spec.
  return minFontSize - 1;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0b3J5LWFkLWJ1dHRvbi10ZXh0LWZpdHRlci5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsInB4Iiwic2V0U3R5bGUiLCJzZXRTdHlsZXMiLCJNQVhfSEVJR0hUIiwiRm9udFNpemVzIiwiTUlOIiwiTUFYIiwiQnV0dG9uVGV4dEZpdHRlciIsImFtcGRvYyIsIm11dGF0b3JfIiwibXV0YXRvckZvckRvYyIsImRvY18iLCJ3aW4iLCJkb2N1bWVudCIsIm1lYXN1cmVyXyIsImNyZWF0ZUVsZW1lbnQiLCJtdXRhdGVFbGVtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwicG9zaXRpb24iLCJ0b3AiLCJsZWZ0IiwiekluZGV4IiwidmlzaWJpbGl0eSIsInBhZ2VFbGVtZW50IiwiY29udGFpbmVyIiwiY29udGVudCIsInN1Y2Nlc3MiLCJ0ZXh0Q29udGVudCIsImZvbnRTaXplIiwiY2FsY3VsYXRlRm9udFNpemUiLCJnZXRNYXhXaWR0aF8iLCJ1cGRhdGVGb250U2l6ZV8iLCJ0aGVuIiwib2Zmc2V0V2lkdGgiLCJtZWFzdXJlciIsImV4cGVjdGVkSGVpZ2h0IiwiZXhwZWN0ZWRXaWR0aCIsIm1pbkZvbnRTaXplIiwibWF4Rm9udFNpemUiLCJoZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJ3aWR0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLEVBQVIsRUFBWUMsUUFBWixFQUFzQkMsU0FBdEI7O0FBRUE7QUFDQSxJQUFNQyxVQUFVLEdBQUcsRUFBbkI7O0FBRUE7QUFDQSxJQUFNQyxTQUFTLEdBQUc7QUFDaEJDLEVBQUFBLEdBQUcsRUFBRSxFQURXO0FBRWhCQyxFQUFBQSxHQUFHLEVBQUU7QUFGVyxDQUFsQjtBQUtBLFdBQWFDLGdCQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsNEJBQVlDLE1B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QUFHTCxRQUFRO0FBQUM7QUFBT00sSUFBQUEsWUFBL0I7QUFDQSxRQUFNQyxLQUFLLEdBQUdQLFFBQVE7QUFBQztBQUFPRCxJQUFBQSxXQUE5Qjs7QUFDQSxRQUFJTSxNQUFNLEdBQUdKLGNBQVQsSUFBMkJNLEtBQUssR0FBR0wsYUFBdkMsRUFBc0Q7QUFDcEQsYUFBT1IsUUFBUDtBQUNEO0FBQ0Y7O0FBQ0Q7QUFDQSxTQUFPUyxXQUFXLEdBQUcsQ0FBckI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge3B4LCBzZXRTdHlsZSwgc2V0U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG4vKiogQGNvbnN0IHtudW1iZXJ9IEZpeGVkIGJ1dHRvbiBoZWlnaHQgZnJvbSBkZXNpZ24gc3BlYy4gKi9cbmNvbnN0IE1BWF9IRUlHSFQgPSAzMjtcblxuLyoqIEBlbnVtIHtudW1iZXJ9IEZyb20gZGVzaWduIHNwZWMuICovXG5jb25zdCBGb250U2l6ZXMgPSB7XG4gIE1JTjogMTIsXG4gIE1BWDogMTQsXG59O1xuXG5leHBvcnQgY2xhc3MgQnV0dG9uVGV4dEZpdHRlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jKSB7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL211dGF0b3ItaW50ZXJmYWNlLk11dGF0b3JJbnRlcmZhY2V9ICovXG4gICAgdGhpcy5tdXRhdG9yXyA9IFNlcnZpY2VzLm11dGF0b3JGb3JEb2MoYW1wZG9jKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IURvY3VtZW50fSAqL1xuICAgIHRoaXMuZG9jXyA9IGFtcGRvYy53aW4uZG9jdW1lbnQ7XG5cbiAgICAvKiogQHByaXZhdGUgeyFFbGVtZW50fSAqL1xuICAgIHRoaXMubWVhc3VyZXJfID0gdGhpcy5kb2NfLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgdGhpcy5tdXRhdG9yXy5tdXRhdGVFbGVtZW50KHRoaXMubWVhc3VyZXJfLCAoKSA9PiB7XG4gICAgICB0aGlzLmRvY18uYm9keS5hcHBlbmRDaGlsZCh0aGlzLm1lYXN1cmVyXyk7XG4gICAgICBzZXRTdHlsZXModGhpcy5tZWFzdXJlcl8sIHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgekluZGV4OiAxLFxuICAgICAgICB2aXNpYmlsaXR5OiAnaGlkZGVuJyxcbiAgICAgICAgJ2ZvbnQtd2VpZ2h0JzogJ2JvbGQnLFxuICAgICAgICAnbGV0dGVyLXNwYWNpbmcnOiAnMC4ycHgnLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFnZUVsZW1lbnRcbiAgICogQHBhcmFtIHshRWxlbWVudH0gY29udGFpbmVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50XG4gICAqIEByZXR1cm4ge1Byb21pc2U8Ym9vbGVhbj59XG4gICAqL1xuICBmaXQocGFnZUVsZW1lbnQsIGNvbnRhaW5lciwgY29udGVudCkge1xuICAgIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMubXV0YXRvcl9cbiAgICAgIC5tdXRhdGVFbGVtZW50KGNvbnRhaW5lciwgKCkgPT4ge1xuICAgICAgICB0aGlzLm1lYXN1cmVyXy50ZXh0Q29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IGZvbnRTaXplID0gY2FsY3VsYXRlRm9udFNpemUoXG4gICAgICAgICAgdGhpcy5tZWFzdXJlcl8sXG4gICAgICAgICAgTUFYX0hFSUdIVCxcbiAgICAgICAgICB0aGlzLmdldE1heFdpZHRoXyhwYWdlRWxlbWVudCksXG4gICAgICAgICAgRm9udFNpemVzLk1JTixcbiAgICAgICAgICBGb250U2l6ZXMuTUFYXG4gICAgICAgICk7XG4gICAgICAgIGlmIChmb250U2l6ZSA+PSBGb250U2l6ZXMuTUlOKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVGb250U2l6ZV8oY29udGFpbmVyLCBmb250U2l6ZSk7XG4gICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIGVhY2ggYnV0dG9uIGNyZWF0aW9uLCBpbiBjYXNlIG9mIHdpbmRvdyByZXNpemUuXG4gICAqIFBhZ2Ugd2lkdGggLSAoMiB4IDMycHggb2YgcGFkZGluZyBvbiBlYWNoIHNpZGUpICsgKDIgeCAxMHB4IHBhZGRpbmcgb24gYnV0dG9uKS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFnZUVsZW1lbnRcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0TWF4V2lkdGhfKHBhZ2VFbGVtZW50KSB7XG4gICAgcmV0dXJuIHBhZ2VFbGVtZW50Li8qT0sqLyBvZmZzZXRXaWR0aCAtIDg0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGNvbnRhaW5lclxuICAgKiBAcGFyYW0ge251bWJlcn0gZm9udFNpemVcbiAgICovXG4gIHVwZGF0ZUZvbnRTaXplXyhjb250YWluZXIsIGZvbnRTaXplKSB7XG4gICAgc2V0U3R5bGUoY29udGFpbmVyLCAnZm9udFNpemUnLCBweChmb250U2l6ZSkpO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyB1c2VkIHRvIGJlIGJpbmFyeSBzZWFyY2gsIGJ1dCBzaW5jZSByYW5nZSBpcyBzbyBzbWFsbCBqdXN0IHRyeSB0aGUgM1xuICogdmFsdWVzLiBJZiByYW5nZSBnZXRzIGxhcmdlciwgcmVldmFsdWF0ZS5cbiAqIEBwYXJhbSB7RWxlbWVudH0gbWVhc3VyZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBleHBlY3RlZEhlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IGV4cGVjdGVkV2lkdGhcbiAqIEBwYXJhbSB7bnVtYmVyfSBtaW5Gb250U2l6ZVxuICogQHBhcmFtIHtudW1iZXJ9IG1heEZvbnRTaXplXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUZvbnRTaXplKFxuICBtZWFzdXJlcixcbiAgZXhwZWN0ZWRIZWlnaHQsXG4gIGV4cGVjdGVkV2lkdGgsXG4gIG1pbkZvbnRTaXplLFxuICBtYXhGb250U2l6ZVxuKSB7XG4gIGZvciAobGV0IGZvbnRTaXplID0gbWF4Rm9udFNpemU7IGZvbnRTaXplID49IG1pbkZvbnRTaXplOyBmb250U2l6ZS0tKSB7XG4gICAgc2V0U3R5bGUobWVhc3VyZXIsICdmb250U2l6ZScsIHB4KGZvbnRTaXplKSk7XG4gICAgY29uc3QgaGVpZ2h0ID0gbWVhc3VyZXIuLypPSyovIG9mZnNldEhlaWdodDtcbiAgICBjb25zdCB3aWR0aCA9IG1lYXN1cmVyLi8qT0sqLyBvZmZzZXRXaWR0aDtcbiAgICBpZiAoaGVpZ2h0IDwgZXhwZWN0ZWRIZWlnaHQgJiYgd2lkdGggPCBleHBlY3RlZFdpZHRoKSB7XG4gICAgICByZXR1cm4gZm9udFNpemU7XG4gICAgfVxuICB9XG4gIC8vIERpZCBub3QgZml0IHdpdGhpbiBkZXNpZ24gc3BlYy5cbiAgcmV0dXJuIG1pbkZvbnRTaXplIC0gMTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-button-text-fitter.js