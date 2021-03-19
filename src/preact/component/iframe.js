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
import {dict} from '../../../src/utils/object';
import {forwardRef} from '../../../src/preact/compat';
import {useAmpContext, useLoading} from '../../../src/preact/context';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';

const NO_HEIGHT_STYLE = dict();

/**
 * @param {!IframeDef.Props} props
 * @param {{current: (!IframeDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
export function IframeEmbedWithRef(
  {
    allow,
    allowFullscreen,
    allowtransparency,
    name,
    title,
    manageMessageHandler,
    ready = true,
    requestResize,
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
  const [heightStyle, setHeightStyle] = useState(NO_HEIGHT_STYLE);
  const [opacity, setOpacity] = useState(0);

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
      // Resetting the `src` will reset the iframe and pause it. It will force
      // the reload of the whole iframe. But it's the only reliable option
      // to force pause.
      iframe.src = iframe.src;
    }
  }, [playable]);

  useLayoutEffect(() => {
    if (!iframeRef.current || !mount) {
      return;
    }
    return manageMessageHandler(iframeRef, (heightOnSuccess) => {
      if (requestResize) {
        requestResize(heightOnSuccess);
      } else {
        setHeightStyle(dict({'height': heightOnSuccess}));
      }
      setOpacity(1);
    });
  }, [manageMessageHandler, mount, ready, requestResize, heightStyle]);

  return (
    <ContainWrapper {...rest} wrapperStyle={heightStyle} layout size paint>
      {mount && ready && (
        <iframe
          allow={allow}
          allowFullscreen={allowFullscreen}
          allowtransparency={allowtransparency}
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
            width: '100%',
            height: '100%',
            opacity,
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
