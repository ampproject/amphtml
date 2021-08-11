import { $closeButton as _$closeButton } from "./component.jss";import { $wrapper as _$wrapper } from "./component.jss";import { $content as _$content } from "./component.jss";var _excluded = ["animation", "children", "closeButtonAs", "onAfterClose", "onAfterOpen", "onBeforeOpen"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { ContainWrapper, useValueRef } from "../../../src/preact/component";
import { Keys } from "../../../src/core/constants/key-codes";
import { forwardRef } from "../../../src/preact/compat";
import { setStyle } from "../../../src/core/dom/style";
import { tryFocus } from "../../../src/core/dom";
import { useImperativeHandle, useLayoutEffect, useRef, useState } from "../../../src/preact";
import { useStyles } from "./component.jss";

var ANIMATION_DURATION = 200;
var ANIMATION_PRESETS = {
  'fade-in': [
  { opacity: 0, visibility: 'visible' },
  { opacity: 1, visibility: 'visible' }],

  'fly-in-top': [
  { opacity: 0, transform: 'translate(0,-100%)', visibility: 'visible' },
  { opacity: 1, transform: 'translate(0, 0)', visibility: 'visible' }],

  'fly-in-bottom': [
  { opacity: 0, transform: 'translate(0, 100%)', visibility: 'visible' },
  { opacity: 1, transform: 'translate(0, 0)', visibility: 'visible' }] };



var DEFAULT_CLOSE_LABEL = 'Close the modal';

var CONTENT_PROPS = { 'part': 'scroller' };

/**
 * @param {!LightboxDef.Props} props
 * @param {{current: ?LightboxDef.LightboxApi}} ref
 * @return {PreactDef.Renderable}
 */
function LightboxWithRef(_ref,









ref)
{var _ref$animation = _ref.animation,animation = _ref$animation === void 0 ? 'fade-in' : _ref$animation,children = _ref.children,closeButtonAs = _ref.closeButtonAs,onAfterClose = _ref.onAfterClose,onAfterOpen = _ref.onAfterOpen,onBeforeOpen = _ref.onBeforeOpen,rest = _objectWithoutProperties(_ref, _excluded);
  // There are two phases to open and close.
  // To open, we mount and render the contents (invisible), then animate the display (visible).
  // To close, it's the reverse.
  // `mounted` mounts the component. `visible` plays the animation.
  var _useState = useState(false),_useState2 = _slicedToArray(_useState, 2),mounted = _useState2[0],setMounted = _useState2[1];
  var _useState3 = useState(false),_useState4 = _slicedToArray(_useState3, 2),visible = _useState4[0],setVisible = _useState4[1];

  var lightboxRef = useRef();

  // We are using refs here to refer to common strings, objects, and functions used.
  // This is because they are needed within `useEffect` calls below (but are not depended for triggering)
  // We use `useValueRef` for props that might change (user-controlled)
  var animationRef = useValueRef(animation);
  var onBeforeOpenRef = useValueRef(onBeforeOpen);
  var onAfterCloseRef = useValueRef(onAfterClose);
  var onAfterOpenRef = useValueRef(onAfterOpen);

  useImperativeHandle(
  ref,
  function () {return ({
      open: function open() {var _onBeforeOpenRef$curr;
        ((_onBeforeOpenRef$curr = onBeforeOpenRef.current) === null || _onBeforeOpenRef$curr === void 0) ? (void 0) : _onBeforeOpenRef$curr.call(onBeforeOpenRef);
        setMounted(true);
        setVisible(true);
      },
      close: function close() {return setVisible(false);} });},

  [onBeforeOpenRef]);


  useLayoutEffect(function () {
    var element = lightboxRef.current;
    if (!element) {
      return;
    }
    var animation;
    // Set pre-animation visibility state, to be flipped post-animation.
    setStyle(element, 'visibility', visible ? 'hidden' : 'visible');

    // "Make Visible" Animation
    if (visible) {
      var postVisibleAnim = function postVisibleAnim() {var _onAfterOpenRef$curre;
        setStyle(element, 'opacity', 1);
        setStyle(element, 'visibility', 'visible');
        tryFocus(element);
        ((_onAfterOpenRef$curre = onAfterOpenRef.current) === null || _onAfterOpenRef$curre === void 0) ? (void 0) : _onAfterOpenRef$curre.call(onAfterOpenRef);
      };
      if (!element.animate) {
        postVisibleAnim();
        return;
      }
      animation = element.animate(ANIMATION_PRESETS[animationRef.current], {
        duration: ANIMATION_DURATION,
        fill: 'both',
        easing: 'ease-in' });

      animation.onfinish = postVisibleAnim;
    } else {
      // "Make Invisible" Animation
      var postInvisibleAnim = function postInvisibleAnim() {
        setStyle(element, 'opacity', 0);
        setStyle(element, 'visibility', 'hidden');
        if (onAfterCloseRef.current) {
          onAfterCloseRef.current();
        }
        animation = null;
        setMounted(false);
      };
      if (!element.animate) {
        postInvisibleAnim();
        return;
      }
      animation = element.animate(ANIMATION_PRESETS[animationRef.current], {
        duration: ANIMATION_DURATION,
        direction: 'reverse',
        fill: 'both',
        easing: 'ease-in' });

      animation.onfinish = postInvisibleAnim;
    }
    return function () {
      if (animation) {
        animation.cancel();
      }
    };
  }, [visible, animationRef, onAfterCloseRef, onAfterOpenRef]);

  return (
  mounted &&
  Preact.createElement(ContainWrapper, _objectSpread({
    ref: lightboxRef,
    size: true,
    layout: true,
    paint: true,
    part: "lightbox",
    contentClassName: _$content,
    wrapperClassName: _$wrapper,
    contentProps: CONTENT_PROPS,
    role: "dialog",
    tabIndex: "0",
    onKeyDown: function onKeyDown(event) {
      if (event.key === Keys.ESCAPE) {
        setVisible(false);
      }
    } },
  rest),

  Preact.createElement(CloseButton, { as: closeButtonAs, onClick: function onClick() {return setVisible(false);} }),
  children));



}

var Lightbox = forwardRef(LightboxWithRef);
Lightbox.displayName = 'Lightbox';
export { Lightbox };

/**
 *
 * @param {!LightboxDef.CloseButtonProps} props
 * @return {PreactDef.Renderable}
 */
function CloseButton(_ref2) {var onClick = _ref2.onClick,_ref2$as = _ref2.as,Comp = _ref2$as === void 0 ? ScreenReaderCloseButton : _ref2$as;
  return Preact.createElement(Comp, { "aria-label": DEFAULT_CLOSE_LABEL, onClick: onClick });
}

/**
 * This is for screen-readers only, should not get a tab stop. Note that
 * screen readers can still swipe / navigate to this element, it just will
 * not be reachable via the tab button. Note that for desktop, hitting esc
 * to close is also an option.
 *
 * We do not want this in the tab order since it is not really "visible"
 * and would be confusing to tab to if not using a screen reader.
 *
 * @param {!LightboxDef.CloseButtonProps} props
 * @return {PreactDef.Renderable}
 */
function ScreenReaderCloseButton(props) {

  return Preact.createElement("button", _objectSpread(_objectSpread({}, props), {}, { tabIndex: -1, className: _$closeButton }));
}
// /Users/mszylkowski/src/amphtml/extensions/amp-lightbox/1.0/component.js