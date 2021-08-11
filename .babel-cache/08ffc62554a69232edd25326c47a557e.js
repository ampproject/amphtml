var _excluded = ["as", "children", "className", "contentAs", "contentClassName", "contentProps", "contentRef", "contentStyle", "layout", "paint", "size", "style", "wrapperClassName", "wrapperStyle"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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

var CONTAIN = [
null, // 0: none
'paint', // 1: paint
'layout', // 2: layout
'content', // 3: content = layout + paint
'size', // 4: size
'size paint', // 5: size + paint
'size layout', // 6: size + layout
'strict' // 7: strict = size + layout + paint
];

var SIZE_CONTENT_STYLE = {
  'position': 'relative',
  'width': '100%',
  'height': '100%' };


/**
 * The wrapper component that implements different "contain" parameters. This
 * most often indicates that the element's size doesn't depend on its children
 * (e.g. `contain:size`), but there might be other variances as well.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/contain
 *
 * Contain parameters:
 * - size: the element's size does not depend on its content.
 * - layout: nothing outside the element may affect its internal layout and
 * vice versa.
 * - paint: the element's content doesn't display outside the element's bounds.
 * @param {!ContainWrapperComponentProps} props
 * @param {{current: ?Element}} ref
 * @return {PreactDef.Renderable}
 */
function ContainWrapperWithRef(_ref,

















ref)
{var _ref$as = _ref.as,Comp = _ref$as === void 0 ? 'div' : _ref$as,children = _ref.children,className = _ref['className'],_ref$contentAs = _ref.contentAs,ContentComp = _ref$contentAs === void 0 ? 'div' : _ref$contentAs,contentClassName = _ref.contentClassName,contentProps = _ref.contentProps,contentRef = _ref.contentRef,contentStyle = _ref.contentStyle,_ref$layout = _ref.layout,layout = _ref$layout === void 0 ? false : _ref$layout,_ref$paint = _ref.paint,paint = _ref$paint === void 0 ? false : _ref$paint,_ref$size = _ref.size,size = _ref$size === void 0 ? false : _ref$size,style = _ref['style'],wrapperClassName = _ref.wrapperClassName,wrapperStyle = _ref.wrapperStyle,rest = _objectWithoutProperties(_ref, _excluded);
  // The formula: `size << 2 | layout << 1 | paint`.
  var containIndex = (size ? 4 : 0) + (layout ? 2 : 0) + (paint ? 1 : 0);
  return (
    Preact.createElement(Comp, _objectSpread(_objectSpread({},
    rest), {}, {
      ref: ref,
      className: "".concat(className || '', " ").concat(wrapperClassName || '').trim() || null,
      style: _objectSpread(_objectSpread(_objectSpread({},
      style),
      wrapperStyle), {}, {
        contain: CONTAIN[containIndex] }) }),


    Preact.createElement(ContentComp, _objectSpread(_objectSpread({},
    contentProps), {}, {
      ref: contentRef,
      className: contentClassName,
      style: _objectSpread(_objectSpread({}, (((
      size && SIZE_CONTENT_STYLE)))), {}, {
        'overflow': paint ? 'hidden' : 'visible' },
      contentStyle) }),


    children)));



}

var ContainWrapper = forwardRef(ContainWrapperWithRef);

export { ContainWrapper };
// /Users/mszylkowski/src/amphtml/src/preact/component/contain.js