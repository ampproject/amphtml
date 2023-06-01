import {VideoIframe} from '#bento/components/bento-video/1.0/video-iframe';

import {dispatchCustomEvent} from '#core/dom';

import * as Preact from '#preact';
import {useRef} from '#preact';
import {forwardRef} from '#preact/compat';

import {mutedOrUnmutedEvent, objOrParseJson} from '../../../../iframe-video';
import {addParamsToUrl} from '../../../../url';
import {VideoEvents_Enum} from '../../../../video-interface';

// Correct PlayerStates taken from
// https://developers.google.com/youtube/iframe_api_reference#Playback_status
/**
 * @enum {string}
 * @private
 */
const PlayerStates = {
  '-1': 'unstarted',
  '0': 'ended',
  '1': 'playing',
  '2': 'pause',
  '3': 'buffering',
  '5': 'video_cued',
};

/**
 * @enum {string}
 * @private
 */
const methods = {
  'play': 'playVideo',
  'pause': 'pauseVideo',
  'mute': 'mute',
  'unmute': 'unMute',
};

/**
 * @enum {number}
 * @private
 */
const PlayerFlags = {
  // Config to tell YouTube to hide annotations by default
  HIDE_ANNOTATION: 3,
};

/** @const {!../../../src/core/dom.CustomEventOptionsDef} */
const VIDEO_EVENT_OPTIONS = {bubbles: false, cancelable: false};

/**
 * Created once per component mount.
 * The fields returned can be overridden by `infoDelivery` messages.
 * @return {!JsonObject}
 */
function createDefaultInfo() {
  return {
    'currentTime': 0,
    'duration': NaN,
  };
}

/**
 * @param {!YoutubeProps} props
 * @param {{current: ?T}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function BentoYoutubeWithRef(
  {
    autoplay,
    credentials,
    liveChannelid,
    loop,
    onLoad,
    params = {},
    videoid,
    ...rest
  },
  ref
) {
  const datasourceExists =
    !(videoid && liveChannelid) && (videoid || liveChannelid);

  if (!datasourceExists) {
    throw new Error(
      'Exactly one of data-videoid or data-live-channelid should be present for <amp-youtube>'
    );
  }

  let src = getEmbedUrl(credentials, videoid, liveChannelid);
  if (!('playsinline' in params)) {
    params['playsinline'] = '1';
  }
  if ('autoplay' in params) {
    delete params['autoplay'];
    autoplay = true;
  }

  if (autoplay) {
    if (!('iv_load_policy' in params)) {
      params['iv_load_policy'] = `${PlayerFlags.HIDE_ANNOTATION}`;
    }

    // Inline play must be set for autoplay regardless of original value.
    params['playsinline'] = '1';
  }

  if ('loop' in params) {
    loop = true;
    delete params['loop'];
  }

  if (loop) {
    if ('playlist' in params) {
      params['loop'] = '1';
    } else if ('loop' in params) {
      delete params['loop'];
    }
  }

  src = addParamsToUrl(src, params);

  // Player state. Includes `currentTime` and `duration`.
  const playerStateRef = useRef();
  if (!playerStateRef.current) {
    playerStateRef.current = createDefaultInfo();
  }

  const onMessage = ({currentTarget, data}) => {
    const parsedData = objOrParseJson(data);
    if (!parsedData) {
      return;
    }

    const {'event': event, 'info': parsedInfo} = parsedData;

    if (event == 'initialDelivery') {
      dispatchVideoEvent(currentTarget, VideoEvents_Enum.LOADEDMETADATA);
      onLoad?.();
      return;
    }

    if (!parsedInfo) {
      return;
    }

    const info = playerStateRef.current;
    for (const key in info) {
      if (parsedInfo[key] != null) {
        info[key] = parsedInfo[key];
      }
    }

    const playerState = parsedInfo['playerState'];
    if (event == 'infoDelivery' && playerState == 0 && loop) {
      currentTarget.contentWindow./*OK*/ postMessage(
        JSON.stringify({
          'event': 'command',
          'func': 'playVideo',
        }),
        '*'
      );
    }
    if (event == 'infoDelivery' && playerState != undefined) {
      dispatchVideoEvent(currentTarget, PlayerStates[playerState.toString()]);
    }
    if (event == 'infoDelivery' && parsedInfo['muted']) {
      dispatchVideoEvent(
        currentTarget,
        mutedOrUnmutedEvent(parsedInfo['muted'])
      );
      return;
    }
  };

  return (
    <VideoIframe
      ref={ref}
      {...rest}
      autoplay={autoplay}
      src={src}
      onMessage={onMessage}
      makeMethodMessage={makeMethodMessage}
      onIframeLoad={(event) => {
        const {currentTarget} = event;
        dispatchVideoEvent(currentTarget, 'canplay');
        currentTarget.contentWindow./*OK*/ postMessage(
          JSON.stringify({
            'event': 'listening',
          }),
          '*'
        );
      }}
      sandbox="allow-scripts allow-same-origin allow-presentation"
      playerStateRef={playerStateRef}
    />
  );
}

/**
 * @param {string} credentials
 * @param {string} videoid
 * @param {string} liveChannelid
 * @return {string}
 * @private
 */
function getEmbedUrl(credentials, videoid, liveChannelid) {
  let urlSuffix = '';
  if (credentials === 'omit') {
    urlSuffix = '-nocookie';
  }
  const baseUrl = `https://www.youtube${urlSuffix}.com/embed/`;
  let descriptor = '';
  if (videoid) {
    descriptor = `${encodeURIComponent(videoid)}?`;
  } else {
    descriptor = `live_stream?channel=${encodeURIComponent(
      liveChannelid || ''
    )}&`;
  }
  return `${baseUrl}${descriptor}enablejsapi=1&amp=1`;
}

/**
 * @param {!HTMLIFrameElement} currentTarget
 * @param {string} name
 */
function dispatchVideoEvent(currentTarget, name) {
  dispatchCustomEvent(currentTarget, name, null, VIDEO_EVENT_OPTIONS);
}

/**
 * @param {string} method
 * @return {!Object|string}
 */
function makeMethodMessage(method) {
  return JSON.stringify({
    'event': 'command',
    'func': methods[method],
  });
}

const BentoYoutube = forwardRef(BentoYoutubeWithRef);
BentoYoutube.displayName = 'BentoYoutube'; // Make findable for tests.
export {BentoYoutube};
