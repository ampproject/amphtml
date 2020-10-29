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
import {Deferred} from '../../../src/utils/promise';
import {forwardRef} from '../../../src/preact/compat';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from '../../../src/preact';

const DEFAULT_SANDBOX = [
  'allow-scripts',
  'allow-same-origin',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-top-navigation-by-user-activation',
].join(' ');

/**
 * @param {T} prop
 * @return {current: ?T}
 * @template T
 */
function usePropRef(prop) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = prop;
  }, [prop]);
  return ref;
}

/**
 * Goes inside a VideoWrapper.
 *
 *    import {VideoIframe} from '.../video-iframe';
 *    import {VideoWrapper} from '.../video-wrapper';
 *    render(<VideoWrapper component={VideoIframe} ... />)
 *
 * Usable on the AMP layer through VideoBaseElement.
 *
 * @param {!VideoIframeDef.Props} props
 * @param {{current: (T|null)}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
function VideoIframeWithRef(
  {
    loading = 'lazy',
    sandbox = DEFAULT_SANDBOX,
    muted = false,
    controls = false,
    origin,
    onCanPlay,
    onMessage,
    makeMethodMessage,
    ...rest
  },
  ref
) {
  const iframeRef = useRef(null);

  const readyDeferred = useMemo(() => new Deferred(), []);

  const postMethodMessage = useCallback(
    (method) => {
      if (!iframeRef.current || !iframeRef.current.contentWindow) {
        return;
      }
      readyDeferred.promise.then(() => {
        const message = makeMethodMessage(method);
        iframeRef.current.contentWindow./*OK*/ postMessage(message, '*');
      });
    },
    [readyDeferred.promise, makeMethodMessage]
  );

  useImperativeHandle(
    ref,
    () => ({
      play: () => postMethodMessage('play'),
      pause: () => postMethodMessage('pause'),
    }),
    [postMethodMessage]
  );

  // Keep `onMessage` in a ref to prevent re-listening on every render.
  // This could otherwise occur when the passed `onMessage` is not memoized.
  const onMessageRef = usePropRef(onMessage);

  useLayoutEffect(() => {
    /** @param {Event} event */
    function handleMessage(event) {
      if (!onMessageRef.current) {
        return;
      }

      if (
        (origin && !origin.test(event.origin)) ||
        event.source != iframeRef.current.contentWindow
      ) {
        return;
      }

      // Triggers like an HTMLMediaElement, so we give it an iframe handle
      // to dispatch events from. They're caught from being set on {...rest} so
      // setting onPlay, etc. props should just work.
      onMessageRef.current({
        // Event
        currentTarget: iframeRef.current,
        target: iframeRef.current,

        // MessageEvent
        data: event.data,
      });
    }

    const {defaultView} = iframeRef.current.ownerDocument;
    defaultView.addEventListener('message', handleMessage);
    return () => defaultView.removeEventListener('message', handleMessage);
  }, [origin, onMessageRef]);

  useLayoutEffect(() => {
    postMethodMessage(muted ? 'mute' : 'unmute');
  }, [muted, postMethodMessage]);

  useLayoutEffect(() => {
    postMethodMessage(controls ? 'showControls' : 'hideControls');
  }, [controls, postMethodMessage]);

  return (
    <iframe
      {...rest}
      ref={iframeRef}
      allowfullscreen
      frameborder="0"
      sandbox={sandbox}
      loading={loading}
      onCanPlay={() => {
        if (onCanPlay) {
          readyDeferred.promise.then(onCanPlay);
        }
        readyDeferred.resolve();
      }}
    />
  );
}

const VideoIframe = forwardRef(VideoIframeWithRef);
VideoIframe.displayName = 'VideoIframe'; // Make findable for tests.
export {VideoIframe};
