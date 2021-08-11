var _excluded = ["loading", "unloadOnPause", "sandbox", "muted", "controls", "origin", "onCanPlay", "onMessage", "playerStateRef", "makeMethodMessage", "onIframeLoad"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { Deferred } from "../../../src/core/data-structures/promise";
import { VideoWrapper } from "./component";
import { forwardRef } from "../../../src/preact/compat";
import {
useCallback,
useImperativeHandle,
useLayoutEffect,
useMemo,
useRef } from "../../../src/preact";


var DEFAULT_SANDBOX = [
'allow-scripts',
'allow-same-origin',
'allow-popups',
'allow-popups-to-escape-sandbox',
'allow-top-navigation-by-user-activation'].
join(' ');

/**
 * @param {T} prop
 * @return {{current: ?T}}
 * @template T
 */
function usePropRef(prop) {
  var ref = useRef(null);
  ref.current = prop;
  return ref;
}

/**
 * @param {!VideoIframeDef.Props} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function VideoIframeInternalWithRef(_ref,














ref)
{var loading = _ref.loading,_ref$unloadOnPause = _ref.unloadOnPause,unloadOnPause = _ref$unloadOnPause === void 0 ? false : _ref$unloadOnPause,_ref$sandbox = _ref.sandbox,sandbox = _ref$sandbox === void 0 ? DEFAULT_SANDBOX : _ref$sandbox,_ref$muted = _ref.muted,muted = _ref$muted === void 0 ? false : _ref$muted,_ref$controls = _ref.controls,controls = _ref$controls === void 0 ? false : _ref$controls,origin = _ref.origin,_onCanPlay = _ref.onCanPlay,onMessage = _ref.onMessage,playerStateRef = _ref.playerStateRef,makeMethodMessageProp = _ref.makeMethodMessage,onIframeLoad = _ref.onIframeLoad,rest = _objectWithoutProperties(_ref, _excluded);
  var iframeRef = useRef(null);

  var readyDeferred = useMemo(function () {return new Deferred();}, []);

  // Only use the first instance of `makeMethodMessage` to avoid resetting this
  // callback all the time.
  var makeMethodMessageRef = useRef(makeMethodMessageProp);
  var postMethodMessage = useCallback(
  function (method) {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      return;
    }
    var makeMethodMessage = makeMethodMessageRef.current;
    readyDeferred.promise.then(function () {
      var message = makeMethodMessage(method);
      iframeRef.current.contentWindow. /*OK*/postMessage(message, '*');
    });
  },
  [readyDeferred.promise]);


  useImperativeHandle(
  ref,
  function () {return ({
      get currentTime() {var _playerStateRef$curre, _playerStateRef$curre2;
        return (_playerStateRef$curre = (playerStateRef === null || playerStateRef === void 0) ? (void 0) : ((_playerStateRef$curre2 = playerStateRef.current) === null || _playerStateRef$curre2 === void 0) ? (void 0) : _playerStateRef$curre2['currentTime']) !== null && _playerStateRef$curre !== void 0 ? _playerStateRef$curre : NaN;
      },
      get duration() {var _playerStateRef$curre3, _playerStateRef$curre4;
        return (_playerStateRef$curre3 = (playerStateRef === null || playerStateRef === void 0) ? (void 0) : ((_playerStateRef$curre4 = playerStateRef.current) === null || _playerStateRef$curre4 === void 0) ? (void 0) : _playerStateRef$curre4['duration']) !== null && _playerStateRef$curre3 !== void 0 ? _playerStateRef$curre3 : NaN;
      },
      play: function play() {return postMethodMessage('play');},
      pause: function pause() {
        if (unloadOnPause) {
          var iframe = iframeRef.current;
          if (iframe) {
            iframe.src = iframe.src;
          }
        } else {
          postMethodMessage('pause');
        }
      } });},

  [playerStateRef, postMethodMessage, unloadOnPause]);


  // Keep `onMessage` in a ref to prevent re-listening on every render.
  // This could otherwise occur when the passed `onMessage` is not memoized.
  var onMessageRef = usePropRef(onMessage);

  useLayoutEffect(function () {
    if (!iframeRef.current) {
      return;
    }

    /** @param {Event} event */
    function handleMessage(event) {
      if (!onMessageRef.current) {
        return;
      }

      if (
      (origin && !origin.test(event.origin)) ||
      event.source != iframeRef.current.contentWindow)
      {
        return;
      }

      // Triggers like an HTMLMediaElement, so we give it an iframe handle
      // to dispatch events from. They're caught from being set on {...rest} so
      // setting onPlay, etc. props should just work.
      onMessageRef.current({
        // Event
        currentTarget: iframeRef.current,
        target: iframeRef.current,

        // MessageEvent
        data: event.data });

    }

    var defaultView = iframeRef.current.ownerDocument.defaultView;
    defaultView.addEventListener('message', handleMessage);
    return function () {return defaultView.removeEventListener('message', handleMessage);};
  }, [origin, onMessageRef]);

  useLayoutEffect(function () {
    postMethodMessage(muted ? 'mute' : 'unmute');
  }, [muted, postMethodMessage]);

  useLayoutEffect(function () {
    postMethodMessage(controls ? 'showControls' : 'hideControls');
  }, [controls, postMethodMessage]);

  return (
    Preact.createElement("iframe", _objectSpread(_objectSpread({},
    rest), {}, {
      ref: iframeRef,
      allowfullscreen: true,
      frameborder: "0",
      sandbox: sandbox,
      loading: loading,
      onCanPlay: function onCanPlay() {
        if (_onCanPlay) {
          readyDeferred.promise.then(_onCanPlay);
        }
        readyDeferred.resolve();
      },
      onLoad: function onLoad(event) {
        if (onIframeLoad) {
          onIframeLoad(event);
        }
      } })));


}

/** @visibleForTesting */
var VideoIframeInternal = forwardRef(VideoIframeInternalWithRef);
VideoIframeInternal.displayName = 'VideoIframeInternal';
export { VideoIframeInternal };

/**
 * VideoWrapper using an <iframe> for implementation.
 * Usable on the AMP layer through VideoBaseElement.
 * @param {VideoIframeDef.Props} props
 * @param {{current: (?T)}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function VideoIframeWithRef(props, ref) {
  return Preact.createElement(VideoWrapper, _objectSpread(_objectSpread({ ref: ref }, props), {}, { component: VideoIframeInternal }));
}

/**
 * VideoWrapper using an <iframe> for implementation.
 * Usable on the AMP layer through VideoBaseElement.
 * @param {VideoIframeDef.Props} props
 * @return {PreactDef.Renderable}=
 */
var VideoIframe = forwardRef(VideoIframeWithRef);
VideoIframe.displayName = 'VideoIframe';
export { VideoIframe };
// /Users/mszylkowski/src/amphtml/extensions/amp-video/1.0/video-iframe.js