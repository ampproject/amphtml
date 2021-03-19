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
import {deserializeMessage} from '../../3p-frame-messaging';
import {dict} from '../../utils/object';
import {generateSentinel, getBootstrapUrl} from '../../3p-frame';
import {
  getOptionalSandboxFlags,
  getRequiredSandboxFlags,
} from '../../core/3p-frame';
import {parseUrlDeprecated} from '../../url';
import {sequentialIdGenerator} from '../../utils/id-generator';
import {useEffect, useLayoutEffect, useRef, useState} from '..';

/** @type {!Object<string,function>} 3p frames for that type. */
export const countGenerators = {};

/** @enum {string} */
const MessageType = {
  // TODO(wg-bento): Add more types as they become needed.
  EMBED_SIZE: 'embed-size',
};

// Block synchronous XHR in ad. These are very rare, but super bad for UX
// as they block the UI thread for the arbitrary amount of time until the
// request completes.
const BLOCK_SYNC_XHR = "sync-xhr 'none';";

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
  name: nameProp,
  options = {},
  requestResize,
  sandbox = DEFAULT_SANDBOX,
  src,
  type,
  title = type,
  ...rest
}) {
  const ref = useRef(null);
  const containRef = useRef(null);
  const [heightStyle, setHeightStyle] = useState(null);

  if (!countGenerators[type]) {
    countGenerators[type] = sequentialIdGenerator();
  }
  const [count] = useState(countGenerators[type]);
  // TODO: loading/mount/pause similar to Instagram.

  const [name, setName] = useState(nameProp);
  useEffect(() => {
    if (nameProp) {
      setName(nameProp);
      return;
    }
    const win = containRef.current?.ownerDocument?.defaultView;
    if (!win) {
      return;
    }
    const attrs = dict({
      'title': title,
      'type': type,
      '_context': dict({
        'location': {
          'href': win.location.href,
        },
        'sentinel': generateSentinel(win),
      }),
    });
    for (const key in options) {
      attrs[key] = options[key];
    }
    setName(
      JSON.stringify(
        dict({
          'host': parseUrlDeprecated(src).hostname,
          'bootstrap': getBootstrapUrl(),
          'type': type,
          // https://github.com/ampproject/amphtml/pull/2955
          'count': count,
          'attributes': attrs,
        })
      )
    );
  }, [count, nameProp, options, src, title, type]);

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
  }, [name, requestResize]);

  return (
    <ContainWrapper
      ref={containRef}
      layout
      size
      paint
      wrapperStyle={heightStyle}
      {...rest}
    >
      {name && (
        <iframe
          allow={BLOCK_SYNC_XHR}
          name={name}
          part="iframe"
          ref={ref}
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
        />
      )}
    </ContainWrapper>
  );
}
