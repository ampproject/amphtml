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
import {VideoIframe} from '../../amp-video/1.0/video-iframe';
import {VideoWrapper} from '../../amp-video/1.0/video-wrapper';
import {px, resetStyles, setStyle, setStyles} from '../../../src/style';
import {useCallback, useLayoutEffect, useRef} from '../../../src/preact';

/**
 * @param {!YoutubeProps} props
 * @return {PreactDef.Renderable}
 */
export function Youtube({
  loop,
  videoid,
  liveChannelid,
  params,
  dock,
  credentials,
  ...rest
}) {
  const datasourceExists =
    !(videoid && liveChannelid) && (videoid || liveChannelid);

  if (!datasourceExists) {
    throw new Error(
      'Exactly one of data-videoid or data-live-channelid should be present for <amp-youtube>'
    );
  }

  return (
    <ContainWrapper size={true} layout={true} paint={true} {...rest}>
      <VideoWrapper component={VideoIframe} autoplay={autoplay}></VideoWrapper>
    </ContainWrapper>
  );
}
