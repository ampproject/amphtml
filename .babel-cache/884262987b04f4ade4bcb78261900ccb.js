var _templateObject;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import { AmpStoryInteractive, InteractiveType } from "./amp-story-interactive-abstract";
import { CSS } from "../../../build/amp-story-interactive-img-poll-0.1.css";
import { CSS as ImgCSS } from "../../../build/amp-story-interactive-img-0.1.css";
import { buildImgTemplate } from "./utils";
import { htmlFor } from "../../../src/core/dom/static-template";
import { setImportantStyles } from "../../../src/core/dom/style";

/**
 * Generates the template for each option.
 *
 * @param {!Element} option
 * @return {!Element}
 */
var buildOptionTemplate = function buildOptionTemplate(option) {
  var html = htmlFor(option);
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <button\n      class=\"i-amphtml-story-interactive-img-option i-amphtml-story-interactive-option\"\n      aria-live=\"polite\"\n    >\n      <div class=\"i-amphtml-story-interactive-img-option-img\">\n        <span\n          class=\"i-amphtml-story-interactive-img-option-percentage-text\"\n        ></span>\n      </div>\n    </button>\n  "])));
};

export var AmpStoryInteractiveImgPoll = /*#__PURE__*/function (_AmpStoryInteractive) {
  _inherits(AmpStoryInteractiveImgPoll, _AmpStoryInteractive);

  var _super = _createSuper(AmpStoryInteractiveImgPoll);

  /**
   * @param {!AmpElement} element
   */
  function AmpStoryInteractiveImgPoll(element) {
    _classCallCheck(this, AmpStoryInteractiveImgPoll);

    return _super.call(this, element, InteractiveType.POLL);
  }

  /** @override */
  _createClass(AmpStoryInteractiveImgPoll, [{
    key: "buildCallback",
    value: function buildCallback() {
      return _get(_getPrototypeOf(AmpStoryInteractiveImgPoll.prototype), "buildCallback", this).call(this, CSS + ImgCSS);
    }
    /** @override */

  }, {
    key: "buildComponent",
    value: function buildComponent() {
      this.rootEl_ = buildImgTemplate(this.element);
      this.attachContent_(this.rootEl_);
      return this.rootEl_;
    }
    /**
     * Finds the prompt and options content
     * and adds it to the poll element.
     *
     * @private
     * @param {Element} root
     */

  }, {
    key: "attachContent_",
    value: function attachContent_(root) {
      var _this = this;

      this.attachPrompt_(root);
      var optionContainer = this.rootEl_.querySelector('.i-amphtml-story-interactive-img-option-container');
      this.options_.forEach(function (option, index) {
        return optionContainer.appendChild(_this.configureOption_(option, index));
      });
    }
    /**
     * Creates and returns an option container with option content,
     * adds styling and answer choices.
     *
     * @param {!./amp-story-interactive-abstract.OptionConfigType} option
     * @return {!Element}
     * @private
     */

  }, {
    key: "configureOption_",
    value: function configureOption_(option) {
      var convertedOption = buildOptionTemplate(this.element);
      convertedOption.optionIndex_ = option['optionIndex'];
      // Extract and structure the option information
      setImportantStyles(convertedOption.querySelector('.i-amphtml-story-interactive-img-option-img'), {
        'background-image': 'url(' + option['image'] + ')'
      });
      convertedOption.setAttribute('aria-label', option['imagealt']);
      return convertedOption;
    }
    /**
     * @override
     */

  }, {
    key: "displayOptionsData",
    value: function displayOptionsData(optionsData) {
      var _this2 = this;

      if (!optionsData) {
        return;
      }

      var percentages = this.preprocessPercentages_(optionsData);
      this.getOptionElements().forEach(function (el, index) {
        if (optionsData[index].selected) {
          el.setAttribute('aria-label', 'selected ' + _this2.options_[index]['imagealt']);
        }

        el.querySelector('.i-amphtml-story-interactive-img-option-percentage-text').textContent = percentages[index] + "%";
        setImportantStyles(el, {
          '--option-percentage': percentages[index] / 100
        });
      });
    }
  }]);

  return AmpStoryInteractiveImgPoll;
}(AmpStoryInteractive);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctcG9sbC5qcyJdLCJuYW1lcyI6WyJBbXBTdG9yeUludGVyYWN0aXZlIiwiSW50ZXJhY3RpdmVUeXBlIiwiQ1NTIiwiSW1nQ1NTIiwiYnVpbGRJbWdUZW1wbGF0ZSIsImh0bWxGb3IiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJidWlsZE9wdGlvblRlbXBsYXRlIiwib3B0aW9uIiwiaHRtbCIsIkFtcFN0b3J5SW50ZXJhY3RpdmVJbWdQb2xsIiwiZWxlbWVudCIsIlBPTEwiLCJyb290RWxfIiwiYXR0YWNoQ29udGVudF8iLCJyb290IiwiYXR0YWNoUHJvbXB0XyIsIm9wdGlvbkNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJvcHRpb25zXyIsImZvckVhY2giLCJpbmRleCIsImFwcGVuZENoaWxkIiwiY29uZmlndXJlT3B0aW9uXyIsImNvbnZlcnRlZE9wdGlvbiIsIm9wdGlvbkluZGV4XyIsInNldEF0dHJpYnV0ZSIsIm9wdGlvbnNEYXRhIiwicGVyY2VudGFnZXMiLCJwcmVwcm9jZXNzUGVyY2VudGFnZXNfIiwiZ2V0T3B0aW9uRWxlbWVudHMiLCJlbCIsInNlbGVjdGVkIiwidGV4dENvbnRlbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSxtQkFERixFQUVFQyxlQUZGO0FBSUEsU0FBUUMsR0FBUjtBQUNBLFNBQVFBLEdBQUcsSUFBSUMsTUFBZjtBQUNBLFNBQVFDLGdCQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLGtCQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLG1CQUFtQixHQUFHLFNBQXRCQSxtQkFBc0IsQ0FBQ0MsTUFBRCxFQUFZO0FBQ3RDLE1BQU1DLElBQUksR0FBR0osT0FBTyxDQUFDRyxNQUFELENBQXBCO0FBQ0EsU0FBT0MsSUFBUDtBQVlELENBZEQ7O0FBZ0JBLFdBQWFDLDBCQUFiO0FBQUE7O0FBQUE7O0FBQ0U7QUFDRjtBQUNBO0FBQ0Usc0NBQVlDLE9BQVosRUFBcUI7QUFBQTs7QUFBQSw2QkFDYkEsT0FEYSxFQUNKVixlQUFlLENBQUNXLElBRFo7QUFFcEI7O0FBRUQ7QUFSRjtBQUFBO0FBQUEsV0FTRSx5QkFBZ0I7QUFDZCwyR0FBMkJWLEdBQUcsR0FBR0MsTUFBakM7QUFDRDtBQUVEOztBQWJGO0FBQUE7QUFBQSxXQWNFLDBCQUFpQjtBQUNmLFdBQUtVLE9BQUwsR0FBZVQsZ0JBQWdCLENBQUMsS0FBS08sT0FBTixDQUEvQjtBQUNBLFdBQUtHLGNBQUwsQ0FBb0IsS0FBS0QsT0FBekI7QUFDQSxhQUFPLEtBQUtBLE9BQVo7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTFCQTtBQUFBO0FBQUEsV0EyQkUsd0JBQWVFLElBQWYsRUFBcUI7QUFBQTs7QUFDbkIsV0FBS0MsYUFBTCxDQUFtQkQsSUFBbkI7QUFFQSxVQUFNRSxlQUFlLEdBQUcsS0FBS0osT0FBTCxDQUFhSyxhQUFiLENBQ3RCLG1EQURzQixDQUF4QjtBQUdBLFdBQUtDLFFBQUwsQ0FBY0MsT0FBZCxDQUFzQixVQUFDWixNQUFELEVBQVNhLEtBQVQ7QUFBQSxlQUNwQkosZUFBZSxDQUFDSyxXQUFoQixDQUE0QixLQUFJLENBQUNDLGdCQUFMLENBQXNCZixNQUF0QixFQUE4QmEsS0FBOUIsQ0FBNUIsQ0FEb0I7QUFBQSxPQUF0QjtBQUdEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE3Q0E7QUFBQTtBQUFBLFdBOENFLDBCQUFpQmIsTUFBakIsRUFBeUI7QUFDdkIsVUFBTWdCLGVBQWUsR0FBR2pCLG1CQUFtQixDQUFDLEtBQUtJLE9BQU4sQ0FBM0M7QUFDQWEsTUFBQUEsZUFBZSxDQUFDQyxZQUFoQixHQUErQmpCLE1BQU0sQ0FBQyxhQUFELENBQXJDO0FBRUE7QUFDQUYsTUFBQUEsa0JBQWtCLENBQ2hCa0IsZUFBZSxDQUFDTixhQUFoQixDQUNFLDZDQURGLENBRGdCLEVBSWhCO0FBQUMsNEJBQW9CLFNBQVNWLE1BQU0sQ0FBQyxPQUFELENBQWYsR0FBMkI7QUFBaEQsT0FKZ0IsQ0FBbEI7QUFPQWdCLE1BQUFBLGVBQWUsQ0FBQ0UsWUFBaEIsQ0FBNkIsWUFBN0IsRUFBMkNsQixNQUFNLENBQUMsVUFBRCxDQUFqRDtBQUVBLGFBQU9nQixlQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBakVBO0FBQUE7QUFBQSxXQWtFRSw0QkFBbUJHLFdBQW5CLEVBQWdDO0FBQUE7O0FBQzlCLFVBQUksQ0FBQ0EsV0FBTCxFQUFrQjtBQUNoQjtBQUNEOztBQUVELFVBQU1DLFdBQVcsR0FBRyxLQUFLQyxzQkFBTCxDQUE0QkYsV0FBNUIsQ0FBcEI7QUFFQSxXQUFLRyxpQkFBTCxHQUF5QlYsT0FBekIsQ0FBaUMsVUFBQ1csRUFBRCxFQUFLVixLQUFMLEVBQWU7QUFDOUMsWUFBSU0sV0FBVyxDQUFDTixLQUFELENBQVgsQ0FBbUJXLFFBQXZCLEVBQWlDO0FBQy9CRCxVQUFBQSxFQUFFLENBQUNMLFlBQUgsQ0FDRSxZQURGLEVBRUUsY0FBYyxNQUFJLENBQUNQLFFBQUwsQ0FBY0UsS0FBZCxFQUFxQixVQUFyQixDQUZoQjtBQUlEOztBQUNEVSxRQUFBQSxFQUFFLENBQUNiLGFBQUgsQ0FDRSx5REFERixFQUVFZSxXQUZGLEdBRW1CTCxXQUFXLENBQUNQLEtBQUQsQ0FGOUI7QUFHQWYsUUFBQUEsa0JBQWtCLENBQUN5QixFQUFELEVBQUs7QUFBQyxpQ0FBdUJILFdBQVcsQ0FBQ1AsS0FBRCxDQUFYLEdBQXFCO0FBQTdDLFNBQUwsQ0FBbEI7QUFDRCxPQVhEO0FBWUQ7QUFyRkg7O0FBQUE7QUFBQSxFQUFnRHJCLG1CQUFoRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjEgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBBbXBTdG9yeUludGVyYWN0aXZlLFxuICBJbnRlcmFjdGl2ZVR5cGUsXG59IGZyb20gJy4vYW1wLXN0b3J5LWludGVyYWN0aXZlLWFic3RyYWN0JztcbmltcG9ydCB7Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3RvcnktaW50ZXJhY3RpdmUtaW1nLXBvbGwtMC4xLmNzcyc7XG5pbXBvcnQge0NTUyBhcyBJbWdDU1N9IGZyb20gJy4uLy4uLy4uL2J1aWxkL2FtcC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctMC4xLmNzcyc7XG5pbXBvcnQge2J1aWxkSW1nVGVtcGxhdGV9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtodG1sRm9yfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcbmltcG9ydCB7c2V0SW1wb3J0YW50U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgdGVtcGxhdGUgZm9yIGVhY2ggb3B0aW9uLlxuICpcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IG9wdGlvblxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmNvbnN0IGJ1aWxkT3B0aW9uVGVtcGxhdGUgPSAob3B0aW9uKSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBodG1sRm9yKG9wdGlvbik7XG4gIHJldHVybiBodG1sYFxuICAgIDxidXR0b25cbiAgICAgIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLWltZy1vcHRpb24gaS1hbXBodG1sLXN0b3J5LWludGVyYWN0aXZlLW9wdGlvblwiXG4gICAgICBhcmlhLWxpdmU9XCJwb2xpdGVcIlxuICAgID5cbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaW1nLW9wdGlvbi1pbWdcIj5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctb3B0aW9uLXBlcmNlbnRhZ2UtdGV4dFwiXG4gICAgICAgID48L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICA8L2J1dHRvbj5cbiAgYDtcbn07XG5cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeUludGVyYWN0aXZlSW1nUG9sbCBleHRlbmRzIEFtcFN0b3J5SW50ZXJhY3RpdmUge1xuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQsIEludGVyYWN0aXZlVHlwZS5QT0xMKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjaygpIHtcbiAgICByZXR1cm4gc3VwZXIuYnVpbGRDYWxsYmFjayhDU1MgKyBJbWdDU1MpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENvbXBvbmVudCgpIHtcbiAgICB0aGlzLnJvb3RFbF8gPSBidWlsZEltZ1RlbXBsYXRlKHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5hdHRhY2hDb250ZW50Xyh0aGlzLnJvb3RFbF8pO1xuICAgIHJldHVybiB0aGlzLnJvb3RFbF87XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIHByb21wdCBhbmQgb3B0aW9ucyBjb250ZW50XG4gICAqIGFuZCBhZGRzIGl0IHRvIHRoZSBwb2xsIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gcm9vdFxuICAgKi9cbiAgYXR0YWNoQ29udGVudF8ocm9vdCkge1xuICAgIHRoaXMuYXR0YWNoUHJvbXB0Xyhyb290KTtcblxuICAgIGNvbnN0IG9wdGlvbkNvbnRhaW5lciA9IHRoaXMucm9vdEVsXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaW1nLW9wdGlvbi1jb250YWluZXInXG4gICAgKTtcbiAgICB0aGlzLm9wdGlvbnNfLmZvckVhY2goKG9wdGlvbiwgaW5kZXgpID0+XG4gICAgICBvcHRpb25Db250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jb25maWd1cmVPcHRpb25fKG9wdGlvbiwgaW5kZXgpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhbiBvcHRpb24gY29udGFpbmVyIHdpdGggb3B0aW9uIGNvbnRlbnQsXG4gICAqIGFkZHMgc3R5bGluZyBhbmQgYW5zd2VyIGNob2ljZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7IS4vYW1wLXN0b3J5LWludGVyYWN0aXZlLWFic3RyYWN0Lk9wdGlvbkNvbmZpZ1R5cGV9IG9wdGlvblxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbmZpZ3VyZU9wdGlvbl8ob3B0aW9uKSB7XG4gICAgY29uc3QgY29udmVydGVkT3B0aW9uID0gYnVpbGRPcHRpb25UZW1wbGF0ZSh0aGlzLmVsZW1lbnQpO1xuICAgIGNvbnZlcnRlZE9wdGlvbi5vcHRpb25JbmRleF8gPSBvcHRpb25bJ29wdGlvbkluZGV4J107XG5cbiAgICAvLyBFeHRyYWN0IGFuZCBzdHJ1Y3R1cmUgdGhlIG9wdGlvbiBpbmZvcm1hdGlvblxuICAgIHNldEltcG9ydGFudFN0eWxlcyhcbiAgICAgIGNvbnZlcnRlZE9wdGlvbi5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnLmktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctb3B0aW9uLWltZydcbiAgICAgICksXG4gICAgICB7J2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyBvcHRpb25bJ2ltYWdlJ10gKyAnKSd9XG4gICAgKTtcblxuICAgIGNvbnZlcnRlZE9wdGlvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBvcHRpb25bJ2ltYWdlYWx0J10pO1xuXG4gICAgcmV0dXJuIGNvbnZlcnRlZE9wdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGRpc3BsYXlPcHRpb25zRGF0YShvcHRpb25zRGF0YSkge1xuICAgIGlmICghb3B0aW9uc0RhdGEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwZXJjZW50YWdlcyA9IHRoaXMucHJlcHJvY2Vzc1BlcmNlbnRhZ2VzXyhvcHRpb25zRGF0YSk7XG5cbiAgICB0aGlzLmdldE9wdGlvbkVsZW1lbnRzKCkuZm9yRWFjaCgoZWwsIGluZGV4KSA9PiB7XG4gICAgICBpZiAob3B0aW9uc0RhdGFbaW5kZXhdLnNlbGVjdGVkKSB7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAnYXJpYS1sYWJlbCcsXG4gICAgICAgICAgJ3NlbGVjdGVkICcgKyB0aGlzLm9wdGlvbnNfW2luZGV4XVsnaW1hZ2VhbHQnXVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJy5pLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtaW1nLW9wdGlvbi1wZXJjZW50YWdlLXRleHQnXG4gICAgICApLnRleHRDb250ZW50ID0gYCR7cGVyY2VudGFnZXNbaW5kZXhdfSVgO1xuICAgICAgc2V0SW1wb3J0YW50U3R5bGVzKGVsLCB7Jy0tb3B0aW9uLXBlcmNlbnRhZ2UnOiBwZXJjZW50YWdlc1tpbmRleF0gLyAxMDB9KTtcbiAgICB9KTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/amp-story-interactive-img-poll.js