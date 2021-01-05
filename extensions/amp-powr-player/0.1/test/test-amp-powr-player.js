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

import '../amp-powr-player';
import {VideoEvents} from '../../../../src/video-interface';
import {
  expectRealIframeSrcEquals,
  getRealSrcFromTestingUrl,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';
import {parseUrlDeprecated} from '../../../../src/url';

const TAG = 'amp-powr-player';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {
    buildLayoutElement,
    listenToForwardedEvent,
  } = getVideoIframeTestHelpers(env, TAG, {
    origin: 'https://player.powr.com',
    layoutMessage: {event: 'ready'},
    serializeMessage: JSON.stringify,
  });

  it('renders', async () => {
    const element = await buildLayoutElement({
      'data-account': '945',
      'data-player': '1',
      'data-video': 'amp-test-video',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expect(iframe.tagName).to.equal('IFRAME');
    expectRealIframeSrcEquals(
      iframe,
      'https://player.powr.com/iframe.html?account=945&player=1&' +
        'video=amp-test-video&playsinline=true'
    );
  });

  it('requires data-account', () => {
    const error = /The data-account attribute is required for/;
    expectAsyncConsoleError(error, 1);
    return buildLayoutElement({}).should.eventually.be.rejectedWith(error);
  });

  it('requires data-player', () => {
    const error = /The data-player attribute is required for/;
    expectAsyncConsoleError(error, 1);
    return buildLayoutElement({
      'data-account': '945',
    }).should.eventually.be.rejectedWith(error);
  });

  it('removes iframe after unlayoutCallback', async () => {
    const element = await buildLayoutElement({
      'data-account': '945',
      'data-player': '1',
      'data-video': 'amp-test-video',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    const obj = element.implementation_;
    obj.unlayoutCallback();
    expect(element.querySelector('iframe')).to.be.null;
    expect(obj.iframe_).to.be.null;
  });

  it('should pass data-param-* attributes to the iframe src', async () => {
    const element = await buildLayoutElement({
      'data-account': '945',
      'data-player': '1',
      'data-video': 'amp-test-video',
      'data-param-foo': 'bar',
    });
    const iframe = element.querySelector('iframe');
    const params = parseUrlDeprecated(
      getRealSrcFromTestingUrl(iframe)
    ).search.split('&');
    expect(params).to.contain('foo=bar');
  });

  it('should propagate mutated attributes', async () => {
    const element = await buildLayoutElement({
      'data-account': '945',
      'data-player': '1',
      'data-video': 'ZNImchutXk',
    });
    const iframe = element.querySelector('iframe');

    expectRealIframeSrcEquals(
      iframe,
      'https://player.powr.com/iframe.html?account=945&player=1&' +
        'video=ZNImchutXk&playsinline=true'
    );

    element.setAttribute('data-account', '945');
    element.setAttribute('data-player', '1');
    element.setAttribute('data-video', 'ZNImchutXk');
    element.mutatedAttributesCallback({
      'data-account': '945',
      'data-player': '1',
      'data-video': 'ZNImchutXk',
    });

    expectRealIframeSrcEquals(
      iframe,
      'https://player.powr.com/iframe.html?account=945&player=1&' +
        'video=ZNImchutXk&playsinline=true'
    );
  });

  it('should pass referrer', async () => {
    const element = await buildLayoutElement({
      'data-account': '945',
      'data-player': '1',
      'data-video': 'ZNImchutXk',
      'data-referrer': 'COUNTER',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe.src).to.contain('referrer=1');
  });

  it('should force playsinline', async () => {
    const element = await buildLayoutElement({
      'data-account': '945',
      'data-player': '1',
      'data-video': 'ZNImchutXk',
      'data-param-playsinline': 'false',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe.src).to.contain('playsinline=true');
  });

  it('should forward events', async () => {
    const element = await buildLayoutElement({
      'data-account': '945',
      'data-player': '1',
      'data-video': 'ZNImchutXk',
    });
    await listenToForwardedEvent(element, VideoEvents.LOAD, {
      event: 'ready',
      muted: false,
      playing: false,
    });
    await listenToForwardedEvent(element, VideoEvents.AD_START, {
      event: 'ads-ad-started',
      muted: false,
      playing: false,
    });
    await listenToForwardedEvent(element, VideoEvents.AD_END, {
      event: 'ads-ad-ended',
      muted: false,
      playing: false,
    });
    await listenToForwardedEvent(element, VideoEvents.PLAYING, {
      event: 'playing',
      muted: false,
      playing: true,
    });
    await listenToForwardedEvent(element, VideoEvents.MUTED, {
      event: 'volumechange',
      muted: true,
      playing: true,
    });
    await listenToForwardedEvent(element, VideoEvents.UNMUTED, {
      event: 'volumechange',
      muted: false,
      playing: true,
    });
    await listenToForwardedEvent(element, VideoEvents.PAUSE, {
      event: 'pause',
      muted: false,
      playing: false,
    });
    await listenToForwardedEvent(element, VideoEvents.ENDED, {
      event: 'ended',
      muted: false,
      playing: false,
    });
  });
});
