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

import * as Preact from '..';
import {ContainWrapper} from './contain';
import {
  getOptionalSandboxFlags,
  getRequiredSandboxFlags,
} from '../../core/3p-frame';
import {useEffect, useLayoutEffect, useRef, useState} from '..';

/** @type {!Object<string,number>} Number of 3p frames for that type. */
export const count = {};

/** @enum {string} */
const MessageType = {
  // TODO(wg-bento): Add more types as they become needed.
  EMBED_SIZE: 'embed-size',
};

// Block synchronous XHR in ad. These are very rare, but super bad for UX
// as they block the UI thread for the arbitrary amount of time until the
// request completes.
const BLOCK_SYNC_XHR = "sync-xhr 'none';";

/**
 * @param {*} message
 * @return {*}
 */
const DEFAULT_DESERIALIZE_MESSAGE = (message) => message;

// TODO(wg-bento): UA check for required flags without iframe element
const DEFAULT_SANDBOX =
  getRequiredSandboxFlags().join(' ') +
  ' ' +
  getOptionalSandboxFlags().join(' ');

/**
 * Creates the iframe for the embed. Applies correct size and passes the embed
 * attributes to the frame via JSON inside the fragment.
 * @param {!IframeProps} props
 * @return {PreactDef.Renderable}
 */
export function IframeEmbed({
  deserializeMessage = DEFAULT_DESERIALIZE_MESSAGE,
  name,
  onRegisterIframe,
  requestResize,
  sandbox = DEFAULT_SANDBOX,
  src,
  title,
  type,
  ...rest
}) {
  const ref = useRef(null);
  const [heightStyle, setHeightStyle] = useState(null);
  // TODO: loading/mount/pause similar to Instagram.

  useEffect(() => {
    if (!count[type]) {
      count[type] = 0;
    }
    count[type] += 1;
    if (onRegisterIframe) {
      onRegisterIframe(count[type]);
    }
    return () => (count[type] -= 1);
  }, [type, onRegisterIframe]);

  useLayoutEffect(() => {
    const iframe = ref.current;
    if (!iframe) {
      return;
    }
    const messageHandler = (event) => {
      if (event.source != iframe.contentWindow || !event.data) {
        return;
      }

      const data = deserializeMessage(event.data);
      if (data['type'] == MessageType.EMBED_SIZE) {
        const height = data['height'];
        if (requestResize) {
          requestResize(height);
        }
        setHeightStyle(height);
      }
    };
    const {defaultView} = iframe.ownerDocument;
    defaultView.addEventListener('message', messageHandler);
    return () => defaultView.removeEventListener('message', messageHandler);
  }, [deserializeMessage, requestResize]);

  return (
    <ContainWrapper layout size paint wrapperStyle={heightStyle} {...rest}>
      <iframe
        name={name}
        sandbox={sandbox}
        scrolling="no"
        src={src}
        style={{
          border: 'none',
          contentVisibility: 'auto',
          width: '100%',
          height: '100%',
        }}
        title={title}
        // non-overridable props
        allow={BLOCK_SYNC_XHR}
        part="iframe"
        ref={ref}
      />
    </ContainWrapper>
  );
}
