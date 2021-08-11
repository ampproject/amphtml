function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _get(target, property, receiver) {if (typeof Reflect !== "undefined" && Reflect.get) {_get = Reflect.get;} else {_get = function _get(target, property, receiver) {var base = _superPropBase(target, property);if (!base) return;var desc = Object.getOwnPropertyDescriptor(base, property);if (desc.get) {return desc.get.call(receiver);}return desc.value;};}return _get(target, property, receiver || target);}function _superPropBase(object, property) {while (!Object.prototype.hasOwnProperty.call(object, property)) {object = _getPrototypeOf(object);if (object === null) break;}return object;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview This is a layer that allows a call to action in a story page.
 * With this, a user could link to an external site from inside a story using
 * the call to action layer, for example.
 *
 * Example:
 * ...
 * <amp-story-page>
 *   <amp-story-cta-layer>
 *     <a href="wwww.google.com"> Visit my site! </a>
 *   </amp-story-cta-layer>
 * <amp-story-page>
 * ...
 */

import { AmpStoryBaseLayer } from "./amp-story-base-layer";
import { addAttributesToElement, removeElement } from "../../../src/core/dom";
import { dict } from "../../../src/core/types/object";
import { matches } from "../../../src/core/dom/query";
import { user } from "../../../src/log";

/**
 * @type {string}
 * @const
 */
var TAG = 'amp-story-cta-layer';

/**
 * Call to action button layer template.
 *
 * No pre-rendering to let more computing-intensive elements (like
 * videos) get pre-rendered first. Since this layer will not contain
 * computing-intensive resources such as videos, we can just risk rendering
 * while the user is looking.
 */
export var AmpStoryCtaLayer = /*#__PURE__*/function (_AmpStoryBaseLayer) {_inherits(AmpStoryCtaLayer, _AmpStoryBaseLayer);var _super = _createSuper(AmpStoryCtaLayer);function AmpStoryCtaLayer() {_classCallCheck(this, AmpStoryCtaLayer);return _super.apply(this, arguments);}_createClass(AmpStoryCtaLayer, [{ key: "buildCallback", value:
    /** @override */
    function buildCallback() {
      _get(_getPrototypeOf(AmpStoryCtaLayer.prototype), "buildCallback", this).call(this);
      this.setOrOverwriteAttributes_();
      this.checkAndRemoveLayerIfOnFirstPage_();
    }

    /**
     * Overwrite or set target attributes that are cta-layer-specific.
     * @private
     */ }, { key: "setOrOverwriteAttributes_", value:
    function setOrOverwriteAttributes_() {
      var ctaLinks = this.element.querySelectorAll('a');
      for (var i = 0; i < ctaLinks.length; i++) {
        addAttributesToElement(ctaLinks[i], dict({ 'target': '_blank' }));

        if (!ctaLinks[i].getAttribute('role')) {
          addAttributesToElement(ctaLinks[i], dict({ 'role': 'link' }));
        }
      }

      var ctaButtons = this.element.querySelectorAll('button');
      for (var _i = 0; _i < ctaButtons.length; _i++) {
        if (!ctaButtons[_i].getAttribute('role')) {
          addAttributesToElement(ctaButtons[_i], dict({ 'role': 'button' }));
        }
      }
    }

    /**
     * CTA links or buttons are not allowed on the first amp-story page. Remove
     * the amp-story-cta-layer if it is found on the first page of the story.
     * @private
     */ }, { key: "checkAndRemoveLayerIfOnFirstPage_", value:
    function checkAndRemoveLayerIfOnFirstPage_() {
      if (
      matches(
      this.element,
      'amp-story-page:first-of-type > amp-story-cta-layer'))

      {
        removeElement(this.element);
        user().error(
        TAG,
        'amp-story-cta-layer is not allowed on the first page' +
        ' of an amp-story.');

      }
    } }]);return AmpStoryCtaLayer;}(AmpStoryBaseLayer);
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-cta-layer.js