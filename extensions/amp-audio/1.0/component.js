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
import {listen} from '../../../src/event-helper';
import {setMediaSession} from '../../../src/mediasession-helper';
import {forwardRef} from '#preact/compat';
import {triggerAnalyticsEvent} from '../../../src/analytics';
import {arrayOrSingleItemToArray} from '#core/types/array';
import {closestAncestorElementBySelector} from '#core/dom/query';

const {useCallback, useEffect, useImperativeHandle, useMemo, useRef} = Preact;

/**
 * Utility method that propagates attributes from a source element
 * to an updateable element.
 * If `opt_removeMissingAttrs` is true, then also removes any specified
 * attributes that are missing on the source element from the updateable element.
 * @param {string|!Array<string>} attributes
 * @param {!Array<string>} sourceProps
 * @param {!Element} updateElement
 * @param {boolean=} opt_removeMissingAttrs
 */
function propagateAttributes(
  attributes,
  sourceProps,
  updateElement,
  opt_removeMissingAttrs
) {
  const attrs = arrayOrSingleItemToArray(attributes);

  for (const attr of attrs) {
    const val = sourceProps[attr];

    if (val !== null && val != undefined) {
      updateElement.setAttribute(attr, val);
    } else if (opt_removeMissingAttrs) {
      updateElement.removeAttribute(attr);
    }
  }
}

/**
 * @param {!AudioDef.Props} props
 * @param {{current: (!AudioDef.AudioApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
export function AudioWithRef(props, ref) {
  const audioRef = useRef();

  const {
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
  } = props;

  /** @public {boolean} */
  const isPlaying = useRef(false);

  /**
   * Checks if the function is allowed to be called
   * @return {boolean}
   */
  const isInvocationValid_ = useCallback(() => {
    if (!audioRef) {
      return false;
    }

    /**
     * ERROR:
     * Uncaught TypeError: Cannot read property 'closest' of undefined
     *    at closestAncestorElementBySelector (query.js:154)
     *    at isStoryDescendant_ (component.js:228)
     *    at component.js:100
     *    at MediaSession.<anonymous> (component.js:141)
     */
    // if (isStoryDescendant_(ref.current)) {
    //   console /*OK*/
    //     .warn(
    //       '<amp-story> elements do not support actions on <amp-audio> elements'
    //     );
    //   return false;
    // }
    return true;
  }, []);

  /**
   * Prepares Media Metadata
   */
  const metaData = useMemo(() => {
    return {
      title,
      artist,
      album,
      artwork: [{src: artwork}],
    };
  }, [title, artist, album, artwork]);

  /**
   * Plays audio callback
   */
  const playCallback = useCallback(() => {
    triggerAnalyticsEvent(audioRef.current, 'audio-play');

    if (!isInvocationValid_()) {
      return;
    }
    audioRef.current.play();
    isPlaying.current = true;
  }, [isPlaying, isInvocationValid_]);

  /**
   * Pauses audio callback
   */
  const pauseCallback = useCallback(() => {
    triggerAnalyticsEvent(audioRef.current, 'audio-pause');

    if (!isInvocationValid_()) {
      return;
    }
    audioRef.current.pause();
    isPlaying.current = false;
  }, [isPlaying, isInvocationValid_]);

  /**
   * Updates media session for current window/tab
   */
  const audioPlaying = useCallback(() => {
    const win = audioRef.current?.ownerDocument?.defaultView;
    const element = audioRef.current;

    if (validateMediaMetadata) {
      validateMediaMetadata(element, metaData);
    }

    setMediaSession(win, metaData, playCallback, pauseCallback);
  }, [metaData, validateMediaMetadata, playCallback, pauseCallback]);

  useEffect(() => {
    const unlistenPlaying = listen(audioRef.current, 'playing', () =>
      audioPlaying()
    );

    propagateAttributes(
      [
        'aria-describedby',
        'aria-label',
        'aria-labelledby',
        'autoplay',
        'controlsList',
        'loop',
        'muted',
        'preload',
        'src',
      ],
      props,
      audioRef.current
    );

    // Execute at unlayout
    return () => {
      unlistenPlaying();
    };
  }, [audioPlaying, children, props]);

  /** Audio Component - API Functions */
  useImperativeHandle(
    ref,
    () =>
      /** @type {!AudioDef.AudioApi} */ ({
        play: () => playCallback(),
        pause: () => pauseCallback(),
        isPlaying: () => isPlaying.current,
      }),
    [playCallback, pauseCallback]
  );

  return (
    <audio
      ref={audioRef}
      autoplay={autoplay}
      controls // Force controls otherwise there is no player UI.
      controlsList={controlsList}
      loop={loop}
      muted={muted}
      preload={preload}
      src={src}
      layout
      size
      paint
      {...rest}
    >
      {children}
    </audio>
  );
}

/**
 * Returns whether `<amp-audio>` has an `<amp-story>` for an ancestor.
 * @param {?Element} element
 * @return {?Element}
 * @private
 */
function isStoryDescendant_(element) {
  return closestAncestorElementBySelector(element, 'AMP-STORY');
}

const Audio = forwardRef(AudioWithRef);
Audio.displayName = 'Audio'; // Make findable for tests.
export {Audio};
