import { $eqCol as _$eqCol } from "./autoplay.jss";import { $fillContentOverlay as _$fillContentOverlay } from "./component.jss";import { $autoplayMaskButton as _$autoplayMaskButton } from "./autoplay.jss";import { $eqPlaying as _$eqPlaying } from "./autoplay.jss";import { $eq as _$eq } from "./autoplay.jss";import { $fillStretch as _$fillStretch } from "./component.jss";var _AutoplayIconContent;var _excluded = ["autoplay", "className", "component", "controls", "loading", "loop", "mediasession", "noaudio", "onPlayingState", "onReadyState", "poster", "sources", "src", "style"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { Deferred } from "../../../src/core/data-structures/promise";
import { Loading } from "../../../src/core/constants/loading-instructions";
import { MIN_VISIBILITY_RATIO_FOR_AUTOPLAY } from "../../../src/video-interface";
import {
MetadataDef,
parseFavicon,
parseOgImage,
parseSchemaImage,
setMediaSession } from "../../../src/mediasession-helper";

import { ReadyState } from "../../../src/core/constants/ready-state";
import { dict } from "../../../src/core/types/object";
import { forwardRef } from "../../../src/preact/compat";
import { once } from "../../../src/core/types/function";
import { useAmpContext, useLoading } from "../../../src/preact/context";
import { useStyles as useAutoplayStyles } from "./autoplay.jss";
import {
useCallback,
useEffect,
useImperativeHandle,
useLayoutEffect,
useMemo,
useRef,
useState } from "../../../src/preact";

import { useResourcesNotify } from "../../../src/preact/utils";
import { useStyles } from "./component.jss";
import objstr from 'obj-str';

/**
 * @param {?{getMetadata: (function():?JsonObject|undefined)}} player
 * @param {!VideoWrapperDef.Props} props
 * @return {!MetadataDef}
 */
var getMetadata = function getMetadata(player, props) {return (
    /** @type {!MetadataDef} */(
    Object.assign(
    dict({
      'title': props.title || props['aria-label'] || document.title,
      'artist': props.artist || '',
      'album': props.album || '',
      'artwork': [
      {
        'src':
        props.artwork ||
        props.poster ||
        parseSchemaImage(document) ||
        parseOgImage(document) ||
        parseFavicon(document) ||
        '' }] }),



    player && player.getMetadata ? player.getMetadata() : Object.create(null))));};



/**
 * @param {!VideoWrapperDef.Props} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function VideoWrapperWithRef(_ref,

















ref)
{var _ref$autoplay = _ref.autoplay,autoplay = _ref$autoplay === void 0 ? false : _ref$autoplay,className = _ref.className,_ref$component = _ref.component,Component = _ref$component === void 0 ? 'video' : _ref$component,_ref$controls = _ref.controls,controls = _ref$controls === void 0 ? false : _ref$controls,loadingProp = _ref.loading,_ref$loop = _ref.loop,loop = _ref$loop === void 0 ? false : _ref$loop,_ref$mediasession = _ref.mediasession,mediasession = _ref$mediasession === void 0 ? true : _ref$mediasession,_ref$noaudio = _ref.noaudio,noaudio = _ref$noaudio === void 0 ? false : _ref$noaudio,onPlayingState = _ref.onPlayingState,onReadyState = _ref.onReadyState,poster = _ref.poster,sources = _ref.sources,src = _ref.src,style = _ref.style,rest = _objectWithoutProperties(_ref, _excluded);
  useResourcesNotify();
  var _useAmpContext = useAmpContext(),playable = _useAmpContext.playable;
  var loading = useLoading(loadingProp);
  var load = loading !== Loading.UNLOAD;

  var _useState = useState(autoplay),_useState2 = _slicedToArray(_useState, 2),muted = _useState2[0],setMuted = _useState2[1];
  var _useState3 = useState(false),_useState4 = _slicedToArray(_useState3, 2),playing = _useState4[0],setPlaying_ = _useState4[1];
  var _useState5 = useState( /** @type {?MetadataDef}*/(null)),_useState6 = _slicedToArray(_useState5, 2),metadata = _useState6[0],setMetadata = _useState6[1];
  var _useState7 = useState(!autoplay),_useState8 = _slicedToArray(_useState7, 2),hasUserInteracted = _useState8[0],setHasUserInteracted = _useState8[1];

  var wrapperRef = useRef(null);
  var playerRef = useRef(null);



  // TODO(alanorozco): We might need an API to notify reload, like when
  // <source>s change.
  var readyDeferred = useMemo(function () {return new Deferred();}, []);

  var readyStateRef = useRef(ReadyState.LOADING);
  // The `onReadyStateRef` is passed via a ref to avoid the changed values
  // of `onReadyState` re-triggering the side effects.
  var onReadyStateRef = useValueRef(onReadyState);
  var setReadyState = useCallback(
  function (state, opt_failure) {
    if (state !== readyStateRef.current) {
      readyStateRef.current = state;
      var _onReadyState = onReadyStateRef.current;
      if (_onReadyState) {
        _onReadyState(state, opt_failure);
      }
    }
  },
  [onReadyStateRef]);


  // The `onPlayingStateRef` is passed via a ref to avoid the changed values
  // of `onPlayingState` re-triggering the side effects.
  var onPlayingStateRef = useValueRef(onPlayingState);
  var setPlayingState = useCallback(
  function (playing) {
    setPlaying_(playing);
    var onPlayingState = onPlayingStateRef.current;
    if (onPlayingState) {
      onPlayingState(playing);
    }
  },
  [onPlayingStateRef]);


  // Reset playing state when the video player is unmounted.
  useLayoutEffect(function () {
    if (!load) {
      setPlayingState(false);
    }
  }, [load, setPlayingState]);

  var play = useCallback(function () {
    return readyDeferred.promise.then(function () {return playerRef.current.play();});
  }, [readyDeferred]);

  var pause = useCallback(function () {
    readyDeferred.promise.then(function () {var _playerRef$current;return ((_playerRef$current = playerRef.current) === null || _playerRef$current === void 0) ? (void 0) : _playerRef$current.pause();});
  }, [readyDeferred]);

  var requestFullscreen = useCallback(function () {
    return readyDeferred.promise.then(function () {return (
        playerRef.current.requestFullscreen());});

  }, [readyDeferred]);

  var userInteracted = useCallback(function () {
    setMuted(false);
    setHasUserInteracted(true);
  }, []);

  // Update the initial readyState. Using `useLayoutEffect` here to avoid
  // race conditions with possible future events.
  useLayoutEffect(function () {var _playerRef$current2;
    var readyState = ((_playerRef$current2 = playerRef.current) === null || _playerRef$current2 === void 0) ? (void 0) : _playerRef$current2.readyState;
    if (readyState != null) {
      setReadyState(readyState > 0 ? ReadyState.COMPLETE : ReadyState.LOADING);
    }
  }, [setReadyState]);

  useLayoutEffect(function () {
    if (mediasession && playing && metadata) {
      setMediaSession(window, metadata, play, pause);
    }
    return function () {
      // TODO(alanorozco): Clear media session.
      // (Tricky because we don't want to clear a different active session.)
    };
  }, [mediasession, playing, metadata, play, pause]);

  // Pause if the video goes into a "paused" context.
  useEffect(function () {
    if (!playable) {
      pause();
    }
  }, [playable, pause]);

  // We'd like this to be as close as possible to the HTMLMediaElement
  // interface, preferrably as an extension/superset.
  useImperativeHandle(
  ref,
  function () {return ({
      // Standard Bento
      get readyState() {
        return readyStateRef.current;
      },

      // Standard HTMLMediaElement/Element
      play: play,
      pause: pause,
      requestFullscreen: requestFullscreen,
      get currentTime() {
        if (!playerRef.current) {
          return 0;
        }
        return playerRef.current.currentTime;
      },
      get duration() {
        if (!playerRef.current) {
          return NaN;
        }
        return playerRef.current.duration;
      },
      get autoplay() {
        return autoplay;
      },
      get controls() {
        return controls;
      },
      get loop() {
        return loop;
      },

      // Non-standard
      userInteracted: userInteracted,
      mute: function mute() {return setMuted(true);},
      unmute: function unmute() {
        if (hasUserInteracted) {
          setMuted(false);
        }
      } });},

  [
  play,
  pause,
  requestFullscreen,
  userInteracted,
  hasUserInteracted,
  autoplay,
  controls,
  loop]);



  return (
    Preact.createElement(ContainWrapper, {
      contentRef: wrapperRef,
      className: className,
      style: style,
      size: true,
      layout: true,
      paint: true },

    load &&
    Preact.createElement(Component, _objectSpread(_objectSpread({},
    rest), {}, {
      ref: playerRef,
      loading: loading,
      muted: muted,
      loop: loop,
      controls: controls && (((!autoplay || hasUserInteracted))),
      onCanPlay: function onCanPlay() {
        readyDeferred.resolve();
        setReadyState(ReadyState.COMPLETE);
      },
      onLoadedMetadata: function onLoadedMetadata() {
        if (mediasession) {
          readyDeferred.promise.then(function () {
            setMetadata(getMetadata(playerRef.current, rest));
          });
        }
        setReadyState(ReadyState.COMPLETE);
      },
      onPlaying: function onPlaying() {return setPlayingState(true);},
      onPause: function onPause() {return setPlayingState(false);},
      onEnded: function onEnded() {return setPlayingState(false);},
      onError: function onError(e) {
        setReadyState(ReadyState.ERROR, e);
        readyDeferred.reject(e);
      },
      className: _$fillStretch,
      src: src,
      poster: poster }),

    sources),


    autoplay && !hasUserInteracted &&
    Preact.createElement(Autoplay, {
      metadata: metadata,
      playing: playing,
      displayIcon: !noaudio && muted,
      wrapperRef: wrapperRef,
      play: play,
      pause: pause,
      displayOverlay: controls,
      onOverlayClick: userInteracted })));




}

/**
 * @param {!VideoWrapperDef.AutoplayProps} props
 * @return {PreactDef.Renderable}
 */
function Autoplay(_ref2)








{var displayIcon = _ref2.displayIcon,displayOverlay = _ref2.displayOverlay,metadata = _ref2.metadata,onOverlayClick = _ref2.onOverlayClick,pause = _ref2.pause,play = _ref2.play,playing = _ref2.playing,wrapperRef = _ref2.wrapperRef;
  var _useAmpContext2 = useAmpContext(),playable = _useAmpContext2.playable;



  useEffect(function () {
    if (!playable) {
      pause();
      return;
    }

    var observer = new IntersectionObserver(
    function (entries) {
      if (entries[entries.length - 1].isIntersecting) {
        play().catch(function () {
          // Empty catch to prevent useless unhandled rejection logging.
          // play() can fail for benign reasons like pausing.
        });
      } else {
        pause();
      }
    },
    { threshold: MIN_VISIBILITY_RATIO_FOR_AUTOPLAY });


    observer.observe(wrapperRef.current);

    return function () {
      observer.disconnect();
    };
  }, [wrapperRef, play, pause, playable]);

  return (
    Preact.createElement(Preact.Fragment, null,
    displayIcon &&
    Preact.createElement("div", {
      className: (((((('' + (((
      true ? _$eq : '')))))) + (((
      playing ? ' ' + _$eqPlaying : '')))))) }, (((_AutoplayIconContent || (((_AutoplayIconContent =


    Preact.createElement(AutoplayIconContent, null)))))))),



    displayOverlay &&
    Preact.createElement("button", {
      "aria-label": (((metadata && metadata.title))) || 'Unmute video',
      tabindex: "0",
      className: (((((('' + (((
      true ? _$autoplayMaskButton : '')))))) + (((
      true ? ' ' + _$fillContentOverlay : '')))))),

      onClick: onOverlayClick })));




}

var AutoplayIconContent = /** @type {function():!PreactDef.Renderable} */(
once(function () {

  return [1, 2, 3, 4].map(function (i) {return (
      Preact.createElement("div", { className: _$eqCol, key: i }));});

}));


var VideoWrapper = forwardRef(VideoWrapperWithRef);
VideoWrapper.displayName = 'VideoWrapper'; // Make findable for tests.
export { VideoWrapper };
// /Users/mszylkowski/src/amphtml/extensions/amp-video/1.0/component.js