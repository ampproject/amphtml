/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-mowplayer';
import {VideoEvents} from '../../../../src/video-interface';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';
import {listenOncePromise} from '../../../../src/event-helper';

const TAG = 'amp-mowplayer';

const EXAMPLE_VIDEOID = 'v-myfwarfx4tb';
const EXAMPLE_VIDEOID_URL = 'https://mowplayer.com/watch/v-myfwarfx4tb';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {
    fakePostMessage,
    buildLayoutElement,
    listenToForwardedEvent,
  } = getVideoIframeTestHelpers(env, TAG, {
    origin: 'https://mowplayer.com',
    serializeMessage: JSON.stringify,
    layoutMessage: {event: 'onReady'},
  });

  it('renders', async () => {
    const element = await buildLayoutElement({'data-mediaid': EXAMPLE_VIDEOID});
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(iframe, EXAMPLE_VIDEOID_URL);
  });

  it('requires data-mediaid', () =>
    allowConsoleError(() =>
      buildLayoutElement({}).should.eventually.be.rejectedWith(
        /The data-mediaid attribute is required for/
      )
    ));

  it('should send events from mowplayer to the amp element', async () => {
    const element = await buildLayoutElement({'data-mediaid': EXAMPLE_VIDEOID});

    await listenToForwardedEvent(element, VideoEvents.MUTED, {
      event: 'infoDelivery',
      info: {muted: true},
    });
    await listenToForwardedEvent(element, VideoEvents.PLAYING, {
      event: 'infoDelivery',
      info: {playerState: 1},
    });
    await listenToForwardedEvent(element, VideoEvents.PAUSE, {
      event: 'infoDelivery',
      info: {playerState: 2},
    });
    await listenToForwardedEvent(element, VideoEvents.UNMUTED, {
      event: 'infoDelivery',
      info: {muted: false},
    });

    // Make sure pause and end are triggered when video ends.
    const ended = listenOncePromise(element, VideoEvents.ENDED);
    const paused = listenOncePromise(element, VideoEvents.PAUSE);
    fakePostMessage(element, {
      event: 'infoDelivery',
      info: {playerState: 0},
    });
    await ended;
    await paused;
  });
});
