import { $minContentHeight as _$minContentHeight } from "./component.jss";import { $fitTextContent as _$fitTextContent } from "./component.jss";import { $fitTextContentWrapper as _$fitTextContentWrapper } from "./component.jss";var _excluded = ["children", "maxFontSize", "minFontSize"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { ContainWrapper } from "../../../src/preact/component";
import { LINE_HEIGHT_EM_, useStyles } from "./component.jss";
import { px, resetStyles, setStyle, setStyles } from "../../../src/core/dom/style";
import { toWin } from "../../../src/core/window";
import { useCallback, useLayoutEffect, useRef } from "../../../src/preact";

/**
 * @param {!FitTextProps} props
 * @return {PreactDef.Renderable}
 */
export function FitText(_ref)




{var children = _ref.children,_ref$maxFontSize = _ref.maxFontSize,maxFontSize = _ref$maxFontSize === void 0 ? 72 : _ref$maxFontSize,_ref$minFontSize = _ref.minFontSize,minFontSize = _ref$minFontSize === void 0 ? 6 : _ref$minFontSize,rest = _objectWithoutProperties(_ref, _excluded);

  var containerRef = useRef(null);
  var measurerRef = useRef(null);
  var heightRef = useRef(null);

  var resize = useCallback(function () {
    if (!measurerRef.current || !containerRef.current) {
      return;
    }
    var _containerRef$current = containerRef.current,clientHeight = _containerRef$current.clientHeight,clientWidth = _containerRef$current.clientWidth;
    var fontSize = calculateFontSize(
    measurerRef.current,
    clientHeight,
    clientWidth,
    minFontSize,
    maxFontSize);

    setOverflowStyle(measurerRef.current, clientHeight, fontSize);
  }, [maxFontSize, minFontSize]);

  // useLayoutEffect is used so intermediary font sizes during calculation
  // are resolved before the component visually updates.
  useLayoutEffect(function () {
    var container = containerRef.current;
    var content = heightRef.current;
    if (!container || !content) {
      return;
    }
    var win = toWin(container.ownerDocument.defaultView);
    if (!win) {
      return undefined;
    }
    var observer = new win.ResizeObserver(function () {return resize();});
    observer.observe(container);
    observer.observe(content);
    return function () {return observer.disconnect();};
  }, [resize]);

  return (
    Preact.createElement(ContainWrapper, _objectSpread({
      size: true,
      layout: true,
      paint: true,
      contentRef: containerRef,
      contentClassName: _$fitTextContentWrapper },
    rest),

    Preact.createElement("div", { ref: measurerRef, className: _$fitTextContent },
    Preact.createElement("div", { ref: heightRef, className: _$minContentHeight },
    children))));




}

/**
 * @param {Element} measurer
 * @param {number} expectedHeight
 * @param {number} expectedWidth
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 * @visibleForTesting
 */
export function calculateFontSize(
measurer,
expectedHeight,
expectedWidth,
minFontSize,
maxFontSize)
{
  maxFontSize++;
  // Binary search for the best font size.
  while (maxFontSize - minFontSize > 1) {
    var mid = Math.floor((minFontSize + maxFontSize) / 2);
    setStyle(measurer, 'fontSize', px(mid));
    var width = measurer. /*OK*/scrollWidth;
    var height = measurer. /*OK*/scrollHeight;
    if (height > expectedHeight || width > expectedWidth) {
      maxFontSize = mid;
    } else {
      minFontSize = mid;
    }
  }
  setStyle(measurer, 'fontSize', px(minFontSize));
  return minFontSize;
}

/**
 * @param {Element} measurer
 * @param {number} maxHeight
 * @param {number} fontSize
 * @visibleForTesting
 */
export function setOverflowStyle(measurer, maxHeight, fontSize) {
  var overflowed = measurer. /*OK*/scrollHeight > maxHeight;
  var lineHeight = fontSize * LINE_HEIGHT_EM_;
  var numberOfLines = Math.floor(maxHeight / lineHeight);
  if (overflowed) {
    setStyles(measurer, {
      'lineClamp': numberOfLines,
      '-webkit-line-clamp': numberOfLines,
      'maxHeight': px(lineHeight * numberOfLines) });

    // Cannot use setInitialDisplay which calls devAssert.
    // eslint-disable-next-line local/no-style-display
    resetStyles(measurer, ['display']);
  } else {
    // eslint-disable-next-line local/no-style-display
    setStyle(measurer, 'display', 'flex');
    resetStyles(measurer, ['lineClamp', '-webkit-line-clamp', 'maxHeight']);
  }
}
// /Users/mszylkowski/src/amphtml/extensions/amp-fit-text/1.0/component.js