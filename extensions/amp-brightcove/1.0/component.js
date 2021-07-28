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
import {addParamsToUrl} from '../../../src/url';
import {useCallback, useMemo, useRef, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {VideoIframe} from '../../amp-video/1.0/video-iframe';
import {mutedOrUnmutedEvent} from '../../../src/iframe-video';
import {VideoEvents} from '../../../src/video-interface';
import {dispatchCustomEvent} from '#core/dom';

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
 * @enum {string}
 * @private
 */
const events = {
  'ready': VideoEvents.LOAD,
  'playing': VideoEvents.PLAYING,
  'pause': VideoEvents.PAUSE,
  'ended': VideoEvents.ENDED,
  'ads-ad-started': VideoEvents.AD_START,
  'ads-ad-ended': VideoEvents.AD_END,
  'loadedmetadata': VideoEvents.LOADEDMETADATA,
};

/**
 * @param {!BrightcoveDef.Props} props
 * @param {{current: ?VideoWrapperDef.Api.CarouselApi}} ref
 * @return {PreactDef.Renderable}
 */
export function BrightcoveWithRef(
  {
    account,
    autoplay,
    embed = DEFAULT,
    muted: mutedProp,
    onReady,
    player = DEFAULT,
    playlistId,
    referrer,
    videoId,
    onPlayingState,
    urlParams,
    ...rest
  },
  ref
) {
  const playerStateRef = useRef({});
  const [muted, setMuted] = useState(mutedProp);
  const src = useMemo(
    () =>
      addParamsToUrl(
        `https://players.brightcove.net/${encodeURIComponent(account)}` +
          `/${encodeURIComponent(player)}` +
          `_${encodeURIComponent(embed)}/index.html` +
          '?amp=1' +
          // These are encodeURIComponent'd in encodeId_().
          (playlistId
            ? '&playlistId=' + encodeId(playlistId)
            : videoId
            ? '&videoId=' + encodeId(videoId)
            : ''),
        {...urlParams, referrer, playsinline: true, autoplay: undefined}
      ),
    [account, embed, player, playlistId, referrer, urlParams, videoId]
  );

  const makeMethodMessage = useCallback((method) => makeMessage(method), []);
  const onMessage = useCallback(
    ({currentTarget, data}) => {
      const eventType = data?.event;
      switch (eventType) {
        case 'ready':
          onReady?.(data, player);
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

      if (events[eventType]) {
        dispatchCustomEvent(currentTarget, events[eventType]);
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
    [muted, onReady, player, onPlayingState]
  );

  // Check for valid props
  if (!checkProps(account)) {
    return null;
  }

  return (
    <VideoIframe
      ref={ref}
      {...rest}
      autoplay={autoplay}
      makeMethodMessage={makeMethodMessage}
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
 * id is either a Brightcove-assigned id, or a customer-generated
 * reference id. Reference ids are prefixed 'ref:' and the colon
 * must be preserved unencoded.
 * @param {string} id
 * @return {string}
 */
function encodeId(id) {
  /*  */
  if (id.substring(0, 4) === 'ref:') {
    return `ref:${encodeURIComponent(id.substring(4))}`;
  }
  return encodeURIComponent(id);
}

/**
 * @param {string} method
 * @param {*=} arg
 * @return {string}
 */
function makeMessage(method, arg) {
  switch (method) {
    case 'showControls':
    case 'mute':
      arg = true;
      break;
    case 'hideControls':
    case 'unmute':
      arg = false;
      break;
    case 'play':
    // TODO(wg-bento): Pass isAutoplay?
    default:
      break;
  }
  // TODO(wg-bento): Pass targetOrigin 'https://players.brightcove.net'?
  return JSON.stringify({
    'command': methods[method] ?? method,
    'args': arg,
  });
}

/**
 * Verify required props and throw error if necessary.
 * @param {string|undefined} account
 * @return {boolean} true on valid
 */
function checkProps(account) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  if (!account) {
    displayWarning('account is required for <Brightcove>');
    return false;
  }
  return true;
}

/**
 * @param {?string} message
 */
function displayWarning(message) {
  console /*OK*/
    .warn(message);
}
