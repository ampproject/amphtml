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

import '../amp-delight-player';
import {VideoEvents} from '../../../../src/video-interface';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';

const TAG = 'amp-delight-player';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {
    buildLayoutElement,
    listenToForwardedEvent,
  } = getVideoIframeTestHelpers(env, TAG, {
    origin: 'https://players.delight-vr.com',
    serializeMessage: (data) =>
      JSON.stringify({source: 'DelightPlayer', ...data}),
  });

  it('renders', async () => {
    const element = await buildLayoutElement({
      'data-content-id': '-LLoCCZqWi18O73b6M0w',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(
      iframe,
      'https://players.delight-vr.com/player/-LLoCCZqWi18O73b6M0w?amp=1'
    );
    expect(iframe.allow).to.equal('vr');
    expect(iframe.className).to.match(/i-amphtml-fill-content/);
  });

  it('fails if no content is specified', () => {
    return allowConsoleError(() => {
      return buildLayoutElement({
        'data-content-id': '',
      }).should.eventually.be.rejectedWith(
        /The data-content-id attribute is required/
      );
    });
  });

  it('should forward events', async () => {
    const element = await buildLayoutElement({
      'data-content-id': '-LLoCCZqWi18O73b6M0w',
    });

    await listenToForwardedEvent(element, VideoEvents.LOAD, {
      type: 'x-dl8-to-parent-ready',
      payload: {},
    });

    await listenToForwardedEvent(element, VideoEvents.PLAYING, {
      type: 'x-dl8-to-parent-playing',
      payload: {},
    });

    await listenToForwardedEvent(element, VideoEvents.PAUSE, {
      type: 'x-dl8-to-parent-paused',
      payload: {},
    });

    await listenToForwardedEvent(element, VideoEvents.MUTED, {
      type: 'x-dl8-to-parent-muted',
      payload: {},
    });

    await listenToForwardedEvent(element, VideoEvents.UNMUTED, {
      type: 'x-dl8-to-parent-unmuted',
      payload: {},
    });

    await listenToForwardedEvent(element, VideoEvents.ENDED, {
      type: 'x-dl8-to-parent-ended',
      payload: {},
    });

    await listenToForwardedEvent(element, VideoEvents.AD_START, {
      type: 'x-dl8-to-parent-amp-ad-start',
      payload: {},
    });

    await listenToForwardedEvent(element, VideoEvents.AD_END, {
      type: 'x-dl8-to-parent-amp-ad-end',
      payload: {},
    });

    const {data} = await listenToForwardedEvent(
      element,
      VideoEvents.CUSTOM_TICK,
      {
        type: 'x-dl8-to-parent-amp-custom-tick',
        payload: {
          type: 'delight-test-event',
          testVar: 42,
        },
      }
    );
    expect(data.eventType).to.equal('video-custom-delight-test-event');
    expect(data.vars.testVar).to.equal(42);
  });
});
