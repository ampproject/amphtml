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
import {ContainWrapper} from '../../../src/preact/component';
import {getData} from '../../../src/event-helper';
import {parseJson} from '../../../src/json';
import {useLayoutEffect, useRef, useState} from '../../../src/preact';

/**
 * @param {!InstagramPropsDef} props
 * @return {PreactDef.Renderable}
 */
export function Instagram({
  shortcode,
  captioned,
  style,
  title,
  requestResize,
  ...rest
}) {
  const iframeRef = useRef(null);
  const [heightStyle, setHeightStyle] = useState(null);
  const [opacity, setOpacity] = useState(0);

  useLayoutEffect(() => {
    /**
     * @param {Event} event
     */
    function handleMessage(event) {
      if (
        event.origin != 'https://www.instagram.com' ||
        event.source != iframeRef.current.contentWindow
      ) {
        return;
      }

      const data = parseJson(getData(event));

      if (data['type'] == 'MEASURE') {
        const height = data['details']['height'];
        if (requestResize) {
          requestResize(height);
        } else {
          setHeightStyle({'height': height});
        }
        setOpacity(1);
      }
    }

    const {defaultView} = iframeRef.current.ownerDocument;

    defaultView.addEventListener('message', handleMessage);

    return () => {
      defaultView.removeEventListener('message', handleMessage);
    };
  }, [requestResize]);

  return (
    <ContainWrapper
      {...rest}
      style={{...style, ...heightStyle}}
      layout
      size
      paint
    >
      <iframe
        ref={iframeRef}
        src={
          'https://www.instagram.com/p/' +
          encodeURIComponent(shortcode || 'error') +
          '/embed/' +
          (captioned ? 'captioned/' : '') +
          '?cr=1&v=12'
        }
        scrolling="no"
        frameborder="0"
        allowtransparency
        title={title}
        style={{
          width: '100%',
          height: '100%',
          opacity,
        }}
      />
    </ContainWrapper>
  );
}
