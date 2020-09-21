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
import {ContainWrapper} from '../../../src/preact/component';
import {Deferred} from '../../../src/utils/promise';
import {MIN_VISIBILITY_RATIO_FOR_AUTOPLAY} from '../../../src/video-interface';
import {cssText as autoplayCss} from '../../../build/video-autoplay.css';
import {dict} from '../../../src/utils/object';
import {fillContentOverlay, fillStretch} from './video-wrapper.css';
import {forwardRef} from '../../../src/preact/compat';
import {once} from '../../../src/utils/function';
import {
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../../../src/mediasession-helper';
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';
import {useMountEffect, useResourcesNotify} from '../../../src/preact/utils';

/**
 * @param {?{getMetadata: (function():?JsonObject|undefined)}} player
 * @param {!VideoWrapperProps} props
 * @return {!JsonObject}
 */
const getMetadata = (player, props) =>
  /** @type {!JsonObject} */ Object.assign(
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
  );

/**
 * @param {!VideoWrapperDef.Props} props
 * @param {{current: (T|null)}} ref
 * @return {PreactDef.Renderable}
 */
function VideoWrapperWithRef(
  {
    component: Component = 'video',
    autoplay = false,
    controls = false,
    noaudio = false,
    mediasession = true,
    className,
    style,
    sources,
    loop,
    ...rest
  },
  ref
) {
  useResourcesNotify();

  const [muted, setMuted] = useState(autoplay);
  const [playing, setPlaying] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(!autoplay);

  const wrapperRef = useRef(null);
  const playerRef = useRef(null);

  // TODO(alanorozco): We might need an API to notify reload, like when
  // <source>s change.
  const readyDeferred = useMemo(() => new Deferred(), []);

  const play = useCallback(
    () =>
      readyDeferred.promise.then(() => {
        const couldBePromise = playerRef.current.play();
        if (couldBePromise && couldBePromise.catch) {
          couldBePromise.catch(() => {
            // Empty catch to prevent useless unhandled rejection logging.
            // play() can fail for benign reasons like pausing.
          });
        }
      }),
    [readyDeferred]
  );

  const pause = useCallback(
    () => readyDeferred.promise.then(() => playerRef.current.pause()),
    [readyDeferred]
  );

  const requestFullscreen = useCallback(
    () =>
      readyDeferred.promise.then(() => playerRef.current.requestFullscreen()),
    [readyDeferred]
  );

  const userInteracted = useCallback(() => {
    setMuted(false);
    setHasUserInteracted(true);
  }, []);

  useLayoutEffect(() => {
    if (mediasession && playing && metadata) {
      setMediaSession(window, metadata, play, pause);
    }
    return () => {
      // TODO(alanorozco): Clear media session.
      // (Tricky because we don't want to clear a different active session.)
    };
  }, [mediasession, playing, metadata, play, pause]);

  useImperativeHandle(
    ref,
    () => ({
      // Standard HTMLMediaElement/Element
      play,
      pause,
      requestFullscreen,
      get currentTime() {
        return playerRef.current.currentTime;
      },
      get duration() {
        return playerRef.current.duration;
      },
      get autoplay() {
        return autoplay;
      },
      get controls() {
        return controls;
      },
      get loop() {
        return !!loop;
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
      <Component
        {...rest}
        ref={playerRef}
        muted={muted}
        loop={loop}
        controls={controls && (!autoplay || hasUserInteracted)}
        onCanPlay={readyDeferred.resolve}
        onLoadedMetadata={() => {
          if (mediasession) {
            readyDeferred.promise.then(() => {
              setMetadata(getMetadata(playerRef.current, rest));
            });
          }
        }}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={fillStretch}
      >
        {sources}
      </Component>
      {autoplay && !hasUserInteracted && (
        <Autoplay
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
  playing,
  displayOverlay,
  onOverlayClick,
  wrapperRef,
  play,
  pause,
}) {
  useMountEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1].isIntersecting) {
          play();
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
  });

  return (
    <>
      {displayIcon && (
        <div
          className={`amp-video-eq ${playing ? `amp-video-eq-play` : ''}`}
          // Legacy AMP (VideoManager) toggles this icon by a CSS selector.
          // We need display: flex here to override VideoManager's default
          // styling, since we're rendering this only when necessary, e.g.
          // visible.
          // TODO(alanorozco): We can simplify by also removing/adding element
          // in legacy AMP (or if we no longer need the VideoManager).
          style={{'display': 'flex'}}
        >
          <AutoplayIconContent />
        </div>
      )}

      {displayOverlay && (
        <div
          role="button"
          style={fillContentOverlay}
          onClick={onOverlayClick}
        ></div>
      )}

      {/* TODO(wg-bento): Global styling.
          https://github.com/ampproject/wg-bento/issues/7 */}
      <style>{autoplayCss}</style>
    </>
  );
}

/**
 * @return {!PreactDef.Renderable}
 */
const AutoplayIconContent = once(() =>
  [1, 2, 3, 4].map((i) => (
    <div className="amp-video-eq-col" key={i}>
      <div className={`amp-video-eq-filler amp-video-eq-${i}-1`}></div>
      <div className={`amp-video-eq-filler amp-video-eq-${i}-2`}></div>
    </div>
  ))
);

const VideoWrapper = forwardRef(VideoWrapperWithRef);
VideoWrapper.displayName = 'VideoWrapper'; // Make findable for tests.
export {VideoWrapper};
