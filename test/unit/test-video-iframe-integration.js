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

import {
  AmpVideoIntegration,
  adopt,
  getVideoJs,
} from '../../src/video-iframe-integration';

const NOOP = () => {};

describes.realWin('video-iframe-integration', {amp: false}, env => {
  let sandbox;

  beforeEach(() => {
    sandbox = env.sandbox;
  });

  function pushToGlobal(global, callback) {
    (global.AmpVideoIframe = global.AmpVideoIframe || []).push(callback);
  }

  const matchAmpVideoIntegration = sinon.match({isAmpVideoIntegration_: true});

  function expectCalledWithAmpVideoIntegration(spy) {
    expect(spy.withArgs(matchAmpVideoIntegration)).to.have.been.calledOnce;
  }

  describe('adopt(win)', () => {
    describe('<script async> support', () => {
      it('should execute callbacks pushed before adoption', () => {
        const global = {};
        const callback = sandbox.spy();
        pushToGlobal(global, callback);
        adopt(global);
        expectCalledWithAmpVideoIntegration(callback);
      });

      it('should execute callbacks pushed after adoption', () => {
        const global = {};
        adopt(global);
        const callback = sandbox.spy();
        pushToGlobal(global, callback);
        expectCalledWithAmpVideoIntegration(callback);
      });
    });
  });

  describe('AmpVideoIntegration', () => {
    describe('#getMetadata', () => {
      it('gets metadata from window name', () => {
        const metadata = {
          canonicalUrl: 'foo.html',
          sourceUrl: 'bar.html',
        };

        const win = {name: JSON.stringify(metadata)};
        const integration = new AmpVideoIntegration(win);

        // Sinon does not support sinon.match on to.equal
        const dummySpy = sandbox.spy();

        dummySpy(integration.getMetadata());

        expect(dummySpy.withArgs(sinon.match(metadata))).to.have.been
          .calledOnce;
      });
    });

    describe('#method', () => {
      it('should execute on message', () => {
        const integration = new AmpVideoIntegration();

        const listenToOnce = sandbox.stub(integration, 'listenToOnce_');

        const validMethods = [
          'pause',
          'play',
          'mute',
          'unmute',
          'fullscreenenter',
          'fullscreenexit',
          'showcontrols',
          'hidecontrols',
        ];

        validMethods.forEach(method => {
          const spy = sandbox.spy();
          integration.method(method, spy);
          integration.onMessage_({event: 'method', method});
          expect(spy).to.have.been.calledOnce;
        });

        expect(listenToOnce.callCount).to.equal(validMethods.length);
      });

      it('should reject invalid methods', () => {
        const integration = new AmpVideoIntegration();

        const listenToOnce = sandbox.stub(integration, 'listenToOnce_');

        const invalidMethods = 'tacos al pastor'.split(' ');

        invalidMethods.forEach(method => {
          const spy = sandbox.spy();
          expect(() => integration.method(method, spy)).to.throw(
            /Invalid method/
          );
        });

        expect(listenToOnce).to.not.have.been.called;
      });
    });

    describe('#postEvent', () => {
      it('should reject invalid events', () => {
        const integration = new AmpVideoIntegration();
        const invalidEvents = 'tacos al pastor'.split(' ');
        for (let i = 0; i < invalidEvents.length; i++) {
          const event = invalidEvents[i];
          expect(() => integration.postEvent(event)).to.throw(/Invalid event/);
        }
      });

      it('should post valid events', () => {
        const integration = new AmpVideoIntegration();

        const postToParent = sandbox.stub(integration, 'postToParent_');

        const validEvents = [
          'canplay',
          'load',
          'playing',
          'pause',
          'ended',
          'muted',
          'unmuted',
        ];

        for (let i = 0; i < validEvents.length; i++) {
          const event = validEvents[i];
          integration.postEvent(event);
          expect(postToParent.withArgs(sinon.match({event}))).to.have.been
            .calledOnce;
        }
      });
    });

    describe('#getIntersection', () => {
      it('should request and receive intersection', () => {
        const integration = new AmpVideoIntegration();
        const postToParent = sandbox.spy(integration, 'postToParent_');

        const callback = sandbox.spy();

        const id = integration.getIntersectionForTesting_(callback);

        expect(postToParent.withArgs(sinon.match({method: 'getIntersection'})))
          .to.have.been.calledOnce;

        const mockedIntersection = {tacos: 'al pastor'};

        integration.onMessage_({id, args: mockedIntersection});

        expect(callback.withArgs(mockedIntersection)).to.have.been.calledOnce;
      });
    });

    describe('#listenTo', () => {
      describe('jwplayer', () => {
        it('registers all events and methods', () => {
          const player = {
            on: sandbox.spy(),
            play: sandbox.spy(),
            pause: sandbox.spy(),
            setMuted: sandbox.spy(),
            setControls: sandbox.spy(),
            setFullscreen: sandbox.spy(),
          };

          const expectedEvents = [
            'error',
            'setupError',
            'adSkipped',
            'adComplete',
            'adError',
            'adStarted',
            'play',
            'ready',
            'pause',
            'volume',
          ];

          const expectedMethods = [
            'play',
            'pause',
            'mute',
            'unmute',
            'showcontrols',
            'hidecontrols',
            'fullscreenenter',
            'fullscreenexit',
          ];

          const integration = new AmpVideoIntegration();
          const listenToOnce = sandbox.stub(integration, 'listenToOnce_');
          const methodSpy = sandbox.spy(integration, 'method');

          integration.listenTo('jwplayer', player);

          expectedEvents.forEach(event => {
            expect(player.on.withArgs(event, sinon.match.any)).to.have.been
              .calledOnce;
          });

          expectedMethods.forEach(method => {
            expect(methodSpy.withArgs(method, sinon.match.any)).to.have.been
              .calledOnce;
          });

          expect(listenToOnce.callCount).to.equal(expectedMethods.length);
        });
      });

      function mockVideoJsPlayer() {
        return {
          ready(fn) {
            fn();
          },
          readyState() {
            return 0;
          },
          on: sandbox.spy(),
        };
      }

      describe('video.js', () => {
        it('registers all methods', () => {
          const expectedMethods = [
            'play',
            'pause',
            'mute',
            'unmute',
            'showcontrols',
            'hidecontrols',
            'fullscreenenter',
            'fullscreenexit',
          ];

          const player = mockVideoJsPlayer();

          const integration = new AmpVideoIntegration();

          const listenToOnce = sandbox.stub(integration, 'listenToOnce_');
          const methodSpy = sandbox.spy(integration, 'method');
          const dummyElement = env.win.document.createElement('video');

          integration.listenTo(
            'videojs',
            dummyElement,
            /* initializer */ () => player
          );

          expectedMethods.forEach(method => {
            expect(methodSpy.withArgs(method, sinon.match.any)).to.have.been
              .calledOnce;
          });

          expect(listenToOnce.callCount).to.equal(expectedMethods.length);
        });

        describe('getVideoJs', () => {
          it('returns window global if no initializer provided', () => {
            const initializer = NOOP;
            const win = {
              videojs: initializer,
            };
            expect(getVideoJs(win).toString()).to.equal(initializer.toString());
          });

          it('returns initializer if provided', () => {
            const win = {};
            const initializer = NOOP;
            expect(getVideoJs(win, initializer).toString()).to.equal(
              initializer.toString()
            );
          });

          it('fails if no initializer provided or Video.JS not present', () => {
            const win = {};
            expect(() => getVideoJs(win)).to.throw;
          });
        });
      });
    });
  });
});
