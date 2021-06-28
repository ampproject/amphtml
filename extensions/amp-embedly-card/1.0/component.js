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

import * as Preact from '#preact';
import {MessageType, ProxyIframeEmbed} from '#preact/component/3p-frame';
import {deserializeMessage} from '../../../src/3p-frame-messaging';
import {forwardRef} from '#preact/compat';
import {useCallback, useState} from '#preact';

/**
 * Attribute name used to set api key with name
 * expected by embedly.
 * @const {string}
 */
const API_KEY_ATTR_NAME = 'data-card-key';

const FULL_HEIGHT = '100%';

/**
 * @param {!EmbedlyCardDef.Props} props
 * @param {{current: ?EmbedlyCardDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function EmbedlyCardWithRef(
  {requestResize, style, title, url, ...rest},
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

  // Check for valid props
  if (!checkProps(url)) {
    displayWarning('url prop is required for EmbedlyCard');
  }

  // Prepare options for ProxyIframeEmbed
  const iframeOptions = {
    url,
  };

  // Extract Embedly Key
  const ampEmbedlyKeyElement = document.querySelector('amp-embedly-key');
  const apiKey = ampEmbedlyKeyElement?.getAttribute('value');

  // Add embedly key
  if (apiKey) {
    iframeOptions[API_KEY_ATTR_NAME] = apiKey;
  }

  return (
    <ProxyIframeEmbed
      options={iframeOptions}
      ref={ref}
      title={title || 'Embedly card'}
      type="embedly"
      {...rest}
      // non-overridable props
      messageHandler={messageHandler}
      style={height ? {...style, height} : style}
    />
  );
}

/**
 * Verify required props and throw error if necessary.
 * @param {string|undefined} url URL to check
 * @return {boolean} true on valid
 */
function checkProps(url) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  if (!url) {
    return false;
  }
  return true;
}

/**
 * Display warning in browser console
 * @param {?string} message Warning to be displayed
 */
function displayWarning(message) {
  console /*OK*/
    .warn(message);
}

const EmbedlyCard = forwardRef(EmbedlyCardWithRef);
EmbedlyCard.displayName = 'EmbedlyCard'; // Make findable for tests.
export {EmbedlyCard};
