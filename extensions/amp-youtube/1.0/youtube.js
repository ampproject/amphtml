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
import {VideoEvents} from '../../../src/video-interface';
import {VideoIframe} from '../../amp-video/1.0/video-iframe';
import {addParamsToUrl} from '../../../src/url';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {mutedOrUnmutedEvent, objOrParseJson} from '../../../src/iframe-video';

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
  '2': 'paused',
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

/**
 * @param {!YoutubeProps} props
 * @return {PreactDef.Renderable}
 */
export function Youtube({
  autoplay,
  loop,
  videoid,
  liveChannelid,
  params = {},
  credentials,
  style,
  ...rest
}) {
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

  const onMessage = ({data, currentTarget}) => {
    data = objOrParseJson(data);
    if (data == null) {
      return;
    }
    if (data.event == 'initialDelivery') {
      dispatchCustomEvent(currentTarget, VideoEvents.LOADEDMETADATA);
      return;
    }
    const {info} = data;
    if (info == undefined) {
      return;
    }
    const playerState = info['playerState'];
    if (data.event == 'infoDelivery' && playerState == 0 && loop) {
      currentTarget.contentWindow./*OK*/ postMessage(
        JSON.stringify(
          dict({
            'event': 'command',
            'func': 'playVideo',
          })
        ),
        '*'
      );
    }
    if (data.event == 'infoDelivery' && playerState != undefined) {
      dispatchCustomEvent(currentTarget, PlayerStates[playerState.toString()]);
    }
    if (data.event == 'infoDelivery' && info['muted']) {
      dispatchCustomEvent(currentTarget, mutedOrUnmutedEvent(info['muted']));
      return;
    }
  };

  const makeMethodMessage = (method) => {
    return JSON.stringify(
      dict({
        'event': 'command',
        'func': methods[method],
      })
    );
  };

  return (
    <VideoIframe
      autoplay={autoplay}
      src={src}
      style={style}
      onMessage={onMessage}
      makeMethodMessage={makeMethodMessage}
      onLoad={(event) => {
        const {currentTarget} = event;
        dispatchCustomEvent(currentTarget, 'canplay');
        currentTarget.contentWindow./*OK*/ postMessage(
          JSON.stringify(
            dict({
              'event': 'listening',
            })
          ),
          '*'
        );
        dispatchCustomEvent(currentTarget, VideoEvents.LOAD);
      }}
      sandbox="allow-scripts allow-same-origin allow-presentation"
      {...rest}
    ></VideoIframe>
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
 * Dispatches a custom event.
 *
 * @param {HTMLIFrameElement} currentTarget
 * @param {string} name
 * @param {!Object=} opt_data Event data.
 * @final
 */
function dispatchCustomEvent(currentTarget, name, opt_data) {
  const {ownerDocument} = currentTarget;
  const win = ownerDocument.defaultView || ownerDocument.parentWindow;
  const event = createCustomEvent(win, name, opt_data, {
    bubbles: true,
    cancelable: true,
  });
  currentTarget.dispatchEvent(event);
}
