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
import {forwardRef} from '#preact/compat';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {dispatchCustomEvent} from '#core/dom';
import {
  DailymotionEvents,
  getDailymotionIframeSrc,
  makeDailymotionMessage,
} from '../dailymotion-api';
import {VideoIframe} from '../../amp-video/1.0/video-iframe';
import {parseQueryString} from '#core/types/string/url';

/**
 * @param {string} method
 * @return {string}
 */
function makeMethodMessage(method) {
  switch (method) {
    case 'mute':
      return makeDailymotionMessage('muted', [true]);
      break;
    case 'unmute':
      return makeDailymotionMessage('muted', [false]);
      break;
    case 'showControls':
      return makeDailymotionMessage('controls', [true]);
      break;
    case 'hideControls':
      return makeDailymotionMessage('controls', [false]);
      break;

    default:
      makeDailymotionMessage(method);
  }
}

/**
 * @param {!DailymotionDef.Props} props
 * @param ref
 * @return {PreactDef.Renderable}
 */
export function DailymotionWithRef(
  {
    endscreenEnable,
    info,
    mute,
    sharingEnable,
    start,
    uiHighlight,
    uiLog,
    videoId,
    ...rest
  },
  ref
) {
  const src = useMemo(
    () =>
      getDailymotionIframeSrc(
        videoId,
        mute,
        endscreenEnable,
        sharingEnable,
        start,
        uiHighlight,
        uiLog,
        info
      ),
    [
      endscreenEnable,
      info,
      mute,
      sharingEnable,
      start,
      uiHighlight,
      uiLog,
      videoId,
    ]
  );

  const onMessage = ({currentTarget, data}) => {
    const parsedData = parseQueryString(/** @type {string} */ (data));
    console.log(parsedData);
    if (parsedData === undefined) {
      return; // The message isn't valid
    }
    const event = parsedData['event'];
    // console.log(data);
    if (event === DailymotionEvents.API_READY) {
      dispatchCustomEvent(currentTarget, 'canplay');
      return;
    }
    if (DailymotionEvents[event]) {
      dispatchEvent(currentTarget, DailymotionEvents.event);
      return;
    }
  };

  return (
    <VideoIframe
      ref={ref}
      {...rest}
      src={src}
      makeMethodMessage={makeMethodMessage}
      onMessage={onMessage}
    />
  );
}

const Dailymotion = forwardRef(DailymotionWithRef);
Dailymotion.displayName = 'Dailymotion';
export {Dailymotion};
