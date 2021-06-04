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

import '../amp-adplayer-pro';
import {VideoEvents} from '../../../../src/video-interface';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin(
  'amp-adplayer-pro',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-adplayer-pro'],
    },
  },
  (env) => {
    const defaultAttributes = {
      'data-placement': 'caUcvGy0dPEMAR1oJizSGMlwDI5a4bBErmG2m_XCYrPFQbT79KXs',
      'width': '320',
      'height': '180',
      'layout': 'responsive',
    };
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getAdPlayerPro(attributes) {
      const element = createElementWithAttributes(
        doc,
        'amp-adplayer-pro',
        attributes || defaultAttributes
      );
      doc.body.appendChild(element);
      await element.build();
      await element.layoutCallback();
      return element;
    }

    describe('rendering', async () => {
      it('renders', async () => {
        const player = await getAdPlayerPro();
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://serving.stat-rock.com/v1/placements/' +
            defaultAttributes['data-placement'] +
            '/code/amp/1#amp'
        );
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    describe('methods', async () => {
      let impl;

      function mockMessage(event, params) {
        impl.onMessage_({
          data: {event, params},
          origin: 'https://serving.stat-rock.com',
          source: impl.iframe_.contentWindow,
        });
      }

      beforeEach(async () => {
        impl = await (await getAdPlayerPro()).getImpl(false);
      });

      it('supports platform', () => {
        expect(impl.supportsPlatform()).to.be.true;
      });

      it('is interactive', () => {
        expect(impl.isInteractive()).to.be.true;
      });

      it('does not implement auto-fullscreen', () => {
        expect(impl.preimplementsAutoFullscreen()).to.be.false;
      });

      it('does not pre-implement MediaSession API', () => {
        expect(impl.preimplementsMediaSessionAPI()).to.be.false;
      });

      it('does not implement PlayedRanges', () => {
        expect(impl.getPlayedRanges().length).to.equal(0);
      });

      it('gets currentTime', () => {
        expect(impl.getCurrentTime()).to.equal(0);
        impl.currentTime_ = 10;
        expect(impl.getCurrentTime()).to.equal(10);
      });

      it('gets duration', () => {
        impl.duration_ = 20;
        expect(impl.getDuration()).to.equal(impl.duration_);
      });

      it('is fullscreen', () => {
        expect(impl.isFullscreen()).to.be.false;
      });

      it('can play', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.play();
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
        expect(impl.sendCommand_).calledWith('muted', true);
      });

      it('can unmute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.unmute();
        expect(impl.sendCommand_).calledWith('muted', false);
      });

      it('call unlayoutCallback', () => {
        const unlistenMessageSpy = env.sandbox.spy(impl, 'unlistenMessage_');
        const unlistenFullscreenSpy = env.sandbox.spy(
          impl,
          'unlistenFullscreen_'
        );
        expect(impl.unlayoutCallback()).to.be.true;
        expect(impl.iframe_).to.be.null;
        expect(unlistenMessageSpy).to.be.calledOnce;
        expect(unlistenFullscreenSpy).to.be.calledOnce;
      });

      describe('message handling', () => {
        it('returns early if empty message', () => {
          const spy = env.sandbox.spy(impl, 'onMessage_');
          impl.onMessage_({});
          expect(spy).returned(undefined);
        });

        it("returns early if data isn't JSON or object", () => {
          const spy = env.sandbox.spy(impl, 'onMessage_');
          impl.onMessage_({data: 'Hello World'});
          expect(spy).returned(undefined);
        });

        it('calls onReady if valid ready message recieved', () => {
          const spy = env.sandbox.spy(impl, 'playerReadyResolver_');
          mockMessage('ready');
          expect(spy).calledWith(impl.iframe_);
        });

        it('updates mute from state', () => {
          const mutedEventSpy = env.sandbox.spy();
          const unmutedEventSpy = env.sandbox.spy();
          impl.element.addEventListener(VideoEvents.MUTED, mutedEventSpy);
          impl.element.addEventListener(VideoEvents.UNMUTED, unmutedEventSpy);
          mockMessage('muted', {muted: true});
          expect(mutedEventSpy).to.be.calledOnce;
          mockMessage('muted', {muted: false});
          expect(unmutedEventSpy).to.be.calledOnce;
        });

        it('updates current time and duration from state', () => {
          const mockTime = {currentTime: 10, duration: 20};
          mockMessage('time', mockTime);
          expect(impl.getCurrentTime()).to.equal(mockTime.currentTime);
          expect(impl.getDuration()).to.equal(mockTime.duration);
        });

        it('updates fullscreen from state', () => {
          const isFullscreen = env.sandbox.stub(impl, 'isFullscreen');
          const fullscreenEnterSpy = env.sandbox.spy(impl, 'fullscreenEnter');
          const fullscreenExitSpy = env.sandbox.spy(impl, 'fullscreenExit');

          isFullscreen.returns(false);
          mockMessage('fullscreen', {fullscreen: true});
          expect(fullscreenEnterSpy.callCount).to.equal(1);
          expect(fullscreenExitSpy.callCount).to.equal(0);

          isFullscreen.returns(true);
          mockMessage('fullscreen', {fullscreen: false});
          expect(fullscreenEnterSpy.callCount).to.equal(1);
          expect(fullscreenExitSpy.callCount).to.equal(1);

          isFullscreen.returns(false);
          mockMessage('fullscreen', {fullscreen: false});
          expect(fullscreenEnterSpy.callCount).to.equal(1);
          expect(fullscreenExitSpy.callCount).to.equal(1);
        });
      });
    });
  }
);
