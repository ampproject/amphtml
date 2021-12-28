import '../amp-3q-player';
import {createElementWithAttributes} from '#core/dom';
import * as fullscreen from '#core/dom/fullscreen';

import {Services} from '#service';

import {listenOncePromise} from '#utils/event-helper';

import {installResizeObserverStub} from '#testing/resize-observer-stub';

import {VideoEvents_Enum} from '../../../../src/video-interface';

describes.realWin(
  'amp-3q-player',
  {
    amp: {
      extensions: ['amp-3q-player'],
    },
  },
  function (env) {
    let win;
    let doc;
    let timer;
    let resizeObserverStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      timer = Services.timerFor(win);
      resizeObserverStub = installResizeObserverStub(env.sandbox, win);
    });

    async function get3QElement(playoutId) {
      const player = createElementWithAttributes(doc, 'amp-3q-player', {
        width: 300,
        height: 200,
      });
      if (playoutId) {
        player.setAttribute('data-id', playoutId);
      }
      doc.body.appendChild(player);
      await player.buildInternal();
      player.layoutCallback();
      const iframe = player.querySelector('iframe');
      const impl = await player.getImpl();
      impl.sdnBridge_({
        source: iframe.contentWindow,
        data: JSON.stringify({data: 'ready'}),
      });
      return player;
    }

    describe('pause', () => {
      let player, impl, iframe;
      let postMessageSpy;

      beforeEach(async () => {
        player = await get3QElement('c8dbe7f4-7f7f-11e6-a407-0cc47a188158');
        impl = await player.getImpl();
        iframe = player.querySelector('iframe');
        postMessageSpy = env.sandbox.spy(impl, 'sdnPostMessage_');
      });

      it('should auto-pause when playing and no size', async () => {
        sendFakeMessage(impl, iframe, 'playing');
        resizeObserverStub.notifySync({
          target: player,
          borderBoxSize: [{inlineSize: 10, blockSize: 10}],
        });
        resizeObserverStub.notifySync({
          target: player,
          borderBoxSize: [{inlineSize: 0, blockSize: 0}],
        });
        expect(postMessageSpy).to.be.calledWith('pause');
      });

      it('should NOT auto-pause when not playing', async () => {
        sendFakeMessage(impl, iframe, 'playing');
        sendFakeMessage(impl, iframe, 'paused');
        resizeObserverStub.notifySync({
          target: player,
          borderBoxSize: [{inlineSize: 10, blockSize: 10}],
        });
        resizeObserverStub.notifySync({
          target: player,
          borderBoxSize: [{inlineSize: 0, blockSize: 0}],
        });
        expect(postMessageSpy).to.not.be.calledWith('pause');
      });
    });

    describe('rendering', async () => {
      it('renders', async () => {
        const player = await get3QElement(
          'c8dbe7f4-7f7f-11e6-a407-0cc47a188158'
        );
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.equal(
          'https://playout.3qsdn.com/c8dbe7f4-7f7f-11e6-a407-0cc47a188158?autoplay=false&amp=true'
        );
      });

      it('requires data-id', () => {
        return allowConsoleError(() => {
          return get3QElement('').should.eventually.be.rejectedWith(
            /The data-id attribute is required/
          );
        });
      });

      it('should forward events from amp-3q-player to the amp element', async () => {
        const player = await get3QElement(
          'c8dbe7f4-7f7f-11e6-a407-0cc47a188158'
        );
        const impl = await player.getImpl();
        const iframe = player.querySelector('iframe');
        await Promise.resolve();
        const p1 = listenOncePromise(player, VideoEvents_Enum.MUTED);
        sendFakeMessage(impl, iframe, 'muted');
        await p1;
        const p2 = listenOncePromise(player, VideoEvents_Enum.PLAYING);
        sendFakeMessage(impl, iframe, 'playing');
        await p2;
        const p3 = listenOncePromise(player, VideoEvents_Enum.PAUSE);
        sendFakeMessage(impl, iframe, 'paused');
        await p3;
        const p4 = listenOncePromise(player, VideoEvents_Enum.UNMUTED);
        sendFakeMessage(impl, iframe, 'unmuted');
        const successTimeout = timer.promise(10);
        return Promise.race([p4, successTimeout]);
      });

      it('removes iframe after unlayoutCallback', async () => {
        const player = await get3QElement(
          'c8dbe7f4-7f7f-11e6-a407-0cc47a188158'
        );
        const impl = await player.getImpl(false);
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        impl.unlayoutCallback();
        expect(player.querySelector('iframe')).to.be.null;
        expect(impl.iframe_).to.be.null;
      });
    });

    describe('methods', async () => {
      let impl;
      beforeEach(async () => {
        const player = await get3QElement(
          'c8dbe7f4-7f7f-11e6-a407-0cc47a188158'
        );
        impl = await player.getImpl(false);
      });

      it('can play', () => {
        const spy = env.sandbox.spy(impl, 'sdnPostMessage_');
        impl.play();
        expect(spy).to.be.calledWith('play2');
      });

      it('can pause', () => {
        const spy = env.sandbox.spy(impl, 'sdnPostMessage_');
        impl.pause();
        expect(spy).to.be.calledWith('pause');
      });

      it('can mute', () => {
        const spy = env.sandbox.spy(impl, 'sdnPostMessage_');
        impl.mute();
        expect(spy).to.be.calledWith('mute');
      });

      it('can unmute', () => {
        const spy = env.sandbox.spy(impl, 'sdnPostMessage_');
        impl.unmute();
        expect(spy).to.be.calledWith('unmute');
      });

      it('supports platform', () => {
        expect(impl.supportsPlatform()).to.be.true;
      });

      it('is interactive', () => {
        expect(impl.isInteractive()).to.be.true;
      });

      it('toggles controls', () => {
        const spy = env.sandbox.stub(impl, 'sdnPostMessage_');
        impl.showControls();
        expect(spy).calledWith('showControlbar');
        impl.hideControls();
        expect(spy).calledWith('hideControlbar');
        impl.showControls();
        expect(spy).calledWith('showControlbar');
      });

      it('can enter fullscreen', () => {
        const spy = env.sandbox.spy(fullscreen, 'fullscreenEnter');
        impl.fullscreenEnter();
        expect(spy).calledWith(impl.iframe_);
      });

      it('can exit fullscreen', () => {
        const spy = env.sandbox.spy(fullscreen, 'fullscreenExit');
        impl.fullscreenExit();
        expect(spy).calledWith(impl.iframe_);
        expect(impl.isFullscreen()).to.be.false;
      });
    });

    function sendFakeMessage(impl, iframe, command) {
      impl.sdnBridge_({
        source: iframe.contentWindow,
        data: JSON.stringify({data: command}),
      });
    }
  }
);
