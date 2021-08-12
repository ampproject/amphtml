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

import {dict} from '#core/types/object';

import * as Preact from '#preact';
import {forwardRef} from '#preact/compat';
import {IframeEmbed} from '#preact/component/iframe';

import {getData} from '../../../src/event-helper';
import {addParamToUrl} from '../../../src/url';

const {useCallback, useEffect, useMemo, useRef, useState} = Preact;

const NO_HEIGHT_STYLE = dict();

/**
 * @param {!WordPressEmbedDef.Props} props
 * @param {{current: ?WordPressEmbedDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function WordPressEmbedWithRef(
  {requestResize, title = 'WordPressEmbed', url, ...rest},
  ref
) {
  const [heightStyle, setHeightStyle] = useState(NO_HEIGHT_STYLE);
  const [opacity, setOpacity] = useState(0);
  const contentRef = useRef(null);
  const [win, setWin] = useState(null);

  const iframeURL = useMemo(() => {
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
            const height = data.value;
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
          if (matchesMessagingOrigin(data.value) && win) {
            win.top.location.href = data.value;
          }
          break;
      }
    },
    [requestResize, matchesMessagingOrigin, win]
  );

  useEffect(() => {
    setWin(contentRef.current?.ownerDocument?.defaultView);
  }, []);

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
      contentRef={contentRef}
      src={iframeURL}
      wrapperStyle={heightStyle}
      title={title}
      {...rest}
    />
  );
}

const WordPressEmbed = forwardRef(WordPressEmbedWithRef);
WordPressEmbed.displayName = 'WordPressEmbed'; // Make findable for tests.
export {WordPressEmbed};

/**
 * Verify required props and throw error if necessary.
 * @param {string|undefined} url
 * @return {boolean} true on valid
 */
function checkProps(url) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  try {
    new URL(url);
    return true;
  } catch (error) {
    displayWarning('Please provide a valid url');
    return false;
  }
}

/**
 * @param {?string} message
 */
function displayWarning(message) {
  console /*OK*/
    .warn(message);
}
