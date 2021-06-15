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
import {ContainWrapper} from '../../../src/preact/component';
import {addParamToUrl} from '../../../src/url';
import {getData, listen} from '../../../src/event-helper';
import {useStyles} from './component.jss';

const {useCallback, useEffect, useRef, useState} = Preact;

/**
 * @param {!WordpressEmbedDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function WordpressEmbed({className, height, style, url}) {
  const wrapperRef = useRef(wrapperRef);
  const iframeRef = useRef(null);

  const [iframeURL, setIframeURL] = useState('');
  const [containerStyle, setContianerStyle] = useState({
    width: 'auto',
    height,
    ...style,
  });

  const classes = useStyles();

  useEffect(() => {
    const unlisten = listen(window, 'message', handleMessageEvent);

    return () => {
      unlisten();
    };
  }, [handleMessageEvent]);

  useEffect(() => {
    setIframeURL(addParamToUrl(url, 'embed', 'true'));
  }, [url]);

  /**
   * Check if the supplied URL has the same origin as the embedded iframe.
   *
   * @param {string} testURL
   * @return {boolean}
   * @private
   */
  const hasSameOrigin = useCallback(
    (testURL) => {
      const embeddedUrl = new URL(url);
      const checkedUrl = new URL(testURL);
      return embeddedUrl.origin === checkedUrl.origin;
    },
    [url]
  );

  /**
   * Handle message event.
   *
   * @param {Event|MessageEvent} event
   * @private
   */
  const handleMessageEvent = useCallback(
    (event) => {
      if (event.source !== iframeRef.current.contentWindow) {
        return;
      }

      const data = getData(event);

      if (
        typeof data?.message === 'undefined' ||
        typeof data?.value === 'undefined'
      ) {
        return;
      }

      switch (data.message) {
        case 'height':
          if (typeof data.value === 'number') {
            // Make sure the new height is between 200px and 1000px.
            // This replicates a constraint in WordPress's wp.receiveEmbedMessage() function.
            const newHeight = Math.min(Math.max(data.value, 200), 1000);
            setContianerStyle({
              ...containerStyle,
              height: newHeight,
            });
          }
          break;
        case 'link':
          // Only follow a link message for the currently-active iframe if the link is for the same origin.
          // This replicates a constraint in WordPress's wp.receiveEmbedMessage() function.
          if (hasSameOrigin(data.value)) {
            window.top.location.href = data.value;
          }
          break;
      }
    },
    [containerStyle, hasSameOrigin]
  );

  return (
    <ContainWrapper
      contentRef={wrapperRef}
      className={className}
      style={containerStyle}
      size
      layout
      paint
    >
      <iframe
        className={classes.iframe}
        ref={iframeRef}
        src={iframeURL}
        height="100%"
        width="100%"
      />
    </ContainWrapper>
  );
}
