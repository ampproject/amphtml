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
import {VideoIframe} from '../../amp-video/1.0/video-iframe';
import {VideoWrapper} from '../../amp-video/1.0/video-wrapper';
import {forwardRef} from '../../../src/preact/compat';

/**
 * @param {VideoIframeDef.Props} props
 * @param {{current: T|null}} ref
 * @return {PreactDef.Renderable}
 * @template T
 * TODO(alanorozco): VideoIframe should be VideoIframeWrapper, but other
 * components (amp-youtube, etc.) need to be updated as well.
 */
function VideoIframeWrapperWithRef(props, ref) {
  return <VideoWrapper ref={ref} {...props} component={VideoIframe} />;
}

const VideoIframeWrapper = forwardRef(VideoIframeWrapperWithRef);
VideoIframeWrapper.displayName = 'VideoIframeWrapper';
export {VideoIframeWrapper};
