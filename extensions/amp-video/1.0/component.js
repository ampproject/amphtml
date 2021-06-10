/**
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

import * as Preact from '../../../src/preact';
import {ContainWrapper, useValueRef} from '../../../src/preact/component';
import {Deferred} from '../../../src/core/data-structures/promise';
import {Loading} from '../../../src/core/loading-instructions';
import {MIN_VISIBILITY_RATIO_FOR_AUTOPLAY} from '../../../src/video-interface';
import {
  MetadataDef,
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../../../src/mediasession-helper';
import {ReadyState} from '../../../src/core/constants/ready-state';
import {dict} from '../../../src/core/types/object';
import {fillContentOverlay, fillStretch} from './video-wrapper.css';
import {forwardRef} from '../../../src/preact/compat';
import {once} from '../../../src/core/types/function';
import {useAmpContext, useLoading} from '../../../src/preact/context';
import {useStyles as useAutoplayStyles} from './autoplay.jss';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';
import objstr from 'obj-str';

/**
 * @param {?{getMetadata: (function():?JsonObject|undefined)}} player
 * @param {!VideoWrapperDef.Props} props
 * @return {!MetadataDef}
 */
const getMetadata = (player, props) =>
  /** @type {!MetadataDef} */ (
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
              '',
          },
        ],
      }),
      player && player.getMetadata ? player.getMetadata() : Object.create(null)
    )
  );

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
    ...rest
  },
  ref
) {
  useResourcesNotify();
  const {playable} = useAmpContext();
  const loading = useLoading(loadingProp);
  const load = loading !== Loading.UNLOAD;

  const [muted, setMuted] = useState(autoplay);
  const [playing, setPlaying_] = useState(false);
  const [metadata, setMetadata] = useState(/** @type {?MetadataDef}*/ (null));
  const [hasUserInteracted, setHasUserInteracted] = useState(!autoplay);

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
    [onReadyStateRef]
  );

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
    [onPlayingStateRef]
  );

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
      playerRef.current.requestFullscreen()
    );
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
    if (mediasession && playing && metadata) {
      setMediaSession(window, metadata, play, pause);
    }
    return () => {
      // TODO(alanorozco): Clear media session.
      // (Tricky because we don't want to clear a different active session.)
    };
  }, [mediasession, playing, metadata, play, pause]);

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
        return autoplay;
      },
      get controls() {
        return controls;
      },
      get loop() {
        return loop;
      },

      // Non-standard
      userInteracted,
      mute: () => setMuted(true),
      unmute: () => {
        if (hasUserInteracted) {
          setMuted(false);
        }
      },
    }),
    [
      play,
      pause,
      requestFullscreen,
      userInteracted,
      hasUserInteracted,
      autoplay,
      controls,
      loop,
    ]
  );

  return (
    <ContainWrapper
      contentRef={wrapperRef}
      className={className}
      style={style}
      size
      layout
      paint
    >
      {load && (
        <Component
          {...rest}
          ref={playerRef}
          loading={loading}
          muted={muted}
          loop={loop}
          controls={controls && (!autoplay || hasUserInteracted)}
          onCanPlay={() => {
            readyDeferred.resolve();
            setReadyState(ReadyState.COMPLETE);
          }}
          onLoadedMetadata={() => {
            if (mediasession) {
              readyDeferred.promise.then(() => {
                setMetadata(getMetadata(playerRef.current, rest));
              });
            }
            setReadyState(ReadyState.COMPLETE);
          }}
          onPlaying={() => setPlayingState(true)}
          onPause={() => setPlayingState(false)}
          onEnded={() => setPlayingState(false)}
          onError={(e) => {
            setReadyState(ReadyState.ERROR, e);
            readyDeferred.reject(e);
          }}
          style={fillStretch}
          src={src}
          poster={poster}
        >
          {sources}
        </Component>
      )}
      {autoplay && !hasUserInteracted && (
        <Autoplay
          metadata={metadata}
          playing={playing}
          displayIcon={!noaudio && muted}
          wrapperRef={wrapperRef}
          play={play}
          pause={pause}
          displayOverlay={controls}
          onOverlayClick={userInteracted}
        />
      )}
    </ContainWrapper>
  );
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
  wrapperRef,
}) {
  const {playable} = useAmpContext();
  const classes = useAutoplayStyles();

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
      {threshold: MIN_VISIBILITY_RATIO_FOR_AUTOPLAY}
    );

    observer.observe(wrapperRef.current);

    return () => {
      observer.disconnect();
    };
  }, [wrapperRef, play, pause, playable]);

  return (
    <>
      {displayIcon && (
        <div
          className={objstr({
            [classes.eq]: true,
            [classes.eqPlaying]: playing,
          })}
        >
          <AutoplayIconContent />
        </div>
      )}

      {displayOverlay && (
        <button
          aria-label={(metadata && metadata.title) || 'Unmute video'}
          tabindex="0"
          className={classes.autoplayMaskButton}
          style={fillContentOverlay}
          onClick={onOverlayClick}
        ></button>
      )}
    </>
  );
}

const AutoplayIconContent = /** @type {function():!PreactDef.Renderable} */ (
  once(() => {
    const classes = useAutoplayStyles();
    return [1, 2, 3, 4].map((i) => (
      <div className={classes.eqCol} key={i}></div>
    ));
  })
);

const VideoWrapper = forwardRef(VideoWrapperWithRef);
VideoWrapper.displayName = 'VideoWrapper'; // Make findable for tests.
export {VideoWrapper};
