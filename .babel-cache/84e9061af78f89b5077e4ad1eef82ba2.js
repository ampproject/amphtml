function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _get(target, property, receiver) {if (typeof Reflect !== "undefined" && Reflect.get) {_get = Reflect.get;} else {_get = function _get(target, property, receiver) {var base = _superPropBase(target, property);if (!base) return;var desc = Object.getOwnPropertyDescriptor(base, property);if (desc.get) {return desc.get.call(receiver);}return desc.value;};}return _get(target, property, receiver || target);}function _superPropBase(object, property) {while (!Object.prototype.hasOwnProperty.call(object, property)) {object = _getPrototypeOf(object);if (object === null) break;}return object;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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
  'justify-self': 'justifySelf' };


/**
 * Converts the keys of the SUPPORTED_CSS_GRID_ATTRIBUTES object above into a
 * selector for the specified attributes.
 * (e.g. [align-content], [align-items], ...)
 * @private @const {string}
 */
var SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR = Object.keys(
SUPPORTED_CSS_GRID_ATTRIBUTES).

map(function (key) {return "[".concat(key, "]");}).
join(',');

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
  'thirds': 'i-amphtml-story-grid-template-thirds' };


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
    'scaling-factor': 1.142 },

  '2021-foreground': {
    'aspect-ratio': '69:116' } };



/**
 * Grid layer template templating system.
 */
export var AmpStoryGridLayer = /*#__PURE__*/function (_AmpStoryBaseLayer) {_inherits(AmpStoryGridLayer, _AmpStoryBaseLayer);var _super = _createSuper(AmpStoryGridLayer);





  /** @param {!AmpElement} element */
  function AmpStoryGridLayer(element) {var _this;_classCallCheck(this, AmpStoryGridLayer);
    _this = _super.call(this, element);

    /** @private {?{horiz: number, vert: number}} */
    _this.aspectRatio_ = null;

    /** @private {number} */
    _this.scalingFactor_ = 1;return _this;
  }

  /** @override */_createClass(AmpStoryGridLayer, [{ key: "buildCallback", value:
    function buildCallback() {
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
     */ }, { key: "applyResponsivenessPresets_", value:
    function applyResponsivenessPresets_() {var _this2 = this;
      if (!this.element.hasAttribute(PRESET_ATTRIBUTE_NAME)) {
        return;
      }
      var preset = this.element.getAttribute(PRESET_ATTRIBUTE_NAME);
      var presetDetails = GRID_LAYER_PRESET_DETAILS[preset];
      if (!presetDetails) {
        return;
      }
      Object.entries(presetDetails).forEach(function (keyValue) {return (
          _this2.element.setAttribute(keyValue[0], keyValue[1]));});

    }

    /** @private */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {
      var aspectRatio = this.element.getAttribute('aspect-ratio');
      var scalingFactorFloat = parseFloat(
      this.element.getAttribute('scaling-factor'));

      if (scalingFactorFloat && scalingFactorFloat > 0) {
        this.scalingFactor_ = scalingFactorFloat;
      }
      if (aspectRatio) {
        var aspectRatioSplits = aspectRatio.split(':');
        var horiz = parseInt(aspectRatioSplits[0], 10);
        var vert = parseInt(aspectRatioSplits[1], 10);
        if (horiz > 0 && vert > 0) {
          this.aspectRatio_ = { horiz: horiz, vert: vert };
          var storeService = getStoreService(this.win);
          storeService.subscribe(
          StateProperty.PAGE_SIZE,
          this.updatePageSize_.bind(this),
          true /* callToInitialize */);

        }
      }
    }

    /**
     * @param {?{width: number, height: number}} pageSize
     * @private
     */ }, { key: "updatePageSize_", value:
    function updatePageSize_(pageSize) {var _this3 = this;
      if (!pageSize) {
        return;
      }
      var vh = pageSize.height,vw = pageSize.width;
      var _this$aspectRatio_ = this.aspectRatio_,horiz = _this$aspectRatio_.horiz,vert = _this$aspectRatio_.vert;
      var width = Math.min(vw, (vh * horiz) / vert);
      var height = Math.min(vh, (vw * vert) / horiz);
      if (width > 0 && height > 0) {
        this.getVsync().mutate(function () {
          _this3.element.classList.add('i-amphtml-story-grid-template-aspect');
          setStyles(_this3.element, {
            '--i-amphtml-story-layer-width': px(width * _this3.scalingFactor_),
            '--i-amphtml-story-layer-height': px(height * _this3.scalingFactor_) });

        });
      }
    }

    /**
     * Applies internal CSS class names for the template attribute, so that styles
     * can use the class name instead of compound
     * amp-story-grid-layer[template="..."] selectors, since the latter increases
     * CSS specificity and can prevent users from being able to override styles.
     * @private
     */ }, { key: "applyTemplateClassName_", value:
    function applyTemplateClassName_() {
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
     */ }, { key: "setDescendentCssGridStyles_", value:
    function setDescendentCssGridStyles_() {var _this4 = this;
      var elementsToUpgradeStyles = scopedQuerySelectorAll(
      this.element,
      SUPPORTED_CSS_GRID_ATTRIBUTES_SELECTOR);


      Array.prototype.forEach.call(elementsToUpgradeStyles, function (element) {
        _this4.setCssGridStyles_(element);
      });
    }

    /**
     * Copies the allowlisted CSS grid styles for the <amp-story-grid-layer>
     * element itself.
     * @private
     */ }, { key: "setOwnCssGridStyles_", value:
    function setOwnCssGridStyles_() {
      this.setCssGridStyles_(this.element);
    }

    /**
     * Copies the values of an element's attributes to its styles, if the
     * attributes/properties are in the allowlist.
     *
     * @param {!Element} element The element whose styles should be copied from
     *     its attributes.
     */ }, { key: "setCssGridStyles_", value:
    function setCssGridStyles_(element) {
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
    } }], [{ key: "prerenderAllowed", value: /** @override @nocollapse */function prerenderAllowed(element) {return isPrerenderActivePage(element.parentElement);} }]);return AmpStoryGridLayer;}(AmpStoryBaseLayer);
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-grid-layer.js