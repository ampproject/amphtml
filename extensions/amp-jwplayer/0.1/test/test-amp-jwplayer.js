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

import '../amp-jwplayer';
import {htmlFor} from '../../../../src/static-template';

describes.realWin(
  'amp-jwplayer',
  {
    amp: {
      extensions: ['amp-jwplayer'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getjwplayer(attributes) {
      const jwp = doc.createElement('amp-jwplayer');
      for (const key in attributes) {
        jwp.setAttribute(key, attributes[key]);
      }
      const html = htmlFor(env.win.document);

      env.sandbox
      .stub(env.ampdoc.getHeadNode(), 'querySelector')
      .withArgs('meta[property="og:title"]')
      .returns(
        html`
          <meta property="og:title" content="title_tag" />
        `
      );
      
      jwp.setAttribute('width', '320');
      jwp.setAttribute('height', '180');
      jwp.setAttribute('layout', 'responsive');

      doc.body.appendChild(jwp);
      await jwp.build();
      await jwp.layoutCallback();

      return jwp;
    }

    describe('rendering', async () => {
      it('renders', async () => {
        const jw = await getjwplayer({
          'data-media-id': 'Wferorsv',
          'data-player-id': 'sDZEo0ea',
          'crossorigin': '',
        });
        const iframe = jw.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://content.jwplatform.com/players/Wferorsv-sDZEo0ea.html'
        );
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });

      it('renders with a playlist', async () => {
        const jw = await getjwplayer({
          'data-playlist-id': '482jsTAr',
          'data-player-id': 'sDZEo0ea',
        });
        const iframe = jw.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://content.jwplatform.com/players/482jsTAr-sDZEo0ea.html'
        );
      });

      it('renders with a playlist and parses contextual parameter', async () => {
        const jw = await getjwplayer({
          'data-playlist-id': '482jsTAr',
          'data-player-id': 'sDZEo0ea',
          'data-content-search': '__CONTEXTUAL__',
        });
        const iframe = jw.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://content.jwplatform.com/players/482jsTAr-sDZEo0ea.html?search=title_tag'
        );
      });

      it('renders with a playlist and all parameters', async () => {
        const jw = await getjwplayer({
          'data-playlist-id': '482jsTAr',
          'data-player-id': 'sDZEo0ea',
          'data-content-search': 'dog',
          'data-content-backfill': true,
        });
        const iframe = jw.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://content.jwplatform.com/players/482jsTAr-sDZEo0ea.html?search=dog&backfill=true'
        );
      });
    })

    describe('methods', async () => {
      let impl;
      function mockMessage(event, detail) {
        impl.onMessage_({
          data: { event,  detail },
          origin: 'https://ssl.p.jwpcdn.com',
          source: impl.element.querySelector('iframe').contentWindow,
        });
      }
      beforeEach( async () => {
        let jwp = await getjwplayer({
          'data-media-id': 'BZ6tc0gy',
          'data-player-id': 'uoIbMPm3'
        });
        impl = jwp.implementation_;
      })

      it('supports platform', () => {
        expect(impl.supportsPlatform()).to.be.true;
      });
  
      it('is interactive', () => {
        expect(impl.isInteractive()).to.be.true;
      });

      it('does not implement auto-fullscreen', () => {
        expect(impl.preimplementsAutoFullscreen()).to.be.false;
      });

      it('pre-implements MediaSession API', () => {
        expect(impl.preimplementsMediaSessionAPI()).to.be.true;
      });

      it('gets currentTime', () => {
        expect(impl.getCurrentTime()).to.equal(0);
        impl.currentTime_ = 10;
        expect(impl.getCurrentTime()).to.equal(10);
      });
  
      it('gets duration from playlist item', () => {
        impl.playlistItem = { 
          duration: 50
        }
  
        expect(impl.getDuration()).to.equal(impl.playlistItem.duration);
      });
  
      it('gets duration when externally set', () => {
        impl.duration_ = 50
        impl.playlistItem = { 
          duration: 0
        }

        expect(impl.getDuration()).to.equal(impl.duration_);
      });
  
      it('gets played ranges', () => {
        expect(impl.playedRanges_).to.deep.equal(impl.getPlayedRanges());
      });
  
  
      it('seeks', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.seekTo(10);
        expect(spy).to.be.calledWith('seek', 10);
      });
  
      it('plays', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.play();
        expect(spy).to.be.calledWith('play', { reason: 'amp-interaction' });
      });
  
      it('autoplays', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.play(true);
        expect(spy).to.be.calledWith('play', { reason: 'auto' });
      });
  
      it('should pause if the video is playing', () => {
        env.sandbox.spy(impl, 'pause');
        impl.pauseCallback();
        expect(impl.pause.called).to.be.true;
      });
  
      it('can pause', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.play(true);
        expect(spy).to.be.calledWith('play');
      });

      it('can mute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.mute();
        expect(impl.sendCommand_).calledWith('setMute', true);
      })

      it('can unmute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.unmute();
        expect(impl.sendCommand_).calledWith('setMute', false);
      })

      it('can enter fullscreen', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.fullscreenEnter();
        expect(spy).calledWith('setFullscreen', true);
      });

      it('can exit fullscreen', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.fullscreen_ = true;
        impl.fullscreenExit();
        expect(spy).calledWith('setFullscreen', false);
      });

      describe('message handling', () => {
        it('returns early if empty message', () => {
          const spy = env.sandbox.spy(impl, 'onMessage_');
          impl.onMessage_({});
          expect(spy).returned(undefined);
        });

        it('returns early if data isn\'t JSON or object', () => {
          const spy = env.sandbox.spy(impl, 'onMessage_');
          impl.onMessage_({ data: 'Hello World'})
          expect(spy).returned(undefined);
        });

        it('calls onReady if valid ready message recieved', () => {
          const spy = env.sandbox.spy(impl, 'onReadyOnce_');
          const mockItem = {};
          const detail = { muted: false, playlistItem: mockItem };
          
          mockMessage('ready', detail);
          expect(spy).calledWith(detail);
        });

        it('updates fullscreen state', () => {
          mockMessage('fullscreen', { fullscreen: true })
          expect(impl.fullscreen_).to.be.true;
          mockMessage('fullscreen', { fullscreen: false })
          expect(impl.fullscreen_).to.be.false;
        });

        it('updates duration from meta', () => {
          mockMessage('meta', { metadataType: 'media', duration: 50 });
          expect(impl.duration_).to.equal(50);
        });

        it('updates mute from state', () => {
          const spy = env.sandbox.spy(impl, 'onToggleMute_');
          mockMessage('mute', { mute: true });
          expect(spy).calledWith(true);
          mockMessage('mute', { mute: false });
          expect(spy).calledWith(false);
        });

        it('updates played ranges from state', () => {
          const mockPlayedRanges = { ranges: [[0, 3.187593]] };
          mockMessage('playedRanges', mockPlayedRanges)
          expect(impl.playedRanges_).to.equal(mockPlayedRanges.ranges);
        });

        it('updates playlist item from state', () => {
          const playlistItem = {
            "title": "test title",
            "mediaid": "BZ6tc0gy",
            "image": "http://foo.bar",
            "duration": 52,
            "description": "",
            "file": "http://foo.bar",
            "meta": {
              "title": "test title",
              "artist": "localhost",
              "album": "",
              "artwork": [
                {
                  "sizes": "",
                  "src": "http://foo.bar",
                  "type": ""
                }
              ]
            }
          }
          mockMessage('playlistItem', playlistItem)
          expect(impl.playlistItem).to.deep.equal(playlistItem);
        });

        it('updates current time from state', () => {
          const mockTime = { currentTime: 30 };
          mockMessage('time', mockTime)
          expect(impl.currentTime_).to.equal(mockTime.currentTime);
        });

        it('toggles controls', () => {
          const spy = env.sandbox.stub(impl, 'sendCommand_');
          impl.showControls();
          expect(spy).calledWith('setControls', true);
          impl.hideControls();
          expect(spy).calledWith('setControls', false);
          impl.showControls();
          expect(spy).calledWith('setControls', true);
        })
      });
    });

    describe('createPlaceholderCallback', () => {
      it('should create a placeholder image', async () => {
        const jw = await getjwplayer({
          'data-media-id': 'Wferorsv',
          'data-player-id': 'sDZEo0ea',
        });
        const img = jw.querySelector('amp-img');
        expect(img).to.not.be.null;
        expect(img.getAttribute('src')).to.equal(
          'https://content.jwplatform.com/thumbs/Wferorsv-720.jpg'
        );
        expect(img.getAttribute('layout')).to.equal('fill');
        expect(img.hasAttribute('placeholder')).to.be.true;
        expect(img.getAttribute('referrerpolicy')).to.equal('origin');
        expect(img.getAttribute('alt')).to.equal('Loading video');
      });
      it('should propagate aria-label to placeholder', async () => {
        const jw = await getjwplayer({
          'data-media-id': 'Wferorsv',
          'data-player-id': 'sDZEo0ea',
          'aria-label': 'interesting video',
        });
        const img = jw.querySelector('amp-img');
        expect(img).to.not.be.null;
        expect(img.getAttribute('aria-label')).to.equal('interesting video');
        expect(img.getAttribute('alt')).to.equal(
          'Loading video - interesting video'
        );
      });
      it('should not create a placeholder for playlists', async () => {
        const jw = await getjwplayer({
          'data-playlist-id': 'Wferorsv',
          'data-player-id': 'sDZEo0ea',
        });
        const img = jw.querySelector('amp-img');
        expect(img).to.be.null;
      });
    });

    it('executes expected lifecycle methods', async () => {
      const jwp = doc.createElement('amp-jwplayer');
      const attributes = {
        'data-media-id': 'BZ6tc0gy',
        'data-player-id': 'uoIbMPm3'
      };

      for (const key in attributes) {
        jwp.setAttribute(key, attributes[key]);
      }
      const html = htmlFor(env.win.document);

      env.sandbox
      .stub(env.ampdoc.getHeadNode(), 'querySelector')
      .withArgs('meta[property="og:title"]')
      .returns(
        html`
          <meta property="og:title" content="title_tag" />
        `
      );
      
      jwp.setAttribute('width', '320');
      jwp.setAttribute('height', '180');
      jwp.setAttribute('layout', 'responsive');

      doc.body.appendChild(jwp);
      const imp = jwp.implementation_;

      await jwp.build();
      expect(imp['contentid_']).to.equal(attributes['data-media-id']);
      expect(imp['playerid_']).to.equal(attributes['data-player-id']);
      expect(imp['contentSearch_']).to.equal('');
      expect(imp['contentBackfill_']).to.equal('');
      await jwp.layoutCallback();

      
      const placeholder = jwp.querySelector('[placeholder]');
      const unlistenSpy = env.sandbox.spy(imp, 'unlistenFrame_');
      imp.unlayoutCallback();
      expect(unlistenSpy).to.have.been.called;
      expect(jwp.querySelector('iframe')).to.be.null;
      expect(imp.iframe_).to.be.null;
      expect(placeholder).to.not.have.display('');
    });
    
    it('fails if no media is specified', () => {
      return allowConsoleError(() => {
        return getjwplayer({
          'data-player-id': 'sDZEo0ea',
        }).should.eventually.be.rejectedWith(
          /Either the data-media-id or the data-playlist-id attributes must be/
        );
      });
    });

    it('fails if no player is specified', () => {
      return allowConsoleError(() => {
        return getjwplayer({
          'data-media-id': 'Wferorsv',
        }).should.eventually.be.rejectedWith(
          /The data-player-id attribute is required for/
        );
      });
    });

    it('renders with a bad playlist', () => {
      return getjwplayer({
        'data-playlist-id': 'zzz',
        'data-player-id': 'sDZEo0ea',
      }).then(jw => {
        const iframe = jw.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://content.jwplatform.com/players/zzz-sDZEo0ea.html'
        );
      });
    });
  }
);
