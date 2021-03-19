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
import {IframeEmbed} from './iframe';
import {deserializeMessage} from '../../3p-frame-messaging';
import {dict} from '../../utils/object';
import {
  generateSentinel,
  getBootstrapUrl,
  getDefaultBootstrapBaseUrl,
} from '../../3p-frame';
import {
  getOptionalSandboxFlags,
  getRequiredSandboxFlags,
} from '../../core/3p-frame';
import {parseUrlDeprecated} from '../../url';
import {sequentialIdGenerator} from '../../utils/id-generator';
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';

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
 * @param {!IframeDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function ProxyIframeEmbed({
  name: nameProp,
  options = {},
  sandbox = DEFAULT_SANDBOX,
  src: srcProp,
  type,
  title = type,
  ...rest
}) {
  const ref = useRef(null);
  const contentRef = useRef(null);
  if (!countGenerators[type]) {
    countGenerators[type] = sequentialIdGenerator();
  }
  const [count] = useState(countGenerators[type]);
  const [name, setName] = useState(nameProp);
  const src = useRef(null);
  const win = contentRef.current?.ownerDocument?.defaultView;
  src.current = srcProp ?? (win ? getDefaultBootstrapBaseUrl(win) : null);

  useLayoutEffect(() => {
    const win = contentRef.current?.ownerDocument?.defaultView;
    if (!win) {
      return;
    }
    if (nameProp) {
      setName(nameProp);
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
          'host': parseUrlDeprecated(src.current).hostname,
          'bootstrap': getBootstrapUrl(),
          'type': type,
          // https://github.com/ampproject/amphtml/pull/2955
          'count': count,
          'attributes': attrs,
        })
      )
    );
  }, [count, nameProp, options, title, type]);

  const manageMessageHandler = useCallback((ref, onSuccess) => {
    const iframe = ref.current;
    if (!iframe) {
      return;
    }
    const messageHandler = (event) => {
      const iframe = ref.current;
      if (!iframe || event.source != iframe.contentWindow || !event.data) {
        return;
      }

      const data = deserializeMessage(event.data);
      if (data['type'] == MessageType.EMBED_SIZE) {
        const height = data['height'];
        onSuccess(height);
      }
    };
    const {defaultView} = iframe.ownerDocument;
    defaultView.addEventListener('message', messageHandler);
    return () => defaultView.removeEventListener('message', messageHandler);
  }, []);

  return (
    <IframeEmbed
      allow={BLOCK_SYNC_XHR}
      contentRef={contentRef}
      manageMessageHandler={manageMessageHandler}
      name={name}
      ref={ref}
      ready={!!name}
      sandbox={sandbox}
      src={src.current}
      title={title}
      {...rest}
    />
  );
}
