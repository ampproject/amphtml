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
import {MIN_VISIBILITY_RATIO_FOR_AUTOPLAY} from '../../../src/video-interface';
import {useEffect, useRef, useState} from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';
// Source for this constant is css/video-autoplay.css
import {Deferred} from '../../../src/utils/promise';
import {
  EMPTY_METADATA,
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../../../src/mediasession-helper';
import {cssText as autoplayCss} from '../../../build/video-autoplay.css';

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
  children,
  // Prevent override in passthroughProps.
  muted: unusedMuted,
  ...passthroughProps
}) {
  useResourcesNotify();

  const [muted, setMuted] = useState(autoplay);
  const [metadata, setMetadata] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const wrapperRef = useRef(null);
  const playerRef = useRef(null);

  const readyDeferredRef = useRef(new Deferred());

  const play = () => {
    readyDeferredRef.current.promise.then(() => {
      playerRef.current.play();
    });
  };

  const pause = () => {
    readyDeferredRef.current.promise.then(() => {
      playerRef.current.pause();
    });
  };

  useEffect(() => {
    if (!mediasession || !metadata || !playing) {
      return;
    }
    setMediaSession(window, metadata, play, pause);
  }, [mediasession, playing, metadata]);

  return (
    <div
      ref={wrapperRef}
      style={{position: 'relative', width: '100%', height: '100%'}}
    >
      <Component
        ref={playerRef}
        // Ensure that props controlled here are excluded from passthroughProps,
        // see destructuring statement above.
        muted={muted}
        controls={controls && (!autoplay || userInteracted)}
        onLoad={() => readyDeferredRef.current.resolve()}
        onLoadedMetadata={() => {
          if (!mediasession) {
            return;
          }

          const metadata = playerRef.current.getMetadata() || {
            ...EMPTY_METADATA,
            artwork: undefined,
          };

          metadata.title =
            metadata.title ||
            passthroughProps.title ||
            passthroughProps['aria-label'] ||
            document.title;

          metadata.artwork =
            metadata.artwork ||
            parseSchemaImage(document) ||
            parseOgImage(document) ||
            parseFavicon(document);

          setMetadata(metadata);
        }}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        {...passthroughProps}
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
    </div>
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
  useEffect(() => {
    let observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
      observer = null;
    };
  }, [wrapperRef, play, pause]);

  return (
    <>
      {displayIcon && (
        <div
          class={`amp-video-eq ${playing ? `amp-video-eq-play` : ''}`}
          style={{display: 'flex'}}
        >
          {[1, 2, 3, 4].map((i) => (
            <div class="amp-video-eq-col" key={i}>
              <div class={`amp-video-eq-filler amp-video-eq-${i}-1`}></div>
              <div class={`amp-video-eq-filler amp-video-eq-${i}-2`}></div>
            </div>
          ))}
        </div>
      )}

      {displayOverlay && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            zIndex: 1,
          }}
          role="button"
          onClick={onOverlayClick}
        ></div>
      )}

      {/* TODO(wg-bento): Global styling.
          https://github.com/ampproject/wg-bento/issues/7 */}
      <style>{autoplayCss}</style>
    </>
  );
}
