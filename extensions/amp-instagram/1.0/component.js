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
import {IframeEmbed} from '../../../src/preact/component/iframe';
import {forwardRef} from '../../../src/preact/compat';
import {getData} from '../../../src/event-helper';
import {parseJson} from '../../../src/json';
import {useCallback} from '../../../src/preact';

/**
 * @param {!InstagramDef.Props} props
 * @param {{current: (!InstagramDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
function InstagramWithRef(
  {captioned, shortcode, title = 'Instagram', ...rest},
  ref
) {
  const manageMessageHandler = useCallback((ref, onSuccess) => {
    const iframe = ref.current;
    if (!iframe) {
      return;
    }
    const messageHandler = (event) => {
      const iframe = ref.current;
      if (!iframe) {
        return;
      }
      if (
        event.origin != 'https://www.instagram.com' ||
        event.source != iframe.contentWindow
      ) {
        return;
      }

      const data = parseJson(getData(event));

      if (data['type'] == 'MEASURE' && data['details']) {
        const height = data['details']['height'];
        onSuccess(height);
      }
    };
    const {defaultView} = iframe.ownerDocument;

    defaultView.addEventListener('message', messageHandler);

    return () => {
      defaultView.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <IframeEmbed
      allowtransparency
      manageMessageHandler={manageMessageHandler}
      ref={ref}
      src={
        'https://www.instagram.com/p/' +
        encodeURIComponent(shortcode) +
        '/embed/' +
        (captioned ? 'captioned/' : '') +
        '?cr=1&v=12'
      }
      title={title}
      {...rest}
    />
  );
}

const Instagram = forwardRef(InstagramWithRef);
Instagram.displayName = 'Instagram'; // Make findable for tests.
export {Instagram};
