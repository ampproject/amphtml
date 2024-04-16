import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

import {setMediaSession} from '../../../src/mediasession-helper';

/**
 * @param {!AudioDef.Props} props
 * @param {{current: ?AudioDef.AudioApi}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoAudioWithRef(
  {
    album = '',
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    artist = '',
    artwork = '',
    // TODO(dmanek): Use InOb hook for autoplay.
    // autoplay = false,
    controlsList,
    loading = 'lazy',
    loop = false,
    muted = false,
    onError,
    onPause,
    onPlaying,
    preload,
    sources,
    src,
    title = '',
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
    audioRef.current.play();
    isPlaying.current = true;
  }, []);

  /**
   * Pauses audio callback
   */
  const pause = useCallback(() => {
    audioRef.current.pause();
    isPlaying.current = false;
  }, []);

  /**
   * Updates media session for current window/tab
   */
  const playingCallback = useCallback(() => {
    onPlaying?.();
  }, [onPlaying]);

  /**
   * Updates media session for current window/tab
   */
  const pauseCallback = useCallback(() => {
    onPause?.();
  }, [onPause]);

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

  useEffect(() => {
    const win = audioRef.current?.ownerDocument?.defaultView;

    /**
     * TODO(AnuragVasanwala):
     * Add "validateMediaMetadata?.(element, metadata)"
     * once validation step for video components on Bento are included
     */

    if (win) {
      setMediaSession(win, metadata, play, pause);
    }
  }, [metadata, play, pause]);

  return (
    <ContainWrapper contentRef={wrapperRef} size layout paint {...rest}>
      <audio
        ref={audioRef}
        aria-describedby={ariaDescribedby}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        // TODO(dmanek): Use InOb hook for autoplay.
        // autoplay={autoplay}
        controls // Force controls otherwise there is no player UI.
        controlsList={controlsList}
        loading={loading}
        loop={loop}
        muted={muted}
        onError={onError}
        onPause={pauseCallback}
        onPlaying={playingCallback}
        preload={preload}
        src={src}
      >
        {sources}
      </audio>
    </ContainWrapper>
  );
}

const BentoAudio = forwardRef(BentoAudioWithRef);
BentoAudio.displayName = 'BentoAudio'; // Make findable for tests.
export {BentoAudio};
