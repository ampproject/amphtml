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
import {dashToUnderline} from '../../../src/core/types/string';
import {deserializeMessage} from '../../../src/3p-frame-messaging';
import {forwardRef} from '../../../src/preact/compat';
import {tryParseJson} from '../../../src/core/types/object/json';
import {useCallback, useLayoutEffect, useState} from '../../../src/preact';

/** @const {string} */
const TYPE = 'facebook';
const FULL_HEIGHT = '100%';
const MATCHES_MESSAGING_ORIGIN = () => true;
const DEFAULT_TITLE = 'Facebook comments';

/**
 * @param {!FacebookDef.Props} props
 * @param {{current: ?FacebookDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function FacebookWithRef(
  {
    colorScheme,
    embedAs,
    href,
    locale: localeProp,
    numPosts,
    onReady,
    orderBy,
    requestResize,
    style,
    title = DEFAULT_TITLE,
    ...rest
  },
  ref
) {
  const [height, setHeight] = useState(null);
  const messageHandler = useCallback(
    (event) => {
      const data = tryParseJson(event.data) ?? deserializeMessage(event.data);
      if (data['action'] == 'ready') {
        onReady?.();
      }
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
    [requestResize, onReady]
  );

  const [locale, setLocale] = useState(localeProp);
  useLayoutEffect(() => {
    if (localeProp) {
      setLocale(localeProp);
      return;
    }
    const win = ref?.current?.ownerDocument?.defaultView;
    if (!win) {
      return;
    }
    setLocale(dashToUnderline(win.navigator.language));
  }, [localeProp, ref]);

  return (
    <ProxyIframeEmbed
      options={{
        colorScheme,
        href,
        locale,
        numPosts,
        orderBy,
        embedAs,
      }}
      ref={ref}
      title={title}
      {...rest}
      /* non-overridable props */
      // We sandbox all 3P iframes however facebook embeds completely break in
      // sandbox mode since they need access to document.domain, so we
      // exclude facebook.
      excludeSandbox
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      messageHandler={messageHandler}
      type={TYPE}
      style={height ? {...style, height} : style}
    />
  );
}

const Facebook = forwardRef(FacebookWithRef);
Facebook.displayName = 'Facebook'; // Make findable for tests.
export {Facebook};
