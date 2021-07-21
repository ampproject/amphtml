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
import {assertHttpsUrl} from '../../../src/url';

import {arrayOrSingleItemToArray} from '#core/types/array';
import {
  closestAncestorElementBySelector,
  realChildNodes,
} from '#core/dom/query';

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

  /**
   * TODO:
   *  + [ ] !audio.play -> this.toggleFallback(true)
   *  + [ ] check src   -> assertHttpUrl(src, this.element)
   *  + [*] propagateAttributes( [attrs] , this.element , audioElement/ref )
   *  + [ ] for all child -> check getAttribute && getAttribute(src) -> assertHttpUrl / OR / add to audio as child
   *  + [ ] if `amp-story` is closest ancestor element -> do not auto play
   */

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

    if (isStoryDescendant_(ref.current)) {
      console /*OK*/
        .warn(
          '<amp-story> elements do not support actions on <amp-audio> elements'
        );
      return false;
    }
    return true;
  }, [ref]);

  const metaData = useMemo(() => {
    return {
      title,
      artist,
      album,
      artwork: [{src: artwork}],
    };
  }, [title, artist, album, artwork]);

  const playCallback = useCallback(() => {
    if (!isInvocationValid_()) {
      return;
    }
    audioRef.current.play();
    isPlaying.current = true;
  }, [isPlaying, isInvocationValid_]);

  const pauseCallback = useCallback(() => {
    if (!isInvocationValid_()) {
      return;
    }
    audioRef.current.pause();
    isPlaying.current = false;
  }, [isPlaying, isInvocationValid_]);

  const audioPlaying = useCallback(() => {
    const win = audioRef.current?.ownerDocument?.defaultView;
    const element = audioRef.current;

    // const playHandler = () => {
    //   if (!isInvocationValid_()) {
    //     return;
    //   }
    //   audioRef.current.play();
    // };

    // const pauseHandler = () => {
    //   if (!isInvocationValid_()) {
    //     return;
    //   }
    //   audioRef.current.pause();
    // };

    if (validateMediaMetadata) {
      validateMediaMetadata(element, metaData);
    }

    setMediaSession(win, metaData, playCallback, pauseCallback);
  }, [metaData, validateMediaMetadata, playCallback, pauseCallback]);

  useEffect(() => {
    const unlistenPlaying = listen(audioRef.current, 'playing', () =>
      audioPlaying()
    );

    console /*OK*/
      .log(' + + + + CHILDS + ');
    console /*OK*/
      .log(realChildNodes(audioRef.current.parentNode.parentNode));

    // Propagate Attributes
    propagateAttributes(
      [
        'src',
        'preload',
        'autoplay',
        'muted',
        'loop',
        'aria-label',
        'aria-describedby',
        'aria-labelledby',
        'controlsList',
      ],
      props,
      audioRef.current
    );

    // Execute at unlayout
    return () => {
      unlistenPlaying();
    };
  }, [audioPlaying, children, props]);

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
    <ContainWrapper layout size paint {...rest}>
      <audio
        ref={audioRef}
        autoplay={autoplay}
        controls // Force controls otherwise there is no player UI.
        controlsList={controlsList}
        loop={loop}
        muted={muted}
        preload={preload}
        src={src}
      >
        {children}
      </audio>
    </ContainWrapper>
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
