import '../amp-slikeplayer';

import {listenOncePromise} from '#utils/event-helper';

import {VideoEvents_Enum} from '../../../../src/video-interface';

describes.realWin(
  'amp-slikeplayer',
  {
    amp: {
      extensions: ['amp-slikeplayer'],
    },
  },
  function (env) {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function buildPlayer(attrs = {}, opts = {}) {
      const el = doc.createElement('amp-slikeplayer');
      el.setAttribute('width', '320');
      el.setAttribute('height', '180');
      el.setAttribute('layout', opts.responsive ? 'responsive' : 'fixed');
      el.setAttribute('data-apikey', attrs['data-apikey'] || 'key');
      el.setAttribute('data-videoid', attrs['data-videoid'] || 'vid');
      if (attrs['data-config']) {
        el.setAttribute('data-config', attrs['data-config']);
      }
      if (attrs['data-iframe-src']) {
        el.setAttribute('data-iframe-src', attrs['data-iframe-src']);
      }
      if (attrs['poster']) {
        el.setAttribute('poster', attrs['poster']);
      }
      doc.body.appendChild(el);
      await el.buildInternal();
      await el.layoutCallback();
      const impl = await el.getImpl(false);
      const iframe = el.querySelector('iframe');
      // Simulate ready from player
      const readyMsg = {
        source: iframe.contentWindow,
        data: JSON.stringify({event: 'ready', detail: {}}),
      };
      impl.onMessage_(readyMsg);
      return {el, impl, iframe};
    }

    it('renders an iframe with expected src params', async () => {
      const base = 'https://tvid.in/player/amp.html';
      const {el} = await buildPlayer({
        'data-apikey': 'abc',
        'data-videoid': '123',
      });
      const iframe = el.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const src = iframe.getAttribute('src');
      expect(src).to.contain(base);
      expect(src).to.contain('apikey=abc');
      expect(src).to.contain('videoid=123');
      expect(src).to.contain('baseurl=');
    });

    it('includes data-config in iframe src', async () => {
      const {el} = await buildPlayer({
        'data-apikey': 'k',
        'data-videoid': 'v',
        'data-config': 'autoplay=true&viewport=50',
      });
      const iframe = el.querySelector('iframe');
      const src = iframe.getAttribute('src');
      expect(src).to.contain('autoplay=true');
      expect(src).to.contain('viewport=50');
    });

    it('parses viewport threshold from percent and ratio', async () => {
      const {impl: implPct} = await buildPlayer({
        'data-config': 'viewport=150',
      });
      expect(implPct.viewportVisibleThreshold_).to.equal(1);

      const {impl: implRatio} = await buildPlayer({
        'data-config': 'viewport=0.25',
      });
      expect(implRatio.viewportVisibleThreshold_).to.equal(0.25);
    });

    it('creates a placeholder when poster is provided', async () => {
      const {impl} = await buildPlayer({
        poster: 'https://example.com/poster.png',
      });
      const placeholder = impl.createPlaceholderCallback();
      expect(placeholder).to.not.be.null;
      expect(placeholder.tagName).to.equal('AMP-IMG');
      expect(placeholder.getAttribute('placeholder')).to.equal('');
      expect(placeholder.getAttribute('src')).to.contain('poster.png');
    });

    it('seekTo posts a message with the time', async () => {
      const {impl} = await buildPlayer();
      const postSpy = env.sandbox.spy(impl, 'postMessage_');
      impl.seekTo(42);
      await Promise.resolve();
      const [method, param] = postSpy.getCalls().pop().args;
      expect(method).to.equal('seekTo');
      expect(param).to.equal(42);
    });

    it('supportsPlatform and isInteractive are true', async () => {
      const {impl} = await buildPlayer();
      expect(impl.supportsPlatform()).to.be.true;
      expect(impl.isInteractive()).to.be.true;
    });

    it('posts play/pause/mute/unmute after ready', async () => {
      const {impl} = await buildPlayer();
      const postSpy = env.sandbox.spy(impl, 'postMessage_');
      impl.play();
      impl.pause();
      impl.mute();
      impl.unmute();
      await Promise.resolve();
      const calls = postSpy.getCalls().map((c) => c.args);
      const methods = calls.map((a) => a[0]);
      expect(methods).to.include('play');
      expect(methods).to.include('pause');
      expect(methods).to.include('mute');
      expect(methods).to.include('unmute');
    });

    it('updates currentTime on time/adTime events', async () => {
      const {iframe, impl} = await buildPlayer();
      impl.onMessage_({
        source: iframe.contentWindow,
        data: JSON.stringify({event: 'time', detail: {currentTime: 12}}),
      });
      expect(impl.getCurrentTime()).to.equal(12);
      impl.onMessage_({
        source: iframe.contentWindow,
        data: JSON.stringify({event: 'adTime', detail: {position: 3}}),
      });
      expect(impl.getCurrentTime()).to.equal(3);
    });

    it('redispatches mapped events', async () => {
      const {el, iframe, impl} = await buildPlayer();
      const p = listenOncePromise(el, VideoEvents_Enum.PLAYING);
      impl.onMessage_({
        source: iframe.contentWindow,
        data: JSON.stringify({event: 'play', detail: {}}),
      });
      await p; // resolves if event fires
    });

    it('redispatches pause and complete, and visible', async () => {
      const {el, iframe, impl} = await buildPlayer();
      const p1 = listenOncePromise(el, VideoEvents_Enum.PAUSE);
      impl.onMessage_({
        source: iframe.contentWindow,
        data: JSON.stringify({event: 'pause', detail: {}}),
      });
      await p1;

      const p2 = listenOncePromise(el, VideoEvents_Enum.ENDED);
      impl.onMessage_({
        source: iframe.contentWindow,
        data: JSON.stringify({event: 'complete', detail: {}}),
      });
      await p2;

      const p3 = listenOncePromise(el, VideoEvents_Enum.VISIBILITY);
      impl.onMessage_({
        source: iframe.contentWindow,
        data: JSON.stringify({event: 'visible', detail: {}}),
      });
      await p3;
    });

    it('ignores non-JSON and wrong source messages', async () => {
      const {impl} = await buildPlayer();
      const initial = impl.getCurrentTime();
      // Wrong source
      impl.onMessage_({
        source: {},
        data: JSON.stringify({event: 'time', detail: {currentTime: 99}}),
      });
      expect(impl.getCurrentTime()).to.equal(initial);
      // Non-JSON
      impl.onMessage_({source: null, data: 'not-json'});
      expect(impl.getCurrentTime()).to.equal(initial);
    });

    it('handles viewport play/pause via viewportCallback', async () => {
      const {impl} = await buildPlayer({
        'data-config': 'viewport=0.5',
      });
      const postSpy = env.sandbox.spy(impl, 'postMessage_');
      impl.viewportCallback(true);
      await Promise.resolve();
      const [m, p] = postSpy.getCalls().pop().args;
      expect(m).to.equal('handleViewport');
      expect(p).to.equal(true);
    });

    it('cleans up on unlayoutCallback', async () => {
      const {el, impl} = await buildPlayer();
      const removed = impl.unlayoutCallback();
      expect(removed).to.be.true;
      // Subsequent layout should be possible
      await el.layoutCallback();
    });
  }
);
