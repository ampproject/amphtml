function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
import { isJsonScriptTag } from "../../../src/core/dom";
import { isObject } from "../../../src/core/types";
import { parseJson } from "../../../src/core/types/object/json";
import { user, userAssert } from "../../../src/log";

/** @const {string} */
var TAG = 'amp-story-auto-ads:config';

/** @enum {boolean} */
var DisallowedAdAttributes = {
  'height': true,
  'layout': true,
  'width': true };


/** @enum {boolean} */
var AllowedAdTypes = {
  'adsense': true,
  'custom': true,
  'doubleclick': true,
  'fake': true,
  'nws': true };


export var StoryAdConfig = /*#__PURE__*/function () {
  /**
   * @param {!Element} element amp-story-auto-ads element.
   * @param {!Window} win Window element
   */
  function StoryAdConfig(element, win) {_classCallCheck(this, StoryAdConfig);
    /** @private {!Element} amp-story-auto ads element. */
    this.element_ = element;
    /** @private {!Window} Window element */
    this.win_ = win;
  }

  /**
   * Validate and sanitize config.
   * @return {!JsonObject}
   */_createClass(StoryAdConfig, [{ key: "getConfig", value:
    function getConfig() {var _this = this;
      var configData = this.element_.hasAttribute('src') ?
      this.getRemoteConfig_() :
      this.getInlineConfig_(this.element_.firstElementChild);
      return configData.then(function (jsonConfig) {return _this.validateConfig_(jsonConfig);});
    }

    /**
     * @param {!Element} jsonConfig
     * @return {!JsonObject}
     */ }, { key: "validateConfig_", value:
    function validateConfig_(jsonConfig) {
      var requiredAttrs = {
        class: 'i-amphtml-story-ad',
        layout: 'fill',
        'amp-story': '' };


      var adAttributes = jsonConfig['ad-attributes'];
      userAssert(
      adAttributes,
      "".concat(TAG, " Error reading config. ") +
      'Top level JSON should have an "ad-attributes" key');


      this.validateType_(adAttributes['type']);

      for (var attr in adAttributes) {
        var value = adAttributes[attr];
        if (isObject(value)) {
          adAttributes[attr] = JSON.stringify(value);
        }
        if (DisallowedAdAttributes[attr]) {
          user().warn(TAG, 'ad-attribute "%s" is not allowed', attr);
          delete adAttributes[attr];
        }
      }
      return (/** @type {!JsonObject} */_objectSpread(_objectSpread({}, adAttributes), requiredAttrs));
    }

    /**
     * @param {!Element} child
     * @return {!JsonObject}
     */ }, { key: "getInlineConfig_", value:
    function getInlineConfig_(child) {
      userAssert(
      child && isJsonScriptTag(child),
      "The ".concat(TAG, " should ") +
      'be inside a <script> tag with type="application/json"');

      var inlineJSONConfig = parseJson(child.textContent);

      return Promise.resolve(inlineJSONConfig);
    }

    /**
     * @return {!JsonObject}
     */ }, { key: "getRemoteConfig_", value:
    function getRemoteConfig_() {
      return Services.xhrFor(this.win_).
      fetchJson(this.element_.getAttribute('src')).
      then(function (response) {return response.json();}).
      catch(function (err) {
        user().error(
        TAG,
        'error determining if remote config is valid json: bad url or bad json',
        err);

      });
    }

    /**
     * Logic specific to each ad type.
     * @param {string} type
     */ }, { key: "validateType_", value:
    function validateType_(type) {
      userAssert(
      !!AllowedAdTypes[type], "".concat(
      TAG, " \"").concat(type, "\" ad type is missing or not supported"));


      if (type === 'fake') {
        var id = this.element_.id;
        userAssert(
        id && id.startsWith('i-amphtml-demo-'), "".concat(
        TAG, " id must start with i-amphtml-demo- to use fake ads"));

      }
    } }]);return StoryAdConfig;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-config.js