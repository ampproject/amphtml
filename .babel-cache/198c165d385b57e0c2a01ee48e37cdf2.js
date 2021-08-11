import { $arrowIcon as _$arrowIcon } from "./component.jss";import { $arrowBackground as _$arrowBackground } from "./component.jss";import { $arrowBaseStyle as _$arrowBaseStyle3 } from "./component.jss";import { $arrowBackdrop as _$arrowBackdrop } from "./component.jss";import { $arrowBaseStyle as _$arrowBaseStyle2 } from "./component.jss";import { $arrowFrosting as _$arrowFrosting } from "./component.jss";import { $arrowBaseStyle as _$arrowBaseStyle } from "./component.jss";import { $defaultArrowButton as _$defaultArrowButton } from "./component.jss";import { $ltr as _$ltr } from "./component.jss";import { $rtl as _$rtl } from "./component.jss";import { $insetArrow as _$insetArrow } from "./component.jss";import { $outsetArrow as _$outsetArrow } from "./component.jss";import { $arrowNext as _$arrowNext } from "./component.jss";import { $arrowPrev as _$arrowPrev } from "./component.jss";import { $arrowDisabled as _$arrowDisabled } from "./component.jss";import { $arrow as _$arrow } from "./component.jss";var _excluded = ["advance", "as", "by", "disabled", "outsetArrows", "rtl"],_excluded2 = ["by", "className"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { useStyles } from "./component.jss";
import objstr from 'obj-str';

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
export function Arrow(_ref)







{var advance = _ref.advance,_ref$as = _ref.as,Comp = _ref$as === void 0 ? DefaultArrow : _ref$as,by = _ref.by,disabled = _ref.disabled,outsetArrows = _ref.outsetArrows,rtl = _ref.rtl,rest = _objectWithoutProperties(_ref, _excluded);

  var onClick = function onClick() {
    if (!disabled) {
      advance();
    }
  };
  return (
    Preact.createElement(Comp, _objectSpread({
      "aria-disabled": String(!!disabled),
      by: by,
      className: (((((((((((((((('' + ((
      true ? _$arrow : '')))) + ((
      disabled ? ' ' + _$arrowDisabled : '')))) + ((
      by < 0 ? ' ' + _$arrowPrev : '')))) + ((
      by > 0 ? ' ' + _$arrowNext : '')))) + ((
      outsetArrows ? ' ' + _$outsetArrow : '')))) + ((
      !outsetArrows ? ' ' + _$insetArrow : '')))) + ((
      rtl ? ' ' + _$rtl : '')))) + ((
      !rtl ? ' ' + _$ltr : '')))),

      disabled: disabled,
      onClick: onClick,
      outsetArrows: outsetArrows,
      rtl: rtl },
    rest)));


}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow(_ref2) {var by = _ref2.by,className = _ref2.className,rest = _objectWithoutProperties(_ref2, _excluded2);

  return (
    Preact.createElement("div", { className: className },
    Preact.createElement("button", _objectSpread({
      "aria-label":
      by < 0 ? 'Previous item in carousel' : 'Next item in carousel',

      className: _$defaultArrowButton },
    rest),

    Preact.createElement("div", {
      className: "".concat(_$arrowBaseStyle, " ").concat(_$arrowFrosting) }),

    Preact.createElement("div", {
      className: "".concat(_$arrowBaseStyle2, " ").concat(_$arrowBackdrop) }),

    Preact.createElement("div", {
      className: "".concat(_$arrowBaseStyle3, " ").concat(_$arrowBackground) }),

    Preact.createElement("svg", { className: _$arrowIcon, viewBox: "0 0 24 24" },
    Preact.createElement("path", {
      d:
      by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6',

      fill: "none",
      "stroke-width": "2px",
      "stroke-linejoin": "round",
      "stroke-linecap": "round" })))));





}
// /Users/mszylkowski/src/amphtml/extensions/amp-base-carousel/1.0/arrow.js