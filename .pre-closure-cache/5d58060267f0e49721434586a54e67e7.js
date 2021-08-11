import { $eqCol as _$eqCol } from "./autoplay.jss";import { $fillContentOverlay as _$fillContentOverlay } from "./component.jss";import { $autoplayMaskButton as _$autoplayMaskButton } from "./autoplay.jss";import { $eqPlaying as _$eqPlaying } from "./autoplay.jss";import { $eq as _$eq } from "./autoplay.jss";import { $fillStretch as _$fillStretch } from "./component.jss";var _AutoplayIconContent; /**
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
const getMetadata = (player, props) =>
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



player && player.getMetadata ? player.getMetadata() : Object.create(null)));



/**
 * @param {!VideoWrapperDef.Props} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function VideoWrapperWithRef(
{
  autoplay = false,
  className,
  component: Component = 'video',
  controls = false,
  loading: loadingProp,
  loop = false,
  mediasession = true,
  noaudio = false,
  onPlayingState,
  onReadyState,
  poster,
  sources,
  src,
  style,
  ...rest },

ref)
{let _autoplay = autoplay,_Component = Component,_controls = controls,_loop = loop,_mediasession = mediasession,_noaudio = noaudio;
  useResourcesNotify();
  const { playable } = useAmpContext();
  const loading = useLoading(loadingProp);
  const load = loading !== Loading.UNLOAD;

  const { 0: muted, 1: setMuted } = useState(_autoplay);
  const { 0: playing, 1: setPlaying_ } = useState(false);
  const { 0: metadata, 1: setMetadata } = useState( /** @type {?MetadataDef}*/(null));
  const { 0: hasUserInteracted, 1: setHasUserInteracted } = useState(!_autoplay);

  const wrapperRef = useRef(null);
  const playerRef = useRef(null);



  // TODO(alanorozco): We might need an API to notify reload, like when
  // <source>s change.
  const readyDeferred = useMemo(() => new Deferred(), []);

  const readyStateRef = useRef(ReadyState.LOADING);
  // The `onReadyStateRef` is passed via a ref to avoid the changed values
  // of `onReadyState` re-triggering the side effects.
  const onReadyStateRef = useValueRef(onReadyState);
  const setReadyState = useCallback(
  (state, opt_failure) => {
    if (state !== readyStateRef.current) {
      readyStateRef.current = state;
      const onReadyState = onReadyStateRef.current;
      if (onReadyState) {
        onReadyState(state, opt_failure);
      }
    }
  },
  [onReadyStateRef]);


  // The `onPlayingStateRef` is passed via a ref to avoid the changed values
  // of `onPlayingState` re-triggering the side effects.
  const onPlayingStateRef = useValueRef(onPlayingState);
  const setPlayingState = useCallback(
  (playing) => {
    setPlaying_(playing);
    const onPlayingState = onPlayingStateRef.current;
    if (onPlayingState) {
      onPlayingState(playing);
    }
  },
  [onPlayingStateRef]);


  // Reset playing state when the video player is unmounted.
  useLayoutEffect(() => {
    if (!load) {
      setPlayingState(false);
    }
  }, [load, setPlayingState]);

  const play = useCallback(() => {
    return readyDeferred.promise.then(() => playerRef.current.play());
  }, [readyDeferred]);

  const pause = useCallback(() => {
    readyDeferred.promise.then(() => playerRef.current?.pause());
  }, [readyDeferred]);

  const requestFullscreen = useCallback(() => {
    return readyDeferred.promise.then(() =>
    playerRef.current.requestFullscreen());

  }, [readyDeferred]);

  const userInteracted = useCallback(() => {
    setMuted(false);
    setHasUserInteracted(true);
  }, []);

  // Update the initial readyState. Using `useLayoutEffect` here to avoid
  // race conditions with possible future events.
  useLayoutEffect(() => {
    const readyState = playerRef.current?.readyState;
    if (readyState != null) {
      setReadyState(readyState > 0 ? ReadyState.COMPLETE : ReadyState.LOADING);
    }
  }, [setReadyState]);

  useLayoutEffect(() => {
    if (_mediasession && playing && metadata) {
      setMediaSession(window, metadata, play, pause);
    }
    return () => {
      // TODO(alanorozco): Clear media session.
      // (Tricky because we don't want to clear a different active session.)
    };
  }, [_mediasession, playing, metadata, play, pause]);

  // Pause if the video goes into a "paused" context.
  useEffect(() => {
    if (!playable) {
      pause();
    }
  }, [playable, pause]);

  // We'd like this to be as close as possible to the HTMLMediaElement
  // interface, preferrably as an extension/superset.
  useImperativeHandle(
  ref,
  () => ({
    // Standard Bento
    get readyState() {
      return readyStateRef.current;
    },

    // Standard HTMLMediaElement/Element
    play,
    pause,
    requestFullscreen,
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
      return _autoplay;
    },
    get controls() {
      return _controls;
    },
    get loop() {
      return _loop;
    },

    // Non-standard
    userInteracted,
    mute: () => setMuted(true),
    unmute: () => {
      if (hasUserInteracted) {
        setMuted(false);
      }
    } }),

  [
  play,
  pause,
  requestFullscreen,
  userInteracted,
  hasUserInteracted,
  _autoplay,
  _controls,
  _loop]);



  return (
    Preact.createElement(ContainWrapper, {
      contentRef: wrapperRef,
      className: className,
      style: style,
      size: true,
      layout: true,
      paint: true },

    load &&
    Preact.createElement(_Component, { ...
      rest,
      ref: playerRef,
      loading: loading,
      muted: muted,
      loop: _loop,
      controls: _controls && (((!_autoplay || hasUserInteracted))),
      onCanPlay: () => {
        readyDeferred.resolve();
        setReadyState(ReadyState.COMPLETE);
      },
      onLoadedMetadata: () => {
        if (_mediasession) {
          readyDeferred.promise.then(() => {
            setMetadata(getMetadata(playerRef.current, rest));
          });
        }
        setReadyState(ReadyState.COMPLETE);
      },
      onPlaying: () => setPlayingState(true),
      onPause: () => setPlayingState(false),
      onEnded: () => setPlayingState(false),
      onError: (e) => {
        setReadyState(ReadyState.ERROR, e);
        readyDeferred.reject(e);
      },
      className: _$fillStretch,
      src: src,
      poster: poster },

    sources),


    _autoplay && !hasUserInteracted &&
    Preact.createElement(Autoplay, {
      metadata: metadata,
      playing: playing,
      displayIcon: !_noaudio && muted,
      wrapperRef: wrapperRef,
      play: play,
      pause: pause,
      displayOverlay: _controls,
      onOverlayClick: userInteracted })));




}

/**
 * @param {!VideoWrapperDef.AutoplayProps} props
 * @return {PreactDef.Renderable}
 */
function Autoplay({
  displayIcon,
  displayOverlay,
  metadata,
  onOverlayClick,
  pause,
  play,
  playing,
  wrapperRef })
{
  const { playable } = useAmpContext();



  useEffect(() => {
    if (!playable) {
      pause();
      return;
    }

    const observer = new IntersectionObserver(
    (entries) => {
      if (entries[entries.length - 1].isIntersecting) {
        play().catch(() => {
          // Empty catch to prevent useless unhandled rejection logging.
          // play() can fail for benign reasons like pausing.
        });
      } else {
        pause();
      }
    },
    { threshold: MIN_VISIBILITY_RATIO_FOR_AUTOPLAY });


    observer.observe(wrapperRef.current);

    return () => {
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

const AutoplayIconContent = /** @type {function():!PreactDef.Renderable} */(
once(() => {

  return [1, 2, 3, 4].map((i) =>
  Preact.createElement("div", { className: _$eqCol, key: i }));

}));


const VideoWrapper = forwardRef(VideoWrapperWithRef);
VideoWrapper.displayName = 'VideoWrapper'; // Make findable for tests.
export { VideoWrapper };