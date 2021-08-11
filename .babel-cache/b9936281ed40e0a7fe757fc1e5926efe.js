var _excluded = ["alt", "aria-label", "as", "caption", "children", "enableActivation", "group", "onMount", "render", "srcset"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { LightboxGalleryContext } from "./context";
import {
cloneElement,
useCallback,
useContext,
useLayoutEffect,
useMemo,
useState } from "../../../src/preact";

import { sequentialIdGenerator } from "../../../src/core/data-structures/id-generator";
import { toChildArray } from "../../../src/preact/compat";

var generateLightboxItemKey = sequentialIdGenerator();

/** @const {string} */
var DEFAULT_ARIA_LABEL = 'Open content in a lightbox view.';

/** @const {!Object<string, *>} */
var DEFAULT_ACTIVATION_PROPS = {
  'aria-label': DEFAULT_ARIA_LABEL,
  role: 'button',
  tabIndex: 0 };


/**
 *
 * @param {!PreactDef.Renderable} child
 * @return {!PreactDef.Renderable}
 */
var CLONE_CHILD = function CLONE_CHILD(child) {return cloneElement(child);};

/**
 * @param {!LightboxGalleryDef.WithLightboxProps} props
 * @return {PreactDef.Renderable}
 */
export function WithLightbox(_ref)











{var _Comp;var alt = _ref.alt,ariaLabel = _ref['aria-label'],_ref$as = _ref.as,Comp = _ref$as === void 0 ? 'div' : _ref$as,captionProp = _ref.caption,children = _ref.children,_ref$enableActivation = _ref.enableActivation,enableActivation = _ref$enableActivation === void 0 ? true : _ref$enableActivation,group = _ref.group,onMount = _ref.onMount,renderProp = _ref.render,srcset = _ref.srcset,rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(generateLightboxItemKey),_useState2 = _slicedToArray(_useState, 1),genKey = _useState2[0];
  var _useContext = useContext(LightboxGalleryContext),deregister = _useContext.deregister,open = _useContext.open,register = _useContext.register;
  var render = useCallback(function () {
    if (renderProp) {
      return renderProp();
    }
    if (children) {
      return toChildArray(children).map(CLONE_CHILD);
    }
    return (_Comp || (_Comp = Preact.createElement(Comp, { srcset: srcset })));
  }, [children, renderProp, srcset]);

  var caption = useMemo(
  function () {return captionProp || alt || ariaLabel;},
  [alt, ariaLabel, captionProp]);


  useLayoutEffect(function () {
    register(genKey, group, render, caption);
    return function () {return deregister(genKey, group);};
  }, [caption, genKey, group, deregister, register, render]);

  useLayoutEffect(function () {
    return (onMount === null || onMount === void 0) ? (void 0) : onMount(Number(genKey) - 1);
  }, [genKey, onMount]);

  var activationProps = useMemo(
  function () {return (
      enableActivation && _objectSpread(_objectSpread({},
      DEFAULT_ACTIVATION_PROPS), {}, {
        /* genKey is 1-indexed, gallery is 0-indexed */
        onClick: function onClick() {
          open(Number(genKey) - 1, group);
        } }));},

  [enableActivation, genKey, group, open]);


  return (
    Preact.createElement(Comp, _objectSpread(_objectSpread({}, activationProps), {}, { srcset: srcset }, rest),
    children));


}
// /Users/mszylkowski/src/amphtml/extensions/amp-lightbox-gallery/1.0/consumer.js