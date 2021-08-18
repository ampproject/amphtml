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
import {useCallback, useEffect, useRef} from '#preact';
import {MessageType} from '#preact/component/3p-frame';
import {toWin} from '#core/window';

const NOOP = () => {};
const FULL_HEIGHT = '100%';

/**
 * @param {!IframeDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Iframe({
  allowFullScreen,
  allowPaymentRequest,
  allowTransparency,
  onLoad = NOOP,
  referrerPolicy,
  requestResize,
  sandbox,
  src,
  srcdoc,
  ...rest
}) {
  const ref = useRef();
  const dataRef = useRef(null);
  const isIntersectingRef = useRef(false);

  const handlePostMessage = useCallback(
    (event) => {
      // Currently we're only handling `embed-size` post messages
      if (event.data?.type !== MessageType.EMBED_SIZE) {
        return;
      }
      dataRef.current = event.data;
      attemptResize();
    },
    [attemptResize]
  );

  const attemptResize = useCallback(() => {
    const iframe = ref.current;
    if (!iframe) {
      return;
    }
    const height = Number(dataRef.current.height);
    const width = Number(dataRef.current.width);
    if (!height && !width) {
      return;
    }
    if (requestResize) {
      requestResize(height, width);
      iframe.height = FULL_HEIGHT;
      iframe.width = FULL_HEIGHT;
    } else if (!isIntersectingRef.current) {
      if (width) {
        iframe.width = width;
      }
      if (height) {
        iframe.height = height;
      }
    }
  }, [requestResize]);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) {
      return;
    }
    const win = iframe && toWin(iframe.ownerDocument.defaultView);
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

  return (
    <iframe
      ref={ref}
      src={src}
      srcdoc={srcdoc}
      sandbox={sandbox}
      allowfullscreen={allowFullScreen}
      allowpaymentrequest={allowPaymentRequest}
      allowtransparency={allowTransparency}
      referrerpolicy={referrerPolicy}
      onload={onLoad}
      frameBorder={0}
      {...rest}
    ></iframe>
  );
}
