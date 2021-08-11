var _excluded = ["autoplay", "loop", "videoid", "liveChannelid", "params", "credentials"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { VideoEvents } from "../../../src/video-interface";
import { VideoIframe } from "../../amp-video/1.0/video-iframe";
import { addParamsToUrl } from "../../../src/url";
import { dict } from "../../../src/core/types/object";
import { dispatchCustomEvent } from "../../../src/core/dom";
import { forwardRef } from "../../../src/preact/compat";
import { mutedOrUnmutedEvent, objOrParseJson } from "../../../src/iframe-video";
import { useRef } from "../../../src/preact";

// Correct PlayerStates taken from
// https://developers.google.com/youtube/iframe_api_reference#Playback_status
/**
 * @enum {string}
 * @private
 */
var PlayerStates = {
  '-1': 'unstarted',
  '0': 'ended',
  '1': 'playing',
  '2': 'pause',
  '3': 'buffering',
  '5': 'video_cued' };


/**
 * @enum {string}
 * @private
 */
var methods = {
  'play': 'playVideo',
  'pause': 'pauseVideo',
  'mute': 'mute',
  'unmute': 'unMute' };


/**
 * @enum {number}
 * @private
 */
var PlayerFlags = {
  // Config to tell YouTube to hide annotations by default
  HIDE_ANNOTATION: 3 };


/** @const {!../../../src/core/dom.CustomEventOptionsDef} */
var VIDEO_EVENT_OPTIONS = { bubbles: false, cancelable: false };

/**
 * Created once per component mount.
 * The fields returned can be overridden by `infoDelivery` messages.
 * @return {!JsonObject}
 */
function createDefaultInfo() {
  return dict({
    'currentTime': 0,
    'duration': NaN });

}

/**
 * @param {!YoutubeProps} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function YoutubeWithRef(_ref,

ref)
{var autoplay = _ref.autoplay,loop = _ref.loop,videoid = _ref.videoid,liveChannelid = _ref.liveChannelid,_ref$params = _ref.params,params = _ref$params === void 0 ? {} : _ref$params,credentials = _ref.credentials,rest = _objectWithoutProperties(_ref, _excluded);
  var datasourceExists =
  !(videoid && liveChannelid) && (videoid || liveChannelid);

  if (!datasourceExists) {
    throw new Error(
    'Exactly one of data-videoid or data-live-channelid should be present for <amp-youtube>');

  }

  var src = getEmbedUrl(credentials, videoid, liveChannelid);
  if (!('playsinline' in params)) {
    params['playsinline'] = '1';
  }
  if ('autoplay' in params) {
    delete params['autoplay'];
    autoplay = true;
  }

  if (autoplay) {
    if (!('iv_load_policy' in params)) {
      params['iv_load_policy'] = "".concat(PlayerFlags.HIDE_ANNOTATION);
    }

    // Inline play must be set for autoplay regardless of original value.
    params['playsinline'] = '1';
  }

  if ('loop' in params) {
    loop = true;
    delete params['loop'];
  }

  if (loop) {
    if ('playlist' in params) {
      params['loop'] = '1';
    } else if ('loop' in params) {
      delete params['loop'];
    }
  }

  src = addParamsToUrl(src, params);

  // Player state. Includes `currentTime` and `duration`.
  var playerStateRef = useRef();
  if (!playerStateRef.current) {
    playerStateRef.current = createDefaultInfo();
  }

  var onMessage = function onMessage(_ref2) {var currentTarget = _ref2.currentTarget,data = _ref2.data;
    var parsedData = objOrParseJson(data);
    if (!parsedData) {
      return;
    }

    var event = parsedData['event'],parsedInfo = parsedData['info'];

    if (event == 'initialDelivery') {
      dispatchVideoEvent(currentTarget, VideoEvents.LOADEDMETADATA);
      return;
    }

    if (!parsedInfo) {
      return;
    }

    var info = playerStateRef.current;
    for (var key in info) {
      if (parsedInfo[key] != null) {
        info[key] = parsedInfo[key];
      }
    }

    var playerState = parsedInfo['playerState'];
    if (event == 'infoDelivery' && playerState == 0 && loop) {
      currentTarget.contentWindow. /*OK*/postMessage(
      JSON.stringify(
      dict({
        'event': 'command',
        'func': 'playVideo' })),


      '*');

    }
    if (event == 'infoDelivery' && playerState != undefined) {
      dispatchVideoEvent(currentTarget, PlayerStates[playerState.toString()]);
    }
    if (event == 'infoDelivery' && parsedInfo['muted']) {
      dispatchVideoEvent(
      currentTarget,
      mutedOrUnmutedEvent(parsedInfo['muted']));

      return;
    }
  };

  return (
    Preact.createElement(VideoIframe, _objectSpread(_objectSpread({
      ref: ref },
    rest), {}, {
      autoplay: autoplay,
      src: src,
      onMessage: onMessage,
      makeMethodMessage: makeMethodMessage,
      onIframeLoad: function onIframeLoad(event) {
        var currentTarget = event.currentTarget;
        dispatchVideoEvent(currentTarget, 'canplay');
        currentTarget.contentWindow. /*OK*/postMessage(
        JSON.stringify(
        dict({
          'event': 'listening' })),


        '*');

      },
      sandbox: "allow-scripts allow-same-origin allow-presentation",
      playerStateRef: playerStateRef })));


}

/**
 * @param {string} credentials
 * @param {string} videoid
 * @param {string} liveChannelid
 * @return {string}
 * @private
 */
function getEmbedUrl(credentials, videoid, liveChannelid) {
  var urlSuffix = '';
  if (credentials === 'omit') {
    urlSuffix = '-nocookie';
  }
  var baseUrl = "https://www.youtube".concat(urlSuffix, ".com/embed/");
  var descriptor = '';
  if (videoid) {
    descriptor = "".concat(encodeURIComponent(videoid), "?");
  } else {
    descriptor = "live_stream?channel=".concat(encodeURIComponent(
    liveChannelid || ''), "&");

  }
  return "".concat(baseUrl).concat(descriptor, "enablejsapi=1&amp=1");
}

/**
 * @param {!HTMLIFrameElement} currentTarget
 * @param {string} name
 */
function dispatchVideoEvent(currentTarget, name) {
  dispatchCustomEvent(currentTarget, name, null, VIDEO_EVENT_OPTIONS);
}

/**
 * @param {string} method
 * @return {!Object|string}
 */
function makeMethodMessage(method) {
  return JSON.stringify(
  dict({
    'event': 'command',
    'func': methods[method] }));


}

var Youtube = forwardRef(YoutubeWithRef);
Youtube.displayName = 'Youtube'; // Make findable for tests.
export { Youtube };
// /Users/mszylkowski/src/amphtml/extensions/amp-youtube/1.0/component.js