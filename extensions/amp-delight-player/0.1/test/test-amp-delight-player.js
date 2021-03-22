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
import {listenOncePromise} from '../../../../src/event-helper';

describes.realWin(
  'amp-delight-player',
  {
    amp: {
      extensions: ['amp-delight-player'],
    },
  },
  function (env) {
    this.timeout(4000);
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function fakePostMessage(delightElement, info) {
      const impl = await delightElement.getImpl(false);
      impl.handleDelightMessage_({
        source: delightElement.querySelector('iframe').contentWindow,
        data: {source: 'DelightPlayer', ...info},
      });
    }

    async function getDelightPlayer(attributes) {
      const player = doc.createElement('amp-delight-player');
      for (const key in attributes) {
        player.setAttribute(key, attributes[key]);
      }
      player.setAttribute('width', '640');
      player.setAttribute('height', '360');
      player.setAttribute('layout', 'responsive');
      doc.body.appendChild(player);
      const impl = await player.getImpl(false);
      impl.baseURL_ =
        // Serve a blank page, since these tests don't require an actual page.
        // hash # at the end so path is not affected by param concat
        `http://localhost:${location.port}/test/fixtures/served/blank.html#`;
      return player
        .buildInternal()
        .then(() => player.layoutCallback())
        .then(() => player);
    }

    describe('rendering', async () => {
      it('renders', () => {
        return getDelightPlayer({
          'data-content-id': '-LLoCCZqWi18O73b6M0w',
        }).then(async (player) => {
          const impl = await player.getImpl(false);
          const iframe = player.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src).to.equal(
            `${impl.baseURL_}/player/-LLoCCZqWi18O73b6M0w?amp=1`
          );
          expect(iframe.allow).to.equal('vr');
          expect(iframe.className).to.match(/i-amphtml-fill-content/);
        });
      });

      it('fails if no content is specified', () => {
        return allowConsoleError(() => {
          return getDelightPlayer({
            'data-content-id': '',
          }).should.eventually.be.rejectedWith(
            /The data-content-id attribute is required/
          );
        });
      });

      it('removes iframe after unlayoutCallback', async () => {
        const player = await getDelightPlayer({
          'data-content-id': '-LLoCCZqWi18O73b6M0w',
        });
        const impl = await player.getImpl(false);
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        impl.unlayoutCallback();
        expect(player.querySelector('iframe')).to.be.null;
        expect(impl.iframe_).to.be.null;
      });

      it('should forward events', () => {
        return getDelightPlayer({
          'data-content-id': '-LLoCCZqWi18O73b6M0w',
        }).then((player) => {
          return Promise.resolve()
            .then(async () => {
              const p = listenOncePromise(player, VideoEvents.LOAD);
              await fakePostMessage(player, {
                type: 'x-dl8-to-parent-ready',
                payload: {},
              });
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(player, VideoEvents.PLAYING);
              await fakePostMessage(player, {
                type: 'x-dl8-to-parent-playing',
                payload: {},
              });
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(player, VideoEvents.PAUSE);
              await fakePostMessage(player, {
                type: 'x-dl8-to-parent-paused',
                payload: {},
              });
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(player, VideoEvents.MUTED);
              await fakePostMessage(player, {
                type: 'x-dl8-to-parent-muted',
                payload: {},
              });
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(player, VideoEvents.UNMUTED);
              await fakePostMessage(player, {
                type: 'x-dl8-to-parent-unmuted',
                payload: {},
              });
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(player, VideoEvents.ENDED);
              await fakePostMessage(player, {
                type: 'x-dl8-to-parent-ended',
                payload: {},
              });
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(player, VideoEvents.AD_START);
              await fakePostMessage(player, {
                type: 'x-dl8-to-parent-amp-ad-start',
                payload: {},
              });
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(player, VideoEvents.AD_END);
              await fakePostMessage(player, {
                type: 'x-dl8-to-parent-amp-ad-end',
                payload: {},
              });
              return p;
            })
            .then(async () => {
              const p = listenOncePromise(player, VideoEvents.CUSTOM_TICK);
              await fakePostMessage(player, {
                type: 'x-dl8-to-parent-amp-custom-tick',
                payload: {
                  type: 'delight-test-event',
                  testVar: 42,
                },
              });
              const {data} = await p;
              expect(data.eventType).to.equal(
                'video-custom-delight-test-event'
              );
              expect(data.vars.testVar).to.equal(42);
              return p;
            });
        });
      });
    });

    describe('methods', async () => {
      let impl;
      beforeEach(async () => {
        const player = await getDelightPlayer({
          'data-content-id': '-LLoCCZqWi18O73b6M0w',
        });
        impl = await player.getImpl(false);
      });

      it('is interactive', () => {
        expect(impl.isInteractive()).to.be.true;
      });

      it('can play', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.play();
        expect(spy).to.be.calledWith('x-dl8-to-iframe-play');
      });

      it('can pause', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.pause();
        expect(spy).to.be.calledWith('x-dl8-to-iframe-pause');
      });

      it('can mute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.mute();
        expect(impl.sendCommand_).calledWith('x-dl8-to-iframe-mute');
      });

      it('can unmute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.unmute();
        expect(impl.sendCommand_).calledWith('x-dl8-to-iframe-unmute');
      });

      it('can enter fullscreen', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.fullscreenEnter();
        expect(impl.sendCommand_).calledWith(
          'x-dl8-to-iframe-enter-fullscreen'
        );
      });

      it('can exit fullscreen', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.fullscreenExit();
        expect(impl.sendCommand_).calledWith('x-dl8-to-iframe-exit-fullscreen');
        expect(impl.isFullscreen()).to.be.false;
      });

      it('toggles controls', () => {
        const spy = env.sandbox.stub(impl, 'sendCommand_');
        impl.showControls();
        expect(spy).calledWith('x-dl8-to-iframe-enable-interface');
        impl.hideControls();
        expect(spy).calledWith('x-dl8-to-iframe-disable-interface');
        impl.showControls();
        expect(spy).calledWith('x-dl8-to-iframe-enable-interface');
      });
    });
  }
);
