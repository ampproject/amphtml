/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-youtube';
import {Services} from '../../../../src/services';
import {VideoEvents} from '../../../../src/video-interface';
import {
  getRealSrcFromTestingUrl,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';
import {listenOncePromise} from '../../../../src/event-helper';

const TAG = 'amp-youtube';

const EXAMPLE_VIDEOID = 'mGENRKrdoGY';
const EXAMPLE_LIVE_CHANNELID = 'UCB8Kb4pxYzsDsHxzBfnid4Q';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {
    fakePostMessage,
    buildElement,
    buildLayoutElement,
    listenToForwardedEvent,
  } = getVideoIframeTestHelpers(env, TAG, {
    origin: 'https://www.youtube.com',
    serializeMessage: JSON.stringify,
  });

  it('should pause if the video is playing', async () => {
    const element = await buildLayoutElement({'data-videoid': EXAMPLE_VIDEOID});
    env.sandbox.spy(element.implementation_, 'pause');
    element.implementation_.pauseCallback();
    expect(element.implementation_.pause.called).to.be.true;
  });

  describe('iframe src', () => {
    function withIframe(name, attributes, cb) {
      it(name, async () => {
        const element = await buildLayoutElement(attributes);
        cb(element.querySelector('iframe'));
      });
    }

    withIframe(
      'matches /(data-videoid)',
      {'data-videoid': EXAMPLE_VIDEOID},
      ({src}) =>
        expect(src).to.contain(
          `https://www.youtube.com/embed/${EXAMPLE_VIDEOID}?`
        )
    );

    withIframe(
      'matches /live_stream?channel=(data-live-channelid)',
      {'data-live-channelid': EXAMPLE_LIVE_CHANNELID},
      ({src}) =>
        expect(src).to.contain(
          `https://www.youtube.com/embed/live_stream?channel=${EXAMPLE_LIVE_CHANNELID}&`
        )
    );

    withIframe(
      'originates from www.youtube-nocookie.com when using credentials="omit"',
      {'data-videoid': EXAMPLE_VIDEOID, 'credentials': 'omit'},
      ({src}) =>
        expect(src).to.contain(
          `https://www.youtube-nocookie.com/embed/${EXAMPLE_VIDEOID}?`
        )
    );

    withIframe(
      'contains data-param-* attributes',
      {
        'data-videoid': EXAMPLE_VIDEOID,
        'data-param-my-param': 'hello world',
        'loop': '',
        'data-param-loop': '1',
        'autoplay': '',
        'data-autoplay': '1',
      },
      ({src}) => {
        // any data-param-*
        expect(src).to.contain('myParam=hello%20world');
        // default to playsinline=1
        expect(src).to.contain('playsinline=1');
        // loop, data-param-loop should be omitted
        expect(src).to.not.contain('loop=');
        // autoplay, data-autoplay should be ommited
        expect(src).to.not.contain('autoplay=');
      }
    );

    withIframe('contains amp=1', {'data-videoid': EXAMPLE_VIDEOID}, ({src}) =>
      expect(src).to.contain('amp=1')
    );

    withIframe(
      'maintains defaults for some parameters when autoplaying',
      {
        'autoplay': '',
        'data-videoid': EXAMPLE_VIDEOID,
        'data-param-playsinline': '0',
      },
      ({src}) => {
        // playsinline must be set 1 even if specified as 0
        expect(src).to.contain('playsinline=1');
        // annotation policy should default to 3 if not specified.
        expect(src).to.contain('iv_load_policy=3');
      }
    );

    withIframe(
      'contains loop=1 when using playlist',
      {
        'data-videoid': EXAMPLE_VIDEOID,
        'data-param-playlist': EXAMPLE_VIDEOID,
        'data-param-loop': '1',
      },
      ({src}) => expect(src).to.contain('loop=1')
    );

    withIframe(
      'contains loop=1 when using playlist and setting loop attribute',
      {
        'data-videoid': EXAMPLE_VIDEOID,
        'data-param-playlist': EXAMPLE_VIDEOID,
        'loop': '',
      },
      ({src}) => expect(src).to.contain('loop=1')
    );
  });

  it('should preload the final url', async () => {
    const element = await buildLayoutElement({
      'autoplay': '',
      'data-videoid': EXAMPLE_VIDEOID,
      'data-param-playsinline': '0',
    });
    const iframe = element.querySelector('iframe');
    const preconnect = Services.preconnectFor(env.win);
    env.sandbox.spy(preconnect, 'url');
    element.implementation_.preconnectCallback();
    expect(preconnect.url).to.have.been.calledWith(
      env.sandbox.match.object, // AmpDoc
      getRealSrcFromTestingUrl(iframe)
    );
  });

  it('should forward events', async () => {
    const element = await buildLayoutElement({'data-videoid': EXAMPLE_VIDEOID});
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
    await Promise.all([ended, paused]);
  });

  it('requires data-videoid or data-live-channelid', () => {
    return allowConsoleError(() => {
      return buildElement({}).should.eventually.be.rejectedWith(
        /Exactly one of data-videoid or data-live-channelid should/
      );
    });
  });

  it('adds an img placeholder in prerender mode if source is videoid', async () => {
    const element = await buildElement({'data-videoid': EXAMPLE_VIDEOID});
    const imgPlaceholder = element.querySelector('img[placeholder]');
    expect(imgPlaceholder).to.not.be.null;
    expect(imgPlaceholder).to.not.have.class('amp-hidden');
    expect(imgPlaceholder.src).to.equal(
      `https://i.ytimg.com/vi/${EXAMPLE_VIDEOID}/sddefault.jpg#404_is_fine`
    );
    expect(imgPlaceholder.getAttribute('referrerpolicy')).to.equal('origin');
    expect(imgPlaceholder.getAttribute('alt')).to.equal('Loading video');
  });

  it('propagates aria-label to img placeholder', async () => {
    const element = await buildElement({
      width: 111,
      height: 222,
      'data-videoid': EXAMPLE_VIDEOID,
      'aria-label': 'kind video',
    });
    const imgPlaceholder = element.querySelector('img[placeholder]');
    expect(imgPlaceholder).to.not.be.null;
    expect(imgPlaceholder.getAttribute('aria-label')).to.equal('kind video');
    expect(imgPlaceholder.getAttribute('alt')).to.equal(
      'Loading video - kind video'
    );
  });

  it('loads only default when it exists if source is videoid', async () => {
    const element = await buildElement({'data-videoid': EXAMPLE_VIDEOID});

    const imgPlaceholder = element.querySelector('img[placeholder]');
    expect(imgPlaceholder).to.not.be.null;
    expect(imgPlaceholder).to.not.have.class('amp-hidden');
    expect(imgPlaceholder.getAttribute('referrerpolicy')).to.equal('origin');

    await element.layoutCallback();

    expect(imgPlaceholder).to.have.class('amp-hidden');
    expect(imgPlaceholder.src).to.equal(
      'https://i.ytimg.com/vi/mGENRKrdoGY/sddefault.jpg#404_is_fine'
    );
  });

  it('loads hqdefault thumbnail source when sddefault fails', async () => {
    const element = await buildElement({'data-videoid': 'FAKE'});
    const imgPlaceholder = element.querySelector('img[placeholder]');
    expect(imgPlaceholder).to.not.be.null;
    expect(imgPlaceholder).to.not.have.class('amp-hidden');
    // Fake out the 404 image response dimensions of element.
    env.sandbox.defineProperty(imgPlaceholder, 'naturalWidth', {
      get() {
        return 120;
      },
    });
    env.sandbox.defineProperty(imgPlaceholder, 'naturalHeight', {
      get() {
        return 90;
      },
    });

    await element.layoutCallback();

    expect(imgPlaceholder).to.have.class('amp-hidden');
    expect(imgPlaceholder.src).to.equal(
      'https://i.ytimg.com/vi/FAKE/hqdefault.jpg'
    );
  });

  it('should propagate attribute mutations for videoid', async () => {
    const element = await buildElement({'data-videoid': EXAMPLE_VIDEOID});
    await element.layoutCallback();
    const spy = env.sandbox.spy(element.implementation_, 'sendCommand_');
    element.setAttribute('data-videoid', 'lBTCB7yLs8Y');
    element.mutatedAttributesCallback({'data-videoid': 'lBTCB7yLs8Y'});
    expect(spy).to.be.calledWith(
      'loadVideoById',
      env.sandbox.match(['lBTCB7yLs8Y'])
    );
  });

  it('should remove iframe after unlayoutCallback', async () => {
    const element = await buildLayoutElement({'data-videoid': EXAMPLE_VIDEOID});
    const placeholder = element.querySelector('[placeholder]');
    const impl = await element.getImpl();
    const unlistenSpy = env.sandbox.spy(impl, 'unlistenMessage_');
    impl.unlayoutCallback();
    expect(unlistenSpy).to.have.been.called;
    expect(element.querySelector('iframe')).to.be.null;
    expect(impl.iframe_).to.be.null;
    expect(placeholder).to.not.have.display('');
  });
});
