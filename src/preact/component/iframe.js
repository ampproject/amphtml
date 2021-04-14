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
import {ContainWrapper, useValueRef} from '../../../src/preact/component';
import {Loading} from '../../../src/core/loading-instructions';
import {ReadyState} from '../../../src/ready-state';
import {forwardRef} from '../../../src/preact/compat';
import {useAmpContext, useLoading} from '../../../src/preact/context';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from '../../../src/preact';

const DEFAULT_MATCHES_MESSAGING_ORIGIN = () => false;
const ABOUT_BLANK = 'about:blank';

/**
 * iframe.src = iframe.src forces an iframe reload,
 * EXCEPT when the iframe.src contains a fragment.
 * With a fragment it just thinks it's a hash change.
 * @param {string} src
 * @return {boolean}
 * */
const canResetSrc = (src) => src && src != ABOUT_BLANK && !src.includes('#');

/**
 * @param {!IframeEmbedDef.Props} props
 * @param {{current: (!IframeEmbedDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
export function IframeEmbedWithRef(
  {
    allow,
    allowFullScreen,
    allowTransparency,
    iframeStyle,
    name,
    title,
    matchesMessagingOrigin = DEFAULT_MATCHES_MESSAGING_ORIGIN,
    messageHandler,
    ready = true,
    loading: loadingProp,
    onReadyState,
    sandbox,
    src,
    ...rest
  },
  ref
) {
  const {playable} = useAmpContext();
  const loading = useLoading(loadingProp);
  const mount = loading !== Loading.UNLOAD;

  const loadedRef = useRef(false);
  // The `onReadyStateRef` is passed via a ref to avoid the changed values
  // of `onReadyState` re-triggering the side effects.
  const onReadyStateRef = useValueRef(onReadyState);
  const setLoaded = useCallback(
    (value) => {
      if (value !== loadedRef.current) {
        loadedRef.current = value;
        const onReadyState = onReadyStateRef.current;
        onReadyState?.(value ? ReadyState.COMPLETE : ReadyState.LOADING);
      }
    },
    [onReadyStateRef]
  );

  const iframeRef = useRef(null);

  // Component API: IframeEmbedDef.Api.
  useImperativeHandle(
    ref,
    () => ({
      // Standard Bento
      get readyState() {
        return loadedRef.current ? ReadyState.COMPLETE : ReadyState.LOADING;
      },
    }),
    []
  );

  // Reset readyState to "loading" when an iframe is unloaded. Has to be
  // a `useLayoutEffect` to avoid race condition with a future "load" event.
  // A race condition can happen when a `useEffect` would be executed
  // after a future "load" is dispatched.
  useLayoutEffect(() => {
    if (!mount) {
      setLoaded(false);
    }
  }, [mount, setLoaded]);

  // Pause if the post goes into a "paused" context.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!playable && iframe) {
      const {src} = iframe;
      // Resetting the `src` will reset the iframe and pause it. It will force
      // the reload of the whole iframe. But it's the only reliable option
      // to force pause.
      if (canResetSrc(src)) {
        iframe.src = iframe.src;
      } else {
        const parent = iframe.parentNode;
        parent.insertBefore(iframe, iframe.nextSibling);
      }
    }
  }, [playable]);

  useLayoutEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !mount) {
      return;
    }

    const handler = (event) => {
      const iframe = iframeRef.current;
      if (
        !iframe ||
        event.source != iframe.contentWindow ||
        !matchesMessagingOrigin(event.origin)
      ) {
        return;
      }
      messageHandler(event);
    };

    const {defaultView} = iframe.ownerDocument;
    defaultView.addEventListener('message', handler);
    return () => defaultView.removeEventListener('message', handler);
  }, [matchesMessagingOrigin, messageHandler, mount, ready]);

  return (
    <ContainWrapper {...rest} layout size paint>
      {mount && ready && (
        <iframe
          allow={allow}
          allowFullScreen={allowFullScreen}
          allowTransparency={allowTransparency}
          frameborder="0"
          loading={loading}
          name={name}
          onLoad={() => setLoaded(true)}
          part="iframe"
          ref={iframeRef}
          sandbox={sandbox}
          scrolling="no"
          src={src}
          style={{
            ...iframeStyle,
            width: '100%',
            height: '100%',
            contentVisibility: 'auto',
          }}
          title={title}
        />
      )}
    </ContainWrapper>
  );
}

const IframeEmbed = forwardRef(IframeEmbedWithRef);
IframeEmbed.displayName = 'IframeEmbed'; // Make findable for tests.
export {IframeEmbed};
