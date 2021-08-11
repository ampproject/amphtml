import { $carousel as _$carousel } from "./component.jss";var _excluded = ["advanceCount", "arrowPrevAs", "arrowNextAs", "autoAdvance", "autoAdvanceCount", "autoAdvanceInterval", "autoAdvanceLoops", "children", "controls", "defaultSlide", "dir", "lightbox", "loop", "mixedLength", "onClick", "onFocus", "onMouseEnter", "onSlideChange", "onTouchStart", "orientation", "outsetArrows", "snap", "snapAlign", "snapBy", "visibleCount", "_thumbnails"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import {
Alignment,
Axis,
Orientation,
getDimension,
getOffsetPosition,
getScrollEnd } from "./dimensions";

import { Arrow } from "./arrow";
import { CarouselContext } from "./carousel-context";
import { ContainWrapper } from "../../../src/preact/component";
import { Scroller } from "./scroller";
import { WithAmpContext } from "../../../src/preact/context";
import { forwardRef, toChildArray } from "../../../src/preact/compat";
import { isRTL } from "../../../src/core/dom";
import { sequentialIdGenerator } from "../../../src/core/data-structures/id-generator";
import { toWin } from "../../../src/core/window";
import {
useCallback,
useContext,
useEffect,
useImperativeHandle,
useLayoutEffect,
useMemo,
useRef,
useState } from "../../../src/preact";

import { useStyles } from "./component.jss";
import { mod } from "../../../src/core/math";

/**
 * @enum {string}
 */
var Controls = {
  ALWAYS: 'always',
  NEVER: 'never',
  AUTO: 'auto' };


/**
 * @enum {string}
 */
var Interaction = {
  GENERIC: 0,
  FOCUS: 1,
  MOUSE: 2,
  TOUCH: 3,
  NONE: 4 };


/**
 * @enum {string}
 */
var Direction = {
  LTR: 'ltr',
  RTL: 'rtl',
  AUTO: 'auto' };


var MIN_AUTO_ADVANCE_INTERVAL = 1000;

var generateCarouselKey = sequentialIdGenerator();

/**
 * @param {!BaseCarouselDef.Props} props
 * @param {{current: ?BaseCarouselDef.CarouselApi}} ref
 * @return {PreactDef.Renderable}
 */
function BaseCarouselWithRef(_ref,





























ref)
{var _carouselContext$curr, _carouselContext$setC;var _ref$advanceCount = _ref.advanceCount,advanceCount = _ref$advanceCount === void 0 ? 1 : _ref$advanceCount,arrowPrevAs = _ref.arrowPrevAs,arrowNextAs = _ref.arrowNextAs,_ref$autoAdvance = _ref.autoAdvance,shouldAutoAdvance = _ref$autoAdvance === void 0 ? false : _ref$autoAdvance,_ref$autoAdvanceCount = _ref.autoAdvanceCount,autoAdvanceCount = _ref$autoAdvanceCount === void 0 ? 1 : _ref$autoAdvanceCount,_ref$autoAdvanceInter = _ref.autoAdvanceInterval,customAutoAdvanceInterval = _ref$autoAdvanceInter === void 0 ? MIN_AUTO_ADVANCE_INTERVAL : _ref$autoAdvanceInter,_ref$autoAdvanceLoops = _ref.autoAdvanceLoops,autoAdvanceLoops = _ref$autoAdvanceLoops === void 0 ? Number.POSITIVE_INFINITY : _ref$autoAdvanceLoops,children = _ref.children,_ref$controls = _ref.controls,controls = _ref$controls === void 0 ? Controls.AUTO : _ref$controls,_ref$defaultSlide = _ref.defaultSlide,defaultSlide = _ref$defaultSlide === void 0 ? 0 : _ref$defaultSlide,_ref$dir = _ref.dir,dir = _ref$dir === void 0 ? Direction.AUTO : _ref$dir,_ref$lightbox = _ref.lightbox,lightbox = _ref$lightbox === void 0 ? false : _ref$lightbox,loop = _ref.loop,_ref$mixedLength = _ref.mixedLength,mixedLength = _ref$mixedLength === void 0 ? false : _ref$mixedLength,onClick = _ref.onClick,_onFocus = _ref.onFocus,_onMouseEnter = _ref.onMouseEnter,onSlideChange = _ref.onSlideChange,_onTouchStart = _ref.onTouchStart,_ref$orientation = _ref.orientation,orientation = _ref$orientation === void 0 ? Orientation.HORIZONTAL : _ref$orientation,_ref$outsetArrows = _ref.outsetArrows,outsetArrows = _ref$outsetArrows === void 0 ? false : _ref$outsetArrows,_ref$snap = _ref.snap,snap = _ref$snap === void 0 ? true : _ref$snap,_ref$snapAlign = _ref.snapAlign,snapAlign = _ref$snapAlign === void 0 ? Alignment.START : _ref$snapAlign,_ref$snapBy = _ref.snapBy,snapBy = _ref$snapBy === void 0 ? 1 : _ref$snapBy,_ref$visibleCount = _ref.visibleCount,visibleCount = _ref$visibleCount === void 0 ? 1 : _ref$visibleCount,_ref$_thumbnails = _ref._thumbnails,_thumbnails = _ref$_thumbnails === void 0 ? false : _ref$_thumbnails,rest = _objectWithoutProperties(_ref, _excluded);

  var childrenArray = useMemo(function () {return toChildArray(children);}, [children]);
  var length = childrenArray.length;
  var carouselContext = useContext(CarouselContext);
  var _useState = useState(
  Math.min(Math.max(defaultSlide, 0), length)),_useState2 = _slicedToArray(_useState, 2),currentSlideState = _useState2[0],setCurrentSlideState = _useState2[1];

  var globalCurrentSlide = (_carouselContext$curr = carouselContext.currentSlide) !== null && _carouselContext$curr !== void 0 ? _carouselContext$curr : currentSlideState;
  var setGlobalCurrentSlide = (_carouselContext$setC =
  carouselContext.setCurrentSlide) !== null && _carouselContext$setC !== void 0 ? _carouselContext$setC : setCurrentSlideState;
  var currentSlide = _thumbnails ? currentSlideState : globalCurrentSlide;
  var setCurrentSlide = _thumbnails ?
  setCurrentSlideState :
  setGlobalCurrentSlide;
  var currentSlideRef = useRef(currentSlide);
  var axis = orientation == Orientation.HORIZONTAL ? Axis.X : Axis.Y;
  var _useState3 = useState(generateCarouselKey),_useState4 = _slicedToArray(_useState3, 1),id = _useState4[0];

  useLayoutEffect(function () {
    // noop if !_thumbnails || !carouselContext.
    setCurrentSlide(globalCurrentSlide);
  }, [globalCurrentSlide, setCurrentSlide]);

  var setSlides = carouselContext.setSlides,slides = carouselContext.slides;

  var scrollRef = useRef(null);
  var containRef = useRef(null);
  var contentRef = useRef(null);

  var autoAdvanceTimesRef = useRef(0);
  var autoAdvanceInterval = useMemo(
  function () {return Math.max(customAutoAdvanceInterval, MIN_AUTO_ADVANCE_INTERVAL);},
  [customAutoAdvanceInterval]);


  var autoAdvance = useCallback(function () {
    if (
    autoAdvanceTimesRef.current + visibleCount / length >= autoAdvanceLoops ||
    interaction.current !== Interaction.NONE)
    {
      return false;
    }
    if (loop || currentSlideRef.current + visibleCount < length) {
      scrollRef.current.advance(autoAdvanceCount); // Advance forward by specified count
      // Count autoadvance loops as proportions of the carousel we have advanced through.
      autoAdvanceTimesRef.current += autoAdvanceCount / length;
    } else {
      scrollRef.current.advance(-currentSlideRef.current); // Advance in reverse to first slide
      autoAdvanceTimesRef.current = Math.ceil(autoAdvanceTimesRef.current);
    }
    return true;
  }, [autoAdvanceCount, autoAdvanceLoops, length, loop, visibleCount]);
  var _next = useCallback(function () {return scrollRef.current.next();}, []);
  var _prev = useCallback(function () {return scrollRef.current.prev();}, []);

  useEffect(function () {
    if (!shouldAutoAdvance || !containRef.current) {
      return;
    }
    var win = toWin(containRef.current.ownerDocument.defaultView);
    var interval = win.setInterval(function () {
      var autoAdvanced = autoAdvance();
      if (!autoAdvanced) {
        win.clearInterval(interval);
      }
    }, autoAdvanceInterval);
    return function () {return win.clearInterval(interval);};
  }, [autoAdvance, autoAdvanceInterval, shouldAutoAdvance]);

  var setRestingIndex = useCallback(
  function (index) {
    if (length <= 0 || isNaN(index)) {
      return;
    }
    index = loop ?
    mod(index, length) :
    Math.min(Math.max(index, 0), length - 1);
    setCurrentSlide(index);
    if (currentSlideRef.current !== index) {
      currentSlideRef.current = index;
      if (onSlideChange) {
        onSlideChange(index);
      }
    }
  },
  [length, loop, setCurrentSlide, onSlideChange]);


  useImperativeHandle(
  ref,
  function () {return (
      /** @type {!BaseCarouselDef.CarouselApi} */({
        goToSlide: function goToSlide(index) {
          interaction.current = Interaction.GENERIC;
          setRestingIndex(index);
        },
        next: function next() {
          interaction.current = Interaction.GENERIC;
          _next();
        },
        prev: function prev() {
          interaction.current = Interaction.GENERIC;
          _prev();
        },
        get root() {
          return containRef.current;
        },
        get node() {
          return contentRef.current;
        } }));},

  [_next, _prev, setRestingIndex]);


  useEffect(function () {
    // For now, do not update slides if they are the same length as before.
    // Otherwise this causes an infinite loop when updating the AMP Context.
    if (!_thumbnails && slides && slides.length !== childrenArray.length) {
      setSlides(childrenArray);
    }
  }, [_thumbnails, childrenArray, setSlides, slides]);

  var disableForDir = function disableForDir(dir) {
    if (loop) {
      // Arrows always available when looping.
      return false;
    }
    if (currentSlide + dir < 0) {
      // Can no longer advance backwards.
      return true;
    }
    if (currentSlide + visibleCount + dir > length) {
      // Can no longer advance forwards.
      return true;
    }
    if (mixedLength && dir > 0) {
      // Measure container to see if we have reached the end.
      if (!scrollRef.current) {
        return false;
      }
      var container = scrollRef.current.node;
      if (!container || !container.children.length) {
        return false;
      }
      var scrollEnd = getScrollEnd(axis, container);
      var scrollStart = getOffsetPosition(
      axis,
      container.children[currentSlide]);

      var _getDimension = getDimension(axis, container),_length = _getDimension.length;
      if (_length !== scrollEnd && _length + scrollStart >= scrollEnd) {
        // Can no longer scroll forwards.
        return true;
      }
    }
    return false;
  };

  var interaction = useRef(Interaction.NONE);
  var hideControls = useMemo(function () {
    if (controls === Controls.ALWAYS || outsetArrows) {
      return false;
    }
    if (controls === Controls.NEVER) {
      return true;
    }
    return interaction.current === Interaction.TOUCH;
  }, [controls, outsetArrows]);

  var _useState5 = useState(dir === Direction.RTL),_useState6 = _slicedToArray(_useState5, 2),rtl = _useState6[0],setRtl = _useState6[1];
  useLayoutEffect(function () {
    if (!containRef.current || dir !== Direction.AUTO) {
      return;
    }
    var doc = containRef.current.ownerDocument;
    if (!doc) {
      return;
    }
    setRtl(isRTL(doc));
  }, [dir, setRtl]);

  return (
    Preact.createElement(ContainWrapper, _objectSpread({
      size: true,
      layout: true,
      paint: true,
      contentStyle: {
        display: 'flex',
        direction: rtl ? Direction.RTL : Direction.LTR },

      ref: containRef,
      onFocus: function onFocus(e) {
        if (_onFocus) {
          _onFocus(e);
        }
        interaction.current = Interaction.FOCUS;
      },
      onMouseEnter: function onMouseEnter(e) {
        if (_onMouseEnter) {
          _onMouseEnter(e);
        }
        interaction.current = Interaction.MOUSE;
      },
      onTouchStart: function onTouchStart(e) {
        if (_onTouchStart) {
          _onTouchStart(e);
        }
        interaction.current = Interaction.TOUCH;
      },
      tabIndex: "0",
      wrapperClassName: _$carousel,
      contentRef: contentRef },
    rest),

    !hideControls &&
    Preact.createElement(Arrow, {
      advance: _prev,
      as: arrowPrevAs,
      by: -advanceCount,
      disabled: disableForDir(-1),
      outsetArrows: outsetArrows,
      rtl: rtl }),


    Preact.createElement(Scroller, {
      advanceCount: advanceCount,
      alignment: snapAlign,
      axis: axis,
      lightboxGroup: lightbox && 'carousel' + id,
      loop: loop,
      mixedLength: mixedLength,
      onClick: onClick,
      restingIndex: currentSlide,
      setRestingIndex: setRestingIndex,
      snap: snap,
      snapBy: snapBy,
      ref: scrollRef,
      visibleCount: mixedLength ? 1 : visibleCount,
      _thumbnails: _thumbnails },

    childrenArray.map(function (child, index) {
      var _child$props = child.props,alt = _child$props.alt,ariaLabel = _child$props['aria-label'];
      return (
        Preact.createElement(WithAmpContext, {
          caption: alt || ariaLabel,
          key: index,
          renderable: index == currentSlide,
          playable: index == currentSlide },

        child));


    })),

    !hideControls &&
    Preact.createElement(Arrow, {
      advance: _next,
      by: advanceCount,
      as: arrowNextAs,
      disabled: disableForDir(1),
      outsetArrows: outsetArrows,
      rtl: rtl })));




}

var BaseCarousel = forwardRef(BaseCarouselWithRef);
BaseCarousel.displayName = 'BaseCarousel'; // Make findable for tests.
export { BaseCarousel };
// /Users/mszylkowski/src/amphtml/extensions/amp-base-carousel/1.0/component.js