import '../amp-ooyala-player';
import * as fullscreen from '#core/dom/fullscreen';

describes.realWin(
  'amp-ooyala-player',
  {
    amp: {
      extensions: ['amp-ooyala-player'],
    },
  },
  function (env) {
    let win, doc;
    const embedCode = 'Vxc2k0MDE6Y_C7J5podo3UDxlFxGaZrQ';
    const playerId = '6440813504804d76ba35c8c787a4b33c';
    const pCode = '5zb2wxOlZcNCe_HVT3a6cawW298X';

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getOoyalaElement(
      embedCode,
      playerId,
      pCode,
      opt_version,
      opt_config,
      opt_placeholder
    ) {
      const player = doc.createElement('amp-ooyala-player');
      player.setAttribute('layout', 'fixed');
      if (embedCode) {
        player.setAttribute('data-embedcode', embedCode);
      }
      if (playerId) {
        player.setAttribute('data-playerid', playerId);
      }
      if (pCode) {
        player.setAttribute('data-pcode', pCode);
      }

      if (opt_version) {
        player.setAttribute('data-playerversion', opt_version);
      }

      if (opt_config) {
        player.setAttribute('data-config', opt_config);
      }

      if (opt_placeholder) {
        player.setAttribute('data-placeholder', opt_placeholder);
      }

      doc.body.appendChild(player);
      return player.buildInternal().then(() => {
        player.layoutCallback();
        return player;
      });
    }

    describe('rendering', async () => {
      it('renders a V3 player', () => {
        return getOoyalaElement(embedCode, playerId, pCode).then((player) => {
          const playerIframe = player.querySelector('iframe');
          expect(playerIframe).to.not.be.null;
          expect(playerIframe.src).to.contain(embedCode);
          expect(playerIframe.src).to.contain(playerId);
        });
      });

      it('renders a V4 player', () => {
        return getOoyalaElement(embedCode, playerId, pCode, 'V4').then(
          (player) => {
            const playerIframe = player.querySelector('iframe');
            expect(playerIframe).to.not.be.null;
            expect(playerIframe.src).to.contain(embedCode);
            expect(playerIframe.src).to.contain(playerId);
            expect(playerIframe.src).to.contain(pCode);
          }
        );
      });

      it('fails without an embed code', () => {
        return getOoyalaElement(
          null,
          playerId,
          pCode
        ).should.eventually.be.rejectedWith(
          /The data-embedcode attribute is required/
        );
      });

      it('fails without a player ID', () => {
        return getOoyalaElement(
          embedCode,
          null,
          pCode
        ).should.eventually.be.rejectedWith(
          /The data-playerid attribute is required/
        );
      });

      it('fails without a p-code', () => {
        return getOoyalaElement(
          embedCode,
          playerId,
          null
        ).should.eventually.be.rejectedWith(
          /The data-pcode attribute is required/
        );
      });

      it('removes iframe after unlayoutCallback', async () => {
        const player = await getOoyalaElement(embedCode, playerId, pCode);
        const playerIframe = player.querySelector('iframe');
        expect(playerIframe).to.not.be.null;

        const impl = await player.getImpl(false);
        impl.unlayoutCallback();
        expect(player.querySelector('iframe')).to.be.null;
        expect(impl.iframe_).to.be.null;
      });
    });

    describe('methods', async () => {
      let impl;
      beforeEach(async () => {
        const player = await getOoyalaElement(embedCode, playerId, pCode);
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

      it('can pause', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.pause(true);
        expect(spy).to.be.calledWith('pause');
      });

      it('can mute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.mute();
        expect(impl.sendCommand_).calledWith('mute');
      });

      it('can unmute', () => {
        env.sandbox.spy(impl, 'sendCommand_');
        impl.unmute();
        expect(impl.sendCommand_).calledWith('unmute');
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

      it('does not pre-implement MediaSession API', () => {
        expect(impl.preimplementsMediaSessionAPI()).to.be.false;
      });
    });
  }
);
