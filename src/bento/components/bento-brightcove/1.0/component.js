import {
  BRIGHTCOVE_EVENTS,
  getBrightcoveIframeSrc,
} from '#bento/apis/brightcove-api';
import {VideoIframe} from '#bento/components/bento-video/1.0/video-iframe';

import {dispatchCustomEvent} from '#core/dom';

import * as Preact from '#preact';
import {useCallback, useMemo, useRef, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {useValueRef} from '#preact/component';

import {mutedOrUnmutedEvent} from '../../../../iframe-video';

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
function BentoBrightcoveWithRef(props, ref) {
  const {
    account,
    autoplay,
    embed = DEFAULT,
    muted: mutedProp,
    onLoad,
    onPlayingState,
    player = DEFAULT,
    playlistId,
    referrer,
    urlParams,
    videoId,
    ...rest
  } = props;

  const playerStateRef = useRef({});
  const onLoadRef = useValueRef(onLoad);
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
          onLoadRef.current?.();
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
    [muted, onPlayingState, onLoadRef]
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

const BentoBrightcove = forwardRef(BentoBrightcoveWithRef);
BentoBrightcove.displayName = 'BentoBrightcove'; // Make findable for tests.
export {BentoBrightcove};
