var _excluded = ["captioned", "requestResize", "shortcode", "title"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from "../../../src/preact";
import { IframeEmbed } from "../../../src/preact/component/iframe";
import { dict } from "../../../src/core/types/object";
import { forwardRef } from "../../../src/preact/compat";
import { getData } from "../../../src/event-helper";
import { parseJson } from "../../../src/core/types/object/json";
import { useCallback, useState } from "../../../src/preact";

var NO_HEIGHT_STYLE = dict();
var MATCHES_MESSAGING_ORIGIN = function MATCHES_MESSAGING_ORIGIN(origin) {return (
    origin === 'https://www.instagram.com');};

/**
 * @param {!InstagramDef.Props} props
 * @param {{current: ?InstagramDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function InstagramWithRef(_ref,

ref)
{var captioned = _ref.captioned,requestResize = _ref.requestResize,shortcode = _ref.shortcode,_ref$title = _ref.title,title = _ref$title === void 0 ? 'Instagram' : _ref$title,rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(NO_HEIGHT_STYLE),_useState2 = _slicedToArray(_useState, 2),heightStyle = _useState2[0],setHeightStyle = _useState2[1];
  var _useState3 = useState(0),_useState4 = _slicedToArray(_useState3, 2),opacity = _useState4[0],setOpacity = _useState4[1];

  var messageHandler = useCallback(
  function (event) {
    var data = parseJson(getData(event));
    if (data['type'] == 'MEASURE' && data['details']) {
      var height = data['details']['height'];
      if (requestResize) {
        requestResize(height);
      }
      setHeightStyle(dict({ 'height': height }));
      setOpacity(1);
    }
  },
  [requestResize]);


  return (
    Preact.createElement(IframeEmbed, _objectSpread({
      allowTransparency: true,
      iframeStyle: { opacity: opacity },
      matchesMessagingOrigin: MATCHES_MESSAGING_ORIGIN,
      messageHandler: messageHandler,
      ref: ref,
      src:
      'https://www.instagram.com/p/' +
      encodeURIComponent(shortcode) +
      '/embed/' + ((
      captioned ? 'captioned/' : '')) +
      '?cr=1&v=12',

      title: title,
      wrapperStyle: heightStyle },
    rest)));


}

var Instagram = forwardRef(InstagramWithRef);
Instagram.displayName = 'Instagram'; // Make findable for tests.
export { Instagram };
// /Users/mszylkowski/src/amphtml/extensions/amp-instagram/1.0/component.js