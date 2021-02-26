/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-dailymotion';
import * as dom from '../../../../src/dom';

describes.realWin(
  'amp-dailymotion',
  {
    amp: {
      extensions: ['amp-dailymotion'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getDailymotion(videoId, optResponsive, optCustomSettings) {
      const player = doc.createElement('amp-dailymotion');
      player.setAttribute('data-videoid', videoId);
      player.setAttribute('width', '111');
      player.setAttribute('height', '222');
      if (optResponsive) {
        player.setAttribute('layout', 'responsive');
      }
      if (optCustomSettings) {
        player.setAttribute('data-start', 123);
        player.setAttribute('data-param-origin', 'example&.org');
      }
      doc.body.appendChild(player);
      await player.buildInternal();
      await player.layoutCallback();
      return player;
    }

    describe('rendering', async () => {
      it('renders', async () => {
        const player = await getDailymotion('x2m8jpp');

        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://www.dailymotion.com/embed/video/x2m8jpp?api=1&html=1&app=amp'
        );
      });

      it('renders responsively', async () => {
        const player = await getDailymotion('x2m8jpp', true);
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });

      it('renders with custom settings', async () => {
        const player = await getDailymotion('x2m8jpp', false, true);
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.equal(
          'https://www.dailymotion.com/embed/video/x2m8jpp?api=1&html=1&app=amp&start=123&origin=example%26.org'
        );
      });

      it('requires data-videoid', () => {
        return allowConsoleError(() => {
          return getDailymotion('').should.eventually.be.rejectedWith(
            /The data-videoid attribute is required for/
          );
        });
      });
    });

    describe('methods', async () => {
      let impl;
      beforeEach(async () => {
        const player = await getDailymotion('x2m8jpp', true);
        impl = await player.getImpl(false);
      });

      it('is interactive', () => {
        expect(impl.isInteractive()).to.be.true;
      });

      it('can play', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.play();
        expect(spy).to.be.calledWith('play');
      });

      it('can autoplay', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.play(true);
        expect(spy).to.be.calledWith('play');
      });

      it('can pause', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.pause();
        expect(spy).to.be.calledWith('pause');
      });

      it('can mute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.mute();
        expect(impl.sendCommand_).calledWith('muted', [true]);
      });

      it('can unmute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.unmute();
        expect(impl.sendCommand_).calledWith('muted', [false]);
      });

      it('can enter fullscreen', () => {
        const spy = env.sandbox.spy(dom, 'fullscreenEnter');
        impl.fullscreenEnter();
        expect(spy).calledWith(impl.iframe_);
      });

      it('can exit fullscreen', () => {
        const spy = env.sandbox.spy(dom, 'fullscreenExit');
        impl.fullscreenExit();
        expect(spy).calledWith(impl.iframe_);
        expect(impl.isFullscreen()).to.be.false;
      });

      it('toggles controls', () => {
        const spy = env.sandbox.stub(impl, 'sendCommand_');
        impl.showControls();
        expect(spy).calledWith('controls', [true]);
        impl.hideControls();
        expect(spy).calledWith('controls', [false]);
        impl.showControls();
        expect(spy).calledWith('controls', [true]);
      });
    });
  }
);
