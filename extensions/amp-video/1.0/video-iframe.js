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
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from '../../../src/preact';

const defaultSandbox = [
  'allow-scripts',
  'allow-same-origin',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-top-navigation-by-user-activation',
].join(' ');

/**
 * Goes inside a VideoWrapper.
 *
 *    import {VideoIframe} from '.../video-iframe';
 *    import {VideoWrapper} from '.../video-wrapper';
 *    render(<VideoWrapper component={VideoIframe} ... />)
 *
 * Usable on the AMP layer through VideoBaseElement.
 * @param {!VideoIframeDef.Props} props
 * @param {{current: (T|null)}} ref
 * @return {PreactDef.Renderable}
 */
function VideoIframeWithRef(
  {
    sandbox = defaultSandbox,
    muted = false,
    controls = false,
    onCanPlay,
    onMessage,
    sendMessage,
    ...rest
  },
  ref
) {
  const iframeRef = useRef(null);

  const readyDeferred = useMemo(() => new Deferred(), []);

  const postMessage = useCallback(
    (message) => {
      if (!iframeRef.current || !iframeRef.current.contentWindow) {
        return;
      }
      readyDeferred.promise.then(() => {
        const transformed = sendMessage(message);
        iframeRef.current.contentWindow./*OK*/ postMessage(
          typeof transformed == 'string'
            ? transformed
            : JSON.stringify(transformed),
          '*'
        );
      });
    },
    [readyDeferred.promise, sendMessage]
  );

  useImperativeHandle(
    ref,
    () => {
      return {
        play: () => postMessage('play'),
        pause: () => postMessage('pause'),
      };
    },
    [postMessage]
  );

  useLayoutEffect(() => {
    if (!onMessage) {
      return;
    }

    /** @param {Event} event */
    function handleMessage(event) {
      if (
        // handle origin?
        // event.origin != 'https://www.instagram.com' ||
        event.source != iframeRef.current.contentWindow
      ) {
        return;
      }

      // Triggers like an HTMLMediaElement, so we give it an iframe handle
      // to dispatch events from. They're caught from being set on {...rest} so
      // setting onPlay, etc. props should just work.
      onMessage({
        data: event.data,
        currentTarget: iframeRef.current,
      });
    }

    const {defaultView} = iframeRef.current.ownerDocument;

    defaultView.addEventListener('message', handleMessage);

    return () => defaultView.removeEventListener('message', handleMessage);
  }, [onMessage]);

  useLayoutEffect(() => {
    if (muted) {
      postMessage('mute');
    } else {
      postMessage('unmute');
    }
  }, [muted, postMessage]);

  useLayoutEffect(() => {
    if (controls) {
      postMessage('showControls');
    } else {
      postMessage('hideControls');
    }
  }, [controls, postMessage]);

  return (
    <iframe
      {...rest}
      ref={iframeRef}
      allowfullscreen
      frameborder="0"
      sandbox={sandbox}
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
