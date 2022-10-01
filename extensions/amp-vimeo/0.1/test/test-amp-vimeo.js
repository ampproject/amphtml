import '../amp-vimeo';
import * as VideoUtils from '#core/dom/video';

describes.realWin(
  'amp-vimeo',
  {
    amp: {
      extensions: ['amp-vimeo'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      env.sandbox.stub(VideoUtils, 'isAutoplaySupported').resolves(true);
    });

    async function getVimeo(
      videoId,
      opt_responsive,
      opt_doNotTrack,
      opt_isAutoPlay
    ) {
      const vimeo = doc.createElement('amp-vimeo');
      vimeo.setAttribute('data-videoid', videoId);
      vimeo.setAttribute('width', '111');
      vimeo.setAttribute('height', '222');
      if (opt_responsive) {
        vimeo.setAttribute('layout', 'responsive');
      }
      if (opt_doNotTrack) {
        vimeo.setAttribute('do-not-track', '');
      }
      if (opt_isAutoPlay) {
        vimeo.setAttribute('autoplay', '');
      }
      doc.body.appendChild(vimeo);
      await vimeo.buildInternal();
      await vimeo.layoutCallback();
      return vimeo;
    }

    it('renders', async () => {
      const vimeo = await getVimeo('123');
      const iframe = vimeo.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal('https://player.vimeo.com/video/123');
    });

    it('renders responsively', async () => {
      const vimeo = await getVimeo('234', true);
      const iframe = vimeo.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('requires data-videoid', () => {
      return getVimeo('').should.eventually.be.rejectedWith(
        /The data-videoid attribute is required for/
      );
    });

    it('renders do-not-track src url', async () => {
      const vimeo = await getVimeo('2323', false, true);
      const iframe = vimeo.querySelector('iframe');
      expect(iframe.src).to.equal('https://player.vimeo.com/video/2323?dnt=1');
    });

    it('should append muted=1 if video is autoplay', async () => {
      const vimeo = await getVimeo('0123', true, false, true);
      const iframe = vimeo.querySelector('iframe');
      expect(iframe.src).to.equal(
        'https://player.vimeo.com/video/0123?muted=1'
      );
    });

    it('unlayoutCallback', async () => {
      const vimeo = await getVimeo('0123', true, false, true);
      vimeo.unlayoutCallback();
      expect(vimeo.querySelector('iframe')).to.be.null;
    });
  }
);
