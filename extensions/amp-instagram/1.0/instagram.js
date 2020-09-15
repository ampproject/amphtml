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
import * as styles from './instagram.css';
import {ContainWrapper} from '../../../src/preact/component';
import {getData} from '../../../src/event-helper';
import {px, resetStyles, setStyle, setStyles} from '../../../src/style';
import {useMountEffect} from '../../../src/preact/utils';

/**
 * @param {!InstagramProps} props
 * @return {PreactDef.Renderable}
 */
export function Instagram({shortcode, captioned, width, layout, style}) {
  captioned = captioned ? 'captioned/' : '';
  const iframeRef = Preact.useRef(null);
  const [heightStyle, setHeightStyle] = Preact.useState(null);
  const [opacityStyle, setOpacityStyle] = Preact.useState(0);
  const widthStyle = (layout == 'responsive' ? '100%' : px(String(width)));

  useMountEffect(() => {
    function handleMessage(event) {
      if (
        event.origin != 'https://www.instagram.com' ||
        event.source != iframeRef.current.contentWindow
      ) {
        return;
      }

      const data = JSON.parse(getData(event));

      if (data['type'] == 'MEASURE') {
        setHeightStyle(String(data['details']['height']) + 'px');
        setOpacityStyle(1);
      }
    }

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });

  const iframeProps = {
    src:
      'https://www.instagram.com/p/' +
      encodeURIComponent(shortcode) +
      '/embed/' +
      captioned +
      '?cr=1&v=12',
    scrolling: 'no',
    frameborder: 0,
    allowtransparency: 'true',
    style: Object.assign(
      {
        overflow: 'auto',
        width: widthStyle,
        height: heightStyle,
        opacity: opacityStyle,
      },
      style
    ),
  };

  return <iframe ref={iframeRef} {...iframeProps}></iframe>;
}
