function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

import { BaseTemplate } from "../../../src/base-template";
import { Purifier } from "../../../src/purifier";
import { dict } from "../../../src/core/types/object";
import { getService, registerServiceBuilder } from "../../../src/service-helpers";
import { iterateCursor, templateContentClone } from "../../../src/core/dom";
import { rewriteAttributeValue } from "../../../src/url-rewrite";
import { user } from "../../../src/log";
import mustache from "../../../third_party/mustache/mustache";

var TAG = 'amp-mustache';

/**
 * Implements an AMP template for Mustache.js.
 * See {@link https://github.com/janl/mustache.js/}.
 *
 * @visibleForTesting
 */
export var AmpMustache = /*#__PURE__*/function (_BaseTemplate) {_inherits(AmpMustache, _BaseTemplate);var _super = _createSuper(AmpMustache);
  /**
   * @param {!Element} element
   * @param {!Window} win
   */
  function AmpMustache(element, win) {var _this;_classCallCheck(this, AmpMustache);
    _this = _super.call(this, element, win);

    registerServiceBuilder(win, 'purifier', function () {
      return new Purifier(win.document, dict(), rewriteAttributeValue);
    });
    /** @private @const {!Purifier} */
    _this.purifier_ = getService(win, 'purifier');

    // Unescaped templating (triple mustache) has a special, strict sanitizer.
    mustache.setUnescapedSanitizer(function (value) {return (
        _this.purifier_.purifyTagsForTripleMustache(value));});return _this;

  }

  /** @override */_createClass(AmpMustache, [{ key: "compileCallback", value:
    function compileCallback() {
      // If viewer is renderTemplate capable, skip the handling of the mustache
      // templates as its rendering is managed by the viewer. This template will
      // only be responsible for sanitizing and inserting it into the DOM.
      if (this.viewerCanRenderTemplates()) {
        return;
      }
      /** @private @const {!JsonObject} */
      this.nestedTemplates_ = dict();

      /** @private @const {string} */
      this.template_ = this.initTemplateString_();

      try {
        mustache.parse(this.template_, /* tags */undefined);
      } catch (err) {
        user().error(TAG, err.message, this.element);
      }
    }

    /**
     * @private
     * @return {string}
     */ }, { key: "initTemplateString_", value:
    function initTemplateString_() {
      if (this.element.tagName == 'TEMPLATE') {
        var content = templateContentClone(this.element);
        this.processNestedTemplates_(content);
        var container = this.element.ownerDocument.createElement('div');
        container.appendChild(content);
        return container. /*OK*/innerHTML;
      } else if (this.element.tagName == 'SCRIPT') {
        return this.element.textContent;
      }

      return '';
    }

    /**
     * Stores and replaces nested templates with custom triple-mustache pointers.
     *
     * This prevents the outer-most template from replacing variables in nested
     * templates. Note that this constrains nested template markup to the more
     * restrictive sanitization rules of triple-mustache.
     *
     * @param {!DocumentFragment} content
     */ }, { key: "processNestedTemplates_", value:
    function processNestedTemplates_(content) {var _this2 = this;
      var templates = content.querySelectorAll('template');
      iterateCursor(templates, function (template, index) {
        var key = "__AMP_NESTED_TEMPLATE_".concat(index);

        // Store the nested template markup, keyed by index.
        _this2.nestedTemplates_[key] = template. /*OK*/outerHTML;

        // Replace the markup with a pointer.
        var pointer = _this2.element.ownerDocument.createTextNode("{{{".concat(key, "}}}"));
        template.parentNode.replaceChild(pointer, template);
      });
    }

    /** @override */ }, { key: "setHtml", value:
    function setHtml(html) {
      var wrapped = "<div>".concat(html, "</div>");
      var purified = this.tryUnwrap(this.purifyAndSetHtml_(wrapped));
      return this.unwrapChildren(purified);
    }

    /** @override */ }, { key: "render", value:
    function render(data) {
      return this.tryUnwrap(this.render_(data));
    }

    /** @override */ }, { key: "renderAsString", value:
    function renderAsString(data) {
      return this.render_(data). /*OK*/innerHTML;
    }

    /**
     * @param {!JsonObject|string} data
     * @return {!Element}
     * @private
     */ }, { key: "render_", value:
    function render_(data) {
      var mustacheData = data;
      // Also render any nested templates.
      if (_typeof(data) === 'object') {
        mustacheData = _objectSpread(_objectSpread({}, data), this.nestedTemplates_);
      }
      var html = mustache.render(
      this.template_,
      mustacheData,
      /* partials */undefined);

      return this.purifyAndSetHtml_(html);
    }

    /**
     * @param {string} html
     * @return {!Element}
     * @private
     */ }, { key: "purifyAndSetHtml_", value:
    function purifyAndSetHtml_(html) {
      var body = this.purifier_.purifyHtml("<div>".concat(html, "</div>"));
      return body.firstElementChild;
    } }]);return AmpMustache;}(BaseTemplate);


AMP.extension(TAG, '0.2', function (AMP) {
  AMP.registerTemplate(TAG, AmpMustache);
});
// /Users/mszylkowski/src/amphtml/extensions/amp-mustache/0.2/amp-mustache.js