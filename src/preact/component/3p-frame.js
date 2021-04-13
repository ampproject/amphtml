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
import {dict} from '../../utils/object';
import {forwardRef} from '../compat';
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
import {useLayoutEffect, useMemo, useRef, useState} from '../../../src/preact';

/** @type {!Object<string,function>} 3p frames for that type. */
export const countGenerators = {};

/** @enum {string} */
export const MessageType = {
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
 * @param {!IframeEmbedDef.Props} props
 * @param {{current: (!IframeEmbedDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
function ProxyIframeEmbedWithRef(
  {
    name: nameProp,
    messageHandler,
    sandbox = DEFAULT_SANDBOX,
    src: srcProp,
    type,
    title = type,
    ...rest
  },
  ref
) {
  const contentRef = useRef(null);
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
    setNameAndSrc({
      name: JSON.stringify(
        dict({
          'host': parseUrlDeprecated(src).hostname,
          'bootstrap': getBootstrapUrl(type, win),
          'type': type,
          // "name" must be unique across iframes, so we add a count.
          // See: https://github.com/ampproject/amphtml/pull/2955
          'count': count,
          'attributes': attrs,
        })
      ),
      src,
    });
  }, [count, nameProp, srcProp, title, type]);

  return (
    <IframeEmbed
      allow={BLOCK_SYNC_XHR}
      contentRef={contentRef}
      messageHandler={messageHandler}
      name={name}
      ref={ref}
      ready={!!name}
      sandbox={sandbox}
      src={src}
      title={title}
      {...rest}
    />
  );
}

const ProxyIframeEmbed = forwardRef(ProxyIframeEmbedWithRef);
ProxyIframeEmbed.displayName = 'ProxyIframeEmbed'; // Make findable for tests.
export {ProxyIframeEmbed};
