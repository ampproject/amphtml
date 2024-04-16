import '../amp-youtube';
import {Services} from '#service';

import {listenOncePromise} from '#utils/event-helper';

import {installResizeObserverStub} from '#testing/resize-observer-stub';

import {VideoEvents_Enum} from '../../../../src/video-interface';

const EXAMPLE_VIDEOID = 'mGENRKrdoGY';
const EXAMPLE_LIVE_CHANNELID = 'UCB8Kb4pxYzsDsHxzBfnid4Q';
const EXAMPLE_VIDEOID_URL = `https://www.youtube.com/embed/${EXAMPLE_VIDEOID}?enablejsapi=1&amp=1&playsinline=1`;
const EXAMPLE_LIVE_CHANNELID_URL = `https://www.youtube.com/embed/live_stream?channel=${EXAMPLE_LIVE_CHANNELID}&enablejsapi=1&amp=1&playsinline=1`;
const EXAMPLE_NO_COOKIE_VIDEOID_URL = `https://www.youtube-nocookie.com/embed/${EXAMPLE_VIDEOID}?enablejsapi=1&amp=1&playsinline=1`;

describes.realWin(
  'amp-youtube',
  {
    amp: {
      extensions: ['amp-youtube'],
    },
  },
  function (env) {
    this.timeout(5000);
    let win, doc;
    let timer;
    let resizeObserverStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      timer = Services.timerFor(win);
      resizeObserverStub = installResizeObserverStub(env.sandbox, win);
    });

    async function getYt(attributes, opt_responsive, opt_beforeLayoutCallback) {
      const yt = doc.createElement('amp-youtube');
      for (const key in attributes) {
        yt.setAttribute(key, attributes[key]);
      }
      yt.setAttribute('width', '111');
      yt.setAttribute('height', '222');
      if (opt_responsive) {
        yt.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(yt);
      await yt.buildInternal();
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(yt);
      }
      await yt.layoutCallback();
      const impl = await yt.getImpl(false);
      const ytIframe = yt.querySelector('iframe');
      impl.handleYoutubeMessage_({
        origin: 'https://www.youtube.com',
        source: ytIframe.contentWindow,
        data: JSON.stringify({event: 'onReady'}),
      });
      return yt;
    }

    describe('with data-videoid', function () {
      runTestsForDatasource(EXAMPLE_VIDEOID);
    });

    describe('with data-live-channelid', function () {
      runTestsForDatasource(EXAMPLE_LIVE_CHANNELID);
    });

    /**
     * This function runs generic tests for components based on
     * data-videoid or data-live-channelid.
     * @param {string} datasource
     */
    function runTestsForDatasource(datasource) {
      it('renders responsively', async () => {
        const yt = await getYt({'data-videoid': datasource}, true);
        const iframe = yt.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });

      it('should pause if the video is playing', async () => {
        const yt = await getYt({'data-videoid': datasource});
        const impl = await yt.getImpl(false);
        env.sandbox.spy(impl, 'pause');
        impl.pauseCallback();
        expect(impl.pause.called).to.be.true;
      });

      it('should pass data-param-* attributes to the iframe src', async () => {
        const yt = await getYt({
          'data-videoid': datasource,
          'autoplay': '1',
          'loop': '',
          'data-param-loop': '1',
          'data-param-my-param': 'hello world',
        });
        const iframe = yt.querySelector('iframe');
        expect(iframe.src).to.contain('myParam=hello%20world');
        // data-param-autoplay is disallowed in favor of just autoplay
        expect(iframe.src).to.not.contain('autoplay=1');
        // data-param-loop is disallowed in favor of just loop for single videos
        expect(iframe.src).to.not.contain('loop=1');
        // playsinline should default to 1 if not provided.
        expect(iframe.src).to.contain('playsinline=1');
      });

      it('should add amp=1 to the iframe src', async () => {
        const yt = await getYt({
          'data-videoid': datasource,
        });
        const iframe = yt.querySelector('iframe');
        expect(iframe.src).to.contain('amp=1');
      });

      it('should change defaults for some data-param-* when autoplaying', async () => {
        const yt = await getYt({
          'autoplay': '',
          'data-videoid': datasource,
          'data-param-playsinline': '0',
        });
        const iframe = yt.querySelector('iframe');
        // playsinline must be set 1 even if specified as 0
        expect(iframe.src).to.contain('playsinline=1');
        // annotation policy should default to 3 if not specified.
        expect(iframe.src).to.contain('iv_load_policy=3');
      });

      it('should keep data-param-loop in the iframe src for playlists', async () => {
        const yt = await getYt({
          'data-videoid': datasource,
          'data-param-playlist': datasource,
          'data-param-loop': '1',
        });
        const iframe = yt.querySelector('iframe');
        expect(iframe.src).to.contain('loop=1');
      });

      it('should pass data-param-loop to the iframe src for playlists when using loop', async () => {
        const yt = await getYt({
          'data-videoid': datasource,
          'data-param-playlist': datasource,
          'loop': '',
        });
        const iframe = yt.querySelector('iframe');
        expect(iframe.src).to.contain('loop=1');
      });

      it('should preload the final url', async () => {
        const yt = await getYt({
          'autoplay': '',
          'data-videoid': datasource,
          'data-param-playsinline': '0',
        });
        const impl = await yt.getImpl(false);
        const {src} = yt.querySelector('iframe');

        const preconnect = Services.preconnectFor(win);
        env.sandbox.spy(preconnect, 'url');
        impl.preconnectCallback();
        expect(preconnect.url).to.have.been.calledWith(
          env.sandbox.match.object, // AmpDoc
          src
        );
      });

      it('should forward certain events from youtube to the amp element', async () => {
        const yt = await getYt({'data-videoid': datasource});
        const iframe = yt.querySelector('iframe');
        await Promise.resolve();
        const p1 = listenOncePromise(yt, VideoEvents_Enum.MUTED);
        await sendFakeInfoDeliveryMessage(yt, iframe, {muted: true});
        await p1;
        const p2 = listenOncePromise(yt, VideoEvents_Enum.PLAYING);
        await sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 1});
        await p2;
        const p3 = listenOncePromise(yt, VideoEvents_Enum.PAUSE);
        await sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 2});
        await p3;
        const p4 = listenOncePromise(yt, VideoEvents_Enum.UNMUTED);
        await sendFakeInfoDeliveryMessage(yt, iframe, {muted: false});
        await p4;
        // Should not send the unmute event twice if already sent once.
        const p5 = listenOncePromise(yt, VideoEvents_Enum.UNMUTED).then(() => {
          assert.fail('Should not have dispatch unmute message twice');
        });
        await sendFakeInfoDeliveryMessage(yt, iframe, {muted: false});
        const successTimeout = timer.promise(10);
        await Promise.race([p5, successTimeout]);
        // Make sure pause and end are triggered when video ends.
        const pEnded = listenOncePromise(yt, VideoEvents_Enum.ENDED);
        const pPause = listenOncePromise(yt, VideoEvents_Enum.PAUSE);
        await sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 0});
        return Promise.all([pEnded, pPause]);
      });
    }

    describe('pause', () => {
      let yt, impl, iframe;
      let pauseCallbackSpy;

      beforeEach(async () => {
        yt = await getYt({'data-videoid': EXAMPLE_VIDEOID});
        impl = await yt.getImpl();
        iframe = yt.querySelector('iframe');
        pauseCallbackSpy = env.sandbox.spy(impl, 'pauseCallback');
      });

      it('should auto-pause when playing and no size', async () => {
        // PLAYING state.
        await sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 1});
        // First send "size" event and then "no size".
        resizeObserverStub.notifySync({
          target: yt,
          borderBoxSize: [{inlineSize: 10, blockSize: 10}],
        });
        resizeObserverStub.notifySync({
          target: yt,
          borderBoxSize: [{inlineSize: 0, blockSize: 0}],
        });
        expect(pauseCallbackSpy).to.be.calledOnce;
      });

      it('should NOT auto-pause when not playing', async () => {
        // PLAYING state.
        await sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 1});
        // PAUSE state.
        await sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 2});
        // First send "size" event and then "no size".
        resizeObserverStub.notifySync({
          target: yt,
          borderBoxSize: [{inlineSize: 10, blockSize: 10}],
        });
        resizeObserverStub.notifySync({
          target: yt,
          borderBoxSize: [{inlineSize: 0, blockSize: 0}],
        });
        expect(pauseCallbackSpy).to.not.be.called;
      });
    });

    it('renders for video ids', async () => {
      const yt = await getYt({'data-videoid': EXAMPLE_VIDEOID});
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(EXAMPLE_VIDEOID_URL);
    });

    it('renders for live channel ids', async () => {
      const yt = await getYt({'data-live-channelid': EXAMPLE_LIVE_CHANNELID});
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(EXAMPLE_LIVE_CHANNELID_URL);
    });

    it('uses privacy-enhanced mode', async () => {
      const yt = await getYt({
        'data-videoid': EXAMPLE_VIDEOID,
        'credentials': 'omit',
      });
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(EXAMPLE_NO_COOKIE_VIDEOID_URL);
    });

    it('requires data-videoid or data-live-channelid', () => {
      return allowConsoleError(() => {
        return getYt({}).should.eventually.be.rejectedWith(
          /Exactly one of data-videoid or data-live-channelid should/
        );
      });
    });

    it('adds an img placeholder in prerender mode if source is videoid', async () => {
      const yt = await getYt(
        {'data-videoid': EXAMPLE_VIDEOID},
        true,
        function (yt) {
          const iframe = yt.querySelector('iframe');
          expect(iframe).to.be.null;
          const imgPlaceholder = yt.querySelector('img[placeholder]');
          expect(imgPlaceholder).to.not.be.null;
          expect(imgPlaceholder.className).to.not.match(/amp-hidden/);
          expect(imgPlaceholder.src).to.be.equal(
            `https://i.ytimg.com/vi/${EXAMPLE_VIDEOID}/sddefault.jpg#404_is_fine`
          );
          expect(imgPlaceholder.getAttribute('referrerpolicy')).to.equal(
            'origin'
          );
          expect(imgPlaceholder.getAttribute('alt')).to.equal('Loading video');
        }
      );
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder.className).to.match(/amp-hidden/);
    });

    it('propagates aria-label to img placeholder', () => {
      return getYt(
        {
          'data-videoid': EXAMPLE_VIDEOID,
          'aria-label': 'kind video',
        },
        true,
        function (yt) {
          const iframe = yt.querySelector('iframe');
          expect(iframe).to.be.null;
          const imgPlaceholder = yt.querySelector('img[placeholder]');
          expect(imgPlaceholder).to.not.be.null;
          expect(imgPlaceholder.getAttribute('aria-label')).to.equal(
            'kind video'
          );
          expect(imgPlaceholder.getAttribute('alt')).to.equal(
            'Loading video - kind video'
          );
        }
      );
    });

    it('loads only default when it exists if source is videoid', async () => {
      const yt = await getYt(
        {'data-videoid': EXAMPLE_VIDEOID},
        true,
        function (yt) {
          const iframe = yt.querySelector('iframe');
          expect(iframe).to.be.null;
          const imgPlaceholder = yt.querySelector('img[placeholder]');
          expect(imgPlaceholder).to.not.be.null;
          expect(imgPlaceholder.className).to.not.match(/amp-hidden/);
          expect(imgPlaceholder.getAttribute('referrerpolicy')).to.equal(
            'origin'
          );
        }
      );
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder.className).to.match(/amp-hidden/);
      expect(imgPlaceholder.getAttribute('referrerpolicy')).to.equal('origin');
      expect(imgPlaceholder.src).to.equal(
        'https://i.ytimg.com/vi/mGENRKrdoGY/sddefault.jpg#404_is_fine'
      );
    });

    it('loads hqdefault thumbnail source when sddefault fails', async () => {
      const yt = await getYt({'data-videoid': 'FAKE'}, true, function (yt) {
        const iframe = yt.querySelector('iframe');
        expect(iframe).to.be.null;
        const imgPlaceholder = yt.querySelector('img[placeholder]');
        expect(imgPlaceholder).to.not.be.null;
        expect(imgPlaceholder.className).to.not.match(/amp-hidden/);
        // Fake out the 404 image response dimensions of YT.
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
      });
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder.className).to.match(/amp-hidden/);
      expect(imgPlaceholder.src).to.equal(
        'https://i.ytimg.com/vi/FAKE/hqdefault.jpg'
      );
    });

    it('should propagate attribute mutations for videoid', async () => {
      const yt = await getYt({'data-videoid': EXAMPLE_VIDEOID});
      const impl = await yt.getImpl(false);
      const spy = env.sandbox.spy(impl, 'sendCommand_');
      yt.setAttribute('data-videoid', 'lBTCB7yLs8Y');
      yt.mutatedAttributesCallback({'data-videoid': 'lBTCB7yLs8Y'});
      expect(spy).to.be.calledWith(
        'loadVideoById',
        env.sandbox.match(['lBTCB7yLs8Y'])
      );
    });

    it('should remove iframe after unlayoutCallback', async () => {
      const yt = await getYt({'data-videoid': EXAMPLE_VIDEOID});
      const obj = await yt.getImpl(false);
      const placeholder = yt.querySelector('[placeholder]');
      const unlistenSpy = env.sandbox.spy(obj, 'unlistenMessage_');
      obj.unlayoutCallback();
      expect(unlistenSpy).to.have.been.called;
      expect(yt.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(placeholder).to.not.have.display('');
    });

    async function sendFakeInfoDeliveryMessage(yt, iframe, info) {
      const impl = await yt.getImpl(false);
      impl.handleYoutubeMessage_({
        origin: 'https://www.youtube.com',
        source: iframe.contentWindow,
        data: JSON.stringify({
          event: 'infoDelivery',
          info,
        }),
      });
    }
  }
);
