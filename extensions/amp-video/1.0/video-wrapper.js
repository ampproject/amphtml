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
import {dict} from '../../../src/utils/object';
import {fillContentOverlay, fillStretch} from './video-wrapper.css';
import {once} from '../../../src/utils/function';
import {
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../../../src/mediasession-helper';
import {useStyles as useAutoplayStyles} from './autoplay.jss';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';

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
 * @param {!VideoWrapperProps} props
 * @return {PreactDef.Renderable}
 */
export function VideoWrapper({
  component: Component = 'video',
  autoplay = false,
  controls = false,
  noaudio = false,
  mediasession = true,
  className,
  style,
  children,
  ...rest
}) {
  useResourcesNotify();

  const [muted, setMuted] = useState(autoplay);
  const [playing, setPlaying] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);

  const wrapperRef = useRef(null);
  const playerRef = useRef(null);

  // TODO(alanorozco): We might need an API to notify reload, like when
  // <source>s change.
  const readyDeferred = useMemo(() => new Deferred(), []);

  const play = useCallback(() => {
    readyDeferred.promise.then(() => {
      playerRef.current.play();
    });
  }, [readyDeferred]);

  const pause = useCallback(() => {
    readyDeferred.promise.then(() => {
      playerRef.current.pause();
    });
  }, [readyDeferred]);

  useLayoutEffect(() => {
    if (mediasession && playing && metadata) {
      setMediaSession(window, metadata, play, pause);
    }
    return () => {
      // TODO(alanorozco): Clear media session.
      // (Tricky because we don't want to clear a different active session.)
    };
  }, [mediasession, playing, metadata, play, pause]);

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
        controls={controls && (!autoplay || userInteracted)}
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
        {children}
      </Component>
      {autoplay && !userInteracted && (
        <Autoplay
          playing={playing}
          displayIcon={!noaudio && muted}
          wrapperRef={wrapperRef}
          play={play}
          pause={pause}
          displayOverlay={controls}
          onOverlayClick={() => {
            setMuted(false);
            setUserInteracted(true);
          }}
        />
      )}
    </ContainWrapper>
  );
}

/**
 * @param {!VideoAutoplayProps} props
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
  const classes = useAutoplayStyles();

  useEffect(() => {
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
  }, [wrapperRef, play, pause]);

  return (
    <>
      {displayIcon && (
        <div className={`${classes.eq} ${playing ? classes.eqPlaying : ''}`}>
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
    </>
  );
}

/**
 * @return {!PreactDef.Renderable}
 */
const AutoplayIconContent = once(() => {
  const classes = useAutoplayStyles();
  return [1, 2, 3, 4].map((i) => <div className={classes.eqCol} key={i}></div>);
});
