import { $thumbnail as _$thumbnail } from "./component.jss";import { $topControl as _$topControl2 } from "./component.jss";import { $control as _$control4 } from "./component.jss";import { $nextArrow as _$nextArrow } from "./component.jss";import { $prevArrow as _$prevArrow } from "./component.jss";import { $control as _$control3 } from "./component.jss";import { $arrow as _$arrow } from "./component.jss";import { $closeButton as _$closeButton } from "./component.jss";import { $topControl as _$topControl } from "./component.jss";import { $control as _$control2 } from "./component.jss";import { $grid as _$grid } from "./component.jss";import { $gallery as _$gallery2 } from "./component.jss";import { $captionText as _$captionText } from "./component.jss";import { $control as _$control } from "./component.jss";import { $caption as _$caption } from "./component.jss";import { $gallery as _$gallery } from "./component.jss";import { $controlsPanel as _$controlsPanel } from "./component.jss";import { $hideControls as _$hideControls } from "./component.jss";import { $showControls as _$showControls } from "./component.jss";import { $lightbox as _$lightbox } from "./component.jss";var _excluded = ["by"],_excluded2 = ["showCarousel"];var _path, _g, _rect, _circle, _polygon;function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;} /**
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
import { BaseCarousel } from "../../amp-base-carousel/1.0/component";
import { Lightbox } from "../../amp-lightbox/1.0/component";
import { LightboxGalleryContext } from "./context";
import { PADDING_ALLOWANCE, useStyles } from "./component.jss";
import { forwardRef } from "../../../src/preact/compat";
import { mod } from "../../../src/core/math";
import {
useCallback,
useImperativeHandle,
useLayoutEffect,
useRef,
useState } from "../../../src/preact";

import objstr from 'obj-str';

/** @const {string} */
var DEFAULT_GROUP = 'default';

/** @const {string} */
var EXPOSED_CAPTION_CLASS = 'amp-lightbox-gallery-caption';

/** @enum {string}  */
var CaptionState = {
  AUTO: 'auto',
  CLIP: 'clip',
  EXPAND: 'expanded' };


/** @const {!JsonObject<string, string>} */
var CAPTION_PROPS = {
  'aria-label': 'Toggle caption expanded state.',
  'role': 'button' };


/**
 * @param {!LightboxGalleryDef.Props} props
 * @param {{current: ?LightboxDef.LightboxApi}} ref
 * @return {PreactDef.Renderable}
 */
export function LightboxGalleryProviderWithRef(_ref,









ref)
{var children = _ref.children,onAfterClose = _ref.onAfterClose,onAfterOpen = _ref.onAfterOpen,onBeforeOpen = _ref.onBeforeOpen,onToggleCaption = _ref.onToggleCaption,onViewGrid = _ref.onViewGrid,render = _ref.render;
  var classes = useStyles();
  var lightboxRef = useRef(null);
  var carouselRef = useRef(null);
  var _useState = useState(0),_useState2 = _slicedToArray(_useState, 2),index = _useState2[0],setIndex = _useState2[1];
  var renderers = useRef({});
  var captions = useRef({});

  // Prefer counting elements over retrieving array lengths because
  // array can contain empty values that have been deregistered.
  var count = useRef({});
  var carouselElements = useRef({});
  var gridElements = useRef({});

  var _useState3 = useState(true),_useState4 = _slicedToArray(_useState3, 2),showCarousel = _useState4[0],setShowCarousel = _useState4[1];
  var _useState5 = useState(true),_useState6 = _slicedToArray(_useState5, 2),showControls = _useState6[0],setShowControls = _useState6[1];
  var _useState7 = useState(null),_useState8 = _slicedToArray(_useState7, 2),group = _useState8[0],setGroup = _useState8[1];
  var renderElements = useCallback(function (opt_group) {
    var group = opt_group !== null && opt_group !== void 0 ? opt_group : Object.keys(renderers.current)[0];
    if (!group) {
      return;
    }
    if (!carouselElements.current[group]) {
      carouselElements.current[group] = [];
      gridElements.current[group] = [];
      count.current[group] = 0;
    }
    renderers.current[group].forEach(function (render, index) {
      if (!carouselElements.current[group][index]) {
        var absoluteIndex = count.current[group];
        carouselElements.current[group][index] = render();
        gridElements.current[group][index] =
        Preact.createElement(Thumbnail, {
          onClick: function onClick() {
            setShowCarousel(true);
            setIndex(absoluteIndex);
          },
          render: render });


        count.current[group] += 1;
      }
    });
    setGroup(group);
  }, []);

  var register = useCallback(
  function (key) {var group = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_GROUP;var render = arguments.length > 2 ? arguments[2] : undefined;var caption = arguments.length > 3 ? arguments[3] : undefined;
    // Given key is 1-indexed.
    if (!renderers.current[group]) {
      renderers.current[group] = [];
      captions.current[group] = [];
    }
    renderers.current[group][key - 1] = render;
    captions.current[group][key - 1] = caption;
  },
  []);


  var deregister = useCallback(function (key) {var group = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_GROUP;
    // Given key is 1-indexed.
    delete renderers.current[group][key - 1];
    delete captions.current[group][key - 1];
    delete carouselElements.current[group][key - 1];
    count.current[group]--;
  }, []);

  var open = useCallback(
  function (opt_index, opt_group) {var _lightboxRef$current;
    renderElements(opt_group);
    setShowControls(true);
    setShowCarousel(true);
    if (opt_index != null) {
      setIndex(opt_index);
    }
    ((_lightboxRef$current = lightboxRef.current) === null || _lightboxRef$current === void 0) ? (void 0) : _lightboxRef$current.open();
  },
  [renderElements]);


  var context = {
    deregister: deregister,
    register: register,
    open: open };


  var captionRef = useRef(undefined);
  var _useState9 = useState(null),_useState10 = _slicedToArray(_useState9, 2),caption = _useState10[0],setCaption = _useState10[1];
  var _useState11 = useState(CaptionState.AUTO),_useState12 = _slicedToArray(_useState11, 2),captionState = _useState12[0],setCaptionState = _useState12[1];
  useLayoutEffect(function () {var _carouselRef$current;
    ((_carouselRef$current = carouselRef.current) === null || _carouselRef$current === void 0) ? (void 0) : _carouselRef$current.goToSlide(index);
    if (group) {
      // This is the index to target accounting for existing empty
      // entries in our render sets. Prefer to account for empty
      // entries over filtering them out to respect the index the nodes
      // were originally registered with by the user.
      var inflatedIndex =
      // Registered element entries, including empty.
      renderers.current[group].length -
      // Registered element entries rendered.
      count.current[group] +
      // Normalized carousel index.
      mod(index, count.current[group]);
      setCaption(captions.current[group][inflatedIndex]);
      setCaptionState(CaptionState.AUTO);
    }
  }, [group, index]);

  useLayoutEffect(function () {var _captionRef$current;
    var _ref2 = (_captionRef$current = captionRef.current) !== null && _captionRef$current !== void 0 ? _captionRef$current : {},offsetHeight = _ref2.offsetHeight,scrollHeight = _ref2.scrollHeight;
    if (scrollHeight > offsetHeight + PADDING_ALLOWANCE) {
      setCaptionState(CaptionState.CLIP);
    }
  }, [caption]);

  useImperativeHandle(
  ref,
  function () {return ({
      open: open,
      close: function close() {var _lightboxRef$current2;
        ((_lightboxRef$current2 = lightboxRef.current) === null || _lightboxRef$current2 === void 0) ? (void 0) : _lightboxRef$current2.close();
      } });},

  [open]);


  return (
    Preact.createElement(Preact.Fragment, null,
    Preact.createElement(Lightbox, {
      className: ((((((((('' + (((
      true ? _$lightbox : '')))))) + (((
      showControls ? ' ' + _$showControls : '')))))) + (((
      !showControls ? ' ' + _$hideControls : '')))))),

      closeButtonAs: CloseButtonIcon,
      onBeforeOpen: onBeforeOpen,
      onAfterOpen: onAfterOpen,
      onAfterClose: onAfterClose,
      ref: lightboxRef },

    Preact.createElement("div", { className: _$controlsPanel },
    Preact.createElement(ToggleViewIcon, {
      onClick: function onClick() {
        if (showCarousel) {
          (((((onViewGrid === null || onViewGrid === void 0))))) ? (((((void 0))))) : onViewGrid();
        }
        setShowCarousel(!showCarousel);
      },
      showCarousel: showCarousel })),


    Preact.createElement(BaseCarousel, {
      arrowPrevAs: NavButtonIcon,
      arrowNextAs: NavButtonIcon,
      className: _$gallery,
      defaultSlide: mod(index, count.current[group]) || 0,
      hidden: !showCarousel,
      loop: true,
      onClick: function onClick() {return setShowControls(!showControls);},
      onSlideChange: function onSlideChange(i) {return setIndex(i);},
      ref: carouselRef },

    carouselElements.current[group]),

    Preact.createElement("div", _objectSpread({
      hidden: !showCarousel,
      className: (((((((((((('' + ((((
      true ? _$caption : '')))))))) + ((((
      true ? ' ' + _$control : '')))))))) + ((((
      true ? ' ' + classes[captionState] : '')))))))),

      ref: captionRef }, ((((
    captionState === CaptionState.AUTO ?
    null : _objectSpread({

      onClick: function onClick() {
        ((((onToggleCaption === null || onToggleCaption === void 0)))) ? ((((void 0)))) : onToggleCaption();
        if (captionState === CaptionState.CLIP) {
          setCaptionState(CaptionState.EXPAND);
        } else {
          setCaptionState(CaptionState.CLIP);
        }
      } },
    CAPTION_PROPS)))))),


    Preact.createElement("div", {
      className: (((((((((('' + (((((
      true ? _$captionText : '')))))))))) + (((((" amp-lightbox-gallery-caption")))))))))),


      part: "caption" },

    caption)),


    !showCarousel &&
    Preact.createElement("div", {
      className: (((((((('' + ((((true ? _$gallery2 : '')))))))) + ((((true ? ' ' + _$grid : '')))))))) },

    gridElements.current[group])),



    Preact.createElement(LightboxGalleryContext.Provider, { value: context },
    render ? render() : children)));



}

var LightboxGalleryProvider = forwardRef(LightboxGalleryProviderWithRef);
LightboxGalleryProvider.displayName = 'LightboxGalleryProvider';
export { LightboxGalleryProvider };
/**
 * @param {!LightboxDef.CloseButtonProps} props
 * @return {PreactDef.Renderable}
 */
function CloseButtonIcon(props) {

  return (
    Preact.createElement("svg", _objectSpread(_objectSpread({},
    props), {}, {
      "aria-label": "Close the lightbox",
      className: (((((('' + ((
      true ? _$control2 : '')))) + ((
      true ? ' ' + _$topControl : '')))) + ((
      true ? ' ' + _$closeButton : '')))),

      role: "button",
      tabIndex: "0",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg" }), ((_path || ((_path =

    Preact.createElement("path", {
      d: "M6.4 6.4 L17.6 17.6 Z M17.6 6.4 L6.4 17.6 Z",
      stroke: "#fff",
      "stroke-width": "2",
      "stroke-linejoin": "round" })))))));



}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function NavButtonIcon(_ref3) {var by = _ref3.by,rest = _objectWithoutProperties(_ref3, _excluded);

  return (
    Preact.createElement("svg", _objectSpread(_objectSpread({},
    rest), {}, {
      className: (((((((('' + ((
      true ? _$arrow : '')))) + ((
      true ? ' ' + _$control3 : '')))) + ((
      by < 0 ? ' ' + _$prevArrow : '')))) + ((
      by > 0 ? ' ' + _$nextArrow : '')))),

      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg" }),

    Preact.createElement("path", {
      d: by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6',
      fill: "none",
      stroke: "#fff",
      "stroke-width": "2",
      "stroke-linejoin": "round",
      "stroke-linecap": "round" })));



}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function ToggleViewIcon(_ref4) {var showCarousel = _ref4.showCarousel,rest = _objectWithoutProperties(_ref4, _excluded2);

  return (
    Preact.createElement("svg", _objectSpread({
      "aria-label":
      showCarousel ? 'Switch to grid view' : 'Switch to carousel view',

      className: (((('' + ((
      true ? _$control4 : '')))) + ((
      true ? ' ' + _$topControl2 : '')))),

      role: "button",
      tabIndex: "0",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg" },
    rest),

    showCarousel ? ((_g || ((_g =
    Preact.createElement("g", { fill: "#fff" },
    Preact.createElement("rect", { x: "3", y: "3", width: "6", height: "8", rx: "1", ry: "1" }),
    Preact.createElement("rect", { x: "15", y: "13", width: "6", height: "8", rx: "1", ry: "1" }),
    Preact.createElement("rect", { x: "11", y: "3", width: "10", height: "8", rx: "1", ry: "1" }),
    Preact.createElement("rect", { x: "3", y: "13", width: "10", height: "8", rx: "1", ry: "1" })))))) :


    Preact.createElement(Preact.Fragment, null, (((_rect || (((_rect =
    Preact.createElement("rect", {
      x: "4",
      y: "4",
      width: "16",
      height: "16",
      rx: "1",
      "stroke-width": "2",
      stroke: "#fff",
      fill: "none" }))))))), (((_circle || (((_circle =

    Preact.createElement("circle", { fill: "#fff", cx: "15.5", cy: "8.5", r: "1.5" }))))))), (((_polygon || (((_polygon =
    Preact.createElement("polygon", {
      fill: "#fff",
      points: "5,19 5,13 8,10 13,15 16,12 19,15 19,19" }))))))))));





}

/**
 * @param {!LightboxGalleryDef.ThumbnailProps} props
 * @return {PreactDef.Renderable}
 */
function Thumbnail(_ref5) {var onClick = _ref5.onClick,render = _ref5.render;

  return (
    Preact.createElement("div", {
      "aria-label": "View in carousel",
      className: _$thumbnail,
      onClick: onClick,
      role: "button" },

    render()));


}
// /Users/mszylkowski/src/amphtml/extensions/amp-lightbox-gallery/1.0/provider.js