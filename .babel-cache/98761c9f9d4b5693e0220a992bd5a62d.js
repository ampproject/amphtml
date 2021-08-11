function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { Services } from "../../service";
import { registerElement } from "../../service/custom-element-registry";
import { BaseElement } from "../../base-element";
import { dev, userAssert } from "../../log";
import { createPixel } from "../../pixel";
var TAG = 'amp-pixel';

/**
 * A simple analytics instrument. Fires as an impression signal.
 */
export var AmpPixel = /*#__PURE__*/function (_BaseElement) {
  _inherits(AmpPixel, _BaseElement);

  var _super = _createSuper(AmpPixel);

  /** @override */
  function AmpPixel(element) {
    var _this;

    _classCallCheck(this, AmpPixel);

    _this = _super.call(this, element);

    /** @private {?Promise<!Image>} */
    _this.triggerPromise_ = null;
    return _this;
  }

  /** @override */
  _createClass(AmpPixel, [{
    key: "isLayoutSupported",
    value: function isLayoutSupported(unusedLayout) {
      // No matter what layout is: the pixel is always non-displayed.
      return true;
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      // Element is invisible.
      this.element.setAttribute('aria-hidden', 'true');

      /** @private {?string} */
      this.referrerPolicy_ = this.element.getAttribute('referrerpolicy');

      if (this.referrerPolicy_) {
        // Safari doesn't support referrerPolicy yet. We're using an
        // iframe based trick to remove referrer, which apparently can
        // only do "no-referrer".
        userAssert(this.referrerPolicy_ == 'no-referrer', TAG + ": invalid \"referrerpolicy\" value \"" + this.referrerPolicy_ + "\"." + ' Only "no-referrer" is supported');
      }

      if (this.element.hasAttribute('i-amphtml-ssr') && this.element.querySelector('img')) {
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
     */

  }, {
    key: "trigger_",
    value: function trigger_() {
      var _this2 = this;

      if (this.triggerPromise_) {
        // TODO(dvoytenko, #8780): monitor, confirm if there's a bug and remove.
        dev().error(TAG, 'duplicate pixel');
        return this.triggerPromise_;
      }

      // Delay(1) provides a rudimentary "idle" signal.
      // TODO(dvoytenko): use an improved idle signal when available.
      this.triggerPromise_ = Services.timerFor(this.win).promise(1).then(function () {
        var src = _this2.element.getAttribute('src');

        if (!src) {
          return;
        }

        return Services.urlReplacementsForDoc(_this2.element).expandUrlAsync(_this2.assertSource_(src)).then(function (src) {
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
     */

  }, {
    key: "assertSource_",
    value: function assertSource_(src) {
      userAssert(/^(https\:\/\/|\/\/)/i.test(src), 'The <amp-pixel> src attribute must start with ' + '"https://" or "//". Invalid value: ' + src);
      return (
        /** @type {string} */
        src
      );
    }
  }]);

  return AmpPixel;
}(BaseElement);

/**
 * @param {!Window} win Destination window for the new element.
 */
export function installPixel(win) {
  registerElement(win, TAG, AmpPixel);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1waXhlbC5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsInJlZ2lzdGVyRWxlbWVudCIsIkJhc2VFbGVtZW50IiwiZGV2IiwidXNlckFzc2VydCIsImNyZWF0ZVBpeGVsIiwiVEFHIiwiQW1wUGl4ZWwiLCJlbGVtZW50IiwidHJpZ2dlclByb21pc2VfIiwidW51c2VkTGF5b3V0Iiwic2V0QXR0cmlidXRlIiwicmVmZXJyZXJQb2xpY3lfIiwiZ2V0QXR0cmlidXRlIiwiaGFzQXR0cmlidXRlIiwicXVlcnlTZWxlY3RvciIsImluZm8iLCJnZXRBbXBEb2MiLCJ3aGVuRmlyc3RWaXNpYmxlIiwidGhlbiIsInRyaWdnZXJfIiwiYmluZCIsImVycm9yIiwidGltZXJGb3IiLCJ3aW4iLCJwcm9taXNlIiwic3JjIiwidXJsUmVwbGFjZW1lbnRzRm9yRG9jIiwiZXhwYW5kVXJsQXN5bmMiLCJhc3NlcnRTb3VyY2VfIiwicGl4ZWwiLCJ0ZXN0IiwiaW5zdGFsbFBpeGVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFFBQVI7QUFDQSxTQUFRQyxlQUFSO0FBRUEsU0FBUUMsV0FBUjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsVUFBYjtBQUNBLFNBQVFDLFdBQVI7QUFFQSxJQUFNQyxHQUFHLEdBQUcsV0FBWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxRQUFiO0FBQUE7O0FBQUE7O0FBQ0U7QUFDQSxvQkFBWUMsT0FBWixFQUFxQjtBQUFBOztBQUFBOztBQUNuQiw4QkFBTUEsT0FBTjs7QUFFQTtBQUNBLFVBQUtDLGVBQUwsR0FBdUIsSUFBdkI7QUFKbUI7QUFLcEI7O0FBRUQ7QUFURjtBQUFBO0FBQUEsV0FVRSwyQkFBa0JDLFlBQWxCLEVBQWdDO0FBQzlCO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7QUFFRDs7QUFmRjtBQUFBO0FBQUEsV0FnQkUseUJBQWdCO0FBQ2Q7QUFDQSxXQUFLRixPQUFMLENBQWFHLFlBQWIsQ0FBMEIsYUFBMUIsRUFBeUMsTUFBekM7O0FBRUE7QUFDQSxXQUFLQyxlQUFMLEdBQXVCLEtBQUtKLE9BQUwsQ0FBYUssWUFBYixDQUEwQixnQkFBMUIsQ0FBdkI7O0FBQ0EsVUFBSSxLQUFLRCxlQUFULEVBQTBCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBUixRQUFBQSxVQUFVLENBQ1IsS0FBS1EsZUFBTCxJQUF3QixhQURoQixFQUVMTixHQUFILDZDQUEyQyxLQUFLTSxlQUFoRCxXQUNFLGtDQUhNLENBQVY7QUFLRDs7QUFDRCxVQUNFLEtBQUtKLE9BQUwsQ0FBYU0sWUFBYixDQUEwQixlQUExQixLQUNBLEtBQUtOLE9BQUwsQ0FBYU8sYUFBYixDQUEyQixLQUEzQixDQUZGLEVBR0U7QUFDQVosUUFBQUEsR0FBRyxHQUFHYSxJQUFOLENBQVdWLEdBQVgsRUFBZ0IsNEJBQWhCO0FBQ0E7QUFDRDs7QUFDRDtBQUNBLFdBQUtXLFNBQUwsR0FBaUJDLGdCQUFqQixHQUFvQ0MsSUFBcEMsQ0FBeUMsS0FBS0MsUUFBTCxDQUFjQyxJQUFkLENBQW1CLElBQW5CLENBQXpDO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQS9DQTtBQUFBO0FBQUEsV0FnREUsb0JBQVc7QUFBQTs7QUFDVCxVQUFJLEtBQUtaLGVBQVQsRUFBMEI7QUFDeEI7QUFDQU4sUUFBQUEsR0FBRyxHQUFHbUIsS0FBTixDQUFZaEIsR0FBWixFQUFpQixpQkFBakI7QUFDQSxlQUFPLEtBQUtHLGVBQVo7QUFDRDs7QUFDRDtBQUNBO0FBQ0EsV0FBS0EsZUFBTCxHQUF1QlQsUUFBUSxDQUFDdUIsUUFBVCxDQUFrQixLQUFLQyxHQUF2QixFQUNwQkMsT0FEb0IsQ0FDWixDQURZLEVBRXBCTixJQUZvQixDQUVmLFlBQU07QUFDVixZQUFNTyxHQUFHLEdBQUcsTUFBSSxDQUFDbEIsT0FBTCxDQUFhSyxZQUFiLENBQTBCLEtBQTFCLENBQVo7O0FBQ0EsWUFBSSxDQUFDYSxHQUFMLEVBQVU7QUFDUjtBQUNEOztBQUNELGVBQU8xQixRQUFRLENBQUMyQixxQkFBVCxDQUErQixNQUFJLENBQUNuQixPQUFwQyxFQUNKb0IsY0FESSxDQUNXLE1BQUksQ0FBQ0MsYUFBTCxDQUFtQkgsR0FBbkIsQ0FEWCxFQUVKUCxJQUZJLENBRUMsVUFBQ08sR0FBRCxFQUFTO0FBQ2IsY0FBSSxDQUFDLE1BQUksQ0FBQ0YsR0FBVixFQUFlO0FBQ2I7QUFDRDs7QUFDRCxjQUFNTSxLQUFLLEdBQUd6QixXQUFXLENBQUMsTUFBSSxDQUFDbUIsR0FBTixFQUFXRSxHQUFYLEVBQWdCLE1BQUksQ0FBQ2QsZUFBckIsQ0FBekI7QUFDQVQsVUFBQUEsR0FBRyxHQUFHYSxJQUFOLENBQVdWLEdBQVgsRUFBZ0IsbUJBQWhCLEVBQXFDb0IsR0FBckM7QUFDQSxpQkFBT0ksS0FBUDtBQUNELFNBVEksQ0FBUDtBQVVELE9BakJvQixDQUF2QjtBQWtCRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBaEZBO0FBQUE7QUFBQSxXQWlGRSx1QkFBY0osR0FBZCxFQUFtQjtBQUNqQnRCLE1BQUFBLFVBQVUsQ0FDUix1QkFBdUIyQixJQUF2QixDQUE0QkwsR0FBNUIsQ0FEUSxFQUVSLG1EQUNFLHFDQURGLEdBRUVBLEdBSk0sQ0FBVjtBQU1BO0FBQU87QUFBdUJBLFFBQUFBO0FBQTlCO0FBQ0Q7QUF6Rkg7O0FBQUE7QUFBQSxFQUE4QnhCLFdBQTlCOztBQTRGQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVM4QixZQUFULENBQXNCUixHQUF0QixFQUEyQjtBQUNoQ3ZCLEVBQUFBLGVBQWUsQ0FBQ3VCLEdBQUQsRUFBTWxCLEdBQU4sRUFBV0MsUUFBWCxDQUFmO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtyZWdpc3RlckVsZW1lbnR9IGZyb20gJyNzZXJ2aWNlL2N1c3RvbS1lbGVtZW50LXJlZ2lzdHJ5JztcblxuaW1wb3J0IHtCYXNlRWxlbWVudH0gZnJvbSAnLi4vLi4vYmFzZS1lbGVtZW50JztcbmltcG9ydCB7ZGV2LCB1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi9sb2cnO1xuaW1wb3J0IHtjcmVhdGVQaXhlbH0gZnJvbSAnLi4vLi4vcGl4ZWwnO1xuXG5jb25zdCBUQUcgPSAnYW1wLXBpeGVsJztcblxuLyoqXG4gKiBBIHNpbXBsZSBhbmFseXRpY3MgaW5zdHJ1bWVudC4gRmlyZXMgYXMgYW4gaW1wcmVzc2lvbiBzaWduYWwuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbXBQaXhlbCBleHRlbmRzIEJhc2VFbGVtZW50IHtcbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG5cbiAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlPCFJbWFnZT59ICovXG4gICAgdGhpcy50cmlnZ2VyUHJvbWlzZV8gPSBudWxsO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0xheW91dFN1cHBvcnRlZCh1bnVzZWRMYXlvdXQpIHtcbiAgICAvLyBObyBtYXR0ZXIgd2hhdCBsYXlvdXQgaXM6IHRoZSBwaXhlbCBpcyBhbHdheXMgbm9uLWRpc3BsYXllZC5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjaygpIHtcbiAgICAvLyBFbGVtZW50IGlzIGludmlzaWJsZS5cbiAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAvKiogQHByaXZhdGUgez9zdHJpbmd9ICovXG4gICAgdGhpcy5yZWZlcnJlclBvbGljeV8gPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdyZWZlcnJlcnBvbGljeScpO1xuICAgIGlmICh0aGlzLnJlZmVycmVyUG9saWN5Xykge1xuICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCByZWZlcnJlclBvbGljeSB5ZXQuIFdlJ3JlIHVzaW5nIGFuXG4gICAgICAvLyBpZnJhbWUgYmFzZWQgdHJpY2sgdG8gcmVtb3ZlIHJlZmVycmVyLCB3aGljaCBhcHBhcmVudGx5IGNhblxuICAgICAgLy8gb25seSBkbyBcIm5vLXJlZmVycmVyXCIuXG4gICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICB0aGlzLnJlZmVycmVyUG9saWN5XyA9PSAnbm8tcmVmZXJyZXInLFxuICAgICAgICBgJHtUQUd9OiBpbnZhbGlkIFwicmVmZXJyZXJwb2xpY3lcIiB2YWx1ZSBcIiR7dGhpcy5yZWZlcnJlclBvbGljeV99XCIuYCArXG4gICAgICAgICAgJyBPbmx5IFwibm8tcmVmZXJyZXJcIiBpcyBzdXBwb3J0ZWQnXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdpLWFtcGh0bWwtc3NyJykgJiZcbiAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbWcnKVxuICAgICkge1xuICAgICAgZGV2KCkuaW5mbyhUQUcsICdpbmFib3ggaW1nIGFscmVhZHkgcHJlc2VudCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUcmlnZ2VyLCBidXQgb25seSB3aGVuIHZpc2libGUuXG4gICAgdGhpcy5nZXRBbXBEb2MoKS53aGVuRmlyc3RWaXNpYmxlKCkudGhlbih0aGlzLnRyaWdnZXJfLmJpbmQodGhpcykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIHRoZSBzaWduYWwuXG4gICAqIEByZXR1cm4geyp9IFRPRE8oIzIzNTgyKTogU3BlY2lmeSByZXR1cm4gdHlwZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdHJpZ2dlcl8oKSB7XG4gICAgaWYgKHRoaXMudHJpZ2dlclByb21pc2VfKSB7XG4gICAgICAvLyBUT0RPKGR2b3l0ZW5rbywgIzg3ODApOiBtb25pdG9yLCBjb25maXJtIGlmIHRoZXJlJ3MgYSBidWcgYW5kIHJlbW92ZS5cbiAgICAgIGRldigpLmVycm9yKFRBRywgJ2R1cGxpY2F0ZSBwaXhlbCcpO1xuICAgICAgcmV0dXJuIHRoaXMudHJpZ2dlclByb21pc2VfO1xuICAgIH1cbiAgICAvLyBEZWxheSgxKSBwcm92aWRlcyBhIHJ1ZGltZW50YXJ5IFwiaWRsZVwiIHNpZ25hbC5cbiAgICAvLyBUT0RPKGR2b3l0ZW5rbyk6IHVzZSBhbiBpbXByb3ZlZCBpZGxlIHNpZ25hbCB3aGVuIGF2YWlsYWJsZS5cbiAgICB0aGlzLnRyaWdnZXJQcm9taXNlXyA9IFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMud2luKVxuICAgICAgLnByb21pc2UoMSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc3JjID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICAgIGlmICghc3JjKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBTZXJ2aWNlcy51cmxSZXBsYWNlbWVudHNGb3JEb2ModGhpcy5lbGVtZW50KVxuICAgICAgICAgIC5leHBhbmRVcmxBc3luYyh0aGlzLmFzc2VydFNvdXJjZV8oc3JjKSlcbiAgICAgICAgICAudGhlbigoc3JjKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMud2luKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBpeGVsID0gY3JlYXRlUGl4ZWwodGhpcy53aW4sIHNyYywgdGhpcy5yZWZlcnJlclBvbGljeV8pO1xuICAgICAgICAgICAgZGV2KCkuaW5mbyhUQUcsICdwaXhlbCB0cmlnZ2VyZWQ6ICcsIHNyYyk7XG4gICAgICAgICAgICByZXR1cm4gcGl4ZWw7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IHNyY1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3NlcnRTb3VyY2VfKHNyYykge1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICAvXihodHRwc1xcOlxcL1xcL3xcXC9cXC8pL2kudGVzdChzcmMpLFxuICAgICAgJ1RoZSA8YW1wLXBpeGVsPiBzcmMgYXR0cmlidXRlIG11c3Qgc3RhcnQgd2l0aCAnICtcbiAgICAgICAgJ1wiaHR0cHM6Ly9cIiBvciBcIi8vXCIuIEludmFsaWQgdmFsdWU6ICcgK1xuICAgICAgICBzcmNcbiAgICApO1xuICAgIHJldHVybiAvKiogQHR5cGUge3N0cmluZ30gKi8gKHNyYyk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpbiBEZXN0aW5hdGlvbiB3aW5kb3cgZm9yIHRoZSBuZXcgZWxlbWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxQaXhlbCh3aW4pIHtcbiAgcmVnaXN0ZXJFbGVtZW50KHdpbiwgVEFHLCBBbXBQaXhlbCk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/builtins/amp-pixel/amp-pixel.js