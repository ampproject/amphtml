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
import {useEffect} from '#preact';

const NOOP = () => {};

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
  sandbox,
  src,
  srcdoc,
  ...rest
}) {
  const ref = Preact.useRef();

  useEffect(() => {
    const iframe = ref.current;
    let data;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        return;
      }
      if (data?.height) {
        iframe.height = Number(data.height);
      }
      if (data?.width) {
        iframe.width = Number(data.width);
      }
    });

    const handleEmbedSizePostMessage = (event) => {
      if (event.data?.type !== 'embed-size') {
        return;
      }
      data = event.data;
      io.observe(iframe);
    };

    window.addEventListener('message', handleEmbedSizePostMessage);

    return () => {
      io.unobserve(iframe);
      window.removeEventListener('message', handleEmbedSizePostMessage);
    };
  });

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
