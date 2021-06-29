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
import {IframeEmbed} from './iframe';
import {dict} from '#core/types/object';
import {forwardRef} from '#preact/compat';
import {
  generateSentinel,
  getBootstrapUrl,
  getDefaultBootstrapBaseUrl,
} from '../../3p-frame';
import {getOptionalSandboxFlags, getRequiredSandboxFlags} from '#core/3p-frame';
import {includes} from '#core/types/string';
import {parseUrlDeprecated} from '../../url';
import {sequentialIdGenerator} from '#core/data-structures/id-generator';
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';

/** @type {!Object<string,function():void>} 3p frames for that type. */
export const countGenerators = {};

/** @enum {string} */
export const MessageType = {
  // TODO(wg-bento): Add more types as they become needed.
  EMBED_SIZE: 'embed-size',
};

// Block synchronous XHR in ad. These are very rare, but super bad for UX
// as they block the UI thread for the arbitrary amount of time until the
// request completes.
const BLOCK_SYNC_XHR = "sync-xhr 'none'";

// TODO(wg-bento): UA check for required flags without iframe element
const DEFAULT_SANDBOX =
  getRequiredSandboxFlags().join(' ') +
  ' ' +
  getOptionalSandboxFlags().join(' ');

/**
 * Creates the iframe for the embed. Applies correct size and passes the embed
 * attributes to the frame via JSON inside the fragment.
 * @param {!IframeEmbedDef.Props} props
 * @param {{current: (!IframeEmbedDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
function ProxyIframeEmbedWithRef(
  {
    allow = BLOCK_SYNC_XHR,
    bootstrap,
    contextOptions,
    excludeSandbox,
    name: nameProp,
    messageHandler,
    options,
    sandbox = DEFAULT_SANDBOX,
    src: srcProp,
    type,
    title = type,
    ...rest
  },
  ref
) {
  if (!includes(allow, BLOCK_SYNC_XHR)) {
    throw new Error(
      `'allow' prop must contain "${BLOCK_SYNC_XHR}". Found "${allow}".`
    );
  }

  const contentRef = useRef(null);
  const iframeRef = useRef(null);
  const count = useMemo(() => {
    if (!countGenerators[type]) {
      countGenerators[type] = sequentialIdGenerator();
    }
    return countGenerators[type]();
  }, [type]);

  const [{name, src}, setNameAndSrc] = useState({name: nameProp, src: srcProp});
  useLayoutEffect(() => {
    const win = contentRef.current?.ownerDocument?.defaultView;
    const src =
      srcProp ?? (win ? getDefaultBootstrapBaseUrl(win) : 'about:blank');
    if (nameProp) {
      setNameAndSrc({name: nameProp, src});
      return;
    }
    if (!win) {
      return;
    }
    const context = Object.assign(
      dict({
        'location': {
          'href': win.location.href,
        },
        'sentinel': generateSentinel(win),
      }),
      contextOptions
    );
    const attrs = Object.assign(
      dict({
        'title': title,
        'type': type,
        '_context': context,
      }),
      options
    );
    setNameAndSrc({
      name: JSON.stringify(
        dict({
          'host': parseUrlDeprecated(src).hostname,
          'bootstrap': bootstrap ?? getBootstrapUrl(type, win),
          'type': type,
          // "name" must be unique across iframes, so we add a count.
          // See: https://github.com/ampproject/amphtml/pull/2955
          'count': count,
          'attributes': attrs,
        })
      ),
      src,
    });
  }, [
    bootstrap,
    contextOptions,
    count,
    nameProp,
    options,
    srcProp,
    title,
    type,
  ]);

  useEffect(() => {
    const iframe = iframeRef.current?.node;
    if (!iframe) {
      return;
    }
    const parent = iframe.parentNode;
    parent.insertBefore(iframe, iframe.nextSibling);
  }, [name]);

  // Component API: IframeEmbedDef.Api.
  useImperativeHandle(
    ref,
    () => ({
      // Standard Bento
      get readyState() {
        return iframeRef.current?.readyState;
      },
      get node() {
        return iframeRef.current?.node;
      },
    }),
    []
  );

  return (
    <IframeEmbed
      allow={allow}
      contentRef={contentRef}
      messageHandler={messageHandler}
      name={name}
      ref={iframeRef}
      ready={!!name}
      sandbox={excludeSandbox ? undefined : sandbox}
      src={src}
      title={title}
      {...rest}
    />
  );
}

const ProxyIframeEmbed = forwardRef(ProxyIframeEmbedWithRef);
ProxyIframeEmbed.displayName = 'ProxyIframeEmbed'; // Make findable for tests.
export {ProxyIframeEmbed};
