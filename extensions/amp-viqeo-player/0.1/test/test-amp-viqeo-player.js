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

import '../amp-viqeo-player';
import {PlayingStates, VideoEvents} from '../../../../src/video-interface';
import {Services} from '../../../../src/services';
import {getVideoIframeTestHelpers} from '../../../../testing/iframe-video';

const TAG = 'amp-viqeo-player';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {
    buildLayoutElement,
    listenToForwardedEvent,
  } = getVideoIframeTestHelpers(env, TAG, {
    attributes: {
      width: 16,
      height: 9,
      layout: 'responsive',
      'data-profileid': 184,
      'data-videoid': '922d04f30b66f1a32eb2',
    },
    serializeMessage: (data) => ({source: 'ViqeoPlayer', ...data}),
  });

  describe('test-requires-attributes', () => {
    it('requires data-videoid', () => {
      const error = /The data-videoid attribute is required for/;
      expectAsyncConsoleError(error);
      return buildLayoutElement({
        'data-videoid': '',
      }).should.eventually.be.rejectedWith(error);
    });

    it('requires data-profileid', () => {
      const error = /The data-profileid attribute is required for/;
      expectAsyncConsoleError(error);
      return buildLayoutElement({
        'data-profileid': '',
      }).should.eventually.be.rejectedWith(error);
    });
  });

  describe('test-playing-actions', () => {
    it('should propagate autoplay to ad iframe', async () => {
      const element = await buildLayoutElement({autoplay: ''});
      const iframe = element.querySelector('iframe');
      const data = JSON.parse(iframe.name).attributes;
      expect(data).to.be.ok;
      expect(data._context).to.be.ok;
      expect(data._context.autoplay).to.equal(true);
    });

    it(
      'should propagate autoplay=false ' +
        'if element has not autoplay attribute to ad iframe',
      async () => {
        const element = await buildLayoutElement();
        const iframe = element.querySelector('iframe');
        const data = JSON.parse(iframe.name).attributes;
        expect(data).to.be.ok;
        expect(data._context).to.be.ok;
        return expect(data._context.autoplay).to.equal(false);
      }
    );

    it('should paused without autoplay', async () => {
      const element = await buildLayoutElement();
      const curState = Services.videoManagerForDoc(
        env.win.document
      ).getPlayingState(element.implementation_);
      return expect(curState).to.equal(PlayingStates.PAUSED);
    });
  });

  describe('createPlaceholderCallback', () => {
    it('should create a placeholder image', async () => {
      const element = await buildLayoutElement();
      const img = element.querySelector('amp-img');
      expect(img).to.not.be.null;
      expect(img.getAttribute('src')).to.equal(
        'https://cdn.viqeo.tv/preview/922d04f30b66f1a32eb2.jpg'
      );
      expect(img.getAttribute('layout')).to.equal('fill');
      expect(img.hasAttribute('placeholder')).to.be.true;
      expect(img.getAttribute('referrerpolicy')).to.equal('origin');
      expect(img.getAttribute('alt')).to.equal('Loading video');
    });
  });

  it('should forward events', async () => {
    const element = await buildLayoutElement();
    await listenToForwardedEvent(element, VideoEvents.LOAD, {
      action: 'ready',
    });
    await listenToForwardedEvent(element, VideoEvents.PLAYING, {
      action: 'play',
    });
    await listenToForwardedEvent(element, VideoEvents.PAUSE, {
      action: 'pause',
    });
    await listenToForwardedEvent(element, VideoEvents.MUTED, {
      action: 'mute',
    });
    await listenToForwardedEvent(element, VideoEvents.UNMUTED, {
      action: 'unmute',
    });
    await listenToForwardedEvent(element, VideoEvents.ENDED, {
      action: 'end',
    });
    await listenToForwardedEvent(element, VideoEvents.AD_START, {
      action: 'startAdvert',
    });
    await listenToForwardedEvent(element, VideoEvents.AD_END, {
      action: 'endAdvert',
    });
  });
});
