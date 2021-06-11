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

import * as Preact from '#preact';
import {IframeEmbed} from '#preact/component/iframe';
import {dict} from '#core/types/object';
import {forwardRef} from '#preact/compat';
import {getData} from '../../../src/event-helper';
import {parseJson} from '#core/types/object/json';
import {useCallback, useState} from '#preact';

const NO_HEIGHT_STYLE = dict();
const MATCHES_MESSAGING_ORIGIN = (origin) =>
  origin === 'https://www.instagram.com';

/**
 * @param {!InstagramDef.Props} props
 * @param {{current: ?InstagramDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function InstagramWithRef(
  {captioned, requestResize, shortcode, title = 'Instagram', ...rest},
  ref
) {
  const [heightStyle, setHeightStyle] = useState(NO_HEIGHT_STYLE);
  const [opacity, setOpacity] = useState(0);

  const messageHandler = useCallback(
    (event) => {
      const data = parseJson(getData(event));
      if (data['type'] == 'MEASURE' && data['details']) {
        const height = data['details']['height'];
        if (requestResize) {
          requestResize(height);
        }
        setHeightStyle(dict({'height': height}));
        setOpacity(1);
      }
    },
    [requestResize]
  );

  return (
    <IframeEmbed
      allowTransparency
      iframeStyle={{opacity}}
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      messageHandler={messageHandler}
      ref={ref}
      src={
        'https://www.instagram.com/p/' +
        encodeURIComponent(shortcode) +
        '/embed/' +
        (captioned ? 'captioned/' : '') +
        '?cr=1&v=12'
      }
      title={title}
      wrapperStyle={heightStyle}
      {...rest}
    />
  );
}

const Instagram = forwardRef(InstagramWithRef);
Instagram.displayName = 'Instagram'; // Make findable for tests.
export {Instagram};
