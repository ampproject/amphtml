var _excluded = ["allow", "allowFullScreen", "allowTransparency", "iframeStyle", "name", "title", "matchesMessagingOrigin", "messageHandler", "ready", "loading", "onReadyState", "sandbox", "src"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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

import { Loading } from "../../core/constants/loading-instructions";
import { ReadyState } from "../../core/constants/ready-state";

import * as Preact from "./..";
import {
useCallback,
useEffect,
useImperativeHandle,
useLayoutEffect,
useRef } from "./..";

import { forwardRef } from "../compat";
import { ContainWrapper, useValueRef } from "./";
import { useAmpContext, useLoading } from "../context";

var DEFAULT_MATCHES_MESSAGING_ORIGIN = function DEFAULT_MATCHES_MESSAGING_ORIGIN() {return false;};
var ABOUT_BLANK = 'about:blank';

/**
 * iframe.src = iframe.src forces an iframe reload,
 * EXCEPT when the iframe.src contains a fragment.
 * With a fragment it just thinks it's a hash change.
 * @param {string} src
 * @return {boolean}
 * */
var canResetSrc = function canResetSrc(src) {return src && src != ABOUT_BLANK && !src.includes('#');};

/**
 * @param {!IframeEmbedDef.Props} props
 * @param {{current: ?IframeEmbedDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function IframeEmbedWithRef(_ref,
















ref)
{var allow = _ref.allow,allowFullScreen = _ref.allowFullScreen,allowTransparency = _ref.allowTransparency,iframeStyle = _ref.iframeStyle,name = _ref.name,title = _ref.title,_ref$matchesMessaging = _ref.matchesMessagingOrigin,matchesMessagingOrigin = _ref$matchesMessaging === void 0 ? DEFAULT_MATCHES_MESSAGING_ORIGIN : _ref$matchesMessaging,messageHandler = _ref.messageHandler,_ref$ready = _ref.ready,ready = _ref$ready === void 0 ? true : _ref$ready,loadingProp = _ref.loading,onReadyState = _ref.onReadyState,sandbox = _ref.sandbox,src = _ref.src,rest = _objectWithoutProperties(_ref, _excluded);
  var _useAmpContext = useAmpContext(),playable = _useAmpContext.playable;
  var loading = useLoading(loadingProp);
  var mount = loading !== Loading.UNLOAD;

  var loadedRef = useRef(false);
  // The `onReadyStateRef` is passed via a ref to avoid the changed values
  // of `onReadyState` re-triggering the side effects.
  var onReadyStateRef = useValueRef(onReadyState);
  var setLoaded = useCallback(
  function (value) {
    if (value !== loadedRef.current) {
      loadedRef.current = value;
      var _onReadyState = onReadyStateRef.current;
      (_onReadyState === null || _onReadyState === void 0) ? (void 0) : _onReadyState(value ? ReadyState.COMPLETE : ReadyState.LOADING);
    }
  },
  [onReadyStateRef]);


  var iframeRef = useRef(null);

  // Component API: IframeEmbedDef.Api.
  useImperativeHandle(
  ref,
  function () {return ({
      // Standard Bento
      get readyState() {
        return loadedRef.current ? ReadyState.COMPLETE : ReadyState.LOADING;
      },
      get node() {
        return iframeRef.current;
      } });},

  []);


  // Reset readyState to "loading" when an iframe is unloaded. Has to be
  // a `useLayoutEffect` to avoid race condition with a future "load" event.
  // A race condition can happen when a `useEffect` would be executed
  // after a future "load" is dispatched.
  useLayoutEffect(function () {
    if (!mount) {
      setLoaded(false);
    }
  }, [mount, setLoaded]);

  // Pause if the post goes into a "paused" context.
  useEffect(function () {
    var iframe = iframeRef.current;
    if (!playable && iframe) {
      var _src = iframe.src;
      // Resetting the `src` will reset the iframe and pause it. It will force
      // the reload of the whole iframe. But it's the only reliable option
      // to force pause.
      if (canResetSrc(_src)) {
        iframe.src = iframe.src;
      } else {
        var parent = iframe.parentNode;
        parent.insertBefore(iframe, iframe.nextSibling);
      }
    }
  }, [playable]);

  useLayoutEffect(function () {
    var iframe = iframeRef.current;
    if (!iframe || !mount) {
      return;
    }

    var handler = function handler(event) {
      var iframe = iframeRef.current;
      if (
      !iframe ||
      event.source != iframe.contentWindow ||
      !matchesMessagingOrigin(event.origin))
      {
        return;
      }
      messageHandler(event);
    };

    var defaultView = iframe.ownerDocument.defaultView;
    defaultView.addEventListener('message', handler);
    return function () {return defaultView.removeEventListener('message', handler);};
  }, [matchesMessagingOrigin, messageHandler, mount, ready]);

  return (
    Preact.createElement(ContainWrapper, _objectSpread(_objectSpread({}, rest), {}, { layout: true, size: true, paint: true }),
    mount && ready &&
    Preact.createElement("iframe", {
      allow: allow,
      allowFullScreen: allowFullScreen,
      allowTransparency: allowTransparency,
      frameborder: "0",
      loading: loading,
      name: name,
      onLoad: function onLoad() {return setLoaded(true);},
      part: "iframe",
      ref: iframeRef,
      sandbox: sandbox,
      scrolling: "no",
      src: src,
      style: _objectSpread(_objectSpread({},
      iframeStyle), {}, {
        width: '100%',
        height: '100%',
        contentVisibility: 'auto' }),

      title: title })));




}

var IframeEmbed = forwardRef(IframeEmbedWithRef);
IframeEmbed.displayName = 'IframeEmbed'; // Make findable for tests.
export { IframeEmbed };
// /Users/mszylkowski/src/amphtml/src/preact/component/iframe.js