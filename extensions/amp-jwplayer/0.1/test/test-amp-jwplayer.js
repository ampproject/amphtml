import '../amp-jwplayer';
import * as fullscreen from '#core/dom/fullscreen';
import {htmlFor} from '#core/dom/static-template';

import * as consent from '../../../../src/consent';
import {parseUrlDeprecated} from '../../../../src/url';
import {VideoEvents_Enum} from '../../../../src/video-interface';

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
        .returns(html` <meta property="og:title" content="title_tag" /> `);

      jwp.setAttribute('width', '320');
      jwp.setAttribute('height', '180');
      jwp.setAttribute('layout', 'responsive');

      doc.body.appendChild(jwp);
      await jwp.buildInternal();
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
          'https://content.jwplatform.com/players/Wferorsv-sDZEo0ea.html?isAMP=true'
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
          'https://content.jwplatform.com/players/482jsTAr-sDZEo0ea.html?isAMP=true'
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
          'https://content.jwplatform.com/players/482jsTAr-sDZEo0ea.html?search=title_tag&isAMP=true'
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
          'https://content.jwplatform.com/players/482jsTAr-sDZEo0ea.html?search=dog&backfill=true&isAMP=true'
        );
      });

      it('should pass data-player-querystring value to the iframe src', async () => {
        const queryString = 'name1=abc&name2=xyz&name3=123';
        const queryStringParams = queryString.split('&');
        const jw = await getjwplayer({
          'data-playlist-id': '482jsTAr',
          'data-player-id': 'sDZEo0ea',
          'data-player-querystring': queryString,
        });
        const iframe = jw.querySelector('iframe');
        const params = parseUrlDeprecated(iframe.src).search.split('&');
        for (let i = 0; i < queryStringParams.length; i++) {
          expect(params).to.contain(queryStringParams[i]);
        }
      });

      it('should pass data-player-param-* attributes to the iframe src', async () => {
        const jw = await getjwplayer({
          'data-playlist-id': '482jsTAr',
          'data-player-id': 'sDZEo0ea',
          'data-player-param-language': 'de',
          'data-player-param-custom-ad-data': 'key:value;key2:value2',
        });
        const iframe = jw.querySelector('iframe');
        const params = parseUrlDeprecated(iframe.src).search.split('&');
        expect(params).to.contain('language=de');
        expect(params).to.contain('customAdData=key%3Avalue%3Bkey2%3Avalue2');
      });
    });

    describe('methods', async () => {
      let impl;
      function mockMessage(event, detail) {
        impl.onMessage_({
          data: {event, detail},
          origin: 'https://ssl.p.jwpcdn.com',
          source: impl.element.querySelector('iframe').contentWindow,
        });
      }
      beforeEach(async () => {
        const jwp = await getjwplayer({
          'data-media-id': 'BZ6tc0gy',
          'data-player-id': 'uoIbMPm3',
        });
        impl = await jwp.getImpl(false);
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

      it('gets duration from playlist item', () => {
        impl.playlistItem_ = {
          duration: 50,
        };

        expect(impl.getDuration()).to.equal(impl.playlistItem_.duration);
      });

      it('gets duration when externally set', () => {
        impl.duration_ = 50;
        impl.playlistItem_ = {
          duration: 0,
        };

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
        expect(spy).to.be.calledWith('play', {reason: undefined});
      });

      it('autoplays', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.play(true);
        expect(spy).to.be.calledWith('play', {reason: 'auto'});
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
      });

      it('can unmute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.unmute();
        expect(impl.sendCommand_).calledWith('setMute', false);
      });

      it('can enter fullscreen', () => {
        const spy = env.sandbox.spy(fullscreen, 'fullscreenEnter');
        const messageSpy = env.sandbox.spy(impl, 'sendCommand_');
        impl.fullscreenEnter();
        if (impl.isSafariOrIos_()) {
          return expect(messageSpy).calledWith('setFullscreen', true);
        }
        expect(spy).calledWith(impl.iframe_);
      });

      it('can exit fullscreen', () => {
        const spy = env.sandbox.spy(fullscreen, 'fullscreenExit');
        const messageSpy = env.sandbox.spy(impl, 'sendCommand_');

        impl.fullscreenExit();
        if (impl.isSafariOrIos_()) {
          return expect(messageSpy).calledWith('setFullscreen', true);
        }
        expect(spy).calledWith(impl.iframe_);
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
          const spy = env.sandbox.spy(impl, 'onReadyOnce_');
          const mockItem = {};
          const detail = {muted: false, playlistItem: mockItem};

          mockMessage('ready', detail);
          expect(spy).calledWith(detail);
        });

        it('calls onSetup if valid setup message recieved', () => {
          const spy = env.sandbox.spy(impl, 'onSetupOnce_');
          mockMessage('setup');
          expect(spy.called).to.be.true;
        });

        it('updates fullscreen on message', () => {
          const enterSpy = env.sandbox.spy(impl, 'fullscreenEnter');
          const exitSpy = env.sandbox.spy(impl, 'fullscreenExit');

          // Stub native fullscreen detection for headless testing
          const isFullscreen = env.sandbox
            .stub(impl, 'isFullscreen')
            .returns(false);

          mockMessage('fullscreen', {fullscreen: true});
          expect(exitSpy.called).to.be.false;
          expect(enterSpy.called).to.be.true;

          isFullscreen.returns(true);

          mockMessage('fullscreen', {fullscreen: false});
          expect(exitSpy.called).to.be.true;
          expect(enterSpy.callCount).to.equal(1);
        });

        it('updates duration from meta', () => {
          mockMessage('meta', {metadataType: 'media', duration: 50});
          expect(impl.duration_).to.equal(50);
        });

        it('updates mute from state', () => {
          const mutedEventSpy = env.sandbox.spy();
          const unmutedEventSpy = env.sandbox.spy();
          impl.element.addEventListener(VideoEvents_Enum.MUTED, mutedEventSpy);
          impl.element.addEventListener(
            VideoEvents_Enum.UNMUTED,
            unmutedEventSpy
          );
          mockMessage('mute', {mute: true});
          expect(mutedEventSpy).to.be.calledOnce;
          mockMessage('mute', {mute: false});
          expect(unmutedEventSpy).to.be.calledOnce;
        });

        it('updates played ranges from state', () => {
          const mockPlayedRanges = {ranges: [[0, 3.187593]]};
          mockMessage('playedRanges', mockPlayedRanges);
          expect(impl.playedRanges_).to.equal(mockPlayedRanges.ranges);
        });

        it('updates playlist item from state', () => {
          const playlistItem = {
            'title': 'test title',
            'mediaid': 'BZ6tc0gy',
            'image': 'http://foo.bar',
            'duration': 52,
            'description': '',
            'file': 'http://foo.bar',
            'meta': {
              'title': 'test title',
              'artist': 'localhost',
              'album': '',
              'artwork': [
                {
                  'sizes': '',
                  'src': 'http://foo.bar',
                  'type': '',
                },
              ],
            },
          };
          mockMessage('playlistItem', playlistItem);
          expect(impl.playlistItem_).to.deep.equal(playlistItem);
        });

        it('updates current time from state', () => {
          const mockTime = {currentTime: 30};
          mockMessage('time', mockTime);
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
        });
      });
    });

    describe('setup', () => {
      it('sends command with skin url', async () => {
        const skinUrl = 'http://foo.bar.css';
        const jwp = await getjwplayer({
          'data-media-id': 'BZ6tc0gy',
          'data-player-id': 'uoIbMPm3',
          'data-config-skin-url': skinUrl,
        });
        const impl = await jwp.getImpl(false);
        const spy = env.sandbox.stub(impl, 'postCommandMessage_');

        impl.onSetup_();
        const config = {skinUrl};
        expect(spy).calledWith('setupConfig', config);
      });

      it('sends command with plugin url', async () => {
        const pluginUrl = 'http://foo.bar.js';

        const jwp = await getjwplayer({
          'data-media-id': 'BZ6tc0gy',
          'data-player-id': 'uoIbMPm3',
          'data-config-plugin-url': pluginUrl,
        });
        const impl = await jwp.getImpl(false);
        const spy = env.sandbox.stub(impl, 'postCommandMessage_');

        impl.onSetup_();
        const config = {pluginUrl};
        expect(spy).calledWith('setupConfig', config);
      });

      it('sends command with json object', async () => {
        const jwp = await getjwplayer({
          'data-media-id': 'BZ6tc0gy',
          'data-player-id': 'uoIbMPm3',
          'data-config-json':
            '{"playbackRateControls":true,"displaytitle":false}',
        });
        const impl = await jwp.getImpl(false);
        const spy = env.sandbox.stub(impl, 'postCommandMessage_');

        impl.onSetup_();
        const config = {
          playbackRateControls: true,
          displaytitle: false,
        };
        expect(spy).calledWith('setupConfig', config);
      });

      it('sends command with json object and skin url', async () => {
        const skinUrl = 'http://foo.bar.css';
        const jwp = await getjwplayer({
          'data-media-id': 'BZ6tc0gy',
          'data-player-id': 'uoIbMPm3',
          'data-config-skin-url': skinUrl,
          'data-config-json':
            '{"playbackRateControls":true,"displaytitle":false}',
        });
        const impl = await jwp.getImpl(false);
        const spy = env.sandbox.stub(impl, 'postCommandMessage_');

        impl.onSetup_();
        const config = {
          playbackRateControls: true,
          displaytitle: false,
          skinUrl,
        };
        expect(spy).calledWith('setupConfig', config);
      });

      it('sends command with json object containing custom params', async () => {
        const jwp = await getjwplayer({
          'data-media-id': 'BZ6tc0gy',
          'data-player-id': 'uoIbMPm3',
          'data-ad-cust-params': '{"key1": "value1","keyTest": "value2"}',
        });
        const impl = await jwp.getImpl(false);
        const spy = env.sandbox.stub(impl, 'postCommandMessage_');

        impl.onSetup_();
        const config = {
          adCustParams: {
            key1: 'value1',
            keyTest: 'value2',
          },
        };
        expect(spy).calledWith('setupConfig', config);
      });

      it('sends command with json object containing ad macros', async () => {
        const jwp = await getjwplayer({
          'data-media-id': 'BZ6tc0gy',
          'data-player-id': 'uoIbMPm3',
          'data-ad-macro-test': 'value1',
          'data-ad-macro-item-param': 'value2',
        });
        const impl = await jwp.getImpl(false);
        const spy = env.sandbox.stub(impl, 'postCommandMessage_');

        impl.onSetup_();
        const config = {
          adMacros: {
            test: 'value1',
            itemParam: 'value2',
          },
        };
        expect(spy).calledWith('setupConfig', config);
      });
    });

    describe('createPlaceholderCallback', () => {
      it('should create a placeholder image', async () => {
        const jw = await getjwplayer({
          'data-media-id': 'Wferorsv',
          'data-player-id': 'sDZEo0ea',
        });
        const img = jw.querySelector('img');
        expect(img).to.not.be.null;
        expect(img.getAttribute('src')).to.equal(
          'https://content.jwplatform.com/thumbs/Wferorsv-720.jpg'
        );
        expect(img).to.have.class('i-amphtml-fill-content');
        expect(img).to.have.attribute('placeholder');
        expect(img.getAttribute('loading')).to.equal('lazy');
        expect(img.getAttribute('referrerpolicy')).to.equal('origin');
        expect(img.getAttribute('alt')).to.equal('Loading video');
      });
      it('should propagate aria-label to placeholder', async () => {
        const jw = await getjwplayer({
          'data-media-id': 'Wferorsv',
          'data-player-id': 'sDZEo0ea',
          'aria-label': 'interesting video',
        });
        const img = jw.querySelector('img');
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
        const img = jw.querySelector('img');
        expect(img).to.be.null;
      });
    });

    it('executes expected lifecycle methods', async () => {
      const jwp = doc.createElement('amp-jwplayer');
      const attributes = {
        'data-media-id': 'BZ6tc0gy',
        'data-player-id': 'uoIbMPm3',
      };

      for (const key in attributes) {
        jwp.setAttribute(key, attributes[key]);
      }
      const html = htmlFor(env.win.document);

      env.sandbox
        .stub(env.ampdoc.getHeadNode(), 'querySelector')
        .withArgs('meta[property="og:title"]')
        .returns(html` <meta property="og:title" content="title_tag" /> `);

      jwp.setAttribute('width', '320');
      jwp.setAttribute('height', '180');
      jwp.setAttribute('layout', 'responsive');

      doc.body.appendChild(jwp);
      const imp = await jwp.getImpl(false);

      await jwp.buildInternal();
      expect(imp['contentid_']).to.equal(attributes['data-media-id']);
      expect(imp['playerid_']).to.equal(attributes['data-player-id']);
      expect(imp['contentSearch_']).to.equal('');
      expect(imp['contentBackfill_']).to.equal('');
      expect(imp['consentState_']).to.equal(null);
      expect(imp['consentString_']).to.equal(null);
      expect(imp['consentMetadata_']).to.equal(null);

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
      }).then((jw) => {
        const iframe = jw.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://content.jwplatform.com/players/zzz-sDZEo0ea.html?isAMP=true'
        );
      });
    });

    it('adds consent data to iframe src', () => {
      env.sandbox.stub(consent, 'getConsentPolicyInfo').resolves('test');
      env.sandbox
        .stub(consent, 'getConsentMetadata')
        .resolves({gdprApplies: true, key: 2});

      return getjwplayer({
        'data-media-id': 'Wferorsv',
        'data-player-id': 'sDZEo0ea',
        'data-block-on-consent': '_till_accepted',
      }).then((jw) => {
        const iframe = jw.querySelector('iframe');

        expect(iframe.src).to.contain('consentValue=test');
        expect(iframe.src).to.contain('consentGdpr=true');
      });
    });
  }
);
