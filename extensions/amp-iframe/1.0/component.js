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
import {useCallback, useEffect, useMemo, useRef} from '#preact';
import {MessageType} from '#core/3p-frame-messaging';
import {toWin} from '#core/window';
import {ContainWrapper} from '#preact/component';
import {setStyle} from '#core/dom/style';

const NOOP = () => {};

/**
 * @param {!IframeDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Iframe({
  allowFullScreen,
  allowPaymentRequest,
  allowTransparency,
  iframeStyle,
  onLoad = NOOP,
  referrerPolicy,
  requestResize,
  sandbox,
  src,
  srcdoc,
  ...rest
}) {
  const iframeRef = useRef();
  const dataRef = useRef(null);
  const isIntersectingRef = useRef(null);
  const containerRef = useRef(null);

  const updateContainerSize = (height, width) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    setStyle(container, 'width', width, 'px');
    setStyle(container, 'height', height, 'px');
  };

  const attemptResize = useCallback(() => {
    const iframe = iframeRef.current;
    let height = Number(dataRef.current.height);
    let width = Number(dataRef.current.width);
    if (!height && !width) {
      console./*OK*/ error(
        'Ignoring resize request because width and height value is invalid'
      );
      return;
    }
    // TODO(dmanek): Calculate width and height of the container to include padding.
    if (!height) {
      height = iframe./*OK*/ offsetHeight;
    }
    if (!width) {
      width = iframe./*OK*/ offsetWidth;
    }
    if (requestResize) {
      // Currently `requestResize` is called twice when:
      // 1. post message is received in viewport
      // 2. exiting viewport
      // This could be optimized by reducing to one call.
      requestResize(height, width);
    } else if (isIntersectingRef.current === false) {
      // attemptResize can be called before the IntersectionObserver starts observing
      // the component if an event is fired immediately. Therefore we check
      // isIntersectingRef has changed via isIntersectingRef.current === false.
      updateContainerSize(height, width);
    }
  }, [requestResize]);

  const handlePostMessage = useCallback(
    (event) => {
      if (event.data?.type !== MessageType.EMBED_SIZE) {
        return;
      }
      dataRef.current = event.data;
      attemptResize();
    },
    [attemptResize]
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    const win = toWin(iframe.ownerDocument.defaultView);
    if (!win) {
      return;
    }
    const io = new win.IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      isIntersectingRef.current = last.isIntersecting;
      if (last.isIntersecting || !dataRef.current || !win) {
        return;
      }
      attemptResize();
    });
    io.observe(iframe);
    win.addEventListener('message', handlePostMessage);

    return () => {
      io.unobserve(iframe);
      win.removeEventListener('message', handlePostMessage);
    };
  }, [attemptResize, handlePostMessage]);

  const contentProps = useMemo(
    () => ({
      src,
      srcdoc,
      sandbox,
      allowFullScreen,
      allowPaymentRequest,
      allowTransparency,
      referrerPolicy,
      onLoad,
      frameBorder: '0',
    }),
    [
      src,
      srcdoc,
      sandbox,
      allowFullScreen,
      allowPaymentRequest,
      allowTransparency,
      referrerPolicy,
      onLoad,
    ]
  );

  return (
    <ContainWrapper
      contentAs="iframe"
      contentProps={contentProps}
      contentRef={iframeRef}
      contentStyle={{'box-sizing': 'border-box', ...iframeStyle}}
      ref={containerRef}
      size
      layout
      paint
      {...rest}
    />
  );
}
