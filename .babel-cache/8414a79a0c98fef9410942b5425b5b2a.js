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

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview This is a layer that lays its children out into a grid. Its
 * implementation is based off of the CSS Grid Spec.
 *
 * Example:
 * <code>
 * <amp-story-grid-layer template="fill">
 *   ...
 * </amp-story-grid-layer>
 * </code>
 */
import { AmpStoryBaseLayer } from "./amp-story-base-layer";
import { StateProperty, getStoreService } from "./amp-story-store-service";
import { assertDoesNotContainDisplay } from "../../../src/assert-display";
import { isPrerenderActivePage } from "./prerender-active-page";
import { px, setStyles } from "../../../src/core/dom/style";
import { scopedQuerySelectorAll } from "../../../src/core/dom/query";

/**
 * A mapping of attribute names we support for grid layers to the CSS Grid
 * properties they control.
 * @private @const {!Object<string, string>}
 */
var SUPPORTED_CSS_GRID_ATTRIBUTES = {
  'align-content': 'alignContent',
  'align-items': 'alignItems',
  'align-self': 'alignSelf',
  'grid-area': 'gridArea',
  'justify-content': 'justifyContent',
  'justify-items': 'justifyItems',
  'justify-self': 'justifySelf'
};

/**
 * Converts the keys of the SUPPORTED_CSS_GRID_ATTRIBUTES object above into a
 * selector for the specified attributes.
 * (e.g. [align-content], [align-items], ...)
 * @private @const {string}
 */
var SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR = Object.keys(SUPPORTED_CSS_GRID_ATTRIBUTES).map(function (key) {
  return "[" + key + "]";
}).join(',');

/**
 * The attribute name for grid layer templates.
 * @private @const {string}
 */
var TEMPLATE_ATTRIBUTE_NAME = 'template';

/**
 * A mapping of template attribute values to CSS class names.
 * @const {!Object<string, string>}
 */
export var GRID_LAYER_TEMPLATE_CLASS_NAMES = {
  'fill': 'i-amphtml-story-grid-template-fill',
  'vertical': 'i-amphtml-story-grid-template-vertical',
  'horizontal': 'i-amphtml-story-grid-template-horizontal',
  'thirds': 'i-amphtml-story-grid-template-thirds'
};

/**
 * The attribute name for grid layer presets.
 * @private @const {string}
 */
var PRESET_ATTRIBUTE_NAME = 'preset';

/**
 * @typedef {{
 *  aspect-ratio: string,
 *  scaling-factor: ?float,
 * }}
 */
export var PresetDetails;

/**
 * The attributes that will be applied for each preset.
 * @private @const {!Object<string, !PresetDetails>}
 */
var GRID_LAYER_PRESET_DETAILS = {
  '2021-background': {
    'aspect-ratio': '69:116',
    'scaling-factor': 1.142
  },
  '2021-foreground': {
    'aspect-ratio': '69:116'
  }
};

/**
 * Grid layer template templating system.
 */
export var AmpStoryGridLayer = /*#__PURE__*/function (_AmpStoryBaseLayer) {
  _inherits(AmpStoryGridLayer, _AmpStoryBaseLayer);

  var _super = _createSuper(AmpStoryGridLayer);

  /** @param {!AmpElement} element */
  function AmpStoryGridLayer(element) {
    var _this;

    _classCallCheck(this, AmpStoryGridLayer);

    _this = _super.call(this, element);

    /** @private {?{horiz: number, vert: number}} */
    _this.aspectRatio_ = null;

    /** @private {number} */
    _this.scalingFactor_ = 1;
    return _this;
  }

  /** @override */
  _createClass(AmpStoryGridLayer, [{
    key: "buildCallback",
    value: function buildCallback() {
      _get(_getPrototypeOf(AmpStoryGridLayer.prototype), "buildCallback", this).call(this);

      this.applyResponsivenessPresets_();
      this.applyTemplateClassName_();
      this.setOwnCssGridStyles_();
      this.setDescendentCssGridStyles_();
      this.initializeListeners_();
    }
    /**
     * Applies the attributes to the layer from the preset specified in the [preset] attribute.
     * @private
     */

  }, {
    key: "applyResponsivenessPresets_",
    value: function applyResponsivenessPresets_() {
      var _this2 = this;

      if (!this.element.hasAttribute(PRESET_ATTRIBUTE_NAME)) {
        return;
      }

      var preset = this.element.getAttribute(PRESET_ATTRIBUTE_NAME);
      var presetDetails = GRID_LAYER_PRESET_DETAILS[preset];

      if (!presetDetails) {
        return;
      }

      Object.entries(presetDetails).forEach(function (keyValue) {
        return _this2.element.setAttribute(keyValue[0], keyValue[1]);
      });
    }
    /** @private */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var aspectRatio = this.element.getAttribute('aspect-ratio');
      var scalingFactorFloat = parseFloat(this.element.getAttribute('scaling-factor'));

      if (scalingFactorFloat && scalingFactorFloat > 0) {
        this.scalingFactor_ = scalingFactorFloat;
      }

      if (aspectRatio) {
        var aspectRatioSplits = aspectRatio.split(':');
        var horiz = parseInt(aspectRatioSplits[0], 10);
        var vert = parseInt(aspectRatioSplits[1], 10);

        if (horiz > 0 && vert > 0) {
          this.aspectRatio_ = {
            horiz: horiz,
            vert: vert
          };
          var storeService = getStoreService(this.win);
          storeService.subscribe(StateProperty.PAGE_SIZE, this.updatePageSize_.bind(this), true
          /* callToInitialize */
          );
        }
      }
    }
    /**
     * @param {?{width: number, height: number}} pageSize
     * @private
     */

  }, {
    key: "updatePageSize_",
    value: function updatePageSize_(pageSize) {
      var _this3 = this;

      if (!pageSize) {
        return;
      }

      var vh = pageSize.height,
          vw = pageSize.width;
      var _this$aspectRatio_ = this.aspectRatio_,
          horiz = _this$aspectRatio_.horiz,
          vert = _this$aspectRatio_.vert;
      var width = Math.min(vw, vh * horiz / vert);
      var height = Math.min(vh, vw * vert / horiz);

      if (width > 0 && height > 0) {
        this.getVsync().mutate(function () {
          _this3.element.classList.add('i-amphtml-story-grid-template-aspect');

          setStyles(_this3.element, {
            '--i-amphtml-story-layer-width': px(width * _this3.scalingFactor_),
            '--i-amphtml-story-layer-height': px(height * _this3.scalingFactor_)
          });
        });
      }
    }
    /**
     * Applies internal CSS class names for the template attribute, so that styles
     * can use the class name instead of compound
     * amp-story-grid-layer[template="..."] selectors, since the latter increases
     * CSS specificity and can prevent users from being able to override styles.
     * @private
     */

  }, {
    key: "applyTemplateClassName_",
    value: function applyTemplateClassName_() {
      if (this.element.hasAttribute(TEMPLATE_ATTRIBUTE_NAME)) {
        var templateName = this.element.getAttribute(TEMPLATE_ATTRIBUTE_NAME);
        var templateClassName = GRID_LAYER_TEMPLATE_CLASS_NAMES[templateName];
        this.element.classList.add(templateClassName);
      }
    }
    /**
     * Copies the allowlisted CSS grid styles for descendants of the
     * <amp-story-grid-layer> element.
     * @private
     */

  }, {
    key: "setDescendentCssGridStyles_",
    value: function setDescendentCssGridStyles_() {
      var _this4 = this;

      var elementsToUpgradeStyles = scopedQuerySelectorAll(this.element, SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR);
      Array.prototype.forEach.call(elementsToUpgradeStyles, function (element) {
        _this4.setCssGridStyles_(element);
      });
    }
    /**
     * Copies the allowlisted CSS grid styles for the <amp-story-grid-layer>
     * element itself.
     * @private
     */

  }, {
    key: "setOwnCssGridStyles_",
    value: function setOwnCssGridStyles_() {
      this.setCssGridStyles_(this.element);
    }
    /**
     * Copies the values of an element's attributes to its styles, if the
     * attributes/properties are in the allowlist.
     *
     * @param {!Element} element The element whose styles should be copied from
     *     its attributes.
     */

  }, {
    key: "setCssGridStyles_",
    value: function setCssGridStyles_(element) {
      var styles = {};

      for (var i = element.attributes.length - 1; i >= 0; i--) {
        var attribute = element.attributes[i];
        var attributeName = attribute.name.toLowerCase();
        var propertyName = SUPPORTED_CSS_GRID_ATTRIBUTES[attributeName];

        if (propertyName) {
          styles[propertyName] = attribute.value;
          element.removeAttribute(attributeName);
        }
      }

      setStyles(element, assertDoesNotContainDisplay(styles));
    }
  }], [{
    key: "prerenderAllowed",
    value:
    /** @override @nocollapse */
    function prerenderAllowed(element) {
      return isPrerenderActivePage(element.parentElement);
    }
  }]);

  return AmpStoryGridLayer;
}(AmpStoryBaseLayer);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1ncmlkLWxheWVyLmpzIl0sIm5hbWVzIjpbIkFtcFN0b3J5QmFzZUxheWVyIiwiU3RhdGVQcm9wZXJ0eSIsImdldFN0b3JlU2VydmljZSIsImFzc2VydERvZXNOb3RDb250YWluRGlzcGxheSIsImlzUHJlcmVuZGVyQWN0aXZlUGFnZSIsInB4Iiwic2V0U3R5bGVzIiwic2NvcGVkUXVlcnlTZWxlY3RvckFsbCIsIlNVUFBPUlRFRF9DU1NfR1JJRF9BVFRSSUJVVEVTIiwiU1VQUE9SVEVEX0NTU19HUklEX0FUVFJJQlVURVNfU0VMRUNUT1IiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwia2V5Iiwiam9pbiIsIlRFTVBMQVRFX0FUVFJJQlVURV9OQU1FIiwiR1JJRF9MQVlFUl9URU1QTEFURV9DTEFTU19OQU1FUyIsIlBSRVNFVF9BVFRSSUJVVEVfTkFNRSIsIlByZXNldERldGFpbHMiLCJHUklEX0xBWUVSX1BSRVNFVF9ERVRBSUxTIiwiQW1wU3RvcnlHcmlkTGF5ZXIiLCJlbGVtZW50IiwiYXNwZWN0UmF0aW9fIiwic2NhbGluZ0ZhY3Rvcl8iLCJhcHBseVJlc3BvbnNpdmVuZXNzUHJlc2V0c18iLCJhcHBseVRlbXBsYXRlQ2xhc3NOYW1lXyIsInNldE93bkNzc0dyaWRTdHlsZXNfIiwic2V0RGVzY2VuZGVudENzc0dyaWRTdHlsZXNfIiwiaW5pdGlhbGl6ZUxpc3RlbmVyc18iLCJoYXNBdHRyaWJ1dGUiLCJwcmVzZXQiLCJnZXRBdHRyaWJ1dGUiLCJwcmVzZXREZXRhaWxzIiwiZW50cmllcyIsImZvckVhY2giLCJrZXlWYWx1ZSIsInNldEF0dHJpYnV0ZSIsImFzcGVjdFJhdGlvIiwic2NhbGluZ0ZhY3RvckZsb2F0IiwicGFyc2VGbG9hdCIsImFzcGVjdFJhdGlvU3BsaXRzIiwic3BsaXQiLCJob3JpeiIsInBhcnNlSW50IiwidmVydCIsInN0b3JlU2VydmljZSIsIndpbiIsInN1YnNjcmliZSIsIlBBR0VfU0laRSIsInVwZGF0ZVBhZ2VTaXplXyIsImJpbmQiLCJwYWdlU2l6ZSIsInZoIiwiaGVpZ2h0IiwidnciLCJ3aWR0aCIsIk1hdGgiLCJtaW4iLCJnZXRWc3luYyIsIm11dGF0ZSIsImNsYXNzTGlzdCIsImFkZCIsInRlbXBsYXRlTmFtZSIsInRlbXBsYXRlQ2xhc3NOYW1lIiwiZWxlbWVudHNUb1VwZ3JhZGVTdHlsZXMiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJzZXRDc3NHcmlkU3R5bGVzXyIsInN0eWxlcyIsImkiLCJhdHRyaWJ1dGVzIiwibGVuZ3RoIiwiYXR0cmlidXRlIiwiYXR0cmlidXRlTmFtZSIsIm5hbWUiLCJ0b0xvd2VyQ2FzZSIsInByb3BlcnR5TmFtZSIsInZhbHVlIiwicmVtb3ZlQXR0cmlidXRlIiwicGFyZW50RWxlbWVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxpQkFBUjtBQUNBLFNBQVFDLGFBQVIsRUFBdUJDLGVBQXZCO0FBQ0EsU0FBUUMsMkJBQVI7QUFDQSxTQUFRQyxxQkFBUjtBQUNBLFNBQVFDLEVBQVIsRUFBWUMsU0FBWjtBQUNBLFNBQVFDLHNCQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyw2QkFBNkIsR0FBRztBQUNwQyxtQkFBaUIsY0FEbUI7QUFFcEMsaUJBQWUsWUFGcUI7QUFHcEMsZ0JBQWMsV0FIc0I7QUFJcEMsZUFBYSxVQUp1QjtBQUtwQyxxQkFBbUIsZ0JBTGlCO0FBTXBDLG1CQUFpQixjQU5tQjtBQU9wQyxrQkFBZ0I7QUFQb0IsQ0FBdEM7O0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsc0NBQXNDLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBUCxD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QUE1QjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBM0lBO0FBQUE7QUFBQSxXQTRJRSwyQkFBa0JBLE9BQWxCLEVBQTJCO0FBQ3pCLFVBQU1nRCxNQUFNLEdBQUcsRUFBZjs7QUFDQSxXQUFLLElBQUlDLENBQUMsR0FBR2pELE9BQU8sQ0FBQ2tELFVBQVIsQ0FBbUJDLE1BQW5CLEdBQTRCLENBQXpDLEVBQTRDRixDQUFDLElBQUksQ0FBakQsRUFBb0RBLENBQUMsRUFBckQsRUFBeUQ7QUFDdkQsWUFBTUcsU0FBUyxHQUFHcEQsT0FBTyxDQUFDa0QsVUFBUixDQUFtQkQsQ0FBbkIsQ0FBbEI7QUFDQSxZQUFNSSxhQUFhLEdBQUdELFNBQVMsQ0FBQ0UsSUFBVixDQUFlQyxXQUFmLEVBQXRCO0FBQ0EsWUFBTUMsWUFBWSxHQUFHckUsNkJBQTZCLENBQUNrRSxhQUFELENBQWxEOztBQUNBLFlBQUlHLFlBQUosRUFBa0I7QUFDaEJSLFVBQUFBLE1BQU0sQ0FBQ1EsWUFBRCxDQUFOLEdBQXVCSixTQUFTLENBQUNLLEtBQWpDO0FBQ0F6RCxVQUFBQSxPQUFPLENBQUMwRCxlQUFSLENBQXdCTCxhQUF4QjtBQUNEO0FBQ0Y7O0FBQ0RwRSxNQUFBQSxTQUFTLENBQUNlLE9BQUQsRUFBVWxCLDJCQUEyQixDQUFDa0UsTUFBRCxDQUFyQyxDQUFUO0FBQ0Q7QUF4Skg7QUFBQTtBQUFBO0FBQ0U7QUFDQSw4QkFBd0JoRCxPQUF4QixFQUFpQztBQUMvQixhQUFPakIscUJBQXFCLENBQUNpQixPQUFPLENBQUMyRCxhQUFULENBQTVCO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLEVBQXVDaEYsaUJBQXZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGlzIGEgbGF5ZXIgdGhhdCBsYXlzIGl0cyBjaGlsZHJlbiBvdXQgaW50byBhIGdyaWQuIEl0c1xuICogaW1wbGVtZW50YXRpb24gaXMgYmFzZWQgb2ZmIG9mIHRoZSBDU1MgR3JpZCBTcGVjLlxuICpcbiAqIEV4YW1wbGU6XG4gKiA8Y29kZT5cbiAqIDxhbXAtc3RvcnktZ3JpZC1sYXllciB0ZW1wbGF0ZT1cImZpbGxcIj5cbiAqICAgLi4uXG4gKiA8L2FtcC1zdG9yeS1ncmlkLWxheWVyPlxuICogPC9jb2RlPlxuICovXG5cbmltcG9ydCB7QW1wU3RvcnlCYXNlTGF5ZXJ9IGZyb20gJy4vYW1wLXN0b3J5LWJhc2UtbGF5ZXInO1xuaW1wb3J0IHtTdGF0ZVByb3BlcnR5LCBnZXRTdG9yZVNlcnZpY2V9IGZyb20gJy4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHthc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXl9IGZyb20gJy4uLy4uLy4uL3NyYy9hc3NlcnQtZGlzcGxheSc7XG5pbXBvcnQge2lzUHJlcmVuZGVyQWN0aXZlUGFnZX0gZnJvbSAnLi9wcmVyZW5kZXItYWN0aXZlLXBhZ2UnO1xuaW1wb3J0IHtweCwgc2V0U3R5bGVzfSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHtzY29wZWRRdWVyeVNlbGVjdG9yQWxsfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuXG4vKipcbiAqIEEgbWFwcGluZyBvZiBhdHRyaWJ1dGUgbmFtZXMgd2Ugc3VwcG9ydCBmb3IgZ3JpZCBsYXllcnMgdG8gdGhlIENTUyBHcmlkXG4gKiBwcm9wZXJ0aWVzIHRoZXkgY29udHJvbC5cbiAqIEBwcml2YXRlIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz59XG4gKi9cbmNvbnN0IFNVUFBPUlRFRF9DU1NfR1JJRF9BVFRSSUJVVEVTID0ge1xuICAnYWxpZ24tY29udGVudCc6ICdhbGlnbkNvbnRlbnQnLFxuICAnYWxpZ24taXRlbXMnOiAnYWxpZ25JdGVtcycsXG4gICdhbGlnbi1zZWxmJzogJ2FsaWduU2VsZicsXG4gICdncmlkLWFyZWEnOiAnZ3JpZEFyZWEnLFxuICAnanVzdGlmeS1jb250ZW50JzogJ2p1c3RpZnlDb250ZW50JyxcbiAgJ2p1c3RpZnktaXRlbXMnOiAnanVzdGlmeUl0ZW1zJyxcbiAgJ2p1c3RpZnktc2VsZic6ICdqdXN0aWZ5U2VsZicsXG59O1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBrZXlzIG9mIHRoZSBTVVBQT1JURURfQ1NTX0dSSURfQVRUUklCVVRFUyBvYmplY3QgYWJvdmUgaW50byBhXG4gKiBzZWxlY3RvciBmb3IgdGhlIHNwZWNpZmllZCBhdHRyaWJ1dGVzLlxuICogKGUuZy4gW2FsaWduLWNvbnRlbnRdLCBbYWxpZ24taXRlbXNdLCAuLi4pXG4gKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ31cbiAqL1xuY29uc3QgU1VQUE9SVEVEX0NTU19HUklEX0FUVFJJQlVURVNfU0VMRUNUT1IgPSBPYmplY3Qua2V5cyhcbiAgU1VQUE9SVEVEX0NTU19HUklEX0FUVFJJQlVURVNcbilcbiAgLm1hcCgoa2V5KSA9PiBgWyR7a2V5fV1gKVxuICAuam9pbignLCcpO1xuXG4vKipcbiAqIFRoZSBhdHRyaWJ1dGUgbmFtZSBmb3IgZ3JpZCBsYXllciB0ZW1wbGF0ZXMuXG4gKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ31cbiAqL1xuY29uc3QgVEVNUExBVEVfQVRUUklCVVRFX05BTUUgPSAndGVtcGxhdGUnO1xuXG4vKipcbiAqIEEgbWFwcGluZyBvZiB0ZW1wbGF0ZSBhdHRyaWJ1dGUgdmFsdWVzIHRvIENTUyBjbGFzcyBuYW1lcy5cbiAqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz59XG4gKi9cbmV4cG9ydCBjb25zdCBHUklEX0xBWUVSX1RFTVBMQVRFX0NMQVNTX05BTUVTID0ge1xuICAnZmlsbCc6ICdpLWFtcGh0bWwtc3RvcnktZ3JpZC10ZW1wbGF0ZS1maWxsJyxcbiAgJ3ZlcnRpY2FsJzogJ2ktYW1waHRtbC1zdG9yeS1ncmlkLXRlbXBsYXRlLXZlcnRpY2FsJyxcbiAgJ2hvcml6b250YWwnOiAnaS1hbXBodG1sLXN0b3J5LWdyaWQtdGVtcGxhdGUtaG9yaXpvbnRhbCcsXG4gICd0aGlyZHMnOiAnaS1hbXBodG1sLXN0b3J5LWdyaWQtdGVtcGxhdGUtdGhpcmRzJyxcbn07XG5cbi8qKlxuICogVGhlIGF0dHJpYnV0ZSBuYW1lIGZvciBncmlkIGxheWVyIHByZXNldHMuXG4gKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ31cbiAqL1xuY29uc3QgUFJFU0VUX0FUVFJJQlVURV9OQU1FID0gJ3ByZXNldCc7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICBhc3BlY3QtcmF0aW86IHN0cmluZyxcbiAqICBzY2FsaW5nLWZhY3RvcjogP2Zsb2F0LFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBQcmVzZXREZXRhaWxzO1xuXG4vKipcbiAqIFRoZSBhdHRyaWJ1dGVzIHRoYXQgd2lsbCBiZSBhcHBsaWVkIGZvciBlYWNoIHByZXNldC5cbiAqIEBwcml2YXRlIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsICFQcmVzZXREZXRhaWxzPn1cbiAqL1xuY29uc3QgR1JJRF9MQVlFUl9QUkVTRVRfREVUQUlMUyA9IHtcbiAgJzIwMjEtYmFja2dyb3VuZCc6IHtcbiAgICAnYXNwZWN0LXJhdGlvJzogJzY5OjExNicsXG4gICAgJ3NjYWxpbmctZmFjdG9yJzogMS4xNDIsXG4gIH0sXG4gICcyMDIxLWZvcmVncm91bmQnOiB7XG4gICAgJ2FzcGVjdC1yYXRpbyc6ICc2OToxMTYnLFxuICB9LFxufTtcblxuLyoqXG4gKiBHcmlkIGxheWVyIHRlbXBsYXRlIHRlbXBsYXRpbmcgc3lzdGVtLlxuICovXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlHcmlkTGF5ZXIgZXh0ZW5kcyBBbXBTdG9yeUJhc2VMYXllciB7XG4gIC8qKiBAb3ZlcnJpZGUgQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIHByZXJlbmRlckFsbG93ZWQoZWxlbWVudCkge1xuICAgIHJldHVybiBpc1ByZXJlbmRlckFjdGl2ZVBhZ2UoZWxlbWVudC5wYXJlbnRFbGVtZW50KTtcbiAgfVxuXG4gIC8qKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50ICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50KTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P3tob3JpejogbnVtYmVyLCB2ZXJ0OiBudW1iZXJ9fSAqL1xuICAgIHRoaXMuYXNwZWN0UmF0aW9fID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc2NhbGluZ0ZhY3Rvcl8gPSAxO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHN1cGVyLmJ1aWxkQ2FsbGJhY2soKTtcbiAgICB0aGlzLmFwcGx5UmVzcG9uc2l2ZW5lc3NQcmVzZXRzXygpO1xuICAgIHRoaXMuYXBwbHlUZW1wbGF0ZUNsYXNzTmFtZV8oKTtcbiAgICB0aGlzLnNldE93bkNzc0dyaWRTdHlsZXNfKCk7XG4gICAgdGhpcy5zZXREZXNjZW5kZW50Q3NzR3JpZFN0eWxlc18oKTtcbiAgICB0aGlzLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgYXR0cmlidXRlcyB0byB0aGUgbGF5ZXIgZnJvbSB0aGUgcHJlc2V0IHNwZWNpZmllZCBpbiB0aGUgW3ByZXNldF0gYXR0cmlidXRlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYXBwbHlSZXNwb25zaXZlbmVzc1ByZXNldHNfKCkge1xuICAgIGlmICghdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZShQUkVTRVRfQVRUUklCVVRFX05BTUUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHByZXNldCA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoUFJFU0VUX0FUVFJJQlVURV9OQU1FKTtcbiAgICBjb25zdCBwcmVzZXREZXRhaWxzID0gR1JJRF9MQVlFUl9QUkVTRVRfREVUQUlMU1twcmVzZXRdO1xuICAgIGlmICghcHJlc2V0RGV0YWlscykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBPYmplY3QuZW50cmllcyhwcmVzZXREZXRhaWxzKS5mb3JFYWNoKChrZXlWYWx1ZSkgPT5cbiAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5VmFsdWVbMF0sIGtleVZhbHVlWzFdKVxuICAgICk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgaW5pdGlhbGl6ZUxpc3RlbmVyc18oKSB7XG4gICAgY29uc3QgYXNwZWN0UmF0aW8gPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhc3BlY3QtcmF0aW8nKTtcbiAgICBjb25zdCBzY2FsaW5nRmFjdG9yRmxvYXQgPSBwYXJzZUZsb2F0KFxuICAgICAgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnc2NhbGluZy1mYWN0b3InKVxuICAgICk7XG4gICAgaWYgKHNjYWxpbmdGYWN0b3JGbG9hdCAmJiBzY2FsaW5nRmFjdG9yRmxvYXQgPiAwKSB7XG4gICAgICB0aGlzLnNjYWxpbmdGYWN0b3JfID0gc2NhbGluZ0ZhY3RvckZsb2F0O1xuICAgIH1cbiAgICBpZiAoYXNwZWN0UmF0aW8pIHtcbiAgICAgIGNvbnN0IGFzcGVjdFJhdGlvU3BsaXRzID0gYXNwZWN0UmF0aW8uc3BsaXQoJzonKTtcbiAgICAgIGNvbnN0IGhvcml6ID0gcGFyc2VJbnQoYXNwZWN0UmF0aW9TcGxpdHNbMF0sIDEwKTtcbiAgICAgIGNvbnN0IHZlcnQgPSBwYXJzZUludChhc3BlY3RSYXRpb1NwbGl0c1sxXSwgMTApO1xuICAgICAgaWYgKGhvcml6ID4gMCAmJiB2ZXJ0ID4gMCkge1xuICAgICAgICB0aGlzLmFzcGVjdFJhdGlvXyA9IHtob3JpeiwgdmVydH07XG4gICAgICAgIGNvbnN0IHN0b3JlU2VydmljZSA9IGdldFN0b3JlU2VydmljZSh0aGlzLndpbik7XG4gICAgICAgIHN0b3JlU2VydmljZS5zdWJzY3JpYmUoXG4gICAgICAgICAgU3RhdGVQcm9wZXJ0eS5QQUdFX1NJWkUsXG4gICAgICAgICAgdGhpcy51cGRhdGVQYWdlU2l6ZV8uYmluZCh0aGlzKSxcbiAgICAgICAgICB0cnVlIC8qIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHs/e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gcGFnZVNpemVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVBhZ2VTaXplXyhwYWdlU2l6ZSkge1xuICAgIGlmICghcGFnZVNpemUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge2hlaWdodDogdmgsIHdpZHRoOiB2d30gPSBwYWdlU2l6ZTtcbiAgICBjb25zdCB7aG9yaXosIHZlcnR9ID0gdGhpcy5hc3BlY3RSYXRpb187XG4gICAgY29uc3Qgd2lkdGggPSBNYXRoLm1pbih2dywgKHZoICogaG9yaXopIC8gdmVydCk7XG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5taW4odmgsICh2dyAqIHZlcnQpIC8gaG9yaXopO1xuICAgIGlmICh3aWR0aCA+IDAgJiYgaGVpZ2h0ID4gMCkge1xuICAgICAgdGhpcy5nZXRWc3luYygpLm11dGF0ZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktZ3JpZC10ZW1wbGF0ZS1hc3BlY3QnKTtcbiAgICAgICAgc2V0U3R5bGVzKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICctLWktYW1waHRtbC1zdG9yeS1sYXllci13aWR0aCc6IHB4KHdpZHRoICogdGhpcy5zY2FsaW5nRmFjdG9yXyksXG4gICAgICAgICAgJy0taS1hbXBodG1sLXN0b3J5LWxheWVyLWhlaWdodCc6IHB4KGhlaWdodCAqIHRoaXMuc2NhbGluZ0ZhY3Rvcl8pLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGludGVybmFsIENTUyBjbGFzcyBuYW1lcyBmb3IgdGhlIHRlbXBsYXRlIGF0dHJpYnV0ZSwgc28gdGhhdCBzdHlsZXNcbiAgICogY2FuIHVzZSB0aGUgY2xhc3MgbmFtZSBpbnN0ZWFkIG9mIGNvbXBvdW5kXG4gICAqIGFtcC1zdG9yeS1ncmlkLWxheWVyW3RlbXBsYXRlPVwiLi4uXCJdIHNlbGVjdG9ycywgc2luY2UgdGhlIGxhdHRlciBpbmNyZWFzZXNcbiAgICogQ1NTIHNwZWNpZmljaXR5IGFuZCBjYW4gcHJldmVudCB1c2VycyBmcm9tIGJlaW5nIGFibGUgdG8gb3ZlcnJpZGUgc3R5bGVzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYXBwbHlUZW1wbGF0ZUNsYXNzTmFtZV8oKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoVEVNUExBVEVfQVRUUklCVVRFX05BTUUpKSB7XG4gICAgICBjb25zdCB0ZW1wbGF0ZU5hbWUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFRFTVBMQVRFX0FUVFJJQlVURV9OQU1FKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlQ2xhc3NOYW1lID0gR1JJRF9MQVlFUl9URU1QTEFURV9DTEFTU19OQU1FU1t0ZW1wbGF0ZU5hbWVdO1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQodGVtcGxhdGVDbGFzc05hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb3BpZXMgdGhlIGFsbG93bGlzdGVkIENTUyBncmlkIHN0eWxlcyBmb3IgZGVzY2VuZGFudHMgb2YgdGhlXG4gICAqIDxhbXAtc3RvcnktZ3JpZC1sYXllcj4gZWxlbWVudC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldERlc2NlbmRlbnRDc3NHcmlkU3R5bGVzXygpIHtcbiAgICBjb25zdCBlbGVtZW50c1RvVXBncmFkZVN0eWxlcyA9IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICBTVVBQT1JURURfQ1NTX0dSSURfQVRUUklCVVRFU19TRUxFQ1RPUlxuICAgICk7XG5cbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGVsZW1lbnRzVG9VcGdyYWRlU3R5bGVzLCAoZWxlbWVudCkgPT4ge1xuICAgICAgdGhpcy5zZXRDc3NHcmlkU3R5bGVzXyhlbGVtZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3BpZXMgdGhlIGFsbG93bGlzdGVkIENTUyBncmlkIHN0eWxlcyBmb3IgdGhlIDxhbXAtc3RvcnktZ3JpZC1sYXllcj5cbiAgICogZWxlbWVudCBpdHNlbGYuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzZXRPd25Dc3NHcmlkU3R5bGVzXygpIHtcbiAgICB0aGlzLnNldENzc0dyaWRTdHlsZXNfKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIHRoZSB2YWx1ZXMgb2YgYW4gZWxlbWVudCdzIGF0dHJpYnV0ZXMgdG8gaXRzIHN0eWxlcywgaWYgdGhlXG4gICAqIGF0dHJpYnV0ZXMvcHJvcGVydGllcyBhcmUgaW4gdGhlIGFsbG93bGlzdC5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB3aG9zZSBzdHlsZXMgc2hvdWxkIGJlIGNvcGllZCBmcm9tXG4gICAqICAgICBpdHMgYXR0cmlidXRlcy5cbiAgICovXG4gIHNldENzc0dyaWRTdHlsZXNfKGVsZW1lbnQpIHtcbiAgICBjb25zdCBzdHlsZXMgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gZWxlbWVudC5hdHRyaWJ1dGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBlbGVtZW50LmF0dHJpYnV0ZXNbaV07XG4gICAgICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gYXR0cmlidXRlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IHByb3BlcnR5TmFtZSA9IFNVUFBPUlRFRF9DU1NfR1JJRF9BVFRSSUJVVEVTW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgaWYgKHByb3BlcnR5TmFtZSkge1xuICAgICAgICBzdHlsZXNbcHJvcGVydHlOYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHNldFN0eWxlcyhlbGVtZW50LCBhc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXkoc3R5bGVzKSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-grid-layer.js