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
import {fillContentOverlay} from './video-wrapper.css';
import {
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../../../src/mediasession-helper';
import {useEffect, useMemo, useRef, useState} from '../../../src/preact';
import {useMountEffect, useResourcesNotify} from '../../../src/preact/utils';

/**
 * @param {{getMetadata: (function():!Object|undefined)}} player
 * @param {!VideoWrapperProps} props
 * @return {!Object};
 */
function getMetadata(player, props) {
  const metadata = player.getMetadata
    ? player.getMetadata()
    : {
        title: props.title || '',
        artist: props.artist || '',
        album: props.album || '',
        artwork: [{src: props.artwork || props.poster || ''}],
      };

  metadata.title = metadata.title || props['aria-label'] || document.title;

  metadata.artwork =
    metadata.artwork ||
    parseSchemaImage(document) ||
    parseOgImage(document) ||
    parseFavicon(document);

  return metadata;
}

/**
 * @param {!VideoWrapperProps} props
 * @return {PreactDef.Renderable}
 */
export function VideoWrapper({
  component: Component,
  autoplay = false,
  controls = false,
  noaudio = false,
  mediasession = true,
  style,
  children,
  ...rest
}) {
  useResourcesNotify();

  const [muted, setMuted] = useState(autoplay);
  const [metadata, setMetadata] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const wrapperRef = useRef(null);
  const playerRef = useRef(null);

  const readyDeferred = useMemo(() => new Deferred(), []);

  const play = useMemo(
    () => () => {
      readyDeferred.promise.then(() => {
        playerRef.current.play();
      });
    },
    [readyDeferred]
  );

  const pause = useMemo(
    () => () => {
      readyDeferred.promise.then(() => {
        playerRef.current.pause();
      });
    },
    [readyDeferred]
  );

  useEffect(() => {
    if (!mediasession || !metadata || !playing) {
      return;
    }
    setMediaSession(window, metadata, play, pause);
  }, [mediasession, playing, metadata, play, pause]);

  return (
    <ContainWrapper
      contentRef={wrapperRef}
      size={false}
      layout={true}
      paint={true}
    >
      <Component
        {...rest}
        ref={playerRef}
        muted={muted}
        controls={controls && (!autoplay || userInteracted)}
        onCanPlay={readyDeferred.resolve}
        onLoadedMetadata={() => {
          if (!mediasession) {
            return;
          }

          setMetadata(getMetadata(playerRef.current, rest));
        }}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{
          ...style,
          'position': 'relative',
          'width': '100%',
          'height': '100%',
        }}
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
      {displayIcon && <AutoplayIcon playing={playing} />}

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
 * @param {!VideoAutoplayIconProps} props
 * @return {PreactDef.Renderable}
 */
function AutoplayIcon({playing}) {
  const columns = useMemo(
    () =>
      [1, 2, 3, 4].map((i) => (
        <div class="amp-video-eq-col" key={i}>
          <div class={`amp-video-eq-filler amp-video-eq-${i}-1`}></div>
          <div class={`amp-video-eq-filler amp-video-eq-${i}-2`}></div>
        </div>
      )),
    []
  );

  return (
    <div
      class={`amp-video-eq ${playing ? `amp-video-eq-play` : ''}`}
      style={{display: 'flex'}}
    >
      {columns}
    </div>
  );
}
