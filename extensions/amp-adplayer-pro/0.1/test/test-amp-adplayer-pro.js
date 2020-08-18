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
import {createElementWithAttributes} from '../../../../src/dom';
import {VideoEvents} from "../../../../src/video-interface";

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
      'layout': 'responsive'
    };
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getAdPlayerPro(attributes) {

      const element = createElementWithAttributes(doc, 'amp-adplayer-pro', attributes || defaultAttributes);
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
          'https://serving.stat-rock.com/v1/placements/' + defaultAttributes['data-placement'] + '/code/amp/1#amp'
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
          source: impl.iframe_.contentWindow
        });
      }

      beforeEach(async () => {
        impl = (await getAdPlayerPro()).implementation_;
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

      it('gets currentTime', () => {
        expect(impl.getCurrentTime()).to.equal(0);
        impl.currentTime_ = 10;
        expect(impl.getCurrentTime()).to.equal(10);
      });

      it('gets duration', () => {
        impl.duration_ = 20;
        expect(impl.getDuration()).to.equal(impl.duration_);
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
          const spy = env.sandbox.spy(impl.element, 'dispatchCustomEvent');
          mockMessage('muted', {muted: true});
          expect(spy).calledWith(VideoEvents.MUTED);
          mockMessage('muted', {muted: false});
          expect(spy).calledWith(VideoEvents.UNMUTED);
        });

        it('updates current time and duration from state', () => {
          const mockTime = {currentTime: 10, duration: 20};
          mockMessage('time', mockTime);
          expect(impl.getCurrentTime()).to.equal(mockTime.currentTime);
          expect(impl.getDuration()).to.equal(mockTime.duration);
        });
      });
    });

  }
);
