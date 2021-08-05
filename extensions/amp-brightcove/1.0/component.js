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
import {useCallback, useMemo, useRef, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {VideoIframe} from '../../amp-video/1.0/video-iframe';
import {mutedOrUnmutedEvent} from '../../../src/iframe-video';
import {dispatchCustomEvent} from '#core/dom';
import {BRIGHTCOVE_EVENTS, getBrightcoveIframeSrc} from '../brightcove-api';

/** @const {string} */
const DEFAULT = 'default';

/**
 * @enum {string}
 * @private
 */
const methods = {
  'mute': 'muted',
  'unmute': 'muted',
  'showControls': 'controls',
  'hideControls': 'controls',
};

/**
 * @param {!BrightcoveDef.Props} props
 * @param {{current: ?VideoWrapperDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function BrightcoveWithRef(props, ref) {
  const {
    account,
    autoplay,
    embed = DEFAULT,
    muted: mutedProp,
    player = DEFAULT,
    playlistId,
    referrer,
    videoId,
    onPlayingState,
    urlParams,
    ...rest
  } = props;

  const playerStateRef = useRef({});
  const [muted, setMuted] = useState(mutedProp);
  const src = useMemo(
    () =>
      getBrightcoveIframeSrc(
        account,
        player,
        embed,
        playlistId,
        videoId,
        referrer,
        urlParams
      ),
    [account, embed, player, playlistId, referrer, urlParams, videoId]
  );

  const onMessage = useCallback(
    ({currentTarget, data}) => {
      const eventType = data?.event;
      switch (eventType) {
        case 'ready':
          dispatchCustomEvent(currentTarget, 'canplay');
          break;
        case 'playing':
          onPlayingState?.(true);
          break;
        case 'pause':
        case 'ended':
          onPlayingState?.(false);
          break;
      }

      if (data?.['ct']) {
        playerStateRef.current['currentTime'] = data['ct'];
      }
      if (data?.['pr']) {
        playerStateRef.current['playedRanges'] = data['pr'];
      }
      if (data?.['dur']) {
        playerStateRef.current['duration'] = data['dur'];
      }

      if (BRIGHTCOVE_EVENTS[eventType]) {
        dispatchCustomEvent(currentTarget, BRIGHTCOVE_EVENTS[eventType]);
        return;
      }

      if (eventType === 'volumechange') {
        const isMuted = data['muted'];
        if (isMuted == null || isMuted == muted) {
          return;
        }
        setMuted(isMuted);
        dispatchCustomEvent(currentTarget, mutedOrUnmutedEvent(isMuted));
      }
    },
    [muted, onPlayingState]
  );

  // Check for valid props
  if (!checkProps(props)) {
    return null;
  }

  return (
    <VideoIframe
      ref={ref}
      {...rest}
      autoplay={autoplay}
      controls={true}
      makeMethodMessage={makeMessage}
      muted={muted}
      onMessage={onMessage}
      playerStateRef={playerStateRef}
      src={src}
    />
  );
}
const Brightcove = forwardRef(BrightcoveWithRef);
Brightcove.displayName = 'Brightcove'; // Make findable for tests.
export {Brightcove};

/**
 * @param {string} method
 * @return {string}
 */
function makeMessage(method) {
  let arg;
  switch (method) {
    case 'showControls':
    case 'mute':
      arg = true;
      break;
    case 'hideControls':
    case 'unmute':
      arg = false;
      break;
    default:
      break;
  }
  return JSON.stringify({
    'command': methods[method] ?? method,
    'args': arg,
  });
}

/**
 * Verify required props and throw error if necessary.
 * @param {!BrightcoveDef.Props} props
 * @return {boolean} true on valid
 */
function checkProps({account}) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  if (!account) {
    console /*OK*/
      .warn('account is required for <Brightcove>');
    return false;
  }
  return true;
}
