import '../amp-izlesene';

describes.realWin(
  'amp-izlesene',
  {
    amp: {
      extensions: ['amp-izlesene'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getIzlesene(videoId, opt_responsive) {
      const izlesene = doc.createElement('amp-izlesene');
      izlesene.setAttribute('data-videoid', videoId);
      izlesene.setAttribute('width', '111');
      izlesene.setAttribute('height', '222');
      if (opt_responsive) {
        izlesene.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(izlesene);
      return izlesene
        .buildInternal()
        .then(() => {
          return izlesene.layoutCallback();
        })
        .then(() => izlesene);
    }

    it('renders', () => {
      return getIzlesene('7221390').then((izlesene) => {
        const iframe = izlesene.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://www.izlesene.com/embedplayer/7221390/?'
        );
      });
    });

    it('renders responsively', () => {
      return getIzlesene('7221390', true).then((izlesene) => {
        const iframe = izlesene.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-videoid', () => {
      return allowConsoleError(() => {
        return getIzlesene('').should.eventually.be.rejectedWith(
          /The data-videoid attribute is required for/
        );
      });
    });

    it('unlayout and relayout', async () => {
      const izlesene = await getIzlesene('7221390');
      expect(izlesene.querySelector('iframe')).to.exist;

      const unlayoutResult = izlesene.unlayoutCallback();
      expect(unlayoutResult).to.be.true;
      expect(izlesene.querySelector('iframe')).to.not.exist;

      await izlesene.layoutCallback();
      expect(izlesene.querySelector('iframe')).to.exist;
    });
  }
);
