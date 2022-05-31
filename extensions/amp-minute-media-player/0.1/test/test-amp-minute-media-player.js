import '../amp-minute-media-player';
import * as fullscreen from '#core/dom/fullscreen';

const WIDTH = '16';
const HEIGHT = '9';
const RESPONSIVE = 'responsive';
const CURATED = 'curated';
const SEMANTIC = 'semantic';
const DATA_CONTENT_ID = 'fSkmeWKF';
const DATA_MINIMUM_DATE_FACTOR = '10';
const DATA_SCANNED_ELEMENT_TYPE = 'id';
const DATA_SCOPED_KEYWORDS = 'football';

describes.realWin(
  'amp-minute-media-player',
  {
    amp: {
      extensions: ['amp-minute-media-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getMinuteMediaPlayer(attributes) {
      const player = doc.createElement('amp-minute-media-player');
      for (const key in attributes) {
        player.setAttribute(key, attributes[key]);
      }

      player.setAttribute('width', WIDTH);
      player.setAttribute('height', HEIGHT);
      player.setAttribute('layout', RESPONSIVE);

      doc.body.appendChild(player);
      return player
        .buildInternal()
        .then(() => {
          player.layoutCallback();
        })
        .then(() => player);
    }

    describe('rendering', async () => {
      it('renders with curated content', async () => {
        const player = await getMinuteMediaPlayer({
          'data-content-type': CURATED,
          'data-content-id': DATA_CONTENT_ID,
        });
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.contain(CURATED);
        expect(iframe.src).to.contain(DATA_CONTENT_ID);
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });

      it('renders with semantic (empty params)', async () => {
        const player = await getMinuteMediaPlayer({
          'data-content-type': SEMANTIC,
          /* no params to semantic */
        });
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.contain(SEMANTIC);
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });

      it('renders with semantic (with params)', async () => {
        const player = await getMinuteMediaPlayer({
          'data-content-type': SEMANTIC,
          'data-minimum-date-factor': DATA_MINIMUM_DATE_FACTOR,
          'data-scanned-element-type': DATA_SCANNED_ELEMENT_TYPE,
          'data-scoped-keywords': DATA_SCOPED_KEYWORDS,
        });
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.contain(SEMANTIC);
        expect(iframe.src).to.contain(DATA_MINIMUM_DATE_FACTOR);
        expect(iframe.src).to.contain(DATA_SCANNED_ELEMENT_TYPE);
        expect(iframe.src).to.contain(DATA_SCOPED_KEYWORDS);
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });

      it('removes iframe after unlayoutCallback', async () => {
        const player = await getMinuteMediaPlayer({
          'data-content-type': SEMANTIC,
          'data-minimum-date-factor': DATA_MINIMUM_DATE_FACTOR,
          'data-scanned-element-type': DATA_SCANNED_ELEMENT_TYPE,
          'data-scoped-keywords': DATA_SCOPED_KEYWORDS,
        });
        const iframe = player.querySelector('iframe');
        expect(iframe).to.not.be.null;

        const impl = await player.getImpl(false);
        impl.unlayoutCallback();
        expect(player.querySelector('iframe')).to.be.null;
        expect(impl.iframe_).to.be.null;
      });
    });

    describe('methods', async () => {
      let impl;
      beforeEach(async () => {
        const player = await getMinuteMediaPlayer({
          'data-content-type': SEMANTIC,
          'data-minimum-date-factor': DATA_MINIMUM_DATE_FACTOR,
          'data-scanned-element-type': DATA_SCANNED_ELEMENT_TYPE,
          'data-scoped-keywords': DATA_SCOPED_KEYWORDS,
        });
        impl = await player.getImpl(false);
      });

      it('is interactive', () => {
        expect(impl.isInteractive()).to.be.true;
      });

      it('plays', () => {
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
