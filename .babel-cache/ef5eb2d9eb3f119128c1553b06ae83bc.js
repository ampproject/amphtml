import { $insetArrow as _$insetArrow } from "./component.jss";import { $outsetArrow as _$outsetArrow } from "./component.jss";import { $arrowNext as _$arrowNext } from "./component.jss";import { $arrowPrev as _$arrowPrev } from "./component.jss";import { $arrow as _$arrow } from "./component.jss";import { $extraSpace as _$extraSpace } from "./component.jss";import { $gallery as _$gallery } from "./component.jss";var _excluded = ["arrowPrevAs", "arrowNextAs", "children", "className", "extraSpace", "maxItemWidth", "minItemWidth", "maxVisibleCount", "minVisibleCount", "outsetArrows", "peek", "slideAlign"],_excluded2 = ["by", "className", "outsetArrows"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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

import * as Preact from "../../../src/preact";
import { BaseCarousel } from "../../amp-base-carousel/1.0/component";
import { forwardRef } from "../../../src/preact/compat";
import { setStyle } from "../../../src/core/dom/style";
import { toWin } from "../../../src/core/window";
import {
useCallback,
useImperativeHandle,
useLayoutEffect,
useRef,
useState } from "../../../src/preact";

import { useStyles } from "./component.jss";
import objstr from 'obj-str';

var DEFAULT_VISIBLE_COUNT = 1;
var OUTSET_ARROWS_WIDTH = 100;

/**
 * @param {!StreamGalleryDef.Props} props
 * @param {{current: (!BaseCarouselDef.CarouselApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function StreamGalleryWithRef(props, ref) {
  var _props$arrowPrevAs =













  props.arrowPrevAs,arrowPrevAs = _props$arrowPrevAs === void 0 ? DefaultArrow : _props$arrowPrevAs,_props$arrowNextAs = props.arrowNextAs,arrowNextAs = _props$arrowNextAs === void 0 ? DefaultArrow : _props$arrowNextAs,children = props.children,className = props.className,extraSpace = props.extraSpace,_props$maxItemWidth = props.maxItemWidth,maxItemWidth = _props$maxItemWidth === void 0 ? Number.MAX_VALUE : _props$maxItemWidth,_props$minItemWidth = props.minItemWidth,minItemWidth = _props$minItemWidth === void 0 ? 1 : _props$minItemWidth,_props$maxVisibleCoun = props.maxVisibleCount,maxVisibleCount = _props$maxVisibleCoun === void 0 ? Number.MAX_VALUE : _props$maxVisibleCoun,_props$minVisibleCoun = props.minVisibleCount,minVisibleCount = _props$minVisibleCoun === void 0 ? 1 : _props$minVisibleCoun,outsetArrows = props.outsetArrows,_props$peek = props.peek,peek = _props$peek === void 0 ? 0 : _props$peek,_props$slideAlign = props.slideAlign,slideAlign = _props$slideAlign === void 0 ? 'start' : _props$slideAlign,rest = _objectWithoutProperties(props, _excluded);

  var carouselRef = useRef(null);
  var _useState = useState(DEFAULT_VISIBLE_COUNT),_useState2 = _slicedToArray(_useState, 2),visibleCount = _useState2[0],setVisibleCount = _useState2[1];

  var measure = useCallback(
  function (containerWidth) {return (
      getVisibleCount(
      maxItemWidth,
      minItemWidth,
      maxVisibleCount,
      minVisibleCount,
      children.length,
      outsetArrows,
      peek,
      containerWidth,
      carouselRef.current.node));},

  [
  maxItemWidth,
  minItemWidth,
  maxVisibleCount,
  minVisibleCount,
  children.length,
  outsetArrows,
  peek]);



  useImperativeHandle(
  ref,
  function () {return (
      /** @type {!BaseCarouselDef.CarouselApi} */({
        goToSlide: function goToSlide(index) {return carouselRef.current.goToSlide(index);},
        next: function next() {return carouselRef.current.next();},
        prev: function prev() {return carouselRef.current.prev();} }));},

  []);


  // Adjust visible slide count when container size or parameters change.
  useLayoutEffect(function () {
    if (!carouselRef.current) {
      return;
    }
    var node = carouselRef.current.root;
    if (!node) {
      return;
    }
    // Use local window.
    var win = toWin(node.ownerDocument.defaultView);
    if (!win) {
      return undefined;
    }
    var observer = new win.ResizeObserver(function (entries) {
      var last = entries[entries.length - 1];
      setVisibleCount(measure(last.contentRect.width));
    });
    observer.observe(node);
    return function () {return observer.disconnect();};
  }, [measure]);

  return (
    Preact.createElement(BaseCarousel, _objectSpread({
      advanceCount: Math.floor(visibleCount),
      arrowPrevAs: arrowPrevAs,
      arrowNextAs: arrowNextAs,
      className: (((((('' + ((
      !!className ? className : '')))) + ((
      true ? ' ' + _$gallery : '')))) + ((
      extraSpace === 'around' ? ' ' + _$extraSpace : '')))),

      outsetArrows: outsetArrows,
      snapAlign: slideAlign,
      ref: carouselRef,
      visibleCount: visibleCount },
    rest),

    children));


}

var StreamGallery = forwardRef(StreamGalleryWithRef);
StreamGallery.displayName = 'StreamGallery'; // Make findable for tests.
export { StreamGallery };

/**
 * @param {!StreamGalleryDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow(_ref) {var by = _ref.by,className = _ref.className,outsetArrows = _ref.outsetArrows,rest = _objectWithoutProperties(_ref, _excluded2);

  return (
    Preact.createElement("div", { className: className },
    Preact.createElement("button", _objectSpread({
      "aria-hidden": "true",
      className: ((((((((((((((('' + (((
      true ? _$arrow : '')))))) + (((
      by < 0 ? ' ' + _$arrowPrev : '')))))) + (((
      by > 0 ? ' ' + _$arrowNext : '')))))) + (((
      outsetArrows ? ' ' + _$outsetArrow : '')))))) + (((
      !outsetArrows ? ' ' + _$insetArrow : '')))))) },

    rest),

    Preact.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" },
    Preact.createElement("path", {
      d:
      by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6',

      fill: "none",
      stroke: "#000",
      "stroke-width": "2",
      "stroke-linejoin": "round",
      "stroke-linecap": "round" })))));





}

/**
 * Updates the number of items visible for the internal carousel based on
 * the min/max item widths and how much space is available.
 * @param {number} maxItemWidth
 * @param {number} minItemWidth
 * @param {number} maxVisibleCount
 * @param {number} minVisibleCount
 * @param {number} slideCount
 * @param {boolean|undefined} outsetArrows
 * @param {number} peek
 * @param {(null|number)} containerWidth
 * @param {Element} container
 * @return {number}
 */
function getVisibleCount(
maxItemWidth,
minItemWidth,
maxVisibleCount,
minVisibleCount,
slideCount,
outsetArrows,
peek,
containerWidth,
container)
{
  if (!containerWidth) {
    return DEFAULT_VISIBLE_COUNT;
  }
  var items = getItemsForWidth(containerWidth, minItemWidth, peek);
  var maxVisibleSlides = Math.min(slideCount, maxVisibleCount);
  var visibleCount = Math.min(
  Math.max(minVisibleCount, items),
  maxVisibleSlides);

  /*
   * When we are going to show more slides than we have, cap the width so
   * that we do not go over the max requested slide width. Otherwise,
   * cap the max width based on how many items are showing and the max
   * width for each item.
   */
  var maxContainerWidth =
  (items > maxVisibleSlides ?
  maxVisibleSlides * maxItemWidth :
  items * maxItemWidth) + (outsetArrows ? OUTSET_ARROWS_WIDTH : 0);
  var maxWidthValue =
  maxContainerWidth < Number.MAX_VALUE ? "".concat(maxContainerWidth, "px") : '';
  setStyle(container, 'max-width', maxWidthValue);
  return visibleCount;
}

/**
 * Determines how many whole items in addition to the current peek value can
 * fit for a given item width. This can be rounded up or down to satisfy a
 * max/min size constraint.
 * @param {number} containerWidth The width of the container element.
 * @param {number} itemWidth The width of each item.
 * @param {number} peek The amount of slides to show besides the current item.
 * @return {number} The number of items to show.
 */
function getItemsForWidth(containerWidth, itemWidth, peek) {
  var availableWidth = containerWidth - peek * itemWidth;
  var fractionalItems = availableWidth / itemWidth;
  var wholeItems = Math.floor(fractionalItems);
  // Always show at least 1 whole item.
  return Math.max(DEFAULT_VISIBLE_COUNT, wholeItems) + peek;
}
// /Users/mszylkowski/src/amphtml/extensions/amp-stream-gallery/1.0/component.js