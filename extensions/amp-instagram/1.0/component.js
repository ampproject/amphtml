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
import {Loading} from '../../../src/loading';
import {ReadyState} from '../../../src/ready-state';
import {dict} from '../../../src/utils/object';
import {forwardRef} from '../../../src/preact/compat';
import {getData} from '../../../src/event-helper';
import {parseJson} from '../../../src/json';
import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';
import {useLoading} from '../../../src/preact/context';

const NO_HEIGHT_STYLE = dict();

/**
 * @param {!InstagramDef.Props} props
 * @param {{current: (!InstagramDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 * @template T
 */
export function InstagramWithRef(
  {
    shortcode,
    captioned,
    title,
    requestResize,
    loading: loadingProp,
    onReadyState,
    ...rest
  },
  ref
) {
  const loading = useLoading(loadingProp, /* unlayoutOnPause */ true);
  const load = loading !== Loading.UNLOAD;
  const [loaded, setLoaded] = useState(false);

  const iframeRef = useRef(null);
  const [heightStyle, setHeightStyle] = useState(NO_HEIGHT_STYLE);
  const [opacity, setOpacity] = useState(0);

  // Component API: InstagramDef.Api.
  useImperativeHandle(
    ref,
    () => ({
      // Standard Bento
      get readyState() {
        return loaded ? ReadyState.COMPLETE : ReadyState.LOADING;
      },
    }),
    [loaded]
  );

  // Reset readyState to "laoding" when an iframe is unloaded.
  const onReadyStateRef = useValueRef(onReadyState);
  useLayoutEffect(() => {
    if (!load) {
      setLoaded(false);
      const onReadyState = onReadyStateRef.current;
      if (onReadyState) {
        onReadyState(ReadyState.LOADING);
      }
    }
  }, [load, onReadyStateRef]);

  useLayoutEffect(() => {
    if (!iframeRef.current || !load) {
      return;
    }
    const messageHandler = (event) => {
      if (
        event.origin != 'https://www.instagram.com' ||
        event.source != iframeRef.current.contentWindow
      ) {
        return;
      }

      const data = parseJson(getData(event));

      if (data['type'] == 'MEASURE' && data['details']) {
        const height = data['details']['height'];
        if (requestResize) {
          requestResize(height);
        } else {
          setHeightStyle(dict({'height': height}));
        }
        setOpacity(1);
      }
    };
    const {defaultView} = iframeRef.current.ownerDocument;

    defaultView.addEventListener('message', messageHandler);

    return () => {
      defaultView.removeEventListener('message', messageHandler);
    };
  }, [load, requestResize, heightStyle]);

  return (
    <ContainWrapper {...rest} wrapperStyle={heightStyle} layout size paint>
      {load && (
        <iframe
          ref={iframeRef}
          src={
            'https://www.instagram.com/p/' +
            encodeURIComponent(shortcode) +
            '/embed/' +
            (captioned ? 'captioned/' : '') +
            '?cr=1&v=12'
          }
          loading={loading}
          onLoad={() => {
            setLoaded(true);
            if (onReadyState) {
              onReadyState(ReadyState.COMPLETE);
            }
          }}
          scrolling="no"
          frameborder="0"
          allowtransparency
          title={title}
          style={{
            width: '100%',
            height: '100%',
            opacity,
            contentVisibility: 'auto',
          }}
        />
      )}
    </ContainWrapper>
  );
}

const Instagram = forwardRef(InstagramWithRef);
Instagram.displayName = 'Instagram'; // Make findable for tests.
export {Instagram};
