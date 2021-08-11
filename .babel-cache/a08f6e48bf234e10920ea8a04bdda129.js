var _excluded = ["requestResize", "style", "title", "url"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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

import * as Preact from "../../../src/preact";
import { EmbedlyContext } from "./embedly-context";
import { MessageType, ProxyIframeEmbed } from "../../../src/preact/component/3p-frame";
import { deserializeMessage } from "../../../src/3p-frame-messaging";
import { forwardRef } from "../../../src/preact/compat";
import { useCallback, useContext, useState } from "../../../src/preact";

/**
 * Attribute name used to set api key with name
 * expected by embedly.
 * @const {string}
 */
var API_KEY_ATTR_NAME = 'data-card-key';

var FULL_HEIGHT = '100%';

/**
 * @param {!EmbedlyCardDef.Props} props
 * @param {{current: ?EmbedlyCardDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function EmbedlyCardWithRef(_ref,

ref)
{var requestResize = _ref.requestResize,style = _ref.style,title = _ref.title,url = _ref.url,rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(null),_useState2 = _slicedToArray(_useState, 2),height = _useState2[0],setHeight = _useState2[1];
  var messageHandler = useCallback(
  function (event) {
    var data = deserializeMessage(event.data);
    if (data['type'] == MessageType.EMBED_SIZE) {
      var _height = data['height'];
      if (requestResize) {
        requestResize(_height);
        setHeight(FULL_HEIGHT);
      } else {
        setHeight(_height);
      }
    }
  },
  [requestResize]);


  var _useContext = useContext(EmbedlyContext),apiKey = _useContext.apiKey;

  // Check for valid props
  if (!checkProps(url)) {
    displayWarning('url prop is required for EmbedlyCard');
  }

  // Prepare options for ProxyIframeEmbed
  var iframeOptions = {
    url: url };


  // Add embedly key
  if (apiKey) {
    iframeOptions[API_KEY_ATTR_NAME] = apiKey;
  }

  return (
    Preact.createElement(ProxyIframeEmbed, _objectSpread(_objectSpread({
      options: iframeOptions,
      ref: ref,
      title: title || 'Embedly card',
      type: "embedly" },
    rest), {}, {
      // non-overridable props
      messageHandler: messageHandler,
      style: height ? _objectSpread(_objectSpread({}, style), {}, { height: height }) : style })));


}

/**
 * Verify required props and throw error if necessary.
 * @param {string|undefined} url URL to check
 * @return {boolean} true on valid
 */
function checkProps(url) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  return !!url;
}

/**
 * Display warning in browser console
 * @param {?string} message Warning to be displayed
 */
function displayWarning(message) {
  console /*OK*/.
  warn(message);
}

var EmbedlyCard = forwardRef(EmbedlyCardWithRef);
EmbedlyCard.displayName = 'EmbedlyCard'; // Make findable for tests.
export { EmbedlyCard };
// /Users/mszylkowski/src/amphtml/extensions/amp-embedly-card/1.0/component.js