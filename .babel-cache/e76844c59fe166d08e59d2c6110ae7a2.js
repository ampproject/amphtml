var _excluded = ["allow", "bootstrap", "contextOptions", "excludeSandbox", "name", "messageHandler", "options", "sandbox", "src", "type", "title"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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

import { getOptionalSandboxFlags, getRequiredSandboxFlags } from "../../core/3p-frame";
import { sequentialIdGenerator } from "../../core/data-structures/id-generator";
import { dict } from "../../core/types/object";
import { includes } from "../../core/types/string";

import * as Preact from "./..";
import {
useEffect,
useImperativeHandle,
useLayoutEffect,
useMemo,
useRef,
useState } from "./..";

import { forwardRef } from "../compat";

import { IframeEmbed } from "./iframe";

import {
generateSentinel,
getBootstrapUrl,
getDefaultBootstrapBaseUrl } from "../../3p-frame";

import { parseUrlDeprecated } from "../../url";

/** @type {!Object<string,function():void>} 3p frames for that type. */
export var countGenerators = {};

/** @enum {string} */
export var MessageType = {
  // TODO(wg-bento): Add more types as they become needed.
  EMBED_SIZE: 'embed-size' };


// Block synchronous XHR in ad. These are very rare, but super bad for UX
// as they block the UI thread for the arbitrary amount of time until the
// request completes.
var BLOCK_SYNC_XHR = "sync-xhr 'none'";

// TODO(wg-bento): UA check for required flags without iframe element
var DEFAULT_SANDBOX =
getRequiredSandboxFlags().join(' ') +
' ' +
getOptionalSandboxFlags().join(' ');

/**
 * Creates the iframe for the embed. Applies correct size and passes the embed
 * attributes to the frame via JSON inside the fragment.
 * @param {!IframeEmbedDef.Props} props
 * @param {{current: (!IframeEmbedDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
function ProxyIframeEmbedWithRef(_ref,














ref)
{var _ref$allow = _ref.allow,allow = _ref$allow === void 0 ? BLOCK_SYNC_XHR : _ref$allow,bootstrap = _ref.bootstrap,contextOptions = _ref.contextOptions,excludeSandbox = _ref.excludeSandbox,nameProp = _ref.name,messageHandler = _ref.messageHandler,options = _ref.options,_ref$sandbox = _ref.sandbox,sandbox = _ref$sandbox === void 0 ? DEFAULT_SANDBOX : _ref$sandbox,srcProp = _ref.src,type = _ref.type,_ref$title = _ref.title,title = _ref$title === void 0 ? type : _ref$title,rest = _objectWithoutProperties(_ref, _excluded);
  if (!includes(allow, BLOCK_SYNC_XHR)) {
    throw new Error("'allow' prop must contain \"".concat(
    BLOCK_SYNC_XHR, "\". Found \"").concat(allow, "\"."));

  }

  var contentRef = useRef(null);
  var iframeRef = useRef(null);
  var count = useMemo(function () {
    if (!countGenerators[type]) {
      countGenerators[type] = sequentialIdGenerator();
    }
    return countGenerators[type]();
  }, [type]);

  var _useState = useState({ name: nameProp, src: srcProp }),_useState2 = _slicedToArray(_useState, 2),_useState2$ = _useState2[0],name = _useState2$.name,src = _useState2$.src,setNameAndSrc = _useState2[1];
  useLayoutEffect(function () {var _contentRef$current, _contentRef$current$o;
    var win = ((_contentRef$current = contentRef.current) === null || _contentRef$current === void 0) ? (void 0) : ((_contentRef$current$o = _contentRef$current.ownerDocument) === null || _contentRef$current$o === void 0) ? (void 0) : _contentRef$current$o.defaultView;
    var src =
    srcProp !== null && srcProp !== void 0 ? srcProp : (win ? getDefaultBootstrapBaseUrl(win) : 'about:blank');
    if (nameProp) {
      setNameAndSrc({ name: nameProp, src: src });
      return;
    }
    if (!win) {
      return;
    }
    var context = Object.assign(
    dict({
      'location': {
        'href': win.location.href },

      'sentinel': generateSentinel(win) }),

    contextOptions);

    var attrs = Object.assign(
    dict({
      'title': title,
      'type': type,
      '_context': context }),

    options);

    setNameAndSrc({
      name: JSON.stringify(
      dict({
        'host': parseUrlDeprecated(src).hostname,
        'bootstrap': bootstrap !== null && bootstrap !== void 0 ? bootstrap : getBootstrapUrl(type),
        'type': type,
        // "name" must be unique across iframes, so we add a count.
        // See: https://github.com/ampproject/amphtml/pull/2955
        'count': count,
        'attributes': attrs })),


      src: src });

  }, [
  bootstrap,
  contextOptions,
  count,
  nameProp,
  options,
  srcProp,
  title,
  type]);


  useEffect(function () {var _iframeRef$current;
    var iframe = ((_iframeRef$current = iframeRef.current) === null || _iframeRef$current === void 0) ? (void 0) : _iframeRef$current.node;
    if (!iframe) {
      return;
    }
    var parent = iframe.parentNode;
    parent.insertBefore(iframe, iframe.nextSibling);
  }, [name]);

  // Component API: IframeEmbedDef.Api.
  useImperativeHandle(
  ref,
  function () {return ({
      // Standard Bento
      get readyState() {var _iframeRef$current2;
        return ((_iframeRef$current2 = iframeRef.current) === null || _iframeRef$current2 === void 0) ? (void 0) : _iframeRef$current2.readyState;
      },
      get node() {var _iframeRef$current3;
        return ((_iframeRef$current3 = iframeRef.current) === null || _iframeRef$current3 === void 0) ? (void 0) : _iframeRef$current3.node;
      } });},

  []);


  return (
    Preact.createElement(IframeEmbed, _objectSpread({
      allow: allow,
      contentRef: contentRef,
      messageHandler: messageHandler,
      name: name,
      ref: iframeRef,
      ready: !!name,
      sandbox: excludeSandbox ? undefined : sandbox,
      src: src,
      title: title },
    rest)));


}

var ProxyIframeEmbed = forwardRef(ProxyIframeEmbedWithRef);
ProxyIframeEmbed.displayName = 'ProxyIframeEmbed'; // Make findable for tests.
export { ProxyIframeEmbed };
// /Users/mszylkowski/src/amphtml/src/preact/component/3p-frame.js