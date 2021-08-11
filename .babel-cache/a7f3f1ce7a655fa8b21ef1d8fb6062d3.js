import { $verticalScroll as _$verticalScroll } from "./component.jss";import { $horizontalScroll as _$horizontalScroll } from "./component.jss";import { $hideScrollbar as _$hideScrollbar } from "./component.jss";import { $scrollContainer as _$scrollContainer } from "./component.jss";var _excluded = ["_thumbnails", "advanceCount", "alignment", "axis", "children", "lightboxGroup", "loop", "mixedLength", "restingIndex", "setRestingIndex", "snap", "snapBy", "visibleCount"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
findOverlappingIndex,
getPercentageOffsetFromAlignment,
scrollContainerToElement } from "./dimensions";

import { WithLightbox } from "../../amp-lightbox-gallery/1.0/component";
import { debounce } from "../../../src/core/types/function";
import { forwardRef } from "../../../src/preact/compat";
import { mod } from "../../../src/core/math";
import { setStyle } from "../../../src/core/dom/style";
import { toWin } from "../../../src/core/window";
import {
useCallback,
useImperativeHandle,
useLayoutEffect,
useMemo,
useRef } from "../../../src/preact";

import { useStyles } from "./component.jss";

/**
 * How long to wait prior to resetting the scrolling position after the last
 * scroll event. Ideally this should be low, so that once the user stops
 * scrolling, things are immediately centered again. Since there can be some
 * delay between scroll events, and we do not want to interrupt a scroll with a
 * render, it cannot be too small. 200ms seems to be around the lower limit for
 * this value on Android / iOS.
 */
var RESET_SCROLL_REFERENCE_POINT_WAIT_MS = 200;

/**
 * @param {!BaseCarouselDef.ScrollerProps} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function ScrollerWithRef(_ref,
















ref)
{var _thumbnails = _ref._thumbnails,advanceCount = _ref.advanceCount,alignment = _ref.alignment,axis = _ref.axis,children = _ref.children,lightboxGroup = _ref.lightboxGroup,loop = _ref.loop,mixedLength = _ref.mixedLength,restingIndex = _ref.restingIndex,setRestingIndex = _ref.setRestingIndex,snap = _ref.snap,_ref$snapBy = _ref.snapBy,snapBy = _ref$snapBy === void 0 ? 1 : _ref$snapBy,visibleCount = _ref.visibleCount,rest = _objectWithoutProperties(_ref, _excluded);
  // We still need our own ref that we can always rely on to be there.
  var containerRef = useRef(null);

  /**
   * The number of slides we want to place before the reference or resting index.
   * Normalized to == restingIndex if loop=false.
   */
  var pivotIndex = loop ? Math.floor(children.length / 2) : restingIndex;

  /**
   * Whether to early exit from the scroll handler.
   * This is useful on each render where the container is scrolled to the active
   * slide at a non-integer pixel position. This is likely to happen
   * with responsive containers or non-integer `visibleCount`.
   */
  var ignoreProgrammaticScrollRef = useRef(false);

  var advance = useCallback(
  function (by) {
    var container = containerRef.current;
    if (!container) {
      return;
    }
    // Smooth scrolling is preferred to `setRestingIndex` whenever possible.
    // Note: `setRestingIndex` will still be called on debounce by scroll handler.
    currentIndex.current = mod(currentIndex.current + by, children.length);
    scrollOffset.current = 0;
    var didScroll = scrollContainerToElement(
    axis,
    alignment,
    container,
    container.children[mod(pivotIndex + by, container.children.length)],
    scrollOffset.current);

    if (!didScroll) {
      setRestingIndex(currentIndex.current);
    }
  },
  [alignment, axis, children.length, pivotIndex, setRestingIndex]);

  useImperativeHandle(
  ref,
  function () {return ({
      advance: advance,
      next: function next() {return advance(advanceCount);},
      prev: function prev() {return advance(-advanceCount);},
      get node() {
        return containerRef.current;
      } });},

  [advance, advanceCount]);

  var classes = useStyles();

  /**
   * The dynamic position that the slide at the resting index
   * is with respect to its scrolling order. Only needed if loop=true.
   */
  var offsetRef = useRef(restingIndex);

  /**
   * The partial scroll position as a percentage of the current visible slide.
   * Only modified if snap=false.
   */
  var scrollOffset = useRef(0);

  var slides = renderSlides(
  {
    alignment: alignment,
    children: children,
    loop: loop,
    mixedLength: mixedLength,
    offsetRef: offsetRef,
    lightboxGroup: lightboxGroup,
    pivotIndex: pivotIndex,
    restingIndex: restingIndex,
    snap: snap,
    snapBy: snapBy,
    visibleCount: visibleCount,
    _thumbnails: _thumbnails },

  classes);

  var currentIndex = useRef(restingIndex);

  var scrollToActiveSlide = useCallback(function () {
    if (!containerRef.current || !containerRef.current.children.length) {
      return;
    }
    var container = containerRef.current;
    setStyle(container, 'scrollBehavior', 'auto');
    ignoreProgrammaticScrollRef.current = true;
    scrollContainerToElement(
    axis,
    alignment,
    container,
    container.children[pivotIndex],
    scrollOffset.current);

    setStyle(container, 'scrollBehavior', 'smooth');
  }, [alignment, axis, pivotIndex]);

  // useLayoutEffect to avoid FOUC while scrolling for looping layouts.
  useLayoutEffect(function () {
    if (!containerRef.current || !loop) {
      return;
    }
    var container = containerRef.current;
    if (!container.children.length) {
      return;
    }
    scrollToActiveSlide();
  }, [loop, restingIndex, scrollToActiveSlide]);

  // Adjust slide position when container size changes.
  useLayoutEffect(function () {
    if (!containerRef.current) {
      return;
    }
    var node = containerRef.current;
    if (!node) {
      return;
    }
    // Use local window.
    var win = toWin(node.ownerDocument.defaultView);
    if (!win) {
      return undefined;
    }
    var observer = new win.ResizeObserver(scrollToActiveSlide);
    observer.observe(node);
    return function () {return observer.disconnect();};
  }, [scrollToActiveSlide]);

  // Trigger render by setting the resting index to the current scroll state.
  var debouncedResetScrollReferencePoint = useMemo(function () {
    // Use local window if possible.
    var win = containerRef.current ?
    toWin(containerRef.current.ownerDocument.defaultView) :
    window;
    return debounce(
    win,
    function () {
      // Check if the resting index we are centered around is the same as where
      // we stopped scrolling. If so, we do not need to move anything.
      if (
      currentIndex.current === null ||
      currentIndex.current === restingIndex)
      {
        return;
      }
      setRestingIndex(currentIndex.current);
    },
    RESET_SCROLL_REFERENCE_POINT_WAIT_MS);

  }, [restingIndex, setRestingIndex]);

  // Track current slide without forcing render.
  // This is necessary for smooth scrolling because
  // intermediary renders will interupt scroll and cause jank.
  var updateCurrentIndex = function updateCurrentIndex() {
    var container = containerRef.current;
    if (!container) {
      return;
    }
    var overlappingIndex = findOverlappingIndex(
    axis,
    alignment,
    container,
    container.children,
    pivotIndex);

    if (!snap) {
      scrollOffset.current = getPercentageOffsetFromAlignment(
      axis,
      alignment,
      container,
      container.children[overlappingIndex]);

    }
    currentIndex.current = mod(
    overlappingIndex - offsetRef.current,
    children.length);

  };

  var handleScroll = function handleScroll() {
    if (ignoreProgrammaticScrollRef.current) {
      ignoreProgrammaticScrollRef.current = false;
      return;
    }
    updateCurrentIndex();
    debouncedResetScrollReferencePoint();
  };

  return (
    Preact.createElement("div", _objectSpread({
      ref: containerRef,
      onScroll: handleScroll,
      class: "".concat(_$scrollContainer, " ").concat(_$hideScrollbar, " ").concat(
      axis === Axis.X ? _$horizontalScroll : _$verticalScroll),

      tabindex: 0 },
    rest),

    slides));


}

var Scroller = forwardRef(ScrollerWithRef);
Scroller.displayName = 'Scroller'; // Make findable for tests.
export { Scroller };

/**
 * How the slides are ordered when looping:
 *
 * We want to make sure that the user can scroll all the way to the opposite
 * end (either forwards or backwards) of the carousel, but no further (no
 * looping back past where you started). We render elements dynamically
 * for a desirable scrolling order to allow the browser to scroll as well as
 * providing targets for the browser to snap on. This is important as these
 * targets need to be present before the scroll starts for things to work
 * correctly.
 *
 * The elements are ordered depending on the reference point, called
 * the restingIndex to allow full movement forwards and backwards. You can
 * imagine the DOM structure looks like the following if you have 5 slides:
 *
 * [1][2][3][4][5]
 *
 * When the restingIndex is the first index, we should translate slides as follows:
 *
 * [4][5][1][2][3]
 *
 * This ensures that if you move left or right, there is a slide to show.
 *
 * When the user stops scrolling, we update the restingIndex and show/hide the
 * appropriate spacers. For example, if the user started at slide '1' and moved
 * left to slide '4', the UI would eventually stop because there is
 * nothing more to the left of slide '4'.
 *
 * [4][5][1][2][3]
 *
 * Once scrolling stops, however, the reference point would be reset and this would
 * update to the following with the next render:
 *
 * [2][3][4][5][1]
 *
 * Ordering slides:
 *
 * Slides are ordered to be before or after the current slide and do not rearrange
 * dynamically as the user scrolls. Only once the scrolling has ended do they rearrange.
 * Currently, half the slides are ordered before and half the slides are ordered after.
 * This could be a bit smarter and only place as many as are necessary on either side of
 * the reference point to have a sufficient amount of buffer.
 *
 * Initial index:
 *
 * The initial index can be specified, which will make the carousel scroll to
 * the desired index when it first renders.
 *
 * @param {!BaseCarouselDef.SlideProps} props
 * @param {!Object} classes
 * @return {PreactDef.Renderable}
 */
function renderSlides(_ref2,














classes)
{var _thumbnails = _ref2._thumbnails,alignment = _ref2.alignment,children = _ref2.children,lightboxGroup = _ref2.lightboxGroup,loop = _ref2.loop,mixedLength = _ref2.mixedLength,offsetRef = _ref2.offsetRef,pivotIndex = _ref2.pivotIndex,restingIndex = _ref2.restingIndex,snap = _ref2.snap,snapBy = _ref2.snapBy,visibleCount = _ref2.visibleCount;
  var length = children.length;
  var Comp = lightboxGroup ? WithLightbox : 'div';
  var slides = children.map(function (child, index) {
    var key = "slide-".concat(child.key || index);
    return (
      Preact.createElement(Comp, {
        caption: child.props.caption,
        key: key,
        "data-slide": index,
        class: "".concat(classes.slideSizing, " ").concat(classes.slideElement, " ").concat(
        snap && mod(index, snapBy) === 0 ?
        classes.enableSnap :
        classes.disableSnap, " ").concat(

        alignment === Alignment.CENTER ?
        classes.centerAlign :
        classes.startAlign, " ").concat(
        _thumbnails ? classes.thumbnails : '', " "),
        group: lightboxGroup,
        part: "slide",
        style: {
          flex: mixedLength ? '0 0 auto' : "0 0 ".concat(100 / visibleCount, "%") } },


      child));


  });

  if (!loop) {
    return slides;
  }

  var before = [];
  var after = [];
  var shift = mod(length - restingIndex + pivotIndex, length);
  if (restingIndex <= pivotIndex) {
    for (var i = 0; i < shift; i++) {
      before.unshift(slides.pop());
    }
  } else {
    for (var _i = 0; _i < length - shift; _i++) {
      after.push(slides.shift());
    }
  }

  offsetRef.current = before.length ? before.length : -after.length;
  return (
    Preact.createElement(Preact.Fragment, null,
    before,
    slides,
    after));


}
// /Users/mszylkowski/src/amphtml/extensions/amp-base-carousel/1.0/scroller.js