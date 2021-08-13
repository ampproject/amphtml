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
import {useEffect, useRef} from '#preact';
import {MessageType} from '#preact/component/3p-frame';

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
  onLoadCallback = NOOP,
  referrerPolicy,
  requestResize,
  sandbox,
  src,
  srcdoc,
  ...rest
}) {
  const ref = useRef();

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) {
      return;
    }
    let data;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || !data) {
        return;
      }

      if (requestResize) {
        requestResize(data.width, data.height);
        iframe.height = FULL_HEIGHT;
        iframe.width = FULL_HEIGHT;
      } else {
        if (data.width) {
          iframe.width = data.width;
        }
        if (data.height) {
          iframe.height = data.height;
        }
      }
    });

    const handlePostMessage = (event) => {
      // Currently we're only handling `embed-size` post messages
      if (event.data?.type !== MessageType.EMBED_SIZE) {
        return;
      }
      data = event.data;
      io.observe(iframe);
    };

    window.addEventListener('message', handlePostMessage);

    return () => {
      io.unobserve(iframe);
      window.removeEventListener('message', handlePostMessage);
    };
  }, [requestResize]);

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
      onload={onLoadCallback}
      {...rest}
    ></iframe>
  );
}
