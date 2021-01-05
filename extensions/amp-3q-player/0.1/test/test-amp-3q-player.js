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

import '../amp-3q-player';
import {VideoEvents} from '../../../../src/video-interface';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';

const TAG = 'amp-3q-player';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {
    buildLayoutElement,
    listenToForwardedEvent,
  } = getVideoIframeTestHelpers(env, TAG, {
    origin: 'https://playout.3qsdn.com',
    serializeMessage: JSON.stringify,
    layoutMessage: {data: 'ready'},
  });

  it('renders', async () => {
    const element = await buildLayoutElement({
      'data-id': 'c8dbe7f4-7f7f-11e6-a407-0cc47a188158',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(
      iframe,
      'https://playout.3qsdn.com/c8dbe7f4-7f7f-11e6-a407-0cc47a188158?autoplay=false&amp=true'
    );
  });

  it('requires data-id', () => {
    return allowConsoleError(() => {
      return buildLayoutElement({}).should.eventually.be.rejectedWith(
        /The data-id attribute is required/
      );
    });
  });

  it('should forward events', async () => {
    const element = await buildLayoutElement({
      'data-id': 'c8dbe7f4-7f7f-11e6-a407-0cc47a188158',
    });
    await listenToForwardedEvent(element, VideoEvents.MUTED, {
      data: 'muted',
    });
    await listenToForwardedEvent(element, VideoEvents.PLAYING, {
      data: 'playing',
    });
    await listenToForwardedEvent(element, VideoEvents.PAUSE, {
      data: 'paused',
    });
    await listenToForwardedEvent(element, VideoEvents.UNMUTED, {
      data: 'unmuted',
    });
  });
});
