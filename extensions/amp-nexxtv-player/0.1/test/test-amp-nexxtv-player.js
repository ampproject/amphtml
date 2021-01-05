/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-nexxtv-player';
import {VideoEvents} from '../../../../src/video-interface';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';

const TAG = 'amp-nexxtv-player';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {
    buildLayoutElement,
    listenToForwardedEvent,
  } = getVideoIframeTestHelpers(env, TAG, {
    origin: 'https://embed.nexx.cloud',
    serializeMessage: JSON.stringify,
    layoutMessage: {cmd: 'onload'},
  });

  it('renders', async () => {
    const element = await buildLayoutElement({
      'data-mediaid': '71QQG852413DU7J',
      'data-client': '761',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(
      iframe,
      'https://embed.nexx.cloud/761/video/' +
        '71QQG852413DU7J?dataMode=static&platform=amp'
    );
  });

  it('removes iframe after unlayoutCallback', async () => {
    const element = await buildLayoutElement({
      'data-mediaid': '71QQG852413DU7J',
      'data-client': '761',
    });
    const playerIframe = element.querySelector('iframe');
    expect(playerIframe).to.not.be.null;

    const obj = element.implementation_;
    obj.unlayoutCallback();
    expect(element.querySelector('iframe')).to.be.null;
    expect(obj.iframe_).to.be.null;
  });

  it('should forward events', async () => {
    const element = await buildLayoutElement({
      'data-mediaid': '71QQG852413DU7J',
      'data-client': '761',
    });
    await listenToForwardedEvent(element, VideoEvents.PLAYING, {
      event: 'play',
    });
    await listenToForwardedEvent(element, VideoEvents.MUTED, {
      event: 'mute',
    });
    await listenToForwardedEvent(element, VideoEvents.PAUSE, {
      event: 'pause',
    });
    await listenToForwardedEvent(element, VideoEvents.UNMUTED, {
      event: 'unmute',
    });
  });
});
