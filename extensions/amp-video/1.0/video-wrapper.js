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
import {
  MetadataDef,
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../../../src/mediasession-helper';
import {dict} from '../../../src/utils/object';
import {fillContentOverlay, fillStretch} from './video-wrapper.css';
import {forwardRef} from '../../../src/preact/compat';
import {once} from '../../../src/utils/function';
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

/**
 * @param {?{getMetadata: (function():?JsonObject|undefined)}} player
 * @param {!VideoWrapperDef.Props} props
 * @return {!MetadataDef}
 */
const getMetadata = (player, props) =>
  /** @type {!MetadataDef} */ (Object.assign(
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
  ));

/**
 * @param {!VideoWrapperDef.Props} props
 * @param {{current: (T|null)}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function VideoWrapperWithRef(
  {
    component: Component = 'video',
    autoplay = false,
    controls = false,
    loop = false,
    noaudio = false,
    mediasession = true,
    className,
    style,
    sources,
    ...rest
  },
  ref
) {
  useResourcesNotify();

  const [muted, setMuted] = useState(autoplay);
  const [playing, setPlaying] = useState(false);
  const [metadata, setMetadata] = useState(/** @type {?MetadataDef}*/ (null));
  const [hasUserInteracted, setHasUserInteracted] = useState(!autoplay);

  const wrapperRef = useRef(null);
  const playerRef = useRef(null);

  // TODO(alanorozco): We might need an API to notify reload, like when
  // <source>s change.
  const readyDeferred = useMemo(() => new Deferred(), []);

  const play = useCallback(() => {
    return readyDeferred.promise.then(() => playerRef.current.play());
  }, [readyDeferred]);

  const pause = useCallback(() => {
    readyDeferred.promise.then(() => playerRef.current.pause());
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

  useLayoutEffect(() => {
    if (mediasession && playing && metadata) {
      setMediaSession(window, metadata, play, pause);
    }
    return () => {
      // TODO(alanorozco): Clear media session.
      // (Tricky because we don't want to clear a different active session.)
    };
  }, [mediasession, playing, metadata, play, pause]);

  // We'd like this to be as close as possible to the HTMLMediaElement
  // interface, preferrably as an extension/superset.
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
  metadata,
  displayIcon,
  playing,
  displayOverlay,
  onOverlayClick,
  wrapperRef,
  play,
  pause,
}) {
  const classes = useAutoplayStyles();

  useEffect(() => {
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
  }, [wrapperRef, play, pause]);

  return (
    <>
      {displayIcon && (
        <div className={`${classes.eq} ${playing ? classes.eqPlaying : ''}`}>
          <AutoplayIconContent />
        </div>
      )}

      {displayOverlay && (
        <button
          aria-label={metadata?.title || 'Unmute video'}
          tabindex="0"
          className={classes.autoplayMaskButton}
          style={fillContentOverlay}
          onClick={onOverlayClick}
        ></button>
      )}
    </>
  );
}

const AutoplayIconContent = /** @type {function():!PreactDef.Renderable} */ (once(
  () => {
    const classes = useAutoplayStyles();
    return [1, 2, 3, 4].map((i) => (
      <div className={classes.eqCol} key={i}></div>
    ));
  }
));

const VideoWrapper = forwardRef(VideoWrapperWithRef);
VideoWrapper.displayName = 'VideoWrapper'; // Make findable for tests.
export {VideoWrapper};
