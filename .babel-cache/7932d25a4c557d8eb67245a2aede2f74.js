var _excluded = ["action", "colorscheme", "embedAs", "hideCover", "hideCta", "href", "includeCommentParent", "kdSite", "layout", "locale", "numPosts", "onReady", "orderBy", "refLabel", "requestResize", "share", "showFacepile", "showText", "size", "smallHeader", "style", "tabs", "title"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { MessageType, ProxyIframeEmbed } from "../../../src/preact/component/3p-frame";
import { dashToUnderline } from "../../../src/core/types/string";
import { deserializeMessage } from "../../../src/3p-frame-messaging";
import { forwardRef } from "../../../src/preact/compat";
import { tryParseJson } from "../../../src/core/types/object/json";
import { useCallback, useLayoutEffect, useState } from "../../../src/preact";

/** @const {string} */
var TYPE = 'facebook';
var FULL_HEIGHT = '100%';
var MATCHES_MESSAGING_ORIGIN = function MATCHES_MESSAGING_ORIGIN() {return true;};
var DEFAULT_TITLE = 'Facebook comments';

/**
 * @param {!FacebookDef.Props} props
 * @param {{current: ?FacebookDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function FacebookWithRef(_ref,


























ref)
{var action = _ref.action,colorscheme = _ref.colorscheme,embedAs = _ref.embedAs,hideCover = _ref.hideCover,hideCta = _ref.hideCta,href = _ref.href,includeCommentParent = _ref.includeCommentParent,kdSite = _ref.kdSite,layout = _ref.layout,localeProp = _ref.locale,numPosts = _ref.numPosts,onReady = _ref.onReady,orderBy = _ref.orderBy,refLabel = _ref.refLabel,requestResize = _ref.requestResize,share = _ref.share,showFacepile = _ref.showFacepile,showText = _ref.showText,size = _ref.size,smallHeader = _ref.smallHeader,style = _ref.style,tabs = _ref.tabs,_ref$title = _ref.title,title = _ref$title === void 0 ? DEFAULT_TITLE : _ref$title,rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(null),_useState2 = _slicedToArray(_useState, 2),height = _useState2[0],setHeight = _useState2[1];
  var messageHandler = useCallback(
  function (event) {var _tryParseJson;
    var data = (_tryParseJson = tryParseJson(event.data)) !== null && _tryParseJson !== void 0 ? _tryParseJson : deserializeMessage(event.data);
    if (data['action'] == 'ready') {
      (onReady === null || onReady === void 0) ? (void 0) : onReady();
    }
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
  [requestResize, onReady]);


  var _useState3 = useState(localeProp),_useState4 = _slicedToArray(_useState3, 2),locale = _useState4[0],setLocale = _useState4[1];
  useLayoutEffect(function () {var _ref$current, _ref$current$ownerDoc;
    if (localeProp) {
      setLocale(localeProp);
      return;
    }
    var win = (ref === null || ref === void 0) ? (void 0) : ((_ref$current = ref.current) === null || _ref$current === void 0) ? (void 0) : ((_ref$current$ownerDoc = _ref$current.ownerDocument) === null || _ref$current$ownerDoc === void 0) ? (void 0) : _ref$current$ownerDoc.defaultView;
    if (!win) {
      return;
    }
    setLocale(dashToUnderline(win.navigator.language));
  }, [localeProp, ref]);

  return (
    Preact.createElement(ProxyIframeEmbed, _objectSpread(_objectSpread({
      options: {
        action: action,
        colorscheme: colorscheme,
        embedAs: embedAs,
        hideCover: hideCover,
        hideCta: hideCta,
        href: href,
        includeCommentParent: includeCommentParent,
        'kd_site': kdSite,
        layout: layout,
        locale: locale,
        numPosts: numPosts,
        orderBy: orderBy,
        ref: refLabel,
        share: share,
        showFacepile: showFacepile,
        showText: showText,
        size: size,
        smallHeader: smallHeader,
        tabs: tabs },

      ref: ref,
      title: title },
    rest), {}, {
      /* non-overridable props */
      // We sandbox all 3P iframes however facebook embeds completely break in
      // sandbox mode since they need access to document.domain, so we
      // exclude facebook.
      excludeSandbox: true,
      matchesMessagingOrigin: MATCHES_MESSAGING_ORIGIN,
      messageHandler: messageHandler,
      type: TYPE,
      style: height ? _objectSpread(_objectSpread({}, style), {}, { height: height }) : style })));


}

var Facebook = forwardRef(FacebookWithRef);
Facebook.displayName = 'Facebook'; // Make findable for tests.
export { Facebook };
// /Users/mszylkowski/src/amphtml/extensions/amp-facebook/1.0/component.js