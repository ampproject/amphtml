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

import * as Preact from '../../../src/preact';
import {
  VIMEO_EVENTS,
  getVimeoIframeSrc,
  getVimeoOriginRegExp,
  listenToVimeoEvents,
  makeVimeoMessage,
} from '../vimeo-api';
import {VideoIframe} from '../../amp-video/1.0/video-iframe';
import {dispatchCustomEvent} from '../../../src/dom';
import {forwardRef} from '../../../src/preact/compat';
import {
  objOrParseJson,
  postMessageWhenAvailable,
} from '../../../src/iframe-video';
import {useCallback, useMemo, useRef} from '../../../src/preact';

/**
 * @param {!HTMLIframeElement} iframe
 * @param {string} type
 */
function dispatchEvent(iframe, type) {
  dispatchCustomEvent(iframe, type, null, {
    bubbles: true,
    cancelable: false,
  });
}

/**
 * @param {string} method
 * @return {string}
 */
function makeMethodMessage(method) {
  if (method === 'mute') {
    return makeVimeoMessage('setVolume', '0');
  }
  if (method === 'unmute') {
    return makeVimeoMessage('setVolume', '1');
  }
  return makeVimeoMessage(method);
}

/**
 * @param {!VimeoDef.Props} props
 * @param {{current: (T|null)}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
export function VimeoWithRef(
  {videoid, autoplay = false, doNotTrack = false, ...rest},
  ref
) {
  const origin = useMemo(getVimeoOriginRegExp, []);
  const src = useMemo(() => getVimeoIframeSrc(videoid, autoplay, doNotTrack), [
    videoid,
    doNotTrack,
    autoplay,
  ]);

  const readyIframeRef = useRef(null);
  const onReadyMessage = useCallback((iframe) => {
    if (readyIframeRef.current === iframe) {
      return;
    }
    readyIframeRef.current = iframe;
    dispatchEvent(iframe, 'canplay');
    listenToVimeoEvents(iframe);
  }, []);

  const onMessage = useCallback(
    (e) => {
      const {currentTarget} = e;
      const data = objOrParseJson(e.data);
      if (!data) {
        return;
      }
      const event = data['event'];
      if (event == 'ready' || data['method'] == 'ping') {
        onReadyMessage(currentTarget);
        return;
      }
      if (VIMEO_EVENTS[event]) {
        dispatchEvent(currentTarget, VIMEO_EVENTS[event]);
        return;
      }
    },
    [onReadyMessage]
  );

  const onIframeLoad = useCallback((e) => {
    postMessageWhenAvailable(e.currentTarget, makeVimeoMessage('ping'));
  }, []);

  return (
    <VideoIframe
      ref={ref}
      {...rest}
      origin={origin}
      autoplay={autoplay}
      src={src}
      onMessage={onMessage}
      makeMethodMessage={makeMethodMessage}
      onIframeLoad={onIframeLoad}
      // Vimeo API does not have a way to hide controls, so they're always set
      controls
    />
  );
}

const Vimeo = forwardRef(VimeoWithRef);
Vimeo.displayName = 'Vimeo'; // Make findable for tests.
export {Vimeo};
