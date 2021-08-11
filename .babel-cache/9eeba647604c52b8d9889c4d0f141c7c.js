var _excluded = ["as", "children", "className", "style", "wrapperClassName", "wrapperStyle"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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

import * as Preact from "./..";
import { forwardRef } from "../compat";

/**
 * The wrapper component provides the canonical wrapper for components whose
 * size depends on the children. This is often the opposite of the
 * `ContainWrapper`.
 * @param {!WrapperComponentProps} props
 * @param {{current: ?Element}} ref
 * @return {PreactDef.Renderable}
 */
function WrapperWithRef(_ref,









ref)
{var _ref$as = _ref.as,Comp = _ref$as === void 0 ? 'div' : _ref$as,children = _ref.children,className = _ref['className'],style = _ref['style'],wrapperClassName = _ref.wrapperClassName,wrapperStyle = _ref.wrapperStyle,rest = _objectWithoutProperties(_ref, _excluded);
  return (
    Preact.createElement(Comp, _objectSpread(_objectSpread({},
    rest), {}, {
      ref: ref,
      className: "".concat(className || '', " ").concat(wrapperClassName || '').trim() || null,
      style: _objectSpread(_objectSpread({}, style), wrapperStyle) }),

    children));


}

var Wrapper = forwardRef(WrapperWithRef);

export { Wrapper };
// /Users/mszylkowski/src/amphtml/src/preact/component/wrapper.js