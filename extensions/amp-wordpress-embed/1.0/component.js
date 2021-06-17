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
import {IframeEmbed} from '../../../src/preact/component/iframe';
import {addParamToUrl} from '../../../src/url';
import {dict} from '../../../src/core/types/object';
import {forwardRef} from '../../../src/preact/compat';
import {getData} from '../../../src/event-helper';

const {useCallback, useState} = Preact;

const NO_HEIGHT_STYLE = dict();

/**
 * @param {!WordpressEmbedDef.Props} props
 * @param {{current: ?WordpressEmbedDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function WordpressEmbedWithRef(
  {requestResize, title = 'WordpressEmbed', url, ...rest},
  ref
) {
  const [heightStyle, setHeightStyle] = useState(NO_HEIGHT_STYLE);
  const [opacity, setOpacity] = useState(0);

  const iframeURL = useCallback(() => {
    return addParamToUrl(url, 'embed', 'true');
  }, [url]);

  const matchesMessagingOrigin = useCallback(
    (testURL) => {
      const embeddedUrl = new URL(url);
      const checkedUrl = new URL(testURL);
      return embeddedUrl.origin === checkedUrl.origin;
    },
    [url]
  );

  const messageHandler = useCallback(
    (event) => {
      const data = getData(event);

      switch (data.message) {
        case 'height':
          if (typeof data.value === 'number') {
            // Make sure the new height is between 200px and 1000px.
            // This replicates a constraint in WordPress's wp.receiveEmbedMessage() function.
            const height = Math.min(Math.max(data.value, 200), 1000);
            if (requestResize) {
              requestResize(height);
            }
            setHeightStyle(dict({'height': height}));
            setOpacity(1);
          }
          break;
        case 'link':
          // Only follow a link message for the currently-active iframe if the link is for the same origin.
          // This replicates a constraint in WordPress's wp.receiveEmbedMessage() function.
          if (matchesMessagingOrigin(data.value)) {
            window.top.location.href = data.value;
          }
          break;
      }
    },
    [requestResize, matchesMessagingOrigin]
  );

  // Checking for valid props
  if (!checkProps(url)) {
    return null;
  }

  return (
    <IframeEmbed
      allowTransparency
      iframeStyle={{opacity}}
      matchesMessagingOrigin={matchesMessagingOrigin}
      messageHandler={messageHandler}
      ref={ref}
      src={iframeURL()}
      wrapperStyle={heightStyle}
      title={title}
      {...rest}
    />
  );
}

const WordpressEmbed = forwardRef(WordpressEmbedWithRef);
WordpressEmbed.displayName = 'WordpressEmbed'; // Make findable for tests.
export {WordpressEmbed};

/**
 * Verify required props and throw error if necessary.
 * @param {string|undefined} url
 * @return {boolean} true on valid
 */
function checkProps(url) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  if (url === undefined) {
    displayWarning('data-url is required for <amp-wordpress-embed>');
    return false;
  }
  return true;
}

/**
 * @param {?string} message
 */
function displayWarning(message) {
  console /*OK*/
    .warn(message);
}
