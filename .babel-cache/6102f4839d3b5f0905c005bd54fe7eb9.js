var _excluded = ["autoplay", "doNotTrack", "videoid"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import {
VIMEO_EVENTS,
getVimeoIframeSrc,
getVimeoOriginRegExp,
listenToVimeoEvents,
makeVimeoMessage } from "../vimeo-api";

import { VideoIframe } from "../../amp-video/1.0/video-iframe";
import { dispatchCustomEvent } from "../../../src/core/dom";
import { forwardRef } from "../../../src/preact/compat";
import {
objOrParseJson,
postMessageWhenAvailable } from "../../../src/iframe-video";

import { useCallback, useMemo, useRef } from "../../../src/preact";

/**
 * @param {!HTMLIframeElement} iframe
 * @param {string} type
 */
function dispatchEvent(iframe, type) {
  dispatchCustomEvent(iframe, type, null, {
    bubbles: true,
    cancelable: false });

}

/**
 * @param {string} method
 * @return {string}
 */
function makeMethodMessage(method) {
  if (method === 'mute') {
    return makeVimeoMessage('setVolume', '0');
  }
  if (method === 'unmute') {
    return makeVimeoMessage('setVolume', '1');
  }
  return makeVimeoMessage(method);
}

/**
 * @param {!VimeoDef.Props} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
export function VimeoWithRef(_ref,

ref)
{var _ref$autoplay = _ref.autoplay,autoplay = _ref$autoplay === void 0 ? false : _ref$autoplay,_ref$doNotTrack = _ref.doNotTrack,doNotTrack = _ref$doNotTrack === void 0 ? false : _ref$doNotTrack,videoid = _ref.videoid,rest = _objectWithoutProperties(_ref, _excluded);
  var origin = useMemo(getVimeoOriginRegExp, []);
  var src = useMemo(
  function () {return getVimeoIframeSrc(videoid, autoplay, doNotTrack);},
  [videoid, doNotTrack, autoplay]);


  var readyIframeRef = useRef(null);
  var onReadyMessage = useCallback(function (iframe) {
    if (readyIframeRef.current === iframe) {
      return;
    }
    readyIframeRef.current = iframe;
    dispatchEvent(iframe, 'canplay');
    listenToVimeoEvents(iframe);
  }, []);

  var onMessage = useCallback(
  function (e) {
    var currentTarget = e.currentTarget;
    var data = objOrParseJson(e.data);
    if (!data) {
      return;
    }
    var event = data['event'];
    if (event == 'ready' || data['method'] == 'ping') {
      onReadyMessage(currentTarget);
      return;
    }
    if (VIMEO_EVENTS[event]) {
      dispatchEvent(currentTarget, VIMEO_EVENTS[event]);
      return;
    }
  },
  [onReadyMessage]);


  var onIframeLoad = useCallback(function (e) {
    postMessageWhenAvailable(e.currentTarget, makeVimeoMessage('ping'));
  }, []);

  return (
    Preact.createElement(VideoIframe, _objectSpread(_objectSpread({
      ref: ref },
    rest), {}, {
      origin: origin,
      autoplay: autoplay,
      src: src,
      onMessage: onMessage,
      makeMethodMessage: makeMethodMessage,
      onIframeLoad: onIframeLoad
      // Vimeo API does not have a way to hide controls, so they're always set
      , controls: true })));


}

var Vimeo = forwardRef(VimeoWithRef);
Vimeo.displayName = 'Vimeo'; // Make findable for tests.
export { Vimeo };
// /Users/mszylkowski/src/amphtml/extensions/amp-vimeo/1.0/component.js