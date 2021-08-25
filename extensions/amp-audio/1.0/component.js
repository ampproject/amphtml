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
import {useCallback, useImperativeHandle, useMemo, useRef} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

import {
  EMPTY_METADATA,
  setMediaSession,
} from '../../../src/mediasession-helper';

/**
 * @param {!AudioDef.Props} props
 * @param {{current: ?AudioDef.AudioApi}} ref
 * @return {PreactDef.Renderable}
 */
export function AudioWithRef(
  {
    album = EMPTY_METADATA.album,
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    artist = EMPTY_METADATA.artist,
    artwork = EMPTY_METADATA.artwork,
    autoplay = false,
    controlsList,
    loading = 'lazy',
    loop = false,
    muted = false,
    onPause,
    onPlay,
    preload,
    sources,
    src,
    title = EMPTY_METADATA.title,
    ...rest
  },
  ref
) {
  const audioRef = useRef(null);
  const wrapperRef = useRef(null);

  /** @public {boolean} */
  const isPlaying = useRef(false);

  /**
   * Prepares Media Metadata
   */
  const metadata = useMemo(
    () => ({
      title,
      artist,
      album,
      artwork: [{src: artwork}],
    }),
    [title, artist, album, artwork]
  );

  /**
   * Plays audio callback
   */
  const play = useCallback(() => {
    onPlay?.();
    audioRef.current.play();
    isPlaying.current = true;
  }, [onPlay]);

  /**
   * Pauses audio callback
   */
  const pause = useCallback(() => {
    onPause?.();
    audioRef.current.pause();
    isPlaying.current = false;
  }, [onPause]);

  /**
   * Updates media session for current window/tab
   */
  const onPlaying = useCallback(() => {
    const win = audioRef.current?.ownerDocument?.defaultView;

    /**
     * TODO(AnuragVasanwala):
     * Add "validateMediaMetadata?.(element, metadata)"
     * once validation step for video components on Bento are included
     */

    setMediaSession(win, metadata, play, pause);
  }, [metadata, play, pause]);

  /** Audio Component - API Functions */
  useImperativeHandle(
    ref,
    () =>
      /** @type {!AudioDef.AudioApi} */ ({
        play,
        pause,
        isPlaying: () => isPlaying.current,
      }),
    [play, pause]
  );

  return (
    <ContainWrapper contentRef={wrapperRef} size layout paint {...rest}>
      <audio
        ref={audioRef}
        aria-describedby={ariaDescribedby}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        autoplay={autoplay}
        controls // Force controls otherwise there is no player UI.
        controlsList={controlsList}
        loading={loading}
        loop={loop}
        muted={muted}
        onPlaying={onPlaying}
        preload={preload}
        src={src}
      >
        {sources}
      </audio>
    </ContainWrapper>
  );
}

const Audio = forwardRef(AudioWithRef);
Audio.displayName = 'Audio'; // Make findable for tests.
export {Audio};
