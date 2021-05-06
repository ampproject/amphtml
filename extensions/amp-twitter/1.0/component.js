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
import {
  MessageType,
  ProxyIframeEmbed,
} from '../../../src/preact/component/3p-frame';
import {deserializeMessage} from '../../../src/3p-frame-messaging';
import {forwardRef} from '../../../src/preact/compat';
import {useCallback, useState} from '../../../src/preact';

/** @const {string} */
const TYPE = 'twitter';
const FULL_HEIGHT = '100%';
const MATCHES_MESSAGING_ORIGIN = () => true;

/**
 * @param {!TwitterDef.Props} props
 * @param {{current: (!TwitterDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
function TwitterWithRef(
  {momentid, options, requestResize, style, title, tweetid, ...rest},
  ref
) {
  const [height, setHeight] = useState(null);
  const messageHandler = useCallback(
    (event) => {
      const data = deserializeMessage(event.data);
      if (data['type'] == MessageType.EMBED_SIZE) {
        const height = data['height'];
        if (requestResize) {
          requestResize(height);
          setHeight(FULL_HEIGHT);
        } else {
          setHeight(height);
        }
      }
    },
    [requestResize]
  );

  return (
    <ProxyIframeEmbed
      allowFullscreen
      ref={ref}
      title={title}
      {...rest}
      // non-overridable props
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      messageHandler={messageHandler}
      options={{tweetid, momentid, ...options}}
      type={TYPE}
      style={height ? {...style, height} : style}
    />
  );
}

const Twitter = forwardRef(TwitterWithRef);
Twitter.displayName = 'Twitter'; // Make findable for tests.
export {Twitter};
