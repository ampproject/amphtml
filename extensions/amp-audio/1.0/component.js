/**
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

import * as Preact from '#preact';
import {ContainWrapper} from '#preact/component';
import {listen} from '../../../src/event-helper';
import {setMediaSession} from '../../../src/mediasession-helper';
import {forwardRef} from '#preact/compat';

const {useCallback, useEffect, useImperativeHandle, useMemo, useRef} = Preact;

/**
 * @param {!AudioDef.Props} props
 * @param {{current: (!AudioDef.AudioApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
export function AudioWithRef(
  {
    album,
    artist,
    artwork,
    autoplay,
    children,
    controlsList,
    loop,
    muted,
    preload,
    src,
    title,
    validateMediaMetadata,
    ...rest
  },
  ref
) {
  const containerRef = useRef();
  const audioRef = useRef();

  /** @public {boolean} */
  const isPlaying = useRef(false);

  useEffect(() => {
    const unlistenPlaying = listen(audioRef.current, 'playing', () =>
      audioPlaying()
    );

    // Execute at unlayout
    return () => {
      unlistenPlaying();
    };
  }, [audioPlaying]);

  const metaData = useMemo(() => {
    return {
      title,
      artist,
      album,
      artwork: [{src: artwork}],
    };
  }, [title, artist, album, artwork]);

  useImperativeHandle(
    ref,
    () =>
      /** @type {!AudioDef.AudioApi} */ ({
        play: () => {
          audioRef.current.play();
          isPlaying.current = true;
        },
        pause: () => {
          audioRef.current.pause();
          isPlaying.current = false;
        },
        isPlaying: () => isPlaying.current,
      }),
    [isPlaying]
  );

  const audioPlaying = useCallback(() => {
    const win = audioRef.current?.ownerDocument?.defaultView;
    const element = containerRef.current;

    const playHandler = () => {
      audioRef.current.play();
    };

    const pauseHandler = () => {
      audioRef.current.pause();
    };

    if (validateMediaMetadata) {
      validateMediaMetadata(element, metaData);
    }

    setMediaSession(win, metaData, playHandler, pauseHandler);
  }, [metaData, validateMediaMetadata]);

  return (
    <ContainWrapper ref={containerRef} layout size paint {...rest}>
      <audio
        ref={audioRef}
        controls // Force controls otherwise there is no player UI.
        src={src}
        autoplay={autoplay}
        loop={loop}
        muted={muted}
        preload={preload}
        controlsList={controlsList}
      >
        {children}
      </audio>
    </ContainWrapper>
  );
}

const Audio = forwardRef(AudioWithRef);
Audio.displayName = 'Audio'; // Make findable for tests.
export {Audio};
